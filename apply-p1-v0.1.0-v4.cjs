#!/usr/bin/env node
"use strict";

/**
 * P1 migration for Nicolabz Design System, based on v0.1.0 (4b987e7).
 * Changes are tested in a temporary copy before any tracked file is written.
 * No dependencies required beyond the project's Node.js runtime and Git.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = process.cwd();
const baseCommit = "4b987e75914e1903b20fe770ad6a4bf5c8e7a8ca";
const replacements = new Map();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function update(relativePath, transform) {
  const original = read(relativePath);
  // Git for Windows may check out CRLF files. Normalize LF before matching;
  // write LF to avoid treating carriage returns as trailing whitespace in Git.
  const normalized = original.replace(/\r\n?/g, "\n");
  const revised = transform(normalized);
  if (original === revised) throw new Error(`Aucune modification produite : ${relativePath}`);
  replacements.set(relativePath, revised);
}

function replaceExactly(source, before, after, description) {
  const matches = source.split(before).length - 1;
  if (matches !== 1) {
    throw new Error(`${description}: ${matches} correspondance(s) au lieu de 1. Aucun fichier n'a été modifié.`);
  }
  return source.replace(before, after);
}

function assertBranchIsReady() {
  const branch = execFileSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" }).trim();
  if (branch !== "v0.1.0") {
    throw new Error(`Branche attendue : v0.1.0 ; branche actuelle : ${branch || "(aucune)"}.`);
  }
  const currentCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  if (currentCommit !== baseCommit) {
    throw new Error(`La branche a évolué depuis la version analysée (${baseCommit.slice(0, 7)}). Éviter d'appliquer ce patch à l'aveugle.`);
  }
  for (const args of [["diff", "--quiet"], ["diff", "--cached", "--quiet"]]) {
    try { execFileSync("git", args, { cwd: root, stdio: "ignore" }); }
    catch { throw new Error("Des modifications suivies par Git sont présentes. Commit ou stash avant la migration."); }
  }
  if (read("src/styles/components.css").includes(".nz-button")) {
    throw new Error("Des classes nz-* sont déjà présentes : migration P1 possiblement appliquée.");
  }
}

const componentsCss = `.nz-button,
.button {
  box-sizing: border-box;
  min-height: 44px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 150ms, background-color 150ms;
}

.nz-button:hover:not(:disabled),
.button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.nz-button-primary,
.button-primary {
  background: var(--color-button);
  color: var(--color-button-text);
}

.nz-button-secondary,
.button-secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-border);
}

.nz-button:disabled,
.button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.nz-button[aria-busy="true"],
.button[aria-busy="true"] {
  cursor: progress;
}

.nz-button[aria-busy="true"]::before,
.button[aria-busy="true"]::before {
  content: "";
  width: 1em;
  height: 1em;
  box-sizing: border-box;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: nz-button-spin 800ms linear infinite;
}

@keyframes nz-button-spin {
  to { transform: rotate(360deg); }
}

.nz-panel,
.panel {
  box-sizing: border-box;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  background: var(--color-surface);
}

.nz-panel-muted,
.panel-muted {
  background: var(--color-surface-muted);
}

.nz-badge,
.badge {
  box-sizing: border-box;
  padding: var(--space-1) var(--space-2);
  font-size: 11px;
  border-radius: 40px;
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.nz-badge-success,
.badge-success {
  background: var(--color-success-surface);
  color: var(--color-success);
}

.nz-tag,
.tag {
  box-sizing: border-box;
  font-size: 11px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  padding: var(--space-1) var(--space-2);
}

.nz-form-panel label,
.form-panel label {
  font-size: 12px;
  font-weight: 600;
}

.nz-form-panel input,
.form-panel input,
.nz-form-panel select,
.form-panel select,
.nz-form-panel textarea,
.form-panel textarea {
  box-sizing: border-box;
  width: 100%;
  padding: var(--space-3);
  min-height: 42px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-control-border);
  background: var(--color-background);
  color: var(--color-text);
  margin-bottom: var(--space-2);
  font: inherit;
}

.nz-form-panel textarea,
.form-panel textarea {
  min-height: 96px;
  resize: vertical;
}

.nz-form-panel input[type="checkbox"],
.form-panel input[type="checkbox"] {
  width: 18px;
  min-height: 18px;
  padding: 0;
  margin: 0 var(--space-2) 0 0;
  accent-color: var(--color-accent);
}

.nz-form-panel button,
.form-panel button {
  display: flex;
  width: fit-content;
  font-family: inherit;
  cursor: pointer;
}

.nz-form-panel input::placeholder,
.form-panel input::placeholder,
.nz-form-panel textarea::placeholder,
.form-panel textarea::placeholder {
  color: var(--color-text-secondary);
  opacity: 1;
}

.nz-form-panel input:disabled,
.form-panel input:disabled,
.nz-form-panel select:disabled,
.form-panel select:disabled,
.nz-form-panel textarea:disabled,
.form-panel textarea:disabled {
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
  cursor: not-allowed;
  opacity: 0.75;
}

.nz-form-panel input:not([type="checkbox"]):read-only,
.form-panel input:not([type="checkbox"]):read-only,
.nz-form-panel textarea:read-only,
.form-panel textarea:read-only {
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
}

.nz-form-panel input[aria-invalid="true"],
.form-panel input[aria-invalid="true"],
.nz-form-panel select[aria-invalid="true"],
.form-panel select[aria-invalid="true"],
.nz-form-panel textarea[aria-invalid="true"],
.form-panel textarea[aria-invalid="true"] {
  border-color: var(--color-error);
}

.nz-form-panel .nz-field-error,
.form-panel .nz-field-error {
  margin: 0 0 var(--space-3);
  color: var(--color-error);
  font-size: 12px;
}

.nz-nav-list,
.nav-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  list-style: none;
  margin: 0;
  padding: 0;
}

.nz-nav-list a,
.nav-list a {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 13px;
  transition: background-color 150ms, color 150ms;
  text-decoration: none;
}

.nz-button:focus-visible,
.button:focus-visible,
.nz-nav-list a:focus-visible,
.nav-list a:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 3px;
}

.nz-form-panel input:focus:enabled,
.form-panel input:focus:enabled,
.nz-form-panel select:focus:enabled,
.form-panel select:focus:enabled,
.nz-form-panel textarea:focus:enabled,
.form-panel textarea:focus:enabled {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}

.nz-form-panel input:focus-visible:enabled,
.form-panel input:focus-visible:enabled,
.nz-form-panel select:focus-visible:enabled,
.form-panel select:focus-visible:enabled,
.nz-form-panel textarea:focus-visible:enabled,
.form-panel textarea:focus-visible:enabled {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.nz-form-panel input[aria-invalid="true"]:focus:enabled,
.form-panel input[aria-invalid="true"]:focus:enabled,
.nz-form-panel select[aria-invalid="true"]:focus:enabled,
.form-panel select[aria-invalid="true"]:focus:enabled,
.nz-form-panel textarea[aria-invalid="true"]:focus:enabled,
.form-panel textarea[aria-invalid="true"]:focus:enabled {
  border-color: var(--color-error);
  box-shadow: 0 0 0 1px var(--color-error);
}

.nz-nav-list a:hover,
.nav-list a:hover,
.nz-nav-list a[aria-current="page"],
.nav-list a[aria-current="page"] {
  background: var(--color-surface-muted);
  color: var(--color-accent);
}

@media (prefers-reduced-motion: reduce) {
  .nz-button, .button, .nz-nav-list a, .nav-list a { transition: none; }
  .nz-button[aria-busy="true"]::before,
  .button[aria-busy="true"]::before { animation: none; }
}
`;

const decorationsCss = `/* Decoration non interactive. Le conteneur parent doit isoler son empilement. */
.nz-spectrum,
.spectrum-art {
  position: absolute;
  z-index: 0;
  width: min(820px, 85vw);
  height: min(820px, 100vh);
  pointer-events: none;
  opacity: var(--art-opacity);
  filter: blur(var(--art-blur));
  transition: opacity 300ms, filter 300ms;
}

