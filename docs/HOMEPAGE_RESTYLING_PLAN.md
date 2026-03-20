# Homepage Restyling Plan: Cyberpunk Pixel-Art Side-Scroller

**Project:** astromahri.space
**Date:** 2026-03-18
**Scope:** Visual, spatial, and animation changes only — no changes to core component structure, routing, Redux state, or backend architecture. The full side-scrolling experience (parallax, animated character, obstacle-style content) applies **only to the homepage (LandingScreen)**. All other pages receive a simplified cyberpunk pixel-art theme without parallax or character animation.

---

## Overview

Transform the existing LandingScreen into a 2D side-scrolling experience inspired by Hollow Knight's art style, reimagined in a cyberpunk pixel-art aesthetic. The protagonist — modeled after Astro Mahri — wields a microphone and floating DJ deck as weapons. Existing page content (About, Media, Games, Merch, Contact) remains intact but is repositioned as in-world obstacles the character encounters while scrolling.

**Important scope distinction:** The full side-scroller treatment (parallax layers, animated character, jump mechanics, obstacle-framed content) is **homepage-only**. All other pages (Media, Games, Merch, Product Detail, etc.) receive a much simpler version of the cyberpunk pixel-art theme — static background, pixel-art UI borders and accents, same color palette — but no parallax, no character, and no horizontal scroll translation. This keeps the immersive experience concentrated on the landing page while giving the rest of the site a cohesive but lightweight aesthetic.

---

## Phase 1: Toolkit & Foundation Setup

1. **Install GSAP + ScrollTrigger** — GSAP is the industry-standard animation library with a free core + ScrollTrigger plugin. It handles scroll-linked parallax, sprite timeline sequencing, and physics-style easing out of the box. Install via `npm install gsap` (ScrollTrigger is bundled).
2. **Create a new CSS file** (`frontend/src/styles/sidescroller.css`) for all game-layer, parallax, and character animation styles. Import it alongside existing retro.css — do not modify retro.css or onepage.css.
3. **Set the page to horizontal-scroll mapped to vertical-scroll** using GSAP ScrollTrigger's `horizontal: true` pin/scrub pattern. The user scrolls vertically (natural); GSAP translates that into horizontal scene movement.

---

## Phase 2: Parallax Environment Layers

Build 5 transparency-enabled landscape layers rendered as absolutely-positioned `<div>` elements behind and around the content. Each layer scrolls at a different rate driven by GSAP ScrollTrigger scrub.

| Layer | Z-Depth | Scroll Speed | Content |
|-------|---------|-------------|---------|
| **L1 — Deep Sky** | farthest | 0.05x | Dark gradient sky, distant neon city skyline silhouette, pixel stars |
| **L2 — Mid City** | far | 0.15x | Mid-ground cyberpunk buildings, holographic billboards, rain streaks |
| **L3 — Near Buildings** | mid | 0.35x | Closer structures, glowing windows, steam vents, neon signage |
| **L4 — Ground/Platform** | near | 0.7x | The walkable surface — circuit-board ground tiles, platform edges |
| **L5 — Foreground FX** | closest | 1.1x | Particle dust, floating data fragments, lens glow overlays |

All layer images are full-width PNGs with transparent backgrounds (except L1 which uses a CSS gradient base). Layers are stacked via `position: absolute` and `z-index` ordering within a `.parallax-viewport` wrapper.

---

## Phase 3: Character System

1. **Create a sprite sheet** for the Astro Mahri protagonist (cyberpunk pixel-art style). Required animation states: idle, walk/run, jump-up, jump-peak, jump-down, land. The character holds a glowing microphone in one hand; a floating DJ deck orbits above/beside them.
2. **Fix the character to horizontal center** of the viewport using `position: fixed; left: 50%; transform: translateX(-50%)`. The character never moves horizontally — the world moves around them.
3. **Animate with CSS sprite stepping** — use `background-position` shifts on a sprite sheet driven by `steps()` timing function for the retro frame-by-frame look. GSAP timeline sequences switch between animation states based on scroll position.
4. **Jump mechanics** — When the scroll position approaches a content block, trigger a GSAP timeline: character plays jump-up frames, translates upward (the ground layer shifts down correspondingly), lands on top of the content block, then jumps back down when scrolling past it. Velocity and arc should feel natural (~0.4s up, brief hang, ~0.3s down).

---

## Phase 4: Content Block Integration

