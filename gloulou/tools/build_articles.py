#!/usr/bin/env python3
"""Generate content/fr/articles/*.md + data/fr/posts.json from the legacy WordPress export.

Editorial rules applied (from the audit):
  * no Unicode "fake bold" (𝗯𝗼𝗹𝗱) → normal text; no emoji in titles/URLs
  * clean, readable slugs; every post has a title, an excerpt and its own cover
  * the six untitled progress posts receive a title + short text (identified from their photos)
  * spelling fixes from the audit's correction table
  * Arabic greetings are adapted in French (FR is the site language; AR comes via config later)
  * categories: avancement (Projets & avancements) · news (Vie de l'entreprise) · blog (Conseils & guides)
  * legacy karting tender / test posts are NOT republished (archived only)
Re-run safely: `python3 tools/build_articles.py` (overwrites generated files only).
"""
import json, re, os, unicodedata, math
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools/source/posts_clean.json')
OUT_MD = os.path.join(ROOT, 'content/fr/articles')
OUT_JSON = os.path.join(ROOT, 'data/fr/posts.json')
os.makedirs(OUT_MD, exist_ok=True)

def unbold(s):
    # Maps Mathematical Alphanumeric Symbols back to ASCII (NFKC does it) and strips emoji
    s = unicodedata.normalize('NFKC', s)
    s = re.sub(r'[\U0001F300-\U0001FAFF\u2600-\u27BF\uFE0F\u200d]', '', s)
    return re.sub(r'\s+', ' ', s).strip()

def slugify(s):
    s = unicodedata.normalize('NFKD', unbold(s)).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:70]

FIX = [(r'1ér', '1er'), (r'tout au long durée', 'tout au long de la durée'), (r'\bdes conseillers experts', 'Des conseillers experts'),
       (r'Saissez', 'Saisissez'), (r'Identifiez lès', 'Identifiez-les'), (r'Un conception', 'Une conception'),
       (r'réservé à des privilège', 'réservée à des privilégiés'), (r'les verges', 'les Vergers'), (r'étape commercial,', 'étape commerciale,'), (r'Ce le premier', 'Le premier')]
def fix(s):
    for a, b in FIX: s = re.sub(a, b, s)
    return s

PROJ = [('bel ?azur|belazur', 'bel-azur'), ('nablus|manouba', 'nablus'), ('fuji', 'fuji'), ('koya|hc9', 'koya'), ('silvana', 'silvana'),
        ('prestige ?2|prestige2|prestige ii', 'prestige-2'), ('prestige', 'prestige'), ('wave', 'the-wave'), ('jasmins? ?5', 'jasmins-5'),
        ('jasmins? ?4', 'jasmins-4'), ('saint.?tropez', 'saint-tropez'), ('carthage', 'carthage-center'), ('houda', 'el-houda-sousse')]
def detect_project(txt):
    t = txt.lower()
    for pat, slug in PROJ:
        if re.search(pat, t): return slug
    return None

MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
PNAME = {'bel-azur': 'Bel Azur', 'nablus': 'Nablus', 'fuji': 'FUJI', 'koya': 'KOYA', 'prestige': 'Prestige', 'prestige-2': 'Prestige II', 'the-wave': 'The Wave',
         'jasmins-5': 'Jasmins 5', 'jasmins-4': 'Jasmins 4', 'saint-tropez': 'Saint-Tropez', 'carthage-center': 'Carthage Center', 'el-houda-sousse': 'El Houda', 'silvana': 'Silvana'}

