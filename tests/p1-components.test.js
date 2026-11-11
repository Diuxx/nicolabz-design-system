const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const componentsCss = fs.readFileSync(path.join(root, "src/styles/components.css"), "utf8");
const decorationsCss = fs.readFileSync(path.join(root, "src/styles/decorations.css"), "utf8");
const demoCss = fs.readFileSync(path.join(root, "demo/demo.css"), "utf8");
const demoHtml = fs.readFileSync(path.join(root, "demo/index.html"), "utf8");
const catalog = require("../tokens/components.json");

const aliases = ["button", "button-primary", "button-secondary", "panel", "panel-muted", "badge", "badge-success", "tag", "form-panel", "nav-list"];

test("les classes publiques sont préfixées et leurs anciens alias restent fonctionnels", () => {
  for (const name of aliases) {
    assert.ok(componentsCss.includes(".nz-" + name), "classe canonique absente : " + name);
    assert.ok(componentsCss.includes("." + name), "ancien alias absent : " + name);
  }
  for (const component of catalog.components) {
    assert.ok(component.selector.startsWith(".nz-"));
    assert.ok(demoHtml.includes(component.selector.slice(1)));
  }
});

test("les états accessibles sont présents dans le CSS et la galerie", () => {
  assert.match(componentsCss, /\.nz-button:disabled/);
  assert.match(componentsCss, /\.nz-button\[aria-busy="true"\]/);
  assert.match(componentsCss, /\.nz-form-panel input\[aria-invalid="true"\]/);
  assert.match(componentsCss, /\.nz-form-panel input:not\(\[type="checkbox"\]\):read-only/);
  assert.match(componentsCss, /\.nz-form-panel input:disabled/);
  assert.match(demoHtml, /aria-invalid="true" aria-describedby="example-invalid-error"/);
  assert.match(demoHtml, /disabled aria-busy="true"/);
});

test("le select natif a un chevron thématique et des états visuels dédiés", () => {
  assert.match(componentsCss, /\.nz-form-panel select,\s*\.form-panel select\s*\{[^}]*appearance:\s*none;/);
  assert.match(componentsCss, /padding-right:\s*calc\(var\(--space-8\)\s*\+\s*var\(--space-2\)\)/);
  assert.match(componentsCss, /background-size:\s*8px 8px/);
  assert.match(componentsCss, /background-position:[\s\S]*calc\(100% - 18px\) 50%,\s*calc\(100% - 10px\) 50%/);
  assert.match(componentsCss, /\.nz-form-panel select:hover:enabled[\s\S]*?border-color:\s*var\(--color-accent\)/);
  assert.match(demoHtml, /<select id="example-role"/);
  assert.match(demoHtml, /Menu harmonisé dans les navigateurs compatibles, natif ailleurs/);
});

test("le picker select est stylisé progressivement sans remplacer le contrôle natif", () => {
  assert.match(componentsCss, /@supports \(appearance:\s*base-select\)/);
  assert.match(componentsCss, /\.nz-form-panel select::picker\(select\),\s*\.form-panel select::picker\(select\)\s*\{[^}]*margin-top:\s*var\(--space-2\)/);
  assert.match(componentsCss, /select::picker-icon,[\s\S]*?display:\s*none/);
  assert.match(componentsCss, /border-radius:\s*var\(--radius-md\);[\s\S]*background:\s*var\(--color-surface\);[\s\S]*box-shadow:\s*0 8px 24px rgb\(0 0 0 \/ 10%\)/);
  assert.match(componentsCss, /select option:hover[\s\S]*?select option:checked[\s\S]*?background:\s*var\(--color-surface-muted\)/);
  assert.match(demoHtml, /Menu harmonisé dans les navigateurs compatibles, natif ailleurs/);
  assert.match(demoHtml, /<select id="example-role"/);
});

test("la décoration est réutilisable et non dupliquée dans la démo", () => {
  assert.match(demoHtml, /src\/styles\/decorations\.css/);
  assert.match(demoHtml, /class="nz-spectrum spectrum-art" aria-hidden="true"/);
  assert.match(decorationsCss, /var\(--color-art-lavender\)/);
  assert.match(decorationsCss, /pointer-events:\s*none;/);
  assert.doesNotMatch(demoCss, /radial-gradient\(/);
});

test("les espacements récurrents proviennent de la palette", () => {
  assert.match(componentsCss, /padding:\s*var\(--space-6\)/);
  assert.match(componentsCss, /gap:\s*var\(--space-2\)/);
  assert.match(demoCss, /var\(--space-4\)/);
});
