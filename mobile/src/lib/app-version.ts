/**
 * Which build of the web app is running. `expo export` names the bundles after their
 * content hash (`/_expo/static/js/web/entry-<hash>.js`), so the list of bundle paths
 * in index.html changes on every deploy that changes the code: comparing the list
 * loaded with the one the server returns now tells a new version apart.
 */

const BUNDLE_PATH = /\/_expo\/static\/js\/web\/[^"'\s?#]+\.js/g;

/** The build id inside an index.html: its bundle paths, sorted. Null when there is none (dev server). */
export function buildIdFromHtml(html: string): string | null {
  const paths = html.match(BUNDLE_PATH);
  return paths && paths.length > 0 ? Array.from(new Set(paths)).sort().join("|") : null;
}

/** The build id of the page running now, from its script tags. */
export function buildIdFromScripts(srcs: Iterable<string>): string | null {
  return buildIdFromHtml(Array.from(srcs).join("\n"));
}

/** True only when both ids are known and differ (a failed fetch or the dev server never asks to reload). */
export function isNewBuild(running: string | null, deployed: string | null): boolean {
  return running !== null && deployed !== null && running !== deployed;
}