# --- Titles / texts for untitled or poorly titled legacy posts (identified from their photos & covers) ---
OVERRIDE = {
  3536: dict(title="Bel Azur — avancement de septembre 2026 : maçonnerie et façades", project='bel-azur', excerpt="La maçonnerie des étages supérieurs se termine et les premiers enduits de façade apparaissent sur Bel Azur, à M'Saken.",
             body="Le chantier de la **Résidence Bel Azur** franchit une nouvelle étape en ce mois de septembre 2026.\n\n- **Gros œuvre :** la maçonnerie en briques des derniers niveaux est en voie d'achèvement.\n- **Façades :** les premiers enduits et les échafaudages de finition sont en place sur les blocs principaux.\n- **Prochaine étape :** menuiseries extérieures et garde-corps.\n\nRetrouvez ci-dessous les photos prises sur site."),
  3534: dict(title="Bel Azur — la façade inspirée des styles européens prend ses couleurs", project='bel-azur', excerpt="Les premières teintes de la façade de Bel Azur sont appliquées : l'élégance intemporelle voulue par l'architecte se révèle.",
             body="Sur la **Résidence Bel Azur**, les teintes définitives de la façade sont en cours d'application, avec le rose poudré des étages, les modénatures et les encadrements de fenêtres.\n\nCette signature architecturale, inspirée des styles européens, fait de Bel Azur une adresse reconnaissable au cœur de M'Saken."),
  3527: dict(title="Nablus — septembre 2026 : les blocs sont hors d'eau, place aux finitions", project='nablus', excerpt="Les cinq blocs du complexe Nablus à Manouba sont hors d'eau ; façades et aménagements intérieurs avancent.",
             body="Au **Complexe Nablus** (Manouba), les façades des blocs sont achevées et les travaux se concentrent désormais sur les finitions intérieures et les espaces extérieurs.\n\n- Façades et balcons terminés sur l'ensemble des blocs\n- Revêtements et cloisons en cours dans les appartements\n- Vue aérienne : l'emprise complète du projet est désormais lisible"),
  3500: dict(title="Nablus — découvrez les appartements finis et l'appartement témoin", project='nablus', excerpt="Premières pièces livrées et appartement témoin meublé : visite en images des intérieurs du complexe Nablus.",
             body="Les premiers appartements du **Complexe Nablus** sont finis : sols en marbre clair, menuiseries double vitrage, radiateurs et climatisation.\n\nL'**appartement témoin** est désormais meublé et visitable sur rendez-vous : un bon moyen de se projeter dans les volumes et la luminosité des S+1, S+2 et S+3."),
  3493: dict(title="Bel Azur — août 2026 : la structure se révèle sur toute sa hauteur", project='bel-azur', excerpt="Vue d'ensemble du chantier Bel Azur en août 2026 : structure complète et premiers enduits.",
             body="En août 2026, la structure de la **Résidence Bel Azur** est visible sur toute sa hauteur. Les équipes poursuivent les enduits de façade et la préparation des lots techniques."),
  3480: dict(title="Nablus — l'appartement témoin ouvre ses portes à Manouba", project='nablus', excerpt="Salon lumineux, finitions haut de gamme : l'appartement témoin du complexe Nablus est prêt à vous accueillir.",
             body="L'**appartement témoin du Complexe Nablus** est prêt. Salon ouvert, cuisine équipée, finitions soignées et lumière naturelle : venez le découvrir sur place, à Manouba.\n\n**Prenez rendez-vous** avec un conseiller pour organiser votre visite."),
  2606: dict(title="Fuji Apartments : un havre de paix écologique au cœur de Tunis"),
  2498: dict(title="Définir des objectifs d'investissement immobilier concrets", cat='blog'),
  2418: dict(title="Immobilière Gloulou : bâtir l'avenir vert de la Tunisie"),
  2412: dict(title="Le marché immobilier tunisien : repères (archive 2024)", cat='blog', note="Archive 2024 — les éléments réglementaires cités doivent être vérifiés auprès des sources officielles avant toute décision."),
  2392: dict(title="Investir en Tunisie : nos conseils essentiels", cat='blog'),
  3474: dict(title="Immobilier & durabilité : la construction verte a le vent en poupe", cat='blog'),
  3364: dict(title="Une reconnaissance qui reflète l'excellence de toute une équipe", body="Immobilière Gloulou a eu l'honneur de recevoir une distinction qui récompense l'engagement de toutes ses équipes : commerciales, techniques, juridiques et administratives.\n\nMerci à nos clients et partenaires pour leur confiance renouvelée."),
  3349: dict(title="Découvrez notre projet le plus luxueux : Silvana", project='silvana'),
  3345: dict(title="Ce qui fait un bon projet immobilier selon Gloulou", cat='blog'),
  3420: dict(title="Nouveau lancement : découvrez KOYA, le nouveau joyau d'El Menzah 9C", project='koya'),
  3225: dict(title="Aïd al-Adha 2025 : nos meilleurs vœux", body="À l'occasion de l'Aïd al-Adha, toute l'équipe d'Immobilière Gloulou vous adresse ses vœux les plus chaleureux de paix, de santé et de prospérité, à vous et à vos proches."),
  3042: dict(title="Aïd el-Fitr : nos meilleurs vœux", body="Toute l'équipe d'Immobilière Gloulou vous souhaite un excellent Aïd el-Fitr, entouré de ceux qui vous sont chers."),
  3000: dict(title="Team Building 2025", body="Une journée placée sous le signe de la cohésion, du dépassement et de la bonne humeur : nos équipes se sont retrouvées pour le team building 2025.", video='Ars6HFXyRbs'),
  2904: dict(title="Plongée au cœur de notre réunion annuelle 2024", body="Bilan de l'année, projets à venir et moments de partage : retour en images sur la réunion annuelle 2024 de l'Immobilière Gloulou.", video='aG1WQTDxbpM'),
  2865: dict(title="Journée de sensibilisation contre le cancer du sein"),
  2821: dict(title="Lancement des travaux de Bel Azur", project='bel-azur', cat='avancement', body="Top départ ! Les travaux de la **Résidence Bel Azur** à M'Saken ont officiellement commencé. Suivez chaque étape du chantier dans notre rubrique Avancements."),
  2720: dict(title="Nouveau projet : Bel Azur, à M'Saken (Sousse)", project='bel-azur', body="Immobilière Gloulou présente **Bel Azur**, sa nouvelle résidence à M'Saken : une architecture d'une élégance intemporelle, inspirée des styles européens, dans un emplacement stratégique."),
  2618: dict(title="Partenariat avec Fortunes Capital", body="Immobilière Gloulou annonce son partenariat avec Fortunes Capital, pour accompagner encore mieux ses clients dans le financement de leur projet immobilier."),
  2519: dict(title="Immobilière Gloulou au service du développement durable", video='prgrXqQz5co', body="Découvrez en vidéo l'engagement d'Immobilière Gloulou en faveur d'une construction plus durable."),
  2509: dict(title="Les 16es Journées de l'écoconstruction et de l'innovation"),
  2213: dict(title="Le concept bas carbone", cat='blog'),
  2206: dict(title="Qu'est-ce qu'une conception écologique d'un produit immobilier ?", cat='blog'),
  2147: dict(title="Qu'est-ce que le bâtiment bas carbone ?", cat='blog'),
  2975: dict(title="L'immobilier bas carbone : une nécessité ou un luxe ?", cat='blog'),
  3053: dict(title="Un logement qui fait du bien : comment l'immobilier influence notre bien-être", cat='blog'),
  2679: dict(title="Tendances du marché immobilier mondial (archive 2024)", cat='blog'),
  2676: dict(title="Isolation thermique : confort amélioré et économies d'énergie", cat='blog'),
  2644: dict(title="Comment remédier à l'humidité chez soi ?", cat='blog'),
  2635: dict(title="Les responsabilités du syndic de copropriété", cat='blog'),
  2546: dict(title="Dénicher la perle rare : évaluer le potentiel de croissance d'un bien", cat='blog'),
  3250: dict(title="Pourquoi investir avec Immobilière Gloulou ?", cat='blog'),
  3459: dict(title="Tout a commencé en 1986…", cat='news', video='TAX1ed2fIIs'),
  1876: dict(title="36 ans d'Immobilière Gloulou", video='slBtC6AC3p0', body_prefix="Retour sur l'histoire et les valeurs d'Immobilière Gloulou, à l'occasion de son 36e anniversaire."),
  2193: dict(title="The Wave, votre coin de paradis", project='the-wave', body="Préparez-vous à passer vos vacances d'été au bord de la mer : la **Résidence The Wave** à Chott Meriem vous attend."),
  2184: dict(title="Avancement des travaux — Résidence Les Jasmins 5, Cité El Ghazela", project='jasmins-5'),
  2176: dict(title="Avancement des travaux — Résidence Prestige, M'Saken", project='prestige'),
  2163: dict(title="Avancement The Wave — février 2023", project='the-wave', body="Et le rêve s'approche de sa réalisation : point d'étape sur la Résidence The Wave."),
  2108: dict(title="Un départ exceptionnel : réunion de fin d'année"),
  2071: dict(title="Avancement The Wave — octobre 2022", project='the-wave'),
  2057: dict(title="Partenaire officiel du Club Basket M'Saken", body="Nous continuons à développer nos valeurs de solidarité, de responsabilité et de motivation : **Immobilière Gloulou** a le plaisir d'être le partenaire officiel du Club Basket M'Saken. Nous lui souhaitons plein succès pour la suite !"),
  2034: dict(title="Prestige se monte rapidement", project='prestige'),
  1789: dict(title="Lotissement Houda 3", project='el-houda-sousse', body="Point d'étape sur le lotissement Houda 3."),
  1777: dict(title="Journée nationale de l'habit traditionnel", body="À l'occasion de la Journée nationale de l'habit traditionnel, nos équipes ont célébré le patrimoine tunisien.", video='wNbh8UkPPvQ'),
  1644: dict(title="Le panorama magique du chantier The Wave", project='the-wave', body="Vue panoramique sur le chantier de la Résidence The Wave, à Chott Meriem."),
  1629: dict(title="Jasmins 4 se prépare pour le grand jour", project='jasmins-4', body="Un peu de patience, la livraison approche ! La Résidence Jasmins 4 se prépare pour le grand jour."),
  1624: dict(title="The Wave : des planchers en post-tension", project='the-wave'),
  1506: dict(title="Ça monte : les courbes élégantes de The Wave", project='the-wave'),
  1504: dict(title="Lancement de la nouvelle résidence Prestige 2", project='prestige-2', cat='avancement'),
  1460: dict(title="La construction de Jasmins 4 avance à grands pas", project='jasmins-4'),
  1356: dict(title="Cérémonie de fin d'année", video='aC2idsB5GoU', body="Retour en images sur notre cérémonie de fin d'année."),
  1034: dict(title="Signature de la convention de partenariat avec Oussama Mellouli"),
  1023: dict(title="Don d'équipements médicaux et de concentrateurs d'oxygène", body="Pour soutenir les efforts des cadres médicaux et paramédicaux dans la lutte contre la pandémie de Covid-19, et par esprit de solidarité nationale, le groupe Gloulou a fait don d'équipements médicaux et de concentrateurs d'oxygène."),
  480: dict(title="Salon de la promotion immobilière — Jardins d'El Menzah 2020", body="Participation de l'Immobilière Gloulou au 9e Salon de la promotion immobilière, aux Jardins d'El Menzah."),
  159: dict(title="Inauguration d'une salle de révision au lycée Ibn Sina de M'Saken", body="Inauguration d'une salle de révision au lycée Ibn Sina de M'Saken, sous le parrainage de l'Immobilière Gloulou.", video='LxJHmHO95z0'),
  483: dict(title="Participation au salon Cityscape Qatar 2019"),
  486: dict(title="Compétitions culturelles inter-lycées — 3e édition", body="Troisième édition des compétitions culturelles entre les lycées de M'Saken, sous le parrainage de l'Immobilière Gloulou.", video='WsmYCshoe4g'),
  155: dict(title="Inauguration de l'extension des classes de l'IHEC Sousse"),
  143: dict(title="Participation au salon Immobilier Expo, Charguia", video='pXcfPNHDIo8'),
  141: dict(title="Inauguration de la fresque Carthage Center", project='carthage-center', video='BKgb6WjDMEA', body="Un événement hors normes, en plein centre-ville de Tunis : l'inauguration de la fresque monumentale de Carthage Center."),
  164: dict(title="Dévoilement de la fresque Carthage Center", project='carthage-center', video='fnSlOM2G2ac', body="Retour en vidéo sur le dévoilement de la fresque de Carthage Center."),
  166: dict(title="Finales des compétitions culturelles inter-lycées de M'Saken", body="Ambiance des finales des compétitions culturelles entre les lycées de la ville de M'Saken, soutenues par l'Immobilière Gloulou.", video='Nzr6If9avuE'),
}
SKIP = {1849, 1838}  # karting tender (legacy, not republished)

