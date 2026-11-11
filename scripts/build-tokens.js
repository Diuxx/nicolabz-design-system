const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const palettePath = path.join(root, "tokens", "palette.json");
const cssPath = path.join(root, "src", "styles", "theme.css");
const colorNames = [
  "background", "surface", "surfaceMuted", "text", "textSecondary", "border", "controlBorder",
  "accent", "accentContrast", "button", "buttonText", "success", "successSurface", "focus"
];
const artNames = ["lavender", "blue", "peach", "mint"];
const artDimension = /^(?:0|[1-9]\d*)(?:\.\d+)?px$/;
const radiusNames = ["sm", "md", "lg"];
const spacingNames = ["1", "2", "3", "4", "6", "8", "12", "16"];

function requireKeys(value, keys, location) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${location} doit être un objet.`);
  }
  for (const key of keys) {
    if (!Object.hasOwn(value, key)) throw new Error(`${location}.${key} est manquant.`);
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) throw new Error(`${location}.${key} est inconnu.`);
  }
}

function validateValues(value, keys, location, pattern) {
  requireKeys(value, keys, location);
  for (const key of keys) {
    if (typeof value[key] !== "string" || !pattern.test(value[key])) {
      throw new Error(`${location}.${key} possède une valeur invalide.`);
    }
  }
}

function kebab(name) {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function generate(palette) {
  if (!palette || typeof palette !== "object" || Array.isArray(palette)) {
    throw new Error("La palette doit être un objet.");
  }
  requireKeys(palette.themes, ["light", "dark"], "themes");
  for (const theme of ["light", "dark"]) {
    const values = palette.themes[theme];
    requireKeys(values, [...colorNames, "art"], `themes.${theme}`);
    for (const name of colorNames) {
      if (typeof values[name] !== "string" || !/^#[0-9a-f]{6}$/i.test(values[name])) {
        throw new Error(`themes.${theme}.${name} possède une couleur invalide.`);
      }
    }
    requireKeys(values.art, [...artNames, "opacity", "blur"], `themes.${theme}.art`);
    validateValues(
      Object.fromEntries(artNames.map((name) => [name, values.art[name]])),
      artNames,
      `themes.${theme}.art`,
      /^#[0-9a-f]{6}$/i
    );
    if (typeof values.art.opacity !== "string" || !/^(?:0|0?\.\d+|1(?:\.0+)?)$/.test(values.art.opacity)) {
      throw new Error(`themes.${theme}.art.opacity possède une valeur invalide.`);
    }
    if (typeof values.art.blur !== "string" || !artDimension.test(values.art.blur)) {
      throw new Error(`themes.${theme}.art.blur possède une valeur invalide.`);
    }
  }
  const dimension = /^(?:0|[1-9]\d*)(?:\.\d+)?px$/;
  validateValues(palette.radii, radiusNames, "radii", dimension);
  validateValues(palette.spacing, spacingNames, "spacing", dimension);

  const lines = ["/* Généré par scripts/build-tokens.js : ne pas modifier manuellement. */"];
  for (const theme of ["light", "dark"]) {
    const values = palette.themes[theme];
    lines.push(theme === "light" ? ':root,\n:root[data-theme="light"] {' : ':root[data-theme="dark"] {');
    lines.push(`  color-scheme: ${theme};`);
    for (const name of colorNames) lines.push(`  --color-${kebab(name)}: ${values[name].toLowerCase()};`);
    for (const name of artNames) lines.push(`  --color-art-${name}: ${values.art[name].toLowerCase()};`);
    lines.push(`  --art-opacity: ${values.art.opacity};`);
    lines.push(`  --art-blur: ${values.art.blur};`);
    if (theme === "light") {
      for (const name of radiusNames) lines.push(`  --radius-${name}: ${palette.radii[name]};`);
      for (const name of spacingNames) lines.push(`  --space-${name}: ${palette.spacing[name]};`);
    }
    lines.push("}");
  }
  return `${lines.join("\n")}\n`;
}

function main(args) {
  if (args.length > 1 || (args.length === 1 && args[0] !== "--check")) {
    throw new Error("Usage : node scripts/build-tokens.js [--check]");
  }
  const palette = JSON.parse(fs.readFileSync(palettePath, "utf8"));
  const css = generate(palette);
  if (args[0] === "--check") {
    if (fs.readFileSync(cssPath, "utf8") !== css) {
      throw new Error("theme.css est désynchronisé ; exécutez npm run build.");
    }
    console.log("Les tokens CSS sont à jour.");
  } else {
    fs.mkdirSync(path.dirname(cssPath), { recursive: true });
    fs.writeFileSync(cssPath, css, "utf8");
    console.log("Tokens CSS générés.");
  }
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`Erreur de génération des tokens : ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { generate };
