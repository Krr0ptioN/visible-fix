# VisibleFix Design System

## Direction

**Name:** Linear x Uber / Sharp Civic Monochrome

VisibleFix should feel like an operational public interface, not a friendly consumer landing page. The design combines:

- **Linear:** dense information layout, precise borders, muted grayscale hierarchy, product-like control surfaces
- **Uber:** monochrome confidence, decisive typography, strong black/white contrast, direct action language

The result is intentionally severe:

- zero radius everywhere
- sharp corners and hard separators
- restrained use of color
- compact spacing that still scans clearly
- a map and status system that feel instrumental, not decorative

## Core Rules

### Shape language

- **Border radius is always `0px`.**
- Buttons, inputs, cards, badges, tables, nav items, popovers, and map chrome all use sharp corners.
- Visual grouping is created with borders, spacing, and shadows, never pill shapes.

### Color system

- **Primary palette:** near-black, white, cool light grays
- **Accent usage:** only for issue status and success/error feedback
- No playful gradients, no colorful UI chrome, no soft pastel surfaces

### Typography

- Use **Avenir Next Condensed** for display and section headlines when available
- Use **Avenir Next** for body and controls
- Headings should feel compressed and assertive
- Body text should stay neutral and readable

### Layout

- Use grid-heavy composition and clear section lines
- Prefer split panels, data blocks, and operational groupings over marketing cards
- Default spacing rhythm is tight-to-medium, not airy

### Motion

- Keep transitions minimal and direct
- Hover states should invert or slightly darken surfaces
- No bouncy or playful animation

## Tokens

### Base colors

- `--background`: `#f3f3f1`
- `--foreground`: `#0c0c0d`
- `--card`: `rgba(255,255,255,0.92)`
- `--border`: `rgba(12,12,13,0.12)`
- `--secondary`: `#ececef`
- `--muted-foreground`: `#6d7078`
- `--primary`: `#0f1012`
- `--primary-foreground`: `#ffffff`

### Status colors

- `reported`: keep current app status color
- `acknowledged`: keep current app status color
- `in_progress`: keep current app status color
- `resolved`: keep current app status color
- `rejected`: keep current app status color

Status color is functional. It should appear in badges, markers, and timeline states. It should not leak into generic buttons or containers.

## Components

### Buttons

- Square, bordered, min height `44px`
- Primary button: black fill, white text
- Secondary button: white fill, dark border
- Ghost button: transparent with text emphasis only when necessary

### Cards and panels

- Single border
- Soft but controlled shadow
- No rounded corners
- Use header/content/footer composition for structure

### Inputs

- Sharp corners
- Border-driven states
- No inset softness or heavy glow

### Navigation

- Horizontal segmented bar with border dividers
- Active item uses black fill
- Inactive items remain light with muted text

### Map treatment

- Square markers, not circular pins
- Controls and popups use hard edges
- Background grid and telemetry feel are acceptable

## Do

- Build interfaces that look credible under pressure
- Keep the UI monochrome by default
- Use strong typographic hierarchy
- Use borders to separate related functions
- Let the map and status markers provide the strongest color moments

## Don’t

- Don’t use rounded pills
- Don’t rely on generic Tailwind blue buttons
- Don’t add decorative gradients unrelated to function
- Don’t make the product feel cute, soft, or overly social
- Don’t use status colors as general-purpose branding colors

## Implementation Note

The repository currently uses a **local shadcn-style foundation** because the live shadcn CLI and package fetch are blocked in this environment. The intended architecture is still shadcn-like:

- semantic tokens
- reusable UI primitives
- componentized surface/layout patterns
- a `components.json` scaffold for later CLI adoption

When registry access is available, the next step is to replace local stand-ins with actual shadcn/Radix primitives while preserving this visual system.

## React Native Component System (Shadcn-like)

For mobile (`apps/mobile`), we need a reusable, token-driven component layer that we can tailor to the same hard-edge civic style.

### Installed now

- `@react-native-reusables/cli` (dev): shadcn-like generator workflow for React Native
- `nativewind`, `tailwindcss`, `class-variance-authority`, `clsx`, `tailwind-merge`: utility + variant stack for composable primitives
- `@shopify/restyle`: strongly typed theme/tokens for system-level consistency
- `react-native-paper`: mature production component fallback for complex surfaces
- `react-native-ui-lib`: fast prebuilt blocks for admin-like screens and dense operational layouts

### Recommended architecture

1. **Primary UI layer:** React Native Reusables pattern + NativeWind + CVA  
   Build our own button/input/card/list primitives with strict VisualFix tokens.
2. **Theme backbone:** Restyle token objects for color, spacing, typography, and borders  
   Keep a single source of truth for sharp corners, monochrome base, and status accents.
3. **Fallback components:** Paper / UI Lib only where speed is needed  
   Use these for complex controls (menus, sheets, date/time pickers) while wrapping them with local style adapters.

### Mobile style constraints (must match web)

- Radius remains `0` by default
- Borders and separators over soft elevation
- Status colors used only for issue semantics
- Tight operational spacing, not airy marketing spacing
- Map/action surfaces should prioritize legibility and speed under pressure

### Top ecosystem choices to track

- **Tamagui:** high-performance cross-platform design system with strong token/theming model
- **React Native Paper:** stable and widely adopted material component kit
- **Gluestack UI:** utility-first, highly themeable RN/UI primitives
- **Shopify Restyle:** best-in-class typed theming foundation
- **React Native Reusables:** shadcn-inspired RN workflow for custom-tailored components
