# Design System

## Brand Color

`oklch(0.48 0.035 265)` — Pizarra apagada (slate muted), el ancla cromática. De él se deriva toda la paleta. Acento complementario: `oklch(0.58 0.07 30)` — terracota mate muy sutil.

## Palette (Light Mode)

| Token | Value | Description |
|---|---|---|
| `--background` | `oklch(0.985 0.003 250)` | Blanco roto con tinte azul pizarra imperceptible |
| `--foreground` | `oklch(0.15 0.01 260)` | Texto principal, pizarra oscura (no negro puro) |
| `--card` | `oklch(0.995 0.002 250)` | Casi blanco, mínima temperatura fría |
| `--card-foreground` | `oklch(0.15 0.01 260)` | Igual que foreground |
| `--popover` | `oklch(0.995 0.002 250)` | Igual que card |
| `--primary` | `oklch(0.48 0.035 265)` | Pizarra apagada — el color de marca |
| `--primary-foreground` | `oklch(0.98 0.002 250)` | Blanco casi puro sobre primary |
| `--secondary` | `oklch(0.93 0.008 255)` | Azul grisáceo muy claro |
| `--secondary-foreground` | `oklch(0.25 0.015 260)` | Pizarra oscura sobre secondary |
| `--muted` | `oklch(0.96 0.005 250)` | Fondo tenue |
| `--muted-foreground` | `oklch(0.5 0.015 255)` | Texto secundario |
| `--accent` | `oklch(0.58 0.07 30)` | **Terracota mate** — el complemento cálido mínimo |
| `--accent-foreground` | `oklch(0.98 0.002 250)` | Blanco sobre accent |
| `--destructive` | `oklch(0.52 0.14 27)` | Rojo apagado |
| `--border` | `oklch(0.89 0.008 255)` | Borde sutil |
| `--input` | `oklch(0.93 0.008 255)` | Input, ligeramente más visible que border |
| `--ring` | `oklch(0.48 0.035 265)` | Focus ring = primary |

## Palette (Dark Mode)

| Token | Value | Description |
|---|---|---|
| `--background` | `oklch(0.14 0.01 265)` | Pizarra muy oscura |
| `--foreground` | `oklch(0.93 0.005 255)` | Texto claro con tinte frío |
| `--card` | `oklch(0.17 0.012 263)` | Un tono más claro que background |
| `--card-foreground` | `oklch(0.93 0.005 255)` | Igual que foreground |
| `--popover` | `oklch(0.19 0.012 263)` | Más claro que card |
| `--primary` | `oklch(0.65 0.035 265)` | Pizarra más claro para dark mode |
| `--primary-foreground` | `oklch(0.15 0.01 260)` | Oscuro sobre primary |
| `--secondary` | `oklch(0.22 0.015 260)` | Fondo secundario oscuro |
| `--secondary-foreground` | `oklch(0.88 0.008 255)` | Texto claro |
| `--muted` | `oklch(0.19 0.01 260)` | Fondo tenue oscuro |
| `--muted-foreground` | `oklch(0.55 0.015 255)` | Texto secundario |
| `--accent` | `oklch(0.65 0.07 30)` | Terracota mate para dark |
| `--accent-foreground` | `oklch(0.15 0.01 260)` | Oscuro sobre accent |
| `--destructive` | `oklch(0.58 0.14 27)` | Rojo apagado |
| `--border` | `oklch(0.22 0.01 260)` | Borde oscuro |
| `--input` | `oklch(0.25 0.01 260)` | Input oscuro |
| `--ring` | `oklch(0.65 0.035 265)` | Focus ring = primary dark |

## Claymorphism System (Subtle)

Basado en tres principios: **sombras suaves, bordes generosos, profundidad mínima.**

### Card elevation
- **Card default**: `box-shadow: 0 2px 8px oklch(0 0 0 / 0.04), 0 1px 3px oklch(0 0 0 / 0.06)` (sutil, como papel sobre papel)
- **Card hover**: `box-shadow: 0 4px 16px oklch(0 0 0 / 0.06), 0 2px 6px oklch(0 0 0 / 0.08)` (levanta un poco)
- **Card inset**: `box-shadow: inset 0 1px 0 oklch(1 1 1 / 0.6), inset 0 -1px 0 oklch(0 0 0 / 0.04)` (sutil borde interno que infla)

