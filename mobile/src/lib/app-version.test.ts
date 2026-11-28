import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIdFromHtml, buildIdFromScripts, isNewBuild } from "./app-version";

const html = (hash: string) =>
  `<!DOCTYPE html><html><head></head><body><div id="root"></div>` +
  `<script src="/_expo/static/js/web/entry-${hash}.js" defer></script></body></html>`;

test("the build id is the hashed bundle the page loads", () => {
  assert.equal(buildIdFromHtml(html("abc123")), "/_expo/static/js/web/entry-abc123.js");
  assert.equal(
    buildIdFromScripts(["https://planfin.app.br/_expo/static/js/web/entry-abc123.js"]),
    "/_expo/static/js/web/entry-abc123.js",
  );
});

test("a deploy that changes the bundle is a new version; the same bundle is not", () => {
  const running = buildIdFromHtml(html("abc123"));
  assert.equal(isNewBuild(running, buildIdFromHtml(html("abc123"))), false);
  assert.equal(isNewBuild(running, buildIdFromHtml(html("def456"))), true);
});

test("the dev server or a failed fetch never asks to reload", () => {
  const dev = `<script src="/index.bundle?platform=web&dev=true"></script>`;
  assert.equal(buildIdFromHtml(dev), null);
  assert.equal(isNewBuild(null, buildIdFromHtml(html("abc"))), false);
  assert.equal(isNewBuild(buildIdFromHtml(html("abc")), null), false);
});

test("several bundles are compared as a set, whatever their order", () => {
  const a = `<script src="/_expo/static/js/web/a-1.js"></script><script src="/_expo/static/js/web/b-2.js"></script>`;
  const b = `<script src="/_expo/static/js/web/b-2.js"></script><script src="/_expo/static/js/web/a-1.js"></script>`;
  assert.equal(buildIdFromHtml(a), buildIdFromHtml(b));
});