.nz-spectrum__shape,
.spectrum-art__shape,
.nz-spectrum::after,
.spectrum-art::after {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: 53% 47% 62% 38% / 42% 56% 44% 58%;
  background:
    radial-gradient(ellipse at 30% 27%, var(--color-art-lavender) 0%, transparent 45%),
    radial-gradient(ellipse at 76% 34%, var(--color-art-blue) 0%, transparent 52%),
    radial-gradient(ellipse at 70% 78%, var(--color-art-mint) 0%, transparent 48%),
    radial-gradient(ellipse at 26% 75%, var(--color-art-peach) 0%, transparent 52%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 73%);
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 73%);
  content: "";
  transform: rotate(-22deg);
}

.nz-spectrum::after,
.spectrum-art::after {
  inset: auto 6% -26% 12%;
  height: 56%;
  border-radius: 46% 54% 39% 61% / 49% 38% 62% 51%;
  opacity: 0.78;
  transform: rotate(-10deg);
}

@media (prefers-reduced-motion: reduce) {
  .nz-spectrum, .spectrum-art { transition: none; }
}
`;

function adoptSpacingTokens(css) {
  const spacing = new Map([[4, 1], [8, 2], [12, 3], [16, 4], [24, 6], [32, 8], [48, 12], [64, 16]]);
  return css.replace(/^(\s*(?:gap|row-gap|column-gap|padding(?:-[\w]+)?|margin(?:-[\w]+)?):\s*)([^;]+)(;)/gm,
    (_match, property, value, terminator) => {
      const updated = value.replace(/(^|[^\d.])(4|8|12|16|24|32|48|64)px\b/g,
        (_part, prefix, number) => `${prefix}var(--space-${spacing.get(Number(number))})`);
      return property + updated + terminator;
    });
}

function updateDemoCss(source) {
  const start = source.indexOf(".spectrum-art {");
  const end = source.indexOf("\n.sidebar {", start);
  if (start < 0 || end < 0 || source.includes(".nz-spectrum {")) {
    throw new Error("Structure de demo.css inattendue : impossible d'extraire la décoration sans risque.");
  }
  const demoPlacement = `.spectrum-art {
  top: 80px;
  left: calc(50% + 120px);
  transform: translateX(-50%);
}
`;
  let css = source.slice(0, start) + demoPlacement + source.slice(end);
  css = css.replaceAll(".story-preview-form > .form-panel", ".story-preview-form > .nz-form-panel")
    .replaceAll('> .panel {', '> .nz-panel {');
  return adoptSpacingTokens(css);
}

const legacyClasses = new Map([
  ["button", "nz-button"], ["button-primary", "nz-button-primary"],
  ["button-secondary", "nz-button-secondary"], ["panel", "nz-panel"],
  ["panel-muted", "nz-panel-muted"], ["badge", "nz-badge"],
  ["badge-success", "nz-badge-success"], ["tag", "nz-tag"],
  ["form-panel", "nz-form-panel"], ["nav-list", "nz-nav-list"]
]);

function updateDemoHtml(source) {
  let html = replaceExactly(source,
    '<link rel="stylesheet" href="../src/styles/components.css" />',
    '<link rel="stylesheet" href="../src/styles/components.css" />\n    <link rel="stylesheet" href="../src/styles/decorations.css" />',
    "Import decorations.css");
  html = replaceExactly(html, '<div class="spectrum-art" aria-hidden="true">',
    '<div class="nz-spectrum spectrum-art" aria-hidden="true">', "Decor parent");
  html = replaceExactly(html, '<div class="spectrum-art__shape"></div>',
    '<div class="nz-spectrum__shape"></div>', "Decor shape");

  // Only touch actual class attribute values; no business markup or JS attributes.
  html = html.replace(/\bclass="([^"]*)"/g, (attribute, names) => {
    const migrated = names.split(/\s+/).map(name => legacyClasses.get(name) ?? name);
    return `class="${migrated.join(" ")}"`;
  });
  html = html.replace(/(<code class="selector-chip">)([^<]+)(<\/code>)/g,
    (_match, before, content, after) => before + content.replace(/\.(button|panel|badge|tag|form-panel|nav-list)\b/g, ".nz-$1") + after);
  html = replaceExactly(html, '<button class="nz-button nz-button-secondary" type="button">Action secondaire</button>',
    `<button class="nz-button nz-button-secondary" type="button">Action secondaire</button>
                <button class="nz-button nz-button-primary" type="button" disabled>Indisponible</button>
                <button class="nz-button nz-button-primary" type="button" disabled aria-busy="true">Chargement…</button>`,
    "Exemples états Button");
  html = replaceExactly(html, '<label for="example-updates">',
    `<label for="example-readonly">Lecture seule</label>
                  <input id="example-readonly" type="text" value="Valeur non modifiable" readonly />
                  <label for="example-disabled">Champ désactivé</label>
                  <input id="example-disabled" type="text" value="Indisponible" disabled />
                  <label for="example-invalid">Champ en erreur</label>
                  <input id="example-invalid" type="text" value="Valeur incorrecte" aria-invalid="true" aria-describedby="example-invalid-error" />
                  <p id="example-invalid-error" class="nz-field-error">Corrige cette valeur avant de poursuivre.</p>
                  <label for="example-updates">`, "Exemples états Form Panel");
  // The navigation card uses the same state wording; update only the Button story.
  html = replaceExactly(html,
    '<strong>Variantes</strong> Primary · Secondary <span aria-hidden="true">/</span> <strong>États</strong> Hover · Focus clavier',
    '<strong>Variantes</strong> Primary · Secondary <span aria-hidden="true">/</span> <strong>États</strong> Hover · Focus clavier · Disabled · Loading',
    "Légende boutons");
  html = replaceExactly(html, '<strong>États</strong> Focus · Focus clavier',
    '<strong>États</strong> Focus · Disabled · Readonly · Invalid', "Légende formulaires");
  return html;
}

function updateCatalog(source) {
  const catalog = JSON.parse(source);
  for (const component of catalog.components) {
    component.selector = ".nz-" + component.selector.slice(1);
    for (const [name, selector] of Object.entries(component.variants ?? {})) component.variants[name] = ".nz-" + selector.slice(1);
    for (const [name, selector] of Object.entries(component.elements ?? {})) component.elements[name] = selector.replace(/^\./, ".nz-");
    if (component.name === "Button") {
      component.states = ["hover", "focus-visible", "disabled", "loading"];
      component.usage = "Combine .nz-button with .nz-button-primary or .nz-button-secondary. Use disabled to prevent actions, aria-busy=\"true\" with a visible progress label for loading.";
    }
    if (component.name === "Form Panel") {
      component.states = ["focus", "focus-visible", "disabled", "readonly", "invalid"];
      component.usage = 'Use .nz-form-panel; associate labels using for/id. For errors set aria-invalid="true" and aria-describedby to a .nz-field-error element.';
    }
    if (component.name === "Badge") component.usage = "Combine .nz-badge with .nz-badge-success for positive status.";
    if (component.name === "Navigation List") component.usage = 'Use .nz-nav-list with semantic navigation markup and aria-current="page" for the current page.';
  }
  catalog.version = "0.3.0";
  return JSON.stringify(catalog, null, 2) + "\n";
}

function updateExistingTests(source) {
  let js = replaceExactly(source,
    'const demoStyles = fs.readFileSync(path.join(__dirname, "..", "demo", "demo.css"), "utf8");',
    'const decorationStyles = fs.readFileSync(path.join(__dirname, "..", "src", "styles", "decorations.css"), "utf8");',
    "Source des styles decoratifs");
  js = replaceExactly(js,
    '        current: allStyles.includes(\'[aria-current="page"]\')',
    `        current: allStyles.includes('[aria-current="page"]'),
        disabled: selectors.some((selector) => selector.startsWith(component.selector) && selector.includes(":disabled")),
        loading: selectors.some((selector) => selector.startsWith(component.selector) && selector.includes('[aria-busy="true"]')),
        readonly: selectors.some((selector) => selector.startsWith(component.selector) && selector.includes(":read-only")),
        invalid: selectors.some((selector) => selector.startsWith(component.selector) && selector.includes('[aria-invalid="true"]'))`,
    "Nouveaux états du catalogue");
  js = replaceExactly(js, '/<div class="spectrum-art" aria-hidden="true">/',
    '/<div class="nz-spectrum spectrum-art" aria-hidden="true">/', "Demo decorative markup");
  js = js.replaceAll("demoStyles", "decorationStyles");
  return js;
}

const p1Tests = `const assert = require("node:assert/strict");
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
  assert.match(componentsCss, /\\.nz-button:disabled/);
  assert.match(componentsCss, /\\.nz-button\\[aria-busy="true"\\]/);
  assert.match(componentsCss, /\\.nz-form-panel input\\[aria-invalid="true"\\]/);
  assert.match(componentsCss, /\\.nz-form-panel input:not\\(\\[type="checkbox"\\]\\):read-only/);
  assert.match(componentsCss, /\\.nz-form-panel input:disabled/);
  assert.match(demoHtml, /aria-invalid="true" aria-describedby="example-invalid-error"/);
  assert.match(demoHtml, /disabled aria-busy="true"/);
});

