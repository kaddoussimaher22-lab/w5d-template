/* ==========================================================================
 * Gloulou × W5D — Block library (:::directives), part 1: marketing sections
 * Ported from the W5D template (/pages/heros.html, sections.html, blocks.html)
 *
 *  hero            variants: aurora | split | editorial | starfield | beam | image | page
 *  logos           animated marquee of words / brand chips
 *  stats           animated counters (glass cards, gradient numbers)
 *  features        3-up icon grid
 *  zigzag          alternating image / text splits
 *  bento           bento highlights grid
 *  steps           how-it-works numbered steps
 *  timeline        milestones
 *  quote           big editorial quote
 *  testimonials    card wall
 *  faq             accordion
 *  cta             CTA banner (gradient) / cta-card
 *  headline        marquee headline band
 *  section         section header (eyebrow + title + intro)
 *  gallery         lightbox gallery
 *  video / videos  video cards → popup modal (never autoplay)
 *  tabs            tabbed panels
 *  map             Google map embed (lazy)
 *  contact-cards   contact info tiles
 *  form            contact / callback / referral / newsletter forms
 *  html            raw passthrough (escape hatch)
 * ========================================================================== */
(function () {
  'use strict';
  const G = window.G;
  const { esc, inline, icon, md, t, url, img } = G;
  const btns = (rows, center) => rows.length ? `<div class="mt-9 flex flex-wrap gap-3 ${center ? 'justify-center' : ''}">${rows.map(([l, h, s, i]) => `<a href="${url(h)}" class="btn btn-${esc(s || 'primary')} shine" ${/^https?:/.test(h) ? 'target="_blank" rel="noopener"' : ''} ${/^video:/.test(h) ? `data-video="${esc(h.slice(6))}" data-title="${esc(l)}"` : ''}>${icon(i, 'w-4 h-4')}${esc(l)}</a>`).join('')}</div>` : '';
  const btnRows = (rows) => rows.filter((r) => r.length >= 2 && (r[1] || '').match(/^(#|https?:|mailto:|tel:|video:|[\w-]+\.html)/));
  const wrap = (inner, attrs = {}, extra = '') => `<section ${attrs.id ? `id="${esc(attrs.id)}"` : ''} class="relative overflow-hidden ${attrs.tone === 'soft' ? 'bg-soft' : ''} ${attrs.tone === 'dark' ? 'bg-ink-950 text-stone-100 dark' : ''} ${attrs.border !== 'false' ? 'border-t line' : ''} py-20 sm:py-24 ${extra}">${inner}</section>`;
  const head = (a, body, center = true) => (a.title || a.eyebrow) ? `
    <div class="${center ? 'text-center mx-auto' : ''} max-w-3xl mb-12 sm:mb-14" data-rv="up">
      ${a.eyebrow ? `<span class="eyebrow">${icon(a.icon, 'w-4 h-4')}${esc(a.eyebrow)}</span>` : ''}
      ${a.title ? `<h2 class="font-display text-3xl sm:text-5xl font-bold mt-3 ink leading-[1.08]">${inline(a.title)}</h2>` : ''}
      ${body ? `<p class="mt-5 text-lg muted">${inline(body)}</p>` : ''}
    </div>` : '';
  G.sectionHead = head; G.wrapSection = wrap; G.btns = btns;

  /* ============================== HERO ============================== */
  G.block('hero', ({ attrs: a, rows, body }) => {
    const v = a.variant || 'aurora';
    const actions = btns(btnRows(rows), v !== 'split' && v !== 'image-left');
    const chips = rows.filter((r) => r[0] === 'chip').map((r) => `<span class="inline-flex items-center gap-1.5">${icon(r[2] || 'check', 'w-4 h-4 text-brand-500')}${esc(r[1])}</span>`).join('');
    const meta = chips ? `<div class="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm muted ${v === 'split' ? '' : 'justify-center'}" data-rv="up">${chips}</div>` : '';
    const badge = a.badge ? `<span data-rv="up" class="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold ink"><span class="relative inline-flex w-2 h-2 rounded-full bg-brand-500 pulse-ring"></span>${esc(a.badge)}</span>` : '';
    const title = `<h1 data-rv="up" class="font-display font-bold ink leading-[1.04] ${v === 'editorial' ? 'text-[clamp(3rem,10vw,8.5rem)] tracking-tighter' : v === 'page' ? 'text-4xl sm:text-6xl' : 'text-5xl sm:text-6xl lg:text-7xl'} mt-6">${inline(a.title || '')}</h1>`;
    const sub = body ? `<p data-rv="up" class="mt-6 text-lg sm:text-xl muted ${v === 'split' ? '' : 'max-w-2xl mx-auto'}">${inline(body)}</p>` : '';
    const crumbs = a.crumbs ? `<nav aria-label="Fil d'Ariane" class="text-xs faint mb-2 flex items-center gap-1.5 ${v === 'page' ? 'justify-center' : ''}" data-rv="up"><a href="${url('index.html')}" class="hover:text-brand-600">${esc(t('nav.home'))}</a>${a.crumbs.split('>').map((c) => { const [l, h] = c.split('@').map((x) => x.trim()); return `${icon('chevron-right', 'w-3 h-3')}${h ? `<a href="${url(h)}" class="hover:text-brand-600">${esc(l)}</a>` : `<span class="muted">${esc(l)}</span>`}`; }).join('')}</nav>` : '';
    const bg = {
      aurora: `<div class="aurora"></div><div class="absolute inset-0 grid-bg"></div>`,
      starfield: `<div class="absolute inset-0 bg-ink-950"></div><div class="stars"></div><div class="conic-spin"></div>`,
      beam: `<div class="absolute inset-0 grid-bg"></div><div class="beam"></div><div class="orb orb-1 w-[420px] h-[420px] -top-32 -left-24"></div>`,
      editorial: `<div class="absolute inset-0 grid-bg"></div><div class="orb orb-3 w-[420px] h-[420px] top-10 right-0"></div>`,
      page: `<div class="absolute inset-0 grid-bg"></div><div class="orb orb-1 w-[420px] h-[420px] -top-32 -left-20"></div><div class="orb orb-2 w-[380px] h-[380px] top-10 right-0"></div>`,
    };
    if (v === 'split' || v === 'image') {
      const media = a.video
        ? `<button class="video-card media-frame block w-full aspect-[4/3] group" data-video="${esc(a.video)}" data-title="${esc(a.videoTitle || a.title || '')}"><img src="${img(a.image)}" alt="${esc(a.alt || '')}" class="absolute inset-0 zoom-img"><span class="shade"></span><span class="play-btn">${icon('play', 'w-7 h-7 ml-1')}</span><span class="absolute left-5 bottom-5 z-[2] text-white text-sm font-semibold flex items-center gap-2">${icon('film', 'w-4 h-4')} ${esc(a.videoTitle || t('video.watch'))}</span></button>`
        : `<div class="media-frame aspect-[4/3]"><img src="${img(a.image)}" alt="${esc(a.alt || '')}" class="w-full h-full object-cover" fetchpriority="high"></div>`;
      return `<section class="relative pt-36 sm:pt-40 pb-20 overflow-hidden">
        <div class="absolute inset-0 grid-bg"></div><div class="orb orb-1 w-[480px] h-[480px] -top-32 -left-32"></div><div class="orb orb-2 w-[420px] h-[420px] bottom-0 right-0"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>${crumbs}${badge}${title}${sub}${actions}${meta}</div>
          <div class="relative" data-rv="zoom"><div class="grad-border rounded-[1.6rem] glass p-2 shadow-2xl shadow-brand-600/10">${media}</div>
            ${a.chip1 ? `<div class="hidden md:flex absolute -left-6 top-10 glass rounded-xl px-3 py-2 items-center gap-2 text-xs font-semibold ink float-y">${icon('map-pin', 'w-4 h-4 text-brand-500')} ${esc(a.chip1)}</div>` : ''}
            ${a.chip2 ? `<div class="hidden md:flex absolute -right-4 bottom-10 glass rounded-xl px-3 py-2 items-center gap-2 text-xs font-semibold ink float-y" style="animation-delay:-3s">${icon('leaf', 'w-4 h-4 text-emerald-500')} ${esc(a.chip2)}</div>` : ''}
          </div></div></section>`;
    }
    if (v === 'cover') {
      return `<section class="relative min-h-[92vh] flex items-end overflow-hidden bg-ink-950 text-white">
        <img src="${img(a.image)}" alt="${esc(a.alt || '')}" class="absolute inset-0 w-full h-full object-cover opacity-70 scale-105 hero-kenburns" fetchpriority="high">
        <div class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/10"></div><div class="beam"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-40 w-full dark">${crumbs}${badge}${title.replace('ink', 'text-white')}${sub}${actions}${meta}</div></section>`;
    }
    const dark = v === 'starfield';
    return `<section class="relative ${v === 'page' ? 'pt-36 pb-16' : 'pt-40 pb-24 sm:pb-28'} overflow-hidden ${dark ? 'dark text-white' : ''}">${bg[v] || bg.aurora}
      <div class="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">${crumbs}${badge}${title}${sub}${actions}${meta}
      ${v !== 'page' && a.scroll !== 'false' ? `<a href="#${esc(a.scroll || 'main')}" class="inline-flex mt-12 faint bounce-y" aria-label="Défiler">${icon('chevrons-down', 'w-6 h-6')}</a>` : ''}</div></section>`;
  });

  /* ============================== SECTION HEADER ============================== */
  G.block('section', ({ attrs: a, body }) => `<div ${a.id ? `id="${esc(a.id)}"` : ''} class="relative ${a.tone === 'soft' ? 'bg-soft' : ''} border-t line pt-20 sm:pt-24 pb-2"><div class="max-w-7xl mx-auto px-4 sm:px-6">${head(a, body, a.align !== 'left')}</div></div>`);

  /* ============================== LOGOS / MARQUEE ============================== */
  G.block('logos', ({ attrs: a, rows }) => {
    const items = rows.map(([label, ic]) => `<span class="inline-flex items-center gap-2.5 text-lg sm:text-xl font-display font-semibold faint hover:text-brand-600 transition whitespace-nowrap">${icon(ic || 'sparkle', 'w-5 h-5 text-brand-500')}${esc(label)}</span>`).join('');
    return `<section class="py-12 border-y line" data-rv="fade"><div class="max-w-7xl mx-auto px-4 sm:px-6">
      ${a.title ? `<p class="text-center text-xs uppercase tracking-[0.25em] faint mb-8">${esc(a.title)}</p>` : ''}
      <div class="marquee"><div class="marquee-track items-center">${items}${items}</div></div></div></section>`;
  });
  G.block('headline', ({ rows }) => {
    const items = rows.map(([w]) => `<span class="font-display font-black text-[clamp(2.5rem,8vw,6.5rem)] leading-none tracking-tighter ${Math.random() > .5 ? 'gradient-text' : 'ink'}">${esc(w)}</span><span class="font-display text-[clamp(2.5rem,8vw,6.5rem)] leading-none text-brand-500">✦</span>`).join('');
    return `<section class="py-14 border-y line overflow-hidden"><div class="headline-marquee items-center">${items}${items}</div></section>`;
  });

  /* ============================== STATS ============================== */
  G.block('stats', ({ attrs: a, rows, body }) => wrap(`<div class="max-w-7xl mx-auto px-4 sm:px-6">${head(a, body)}
    <div class="grid grid-cols-2 lg:grid-cols-${Math.min(rows.length, 4)} gap-4 sm:gap-6 stagger">
      ${rows.map(([v, suf, label, ic, note]) => `<div data-rv="up" class="group surface rounded-2xl p-6 text-center lift">
        ${ic ? `<span class="ico-tile mx-auto mb-4">${icon(ic)}</span>` : ''}
        <div class="font-display text-4xl sm:text-5xl font-bold gradient-text stat-num"><span data-counter="${G.num(v)}" data-decimals="${String(v).includes('.') ? 1 : 0}">0</span>${esc(suf || '')}</div>
        <p class="mt-2 text-sm font-semibold ink">${inline(label)}</p>${note ? `<p class="text-xs faint mt-1">${inline(note)}</p>` : ''}</div>`).join('')}
    </div></div>`, a, a.compact ? '!py-14' : ''));

  /* ============================== FEATURES ============================== */
  G.block('features', ({ attrs: a, rows, body }) => wrap(`<div class="max-w-7xl mx-auto px-4 sm:px-6">${head(a, body)}
    <div class="grid md:grid-cols-2 lg:grid-cols-${a.cols || 3} gap-5 stagger">
      ${rows.map(([ic, title, text, link]) => `<div data-rv="up" class="group surface rounded-2xl p-7 lift ${a.style === 'spotlight' ? 'spotlight' : ''}">
        <span class="ico-tile mb-5">${icon(ic || 'star')}</span>
        <h3 class="font-display text-xl font-semibold ink">${inline(title)}</h3>
        <p class="mt-2.5 muted text-[15px] leading-relaxed">${inline(text || '')}</p>
        ${link ? `<a href="${url(link.split('@')[1] || '#')}" class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400 link-underline">${esc(link.split('@')[0])} ${icon('arrow-right', 'w-4 h-4')}</a>` : ''}
      </div>`).join('')}</div></div>`, a));

  /* ============================== ZIGZAG ============================== */
  G.block('zigzag', ({ attrs: a, rows, body }) => wrap(`<div class="max-w-7xl mx-auto px-4 sm:px-6">${head(a, body)}<div class="space-y-20 sm:space-y-24">
    ${rows.map(([image, eyebrow, title, text, points, link], i) => `<div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      <div class="${i % 2 ? 'lg:order-2' : ''}" data-rv="${i % 2 ? 'left' : 'right'}"><div class="media-frame aspect-[4/3] tilt shadow-2xl shadow-brand-900/10 zoom-img"><img src="${img(image)}" alt="${esc(title)}" loading="lazy" class="w-full h-full object-cover"></div></div>
      <div data-rv="${i % 2 ? 'right' : 'left'}"><span class="eyebrow">${esc(eyebrow || '')}</span>
        <h3 class="font-display text-3xl sm:text-4xl font-bold ink mt-3 leading-tight">${inline(title)}</h3>
        <p class="mt-4 muted text-lg leading-relaxed">${inline(text || '')}</p>
        ${points ? `<ul class="mt-6 space-y-3">${points.split(';').map((p) => `<li class="flex gap-3 ink">${icon('check-circle-2', 'w-5 h-5 text-brand-500 flex-none mt-0.5')}<span>${inline(p.trim())}</span></li>`).join('')}</ul>` : ''}
        ${link ? `<a href="${url(link.split('@')[1] || '#')}" class="btn btn-ghost mt-8">${esc(link.split('@')[0])} ${icon('arrow-right', 'w-4 h-4')}</a>` : ''}
      </div></div>`).join('')}</div></div>`, a));

  /* ============================== BENTO ============================== */
  G.block('bento', ({ attrs: a, rows, body }) => {
    const spans = ['lg:col-span-2 lg:row-span-2', '', '', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-2'];
    return wrap(`<div class="max-w-7xl mx-auto px-4 sm:px-6">${head(a, body)}
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(220px,auto)] gap-4 stagger">
      ${rows.map(([ic, title, text, image, link], i) => `<a ${link ? `href="${url(link)}"` : ''} data-rv="zoom" class="group relative overflow-hidden rounded-3xl ${image ? 'text-white bg-ink-900' : 'surface'} p-7 flex flex-col justify-end lift ${spans[i % spans.length]}">
        ${image ? `<img src="${img(image)}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-[1.2s] group-hover:scale-105"><span class="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/40 to-transparent"></span>` : `<div class="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand-500/10 blur-2xl group-hover:bg-brand-500/20 transition"></div>`}
        <div class="relative ${image ? 'dark' : ''}"><span class="ico-tile mb-4 ${image ? '!bg-white/15 !text-white' : ''}">${icon(ic || 'sparkles')}</span>
          <h3 class="font-display text-xl sm:text-2xl font-bold ${image ? 'text-white' : 'ink'}">${inline(title)}</h3>
          <p class="mt-2 text-sm ${image ? 'text-white/80' : 'muted'} max-w-md">${inline(text || '')}</p></div></a>`).join('')}
      </div></div>`, a);
  });

  /* ============================== STEPS ============================== */
  G.block('steps', ({ attrs: a, rows, body }) => wrap(`<div class="max-w-7xl mx-auto px-4 sm:px-6">${head(a, body)}
    <div class="relative grid md:grid-cols-2 lg:grid-cols-${Math.min(rows.length, 4)} gap-6 stagger">
      <div class="hidden lg:block absolute top-7 left-[12%] right-[12%] h-px bg-gradient-to-r from-brand-600/0 via-brand-500/60 to-brand-600/0"></div>
      ${rows.map(([ic, title, text], i) => `<div data-rv="up" class="group relative text-center px-2">
        <div class="relative mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-500 text-white grid place-items-center shadow-lg shadow-brand-600/30 breath">${icon(ic || 'circle')}<span class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--surface)] border line text-[11px] font-bold ink grid place-items-center">${i + 1}</span></div>
        <h3 class="font-display text-lg font-semibold ink mt-5">${inline(title)}</h3>
        <p class="mt-2 text-sm muted">${inline(text || '')}</p></div>`).join('')}</div></div>`, a));

  /* ============================== TIMELINE ============================== */
  G.block('timeline', ({ attrs: a, rows, body }) => wrap(`<div class="max-w-4xl mx-auto px-4 sm:px-6">${head(a, body)}
    <ol class="relative">
      <span class="timeline-line absolute left-[19px] sm:left-1/2 top-2 bottom-2 w-[2px] sm:-ml-px rounded"></span>
      ${rows.map(([year, title, text, ic], i) => `<li class="relative grid sm:grid-cols-2 gap-4 sm:gap-12 pb-12 last:pb-0 pl-14 sm:pl-0" data-rv="${i % 2 ? 'left' : 'right'}">
        <span class="absolute left-0 sm:left-1/2 sm:-ml-5 top-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-cyan-500 text-white grid place-items-center shadow-lg shadow-brand-600/30 ring-4 ring-[var(--bg)]">${icon(ic || 'flag', 'w-4 h-4')}</span>
        <div class="${i % 2 ? 'sm:order-2 sm:pl-2' : 'sm:text-right sm:pr-2'}"><span class="font-display text-3xl font-bold gradient-text">${esc(year)}</span></div>
        <div class="${i % 2 ? 'sm:text-right sm:pr-2' : 'sm:pl-2'} surface rounded-2xl p-5"><h3 class="font-display text-lg font-semibold ink">${inline(title)}</h3><p class="mt-1.5 text-sm muted">${inline(text || '')}</p></div>
      </li>`).join('')}</ol></div>`, a));

  /* ============================== QUOTE ============================== */
  G.block('quote', ({ attrs: a, body }) => wrap(`<div class="max-w-5xl mx-auto px-4 sm:px-6 text-center" data-rv="zoom">
    ${icon('quote', 'w-12 h-12 mx-auto text-brand-500 opacity-80')}
    <blockquote class="font-serif italic text-3xl sm:text-5xl leading-tight ink mt-6">${inline(body)}</blockquote>
    ${a.author ? `<p class="mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-gold-500">— ${esc(a.author)}</p>` : ''}</div>`, a, 'mesh-bg'));

  /* ============================== TESTIMONIALS ============================== */
  G.block('testimonials', ({ attrs: a, rows, body }) => wrap(`<div class="max-w-7xl mx-auto px-4 sm:px-6">${head(a, body)}
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">${rows.map(([text, name, role, ic]) => `<figure data-rv="up" class="surface rounded-2xl p-7 lift">
      <div class="flex gap-0.5 text-gold-400">${'★★★★★'}</div><blockquote class="mt-4 ink leading-relaxed">« ${inline(text)} »</blockquote>
      <figcaption class="mt-6 flex items-center gap-3"><span class="ico-tile !w-11 !h-11">${icon(ic || 'user')}</span><span><span class="block font-semibold ink text-sm">${esc(name)}</span><span class="block text-xs faint">${esc(role || '')}</span></span></figcaption></figure>`).join('')}</div></div>`, a));

  /* ============================== FAQ ============================== */
  G.block('faq', ({ attrs: a, rows, body }) => wrap(`<div class="max-w-3xl mx-auto px-4 sm:px-6">${head(a, body)}
    <div class="space-y-3">${rows.map(([q, ans], i) => `<details class="faq-item surface rounded-2xl p-5 sm:p-6 transition" data-rv="up" ${i === 0 && a.open ? 'open' : ''}>
      <summary class="flex items-center justify-between gap-4 font-semibold ink">${inline(q)}<span class="faq-ico w-8 h-8 flex-none rounded-full border line grid place-items-center">${icon('plus', 'w-4 h-4')}</span></summary>
      <div class="mt-4 muted leading-relaxed prose-g !text-[15px]">${md(ans || '')}</div></details>`).join('')}</div></div>`, a));

  /* ============================== CTA ============================== */
  G.block('cta', ({ attrs: a, rows, body }) => `<section class="py-16 sm:py-20"><div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div data-rv="zoom" class="relative overflow-hidden rounded-[2rem] p-10 sm:p-14 text-white bg-gradient-to-br from-brand-700 via-brand-600 to-cyan-600 shadow-2xl shadow-brand-700/30">
      <div class="absolute inset-0 grid-bg opacity-30"></div><div class="beam"></div>
      ${a.image ? `<img src="${img(a.image)}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity">` : ''}
      <div class="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
        <div><h2 class="font-display text-3xl sm:text-5xl font-bold leading-tight">${inline(a.title || '')}</h2>${body ? `<p class="mt-4 text-white/85 text-lg max-w-xl">${inline(body)}</p>` : ''}</div>
        <div class="flex flex-wrap gap-3 lg:justify-end">${rows.map(([l, h, s, i]) => `<a href="${url(h)}" class="btn ${s === 'ghost' || s === 'light' ? 'btn-light' : 'bg-white text-brand-700 hover:-translate-y-0.5 shadow-lg'} shine" ${/^https?:/.test(h) ? 'target="_blank" rel="noopener"' : ''}>${icon(i, 'w-4 h-4')}${esc(l)}</a>`).join('')}</div>
      </div></div></div></section>`);

  /* ============================== GALLERY (lightbox) ============================== */
  G.block('gallery', ({ attrs: a, rows, body }) => {
    const cols = a.cols || 4;
    const items = rows.map(([src, alt], i) => `<a href="${img(src)}" data-gallery-item data-alt="${esc(alt || a.alt || '')}" class="gallery-item group relative block overflow-hidden rounded-2xl ${a.layout === 'masonry' && i % 5 === 0 ? 'sm:row-span-2' : ''} ${a.layout === 'masonry' ? '' : 'aspect-[4/3]'}" data-rv="zoom">
      <img src="${img(src)}" alt="${esc(alt || a.alt || '')}" loading="lazy" class="w-full h-full object-cover transition duration-[1.2s] group-hover:scale-110">
      <span class="absolute right-3 top-3 z-[2] w-9 h-9 rounded-full bg-black/45 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition">${icon('maximize-2', 'w-4 h-4')}</span></a>`).join('');
    const grid = `<div data-gallery class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${cols} gap-3 sm:gap-4 ${a.layout === 'masonry' ? 'auto-rows-[180px] sm:auto-rows-[220px]' : ''} stagger">${items}</div>`;
    if (a.bare) return `<div class="max-w-7xl mx-auto px-4 sm:px-6 my-10">${grid}</div>`;
    return wrap(`<div class="max-w-7xl mx-auto px-4 sm:px-6">${head(a, body)}${grid}</div>`, a);
  });

  /* ============================== VIDEO (popup, never autoplay) ============================== */
  const vCard = (id, title, cover, sub, big) => `<button type="button" data-video="${esc(id)}" data-title="${esc(title)}" class="video-card group media-frame block w-full text-left ${big ? 'aspect-video' : 'aspect-video'}" data-rv="zoom" aria-label="${esc(t('video.play'))} : ${esc(title)}">
    <img src="${cover ? img(cover) : `https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg`}" alt="" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-[1.2s] group-hover:scale-105">
    <span class="shade"></span><span class="play-btn ${big ? '' : '!w-14 !h-14'}">${icon('play', big ? 'w-7 h-7 ml-1' : 'w-5 h-5 ml-0.5')}</span>
    <span class="absolute left-4 right-4 bottom-4 z-[2] text-white"><span class="block font-display font-semibold ${big ? 'text-2xl' : 'text-base'} leading-snug line-clamp-2">${esc(title)}</span>${sub ? `<span class="block text-xs text-white/70 mt-1">${esc(sub)}</span>` : ''}</span></button>`;
  G.videoCard = vCard;
  G.block('video', ({ attrs: a, body }) => wrap(`<div class="max-w-5xl mx-auto px-4 sm:px-6">${head(a, body)}<div class="grad-border rounded-[1.6rem] glass p-2 shadow-2xl">${vCard(a.id, a.label || a.title || '', a.cover, a.sub, true)}</div>
    <p class="text-center text-xs faint mt-4 flex items-center justify-center gap-1.5">${icon('shield-check', 'w-3.5 h-3.5')} ${esc(t('video.note'))}</p></div>`, a));
  G.block('videos', async ({ attrs: a, rows, body }) => {
    let list = rows.map(([id, title, sub]) => ({ id, title, sub }));
    if (a.source) { const all = await G.load('videos'); list = all.filter((v) => !a.tag || (v.tags || []).includes(a.tag)).slice(0, +a.limit || 99); }
    const tags = a.filter ? [...new Set(list.flatMap((v) => v.tags || []))] : [];
    return wrap(`<div class="max-w-7xl mx-auto px-4 sm:px-6">${head(a, body)}
      ${tags.length ? `<div class="flex flex-wrap justify-center gap-2 mb-10" data-filter-group="videos"><button class="chip is-active" data-filter="*">${esc(t('common.all'))} <b>${list.length}</b></button>${tags.map((tg) => `<button class="chip" data-filter="${esc(tg)}">${esc(t('vtag.' + tg))} <b>${list.filter((v) => (v.tags || []).includes(tg)).length}</b></button>`).join('')}</div>` : ''}
      <div class="grid sm:grid-cols-2 lg:grid-cols-${a.cols || 3} gap-5" data-filter-target="videos">${list.map((v) => `<div data-tags="${esc((v.tags || []).join(' '))}">${vCard(v.id, v.title, v.cover, v.sub || v.date && G.fmtDate(v.date))}</div>`).join('')}</div>
      <p class="text-center text-xs faint mt-8 flex items-center justify-center gap-1.5">${icon('shield-check', 'w-3.5 h-3.5')} ${esc(t('video.note'))}</p></div>`, a);
  });

  /* ============================== TABS ============================== */
  G.block('tabs', ({ attrs: a, rows, body }) => wrap(`<div class="max-w-6xl mx-auto px-4 sm:px-6">${head(a, body)}<div data-tabs>
    <div class="flex flex-wrap justify-center gap-2 mb-10" role="tablist">${rows.map(([ic, label], i) => `<button role="tab" class="chip ${i ? '' : 'is-active'}" data-tab="${i}" aria-selected="${!i}">${icon(ic, 'w-4 h-4')} ${esc(label)}</button>`).join('')}</div>
    ${rows.map(([ic, label, title, text, image], i) => `<div data-tab-panel="${i}" class="${i ? 'hidden' : ''} grid lg:grid-cols-2 gap-10 items-center surface rounded-3xl p-6 sm:p-10">
      <div><h3 class="font-display text-2xl sm:text-3xl font-bold ink">${inline(title)}</h3><div class="mt-4 muted prose-g !text-base">${md((text || '').replace(/;\s*/g, '\n- ').replace(/^/, (text || '').includes(';') ? '- ' : ''))}</div></div>
      ${image ? `<div class="media-frame aspect-[4/3]"><img src="${img(image)}" alt="${esc(title)}" loading="lazy"></div>` : ''}</div>`).join('')}</div></div>`, a));

  /* ============================== MAP / CONTACT ============================== */
  G.block('map', ({ attrs: a }) => `<div class="max-w-7xl mx-auto px-4 sm:px-6 ${a.bare ? '' : 'my-10'}"><div class="map-frame surface rounded-3xl overflow-hidden" data-rv="zoom" style="height:${esc(a.height || 420)}px">
    <button type="button" class="w-full h-full grid place-items-center text-center bg-soft relative group" data-map-src="https://www.google.com/maps?q=${encodeURIComponent(a.q || '')}&output=embed">
      <div class="absolute inset-0 grid-bg"></div><span class="relative"><span class="ico-tile mx-auto mb-3 !w-14 !h-14">${icon('map', 'w-6 h-6')}</span><span class="block font-semibold ink">${esc(a.label || a.q)}</span><span class="block text-sm faint mt-1">${esc(t('map.load'))}</span></span></button></div></div>`);
  G.after((root) => root.querySelectorAll('[data-map-src]').forEach((b) => { b.onclick = () => { b.outerHTML = `<iframe src="${b.dataset.mapSrc}" class="w-full h-full border-0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Carte"></iframe>`; }; }));

  G.block('contact-cards', ({ attrs: a, rows }) => `<div class="max-w-7xl mx-auto px-4 sm:px-6 ${a.bare ? '' : 'my-12'}"><div class="grid sm:grid-cols-2 lg:grid-cols-${Math.min(rows.length, 4)} gap-4 stagger">
    ${rows.map(([ic, label, value, href]) => `<a ${href ? `href="${url(href)}"` : ''} data-rv="up" class="group surface rounded-2xl p-6 lift block"><span class="ico-tile mb-4">${icon(ic)}</span><p class="text-xs uppercase tracking-widest faint font-semibold">${esc(label)}</p><p class="mt-1.5 font-semibold ink">${inline(value)}</p></a>`).join('')}</div></div>`);

  /* ============================== FORMS (static — mailto/whatsapp handoff) ============================== */
  const fieldHTML = (f) => {
    const [type, name, label, opts, req] = f;
    const r = req === 'required' ? 'required' : '';
    const id = 'f-' + name;
    if (type === 'textarea') return `<div class="sm:col-span-2"><label class="form-label" for="${id}">${esc(label)}${r ? ' *' : ''}</label><textarea id="${id}" name="${esc(name)}" rows="5" class="field" ${r}></textarea></div>`;
    if (type === 'select') return `<div><label class="form-label" for="${id}">${esc(label)}${r ? ' *' : ''}</label><select id="${id}" name="${esc(name)}" class="field" ${r}><option value="">—</option>${(opts || '').split(';').map((o) => `<option>${esc(o.trim())}</option>`).join('')}</select></div>`;
    if (type === 'checkbox') return `<label class="sm:col-span-2 flex gap-3 text-sm muted items-start"><input type="checkbox" name="${esc(name)}" class="mt-1 accent-brand-600 w-4 h-4" ${r}> <span>${inline(label)}</span></label>`;
    return `<div class="${opts === 'full' ? 'sm:col-span-2' : ''}"><label class="form-label" for="${id}">${esc(label)}${r ? ' *' : ''}</label><input id="${id}" type="${esc(type)}" name="${esc(name)}" class="field" ${r} ${type === 'tel' ? 'inputmode="tel" autocomplete="tel"' : ''} ${type === 'email' ? 'autocomplete="email"' : ''}></div>`;
  };
  G.block('form', ({ attrs: a, rows, body }) => {
    const inner = `<form class="surface rounded-3xl p-6 sm:p-10 grid sm:grid-cols-2 gap-5" data-form="${esc(a.kind || 'contact')}" data-subject="${esc(a.subject || 'Contact site web')}" novalidate data-rv="up">
      ${a.title ? `<div class="sm:col-span-2"><h3 class="font-display text-2xl font-bold ink">${inline(a.title)}</h3>${body ? `<p class="muted mt-2">${inline(body)}</p>` : ''}</div>` : ''}
      ${rows.map(fieldHTML).join('')}
      <div class="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2"><button class="btn btn-primary shine" type="submit">${icon(a.icon || 'send', 'w-4 h-4')} ${esc(a.cta || t('form.send'))}</button>
        <span class="text-xs faint">${esc(t('form.privacy'))} <a href="${url('politique-de-confidentialite.html')}" class="underline">${esc(t('footer.privacy'))}</a></span></div>
      <div class="sm:col-span-2 form-msg hidden" data-form-msg role="status"></div></form>`;
    return a.bare ? inner : wrap(`<div class="max-w-4xl mx-auto px-4 sm:px-6">${head(a.heading ? { ...a, title: a.heading } : {}, '')}${inner}</div>`, a);
  });
  G.after((root) => root.querySelectorAll('form[data-form]').forEach((f) => {
    if (f.dataset.wired) return; f.dataset.wired = 1;
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = f.querySelector('[data-form-msg]');
      const bad = [...f.querySelectorAll('[required]')].find((el) => (el.type === 'checkbox' ? !el.checked : !el.value.trim()) || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)));
      msg.classList.remove('hidden', 'ok', 'err');
      if (bad) { msg.classList.add('err'); msg.textContent = t('form.invalid'); bad.focus(); return; }
      const data = [...new FormData(f).entries()].map(([k, v]) => `${k}: ${v}`).join('\n');
      const c = G.config.contact;
      msg.classList.add('ok');
      msg.innerHTML = `${esc(t('form.ok'))} <a class="underline font-semibold" href="mailto:${esc(c.email)}?subject=${encodeURIComponent(f.dataset.subject)}&body=${encodeURIComponent(data)}">${esc(t('form.byEmail'))}</a> · <a class="underline font-semibold" target="_blank" rel="noopener" href="https://wa.me/${esc(c.whatsapp)}?text=${encodeURIComponent(f.dataset.subject + '\n' + data)}">WhatsApp</a>`;
    });
  }));

  /* ============================== RAW HTML ============================== */
  G.block('html', ({ raw }) => raw);
  G.block('prose', ({ attrs: a, raw }) => `<div class="max-w-${a.width || '3xl'} mx-auto px-4 sm:px-6 my-12 prose-g" data-rv="up">${md(raw)}</div>`);

  /* ============================== behaviours ============================== */
  G.after((root) => {
    // counters (W5D data-counter)
    root.querySelectorAll('[data-counter]').forEach((el) => G.onVisible(el, () => {
      const to = +el.dataset.counter, dec = +el.dataset.decimals || 0;
      if (G.reduced) { el.textContent = to.toFixed(dec); return; }
      const t0 = performance.now(), dur = 1700;
      const step = (now) => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = (to * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, 0.4));
    // tabs
    root.querySelectorAll('[data-tabs]').forEach((g) => g.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => {
      g.querySelectorAll('[data-tab]').forEach((x) => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', x === b); });
      g.querySelectorAll('[data-tab-panel]').forEach((p) => p.classList.toggle('hidden', p.dataset.tabPanel !== b.dataset.tab));
    })));
    // generic chip filters
    root.querySelectorAll('[data-filter-group]').forEach((grp) => {
      const target = root.querySelector(`[data-filter-target="${grp.dataset.filterGroup}"]`);
      grp.querySelectorAll('[data-filter]').forEach((b) => (b.onclick = () => {
        grp.querySelectorAll('[data-filter]').forEach((x) => x.classList.toggle('is-active', x === b));
        target.querySelectorAll('[data-tags]').forEach((it) => { const ok = b.dataset.filter === '*' || it.dataset.tags.split(' ').includes(b.dataset.filter); it.hidden = !ok; if (ok) { it.style.animation = 'none'; it.offsetHeight; it.style.animation = 'megaIn .4s ease both'; } });
      }));
    });
  });
})();
