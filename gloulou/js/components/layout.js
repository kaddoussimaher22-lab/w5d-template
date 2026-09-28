/* ==========================================================================
 * Gloulou × W5D — Layout Web Components
 *   <g-header>   glass navbar + animated mega-menu (from config/site.json nav)
 *   <g-footer>   full footer + newsletter
 *   <g-page>     loads content/{lang}/{src}.md → renders blocks
 *   <g-cookie>   consent banner (no tracker loaded without consent)
 *   <g-progress> reading progress
 *   G.modal      shared modal (video popup / lightbox) — never autoplays
 * ========================================================================== */
(function () {
  'use strict';
  const G = window.G;
  const { esc, icon, t } = G;
  const here = () => (location.pathname.split('/').pop() || 'index.html');
  const pageKey = () => here() + location.search;

  /* ---------------- theme ---------------- */
  G.setTheme = (m) => {
    document.documentElement.classList.toggle('dark', m === 'dark');
    localStorage.setItem('gloulou-theme', m);
    document.querySelectorAll('[data-theme-icon]').forEach((el) => el.classList.toggle('hidden', (el.dataset.themeIcon === 'sun') !== (m === 'dark')));
    document.dispatchEvent(new CustomEvent('g:theme', { detail: m }));
  };
  G.toggleTheme = () => G.setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');

  /* ---------------- brand mark (animated SVG, logo colours) ---------------- */
  G.logo = (size = 40, withText = true) => `
    <span class="inline-flex items-center gap-2.5 g-brand">
      <span class="relative inline-flex rounded-xl shine shadow-lg shadow-brand-600/30" style="width:${size}px;height:${size}px">
        <svg viewBox="0 0 64 64" width="${size}" height="${size}" class="g-logo" aria-hidden="true">
          <defs><linearGradient id="glg${size}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e11d48"/><stop offset="1" stop-color="#a10d22"/></linearGradient></defs>
          <rect width="64" height="64" rx="15" fill="url(#glg${size})"/>
          <path class="g-logo-g" d="M44 22a16 16 0 1 0 4 12H33" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/>
          <circle class="g-logo-dot" cx="31" cy="34" r="3.4" fill="#fff"/>
          <path d="M8 56h48" stroke="#dcb55a" stroke-width="1.5" opacity=".75"/>
        </svg>
      </span>
      ${withText ? `<span class="flex flex-col leading-none"><span class="font-serif font-semibold text-[1.08rem] ink">Immobilière Gloulou</span><span class="text-[10px] tracking-[.32em] uppercase text-gold-500 mt-1">Since 1986</span></span>` : ''}
    </span>`;

  /* ---------------- modal (video + lightbox) ---------------- */
  let modal;
  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'g-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `<button class="g-modal-close" data-modal-close aria-label="${esc(t('common.close'))}">${icon('x')}</button>
      <button class="nav-arrow prev hidden" data-modal-prev aria-label="Précédent">${icon('chevron-left')}</button>
      <button class="nav-arrow next hidden" data-modal-next aria-label="Suivant">${icon('chevron-right')}</button>
      <div class="g-modal-box" data-modal-box></div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-modal-close]')) G.closeModal(); });
    modal.querySelector('[data-modal-prev]').onclick = () => G._gal && G._galGo(-1);
    modal.querySelector('[data-modal-next]').onclick = () => G._gal && G._galGo(1);
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') G.closeModal();
      if (e.key === 'ArrowLeft' && G._gal) G._galGo(-1);
      if (e.key === 'ArrowRight' && G._gal) G._galGo(1);
    });
    G.refreshIcons();
    return modal;
  }
  G.openModal = (html, { gallery = false } = {}) => {
    const m = ensureModal();
    m.querySelector('[data-modal-box]').innerHTML = html;
    m.querySelectorAll('.nav-arrow').forEach((b) => b.classList.toggle('hidden', !gallery));
    m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    G._lastFocus = document.activeElement;
    setTimeout(() => m.querySelector('[data-modal-close]').focus(), 50);
    G.refreshIcons();
  };
  G.closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    setTimeout(() => { modal.querySelector('[data-modal-box]').innerHTML = ''; }, 300); // stops the video
    G._gal = null;
    G._lastFocus && G._lastFocus.focus && G._lastFocus.focus();
  };
  /** Video popup — YouTube is loaded only on click (privacy-enhanced domain), never autoplays on page load. */
  G.openVideo = (id, title = '') => {
    G.openModal(`<div class="rounded-2xl overflow-hidden shadow-2xl bg-black">
      <div class="relative" style="aspect-ratio:16/9"><iframe class="absolute inset-0 w-full h-full" src="https://www.youtube-nocookie.com/embed/${esc(id)}?rel=0&modestbranding=1&playsinline=1" title="${esc(title)}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>
      </div>${title ? `<p class="mt-4 text-center text-white/85 font-medium">${esc(title)}</p>` : ''}`);
  };
  G.openGallery = (items, idx = 0) => {
    G._gal = { items, idx };
    G._galGo = (d) => { G._gal.idx = (G._gal.idx + d + items.length) % items.length; show(); };
    const show = () => {
      const it = items[G._gal.idx];
      G.openModal(`<figure class="text-center"><img src="${esc(it.src)}" alt="${esc(it.alt || '')}" class="max-h-[80vh] w-auto mx-auto rounded-2xl shadow-2xl"/>
        <figcaption class="mt-4 text-white/80 text-sm">${esc(it.alt || '')} <span class="opacity-60">· ${G._gal.idx + 1} / ${items.length}</span></figcaption></figure>`, { gallery: items.length > 1 });
    };
    show();
  };
  document.addEventListener('click', (e) => {
    const v = e.target.closest('[data-video]');
    if (v) { e.preventDefault(); G.openVideo(v.dataset.video, v.dataset.title || ''); return; }
    const g = e.target.closest('[data-gallery-item]');
    if (g) {
      e.preventDefault();
      const wrap = g.closest('[data-gallery]');
      const els = [...wrap.querySelectorAll('[data-gallery-item]')];
      G.openGallery(els.map((x) => ({ src: x.getAttribute('href'), alt: x.dataset.alt || '' })), els.indexOf(g));
    }
  });

  /* ---------------- <g-header> with mega-menu ---------------- */
  function isActive(href) { const h = (href || '').split('#')[0]; return h && (h === here() || h === pageKey()); }
  function megaPanel(item) {
    let n = 0;
    const cols = item.groups.map((g) => `
      <div><p class="text-[11px] uppercase tracking-widest faint font-semibold mb-2 px-3">${esc(g.heading)}</p>
        <div class="space-y-1">${g.items.map((it) => `
          <a href="${G.url(it.href)}" class="mega-item ${isActive(it.href) ? 'is-active' : ''}" style="--i:${n++}">
            <span class="mega-ico">${icon(it.icon, 'w-4 h-4')}</span>
            <span><span class="block text-sm font-semibold ink">${esc(it.label)}</span>${it.desc ? `<span class="block text-xs faint mt-0.5">${esc(it.desc)}</span>` : ''}</span>
          </a>`).join('')}</div></div>`).join('');
    const p = item.promo;
    const promo = p ? `<a href="${G.url(p.href)}" class="mega-promo group">${p.image ? `<img src="${G.img(p.image)}" alt="" loading="lazy">` : ''}
        <div><span class="inline-block text-[11px] uppercase tracking-widest bg-white/20 rounded-full px-2 py-0.5">${esc(p.tag)}</span>
        <h4 class="font-display font-bold text-lg mt-2">${esc(p.title)}</h4><p class="text-sm text-white/80 mt-1">${esc(p.body)}</p>
        <span class="text-sm font-semibold mt-2 inline-flex items-center gap-1">${esc(p.cta || t('common.discover'))} ${icon('arrow-right', 'w-4 h-4')}</span></div></a>` : '';
    return `<div class="mega ${item.groups.length < 2 ? 'mega-narrow' : ''} hidden" data-mega-panel><span class="mega-caret" data-caret></span><div class="mega-card"><div class="grid lg:grid-cols-[1.5fr_1fr] gap-5"><div class="grid sm:grid-cols-${Math.min(item.groups.length, 2)} gap-4">${cols}</div>${promo}</div></div></div>`;
  }

  class GHeader extends HTMLElement {
    async connectedCallback() {
      await G.ready;
      const c = G.config;
      const langs = c.languages.filter((l) => l.enabled);
      const items = c.nav.map((n) => {
        const active = isActive(n.href) || (n.groups || []).some((g) => g.items.some((i) => isActive(i.href))) || (n.match && new RegExp(n.match).test(pageKey()));
        if (!n.groups) return `<li class="nav-item"><a href="${G.url(n.href)}" class="nav-link ${active ? 'is-active' : ''}">${esc(n.label)}</a></li>`;
        return `<li class="nav-item" data-mega-trigger>
          <button class="nav-link ${active ? 'is-active' : ''}" aria-haspopup="true" aria-expanded="false">${esc(n.label)} ${icon('chevron-down', 'w-3.5 h-3.5 chev')}</button>${megaPanel(n)}</li>`;
      }).join('');
      const mobile = c.nav.map((n) => !n.groups
        ? `<a href="${G.url(n.href)}" class="block px-3 py-2.5 rounded-lg font-medium ink hover:bg-brand-500/5">${esc(n.label)}</a>`
        : `<details class="border-b line"><summary class="flex items-center justify-between px-3 py-2.5 font-medium ink">${esc(n.label)} ${icon('chevron-down', 'w-4 h-4 chev transition')}</summary>
            <div class="pb-2">${n.groups.flatMap((g) => g.items).map((it) => `<a href="${G.url(it.href)}" class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm muted hover:text-brand-600">${icon(it.icon, 'w-4 h-4 text-brand-500')} ${esc(it.label)}</a>`).join('')}</div></details>`).join('');
      this.innerHTML = `
      <header class="g-header" data-header>
        <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-3">
          <nav class="g-nav glass rounded-2xl flex items-center justify-between px-4 sm:px-5 py-2.5 relative" aria-label="Principal">
            <a href="${G.url('index.html')}" aria-label="${esc(c.brand.name)} — ${esc(t('nav.home'))}">${G.logo(40)}</a>
            <ul class="hidden lg:flex items-center gap-6 xl:gap-7">${items}</ul>
            <div class="flex items-center gap-1.5">
              ${langs.length > 1 ? `<div class="hidden sm:flex gap-1">${langs.map((l) => `<button class="icon-btn text-xs font-bold ${l.code === G.lang ? 'border-brand-500 text-brand-600' : ''}" data-lang="${l.code}">${l.code.toUpperCase()}</button>`).join('')}</div>` : ''}
              <a href="${G.url(c.cta.phoneHref)}" class="icon-btn hidden md:inline-flex" aria-label="${esc(t('nav.call'))}" title="${esc(c.contact.phone)}">${icon('phone', 'w-4 h-4')}<span class="ring-pulse"></span></a>
              <button class="icon-btn" data-theme-btn aria-label="${esc(t('theme.toggle'))}">
                <i data-theme-icon="sun" data-lucide="sun" class="w-5 h-5"></i><i data-theme-icon="moon" data-lucide="moon" class="w-5 h-5 hidden"></i>
              </button>
              <a href="${G.url(c.cta.href)}" class="hidden sm:inline-flex btn btn-primary btn-sm ml-1">${esc(c.cta.label)} ${icon('arrow-right', 'w-4 h-4')}</a>
              <button class="icon-btn lg:hidden" data-burger aria-label="${esc(t('nav.menu'))}" aria-expanded="false">${icon('menu')}</button>
            </div>
          </nav>
          <div class="hidden lg:hidden glass rounded-2xl mt-2 p-3 mobile-panel" data-mobile>${mobile}
            <a href="${G.url(c.cta.href)}" class="btn btn-primary w-full mt-3">${esc(c.cta.label)}</a></div>
        </div>
      </header>`;
      G.setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      this.querySelector('[data-theme-btn]').onclick = G.toggleTheme;
      this.querySelectorAll('[data-lang]').forEach((b) => (b.onclick = () => G.setLang(b.dataset.lang)));
      const burger = this.querySelector('[data-burger]'), mob = this.querySelector('[data-mobile]');
      burger.onclick = () => { mob.classList.toggle('hidden'); burger.setAttribute('aria-expanded', String(!mob.classList.contains('hidden'))); };
      // mega-menu: hover + click + keyboard, 140ms close delay
      this.querySelectorAll('[data-mega-trigger]').forEach((li) => {
        const panel = li.querySelector('[data-mega-panel]'), btn = li.querySelector('button');
        let tm;
        const open = () => { clearTimeout(tm); this.querySelectorAll('[data-mega-trigger].is-open').forEach((o) => o !== li && close(o)); li.classList.add('is-open'); panel.classList.remove('hidden'); btn.setAttribute('aria-expanded', 'true');
          // panel is centred on the navbar; caret points at the trigger
          const pr = panel.getBoundingClientRect(), br = btn.getBoundingClientRect(), caret = panel.querySelector('[data-caret]');
          if (caret) caret.style.left = Math.max(28, Math.min(pr.width - 28, br.left + br.width / 2 - pr.left)) + 'px'; };
        const close = (el = li) => { el.classList.remove('is-open'); el.querySelector('[data-mega-panel]').classList.add('hidden'); el.querySelector('button').setAttribute('aria-expanded', 'false'); };
        li.addEventListener('mouseenter', open);
        li.addEventListener('mouseleave', () => { tm = setTimeout(() => close(), 140); });
        btn.addEventListener('click', () => (li.classList.contains('is-open') ? close() : open()));
        li.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); btn.focus(); } });
        li.addEventListener('focusout', (e) => { if (!li.contains(e.relatedTarget)) close(); });
      });
      const hdr = this.querySelector('[data-header]');
      const onScroll = () => hdr.classList.toggle('is-scrolled', scrollY > 10);
      addEventListener('scroll', onScroll, { passive: true }); onScroll();
      G.refreshIcons();
    }
  }

  /* ---------------- <g-footer> ---------------- */
  class GFooter extends HTMLElement {
    async connectedCallback() {
      await G.ready;
      const c = G.config, f = c.footer;
      this.innerHTML = `
      <footer class="g-footer relative overflow-hidden border-t line pt-20 pb-8 mt-10 bg-soft">
        <div class="absolute inset-0 grid-bg opacity-60 pointer-events-none"></div>
        <div class="orb orb-1 w-[380px] h-[380px] -bottom-40 -left-20"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 lg:grid-cols-6 gap-10">
          <div class="lg:col-span-2">
            <a href="${G.url('index.html')}">${G.logo(44)}</a>
            <p class="mt-5 text-sm muted max-w-sm">${esc(f.about)}</p>
            <form data-newsletter class="mt-6 flex max-w-sm" novalidate>
              <label class="sr-only" for="nl-email">${esc(t('form.email'))}</label>
              <input id="nl-email" type="email" required placeholder="${esc(t('newsletter.placeholder'))}" class="field !rounded-r-none" />
              <button type="submit" class="btn btn-primary !rounded-l-none btn-sm">${esc(t('newsletter.cta'))}</button>
            </form>
            <p class="text-xs faint mt-2" data-newsletter-msg>${esc(t('newsletter.note'))}</p>
          </div>
          ${f.columns.map((col) => `<div><h4 class="font-semibold ink text-sm">${esc(col.title)}</h4><ul class="mt-4 space-y-2.5 text-sm muted">${col.links.map((l) => `<li><a href="${G.url(l.href)}" class="link-underline hover:text-brand-600 dark:hover:text-brand-400">${esc(l.label)}</a></li>`).join('')}</ul></div>`).join('')}
          <div><h4 class="font-semibold ink text-sm">${esc(t('footer.contact'))}</h4>
            <ul class="mt-4 space-y-3 text-sm muted">
              <li class="flex gap-2">${icon('map-pin', 'w-4 h-4 mt-0.5 text-brand-500 flex-none')}<span>${esc(c.contact.address)}</span></li>
              <li class="flex gap-2">${icon('phone', 'w-4 h-4 mt-0.5 text-brand-500 flex-none')}<a class="hover:text-brand-600" href="${G.url(c.cta.phoneHref)}">${esc(c.contact.phone)}</a></li>
              <li class="flex gap-2">${icon('clock', 'w-4 h-4 mt-0.5 text-brand-500 flex-none')}<span>${esc(c.contact.hours)}</span></li>
            </ul></div>
        </div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 mt-14 pt-6 border-t line flex flex-wrap items-center justify-between gap-4">
          <p class="text-xs faint">© ${new Date().getFullYear()} ${esc(c.brand.legalName)}. ${esc(t('footer.rights'))} · ${esc(t('footer.madeBy'))} <a href="${esc(c.credits.url)}" class="text-brand-600 dark:text-brand-400 font-semibold">${esc(c.credits.agency)}</a></p>
          <div class="flex items-center gap-2">${c.social.map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noopener" class="icon-btn" aria-label="${esc(s.label)}">${icon(s.icon, 'w-4 h-4')}</a>`).join('')}</div>
        </div>
      </footer>`;
      const form = this.querySelector('[data-newsletter]');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = this.querySelector('[data-newsletter-msg]'); const v = form.querySelector('input').value.trim();
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        msg.textContent = ok ? t('newsletter.ok') : t('form.invalidEmail');
        msg.className = 'text-xs mt-2 ' + (ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400');
        if (ok) form.reset();
      });
      G.refreshIcons();
    }
  }

  /* ---------------- <g-progress> ---------------- */
  class GProgress extends HTMLElement {
    connectedCallback() {
      this.innerHTML = '<div class="g-progress"><span></span></div>';
      const bar = this.querySelector('span');
      const upd = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
      addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    }
  }

  /* ---------------- <g-page src="…"> ----------------
   * src may contain {slug} which is replaced by ?slug= (for project / article templates). */
  class GPage extends HTMLElement {
    async connectedCallback() {
      let src = this.getAttribute('src') || 'accueil';
      const slug = G.q('slug');
      if (src.includes('{slug}')) {
        if (!slug || !/^[a-z0-9-]+$/.test(slug)) return this.notFound();
        src = src.replace('{slug}', slug);
      }
      this.innerHTML = `<div class="min-h-screen"></div>`;
      try {
        const raw = await G.loadMD(src);
        const { meta, body } = G.frontMatter(raw);
        G.page = { src, meta, slug };
        G.setMeta(meta);
        this.innerHTML = await G.render(body, { meta });
        G.activate(this);
        document.dispatchEvent(new CustomEvent('g:page', { detail: G.page }));
        if (location.hash) { const el = document.getElementById(location.hash.slice(1)); el && setTimeout(() => el.scrollIntoView(), 80); }
      } catch (e) {
        console.warn('[gloulou] page', src, e.message);
        this.notFound();
      }
      window.__gHideLoader && window.__gHideLoader();
    }
    async notFound() {
      const raw = await G.loadMD('404').catch(() => '# 404');
      const { meta, body } = G.frontMatter(raw);
      G.setMeta(meta);
      this.innerHTML = await G.render(body, { meta });
      G.activate(this);
      window.__gHideLoader && window.__gHideLoader();
    }
  }

  /* ---------------- <g-cookie> ---------------- */
  class GCookie extends HTMLElement {
    async connectedCallback() {
      await G.ready;
      if (localStorage.getItem('gloulou-consent')) return;
      this.innerHTML = `
      <div class="g-cookie fixed z-[90] left-3 right-3 sm:left-4 sm:right-auto bottom-3 sm:bottom-4 sm:max-w-md glass rounded-2xl p-4 shadow-2xl" role="dialog" aria-live="polite" aria-label="${esc(t('cookie.title'))}">
        <div class="flex gap-3"><span class="ico-tile !w-10 !h-10">${icon('cookie', 'w-5 h-5')}</span>
          <div><p class="font-semibold ink text-sm">${esc(t('cookie.title'))}</p><p class="text-sm muted mt-1">${esc(t('cookie.text'))} <a class="underline text-brand-600 dark:text-brand-400" href="${G.url('cookies.html')}">${esc(t('cookie.more'))}</a></p>
          <div class="flex gap-2 mt-3"><button class="btn btn-ghost btn-sm" data-c="refused">${esc(t('cookie.refuse'))}</button><button class="btn btn-primary btn-sm" data-c="accepted">${esc(t('cookie.accept'))}</button></div></div></div>
      </div>`;
      this.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => { localStorage.setItem('gloulou-consent', b.dataset.c); this.innerHTML = ''; document.dispatchEvent(new CustomEvent('g:consent', { detail: b.dataset.c })); }));
      G.refreshIcons();
    }
  }

  customElements.define('g-header', GHeader);
  customElements.define('g-footer', GFooter);
  customElements.define('g-progress', GProgress);
  customElements.define('g-page', GPage);
  customElements.define('g-cookie', GCookie);

  // spotlight cursor follow (W5D)
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest && e.target.closest('.spotlight'); if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  });
  addEventListener('load', () => setTimeout(() => window.__gHideLoader && window.__gHideLoader(), 300));
})();
