/* ==========================================================================
 * Gloulou × W5D — Block library, part 3: report / data-viz (used by audit.md)
 *   gauges · chart (Chart.js, theme-aware) · bars · issues (filterable) ·
 *   typo-table · compare · matrix · roadmap · checklist · callout · toc
 * ========================================================================== */
(function () {
  'use strict';
  const G = window.G;
  const { esc, inline, icon, t, md, num } = G;
  const SEV = ['critical', 'high', 'medium', 'low'];
  const W = (inner, a) => G.wrapSection(`<div class="max-w-6xl mx-auto px-4 sm:px-6">${inner}</div>`, a || {});

  G.block('callout', ({ attrs: a, body, raw }) => `<div class="max-w-4xl mx-auto px-4 sm:px-6 my-8"><aside data-rv="up" class="relative overflow-hidden rounded-2xl p-6 flex gap-4 border ${a.tone === 'warn' ? 'border-rose-500/30 bg-rose-500/[.06]' : a.tone === 'ok' ? 'border-emerald-500/30 bg-emerald-500/[.06]' : 'border-brand-500/25 bg-brand-500/[.05]'}">
    <span class="ico-tile ${a.tone === 'ok' ? '!bg-emerald-500/15 !text-emerald-600' : ''}">${icon(a.icon || 'info')}</span>
    <div>${a.title ? `<p class="font-semibold ink">${inline(a.title)}</p>` : ''}<div class="muted mt-1 prose-g !text-[15px]">${md(body || raw.replace(/^>\s?/gm, ''))}</div></div></aside></div>`);

  G.block('gauges', ({ attrs: a, rows, body }) => W(`${G.sectionHead(a, body)}<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">${rows.map(([label, score, note], i) => {
    const s = Math.max(0, Math.min(100, num(score))), r = 52, c = 2 * Math.PI * r;
    const col = s < 35 ? '#e11d48' : s < 60 ? '#f97316' : '#10b981';
    return `<figure data-rv="up" class="surface rounded-2xl p-6 text-center ${i === 0 && a.big ? 'col-span-2 lg:col-span-1 lg:row-span-1' : ''}">
      <div class="relative mx-auto w-32 h-32"><svg viewBox="0 0 120 120" class="w-full h-full -rotate-90"><circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--line-2)" stroke-width="9"/><circle class="gauge-fill" cx="60" cy="60" r="${r}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-gauge="${s}" data-circ="${c}" style="filter:drop-shadow(0 0 6px ${col}66)"/></svg>
        <div class="absolute inset-0 grid place-items-center"><span class="font-display text-3xl font-bold ink"><span data-counter="${s}">0</span><small class="text-sm faint">/100</small></span></div></div>
      <figcaption class="mt-4"><p class="font-semibold ink text-sm">${inline(label)}</p>${note ? `<p class="text-xs faint mt-1">${inline(note)}</p>` : ''}</figcaption></figure>`; }).join('')}</div>`, a));
  G.after((root) => root.querySelectorAll('[data-gauge]').forEach((el) => G.onVisible(el, () => { const c = +el.dataset.circ; el.style.strokeDashoffset = c - (c * +el.dataset.gauge) / 100; }, 0.4)));

  G.block('bars', ({ attrs: a, rows, body }) => W(`${G.sectionHead(a, body)}<div class="surface rounded-3xl p-6 sm:p-8 space-y-5">${rows.map(([label, v, max, note], i) => {
    const pct = Math.max(3, Math.min(100, (num(v) / (num(max) || 100)) * 100));
    return `<div data-rv="up"><div class="flex justify-between gap-4 text-sm"><span class="ink font-medium">${inline(label)}</span><strong class="ink stat-num"><span data-counter="${num(v)}">0</span></strong></div>
      <div class="h-2.5 rounded-full bg-soft mt-2 overflow-hidden"><span class="bar-fill block h-full rounded-full bg-gradient-to-r from-brand-600 via-rose-500 to-cyan-500" data-bar="${pct}" style="--d:${i * 70}ms"></span></div>${note ? `<p class="text-xs faint mt-1.5">${inline(note)}</p>` : ''}</div>`; }).join('')}</div>`, a));
  G.after((root) => root.querySelectorAll('[data-bar]').forEach((el) => G.onVisible(el, () => (el.style.width = el.dataset.bar + '%'), 0.3)));

  /* chart */
  let cid = 0; G.charts = [];
  G.block('chart', ({ attrs: a, header, rows, body }) => {
    const id = 'gc' + ++cid; G.charts.push({ id, a, header, rows });
    const fig = `<figure class="surface rounded-3xl p-5 sm:p-7 h-full" data-rv="zoom">${a.title ? `<figcaption class="font-semibold ink flex items-center gap-2 mb-4">${icon(a.icon || 'bar-chart-3', 'w-4 h-4 text-brand-500')} ${inline(a.title)}</figcaption>` : ''}
      <div class="relative" style="height:${esc(a.height || 320)}px"><canvas id="${id}" role="img" aria-label="${esc(a.title || '')}"></canvas></div>${body ? `<p class="text-xs faint mt-4">${inline(body)}</p>` : ''}</figure>`;
    return a.bare ? fig : `<div class="max-w-6xl mx-auto px-4 sm:px-6 my-6">${fig}</div>`;
  });
  G.block('grid', async ({ attrs: a, raw }) => `<div class="max-w-6xl mx-auto px-4 sm:px-6 my-6 grid lg:grid-cols-${a.cols || 2} gap-5">${await G.render(raw.replace(/^(:{3}\s*chart)/gm, '$1 bare'), { raw: true })}</div>`);
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const PAL = ['#c21128', '#f97316', '#dcb55a', '#e11d48', '#78716c', '#fb7185'];
  const SEVC = { critical: '#e11d48', high: '#f97316', medium: '#dcb55a', low: '#a8a29e' };
  function data(s) {
    const a = s.a;
    if (a.source === 'issues' && G.data.issues) {
      const I = G.data.issues;
      if (a.by !== 'category') return { labels: SEV.map((x) => t('sev.' + x)), datasets: [{ label: t('report.issues'), data: SEV.map((x) => I.filter((i) => i.sev === x).length), backgroundColor: SEV.map((x) => SEVC[x]), borderWidth: 0 }] };
      const cats = [...new Set(I.map((i) => i.cat))];
      return { labels: cats, datasets: SEV.map((x) => ({ label: t('sev.' + x), data: cats.map((c) => I.filter((i) => i.cat === c && i.sev === x).length), backgroundColor: SEVC[x], borderRadius: 6 })) };
    }
    const round = ['doughnut', 'pie', 'polarArea'].includes(a.type);
    return { labels: s.rows.map((r) => r[0]), datasets: (s.header || ['', 'Valeur']).slice(1).map((name, i) => ({
      label: name, data: s.rows.map((r) => num(r[i + 1])),
      backgroundColor: round ? s.rows.map((_, k) => PAL[k % PAL.length]) : PAL[i] + (a.type === 'radar' || a.type === 'line' ? '33' : ''),
      borderColor: PAL[i], borderWidth: a.type === 'radar' || a.type === 'line' ? 2.5 : 0, pointBackgroundColor: PAL[i], fill: a.type === 'radar', tension: .35, borderRadius: 8, borderDash: a.dashed && i ? [6, 5] : undefined })) };
  }
  function draw(s) {
    const el = document.getElementById(s.id); if (!el || !window.Chart) return;
    s.inst && s.inst.destroy();
    const a = s.a, tx = css('--text-2'), gr = css('--line-2'), type = a.type || 'bar', round = ['doughnut', 'pie', 'polarArea'].includes(type);
    Chart.defaults.font.family = 'Inter';
    s.inst = new Chart(el, { type, data: data(s), options: {
      responsive: true, maintainAspectRatio: false, indexAxis: a.horizontal ? 'y' : 'x', cutout: type === 'doughnut' ? '62%' : undefined,
      animation: G.reduced ? false : { duration: 1400, easing: 'easeOutQuart' },
      plugins: { legend: { display: round || (s.header && s.header.length > 2) || a.by === 'category', position: round ? 'right' : 'bottom', labels: { color: tx, usePointStyle: true, padding: 14 } }, tooltip: { backgroundColor: '#1b1214', padding: 12, cornerRadius: 10 } },
      scales: round ? {} : type === 'radar' ? { r: { min: 0, max: +a.max || 100, ticks: { display: false }, grid: { color: gr }, angleLines: { color: gr }, pointLabels: { color: tx, font: { size: 12, weight: 600 } } } }
        : { x: { stacked: !!a.stacked, grid: { display: !!a.horizontal, color: gr }, ticks: { color: tx } }, y: { stacked: !!a.stacked, beginAtZero: true, grid: { color: gr, display: !a.horizontal }, ticks: { color: tx, precision: 0 } } } } });
  }
  G.after(() => G.charts.forEach((s) => { const el = document.getElementById(s.id); el && !s.seen && G.onVisible(el, () => { s.seen = 1; draw(s); }, 0.2); }));
  document.addEventListener('g:theme', () => setTimeout(() => G.charts.forEach((s) => s.seen && draw(s)), 60));

  /* issues register */
  G.block('issues', ({ attrs: a, rows, body }) => {
    const I = (G.data.issues = rows.map(([sev, cat, title, detail, where], i) => ({ n: i + 1, sev, cat, title, detail, where })));
    const cats = [...new Set(I.map((i) => i.cat))];
    return W(`${G.sectionHead(a, body)}
      <div class="sticky top-24 z-10 glass rounded-2xl p-3 mb-6 space-y-2 no-print" data-issue-filters>
        <div class="flex flex-wrap gap-2" data-g="sev"><button class="chip is-active" data-f="*">${esc(t('common.all'))} <b>${I.length}</b></button>${SEV.map((s) => `<button class="chip" data-f="${s}"><span class="w-2 h-2 rounded-full" style="background:${SEVC[s]}"></span>${esc(t('sev.' + s))} <b>${I.filter((i) => i.sev === s).length}</b></button>`).join('')}</div>
        <div class="flex flex-wrap gap-2" data-g="cat"><button class="chip is-active" data-f="*">${icon('layers', 'w-3.5 h-3.5')} ${esc(t('common.all'))}</button>${cats.map((c) => `<button class="chip" data-f="${esc(c)}">${esc(c)} <b>${I.filter((i) => i.cat === c).length}</b></button>`).join('')}</div></div>
      <ol class="space-y-3" data-issue-list>${I.map((i) => `<li class="issue sev-${esc(i.sev)} surface rounded-2xl p-5 grid grid-cols-[44px_1fr] gap-3" data-sev="${esc(i.sev)}" data-cat="${esc(i.cat)}">
        <span class="font-display text-xl font-bold faint">${String(i.n).padStart(2, '0')}</span>
        <div><div class="flex flex-wrap gap-2"><span class="badge sev-badge">${esc(t('sev.' + i.sev))}</span><span class="text-xs font-semibold muted border line rounded-full px-2.5 py-1">${esc(i.cat)}</span></div>
          <h3 class="font-semibold ink mt-2">${inline(i.title)}</h3>${i.detail ? `<p class="text-sm muted mt-1">${inline(i.detail)}</p>` : ''}${i.where ? `<p class="text-xs faint mt-1.5 flex gap-1.5">${icon('link-2', 'w-3.5 h-3.5 flex-none mt-0.5')} <span>${inline(i.where)}</span></p>` : ''}</div></li>`).join('')}</ol>`, a);
  });
  G.after((root) => root.querySelectorAll('[data-issue-filters]').forEach((box) => {
    const st = { sev: '*', cat: '*' }; const list = box.nextElementSibling;
    box.querySelectorAll('[data-g]').forEach((g) => g.onclick = (e) => { const b = e.target.closest('[data-f]'); if (!b) return; g.querySelectorAll('[data-f]').forEach((x) => x.classList.toggle('is-active', x === b)); st[g.dataset.g] = b.dataset.f;
      list.querySelectorAll('.issue').forEach((li) => li.hidden = !((st.sev === '*' || li.dataset.sev === st.sev) && (st.cat === '*' || li.dataset.cat === st.cat))); });
  }));

  G.block('typo-table', ({ attrs: a, header, rows, body }) => W(`${G.sectionHead(a, body)}<div class="surface rounded-3xl overflow-x-auto" data-rv="up"><table class="w-full text-sm"><thead><tr class="text-left text-[11px] uppercase tracking-widest faint">${(header || []).map((h) => `<th class="p-4 border-b line">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(([w, r, where]) => `<tr class="border-b line last:border-0 hover:bg-[var(--surface-2)]"><td class="p-4"><del class="typo">${esc(w)}</del></td><td class="p-4"><ins class="typo">${esc(r)}</ins></td><td class="p-4 muted">${esc(where || '')}</td></tr>`).join('')}</tbody></table></div>`, a));

  G.block('compare', ({ attrs: a, rows, body }) => W(`${G.sectionHead(a, body)}<div class="grid md:grid-cols-2 gap-4">${rows.map(([title, claim, real, fix, sev], i) => `<article data-rv="up" class="sev-${esc(sev || 'medium')} surface rounded-2xl p-5 flex flex-col gap-3">
    <header class="flex items-start gap-3"><span class="font-display text-lg font-bold" style="color:var(--sc)">${String(i + 1).padStart(2, '0')}</span><h3 class="font-semibold ink flex-1">${inline(title)}</h3><span class="badge sev-badge">${esc(t('sev.' + (sev || 'medium')))}</span></header>
    <div class="grid sm:grid-cols-2 gap-2 text-sm"><div class="rounded-xl p-3 bg-gold-400/10"><p class="text-[10px] uppercase tracking-widest font-bold text-gold-600 dark:text-gold-300 mb-1">${esc(t('report.claim'))}</p><p class="ink">${inline(claim)}</p></div>
      <div class="rounded-xl p-3 bg-rose-500/[.07]"><p class="text-[10px] uppercase tracking-widest font-bold text-rose-600 dark:text-rose-400 mb-1">${esc(t('report.reality'))}</p><p class="ink">${inline(real)}</p></div></div>
    ${fix ? `<p class="text-sm muted border-t border-dashed line pt-3 flex gap-2">${icon('wrench', 'w-4 h-4 text-emerald-500 flex-none mt-0.5')} ${inline(fix)}</p>` : ''}</article>`).join('')}</div>`, a));

  const CELL = { yes: ['check', 'yes'], no: ['x', 'no'], partial: ['minus', 'partial'], '?': ['help-circle', 'unk'] };
  G.block('matrix', ({ attrs: a, header, rows, body }) => W(`${G.sectionHead(a, body)}<div class="surface rounded-3xl overflow-x-auto" data-rv="up"><table class="w-full text-sm"><thead><tr class="text-[11px] uppercase tracking-widest faint">${(header || []).map((h, i) => `<th class="p-4 border-b line ${i ? 'text-center' : 'text-left'} whitespace-nowrap">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(([n, ...c]) => `<tr class="border-b line last:border-0"><th class="p-4 text-left font-semibold ink whitespace-nowrap">${esc(n)}</th>${c.map((x) => { const k = CELL[x] || CELL['?']; return `<td class="p-3 text-center"><span class="cell ${k[1]}">${icon(k[0], 'w-3.5 h-3.5')}</span></td>`; }).join('')}</tr>`).join('')}</tbody></table>
    ${a.note ? `<p class="text-xs faint p-4 border-t line">${inline(a.note)}</p>` : ''}</div>`, a));

  G.block('roadmap', ({ attrs: a, rows, body }) => W(`${G.sectionHead(a, body)}<ol class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 stagger">${rows.map(([phase, title, items, ic], i) => `<li data-rv="up" class="surface rounded-2xl p-6 relative overflow-hidden">
    <span class="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-brand-500/10 blur-2xl"></span>
    <span class="w-12 h-12 rounded-2xl grid place-items-center text-white bg-gradient-to-br from-brand-600 to-cyan-500 shadow-lg shadow-brand-600/30">${icon(ic || 'flag')}</span>
    <p class="text-[11px] uppercase tracking-widest font-bold text-brand-600 dark:text-brand-400 mt-4">${esc(phase)}</p><h3 class="font-display text-lg font-bold ink mt-1">${inline(title)}</h3>
    <ul class="mt-4 space-y-2">${items.split(';').map((x) => `<li class="flex gap-2 text-sm muted">${icon('check', 'w-4 h-4 text-brand-500 flex-none mt-0.5')}<span>${inline(x.trim())}</span></li>`).join('')}</ul></li>`).join('')}</ol>`, a));

  G.block('checklist', ({ attrs: a, rows, body }) => W(`${G.sectionHead(a, body)}<ul class="grid sm:grid-cols-2 gap-3">${rows.map(([x, s]) => `<li data-rv="up" class="surface rounded-xl p-4 flex gap-3 text-sm ink">${icon(s === 'done' ? 'check-circle-2' : 'circle-dashed', 'w-5 h-5 flex-none ' + (s === 'done' ? 'text-emerald-500' : 'faint'))}<span>${inline(x)}</span></li>`).join('')}</ul>`, a));
})();