test("la décoration est réutilisable et non dupliquée dans la démo", () => {
  assert.match(demoHtml, /src\\/styles\\/decorations\\.css/);
  assert.match(demoHtml, /class="nz-spectrum spectrum-art" aria-hidden="true"/);
  assert.match(decorationsCss, /var\\(--color-art-lavender\\)/);
  assert.match(decorationsCss, /pointer-events:\\s*none;/);
  assert.doesNotMatch(demoCss, /radial-gradient\\(/);
});

test("les espacements récurrents proviennent de la palette", () => {
  assert.match(componentsCss, /padding:\\s*var\\(--space-6\\)/);
  assert.match(componentsCss, /gap:\\s*var\\(--space-2\\)/);
  assert.match(demoCss, /var\\(--space-4\\)/);
});
`;

function prepareChanges() {
  update("tokens/palette.json", (source) => {
    const palette = JSON.parse(source);
    palette.themes.light.error = "#A43E44";
    palette.themes.dark.error = "#FF9AA0";
    return JSON.stringify(palette, null, 2) + "\n";
  });
  update("scripts/build-tokens.js", source => replaceExactly(source,
    '"accent", "accentContrast", "button", "buttonText", "success", "successSurface", "focus"',
    '"accent", "accentContrast", "button", "buttonText", "success", "successSurface", "focus", "error"',
    "Validation du token erreur"));
  update("src/styles/components.css", source => {
    if (!source.includes(".form-panel input:focus-visible:enabled") || !source.includes("--color-control-border")) {
      throw new Error("components.css ne correspond pas au P0 attendu.");
    }
    return componentsCss;
  });
  update("demo/demo.css", updateDemoCss);
  update("demo/index.html", updateDemoHtml);
  update("tokens/components.json", updateCatalog);
  update("tests/build-tokens.test.js", updateExistingTests);
  update("tests/p0-accessibility.test.js", source => replaceExactly(source,
    String.raw`/border-color:\s*var\(--color-control-border\)/`,
    String.raw`/border(?:-color)?:\s*(?:1px solid )?var\(--color-control-border\)/`,
    "Maintenir le test P0 après simplification de la propriété border"));
  update("README.md", source => {
    let result = replaceExactly(source,
      '- [src/styles/components.css](src/styles/components.css) : composants CSS\n  réutilisables.',
      '- [src/styles/components.css](src/styles/components.css) : composants CSS\n  réutilisables.\n- [src/styles/decorations.css](src/styles/decorations.css) : forme Soft Spectrum facultative,\n  utilisable dans n’importe quelle application.',
      "README architecture");
    result = replaceExactly(result,
      'Sans cette classe, `typography.css` ne modifie pas les éléments de la page.',
      'Sans cette classe, `typography.css` ne modifie pas les éléments de la page.\nLes classes publiques commencent désormais par `nz-` (exemple : `nz-button`,\n`nz-button-primary`, `nz-form-panel`). Les anciennes classes (`button`,\n`button-primary`, `form-panel`, etc.) restent prises en charge comme alias de\ncompatibilité. Utiliser uniquement les nouvelles classes dans les nouveaux projets.',
      "README migration");
    result = replaceExactly(result,
      'La forme multicolore et son\npositionnement appartiennent à la démonstration : ses couches placent la\ndécoration derrière le contenu.',
      `La forme multicolore est désormais réutilisable avec \`decorations.css\` :

\`\`\`html
<div class="nz-spectrum" aria-hidden="true">
  <div class="nz-spectrum__shape"></div>
</div>
\`\`\`

Placer la forme dans un conteneur \`position: relative; isolation: isolate\`,
avec le contenu au-dessus (\`z-index: 1\`). Le positionnement précis reste propre à
chaque application. L'ancienne classe \`spectrum-art\` reste compatible.`,
      "README decor");
    result = result.replaceAll("\`", "`");
    result += `\n## États des composants\n\n- Les boutons prennent en charge \`disabled\` et \`aria-busy="true"\` avec un libellé de chargement.\n- Les formulaires prennent en charge \`disabled\`, \`readonly\` (saisie texte)\n  et \`aria-invalid="true"\` accompagné d'un message relié par \`aria-describedby\`.\n- Les marges et espacements récurrents utilisent les tokens \`--space-*\`.\n`;
    return result.replaceAll("\`", "`");
  });
  update("docs/RESUME.md", source => source.trimEnd() + `\n\n## Évolutions P1\n\n- Les composants CSS et le catalogue utilisent les sélecteurs publics \`nz-*\`;\n  les anciens sélecteurs restent des alias transitoires.\n- \`src/styles/decorations.css\` fournit la forme Soft Spectrum réutilisable ;\n  la galerie ne conserve que son placement.\n- Les espacements courants utilisent les tokens \`--space-*\` et les\n  boutons / champs exposent les états désactivé, chargement, erreur et lecture seule.\n- \`tests/p1-components.test.js\` vérifie les sélecteurs, états et la décoration.\n`.replaceAll("\`", "`"));
  if (fs.existsSync(path.join(root, "src/styles/decorations.css"))) throw new Error("decorations.css existe déjà.");
  if (fs.existsSync(path.join(root, "tests/p1-components.test.js"))) throw new Error("Le test P1 existe déjà.");
  replacements.set("src/styles/decorations.css", decorationsCss);
  replacements.set("tests/p1-components.test.js", p1Tests);
}

