
## 2. Themes

The design system supports both light and dark themes.

All theme colors and design values are defined in
[`tokens/palette.json`](../tokens/palette.json).

This file is the single source of truth for design tokens.

### Light Mode — Soft Spectrum

- Clean, warm, and minimal backgrounds.
- High-contrast typography.
- Subtle borders and neutral surfaces.
- Dark primary buttons with light text.
- Optional soft, blurred, multicolored organic background decoration.

Decorative elements must remain behind all content.

### Dark Mode — Graphite Sage

- Deep graphite backgrounds.
- Subtle surface contrast.
- Soft, readable typography.
- Muted sage accents.
- No prominent gradients or excessive visual effects.

### Rules

- Never duplicate color values in documentation.
- Always use existing semantic design tokens.
- Keep both themes visually consistent.
- Modify `tokens/palette.json` for global color changes.
- Never manually edit generated `src/styles/theme.css`.

## Spacing & Visual Rhythm

**Spacing is essential to visual consistency and readability.**

- Maintain balanced, natural spacing between all UI elements.
- Use existing `--space-*` tokens instead of arbitrary values.
- Keep related elements close together and separate distinct sections with more space.
- Preserve consistent alignment, padding, and gaps across components.
- Avoid cramped layouts, excessive whitespace, and uneven spacing.
- Keep form fields and labels visually grouped.
- Align action buttons horizontally with consistent gaps when space allows.
- Apply a clear visual hierarchy through spacing, not excessive borders.
- Adapt spacing responsively without compromising readability.

**Rule:** Every layout must feel visually balanced, breathable, and easy to scan. Review spacing and alignment before considering a component complete.