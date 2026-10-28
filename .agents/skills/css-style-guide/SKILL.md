---
name: css-style-guide
description: "Comprehensive CSS visual style guide covering 54+ design styles across 11 families. Use when generating web applications, landing pages, or UI components that need a specific visual identity. Covers philosophy, color palettes, typography, layout, animations, CSS variables, and anti-patterns for each style."
license: MIT (See LICENSE.md)
metadata:
  author: Pablo Gabriel Mederos (https://github.com/pablomederos)
---

# CSS Style Guide

Apply predefined visual styles to web projects. This skill provides a library of 54+ documented design styles, each with complete implementation guidance: color palette, typography, layout architecture, animations, CSS variables, and anti-patterns.

## Style Families

| # | Family | Styles | Reference |
|---|---|---|---|
| I | Minimalist | Minimalism, Flat, Swiss, Functional, Whitespace-First | [01-minimalist.md](references/01-minimalist.md) |
| II | Maximalist | Maximalism, Cluttercore, Memphis, Psychedelic | [02-maximalist.md](references/02-maximalist.md) |
| III | Editorial & Typographic | Editorial, Type-first, Brutalist Typography, Magazine | [03-editorial-typographic.md](references/03-editorial-typographic.md) |
| IV | Dark & Dramatic | Dark Mode UI, Gothic, Noir, Horror/Occult | [04-dark-dramatic.md](references/04-dark-dramatic.md) |
| V | Futuristic & Tech | Cyberpunk, Sci-Fi/Space UI, Tech/SaaS Modern | [05-futuristic-tech.md](references/05-futuristic-tech.md) |
| VI | Organic & Natural | Biomorphic, Earthy, Botanical, Wabi-Sabi | [06-organic-natural.md](references/06-organic-natural.md) |
| VII | Retro & Vintage | Pixel Art, Synthwave, Y2K, Grunge | [07-retro-vintage.md](references/07-retro-vintage.md) |
| VIII | Luxury & Premium | High-end, Haute Couture, Jewelry, Corporate Prestige | [08-luxury-premium.md](references/08-luxury-premium.md) |
| IX | Interface | Glassmorphism, Neumorphism, Claymorphism, Material, Fluent, Brutalism, Anti-Design, Data Viz | [09-interface.md](references/09-interface.md) |
| X | Artistic & Cultural | Bauhaus, Constructivism, Surrealism, Pop Art, Japanese Min., Art Nouveau, Art Deco | [10-artistic-cultural.md](references/10-artistic-cultural.md) |
| XI | Playful & Creative | Cartoon, Kawaii, Doodle, Sticker/Collage, Paper Cut | [11-playful-creative.md](references/11-playful-creative.md) |

For the full catalog with emotions and sectors, see [style-catalog.md](references/style-catalog.md).

## Style Selection Guide

Match the project to a style using these criteria:

| If the project needs... | Consider families |
|---|---|
| Clean, professional, content-focused | I (Minimalist), III (Editorial) |
| Rich, sensory, brand-heavy | II (Maximalist), VIII (Luxury) |
| Dark background, tech-oriented | IV (Dark), V (Futuristic) |
| Warm, organic, sustainable brand | VI (Organic & Natural) |
| Nostalgic, retro vibes | VII (Retro & Vintage) |
| Specific UI paradigm (glass, clay, etc.) | IX (Interface) |
| Cultural/artistic identity | X (Artistic & Cultural) |
| Fun, young, informal | XI (Playful & Creative) |

When the user specifies a style by name, go directly to the corresponding reference file. When the request is vague (e.g., "make it look premium"), use the catalog to propose 2-3 candidate styles with rationale.

## Implementation Workflow

Once a style is selected, read its full reference document and apply in this order:

### 1. CSS Variables Foundation
Extract the style's CSS custom properties (every reference doc has a variables section). Set them in `:root` or a scoped selector. These variables define the entire visual system.

### 2. Color Palette
Apply the documented palette. Each style specifies:
- Background colors (base, surface, raised)
- Text hierarchy (primary, secondary, tertiary)
- Accent colors and their usage rules
- Forbidden colors (listed in anti-patterns)

### 3. Typography
Implement the documented type system:
- Font families (display, body, mono) — use Google Fonts equivalents when custom fonts are unavailable
- Type scale (sizes, weights, line-heights, letter-spacing)
- Hierarchy rules (what level gets what treatment)

### 4. Layout & Spacing
Follow the style's structural patterns:
- Grid system (columns, gutters, max-widths)
- Spacing scale (if documented)
- Component-specific layout rules

### 5. Components
Build UI elements following the style's component guidance:
- Buttons (primary, secondary, ghost — including hover/focus/disabled states)
- Cards and containers (border-radius, shadows, borders)
- Navigation patterns
- Form elements

### 6. Animations & Motion
Apply the documented animation system:
- Entrance animations (type, duration, easing)
- Hover/interaction feedback
- Scroll-triggered effects
- Always implement `prefers-reduced-motion` fallbacks

### 7. Anti-Pattern Validation
Every reference doc ends with an anti-patterns section. After implementation, check the output against these rules. Each NUNCA/NEVER rule is a hard constraint.

## Common Structure of Reference Documents

Every style reference follows this anatomy (useful for navigating large files):

1. **Header table** — style name, philosophy, referents, emotion, sectors
2. **Visual philosophy** — structural elements, design principles
3. **Color palette** — hex values, roles, combination rules
4. **Typography** — font recommendations, scale, techniques
5. **Implementation architecture** — CSS techniques (no raw code, conceptual)
6. **Animations** — table of animations with duration and technique
7. **CSS Variables** — ready-to-use custom properties
8. **Anti-patterns** — hard constraints, what to NEVER do

## Combining Styles

Styles can be combined when documented sub-variants exist (e.g., Dark Mode + any other style). Rules:
- One dominant style, one accent style maximum
- The dominant style provides the color palette and layout
- The accent style contributes specific components or textures
- Never combine opposing philosophies (Minimalism + Maximalism)
- Check anti-patterns of both styles — if they conflict, the dominant style wins