function testStagedCopy() {
  const stagingRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nicolabz-p1-"));
  const staged = path.join(stagingRoot, "repo");
  try {
    fs.cpSync(root, staged, { recursive: true, filter: file => ![".git", "node_modules"].includes(path.basename(file)) });
    for (const [relativePath, content] of replacements) {
      const target = path.join(staged, relativePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
    }
    for (const args of [["scripts/build-tokens.js"], ["scripts/build-tokens.js", "--check"], ["--test"]]) {
      console.log("Vérification : node", args.join(" "));
      execFileSync(process.execPath, args, { cwd: staged, stdio: "inherit" });
    }
    const generatedTheme = fs.readFileSync(path.join(staged, "src/styles/theme.css"), "utf8");
    replacements.set("src/styles/theme.css", generatedTheme);
  } finally {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
  }
}

function writeChanges() {
  const backups = new Map();
  for (const relativePath of replacements.keys()) {
    const target = path.join(root, relativePath);
    backups.set(target, fs.existsSync(target) ? fs.readFileSync(target) : null);
  }
  try {
    for (const [relativePath, content] of replacements) {
      const target = path.join(root, relativePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
    }
  } catch (error) {
    for (const [target, previous] of backups) {
      if (previous === null) fs.rmSync(target, { force: true });
      else fs.writeFileSync(target, previous);
    }
    throw error;
  }
}

try {
  assertBranchIsReady();
  prepareChanges();
  testStagedCopy();
  writeChanges();
  console.log("\nP1 appliqués et tests passés. Contrôle : git diff --stat && git diff --check");
  console.log("Fichiers modifiés :", [...replacements.keys()].join(", "));
} catch (error) {
  console.error("\nÉchec sans modification du dépôt :", error.message);
  process.exitCode = 1;
}
