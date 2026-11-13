# Usage and Integration

Nicolabz Design System provides shared CSS tokens and components, light and dark
themes, and a framework-independent Lucide SVG sprite. Interactive helpers have
no runtime dependencies and are optional. The package is private and is not
published to the public npm registry.

## Installation

Install a tagged release or commit from GitHub and keep the lockfile in the
consuming application:

```sh
npm install "github:Diuxx/nicolabz-design-system#REF"
```

Replace `REF` with a verified tag or commit SHA. The package exports
`theme.css`, `components.css`, `typography.css`, `decorations.css`, `icons.css`,
`icons.svg`, `theme.js`, and `components.js`.

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

The curated names are grouped in [`tokens/icons.json`](../tokens/icons.json);
all are shown in the component gallery.

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

### Alerts, dialogs and notifications

Combine `.nz-alert` with `.nz-alert-info`, `.nz-alert-success`,
`.nz-alert-warning`, or `.nz-alert-error`. Include a text label so the meaning
does not depend on color. For dynamically inserted urgent errors, use an
appropriate live region; do not make every static alert assertive.

Use `<dialog class="nz-dialog" aria-labelledby="dialog-title">` with a visible
heading and open it with `showModal()`. A `<form method="dialog">` can provide
close and confirmation buttons; inspect `dialog.returnValue` in the `close`
event. For forms that submit data, validate and submit normally before closing
the dialog. Native modal behavior handles focus containment and Escape. Return
focus to the opening control if it is still available.

Load `components.js` as a browser script for its optional helpers:

```html
<script src="/assets/nicolabz/components.js" defer></script>
<div id="notifications" role="status" aria-live="polite" tabindex="-1"></div>
```

With a browser bundler, import `@nicolabz/design-system/components.js` instead.
This script attaches its API to `window` and must not run during server-side
rendering.

```js
const region = document.getElementById("notifications");
const dismiss = window.nicolabzComponents.showToast(region, "Saved", {
  duration: 0,
  dismissLabel: "Dismiss"
});
// Call dismiss() to remove it programmatically.
```

`duration` is in milliseconds; zero (the default) keeps the toast until
dismissed. The helper adds a dismissal button and treats the message as text.
Use a persistent toast for important information or actions so users have
enough time to read it. The live region must exist before a toast is inserted
and be focusable to receive focus if its dismissal button had focus.

### Form controls, loading and icon buttons

Buttons, form inputs, selects, tabs, and other shared controls use a 40px
minimum height, increasing to 44px for coarse pointers. The values come from
`--control-height` and `--control-touch-height`. Long text and larger fonts may
increase the rendered height.

Use `.nz-field-label` on a field label for consistent spacing. Fields in an
`.nz-form-panel` remain full width; add `.nz-form-panel-compact` to the panel
when a short field, such as a position selector, should use a narrower width.
Use `.nz-control-row` to align related controls and wrap them on small screens.

Use `<label class="nz-switch"><input type="checkbox" role="switch"> …</label>`
for a switch. Native checkbox state and `disabled` remain available. Use
`<input class="nz-radio" type="radio">` in a labelled `<fieldset>` with a
shared `name`. Use `.nz-choice` on a wrapping label to align a checkbox or
radio with its text and provide a larger interaction target. Native keyboard
and form behavior apply.

Place `.nz-spinner` inside a `.nz-loading` status with a text label and mark
the spinner `aria-hidden="true"`. The optional `.nz-spinner-sm` and
`.nz-spinner-lg` classes provide smaller and larger sizes. Mark decorative
`.nz-skeleton` placeholders as hidden from
assistive technology and provide a loading status. Reduced-motion preferences
disable spinner animation.

Combine `.nz-button`, a button variant, and `.nz-icon-button`; provide an
accessible name on the button and hide its decorative SVG from assistive
technology. Native `disabled` is supported.

### Tabs and disclosure controls

Tabs are progressively enhanced: before initialization all panels remain
visible. Provide uniquely identified buttons and panels as follows, then call
the helper once after inserting the markup:

```html
<div class="nz-tabs" id="settings-tabs">
  <div class="nz-tab-list" aria-label="Settings">
    <button class="nz-tab" id="tab-general" type="button" aria-controls="panel-general">General</button>
    <button class="nz-tab" id="tab-security" type="button" aria-controls="panel-security">Security</button>
  </div>
  <div class="nz-tab-panel" id="panel-general" tabindex="0">General settings</div>
  <div class="nz-tab-panel" id="panel-security" tabindex="0">Security settings</div>
</div>
```

```js
window.nicolabzComponents.initializeTabs(document.getElementById("settings-tabs"));
```

The helper sets tab roles and selection, hides inactive panels, and supports
Left/Right, Home and End. Set `aria-selected="true"` on the initial enabled tab
if it is not the first. Disabled tabs are skipped. Initialize only once per
element. The tab list needs an accessible label.

Use `<details class="nz-accordion"><summary>…</summary><div>…</div></details>`
for an accordion. A `.nz-dropdown` is also a native `<details>` disclosure with
a `<summary>` and a `.nz-dropdown-panel` containing ordinary links or buttons.
It is not an ARIA menu: use normal Tab navigation, not menu arrow-key behavior.
Call `initializeDropdown(details)` once to close it on Escape or an outside
click. The summary remains available without JavaScript.
Selecting an enabled action also closes the disclosure.

### Tables, pagination and tooltips

Wrap a `.nz-table` in a focusable `.nz-table-container` with `role="region"` and
an accessible label for keyboard scrolling, use a `caption`, and identify
header cells with `scope`. Use `.nz-pagination` on a
labelled `<nav>`, links for actual page URLs, and `aria-current="page"` for the
current page. Applications are responsible for fetching and rendering data.

For a tooltip, use a focusable trigger with `aria-describedby` referencing a
unique `.nz-tooltip-text` element with `role="tooltip"`, inside `.nz-tooltip`.
Call `initializeTooltip(container)` once to support dismissal with Escape.
Keep tooltip content short and non-interactive; essential information should
not be available only on hover. The tooltip also appears on keyboard focus and
can be toggled by activating the trigger.

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

To add an icon, update a group in
[`tokens/icons.json`](../tokens/icons.json), then run
`npm run build:icons`. The generated `src/icons/icons.svg` and
`src/icons/LICENSE` must not be edited manually. Lucide attribution and license
terms are retained in the generated sprite and [`src/icons/LICENSE`](../src/icons/LICENSE).

## Limitations

Native select option menus and external SVG `<use>` references have browser and
deployment-specific behavior. Serve the sprite from the application's origin
and test in the target browsers. Dialogs require native `<dialog>` support.
Tooltips and dropdowns do not automatically reposition near viewport edges.
The gallery demonstrates local interactions
only; the design system does not provide application backends or
framework-specific components.
