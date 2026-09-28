#!/usr/bin/env python3
"""One-shot generator for content/fr/projets/*.md (editable afterwards by hand — they are plain MD).
Content = legacy text from immobilieregloulou.com, proofread and completed with facts from the projects' own sites.
Run with --force to overwrite existing files."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'content/fr/projets'); os.makedirs(OUT, exist_ok=True)
P = {p['slug']: p for p in json.load(open(os.path.join(ROOT, 'data/fr/projects.json')))}

BODY = {
'saint-tropez': ("La continuité d'une signature à M'Saken", """
Après **Bel Azur**, Immobilière Gloulou poursuit son développement à M'Saken avec une nouvelle résidence : **Saint-Tropez**.

Dans la continuité de l'esprit architectural de Bel Azur, Saint-Tropez propose une interprétation plus contemporaine, avec une **architecture moderne inspirée du style niçois** : lignes élégantes, façades raffinées aux tons pastel, ferronneries travaillées et une identité architecturale distinctive.

### Pour qui ?
- Les familles qui veulent un cadre de vie agréable à proximité du centre de M'Saken
- Les Tunisiens résidant à l'étranger qui recherchent un bien de caractère
- Les investisseurs qui misent sur une adresse déjà valorisée par Bel Azur

### Informations commerciales
Le projet est en **phase de lancement**. Typologies, surfaces, prix et calendrier sont communiqués par nos conseillers et dans la brochure.
""", ["Architecture niçoise contemporaine", "Continuité de Bel Azur, à M'Saken", "Commercialisation ouverte"]),
'koya': ("Une nouvelle génération de projets à El Menzah 9C", """
Situé à **El Menzah 9C**, le complexe **KOYA** (projet anciennement désigné HC9) incarne une nouvelle génération de projets immobiliers, alliant confort, durabilité et performance énergétique.

Ce **R+6 à usage mixte** comprendra **135 appartements haut standing** (S+1, S+2, S+3) et des **espaces commerciaux**, répartis sur **5 blocs modernes**, avec parkings et garages en sous-sol.

### Les points forts
- **Emplacement stratégique** avec accès direct à l'X4
- **Conception à faible impact carbone** (voir [notre démarche](engagement.html))
- **Parkings et garages** en sous-sol
- **Paiement flexible jusqu'en 2028**

### Pour qui ?
Un projet pensé pour les **familles** en quête de confort, les **jeunes couples** à la recherche d'un premier foyer moderne et les **investisseurs** qui veulent allier valeur et qualité.
""", ["135 appartements haut standing", "5 blocs · R+6 · commerces", "Paiement flexible jusqu'en 2028"]),
'silvana': ("La nouvelle icône du Lac", """
**Silvana** redéfinit les standards du luxe et du confort au cœur du quartier du **Lac 0**, à Tunis. Plus qu'un projet immobilier, c'est une réinvention du luxe en harmonie avec l'environnement.

### Une résidence à faible densité
Seulement **35 appartements** sur 5 niveaux (R+4), des **penthouses exclusifs avec piscine privée et jacuzzi**, et des espaces communs pensés pour le bien-être : piscine extérieure, **conciergerie et sécurité 24 h/24**, salle de sport en plein air et **parkings en sous-sol**.

### Des finitions haut de gamme
- Marbre noble et cuisine équipée
- Climatisation VRV et domotique intelligente (Smart Home)
- Fibre optique intégrée

### Une adresse prestigieuse
À proximité des ambassades, des écoles internationales et des centres d'affaires : intimité, modernité et sérénité réunies en un seul lieu.
""", ["35 appartements seulement", "Penthouses avec piscine privée", "Conciergerie 24 h/24"]),
'nablus': ("Un cadre de vie paisible et sécurisé à Manouba", """
Immobilière Gloulou vous présente le complexe **Nablus**, idéalement situé à **Manouba**. Ce projet résidentiel propose un mode de vie plus respectueux de l'environnement, dans un cadre paisible et sécurisé, à proximité de toutes les commodités.

Les appartements **S+1, S+2 et S+3**, fonctionnels et éco-responsables, sont répartis sur **cinq blocs indépendants** et bénéficient d'une excellente luminosité naturelle et d'une très bonne aération.

### Où en est le chantier ?
Les façades sont achevées et les finitions intérieures avancent. **L'appartement témoin est ouvert** : prenez rendez-vous pour le visiter.

