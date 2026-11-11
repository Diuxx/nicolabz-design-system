const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const { generate } = require("../scripts/build-tokens.js");
const palette = require("../tokens/palette.json");
const componentCatalog = require("../tokens/components.json");
const componentStyles = fs.readFileSync(path.join(__dirname, "..", "src", "styles", "components.css"), "utf8");
const baseStyles = fs.readFileSync(path.join(__dirname, "..", "src", "styles", "typography.css"), "utf8");
const demoMarkup = fs.readFileSync(path.join(__dirname, "..", "demo", "index.html"), "utf8");
const decorationStyles = fs.readFileSync(path.join(__dirname, "..", "src", "styles", "decorations.css"), "utf8");

test("génère tous les tokens des deux thèmes de manière déterministe", () => {
  const css = generate(palette);
  assert.equal(css, generate(JSON.parse(JSON.stringify(palette))));
  for (const theme of ["light", "dark"]) {
    const section = css.split(theme === "light" ? ':root[data-theme="light"] {' : ':root[data-theme="dark"] {')[1].split("}")[0];
    for (const [name, value] of Object.entries(palette.themes[theme])) {
      if (name === "art") {
        for (const [artName, artValue] of Object.entries(value).filter(([key]) => key !== "opacity" && key !== "blur")) {
          assert.ok(section.includes(`--color-art-${artName}: ${artValue.toLowerCase()};`));
        }
        assert.ok(section.includes(`--art-opacity: ${value.opacity};`));
        assert.ok(section.includes(`--art-blur: ${value.blur};`));
      } else {
        const cssName = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        assert.ok(section.includes(`--color-${cssName}: ${value.toLowerCase()};`));
      }
    }
  }
  for (const [prefix, values] of [["radius", palette.radii], ["space", palette.spacing]]) {
    for (const [name, value] of Object.entries(values)) assert.ok(css.includes(`--${prefix}-${name}: ${value};`));
  }
});

test("rejette les valeurs manquantes, mal formées et les tokens inconnus", () => {
  for (const mutate of [
    (p) => { delete p.themes.dark.accent; },
    (p) => { p.themes.light.art.blue = "red"; },
    (p) => { p.themes.dark.art.opacity = "1.5"; },
    (p) => { p.themes.light.art.blur = "-2px"; },
    (p) => { p.radii.md = "14"; },
    (p) => { p.spacing["4"] = "-16px"; },
    (p) => { p.themes.light.extra = "#FFFFFF"; }
  ]) {
    const copy = structuredClone(palette);
    mutate(copy);
    assert.throws(() => generate(copy));
  }
});

test("le catalogue décrit les composants CSS effectivement présentés dans la démo", () => {
  const selectors = Array.from(componentStyles.matchAll(/([^{}]+)\{/g))
    .flatMap((match) => match[1].split(",").map((selector) => selector.trim()));
  const allStyles = `${componentStyles}\n${baseStyles}`;
  const demoClasses = new Set(
    Array.from(demoMarkup.matchAll(/\bclass="([^"]+)"/g))
      .flatMap((match) => match[1].split(/\s+/))
  );

  for (const component of componentCatalog.components) {
    assert.ok(
      selectors.includes(component.selector) || selectors.some((selector) => selector.startsWith(`${component.selector} `)),
      `${component.selector} doit être défini en CSS`
    );
    assert.ok(demoClasses.has(component.selector.slice(1)), `${component.selector} doit être présenté dans la démo`);
    for (const variantSelector of Object.values(component.variants || {})) {
      assert.ok(selectors.includes(variantSelector), `${variantSelector} doit être défini en CSS`);
      assert.ok(demoClasses.has(variantSelector.slice(1)), `${variantSelector} doit être présenté dans la démo`);
    }
    for (const elementSelector of Object.values(component.elements || {})) {
      assert.ok(selectors.includes(elementSelector), `${elementSelector} doit être défini en CSS`);
      const element = elementSelector.slice(component.selector.length).trim();
      assert.match(demoMarkup, new RegExp(`<${element}\\b`), `${elementSelector} doit être présenté dans la démo`);
    }
    for (const state of component.states || []) {
      const stateIsImplemented = {
        hover: selectors.some((selector) => selector.includes(":hover") && selector.startsWith(component.selector)),
        "focus-visible": allStyles.includes(":focus-visible"),
        focus: allStyles.includes(":focus:enabled"),
        current: allStyles.includes('[aria-current="page"]'),
        disabled: selectors.some((selector) => selector.startsWith(component.selector) && selector.includes(":disabled")),
        loading: selectors.some((selector) => selector.startsWith(component.selector) && selector.includes('[aria-busy="true"]')),
        readonly: selectors.some((selector) => selector.startsWith(component.selector) && selector.includes(":read-only")),
        invalid: selectors.some((selector) => selector.startsWith(component.selector) && selector.includes('[aria-invalid="true"]'))
      }[state];
      assert.equal(stateIsImplemented, true, `${component.selector} doit implémenter l'état ${state}`);
    }
  }
});

test("la décoration de la démo utilise les tokens de palette et reste non sémantique", () => {
  assert.match(demoMarkup, /<div class="nz-spectrum spectrum-art" aria-hidden="true">/);
  assert.match(decorationStyles, /opacity:\s*var\(--art-opacity\)/);
  assert.match(decorationStyles, /filter:\s*blur\(var\(--art-blur\)\)/);
  for (const color of ["lavender", "blue", "peach", "mint"]) {
    assert.ok(decorationStyles.includes(`var(--color-art-${color})`));
  }
});

test("check détecte une désynchronisation sans modifier le fichier", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "nicolabz-tokens-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const folder of ["scripts", "tokens", path.join("src", "styles")]) fs.mkdirSync(path.join(dir, folder), { recursive: true });
  fs.copyFileSync(path.join(__dirname, "..", "scripts", "build-tokens.js"), path.join(dir, "scripts", "build-tokens.js"));
  fs.writeFileSync(path.join(dir, "tokens", "palette.json"), JSON.stringify(palette));
  const run = (...args) => spawnSync(process.execPath, [path.join(dir, "scripts", "build-tokens.js"), ...args], { encoding: "utf8" });
  assert.equal(run().status, 0);
  assert.equal(run("--check").status, 0);
  const cssPath = path.join(dir, "src", "styles", "theme.css");
  const stale = `${fs.readFileSync(cssPath, "utf8")}/* stale */\n`;
  fs.writeFileSync(cssPath, stale);
  const result = run("--check");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /désynchronisé/);
  assert.equal(fs.readFileSync(cssPath, "utf8"), stale);
  fs.writeFileSync(path.join(dir, "tokens", "palette.json"), "{");
  assert.notEqual(run().status, 0);
  assert.equal(fs.readFileSync(cssPath, "utf8"), stale);
});
