# Design

## Theme

"Biscayne Night." Vera-Clinic-inspired (similar, not identical): blue-black night ground for hero/footer/results bands, bright cyan CTAs, royal blue drench sections, pure white clinical content sections. Bold Archivo 800 headlines.

## Color Palette (OKLCH)

| Token | Value | Role |
|---|---|---|
| `--bg` | `oklch(100% 0 0)` | Body background (pure white) |
| `--ink` | `oklch(21% 0.025 255)` | Primary text |
| `--ink-soft` | `oklch(42% 0.02 255)` | Secondary text |
| `--night` | `oklch(17% 0.035 255)` | Hero / footer / dark bands |
| `--night-2` | `oklch(23% 0.045 258)` | Raised surfaces on night |
| `--royal` | `oklch(38% 0.17 264)` | Royal blue drench (~#0E318F, Vera's contact blue) |
| `--cyan` | `oklch(72% 0.125 215)` | Bright CTA cyan (~#00B2DB); pairs with night text |
| `--cyan-deep` | `oklch(48% 0.105 220)` | Links + small cyan text on white (≥4.5:1) |
| `--ice` | `oklch(96.5% 0.012 220)` | Pale cyan-tinted panels |
| `--cream-on-dark` | `oklch(94% 0.008 230)` | Text on night |
| `--line` / `--line-dark` | 90% / 32% | Hairlines light / dark |

## Typography

Single family: **Archivo** (variable 400–900). Headlines 800, letter-spacing -0.022em. Body 400, labels 500–700. Fluid clamp() scale, ratio ≥1.25, hero ceiling 5rem.

## Motion

Motion library (vanilla UMD, `motion@11.13.5` via jsdelivr, global `window.Motion`) drives entrance reveals with spring physics (stiffness 110, damping 18). Trigger is position/scroll-based (not IntersectionObserver). Graceful fallback to CSS transitions when the CDN fails; everything visible without JS; `prefers-reduced-motion` disables all of it. `html.motion` class turns off the CSS transition so springs take over.

## Components

- Buttons: 10px radius (`btn-cyan` cyan/night-text, `btn-royal` royal/white), pill only for nav CTA. Hover swaps cyan↔royal.
- Services as editorial index rows; process as the one numbered sequence; before/after clip-path sliders (Before left, After right); filter pills (active = royal).

## Pages

`index.html`, `results.html`, `team.html` — shared header/footer, sticky translucent night header.
