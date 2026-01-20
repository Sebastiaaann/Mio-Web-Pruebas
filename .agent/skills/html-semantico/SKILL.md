# Semantic HTML Skill

Use when building or reviewing Vue components to ensure proper semantic HTML structure for accessibility and SEO.

---

## Core Semantic Elements

### Layout Elements

| Element     | Use Case                                  | Instead of              |
| ----------- | ----------------------------------------- | ----------------------- |
| `<header>`  | Page/section header with logo, nav, title | `<div class="header">`  |
| `<nav>`     | Navigation menus, breadcrumbs             | `<div class="nav">`     |
| `<main>`    | Primary page content (1 per page)         | `<div class="main">`    |
| `<section>` | Thematic grouping with heading            | `<div class="section">` |
| `<article>` | Self-contained content (cards, posts)     | `<div class="card">`    |
| `<aside>`   | Sidebar, related content                  | `<div class="sidebar">` |
| `<footer>`  | Page/section footer                       | `<div class="footer">`  |

### Content Elements

| Element        | Use Case                              |
| -------------- | ------------------------------------- |
| `<h1>-<h6>`    | Headings in order (1 `<h1>` per page) |
| `<p>`          | Paragraphs of text                    |
| `<ul>/<ol>`    | Lists (use `<li>` children)           |
| `<figure>`     | Images/diagrams with captions         |
| `<figcaption>` | Caption for `<figure>`                |
| `<time>`       | Dates and times                       |
| `<address>`    | Contact information                   |

### Interactive Elements

| Element      | Use Case                               |
| ------------ | -------------------------------------- |
| `<button>`   | Clickable actions (NOT `<div @click>`) |
| `<a>`        | Navigation links (NOT `<span @click>`) |
| `<form>`     | Form container                         |
| `<label>`    | Input labels (with `for` attribute)    |
| `<fieldset>` | Group related inputs                   |
| `<legend>`   | Title for `<fieldset>`                 |

---

## Vue Component Patterns

### Navigation Component

```vue
<!-- ❌ Incorrect -->
<div class="sidebar">
  <div class="nav-items">...</div>
</div>

<!-- ✅ Correct -->
<aside>
  <nav aria-label="Menú principal">
    <ul role="list">
      <li><a href="/home">Inicio</a></li>
    </ul>
  </nav>
</aside>
```

### Card Component

```vue
<!-- ❌ Incorrect -->
<div class="card" @click="...">
  <div class="title">...</div>
  <div class="body">...</div>
</div>

<!-- ✅ Correct -->
<article class="card">
  <header>
    <h3>{{ title }}</h3>
  </header>
  <p>{{ body }}</p>
  <footer>
    <button @click="...">Ver más</button>
  </footer>
</article>
```

### Form Component

```vue
<!-- ❌ Incorrect -->
<div class="form">
  <span>Nombre</span>
  <input v-model="name" />
</div>

<!-- ✅ Correct -->
<form @submit.prevent="handleSubmit">
  <div class="field">
    <label for="name">Nombre</label>
    <input id="name" v-model="name" />
  </div>
  <button type="submit">Enviar</button>
</form>
```

---

## Audit Checklist

When reviewing a Vue file, check:

1. **Page Structure**
   - [ ] Only one `<main>` element
   - [ ] `<header>` for page/section headers
   - [ ] `<nav>` for navigation (with `aria-label`)
   - [ ] `<footer>` for footers

2. **Heading Hierarchy**
   - [ ] Single `<h1>` per page
   - [ ] Headings in order (no skipping levels)

3. **Interactive Elements**
   - [ ] `<button>` for actions (not clickable divs)
   - [ ] `<a>` for links (not clickable spans)
   - [ ] All inputs have `<label>`

4. **Lists**
   - [ ] Navigation items in `<ul>` with `<li>`
   - [ ] Use `role="list"` if styling removes markers

5. **Landmarks**
   - [ ] Unique `aria-label` for multiple `<nav>` elements
   - [ ] `role="region"` with `aria-labelledby` for sections

---

## Common Fixes

| Issue                  | Fix                     |
| ---------------------- | ----------------------- |
| Clickable `<div>`      | Replace with `<button>` |
| `<div class="header">` | Replace with `<header>` |
| Missing labels         | Add `<label for="id">`  |
| Multiple `<h1>`        | Keep one, demote others |
| `<span>` as link       | Replace with `<a href>` |
