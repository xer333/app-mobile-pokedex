# Vers un compagnon Pokémon complet : recherche concurrentielle et feuille de route

Date de recherche : **1er octobre 2026**. État de référence : application locale après les premières tranches des lots A à F.

Ce document prolonge [l’audit fonctionnel approfondi](AUDIT_FONCTIONNEL_APPROFONDI.md). Il contient une recherche produit, une réévaluation du code existant et **40 propositions fonctionnelles**. Ce n’est pas une annonce de fonctionnalités déjà implémentées.

### Suivi de réalisation — première tranche R0 (1er octobre 2026)

| Point | État après cette tranche | Reste à vérifier ou à faire |
| --- | --- | --- |
| Q01 — Persistance | Lecteur stabilisé, mutations préchargement rejouées après lecture, écritures sérialisées et nouvelle tentative de lecture après erreur. | Tester la restauration et les erreurs de stockage sur appareils réels ; ajouter un test d’intégration du hook. |
| Q02 — Confirmations | Boîte de dialogue React Native commune pour les suppressions de collection/chasse et la trouvaille, sans `Alert.alert`. | Tester manuellement les boutons et l’accessibilité sur web, Android et iOS. |
| Q03 — Sauvegarde globale | **Non commencé** : l’export actuel reste limité aux exemplaires. | Format global versionné, aperçu d’import, validation des collisions et restauration de tous les modules. |
| Q04 — Édition des exemplaires | L’interface permet maintenant de corriger le jeu, le chromatisme et l’origine. | Édition guidée de la forme et contrôles de cohérence propres au jeu. |
| Q05 — Clôture de chasse | Forme et origine demandées, identifiant d’exemplaire stable, double validation neutralisée ; un exemplaire manquant peut être recréé explicitement. | Les deux états restent stockés séparément : une opération réellement atomique et un scénario de récupération automatique demandent encore un journal/migration. |

Vérifications automatisées de cette tranche : 34 tests, typage TypeScript et export web Expo réussis. Le bundle web ne constitue pas un test interactif des parcours.

## 1. Direction recommandée

Je recommande de construire un **compagnon personnel de partie, de collection et de préparation**, organisé autour de quatre questions :

1. Qu’est-ce qui existe et fonctionne dans mon jeu ?
2. Qu’est-ce que je possède, où est-ce rangé et qu’est-ce qui me manque ?
3. Que puis-je préparer avec mes Pokémon et mes ressources ?
4. Quelle action utile puis-je reprendre maintenant ?

Une application polyvalente peut couvrir encyclopédie, collection, capture, évolution, entraînement, combat, chasse et échanges. Pour qu’elle reste agréable, ces outils doivent partager les mêmes données personnelles et se transmettre le contexte. Exemple : ouvrir une capacité depuis une équipe, voir son coût d’obtention, ajouter les matériaux manquants à une sortie, puis retrouver le membre préparé sans le ressaisir.

**Mon avis : le meilleur potentiel concurrentiel est cette continuité, accompagnée de données vérifiables et d’un vrai fonctionnement hors ligne.** C’est une hypothèse de positionnement à tester auprès de joueurs ; la recherche ne prouve pas que cette combinaison soit exclusive.

### Ce que cette revue change

- Les concurrents ont eux aussi des parcours intégrés : présenter l’application comme « tout-en-un » ne suffira pas.
- Plusieurs fonctions de l’audit précédent sont encore des bases : poursuivre leur profondeur est aussi important qu’ajouter des rubriques.
- Les nouvelles pistes les plus concrètes sont l’inventaire quantifié, la liste de fabrication commune, les recherches enregistrées, les projets de collection avec périmètre fixé, les passeports d’exemplaires et la préparation d’échanges.
- La diversité des jeux impose des règles propres à chacun. Un nouveau jeu n’est pas simplement une nouvelle option dans une liste.
- Les besoins d’import, de sauvegarde et de correction doivent accompagner les modules dès leur arrivée.

## 2. Méthode et limites de la recherche

La recherche couvre des fiches de stores, sites d’éditeurs, journaux de versions, roadmaps publiques, dépôts de développeurs, documentation technique et quelques témoignages de joueurs. Les liens sont regroupés en section 12 et cités près des observations importantes.

Les sites et dépôts établissent ce que leurs auteurs annoncent ou documentent. Je n’ai pas installé et testé les applications concurrentes. Une fonction annoncée n’est donc pas une mesure indépendante de son exactitude, de son ergonomie ou de sa couverture.

