## Overview

TalentShare Admin reads like a long-running operations console crossed with a consumer-marketplace product page. The whole system sits on **pure white** (`{colors.canvas}` — `#FFFFFF`) with thin light bands (`{colors.cloud}` / `{colors.fog}`) for alternating section rhythm. There is one chromatic action color — **Primary Purple** (`{colors.primary}` — `#7B2CBF`) — and one ink color (`{colors.ink}` — `#22223B`); together they do ninety percent of the work. Type is a single family across every surface: **Manrope**, set at weight 500 for headlines and 400 for body — clean, neutral, slightly mechanical.

The signature gesture is **angular purple chevrons** — sharp 0-radius slashes derived from the brand's directional energy — that anchor the login hero card. They appear on the left and right edges of the primary banner card, layered behind the form panel. Outside those decorative slashes, every other surface is rectilinear with **soft 16px corners** on cards and a **4px corner** on buttons.

The system breaks into three voice modes: a **white commercial body** for data browsing (cards, tables, filters); a **dark ink slab** (`{colors.ink-slab}` — `#3A1252`) for the sidebar, utility strip, closing emphasis banners, and login credentials panel; and a **light cloud band** (`{colors.cloud}` / `{colors.fog}`) for utility groupings and FAQ-style accordions. The purple accent appears only on filled CTAs, link text, the chevron decorations, and the active nav indicator — never as a full-page background gradient.

**Key Characteristics:**
- Pure white canvas (`{colors.canvas}`) with deep ink text (`{colors.ink}`); light cloud/fog bands alternate for section rhythm
- Primary Purple (`{colors.primary}`) is the lone CTA fill and link color; it appears at most twice per viewport
- Manrope across every surface at weights 400 / 500 / 600 / 700
- Cards round at `{rounded.xl}` (16px); buttons sit at `{rounded.md}` (4px) with uppercase labels
- Angular purple chevrons (`{colors.primary}` rectangles cut at 45°) frame the login hero card
- Dark ink slabs (`{colors.ink-slab}`) carry the sidebar, utility strip, credentials panel, and closing banners
- Section rhythm: utility-strip → sidebar nav → white body → cloud-band → ink slab footer cards
- Real TalentShare logo: full wordmark on white surfaces; white monogram on ink slabs

## Logo Usage

- **Full logo** (`/talentshare-logo.png`): login card header, mobile top bar. White surfaces only.
- **Monogram** (`/logo.png`): favicon and compact mark on `{colors.ink-slab}` backgrounds (sidebar header tile).

## Colors

> Allowed sub-sections: Brand & Accent, Surface, Text, Semantic.

### Brand & Accent
- **Primary Purple** (`{colors.primary}` — `#7B2CBF`): the system's lone signal — primary CTA fill, link color, chevron-decoration fill, active sub-nav indicator. Reserved.
- **Bright Purple** (`{colors.primary-bright}` — `#A259E6`): lighter variant used inside dark slabs (dark-band CTA links, active nav underline) where the deeper purple would muddy.
- **Primary Dark** (`{colors.primary-deep}` — `#5F1E8A`): pressed state for the primary CTA and visited-link color.
- **Soft Purple** (`{colors.primary-soft}` — `#E9D8FD`): pale-purple surface used inside selection chips and soft fills.
- **Magenta Accent** (`{colors.magenta}` — `#F72585`): sale-tag chips, highlight badges, featured tier accent.

### Surface
- **Canvas** (`{colors.canvas}` — `#FFFFFF`): the universal page background. White, full opacity.
- **Paper** (`{colors.paper}` — `#FFFFFF`): card surfaces — same white as canvas, with hairline borders or shadows providing the lift.
- **Cloud** (`{colors.cloud}` — `#F8F9FA`): the lightest gray section band, used for alternating-row backgrounds and feature card groups.
- **Fog** (`{colors.fog}` — `#F3F0FF`): a slightly tinted purple-gray band, used for FAQ outers and filter chip groups.
- **Steel** (`{colors.steel}` — `#D6BCFA`): hairline border used on outlined elements with stronger emphasis (focus states, active filter).
- **Hairline** (`{colors.hairline}` — `#EDE7F6`): 1px divider on cards, tables, inputs.

