#!/usr/bin/env node
/**
 * Correctifs P0 du Nicolabz Design System.
 * - Relançable après l'échec partiel de la première version.
 * - Vérifie tous les changements et exécute les tests dans un répertoire temporaire
 *   AVANT de modifier le dépôt local.
 * - Préserve les personnalisations inconnues en interrompant l'opération lorsqu'une
 *   structure CSS importante ne peut pas être reconnue.
 */
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = __dirname;
const updates = new Map();
const addedFiles = new Map();

function fail(message) {
  throw new Error(message);
}

function read(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(absolutePath)) fail(`Fichier manquant : ${relativePath}`);
  return fs.readFileSync(absolutePath, 'utf8');
}

function edit(relativePath, transform) {
  const original = updates.get(relativePath) ?? read(relativePath);
  const lineEnding = original.includes('\r\n') ? '\r\n' : '\n';
  const normalized = original.replace(/\r\n/g, '\n');
  const updated = transform(normalized);
  if (typeof updated !== 'string') fail(`Modification invalide : ${relativePath}`);
  updates.set(relativePath, updated.replace(/\n/g, lineEnding));
}

function replaceOnceOrAlready(source, previous, replacement, label) {
  if (source.includes(replacement)) return source;
  const occurrences = source.split(previous).length - 1;
  if (occurrences !== 1) {
    fail(`${label} : structure non reconnue (occurrences : ${occurrences}). Aucun fichier n'a été modifié.`);
  }
  return source.replace(previous, replacement);
}

function cssRule(source, selectors, transform) {
  // Le dépôt utilise des règles CSS simples ; ne pas tenter de réécrire un bloc imbriqué.
  const escaped = selectors.map((selector) => selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const expression = new RegExp(`(^|\\n)([ \\t]*${escaped.join('\\s*,\\s*')}\\s*\\{)([^{}]*)\\}`, 'gm');
  const matches = [...source.matchAll(expression)];
  if (matches.length !== 1) {
    fail(`Sélecteur CSS introuvable ou ambigu : ${selectors.join(', ')} (${matches.length} correspondance). Aucun fichier n'a été modifié.`);
  }
  return source.replace(expression, (_whole, beginning, opening, body) =>
    `${beginning}${opening}${transform(body)}}`
  );
}

function ensureProperty(body, property, value, { override = false } = {}) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(`(^|\\n)([ \\t]*${escaped}\\s*:\\s*)([^;]*)(;)`, 'm');
  const match = body.match(expression);
  if (match) {
    if (!override || match[3].trim() === value) return body;
    return body.replace(expression, (_full, prefix, declaration, _old, semicolon) =>
      `${prefix}${declaration}${value}${semicolon}`
    );
  }
  return `${body.replace(/\s*$/, '')}\n  ${property}: ${value};\n`;
}

function addStyleRule(source, marker, rule, detectablePart) {
  if (source.includes(detectablePart)) return source;
  if (!source.includes(marker)) fail(`Point d'insertion CSS manquant : ${marker}`);
  return source.replace(marker, `${rule}\n${marker}`);
}

