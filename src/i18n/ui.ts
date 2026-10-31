export const LOCALES = ['en', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** A string that is either language-neutral or given per locale. */
export type Localized = string | Partial<Record<Locale, string>>;

const en = {
  'meta.description':
    'Bruno D. Ferreira-Saraiva, Assistant Professor at Universidade Lusófona. Natural Language Processing (NLP), conversation analysis and Large Language Models (LLMs).',
  'nav.skip': 'Skip to content',
  'nav.home': 'home',
  'nav.publications': 'publications',
  'nav.work': 'work',
  'nav.teaching': 'teaching',
  'nav.hobbies': 'hobbies',
  'nav.cv': 'CV',
  'nav.main': 'Main',
  'theme.toggle': 'Toggle colour theme',
  'lang.switch': 'Ler em português',
  'lang.short': 'PT',

  'home.title': 'Home',
  'home.whoami': 'whoami',
  'home.interests': 'research interests',
  'home.links': 'Links',
  'home.photoAlt': 'Portrait of {name}',
  'home.index': 'Site index',

  'pubs.title': 'Publications',
  'pubs.description': 'Peer-reviewed papers, software, preprints and project deliverables by Bruno D. Ferreira-Saraiva.',
  'pubs.intro': 'Synced automatically from {source}.',
  'pubs.introScholar': 'For citation metrics see my {scholar} profile.',
  'pubs.filter': 'Filter by type',
  'pubs.all': 'All',
  'pubs.type.journal': 'Journal',
  'pubs.type.conference': 'Conference',
  'pubs.type.software': 'Software',
  'pubs.type.preprint': 'Preprint',
  'pubs.type.chapter': 'Book chapter',
  'pubs.type.book': 'Book',
  'pubs.type.report': 'Report',
  'pubs.type.other': 'Other',
  'pubs.papers': 'Papers',
  'pubs.reports': 'Reports & project deliverables',
  'pubs.abstract': 'Abstract',
  'pubs.citations.one': '{n} citation',
  'pubs.citations.other': '{n} citations',
  'pubs.bibtex': 'BibTeX',
  'pubs.copied': 'Copied!',
  'pubs.copyFailed': 'Copy failed — select the text below',
  'pubs.updated': 'Last updated {date}',
  'pubs.empty': 'No publications match this filter.',
  'pubs.etAl': 'et al.',
  'pubs.link.doi': 'DOI',
  'pubs.link.pdf': 'PDF',
  'pubs.link.preprint': 'Preprint',
  'pubs.link.code': 'Code',
  'pubs.link.slides': 'Slides',
  'pubs.link.data': 'Data',
  'pubs.link.url': 'Link',

  'work.title': 'Work',
  'work.description': 'Research software and research projects by Bruno D. Ferreira-Saraiva.',
  'work.intro': 'Open-source tools I develop and research projects in which I participate.',
  'work.software': 'Research software',
  'work.projects': 'Research projects',
  'work.service': 'Academic service',
  'work.updated': 'updated {date}',
  'work.stars.one': '{n} GitHub star',
  'work.stars.other': '{n} GitHub stars',

  'teaching.title': 'Teaching',
  'teaching.description': 'Courses taught by Bruno D. Ferreira-Saraiva.',
  'teaching.intro': 'Courses I teach or have taught, grouped by degree level. Courses taught in the current academic year are highlighted.',
  'teaching.level.bsc': "Bachelor's degrees",
  'teaching.level.msc': "Master's degrees",
  'teaching.level.postgrad': 'Postgraduate programmes',
  'teaching.current': 'Current',
  'teaching.role': 'Role',
  'teaching.years': 'Years',
  'teaching.present': 'present',
  'teaching.programmes': 'Programmes',
  'teaching.syllabus': 'Syllabus',
  'teaching.soon': 'Available soon',


  '404.title': 'Page not found',
  '404.text': 'The page you are looking for does not exist or has moved.',
  '404.back': 'Back to the home page',

  'hobbies.title': 'Hobbies',
  'hobbies.description': 'Sporting background and current hobbies of Bruno D. Ferreira-Saraiva: football, cycling and padel.',
  'hobbies.back': 'back',
  'hobbies.kicker': 'hobbies',
  'hobbies.heading1': 'Beyond',
  'hobbies.heading2': 'academia',
  'hobbies.football': 'Football',
  'hobbies.cycling': 'Cycling',
  'hobbies.padel': 'Padel',
  'hobbies.career': 'Full career on zerozero',
  'hobbies.games.one': '{n} official match',
  'hobbies.games.other': '{n} official matches',
  'hobbies.cupGames': 'including {n} in the Taça de Portugal',
  'hobbies.since': 'Since {year}',
  'hobbies.leagueClubs': 'Liga de Clubes',
  'hobbies.currentClub': 'current club',
  'hobbies.senior': 'Senior career',
  'hobbies.youth': 'Youth',
  'hobbies.stat.ytdKm': 'km in {year}',
  'hobbies.stat.ytdElev': 'm climbed in {year}',
  'hobbies.stat.ytdRides.one': 'ride in {year}',
  'hobbies.stat.ytdRides.other': 'rides in {year}',
  'hobbies.stat.allKm': 'km all-time',
  'hobbies.stat.longest': 'km longest ride',
  'hobbies.stat.climb': 'm biggest climb',
  'hobbies.strava': 'From Strava · updated {date}',
  'hobbies.top': 'Back to top',
} as const;

export type UiKey = keyof typeof en;

const pt: Record<UiKey, string> = {
  'meta.description':
    'Bruno D. Ferreira-Saraiva, Professor Assistente na Universidade Lusófona. Natural Language Processing (NLP), análise de conversação e Large Language Models (LLMs).',
  'nav.skip': 'Saltar para o conteúdo',
  'nav.home': 'início',
  'nav.publications': 'publicações',
  'nav.work': 'trabalhos',
  'nav.teaching': 'ensino',
  'nav.hobbies': 'hobbies',
  'nav.cv': 'CV',
  'nav.main': 'Principal',
  'theme.toggle': 'Alternar tema de cores',
  'lang.switch': 'Read in English',
  'lang.short': 'EN',

  'home.title': 'Início',
  'home.whoami': 'whoami',
  'home.interests': 'interesses de investigação',
  'home.links': 'Links',
  'home.photoAlt': 'Retrato de {name}',
  'home.index': 'Índice do site',

  'pubs.title': 'Publicações',
  'pubs.description': 'Artigos com revisão por pares, software, preprints e entregáveis de projeto de Bruno D. Ferreira-Saraiva.',
  'pubs.intro': 'Sincronizadas automaticamente a partir do {source}.',
  'pubs.introScholar': 'Para métricas de citações, ver o meu perfil no {scholar}.',
  'pubs.filter': 'Filtrar por tipo',
  'pubs.all': 'Todas',
  'pubs.type.journal': 'Revista',
  'pubs.type.conference': 'Conferência',
  'pubs.type.software': 'Software',
  'pubs.type.preprint': 'Preprint',
  'pubs.type.chapter': 'Capítulo',
  'pubs.type.book': 'Livro',
  'pubs.type.report': 'Relatório',
  'pubs.type.other': 'Outro',
  'pubs.papers': 'Artigos',
  'pubs.reports': 'Relatórios e entregáveis de projeto',
  'pubs.abstract': 'Resumo',
  'pubs.citations.one': '{n} citação',
  'pubs.citations.other': '{n} citações',
  'pubs.bibtex': 'BibTeX',
  'pubs.copied': 'Copiado!',
  'pubs.copyFailed': 'Não foi possível copiar — selecione o texto abaixo',
  'pubs.updated': 'Atualizado a {date}',
  'pubs.empty': 'Nenhuma publicação corresponde a este filtro.',
  'pubs.etAl': 'et al.',
  'pubs.link.doi': 'DOI',
  'pubs.link.pdf': 'PDF',
  'pubs.link.preprint': 'Preprint',
  'pubs.link.code': 'Código',
  'pubs.link.slides': 'Slides',
  'pubs.link.data': 'Dados',
  'pubs.link.url': 'Link',

  'work.title': 'Trabalhos',
  'work.description': 'Software de investigação e projetos de investigação de Bruno D. Ferreira-Saraiva.',
  'work.intro': 'Ferramentas open source que desenvolvo e projetos de investigação em que participo.',
  'work.software': 'Software de investigação',
  'work.projects': 'Projetos de investigação',
  'work.service': 'Serviço académico',
  'work.updated': 'atualizado em {date}',
  'work.stars.one': '{n} estrela no GitHub',
  'work.stars.other': '{n} estrelas no GitHub',

  'teaching.title': 'Ensino',
  'teaching.description': 'Unidades curriculares lecionadas por Bruno D. Ferreira-Saraiva.',
  'teaching.intro': 'Unidades curriculares que leciono ou lecionei, agrupadas por ciclo de estudos. As do ano letivo em curso estão destacadas.',
  'teaching.level.bsc': 'Licenciaturas',
  'teaching.level.msc': 'Mestrados',
  'teaching.level.postgrad': 'Pós-graduações',
  'teaching.current': 'Atual',
  'teaching.role': 'Papel',
  'teaching.years': 'Anos',
  'teaching.present': 'presente',
  'teaching.programmes': 'Cursos',
  'teaching.syllabus': 'Conteúdos programáticos',
  'teaching.soon': 'Disponível em breve',


  '404.title': 'Página não encontrada',
  '404.text': 'A página que procura não existe ou mudou de sítio.',
  '404.back': 'Voltar à página inicial',

  'hobbies.title': 'Hobbies',
  'hobbies.description': 'Percurso desportivo e hobbies atuais de Bruno D. Ferreira-Saraiva: futebol, ciclismo e padel.',
  'hobbies.back': 'voltar',
  'hobbies.kicker': 'hobbies',
  'hobbies.heading1': 'Além da',
  'hobbies.heading2': 'academia',
  'hobbies.football': 'Futebol',
  'hobbies.cycling': 'Ciclismo',
  'hobbies.padel': 'Padel',
  'hobbies.career': 'Carreira completa no zerozero',
  'hobbies.games.one': '{n} jogo oficial',
  'hobbies.games.other': '{n} jogos oficiais',
  'hobbies.cupGames': 'dos quais {n} na Taça de Portugal',
  'hobbies.since': 'Desde {year}',
  'hobbies.leagueClubs': 'Liga de Clubes',
  'hobbies.currentClub': 'clube atual',
  'hobbies.senior': 'Carreira sénior',
  'hobbies.youth': 'Formação',
  'hobbies.stat.ytdKm': 'km em {year}',
  'hobbies.stat.ytdElev': 'm de subida em {year}',
  'hobbies.stat.ytdRides.one': 'volta em {year}',
  'hobbies.stat.ytdRides.other': 'voltas em {year}',
  'hobbies.stat.allKm': 'km no total',
  'hobbies.stat.longest': 'km na volta mais longa',
  'hobbies.stat.climb': 'm na maior subida',
  'hobbies.strava': 'Dados do Strava · atualizado a {date}',
  'hobbies.top': 'Voltar ao topo',
};

const ui: Record<Locale, Record<UiKey, string>> = { en, pt };

/** Translate a UI key, interpolating `{name}` placeholders. */
export function t(locale: Locale, key: UiKey, vars: Record<string, string | number> = {}): string {
  // Keys can come from data at runtime (e.g. `pubs.type.${type}`): fall back to the key itself.
  const template: string = ui[locale][key] ?? ui[DEFAULT_LOCALE][key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

/**
 * Splits a translation around its `{placeholders}` so links can be rendered between the parts
 * without set:html: 'Built with {astro}.' -> ['Built with ', '{astro}', '.'].
 */
export function splitTemplate(locale: Locale, key: UiKey): string[] {
  return t(locale, key).split(/(\{\w+\})/).filter((part) => part !== '');
}

/** Pick the value for `locale`, falling back to the other language when a translation is missing. */
export function localized(value: Localized | undefined | null, locale: Locale): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[locale] ?? value[DEFAULT_LOCALE] ?? Object.values(value)[0] ?? '';
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'pt' : 'en';
}

/** '/work/' + 'pt' → '/pt/work/'. Paths always end with a slash (trailingSlash: 'always'). */
export function localizePath(path: string, locale: Locale): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  const base = trimmed ? `/${trimmed}/` : '/';
  return locale === DEFAULT_LOCALE ? base : `/${locale}${base}`;
}

/** '/pt/work/' → '/work/'. */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/pt(\/.*)?$/);
  return match ? match[1] || '/' : pathname;
}

export function localeFromParam(param: string | undefined): Locale {
  return param === 'pt' ? 'pt' : 'en';
}

/** Static paths for pages under `src/pages/[...lang]/`: the root (English) and `/pt/`. */
export function langStaticPaths() {
  return [{ params: { lang: undefined } }, { params: { lang: 'pt' } }];
}

export function htmlLang(locale: Locale): string {
  return locale === 'pt' ? 'pt-PT' : 'en';
}

export function formatDate(iso: string | null | undefined, locale: Locale, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' }): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(htmlLang(locale), opts).format(date);
}
