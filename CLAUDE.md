# new-portfolio

Personal portfolio site for Ben Dobkin (product designer & engineer). Live at https://github.com/bensdobkin/new-portfolio.

## Stack — deliberately minimal

- Plain HTML, CSS, JS. **No build step, no frameworks, no package.json, no dependencies.**
- Open any `.html` file directly in a browser — it works.
- Google Fonts loaded via `@import` in `style.css` (Public Sans, IBM Plex Mono, Fraunces variable).

Do not introduce bundlers, React, Tailwind, TypeScript, or any tooling. If something feels like it wants a build step, find a plain-JS way instead.

## File structure

```
/
├── index.html                 # Case studies home
├── other-work.html            # Other work grid (12 projects)
├── playground.html            # Image gallery with lightbox
├── about.html                 # Bio + experience + contact
├── style.css                  # All styles + tokens + dark mode
├── main.js                    # Nav active state, lightbox, TOC scroll, theme toggle
├── case-studies/
│   └── project-template.html  # Full case-study template (Figma-aligned)
├── other-work-pages/
│   └── project-template.html  # Simplified other-work detail template
└── assets/
    └── images/                # All project imagery
```

**Adding a new project:** duplicate the template file, rename, and update content. The nav active state + dark-mode inline script are already wired up inside each template.

## Design tokens

Defined as CSS custom properties in `:root` in `style.css`:

- Colors: `--text-1: #2a2a2a`, `--text-2: #868686`, `--border: #d9d9d9`, `--bg-card: #efefef`, `--accent: #ff4800`, `--highlight-purple: #6c3bce`
- Spacing: `--sp-1: 4px` through `--sp-5: 40px`
- Radius: `--radius: 4px`
- Nav height: `--nav-h: 71px`
- Fonts: `--font-sans` (Public Sans 300/400), `--font-mono` (IBM Plex Mono), `--font-serif` (Fraunces variable)

**Always reference tokens via `var(--…)`. Do not hard-code hex values or pixel spacings.**

## Dark mode

- Activated by `data-theme="dark"` on the `<html>` element.
- Each page has an inline `<script>` in `<head>` that reads `localStorage.theme` and sets the attribute *before* CSS loads — this prevents FOUC. The site defaults to light mode regardless of the OS `prefers-color-scheme` setting; dark mode is opt-in via the toggle.
- Footer button (`.theme-toggle`) in every page toggles it via `main.js`.
- Dark-mode overrides live under `html[data-theme="dark"] { ... }` blocks at the bottom of `style.css`.
- Dark bg is `#1a1a1a` (not the token default — hard-coded there intentionally).

When adding new pages: copy the inline head script and the footer `.theme-toggle` button from any existing page. Don't skip the head script or the page will flash light before going dark.

## Images

All project imagery lives in `/assets/images/` with descriptive, kebab-case filenames (e.g., `apple-music.png`, `google-pixel-6.jpg`).

**Image card pattern** (other-work and case-study cards):

```html
<div class="card__image">
  <img src="assets/images/filename.jpg" alt="Descriptive alt text" />
</div>
```

`.card__image` has `overflow: hidden`, `img` has `object-fit: cover; width: 100%; height: 100%`. Images fill the card area and respect rounded corners.

For cards without imagery yet, leave the `.card__image` div empty — it renders as a `--bg-card` placeholder.

**Alt text:** write descriptive alt text that captures what's actually in the image (subject, scene, key visual elements), not the project name. The project name is already in the adjacent `<h2>`.

## Conventions

- **Nav active state** is both set inline (`class="active"` per page) and defensively re-applied by `main.js` based on `location.pathname`. Detail pages (`/case-studies/...`, `/other-work-pages/...`) correctly highlight the parent section.
- **Case study TOC** uses `IntersectionObserver` (rootMargin `-20% 0px -70% 0px`) for scroll-based active section. Click suppresses the observer for 900ms to avoid flicker during smooth scroll.
- **Playground lightbox** reads from `data-src` / `data-index` attributes. Supports arrow keys and Escape.
- **Copy-pasted nav and footer:** there's no templating system. The same `<nav>` and `<footer>` markup is duplicated across pages. If you edit one, edit all of them (6 top-level pages + 2 templates = 8 places).
- **Comments:** default to none. Only write a comment when the *why* is non-obvious.

## Content state

- Case studies home (`index.html`) has 6 cards: first 2 show "COMING SOON" badges (non-linked `<div>`s), the other 4 link to the case-study template.
- Other work (`other-work.html`) has 12 projects across 6 rows of 2. All are wired up with real imagery from Ben's Deeplocal/Apple/Toyota work and link to the other-work template.
- Detail templates contain placeholder copy marked with `<!-- TODO -->` comments where real content is still needed.
- About bio and Playground images are placeholders.

When generating placeholder copy about Ben's past work, be generic — don't fabricate project details, metrics, or team names. Flag with `<!-- TODO -->` so real copy replaces it later.

## Figma authority

Ben has a Figma file that is the design source of truth. When the Figma design and any written spec diverge, **align to Figma**. Pull Figma early in the session (via the Figma MCP `get_design_context`) rather than building from memory or spec.

## Git

- Remote: `origin` → `https://github.com/bensdobkin/new-portfolio.git`
- Branch: `main`
- For saves: `git add <files>` → `git commit -m "message"` → `git push`

## Out of scope

No CMS, no analytics, no i18n, no forms, no deploy config, no JS frameworks. If a change pushes the site beyond "plain static files," surface the tradeoff to Ben before doing it.