### Border radius scale
- `--radius-xs`: `0.375rem` (6px)
- `--radius-sm`: `0.5rem` (8px)
- `--radius`: `0.75rem` (12px) — el default, más generoso que el estándar 0.625rem
- `--radius-md`: `1rem` (16px)
- `--radius-lg`: `1.25rem` (20px)
- `--radius-xl`: `1.5rem` (24px)
- `--radius-2xl`: `2rem` (32px)

### Button clay
- Botón primary: fondo primary con `box-shadow: 0 2px 0 oklch(0 0 0 / 0.1), inset 0 1px 0 oklch(1 1 1 / 0.2)` (efecto de botón inflado)
- Botón primary hover: desplazar la sombra exterior: `box-shadow: 0 3px 0 oklch(0 0 0 / 0.12)`
- Botón active: `box-shadow: inset 0 2px 4px oklch(0 0 0 / 0.15)` (presionado)

### Input clay
- Input default: `box-shadow: inset 0 2px 4px oklch(0 0 0 / 0.04)`
- Input focus: `box-shadow: 0 0 0 2px var(--ring), inset 0 2px 4px oklch(0 0 0 / 0.04)`

### Glass accent (modals, sheets, header overlays)
- `background: oklch(from var(--background) l c h / 0.75)` (75% de opacidad del bg)
- `backdrop-filter: blur(12px)`
- `-webkit-backdrop-filter: blur(12px)`
- Borde superior sutil: `box-shadow: inset 0 1px 0 oklch(1 1 1 / 0.15)` (highlight glass)

## Typography

Mantener **Geist Sans** como font principal. Añadir jerarquía:

| Element | Size | Weight | Line Height |
|---|---|---|---|
| h1 (page title) | `text-3xl` (1.875rem) | `font-semibold` | `leading-tight` |
| h2 (section) | `text-xl` (1.25rem) | `font-semibold` | `leading-snug` |
| h3 (card title) | `text-base` (1rem) | `font-medium` | `normal` |
| Body | `text-sm` (0.875rem) | `font-normal` | `relaxed` (1.625) |
| Small | `text-xs` (0.75rem) | `font-normal` | `normal` |

- `h1` con `text-wrap: balance`
- Límite de línea: 65-75ch para párrafos
- Sin tracking exagerado (ni uppercase eyebrows genéricos)

## Layout

- Sidebar: 240px fijo en desktop, colapsable/overlay en mobile
- Content padding: `p-6` en desktop, `p-4` en mobile
- Grid de cards: `repeat(auto-fill, minmax(300px, 1fr))` con gap de 1.25rem
- Separación entre secciones: `space-y-6`

## Component Design Rules

- **Cards**: Borde inflado sutil (el `box-shadow: inset`), esquinas `--radius` (12px), sin border-color visible a menos que sea hover/active
- **Botones**: Altura base 40px (h-10), padding horizontal generoso, clay shadow
- **Inputs**: Altura 40px, clay inset sutil, borde sutil, focus ring con el color primary
- **Badges**: Bordes redondeados grandes (pill), con subtle clay
- **Avatar con badge de estado**: Pequeño punto de color que indica estado

## Motion

| Type | Duration | Easing |
|---|---|---|
| Hover | 150ms | ease-out |
| Enter (cards, dialogs) | 200ms | ease-out |
| Page transitions | 250ms | ease-out |
| Reduce motion | 0ms | instant |

- Prefer `opacity` y `transform` para animaciones (nunca layout properties)
- Dialog/sheet: fade + subtle scale (95% → 100%)
- Sidebar hover items: cambio de background con transición
- `prefers-reduced-motion: reduce` → todas las animaciones a 0ms o instant

## Charts (token placeholders para dashboard)

Mantener la escala de 5 colores pero reemplazar los grises por tonos de la paleta:
- chart-1: primary
- chart-2: accent (coral)
- chart-3: oklch(0.6 0.12 200) — teal
- chart-4: oklch(0.7 0.15 80) — amarillo suave
- chart-5: oklch(0.5 0.1 300) — lavanda