1. **Reposition existing sections** (About, Media, Games, Merch, Contact) as styled "obstacles" that enter from the right side of the screen during horizontal scroll progression.
2. **Wrap each section** in a `.world-obstacle` container styled to look like an in-game structure — pixel-art bordered panels with neon trim, appearing as physical objects in the game world (e.g., a data terminal, a vending machine, a holographic kiosk).
3. **Scroll-trigger entry** — Each content block fades/slides in from the right as the character approaches. The character's jump animation is triggered when the block's leading edge reaches center-screen.
4. **Content remains fully interactive** — links, buttons, product cards all function normally. The obstacle styling is purely decorative CSS (borders, backgrounds, box-shadows).

---

## Phase 5: Art Asset Production

Draft a complete asset manifest with exact dimensions and specifications. Each asset must be pixel-art style, cyberpunk palette (dark backgrounds, neon cyan/magenta/purple accents), and saved as PNG with transparency unless noted.

### Asset Manifest

| # | Asset Name | Type | Dimensions | Format | Notes |
|---|-----------|------|-----------|--------|-------|
| 1 | `sky-gradient.png` | Background Layer L1 | 3840 x 1080 px | PNG (no transparency) | Deep indigo-to-black gradient, pixel star clusters, distant neon city silhouette |
| 2 | `mid-city.png` | Background Layer L2 | 5760 x 1080 px | PNG (transparent) | Cyberpunk mid-ground buildings, holographic billboards, 1.5x viewport width for parallax travel |
| 3 | `near-buildings.png` | Background Layer L3 | 7680 x 1080 px | PNG (transparent) | Close structures with glowing windows, steam vents, neon signs, 2x viewport width |
| 4 | `ground-tiles.png` | Tileable Ground L4 | 256 x 128 px | PNG (transparent) | Circuit-board / tech-floor tile, seamlessly repeating horizontally |
| 5 | `platform-edge.png` | Platform Cap | 128 x 64 px | PNG (transparent) | Left/right edge pieces for platforms the character jumps onto |
| 6 | `foreground-particles.png` | Overlay Layer L5 | 3840 x 1080 px | PNG (transparent) | Floating data fragments, dust motes, subtle lens flares |
| 7 | `character-idle.png` | Sprite Sheet | 512 x 128 px (4 frames @ 128x128) | PNG (transparent) | Astro Mahri idle loop — breathing, mic glow pulse, DJ deck orbit |
| 8 | `character-run.png` | Sprite Sheet | 768 x 128 px (6 frames @ 128x128) | PNG (transparent) | Run cycle with mic trailing, DJ deck following |
| 9 | `character-jump.png` | Sprite Sheet | 640 x 128 px (5 frames @ 128x128) | PNG (transparent) | Jump arc: crouch, launch, peak, fall, land |
| 10 | `dj-deck-float.png` | Animated Prop | 256 x 64 px (4 frames @ 64x64) | PNG (transparent) | Separate floating DJ deck with spinning platter animation |
| 11 | `obstacle-frame-about.png` | Content Frame | 600 x 500 px | PNG (transparent) | Pixel-art data-terminal frame for the About section |
| 12 | `obstacle-frame-media.png` | Content Frame | 700 x 500 px | PNG (transparent) | Holographic kiosk frame for Media section |
| 13 | `obstacle-frame-games.png` | Content Frame | 600 x 500 px | PNG (transparent) | Arcade cabinet frame for Games section |
| 14 | `obstacle-frame-merch.png` | Content Frame | 700 x 600 px | PNG (transparent) | Vending machine / shop stall frame for Merch section |
| 15 | `obstacle-frame-contact.png` | Content Frame | 500 x 400 px | PNG (transparent) | Communication beacon frame for Contact section |
| 16 | `enemy-wave-1.png` | Sprite Sheet | 384 x 64 px (6 frames @ 64x64) | PNG (transparent) | Small drone enemies for ambient animation near obstacles |
| 17 | `neon-sign-astro.png` | Decorative | 320 x 96 px | PNG (transparent) | "ASTRO MAHRI" neon sign for hero section replacement |
| 18 | `ground-platform-top.png` | Platform Surface | 256 x 32 px | PNG (transparent) | Top surface of platforms (content blocks stand on these) |

**Color Palette:** Primary background `#070814`, Neon cyan `#16e0bd`, Magenta `#ff2aad`, Grid purple `#2a2a72`, Warm white `#e6e6ff`, Accent gold `#f0c040`.
**Pixel scale:** All pixel art authored at 1x then displayed at 4x with `image-rendering: pixelated` for crisp scaling.

