// Reads the repositories listed in src/data/projects.yaml and stores their GitHub stats
// (stars, language, last push) in src/data/generated/github.json.
import { ensureGenerated, fetchJson, log, readGenerated, readYaml, runMain, saveIfChanged, warn } from './lib/cache.mjs';

const SCOPE = 'github';
const FILE = 'github.json';

async function main() {
  await ensureGenerated(FILE, { updatedAt: null, repos: {} });
  const projects = await readYaml('src/data/projects.yaml');
  const previous = await readGenerated(FILE, { repos: {} });
  const repos = [...new Set((projects?.software ?? []).map((item) => item.repo).filter(Boolean))];

  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const stats = {};
  for (const repo of repos) {
    try {
      const data = await fetchJson(`https://api.github.com/repos/${repo}`, { headers });
      stats[repo] = {
        stars: data.stargazers_count,
        language: data.language,
        pushedAt: data.pushed_at,
        url: data.html_url,
      };
    } catch (error) {
      warn(SCOPE, `${repo} unavailable (${error.message}); keeping cached stats`);
      if (previous.repos?.[repo]) stats[repo] = previous.repos[repo];
    }
  }

  await saveIfChanged(SCOPE, FILE, { repos: stats });
  log(SCOPE, `${Object.keys(stats).length}/${repos.length} repositories`);
}

runMain(SCOPE, main);
