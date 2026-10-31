// Shared helpers for the data-fetching scripts.
// Every script keeps the last good JSON in src/data/generated/ so the site always builds,
// even when an external API is down or credentials are missing.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const GENERATED_DIR = join(ROOT, 'src', 'data', 'generated');

const inActions = Boolean(process.env.GITHUB_ACTIONS);

export function log(scope, message) {
  console.log(`[${scope}] ${message}`);
}

// Workflow-command data must have %, CR and LF escaped or the annotation is cut short.
const escapeCommand = (text) => String(text).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');

/** Prints a warning; in GitHub Actions it also shows up as a yellow annotation on the run. */
export function warn(scope, message) {
  console.warn(inActions ? `::warning title=${scope}::${escapeCommand(message)}` : `[${scope}] WARNING: ${message}`);
}

/** Like warn(), but shown in red: for problems that need a human (e.g. expired credentials). */
export function error(scope, message) {
  console.error(inActions ? `::error title=${scope}::${escapeCommand(message)}` : `[${scope}] ERROR: ${message}`);
}

/** Hides a secret obtained at runtime (e.g. an OAuth token) from all later GitHub Actions logs. */
export function mask(value) {
  if (inActions && value) console.log(`::add-mask::${value}`);
}

/**
 * Runs a script's main() so that nothing — bad YAML, an unexpected API payload — can exit non-zero:
 * the cached JSON stays in place and the site still builds and deploys.
 */
export function runMain(scope, main) {
  main().catch((failure) => warn(scope, `unexpected failure (${failure?.message ?? failure}); keeping cached data`));
}

export async function readYaml(relativePath) {
  return parse(await readFile(join(ROOT, relativePath), 'utf8'));
}

export async function readGenerated(name, fallback) {
  try {
    return JSON.parse(await readFile(join(GENERATED_DIR, name), 'utf8'));
  } catch {
    return fallback;
  }
}

/** Creates generated/<name> with `empty` if it does not exist yet, so imports never break. */
export async function ensureGenerated(name, empty) {
  const current = await readGenerated(name, undefined);
  if (current === undefined) await writeGenerated(name, empty);
}

async function writeGenerated(name, data) {
  await mkdir(GENERATED_DIR, { recursive: true });
  await writeFile(join(GENERATED_DIR, name), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

/**
 * Writes generated/<name> only when the payload differs from what is stored (ignoring `updatedAt`),
 * so scheduled runs do not create empty commits. Returns true when the file was rewritten.
 */
export async function saveIfChanged(scope, name, payload) {
  const strip = ({ updatedAt: _ignored, ...rest } = {}) => rest;
  const previous = await readGenerated(name, null);
  if (previous && JSON.stringify(strip(previous)) === JSON.stringify(strip(payload))) {
    log(scope, `${name} unchanged`);
    return false;
  }
  await writeGenerated(name, { updatedAt: new Date().toISOString(), ...strip(payload) });
  log(scope, `${name} updated`);
  return true;
}

async function request(url, init, { retries = 2, timeoutMs = 20_000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status} ${response.statusText} for ${new URL(url).origin}${new URL(url).pathname}`);
      if (response.status < 500 && response.status !== 429) break;
    } catch (error) {
      lastError = error;
    }
    if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
  }
  throw lastError;
}

export async function fetchJson(url, init = {}, options) {
  return (await request(url, init, options)).json();
}

export async function fetchText(url, init = {}, options) {
  return (await request(url, init, options)).text();
}
