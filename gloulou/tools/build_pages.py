#!/usr/bin/env python3
"""Generate the thin HTML shells (one per page). Each shell only says which MD file to load.
Edit PAGES below to add a page, then run: python3 tools/build_pages.py"""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = [
  # file, md source, title (fallback before MD loads), charts?
  ('index.html', 'accueil', 'Immobilière Gloulou — Promoteur immobilier en Tunisie depuis 1986', False),
  ('projets.html', 'projets', 'Nos projets — Immobilière Gloulou', False),
  ('projet.html', 'projets/{slug}', 'Projet — Immobilière Gloulou', False),
  ('a-propos.html', 'a-propos', 'À propos — Immobilière Gloulou', False),
  ('services.html', 'services', 'Nos métiers — Immobilière Gloulou', False),
  ('investir.html', 'investir', 'Investir avec Immobilière Gloulou', False),
  ('engagement.html', 'engagement', 'Notre démarche bas carbone — Immobilière Gloulou', False),
  ('parrainage.html', 'parrainage', 'Parrainage — Immobilière Gloulou', False),
  ('contact.html', 'contact', 'Contact — Immobilière Gloulou', False),
  ('blog.html', 'blog', 'Conseils & guides — Immobilière Gloulou', False),
  ('actualites.html', 'actualites', "Vie de l'entreprise — Immobilière Gloulou", False),
  ('avancements.html', 'avancements', 'Avancements de chantier — Immobilière Gloulou', False),
  ('article.html', 'articles/{slug}', 'Article — Immobilière Gloulou', False),
  ('videos.html', 'videos', 'Vidéos — Immobilière Gloulou', False),
  ('newsletter.html', 'newsletter', 'Newsletter — Immobilière Gloulou', False),
  ('mentions-legales.html', 'mentions-legales', 'Mentions légales — Immobilière Gloulou', False),
  ('politique-de-confidentialite.html', 'politique-de-confidentialite', 'Politique de confidentialité — Immobilière Gloulou', False),
  ('cookies.html', 'cookies', 'Gestion des cookies — Immobilière Gloulou', False),
  ('plan-du-site.html', 'plan-du-site', 'Plan du site — Immobilière Gloulou', False),
  ('audit.html', 'audit', 'Audit du site immobilieregloulou.com — W5D', True),
  ('404.html', '404', 'Page introuvable — Immobilière Gloulou', False),
]
TPL = '''<!DOCTYPE html>
<html lang="fr" class="dark scroll-smooth">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content="Immobilière Gloulou, promoteur immobilier en Tunisie depuis 1986 : résidences, bureaux et commerces à Tunis et dans le Sahel." />
<meta property="og:type" content="website" /><meta property="og:site_name" content="Immobilière Gloulou" />
<meta name="theme-color" content="#c21128" />
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
<!-- 1. Boot: theme before paint + animated loader -->
<script src="js/core/boot.js"></script>
<!-- 2. Tailwind CDN + W5D config recoloured red -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="js/core/tw.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/gloulou.css" />
<!-- 3. Libraries -->
<script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js" defer></script>
<script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js" defer></script>{charts}
<!-- 4. Engine + reusable components -->
<script src="js/core/app.js" defer></script>
<script src="js/components/layout.js" defer></script>
<script src="js/components/blocks.js" defer></script>
<script src="js/components/realestate.js" defer></script>
<script src="js/components/report.js" defer></script>
</head>
<body>
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] btn btn-primary">Aller au contenu</a>
<g-progress></g-progress>
<g-header></g-header>
<main id="main"><g-page src="{src}"></g-page></main>
<g-footer></g-footer>
<g-cookie></g-cookie>
<noscript><p style="padding:2rem;text-align:center">Ce site nécessite JavaScript pour afficher son contenu.</p></noscript>
</body>
</html>
'''
CH = '\n<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js" defer></script>'
for f, src, title, charts in PAGES:
    open(os.path.join(ROOT, f), 'w').write(TPL.format(title=title, src=src, charts=CH if charts else ''))
print(len(PAGES), 'shells written')