function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((index) => {
    const v = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(a, b) {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function planPalette() {
  edit('tokens/palette.json', (source) => {
    const palette = JSON.parse(source);
    const defaults = { light: '#858F88', dark: '#778C7B' };
    for (const [themeName, fallback] of Object.entries(defaults)) {
      const theme = palette.themes?.[themeName];
      if (!theme) fail(`Thème absent : ${themeName}`);
      if (!theme.controlBorder) {
        const originalBorder = `"border": "${theme.border}",`;
        const newBorder = `${originalBorder}\n      "controlBorder": "${fallback}",`;
        source = replaceOnceOrAlready(source, originalBorder, newBorder, `Token ${themeName}`);
        theme.controlBorder = fallback;
      }
      if (!/^#[\da-f]{6}$/i.test(theme.controlBorder)) fail(`Couleur de bordure invalide : ${themeName}`);
      const borderRatio = contrastRatio(theme.controlBorder, theme.background);
      const placeholderRatio = contrastRatio(theme.textSecondary, theme.background);
      if (borderRatio < 3 || placeholderRatio < 4.5) {
        fail(`Contraste insuffisant pour ${themeName} : bordure ${borderRatio.toFixed(2)}:1, placeholder ${placeholderRatio.toFixed(2)}:1`);
      }
      console.log(`${themeName} : bordure ${borderRatio.toFixed(2)}:1, placeholder ${placeholderRatio.toFixed(2)}:1`);
    }
    return source;
  });
  edit('scripts/build-tokens.js', (source) => {
    const colorNames = source.match(/const colorNames\s*=\s*\[([\s\S]*?)\];/);
    if (!colorNames) fail('Impossible de localiser colorNames dans le générateur');
    if (colorNames[1].includes('"controlBorder"')) return source;
    const revised = replaceOnceOrAlready(colorNames[0], '"border",', '"border", "controlBorder",', 'Tableau colorNames');
    return source.replace(colorNames[0], revised);
  });
}

function planTypography() {
  edit('src/styles/typography.css', (source) => {
    if (source.includes('body.nz-base {')) {
      if (/^\s*(?:a|button|input|select|textarea|:focus-visible)\s*\{/m.test(source)) {
        fail('typography.css contient encore des règles globales ; révision manuelle nécessaire');
      }
      return source; // Le premier script avait déjà modifié ce fichier.
    }
    const canonicalOriginal = [
      '* { box-sizing: border-box; }',
      'html { scroll-behavior: smooth; }',
      'body { margin: 0;',
      'a { color: inherit; text-decoration: none; }',
      ':focus-visible { outline: 2px solid var(--color-focus);'
    ];
    if (!canonicalOriginal.every((part) => source.includes(part))) {
      fail('typography.css a été personnalisé : impossible de le remplacer sans risque. Aucun fichier modifié.');
    }
    return `/* Styles de base facultatifs : activer avec class="nz-base" sur body. */
.nz-base,
.nz-base *,
.nz-base *::before,
.nz-base *::after {
  box-sizing: border-box;
}

body.nz-base {
  margin: 0;
  background: var(--color-background);
  color: var(--color-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.5;
  transition: background-color 220ms, color 220ms;
}

@media (prefers-reduced-motion: reduce) {
  .nz-base,
  .nz-base *,
  .nz-base *::before,
  .nz-base *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;
  });
}

function planComponents() {
  edit('src/styles/components.css', (original) => {
    let source = original;
    source = cssRule(source, ['.button'], (body) => {
      body = ensureProperty(body, 'box-sizing', 'border-box');
      body = ensureProperty(body, 'font-family', 'inherit');
      return ensureProperty(body, 'cursor', 'pointer');
    });
    for (const selector of ['.panel', '.badge', '.tag']) {
      source = cssRule(source, [selector], (body) => ensureProperty(body, 'box-sizing', 'border-box'));
    }
    source = cssRule(source, ['.form-panel input', '.form-panel select', '.form-panel textarea'], (body) => {
      body = ensureProperty(body, 'box-sizing', 'border-box');
      body = ensureProperty(body, 'font', 'inherit');
      // Ne pas dépendre d'une écriture particulière de la propriété border.
      return ensureProperty(body, 'border-color', 'var(--color-control-border)', { override: true });
    });
    source = cssRule(source, ['.form-panel button'], (body) => {
      body = ensureProperty(body, 'font-family', 'inherit');
      return ensureProperty(body, 'cursor', 'pointer');
    });
    source = cssRule(source, ['.form-panel input::placeholder', '.form-panel textarea::placeholder'],
      (body) => ensureProperty(body, 'opacity', '1', { override: true }));
    source = cssRule(source, ['.nav-list a'], (body) => ensureProperty(body, 'text-decoration', 'none'));

    source = addStyleRule(source, '\n.nav-list a:hover,', `
.button:focus-visible,
.nav-list a:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 3px;
}
`, '.button:focus-visible,');
    source = addStyleRule(source, '\n.nav-list a:hover,', `
.form-panel input:focus:enabled,
.form-panel select:focus:enabled,
.form-panel textarea:focus:enabled {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}
`, '.form-panel input:focus:enabled,');
    source = addStyleRule(source, '\n.nav-list a:hover,', `
.form-panel input:focus-visible:enabled,
.form-panel select:focus-visible:enabled,
.form-panel textarea:focus-visible:enabled {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
`, '.form-panel input:focus-visible:enabled,');
    source = addStyleRule(source, '\n.nav-list a:hover,', `
@media (prefers-reduced-motion: reduce) {
  .button, .nav-list a { transition: none; }
}
`, '.button, .nav-list a { transition: none; }');
    return source;
  });
}

function planDemo() {
  edit('demo/index.html', (source) => {
    if (/<body\s+class="[^"]*\bnz-base\b/.test(source)) return source;
    const bodyTag = /<body(?:\s+([^>]*))?>/i;
    if (!bodyTag.test(source)) fail('Balise <body> de la démonstration introuvable');
    return source.replace(bodyTag, (_tag, attributes) => {
      if (!attributes) return '<body class="nz-base">';
      if (/\bclass\s*=/.test(attributes)) {
        return `<body ${attributes.replace(/class="([^"]*)"/, (_match, classes) => `class="${classes} nz-base"`)}>`;
      }
      return `<body ${attributes} class="nz-base">`;
    });
  });
  edit('demo/demo.css', (source) => {
    if (!/(^|\n)html\s*\{\s*scroll-behavior:\s*smooth;/.test(source)) {
      source = `html { scroll-behavior: smooth; }\n\n${source}`;
    }
    source = cssRule(source, ['.skip-link'], (body) => ensureProperty(body, 'text-decoration', 'none'));
    source = cssRule(source, ['.brand'], (body) => {
      body = ensureProperty(body, 'color', 'var(--color-text)');
      return ensureProperty(body, 'text-decoration', 'none');
    });
    if (!source.includes('html { scroll-behavior: auto; }')) {
      source += '\n@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }\n';
    }
    return source;
  });
}

function planDocumentation() {
  edit('docs/PROJECT.md', (source) => source.replaceAll('demo/demo.html', 'demo/index.html'));
  edit('prompts/integrate-design-system.md', (source) => {
    if (source.includes('   - `docs/DESIGN.md`')) return source;
    return replaceOnceOrAlready(source, '   - `DESIGN.md`', '   - `docs/DESIGN.md`', 'Chemin du guide DESIGN');
  });
  edit('README.md', (source) => {
    if (!source.includes('--color-control-border')) {
      source = replaceOnceOrAlready(source,
        'Le générateur accepte les couleurs hexadécimales à six chiffres et les',
        'Le token `--color-control-border` est dédié aux contours des champs, dont le contraste est renforcé dans les deux thèmes.\n\nLe générateur accepte les couleurs hexadécimales à six chiffres et les',
        'Documentation du token de contrôle');
    }
    if (!source.includes('class="nz-base"')) {
      source = replaceOnceOrAlready(source,
        "Les\nstyles de base s'appliquent globalement à la page : vérifier leur compatibilité\navec les styles de l'application.",
        'Les\nstyles de base sont facultatifs : les activer avec `class="nz-base"` sur `<body>`.\nSans cette classe, `typography.css` ne modifie pas les éléments de la page.\nLes liens ordinaires conservent leur style natif ; les styles des composants sont ciblés.',
        'Documentation des styles opt-in');
    }
    return source;
  });
  edit('docs/RESUME.md', (source) => {
    if (source.includes('class="nz-base"')) return source;
    return replaceOnceOrAlready(source, '## Conventions\n',
      '## Conventions\n\n- `typography.css` est facultatif et s’active via `class="nz-base"` sur `<body>`.\n- `--color-control-border` assure la lisibilité des contours de champs.\n\n',
      'Résumé des nouvelles conventions');
  });
}

function planTests() {
  const filename = 'tests/p0-accessibility.test.js';
  if (fs.existsSync(path.join(projectRoot, filename))) return;
  addedFiles.set(filename, `const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const palette = require('../tokens/palette.json');
const baseCss = fs.readFileSync(path.join(root, 'src/styles/typography.css'), 'utf8');
const componentsCss = fs.readFileSync(path.join(root, 'src/styles/components.css'), 'utf8');
const demoHtml = fs.readFileSync(path.join(root, 'demo/index.html'), 'utf8');

function luminance(hex) {
  const parts = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return parts[0] * 0.2126 + parts[1] * 0.7152 + parts[2] * 0.0722;
}
function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

test('bordures et placeholders contrastés en clair et sombre', () => {
  for (const [name, theme] of Object.entries(palette.themes)) {
    assert.ok(contrast(theme.controlBorder, theme.background) >= 3, name + ': bordure < 3:1');
    assert.ok(contrast(theme.textSecondary, theme.background) >= 4.5, name + ': placeholder < 4.5:1');
  }
  assert.match(componentsCss, /border-color:\\s*var\\(--color-control-border\\)/);
  assert.match(componentsCss, /opacity:\\s*1;/);
});

test('les styles globaux sont opt-in, le focus reste ciblé', () => {
  assert.match(baseCss, /body\\.nz-base\\s*\\{/);
  assert.match(demoHtml, /<body[^>]*class="[^"]*\\bnz-base\\b/);
  assert.doesNotMatch(baseCss, /^a\\s*\\{/m);
  assert.doesNotMatch(baseCss, /^:focus-visible\\s*\\{/m);
  assert.match(componentsCss, /\\.button:focus-visible/);
  assert.match(componentsCss, /\\.form-panel input:focus-visible:enabled/);
});
`);
}

function stageAndTest() {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'nicolabz-p0-'));
  try {
    for (const directory of ['src', 'tokens', 'scripts', 'demo', 'tests']) {
      fs.cpSync(path.join(projectRoot, directory), path.join(folder, directory), { recursive: true });
    }
    fs.copyFileSync(path.join(projectRoot, 'package.json'), path.join(folder, 'package.json'));
    for (const [file, content] of [...updates, ...addedFiles]) {
      if (file.startsWith('docs/') || file.startsWith('prompts/') || file === 'README.md') continue;
      const destination = path.join(folder, file);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, content);
    }
    for (const name of ['build', 'check', 'test']) {
      console.log(`Vérification dans une copie temporaire : npm run ${name}`);
      const proc = spawnSync('npm', ['run', name], {
        cwd: folder,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });
      if (proc.error || proc.status !== 0) {
        fail(`Echec npm run ${name} dans la copie temporaire. Le dépôt reste inchangé.`);
      }
    }
    // Recopier le CSS généré et vérifié, pas une version écrite à la main.
    updates.set('src/styles/theme.css', fs.readFileSync(path.join(folder, 'src/styles/theme.css'), 'utf8'));
  } finally {
    fs.rmSync(folder, { recursive: true, force: true });
  }
}

