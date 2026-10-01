# Revue approfondie du produit : fonctionnalités, utilité et qualité

Date : 30 septembre 2026 — deuxième revue, après les audits technique et conceptuel.

> **Complément du 1er octobre 2026, après les premières tranches A–F :** [recherche concurrentielle et 40 évolutions proposées](RECHERCHE_FONCTIONNALITES_CONCURRENCE.md). Ce nouveau rapport détaille les fonctions à approfondir, les nouveaux modules, leurs dépendances et la séquence R0–R6. Sa relecture du code corrige le bilan précédent : persistance des objectifs/chasses à stabiliser, confirmations web inactives, export limité aux exemplaires et édition du jeu/shiny encore absente de l’écran Collection. Les premiers lots ne sont pas considérés comme intégralement validés sur appareil.

## 1. Recommandation principale

Je recommande de faire évoluer l'application vers **un compagnon de partie et de collection qui donne des réponses vérifiables et transforme les objectifs du joueur en actions réalisables**.

Trois promesses peuvent porter le produit :

1. « L'information correspond à mon jeu et à ma situation. »
2. « Je sais ce qu'il me manque et comment l'obtenir. »
3. « Ma progression est conservée, exportable et facile à reprendre. »

Le code possède déjà les points d'entrée nécessaires : découverte, fiches, attaques, évolutions, atlas, lieux, comparaison, équipe, favoris et activité récente. L'effort principal doit maintenant porter sur leur profondeur et leurs liens. Le passage d'une fiche à une attaque, puis à son mode d'obtention et à un objectif personnel devrait former un seul parcours cohérent.

Mes cinq investissements prioritaires sont : **contexte de jeu fiable ; recherche et fiches hors ligne ; collection réellement modélisée ; évolutions et captures exploitables ; équipe et comparaison contextualisées**. Le planificateur personnel viendra ensuite réunir ces fondations.

Les fonctions expertes proposées plus loin constituent un portefeuille d'évolutions. Elles ne doivent pas toutes entrer dans la première livraison.

### Suivi d'implémentation — 1er octobre 2026

La première étape du **lot A — Fiabilité immédiate** est engagée :

- Explorer utilise immédiatement le catalogue local, même si la synchronisation PokéAPI échoue ;
- la recherche accepte désormais les accents facultatifs et les numéros nationaux, avec priorité aux correspondances exactes ;
- une fiche Pokémon inconnue affiche une erreur explicite au lieu de remplacer silencieusement la cible ;
- le comparateur présente séparément l'état de chargement ou d'erreur de chaque candidat ;
- profil, collections et activité exposent maintenant l'état réel de leur sauvegarde locale et une action de nouvelle tentative ;
- une équipe pleine ouvre un choix explicite du membre à remplacer ;
- la reprise conserve le Pokémon des écrans Attaques et Évolutions, l'onglet de fiche ainsi que le contexte région/version de l'Atlas ;
- la sélection limitée des capacités affiche son périmètre et son total au lieu de laisser croire qu'elle est exhaustive ;
- quatre premiers tests automatisés couvrent la normalisation et la priorité de recherche ; TypeScript et l'export web de production passent.

Le lot A ne livre pas encore les exemplaires de collection ni l'export/restauration. Ces éléments restent dans le lot C décrit plus bas ; le contexte transversal et les apprentissages sont désormais amorcés dans le lot B ci-dessous.

Le **lot B — Contexte de jeu fiable** est maintenant engagé :

- le joueur peut choisir un jeu actif depuis son profil et ce choix est conservé localement ;
- l'accueil rappelle le contexte actif et permet de le modifier sans ambiguïté ;
- fiches, capacités, évolutions et comparaison réutilisent ce même contexte transversal ;
- les capacités sont filtrées sur le groupe de versions exact disponible dans PokéAPI et indiquent leur méthode d'apprentissage (niveau, CT/CS, reproduction ou maître) ;
- pour un apprentissage par machine, l'application résout désormais l'objet exact du groupe de versions quand PokéAPI le fournit ; la fiche de capacité conserve le Pokémon d'origine et rappelle son chemin d'obtention dans le jeu actif ;
- l'Atlas applique par défaut la région et la version exactes du jeu actif, conserve ces filtres dans l'URL et filtre les rencontres sur les identifiants de version plutôt que sur leurs libellés traduits ;
- les niveaux, méthodes et probabilités de rencontre de l'Atlas sont maintenant recalculés pour la version filtrée au lieu d'être agrégés entre plusieurs jeux ;
- si PokéAPI ne fournit pas de données pour le jeu sélectionné, l'interface affiche « données non vérifiées » au lieu d'inventer une compatibilité ;
- le référentiel national reste disponible et est explicitement présenté comme encyclopédique, sans déduire la disponibilité dans un jeu précis ;
- les évolutions distinguent désormais la condition générale, son groupe de versions d'introduction et sa validité non vérifiée dans le jeu actif ; le groupe d'introduction n'est jamais présenté comme une preuve de compatibilité actuelle ;
- le profil affiche une fiche de couverture par domaine — capacités, rencontres, évolutions et formes — afin de distinguer « contextualisé », « partiel » et « référence générale » ;
- les formes affichent leurs types propres et la fiche signale explicitement lorsque PokéAPI retourne plus de variantes que la sélection présentée ;
- une forme peut maintenant être ouverte comme une fiche distincte : statistiques, types, talents, images et capacités utilisent son identifiant PokéAPI, tandis que favoris, équipe et comparaison restent explicitement rattachés à l'espèce ;
- l'écran Attaques permet de charger progressivement la liste complète par lots de 18 ; ouvrir une capacité tardive récupère seulement son obtention contextualisée au lieu de recharger toutes les capacités ;
- dix-neuf tests automatisés couvrent maintenant la recherche, l'honnêteté du contexte d'évolution, la séparation des rencontres entre versions, la conservation du contexte dans les routes et l'identité des exemplaires ;
- la couverture partielle est annoncée dans l'interface : une rencontre absente de PokéAPI n'est jamais présentée comme une preuve d'absence.

La prochaine étape du lot B doit documenter un corpus vérifié pour un premier jeu pilote et préciser la disponibilité de chaque forme dans ce jeu. Le lot C pourra ensuite commencer avec un véritable modèle d'exemplaires de collection, distinct des favoris et de l'équipe.

Le **lot C — Collection et portabilité** dispose maintenant d'une première tranche fonctionnelle :

- une possession est enregistrée comme un exemplaire distinct, sans convertir automatiquement les favoris ;
- chaque exemplaire conserve une identité unique, l'espèce, la forme, le jeu actif, l'état chromatique, la date d'ajout et une origine volontairement « non renseignée » tant que l'utilisateur ne la précise pas ;
- plusieurs exemplaires identiques peuvent coexister sans s'écraser ;
- l'ajout depuis une fiche fournit un retour visible et une annulation immédiate ;
- l'accueil affiche un compteur d'exemplaires séparé de l'équipe et des favoris ;
- les entrées persistantes incomplètes ou corrompues sont refusées lors de la lecture ;
- un écran Collection permet de consulter les exemplaires et modifier leur origine (capturé, reçu ou échangé) ; le modèle permet aussi de changer le jeu et l’état chromatique, mais ces deux contrôles restent à exposer dans l’interface. La suppression utilise une confirmation native dont le parcours web reste à corriger ;
- l'export JSON est partageable et reste visible pour permettre une copie manuelle sur les plateformes qui ne savent pas partager ;
- l'import valide le format avant toute écriture et fusionne les exemplaires par identifiant sans dupliquer un export déjà importé.

Cette tranche ne fournit pas encore les boîtes personnalisées, l'évolution transactionnelle d'un exemplaire, les parties multiples ni les packs hors ligne. Le lot C n'est donc pas présenté comme exhaustif.

Le **lot D — Équipe utile** possède également une première tranche fonctionnelle :

- l'accueil calcule le nombre de types distincts et signale les types répétés dans l'équipe ;
- cette synthèse ouvre directement le comparateur avec les deux premiers membres disponibles ;
- le comparateur associe les statistiques par libellé plutôt que par position, affiche les totaux, les faiblesses communes et les résistances propres à chaque candidat ;
- une action permet d'inverser les deux candidats sans reconstruire la comparaison ;
- les limites sont explicites : cette lecture défensive n'est pas une prédiction de duel et n'intègre ni talents, ni objets, ni EV/IV, ni format de combat.

Il reste à ajouter les équipes nommées multiples, l'import/export Showdown et une analyse offensive contextualisée avant de considérer le lot D complet.

Le **lot E — Planification** est désormais accessible comme parcours persistant :

