# Audit technique de l'application mobile Pokédex

Date de l'audit : 30 septembre 2026

> Complément et précisions fonctionnelles : [AUDIT_FONCTIONNEL_APPROFONDI.md](AUDIT_FONCTIONNEL_APPROFONDI.md). Les vérifications de cette revue sont statiques ; les recommandations ne constituent pas des corrections déjà implémentées.

## Résumé

L'application possède une base solide et une identité visuelle déjà travaillée : architecture Expo Router claire, TypeScript strict, catalogue local de 1 025 Pokémon, listes virtualisées, favoris et équipe persistants, ainsi qu'une séparation correcte des principaux écrans.

Elle reste cependant plus proche d'un prototype avancé que d'une application prête pour une publication fiable. Les priorités sont la reproductibilité de l'installation, la CI/CD, la gestion réseau et hors ligne, puis plusieurs bugs fonctionnels et problèmes d'accessibilité.

## Points positifs

- Architecture par routes et écrans facile à comprendre.
- TypeScript configuré en mode strict.
- Catalogue français local couvrant 1 025 Pokémon.
- Utilisation de `FlatList` sur les écrans contenant beaucoup de données.
- Gestion locale des favoris, de l'équipe, du profil et de l'activité récente.
- États de chargement et skeletons déjà présents sur plusieurs écrans.
- Mise en cache en mémoire d'une partie des réponses PokéAPI.
- Cartes régionales disponibles localement.
- Aucun secret applicatif évident n'a été trouvé dans le dépôt. Le `projectId` EAS et le nom du propriétaire ne sont pas des secrets.

## Priorité critique

### 1. Réparer l'installation et la CI

La commande exacte utilisée par le workflow, `npm ci --force`, échoue dans l'environnement audité. `package.json` et `package-lock.json` ne sont pas synchronisés ; npm signale notamment l'absence de `react-dom@19.3.0` et `scheduler@0.28.0` dans le lockfile.

Le workflow contient également une faute dans le nom du fichier servant de clé de cache :

```yaml
hashFiles('**/package-lock.lock')
```

Le fichier réel est `package-lock.json`. Le cache ne peut donc pas être correctement invalidé.

Actions recommandées :

1. Choisir et documenter une version précise de Node et npm.
2. Régénérer `package-lock.json` avec cet environnement.
3. Vérifier que `npm ci` fonctionne sans `--force`.
4. Indiquer explicitement `node-version` dans `actions/setup-node`.
5. Utiliser le cache npm intégré à `setup-node` au lieu de mettre `node_modules` en cache.
6. Exécuter typecheck, lint et tests avant `eas update`.
7. Ajouter une règle de concurrence pour empêcher deux publications simultanées.
8. Choisir explicitement la branche ou l'environnement EAS cible.

Fichiers concernés :

- `.github/workflows/expo-go-update.yaml`
- `package.json`
- `package-lock.json`

### 2. Ajouter les contrôles qualité manquants

Le projet ne contient actuellement aucun script `typecheck`, `lint` ou `test`. La vérification TypeScript complète n'a pas pu être exécutée pendant cet audit, puisque l'installation propre des dépendances échoue.

