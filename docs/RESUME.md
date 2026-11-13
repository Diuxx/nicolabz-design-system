# Technical Summary

Nicolabz Design System is a static, framework-independent design system with
shared design tokens, CSS components, light and dark themes, and an interactive
component gallery.

## Architecture

- `tokens/palette.json` is the source of truth for theme colors, radii, spacing,
  and decoration settings. `scripts/build-tokens.js` generates
  `src/styles/theme.css`.
- `tokens/icons.json` groups the curated icon names; `scripts/build-icons.js`
  validates them and builds an SVG sprite using the `lucide-static`
  development dependency. It also copies
  Lucide's license into `src/icons/`; consumers need only serve the generated
  sprite and load `src/styles/icons.css`.
- `tokens/components.json` catalogs public components and variants implemented
  in the shared stylesheets.
- `src/theme.js` applies the selected theme, tracks system preferences, and
  exposes `window.nicolabzTheme`.
- `demo/index.html` and `demo/demo.css` organize the gallery. Templates provide
  both previews and copyable examples; `demo/demo.js` renders them and handles
  local interactions.
- `npm run build` generates both theme tokens and the icon sprite. `npm run
  check` checks generated assets, and the Node test suite validates catalog,
  sprite, and demo consistency.

## Conventions

- New public CSS selectors use the `nz-` prefix; legacy unprefixed selectors
  remain compatibility aliases.
- `typography.css` is optional and is enabled with `class="nz-base"` on
  `<body>`.
- Keep generated files synchronized with their sources; do not edit
  `theme.css` or `icons.svg` manually.
- Keep shared styles, the component catalog, and the gallery synchronized.
