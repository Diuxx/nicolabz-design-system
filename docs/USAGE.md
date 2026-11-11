# Utilisation et intégration

Nicolabz Design System fournit des tokens CSS, des composants HTML/CSS, une décoration facultative et un gestionnaire de thèmes. Il fonctionne sans framework et sans dépendance frontend.

## 1. Installation

Le package du dépôt est nommé `@nicolabz/design-system`. Il n'est pas publié sur le registre npm public (`private: true`). Pour un projet utilisant npm, installer le dépôt depuis GitHub :

```sh
npm install "github:Diuxx/nicolabz-design-system#develop"
```

La branche `develop` est pratique pour tester. Pour une application stable, remplacer `develop` par un **tag Git ou un SHA de commit** existant afin de figer la version. Conserver le `package-lock.json` dans le projet consommateur.

Les exports publics du package sont : `theme.css`, `components.css`, `typography.css`, `decorations.css` et `theme.js`.

### Projet avec bundler (Angular, Vite, React, Vue…)

Charger les feuilles globales par le mécanisme habituel du framework ou du bundler :

```js
import "@nicolabz/design-system/theme.css";
import "@nicolabz/design-system/components.css";
import "@nicolabz/design-system/decorations.css"; // Facultatif
import "@nicolabz/design-system/typography.css";  // Facultatif
```

Dans Angular, ces feuilles peuvent également être déclarées dans les styles globaux de la configuration de build. Ne pas les importer dans chaque composant.

`theme.js` utilise `window` et `document` : ne l'exécuter **que dans le navigateur**. Pour appliquer le thème avant le premier affichage, le servir en ressource statique et le charger de manière synchrone dans le `<head>` ; un import JavaScript différé peut provoquer un bref changement de thème.

### Page HTML statique

Copier les fichiers nécessaires depuis une version identifiée du dépôt dans un dossier local (exemple : `assets/nicolabz/`), puis les inclure :

```html
<head>
  <script src="assets/nicolabz/theme.js"></script>
  <link rel="stylesheet" href="assets/nicolabz/styles/theme.css">
  <link rel="stylesheet" href="assets/nicolabz/styles/components.css">
  <link rel="stylesheet" href="assets/nicolabz/styles/decorations.css">
  <link rel="stylesheet" href="assets/nicolabz/styles/typography.css">
</head>
<body class="nz-base">
  <button class="nz-button nz-button-primary">Continuer</button>
</body>
```

Adapter les chemins à l'emplacement réel des ressources. Aucun outil Node.js n'est nécessaire pour consulter cette page.

## 2. Composants et conventions

Les composants réutilisables sont répertoriés dans [`tokens/components.json`](../tokens/components.json) et illustrés dans la [galerie](../demo/index.html). Les principales classes publiques sont :

- `.nz-button`, `.nz-button-primary`, `.nz-button-secondary`
- `.nz-panel`, `.nz-panel-muted`
- `.nz-badge`, `.nz-badge-success`, `.nz-tag`
- `.nz-form-panel`, `.nz-nav-list`
- `.nz-spectrum` (décoration facultative)

**Toujours utiliser le préfixe `nz-` pour les nouvelles intégrations.** Les anciennes classes sans préfixe sont uniquement des alias de compatibilité. Les styles spécifiques à une application restent dans cette application.

Pour les boutons, utiliser les attributs natifs `disabled` et, pour un état de chargement, `aria-busy="true"` avec un libellé visible. Pour les formulaires, utiliser `readonly`, `disabled` et `aria-invalid="true"` en associant un message d'erreur avec `aria-describedby`.

## 3. Tokens et styles de base

Les variables CSS sont générées depuis [`tokens/palette.json`](../tokens/palette.json) :

- Couleurs : `--color-*`
- Espacements : `--space-*`
- Rayons : `--radius-*`

`theme.css` fournit les tokens et les couleurs des deux thèmes ; `components.css` fournit les composants. `typography.css` est facultatif : ses styles de base sont activés uniquement sous `.nz-base` (généralement sur `<body>`).

`decorations.css` fournit la forme Soft Spectrum. Son conteneur doit être positionné dans l'application, derrière le contenu et sans intercepter les interactions :

```html
<div class="nz-spectrum" aria-hidden="true">
  <div class="nz-spectrum__shape"></div>
</div>
```

Placer cette décoration dans un parent avec `position: relative` et `isolation: isolate`, puis contrôler l'empilement du contenu avec `z-index`.

## 4. Thèmes

Le script `theme.js` applique `data-theme="light"` ou `data-theme="dark"` sur l'élément `<html>`. En l'absence de choix enregistré, il suit la préférence système. Le choix explicite est conservé dans `localStorage` sous la clé `nicolabz-theme` lorsque le stockage est accessible.

API navigateur :

```js
window.nicolabzTheme.getTheme();
window.nicolabzTheme.setTheme("dark");
window.nicolabzTheme.toggle();
```

Le script émet l'événement `nicolabz-theme-change` avec `event.detail.theme`. Fournir un contrôle de changement de thème accessible dans chaque application et éviter tout gestionnaire concurrent.

## 5. Développement et mises à jour

Node.js 18+ suffit : aucune installation de dépendance externe n'est requise pour contribuer au dépôt.

```sh
npm run build   # Valide les tokens et régénère src/styles/theme.css
npm run check   # Vérifie la synchronisation sans écrire de fichier
npm test        # Exécute les tests
```

Ne jamais modifier directement `src/styles/theme.css`, car il est généré. Pour ajouter ou modifier un composant, synchroniser le CSS, le catalogue et la démonstration.

Pour mettre à jour une application consommatrice, installer une nouvelle référence Git vérifiée puis contrôler le build et le rendu :

```sh
npm install "github:Diuxx/nicolabz-design-system#REF_STABLE"
```

Remplacer `REF_STABLE` par un tag ou un SHA existant. Si les fichiers sont copiés dans une page HTML statique, remplacer ensemble les ressources issues de la même version.

## 6. Limites actuelles

- Aucune publication sur le registre npm public ni bibliothèque propre à un framework.
- Le catalogue contient un ensemble de composants de base, pas tous les composants d'une application complexe.
- La galerie montre des interactions locales, sans backend.
- Les tests automatisés ne remplacent pas des tests d'accessibilité et de compatibilité en navigateur.

Pour contribuer à l'architecture et aux conventions, consulter les règles internes du dépôt ; pour la direction artistique, consulter [les principes visuels](DESIGN.md).