- le joueur crée plusieurs objectifs associés au jeu actif et leur ajoute des tâches cochables ;
- quatre contraintes structurées peuvent être activées : sans échange, sans transfert, conserver les stades et n'utiliser que les exemplaires possédés ;
- une tâche peut réserver une ressource librement nommée ; l'application signale lorsqu'une même ressource est requise par plusieurs objectifs incomplets ;
- la progression de chaque objectif est calculée à partir des seules tâches déclarées et l'accueil reprend automatiquement un objectif actif ;
- une fiche Pokémon peut créer en un geste un objectif d'obtention et sa première tâche dans le bon contexte de jeu ;
- la sauvegarde du planificateur participe au diagnostic global des données locales dans le profil.

Cette première version est volontairement honnête : elle organise les décisions du joueur, mais ne prétend pas encore générer ou vérifier automatiquement un itinéraire optimal. L'automatisation devra attendre un corpus de données de jeu plus complet et vérifié.

Pour le **lot F — Module expert**, le module choisi est la chasse chromatique persistante (N06), car il prolonge directement les fiches, les jeux actifs et la collection :

- plusieurs chasses peuvent coexister avec une cible, un jeu, un statut et un compteur indépendants ;
- les grands contrôles `+1`, `−1`, `+10` et `−10` permettent de compter et corriger sans produire de valeur négative ;
- mettre une chasse en pause bloque les incréments tout en conservant son état pour la reprise ;
- changer de méthode ou de taux crée un nouveau segment et ne réécrit jamais les anciens essais ;
- la probabilité cumulée théorique combine uniquement les segments dont le taux est renseigné ; elle devient explicitement inconnue dès qu'un segment utilisé n'a pas de taux ;
- l'interface rappelle que ce calcul suppose des essais indépendants et que les échecs passés n'améliorent pas la chance du prochain essai ;
- un chemin de validation de trouvaille est codé pour clôturer la chasse et créer un exemplaire chromatique ; la revue complémentaire identifie une confirmation web inactive, une origine toujours « capturé » et deux écritures indépendantes à fiabiliser avant validation du parcours ;
- une chasse peut être préparée depuis la fiche du Pokémon, retrouvée depuis le menu et reprise depuis l'accueil ;
- la sauvegarde des chasses participe au diagnostic global des données locales du profil.

Les taux sont saisis par le joueur et ne sont donc pas présentés comme des règles vérifiées du jeu. Une version ultérieure pourra proposer des méthodes documentées par jeu, les bonus applicables et un journal temporel de sessions, après constitution d'un corpus métier fiable.

