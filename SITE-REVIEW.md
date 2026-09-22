# Revue du site « L’arithmétique du hasard »

22 septembre 2026 — Revue de concordance avec les sources, de pédagogie et de calcul numérique.

## Périmètre et désignations

La revue porte sur le chapeau fourni **V1.2**, les quatre articles publics et les deux compagnons techniques. Les références publiques restent celles de leurs notices Zenodo ; utiliser le chapeau V1.2 pour cette révision ne lui attribue pas un nouveau DOI ni une publication déjà effectuée.

| Désignation courte retenue | Article et édition utilisés | Notice publique |
|---|---|---|
| **Long runs** | *Long runs and rare patterns of a random completely multiplicative function*, V3, avec compagnon | [Zenodo 22872154](https://zenodo.org/records/22872154) |
| **Records and scale flows** | *Records, scale flows, and Gaussian limits from lattice Poisson fields*, V2, avec compagnon | [Zenodo 22876520](https://zenodo.org/records/22876520) |
| **Arithmetic clusters** | *Poisson laws and arithmetic clusters for rare multiplicative patterns*, V1 | [Zenodo 22877400](https://zenodo.org/records/22877400) |
| **Moving prime environments** | *Moving prime environments and arithmetic cluster limits*, V1 | [Zenodo 22878806](https://zenodo.org/records/22878806) |
| Article chapeau | *Rare events in multiplicative sequences: Poisson laws, clusters, and observation* ; V1.2 fournie pour la revue | [Notice publique 22880994](https://zenodo.org/records/22880994) |

Les menus, titres visibles et renvois utilisent ces désignations. Les anciens noms de fichiers et ancres sont conservés pour maintenir les liens existants. Les PDF restent sur Zenodo ; les boutons annoncent explicitement cette destination. Le titre intégral publié de Long runs est restauré.

Cette revue vérifie la concordance des explications et des expériences avec les énoncés utilisés. Elle ne constitue pas une nouvelle validation indépendante de l’ensemble des preuves, ni un nouvel audit de priorité bibliographique.

## Améliorations pédagogiques et éditoriales

### Accueil, chapeau et navigation commune

- Choix du niveau de lecture dès l’accueil, avec accès direct au parcours français.
- Glossaire repliable de huit termes FR/EN sur les pages de vue d’ensemble, également accessible depuis le pied de page.
- Consigne du modèle élémentaire : comparer les réglages `c = 0`, `0,5` et `1`, en distinguant un tirage de points de la loi calculée.
- Association explicite des libellés aux curseurs : l’élément affichant la valeur ne capte plus le libellé destiné à la commande.
- Navigation des environnements raccourcie et adaptée au retour à la ligne.

### Long runs

- Parcours en six étapes rétabli : le chapitre sur l’origine conduit maintenant à la réalisation fixée, puis aux records. Il ne fait plus quitter la page avant le dernier résultat.
- Explication de la coexistence entre carrés toujours positifs et égalité des poids des deux signes dans le champ de Poisson limite. L’espacement des carrés fournit une intuition ; il ne remplace pas le contrôle des autres dépendances.
- Exemple exact de premiers privés : `33 = 3 × 11`, `34 = 2 × 17`, `35 = 5 × 7`. Après fixation des signes de 2, 3 et 5, les trois autres pièces permettent de prescrire les trois signes séparément.
- Distinction entre une fonction tirée puis fixée et l’origine du cadre choisie au hasard ; distinction entre le total observé et la carte complète des positions. La portée du résultat ne s’étend pas automatiquement à Liouville.
- Consigne du laboratoire de cadrage et interprétation de la distance TV explicitées. Le graphe de dépendance et le couplage par premiers privés sont distingués dans le parcours de preuve.

Sources : théorème 1.1, p. 3 ; corollaire 2.6, pp. 11–12 ; corollaire 7.8a et remarque 7.8b, pp. 56–58 ; compagnon, proposition F.7, p. 33, et sections F.4–F.5.

### Records and scale flows

- Liens d’évitement au clavier corrigés pour rester sur la page ; textes de repli anglais et phrase présentant le budget corrigés.
- Explication du rythme asymptotique d’environ un épisode record tous les deux doublements, dans un encadré d’approfondissement.
- Séparation entre part moyenne de leadership égale à 50 % et loi limite du temps ordinaire qui reste dispersée. Il ne s’agit pas d’une affirmation de convergence trajectorielle vers une part particulière.
- Explication des deux échelles : fluctuations gaussiennes lorsque de nombreuses séries sont retenues ; nombre d’événements encore poissonien au seuil extrême.
- Consignes du laboratoire de compression précisées. Les deux figures de géométrie ne font pas varier le même bord du rectangle bleu : cette différence est maintenant annoncée.
- La portée multicolore de la section 8 est explicitement celle du modèle de Poisson ; une extension arithmétique nécessite ses propres estimations.

Sources : proposition 3.1 et lemmes 3.2–3.3, pp. 11–12 ; théorème 6.1 et proposition 6.2, pp. 22–23 ; théorèmes 7.5 et 7.11, pp. 29 et 33–34 ; section 8, pp. 36–38 ; compagnon, C.5 et F.4–F.5.

### Arithmetic clusters et Moving prime environments

- La figure des familles arithmétiques affiche désormais correctement les cœurs `5 × 3ᵇ` lorsque l’ensemble exceptionnel est `{2}`, au lieu de désigner toute la famille par un seul cœur `d = 5` (Arithmetic clusters, §4.1, p. 18 ; §5.5, p. 26).
- Les amas mobiles ne sont plus présentés comme tous simples ou doubles : des tailles supérieures sont possibles lorsque `|c| < 1/2` ; la restriction à une ou deux apparitions concerne `1/2 ≤ |c| < 1` (Moving prime environments, théorème 7.1, pp. 24–26).
- Les paramètres N, τ et c/N sont définis ; les commandes qui changent le tirage sont distinguées de celles qui changent sa loi.
- L’effacement est illustré par un exemple concret : pour B = 8, p = 1/2 et r = 1, les coûts comparés sont 2 et 256 (Arithmetic clusters, définition 8.1 et §9.6).
- Le cadrage montre que deux modèles peuvent garder la même moyenne 0,6 tout en ayant des variances 0,6 et environ 0,826667 et des tailles maximales d’amas différentes (Moving prime environments, théorème 10.1 et corollaire 10.4).
- Le lien avec les rapports F(x)/F(x+h), y compris aux décalages macroscopiques, est explicité (Arithmetic clusters, théorème 6.1 et §6.5). Les cinq liens de navigation des guides d’environnements sont raccourcis pour rester visibles.

## Accessibilité et parcours

- Un encadré d’accueil explique les niveaux Intuition et Recherche et donne un accès direct au parcours français.
- Un glossaire FR/EN de huit notions, repliable et lié depuis les pieds de page, définit notamment source, amas, intensité, fenêtre et distance TV.
- Les modèles élémentaires proposent un essai guidé du curseur c et distinguent carte d’un tirage et loi des comptes.
- Les libellés sont associés explicitement aux commandes. La présence d’un élément de résultat avant certains curseurs empêchait auparavant leur association native au libellé.
- Le focus clavier est visible, les menus de sections peuvent revenir à la ligne et les boutons documentaires annoncent Zenodo.

## Corrections des expériences numériques

| Défaut constaté | Correction effectuée |
|---|---|
| Le tirage initial du modèle élémentaire ne montrait aucune source commune au réglage initial. | Premier exemple choisi avec une source commune, annoncé comme tel. Les tirages suivants restent non filtrés. Les lois calculées sont inchangées. |
| La troisième courbe, la référence de Poisson, pouvait dépasser l’échelle verticale de l’histogramme élémentaire. | Son maximum participe désormais au calcul de l’ordonnée du graphique. |
| Certaines graines Monte-Carlo vides, négatives ou décimales étaient converties silencieusement. | Validation explicite des entiers de 0 à 4 294 967 295, avec retour FR/EN et état accessible de l’erreur. |
| À certains instants exacts d’entrée dans le nuage, le compteur et la trajectoire différaient d’une unité par arrondi entre logarithme et exponentielle. | Une même convention d’événement est utilisée par les deux lectures ; une régression couvre les instants d’entrée, de sortie et les extrémités. |
| La phrase sur la moyenne des sources actives pouvait être comprise comme une propriété de chaque source. | Formulation FR/EN recentrée sur le **nombre** de sources actives. |

Le modèle élémentaire correspond au §2 du chapeau avec `a = 1` : total `S + 2D`, moyenne des points 2, variance `2 + 2b`, probabilité du vide `exp(−2+b)`. Une image de quelques points illustre ce modèle ; elle n’en estime pas à elle seule les probabilités.

## Vérifications des sources et calculs

Les contrôles ci-dessous sont distincts de la vérification visuelle au navigateur.

- `node scripts/check-corpus.cjs` : lois et moments du modèle élémentaire, comptages de la bande fixe par énumération des origines, lois de rang un et de cadrage, covariance des compressions. La régression ajoutée contient **2 384 comparaisons** entre lectures et trajectoires aux événements exacts.
- `node scripts/check-clusters.cjs` : lois finies des horloges et de résolution, intensités, moments des amas et bornes d’effacement.
- Vérification indépendante de tous les préfixes des trois exemples de records : égalités conservant le premier détenteur et reconnaissance des nouveaux épisodes cohérentes.
- La variance de leadership reproduit les valeurs publiées : `K(0) = 0,5573050812702217` et `K(1/4) = 0,5573046451397835`. Les covariances finies des compressions et des échantillons Monte-Carlo concordent avec la construction des sources.
- Les calculs du Monte-Carlo conditionnel, des chevauchements dirigés, des deux horloges d’excès et des comptes sur une réalisation fixée sont cohérents avec leurs définitions.
- Analyse syntaxique JavaScript et vérification des entrées invalides/valides effectuées. Les six pages Long runs/Records révisées n’ont ni identifiants dupliqués ni ancres locales manquantes.
- `python scripts/check-site.py` passe après reconstruction : 18 routes, 803 références locales, 16 vues intégrées, commandes étiquetées et absence de PDF stockés ou embarqués.

Les tests de code ne certifient ni la vitesse de convergence asymptotique aux petites tailles affichées, ni la justesse d’une preuve mathématique.

## Priorités restantes

1. **Compléter les essais sur téléphone réel et avec un lecteur d’écran** : la présente vérification utilise Chrome sur ordinateur. Les adaptations CSS et les libellés accessibles sont contrôlés, mais ne remplacent pas ces essais matériels.
2. **Renforcer progressivement les renvois scientifiques** : lorsque des URL de fichiers Zenodo stables sont vérifiées, permettre l’accès direct à la page citée de l’article ou du compagnon. Les boutons de cette révision annoncent déjà la notice Zenodo ; ils ne promettent pas une ouverture directe du PDF. Conserver l’accord entre édition affichée, titre et DOI.
3. **Pour une évolution scientifique ultérieure**, privilégier des bornes finies réellement justifiées ou des exemples arithmétiques supplémentaires établis par les textes, plutôt que présenter les petites simulations comme des certificats de convergence. Les distinctions fonction aléatoire/fixée, total/carte et modèle fini/loi limite doivent rester visibles.

## Vérification visuelle finale

Version publiée sur GitHub Pages le 22 septembre 2026, commit `93f5b04447ea193c1829513e7c49098ec6ae22c4`. Le déploiement Pages a réussi.

- Les 16 vues de lecture sont inspectées dans Chrome sur ordinateur (fenêtre de 1 363 × 936 pixels), ainsi que les deux anciennes routes de redirection. Aucune erreur de rendu KaTeX ni aucun débordement horizontal global n’a été trouvé dans ces contrôles.
- Les figures partagées sont vérifiées par moteur et sur des états représentatifs : paramètres extrêmes, nouveau tirage, changement de cadrage, horloges, préfixe des records et compressions. Cela ne constitue pas un test exhaustif de toutes les combinaisons.
- Long runs : comparaison des deux horloges, simulation conditionnelle terminée sur 2 000 essais, matrice dirigée, déplacement de l’origine jusqu’à sa dernière position ; neuf graphiques du guide anglais inspectés, dont les approfondissements dépliés.
- Records and scale flows : trois pages contrôlées ; graine −1 refusée explicitement, graine 4117 terminant 400 tirages ; le curseur du nuage conserve les mêmes points et une aire 8 dans l’état testé. Les guides FR/EN rendent leurs figures sans débordement global ; les formules anglaises sont composées.
- Arithmetic clusters et Moving prime environments : six pages contrôlées, figures rendues, navigation courte visible. Le réglage mobile à c maximal donne Poisson(1) ; le preset F(2) = 1 donne moyenne 2, variance 6 et correction exacte. Les rayons et fenêtres du cadrage français sont lisibles.
- Vue d’ensemble : c = 0 et c ≥ 1 donnent respectivement une variance 4 et la limite Poisson(2) ; un nouveau tirage retire bien la mention d’exemple choisi. Le thème sombre et les accès français/glossaire sont contrôlés.
- L’export autonome est reconstruit, ouvert et testé : passage au français et réponse du curseur du modèle élémentaire. Ses 16 vues et ses ressources intégrées sont comparées aux sources par le contrôle statique. L’ouverture hors connexion depuis le disque et le comportement sur téléphone réel ne sont pas déclarés testés.

Les PDF ne sont ni stockés dans le dépôt ni intégrés à l’export autonome. Les accès documentaires passent par Zenodo.

## Complément du 22 septembre — navigation et outils de lecture

Les notices Zenodo ont été relues : elles fournissent désormais le chapeau V1.2, Records and scale flows V2.1 et Arithmetic clusters V1.1 sous les DOI indiqués. Les titres de version, le registre du corpus et le BibTeX ont été alignés. Cette vérification des éditions ne constitue pas une nouvelle revue de toutes les preuves.

Ajouts : sommaire compact avec accès aux expériences ; liens directs avec repli de copie manuel ; agrandissement de SVG figés avec zoom ; export vectoriel conservant les couleurs calculées et des métadonnées de paramètres ; valeurs de curseurs accessibles correspondant aux valeurs affichées ; trois cas comparables accessibles par boutons. Le document et le numéro de page PDF peuvent être choisis dans la page des sources, avec distinction article/compagnon et validation des limites. Les numéros sont ceux du fichier, pas nécessairement ceux imprimés dans le texte.

Les sept lecteurs PDF Zenodo ont été vérifiés ; aucun PDF n’est stocké ou embarqué. Les références ambiguës à des théorèmes restent des liens vers leur notice : aucun numéro de page n’a été deviné. Les liens de figures ne sauvegardent pas le tirage aléatoire. L’export SVG ne comprend pas les légendes HTML placées hors du dessin.

Les contrôles statiques, numériques et DOM ciblés ont passé, notamment les ancres, les fermetures clavier, le maintien du bouton Notation, les deux issues de la copie (autorisée/refusée), les frontières du choix de page et les redessins de graphiques sans duplication de commandes. L’export autonome est reconstruit à partir des 16 vues actuelles. Les essais sur appareil physique et lecteur d’écran restent à effectuer.

Contrôle en ligne de cette révision : les 16 vues ont été chargées dans Chrome, avec les nouvelles commandes et sans débordement horizontal global ni erreur KaTeX détectée dans la fenêtre testée. Le sélecteur du compagnon de Long runs refuse la page 45 et construit correctement le lien de la page 33 ; agrandissement, zoom 150 %, Échap et retour du focus vérifiés. Un SVG de 74 028 octets a été téléchargé et analysé (titre, viewBox, métadonnées, absence de script). Le mode sombre, le sommaire français et la vue française de l’export autonome ont également été inspectés. Ces contrôles restent distincts d’un essai sur téléphone réel ou avec un lecteur d’écran.

## Complément du 22 septembre — accompagnement pédagogique

L’introduction guidée FR/EN explicite les pièces indépendantes aux nombres premiers, puis la valeur au nombre 6. L’exemple de deux capteurs sépare une source commune et ses deux apparitions, le total d’un tirage et sa moyenne. Le titre du modèle à deux fenêtres distingue maintenant les lois finies binomiales de leurs limites de Poisson.

Trois expériences disposent d’un parcours facultatif en trois étapes : bande arithmétique fixée, compression gaussienne et cadrage spatial. Chaque étape indique une action, les paramètres fixes et ce qu’il faut observer ; sa navigation ne change aucun paramètre ni tirage. Les figures communes aux deux niveaux de lecture proposent un lien vers la même expérience. Les paramètres reprennent leurs valeurs par défaut dans la page d’arrivée.

Le glossaire recherche des mots et des idées sans quitter la page. La recherche complète les glossaires existants ; les autres pages reçoivent un dialogue natif bilingue. Les vérifications DOM couvrent les 16 vues, les recherches sans résultat, les accents, le rétablissement des définitions avant les anciens liens de termes et la restitution du focus. Les 54 liens recherche–intuition, comptés sur les deux formats en ligne et autonome, ont une expérience correspondante à l’arrivée. L’export intègre les nouveaux assets et gère aussi les liens créés par les guides. Aucun moteur mathématique n’a été modifié.