Un choix judicieux pour ceux qui recherchent un investissement sûr et durable.
""", ["5 blocs indépendants", "Appartement témoin visitable", "S+1, S+2, S+3"]),
'bel-azur': ("Une élégance intemporelle au cœur de M'Saken", """
Immobilière Gloulou vous propose sa résidence **Bel Azur**, à **M'Saken (Sousse)**. Idéalement placée, elle se démarque par une architecture d'une élégance intemporelle, alliant modernité et sobriété, **inspirée des styles européens**.

Nichée dans un emplacement stratégique, elle offre un cadre de vie privilégié où le confort rime avec la sécurité. Chaque détail, des finitions aux moindres éléments, témoigne de l'exigence du projet.

### Les prestations
- Parking en sous-sol et ascenseur à chaque étage
- Système de sécurité
- Suite parentale et pré-installation du salon
- Équipements communs

### Suivez le chantier
Bel Azur est **en construction** : retrouvez les photos mois par mois ci-dessous.
""", ["Style européen intemporel", "Parking en sous-sol", "Chantier en cours"]),
'fuji': ("Un havre de paix écologique au cœur de Tunis", """
Situé dans le quartier prisé d'**El Menzah 9C**, **FUJI Apartments** se distingue comme une oasis de verdure et de technologie. Six résidences (La Colline, Le Sommet, Le Panorama, La Falaise, La Plaine, La Vallée) organisées autour d'espaces verts généreux.

### Une démarche bas carbone
FUJI est innovant dans **l'usage commun de l'énergie solaire** et fait une place prépondérante au végétal. Le projet privilégie des matériaux à faible empreinte carbone, des techniques bioclimatiques, des **panneaux solaires** et un **système de récupération des eaux pluviales** pour l'irrigation.

