/* Gloulou × W5D — Boot (load EARLY in <head>, not deferred).
 * 1. Applies the saved theme before first paint (no flash).
 * 2. Injects the animated logo loader (W5D loader DNA, red palette). */
(function () {
  var root = document.documentElement;
  var t = localStorage.getItem('gloulou-theme');
  if (!t) t = 'dark'; // W5D default
  root.classList.toggle('dark', t === 'dark');

  var css = "#g-loader{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,#1b1214 0%,#0c0708 100%);transition:opacity .55s ease,visibility .55s ease;font-family:'Space Grotesk',Inter,system-ui,sans-serif}" +
    "#g-loader.is-hidden{opacity:0;visibility:hidden;pointer-events:none}" +
    "#g-loader .li{display:flex;flex-direction:column;align-items:center;gap:1.1rem}" +
    "#g-loader .lm{width:96px;height:96px;border-radius:1.4rem;background:linear-gradient(135deg,#c21128,#e11d48,#f97316);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 44px -8px rgba(194,17,40,.6);animation:gPop 2s ease-in-out infinite;position:relative;overflow:hidden}" +
    "#g-loader .lm::before{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.4) 50%,transparent 70%);animation:gShine 2.4s linear infinite}" +
    "#g-loader .lm svg{width:58px;height:58px;position:relative;z-index:1}" +
    "#g-loader .lt{font-weight:700;font-size:1.05rem;background:linear-gradient(90deg,#c21128,#fb923c,#dcb55a,#c21128);-webkit-background-clip:text;background-clip:text;color:transparent;background-size:200% 100%;animation:gSlide 2.2s linear infinite;letter-spacing:.02em}" +
    "#g-loader .ls{font-size:.7rem;letter-spacing:.35em;text-transform:uppercase;color:#dcb55a;opacity:.85}" +
    "#g-loader .lb{width:200px;height:3px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden;position:relative}" +
    "#g-loader .lb::after{content:'';position:absolute;inset:0;width:40%;background:linear-gradient(90deg,transparent,#c21128,#fb923c,transparent);animation:gBar 1.4s ease-in-out infinite}" +
    "@keyframes gPop{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}@keyframes gShine{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}" +
    "@keyframes gSlide{0%{background-position:0 0}100%{background-position:200% 0}}@keyframes gBar{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}" +
    "@media(prefers-reduced-motion:reduce){#g-loader *{animation:none!important}}";
  var s = document.createElement('style'); s.textContent = css; (document.head || root).appendChild(s);

  var MARK = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M44 22a16 16 0 1 0 4 12H33" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="31" cy="34" r="3.6" fill="#fff"/></svg>';
  function build() {
    if (document.getElementById('g-loader')) return;
    if (!document.body) return setTimeout(build, 10);
    var l = document.createElement('div'); l.id = 'g-loader'; l.setAttribute('aria-hidden', 'true');
    l.innerHTML = '<div class="li"><div class="lm">' + MARK + '</div><div class="lt">Immobilière Gloulou</div><div class="ls">Since 1986</div><div class="lb"></div></div>';
    document.body.appendChild(l);
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build, { once: true });
  window.__gHideLoader = function () {
    var l = document.getElementById('g-loader'); if (!l) return;
    setTimeout(function () { l.classList.add('is-hidden'); }, 150);
    setTimeout(function () { l.parentNode && l.parentNode.removeChild(l); }, 900);
  };
  setTimeout(window.__gHideLoader, 5000); // hard cap
})();
