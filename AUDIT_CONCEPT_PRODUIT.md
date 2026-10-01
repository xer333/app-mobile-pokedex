# Audit du concept produit et créatif

Date de l'audit : 30 septembre 2026

> Revue approfondie disponible : [AUDIT_FONCTIONNEL_APPROFONDI.md](AUDIT_FONCTIONNEL_APPROFONDI.md). Elle précise les constats dans le code, corrige les appréciations trop fortes de cette première analyse et détaille les fonctionnalités, leurs dépendances et critères de qualité. En cas de divergence sur les priorités, cette nouvelle revue fait référence.

## Objet de ce document

Ce document analyse le concept réel de l'application, son potentiel d'attractivité, sa capacité à donner envie de l'installer puis de l'utiliser régulièrement, ainsi que ses qualités créatives.

L'analyse repose sur :

- les parcours et fonctionnalités présents dans le projet ;
- une comparaison avec plusieurs applications Pokédex actuellement distribuées ;
- les fonctionnalités mises en avant par Pokémon HOME ;
- des retours publics d'utilisateurs ;
- les recommandations officielles d'Apple et Google pour les fiches de store ;
- les contraintes de propriété intellectuelle liées à une application non officielle.

Les données de stores et les fonctionnalités concurrentes peuvent évoluer après la date de cet audit.

## Verdict général

Le code montre une intention visuelle travaillée, mais sa promesse produit n'est pas encore assez précise. La qualité du rendu et sa comparaison avec d'autres applications restent à vérifier sur appareils.

Aujourd'hui, elle peut être comprise comme plusieurs produits à la fois :

- une encyclopédie Pokémon ;
- un atlas géographique ;
- un outil d'attaques et d'évolutions ;
- un gestionnaire de favoris ;
- une équipe de six Pokémon ;
- un comparateur ;
- un tableau de bord personnel ;
- les restes d'une idée de combats en direct dans les données du projet.

Chaque élément est intéressant, mais l'ensemble ne dit pas encore clairement pourquoi l'utilisateur devrait choisir cette application plutôt qu'un Pokédex plus complet déjà installé par des centaines de milliers de personnes.

La meilleure évolution du concept serait :

> Un compagnon de terrain francophone, beau, rapide et utilisable hors ligne, qui suit l'aventure du joueur, l'aide à compléter son Pokédex et lui recommande comment améliorer son équipe.

La base de données devient alors le moyen, pas le produit. Le produit est la progression personnelle du dresseur.

## Le marché actuel

### dataDex

