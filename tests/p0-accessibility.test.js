const assert = require('node:assert/strict');
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
    assert.equal(theme.focus, theme.accent, name + ': le focus doit suivre la couleur accent');
    assert.ok(contrast(theme.focus, theme.background) >= 3, name + ': focus < 3:1');
  }
  assert.match(componentsCss, /border(?:-color)?:\s*(?:1px solid )?var\(--color-control-border\)/);
  assert.match(componentsCss, /opacity:\s*1;/);
});

test('les styles globaux sont opt-in, le focus reste ciblé', () => {
  assert.match(baseCss, /body\.nz-base\s*\{/);
  assert.match(demoHtml, /<body[^>]*class="[^"]*\bnz-base\b/);
  assert.doesNotMatch(baseCss, /^a\s*\{/m);
  assert.doesNotMatch(baseCss, /^:focus-visible\s*\{/m);
  assert.match(componentsCss, /\.button:focus-visible/);
  assert.match(componentsCss, /\.form-panel input:focus-visible:enabled/);
  assert.match(componentsCss, /outline:\s*none;\s*box-shadow:\s*inset 0 0 0 1px var\(--color-accent\);/);
  assert.match(componentsCss, /input\[aria-invalid="true"\]:focus-visible:enabled[\s\S]*?box-shadow:\s*inset 0 0 0 1px var\(--color-error\);/);
});
