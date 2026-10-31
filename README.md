# bdfsaraiva.github.io

Personal academic website of Bruno D. Ferreira-Saraiva — built with [Astro](https://astro.build), deployed to GitHub Pages.

## Pages

| Route (EN / PT) | Content source |
|---|---|
| `/` · `/pt/` | `src/data/profile.yaml` |
| `/publications/` | **automatic** — OpenAlex → `src/data/generated/publications.json`; corrections in `src/data/publications.yaml` |
| `/work/` | `src/data/projects.yaml` (+ GitHub stats, automatic) |
| `/teaching/` | `src/data/courses.yaml` |
| `/hobbies/` | `src/data/hobbies.yaml` (+ Strava stats, automatic) |

Text fields accept a plain string or `{ en: …, pt: … }`; a missing translation falls back to the other language.
UI strings live in `src/i18n/ui.ts`.

## Everyday edits

- **New course** — add an entry to `src/data/courses.yaml` (`current: true` highlights it).
- **New tool or project** — add it to `src/data/projects.yaml`; with `repo: owner/name` the stars and last update are pulled from GitHub.
- **Publications** — nothing to do: they refresh every Monday. To fix one, edit `src/data/publications.yaml`
  (`merge`, `hide`, `typeOverride`, `patch` for title/venue/note/award, `extraLinks`, `add`).
  Run `npm run fetch:pubs` to see every work id.
- **Academic service** (committees, reviewing, volunteering) — add it under `service:` in `src/data/projects.yaml`.
- **CV** — drop the PDF at `public/cv.pdf`; the header button appears automatically.
- **Photos** — `public/images/profile.jpg` (square), `public/images/hobbies/cycling.jpg`, `public/images/hobbies/padel.jpg`.

## Commands

```bash
npm install          # once
npm run dev          # local preview at http://localhost:4321
npm run fetch        # refresh publications, GitHub and Strava data
npm run check        # type-check
npm run build        # production build in dist/
```

## Automation

`.github/workflows/deploy.yml` builds and deploys on every push to `main`. Every Monday at 06:00 UTC
(and when run by hand from the Actions tab) it first refreshes the data and commits any change to
`src/data/generated/`. When an API is down the cached JSON is used, so the site always builds.

One-time setup: in the repository **Settings → Pages**, set **Source** to **GitHub Actions**.

GitHub pauses scheduled workflows after 60 days without repository activity; if you get that e-mail,
re-enable the workflow from the Actions tab (or push any change).

Optional: set the repository variable `OPENALEX_MAILTO` (your e-mail) to use OpenAlex's faster "polite pool".

### Strava (optional)

1. Create an API application at <https://www.strava.com/settings/api> (callback domain: `localhost`).
2. Authorise it once with scope `read,activity:read` and exchange the code for a refresh token
   (see Strava's [getting started guide](https://developers.strava.com/docs/getting-started/)).
3. Add the secrets to the repository:

   ```bash
   gh secret set STRAVA_CLIENT_ID
   gh secret set STRAVA_CLIENT_SECRET
   gh secret set STRAVA_REFRESH_TOKEN
   ```

Only aggregate ride totals are stored — no routes or locations.