[dataDex sur Google Play](https://play.google.com/store/apps/details?id=com.talzz.datadex) dépasse le million de téléchargements et met en avant :

- toutes les générations et les jeux principaux ;
- un fonctionnement hors ligne ;
- un constructeur d'équipe avec analyse des statistiques, faiblesses et couverture des attaques ;
- des Pokédex dédiés aux lieux, attaques, talents, objets, types et natures ;
- les favoris et une checklist des Pokémon capturés ;
- plusieurs langues, dont le français.

Le signal important n'est pas seulement la quantité de données : l'application transforme ces données en outils de décision.

### ProDex

[ProDex sur l'App Store](https://apps.apple.com/us/app/prodex-complete-game-guide/id1485409731) se positionne comme un compagnon complet et hors ligne. Il met notamment en avant :

- un mode Pokédex national ou propre à un jeu ;
- le suivi des captures et des shinies ;
- un constructeur d'équipe pour le compétitif ou l'aventure ;
- l'analyse des faiblesses et des statistiques de toute l'équipe ;
- des filtres avancés ;
- les lieux, capacités, talents, objets, champions et raids ;
- le partage d'équipes et de stratégies.

Son avantage marketing est clair : il accompagne à la fois le collectionneur et le joueur qui prépare une équipe.

### MasterDex

[MasterDex sur l'App Store](https://apps.apple.com/us/app/masterdex-complete-guide/id1621464261) met en avant :

- le fonctionnement hors ligne ;
- l'absence de compte obligatoire ;
- les formes alternatives et évolutions spéciales ;
- le suivi des shinies ;
- le team builder ;
- les objets, capacités, talents, natures et lieux ;
- des informations TCG.

Certains avis visibles suggèrent deux pistes à approfondir auprès des utilisateurs :

1. les données doivent réellement s'adapter au jeu sélectionné ;
2. un achat permanent peut convenir à certains utilisateurs d'un outil utilitaire ; ces témoignages ne suffisent pas à établir une préférence générale face à l'abonnement.

### Pokémon HOME

La version mobile de [Pokémon HOME](https://home.pokemon.com/fr-fr/features/) offre un guide contenant les entrées Pokédex, types, tailles, formes, talents et capacités apprises. Elle enregistre également des Pokédex propres aux différents jeux.

Une application non officielle ne doit donc pas seulement reproduire une fiche encyclopédique. Elle doit apporter une expérience plus claire, plus personnalisée ou plus agréable que les outils officiels.

### Attentes exprimées par les utilisateurs

Les retours publics consultés font revenir les mêmes demandes :

- voir immédiatement ce qui manque dans une collection ;
- suivre les Pokémon capturés, possédés, shinies et formes ;
- disposer de données spécifiques au jeu en cours ;
- trouver où capturer un Pokémon et à quel niveau ;
- construire et analyser une équipe ;
- accéder rapidement à l'information sans quitter le jeu longtemps ;
- avoir une interface propre, rapide et mobile ;
- éviter un compte obligatoire pour un simple outil local.

Un [échange Reddit récent sur les trackers Pokédex](https://www.reddit.com/r/pokemongo/comments/1vdn9z4/goto_pokedex_appsite/) insiste précisément sur une vue plus propre de ce qui est acquis et manquant. Un autre [échange consacré aux applications Pokédex](https://www.reddit.com/r/pokemon/comments/153o2jy/which_is_the_bestmost_complete_pokedex_app/) cite le suivi par jeu, l'équipe, les captures et les filtres comme besoins centraux.

Ces retours ne constituent pas une étude quantitative, mais ils confirment les promesses choisies par les applications les mieux installées.

## Ce que l'application actuelle fait déjà bien

### Une direction artistique reconnaissable

Le projet ne ressemble pas à une simple table de données. Il possède déjà :

- un univers sombre et premium ;
- des cartes colorées adaptées aux Pokémon ;
- de grandes illustrations héroïques ;
- une navigation centrale inspirée d'une Poké Ball ;
- un atlas régional ;
- des animations et des transitions ;
- un tableau de bord personnel ;
- une sensation de terminal ou d'appareil de dresseur.

Ce langage visuel est le meilleur atout du produit. Il peut permettre de se différencier des applications très complètes mais souvent plus fonctionnelles qu'émotionnelles.

### Une bonne base de personnalisation

Le profil, les favoris, l'équipe, l'activité récente, la reprise et la comparaison créent déjà une première couche personnelle.

Le dashboard ne se contente pas d'afficher des raccourcis : il cherche à montrer « mon » historique et « mes » collections. Cette direction est pertinente et devrait devenir le cœur du produit.

### Une dimension géographique originale

La séparation entre :

- l'atlas des rencontres ;
- les cartes régionales ;
- les villes et lieux ;

est plus ambitieuse qu'un Pokédex classique. Cette idée peut devenir une vraie signature si les cartes sont exactes, utiles et clairement reliées à une version de jeu.

### Une approche francophone

Une expérience réellement pensée en français, avec les noms, attaques, talents, lieux et conditions d'évolution correctement traduits, peut être une différenciation concrète. Elle doit cependant être présentée comme une promesse de qualité, pas seulement comme une traduction automatique de données.

## Ce qui affaiblit actuellement le concept

### Une promesse trop diffuse

L'utilisateur ne sait pas immédiatement si l'application sert principalement à :

- apprendre ;
- compléter une collection ;
- jouer à une version précise ;
- construire une équipe ;
- explorer des cartes ;
- regarder des combats.

Les constantes `liveBattleCards` et `upcomingBattleCards` suggèrent par exemple une ancienne idée de diffusion de combats, mais cette promesse n'existe pas réellement dans le produit.

Il faut supprimer les pistes abandonnées et concentrer toute la présentation sur trois verbes :

1. explorer ;
2. progresser ;
3. préparer.

### Des fonctions personnelles encore trop superficielles

- Un favori n'a qu'un état binaire.
- Une équipe est seulement une liste de six Pokémon.
- Le comparateur est un parcours caché en deux étapes.
- Il n'existe pas de statut « vu », « capturé », « possédé », « shiny » ou « forme obtenue ».
- Il n'existe pas de progression par jeu ou région.
- Il n'existe pas d'objectif ou de prochaine action.

Ces fonctions ne produisent donc pas encore une raison forte de revenir chaque semaine.

### Les données ne sont pas centrées sur le jeu en cours

Le même Pokémon peut avoir des attaques, types historiques, lieux, objets et méthodes d'évolution différents selon les jeux. Les avis de concurrents montrent que des données mélangées entre générations obligent les joueurs à vérifier ailleurs.

L'application doit demander « À quel jeu joues-tu ? » et adapter :

- le Pokédex régional ;
- les lieux et taux de rencontre ;
- les attaques disponibles ;
- les CT et méthodes d'apprentissage ;
- les évolutions ;
- les formes ;
- les exclusivités de version ;
- l'analyse de l'équipe.

### L'atlas promet plus de précision qu'il n'en possède

Les marqueurs de rencontres sont actuellement décoratifs et non géographiques. Une belle carte qui place mal un lieu détériore davantage la confiance qu'une liste exacte.

Le concept doit privilégier l'exactitude : zone, méthode, niveau, version et fréquence. Une carte ne doit être utilisée que si elle apporte une vraie information spatiale.

### Le nom interne `PokeNav` nécessite une vérification de disponibilité

Le PokéNav et le PokéNav Plus sont déjà des appareils officiels des jeux Rubis, Saphir et leurs remakes. Le [site officiel Pokémon présente le PokéNav Plus](https://www.pokemon.com/us/pokemon-video-games/pokemon-omega-ruby-and-pokemon-alpha-sapphire) comme l'outil de navigation du dresseur.

L'usage officiel identifié justifie une recherche de disponibilité et de risque de confusion avant de retenir `PokeNav` comme identité publique. Cet audit ne constitue pas une recherche complète de marques et ne permet pas de conclure à lui seul à l'indisponibilité juridique du nom.

## Positionnement recommandé

### Promesse principale

> Le compagnon personnel qui transforme toutes les données Pokémon en prochaine action utile.

### Proposition de valeur longue

> Choisis ton jeu, suis ce que tu as capturé, découvre ce qu'il te manque, trouve où l'obtenir et construis une équipe équilibrée — en français, rapidement et hors ligne.

### Les trois piliers

#### 1. Explorer

- Recherche immédiate.
- Fiches complètes et lisibles.
- Formes, évolutions, attaques et talents.
- Comparaison claire.
- Carte ou liste de lieux fiable.

#### 2. Progresser

- Pokédex propre à chaque jeu.
- Statuts vu, capturé, possédé et shiny.
- Suivi des formes.
- Pourcentage de complétion.
- Objectifs personnels et listes de chasse.
- Recommandation de la prochaine capture possible.

#### 3. Préparer

- Équipes sauvegardées.
- Analyse des faiblesses communes.
- Couverture offensive.
- Rôles et statistiques.
- Capacités compatibles avec le jeu choisi.
- Suggestions compréhensibles, sans prétendre remplacer un simulateur compétitif complet.

## Public cible recommandé

### Cible principale : joueur d'une aventure Pokémon

Il joue actuellement à un jeu principal et veut trouver rapidement :

- où capturer un Pokémon ;
- comment le faire évoluer ;
- quelles attaques il peut apprendre dans cette version ;
- si son équipe possède une faiblesse importante ;
- ce qui manque dans son Pokédex régional.

### Cible secondaire : collectionneur

Il souhaite suivre :

- son Pokédex national ;
- son Living Dex ;
- ses shinies ;
- ses formes régionales ou alternatives ;
- ses objectifs de chasse.

### Cible tertiaire : fan curieux

Il aime découvrir un Pokémon, une région, une anecdote ou tester ses connaissances sans nécessairement jouer à une version précise.

### Cible à ne pas viser immédiatement

Le joueur compétitif expert utilise déjà des outils spécialisés très complets. L'application peut lui fournir une analyse simple, mais chercher immédiatement à remplacer les simulateurs et bases compétitives diluerait le produit.

## Expérience de démarrage idéale

L'onboarding devrait durer moins d'une minute.

### Écran 1 — Mon aventure

Question : « À quel jeu joues-tu en ce moment ? »

L'utilisateur peut choisir un jeu ou « Pokédex national ».

### Écran 2 — Mon objectif

Choix possibles :

- compléter mon Pokédex ;
- construire mon équipe ;
- chasser les shinies ;
- simplement explorer.

### Écran 3 — Mon point de départ

- commencer vide ;
- sélectionner rapidement les Pokémon déjà capturés ;
- importer un fichier de sauvegarde de l'application si cette fonction existe plus tard.

Aucun compte ne devrait être imposé. La synchronisation cloud peut être proposée plus tard comme option.

## Dashboard recommandé

Le tableau de bord doit répondre à la question « Que puis-je faire maintenant ? ».

Ordre conseillé :

1. aventure active et progression globale ;
2. prochaine action utile ;
3. équipe active et alerte principale ;
4. recherche rapide ;
5. chasses ou objectifs en cours ;
6. derniers Pokémon consultés ;
7. découverte ou quiz du jour.

Exemple :

```text
Pokémon Écarlate — Paldea
184 / 400 capturés — 46 %

Prochaine étape
3 Pokémon non capturés sont disponibles dans la Zone Sud n° 3

Mon équipe
Faiblesse commune : Sol × 3

Objectif actif
Faire évoluer Charbambin
```

Cette page serait beaucoup plus utile qu'une simple grille de modules.

## Fonctionnalités à développer en priorité

### Priorité 1 — Motifs d'installation

#### Mode par jeu

La sélection d'un jeu doit transformer toutes les informations de l'application. C'est probablement la fonctionnalité la plus importante pour concurrencer les références existantes.

#### Checklist complète

Pour chaque espèce et forme :

- vu ;
- capturé ;
- actuellement possédé ;
- shiny obtenu ;
- favori ;
- quantité facultative ;
- note personnelle facultative.

#### Progression visible

- pourcentage par jeu ;
- pourcentage par région ;
- progression Living Dex ;
- progression shiny ;
- formes manquantes ;
- exclusivités de l'autre version.

#### Vrai constructeur d'équipe

L'équipe actuelle doit devenir un outil :

- plusieurs équipes nommées ;
- jeu et format associés ;
- analyse des faiblesses et résistances ;
- couverture de types ;
- statistiques moyennes ;
- rôles simples ;
- attaques, talents et objets ;
- suggestions expliquées.

#### Hors ligne réel

Le fonctionnement hors ligne est un argument commercial central chez dataDex, ProDex et MasterDex. Il doit devenir une promesse visible et tenue.

### Priorité 2 — Motifs de retour

#### Objectifs et chasses

L'utilisateur peut épingler un objectif :

- capturer un Pokémon ;
- obtenir un shiny ;
- compléter une famille d'évolution ;
- terminer une région ;
- construire une équipe.

L'accueil rappelle l'objectif sans notification agressive.

#### Prochaine action intelligente

À partir du jeu actif et de la collection :

- Pokémon manquants dans la zone choisie ;
- évolutions immédiatement réalisables ;
- formes accessibles ;
- faiblesse principale de l'équipe ;
- objectif presque terminé.

Cette fonction serait une vraie différenciation : les données deviennent une décision.

#### Quiz ou découverte quotidienne

Une silhouette ou quelques indices pourraient créer une visite courte et régulière. [Ketchup sur l'App Store](https://apps.apple.com/au/app/ketchup-for-pok%C3%A9/id6477297968) utilise déjà un quiz quotidien de silhouettes. Cela montre une offre existante, sans prouver la demande ni un gain de rétention pour le public de cette application. La revue approfondie classe cette piste après les fonctions utilitaires.

Pour se différencier :

- quiz adapté au jeu ou à la région active ;
- explication après la réponse ;
- lien vers la fiche ;
- série facultative, sans punition forte en cas d'oubli ;
- badges liés à la connaissance plutôt qu'à la simple connexion quotidienne.

#### Journal d'aventure

Une timeline locale peut enregistrer :

- première capture ;
- équipe créée ;
- région terminée ;
- shiny ajouté ;
- objectif complété.

Ce journal donne une valeur émotionnelle aux données et renforce l'identité personnelle de l'application.

### Priorité 3 — Effet “waouh” et partage

#### Cartes partageables

Créer une image élégante pour partager :

- une équipe ;
- une progression ;
- un Pokémon favori ;
- un résultat de quiz ;
- un objectif terminé.

Chaque partage peut faire découvrir l'application, sans construire immédiatement un réseau social interne.

#### Widgets

Idées de widgets :

- progression du jeu actif ;
- Pokémon ou silhouette du jour ;
- objectif de chasse ;
- équipe active ;
- raccourci de recherche.

#### Passeport régional

Chaque région peut avoir une page de progression avec :

- carte ;
- Pokédex ;
- lieux visités dans l'application ;
- familles complétées ;
- tampon visuel obtenu à 25 %, 50 %, 75 % et 100 %.

Ce système est cohérent avec la direction atlas sans inventer de faux combats.

## Boucles d'usage recommandées

### Boucle utilitaire courte

```text
Question pendant une partie
→ recherche
→ réponse en moins de dix secondes
→ ajout à un objectif ou à l'équipe
→ retour au jeu
```

Cette boucle doit être extrêmement rapide. Elle justifie l'installation comme outil compagnon.

### Boucle de progression

```text
Choisir un jeu
→ marquer une capture
→ voir la progression augmenter
→ recevoir une prochaine suggestion
→ revenir après la capture suivante
```

### Boucle d'équipe

```text
Ajouter six Pokémon
→ détecter une faiblesse
→ comparer un remplaçant
→ améliorer l'équipe
→ sauvegarder ou partager
```

### Boucle de découverte

```text
Quiz ou Pokémon du jour
→ révélation
→ fiche courte
→ favori, objectif ou partage
```

Ces boucles créent du retour parce qu'elles apportent de la valeur, pas seulement parce qu'elles entretiennent une série quotidienne.

## Fonctions à éviter pour le moment

### Les reliquats de combats en direct

Des cartes et constantes de combats existent dans le code, mais elles ne sont pas rendues dans les écrans inspectés. Il s'agit de code inutilisé à nettoyer, pas d'une fausse fonctionnalité actuellement montrée à l'utilisateur. Une future offre de combats nécessiterait un produit et des sources réels.

### Un réseau social complet

Profils publics, commentaires, messages et modération créeraient beaucoup de coûts et de risques avant même de valider l'utilité principale.

Le partage de cartes ou de liens apporte une grande partie du bénéfice avec beaucoup moins de complexité.

### Le TCG dès la première version

Le TCG est un produit différent : cartes, extensions, variantes, prix, scanner, marché et collection. MasterDex l'intègre, mais copier cette largeur rendrait l'application moins lisible.

Il vaut mieux devenir excellent sur l'aventure et la collection des jeux vidéo avant d'ajouter un autre univers.

### Un simulateur de combat complet

Ce marché exige des règles exactes, des formats mis à jour et une profondeur considérable. Une analyse d'équipe pédagogique suffit pour le positionnement proposé.

### Une réalité augmentée décorative

Une fonction AR impressionne dans une vidéo mais n'améliore pas forcément les tâches principales. Elle ne doit pas passer avant le hors-ligne, le suivi de progression et l'exactitude des données.

## Avis sur la créativité actuelle

Les notes chiffrées initiales ont été retirées lors de la revue : elles donnaient une précision injustifiée sans essai de l'application sur appareil, comparaison contrôlée ni mesure d'usage.

Le code permet de constater une intention de terminal personnel, des gradients, de grandes illustrations, des cartes et un espace de reprise. Leur lisibilité, leur fluidité et leur perception restent à tester. L'atlas et le français existent aussi chez des concurrents et ne suffisent pas à établir une originalité supérieure.

La cohérence de marque reste à préciser entre `app-mobile`, `pokedex` et `PokeNav`. Les favoris, l'équipe et la reprise offrent une base de personnalisation réelle. L'intérêt d'un journal, d'objectifs ou de collections avancées est une hypothèse à valider par des tâches utilisateurs.

Mon orientation créative révisée : rendre visibles les progrès et les conséquences des choix, avec une lecture compacte pendant la partie et une présentation plus illustrée pour la découverte. Le potentiel de rétention ne peut pas être noté honnêtement à partir du code seul.

## Direction créative recommandée

### Métaphore : le terminal d'expédition

Le mélange actuel de technologie sombre et de cartes peut devenir un « terminal d'expédition » personnel.

Il ne faudrait pas copier l'interface d'un appareil officiel. La direction doit rester originale :

- cartographie moderne ;
- fiches de terrain ;
- scans et relevés scientifiques ;
- tampons de progression ;
- couleurs inspirées des types et régions ;
- typographie très lisible ;
- micro-animations fonctionnelles.

### Personnalité de ton

Le ton devrait être :

- compétent sans être froid ;
- passionné sans être enfantin ;
- direct pendant une partie ;
- encourageant dans la progression ;
- entièrement naturel en français.

Exemples :

- « Plus que 4 espèces à trouver dans cette zone. »
- « Ton équipe résiste bien à l'Eau, mais trois membres craignent le Sol. »
- « Tu peux faire évoluer ce Pokémon maintenant. »
- « Famille complétée. »

### Animations

Les animations devraient expliquer ou récompenser :

- scan court lors de l'ouverture d'une fiche ;
- remplissage de la progression après une capture ;
- tampon lorsqu'une famille est complétée ;
- liaison visuelle entre les étapes d'évolution ;
- surbrillance d'une faiblesse d'équipe.

Il faut éviter que chaque bloc rebondisse ou se déplace en permanence. L'utilisateur consulte souvent l'application pendant qu'il joue et recherche avant tout de la rapidité.

### Haptique et son

De légers retours haptiques peuvent accompagner une capture cochée, un favori ou un objectif terminé. Les sons devraient être originaux ou correctement licenciés ; il ne faut pas reprendre les sons officiels des jeux.

## Nom et identité

### Ne pas publier sous `PokeNav`

Le nom est déjà associé à une fonction officielle de l'univers Pokémon. Même si le projet reste non officiel, ce choix augmente le risque de confusion.

### Cahier des charges du futur nom

Le nom devrait :

- être original ;
- être prononçable en français et en anglais ;
- évoquer l'atlas, la progression ou le compagnon ;
- rester distinct de Pokémon, Pokédex, Pokémon HOME et PokéNav ;
- avoir un domaine et des identifiants de stores disponibles ;
- faire l'objet d'une recherche de marque avant publication.

Il est préférable de définir une direction de naming puis de vérifier juridiquement chaque candidat plutôt que de choisir immédiatement un jeu de mots contenant `Poké` ou `Dex`.

### Icône

L'icône devrait être originale et identifiable en petite taille. Une Poké Ball presque officielle est immédiatement reconnaissable, mais elle renforce aussi le risque de confusion avec une application officielle.

Une piste plus distinctive serait :

- une boussole abstraite ;
- une lentille de scan ;
- une carte pliée stylisée ;
- un monogramme original ;
- une combinaison carte + signal, sans reprendre un logo officiel.

## Fiche App Store et Google Play

Apple recommande de concentrer les visuels sur l'expérience principale, de commencer par les fonctions les plus fortes et d'utiliser des captures qui montrent réellement l'application. Voir les [bonnes pratiques officielles pour les assets App Store](https://developer.apple.com/app-store/asset-best-practices/).

### Histoire recommandée pour les captures

Les promesses suivantes ne doivent être utilisées que lorsqu'elles sont réellement implémentées :

1. « Ton aventure, organisée en français »
2. « Suis ton Pokédex jeu par jeu »
3. « Vois immédiatement ce qu'il te manque »
4. « Construis une équipe plus équilibrée »
5. « Trouve où capturer et comment évoluer »
6. « Fonctionne hors ligne, sans compte obligatoire »

Chaque visuel doit porter une seule idée et montrer l'interface réelle.

### Vidéo courte

Une vidéo de 15 à 25 secondes peut montrer :

1. sélection du jeu ;
2. recherche d'un Pokémon ;
3. validation d'une capture ;
4. progression qui augmente ;
5. analyse d'une équipe ;
6. prochaine action suggérée.

### Page localisée

La description, les mots-clés, captures et vidéos doivent être localisés. Une application pensée d'abord pour le français peut posséder une fiche française très naturelle au lieu d'une simple traduction littérale.

### Tester au lieu de deviner

Apple propose l'optimisation de page produit et Google Play permet de tester icône, visuels et textes. Voir :

- [Product Page Optimization d'Apple](https://developer.apple.com/app-store/product-page-optimization/) ;
- [expériences de fiche Google Play](https://support.google.com/googleplay/android-developer/answer/12053285).

Tests prioritaires :

- icône « atlas » contre icône « scanner » ;
- première capture centrée sur la collection contre l'équipe ;
- sous-titre « guide hors ligne » contre « suivi d'aventure » ;
- vidéo présente contre captures seules.

La demande d'avis ne devrait apparaître qu'après un succès réel : première famille complétée, première équipe sauvegardée ou plusieurs utilisations réussies.

## Monétisation recommandée

### Principes

- Ne pas bloquer la consultation de base.
- Ne pas imposer un compte.
- Ne pas facturer une simple correction de données ou le mode hors ligne.
- Ne pas introduire un abonnement sans valeur récurrente réelle.
- Ne pas détériorer l'identité premium avec des publicités agressives.

### Modèle possible

#### Version gratuite

- Pokédex et recherche ;
- une aventure active ;
- checklist de capture ;
- une équipe ;
- fiches, évolutions et lieux ;
- fonctionnement hors ligne ;
- export et restauration de base des données personnelles, dès le lancement du suivi de collection.

#### Achat permanent “Supporter”

- aventures et équipes illimitées ;
- analyse avancée ;
- listes et objectifs multiples ;
- présentations et partages avancés, sans bloquer la récupération des données personnelles ;
- thèmes originaux ;
- widgets supplémentaires ;
- options supplémentaires de personnalisation ; la sauvegarde exportable de base reste accessible à tous.

#### Abonnement uniquement si le cloud le justifie

Un abonnement pourrait être défendable pour :

- synchronisation multi-appareils ;
- sauvegarde cloud ;
- fonctionnalités collaboratives ;
- coûts serveur permanents.

Il ne devrait pas être utilisé uniquement pour débloquer des informations statiques.

## Mesure du succès

### Acquisition

- taux de conversion de la fiche store ;
- coût par installation ;
- origine des installations ;
- performance de chaque première capture d'écran.

### Activation

Un utilisateur est activé lorsqu'il réalise au moins une action personnelle pendant la première session :

- sélectionner un jeu ;
- marquer une capture ;
- créer une équipe ;
- enregistrer un objectif.

### Utilité

- délai moyen entre ouverture et information trouvée ;
- recherches réussies ;
- fiches ouvertes depuis une recherche ;
- utilisation hors ligne réussie ;
- erreurs ou recherches sans résultat.

### Rétention

- retour à J1, J7 et J30 ;
- nombre d'utilisateurs avec une aventure active ;
- progression moyenne par semaine ;
- objectifs créés et terminés ;
- équipes sauvegardées et modifiées.

### Qualité

- sessions sans crash ;
- taux d'échec réseau ;
- données signalées comme incorrectes ;
- temps d'ouverture ;
- note store et thèmes récurrents des avis.

## Propriété intellectuelle : point critique

Cette partie n'est pas un avis juridique, mais elle doit être traitée avant une publication ou une monétisation.

### Le fait que PokéAPI soit ouverte ne règle pas les droits des images

La [documentation PokéAPI](https://pokeapi.co/docs/v2) autorise l'utilisation de l'API dans le cadre de sa politique d'usage raisonnable. La [licence du projet PokéAPI](https://github.com/PokeAPI/pokeapi/blob/master/LICENSE.md) concerne le logiciel et sa base, avec une mention des marques Pokémon.

Le dépôt de sprites indique cependant explicitement que le contenu des images appartient à The Pokémon Company et précise que sa licence ne garantit pas que les droits de tiers sont libérés. Voir la [licence du dépôt PokeAPI/sprites](https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt).

### Une mention “non officiel” ne donne pas automatiquement les droits

Elle réduit le risque de confusion, mais ne remplace pas une autorisation. Apple demande que les développeurs disposent des droits nécessaires sur les marques et contenus tiers dans la [règle 5.2 de ses consignes de validation](https://developer.apple.com/app-store/review/guidelines/).

### Éléments à faire examiner

- nom public de l'application ;
- icône et Poké Ball centrale ;
- illustrations officielles ;
- cartes Bulbapedia/Bulbagarden ;
- noms et marques ;
- captures utilisées pour la publicité ;
- monétisation ;
- mentions légales et procédure de retrait.

La présence d'autres applications non officielles dans les stores ne garantit pas que le même usage sera accepté durablement.

## Feuille de route produit

### Phase 1 — Une utilité claire

Objectif : devenir un excellent compagnon d'une partie en cours.

1. Mode par jeu.
2. Catalogue hors ligne.
3. Statuts vu, capturé, possédé et shiny.
4. Progression régionale et nationale.
5. Données de capture et d'évolution fiables.
6. Véritable analyse d'une équipe.
7. Onboarding centré sur le jeu et l'objectif.
8. Export, restauration et migrations des données personnelles.

### Phase 2 — Une identité mémorable

Objectif : faire du produit un espace personnel.

1. Dashboard orienté prochaine action.
2. Objectifs et chasses.
3. Journal d'aventure.
4. Passeports régionaux.
5. Quiz ou découverte quotidienne.
6. Nouvelle marque et icône originale.
7. Micro-animations et haptique cohérentes.

### Phase 3 — Une croissance organique

Objectif : permettre aux utilisateurs satisfaits de montrer le produit.

1. Cartes d'équipe partageables.
2. Bilans de progression partageables.
3. Widgets.
4. Formats d'import et de partage supplémentaires, après l'export/restauration de base de la phase 1.
5. Synchronisation facultative.
6. Pages de store localisées et testées.

### Phase 4 — Extensions après validation

À envisager uniquement si les trois premières phases fonctionnent :

- partage de listes entre amis ;
- objectifs collaboratifs ;
- données compétitives plus avancées ;
- prise en charge d'autres langues ;
- TCG séparé ou module distinct.

## Conclusion personnelle

Le projet n'a pas besoin de devenir le Pokédex qui contient le plus de rubriques. Ce combat est déjà occupé par des applications très anciennes et très complètes.

Il peut en revanche devenir le compagnon le plus agréable et personnel pour un joueur francophone.

Le code montre une intention créative : atmosphère de terminal, mise en scène des illustrations et ambition cartographique. La réussite visuelle et la différenciation doivent être vérifiées sur appareils et auprès des utilisateurs. Ces intentions gagneraient à être reliées à une progression personnelle cohérente.

Le changement décisif serait de passer de :

> « Voici toutes les informations disponibles. »

à :

> « Voici où tu en es, ce qu'il te manque et ce que tu peux faire maintenant. »

C'est cette seconde promesse qui peut donner envie d'installer l'application, d'y enregistrer sa progression et d'y revenir pendant toute une aventure.

## Sources principales

- [dataDex — Google Play](https://play.google.com/store/apps/details?id=com.talzz.datadex)
- [ProDex — App Store](https://apps.apple.com/us/app/prodex-complete-game-guide/id1485409731)
- [MasterDex — App Store](https://apps.apple.com/us/app/masterdex-complete-guide/id1621464261)
- [Goldex — Google Play](https://play.google.com/store/apps/details?id=com.goldex)
- [Fonctionnalités de Pokémon HOME](https://home.pokemon.com/fr-fr/features/)
- [PokéNav Plus — site officiel Pokémon](https://www.pokemon.com/us/pokemon-video-games/pokemon-omega-ruby-and-pokemon-alpha-sapphire)
- [Bonnes pratiques des assets App Store](https://developer.apple.com/app-store/asset-best-practices/)
- [Product Page Optimization — Apple](https://developer.apple.com/app-store/product-page-optimization/)
- [Expériences de fiche — Google Play](https://support.google.com/googleplay/android-developer/answer/12053285)
- [App Review Guidelines — Apple](https://developer.apple.com/app-store/review/guidelines/)
- [Documentation PokéAPI](https://pokeapi.co/docs/v2)
- [Licence de PokéAPI](https://github.com/PokeAPI/pokeapi/blob/master/LICENSE.md)
- [Licence du dépôt de sprites PokéAPI](https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt)
