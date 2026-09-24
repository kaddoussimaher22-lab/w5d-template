/* ==========================================================================
 * Gloulou — Layout components (Web Components)
 *   <g-header></g-header>          site navigation (from config/site.json)
 *   <g-footer></g-footer>          footer (from config/site.json)
 *   <g-page src="review" layout="report"></g-page>   MD-driven page body
 *   <g-cookie></g-cookie>          consent banner (nothing tracked before consent)
 *   <g-progress></g-progress>      reading progress bar
 * ========================================================================== */
(function () {
  'use strict';
  const G = window.G;
  const here = () => (location.pathname.split('/').pop() || 'index.html');

  /* ---------------- theme ---------------- */
  const THEME_KEY = 'gloulou-theme';
  const applyTheme = (m) => { document.documentElement.dataset.theme = m; localStorage.setItem(THEME_KEY, m); document.dispatchEvent(new CustomEvent('g:theme', { detail: m })); };
  applyTheme(localStorage.getItem(THEME_KEY) || 'light');
  G.toggleTheme = () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

  /* ---------------- brand mark (animated SVG) ---------------- */
  G.logo = (size = 40) => `
    <svg class="g-logo" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="gl-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--gold-300)"/><stop offset="1" stop-color="var(--gold-600)"/></linearGradient></defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="var(--ink-900)"/>
      <path class="g-logo-roof" d="M14 30 L32 15 L50 30" fill="none" stroke="url(#gl-g)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="g-logo-g" d="M42 36a10 10 0 1 1-3-7.1M42 36h-9" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>
      <circle class="g-logo-dot" cx="50" cy="48" r="2.6" fill="var(--eco-400)"/>
    </svg>`;

  /* ---------------- <g-header> ---------------- */
  class GHeader extends HTMLElement {
    async connectedCallback() {
      await G.ready;
      const c = G.config, cur = here();
      const langs = c.languages.filter((l) => l.enabled);
      const links = c.nav.map((n) => `<a href="${n.href}" class="nav-link ${n.href === cur ? 'is-active' : ''}">${G.esc(G.t(n.key))}</a>`).join('');
      const langMenu = langs.length > 1
        ? `<div class="lang-switch">${langs.map((l) => `<button data-lang="${l.code}" class="${l.code === G.lang ? 'is-active' : ''}">${l.code.toUpperCase()}</button>`).join('')}</div>`
        : `<span class="lang-pill" title="${G.esc(G.t('lang.choose'))}">${G.lang.toUpperCase()}</span>`;
      this.innerHTML = `
        <header class="g-header" data-header>
          <div class="container g-header-in">
            <a class="brand" href="index.html" aria-label="${G.esc(c.brand.name)}">
              ${G.logo(40)}
              <span class="brand-txt"><strong>${G.esc(c.brand.name)}</strong><small>${G.esc(G.t(c.brand.tagline_key))}</small></span>
            </a>
            <nav class="nav-links" aria-label="Principal">${links}</nav>
            <div class="nav-tools">
              ${langMenu}
              <button class="icon-btn" data-theme-btn aria-label="${G.esc(G.t('theme.toggle'))}">${G.icon('moon')}</button>
              <button class="icon-btn only-mobile" data-burger aria-label="${G.esc(G.t('nav.menu'))}" aria-expanded="false">${G.icon('menu')}</button>
            </div>
          </div>
          <nav class="mobile-nav" data-mobile hidden>${links}</nav>
        </header>`;
      this.querySelector('[data-theme-btn]').onclick = G.toggleTheme;
      const burger = this.querySelector('[data-burger]'), mob = this.querySelector('[data-mobile]');
      burger.onclick = () => { mob.hidden = !mob.hidden; burger.setAttribute('aria-expanded', String(!mob.hidden)); };
      this.querySelectorAll('[data-lang]').forEach((b) => (b.onclick = () => G.setLang(b.dataset.lang)));
      const hdr = this.querySelector('[data-header]');
      const onScroll = () => hdr.classList.toggle('is-scrolled', scrollY > 12);
      addEventListener('scroll', onScroll, { passive: true }); onScroll();
      G.refreshIcons();
    }
  }

  /* ---------------- <g-footer> ---------------- */
  class GFooter extends HTMLElement {
    async connectedCallback() {
      await G.ready;
      const c = G.config;
      const cols = c.footer.columns.map((col) => `
        <div><h4>${G.esc(G.t(col.titleKey))}</h4><ul>${col.links.map((l) => `<li><a href="${l.href}">${G.esc(G.t(l.key))}</a></li>`).join('')}</ul></div>`).join('');
      this.innerHTML = `
        <footer class="g-footer">
          <div class="container g-footer-grid">
            <div class="g-footer-brand">
              <a class="brand" href="index.html">${G.logo(44)}<span class="brand-txt"><strong>${G.esc(c.brand.name)}</strong><small>${G.esc(G.t(c.brand.tagline_key))}</small></span></a>
              <p>${G.icon('map-pin', 'ico ico-sm')} ${G.esc(c.contact.address)}</p>
            </div>
            ${cols}
          </div>
          <div class="container g-footer-bar">
            <span>© ${new Date().getFullYear()} ${G.esc(c.brand.name)}. ${G.esc(G.t('footer.rights'))}</span>
            <span>${G.esc(G.t('footer.madeBy'))} <a href="${c.credits.url}">${G.esc(c.credits.agency)}</a></span>
          </div>
        </footer>`;
      G.refreshIcons();
    }
  }

  /* ---------------- <g-progress> ---------------- */
  class GProgress extends HTMLElement {
    connectedCallback() {
      this.innerHTML = '<div class="g-progress"><span></span></div>';
      const bar = this.querySelector('span');
      const upd = () => {
        const h = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      };
      addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
    }
  }

  /* ---------------- <g-page> ---------------- */
  class GPage extends HTMLElement {
    async connectedCallback() {
      const page = this.getAttribute('src');
      const layout = this.getAttribute('layout') || 'default';
      this.innerHTML = `<div class="g-loading"><span class="spinner"></span></div>`;
      try {
        const src = await G.loadPage(page);
        const { meta, html, toc } = G.renderPage(src);
        if (meta.title) document.title = meta.title;
        if (meta.description) {
          let m = document.querySelector('meta[name="description"]');
          if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
          m.content = meta.description;
        }
        if (layout === 'report' && toc.length) {
          this.innerHTML = `
            <div class="report-shell">
              <aside class="report-toc" aria-label="${G.esc(G.t('common.toc'))}">
                <div class="toc-in">
                  <p class="toc-title">${G.icon('list', 'ico ico-sm')} ${G.esc(G.t('common.toc'))}</p>
                  <ol>${toc.map((t, i) => `<li><a href="#${t.id}" data-toc="${t.id}"><span>${String(i + 1).padStart(2, '0')}</span>${G.inline(t.title)}</a></li>`).join('')}</ol>
                  <button class="btn btn-ghost btn-sm" onclick="window.print()">${G.icon('printer', 'ico ico-sm')} ${G.esc(G.t('common.print'))}</button>
                </div>
              </aside>
              <main class="report-main" id="main">${html}</main>
            </div>`;
          this.spy();
        } else {
          this.innerHTML = `<main id="main">${html}</main>`;
        }
        G.refreshIcons();
        G.observeReveal(this);
        document.dispatchEvent(new CustomEvent('g:page', { detail: { page, meta } }));
        if (location.hash) { const t = document.querySelector(location.hash); t && setTimeout(() => t.scrollIntoView(), 60); }
      } catch (e) {
        console.error('[gloulou]', e);
        this.innerHTML = `<div class="container g-error">${G.icon('alert-triangle')} ${G.esc(G.t('common.error'))}</div>`;
        G.refreshIcons();
      }
    }
    spy() {
      const links = [...this.querySelectorAll('[data-toc]')];
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) links.forEach((l) => l.classList.toggle('is-active', l.dataset.toc === e.target.id));
      }), { rootMargin: '-35% 0px -60% 0px' });
      links.forEach((l) => { const s = document.getElementById(l.dataset.toc); s && io.observe(s); });
    }
  }

  /* ---------------- <g-cookie> ---------------- */
  class GCookie extends HTMLElement {
    async connectedCallback() {
      await G.ready;
      if (localStorage.getItem('gloulou-consent')) return;
      this.innerHTML = `
        <div class="g-cookie" role="dialog" aria-live="polite">
          ${G.icon('cookie')}
          <p>${G.esc(G.t('cookie.text'))}</p>
          <div class="g-cookie-actions">
            <button class="btn btn-ghost btn-sm" data-c="refused">${G.esc(G.t('cookie.refuse'))}</button>
            <button class="btn btn-gold btn-sm" data-c="accepted">${G.esc(G.t('cookie.accept'))}</button>
          </div>
        </div>`;
      this.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => { localStorage.setItem('gloulou-consent', b.dataset.c); this.remove(); }));
      G.refreshIcons();
    }
  }

  customElements.define('g-header', GHeader);
  customElements.define('g-footer', GFooter);
  customElements.define('g-progress', GProgress);
  customElements.define('g-page', GPage);
  customElements.define('g-cookie', GCookie);
})();
