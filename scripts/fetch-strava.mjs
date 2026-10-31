// Fetches aggregate cycling stats (no routes, no locations) from the Strava API and stores them in
// src/data/generated/strava.json. Needs STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET and STRAVA_REFRESH_TOKEN;
// without them the cached stats are kept as they are.
import { ensureGenerated, error, fetchJson, log, mask, runMain, saveIfChanged } from './lib/cache.mjs';

const SCOPE = 'strava';
const FILE = 'strava.json';

const totals = (t) => ({
  count: t?.count ?? 0,
  distanceKm: Math.round((t?.distance ?? 0) / 1000),
  elevationM: Math.round(t?.elevation_gain ?? 0),
  movingHours: Math.round((t?.moving_time ?? 0) / 3600),
});

async function main() {
  await ensureGenerated(FILE, { updatedAt: null, stats: null });
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env;
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
    log(SCOPE, 'no Strava credentials in the environment; keeping cached stats');
    return;
  }

  try {
    const token = await fetchJson(
      'https://www.strava.com/oauth/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          refresh_token: STRAVA_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      },
      { retries: 1 },
    );
    mask(token.access_token);
    mask(token.refresh_token);
    if (token.refresh_token && token.refresh_token !== STRAVA_REFRESH_TOKEN) {
      error(SCOPE, 'Strava issued a new refresh token. Re-authorise and update the STRAVA_REFRESH_TOKEN secret, or the next runs will fail.');
    }

    const headers = { Authorization: `Bearer ${token.access_token}` };
    const athlete = await fetchJson('https://www.strava.com/api/v3/athlete', { headers });
    const stats = await fetchJson(`https://www.strava.com/api/v3/athletes/${athlete.id}/stats`, { headers });

    await saveIfChanged(SCOPE, FILE, {
      stats: {
        year: new Date().getFullYear(),
        ytd: totals(stats.ytd_ride_totals),
        all: totals(stats.all_ride_totals),
        longestRideKm: Math.round((stats.biggest_ride_distance ?? 0) / 1000),
        biggestClimbM: Math.round(stats.biggest_climb_elevation_gain ?? 0),
      },
    });
  } catch (failure) {
    // Credentials are configured, so a failure here usually means they expired: show it in red.
    error(SCOPE, `Strava request failed (${failure.message}); keeping cached stats. Check the STRAVA_* secrets.`);
  }
}

runMain(SCOPE, main);