---

## Phase 6: Other Pages — Simplified Cyberpunk Theme

All non-homepage screens share a lightweight version of the cyberpunk pixel-art aesthetic. No parallax, no animated character, no horizontal scroll mapping.

1. **Create `frontend/src/styles/cyberpunk-base.css`** — a shared stylesheet for all non-homepage screens. Contains the cyberpunk color palette, pixel-art UI primitives, and subtle ambient effects. Imported globally (or per-screen) without touching existing component structure.
2. **Static background** — A single-layer dark gradient background (`#070814` base) with a subtle static cityscape silhouette at the bottom edge and faint pixel stars. No scroll-linked movement. Reuses the L1 sky asset from the homepage or a simplified derivative.
3. **Pixel-art UI accents** — Page headings, cards, buttons, and section dividers get pixel-art styled borders (2–4px stepped edges, neon glow `box-shadow`). Use the same cyan/magenta/purple palette as the homepage so the site feels unified.
4. **Simplified content layout** — Standard vertical scroll. Content blocks use the same cyberpunk card styling but without obstacle frames or character interaction. Cards and sections keep their existing grid/flex layout, just reskinned.
5. **Ambient micro-animations** — Subtle effects only: neon text glow pulse on headings (CSS keyframes), gentle hover glitch effect on buttons (`transform: skew` on hover), and a faint scanline overlay (CSS repeating-linear-gradient, low opacity). All gated behind `prefers-reduced-motion`.
6. **Navigation bar (persistent, all pages)** — The existing ModernNavigation top bar remains visible on every page, including the homepage side-scroller. It receives pixel-art border styling, the cyberpunk color palette, and a semi-transparent dark backdrop so it sits cleanly over parallax layers on the homepage and static backgrounds elsewhere. No structural changes — CSS-only reskin applied globally.

---

## Phase 7: Polish & Performance

1. **Generate simple placeholder graphics** — solid-color silhouette PNGs and single-color sprite rectangles for every asset in the manifest above, so development and scroll-trigger logic can proceed before final art is complete.
2. **Add ambient animations** — subtle enemy drones that float near content blocks, neon sign flicker effects (CSS `opacity` keyframes), rain/particle overlay on L5.
3. **Performance guardrails** — use `will-change: transform` on parallax layers, prefer `transform: translate3d()` over `left`/`top` for GPU compositing, lazy-load background PNGs outside initial viewport, keep sprite sheets under 512 KB each.
4. **Responsive adaptation** — On viewports below 768px, reduce to 3 parallax layers, scale character sprite to 96x96, and stack content blocks vertically with simplified obstacle frames.
5. **Accessibility** — Provide a `prefers-reduced-motion` media query fallback that disables parallax and character animation, showing a static layout with all content visible.

---

## Implementation Order Summary

| Step | Description | Applies To | Estimated Complexity |
|------|------------|-----------|---------------------|
| 1 | Install GSAP, create sidescroller.css + cyberpunk-base.css | All pages | Low |
| 2 | Build cyberpunk-base.css: static bg, pixel-art borders, card reskin | Other pages | Medium |
| 3 | Apply cyberpunk-base.css to navigation (shared across all pages) | All pages | Low |
| 4 | Build 5 parallax layers with placeholder colors/shapes | Homepage | Medium |
| 5 | Implement character fixed-center positioning + sprite animation system | Homepage | Medium |
| 6 | Wire scroll-to-horizontal translation via GSAP ScrollTrigger | Homepage | Medium |
| 7 | Restyle content blocks as world obstacles entering from the right | Homepage | Medium |
| 8 | Implement jump trigger logic (character jumps onto/off each obstacle) | Homepage | High |
| 9 | Draft full art asset manifest with specs (see Phase 5 above) | Homepage | Low |
| 10 | Generate placeholder graphics for all 18 assets | Homepage | Low |
| 11 | Add ambient micro-animations (glow, scanlines, hover glitch) to other pages | Other pages | Low |
| 12 | Integrate final pixel art assets when available | Homepage | Low |
| 13 | Polish: responsive adaptation, performance, a11y across all pages | All pages | Medium |

---

*This plan modifies only visual presentation, spatial layout, and animation behavior. No changes to React component hierarchy, Redux store, API calls, routing, or backend services. The full side-scroller experience is homepage-only; all other pages use a simplified static cyberpunk theme.*