function applyChanges() {
  const changes = [...updates, ...addedFiles].filter(([file, next]) => {
    const fullPath = path.join(projectRoot, file);
    return !fs.existsSync(fullPath) || fs.readFileSync(fullPath, 'utf8') !== next;
  });
  if (changes.length === 0) {
    console.log('Aucun changement nécessaire : correctifs déjà présents.');
    return;
  }
  // Les contenus sont conservés en cas d'échec d'écriture du disque.
  const backups = new Map();
  try {
    for (const [file, next] of changes) {
      const target = path.join(projectRoot, file);
      backups.set(target, fs.existsSync(target) ? fs.readFileSync(target) : null);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, next, 'utf8');
      console.log(`Corrigé : ${file}`);
    }
  } catch (error) {
    for (const [target, previous] of backups) {
      if (previous === null) fs.rmSync(target, { force: true });
      else fs.writeFileSync(target, previous);
    }
    throw error;
  }
}

function main() {
  for (const pathToCheck of ['package.json', 'src/styles/components.css', 'tokens/palette.json']) read(pathToCheck);
  planPalette();
  planTypography();
  planComponents();
  planDemo();
  planDocumentation();
  planTests();
  stageAndTest();
  applyChanges();
  console.log('Terminé : vérifications réussies sur la copie temporaire. Inspecter ensuite git diff.');
}

try {
  main();
} catch (error) {
  console.error(`Erreur : ${error.message}`);
  process.exitCode = 1;
}
