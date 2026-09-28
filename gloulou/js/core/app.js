/* ==========================================================================
 * Gloulou × W5D — Core engine
 * --------------------------------------------------------------------------
 *  • config/site.json        brand, languages, navigation (mega-menu), footer
 *  • config/i18n/{lang}.json UI strings
 *  • data/*.json             projects, posts index, videos (shared data)
 *  • content/{lang}/…md      every page body (front-matter + Markdown + ::: blocks)
 *
 *  Directive syntax inside Markdown:
 *      ::: block-name key="value" flag
 *      # Header | cells              (optional header row)
 *      cell | cell | cell            (rows)
 *      > markdown body line          (free text)
 *      :::
 * ========================================================================== */
(function () {
  'use strict';
  const G = (window.G = window.G || {});
  const script = document.currentScript;
  G.base = (script && script.dataset.base) || '';
  G.blocks = {};
  G.dict = {};
  G.data = {};
  G.hooks = [];               // functions run after each render (animations, charts…)

  /* ---------------- helpers ---------------- */
  G.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  G.slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  G.inline = (s) => (window.marked ? marked.parseInline(String(s ?? '')) : G.esc(s));
  G.md = (s) => (window.marked ? marked.parse(String(s ?? '')) : '<p>' + G.esc(s) + '</p>');
  G.icon = (n, cls = 'w-5 h-5') => (n ? `<i data-lucide="${G.esc(n)}" class="${cls}" aria-hidden="true"></i>` : '');
  G.url = (p) => (/^(https?:|mailto:|tel:|#|javascript:|\/)/.test(p || '') ? p : G.base + (p || ''));
  G.img = (p) => (!p ? '' : /^https?:/.test(p) ? p : G.base + 'assets/img/' + p);
  G.num = (v) => parseFloat(String(v).replace(/\s/g, '').replace(',', '.')) || 0;
  G.fmtDate = (d) => { try { return new Date(d + 'T12:00:00').toLocaleDateString(G.lang || 'fr', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return d; } };
  G.refreshIcons = () => { if (window.lucide) try { lucide.createIcons(); } catch (e) {} };
  G.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  G.q = (k) => new URLSearchParams(location.search).get(k);

  const cacheBust = '?v=3';
  async function getJSON(p) { const r = await fetch(G.base + p + cacheBust); if (!r.ok) throw new Error(p + ' ' + r.status); return r.json(); }
  async function getText(p) { const r = await fetch(G.base + p + cacheBust); if (!r.ok) throw new Error(p + ' ' + r.status); return r.text(); }
  G.getJSON = getJSON; G.getText = getText;

  /* ---------------- i18n ---------------- */
  G.t = (k, vars) => { let s = G.dict[k] ?? k; if (vars) s = s.replace(/\{(\w+)\}/g, (_, x) => vars[x] ?? ''); return s; };
  G.setLang = (code) => { localStorage.setItem('gloulou-lang', code); const u = new URL(location.href); u.searchParams.set('lang', code); location.href = u.toString(); };
  function pickLang(cfg) {
    const on = cfg.languages.filter((l) => l.enabled).map((l) => l.code);
    return [G.q('lang'), localStorage.getItem('gloulou-lang'), cfg.defaultLang].find((c) => c && on.includes(c)) || cfg.defaultLang;
  }

  /* ---------------- boot ---------------- */
  G.ready = (async () => {
    G.config = await getJSON('config/site.json');
    G.lang = pickLang(G.config);
    const meta = G.config.languages.find((l) => l.code === G.lang) || {};
    document.documentElement.lang = G.lang;
    document.documentElement.dir = meta.dir || 'ltr';
    const def = await getJSON(`config/i18n/${G.config.defaultLang}.json`);
    const cur = G.lang !== G.config.defaultLang ? await getJSON(`config/i18n/${G.lang}.json`).catch(() => ({})) : {};
    G.dict = Object.assign({}, def, cur);
    return G;
  })();

  /** Lazy shared data (projects, posts, videos) — per language with fallback */
  const dataCache = {};
  G.load = (name) => (dataCache[name] ||= (async () => {
    await G.ready;
    try { return await getJSON(`data/${G.lang}/${name}.json`); }
    catch (e) { return getJSON(`data/${G.config.defaultLang}/${name}.json`); }
  })().then((d) => (G.data[name] = d)));

  /* ---------------- markdown + directives ---------------- */
  G.block = (name, fn) => { G.blocks[name] = fn; };

  function parseAttrs(str) {
    const o = {}; const re = /([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g; let m;
    while ((m = re.exec(str || ''))) o[m[1]] = m[2] ?? m[3] ?? m[4] ?? true;
    return o;
  }
  G.parseAttrs = parseAttrs;
  const splitRow = (l) => l.replace(/\\\|/g, '\u0000').split('|').map((c) => c.replace(/\u0000/g, '|').trim());

  function parseBlock(name, attrLine, lines) {
    const rows = [], body = []; let header = null;
    lines.forEach((raw) => {
      const l = raw.trim(); if (!l) return;
      if (l.startsWith('# ') && !header && !rows.length) { header = splitRow(l.slice(2)); return; }
      if (l.startsWith('>')) { body.push(l.replace(/^>\s?/, '')); return; }
      rows.push(splitRow(l));
    });
    return { name, attrs: parseAttrs(attrLine), header, rows, body: body.join('\n') };
  }

  async function renderBlock(b, ctx) {
    const fn = G.blocks[b.name];
    if (!fn) return `<div class="max-w-3xl mx-auto my-6 p-4 rounded-xl border border-dashed border-brand-500 text-brand-600">Bloc inconnu : <code>${G.esc(b.name)}</code></div>`;
    try { return await fn(b, ctx); }
    catch (e) { console.error('[gloulou] block', b.name, e); return `<div class="max-w-3xl mx-auto my-6 p-4 rounded-xl border border-dashed border-brand-500">Erreur bloc <code>${G.esc(b.name)}</code></div>`; }
  }

  /** Render a Markdown source that may contain ::: blocks (blocks may nest one level with ::::). */
  G.render = async (src, ctx = {}) => {
    const lines = src.split('\n'); const out = []; let buf = [];
    const flush = () => { if (buf.join('').trim()) out.push(ctx.raw ? G.md(buf.join('\n')) : `<div class="max-w-3xl mx-auto px-4 sm:px-6 my-10 prose-g" data-rv="up">${G.md(buf.join('\n'))}</div>`); buf = []; };
    for (let i = 0; i < lines.length; i++) {
      const m = /^(:{3,4})\s*([\w-]+)\s*(.*)$/.exec(lines[i].trim());
      if (m) {
        flush();
        const fence = m[1]; const inner = []; i++;
        while (i < lines.length && lines[i].trim() !== fence) inner.push(lines[i++]);
        const b = parseBlock(m[2], m[3], inner);
        b.raw = inner.join('\n');
        out.push(await renderBlock(b, ctx));
      } else buf.push(lines[i]);
    }
    flush();
    return out.join('\n');
  };

  G.frontMatter = (src) => {
    const m = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(src);
    if (!m) return { meta: {}, body: src };
    const meta = {};
    m[1].split('\n').forEach((l) => { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, ''); });
    return { meta, body: src.slice(m[0].length) };
  };

  G.loadMD = async (path) => {
    await G.ready;
    try { return await getText(`content/${G.lang}/${path}.md`); }
    catch (e) { if (G.lang === G.config.defaultLang) throw e; return getText(`content/${G.config.defaultLang}/${path}.md`); }
  };

  G.setMeta = (meta) => {
    if (meta.title) document.title = meta.title;
    const set = (sel, attr, val) => { if (!val) return; let el = document.head.querySelector(sel); if (!el) { el = document.createElement('meta'); const [k, v] = attr; el.setAttribute(k, v); document.head.appendChild(el); } el.setAttribute('content', val); };
    set('meta[name="description"]', ['name', 'description'], meta.description);
    set('meta[property="og:title"]', ['property', 'og:title'], meta.title);
    set('meta[property="og:description"]', ['property', 'og:description'], meta.description);
    if (meta.image) set('meta[property="og:image"]', ['property', 'og:image'], G.img(meta.image));
  };

  /* ---------------- behaviours after render ---------------- */
  G.after = (fn) => G.hooks.push(fn);
  G.onVisible = (el, cb, th = 0.25) => {
    if (!('IntersectionObserver' in window)) return cb();
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); cb(); } }), { threshold: th });
    io.observe(el);
  };
  G.activate = (root = document) => {
    G.refreshIcons();
    const io = G._io || (G._io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('rv-in'); G._io.unobserve(e.target); } }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }));
    root.querySelectorAll('[data-rv]:not(.rv-in)').forEach((el) => io.observe(el));
    G.hooks.forEach((fn) => { try { fn(root); } catch (e) { console.error(e); } });
  };
})();
