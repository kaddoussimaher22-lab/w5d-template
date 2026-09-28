# Immobilière Gloulou: static site (W5D)

A premium static website for **Immobilière Gloulou** (promoteur immobilier, Tunis & Sahel, since 1986), built by **W5D** on the W5D template DNA with the palette changed **from blue to red** (logo crimson `#c21128`, rose, coral, 1986 gold).

- **No build step.** HTML shells, Tailwind CDN, vanilla Web Components and Markdown.
- **All copy lives in Markdown** (`content/{lang}/`). Every page is an MD file.
- **French is the default.** Other languages are added statically (see [Languages](#languages)).
- **Videos never autoplay.** Video cards open a popup, and the YouTube iframe (`youtube-nocookie`) is only inserted after a click. It is removed when the popup closes.

---

## 1. Entry URLs

| URL | MD source | Purpose |
|---|---|---|
| `index.html` | `content/fr/accueil.md` | Home |
| `projets.html` | `projets.md` | Portfolio (filter chips: status and region) |
| `projet.html?slug=koya` | `projets/{slug}.md` (21) | Project page (template) |
| `a-propos.html` | `a-propos.md` | History, values, timeline |
| `services.html` | `services.md` | Services (tabs) |
| `investir.html` | `investir.md` | Invest / buy off-plan |
| `engagement.html` | `engagement.md` | Low-carbon commitment |
| `parrainage.html` | `parrainage.md` | Referral programme |
| `contact.html` | `contact.md` | Contact cards, map (click to load), form |
| `blog.html` · `actualites.html` · `avancements.html` | `blog.md` · `actualites.md` · `avancements.md` | Guides · company news · site progress |
| `article.html?slug=…` | `articles/{slug}.md` (86) | Article (template) |
| `videos.html` | `videos.md` | Video library (popup player) |
| `newsletter.html` | `newsletter.md` | Newsletter |
| `mentions-legales.html` · `politique-de-confidentialite.html` · `cookies.html` | same names `.md` | Legal |
| `plan-du-site.html` | `plan-du-site.md` | HTML sitemap |
| `audit.html` | `audit.md` | Animated audit of the old immobilieregloulou.com site, for the SEO team |
| `404.html` (also used for unknown slugs) | `404.md` | Not found |

## 2. Structure

```
gloulou/
├─ *.html                 21 thin shells: <g-header> <g-page src="…"> <g-footer>
├─ config/
│  ├─ site.json           brand, languages, contact, nav + mega-menu, footer, social
│  └─ i18n/fr.json        UI strings (buttons, labels, statuses…)
├─ content/fr/            ALL page copy (Markdown + ::: blocks)
│  ├─ projets/*.md        21 project pages
│  └─ articles/*.md       86 articles (avancement 38 · news 32 · blog 16)
├─ data/fr/               projects.json · posts.json · videos.json (lists, cards, filters)
├─ css/gloulou.css        design layer: light/dark variables + W5D animation library
├─ js/core/               boot.js (theme before paint + loader) · tw.js (Tailwind red remap) · app.js (engine)
├─ js/components/         layout.js · blocks.js · realestate.js · report.js
├─ assets/img/            334 optimised WebP images
└─ tools/                 build_pages.py · build_projects.py · build_articles.py (+ source/)
```

> **Script order matters:** `js/core/tw.js` must be loaded **after** `https://cdn.tailwindcss.com`, because the CDN re-initialises `window.tailwind`. If the config is set before it, the config is discarded and the `brand-*` colours disappear.

## 3. Writing pages

Each MD file starts with front-matter, which feeds `<title>`, the meta description and `og:image`:

```md
---
title: Résidence KOYA | Immobilière Gloulou
description: 135 appartements haut standing à El Menzah 9C.
image: koya-cover.webp
---
```

Plain Markdown is rendered in a readable column that reveals on scroll. Rich sections use **`:::` blocks**:

```md
::: hero variant=aurora badge="Nouveau" title="Bâtir des lieux de vie"
> Sous-titre de la section.
Découvrir nos projets | projets.html | primary | building-2
Notre histoire en vidéo | video:VIDEO_ID | ghost | play-circle
:::
```

Rules:
- attributes: `key=value` or `key="value with spaces"`
- `> text`: body / intro text
- `# a | b`: header row (tables)
- each other line is a **row** with cells separated by `|` (escape a pipe as `\|`)
- `::::` (4 colons) wraps other blocks (`project-body`, `grid`)
- shared attributes: `id`, `eyebrow`, `icon`, `title`, `tone=soft|dark`, `border=false`

### Block reference

**Marketing (W5D blocks, heroes and sections)**

| Block | Rows / key attributes |
|---|---|
| `hero` | `variant=aurora\|split\|image\|cover\|editorial\|starfield\|beam\|page` · `badge title crumbs="A > B@href" image video chip1 chip2` · rows `label \| href \| style \| icon` (`href` may be `video:ID`) |
| `section`, `prose`, `html` | free content |
| `logos`, `headline` | marquee strips |
| `stats` | `value \| suffix \| label \| icon \| note` (animated counters) |
| `features` | `icon \| title \| text \| label@href` |
| `zigzag` | `image \| eyebrow \| title \| text \| p1;p2 \| label@href` |
| `bento` | `icon \| title \| text \| image \| link` |
| `steps`, `timeline` | `year \| title \| text \| icon` |
| `quote`, `testimonials` | `text \| name \| role \| icon` |
| `faq` | `q \| a` (`open=1`) |
| `tabs` | `icon \| label \| title \| text;items \| image` |
| `cta` | `title image` + buttons |
| `gallery` | `src \| alt` · `cols layout=masonry bare` (lightbox) |
| `video`, `videos` | `id label cover` · or `source` + `tag limit filter` (popup, no autoplay) |
| `map` | `q label height` (click to load) |
| `contact-cards`, `form` | form rows `type \| name \| label \| options \| required` → mailto / WhatsApp handoff |

**Real estate and blog:** `projects` (`featured status type limit cols filter more`), `project-hero`, `project-facts`, `project-body`, `project-gallery`, `project-video`, `project-progress`, `related`, `status-legend`, `posts` (`cat project limit featured filter=year|project|cat pageSize more`), `post-hero`, `post-nav`, `post-related`.

**Audit and data-viz:** `callout` (`tone=warn|ok`), `gauges`, `bars`, `chart` (theme-aware Chart.js, `source="issues" by=severity|category`), `grid`, `issues`, `typo-table`, `compare`, `matrix`, `roadmap`, `checklist`.

## 4. Design and motion

- **Theme:** dark by default, light available. `.dark` goes on `<html>` before first paint, and the choice is stored in `localStorage.gloulou-theme`. Every surface, border, glass, field and chart reads CSS variables, so both themes are fully covered.
- **Reveal:** `data-rv="up|down|left|right|zoom|rotate|fade"` plus `.stagger` on the parent (up to 10 children, 60 ms steps). Reveals use **keyframe animations** rather than transitions, so hover effects (`.lift`, `.tilt`, `.shine`) keep their own timing. Reveals are GPU-only (`transform`/`opacity`) and fire once through a shared IntersectionObserver.
- **Performance:** decorative loops (beam, shine, Ken Burns) animate `transform` only. The page shell reserves the viewport height, so the footer never jumps. Measured CLS is **0.000** on every page, on desktop and mobile.
- **Mega-menu:** solid (not transparent) panel, **centred on the navbar**, with a caret that points to the active trigger, a gradient top edge, staggered items, a 140 ms close delay, and keyboard support (Esc, focus-out). Single-column menus use a narrower centred panel. On mobile it becomes a solid accordion.
- `prefers-reduced-motion` turns all motion off.

## 5. Languages

1. Add the language to `config/site.json → languages` with `"enabled": true` (use `"dir": "rtl"` for Arabic).
2. Copy `config/i18n/fr.json` to `config/i18n/{lang}.json` and translate it.
3. Copy `content/fr/` to `content/{lang}/` and translate the MD files.
4. Optionally copy `data/fr/` to `data/{lang}/`.

Language resolution works as follows: `?lang=` › `localStorage.gloulou-lang` › default. Any file missing in a language falls back to `fr`.

## 6. Tools

```bash
python3 tools/build_pages.py              # regenerate the 21 HTML shells
python3 tools/build_projects.py [--force] # (re)generate content/fr/projets/*.md
python3 tools/build_articles.py           # regenerate articles + data/fr/posts.json
```

## 7. Local preview

```bash
python3 -m http.server 8080   # from the repo root
# → http://localhost:8080/gloulou/index.html
```

## 8. Content migration notes

- Content was migrated from immobilieregloulou.com: 21 projects, 88 posts (86 kept: the two karting tender posts were dropped), 31 videos and 334 images.
- Cleaned up along the way: fake Unicode bold, typos, slugs, 6 untitled progress posts (now titled from their photos), English UI leftovers, the exposed employee username and outdated names (HC9 → KOYA).
- Project websites are linked only where the subdomain answers (fuji, carthage, belazur, silvana).
