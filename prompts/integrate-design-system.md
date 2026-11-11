> **MANUAL EXECUTION ONLY**
>
> This document is a reusable prompt, not a permanent project rule.
> AI agents must not execute it unless explicitly requested by the user.

# Nicolabz Design System Integration

**Repository:** https://github.com/Diuxx/nicolabz-design-system

## 1. Analyze

Before modifying the project:

- Identify the frontend stack, architecture, and styling conventions.
- Review the design system's `README.md`, `AGENTS.md`, `docs/PROJECT.md`, `docs/DESIGN.md`, `tokens/components.json`, `package.json`, and available CSS/JS resources.
- Inspect `demo/` for visual references.
- Verify the actual package name, exports, and available Git versions.
- Never invent components, tokens, or unsupported features.

## 2. Install Appropriately

Choose the simplest maintainable integration method:

- **Node.js application with frontend:** Prefer an npm dependency, installed from a registry or a pinned Git tag/commit.
- **Static HTML page:** Include local CSS/JS assets directly. Avoid unnecessary npm tooling.
- **Angular, React, Vue, or other frameworks:** Use the framework's existing dependency, build, and styling mechanisms.
- **Eleventy or static site generators:** Prefer npm when already available and use native asset-copying mechanisms.
- **SSR applications:** Load browser-dependent scripts only in the browser.

Avoid runtime dependencies on remote GitHub files, unnecessary copying, and duplicate styles.

Document installation and update procedures.

## 3. Reuse Components First

**Always prefer existing Nicolabz components over custom implementations.**

- Consult `tokens/components.json` before creating UI elements.
- Use public CSS classes prefixed with `nz-`.
- Never use deprecated, unprefixed aliases in new code.
- Reuse existing variants, states, typography, spacing, colors, and decorations.
- Do not invent public `nz-*` components or variants.
- Keep application-specific styles local.
- Use design tokens instead of hardcoded values.

If a required component is missing, compose existing components where possible. Otherwise, implement it locally and report the limitation.

## 4. Migrate the UI

Apply the design system consistently:

- Light and dark color palettes.
- Buttons, forms, panels, badges, and navigation.
- Typography, spacing, borders, and radii.
- Focus, disabled, loading, and validation states.
- Responsive and accessible layouts.
- Optional Soft Spectrum decoration using `decorations.css`.

Preserve existing functionality, business logic, API contracts, and user workflows.

Do not rewrite the frontend or introduce unnecessary dependencies.

## 5. Theme Management

Reuse the existing theme mechanism:

- `data-theme="light|dark"` on `<html>`.
- System preference detection.
- Persistent user selection.
- Accessible theme toggle.
- Early initialization to minimize theme flashing.

Use `window.nicolabzTheme` when available.

Avoid duplicate theme managers or multiple script initializations.

## 6. Validate

Verify:

- Successful asset imports and builds.
- Existing functionality and interactions.
- Light/dark themes.
- Responsive behavior.
- Keyboard accessibility and contrast.
- Correct `nz-*` usage.
- CSS conflicts and duplication.
- Available automated tests.

Never claim checks were performed unless actually executed.

## 7. Required Final Report

After implementing the integration, provide:

1. **Integration:** Detected stack, installed design system version, integration method, modified files, and update command.
2. **Reused components:** List Nicolabz components integrated into the application.
3. **Validation:** Tests performed, results, and unverified areas.
4. **Missing components and limitations:** End with this table.

| Missing component | Application need | Current workaround | Suggested addition | Priority |
|---|---|---|---|---|
| Example: Dialog | Confirmation | Existing local component | Add `nz-dialog` | Medium |

Include only verified gaps. If none exist, explicitly state that.

**Success criteria:** Preserve functionality, maximize design system reuse, follow framework conventions, minimize duplication, and document every remaining limitation.