def clean_body(txt):
    txt = fix(unbold(txt) if False else txt)
    lines = [unicodedata.normalize('NFKC', l).strip() for l in txt.split('\n')]
    lines = [re.sub(r'^[👉✅🔹💡💬📢🏠🏬🚗🌿📍👨‍👩‍👧‍👦💑💼💰✨🌍🌱🍀🔍🏡]+\s*', '', l) for l in lines]
    # merge WordPress fragmented inline <strong> lines into paragraphs
    out, buf = [], ''
    for l in lines:
        if not l: continue
        if buf and (len(buf) < 3 or buf.endswith((' ', '(', '’', "'")) or l[:1] in ',.;:)»' or (len(l) < 40 and not re.match(r'^(\d+\.|[A-ZÉÈÀ][^.!?]{0,60}\s?:?$)', l) and not buf.endswith(('.', '!', '?', ':')))):
            buf = (buf + ' ' + l).replace(' ,', ',').replace(' .', '.')
        else:
            if buf: out.append(buf)
            buf = l
    if buf: out.append(buf)
    md = []
    for k, l in enumerate(out):
        l = re.sub(r'\s+', ' ', l).strip()
        l = l[:1].upper() + l[1:]
        nxt = out[k + 1] if k + 1 < len(out) else ''
        short = len(l) < 75 and not l.startswith('http')
        heading = short and k > 0 and len(nxt) > len(l) + 10 and (not l.endswith(('.', ',', ';')) or re.match(r'^\d+\.\s', l))
        md.append('\n### ' + l.rstrip(':') if heading else l)
    body = '\n\n'.join(md)
    body = re.sub(r'(https?://[^\s)]+)', r'<\1>', body)
    body = body.replace('koya.immobilieregloulou.com', 'koya.immobilieregloulou.com')
    return body.strip()

