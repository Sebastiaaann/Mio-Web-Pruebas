# Design Mechanics & UI Patterns

This document summarizes the advanced UI patterns implemented in the project. Use this as a reference when building new features to ensure a premium, fluid user experience.

## 1. Shared Layout ("Magic Motion")

**Concept**: Elements morph seamlessly from one position/size to another.

- **Use Case**: Navigation tabs, expanding cards, list reordering.
- **Key Prop**: `layoutId="unique-id"`. Both the starting and ending component must share the same ID.
- **Best Practice**: The "Gliding Pill" background in navbars.

## 2. Interactive Physics

**Concept**: Interfaces should react to physical touch/cursor with weight and momentum.

- **Hover**: Scale up `1.05x` or `1.1x`.
- **Tap**: Scale down `0.95x` or `0.9x`.
- **Springs**: Always use `type: 'spring'` instead of linear easing for natural movement.

## 3. Visual Harmony (Optical Alignment)

**Concept**: Mathematical centering isn't always visual centering.

- **Rule**: Adjust padding for asymmetrical icons (like Play buttons) until they _look_ centered, even if the math says they aren't.
- **Concentric Radius**: `Outer Radius = Inner Radius + Padding`. This ensures nested borders look parallel.

## 4. Invisible Details

**Concept**: Subconscious cues that make an app feel "polished".

- **OKLCH Gradients**: Use `linear-gradient(in oklch ...)` for vibrant colors without muddy grays.
- **Orbit Animations**: Subtle rotating strokes for loading or security contexts (Passkeys).
- **Hand-Drawn SVGs**: Animate `pathLength` from 0 to 1 for checkmarks or highlights.

## 5. Layout Transitions

**Concept**: Don't just snap content; flow it.

- **Auto-Height**: Animate container height to `auto` when content changes (e.g., accordions, multi-step forms).
- **PopLayout**: Use `<AnimatePresence mode="popLayout">` to slide old content out while new content slides in simultaneously.
