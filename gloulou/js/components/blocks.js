/* ==========================================================================
 * Gloulou — Content components, used from Markdown as ::: directives
 * --------------------------------------------------------------------------
 *  hero · stats · gauges · chart · bars · cards · issues · table · compare
 *  matrix · roadmap · callout · checklist · quote · cta
 *  Each receives { attrs, header, rows, body } (see js/core/app.js).
 * ========================================================================== */
(function () {
  'use strict';
  const G = window.G;
  const { esc, inline, icon } = G;
  G.data = G.data || {};
  const num = (v) => parseFloat(String(v).replace(/\s/g, '').replace(',', '.')) || 0;
  const fmt = (v, dec = 0, group = true) => Number(v).toLocaleString(G.lang || 'fr', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: group });
  const TONES = ['gold', 'eco', 'sky', 'rose', 'violet', 'slate'];
  const SEV = ['critical', 'high', 'medium', 'low'];

  /* ---------- hero ----------
   * attrs: eyebrow, title, badge   body: subtitle   rows: label | href | style | icon */
  G.component('hero', ({ attrs, rows, body }) => `
    <section class="g-hero">
      <div class="hero-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span><span class="hero-grid"></span></div>
      <div class="container hero-in">
        ${attrs.badge ? `<span class="hero-badge" data-rv>${icon('sparkles', 'ico ico-sm')} ${esc(attrs.badge)}</span>` : ''}
        ${attrs.eyebrow ? `<p class="eyebrow" data-rv>${esc(attrs.eyebrow)}</p>` : ''}
        <h1 data-rv>${inline(attrs.title || '')}</h1>
        ${body ? `<p class="hero-sub" data-rv>${inline(body)}</p>` : ''}
        ${rows.length ? `<div class="hero-cta" data-rv>${rows.map(([l, h, s, i]) => `<a class="btn btn-${esc(s || 'gold')}" href="${esc(h || '#')}">${icon(i, 'ico ico-sm')}${esc(l)}</a>`).join('')}</div>` : ''}
        ${attrs.meta ? `<ul class="hero-meta" data-rv>${attrs.meta.split(';').map((m) => `<li>${icon('check', 'ico ico-sm')}${esc(m.trim())}</li>`).join('')}</ul>` : ''}
      </div>
    </section>`);

  /* ---------- stats (animated counters) ----------
   * rows: value | suffix | label | icon | tone | note */
  G.component('stats', ({ attrs, rows }) => `
    <div class="g-stats cols-${esc(attrs.cols || Math.min(rows.length, 4))}">
      ${rows.map(([v, suf, label, ic, tone, note], i) => `
        <div class="stat tone-${esc(tone || TONES[i % TONES.length])}" data-rv style="--d:${i * 70}ms">
          <span class="stat-ico">${icon(ic || 'activity')}</span>
          <strong class="stat-val"><span data-count="${num(v)}" data-dec="${String(v).includes('.') ? 1 : 0}">0</span><em>${esc(suf || '')}</em></strong>
          <span class="stat-label">${inline(label)}</span>
          ${note ? `<small class="stat-note">${inline(note)}</small>` : ''}
        </div>`).join('')}
    </div>`);

  /* ---------- gauges (radial scores 0-100) ----------
   * attrs: big (first gauge large)   rows: label | score | note */
  G.component('gauges', ({ attrs, rows }) => {
    const ring = (label, score, note, big) => {
      const s = Math.max(0, Math.min(100, num(score)));
      const tone = s < 35 ? 'rose' : s < 60 ? 'gold' : 'eco';
      const r = 52, c = 2 * Math.PI * r;
      return `<figure class="gauge tone-${tone} ${big ? 'is-big' : ''}" data-rv>
        <div class="gauge-ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle class="g-track" cx="60" cy="60" r="${r}"/>
            <circle class="g-fill" cx="60" cy="60" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-gauge="${s}" data-circ="${c}"/>
          </svg>
          <div class="gauge-val"><span data-count="${s}">0</span><small>/100</small></div>
        </div>
        <figcaption><strong>${inline(label)}</strong>${note ? `<span>${inline(note)}</span>` : ''}</figcaption>
      </figure>`;
    };
    return `<div class="g-gauges ${attrs.big ? 'has-big' : ''}">${rows.map((r, i) => ring(r[0], r[1], r[2], attrs.big && i === 0)).join('')}</div>`;
  });

  /* ---------- chart (Chart.js, lazy + theme-aware) ----------
   * attrs: type, title, height, horizontal, stacked, source="issues" by="severity|category", unit
   * header: # Label | Series A | Series B     rows: label | a | b */
  let chartId = 0;
  G.charts = [];
  G.component('chart', ({ attrs, header, rows, body }) => {
    const id = 'gc' + ++chartId;
    G.charts.push({ id, attrs, header, rows });
    return `<figure class="g-chart" data-rv>
      ${attrs.title ? `<figcaption>${icon(attrs.icon || 'bar-chart-3', 'ico ico-sm')} ${inline(attrs.title)}</figcaption>` : ''}
      <div class="chart-box" style="height:${esc(attrs.height || 320)}px"><canvas id="${id}" role="img" aria-label="${esc(attrs.title || 'Graphique')}"></canvas></div>
      ${body ? `<p class="chart-note">${inline(body)}</p>` : ''}
    </figure>`;
  });

  /* ---------- bars (animated horizontal bars) ----------
   * attrs: unit   rows: label | value | max | tone | note */
  G.component('bars', ({ attrs, rows }) => `
    <div class="g-bars">${rows.map(([l, v, max, tone, note], i) => {
      const pct = Math.max(2, Math.min(100, (num(v) / (num(max) || 100)) * 100));
      return `<div class="bar tone-${esc(tone || TONES[i % TONES.length])}" data-rv style="--d:${i * 60}ms">
        <div class="bar-top"><span>${inline(l)}</span><strong><span data-count="${num(v)}">0</span>${esc(attrs.unit || '')}${max && !attrs.unit ? ` / ${esc(max)}` : ''}</strong></div>
        <div class="bar-track"><span class="bar-fill" data-bar="${pct}"></span></div>
        ${note ? `<small>${inline(note)}</small>` : ''}
      </div>`;
    }).join('')}</div>`);

  /* ---------- cards ----------
   * attrs: cols, style=glass|plain   rows: icon | title | text | tag | tone */
  G.component('cards', ({ attrs, rows }) => `
    <div class="g-cards cols-${esc(attrs.cols || 3)}">${rows.map(([ic, t, txt, tag, tone], i) => `
      <article class="card tone-${esc(tone || TONES[i % TONES.length])}" data-rv style="--d:${i * 60}ms">
        <span class="card-ico">${icon(ic || 'star')}</span>
        ${tag ? `<span class="tag">${esc(tag)}</span>` : ''}
        <h3>${inline(t)}</h3>
        <p>${inline(txt || '')}</p>
      </article>`).join('')}</div>`);

  /* ---------- issues (filterable findings register) ----------
   * rows: severity | category | title | detail | where */
  G.component('issues', ({ rows }) => {
    G.data.issues = rows.map(([sev, cat, title, detail, where], i) => ({ n: i + 1, sev: (sev || 'medium').toLowerCase(), cat, title, detail, where }));
    const cats = [...new Set(G.data.issues.map((x) => x.cat))];
    const count = (k, v) => G.data.issues.filter((x) => x[k] === v).length;
    return `<div class="g-issues" data-issues>
      <div class="issue-filters" role="toolbar">
        <div class="chips" data-group="sev">
          <button class="chip is-active" data-f="*">${esc(G.t('common.all'))} <b>${rows.length}</b></button>
          ${SEV.map((s) => `<button class="chip sev-${s}" data-f="${s}">${esc(G.t('severity.' + s))} <b>${count('sev', s)}</b></button>`).join('')}
        </div>
        <div class="chips" data-group="cat">
          <button class="chip is-active" data-f="*">${icon('layers', 'ico ico-xs')} ${esc(G.t('common.all'))}</button>
          ${cats.map((c) => `<button class="chip" data-f="${esc(c)}">${esc(c)} <b>${count('cat', c)}</b></button>`).join('')}
        </div>
      </div>
      <ol class="issue-list">${G.data.issues.map((x) => `
        <li class="issue sev-${esc(x.sev)}" data-sev="${esc(x.sev)}" data-cat="${esc(x.cat)}">
          <span class="issue-n">${String(x.n).padStart(2, '0')}</span>
          <div class="issue-body">
            <div class="issue-head"><span class="sev-badge">${esc(G.t('severity.' + x.sev))}</span><span class="cat-badge">${esc(x.cat)}</span></div>
            <h3>${inline(x.title)}</h3>
            ${x.detail ? `<p>${inline(x.detail)}</p>` : ''}
            ${x.where ? `<p class="issue-where">${icon('link-2', 'ico ico-xs')} ${inline(x.where)}</p>` : ''}
          </div>
        </li>`).join('')}</ol>
    </div>`;
  });

  /* ---------- table ----------
   * attrs: style=typo  header + rows */
  G.component('table', ({ attrs, header, rows }) => `
    <div class="g-table-wrap" data-rv><table class="g-table ${attrs.style === 'typo' ? 'is-typo' : ''}">
      ${header ? `<thead><tr>${header.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead>` : ''}
      <tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td>${attrs.style === 'typo' && i === 0 ? `<del>${inline(c)}</del>` : attrs.style === 'typo' && i === 1 ? `<ins>${inline(c)}</ins>` : inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`);

  /* ---------- compare (claim vs reality) ----------
   * rows: title | claim | reality | fix | severity */
  G.component('compare', ({ rows }) => `
    <div class="g-compare">${rows.map(([t, claim, real, fix, sev], i) => `
      <article class="cmp sev-${esc((sev || 'medium').toLowerCase())}" data-rv style="--d:${(i % 3) * 70}ms">
        <header><span class="cmp-n">${String(i + 1).padStart(2, '0')}</span><h3>${inline(t)}</h3><span class="sev-badge">${esc(G.t('severity.' + (sev || 'medium').toLowerCase()))}</span></header>
        <div class="cmp-grid">
          <div class="cmp-claim"><small>${icon('megaphone', 'ico ico-xs')} Ce que dit le site</small><p>${inline(claim)}</p></div>
          <div class="cmp-real"><small>${icon('search-check', 'ico ico-xs')} Ce que voit le visiteur</small><p>${inline(real)}</p></div>
        </div>
        ${fix ? `<p class="cmp-fix">${icon('wrench', 'ico ico-xs')} ${inline(fix)}</p>` : ''}
      </article>`).join('')}</div>`);

  /* ---------- matrix (presence grid: yes / no / partial / ?) ----------
   * header: # Projet | Col A | Col B …    rows: name | yes | no | partial | ? */
  const CELL = { yes: ['check', 'is-yes', 'Présent'], no: ['x', 'is-no', 'Absent'], partial: ['minus', 'is-partial', 'Partiel'], '?': ['help-circle', 'is-unk', 'Incertain'] };
  G.component('matrix', ({ attrs, header, rows }) => `
    <div class="g-table-wrap" data-rv><table class="g-matrix">
      <thead><tr>${(header || []).map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(([name, ...cells]) => `<tr><th scope="row">${inline(name)}</th>${cells.map((c) => {
        const k = CELL[c.toLowerCase()] || CELL['?'];
        return `<td><span class="cell ${k[1]}" title="${k[2]}">${icon(k[0], 'ico ico-xs')}</span></td>`;
      }).join('')}</tr>`).join('')}</tbody>
    </table>
    <p class="matrix-legend">${Object.values(CELL).map((k) => `<span class="cell ${k[1]}">${icon(k[0], 'ico ico-xs')}</span>${k[2]}`).join('')}</p>
    ${attrs.note ? `<p class="chart-note">${inline(attrs.note)}</p>` : ''}</div>`);

  /* ---------- roadmap ----------
   * rows: phase | title | item; item; item | tone | icon */
  G.component('roadmap', ({ rows }) => `
    <ol class="g-roadmap">${rows.map(([phase, t, items, tone, ic], i) => `
      <li class="step tone-${esc(tone || TONES[i % TONES.length])}" data-rv style="--d:${i * 80}ms">
        <span class="step-dot">${icon(ic || 'flag')}</span>
        <div class="step-card">
          <span class="step-phase">${esc(phase)}</span>
          <h3>${inline(t)}</h3>
          <ul>${(items || '').split(';').filter(Boolean).map((x) => `<li>${icon('check', 'ico ico-xs')}<span>${inline(x.trim())}</span></li>`).join('')}</ul>
        </div>
      </li>`).join('')}</ol>`);

  /* ---------- callout ----------
   * attrs: tone, icon, title   body */
  G.component('callout', ({ attrs, body, rows }) => `
    <aside class="g-callout tone-${esc(attrs.tone || 'gold')}" data-rv>
      <span class="callout-ico">${icon(attrs.icon || 'info')}</span>
      <div>${attrs.title ? `<strong>${inline(attrs.title)}</strong>` : ''}${G.md([body, ...rows.map((r) => r.join(' | '))].filter(Boolean).join('\n'))}</div>
    </aside>`);

  /* ---------- checklist ----------
   * rows: text | state(done|todo) */
  G.component('checklist', ({ rows }) => `
    <ul class="g-check">${rows.map(([t, s]) => `<li class="${s === 'done' ? 'is-done' : ''}" data-rv>${icon(s === 'done' ? 'check-circle-2' : 'circle', 'ico ico-sm')}<span>${inline(t)}</span></li>`).join('')}</ul>`);

  /* ---------- quote ---------- attrs: author   body */
  G.component('quote', ({ attrs, body }) => `
    <blockquote class="g-quote" data-rv>${icon('quote')}<p>${inline(body)}</p>${attrs.author ? `<cite>${esc(attrs.author)}</cite>` : ''}</blockquote>`);

  /* ---------- cta ---------- attrs: title   body   rows: label | href | style | icon */
  G.component('cta', ({ attrs, body, rows }) => `
    <div class="g-cta" data-rv>
      <div><h3>${inline(attrs.title || '')}</h3>${body ? `<p>${inline(body)}</p>` : ''}</div>
      <div class="cta-actions">${rows.map(([l, h, s, i]) => `<a class="btn btn-${esc(s || 'gold')}" href="${esc(h || '#')}">${icon(i, 'ico ico-sm')}${esc(l)}</a>`).join('')}</div>
    </div>`);

  /* ======================================================================
   * Behaviours wired after each page render
   * ==================================================================== */
  function animateCount(el) {
    const to = parseFloat(el.dataset.count) || 0, dec = +el.dataset.dec || 0, grp = to >= 10000;
    if (G.reducedMotion) { el.textContent = fmt(to, dec, grp); return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e, dec, grp);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const palette = () => ['--c-gold', '--c-eco', '--c-sky', '--c-rose', '--c-violet', '--c-slate'].map(css);
  const sevColor = () => ({ critical: css('--c-rose'), high: css('--c-orange'), medium: css('--c-gold'), low: css('--c-sky') });

  function chartData(spec) {
    const { attrs } = spec;
    if (attrs.source === 'issues' && G.data.issues) {
      const by = attrs.by || 'severity';
      if (by === 'severity') {
        const c = sevColor();
        return { labels: SEV.map((s) => G.t('severity.' + s)), datasets: [{ label: 'Problèmes', data: SEV.map((s) => G.data.issues.filter((x) => x.sev === s).length), backgroundColor: SEV.map((s) => c[s]) }] };
      }
      const cats = [...new Set(G.data.issues.map((x) => x.cat))];
      const c = sevColor();
      return { labels: cats, datasets: SEV.map((s) => ({ label: G.t('severity.' + s), data: cats.map((k) => G.data.issues.filter((x) => x.cat === k && x.sev === s).length), backgroundColor: c[s] })) };
    }
    const header = spec.header || ['', 'Valeur'];
    const pal = palette();
    const series = header.slice(1);
    return {
      labels: spec.rows.map((r) => r[0]),
      datasets: series.map((name, si) => ({
        label: name,
        data: spec.rows.map((r) => num(r[si + 1])),
        backgroundColor: ['doughnut', 'pie', 'polarArea'].includes(attrs.type) ? spec.rows.map((_, i) => pal[i % pal.length]) : pal[si % pal.length] + (attrs.type === 'radar' || attrs.type === 'line' ? '33' : ''),
        borderColor: pal[si % pal.length],
        borderWidth: attrs.type === 'radar' || attrs.type === 'line' ? 2.5 : 0,
        pointBackgroundColor: pal[si % pal.length],
        fill: attrs.type === 'radar' || attrs.fill === 'true',
        tension: 0.35,
        borderRadius: 8,
        borderDash: attrs.dashed && si > 0 ? [6, 5] : undefined,
      })),
    };
  }

  function drawChart(spec) {
    const el = document.getElementById(spec.id);
    if (!el || !window.Chart) return;
    if (spec.inst) spec.inst.destroy();
    const a = spec.attrs, text = css('--text-2'), grid = css('--line');
    const type = a.type || 'bar';
    const round = ['doughnut', 'pie', 'polarArea'].includes(type);
    Chart.defaults.font.family = css('--font-body') || 'Inter';
    const scales = round ? {} : type === 'radar'
      ? { r: { min: 0, max: +a.max || 100, ticks: { display: false, stepSize: 20 }, grid: { color: grid }, angleLines: { color: grid }, pointLabels: { color: text, font: { size: 12, weight: 600 } } } }
      : { x: { stacked: a.stacked === 'true', grid: { display: a.horizontal === 'true', color: grid }, ticks: { color: text } },
          y: { stacked: a.stacked === 'true', beginAtZero: true, grid: { color: grid, display: a.horizontal !== 'true' }, ticks: { color: text, precision: 0 }, max: a.max ? +a.max : undefined } };
    spec.inst = new Chart(el, {
      type,
      data: chartData(spec),
      options: {
        responsive: true, maintainAspectRatio: false,
        indexAxis: a.horizontal === 'true' ? 'y' : 'x',
        cutout: type === 'doughnut' ? '64%' : undefined,
        animation: G.reducedMotion ? false : { duration: 1400, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: round || (spec.header && spec.header.length > 2) || a.source === 'issues' && a.by === 'category', position: round ? 'right' : 'bottom', labels: { color: text, usePointStyle: true, padding: 16 } },
          tooltip: { backgroundColor: css('--ink-900'), padding: 12, cornerRadius: 10, callbacks: a.unit ? { label: (c) => ` ${c.dataset.label}: ${c.formattedValue}${a.unit}` } : {} },
        },
        scales,
      },
    });
  }

  function wireIssues(root) {
    root.querySelectorAll('[data-issues]').forEach((box) => {
      const state = { sev: '*', cat: '*' };
      box.querySelectorAll('[data-group]').forEach((g) => g.addEventListener('click', (e) => {
        const b = e.target.closest('[data-f]'); if (!b) return;
        g.querySelectorAll('[data-f]').forEach((x) => x.classList.toggle('is-active', x === b));
        state[g.dataset.group] = b.dataset.f;
        box.querySelectorAll('.issue').forEach((li) => {
          const ok = (state.sev === '*' || li.dataset.sev === state.sev) && (state.cat === '*' || li.dataset.cat === state.cat);
          li.hidden = !ok;
        });
      }));
    });
  }

  document.addEventListener('g:page', () => {
    const root = document;
    root.querySelectorAll('[data-count]').forEach((el) => G.onVisible(el, () => animateCount(el), 0.4));
    root.querySelectorAll('[data-bar]').forEach((el) => G.onVisible(el, () => { el.style.width = el.dataset.bar + '%'; }, 0.3));
    root.querySelectorAll('[data-gauge]').forEach((el) => G.onVisible(el, () => {
      const c = +el.dataset.circ; el.style.strokeDashoffset = String(c - (c * +el.dataset.gauge) / 100);
    }, 0.4));
    G.charts.forEach((spec) => { const el = document.getElementById(spec.id); el && G.onVisible(el, () => { spec.visible = true; drawChart(spec); }, 0.25); });
    wireIssues(root);
  });
  document.addEventListener('g:theme', () => setTimeout(() => G.charts.forEach((s) => s.visible && drawChart(s)), 30));
})();
