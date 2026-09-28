/* Gloulou × W5D — Tailwind (CDN) configuration.
 * Same DNA as the W5D template, recoloured: every blue / indigo / violet / cyan
 * utility is remapped to a red equivalent, and slate becomes a warm stone grey,
 * so any template class copied from /pages/blocks.html renders on-brand. */
/* NOTE: must be loaded AFTER https://cdn.tailwindcss.com — the CDN script re-initialises
 * `window.tailwind` and would silently discard a config set before it. */
(function () {
  const crimson = { 50: '#fff1f2', 100: '#ffe1e3', 200: '#ffc8cd', 300: '#ff9ca7', 400: '#fb6479', 500: '#ea2d4b', 600: '#c21128', 700: '#a10d22', 800: '#860f22', 900: '#721123', 950: '#40040e' };
  const rose    = { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' };
  const coral   = { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' };
  const stone   = { 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09' };
  const gold    = { 200: '#f3e3b3', 300: '#e9cf85', 400: '#dcb55a', 500: '#c99a36', 600: '#a67c24' };
  window.tailwind = window.tailwind || {};
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          brand: crimson,
          ink: { 950: '#0c0708', 900: '#130c0e', 800: '#1b1214', 700: '#271a1d' },
          gold,
          // blue family → red family
          indigo: rose, violet: crimson, purple: rose, blue: crimson, sky: rose, cyan: coral, teal: coral,
          slate: stone, gray: stone,
        },
        fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['"Space Grotesk"', 'Inter', 'sans-serif'], serif: ['"Playfair Display"', 'Georgia', 'serif'] },
      },
    },
  };
})();
