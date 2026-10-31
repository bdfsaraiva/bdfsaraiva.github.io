// Pulls publications from OpenAlex, classifies and de-duplicates them, attaches BibTeX,
// applies the corrections in src/data/publications.yaml and writes src/data/generated/publications.json.
import { ensureGenerated, fetchJson, fetchText, log, readGenerated, readYaml, runMain, saveIfChanged, warn } from './lib/cache.mjs';

const SCOPE = 'publications';
const FILE = 'publications.json';
// Must match PubType in src/lib/types.ts and the `pubs.type.*` keys in src/i18n/ui.ts.
const PUB_TYPES = new Set(['journal', 'conference', 'software', 'preprint', 'chapter', 'book', 'report', 'other']);
const SELECT = [
  'id',
  'doi',
  'display_name',
  'publication_year',
  'publication_date',
  'type',
  'primary_location',
  'best_oa_location',
  'authorships',
  'cited_by_count',
  'abstract_inverted_index',
].join(',');

const PREPRINT_VENUES = /arxiv|ssrn|biorxiv|medrxiv|research square|preprints\.org|techrxiv|osf preprints/i;
const SOFTWARE_VENUES = /softwarex|journal of open source software|\bjoss\b/i;
const CONFERENCE_VENUES =
  /proceedings|conference|symposium|workshop|lecture notes|advances in information and communication technology|communications in computer and information science/i;

const shortId = (url) => (url ? String(url).split('/').pop() : '');
const stripTags = (text) => String(text ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
// Lower-case, accent-free form used to compare titles and names ("Análise" -> "analise").
const fold = (text) => String(text ?? '').toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '');

// Third-party metadata ends up in href attributes: only accept http(s) URLs.
const safeUrl = (url) => {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol) ? url : undefined;
  } catch {
    return undefined;
  }
};
const doiUrl = (doi) => `https://doi.org/${doi.split('/').map(encodeURIComponent).join('/')}`;

// "Zenodo (CERN European Organization for Nuclear Research)" -> "Zenodo", "arXiv (Cornell University)" -> "arXiv".
const cleanVenue = (venue) => venue.replace(/\s*\((?:CERN European Organization for Nuclear Research|Cornell University)\)$/i, '');

// Some repositories store authors as "Surname, Given"; show every name as "Given Surname".
const cleanAuthorName = (name) => {
  const match = name.match(/^([^,]+),\s*([^,]+)$/);
  return match ? `${match[2].trim()} ${match[1].trim()}` : name.trim();
};

function abstractFrom(invertedIndex) {
  if (!invertedIndex) return undefined;
  const words = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const position of positions) words[position] = word;
  }
  const text = stripTags(words.filter(Boolean).join(' ')).replace(/^abstract[:.\s]+/i, '');
  return text.length > 40 ? text : undefined;
}

function classify(work, venue, sourceType) {
  if (work.type === 'preprint' || PREPRINT_VENUES.test(venue)) return 'preprint';
  if (SOFTWARE_VENUES.test(venue)) return 'software';
  if (sourceType === 'repository' || ['report', 'dataset', 'other'].includes(work.type)) return 'report';
  if (sourceType === 'conference' || work.type === 'proceedings-article' || CONFERENCE_VENUES.test(venue)) return 'conference';
  if (work.type === 'book-chapter') return 'chapter';
  if (work.type === 'book') return 'book';
  if (['article', 'review', 'letter'].includes(work.type)) return 'journal';
  return 'other';
}

function normalize(work, config) {
  const myIds = new Set(config.openalexAuthorIds);
  const location = work.primary_location ?? {};
  const venue = cleanVenue(stripTags(location.source?.display_name ?? ''));
  const doi = work.doi ? work.doi.replace(/^https?:\/\/doi\.org\//i, '') : undefined;
  const pdf = safeUrl(work.best_oa_location?.pdf_url);
  const landing = safeUrl(location.landing_page_url);

  const links = {};
  if (doi) links.doi = doiUrl(doi);
  else if (landing) links.url = landing;
  if (pdf) links.pdf = pdf;

  return {
    id: shortId(work.id),
    title: stripTags(work.display_name),
    year: work.publication_year,
    date: work.publication_date ?? undefined,
    type: classify(work, venue, location.source?.type),
    venue: venue || undefined,
    authors: (work.authorships ?? []).map((a) => ({
      name: cleanAuthorName(a.author?.display_name ?? a.raw_author_name ?? ''),
      me: myIds.has(shortId(a.author?.id)) || Boolean(config.orcid && String(a.author?.orcid ?? '').endsWith(config.orcid)),
    })),
    doi,
    links,
    citations: work.cited_by_count ?? 0,
    abstract: abstractFrom(work.abstract_inverted_index),
  };
}

async function fetchWorks(config) {
  const filters = [`author.id:${config.openalexAuthorIds.join('|')}`];
  if (config.orcid) filters.push(`author.orcid:${config.orcid}`);

  const works = new Map();
  for (const filter of filters) {
    const params = new URLSearchParams({ filter, 'per-page': '200', select: SELECT });
    if (process.env.OPENALEX_MAILTO) params.set('mailto', process.env.OPENALEX_MAILTO);
    if (process.env.OPENALEX_API_KEY) params.set('api_key', process.env.OPENALEX_API_KEY);
    const data = await fetchJson(`https://api.openalex.org/works?${params}`);
    for (const work of data.results ?? []) works.set(work.id, work);
  }
  return [...works.values()];
}

// ---------------------------------------------------------------- de-duplication

const titleTokens = (title) =>
  new Set(
    fold(title)
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2),
  );

