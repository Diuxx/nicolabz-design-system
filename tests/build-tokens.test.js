const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const { generate } = require("../scripts/build-tokens.js");
const palette = require("../tokens/palette.json");

test("génère tous les tokens des deux thèmes de manière déterministe", () => {
  const css = generate(palette);
  assert.equal(css, generate(JSON.parse(JSON.stringify(palette))));
  for (const theme of ["light", "dark"]) {
    const section = css.split(theme === "light" ? ':root[data-theme="light"] {' : ':root[data-theme="dark"] {')[1].split("}")[0];
    for (const [name, value] of Object.entries(palette.themes[theme])) {
      if (name === "art") {
        for (const [artName, artValue] of Object.entries(value)) {
          assert.ok(section.includes(`--color-art-${artName}: ${artValue.toLowerCase()};`));
        }
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
    (p) => { p.radii.md = "14"; },
    (p) => { p.spacing["4"] = "-16px"; },
    (p) => { p.themes.light.extra = "#FFFFFF"; }
  ]) {
    const copy = structuredClone(palette);
    mutate(copy);
    assert.throws(() => generate(copy));
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
