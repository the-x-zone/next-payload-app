# CSS Architecture

This project uses **CSS Modules** with **Tailwind `@apply`** and **CSS custom properties with defaults** for component styling.

## Rules

### 1. No inline utility soup in JSX

```tsx
// ❌ Don't
<div className="flex items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm" />

// ✅ Do
<div className={styles.input} />
```

### 2. One CSS Module per component directory

Every component that needs styles gets a co-located `.module.css` file:

```
src/components/Card/
├── index.tsx
└── card.module.css
```

### 3. Use `@apply` for layout and typography utilities

```css
.card {
  @apply rounded-lg overflow-hidden border border-border;
}
```

Use `@apply` for things that don't change: layout, spacing, typography, border-radius.

### 4. Use CSS custom properties for theming and variants

Use the **pseudo-private variable pattern** (`--_var`) for component-level defaults:

```css
.card {
  --_bg: var(--card-bg, var(--color-card));   /* --card-bg is the override hook */

  background-color: var(--_bg);
}

/* Variant: override just the hook */
.card--featured {
  --card-bg: var(--color-primary);
}
```

The inner `--_bg` reads from a public hook (`--card-bg`) with a fallback. Consumers can override the hook without knowing the internal variable.

### 5. Use `@property` for animatable properties

When a custom property needs to animate or requires type safety:

```css
@property --card-bg {
  syntax: '<color>';
  inherits: false;
  initial-value: transparent;
}
```

### 6. Use `cn()` only for dynamic class selection

`cn()` is for runtime conditional logic only — not for composing static utilities:

```tsx
// ✅ Dynamic variant selection
<div className={cn(styles.card, featured && styles['card--featured'], className)} />

// ❌ Don't use cn() to avoid writing CSS
<div className={cn('flex items-center', 'gap-2', 'rounded-md')} />
```

### 7. Modifier classes follow BEM naming

```css
.card           /* block */
.card__body     /* element */
.card--featured /* modifier */
```

---

## New component template

```css
/* my-component.module.css */

@property --my-component-bg {
  syntax: '<color>';
  inherits: false;
  initial-value: transparent;
}

.my-component {
  --_bg: var(--my-component-bg, var(--color-card));

  @apply rounded-md border;
  background-color: var(--_bg);
}

.my-component__body {
  @apply p-4;
}

.my-component--variant {
  --my-component-bg: var(--color-primary);
}
```

```tsx
// MyComponent/index.tsx
import { cn } from '@/utilities/ui'
import styles from './my-component.module.css'

export function MyComponent({ variant, className }: Props) {
  return (
    <div className={cn(styles['my-component'], variant && styles[`my-component--${variant}`], className)}>
      <div className={styles['my-component__body']}>...</div>
    </div>
  )
}
```

---

## What stays as-is

- `src/components/ui/*` — these are the base UI primitives, already using this pattern
- `src/app/(frontend)/globals.css` — global theme tokens, base reset, typography
- `src/app/(payload)/custom.scss` — Payload admin overrides (keep as SCSS)
- Third-party component wrappers (Radix UI) — style via their data attributes in CSS Modules

---

## Packages

| Package | Status | Reason |
|---------|--------|--------|
| `tailwindcss` | ✅ Keep | Utility source for `@apply` |
| `tailwind-merge` + `clsx` | ✅ Keep | Powers `cn()` for dynamic class logic |
| `@radix-ui/react-select` | ✅ Keep | Accessible dropdown primitive |
| `@radix-ui/react-checkbox` | ✅ Keep | Accessible checkbox primitive |
| `class-variance-authority` | ❌ Removed | Replaced by CSS custom properties |
| `@radix-ui/react-slot` | ❌ Removed | Was only used for `asChild` pattern |
| `@radix-ui/react-label` | ❌ Removed | Native `<label>` is sufficient |