function titleSimilarity(a, b) {
  const ta = titleTokens(a);
  const tb = titleTokens(b);
  const shared = [...ta].filter((word) => tb.has(word)).length;
  return shared / (ta.size + tb.size - shared || 1);
}

const surname = (name) => fold(name).replace(/[^\p{L}\s-]/gu, '').trim().split(/[\s-]+/).at(-1) ?? '';

function sharesAuthor(a, b) {
  const names = new Set(a.authors.map((x) => surname(x.name)).filter(Boolean));
  return b.authors.some((x) => names.has(surname(x.name)));
}

/** Folds each preprint into its published version (manual `merge` first, then by similar title). */
function mergePreprints(items, manualMerge) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const removed = new Set();

  const absorb = (preprint, published) => {
    published.links.preprint ??= preprint.links.doi ?? preprint.links.url;
    published.abstract ??= preprint.abstract;
    removed.add(preprint.id);
    log(SCOPE, `merged preprint ${preprint.id} into ${published.id}`);
  };

  for (const [fromId, toId] of Object.entries(manualMerge ?? {})) {
    const from = byId.get(fromId);
    const to = byId.get(toId);
    if (from && to) absorb(from, to);
    else warn(SCOPE, `merge ${fromId} -> ${toId}: work not found`);
  }

  for (const preprint of items.filter((item) => item.type === 'preprint' && !removed.has(item.id))) {
    const match = items
      .filter((item) => item.type !== 'preprint' && item.type !== 'report' && !removed.has(item.id))
      .map((item) => ({ item, score: titleSimilarity(preprint.title, item.title) }))
      .filter(({ item, score }) => score >= 0.8 && sharesAuthor(preprint, item))
      .sort((a, b) => b.score - a.score)[0];
    if (match) absorb(preprint, match.item);
  }

  return items.filter((item) => !removed.has(item.id));
}

// ------------------------------------------------------------------------ BibTeX

const BIBTEX_TYPE = { journal: 'article', software: 'article', conference: 'inproceedings', chapter: 'incollection', book: 'book' };

function citeKey(item) {
  const first = item.authors[0]?.name ?? 'anon';
  const word = [...titleTokens(item.title)][0] ?? 'work';
  return `${surname(first).replace(/[^a-z]/g, '')}${item.year}${word.replace(/[^a-z0-9]/g, '')}`;
}

