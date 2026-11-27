/**
 * After a deploy, a tab opened before it still runs the old entry bundle, which asks for chunk
 * files (hashed names) that no longer exist on the server: "Failed to fetch dynamically imported
 * module" / 404 on /assets/*.js. Reloading once picks up the new index.html and chunk names.
 *
 * Guarded by a timestamp in sessionStorage so a chunk that is genuinely broken (or the user being
 * offline) cannot cause a reload loop: at most one automatic reload per minute.
 */
const KEY = 'l4va:stale-chunk-reload-at';
const MIN_INTERVAL_MS = 60000;

const CHUNK_ERROR_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'error loading dynamically imported module',
  'Unable to preload CSS',
];

export const isStaleChunkError = error => {
  const message = String(error?.message ?? error ?? '');
  return CHUNK_ERROR_PATTERNS.some(pattern => message.includes(pattern));
};

/** Reloads the page once for a stale-chunk error. Returns true when a reload was started. */
export const reloadOnStaleChunk = error => {
  if (!isStaleChunkError(error)) return false;
  try {
    const last = Number(sessionStorage.getItem(KEY)) || 0;
    if (Date.now() - last < MIN_INTERVAL_MS) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked: still reload once, the browser cache-busts index.html on navigation.
  }
  window.location.reload();
  return true;
};

/** Vite fires this when a dynamic import's preload fails; covers lazy routes and components. */
export const installStaleChunkReload = () => {
  window.addEventListener('vite:preloadError', event => {
    if (reloadOnStaleChunk(event.payload)) event.preventDefault();
  });
};