> Les éléments techniques (bilan carbone, performances d'isolation, production solaire) sont publiés au fur et à mesure sur la page [Notre démarche bas carbone](engagement.html).

### Les prestations
- Appartements dès 55 m², duplex dès 100 m², commerces dès 50 m²
- Domotique, double vitrage PVC, isolation phonique et thermique
- Cuisine équipée, climatisation et chauffage central
- Coworking, chambres d'hôtes, buanderie, salle de sport privée, parcours de santé
- **305 places de parking** et **20 commerces**

### Statut
Certaines résidences sont livrées, d'autres sont **en cours de finition** : chaque point d'avancement est publié ci-dessous.
""", ["6 résidences · 305 parkings", "Solaire partagé et eaux pluviales", "Livraison par tranches"]),
'prestige-2': ("Le prolongement de Prestige, à M'Saken", """
La **Résidence Prestige II** est située à **M'Saken (Sousse)**, dans un quartier calme à **500 mètres du centre-ville**.

C'est une résidence de standing accessible, bien équipée, avec une architecture moderne, des matériaux nobles, des finitions soignées et de belles ouvertures vers l'extérieur. Elle est idéale pour les jeunes couples et les Tunisiens résidant à l'étranger.
""", ["À 500 m du centre-ville", "Standing accessible", "Livrée"]),
'prestige': ("Le standing accessible, à M'Saken", """
La **Résidence Prestige** est située à **M'Saken (Sousse)**, dans un endroit calme à **500 mètres du centre-ville**.

C'est une résidence de standing accessible, bien équipée et d'architecture moderne, idéale pour les jeunes couples et les Tunisiens résidant à l'étranger. Découvrez ci-dessous les intérieurs finis : chambre, cuisine et salon.
""", ["À 500 m du centre-ville", "Intérieurs finis", "Livrée"]),
'el-houda-sousse': ("Le programme El Houda à Sousse", """
**El Houda Sousse** fait partie du programme El Houda réalisé par Immobilière Gloulou à Sousse, sur des plans de l'architecte **Hamdi Bchir**. La résidence est **livrée**.

> Vous êtes propriétaire ou recherchez un bien à la revente dans cette résidence ? Contactez notre service après-vente ou notre syndic.
""", ["Programme El Houda", "Architecte Hamdi Bchir", "Livrée"]),
'bcg': ("Un complexe du portefeuille Gloulou", """
Le **Complexe BCG** fait partie des réalisations livrées par Immobilière Gloulou.

> Les informations détaillées sur ce projet (année de livraison, programme) sont en cours de mise à jour. Pour toute demande, contactez-nous.
""", ["Projet livré", "Portefeuille historique", ""]),
'palms': ("Une résidence signée Hamdi Bchir", """
La **Résidence Palms** est une réalisation livrée d'Immobilière Gloulou, conçue par l'architecte **Hamdi Bchir**.

> Fiche en cours d'enrichissement : photos et descriptif détaillé à venir.
""", ["Projet livré", "Architecte Hamdi Bchir", ""]),
'jasmins-2': ("Le programme Les Jasmins à El Ghazela", """
La **Résidence Jasmins 2** est le deuxième volet du programme **Les Jasmins**, à la cité **El Ghazela (Ariana)**, un quartier recherché proche des grands axes, des écoles et des commerces.
""", ["Programme Les Jasmins", "Cité El Ghazela", "Livrée"]),
'el-houda': ("Le premier volet du programme El Houda", """
La **Résidence El Houda** est le premier volet du programme El Houda, réalisé sur des plans de l'architecte **Hamdi Bchir**. Elle est **livrée**.
""", ["Programme El Houda", "Architecte Hamdi Bchir", "Livrée"]),
'sierra': ("Une réalisation du portefeuille historique", """
La **Résidence Sierra** fait partie des réalisations livrées d'Immobilière Gloulou, conçue par l'architecte **Hamdi Bchir**.
""", ["Projet livré", "Architecte Hamdi Bchir", ""]),
'les-vosges': ("Autour d'un lac artificiel, sur la colline d'El Menzah 9", """
Saluée par la presse spécialisée et par nos confrères, la **Résidence Les Vosges** est située sur la colline d'**El Menzah 9**.

Construite en **R+3**, elle propose des appartements **S+2, S+3, S+4 et des duplex** autour d'un **lac artificiel de 3 500 m²**, avec un espace vert, une aire de jeux pour les enfants et un parcours de santé à l'intérieur de la résidence. Elle dispose aussi d'une **piscine** et d'une **salle de remise en forme** réservées aux résidents.
""", ["Lac artificiel de 3 500 m²", "Piscine et salle de sport", "Livrée"]),
'carthage-center': ("Bureaux et commerces au cœur de Tunis", """
**Carthage Center** est un complexe commercial et de bureaux de haut standing, situé **avenue de Carthage, au centre-ville de Tunis**.

En plein cœur du centre-ville, ses boutiques et son restaurant offrent un panel d'enseignes de qualité : grandes surfaces alimentaires, boutiques de mode, banques et restauration. Accessible et aéré, il est desservi par le **tramway, le métro et de nombreuses lignes de bus**, au cœur d'une zone piétonne et d'un quartier en plein mouvement.

### Lots disponibles
Bureaux, open spaces et boutiques sur **RDC, mezzanine et 5 étages**, avec **parking au sous-sol**. À titre indicatif, des bureaux de 45 à 105 m² sont proposés à partir de 193 000 DT : demandez la **liste à jour des lots et des prix**.

### Une fresque monumentale
Carthage Center est aussi connu pour sa fresque, inaugurée lors d'un événement hors normes au centre-ville de Tunis.
""", ["Avenue de Carthage, Tunis", "Bureaux dès 45 m²", "Tram, métro, parking"]),
'kantaoui-medical-center': ("Le centre médical de la route de Kantaoui", """
**Kantaoui Medical Center** est un grand centre médical, choix de référence pour les médecins qui souhaitent acquérir un cabinet sur la **route de Kantaoui, à Hammam Sousse**.

Un emplacement stratégique, une accessibilité assurée et la proximité de tous les services.
""", ["Cabinets médicaux", "Route de Kantaoui", "Livré"]),
'k2': ("Bien plus qu'une résidence", """
La **Résidence K2**, à **El Menzah 9C**, n'est pas une résidence « dortoir » : c'est un lieu plein de vie, agréable, fonctionnel et innovant.

**Une conception accessible, mais réservée à des privilégiés** : le haut standing de cette résidence dépasse le cadre de l'appartement et s'étend aux espaces communs pour offrir un cadre de vie optimal.

La Résidence K2 accueille aujourd'hui le **siège d'Immobilière Gloulou**.
""", ["Haut standing à El Menzah 9C", "Siège d'Immobilière Gloulou", "Livrée"]),
'the-wave': ("Votre coin de paradis à Chott Meriem", """
**The Wave** offre une **vue panoramique sur la mer**, **quatre piscines**, de la verdure et des espaces de détente, dans un emplacement qui répond à tous les besoins, en été comme en hiver : calme et proche de toutes les commodités.

Ce complexe résidentiel et commercial compte **112 appartements** (S+1, S+2 et S+3) et **3 commerces**.

### Une technique innovante
Les **planchers hauts en post-tension** utilisés sur The Wave valorisent les caractéristiques mécaniques du béton et de l'acier : moins de matériau, un impact environnemental réduit et des délais de construction raccourcis.

Méditerranéenne, fière et élégante, The Wave célèbre l'art de vivre du Sahel.
""", ["Vue mer · 4 piscines", "112 appartements", "Livrée"]),
'jasmins-5': ("Une cour hexagonale pleine de lumière", """
Immobilière Gloulou a réalisé la **Résidence Les Jasmins 5** à la cité **El Ghazela (Ariana)**. Idéalement placée, elle offre un cadre de vie unique, près des grands axes, entourée de commerces, d'écoles et d'espaces de détente comme le **parc Ennahli** et **Tunis City**.

Sa **cour intérieure de forme hexagonale** maximise la lumière et l'aération, et offre un espace de jeux sécurisé pour les enfants.
""", ["Cour intérieure hexagonale", "Proche parc Ennahli", "Livrée"]),
'jasmins-4': ("Au cœur de la cité El Ghazela", """
La **Résidence Les Jasmins 4**, à la cité **El Ghazela (Ariana)**, offre un cadre de vie unique : proche des grands axes, entourée de commerces, d'écoles et d'espaces de détente comme le **parc Ennahli** et **Tunis City**.
""", ["Cité El Ghazela", "Commerces et écoles à proximité", "Livrée"]),
}
FAQ = {
 'lancement': "Comment réserver sur plan ? | Un conseiller vous présente les lots disponibles, les plans et un échéancier chiffré. La réservation se fait au siège, avec un accompagnement juridique à chaque étape.",
 'chantier': "Puis-je visiter le chantier ou un appartement témoin ? | Oui, sur rendez-vous. Selon l'avancement, nous organisons des visites de l'appartement témoin ou des points d'étape sur site.",
 'livre': "Reste-t-il des biens disponibles ? | Les résidences livrées sont en grande partie vendues. Contactez-nous : nous vous informons des éventuelles disponibilités et des projets similaires en cours.",
 'commercial': "Comment obtenir la liste des lots ? | Demandez la liste à jour (surface, étage, prix) via le formulaire ci-dessous ou au +216 98 120 201.",
}
force = '--force' in sys.argv
for slug, p in P.items():
    path = os.path.join(OUT, slug + '.md')
    if os.path.exists(path) and not force: continue
    lead, body, keys = BODY[slug]
    keys = [k for k in keys if k]
    hl = '\n'.join(f"check-circle-2 | {k} | " for k in keys)
    md = f"""---
title: {p['name']} — {p['city']} | Immobilière Gloulou
description: {p['tagline']} {p['name']}, projet {'en construction' if p['status']=='chantier' else 'livré' if p['status']=='livre' else 'en commercialisation'} d'Immobilière Gloulou à {p['city']}.
image: {p['cover']}
---

::: project-hero
:::

:::: project-body
## {lead}
{body.strip()}
::::

::: features eyebrow="En bref" title="Les essentiels de {p['name']}" cols="{max(len(keys),1)}" tone="soft"
{chr(10).join(f"{['sparkles','map-pin','badge-check'][i]} | {k} | " for i,k in enumerate(keys))}
:::

::: project-gallery
:::

::: project-video
:::

::: project-progress
:::

::: faq eyebrow="Questions" title="Vos questions sur {p['name']}"
{FAQ[p['status']]}
Quels documents fournissez-vous ? | Plans, descriptif technique, échéancier et, pour les projets en commercialisation, la brochure complète. Tout est remis par votre conseiller.
Accompagnez-vous les Tunisiens résidant à l'étranger ? | Oui : échanges à distance, procuration, suivi administratif et juridique jusqu'à la remise des titres.
:::

::: form id="contact-projet" kind="projet" subject="Demande d'information — {p['name']}" heading="Recevoir la brochure de {p['name']}" cta="Demander la brochure" icon="file-down"
text | nom | Nom et prénom | | required
tel | telephone | Téléphone | | required
email | email | E-mail | | required
select | profil | Vous êtes | Acheteur pour habiter;Investisseur;Tunisien résidant à l'étranger;Professionnel | 
textarea | message | Votre message (typologie, budget, questions) | | 
checkbox | consent | J'accepte d'être recontacté au sujet de ce projet. | | required
:::

::: related
:::
"""
    open(path, 'w').write(md)
print('ok', len(os.listdir(OUT)))
