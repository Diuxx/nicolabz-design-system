# Nicolabz Design System

Base HTML/CSS/JavaScript sans framework ni dépendances externes, avec une
démonstration autonome. La direction visuelle est décrite dans [DESIGN.md](DESIGN.md).

## Démarrer

Ouvrir [demo/index.html](demo/index.html) directement dans un navigateur. Aucun
serveur applicatif ni installation npm n'est nécessaire pour la démonstration.
Node.js 18 ou plus récent est nécessaire pour la génération et les tests.

## Architecture

- [tokens/palette.json](tokens/palette.json) : source de vérité des couleurs,
  rayons et espacements des deux thèmes.
- [scripts/build-tokens.js](scripts/build-tokens.js) : validation et génération.
- [src/styles/theme.css](src/styles/theme.css) : **fichier généré**, à ne jamais
  modifier manuellement. Il contient les variables et les propriétés de rendu
  propres aux thèmes, dont l'opacité et le flou de la forme décorative.
- [src/styles/typography.css](src/styles/typography.css) : styles de base,
  focus et réduction des animations.
- [src/styles/components.css](src/styles/components.css) : composants CSS
  réutilisables.
- [src/theme.js](src/theme.js) : gestion du thème indépendante de la démo.
- [demo/](demo/) : page, présentation spécifique et interactions de démonstration.
- [tests/](tests/) : tests de génération et de validation des tokens.

Après toute modification de la palette, générer et versionner le CSS :

```sh
npm run build
npm run check
npm test
```

`build` valide les tokens requis et régénère le fichier ; `check` vérifie sans
écrire que le fichier existant est à jour ; `test` exécute les tests Node.js.
Une valeur manquante ou invalide provoque une erreur explicite. Le générateur
accepte les couleurs hexadécimales à six chiffres et les dimensions en pixels.
Pour ajouter un token, adapter également la liste et la validation du générateur.

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
