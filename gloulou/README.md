# Immobilière Gloulou — Static site (W5D kit)

Premium static website for **Immobilière Gloulou**, built by **World 5 Dimensions (W5D)** on the `w5d-template` repository.
No build step: plain HTML + CSS + vanilla JS **Web Components**. Every page's content comes from a **Markdown file**.

## Pages

| URL | Content file | Layout |
|---|---|---|
| `gloulou/index.html` | `content/fr/accueil.md` | default (preview of the new homepage) |
| `gloulou/review.html` | `content/fr/review.md` | `report`: sticky table of contents, print/PDF |

`review.html` is the **audit of the current immobilieregloulou.com site**, written for Gloulou's SEO team. It includes animated counters, radial score gauges, a radar chart, a doughnut and a stacked bar chart (both computed from the issues register), animated bars, a project-information matrix, a filterable 46-item issues register, a typo correction table, 15 claim-vs-reality cards, and a 4-phase roadmap.

## Structure

```
gloulou/
├── index.html, review.html      ← thin shells (identical except src/layout)
├── config/
│   ├── site.json                ← brand, languages, nav, footer, contact
│   └── i18n/fr.json             ← UI strings (one file per language)
├── content/
│   └── fr/                      ← one .md per page (clone folder per language)
│       ├── accueil.md
│       └── review.md
├── css/gloulou.css              ← design system (light/dark, print)
├── js/core/app.js               ← engine: config, i18n, MD + directives
├── js/components/layout.js      ← <g-header> <g-footer> <g-page> <g-cookie> <g-progress>
└── js/components/blocks.js      ← ::: directive components
```

## Adding a page

1. Create `content/fr/ma-page.md`.
2. Copy `index.html` to `ma-page.html` and set `<g-page src="ma-page">`.
3. Add it to `nav` in `config/site.json` (label key in `config/i18n/fr.json`).

## Adding a language (e.g. Arabic)

1. In `config/site.json`, set `"enabled": true` on `ar` (its `dir` is already `rtl`).
2. Copy `config/i18n/fr.json` to `config/i18n/ar.json` and translate the values.
3. Copy `content/fr/` to `content/ar/` and translate the MD files.

The language comes from `?lang=ar`, then `localStorage`, then `defaultLang`. A language switcher appears in the header automatically once more than one language is enabled. If a page is missing in a language, the French version is used instead.

## Markdown authoring

**Front-matter** sets `title` and `description` (the SEO meta tags).

**Sections**: `## Title {#id eyebrow="…" icon="lucide-name" tone="soft|dark" width="narrow"}`. Each `##` becomes a full-width section and an entry in the report's table of contents.

**Components**: fenced with `:::`. Attributes go on the opening line. Each line inside is a row whose cells are separated by `|`. A line starting with `#` is the header row. Lines starting with `>` are free Markdown text.

| Directive | Row format |
|---|---|
| `hero` | attrs `badge eyebrow title meta`; `> subtitle`; rows `label \| href \| style \| icon` |
| `stats` | `value \| suffix \| label \| icon \| tone \| note` (animated counters) |
| `gauges big` | `label \| score(0-100) \| note` (animated radial rings) |
| `chart` | attrs `type(bar,line,radar,doughnut,pie) title height horizontal stacked max dashed`; `# Label \| Series…` + rows; or `source="issues" by="severity\|category"` |
| `bars` | `label \| value \| max \| tone \| note` |
| `cards cols=3` | `icon \| title \| text \| tag \| tone` |
| `issues` | `severity(critical,high,medium,low) \| category \| title \| detail \| where` (filterable) |
| `table style="typo"` | header + rows (`typo` shows wrong → right) |
| `compare` | `title \| claim \| reality \| fix \| severity` |
| `matrix` | header + `name \| yes/no/partial/? …` |
| `roadmap` | `phase \| title \| item; item \| tone \| icon` |
| `callout tone icon title` | `> body` |
| `checklist` | `text \| done/todo` |
| `quote author` | `> text` |
| `cta title` | `> body`; rows `label \| href \| style \| icon` |

Tones: `gold eco sky rose violet slate orange`. Icons: any [Lucide](https://lucide.dev) name.

To add a component, register it in `blocks.js` with `G.component('name', ({attrs, header, rows, body}) => html)`. It can then be used in any MD file as `::: name`.

## Run locally

```bash
python3 -m http.server 8080   # from repo root → http://localhost:8080/gloulou/review.html
```

Content is loaded with `fetch`, so the site must be served over HTTP. Opening the files directly with `file://` won't work.

## Privacy by design

`<g-cookie>` records the visitor's choice (`gloulou-consent` in localStorage). No analytics or tracking script is included. Any future tool (GA, Meta Pixel, Hotjar) must be loaded only after `accepted`.
