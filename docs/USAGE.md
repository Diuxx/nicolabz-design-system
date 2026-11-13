# Usage and Integration

Nicolabz Design System provides shared CSS tokens and components, light and dark
themes, and a framework-independent Lucide SVG sprite. It has no runtime
JavaScript dependency. The package is private and is not published to the public
npm registry.

## Installation

Install a tagged release or commit from GitHub and keep the lockfile in the
consuming application:

```sh
npm install "github:Diuxx/nicolabz-design-system#REF"
```

Replace `REF` with a verified tag or commit SHA. The package exports
`theme.css`, `components.css`, `typography.css`, `decorations.css`, `icons.css`,
`icons.svg`, and `theme.js`.

## CSS and Theme

Import the required styles through the application's bundler:

```js
import "@nicolabz/design-system/theme.css";
import "@nicolabz/design-system/components.css";
import "@nicolabz/design-system/icons.css";
```

`typography.css` and `decorations.css` are optional. In Angular, add global
styles through the build configuration rather than importing them per
component. `theme.js` accesses `window` and `document`; run it only in the
browser. For static HTML, load it synchronously in `<head>` if the theme should
be applied before first paint.

## Using Icons

Serve `src/icons/icons.svg` as a static asset in the consuming application.
Copy it into the application's public assets directory (for example
`assets/nicolabz/icons.svg`) and reference its URL from any framework or plain
HTML:

```html
<svg class="nz-icon" aria-hidden="true">
  <use href="/assets/nicolabz/icons.svg#search"></use>
</svg>
```

The curated sprite contains 40 icons: `activity`, `arrow-down`, `arrow-left`,
`arrow-right`, `arrow-up`, `bell`, `calendar`, `check`, `chevron-down`,
`chevron-left`, `chevron-right`, `chevron-up`, `circle-alert`, `circle-check`,
`circle-help`, `circle-x`, `clipboard`, `clock`, `code`, `copy`, `download`,
`external-link`, `eye`, `file`, `filter`, `heart`, `house`, `info`, `link`,
`lock`, `mail`, `menu`, `moon`, `pencil`, `plus`, `search`, `settings`,
`shield`, `sun`, and `user`.

Icons inherit `currentColor`. `.nz-icon` defaults to 20px; `.nz-icon-sm` and
`.nz-icon-lg` use 16px and 24px. Decorative icons should use
`aria-hidden="true"`. Give a meaningful standalone icon an accessible name:

```html
<svg class="nz-icon" role="img" aria-labelledby="search-icon-title">
  <title id="search-icon-title">Search</title>
  <use href="/assets/nicolabz/icons.svg#search"></use>
</svg>
```

No icon runtime or framework wrapper is required. Native `<svg>` and `<use>`
work in HTML, Angular, React, Vue, Eleventy, and other environments that serve
the sprite and allow same-origin SVG references.

## Components and Accessibility

Use the `nz-` prefix for new integrations. The component catalog is
[`tokens/components.json`](../tokens/components.json), and examples are shown
in the [component gallery](../demo/index.html). Associate form labels with
their controls, use native `disabled` and `readonly` attributes, and connect
validation messages using `aria-invalid` and `aria-describedby`.

## Development

Node.js 18+ is required. `lucide-static` is a development dependency used only
to generate the curated sprite and is not required by consuming applications.

```sh
npm install
npm run build          # Generate theme tokens and the Lucide sprite
npm run build:icons    # Regenerate the sprite and copy its license
npm run check          # Check generated assets without writing files
npm test               # Run the test suite
```

To add an icon, update the explicit allowed-name list in
[`scripts/build-icons.js`](../scripts/build-icons.js), then run
`npm run build:icons`. The generated `src/icons/icons.svg` and
`src/icons/LICENSE` must not be edited manually. Lucide attribution and license
terms are retained in the generated sprite and [`src/icons/LICENSE`](../src/icons/LICENSE).

## Limitations

Native select option menus and external SVG `<use>` references have browser and
deployment-specific behavior. Serve the sprite from the application's origin
and test in the target browsers. The gallery demonstrates local interactions
only; the design system does not provide application backends or
framework-specific components.