Scripts recommandés :

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "expo lint",
    "test": "...",
    "verify": "npm run typecheck && npm run lint && npm test"
  }
}
```

La CI devrait bloquer toute publication EAS si l'une de ces vérifications échoue.

### 3. Rendre le Pokédex utilisable hors ligne

Le catalogue complet est déjà embarqué dans `app/_shared/pokemon-catalog.json`, mais l'écran Explorer démarre avec une liste vide et attend la réponse de PokéAPI.

Conséquence : sans connexion, l'utilisateur ne peut pas parcourir des données pourtant présentes dans l'application.

Approche recommandée :

- afficher immédiatement le catalogue local ;
- lancer une synchronisation silencieuse en arrière-plan ;
- conserver la liste locale en cas d'échec réseau ;
- réserver le réseau aux détails supplémentaires ;
- afficher la date de dernière synchronisation plutôt que bloquer l'écran.

Fichiers concernés :

- `app/discover/useDiscoverCatalog.ts`
- `app/_shared/catalog.ts`
- `app/_shared/pokemon-catalog.json`

### 4. Corriger les faux rafraîchissements

Les données réussies sont stockées sous forme de promesses dans des `Map`. Lorsqu'un écran appelle `reload()`, la même promesse déjà résolue est généralement renvoyée. Le geste de rafraîchissement ne récupère alors aucune nouvelle donnée.

Cela concerne notamment :

- les fiches Pokémon ;
- les attaques ;
- l'atlas des rencontres ;
- l'index des espèces.

Le dashboard, le profil et l'écran des lieux simulent également un rafraîchissement avec un simple `setTimeout`, sans recharger de donnée.

Actions recommandées :

- ajouter un paramètre `forceRefresh` ;
- mettre en place un TTL ;
- permettre l'invalidation par clé ;
- supprimer des caches internes les promesses rejetées ;
- supprimer les gestes de rafraîchissement qui n'ont aucune action réelle.

Fichiers concernés :

- `app/_shared/pokeapi.ts`
- `app/detail/usePokemonDetail.ts`
- `app/map/usePokemonAtlas.ts`
- `app/discover/useDiscoverCatalog.ts`
- `app/dashboard/scene.tsx`
- `app/profile/scene.tsx`
- `app/locations/scene.tsx`

## Bugs fonctionnels

### 5. Les slugs inconnus ouvrent silencieusement Bulbizarre

`getCatalogPokemonBySlug()` retourne le premier élément du catalogue quand le slug n'existe pas :

```ts
return findCatalogPokemonBySlug(slug) ?? catalog.items[0];
```

Cette stratégie masque les erreurs et peut afficher Bulbizarre pour une route invalide. Elle pose aussi problème pour certaines formes alternatives dont le slug PokéAPI n'existe pas dans le catalogue d'espèces.

Une route contenant un slug inconnu peut donc afficher les données d'un Pokémon sans rapport. Les variantes affichées dans la fiche ne sont actuellement pas interactives : une ouverture depuis ces cartes n'est pas un parcours existant.

Correction recommandée :

- retourner `undefined` pour un slug inconnu ;
- gérer un véritable écran « Pokémon introuvable » ;
- distinguer une espèce principale d'une forme ou variété PokéAPI ;
- ne pas remplacer le slug demandé avant l'appel réseau.

Fichiers concernés :

- `app/_shared/catalog.ts`
- `app/detail/scene.tsx`
- `app/_shared/pokeapi.ts`

### 6. Le comparateur masque certaines erreurs

La liste du comparateur utilise les statistiques du Pokémon de gauche. Si celui-ci charge correctement mais que celui de droite échoue, la liste n'est pas vide. `ListEmptyComponent` n'est donc jamais affiché et l'erreur du Pokémon de droite peut rester invisible.

Il faut gérer explicitement les quatre états suivants avant de rendre la liste :

- les deux chargements en cours ;
- les deux chargements réussis ;
- l'échec du Pokémon gauche ;
- l'échec du Pokémon droit.

Fichier concerné : `app/compare/scene.tsx`.

### 7. Le comportement du profil contredit son interface

Le formulaire indique que le pseudo sera utilisé si le prénom est vide. Pourtant, la normalisation remplace un prénom vide par `Stanly`.

Il faudrait autoriser un prénom vide et appliquer la priorité suivante uniquement au moment de l'affichage :

1. prénom non vide ;
2. pseudo non vide ;
3. « Dresseur ».

Fichiers concernés :

- `app/_shared/account.tsx`
- `app/profile/scene.tsx`

### 8. Fiabiliser les collections et le comparateur

`toggleTeamMember()` annonce retourner un booléen, mais ce booléen est modifié dans un updater React potentiellement asynchrone. Son résultat n'est donc pas fiable.

Autres problèmes associés :

- un libellé « Équipe pleine » existe sur la fiche, mais une tentative d'ajout n'ouvre pas de parcours de remplacement ni de retour supplémentaire ;
- la base de comparaison reste enregistrée indéfiniment ;
- `clearComparisonTarget()` n'est jamais utilisé ;
- appuyer à nouveau sur la base de comparaison ne permet pas de l'annuler.

Le contexte devrait exposer des actions déterministes et l'interface devrait afficher un retour clair, éventuellement avec une alerte légère ou un toast.

Fichiers concernés :

- `app/_shared/collections.tsx`
- `app/detail/scene.tsx`

### 9. Sécuriser les données AsyncStorage

Les contextes appellent `JSON.parse()` sans capturer une éventuelle erreur. Un stockage corrompu peut donc produire un rejet non géré.

Il faut :

- entourer la lecture et le parsing d'un `try/catch` ;
- valider les propriétés et les types ;
- filtrer les slugs inconnus ;
- prévoir une stratégie de migration par version ;
- réinitialiser uniquement la partie invalide ;
- journaliser proprement les erreurs de persistance.

Fichiers concernés :

- `app/_shared/account.tsx`
- `app/_shared/activity.tsx`
- `app/_shared/collections.tsx`

## Réseau et performances

### 10. Réduire le nombre d'appels PokéAPI

Une fiche détaillée peut lancer plusieurs dizaines de requêtes : Pokémon, espèce, talents, attaques, types, évolutions, formes, rencontres, lieux et versions.

L'atlas lance un grand `Promise.all` sur toutes les zones de rencontre. Chaque entrée peut ensuite charger une zone, un lieu et plusieurs versions. Les noms de versions ne sont pas mis en cache, ce qui peut provoquer beaucoup de requêtes identiques.

Actions recommandées :

- limiter la concurrence ;
- mettre en cache les versions et talents ;
- mutualiser les requêtes identiques ;
- paginer ou différer les données secondaires ;
- charger les attaques, formes et rencontres uniquement quand leur onglet devient visible ;
- ajouter retry, timeout et backoff ;
- annuler les requêtes quand l'écran change.

Fichier principal concerné : `app/_shared/pokeapi.ts`.

### 11. Corriger la gestion des erreurs dans les caches

Les caches principaux suppriment certaines promesses en cas d'échec, mais plusieurs caches internes conservent une promesse rejetée. Après une erreur réseau temporaire, les prochains essais peuvent donc échouer immédiatement jusqu'au redémarrage de l'application.

Chaque fonction mise en cache devrait supprimer sa clé dans son propre `.catch()`.

### 12. Optimiser les images

Les illustrations Pokémon sont distantes et utilisent le composant `Image` standard sans stratégie explicite de cache disque ou de remplacement en cas d'échec.

Améliorations recommandées :

- utiliser un composant d'image avec cache mémoire et disque ;
- afficher un placeholder local ;
- gérer `onError` ;
- charger des miniatures adaptées aux cartes ;
- précharger seulement les images probables ;
- éviter de télécharger une illustration haute définition pour une petite vignette.

Les cartes régionales représentent environ 8,3 Mo. Certaines dépassent 1 Mo. Elles devraient être compressées et, si les plateformes ciblées le permettent, converties vers un format plus efficace.

### 13. Alléger le catalogue initial

Le fichier `pokemon-catalog.json` pèse environ 1,09 Mo et contient des détails complets pour chaque Pokémon. Comme il est importé dans le bundle, il augmente le temps de parsing et la mémoire de démarrage.

Une optimisation possible serait de séparer :

- un index léger destiné aux listes et recherches ;
- les textes détaillés par Pokémon ;
- les données rarement utilisées ;
- les données pouvant être stockées dans une base locale ou chargées à la demande.

## Exactitude fonctionnelle de la carte

### 14. Les points de rencontre sont illustratifs, pas géographiques

Les marqueurs de l'atlas ne proviennent pas de véritables coordonnées. Ils utilisent une liste de positions décoratives puis une formule lorsqu'il manque des positions.

Ils sont néanmoins affichés par-dessus de vraies cartes régionales et accompagnés de noms de lieux. Cela peut faire croire qu'ils représentent leur position réelle.

Trois solutions possibles :

1. obtenir ou construire une vraie base de coordonnées ;
2. remplacer les marqueurs par une présentation en zones ou une liste ;
3. afficher clairement que les positions sont purement illustratives.

Fichiers concernés :

- `app/map/regions.ts`
- `app/map/scene.tsx`

## Accessibilité et expérience utilisateur

### 15. Ajouter l'accessibilité aux contrôles

L'audit statique a relevé 61 composants `Pressable`, mais seulement deux propriétés d'accessibilité, toutes deux sur le bouton avatar.

Il manque notamment :

- `accessibilityRole="button"` ;
- des labels pour les boutons uniquement représentés par une icône ;
- `accessibilityState` pour les filtres, onglets, favoris et éléments sélectionnés ;
- des hints lorsque l'action n'est pas évidente ;
- des labels explicites pour les champs ;
- une lecture correcte des cartes Pokémon ;
- une indication pour les images décoratives ;
- une gestion du mode « réduire les animations ».

Il faut également tester le contraste, le grossissement du texte et les zones tactiles avec VoiceOver et TalkBack.

### 16. Respecter la safe area inférieure

Le dock inférieur utilise une position fixe avec `bottom: 18`, tandis que les `SafeAreaView` excluent généralement le bord inférieur.

Sur certains iPhone et appareils Android, le dock ou le contenu peut entrer en conflit avec l'indicateur d'accueil ou la barre système.

Le dock devrait utiliser `useSafeAreaInsets()` et calculer sa marge ainsi que le padding inférieur des listes à partir de `insets.bottom`.

Fichiers concernés :

- `app/_shared/ui.tsx`
- styles des différents écrans.

### 17. Rendre la navigation plus naturelle

Plusieurs boutons visuellement présentés comme des boutons retour font un `router.replace()` vers le dashboard ou l'écran Explorer. L'utilisateur perd alors le contexte depuis lequel il avait ouvert l'écran.

Approche recommandée :

```ts
if (router.canGoBack()) {
  router.back();
} else {
  router.replace(appRoutes.dashboard);
}
```

Le fallback dépendra de chaque écran.

### 18. Améliorer les formulaires et recherches

- Ajouter un `KeyboardAvoidingView` ou une gestion équivalente au profil.
- Permettre de fermer facilement le clavier.
- Associer correctement chaque label à son champ.
- Rendre les recherches insensibles aux accents : `Évoli` et `Evoli` doivent produire le même résultat.
- Uniformiser les accents dans les textes français : « Pokémon », « Évolutions », « Précision », etc.
- Éviter d'utiliser le placeholder comme seul descriptif d'un champ.

### 19. Donner un retour après chaque action

Les actions suivantes méritent un retour visuel ou haptique :

- ajout et retrait des favoris ;
- ajout et retrait de l'équipe ;
- équipe complète ;
- sélection d'une base de comparaison ;
- sauvegarde et réinitialisation du profil ;
- échec d'ouverture d'un lien externe.

## Architecture et maintenabilité

### 20. Découper `pokeapi.ts`

`app/_shared/pokeapi.ts` dépasse 1 200 lignes et regroupe :

- les types bruts de l'API ;
- les modèles d'affichage ;
- le client HTTP ;
- tous les caches ;
- les traductions et transformations ;
- les détails Pokémon ;
- les attaques ;
- les évolutions ;
- les rencontres.

Découpage recommandé :

```text
src/data/api/
  client.ts
  cache.ts
  pokemon.ts
  moves.ts
  evolutions.ts
  encounters.ts
  mappers.ts
  types.ts