Les vérifications précédentes ont fait passer **32 scénarios de fonctions métier**, TypeScript et un export web de production. Elles ne couvraient pas l’ensemble des effets React, confirmations web, interruptions d’écriture et parcours mobiles. Le [complément de recherche, section 3](RECHERCHE_FONCTIONNALITES_CONCURRENCE.md#3-réévaluation-honnête-de-lapplication-actuelle) expose les écarts repérés et les critères de validation supplémentaires.

### Méthode et limites

Cette revue combine une nouvelle lecture des écrans et modèles de données, une relecture critique des deux audits, et des recherches sur des sites d'éditeurs, dépôts de projets, documentations et avis publics. Les références locales renvoient à l'état du code audité ; leurs lignes pourront changer.

L'application n'a pas été testée sur téléphone pour cette revue. Les constats de comportement sont issus du code ; fluidité, rendu visuel, accessibilité effective et facilité d'utilisation restent à mesurer sur appareils. Les fonctionnalités concurrentes sont celles annoncées publiquement, pas celles vérifiées par un test exhaustif de chaque application. Les exemples d'interface de ce document sont des propositions, pas des résultats déjà disponibles.

Je distingue dans le texte **constat**, **proposition** et **hypothèse à valider**. Aucun taux d'installation, de rétention ou de satisfaction n'est prédit.

## 2. Ce que je corrige dans mon premier travail

| Point de l'audit précédent | Revue critique et correction |
| --- | --- |
| Notes comme « direction artistique 8,5/10 » ou « potentiel 9/10 » | Trop précises pour une lecture statique sans protocole comparatif. Je retire leur valeur d'évaluation. Les intentions graphiques sont visibles dans le code ; leur réussite doit être observée. |
| Personnalité visuelle supérieure à beaucoup de concurrents | Impression insuffisamment étayée. Je conserve l'intérêt de la direction graphique, sans classement concurrentiel. |
| Atlas, français, hors ligne et prochaine capture présentés comme différenciants | Plusieurs concurrents couvrent déjà ces thèmes. La différence envisageable réside dans leur précision, leur continuité et leur adaptation au joueur. |
| Combats en direct parmi les fonctions du produit | Des composants et constantes existent, mais ils ne sont pas rendus dans les parcours inspectés. Ce sont des reliquats de code, pas une promesse affichée à l'utilisateur. |
| Aucun message quand l'équipe est pleine | La fiche affiche déjà « Équipe pleine ». Ce qui manque est un parcours de remplacement et un retour explicite après une tentative d'ajout. |
| Ouverture d'une forme depuis la fiche pouvant mener à Bulbizarre | Les variantes sont actuellement des vues non interactives. Le remplacement silencieux d'un slug inconnu par Bulbizarre est réel ; ce parcours précis depuis une variante ne l'est pas. |
| « Compte » personnel | Il s'agit d'un profil local. Aucune authentification ni synchronisation de compte n'a été constatée. |
| Paiement permanent mieux perçu qu'un abonnement | Quelques avis ne permettent pas cette généralisation. Le modèle économique reste une hypothèse à tester. |
| Export et sauvegarde dans l'offre payante, tard dans la roadmap | Je change cette recommandation : la récupération et l'export de base doivent accompagner la collection dès son lancement. |
| Quiz quotidien assez haut dans les priorités | Son intérêt existe pour certains fans ; il contribue moins directement que la fiabilité, les captures ou la préparation d'équipe à la demande actuelle. Je le repousse. |
| `PokeNav` déclaré « non disponible » | L'usage officiel du nom a été identifié, pas une recherche complète de disponibilité juridique. La conclusion correcte est de vérifier le nom avant publication. |

L'audit initial donnait une direction, mais ne précisait pas assez les règles métier, les données requises et les tests d'acceptation. C'est l'objet de cette version.

## 3. Ce que les nouvelles recherches changent

### 3.1 Le niveau de référence est déjà élevé

| Référence consultée | Observation publique | Conséquence pour ton application |
| --- | --- | --- |
| [dataDex — fiche Google Play](https://play.google.com/store/apps/details?id=com.talzz.datadex) et [site de l'éditeur](https://datadex.app/) | Le guide propose déjà de nombreux outils ; le site présente aussi une refonte à venir autour des versions et collections. | Bien distinguer fonctions livrées et aperçu annoncé. Un sélecteur de jeu n'est pas à lui seul une nouveauté. |
| [ProDex — fiche App Store](https://apps.apple.com/us/app/prodex-complete-game-guide/id1485409731) | L'éditeur annonce hors ligne, checklists, filtres, équipes et informations par jeu. | Ces éléments forment un socle de concurrence. |
| [Prokedex — site de l'éditeur](https://www.prokedex.com/en/index.html) | Cartes, lieux, captures, équipe, comparaison, objets, dresseurs et français sont déjà mis en avant. | Prokedex est distinct de ProDex. Une grande largeur de rubriques existe déjà sur ce marché. |
| [PokéPC](https://pokepc.net/) | Boîtes Living Dex, formes, chromatiques, suivi par jeu et suggestion quotidienne parmi les manquants. | Ni le suivi avancé ni une prochaine capture générique ne peuvent être annoncés comme exclusifs. |
| [PokeTools — outils de reproduction](https://www.poketools.com/breeding) | L'éditeur présente notamment un planificateur de chaînes d'apprentissage par reproduction. | Même certaines idées expertes existent ; l'intégration au parcours mobile personnel peut faire leur valeur. |
| [Nuzlocke Tracker — dépôt de l'éditeur](https://github.com/chris-tela/nuzlocke-tracker-public) | Plusieurs parties, rencontres par route, équipes et préparation de combats sont proposés. | Un mode défi doit réutiliser une vraie modélisation des parties et rencontres. |
| [TeraRaidBuddy — dépôt du projet](https://github.com/Arkkandy/TeraRaidBuddy) | L'outil compare des contres de raids en tenant compte de nombreux paramètres. | Un conseiller de raid crédible demande davantage qu'une table des types. |

Je n'ai pas établi de classement de fiabilité entre ces produits. Leur présentation prouve l'existence des propositions, pas leur qualité effective ni l'exhaustivité de leurs données.

### 3.2 Des indices d'irritants plus précis

La [roadmap publique de PokéPC](https://pokepc.net/roadmap) contient des demandes de déplacement groupé, d'export, de lieux et de sélection fine des formes suivies. J'en retiens quatre pistes : réduire la saisie répétitive, conserver la maîtrise des données, relier la collection à l'obtention et laisser le joueur définir sa complétion. Les votes sont auto-sélectionnés et ne mesurent pas tout le marché.

Sur la [fiche ProDex](https://apps.apple.com/us/app/prodex-complete-game-guide/id1485409731), un avis daté du 23 mai 2025 demande d'élargir les champions aux combats importants de l'aventure. Un autre, de décembre 2022, décrit une rupture de navigation entre apprentissage et fiche d'attaque. Ce dernier est un exemple historique de friction, pas la preuve d'un bug encore présent. Ces témoignages orientent des tests utilisateurs ; ils ne démontrent pas la fréquence du besoin.

**Hypothèse de positionnement :** un joueur pourrait préférer ton application si elle lui évite de ressaisir son équipe, de vérifier ailleurs la version d'une information et de jongler entre plusieurs outils. Cette hypothèse mérite une comparaison sur des tâches réelles.

## 4. Inventaire de l'existant vérifié dans le code

| Module | Ce qui existe | Limite déterminante |
| --- | --- | --- |
| Accueil | Modules, favoris, équipe, historique, reprise. | La reprise ne restaure pas tous les paramètres d'un travail en cours. |
| Explorer | Catalogue local de 1 025 espèces, recherche FR/EN et filtres. | Pas de tri configurable ni de recherche par numéro ; le chargement attend un index distant ; région et génération ne définissent pas un jeu exact. |
| Fiche Pokémon | Statistiques, noms des talents, types, aperçu shiny, évolutions, attaques et variantes. | Pas de contexte de jeu global ; espèces et variétés mal séparées ; données complémentaires réseau. |
| Attaques | Choix d'un Pokémon, liste filtrable, fiche d'une capacité. | Ce n'est pas un index global complet : le détail fournit au plus 18 attaques sélectionnées. |
| Évolutions | Choix d'une espèce, famille et descriptions de conditions. | Les conditions et leur logique ne sont pas un plan adapté à la partie. |
| Atlas des rencontres | Recherche par Pokémon, régions, versions, lieux et marqueurs. | Les détails de rencontres sont agrégés entre versions ; marqueurs non géographiques. |
| Lieux | Cartes locales et repères de villes/lieux. | Module surtout consultatif ; pas de dossier complet de zone relié à la collection. |
| Comparateur | Deux Pokémon, statistiques et éléments de résistances/faiblesses. | Comparaison générale, pas scénario d'équipe ; état d'erreur partiel problématique. |
| Équipe et favoris | Une équipe de six slugs et une liste de favoris persistées. | Pas d'exemplaires, de configurations d'attaques, de parties ou d'équipes multiples. |
| Profil | Prénom, nom, pseudo et présentation de données locales. | Pas de préférences d'aventure, d'export ou de restauration. |
| Navigation rapide | Accès aux modules, reprise et Pokémon aléatoire. | Certains retours remplacent la route et perdent le contexte. |

Preuves centrales : [catalogue](src/_shared/catalog.ts), [découverte](src/discover/useDiscoverCatalog.ts), [modèles et transformations](src/_shared/pokeapi.ts), [collections](src/_shared/collections.tsx), [activité](src/_shared/activity.tsx), [menu](src/_shared/quick-menu.tsx).

## 5. Approfondir les fonctionnalités déjà présentes

### F01 — Explorer : une recherche qui trouve une solution

**Point de départ.** L'écran [Explorer](src/discover/scene.tsx) sait déjà chercher et filtrer. Le catalogue est local, mais son [chargement](src/discover/useDiscoverCatalog.ts) attend le réseau.

**Proposition.** Ajouter deux niveaux : recherche immédiate par nom/numéro et filtres avancés repliables. Reconnaître accents, noms FR/EN et variantes ; distinguer le numéro national d'un numéro régional. Les filtres utiles sont : disponible dans mon jeu, déjà possédé, manquant, forme, méthode d'obtention, talent, capacité apprenable et accessibilité à mon stade de partie.

Permettre des listes enregistrées : « mes manquants accessibles sans échange », « membres possédés pouvant apprendre cette capacité ». Afficher les critères actifs et permettre de retirer un seul filtre lorsqu'il n'y a aucun résultat. Le nom exact doit rester prioritaire sur une correction approximative.

**Approfondissement.** Une requête comme « ceux que je possède qui peuvent endormir une cible » peut être traduite en critères visibles. Commencer avec un vocabulaire et des règles maîtrisés. Une interprétation ambiguë doit proposer des choix ; elle ne doit pas cacher les filtres appliqués.

**Données nécessaires.** Index local des noms, formes, disponibilités et apprentissages ; jointure avec la collection. Les catégories telles qu'« endormir » doivent être annotées et contextualisées.

**Acceptation.** `Evoli` et `Évoli` donnent les mêmes résultats ; un filtre impossible s'explique ; les résultats et la position de liste reviennent après consultation ; la recherche du pack installé fonctionne après redémarrage en mode avion.

### F02 — Fiche : répondre d'abord à la question du joueur

**Point de départ.** [La fiche](src/detail/scene.tsx) combine illustration, actions, statistiques et onglets. Le bouton shiny change l'image, pas un statut de collection. [Les variantes](src/detail/sections.tsx) ne sont pas encore des fiches navigables.

**Proposition.** Ajouter une bande de contexte persistante : jeu, forme et état de collection. Présenter immédiatement quatre réponses courtes : où l'obtenir, comment évoluer, principales interactions de types, comment l'intégrer à mon équipe. Les détails restent accessibles juste après.

Une forme sélectionnée doit mettre à jour son illustration, ses statistiques, ses talents et sa disponibilité sans perdre le lien avec l'espèce. Distinguer forme permanente, variante cosmétique et transformation temporaire. Un visuel chromatique existant ne suffit pas à prouver que cette forme est obtenable chromatique dans le jeu sélectionné.

**Approfondissement.** Mode « pendant la partie » compact ; comparaison entre jeux sur demande ; liens directs depuis un talent, objet, lieu ou condition. Chaque information calculée possède une explication et un accès à sa provenance. Une information absente est marquée inconnue ; un slug invalide affiche une erreur identifiable.

Les talents, actuellement présentés par leurs noms, méritent de petites fiches : effet dans le jeu choisi, talent standard ou caché, conditions d'activation, obtention et interactions prises en charge. Même principe pour les objets et natures nécessaires aux équipes : un accès depuis l'usage concret, puis un index transversal si la consultation le justifie.

**Données nécessaires.** Identifiants stables séparant espèce, variété et forme ; règles et données applicables au jeu ; sources des exceptions.

**Acceptation.** Changer de forme ne remplace jamais le Pokémon par Bulbizarre ; les valeurs historiques ne sont pas présentées comme actuelles ; la fiche essentielle reste lisible quand un complément réseau échoue.

### F03 — Attaques : de la liste partielle au parcours d'apprentissage

**Point de départ.** Dans [pokeapi.ts](src/_shared/pokeapi.ts), la sélection d'attaques autour des lignes 1040–1096 privilégie les apprentissages par niveau et limite le résultat à 18. Les versions sont départagées par une priorité interne. [Attaques](src/moves/scene.tsx) exploite cette sélection.

**Proposition.** Séparer « toutes les capacités » et « capacités de ce Pokémon dans ce jeu ». Pour chaque apprentissage, conserver méthode, niveau, CT/CS, tuteur, reproduction ou autre condition applicable. Les filtres doivent couvrir catégorie, effet, cible, puissance, précision et disponibilité réelle.

La question utile devient : « Comment obtenir cette capacité sur mon exemplaire ? » La réponse doit être un chemin : niveau à atteindre, objet à trouver, pré-évolution à conserver, étape de reproduction ou restriction à vérifier. Ajouter une vue inverse : quels membres de ma collection peuvent l'apprendre ?

**Approfondissement.** Comparer deux capacités pour le membre choisi : cohérence avec ses statistiques, précision, priorité, effets, couverture déjà assurée par l'équipe et coût d'obtention. Expliquer les compromis. Une capacité de statut ne se classe pas automatiquement sous une attaque puissante ; une puissance absente ne signifie pas zéro dégât.

Dans la fiche d'une capacité, distinguer valeur variable, non applicable et inconnue. Pour les interactions complexes, présenter les conditions : contact, son, cibles, protection, effets secondaires et particularités documentées. Si la description n'existe qu'en anglais, signaler ce repli au lieu de le présenter comme une traduction française complète.

**Données nécessaires.** Ensemble complet des apprentissages par contexte ; historique des capacités ; objets/machines ; règles de compatibilité simultanée des quatre capacités.

**Acceptation.** Pas de coupure silencieuse à 18 ; affichage du total et pagination éventuelle ; distinction indisponible/inconnu ; retour de la fiche capacité au même Pokémon et filtre. La présence individuelle de quatre capacités ne prouve pas que leur combinaison soit obtenable.

### F04 — Évolutions : un arbre de conditions et une liste d'actions

**Point de départ.** [Évolutions](src/evolutions/scene.tsx) présente les familles ; [le mapper](src/_shared/pokeapi.ts), autour des lignes 956–1037, transforme une sélection de conditions en texte.

**Proposition.** Montrer les branches avec leurs prérequis, reliés par « ET » et « OU » lorsque nécessaire. Choisir le jeu puis, facultativement, un exemplaire possédé. Chaque condition prend un état : remplie, manquante, inconnue. Le joueur peut renseigner uniquement ce qui est utile ; aucune obligation de saisir toutes ses statistiques.

Bouton « Préparer cette évolution » : obtenir l'objet, atteindre le niveau, apprendre la capacité, aller au lieu, remplir la condition particulière. Distinguer acquisition et consommation d'un objet. Les pas ou actions effectués dans le jeu sont déclarés manuellement : les capteurs du téléphone ne mesurent pas l'avancement sur console.

**Approfondissement.** Planifier une famille entière avec les exemplaires et ressources requis. Si l'utilisateur veut conserver tous les stades, proposer de réserver un doublon. Prévenir qu'une évolution fait progresser le Pokédex enregistré mais peut retirer un stade actuellement possédé.

**Données nécessaires.** Graphe d'évolution par forme et contexte, alternatives de méthode, ressources, changements historiques, exceptions vérifiées.

**Acceptation.** Aucune étape n'est déclarée « réalisable maintenant » si un prérequis est inconnu ; deux méthodes alternatives ne deviennent pas une obligation cumulée ; cocher l'action peut être annulé sans perdre l'historique antérieur.

### F05 — Atlas : trouver ce qui est réellement accessible

**Point de départ.** Dans [pokeapi.ts](src/_shared/pokeapi.ts), autour des lignes 834–863, méthodes, niveaux et chances sont agrégés entre versions. [Le filtre](src/map/scene.tsx), autour de la ligne 141, teste surtout l'appartenance du lieu à une version. [Les marqueurs](src/map/regions.ts), vers la ligne 152, sont des positions prédéfinies ou générées.

**Proposition.** Conserver une ligne de rencontre par combinaison jeu, zone, méthode et conditions. Afficher niveaux, créneau, météo, prérequis et taux uniquement à ce niveau de précision. La fréquence d'une rencontre ne doit pas être présentée comme probabilité de capture.

Ajouter « uniquement mes manquants » et « uniquement accessible dans ma partie ». Quand l'accès à une zone n'est pas renseigné, permettre au joueur de le déclarer. Une réponse réseau vide ou en échec ne prouve pas qu'une espèce est introuvable.

**Approfondissement.** Vue inversée : depuis une zone, lister les espèces manquantes et objectifs qui peuvent y être avancés. Ordonner les lieux selon des critères explicites : nombre d'objectifs, contraintes connues, méthode souhaitée. Un trajet géographique exige de vraies positions et un graphe des accès ; à défaut, proposer un ordre de tâches sans distance inventée.

**Données nécessaires.** Rencontres conditionnelles ; accès de zones ; cartes par version ; coordonnées et connexions vérifiées pour les parcours cartographiques.

**Acceptation.** Changer de version change aussi les détails ; aucun point décoratif ne se présente comme un lieu exact ; une position ne change pas parce qu'on trie la liste ; les erreurs de données sont distinctes des absences confirmées.

### F06 — Lieux : un dossier de zone relié à l'aventure

**Point de départ.** [Lieux](src/locations/scene.tsx) et [places.ts](src/locations/places.ts) proposent cartes et repères. Leur rôle chevauche partiellement celui de l'atlas.

**Proposition.** Unifier leur modèle de lieux tout en gardant deux entrées : chercher un Pokémon ou choisir une zone. Un dossier de zone présente rencontres, objets utiles, capacités à récupérer, étapes d'évolution possibles, accès adjacents et progression personnelle.

La recherche doit distinguer deux lieux portant le même nom dans des jeux différents. Une ville visitée dans l'application n'est pas automatiquement visitée dans la partie. Le suivi « exploré dans mon jeu » reste explicite.

**Approfondissement.** Carte avec étages et intérieurs lorsque les données le permettent ; filtres d'objectifs ; carnet de notes ; vue liste équivalente. Un mode anti-spoiler masque zones, espèces ou combats non révélés, selon les préférences du joueur.

**Données nécessaires.** Registre canonique des lieux et alias FR/EN, relations entre zones, objets et progression. Les positions des illustrations actuelles restent à valider pour chaque carte.

**Acceptation.** Le même lieu ouvert depuis une fiche ou la carte mène au même dossier ; l'utilisateur peut accomplir la tâche sans manipuler la carte ; le mode anti-spoiler s'applique aussi à la recherche et aux suggestions.

### F07 — Équipe : comprendre ses choix et pouvoir les essayer

**Point de départ.** [collections.tsx](src/_shared/collections.tsx) stocke une seule liste de six slugs. Le libellé d'équipe pleine est déjà présent dans [la fiche](src/detail/scene.tsx), autour de la ligne 178.

**Proposition.** Plusieurs équipes nommées, rattachées à une partie ou à un format ; membres théoriques ou liés à des exemplaires possédés. Mode simple : espèces, formes, niveaux et capacités. Mode avancé : talents, objets, natures et paramètres de statistiques applicables au jeu choisi.

Fournir une matrice défensive lisible, une couverture offensive fondée sur les capacités réellement choisies, et des alertes expliquées. Un talent ou une condition de combat peut changer le résultat ; l'analyse doit préciser ce qu'elle prend en compte. Les immunités doivent être visibles.

**Approfondissement.** Verrouiller les membres favoris, imposer « seulement mes Pokémon », « sans échange » ou « accessibles avant cette étape », puis proposer plusieurs remplaçants. Chaque proposition expose gains, pertes, obtention et hypothèses. Le joueur peut prévisualiser un changement sans modifier l'équipe enregistrée.

**Données nécessaires.** Modèle de configuration par jeu/format, capacités complètes, règles de compatibilité et disponibilité. Import/export texte Showdown envisageable : [format officiel documenté](https://github.com/smogon/pokemon-showdown/blob/master/sim/TEAMS.md). Sa prise en charge doit préciser les variantes acceptées et signaler les champs non importés.

**Acceptation.** Ajouter un septième membre ouvre un remplacement explicite ; aucune suppression automatique ; une équipe valide pour un format n'est pas certifiée gagnante ni authentique. Un [validateur Showdown](https://github.com/smogon/pokemon-showdown/blob/master/sim/team-validator.ts) peut servir de référence pour certains formats, après validation de son intégration.

### F08 — Comparateur : répondre « lequel pour mon besoin ? »

**Point de départ.** [Le comparateur](src/compare/scene.tsx) part de deux fiches. Les valeurs sont générales ; une erreur à droite peut être mal rendue si les statistiques de gauche ont chargé. La base de comparaison reste stockée.

**Proposition.** Sélection directe des deux candidats, permutation et annulation. Comparer soit des statistiques de base, soit des valeurs calculées à paramètres explicitement identiques. Afficher les différences chiffrées avec une échelle honnête, sans plafonnement visuel qui masque les écarts.

**Approfondissement.** Mode « remplacer ce membre » : effets sur l'équipe, capacités utiles perdues/gagnées, coût d'obtention et contraintes. Mode scénario : adversaire, niveaux, statistiques, capacités, talents et conditions. Montrer intervalle de dégâts et ordre de vitesse lorsqu'ils sont calculables ; une probabilité de K.-O. dépend du scénario et n'est pas une probabilité de gagner.

**Données nécessaires.** Moteur de règles versionné et jeux de cas de référence. Le [calculateur officiel du projet Pokémon Showdown](https://github.com/smogon/damage-calc) propose `@smogon/calc`, utilisable comme brique de calcul et sous licence MIT. Cela ne prouve pas sa compatibilité directe avec Expo/Hermes ni la prise en charge de chaque mode de jeu envisagé : prototype nécessaire.

**Acceptation.** Les valeurs inconnues restent inconnues ; chaque côté a son état d'erreur ; changer le jeu invalide les résultats précédents ; un même scénario reproduit les résultats de la version de référence retenue.

### F09 — Accueil et reprise : retrouver un travail précis

**Point de départ.** [L'accueil](src/dashboard/scene.tsx) agrège modules et collections. [L'activité](src/_shared/activity.tsx) retient une route, un libellé et des espèces récentes, pas tout l'état des outils.

**Proposition.** Accueil configurable, avec partie active, tâche épinglée, recherche et reprise précise. Conserver le Pokémon, jeu, forme, onglet et filtres d'un parcours ; pour une comparaison, les deux candidats et son scénario.

**Approfondissement.** Trois suggestions maximum issues d'objectifs actifs, chacune avec « Pourquoi ? », « Plus tard » et « Déjà fait ». L'utilisateur choisit entre priorité collection, équipe et exploration. Une carte peut indiquer « information à compléter » au lieu de prescrire une action non vérifiée.

**Données nécessaires.** Sessions d'outils et objectifs persistants, état de partie facultatif, règles de classement explicables.

**Acceptation.** Reprendre les attaques d'une espèce ne rouvre pas Pikachu par défaut ; reprendre une famille ne rouvre pas Évoli ; aucune suggestion ne contourne le mode anti-spoiler. Une modification personnelle produit un retour visible et une annulation quand c'est pertinent.

### F10 — Favoris et profil : devenir un espace personnel fiable

**Point de départ.** Les favoris sont binaires ; [le profil](src/profile/scene.tsx) contient surtout des informations de présentation. Les écritures [AsyncStorage](src/_shared/collections.tsx) peuvent échouer sans retour utilisateur.

**Proposition.** Garder un favori simple, puis proposer des listes nommées distinctes : à capturer, à entraîner, à échanger, préférés. Le profil accueille langue des noms, jeu actif, anti-spoilers, densité de lecture, téléchargements et sauvegardes. Le nom « Profil » décrit mieux l'existant que « Compte ».

**Approfondissement.** Centre de données : espace occupé, packs installés, dernière sauvegarde, exporter, restaurer et supprimer une partie précise. L'export et la restauration de base accompagnent gratuitement la collecte des données personnelles. Une synchronisation éventuelle doit gérer les conflits, pas seulement remplacer le fichier le plus ancien.

**Données nécessaires.** Schémas versionnés, journal d'opérations ou historique adapté, validation et migrations. Ne pas convertir automatiquement les favoris en captures : aimer une espèce ne signifie pas la posséder.

**Acceptation.** Un export réimporté restitue les données utiles ; un fichier invalide est refusé sans écraser l'existant ; deux captures simultanées ne disparaissent pas lors d'une fusion ; une erreur de stockage n'est pas annoncée comme sauvegarde réussie.

### F11 — Navigation et lecture : la profondeur accessible

**Point de départ.** [Le menu rapide](src/_shared/quick-menu.tsx) expose les modules ; plusieurs retours utilisent `replace`. Les interfaces sont riches en illustrations et animations.

**Proposition.** Structurer les accès autour d'Explorer, Ma partie/collection et Équipes, avec recherche immédiatement accessible. Attaques, évolutions et lieux restent consultables directement et depuis une fiche. Conserver le contexte au retour ; proposer les paramètres experts progressivement.

Le mode compact privilégie noms, chiffres et actions ; le mode découverte donne plus de place aux illustrations. Tester contraste, grands textes, lecteurs d'écran, zones tactiles et réduction des animations. Les [recommandations d'accessibilité Apple](https://developer.apple.com/design/human-interface-guidelines/accessibility) et [principes Android](https://developer.android.com/guide/topics/ui/accessibility/principles) soutiennent ces exigences.

**Acceptation.** Le parcours chercher → consulter → agir → revenir fonctionne au lecteur d'écran ; une couleur n'est jamais le seul moyen de distinguer faiblesse, état ou priorité ; le dock ne masque pas une action avec de grands textes ou la barre système.

## 6. Nouvelles fonctionnalités à forte utilité

### N01 — Une collection par partie, avec de vrais exemplaires

**Utilité.** Répondre séparément à « ai-je déjà enregistré cette espèce ? », « est-ce que je la possède encore ? » et « mon objectif est-il complet ? ».

Une partie possède un nom et un jeu exact. Une entrée de Pokédex indique un enregistrement ; un exemplaire représente un Pokémon possédé, avec forme, caractère chromatique, emplacement déclaré et attributs facultatifs. Un objectif définit quelles entrées comptent dans sa complétion.

**Exemple.** Le joueur possède un exemplaire du premier stade et le fait évoluer. Son Pokédex conserve l'enregistrement des deux stades ; son Living Dex peut maintenant manquer du premier. Échanger un doublon ne doit pas effacer les autres exemplaires. Un Pokémon reçu en échange peut être enregistré sans avoir été capturé personnellement.

**Profondeur utile.** Plusieurs parties du même jeu, collections nationale/régionale, objectifs avec ou sans formes, sélection groupée, notes, exemplaires réservés. Ne demander au départ que le minimum ; détails de sexe, origine, Ball ou statistiques restent optionnels. Les transformations temporaires ne sont pas comptées comme des exemplaires permanents par défaut.

**Dépendances et validation.** Identités stables + sauvegarde/restauration. Un ensemble de scénarios doit vérifier capture, réception, évolution, échange, annulation et doublons. Le dénominateur de progression doit être visible et ne pas changer silencieusement après une mise à jour du catalogue.

### N02 — Un planificateur d'objectifs sous contraintes

**Utilité.** Transformer « compléter cette famille » ou « obtenir cette équipe » en étapes adaptées aux ressources et à l'avancement du joueur.

Entrées : objectif, jeu, exemplaires possédés, zones débloquées, ressources déclarées et contraintes personnelles. Sorties : tâches ordonnées, prérequis, blocages, alternatives et justification de chaque étape. L'utilisateur doit pouvoir choisir « sans échange », « sans transfert », « conserver un exemplaire de chaque stade » ou « utiliser mes membres actuels ».

**Profondeur utile.** Mutualiser les tâches : un objet ou une zone peut servir plusieurs objectifs ; un même exemplaire ne peut pas être consommé par deux évolutions divergentes. Réserver les ressources dans le plan, demander confirmation de leur consommation réelle et recalculer après une capture.

**Exemple fictif de présentation.** « Avec tes deux exemplaires, tu peux compléter une branche. Pour conserver aussi les stades précédents, il te manque un exemplaire et un objet. Voir les deux plans possibles. »

**Dépendances et validation.** N01, F03–F06, graphe de prérequis et inventaire léger. Tester les conflits de ressources, branches alternatives, prérequis inconnus et plans devenus obsolètes. Afficher « proposition selon les informations fournies » ; un optimum n'est revendiqué que si le problème, le critère et les données le permettent.

### N03 — Une sortie de capture préparée depuis les manquants

**Utilité.** Avant une session de jeu, préparer quelques captures compatibles avec les zones accessibles et les méthodes disponibles.

Choisir une zone de départ dans le jeu, les objectifs à favoriser et les restrictions. L'application regroupe les tâches par lieux, méthodes et conditions connues. Elle propose une liste embarquée hors ligne et permet de cocher les captures d'une main.

**Profondeur utile.** Éviter les allers-retours en regroupant les besoins ; séparer objectifs déterministes et rencontres aléatoires ; recalculer quand un objectif est atteint. Pour les jeux compatibles, un module de préparation peut rappeler des risques documentés : fuite, auto-K.-O., recul, manque de PP ou immunité à une capacité prévue.

Un calculateur de capture éventuel doit être propre au jeu et parfois à son correctif. L'[analyse des captures de génération IX publiée par The Cave of Dragonflies](https://www.dragonflycave.com/mechanics/gen-ix-capturing/) détaille justement des changements de paramètres et de versions : une formule universelle serait insuffisante.

**Dépendances et validation.** Données de rencontres exactes et capacités effectivement connues par la rencontre, pas seulement apprenables par l'espèce. Pas de durée de capture garantie ; sans graphe spatial, livrer une liste ordonnée plutôt qu'un trajet prétendument optimal.

### N04 — Un atelier « obtenir et préparer ce Pokémon »

**Utilité.** Passer d'une configuration théorique à sa réalisation : espèce, forme, capacités, talent, objet et statistiques pertinentes.

L'atelier part d'un membre de l'équipe ou d'une configuration importée. Il décompose l'obtention, l'évolution, l'apprentissage et l'entraînement en tâches, en tenant compte de ce qui est déjà possédé. Plusieurs plans peuvent privilégier ressources, facilité ou conservation des exemplaires.

**Profondeur utile.** Pour les jeux concernés, chaîne de reproduction et apprentissage combiné ; allocation des objets partagés ; suivi d'entraînement ; alternative lorsque le set complet n'est pas obtenable. Le compteur d'entraînement conserve le contexte : bonus, adversaires et modifications manuelles. Un calculateur d'IV doit pouvoir donner un intervalle si les entrées ne permettent pas une valeur unique.

**Dépendances et validation.** N02 + modèles d'objets, talents, natures et apprentissages. Les mécanismes applicables sont définis jeu par jeu. Tester un ensemble de configurations impossibles, partiellement connues et réalisables. Deux méthodes valables indépendamment ne garantissent pas un chemin commun possible.

### N05 — Préparer les combats importants, avec contrôle des spoilers

**Utilité.** Répondre à « avec mon équipe actuelle, que dois-je préparer avant ce combat ? ».

Choisir une étape de l'aventure ; afficher uniquement les détails révélés par l'utilisateur. Comparer ses membres à des équipes adverses vérifiées pour le jeu, la variante du combat et, si nécessaire, ses conditions. Expliquer menaces, résistances disponibles, incertitudes et améliorations accessibles à ce stade.

**Profondeur utile.** Préparer une feuille courte : capacités à vérifier, objets utiles, scénarios de vitesse ou de survie. Les paramètres inconnus peuvent être traités par plusieurs scénarios plutôt que remplacés par des valeurs idéales silencieuses.

**Dépendances et validation.** F07–F08, données éditoriales de combats, accès aux ressources. La simple lecture des types ne suffit pas à promettre la victoire. Aucun combat futur ne doit être révélé par un titre, une notification ou un résultat de recherche en mode anti-spoiler.

### N06 — Une chasse chromatique persistante et transparente

**Utilité.** Relier la préparation d'une chasse, ses sessions et la trouvaille à la collection.

Choisir une cible et une méthode documentée pour le jeu ; conserver compteur, durée, pauses, conditions et corrections. Ajouter de grands contrôles +1/−1, reprise après fermeture, plusieurs chasses et validation d'une trouvaille vers un exemplaire de N01.

**Profondeur utile.** Journaliser les changements de méthode et de bonus par segments. Distinguer rencontres, Pokémon générés et tirages lorsque nécessaire. Un état chromatique indisponible doit être fondé sur une restriction vérifiée, pas sur l'absence d'image.

Pour des essais indépendants à probabilité constante `p`, la probabilité théorique d'au moins un succès en `n` essais est `1 − (1 − p)^n`. Avec probabilités variables connues et essais indépendants : `1 − ∏(1 − pᵢ)`. Ces modèles ne doivent pas être appliqués à une mécanique qui viole leurs hypothèses.

**Dépendances et validation.** Règles documentées par méthode ; sauvegarde robuste. Activer un bonus ne réécrit pas les anciens essais. Les échecs passés n'augmentent pas la probabilité du prochain essai lorsque les tirages sont indépendants à taux constant. Le compteur reste utile même si le calcul de probabilité est indisponible.

### N07 — Un conseiller de transferts et de complétion multi-jeux

**Utilité.** Savoir quel exemplaire peut rejoindre quel jeu, par quel chemin et avec quelles restrictions.

Depuis un exemplaire saisi manuellement, sélectionner une destination. Le plan présente étapes, compatibilité, contraintes d'origine et éventuelles impossibilités de retour. L'utilisateur confirme ensuite le transfert réalisé dans les outils officiels ; l'app met à jour son emplacement déclaré.

Le [guide officiel Pokémon HOME](https://home.pokemon.com/en-us/move/) décrit des restrictions et certains mouvements irréversibles, notamment le retour vers Pokémon Bank. La règle applicable doit être vérifiée à la date d'utilisation. Aucun contrat d'API publique de synchronisation tierce HOME n'a été identifié dans les documents consultés ; cette fonction ne promet donc aucune connexion automatique à la collection officielle.

**Profondeur utile.** Déterminer quels jeux possédés couvrent les manquants, identifier les exclusivités et préparer une liste d'échanges. Une compatibilité d'espèce ne suffit pas à garantir celle d'un exemplaire précis.

**Dépendances et validation.** N01–N02, graphe de transferts entretenu et règles de provenance. Coût éditorial élevé : à livrer après le cœur local. Un parcours non documenté reste indéterminé.

### N08 — Un mode défi / Nuzlocke intégré aux parties

**Utilité.** Remplacer le carnet séparé du joueur : rencontres par zone, captures manquées, membres disponibles et retirés du défi, progression et règles choisies.

Chaque partie possède son règlement modifiable : traitement des doublons, cadeaux, zones, exceptions et plafonds de niveau éventuels. Les règles sont celles du défi choisi, pas une vérité universelle. Une correction doit être possible et visible dans l'historique.

**Profondeur utile.** Préparer les prochains combats avec les membres encore disponibles, appliquer les exceptions explicites et conserver un journal partageable. Une rencontre « manquée » et une zone « pas encore explorée » sont des états différents.

**Dépendances et validation.** N01, dossiers de zones, F07 et éventuellement N05. Séparer ce mode de la progression standard. Un décès de défi ne supprime pas un exemplaire de toutes les collections du joueur. Priorité à confirmer avec un public dédié.

### N09 — Un préparateur de raids pour un jeu précisément supporté

**Utilité.** Choisir un membre réellement disponible et un rôle compatible avec un raid documenté.

Afficher les paramètres du boss, les hypothèses, les menaces connues et la contribution des membres : dégâts, soutien, survie, interactions. Une stratégie de groupe peut être partagée comme une feuille d'actions avec variantes en cas d'imprévu.

**Profondeur utile.** Relier la préparation à N04, estimer les ressources à obtenir et vérifier les interactions du groupe. Le [projet TeraRaidBuddy](https://github.com/Arkkandy/TeraRaidBuddy) illustre la profondeur de paramètres déjà traitée par un outil spécialisé. Son existence ne prouve pas que ses résultats soient directement réutilisables dans tous les raids ou jeux.

**Dépendances et validation.** Moteur spécifique, données de boss et maintenance des événements. Date, fuseau et source nécessaires pour un événement temporaire. Ne pas extrapoler un raid d'une génération à un autre système. Module ultérieur, sauf si les raids deviennent la cible principale du produit.

### N10 — Une aide contextuelle et un circuit de correction

**Utilité.** Comprendre un résultat et pouvoir signaler précisément une erreur sans quitter le parcours.

« Pourquoi cette recommandation ? » affiche le jeu, les critères, les informations personnelles utilisées et les inconnues. « Signaler une information » préremplit la fiche, le champ, le contexte et la révision de données, avec aperçu avant envoi. Les suggestions de correction passent par une revue ; elles ne modifient pas immédiatement la base de tous les joueurs.

**Profondeur utile.** Recherche en langage naturel, si elle fait gagner du temps : convertir la demande en filtres ou en plan inspectable. Une couche générative éventuelle reformule des résultats validés ; les calculs et conditions d'obtention restent produits par des règles vérifiables. Une réponse sans source suffisante doit le dire.

**Dépendances et validation.** Provenance au niveau des faits, suivi des corrections et tests de non-régression. Tester ambiguïtés, jeu omis, cibles inexistantes, données contradictoires et disponibilité hors ligne. L'IA ne constitue pas une condition nécessaire pour obtenir ces bénéfices.

## 7. Le socle de données nécessaire

### 7.1 Le contexte de jeu doit traverser tout le produit

Un contexte devrait inclure le jeu exact, le groupe de versions quand il est pertinent, les extensions possédées, une version de règles et un format éventuel. La progression et les ressources personnelles restent séparées et facultatives.

Une région n'est pas un jeu ; une génération ne suffit pas toujours ; une entrée au Pokédex régional ne prouve pas une possibilité de capture locale. Il faut distinguer au minimum : enregistré dans le dex, présent dans le jeu, obtenable dans le jeu, transférable et accessible à ce stade.

Dans la documentation actuelle, [PokéAPI](https://pokeapi.co/docs/v2) expose des apprentissages par groupe de versions, des rencontres conditionnelles, des données historiques et des conditions d'évolution enrichies. Attention : le champ `version_group` d'une évolution décrit son introduction ; ce n'est pas à lui seul un intervalle complet de validité. La présence de champs ne garantit pas leur remplissage exhaustif. Le code actuel n'exploite qu'une partie de ce modèle.

Le mode national doit indiquer le référentiel utilisé pour ses statistiques et capacités. Il ne doit pas fusionner silencieusement plusieurs règles pour produire un résultat apparemment cohérent.

### 7.2 Modèle conceptuel proposé

| Entité | Rôle | Erreur évitée |
| --- | --- | --- |
| Espèce / variété / forme | Identité du contenu, indépendante de son nom traduit. | Confondre une forme avec une autre espèce ou un simple sprite. |
| Partie | Un exemplaire de l'aventure d'un joueur, lié à un jeu. | Mélanger deux parties du même jeu. |
| Enregistrement de dex | Historique déclaré d'obtention ou d'observation dans un périmètre. | Retirer une entrée enregistrée après évolution. |
| Exemplaire possédé | Un individu suivi ou une quantité explicitement simplifiée. | Effacer tous les doublons lors d'un échange. |
| Équipe / configuration | Choix théorique ou référence à des exemplaires. | Confondre une équipe planifiée avec six Pokémon réellement possédés. |
| Objectif | Périmètre, critères et définition de la complétion. | Modifier arbitrairement le 100 % du joueur. |
| Tâche / prérequis / ressource | Plan d'obtention et avancement déclaré. | Consommer deux fois le même objet ou exemplaire. |
| Fait sourcé | Valeur, contexte de validité, provenance et révision. | Appliquer une information au mauvais jeu. |
| Session d'outil | Paramètres de comparaison, recherche, chasse ou préparation. | Perdre le travail au retour ou au redémarrage. |

La saisie doit rester simple malgré ce modèle interne : cocher une entrée ne doit pas imposer de remplir une fiche d'élevage.

### 7.3 Cartographie des sources et travail éditorial

| Domaine | Base envisageable | Travail restant avant promesse de qualité |
| --- | --- | --- |
| Encyclopédie et noms | Catalogue actuel + PokéAPI. | Mesurer fraîcheur, traductions, formes et complétude. |
| Apprentissages et évolutions | Données structurées puis règles contextualisées. | Préserver les conditions ; vérifier exceptions et compatibilités. |
| Rencontres et lieux | Données de rencontres + base de zones entretenue. | Couverture par jeu, conditions, coordonnées, accès et cartes. |
| Calculs et formats | Moteurs spécialisés étudiés pour le périmètre retenu. | Versionner, vérifier sur cas de référence et mesurer sur mobile. |
| Combats, objets à récupérer, progression | Données éditoriales à constituer ou sources réutilisables identifiées. | Sources, droits d'usage, vérification et maintenance. |
| Collection et partie | Déclarations du joueur. | Export, annulation, validation, migration et éventuels conflits. |
| Transferts et événements | Informations officielles datées. | Surveillance des changements et traitement des cas particuliers. |

Chaque jeu annoncé comme pris en charge doit avoir une fiche de couverture : espèces/formes, attaques, évolutions, rencontres, lieux, objets et calculs. Les états possibles sont « vérifié sur le périmètre annoncé », « partiel » et « non pris en charge ». Un taux de complétude exige un dénominateur défini ; compter seulement les entrées déjà connues peut masquer les manques.

Je conseille de choisir **un jeu ou un duo pilote**, après étude de couverture et entretiens utilisateurs. Le code et les recherches actuels ne suffisent pas à sélectionner honnêtement le meilleur pilote. Le choix se fait sur la demande réelle, les sources exploitables et le coût de validation. Les autres jeux peuvent rester en consultation encyclopédique avec leurs limites indiquées.

### 7.4 Hors ligne : une promesse testable

Proposer un index léger embarqué, puis des packs par jeu contenant les données nécessaires aux fonctions annoncées. Séparer données et images pour gérer taille et téléchargement. Montrer taille, périmètre, date et état du pack ; permettre reprise d'un téléchargement interrompu.

Une mise à jour est téléchargée et validée avant activation ; l'ancien pack reste utilisable si elle échoue. La révision des données et la révision des règles doivent être compatibles. Les données personnelles ne sont jamais supprimées lors du nettoyage d'un cache ou d'un pack.

[Expo SQLite pour le SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/) fournit une base persistante et est inclus dans Expo Go. C'est une option pertinente à évaluer pour les recherches croisées, packs et transactions ; elle ne remplace pas à elle seule les migrations, la restauration ou les tests de corruption.

Les widgets et certaines intégrations natives demandent une étude spécifique. Expo distingue le périmètre fixe d'Expo Go et les [development builds](https://docs.expo.dev/develop/development-builds/faq/) permettant des modules natifs supplémentaires. Leur disponibilité dans le projet SDK 54 doit être vérifiée avant de les inscrire comme livraison simple.

## 8. Comment rendre la qualité visible et vérifiable

### 8.1 Contrat de confiance dans l'interface

Sur une donnée sensible au contexte : jeu applicable, condition, source et date de vérification accessibles sans surcharger la fiche. Sur un conseil : raison, hypothèses, inconnues et possibilité de corriger son état personnel. Sur une action enregistrée : confirmation, annulation et indication honnête de l'état de sauvegarde.

Les libellés doivent distinguer :

- **Impossible dans ce contexte** : une règle documentée l'exclut.
- **Pas encore accessible** : un prérequis connu manque dans la partie déclarée.
- **Non renseigné** : il manque une information du joueur.
- **Non vérifié** : la base de l'application ne permet pas de conclure.
- **Indisponible temporairement** : un chargement ou service a échoué.

Ces différences évitent qu'une lacune technique devienne une fausse règle de jeu.

### 8.2 Critères de sortie proposés

Les seuils ci-dessous sont des objectifs de conception à valider sur appareils représentatifs, pas des performances mesurées ni des standards universels.

| Domaine | Critère d'acceptation proposé |
| --- | --- |
| Réponse rapide | Résultats d'une recherche locale en moins de 300 ms au 95e percentile, sur appareils et jeu de données documentés. |
| Démarrage | Recherche essentielle utilisable en moins de 2 s au 95e percentile sur le périmètre de test retenu ; mesurer build de production, démarrage à froid et pack installé. |
| Hors ligne | Après fermeture complète en mode avion : recherche, fiches couvertes, collection, évolutions et équipe restent utilisables avec le pack installé. |
| Sauvegarde | Une opération annoncée comme sauvegardée est retrouvée après arrêt ; les opérations en échec sont signalées ; restauration testée sur une installation vierge. |
| Exactitude | Tous les cas du corpus de référence passent ; les zones non couvertes sont explicites. Ce succès ne vaut pas preuve d'exhaustivité du jeu entier. |
| Changements de contexte | Passer du jeu A au jeu B ne conserve pas silencieusement un conseil ou une valeur calculée pour A. |
| Navigation | Un aller-retour depuis fiche, attaque, lieu et comparateur conserve les paramètres utiles et n'altère pas la collection. |
| Accessibilité | Parcours essentiels réalisables avec VoiceOver/TalkBack, grands textes et animations réduites ; aucune distinction critique uniquement colorée. |
| Robustesse des packs | Interruption réseau, espace insuffisant ou paquet invalide laissent intact le dernier pack valide et les données personnelles. |
| Import | Aperçu du périmètre, champs ignorés signalés, aucun écrasement silencieux ; import répété avec stratégie de doublons explicite. |

### 8.3 Cas métier qui méritent des tests dédiés

Les tests les plus utiles couvrent les décisions et les pertes possibles, pas seulement le rendu des composants :

1. Même espèce, deux formes et deux contextes historiques.
2. Même zone, deux versions avec méthodes et niveaux différents.
3. Deux méthodes d'évolution alternatives, dont une avec plusieurs conditions cumulées.
4. Une donnée absente, une impossibilité confirmée et une panne réseau.
5. Un exemplaire évolué, un doublon échangé et l'annulation de chacune de ces opérations.
6. Deux objectifs qui réclament le même objet ou le même exemplaire.
7. Quatre capacités apprenables séparément mais incompatibles dans une configuration donnée.
8. Talent ou condition modifiant une interaction de types dans un calcul supporté.
9. Changement de bonus de chasse au milieu d'une session.
10. Migration d'une ancienne collection et restauration d'une sauvegarde interrompue ou invalide.
11. Ajout de contenu à un pack sans modifier silencieusement l'objectif de complétion existant.
12. Anti-spoiler conservé dans recherche, suggestions, titres et partage.

## 9. Priorisation et coût réel

Les tailles suivantes sont relatives : M = plusieurs composants avec périmètre maîtrisé ; L = plusieurs modules et migrations ; XL = moteur de règles ou travail éditorial important. Ce ne sont pas des estimations calendaires. Le coût dépend fortement du nombre de jeux supportés.

| Lot | Contenu | Valeur principale | Taille | Entretien des données | Condition avant livraison |
| --- | --- | --- | --- | --- | --- |
| A — Fiabilité immédiate | Catalogue local exploitable, routes invalides, erreurs partielles, reprise, retours et sauvegardes honnêtes. | Retirer les obstacles dans les fonctions actuelles. | M | Faible à moyen | Parcours essentiels et erreurs contrôlés. |
| B — Jeu pilote fiable | Contexte transversal, identités de formes, apprentissages complets, rencontres non mélangées, évolutions contextualisées. | Rendre les réponses exactes sur un périmètre annoncé. | L | Élevé | Corpus métier et fiche de couverture. |
| C — Collection et portabilité | N01, listes, progression, migration, export et restauration ; packs offline. | Créer une utilité personnelle durable. | L | Moyen | Scénarios d'évolution/échange/doublons et restauration validés. |
| D — Équipe utile | F07–F08, remplacement, comparaison contextualisée, import/export. | Aider à choisir et préparer ses membres. | L à XL | Élevé | Paramètres, règles et résultats de référence vérifiés. |
| E — Planification | N02–N04, accueil orienté objectifs, tâches mutualisées. | Réunir l'information et la progression en actions. | XL | Très élevé | B–D suffisamment couverts ; cas de ressources partagées traités. |
| F — Un module expert choisi | Chasse OU combats importants OU défi ; selon les utilisateurs pilotes. | Approfondir un besoin identifié. | L à XL | Variable à élevé | Validation de l'usage auprès du segment concerné. |
| G — Extensions spécialisées | Transferts, raids, synchronisation et widgets. | Répondre à des besoins plus étroits. | L à XL | Élevé à très élevé | Fondations stables, faisabilité native/service et maintenance financée. |

Le travail éditorial est un coût permanent : vérifier une table de rencontres, une restriction ou une équipe adverse, puis la maintenir, peut prendre plus d'effort que l'écran qui l'affiche. Une grande liste de jeux cochés dans un menu ne mesure pas la qualité de leur prise en charge.

### Première version recommandée

Une tranche complète : choisir sa partie → chercher une espèce hors ligne → voir son obtention exacte → enregistrer son acquisition → préparer une évolution → voir sa progression → exporter sa sauvegarde.

Puis une seconde tranche : créer son équipe → choisir un remplaçant → comprendre les compromis → enregistrer la configuration → préparer les capacités nécessaires.

Cette progression permet de valider une utilité complète avant de financer un planificateur couvrant tous les jeux. Les corrections de l'[audit technique](AUDIT_TECHNIQUE.md), notamment installation, persistance et gestion des erreurs, restent nécessaires à une livraison fiable.

## 10. Validation avec de vrais joueurs

Organiser des sessions exploratoires avec trois profils : joueur en cours d'aventure, collectionneur et utilisateur d'outils d'équipe. Un premier groupe de 4 à 6 personnes par profil peut révéler des problèmes de parcours ; il ne permet pas d'estimer statistiquement tout le marché.

Leur demander de réaliser des tâches dans leur outil habituel, puis dans le prototype : trouver une méthode d'obtention pour leur jeu, vérifier une évolution, ajouter plusieurs captures, essayer un remplaçant, reprendre une recherche et restaurer une sauvegarde. Utiliser leurs vrais contextes avec leur accord, sans demander leur compte Nintendo.

Mesurer réussite correcte, temps, hésitations, ressaisie et besoin de vérifier ailleurs. Poser ensuite des questions sur ce qui leur a fait gagner du temps et ce qui les ferait abandonner l'outil. Pour arbitrer les nouveautés, comparer plusieurs prototypes de même niveau de finition.

L'indicateur central proposé est **la part des tâches utiles accomplies correctement sans recherche externe supplémentaire**, complétée par les erreurs de données et pertes de progression. La rétention doit être interprétée selon les sessions d'aventure : une app consultée efficacement pendant une partie peut être utile sans usage quotidien toute l'année.

La télémétrie éventuelle doit rester proportionnée. Des essais modérés et des événements agrégés peuvent déjà renseigner beaucoup ; les surnoms, notes et contenus de collection n'ont pas besoin d'être envoyés pour mesurer la réussite d'une recherche.

## 11. Avis créatif révisé

Le code montre une intention de terminal personnel : fonds sombres, gradients, grandes illustrations, cartes et navigation centrale. Cette base peut soutenir une identité reconnaissable. Je ne peux pas en déduire un niveau de finition réel sans voir les écrans sur plusieurs appareils.

Je pousserais la créativité dans **la représentation de la progression et des décisions** : un arbre d'évolution qui montre les conditions manquantes ; une carte qui révèle les objectifs accessibles ; une comparaison qui rend visibles les conséquences d'un remplacement ; un carnet qui garde les moments choisis par le joueur.

Le mode découverte peut conserver la mise en scène et les grandes illustrations. Le mode consultation pendant une partie doit donner davantage de place aux réponses. Ces deux densités peuvent partager couleurs, typographie et composants pour garder une identité commune.

L'animation la plus utile montre le résultat d'une action : une branche complétée, une tâche résolue, un remplacement prévisualisé. Les paramètres de mouvement et d'haptique restent contrôlables. Une recherche rapide ne doit pas attendre une animation de scanner.

Je repousserais le quiz quotidien, les badges de connexion, le fil social et le chatbot généraliste. Ils pourront compléter une expérience dont la valeur est démontrée. Les dossiers de terrain, la continuité entre outils et les explications des conseils constituent une direction créative plus directement liée à l'utilité recherchée.

Mon avis : **le potentiel le plus intéressant est celui d'un carnet de partie expert, accessible progressivement, auquel le joueur peut confier sa collection et ses décisions**. La preuve de cette qualité viendra de réponses justes, d'un périmètre honnête et de données personnelles conservées.

## 12. Sources et traçabilité

Sources consultées le 30 septembre 2026. Les liens suivants permettent de vérifier les observations citées ; disponibilité et contenus peuvent évoluer. Les propositions et priorités restent mes recommandations.

| Source | Utilisation dans la revue | Limite |
| --- | --- | --- |
| [dataDex — Google Play](https://play.google.com/store/apps/details?id=com.talzz.datadex) / [éditeur](https://datadex.app/) | Niveau de référence et distinction annonce/livraison. | Déclarations, pas test fonctionnel. |
| [ProDex — App Store](https://apps.apple.com/us/app/prodex-complete-game-guide/id1485409731) | Offre et indices qualitatifs dans des avis datés. | Avis non représentatifs ; bugs anciens non revalidés. |
| [Prokedex — éditeur](https://www.prokedex.com/en/index.html) | Largeur des modules concurrents. | Pas de mesure indépendante de complétude. |
| [PokéPC](https://pokepc.net/) / [roadmap](https://pokepc.net/roadmap) | Collection avancée et irritants opérationnels. | Roadmap distincte de fonctions déjà livrées. |
| [PokeTools](https://www.poketools.com/breeding) | Existence de planificateurs spécialisés. | Exactitude du moteur non testée. |
| [Nuzlocke Tracker](https://github.com/chris-tela/nuzlocke-tracker-public) | Référence de parcours de défi. | Support annoncé par l'éditeur. |
| [TeraRaidBuddy](https://github.com/Arkkandy/TeraRaidBuddy) | Profondeur requise pour les raids. | Pas de garantie de calcul pour tout contexte. |
| [PokéAPI — documentation](https://pokeapi.co/docs/v2) | Capacités du schéma et contexte des données. | Schéma ne signifie pas couverture exhaustive. |
| [Showdown — calculateur](https://github.com/smogon/damage-calc) | Brique de référence de calcul. | Intégration mobile et périmètre à éprouver. |
| [Showdown — équipes](https://github.com/smogon/pokemon-showdown/blob/master/sim/TEAMS.md) / [validateur](https://github.com/smogon/pokemon-showdown/blob/master/sim/team-validator.ts) | Interopérabilité et règles de format. | Validité déclarative, pas preuve d'origine d'un exemplaire. |
| [Pokémon HOME — transferts](https://home.pokemon.com/en-us/move/) | Restrictions officielles. | Aucune intégration tierce autorisée déduite de cette page. |
| [The Cave of Dragonflies — captures IX](https://www.dragonflycave.com/mechanics/gen-ix-capturing/) | Analyse communautaire spécialisée, paramètres et correctifs. | À recouper par tests pour le moteur retenu. |
| [Expo SQLite SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/) / [development builds](https://docs.expo.dev/develop/development-builds/faq/) | Faisabilité du stockage et limites d'Expo Go. | Pas une validation d'architecture du projet. |
| [Apple — accessibilité](https://developer.apple.com/design/human-interface-guidelines/accessibility) / [Android — accessibilité](https://developer.android.com/guide/topics/ui/accessibility/principles) | Principes de lecture et d'interaction. | Tests sur l'application encore nécessaires. |

Les autres sujets du premier audit — nom, contenus tiers, commercialisation et fiche de store — restent à traiter au moment adapté. Cette revue approfondit principalement le produit, ses données et son utilité.