### Text
- **Ink** (`{colors.ink}` — `#22223B`): the universal text color on white surfaces — headlines, body, button labels, navigation.
- **Ink Slab** (`{colors.ink-slab}` — `#3A1252`): dark navy-purple used for sidebar, utility strip, and promo-strip-dark panels.
- **Ink Soft** (`{colors.ink-soft}` — `#4B176B`): alternate near-black used inside dark slabs as a subtle textural shift.
- **On Ink** (`{colors.on-ink}` — `#FFFFFF`): pure white used for headline and body text on every dark slab.
- **Charcoal** (`{colors.charcoal}` — `#565666`): muted body color on white surfaces — secondary descriptions.
- **Graphite** (`{colors.graphite}` — `#6C757D`): smaller-print color, used for legal lines and timestamp metadata.

### Semantic
- **Success** (`{colors.success}` — `#43E97B`, soft `#D6FBE6`, deep `#15803D`)
- **Info** (`{colors.info}` — `#4CC9F0`, soft `#D6F3FC`, deep `#0E7490`)
- **Warning** (`{colors.warn-soft}` — `#FFF1CC`, deep `#8A5A00`)
- **Danger** (`{colors.danger}` — `#F43F5E`, soft `#FFE2E8`, deep `#BE123C`)

## Typography

### Font Family

Single-family voice: **Manrope** across every surface. Weight 400 for body, 500 for display headlines, 600/700 for emphasis and button labels. Button labels lift to weight 600/700 with positive 0.5–0.7px letter-spacing and uppercase transform — the only place the system tracks letters.

### Hierarchy

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `{typography.display-xl}` | 44px | 500 | 1.0 | Page titles |
| `{typography.display-lg}` | 32px | 500 | 1.0 | Section headlines |
| `{typography.display-md}` | 24px | 500 | 1.17 | Card titles, metrics |
| `{typography.display-sm}` | 20px | 500 | 1.0 | Inline list headers |
| `{typography.body-md}` | 16px | 400 | 1.38 | Default body |
| `{typography.caption-md}` | 14px | 400 | 1.5 | Specs, metadata |
| `{typography.button-md}` | 14px | 600 | 1.4 | Button labels (uppercase, 0.7px tracking) |
| `{typography.caption-sm}` | 12px | 400 | 1.33 | Footnotes, utility strip |

### Principles

Headlines run at weight 500 — open and approachable. Emphasis is carried by weight, not opacity drops. Switch to `{colors.charcoal}` / `{colors.graphite}` for hierarchy.

## Layout

### Spacing System
- **Base unit**: 8px. Card padding 24px; section gap 32px; major band gap 80px on desktop.
- **Tokens**: `{spacing.xs}` 8 · `{spacing.md}` 16 · `{spacing.xl}` 24 · `{spacing.xxl}` 32 · `{spacing.section}` 80

### Grid & Container
- **Desktop max-width**: 1366px content container with full-bleed section backgrounds.
- **Sidebar**: fixed 288px ink slab on desktop.
- **Metric grid**: 3 columns ≥1280px, 2 on tablet, 1 on mobile.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | No border, no shadow | Section bands (white, cloud, fog), ink slabs |
| 1 — Hairline | 1px solid `{colors.hairline}` | Outlined buttons, FAQ accordion outers |
| 2 — Soft Lift | `0 2px 8px rgba(34, 34, 59, 0.08)` | Product cards, pricing tiles, tables |
| 3 — Floating Modal | `0 8px 24px rgba(34, 34, 59, 0.12)` | Drawers, mobile-nav sheet |

Depth is communicated by **color contrast** (cloud-band vs. white card) rather than heavy shadow.

### Decorative Depth

The system's most distinctive depth gesture is the **purple chevron pair** — two angular `{colors.primary}` slashes (no radius, no shadow) flanking the login hero card. Treat them as a brand artifact, not generic geometric noise.

## Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Chevron decorations |
| `{rounded.md}` | 4px | Primary buttons, secondary buttons, text inputs |
| `{rounded.lg}` | 8px | Badge pills, category-icon cards, list rows |
| `{rounded.xl}` | 16px | Product cards, photo frames, table containers |
| `{rounded.pill}` | 9999px | Category sub-nav tabs, filter chips |

**Two-tier philosophy**: buttons stay sharp (4px) while cards stay soft (16px).

## Components

### Buttons
- **`button-primary`** — bg `{colors.primary}`, text `{colors.on-ink}`, uppercase `{typography.button-md}`, padding 12×24, height 44px, rounded `{rounded.md}`
- **`button-primary-pressed`** — bg `{colors.primary-deep}`
- **`button-ink`** — bg `{colors.ink-slab}`, text white, same dimensions
- **`button-outline`** — white bg, `{colors.primary}` text, 1px `{colors.primary}` border
- **`button-outline-ink`** — white bg, `{colors.ink}` text, 1px `{colors.ink}` border
- **`button-text-link`** — inline `{colors.primary}` link with underline

### Cards & Containers
- **`card-product`** — white bg, rounded `{rounded.xl}`, padding 24px, Soft Lift shadow
- **`card-product-feature`** — `{colors.cloud}` bg, rounded `{rounded.xl}`, padding 32px
- **`promo-strip-dark`** — `{colors.ink-slab}` bg, white text, rounded `{rounded.xl}`, padding 32px

### Inputs & Forms
- **`text-input`** — white bg, 1px `{colors.steel}` border (→ `{colors.ink}` on focus), rounded `{rounded.md}`, height 44px
- **`badge-pill-outline`** — white bg, `{colors.ink}` text, 1px border, rounded `{rounded.lg}`
- **`badge-sale-magenta`** — `{colors.magenta}` bg, white text, for highlight tags

### Navigation
- **`utility-strip`** — `{colors.ink-slab}` bg, white text, height 36px, `{typography.caption-md}`
- **`nav-bar-side`** — `{colors.ink-slab}` sidebar, white text, active item draws 2px `{colors.primary-bright}` underline
- **`category-tab`** — pill; active = `{colors.ink-slab}` fill + white text; idle = white + `{colors.ink}`

### Signature Components
- **`chevron-decoration`** — `{colors.primary}` parallelogram slashes flanking hero cards; hero-only
- **`faq-row`** — white bg, rounded `{rounded.lg}`, 1px `{colors.hairline}` dividers
- **`footer-dark`** — `{colors.ink-slab}` closing band

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` for the primary CTA, link color, and chevron motif — at most twice per viewport
- Set headlines in Manrope at weight 500 with line-height 1.0
- Use `{rounded.xl}` for cards; `{rounded.md}` for buttons and inputs
- Pair white body bands with `{colors.cloud}` alternating bands
- Close page rhythm with a dark `{colors.ink-slab}` slab
- Set button labels uppercase with `{typography.button-md}` tracking
- Use Soft Lift shadow exclusively for cards and tables

### Don't
- Don't flood viewports with purple gradients — ink slabs and flat purple CTAs only
- Don't round buttons above 4px
- Don't use chevrons as inline noise; hero/login only
- Don't drop ink text opacity for hierarchy — use charcoal/graphite
- Don't place the full color logo on ink slabs

## Responsive Behavior

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | Single column; hamburger-style top bar; chevrons hidden |
| Tablet | 640–1023px | 2-column grids; chevrons at ~60% size |
| Desktop | ≥ 1024px | Fixed ink sidebar; 1366px max-width; full chevrons |

- **Chevrons**: shrink on tablet, disappear on mobile
- **Sidebar**: ink slab on desktop; white top bar + chip nav on mobile
- **Touch targets**: 44×44px minimum on mobile

## Iteration Guide
1. Reference component names and tokens directly — do not paraphrase to hex in prose
2. Keep `{colors.primary}` scarce — at most two flame elements per viewport
3. Surface vocabulary: `{colors.canvas}` / `{colors.cloud}` / `{colors.fog}` / `{colors.ink-slab}`
4. Add variants as separate entries (`-pressed`, `-disabled`, `-focused`)