```

### 21. Créer un petit design system

Plusieurs éléments sont dupliqués dans les écrans :

- `FilterChip` ;
- `SuggestionCard` ;
- `ErrorState` ;
- fonds sombres ;
- boutons d'en-tête ;
- cartes d'information ;
- fonctions `uniqueStrings`.

Un dossier de composants partagés et quelques tokens permettraient d'uniformiser :

- couleurs ;
- espacements ;
- rayons ;
- tailles de texte ;
- ombres ;
- animations ;
- états pressé, focus, désactivé et sélectionné.

### 22. Supprimer le code et les dépendances inutilisés

Les composants `BattleTile` et `UpcomingTile`, ainsi que leurs données, ne semblent plus être utilisés.

Certaines dépendances ne sont pas importées directement dans le code, notamment :

- `debug` ;
- `validate-npm-package-name` ;
- `@babel/plugin-transform-react-jsx`.

Les dépendances Expo doivent être vérifiées avec les outils Expo avant suppression, car certaines peuvent être requises indirectement ou par la configuration native.

### 23. Centraliser la gestion des erreurs

Les messages réseau exposent actuellement parfois l'URL complète et le statut brut de PokéAPI. Il serait préférable de séparer :

- le message technique destiné aux logs ;
- le message court destiné à l'utilisateur ;
- les erreurs récupérables ;
- les erreurs définitives comme un slug inexistant.

## Hygiène du dépôt

### 24. Ne plus versionner les builds et logs

Le dossier `dist` est suivi par Git et représente environ 30 Mo. Les fichiers suivants sont également versionnés :

- `expo-lan.out.log` ;
- `expo-lan.err.log` ;
- `expo-tunnel.out.log` ;
- `expo-tunnel.err.log`.

Ces fichiers sont générés localement et ne devraient pas être conservés dans le dépôt.

Entrées recommandées dans `.gitignore` :

```gitignore
node_modules/
.expo/
dist/
*.log
.env
.env.*
!.env.example
```

Il faudra ensuite retirer les fichiers déjà suivis de l'index Git sans supprimer les sources utiles.

### 25. Ajouter la documentation du projet

Il manque notamment :

- un README expliquant l'installation et les commandes ;
- la version Node/npm attendue ;
- la procédure de génération du catalogue ;
- la procédure EAS Update et EAS Build ;
- une licence ;
- des mentions concernant les cartes et ressources tierces ;
- une note indiquant que Pokémon et ses marques appartiennent à leurs propriétaires respectifs.

## Préparation à une publication

### 26. Compléter la configuration Expo

`app.json` ne définit pas encore plusieurs éléments attendus pour une application distribuée :

- icône principale ;
- icône adaptative Android ;
- image de splash ;
- `android.package` ;
- `ios.bundleIdentifier` ;
- schéma de deep link ;
- configuration de build ;
- métadonnées et politique de confidentialité.

Il n'existe pas non plus de fichier `eas.json` pour distinguer les profils development, preview et production.

### 27. Sécuriser les publications EAS

Le workflow publie automatiquement après chaque push sur `main`. Une publication distante devrait être précédée de toutes les validations et idéalement protégée par :

- un environnement GitHub dédié ;
- une branche EAS explicite ;
- une concurrence limitée à une publication ;
- une version EAS CLI maîtrisée ;
- des permissions GitHub minimales ;
- éventuellement une approbation pour la production.

## Tests recommandés

### Tests unitaires

- traductions et formatage ;
- création des routes ;
- filtres du catalogue ;
- calcul des faiblesses et résistances ;
- transformation des évolutions ;
- normalisation du profil ;
- limite de six Pokémon dans l'équipe ;
- migrations et validation AsyncStorage.

### Tests d'intégration

- catalogue local disponible hors ligne ;
- échec puis nouvelle tentative PokéAPI ;
- rafraîchissement forcé ;
- ouverture d'une forme alternative ;
- erreur sur un seul côté du comparateur ;
- récupération après un stockage corrompu.

### Tests de parcours

- rechercher un Pokémon puis ouvrir sa fiche ;
- ajouter un favori et vérifier le dashboard ;
- constituer une équipe complète ;
- comparer deux Pokémon ;
- consulter les attaques et évolutions ;
- naviguer dans l'atlas ;
- redémarrer l'application et vérifier la persistance.

## Ordre de réalisation conseillé

### Lot 1 — Stabilisation

1. Réparer le lockfile et `npm ci`.
2. Corriger le workflow GitHub Actions.
3. Ajouter typecheck et lint.
4. Nettoyer `dist`, les logs et `.gitignore`.

### Lot 2 — Bugs fonctionnels

1. Corriger la gestion des slugs et formes.
2. Corriger le comparateur.
3. Corriger le profil vide.
4. Sécuriser AsyncStorage.
5. Rendre équipe et comparaison déterministes.

### Lot 3 — Données et performances

1. Passer Explorer en mode local-first.
2. Refaire la stratégie de cache et de rafraîchissement.
3. Limiter les appels réseau de l'atlas.
4. Optimiser les images et les cartes.

### Lot 4 — Qualité utilisateur

1. Accessibilité complète.
2. Safe areas et clavier.
3. Navigation retour cohérente.
4. Recherche sans accents et textes français harmonisés.
5. Retours visuels et haptiques.

### Lot 5 — Publication

1. Compléter `app.json` et créer `eas.json`.
2. Ajouter les icônes et assets de marque.
3. Ajouter README, licence et mentions tierces.
4. Ajouter tests d'intégration et de parcours.
5. Mettre en place des profils preview et production.

## Conclusion

La priorité n'est pas de refaire l'interface : la base visuelle et les parcours principaux existent déjà. Le meilleur gain vient d'abord de la fiabilité du build, du fonctionnement hors ligne, de la maîtrise des caches et de la correction des slugs/formes. Une fois ces fondations corrigées, l'accessibilité, les performances et la préparation aux stores pourront être améliorées sans fragiliser l'application.
