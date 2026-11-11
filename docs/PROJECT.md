# Project — Nicolabz Design System

## 1. Overview

Nicolabz Design System is a lightweight, framework-agnostic design system providing reusable themes, styles, and components across multiple applications.

Its visual identity follows the **Minimalist Monochrome UI / Soft Spectrum** aesthetic.

The goal is to ensure visual consistency, simplicity, accessibility, and maintainability without introducing unnecessary dependencies.

## 2. Architecture

The project is organized around centralized design tokens and reusable styles.

- `tokens/palette.json` — Single source of truth for theme colors and design tokens.
- `scripts/build-tokens.js` — Generates CSS variables from the token definitions.
- `src/styles/theme.css` — Generated CSS variables. Never edit manually.
- `src/styles/components.css` — Shared component styles.
- `src/styles/typography.css` — Typography definitions.
- `src/theme.js` — Light and dark theme management.
- `docs/DESIGN.md` — Visual identity and design guidelines.
- `docs/RESUME.md` — Concise architectural summary.

## 3. Design Guidelines

For any interface creation or modification:

- Read and follow [DESIGN.md](DESIGN.md).
- Preserve the existing Minimalist Monochrome UI aesthetic.
- Support both light and dark themes.
- Reuse existing design tokens, components, and styles.
- Prefer simple, accessible, and responsive interfaces.
- Do not introduce new visual styles or UI dependencies without clear justification.
- Follow existing project conventions and architecture.

## 4. Design Tokens

`tokens/palette.json` is the **single source of truth** for design values.

- Never duplicate existing colors or design tokens.
- Never hardcode values when an appropriate token exists.
- Never override global design tokens locally in consuming applications.
- Modify `tokens/palette.json` to change global design values.
- Run `npm run build` to regenerate `src/styles/theme.css`.
- Never manually edit generated files.
- Keep light and dark themes consistent.

Documentation should reference design tokens rather than duplicate their values.

## 5. Design System Integration

- Reuse existing styles and components before creating new ones.
- Keep application-specific business styles within their respective applications.
- Make global design system changes only in the `nicolabz-design-system` repository.
- Preserve compatibility with existing applications.
- Avoid unnecessary dependencies and framework-specific implementations.
- Follow [integrate-design-system.md](../prompts/integrate-design-system.md) when integrating the design system into another project.

## 6. Development Guidelines

- Follow the general programming principles defined in `AGENTS.md`.
- Keep changes focused, simple, and maintainable.
- Preserve existing behavior unless explicitly requested otherwise.
- Update `docs/RESUME.md` when meaningful architectural changes occur.
- Use the project's existing build and testing commands to verify relevant changes.
- Do not modify generated files or unrelated documentation.


## Component Catalog

The design system maintains a centralized component catalog:

- `tokens/components.json` — Inventory of available UI components.
- `src/styles/components.css` — Actual component implementations.

### Rules

- Read `tokens/components.json` before creating UI components.
- Reuse existing components and variants whenever possible.
- Inspect the referenced CSS implementation before using a component.
- Never invent component variants that are not implemented.
- Keep the catalog synchronized with actual CSS implementations.
- Update the catalog when components or variants are added, changed, or removed.
- Do not duplicate existing components.
- Keep application-specific components outside the shared design system.


## Demo Maintenance

`demo/demo.html` is the reference showcase for the design system.

It must accurately reflect the current components, themes, and supported behaviors.

### Rules

- Update `demo/demo.html` whenever a change affects the design system's visual appearance, components, variants, or interactions.
- Demonstrate new components and variants when they are introduced.
- Update or remove examples when components are modified or deprecated.
- Ensure all examples use existing design tokens and component styles.
- Keep light and dark theme demonstrations functional.
- Reuse the actual design system assets instead of duplicating their styles.
- Keep the demo simple, readable, and independent of unnecessary dependencies.
- Do not modify the demo for changes that have no visible or behavioral impact.

### Verification

After relevant changes:

1. Regenerate assets using `npm run build` when required.
2. Verify that the demo references the current styles and scripts.
3. Check that affected components and interactions are represented correctly.
4. Verify that both light and dark themes remain consistent.
5. Report any checks that could not be performed.

