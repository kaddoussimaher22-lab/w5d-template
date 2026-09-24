/* ==========================================================================
 * Gloulou — Core engine  (W5D static kit)
 * --------------------------------------------------------------------------
 *  - Loads config/site.json + config/i18n/{lang}.json
 *  - Resolves the active language (?lang=xx › localStorage › default)
 *  - Fetches content/{lang}/{page}.md (falls back to the default language)
 *  - Parses front-matter + Markdown + ::: component directives
 *  - Exposes a tiny component registry used by /js/components/*.js
 * ========================================================================== */
(function () {
  'use strict';

  const G = (window.G = window.G || {});
  G.base = (document.currentScript && document.currentScript.dataset.base) || G.base || '';
  G.components = {};
  G.dict = {};
  G.config = null;

  /* ---------------- utilities ---------------- */
  G.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  G.slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  G.inline = (s) => (window.marked ? marked.parseInline(String(s ?? '')) : G.esc(s));
  G.md = (s) => (window.marked ? marked.parse(String(s ?? '')) : '<p>' + G.esc(s) + '</p>');
  G.icon = (name, cls = 'ico') => name ? `<i data-lucide="${G.esc(name)}" class="${cls}" aria-hidden="true"></i>` : '';
  G.refreshIcons = () => { if (window.lucide) try { lucide.createIcons(); } catch (e) { /* noop */ } };
  G.url = (p) => G.base + p;

  async function getJSON(path) {
    const r = await fetch(G.url(path), { cache: 'no-cache' });
    if (!r.ok) throw new Error(path + ' → ' + r.status);
    return r.json();
  }
  async function getText(path) {
    const r = await fetch(G.url(path), { cache: 'no-cache' });
    if (!r.ok) throw new Error(path + ' → ' + r.status);
    return r.text();
  }

  /* ---------------- language ---------------- */
  function resolveLang(cfg) {
    const enabled = cfg.languages.filter((l) => l.enabled).map((l) => l.code);
    const q = new URLSearchParams(location.search).get('lang');
    const stored = localStorage.getItem('gloulou-lang');
    const pick = [q, stored, cfg.defaultLang].find((c) => c && enabled.includes(c));
    return pick || cfg.defaultLang;
  }
  G.setLang = (code) => {
    localStorage.setItem('gloulou-lang', code);
    const u = new URL(location.href);
    u.searchParams.set('lang', code);
    location.href = u.toString();
  };

  /** Translate a key. Supports {placeholders}. Falls back to the key. */
  G.t = (key, vars) => {
    let s = G.dict[key] ?? key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
    return s;
  };

  /* ---------------- boot (config + dictionary) ---------------- */
  G.ready = (async () => {
    G.config = await getJSON('config/site.json');
    G.lang = resolveLang(G.config);
    const meta = G.config.languages.find((l) => l.code === G.lang) || {};
    document.documentElement.lang = G.lang;
    document.documentElement.dir = meta.dir || 'ltr';
    // default dictionary first, then overlay the active language
    const def = await getJSON(`config/i18n/${G.config.defaultLang}.json`);
    let cur = {};
    if (G.lang !== G.config.defaultLang) cur = await getJSON(`config/i18n/${G.lang}.json`).catch(() => ({}));
    G.dict = Object.assign({}, def, cur);
    return G;
  })();

  /* ---------------- component registry ---------------- */
  /** G.component('stats', ({attrs, rows, header, body}) => html) */
  G.component = (name, render) => { G.components[name] = render; };

  /* ---------------- directive parsing ----------------
   *  ::: name key="value" flag
   *  # Col A | Col B | Col C          ← optional header row
   *  cell | cell | cell               ← data rows
   *  > free markdown body line        ← body (for intro text)
   *  :::
   * ------------------------------------------------------------------ */
  function parseAttrs(str) {
    const out = {};
    const re = /([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
    let m;
    while ((m = re.exec(str || ''))) out[m[1]] = m[2] ?? m[3] ?? m[4] ?? true;
    return out;
  }
  const splitRow = (line) => line.split('|').map((c) => c.trim());

  function parseDirective(name, attrLine, lines) {
    const rows = [], body = [];
    let header = null;
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith('#') && !header && !rows.length) { header = splitRow(line.replace(/^#\s*/, '')); continue; }
      if (line.startsWith('>')) { body.push(line.replace(/^>\s?/, '')); continue; }
      rows.push(splitRow(line));
    }
    return { name, attrs: parseAttrs(attrLine), header, rows, body: body.join('\n') };
  }

  function renderDirective(d) {
    const fn = G.components[d.name];
    if (!fn) return `<div class="g-missing">Composant inconnu : <code>${G.esc(d.name)}</code></div>`;
    try { return fn(d); }
    catch (e) { console.error('[gloulou] component', d.name, e); return `<div class="g-missing">Erreur composant <code>${G.esc(d.name)}</code></div>`; }
  }

  /* ---------------- front-matter ---------------- */
  function parseFrontMatter(src) {
    const m = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(src);
    if (!m) return { meta: {}, body: src };
    const meta = {};
    m[1].split('\n').forEach((l) => {
      const i = l.indexOf(':');
      if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    });
    return { meta, body: src.slice(m[0].length) };
  }

  /* ---------------- sections (## Heading {#id eyebrow="…" tone="dark"}) ---------------- */
  function splitSections(body) {
    const out = [];
    let cur = { head: null, lines: [] };
    body.split('\n').forEach((line) => {
      const h = /^##\s+(.+?)\s*(?:\{([^}]*)\})?\s*$/.exec(line);
      if (h && !line.startsWith('###')) {
        out.push(cur);
        const a = parseAttrs((h[2] || '').replace(/#([\w-]+)/, 'id=$1'));
        cur = { head: { title: h[1], id: a.id || G.slug(h[1]), attrs: a }, lines: [] };
      } else cur.lines.push(line);
    });
    out.push(cur);
    return out.filter((s) => s.head || s.lines.join('').trim());
  }

  /** Render a markdown chunk that may contain ::: directives. */
  G.renderChunk = (src) => {
    const lines = src.split('\n');
    let html = '', buf = [];
    const flush = () => { if (buf.join('').trim()) html += G.md(buf.join('\n')); buf = []; };
    for (let i = 0; i < lines.length; i++) {
      const open = /^:::\s*([\w-]+)\s*(.*)$/.exec(lines[i].trim());
      if (open) {
        flush();
        const inner = [];
        i++;
        while (i < lines.length && lines[i].trim() !== ':::') inner.push(lines[i++]);
        html += renderDirective(parseDirective(open[1], open[2], inner));
      } else buf.push(lines[i]);
    }
    flush();
    return html;
  };

  /** Full page: front-matter + sections + directives. */
  G.renderPage = (src) => {
    const { meta, body } = parseFrontMatter(src);
    const sections = splitSections(body);
    const toc = [];
    const html = sections.map((s) => {
      if (!s.head) return G.renderChunk(s.lines.join('\n'));
      const a = s.head.attrs;
      if (a.toc !== 'false') toc.push({ id: s.head.id, title: s.head.title, icon: a.icon });
      const eyebrow = a.eyebrow ? `<p class="eyebrow">${G.icon(a.icon, 'ico ico-sm')}${G.esc(a.eyebrow)}</p>` : '';
      return `<section id="${G.esc(s.head.id)}" class="g-section tone-${G.esc(a.tone || 'light')}" data-rv>
        <div class="container ${a.width === 'narrow' ? 'narrow' : ''}">
          <header class="section-head">${eyebrow}<h2>${G.inline(s.head.title)}</h2></header>
          <div class="prose">${G.renderChunk(s.lines.join('\n'))}</div>
        </div></section>`;
    }).join('');
    return { meta, html, toc };
  };

  /** Load content/{lang}/{page}.md with fallback to default language. */
  G.loadPage = async (page) => {
    await G.ready;
    try { return await getText(`content/${G.lang}/${page}.md`); }
    catch (e) {
      if (G.lang === G.config.defaultLang) throw e;
      console.warn('[gloulou] fallback to default language for', page);
      return getText(`content/${G.config.defaultLang}/${page}.md`);
    }
  };

  /* ---------------- scroll reveal ---------------- */
  G.observeReveal = (root = document) => {
    if (!('IntersectionObserver' in window)) { root.querySelectorAll('[data-rv]').forEach((el) => el.classList.add('rv-in')); return; }
    const io = G._rvIO || (G._rvIO = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); }
    }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }));
    root.querySelectorAll('[data-rv]:not(.rv-in)').forEach((el) => io.observe(el));
  };

  /** Fire a callback once, when the element enters the viewport. */
  G.onVisible = (el, cb, threshold = 0.3) => {
    if (!('IntersectionObserver' in window)) return cb();
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); cb(); } }), { threshold });
    io.observe(el);
  };
  G.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
})();