Les avis publics servent à repérer des problèmes possibles, pas à mesurer leur fréquence. Les avis anciens ne prouvent pas qu’un défaut persiste. Les pages de marketing et les changelogs peuvent être désynchronisés : PokeTools affiche notamment des nombres d’outils différents entre sa page d’accueil et sa page « About ». Je n’utilise donc pas ces nombres comme classement de complétude. [Accueil](https://www.poketools.com/), [présentation](https://www.poketools.com/about).

La revue locale est une lecture de code, sans nouvelle session de test sur téléphone. Les 32 tests et l’export web mentionnés précédemment ne constituent pas une validation de tous les parcours d’interface ni de la sauvegarde après fermeture.

## 3. Réévaluation honnête de l’application actuelle

### 3.1 Ce qui existe et la profondeur encore nécessaire

| Domaine | Présent dans le code | Prochaine profondeur utile |
| --- | --- | --- |
| Recherche | Catalogue local, recherche FR/EN et numéro, filtres de découverte. | Recherche croisée capacités/talents/possession, ensembles enregistrés, résultats propres au jeu. |
| Jeu | Un jeu actif, partagé par plusieurs écrans. | Plusieurs parties du même jeu, extensions possédées, progression, règles et spoilers indépendants. |
| Encyclopédie | Fiches, formes navigables, statistiques, évolutions et capacités contextualisées en partie. | Corpus vérifié par jeu ; fiches d’objets, talents, natures ; historique des différences. |
| Collection | Exemplaires identifiés et liste avec origine modifiable. | Boîtes, filtres, édition complète, distinction enregistré/possédé, évolution et transfert journalisés. |
| Équipes | Une liste de six espèces et analyse des types répétés. | Plusieurs équipes, formes et configurations complètes, lien avec exemplaires et capacités choisies. |
| Comparaison | Statistiques de base et interactions défensives. | Remplacement dans l’équipe, hypothèses de combat, dégâts et vitesse contextualisés. |
| Objectifs | Tâches déclarées, contraintes enregistrées et alerte sur noms de ressources partagés. | Stocks et quantités, prérequis, alternatives, allocations et consommation réelle. |
| Chasse | Compteur, pause, segments et taux saisis manuellement. | Durée active, historique consultable/corrigible, méthodes documentées, formes et trouvaille fiable. |
| Portabilité | Export JSON des exemplaires seulement. | Sauvegarde globale des parties, équipes, objectifs, chasses et préférences. |
| Hors ligne | Catalogue local ; plusieurs caches réseau en mémoire. | Packs persistants et complets pour les parcours annoncés, images optionnelles. |

### 3.2 Corrections à traiter avant la prochaine extension majeure

Je corrige ici certains bilans précédents trop larges. Les constats ci-dessous sont reproductibles à partir du code ; leurs effets complets sur appareil restent à vérifier.

| Réf. | Constat local | Conséquence et correction proposée |
| --- | --- | --- |
| Q01 | Les fonctions de désérialisation sont créées dans le rendu de `PlanningProvider` et `ShinyHuntsProvider`. L’effet de lecture de `usePersistedState` dépend de cette fonction et met à jour l’état. | Avec des données enregistrées, chaque nouveau rendu peut provoquer une nouvelle lecture, puis un nouveau rendu. Stabiliser les lecteurs et tester le rechargement, les écritures rapides et les erreurs de lecture. Risque de boucle/relecture établi par le code ; comportement sur appareil non mesuré ici. |
| Q02 | La version installée de React Native Web possède un `Alert.alert()` vide. Collection et Chasses l’utilisent pour les suppressions et la confirmation « Trouvé ! ». | Ces actions confirmées ne peuvent pas aboutir par ce chemin sur le web. Prévoir une boîte de confirmation compatible web/mobile et tester les actions réellement. Un export web réussi ne détecte pas ce défaut. |
| Q03 | `collection-backup.ts` n’exporte que `specimens`. | Une restauration ne rétablit pas les objectifs, chasses, équipes ou préférences. Renommer le périmètre explicitement puis livrer une sauvegarde globale versionnée. |
| Q04 | Le modèle autorise la modification du jeu et du shiny, mais l’écran Collection n’expose que les boutons d’origine. | La précédente mention « édition du jeu/shiny » décrivait la capacité du modèle, pas l’interface livrée. Ajouter ces contrôles et tester leur restauration. |
| Q05 | « Trouvé ! » crée un exemplaire puis clôt la chasse dans un autre état persistant ; l’origine est toujours `captured` et la forme reprend l’espèce. | Une chasse par œufs ou d’une forme précise serait mal décrite. Prévoir une validation d’acquisition, une identité de forme explicite, une opération récupérable et résistante aux doubles validations. |
| Q06 | Le planificateur rapproche les ressources par texte ; les contraintes sont enregistrées mais aucun moteur ne les applique. | « Deux tâches utilisent Pierre Feu » ne prouve pas une pénurie : il faut une quantité et un stock. Un objet consommé doit diminuer le stock, même quand sa tâche disparaît des conflits actifs. |
| Q07 | Les caches de fiches/attaques/atlas dans `pokeapi.ts` sont des `Map` en mémoire. | Ils ne constituent pas des packs disponibles après fermeture. Tester le démarrage en mode avion avec le contenu effectivement installé. |
| Q08 | Les taux de chasse sont arrondis ; les corrections portent sur le dernier segment ; les anciens segments ne sont pas détaillés à l’écran. | Préserver la précision de la probabilité, distinguer rencontre/Pokémon généré/tirage, rendre le journal éditable et visible. |

Repères : [persistance](src/_shared/use-persisted-state.ts), [objectifs](src/_shared/planning-provider.tsx), [chasses](src/_shared/shiny-hunts-provider.tsx), [Alert web installé](node_modules/react-native-web/src/exports/Alert/index.js), [collection](src/collection/scene.tsx), [sauvegarde](src/_shared/collection-backup.ts), [validation de trouvaille](src/hunts/scene.tsx), [ressources](src/_shared/planning.ts), [probabilités](src/_shared/shiny-hunts.ts), [cache réseau](src/_shared/pokeapi.ts). Le comportement des dépendances d’effet est documenté par [React](https://react.dev/reference/react/useEffect).

Ces corrections font partie de la qualité du produit : une nouvelle fonction personnelle perd son intérêt si son historique est difficile à restaurer.

## 4. Ce que la concurrence apporte réellement à la réflexion

### 4.1 Références observées

« Annoncé » signifie présent dans la description consultée ; « prévu » signifie roadmap et non livraison constatée.

| Référence | Offre ou direction observée | Décision pour notre application |
| --- | --- | --- |
| [ProDex](https://apps.apple.com/us/app/prodex-complete-game-guide/id1485409731) | Annonce hors ligne, filtres, équipes, checklists et données par jeu. | Ce socle est attendu ; approfondir la continuité entre encyclopédie et préparation. |
| [dataDex](https://play.google.com/store/apps/details?id=com.talzz.datadex) | Décrit équipes nommées avec capacités, talents, objets, paramètres de statistiques et notes ; index transversaux. | Notre équipe actuelle est encore très simple : le modèle de configuration devient prioritaire. |
| [Prokedex](https://www.prokedex.com/en/index.html) | Présente cartes, lieux, objets, dresseurs, comparaison et couverture offensive/défensive. | Relier lieux, ressources et équipe ; une juxtaposition de fiches ne suffit pas. |
| [PokéPC](https://pokepc.net/) et sa [FAQ](https://pokepc.net/faq?lang=en) | Distingue checklist d’enregistrement et boîtes d’exemplaires ; organisation, sauvegardes par jeu et partage. | Séparer clairement les différents objectifs de collection dans notre modèle. |
| [Roadmap PokéPC](https://pokepc.net/roadmap?page=3) | Demandes visibles de déplacements multiples, localisations, export de données et réglages de périmètre. | Examiner les opérations de masse et la portabilité. Les éléments marqués « planned » ne sont pas comptés comme disponibles. |
| [PokeTools](https://www.poketools.com/) et son [journal](https://www.poketools.com/changelog) | Propose une large famille de calculateurs ; documente des ajouts sur phases de chasse, équipes et calculs contextualisés. | Prioriser des outils qui réutilisent nos exemplaires et nos objectifs. Les promesses d’exactitude de l’auteur restent à éprouver. |
| [Pikalytics](https://www.pikalytics.com/team) | Équipes configurables, suggestions fondées sur l’usage, sauvegarde et partage. | Ajouter format, date des données et hypothèses ; la popularité d’un set ne prouve pas sa pertinence pour un joueur. |
| [Showdown Damage Calculator](https://github.com/smogon/damage-calc) | Moteur de calcul réutilisable, avec paramètres de génération, membres, capacité et terrain. | Étudier son intégration pour des scénarios enregistrés depuis une équipe. |
| [ShinyHunt](https://www.shinyhunt.com/) | Compteurs, durée, taux et collection chromatique sont mis en avant. | Notre lot F doit acquérir un vrai suivi de sessions et un parcours de trouvaille complet. |
| [Pokétch](https://www.poketchapp.com/) | Son éditeur annonce l’arrêt des mises à jour du compteur historique et renvoie vers ShinyHunt. | La continuité et la récupération des données sont des fonctions produit à part entière. |
| [Ribbons.Guide](https://ribbons.guide/) et son [dépôt](https://github.com/SlyAceZeta/Ribbons.Guide) | Suivi de rubans, données personnelles locales et sauvegarde/restauration. | Étendre l’exemplaire en passeport personnel avec objectifs de rubans/marques. |
| [Nuzlocke Tracker / Nuzlify](https://github.com/chris-tela/nuzlocke-tracker-public) | Plusieurs parties, rencontres, équipes, préparation et calculateurs annoncés. | Un futur défi doit réutiliser parties, exemplaires et combats, avec ses propres règles. |
| [MapGenie Paldea](https://apps.apple.com/us/app/mapgenie-paldea-map/id6446167078) | Points d’intérêt catégorisés et progression de collecte. | Ajouter des couches utiles à l’Atlas : objets, CT, objectifs et points cochés. |
| [Pokémon Database : recherche de capacités](https://pokemondb.net/tools/moveset-search) | Recherche des espèces pouvant apprendre une combinaison de capacités. | Proposer cette recherche en la limitant au jeu, à l’avancement et aux exemplaires du joueur. |
| [Sandwich Simulator](https://github.com/cecilbowen/pokemon-sandwich-simulator) | Outil spécialisé de simulation de recettes d’Écarlate/Violet. | Envisager un module recettes connecté au stock et à la chasse, propre au jeu. |
| [TeraRaidBuddy](https://github.com/Arkkandy/TeraRaidBuddy) | Paramètres de boss et analyse de contres selon plusieurs configurations. | Un module raid demande un moteur dédié et un corpus ; il ne se réduit pas au type du boss. |

### 4.2 Signaux qualitatifs de besoins

- Un avis ProDex demande un calculateur accessible depuis les configurations pour éviter de ressaisir les statistiques ailleurs. Un autre réclame une couverture des combats importants au-delà des seules arènes. Cela soutient deux hypothèses de travail : **réutilisation des configurations** et **préparation d’aventure plus large**. [Avis de la fiche App Store](https://apps.apple.com/us/app/prodex-complete-game-guide/id1485409731).
- La roadmap de PokéPC révèle un intérêt pour les manipulations par lots et les choix précis de formes à compter. Cela justifie des tests de **gestion de grandes collections**, sans extrapoler les votes à tout le public. [Roadmap](https://pokepc.net/roadmap?page=3).
- Un témoignage récent de chasseur évoque la perte d’accès à ses compteurs. C’est un exemple de dépendance à l’outil et de besoin de récupération, pas une mesure de fiabilité du service cité. [Discussion du joueur](https://www.reddit.com/r/ShinyPokemon/comments/1wabusj/talk_lost_the_app_with_all_my_shiny_hunting/).

### 4.3 Positionnement qui reste à prouver

L’avantage recherché est : **« mes données me suivent d’un outil à l’autre et l’application m’aide à accomplir une tâche dans mon jeu »**.

La comparaison commerciale devrait porter sur des parcours exécutés dans les mêmes conditions : préparer une capture, retrouver un exemplaire, construire un remplaçant, reprendre une chasse et restaurer une sauvegarde. Comparer uniquement le nombre de rubriques favoriserait des promesses difficiles à tenir.

## 5. Catalogue des 40 évolutions proposées

Les identifiants X01–X40 servent au suivi. Ils ne remplacent pas les lots A–G. **Approfondissement** désigne un module présent ou déjà proposé dans l’audit ; **extension** apporte un parcours ou une structure supplémentaire. Les priorités sont des recommandations, pas des scores de demande mesurée.

### A. Contexte, données et recherche

| ID | Fonction | Résultat concret pour le joueur | Nature / priorité |
| --- | --- | --- | --- |
| X01 | Plusieurs parties et préférences par partie | Deux aventures du même jeu gardent séparément équipe, progression, DLC et règles. | Approfondissement / P1 |
| X02 | Packs hors ligne vérifiés par jeu | Recherche, fiches, obtention et outils couverts restent disponibles après fermeture en mode avion. | Approfondissement / P1 |
| X03 | Coffre de sauvegarde global | Exporter/restaurer toute sa progression, avec aperçu et résolution des conflits. | Approfondissement / P0 |
| X04 | Journal des actions et annulation | Revenir sur une capture erronée, une évolution, un échange ou une correction de compteur. | Approfondissement / P0 |
| X05 | Recherches croisées enregistrables | Garder « manquants de ce jeu accessibles sans échange », avec filtres visibles et modifiables. | Extension / P1 |
| X06 | Index liés d’objets, talents, natures et types | Depuis un effet ou un objet, retrouver les Pokémon concernés et les moyens d’obtention. | Approfondissement / P1 |
| X07 | Comparaison d’une fiche entre jeux | Voir les différences pertinentes d’apprentissage, statistiques, forme et disponibilité. | Approfondissement / P2 |
| X08 | Recherche de Pokémon utilitaires | Chercher un membre remplissant des fonctions choisies : capture, soutien, déplacement selon le jeu. | Extension / P2 |

### B. Collection et échanges préparés

| ID | Fonction | Résultat concret pour le joueur | Nature / priorité |
| --- | --- | --- | --- |
| X09 | Séparer enregistré et possédé | Un Pokémon évolué reste enregistré au Pokédex sans être compté comme exemplaire encore présent. | Approfondissement / P1 |
| X10 | Boîtes et emplacements | Retrouver jeu, boîte et emplacement déclaré ; préparer un rangement sans prétendre déplacer les Pokémon dans le jeu. | Approfondissement / P1 |
| X11 | Projets de collection à périmètre fixe | Living Dex, formes, chromatiques ou origines : choisir précisément ce qui compte, y compris les exclusions. | Extension / P1 |
| X12 | Passeport d’exemplaire | Surnom, forme, provenance, langue, Ball, lieu, notes, historique et objectifs propres. | Extension / P2 |
| X13 | Import guidé et édition par lots | Importer des listes compatibles, corriger plusieurs entrées et examiner les doublons avant fusion. | Approfondissement / P1 |
| X14 | Listes d’offres et de recherches | Préparer des échanges en comparant deux listes partagées, sans créer immédiatement une plateforme sociale. | Extension / P2 |

### C. Ressources, obtention et aventure

| ID | Fonction | Résultat concret pour le joueur | Nature / priorité |
| --- | --- | --- | --- |
| X15 | Inventaire léger quantifié | Suivre seulement les ressources utiles aux objectifs : objets d’évolution, matériaux, monnaies, consommables. | Extension / P2 |
| X16 | Liste commune de fabrication et d’achat | Additionner les besoins des capacités/objets choisis, soustraire le stock et regrouper les lieux d’obtention. | Extension / P2 |
| X17 | Atelier de reproduction et transmission | Déterminer les parents/étapes possibles pour une configuration, selon le jeu et les exemplaires disponibles. | Approfondissement / P3 |
| X18 | Plans d’obtention avec alternatives | Comparer capture, évolution, reproduction ou échange en expliquant ce qui manque pour chaque chemin. | Approfondissement / P2 |
| X19 | Sorties et couches de carte | Préparer une liste de captures/objets par zone, cocher sur place et poursuivre hors ligne. | Approfondissement / P2 |
| X20 | Dossiers de lieux personnalisés | À un lieu : voir ce qui manque à mes projets, les conditions et les ressources encore utiles. | Extension / P2 |
| X21 | Préparation et simulation de capture | Choisir une équipe utilitaire et comparer les Balls/états selon un moteur propre au jeu. | Approfondissement / P3 |
| X22 | Progression et anti-spoiler | Déclarer les accès obtenus ; masquer les lieux, combats et formes encore inconnus à la demande. | Approfondissement / P1 |

### D. Équipe, entraînement et combat

| ID | Fonction | Résultat concret pour le joueur | Nature / priorité |
| --- | --- | --- | --- |
| X23 | Bibliothèque d’équipes et de configurations | Équipes nommées par partie/format, variantes d’un membre, import/export Showdown avec aperçu. | Approfondissement / P1 |
| X24 | Couverture réelle et rôles | Calculer à partir des formes, talents et capacités choisies ; signaler les hypothèses non prises en compte. | Approfondissement / P2 |
| X25 | Remplacement expliqué | Comparer le membre actuel à plusieurs candidats selon besoins de l’équipe, possession et coût d’obtention. | Approfondissement / P2 |
| X26 | Scénarios de dégâts et de vitesse | Préremplir depuis une équipe et enregistrer les situations qui comptent pour le joueur. | Approfondissement / P3 |
| X27 | Atelier d’entraînement | Traduire une configuration en actions, estimer des intervalles d’IV et suivre les paramètres du jeu. | Approfondissement / P3 |
| X28 | Préparation de combats importants | Fiches d’adversaires vérifiées, variantes de combat, spoilers contrôlés et notes de préparation. | Approfondissement / P3 |

### E. Chasse et collection experte

| ID | Fonction | Résultat concret pour le joueur | Nature / priorité |
| --- | --- | --- | --- |
| X29 | Journal de sessions de chasse | Temps actif, pauses, corrections motivées, phases et consultation des anciens segments. | Approfondissement / P1 |
| X30 | Méthodes et bonus documentés | Saisir les conditions du jeu et obtenir un calcul dont les hypothèses et sources sont accessibles. | Approfondissement / P2 |
| X31 | Recettes et préparation de bonus | Trouver une recette compatible avec ses ingrédients, puis lancer une session avec le bon contexte. | Extension / P3 |
| X32 | Dossier de cible et trouvaille complète | Vérifier la forme visée, conserver les préparatifs, enregistrer cible ou trouvaille incidente avec la bonne provenance. | Extension / P2 |
| X33 | Rubans, marques et objectifs d’origine | Suivre le parcours d’un exemplaire, les objectifs encore accessibles et les prérequis avant transfert. | Extension / P3 |

### F. Modules complémentaires et confort

| ID | Fonction | Résultat concret pour le joueur | Nature / priorité |
| --- | --- | --- | --- |
| X34 | Défis personnalisables | Règlement de partie, rencontres par zone, états de membres et historique des corrections. | Approfondissement / P3 |
| X35 | Préparation de raids | Choisir un rôle et un membre possédé, puis préparer objets/capacités pour un boss documenté. | Approfondissement / P4 |
| X36 | Conseiller de transferts et compatibilité | Montrer les destinations et prérequis documentés d’un exemplaire, avec confirmation manuelle des mouvements réalisés. | Approfondissement / P4 |
| X37 | Calendrier ciblé de distributions/événements | Voir uniquement les annonces utiles à ses jeux, avec source, début, fin et statut de récupération déclaré. | Extension / P4 |
| X38 | Préremplissage depuis une capture d’écran | Proposer les champs reconnus, montrer l’incertitude et laisser corriger avant tout ajout. | Extension expérimentale / P4 |
| X39 | Mode consultation rapide et lexique FR/EN | Réponses compactes, recherche par noms étrangers, grands caractères, lecteur d’écran et commandes accessibles. | Approfondissement / P1 |
| X40 | Tableaux de bord et fiches partageables | Choisir ses raccourcis, exporter une équipe ou une liste d’échanges avec contexte et données personnelles choisies. | Extension / P2 |

P0 : fiabiliser les données personnelles ; P1 : compléter le produit quotidien ; P2 : relier les outils ; P3 : approfondir un usage expert ; P4 : ouvrir des modules nécessitant davantage de données ou de services. Ce sont des ordres de travail, pas des promesses de date.

## 6. Spécifications des évolutions qui feraient le plus de différence

Les fiches suivantes regroupent les 40 propositions en parcours réalisables. Les exemples sont des comportements proposés, pas des conseils déjà calculés par l’application.

### 6.1 Une collection qui sait ce que signifie « complet » — X09 à X13

**Parcours.** Créer un projet « conserver un exemplaire de chaque espèce dans cette partie », ou un projet de formes/chromatiques. Choisir les variantes et extensions incluses. Voir les manquants, puis ouvrir un chemin d’obtention.

Le modèle sépare l’enregistrement historique au Pokédex, l’exemplaire actuellement possédé et l’emplacement prévu. Une case planifiée dans une boîte ne prouve pas une possession. La distinction checklist/boîtes est déjà clairement expliquée par [PokéPC](https://pokepc.net/faq?lang=en) : elle doit devenir explicite chez nous aussi.

**Profondeur.** Boîtes nommées, tri sans déplacement physique, sélection multiple, étiquettes, vues « enregistrés mais plus possédés », provenance et migration de listes. Un même exemplaire peut contribuer à plusieurs vues compatibles ; il ne peut pas fournir simultanément deux individus exigés par une collection.

**Données.** `CollectionProject`, critères de variante, liste de cibles versionnée, `Specimen`, emplacement déclaré et historique.

**Acceptation.** Après évolution d’un exemplaire, l’espèce d’origine reste enregistrée, sa possession diminue et le projet Living Dex se recalcule. Une nouvelle édition des données ne change pas silencieusement le dénominateur d’un projet existant. L’utilisateur peut adopter le nouveau périmètre après aperçu.

### 6.2 Une sauvegarde complète et compréhensible — X03, X04, X13

**Parcours.** « Sauvegarder mon carnet » produit un fichier contenant parties, exemplaires, boîtes, équipes, objectifs, chasses et préférences. « Importer » montre d’abord les ajouts, changements, doublons et éléments non reconnus.

**Profondeur.** Export global ou sélectionné ; compatibilité avec l’ancien JSON d’exemplaires ; modèles CSV documentés pour listes simples ; doublons identiques et collisions d’identifiant traités différemment ; choix de conserver les deux versions ou une version sélectionnée. Un CSV simple ne devient jamais artificiellement une sauvegarde complète.

**Données.** Version de schéma, version de règles, identifiants stables, références entre entités, révisions et empreinte de fichier. L’empreinte détecte une altération, elle ne chiffre pas les données.

**Acceptation.** Une installation vierge retrouve les mêmes projets, compteurs et liens. Un import interrompu préserve l’état précédent. Réimporter un même fichier ne crée aucun doublon. Une mutation liée, telle que « trouvaille + exemplaire », se rejoue sans duplication après interruption.

**Taille : L.** Fondement transversal ; le stockage cloud reste une extension distincte.

### 6.3 Chercher une solution plutôt qu’un nom — X05 à X08

**Parcours.** Construire une recherche comme « dans ma partie, possédés ou accessibles, apprenant ces deux capacités ». Montrer les filtres sous forme de critères éditables et permettre de les enregistrer.

**Profondeur.** Opérateurs ET/OU, formes, capacités, talents, effet recherché, méthodes d’obtention et statut personnel. La capacité « apprenable » est distincte de « actuellement connue ». Des formulations simples peuvent être traduites en filtres inspectables, sans dépendre d’un dialogue génératif.

La recherche de combinaisons existe chez [Pokémon Database](https://pokemondb.net/tools/moveset-search). Notre apport proposé est de la rattacher aux exemplaires, aux ressources et à l’accès réel dans la partie.

**Données.** Index croisés versionnés ; compatibilité de la combinaison complète, pas seulement intersection de listes indépendantes.

**Acceptation.** Changer de jeu invalide proprement les critères devenus non vérifiés. Deux capacités apprenables isolément ne produisent pas automatiquement la promesse d’un ensemble légal. La recherche essentielle fonctionne avec le pack installé.

**Taille : L**, voire XL pour la vérification complète des chemins d’apprentissage.

### 6.4 Un inventaire qui prépare les objectifs — X15, X16, X18

**Parcours.** Sélectionner les capacités ou évolutions à préparer. L’app additionne les ressources nécessaires, déduit les stocks déclarés puis produit une liste commune de besoins.

**Profondeur.** Quantités, monnaie propre au jeu, objets consommables ou réutilisables, recettes, réservations et lieux d’obtention. Le joueur peut choisir de ne suivre que les ressources utilisées par ses projets. Les alternatives affichent leur compromis : moins de consommables, moins d’échanges ou utilisation d’exemplaires déjà possédés.

Les CT doivent rester liées au jeu : l’index de [PokeTools](https://www.poketools.com/tm-advisor) montre l’intérêt d’un référentiel par version, et les [tables de CT d’Écarlate/Violet](https://www.serebii.net/scarletviolet/tm.shtml) constituent une piste de vérification des recettes, pas une autorisation de recopier leur base.

**Données.** `ResourceStock`, `Recipe`, quantité requise, réservation, consommation confirmée et prérequis d’accès. Une visite de lieu est mutualisable ; deux consommations exigent deux unités.

**Acceptation.** Deux objectifs nécessitant chacun un objet, avec stock de deux, ne déclenchent pas de pénurie. Avec stock d’un, le choix d’allocation est explicite. Après consommation, le stock est mis à jour et la seconde tâche reste bloquée. Annuler restitue la même unité une seule fois.

**Taille : XL** pour un planificateur général ; une première version peut se limiter aux recettes et objets d’un jeu pilote.

### 6.5 Des lieux qui rassemblent ce qu’il reste à faire — X19 à X22

**Parcours.** Depuis une zone, ouvrir « ce qui m’est utile ici » : captures manquantes, objets réservés aux objectifs, conditions et points déjà traités. Préparer une sortie de quelques étapes et l’utiliser hors ligne.

**Profondeur.** Couches de carte activables, points personnels, liste équivalente accessible, filtres de méthode/conditions et progression distincte par partie. Les points d’intérêt et suivis de collecte sont déjà au cœur de [MapGenie Paldea](https://apps.apple.com/us/app/mapgenie-paldea-map/id6446167078).

**Données.** Coordonnées ou zones documentées, conditions, accès, sources et révision de carte. Sans graphe de trajet vérifié, fournir une liste regroupée par lieu ; l’optimisation de distance est une étape séparée.

**Acceptation.** Un changement de partie ne coche pas les points de l’autre. Une zone masquée par l’anti-spoiler n’apparaît ni dans les suggestions ni dans le partage. Cocher un objet unique ne signifie pas qu’il réapparaît à chaque visite.

**Taille : L à XL**, avec charge éditoriale élevée pour des cartes précises.

### 6.6 Une bibliothèque d’équipes réellement réutilisable — X23 à X25

**Parcours.** Créer une équipe nommée pour une aventure ou un format. Associer chaque emplacement soit à un exemplaire, soit à une configuration théorique. Choisir forme, capacités et paramètres utiles. Dupliquer l’équipe pour comparer un remplacement.

**Profondeur.** Import/export Showdown avec aperçu, notes de rôle, versions d’équipe, matrice défensive, couverture des capacités sélectionnées et suggestions filtrées sur les possessions. Le coût de préparation apparaît à côté de l’intérêt tactique.

Le format d’équipe est [documenté par Showdown](https://github.com/smogon/pokemon-showdown/blob/master/sim/TEAMS.md). [Pikalytics](https://www.pikalytics.com/team) illustre l’intérêt du partage et des suggestions ; des statistiques d’usage doivent toujours conserver leur format et leur date.

**Données.** `Team`, `TeamSlot`, `Build`, `FormatRevision` et lien facultatif à un exemplaire. Une configuration légale ne prouve ni sa possession ni l’origine légitime d’un individu.

**Acceptation.** Remplacer un membre préserve l’original jusqu’à confirmation. Modifier une équipe clonée ne change pas l’autre. Un talent gérant une immunité modifie l’analyse uniquement si le moteur le supporte ; sinon, le champ non évalué est visible.

**Taille : L** pour modèles/import ; **XL** pour conseils d’équipe robustes.

### 6.7 Un atelier de calcul relié aux configurations — X26 à X28

**Parcours.** Depuis un membre, ouvrir un scénario de combat prérempli : adversaire, niveau, terrain, météo, boosts et autres paramètres applicables. Enregistrer ce scénario avec une note de préparation.

**Profondeur.** Plages de dégâts, probabilité de K.-O. pour le scénario défini, ordre de vitesse sous plusieurs conditions, comparaison de répartitions et entraînement restant. Si les IV sont inconnus, produire un intervalle et proposer les observations qui le réduiraient. Les combats scénarisés sont révélés selon le réglage anti-spoiler.

Le moteur [Smogon Damage Calculator](https://github.com/smogon/damage-calc) expose des calculs paramétrés utilisables par une autre interface. Son intégration Expo reste à évaluer : poids, temps de calcul et correspondance des identifiants FR/EN. Un moteur de dégâts ne fournit pas à lui seul une probabilité de victoire.

**Acceptation.** Corpus de résultats de référence couvrant niveaux, talents, objets et interactions supportées ; modification de paramètre visible dans le résultat. Une nouvelle révision de format marque les scénarios anciens à revérifier.

**Taille : XL.** Commencer par des scénarios sauvegardés d’un système de combat précisément supporté.

### 6.8 Une chasse avec historique, préparation et acquisition — X29 à X32

**Parcours.** Choisir cible et forme, jeu, méthode et conditions. Démarrer une session ; compter les essais ; mettre en pause ; reprendre après fermeture. Consulter chaque segment et corriger une erreur sans modifier les autres.

**Profondeur.** Temps actif mesuré, phases avec trouvailles incidentes, incrément configurable, mode une main, note/photo facultative et journal des bonus. Un bonus limité dans le temps doit suivre une échéance persistante distincte du chronomètre de chasse. Fermer l’application ne doit pas inventer du temps de jeu actif.

[ShinyHunt](https://www.shinyhunt.com/) met déjà en avant temps, rencontres et collection ; [PokeTools](https://www.poketools.com/changelog) annonce phases, minuteries de session et export. L’amélioration recherchée est la continuité avec stock, recettes et exemplaires.

**Calcul.** Conserver la probabilité exacte ou ses paramètres plutôt qu’un dénominateur arrondi. Documenter l’unité de comptage. Pour une mécanique non indépendante ou insuffisamment documentée, garder le compteur et suspendre le résultat probabiliste.

**Acquisition.** Le bouton de trouvaille demande cible ou autre Pokémon, forme, origine et emplacement. L’opération unique clôt/segmente la chasse et crée l’exemplaire. Une annulation rétablit l’état cohérent.

**Acceptation.** Changement de bonus en cours de chasse sans réécriture des essais passés ; double validation sans doublon ; restauration intégrale des segments ; session en pause sans incrément positif ; œuf non assimilé automatiquement à une capture sauvage.

**Taille : L** pour journal ; **XL** pour couverture de nombreuses méthodes de chasse.

### 6.9 Des recettes choisies selon les ressources — X16, X31

**Parcours.** Choisir l’effet recherché dans un jeu supporté, indiquer les ingrédients à préserver et obtenir plusieurs recettes documentées compatibles avec son stock. Ajouter les manquants à une liste.

**Profondeur.** Version du jeu, substitutions vérifiées, coût, quantités, mode solo/coop si applicable, favoris et historique. La préparation peut ouvrir une session de chasse avec les conditions correspondantes après confirmation du joueur.

Le [Sandwich Simulator](https://github.com/cecilbowen/pokemon-sandwich-simulator) montre qu’une mécanique de recette mérite un outil propre. Commencer par un catalogue de recettes vérifiées est moins coûteux qu’un solveur universel. Notre périmètre initial proposé est Écarlate/Violet ; les autres systèmes culinaires nécessitent leurs propres règles.

**Acceptation.** La recette ne consomme les ressources qu’après validation. Une substitution inconnue n’est pas annoncée équivalente. Les préférences de conservation d’ingrédients sont respectées.

**Taille : L** pour catalogue lié au stock, **XL** pour solveur complet.

### 6.10 Un passeport et des collections spécialisées — X11, X12, X33, X36

**Parcours.** Ouvrir un individu pour retrouver son histoire déclarée, ses rubans/marques, ses objectifs d’origine et sa destination prévue. Préparer les étapes encore possibles avant un changement de jeu.

**Profondeur.** Collections d’origine, variantes, Balls et objectifs personnalisés ; prérequis par jeu ; distinctions obtenables, déjà acquises ou non vérifiées. Une propriété personnelle ne doit pas être confondue avec une caractéristique générale de l’espèce.

[Ribbons.Guide](https://ribbons.guide/) apporte une référence spécialisée ; le [guide officiel HOME](https://home.pokemon.com/en-us/move/) rappelle que les mouvements entre jeux ont des restrictions. Notre module doit guider les actions réalisées dans les outils officiels : aucune synchronisation de collection Nintendo n’a été établie pour ce projet.

**Acceptation.** Une destination inconnue reste non vérifiée. Le changement d’emplacement déclaré conserve l’origine. Un transfert prévu n’est jamais enregistré comme effectué avant confirmation.

**Taille : XL**, entretien documentaire élevé.

### 6.11 Des échanges préparés à partir des doublons — X14, X40

**Parcours.** Marquer des exemplaires « proposés à l’échange » et créer une liste « recherchés ». Partager un fichier ou une fiche, puis comparer une liste reçue pour trouver des correspondances.

**Profondeur.** Règles d’équivalence explicites : espèce, forme, shiny, Ball ou origine selon le besoin. Réserver un exemplaire à une proposition, protéger les favoris, préparer une liste de mouvements et confirmer chaque échange réalisé.

Les offres/recherches existent déjà chez [PokéPC](https://pokepc.net/faq?lang=en). Une première version locale de comparaison de listes est une proposition de périmètre pour notre app, pas une nouveauté revendiquée sur le marché.

**Acceptation.** Une offre exportée ne retire aucun exemplaire. Un individu réservé n’est pas proposé dans deux échanges confirmés. Partager une liste ne révèle pas les notes privées ni l’ensemble du carnet.

**Taille : M à L** pour fichier/fiche ; service de découverte de partenaires et modération séparés.

### 6.12 Modules supplémentaires avec porte d’entrée claire — X17, X21, X34 à X38

| Module | Première version utile | Condition nécessaire pour l’approfondir |
| --- | --- | --- |
| Reproduction | Compatibilité de parents saisis et étapes d’une capacité sur un jeu. | Vérifier les contraintes combinées, formes et transmission applicables ; la page [PokeTools Breeding](https://www.poketools.com/breeding) atteste une offre concurrente, pas l’exactitude de notre futur moteur. |
| Capture | Préparatifs et calculateur sur une version documentée. | Vérifier règles et correctifs ; l’[analyse des captures de génération IX](https://www.dragonflycave.com/mechanics/gen-ix-capturing/) montre la profondeur des paramètres. |
| Défi | Parties séparées, règles personnelles, rencontres et journal. | Préparer les combats avec les données de jeu vérifiées ; un membre retiré du défi n’est pas effacé de la collection générale. [Référence Nuzlify](https://github.com/chris-tela/nuzlocke-tracker-public). |
| Raids | Dossier de boss, choix de rôle et liste de préparation. | Moteur spécifique, disponibilité des membres, comportements scriptés et corpus ; [TeraRaidBuddy](https://github.com/Arkkandy/TeraRaidBuddy) illustre les paramètres nécessaires. |
| Événements | Liste sélectionnée manuellement avec source officielle et échéance. | Responsable de mise à jour, archive, fuseau et distinction entre événement actif et information périmée. Aucun code actif n’est promis par cette revue. |
| Import d’image | Prototype sur un type de capture d’écran volontairement fourni. | Mesurer les erreurs par champ sur FR/EN et plusieurs résolutions ; confirmation de tous les champs ambigus ; aucune preuve de possession ou de légitimité déduite de l’image. |

## 7. Une application très complète qui reste simple à utiliser

### 7.1 Navigation proposée

Quatre espaces suffisent pour accueillir ces fonctions :

- **Explorer** : recherche globale, fiches, objets, talents, capacités et lieux.
- **Ma partie** : progression, objectifs, sortie prévue, ressources et chasse active.
- **Collection** : exemplaires, boîtes, projets, rubans, offres et recherches.
- **Équipes** : configurations, préparation, comparaison, entraînement et scénarios.

Le sélecteur de partie reste visible et les outils secondaires s’ouvrent depuis leur usage. Par exemple, une recette s’ouvre depuis la préparation d’une chasse ; un calcul de dégâts depuis un membre ; un transfert depuis un exemplaire. Une bibliothèque d’outils permet aussi l’accès direct.

L’accueil devient personnalisable : le chasseur choisit compteur et sessions, le collectionneur manquants et boîtes, le joueur d’aventure prochaine sortie et équipe. Ce choix adapte l’ordre d’affichage sans enfermer le joueur dans un profil.

### 7.2 Profondeur progressive

**Vue simple :** les données indispensables et une action principale. **Détails :** paramètres, hypothèses, variantes et sources. Le lecteur peut toujours passer d’un niveau à l’autre.

Une fiche de Pokémon pourrait afficher en premier : jeu actif, disponibilité connue, possession, méthode d’obtention et boutons « préparer », « comparer » ou « enregistrer ». Le modèle 3D, les grandes illustrations et les détails encyclopédiques viennent enrichir la consultation sans retarder la réponse.

Les noms FR/EN doivent se résoudre vers les mêmes identifiants. Le lexique explique les termes rencontrés dans les équipes importées. Chaque contrôle iconographique essentiel porte un libellé accessible ; les tableaux ont une lecture en liste ; textes agrandis et mouvement réduit font partie du périmètre mobile à vérifier.

### 7.3 Caractéristiques créatives à privilégier

1. **Dossier de terrain** : une fiche relie le Pokémon, les variantes, les conditions et les exemplaires du joueur.
2. **Plan de préparation** : les étapes rendent visible ce qui est déjà prêt, ce qui manque et pourquoi une alternative existe.
3. **Passeport** : un individu devient une histoire personnelle, avec notes, obtentions et accomplissements choisis.
4. **Comparaison des conséquences** : remplacer un membre montre précisément les besoins couverts, perdus et le travail supplémentaire.
5. **Fiche partageable** : une équipe, une sortie ou une trouvaille porte un contexte compréhensible, une source de données et les informations que le joueur choisit de montrer.

Ces directions reprennent l’intention de carnet/terminal personnel de l’app. Leur valeur doit être testée sur téléphone ; elles ne constituent pas une note esthétique ni une supériorité établie.

## 8. Architecture et données nécessaires à cette polyvalence

### 8.1 Un modèle partagé

| Entité proposée | Responsabilité | Exemples de consommateurs |
| --- | --- | --- |
| `GameProfile` / `RuleRevision` | Décrire version, règles, variantes supportées et couverture. | Fiches, captures, capacités, calculs. |
| `Playthrough` | Partie du joueur, extensions, progression, accès et spoilers. | Objectifs, rencontres, équipe, défis. |
| `Species` / `Form` | Identités stables et relations ; transformations distinguées des formes conservables. | Recherche, collection, comparateur, import. |
| `Specimen` | Individu possédé, origine, emplacement et attributs déclarés. | Collection, équipe, rubans, échanges. |
| `DexRegistration` / `CollectionProject` | Historique d’enregistrement et objectifs de complétion séparés. | Progression, manquants, boîtes prévues. |
| `Build` / `Team` | Configuration théorique ou associée à un exemplaire. | Couverture, calcul, préparation, partage. |
| `Stock` / `Reservation` / `Recipe` | Disponibilité et consommation des ressources. | Objectifs, fabrication, entraînement, recettes. |
| `Goal` / `Task` / `Prerequisite` | Graphe de préparation avec alternatives et blocages. | Accueil, sortie, équipe, chasse. |
| `HuntSession` / `HuntSegment` | Temps actif, essais, contexte et historique. | Compteur, probabilité, trouvaille, export. |
| `PersonalEvent` | Mutation identifiée, références et informations nécessaires à l’annulation. | Fiabilité, journal, reprise, future synchronisation. |
| `SourceRecord` | Source, date, périmètre et révision d’un fait/règle. | Explications, corrections, disponibilité des modules. |

Cette structure évite qu’une boîte, une équipe et une chasse créent trois identités incompatibles pour le même exemplaire.

### 8.2 Données utilisables et limites

| Source ou brique | Usage envisagé | Ce qu’elle ne garantit pas |
| --- | --- | --- |
| [PokéAPI](https://pokeapi.co/docs/v2) | Identifiants, noms, fiches, apprentissages, objets et relations selon les champs disponibles ; cache local conforme à sa politique. | Un schéma exposé n’est pas une preuve de couverture complète d’un jeu, de ses lieux ou de ses règles. |
| [Showdown : formats d’équipe](https://github.com/smogon/pokemon-showdown/blob/master/sim/TEAMS.md) | Interopérabilité des configurations. | Possession, origine d’un exemplaire et validation complète de toute chaîne d’obtention. |
| [Smogon Damage Calculator](https://github.com/smogon/damage-calc) | Calculs avec moteur et données de génération explicitement choisis. | Tout système de combat Pokémon, toute règle de raid ou victoire contre un adversaire. |
| Corpus éditorial interne | Lieux précis, restrictions, recettes, combats, méthodes de chasse et conditions d’accès. | Maintenance automatique : il faut un responsable, une source, des cas de référence et des révisions. |
| Sources officielles Pokémon | Fonctions HOME, annonces de jeux et événements. | Accès automatisé aux collections d’un compte ou API tierce implicite. |
| Pages de concurrents | Vérifier l’existence d’un besoin traité et comparer des parcours. | Droit de recopier textes, visuels, cartes ou bases de données. |

Le README du calculateur Smogon annonce une licence MIT, tandis que Ribbons.Guide annonce GPL-3.0 pour son contenu/code original. Ce sont des indications techniques des auteurs, pas un avis juridique sur une intégration complète. Il faudra examiner les composants et les droits des données/visuels séparément avant réutilisation. [Smogon](https://github.com/smogon/damage-calc), [Ribbons.Guide](https://github.com/SlyAceZeta/Ribbons.Guide).

### 8.3 Stockage et packs

Le projet utilise Expo SDK 54. SQLite est une piste pour les relations entre données, transactions et recherches locales. Sa documentation SDK 54 indique que la base persiste après redémarrage ; elle signale aussi un support web en alpha nécessitant une configuration WASM et des en-têtes particuliers. Il faut donc valider une stratégie mobile/web avant de migrer. [Documentation Expo](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/).

Contrat proposé pour un pack : jeu, périmètre, révision de règles, date, taille, empreinte et disponibilité des images. Une mise à jour valide le nouveau contenu avant activation ; l’ancien reste utilisable si elle échoue. Les données personnelles sont indépendantes du nettoyage des packs.

Le projet ne doit pas attendre une migration complète pour corriger Q01–Q05. Stabiliser le stockage actuel et disposer d’un export global sont des travaux distincts de l’optimisation future.

### 8.4 Distinguer les systèmes de jeu

Les sources officielles décrivent des combats en temps réel pour Légendes Z-A et un système de préparation par entraînement propre à Champions. Ces exemples justifient une architecture par règles de jeu, même quand des Pokémon ou capacités portent les mêmes noms. [Légendes Z-A](https://legends.pokemon.com/en-gb/news/z-a-battle-club), [Champions](https://champions.pokemon.com/en-us/pokemon/).

Le sélecteur local actuel comprend surtout des jeux allant jusqu’à Écarlate/Violet, sans profils Z-A ou Champions. La couverture de nouveaux titres représente donc une piste de mise à niveau à étudier, pas une extension automatiquement correcte grâce à PokéAPI.

**Choix recommandé :** prendre Écarlate ou Violet comme jeu pilote initial, parce que leurs profils existent déjà et qu’ils permettent de relier collection, équipe, ressources et chasse. Étudier ensuite la demande pour Z-A, Champions et les jeux plus anciens. La sélection d’un second pilote dépendra du public observé et de la qualité des données accessibles.

### 8.5 Ce qui fonctionne localement et ce qui demande davantage

| Niveau | Modules concernés | Engagement supplémentaire |
| --- | --- | --- |
| Local avec données embarquées | Parties, boîtes, projets, équipes, inventaire, journal, compteurs, partage de fichiers. | Schémas, migrations, import/export et tests sur appareil. |
| Local avec corpus de règles | Plans, recherche avancée, calculs, recettes, combats et restrictions. | Corpus validé, index et entretien par jeu. |
| Service maintenu | Synchronisation multiappareil, partage par liens persistants, mises à jour d’événements. | Comptes facultatifs, conflits, sauvegarde serveur et exploitation. |
| Intégration native/prototype | Reconnaissance d’écran, widgets, commandes matérielles ou tâches d’arrière-plan. | Étude spécifique des plateformes et validation du build Expo ; rien n’est garanti dans Expo Go par défaut. |

La synchronisation peut devenir utile après l’export global. Elle doit résoudre les conflits entre deux appareils ; un simple écrasement par la dernière sauvegarde ferait perdre des actions hors ligne.

## 9. Ordre de réalisation recommandé

Cette séquence R0–R6 approfondit les lots A–F et prépare certaines extensions du lot G. Les tailles M/L/XL décrivent la portée relative, pas une estimation calendaire. L’effort éditorial peut dépasser l’effort d’interface.

| Incrément | Contenu | Dépendances | Taille / entretien | Critère de sortie |
| --- | --- | --- | --- | --- |
| R0 — Données fiables | Q01–Q05 ; X03–X04 ; confirmation web/mobile ; sauvegarde globale. | Aucun nouveau corpus de jeu. | L / faible à moyen | Créer, corriger, fermer, restaurer ; aucun doublon ni perte sur les scénarios couverts. |
| R1 — Partie et collection | X01, X09–X13, premières préférences X22/X39. | R0 ; identités de formes. | L / moyen | Plusieurs parties, projet à périmètre stable, boîtes et changements d’individu correctement suivis. |
| R2 — Recherche et encyclopédie complètes sur un pilote | X02, X05–X08, X20 ; corpus des objets/rencontres/évolutions. | R1 ; pipeline de données. | XL / élevé | Parcours d’obtention couvert après démarrage à froid hors ligne ; cas inconnus explicites. |
| R3 — Préparation utile | X15–X16, X18–X19, X23–X25. | R1–R2 ; objets et quantités. | XL / élevé | Importer une équipe, choisir un remplaçant et obtenir une liste de préparation sans ressaisie. |
| R4 — Chasse experte | X29–X32 ; lien collection et ressources. | R0–R3 pour le parcours complet ; X29 peut commencer après R0. | L à XL / élevé | Une chasse multi-session avec bonus changeants survit à une restauration et se termine en un exemplaire correct. |
| R5 — Outils experts ciblés | X17, X21, X26–X28, X33–X34 selon essais utilisateurs. | Configurations et règles validées. | XL / élevé | Résultats de référence et parcours validés pour le module annoncé. |
| R6 — Extensions et circulation des données | X14, X35–X38, partage distant/synchronisation ; extension à d’autres jeux. | Modèles stables et maintenance définie. | L à XL / élevé à très élevé | Compatibilité, conflits et actualité des données vérifiés ; module utile à un public identifié. |

X39 et X40 accompagnent les incréments concernés. Le partage local d’équipes/listes et la première version de X14 peuvent arriver avant R6 ; cette dernière étape concerne surtout les services distants et la couverture experte étendue.

### Les dix premiers chantiers concrets

1. Stabiliser les lectures/écritures de persistance et bloquer les mutations avant chargement lorsque nécessaire.
2. Remplacer les confirmations incompatibles web ; vérifier « Trouvé ! », suppression et annulation sur web et mobile.
3. Rendre l’acquisition de chasse idempotente et récupérable, avec forme et origine correctement renseignées.
4. Exporter/importer l’ensemble du carnet avec aperçu, migration de l’ancien format et collisions traitées.
5. Introduire plusieurs parties du même jeu et déplacer progressivement les références personnelles vers ces parties.
6. Séparer enregistrement au Pokédex, possession et objectif de collection.
7. Livrer l’éditeur d’exemplaire complet, filtres et premières opérations de masse avec annulation.
8. Ajouter les équipes nommées/configurations et un import Showdown contrôlé.
9. Constituer le corpus d’un jeu pilote avec objets, capacités, acquisition et cas de référence, puis son premier pack hors ligne.
10. Construire la liste de préparation commune aux évolutions et capacités, avec stock, quantités et réservations.

Ce programme produit une version nettement plus complète avant d’entreprendre un module raid, un service communautaire ou un système de reconnaissance d’images.

## 10. Ce que je garderais en option

- **TCG, prix de cartes et collection de cartes** : autre modèle d’objets, autre actualité et autre public ; une intégration future éventuelle ne doit pas retarder le compagnon des jeux vidéo.
- **Suite complète Pokémon GO, Unite, Sleep ou mods** : systèmes propres ; proposer éventuellement des passerelles ciblées, puis décider d’un module autonome si la demande est réelle.
- **Chatbot généraliste** : commencer par la recherche et les explications fondées sur les règles de l’app ; une couche conversationnelle n’est utile que si elle conserve les sources, paramètres et actions inspectables.
- **Fil social, classements et badges de connexion** : coût de service et de modération ; le partage de listes et de configurations apporte déjà une circulation utile.
- **Lecture automatique du compte Nintendo/HOME** : aucune intégration tierce utilisable n’a été établie dans cette recherche. Le carnet reste déclaratif tant qu’une interface autorisée et documentée n’est pas identifiée.
- **Détection automatique universelle des shiny par caméra** : prototype seulement après mesure d’erreurs ; les variations d’éclairage, d’animation et de forme imposent une validation spécifique.

Ces choix définissent une frontière cohérente avec l’app de base. Ils peuvent évoluer avec les besoins observés.

## 11. Comment prouver l’utilité et la qualité

### 11.1 Parcours de référence

| Profil | Tâche à observer | Réussite attendue |
| --- | --- | --- |
| Joueur d’aventure | Préparer l’obtention d’un Pokémon dans sa partie. | Jeu, accès et méthode corrects ; inconnues identifiées ; reprise possible. |
| Collectionneur | Évoluer un doublon et trouver les manquants d’un Living Dex. | Historique d’enregistrement conservé ; possession et périmètre recalculés correctement. |
| Joueur d’équipe | Importer une équipe et préparer un remplaçant possédé. | Contexte préservé ; import expliqué ; capacités/ressources correctement reliées. |
| Chasseur | Modifier un bonus, fermer l’app puis enregistrer une trouvaille. | Anciens essais inchangés ; durée explicable ; bon exemplaire créé une fois. |
| Joueur mobile | Préparer une sortie sans réseau. | Recherche et informations promises disponibles au démarrage ; images manquantes non bloquantes. |
| Utilisateur changeant d’appareil | Restaurer une sauvegarde globale. | Même progression et mêmes références ; champs ignorés ou conflits explicités. |

### 11.2 Tests qui manquent au-delà des fonctions pures

- Persistance : données présentes au montage, lecteur stable, écritures rapprochées, erreur de lecture, refus d’écrasement involontaire et restauration.
- Acquisition : double pression, interruption entre chasse et exemplaire, annulation, suppression ultérieure d’un exemplaire lié.
- Collection : même espèce avec plusieurs formes ; individus distincts ; import avec collision d’identifiant ; évolution suivie puis annulée.
- Ressources : quantité insuffisante, réservations concurrentes, objet réutilisable, consommation terminée et annulation.
- Règles : combinaisons de capacités, interactions de talents, changement de jeu et de version de corpus.
- Interface : confirmation sur web, grands textes, clavier, lecteur d’écran, petit écran, reprise après suspension sur Android/iOS.
- Hors ligne : fermeture complète, pack installé/absent/partiel, mise à jour interrompue et conservation des données personnelles.

### 11.3 Mesures utiles

Mesurer sur des tâches identiques : réussite correcte, temps, ressaisies, retours en arrière, besoin de consulter un autre outil, compréhension d’un blocage et récupération après erreur.

Sur le plan technique, définir les appareils et jeux de données avant de fixer des objectifs de latence ou de taille. Une réussite sur ordinateur ne démontre pas la fluidité mobile. Une vingtaine de calculs exacts ne prouve pas une génération entière.

Pour choisir entre rubans, défis et combats avancés, utiliser de petits groupes exploratoires de joueurs concernés. Comparer des prototypes de niveau comparable ; aucun chiffre de rétention ou d’installation n’est prédit dans cette revue.

## 12. Registre des sources sélectionnées

Consultées le 1er octobre 2026. Les résumés ci-dessous indiquent leur rôle, pas une certification de leurs données. Les références locales sont regroupées en section 3.2.

| Source | Rôle et limite |
| --- | --- |
| [ProDex — App Store](https://apps.apple.com/us/app/prodex-complete-game-guide/id1485409731) | Description produit, changelog et avis qualitatifs ; application non testée ici. |
| [dataDex — Google Play](https://play.google.com/store/apps/details?id=com.talzz.datadex) | Modèle d’équipe et index annoncés ; couverture non mesurée. |
| [Prokedex — éditeur](https://www.prokedex.com/en/index.html) | Étendue des rubriques ; aucune revendication marketing de supériorité reprise comme un fait. |
| [PokéPC — accueil](https://pokepc.net/) | Organisation et partage annoncés. |
| [PokéPC — FAQ](https://pokepc.net/faq?lang=en) | Distinctions fonctionnelles et modes de suivi. |
| [PokéPC — roadmap](https://pokepc.net/roadmap?page=3) | Demandes publiques ; statut prévu distinct du livré. |
| [PokeTools — accueil](https://www.poketools.com/) | Largeur des outils ; quantité annoncée non utilisée pour classer les concurrents. |
| [PokeTools — About](https://www.poketools.com/about) | Méthode de données annoncée et comparaison avec l’accueil. |
| [PokeTools — changelog](https://www.poketools.com/changelog) | Évolutions datées annoncées ; pas de validation indépendante de l’exactitude. |
| [PokeTools — reproduction](https://www.poketools.com/breeding) | Existence d’outils spécialisés. |
| [PokeTools — CT/CS](https://www.poketools.com/tm-advisor) | Exemple de consultation par version. |
| [Pikalytics — équipes](https://www.pikalytics.com/team) | Construction, usage et partage ; dates/format nécessaires pour interpréter les suggestions. |
| [Smogon — Damage Calculator](https://github.com/smogon/damage-calc) | Moteur, paramètres et licence annoncée. |
| [Showdown — format des équipes](https://github.com/smogon/pokemon-showdown/blob/master/sim/TEAMS.md) | Référence primaire d’interopérabilité. |
| [ShinyHunt](https://www.shinyhunt.com/) | Compteur, temps et collection annoncés ; à distinguer des autres services au nom voisin. |
| [Pokétch](https://www.poketchapp.com/) | Information de maintenance et orientation vers le produit successeur. |
| [Ribbons.Guide](https://ribbons.guide/) | Référence de suivi de rubans. |
| [Ribbons.Guide — dépôt](https://github.com/SlyAceZeta/Ribbons.Guide) | Stockage, sauvegarde et licence documentés par l’auteur. |
| [Nuzlocke Tracker / Nuzlify — dépôt](https://github.com/chris-tela/nuzlocke-tracker-public) | Fonctions annoncées et périmètre de jeux. |
| [MapGenie Paldea — App Store](https://apps.apple.com/us/app/mapgenie-paldea-map/id6446167078) | Catégories cartographiques et suivi. |
| [Pokémon Database — recherche de capacités](https://pokemondb.net/tools/moveset-search) | Recherche croisée existante ; exactitude de toutes les combinaisons non testée. |
| [Sandwich Simulator — dépôt](https://github.com/cecilbowen/pokemon-sandwich-simulator) | Outil de recettes spécialisé, publié par son auteur. |
| [TeraRaidBuddy — dépôt](https://github.com/Arkkandy/TeraRaidBuddy) | Paramètres et portée d’un calculateur de raids. |
| [Serebii — CT Écarlate/Violet](https://www.serebii.net/scarletviolet/tm.shtml) | Référence éditoriale à recouper pour localisation et fabrication. |
| [The Cave of Dragonflies — captures IX](https://www.dragonflycave.com/mechanics/gen-ix-capturing/) | Analyse spécialisée des paramètres et corrections de mécanique. |
| [Pokémon HOME — mouvements](https://home.pokemon.com/en-us/move/) | Restrictions officielles ; aucune API tierce déduite. |
| [Légendes Z-A — Battle Club](https://legends.pokemon.com/en-gb/news/z-a-battle-club) | Particularité du système de combat, source officielle. |
| [Pokémon Champions — Pokémon et entraînement](https://champions.pokemon.com/en-us/pokemon/) | Particularité de la préparation, source officielle ; valeurs de règles non extrapolées. |
| [PokéAPI — documentation v2](https://pokeapi.co/docs/v2) | Schéma et politique de cache ; pas une garantie d’exhaustivité. |
| [Expo SQLite — SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/) | Piste de stockage et contraintes web. |
| [React — useEffect](https://react.dev/reference/react/useEffect) | Interprétation de la dépendance de désérialisation observée dans le code. |
| [Témoignage : perte d’accès à des compteurs](https://www.reddit.com/r/ShinyPokemon/comments/1wabusj/talk_lost_the_app_with_all_my_shiny_hunting/) | Signal qualitatif unique, non représentatif. |

## 13. Décision produit proposée

L’objectif ambitieux est une couverture progressive de l’ensemble du parcours **consulter → obtenir → conserver → préparer → utiliser → partager**, avec des modules experts adaptés au jeu et au joueur.

La prochaine étape recommandée est R0, puis une tranche R1/R2 qui rende les parties, collections et recherches fiables et persistantes. Les 40 fonctions constituent une cible de produit et un portefeuille priorisé ; elles ne sont ni toutes livrées ni toutes à développer simultanément.

Cette recherche modifie uniquement les documents de réflexion. Les corrections identifiées et les nouvelles fonctionnalités restent à implémenter dans les prochains incréments.
