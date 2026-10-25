---
name: RoadKin
references: [nike, bmw-m]   # .claude/skills/design-md — base system Nike, geometry from BMW M
colors:
  ground: "#f4f4f3"          # --background (dark #0b0b0b)
  sheet: "#ffffff"           # --card (dark #161616)
  surface: "#e9e9e7"         # --surface / --muted, one tone step (dark #1f1f1f)
  ink: "#111111"             # --foreground
  muted-ink: "#5c5c5c"       # --muted-foreground (dark #b4b4b4), 6:1 on ground
  hairline: "#e2e2df"        # --border — tables, form fields and app panels only
  control: "#cfcfcb"         # --input
  hi-vis: "#ff5f0f"          # --primary — a FILL, always with ink on it (6.2:1)
  hi-vis-ink: "#c43d00"      # --primary-ink — orange as TEXT on light (5.2:1); dark #ff7a33
  night: "#111111"           # --secondary — the night-ride band in both modes
  community: "#1d4ed8"       # --ride-community
  organized: "#c43d00"       # --ride-organized
typography:
  display: { family: "Bebas Neue", case: upper, leading: 0.9, tracking: 0 }
  text: { family: "Manrope", weights: [400, 500, 600, 700, 800] }
  scale-landing: [16, 20, 32, "clamp(40px,4.6vw,76px)", "clamp(56px,9vw,150px)"]
  scale-app: { title: 32 (Bebas), section: 18/700, body: 15-16, meta: 13-14, small: 12 }
rounded: { base: 4px, sheet: 4-6px, avatar: full }
spacing: { gutter-mobile: 16px, gutter-desktop: 24-32px, landing-section: 160px, app-gap: 16px }
---

# RoadKin

## Overview

**Billboard above, catalogue below.** RoadKin borrows Nike's commerce discipline:
the photograph and one poster line carry all the emotion, and everything around
them (nav, lists, forms, chat) is reduced to quiet Manrope on flat stone and white.
From BMW M it takes the motorsport geometry: square corners, flat fills, bands that
alternate photo → spec table → photo.

What makes it RoadKin rather than either reference is **the road itself**:

- **The hi-vis orange** is a road-sign / safety-vest orange (`#ff5f0f`) with black
  ink on it — never white text, never a gradient, never a tint wash.
- **The milestone** — the Indian highway kilometre stone, white stone with a
  coloured cap — is RoadKin's signature object. Every ride's destination and
  distance is set on one (`<Milestone>`), on cards, on the ride page, on the map
  of where the crew rides. It is the one shape only this product has.
- **The poster sentence** — "Never ride alone again" — is set in Bebas Neue at
  billboard size with a real photograph sitting inside it where a word would be.

## Colours

- One ground (stone `#f4f4f3`), one ink (`#111`), one accent (hi-vis).
- Hi-vis appears on: the primary action, the milestone cap, the unread badge, the
  footer field. Orange **text** uses `text-primary-ink` (links, active nav,
  selected filter) — `text-primary` on a light ground is too pale to read.
- Surfaces separate by a tone step (stone → white → surface), never by a shadow.
  A 1px `--border` is allowed on app panels, tables and form fields only.
- Ride kinds keep their own hue: community = road-sign blue, organized = orange.
  Difficulty is a coloured dot + ink label, never coloured text on white.
- The night band (`bg-secondary`) is the cinematic surface: photo heroes, the
  closing call to action. Text on it is white / `white/75`.

## Typography

- **Bebas Neue** (`font-display`): hero sentence, landing section titles, page
  titles (32px in the app), ride titles on the ride page, the milestone. Never for
  running text, never below 24px.
- **Manrope** (`font-sans`, also `font-heading`): everything else. Section titles in
  the app are 18px/700, body 15–16px, meta 13–14px grey, the floor is 12px.
- Figures that update or align (seats, km, counts, prices, times) use
  `tabular-nums` (`text-telemetry` = tabular + 600).
- Sentence case everywhere outside Bebas. No tracked uppercase micro-labels, no
  eyebrow above a heading, no monospace.

## Shapes & depth

- `--radius` is 4px: buttons, inputs, sheets and photos are square-cut. Avatars
  and the unread dot are the only circles. Chips are 4px tags, not pills.
- No shadows at rest (`shadow-xs/sm` are null). Popovers, menus, dialogs and the
  sticky chat composer keep `shadow-md/lg` because they float.
- No glass: headers and the bottom nav are solid `bg-background`.
- No gradients, except a neutral black scrim under text on a photograph.

## Components

- **Button** — default: hi-vis fill, ink label, 4px corners, 40px tall (`lg` 48px).
  Outline: sheet fill + `--input` border. Secondary: night fill, white label. Press
  = 1px drop. One filled primary per screen.
- **Ride card** — the photograph *is* the card (Nike product card): a 4:3 photo on
  the surface tone with the milestone bottom-left and seats top-right; below it,
  with no padding box: title 16/700, one grey meta line (day · time · from city),
  one line of pace / level / duration, then the captain and a "Claim your seat"
  text action in `primary-ink`.
- **Milestone** — `src/components/design-system/milestone.tsx`. Cap = hi-vis with
  the km; stone = white with the destination in Bebas. Sizes `sm` (cards), `md`,
  `lg` (ride hero). Stays white in dark mode: it is a physical object.
- **Page heading** — Bebas title at 32px, one grey sentence under it, actions on
  the right. No eyebrow.
- **Status chip** — 4px tag, pale tint of its hue with dark text of the same hue,
  a 6px dot. One status mark per row.
- **Header** — solid ground, wordmark left, 3–4 sentence-case links, one action.
  **Bottom nav** — solid ground, top border, active item = ink + orange bar above
  the icon.
- **Footer** — the hi-vis field, the RoadKin name across the full width in Bebas.

## Do

- Put a real photograph or a real ride in every large slot: ride covers, the
  destination's own photograph, curated road photography.
- Set distances, seats, times and prices as tabular figures.
- Use RoadKin's own words: "Claim your seat", "Ride Captain", "your road family",
  "Ride Home" (never "Dashboard").

## Don't

- No eyebrow labels, tiny tracked caps, 01/02/03 numbering or monospace.
- No icon-topped feature cards, no rows of identical white cards with shadows.
- No orange gradients ("sunrise"), glows, blurred blobs, or glass panels.
- No invented proof: no made-up testimonials, rider counts or reviews.
- Don't use orange for decoration: it signals an action, a ride or a location.