posts = json.load(open(SRC))
index, used = [], set()
for r in posts:
    if r['id'] in SKIP: continue
    o = OVERRIDE.get(r['id'], {})
    raw_title = o.get('title') or unbold(r['title'])
    cat = o.get('cat') or ('avancement' if 78 in r['cats'] else 'blog' if r['cats'] == [83] else 'news')
    project = o.get('project') or detect_project(raw_title + ' ' + ' '.join(r['imgs'][:2]))
    date = r['date']
    if not raw_title:  # generic fallback for any other untitled progress post
        y, m = date[:4], MONTHS[int(date[5:7]) - 1]
        raw_title = f"{PNAME.get(project, 'Chantier')} — avancement {m} {y}"
    title = fix(raw_title)
    # title normalisation for "Avancement X mois yyyy"
    m = re.match(r'(?i)^avancement\s+(bel ?azur|belazur|nablus|fuji|prestige|jasmin ?5)\s*(.*)$', title)
    if m and not o.get('title'):
        rest = m.group(2).strip().lower()
        title = f"{PNAME.get(project, m.group(1).title())} — avancement {rest}".strip(' —') if rest else f"{PNAME.get(project, m.group(1).title())} — point d'avancement"
    body = o.get('body') or clean_body(r['text'])
    if o.get('body_prefix'): body = o['body_prefix'] + '\n\n' + clean_body(r['text'])
    if not body.strip():
        body = (f"Nouveau point d'étape sur le chantier **{PNAME.get(project, '')}** : découvrez en images l'évolution des travaux." if cat == 'avancement'
                else "Retour en images.")
    if o.get('note'): body = f"> **Note éditoriale :** {o['note']}\n\n" + body
    excerpt = o.get('excerpt') or re.sub(r'[#*>\[\]<]', '', body).replace('\n', ' ')
    excerpt = re.sub(r'\s+', ' ', excerpt).strip()
    if len(excerpt) > 170: excerpt = excerpt[:167].rsplit(' ', 1)[0] + '…'
    slug = slugify(title) or f'article-{r["id"]}'
    if slug in used: slug = f'{slug}-{date[:7]}'
    used.add(slug)
    imgs = [i for i in r['imgs'] if i]
    cover = r['feat'] if r['feat'] and not (r['feat'] in ('2025-10-couverture.webp', '2025-06-cover.webp') and r['id'] in (3536, 3534, 3493)) else (imgs[0] if imgs else r['feat'])
    video = o.get('video') or (r['vids'][0] if r['vids'] else None)
    gallery = [i for i in imgs if i != cover][:12]
    words = len(re.findall(r'\w+', body))
    fm = [f'title: {title} — Immobilière Gloulou', f'description: {excerpt}', f'image: {cover or ""}']
    blocks = [':::: post-hero\n::::']
    blocks.append(':::: prose\n' + body + '\n::::')
    if video: blocks.append(f'::: video id="{video}" eyebrow="Vidéo" title="Regarder en vidéo" label="{title}"' + (f' cover="{cover}"' if cover else '') + '\n:::')
    if gallery: blocks.append('::: gallery eyebrow="Galerie" title="En images" cols="3" alt="' + title.replace('"', "'") + '" border="false"\n' + '\n'.join(f'{g} | {title} — photo {k+1}' for k, g in enumerate(gallery)) + '\n:::')
    if project: blocks.append(f'::: cta title="Intéressé par {PNAME.get(project, "ce projet")} ?"\n> Un conseiller vous rappelle pour une visite, une simulation ou la brochure.\nVoir la fiche projet | projet.html?slug={project} | primary | building-2\nÊtre rappelé | contact.html#rappel | ghost | phone\n:::')
    blocks += [':::: post-nav\n::::', ':::: post-related\n::::']
    md = '---\n' + '\n'.join(fm) + '\n---\n\n' + '\n\n'.join(blocks) + '\n'
    open(os.path.join(OUT_MD, slug + '.md'), 'w').write(md)
    index.append(dict(slug=slug, title=title, date=date, cat=cat, project=project, cover=cover, excerpt=excerpt, video=video, photos=len(gallery) or None, readingTime=max(1, math.ceil(words / 200)), legacy=r['slug'], id=r['id']))

index.sort(key=lambda x: x['date'], reverse=True)
json.dump(index, open(OUT_JSON, 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(index), 'articles', Counter(p['cat'] for p in index), Counter(p['project'] for p in index))
