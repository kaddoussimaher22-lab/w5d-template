/* ==========================================================================
 * Gloulou × W5D — Block library, part 2: real-estate & editorial
 *   projects        filterable grid of projects (data/{lang}/projects.json)
 *   project-sheet   project hero + facts + about + gallery + video + CTA (by ?slug=)
 *   project-facts   key facts table for current project
 *   related         related projects
 *   posts           blog / news / progress list with category filter + pagination
 *   post            single article renderer (by ?slug=) — MD from content/{lang}/articles/
 *   post-nav        prev / next
 *   status-legend   legend for project statuses
 * ========================================================================== */
(function () {
  'use strict';
  const G = window.G;
  const { esc, inline, icon, t, url, img } = G;
  const ST = { livre: 'st-livre', chantier: 'st-chantier', lancement: 'st-lancement', commercial: 'st-commercial' };
  const statusBadge = (s) => `<span class="badge ${ST[s] || ''}">${esc(t('status.' + s))}</span>`;
  G.statusBadge = statusBadge;
  const projUrl = (p) => `projet.html?slug=${p.slug}`;
  const postUrl = (p) => `article.html?slug=${p.slug}`;
  G.projUrl = projUrl; G.postUrl = postUrl;

  /* ---------- project card ---------- */
  const pCard = (p) => `<a href="${url(projUrl(p))}" class="p-card group block surface rounded-3xl overflow-hidden lift" data-rv="up" data-tags="${esc(p.status)} ${esc(p.type)} ${esc(p.region)}">
    <div class="p-img relative overflow-hidden on-img"><img src="${img(p.cover)}" alt="${esc(p.name)} — ${esc(p.city)}" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-[1.2s] group-hover:scale-110">
      <div class="absolute left-4 top-4 z-[2] flex gap-2">${statusBadge(p.status)}</div>
      ${p.video ? `<span class="absolute right-4 top-4 z-[2] w-9 h-9 rounded-full bg-black/50 text-white grid place-items-center" title="${esc(t('video.available'))}">${icon('play', 'w-4 h-4 ml-0.5')}</span>` : ''}
      <div class="absolute left-5 right-5 bottom-4 z-[2] text-white"><p class="text-xs flex items-center gap-1.5 text-white/80">${icon('map-pin', 'w-3.5 h-3.5')} ${esc(p.city)}</p><h3 class="font-display text-2xl font-bold mt-1">${esc(p.name)}</h3></div></div>
    <div class="p-5 flex items-center justify-between gap-3"><p class="text-sm muted line-clamp-2">${esc(p.tagline)}</p><span class="w-10 h-10 flex-none rounded-full border line grid place-items-center group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition">${icon('arrow-up-right', 'w-4 h-4')}</span></div></a>`;
  G.pCard = pCard;

  G.block('projects', async ({ attrs: a, body }) => {
    let list = await G.load('projects');
    if (a.status) list = list.filter((p) => a.status.split(',').includes(p.status));
    if (a.type) list = list.filter((p) => p.type === a.type);
    if (a.featured) list = list.filter((p) => p.featured);
    if (a.limit) list = list.slice(0, +a.limit);
    const counts = (k, v) => list.filter((p) => p[k] === v).length;
    const statuses = ['lancement', 'chantier', 'livre', 'commercial'].filter((s) => counts('status', s));
    const filter = a.filter ? `<div class="flex flex-wrap justify-center gap-2 mb-10" data-filter-group="projects" data-rv="up">
      <button class="chip is-active" data-filter="*">${icon('layout-grid', 'w-4 h-4')} ${esc(t('common.all'))} <b>${list.length}</b></button>
      ${statuses.map((s) => `<button class="chip" data-filter="${s}">${esc(t('status.' + s))} <b>${counts('status', s)}</b></button>`).join('')}
      <span class="w-px bg-[var(--line-2)] mx-1 hidden sm:block"></span>
      ${['tunis', 'sahel'].map((r) => `<button class="chip" data-filter="${r}">${icon('map-pin', 'w-3.5 h-3.5')} ${esc(t('region.' + r))} <b>${counts('region', r)}</b></button>`).join('')}
    </div>` : '';
    return G.wrapSection(`<div class="max-w-7xl mx-auto px-4 sm:px-6">${G.sectionHead(a, body)}${filter}
      <div class="grid sm:grid-cols-2 lg:grid-cols-${a.cols || 3} gap-5" data-filter-target="projects">${list.map(pCard).join('')}</div>
      ${a.more ? `<div class="text-center mt-12" data-rv="up"><a href="${url(a.more)}" class="btn btn-ghost">${esc(t('projects.all'))} ${icon('arrow-right', 'w-4 h-4')}</a></div>` : ''}</div>`, a);
  });

  /* ---------- project sheet (template) ---------- */
  G.currentProject = async () => { const list = await G.load('projects'); return list.find((p) => p.slug === (G.page && G.page.slug)); };

  G.block('project-hero', async () => {
    const p = await G.currentProject(); if (!p) return '';
    return `<section class="relative min-h-[88vh] flex items-end overflow-hidden bg-ink-950 text-white">
      <img src="${img(p.cover)}" alt="${esc(p.name)}" class="absolute inset-0 w-full h-full object-cover opacity-60 hero-kenburns" fetchpriority="high">
      <div class="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/20"></div><div class="beam"></div><div class="absolute inset-0 grid-bg opacity-40"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 pt-40 pb-16 w-full dark">
        <nav class="text-xs text-white/60 mb-5 flex items-center gap-1.5" data-rv="up"><a href="${url('index.html')}" class="hover:text-white">${esc(t('nav.home'))}</a>${icon('chevron-right', 'w-3 h-3')}<a href="${url('projets.html')}" class="hover:text-white">${esc(t('nav.projects'))}</a>${icon('chevron-right', 'w-3 h-3')}<span class="text-white">${esc(p.name)}</span></nav>
        <div class="flex flex-wrap gap-2 on-img" data-rv="up">${statusBadge(p.status)}<span class="badge st-commercial">${esc(t('type.' + p.type))}</span></div>
        <h1 class="font-display font-bold text-5xl sm:text-7xl lg:text-8xl mt-5 leading-[1] tracking-tight" data-rv="up">${esc(p.name)}</h1>
        <p class="mt-5 text-xl text-white/80 max-w-2xl" data-rv="up">${esc(p.tagline)}</p>
        <div class="mt-9 flex flex-wrap gap-3" data-rv="up">
          <a href="#contact-projet" class="btn btn-primary shine">${icon('phone-call', 'w-4 h-4')} ${esc(t('project.callback'))}</a>
          ${p.video ? `<button class="btn btn-light" data-video="${esc(p.video)}" data-title="${esc(p.name)}">${icon('play-circle', 'w-4 h-4')} ${esc(t('video.watch'))}</button>` : ''}
          ${p.website ? `<a href="${esc(p.website)}" target="_blank" rel="noopener" class="btn btn-light">${icon('external-link', 'w-4 h-4')} ${esc(t('project.website'))}</a>` : ''}
        </div>
        <dl class="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3" data-rv="up">
          ${[['map-pin', t('project.location'), p.city], ['layout-grid', t('project.typologies'), p.units || '—'], ['building', t('project.height'), p.height || '—'], (p.architect ? ['pen-tool', t('project.architect'), p.architect] : ['calendar', t('project.delivery'), p.delivery || t('project.onRequest')])].map(([ic, k, v]) => `<div class="glass rounded-2xl p-4"><dt class="text-[11px] uppercase tracking-widest text-white/60 flex items-center gap-1.5">${icon(ic, 'w-3.5 h-3.5')} ${esc(k)}</dt><dd class="font-semibold mt-1 text-white">${esc(v)}</dd></div>`).join('')}
        </dl></div></section>`;
  });

  G.block('project-facts', async ({ attrs: a }) => {
    const p = await G.currentProject(); if (!p) return '';
    const facts = [
      ['badge-check', t('project.status'), t('status.' + p.status)], ['home', t('project.type'), t('type.' + p.type)],
      ['map-pin', t('project.location'), p.city], ['layout-grid', t('project.typologies'), p.units], ['building', t('project.height'), p.height],
      ['hash', t('project.count'), p.count], ['pen-tool', t('project.architect'), p.architect], ['calendar', t('project.delivery'), p.delivery || t('project.onRequest')],
      ['tag', t('project.price'), p.price || t('project.onRequest')],
    ].filter((f) => f[2]);
    return `<aside class="surface rounded-3xl p-6 sm:p-7 lg:sticky lg:top-28" data-rv="left">
      <h3 class="font-display text-lg font-bold ink flex items-center gap-2">${icon('clipboard-list', 'w-5 h-5 text-brand-500')} ${esc(t('project.facts'))}</h3>
      <dl class="mt-5 divide-y divide-[var(--line)]">${facts.map(([ic, k, v]) => `<div class="flex items-start justify-between gap-4 py-3"><dt class="text-sm faint flex items-center gap-2">${icon(ic, 'w-4 h-4')} ${esc(k)}</dt><dd class="text-sm font-semibold ink text-right">${esc(v)}</dd></div>`).join('')}</dl>
      <a href="#contact-projet" class="btn btn-primary w-full mt-6 shine">${icon('file-down', 'w-4 h-4')} ${esc(t('project.brochure'))}</a>
      <a href="https://wa.me/${esc(G.config.contact.whatsapp)}?text=${encodeURIComponent(t('project.waText', { name: p.name }))}" target="_blank" rel="noopener" class="btn btn-ghost w-full mt-2">${icon('message-circle', 'w-4 h-4')} WhatsApp</a>
    </aside>`;
  });

  /** Two-column: MD body (left) + facts (right). Usage: :::: project-body … :::: */
  G.block('project-body', async ({ raw }) => `<section class="py-20 border-t line"><div class="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-14 items-start">
      <div class="prose-g" data-rv="up">${await G.render(raw, { raw: true })}</div>${await G.blocks['project-facts']({ attrs: {} })}</div></section>`);

  G.block('project-gallery', async ({ attrs: a }) => {
    const p = await G.currentProject(); if (!p || !(p.gallery || []).length) return '';
    return G.blocks.gallery({ attrs: { eyebrow: t('project.galleryEyebrow'), title: a.title || t('project.gallery'), cols: 3, alt: p.name, tone: 'soft' }, rows: p.gallery.map((g) => [g, p.name]), body: '' });
  });
  G.block('project-video', async () => {
    const p = await G.currentProject(); if (!p || !p.video) return '';
    return G.blocks.video({ attrs: { id: p.video, eyebrow: t('video.eyebrow'), title: t('project.videoTitle', { name: p.name }), label: p.videoTitle || p.name, cover: p.cover }, body: '' });
  });
  G.block('project-progress', async () => {
    const p = await G.currentProject(); if (!p) return '';
    const posts = (await G.load('posts')).filter((x) => x.project === p.slug);
    if (!posts.length) return '';
    return G.blocks.posts({ attrs: { eyebrow: t('project.progressEyebrow'), title: t('project.progress', { name: p.name }), project: p.slug, limit: 6, cols: 3 }, body: '' });
  });
  G.block('related', async ({ attrs: a }) => {
    const list = await G.load('projects'); const cur = G.page && G.page.slug;
    const me = list.find((p) => p.slug === cur);
    const rel = list.filter((p) => p.slug !== cur).sort((x, y) => (y.region === (me && me.region)) - (x.region === (me && me.region)) || (y.status === (me && me.status)) - (x.status === (me && me.status))).slice(0, 3);
    return G.wrapSection(`<div class="max-w-7xl mx-auto px-4 sm:px-6">${G.sectionHead({ eyebrow: t('project.relatedEyebrow'), title: a.title || t('project.related') }, '')}<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${rel.map(pCard).join('')}</div></div>`, { tone: 'soft' });
  });
  G.block('status-legend', () => `<div class="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 mb-4" data-rv="fade"><div class="flex flex-wrap justify-center gap-3 text-xs muted">${['lancement', 'chantier', 'livre', 'commercial'].map((s) => `<span class="inline-flex items-center gap-2">${statusBadge(s)} ${esc(t('status.' + s + '.desc'))}</span>`).join('')}</div></div>`);

  /* ---------- posts (blog / actualités / avancements) ---------- */
  const catLabel = (c) => t('cat.' + c);
  const postCard = (p, big) => `<a href="${url(postUrl(p))}" class="post-card group block surface rounded-3xl overflow-hidden lift ${big ? 'lg:col-span-2 lg:grid lg:grid-cols-2' : ''}" data-rv="up" data-tags="${esc(p.cat)} ${esc(p.project || '')} y${esc(p.date.slice(0, 4))}">
    <div class="post-img relative overflow-hidden bg-soft ${big ? 'lg:aspect-auto lg:h-full' : ''}">${p.cover ? `<img src="${img(p.cover)}" alt="${esc(p.title)}" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition duration-[1.2s] group-hover:scale-105">` : `<div class="absolute inset-0 mesh-bg grid place-items-center">${icon('newspaper', 'w-10 h-10 text-brand-500')}</div>`}
      ${p.video ? `<span class="absolute right-4 top-4 w-9 h-9 rounded-full bg-black/55 text-white grid place-items-center">${icon('play', 'w-4 h-4 ml-0.5')}</span>` : ''}
      ${p.photos ? `<span class="absolute left-4 bottom-4 text-[11px] font-semibold text-white bg-black/55 rounded-full px-2.5 py-1 flex items-center gap-1">${icon('images', 'w-3.5 h-3.5')} ${p.photos}</span>` : ''}</div>
    <div class="p-6 ${big ? 'lg:p-10 lg:flex lg:flex-col lg:justify-center' : ''}"><div class="flex items-center gap-3 text-xs"><span class="cat-pill">${esc(catLabel(p.cat))}</span><time class="faint" datetime="${esc(p.date)}">${esc(G.fmtDate(p.date))}</time></div>
      <h3 class="font-display ${big ? 'text-2xl sm:text-3xl' : 'text-lg'} font-semibold ink mt-3 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">${esc(p.title)}</h3>
      <p class="mt-2 text-sm muted line-clamp-${big ? 4 : 2}">${esc(p.excerpt)}</p>
      <span class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-400">${esc(t('common.readMore'))} ${icon('arrow-right', 'w-4 h-4 transition group-hover:translate-x-1')}</span></div></a>`;
  G.postCard = postCard;

  G.block('posts', async ({ attrs: a, body }) => {
    let list = await G.load('posts');
    if (a.cat) list = list.filter((p) => a.cat.split(',').includes(p.cat));
    if (a.project) list = list.filter((p) => p.project === a.project);
    const pageSize = +a.pageSize || 0;
    const limited = a.limit ? list.slice(0, +a.limit) : list;
    const cats = [...new Set(list.map((p) => p.cat))];
    const years = [...new Set(list.map((p) => p.date.slice(0, 4)))];
    const filter = a.filter ? `<div class="flex flex-wrap justify-center gap-2 mb-10" data-filter-group="posts-${esc(a.id || 'x')}" data-rv="up">
      <button class="chip is-active" data-filter="*">${esc(t('common.all'))} <b>${list.length}</b></button>
      ${a.filter === 'year' ? years.map((y) => `<button class="chip" data-filter="y${y}">${y} <b>${list.filter((p) => p.date.startsWith(y)).length}</b></button>`).join('')
        : a.filter === 'project' ? [...new Set(list.map((p) => p.project).filter(Boolean))].map((pr) => `<button class="chip" data-filter="${esc(pr)}">${esc(t('proj.' + pr))} <b>${list.filter((p) => p.project === pr).length}</b></button>`).join('')
        : cats.map((c) => `<button class="chip" data-filter="${esc(c)}">${esc(catLabel(c))} <b>${list.filter((p) => p.cat === c).length}</b></button>`).join('')}
    </div>` : '';
    const first = a.featured ? limited[0] : null;
    const rest = first ? limited.slice(1) : limited;
    return G.wrapSection(`<div class="max-w-7xl mx-auto px-4 sm:px-6">${G.sectionHead(a, body)}${filter}
      <div class="grid sm:grid-cols-2 lg:grid-cols-${a.cols || 3} gap-5" data-filter-target="posts-${esc(a.id || 'x')}" ${pageSize ? `data-paginate="${pageSize}"` : ''}>${first ? postCard(first, true) : ''}${rest.map((p) => postCard(p)).join('')}</div>
      ${pageSize && limited.length > pageSize ? `<div class="text-center mt-10"><button class="btn btn-ghost" data-load-more>${icon('plus', 'w-4 h-4')} ${esc(t('common.loadMore'))}</button></div>` : ''}
      ${a.more ? `<div class="text-center mt-12" data-rv="up"><a href="${url(a.more)}" class="btn btn-ghost">${esc(a.moreLabel || t('common.seeAll'))} ${icon('arrow-right', 'w-4 h-4')}</a></div>` : ''}</div>`, a);
  });
  G.after((root) => root.querySelectorAll('[data-paginate]').forEach((grid) => {
    const n = +grid.dataset.paginate; let shown = n;
    const btn = grid.parentElement.querySelector('[data-load-more]');
    const apply = () => { [...grid.children].forEach((c, i) => c.classList.toggle('hidden', i >= shown && !c.hidden)); if (btn) btn.classList.toggle('hidden', shown >= grid.children.length); };
    apply(); if (btn) btn.onclick = () => { shown += n; apply(); G.activate(grid); };
    grid.parentElement.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => { shown = 999; apply(); }));
  }));

  /* ---------- single post ---------- */
  G.currentPost = async () => { const list = await G.load('posts'); const i = list.findIndex((p) => p.slug === (G.page && G.page.slug)); return { post: list[i], prev: list[i + 1], next: list[i - 1], list }; };
  G.block('post-hero', async () => {
    const { post: p } = await G.currentPost(); if (!p) return '';
    const back = { avancement: 'avancements.html', news: 'actualites.html', blog: 'blog.html' }[p.cat] || 'blog.html';
    return `<section class="relative pt-36 pb-12 overflow-hidden"><div class="absolute inset-0 grid-bg"></div><div class="orb orb-1 w-[420px] h-[420px] -top-32 -left-20"></div><div class="orb orb-3 w-[380px] h-[380px] top-0 right-0"></div>
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <nav class="text-xs faint mb-5 flex items-center justify-center gap-1.5 flex-wrap" data-rv="up"><a href="${url('index.html')}" class="hover:text-brand-600">${esc(t('nav.home'))}</a>${icon('chevron-right', 'w-3 h-3')}<a href="${url(back)}" class="hover:text-brand-600">${esc(catLabel(p.cat))}</a></nav>
        <div class="flex items-center justify-center gap-3 text-sm" data-rv="up"><span class="cat-pill">${esc(catLabel(p.cat))}</span><time class="faint" datetime="${esc(p.date)}">${esc(G.fmtDate(p.date))}</time>${p.readingTime ? `<span class="faint">· ${p.readingTime} ${esc(t('common.readingTime'))}</span>` : ''}</div>
        <h1 class="font-display text-4xl sm:text-6xl font-bold ink mt-5 leading-[1.08]" data-rv="up">${esc(p.title)}</h1>
        ${p.excerpt ? `<p class="mt-5 text-lg muted max-w-2xl mx-auto" data-rv="up">${esc(p.excerpt)}</p>` : ''}
        <p class="mt-6 text-sm faint flex items-center justify-center gap-2" data-rv="up">${G.logo(26, false)} ${esc(t('post.author'))}</p>
      </div></section>
      ${p.cover ? `<div class="max-w-5xl mx-auto px-4 sm:px-6" data-rv="zoom"><div class="grad-border rounded-[1.6rem] glass p-2 shadow-2xl">${p.video ? G.videoCard(p.video, p.title, p.cover, t('video.watch'), true) : `<div class="media-frame aspect-[16/9]"><img src="${img(p.cover)}" alt="${esc(p.title)}" class="w-full h-full object-cover"></div>`}</div></div>` : ''}`;
  });
  G.block('post-nav', async () => {
    const { post, prev, next } = await G.currentPost(); if (!post) return '';
    const share = encodeURIComponent(location.href);
    const cell = (p, dir) => p ? `<a href="${url(postUrl(p))}" class="group surface rounded-2xl p-5 lift flex gap-4 items-center ${dir === 'next' ? 'sm:flex-row-reverse sm:text-right' : ''}">
      <span class="ico-tile">${icon(dir === 'next' ? 'arrow-right' : 'arrow-left')}</span><span><span class="text-xs faint uppercase tracking-widest">${esc(t(dir === 'next' ? 'post.next' : 'post.prev'))}</span><span class="block font-semibold ink mt-1 line-clamp-2">${esc(p.title)}</span></span></a>` : '<span></span>';
    return `<div class="max-w-3xl mx-auto px-4 sm:px-6 my-12" data-rv="up">
      <div class="flex flex-wrap items-center justify-between gap-4 border-y line py-5"><span class="text-sm font-semibold ink">${esc(t('post.share'))}</span>
        <div class="flex gap-2"><a class="icon-btn" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${share}" aria-label="Facebook">${icon('facebook', 'w-4 h-4')}</a><a class="icon-btn" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${share}" aria-label="LinkedIn">${icon('linkedin', 'w-4 h-4')}</a><a class="icon-btn" target="_blank" rel="noopener" href="https://wa.me/?text=${share}" aria-label="WhatsApp">${icon('message-circle', 'w-4 h-4')}</a><button class="icon-btn" data-copy-link aria-label="${esc(t('post.copy'))}">${icon('link', 'w-4 h-4')}</button></div></div>
      <div class="grid sm:grid-cols-2 gap-4 mt-8">${cell(prev, 'prev')}${cell(next, 'next')}</div></div>`;
  });
  G.after((root) => root.querySelectorAll('[data-copy-link]').forEach((b) => (b.onclick = async () => { try { await navigator.clipboard.writeText(location.href); b.innerHTML = G.icon('check', 'w-4 h-4'); G.refreshIcons(); } catch (e) {} })));
  G.block('post-related', async () => {
    const { post, list } = await G.currentPost(); if (!post) return '';
    const rel = list.filter((p) => p.slug !== post.slug && (p.project && p.project === post.project || p.cat === post.cat)).slice(0, 3);
    return G.wrapSection(`<div class="max-w-7xl mx-auto px-4 sm:px-6">${G.sectionHead({ eyebrow: t('post.relatedEyebrow'), title: t('post.related') }, '')}<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">${rel.map((p) => postCard(p)).join('')}</div></div>`, { tone: 'soft' });
  });
})();
