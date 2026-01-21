---
name: animation-flip
description: Comprehensive guide to Shared Layout Animations (Magic Motion) and FLIP technique using motion-v in Vue.
---

# Animation Skill: Shared Layouts & FLIP

This skill provides patterns and best practices for implementing "Magic Motion" style shared layout animations in Vue applications using `motion-v` ((or Framer Motion).

## Core Concept: Shared Layout (Magic Motion)

Shared Layout animations allow a component to morph from one state to another, or for distinct components to animate into each other as if they were the same element. This creates a sense of continuity and "magic" in the UI.

### How it works

Under the hood, this uses the **FLIP** technique:

1.  **F**irst: Measure the initial position/size of the element.
2.  **L**ast: Measure the final position/size after the layout change.
3.  **I**nvert: Apply a transform to the element to make it appear at the start position.
4.  **P**lay: Animate the transform removal to "slide" the element to its final spot.

## The `layoutId` Prop

The key to this in `motion-v` is the `layoutId` prop. When two components share the same `layoutId`:

- If one disappears and another appears, the library treats them as the **same entity**.
- It automatically calculates the transform needed to morph A into B.

```vue
<!-- Component A -->
<Motion layoutId="underline" />

<!-- Component B -->
<Motion layoutId="underline" />
```

## Critical Best Practice: Avoiding Scale Distortion

The #1 issue with Shared Layout animations is **child element distortion**.

### The Problem

If you animate a container changing size (e.g., a tab background growing from "Home" to "Settings"), any text or icon _inside_ that container will stretch and squash with it.

### The Solution: The Sibling Rule

**NEVER** wrap your content inside the shared layout element if the aspect ratio changes significantly.
**ALWAYS** place the shared layout element as a **sibling** to your content, positioned absolutely behind it.

#### ❌ Incorrect (Distorted Text)

```vue
<Motion layoutId="tab-bg" class="bg-blue-500 p-2">
  <span>Settings</span> <!-- This text will stretch! -->
</Motion>
```

#### ✅ Correct (Clean Animations)

```vue
<div class="relative p-2">
  <!-- 1. The Content (Static, High Z-Index) -->
  <span class="relative z-10">Settings</span>

  <!-- 2. The Background (Animated, Low Z-Index, Absolute) -->
  <Motion
    layoutId="tab-bg"
    class="absolute inset-0 bg-blue-500 z-0 rounded"
  />
</div>
```

## Patterns

### 1. Morphing Tabs / Nav Items

Perfect for navigation bars, segmented controls, or sidebars.

```vue
<script setup>
import { ref } from "vue";
import { Motion } from "motion-v";

const tabs = ["Home", "Profile", "Settings"];
const activeTab = ref("Home");
</script>

<template>
  <div class="flex gap-4">
    <button
      v-for="tab in tabs"
      :key="tab"
      @click="activeTab = tab"
      class="relative px-4 py-2"
    >
      <!-- Text -->
      <span class="relative z-10">{{ tab }}</span>

      <!-- Active Background -->
      <Motion
        v-if="activeTab === tab"
        layoutId="active-pill"
        class="absolute inset-0 bg-blue-500 rounded-full"
        :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
      />
    </button>
  </div>
</template>
```

### 2. List Reordering

To animate items changing position in a list, simply add the `layout` prop.

```vue
<Motion
  v-for="item in list"
  :key="item.id"
  layout
  :initial="{ opacity: 0 }"
  :animate="{ opacity: 1 }"
>
  {{ item.text }}
</Motion>
```

## Performance Tips

1.  **`layout="position"` vs `layout`**:
    - Use `layout="position"` if you only want to animate position changes (better performance) and ignore size changes.
    - Use `layout` (true) for both size and position.

2.  **`transform: translateZ(0)`**:
    - Sometimes necessary on parent containers to prevent flickering during layout (creates a new stacking context).

3.  **Animate Presence**:
    - Ensure `Motion` components are direct children of `AnimatePresence` for exit animations to work correctly with layout changes.

## Troubleshooting

- **"My text looks blurry or stretched during animation"**
  - You are violating the **Sibling Rule**. Move the `<Motion>` background out of the parent wrapper and make it a sibling to the text.

- **"The animation jumps instantly"**
  - Ensure `layoutId` is identical string.
    - Ensure the component keys are stable.

## Advanced Pattern: Shared Layout + AnimatePresence

When using `AnimatePresence` to animate content **exit** (e.g., tabs fading out), it is critical to keep the Shared Layout component (the moving background) **OUTSIDE** of the `AnimatePresence`.

If the shared layout element is inside, `AnimatePresence` will try to animate its exit, breaking the smooth morphing effect.

### Recommended Structure

```vue
<template>
  <!-- 1. Navigation (Shared Layout lives here) -->
  <div class="tabs">
    <button v-for="tab in tabs" @click="active = tab">
      {{ tab }}
      <Motion layoutId="pill" />
    </button>
  </div>

  <!-- 2. Content (AnimatePresence lives here) -->
  <AnimatePresence mode="popLayout">
    <Motion
      :key="active"
      :initial="{ opacity: 0, filter: 'blur(4px)', y: 20 }"
      :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
      :exit="{ opacity: 0, filter: 'blur(4px)', y: 20 }"
    >
      <Content :data="active" />
    </Motion>
  </AnimatePresence>
</template>
```

This ensures the "pill" glides continuously while the content cross-fades with a nice blur effect.

## SVG Path Animations (Hand-Drawn Effect)

You can animate any SVG `path` drawing itself using the `pathLength` property. This creates a "hand-drawn" or "wireframe loading" effect.

### Basics

1.  Use `<Motion>` or `<motion.path>` for the SVG path.
2.  Set `initial={{ pathLength: 0 }}` (invisible).
3.  Set `animate={{ pathLength: 1 }}` (fully drawn).

```vue
<svg viewBox="0 0 100 100">
  <Motion
    d="M10 10 L 90 90"
    :initial="{ pathLength: 0, opacity: 0 }"
    :animate="{ pathLength: 1, opacity: 1 }"
    :transition="{
       pathLength: { duration: 1, ease: 'easeInOut' }
    }"
    stroke="currentColor"
    stroke-width="2"
  />
</svg>
```

### Best Practices

- **Pre-made SVGs**: Draw your shapes in Figma/Illustrator, export as SVG, and copy the `d` attribute.
- **Split Complex Paths**: If you have a complex drawing (like a signature or detailed icon), split it into multiple `<path>` elements. Animating one giant path often looks unnatural.
- **Spring vs Tween**:
  - Use `spring` for UI elements like checkboxes (snappy).
  - Use `easeInOut` (tween) for "drawing" effects like circles or underlines.

## Motion Gestures (Hover, Tap, Drag)

`motion-v` provides simple props to handle complex physical interactions.

### 1. Hover & Tap (Buttons)

Use `whileHover` and `whileTap` to add scale/rotation effects. Using a spring transition makes them feel responsive and alive.

```vue
<Motion
  is="button"
  :whileHover="{ scale: 1.1 }"
  :whileTap="{ scale: 0.9 }"
  :transition="{ type: 'spring', stiffness: 400, damping: 10 }"
>
  Click Me
</Motion>
```

### 2. Drag

Add the `drag` prop to make any element draggable.

- `drag`: Enable dragging (true, "x", or "y").
- `dragConstraints`: Limit movement area (ref or object).
- `dragElastic`: How much it can be pulled beyond constraints (0-1).

```vue
<div ref="constraints">
  <Motion
    drag
    :dragConstraints="constraints"
    :whileDrag="{ scale: 1.1 }"
  />
</div>
```

### 3. Pan

For custom slide interactions, use `onPan`.

```vue
<Motion onPan="(e, info) => console.log(info.delta.x)" />
```

## Advanced UI Patterns

### 1. Auto-Height Dialogs

To make a container smoothly resize to fit its content (e.g., in multi-step forms), animate the `height` property to `"auto"`.

```vue
<Motion
  :animate="{ height: 'auto' }"
  :transition="{ type: 'spring', bounce: 0, duration: 0.4 }"
  class="overflow-hidden"
>
  <div class="content">...</div>
</Motion>
```

### 2. OKLCH Gradients

For richer, more vibrant gradients without "gray dead zones", use the OKLCH color space.

```css
/* Modern CSS */
background: linear-gradient(in oklch to right, blue, yellow);
```

### 3. Optical Alignment

Geometric alignment (centering based on bounding box) often looks wrong for asymmetrical shapes (like Play icons).
**Solution**: Add padding to the "lighter" side to balance the visual center.

- _Play Icon_: Add `pl-1` (padding-left) to push it slightly right.

### 4. Outline Orbit (Passkey Animation)

Create a rotating border effect using SVG stroke dashes.

1.  Create an SVG `rect` covering the element.
2.  Set `strokeDasharray` (e.g., "30 150" for a short dash and long gap).
3.  Animate `strokeDashoffset` continuously.

```vue
<Motion
  is="rect"
  stroke-dasharray="30 150"
  :animate="{ strokeDashoffset: [0, -180] }"
  :transition="{ duration: 2, ease: 'linear', repeat: Infinity }"
/>
```

```vue
<Motion
  is="rect"
  stroke-dasharray="30 150"
  :animate="{ strokeDashoffset: [0, -180] }"
  :transition="{ duration: 2, ease: 'linear', repeat: Infinity }"
/>
```

### 5. Concentric Border Radius

To make nested rounded corners look "natural" and parallel, use this formula:
`Outer Radius = Inner Radius + Padding`

### 6. Infinite Card Stack

To cycle items infinitely (e.g., top card moves to bottom):

1.  Use `layoutId` on each card to track its identity across DOM position changes.
2.  Change the array order (move first item to last).
3.  Let `motion-v` handle the layout transition (the "swap" animation).

### 7. Collection Preview (Expandable Stack)

To transition from a stack to a grid:

1.  Use `layoutId` on the container and each image.
2.  Render a "Stack" view (absolute positioning) vs "Grid" view (static grid).
3.  When state changes (`isExpanded`), Motion automatically morphs the elements between the two distinct DOM structures.
