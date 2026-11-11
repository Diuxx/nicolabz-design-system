# Nicolabz Design System

Design system léger, sans framework ni dépendance externe, proposant des tokens,
des composants CSS réutilisables, la gestion des thèmes clair/sombre et une
démonstration autonome. La direction visuelle est décrite dans
[docs/DESIGN.md](docs/DESIGN.md).

## Technologies

- HTML, CSS et JavaScript natifs pour le design system et sa démonstration.
- Node.js 18 ou plus récent pour la génération des tokens et les tests.
- Aucune dépendance npm externe.

## Prérequis et installation

Pour consulter la démonstration, un navigateur moderne suffit. Pour générer les
tokens ou lancer les tests, installer Node.js 18 ou une version plus récente.
Aucune installation de dépendances n'est nécessaire.

## Lancer la démonstration

Ouvrir [demo/index.html](demo/index.html) directement dans un navigateur. La
démonstration est autonome et ne nécessite pas de serveur applicatif.

## Build et tests

Après toute modification des tokens, exécuter :

```sh
npm run build
npm run check
npm test
```

`build` valide les tokens et régénère le CSS ; `check` vérifie que le CSS est à
jour sans écrire de fichier ; `test` exécute les tests Node.js, dont la
cohérence du catalogue de composants avec les styles et la démonstration.

## Architecture

- [tokens/palette.json](tokens/palette.json) : source de vérité des couleurs,
  rayons, espacements et paramètres décoratifs (couleurs, opacité et flou) des
  deux thèmes.
- [tokens/components.json](tokens/components.json) : catalogue des composants,
  variantes et états réellement disponibles.
- [scripts/build-tokens.js](scripts/build-tokens.js) : validation de la palette
  et génération des variables CSS.
- [src/styles/theme.css](src/styles/theme.css) : **fichier généré**, à ne jamais
  modifier manuellement. Il contient les variables et les propriétés de rendu
  générées à partir de la palette.
- [src/styles/typography.css](src/styles/typography.css) : styles de base,
  focus et réduction des animations.
- [src/styles/components.css](src/styles/components.css) : composants CSS
  réutilisables.
- [src/theme.js](src/theme.js) : gestion du thème indépendante de la démo.
- [demo/index.html](demo/index.html) et [demo/demo.css](demo/demo.css) :
  présentation des composants, variantes, tokens et comportements existants.
- [tests/](tests/) : tests de génération et de validation des tokens.

Le générateur accepte les couleurs hexadécimales à six chiffres et les
dimensions en pixels. Une valeur manquante ou invalide provoque une erreur
explicite. Pour ajouter un token, adapter également la validation et la génération.

## Configuration des tokens et des thèmes

Modifier les valeurs globales dans [tokens/palette.json](tokens/palette.json),
puis lancer `npm run build`. Ne pas modifier directement
[src/styles/theme.css](src/styles/theme.css). Toute évolution de composant doit
rester synchronisée entre le catalogue, [src/styles/components.css](src/styles/components.css)
et la démonstration.

Aucune variable d'environnement ni configuration externe n'est requise. Le
thème explicite est enregistré dans `localStorage` sous la clé
`nicolabz-theme`.

## Thèmes et intégration HTML

Copier ou exposer le dossier `src` dans l'application, puis adapter les chemins :

```html
<head>
  <!-- Synchrone avant les styles et le contenu pour éviter le flash de thème. -->
  <script src="src/theme.js"></script>
  <link rel="stylesheet" href="src/styles/theme.css">
  <link rel="stylesheet" href="src/styles/typography.css">
  <link rel="stylesheet" href="src/styles/components.css">
</head>
```

Seul `theme.css` est nécessaire pour utiliser les tokens ; les styles de base,
les composants et le script sont facultatifs. Les classes de composants
actuelles incluent notamment `button`, `button-primary`, `button-secondary`,
`panel`, `badge`, `badge-success`, `tag` et `form-panel`. Les styles de base
s'appliquent globalement à la page : vérifier leur compatibilité avec les
styles de l'application.

Le script applique `data-theme="light"` ou `"dark"` sur `<html>` avant
l'affichage. Sans choix enregistré, il suit `prefers-color-scheme`, y compris
ses changements ; un choix explicite est enregistré sous `nicolabz-theme` dans
`localStorage` et reste actif pour la session si le stockage est indisponible.
Le script expose `window.nicolabzTheme.getTheme()`, `setTheme("light" | "dark")`
et `toggle()`. À chaque application, l'événement `nicolabz-theme-change` est
émis sur `window` avec `event.detail.theme`. Chaque application fournit ses
propres contrôles et libellés accessibles.

Sans script, le thème clair est utilisé par défaut ; l'application peut aussi
définir elle-même `data-theme` sur `<html>`. La forme multicolore et son
positionnement appartiennent à la démonstration : ses couches placent la
décoration derrière le contenu. Les animations respectent
`prefers-reduced-motion`.

## Intégration Angular

Copier `src` dans un emplacement servi comme ressource statique, par exemple
`public/nicolabz/` dans une application Angular configurée pour servir
`public`, puis inclure le script synchrone et les feuilles dans le `<head>` du
document HTML principal avec les URL correspondantes, par exemple
`nicolabz/theme.js` et `nicolabz/styles/theme.css`. Inclure également les
feuilles de base et composants si souhaité. Le script ne dépend pas d'Angular ;
un composant Angular peut appeler l'API ci-dessus et écouter l'événement pour
mettre à jour ses contrôles. Adapter les URL à la configuration et au chemin de
base de l'application. Les styles métier restent dans celle-ci.

## Limites

- Aucune publication npm, bibliothèque de framework ni garantie de compatibilité
  d'API versionnée à ce stade ; copier ou servir les fichiers depuis le dépôt.
- La palette sombre est une interprétation de l'identité visuelle, pas une
  extraction du CSS de nicolabz.dev.
- Le formulaire est une démonstration locale sans backend.
- Les tests automatisés couvrent les tokens ; ils ne remplacent pas un audit
  complet d'accessibilité et de compatibilité des navigateurs.