/** Splits `@type{key, a={…}, b={…}}` into fields and reprints it one field per line. */
function formatBibtex(raw, key) {
  const match = raw.trim().match(/^@(\w+)\s*\{\s*([^,]*),([\s\S]*)\}\s*$/);
  if (!match) return undefined;
  const [, type, , body] = match;
  const fields = [];
  let depth = 0;
  let current = '';
  for (const char of body) {
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (char === ',' && depth === 0) {
      if (current.trim()) fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) fields.push(current.trim());
  const lines = fields
    .map((field) => field.replace(/^(\w+)\s*=\s*/, (_, name) => `${name.toLowerCase()} = `))
    // Crossref emits bare months such as `Sept`; BibTeX only knows the three-letter macros.
    .map((field) => field.replace(/^month = ([A-Za-z]{3,})$/, (_, month) => `month = ${month.slice(0, 3).toLowerCase()}`));
  return `@${type.toLowerCase()}{${key},\n  ${lines.join(',\n  ')}\n}`;
}

function generatedBibtex(item, key) {
  const venueField = item.type === 'conference' || item.type === 'chapter' ? 'booktitle' : 'journal';
  const isGreyLiterature = ['report', 'preprint', 'other'].includes(item.type);
  const fields = [
    // Double braces keep the title's capitalisation in BibTeX styles.
    ['title', `{${item.title}}`],
    ['author', item.authors.map((a) => a.name).join(' and ')],
    ['year', String(item.year)],
    item.venue && !isGreyLiterature ? [venueField, item.venue] : null,
    item.venue && isGreyLiterature ? ['howpublished', item.venue] : null,
    item.note ? ['note', typeof item.note === 'string' ? item.note : (item.note.en ?? Object.values(item.note)[0])] : null,
    item.doi ? ['doi', item.doi] : null,
    !item.doi && item.links.url ? ['url', item.links.url] : null,
  ].filter(Boolean);
  const type = BIBTEX_TYPE[item.type] ?? 'misc';
  return `@${type}{${key},\n  ${fields.map(([name, value]) => `${name} = {${value}}`).join(',\n  ')}\n}`;
}

async function attachBibtex(items, previousById, corrected) {
  for (const item of items) {
    const key = citeKey(item);
    // Hand-corrected metadata (type, venue…) makes the registry's BibTeX wrong: build it from the item.
    if (corrected.has(item.id)) {
      item.bibtex = generatedBibtex(item, key);
      continue;
    }
    // BibTeX for a DOI practically never changes: reuse the cached entry and only fetch new ones.
    const cached = previousById.get(item.id);
    if (cached?.bibtex && cached.doi === item.doi) {
      item.bibtex = cached.bibtex;
      continue;
    }
    if (item.doi) {
      try {
        const raw = await fetchText(doiUrl(item.doi), {
          headers: { Accept: 'application/x-bibtex; charset=utf-8' },
          redirect: 'follow',
        });
        item.bibtex = formatBibtex(raw, key);
      } catch (error) {
        warn(SCOPE, `BibTeX for ${item.doi} unavailable (${error.message})`);
      }
    }
    item.bibtex ??= generatedBibtex(item, key);
  }
}

// -------------------------------------------------------------------------- main

const validType = (type, context) => {
  if (PUB_TYPES.has(type)) return type;
  warn(SCOPE, `${context}: unknown type "${type}", using "other"`);
  return 'other';
};

const safeLinks = (links) =>
  Object.fromEntries(Object.entries(links ?? {}).filter(([, url]) => safeUrl(url)));

// Fields a `patch` entry may correct; `note` and `award` are a string or { en, pt }.
const PATCH_FIELDS = ['title', 'venue', 'note', 'award'];

/** Applies hide / typeOverride / patch / extraLinks / add. Returns the items and the ids whose metadata was corrected. */
function applyOverrides(items, config) {
  const hidden = new Set(config.hide ?? []);
  const corrected = new Set();
  const result = items.filter((item) => !hidden.has(item.id));
  for (const item of result) {
    const type = config.typeOverride?.[item.id];
    if (type) {
      item.type = validType(type, `typeOverride ${item.id}`);
      corrected.add(item.id);
    }
    const patch = config.patch?.[item.id];
    if (patch) {
      for (const field of PATCH_FIELDS) if (patch[field] != null) item[field] = patch[field];
      corrected.add(item.id);
    }
    Object.assign(item.links, safeLinks(config.extraLinks?.[item.id]));
  }
  for (const [index, manual] of (config.add ?? []).entries()) {
    if (!manual?.id || !manual.title || !Number.isInteger(manual.year)) {
      warn(SCOPE, `add[${index}] skipped: id, title and a numeric year are required`);
      continue;
    }
    result.push({
      citations: 0,
      authors: [],
      ...manual,
      type: validType(manual.type ?? 'other', `add ${manual.id}`),
      links: safeLinks(manual.links),
    });
  }
  return { items: result, corrected };
}

const byRecency = (a, b) => b.year - a.year || String(b.date ?? '').localeCompare(String(a.date ?? '')) || a.title.localeCompare(b.title);

async function main() {
  await ensureGenerated(FILE, { updatedAt: null, items: [] });
  const config = await readYaml('src/data/publications.yaml');
  const previous = await readGenerated(FILE, { items: [] });
  const previousItems = Array.isArray(previous?.items) ? previous.items : [];
  const previousById = new Map(previousItems.map((item) => [item.id, item]));

  let works;
  try {
    works = await fetchWorks(config);
  } catch (error) {
    warn(SCOPE, `OpenAlex unavailable (${error.message}); keeping the cached publications`);
    return;
  }
  if (works.length === 0) {
    warn(SCOPE, 'OpenAlex returned no works; keeping the cached publications');
    return;
  }

  let items = works.map((work) => normalize(work, config));
  for (const item of items.toSorted(byRecency)) {
    log(SCOPE, `${item.id}  ${item.year}  ${item.type.padEnd(10)}  ${item.title.slice(0, 70)}`);
  }

  items = mergePreprints(items, config.merge);
  const overridden = applyOverrides(items, config);
  items = overridden.items;
  await attachBibtex(items, previousById, overridden.corrected);

  // A sudden large drop usually means an OpenAlex glitch (e.g. a re-clustered author), not deleted papers.
  if (previousItems.length >= 4 && items.length < previousItems.length / 2) {
    warn(SCOPE, `only ${items.length} publications instead of ${previousItems.length}; keeping the cached list (check publications.yaml)`);
    return;
  }

  // Drop undefined fields so the JSON (and git diffs) stay tidy.
  const clean = items.toSorted(byRecency).map((item) => JSON.parse(JSON.stringify(item)));
  await saveIfChanged(SCOPE, FILE, { items: clean });
  log(SCOPE, `${clean.length} publications (${works.length} works from OpenAlex)`);
}

runMain(SCOPE, main);
