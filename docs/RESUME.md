# Résumé technique

Nicolabz Design System est un design system statique et indépendant des
frameworks, composé de tokens, de styles CSS partagés, d'une gestion de thème
clair/sombre et d'une galerie de composants interactive.

## Architecture

- `tokens/palette.json` est la source de vérité des couleurs, rayons,
  espacements et paramètres décoratifs. `scripts/build-tokens.js` génère
  `src/styles/theme.css`, qui ne doit pas être modifié manuellement.
- `tokens/components.json` décrit les composants, variantes, éléments et états
  implémentés dans `src/styles/components.css`.
- `src/theme.js` applique le thème, suit la préférence système et expose
  l'API `window.nicolabzTheme`.
- `demo/index.html` et `demo/demo.css` présentent les composants par catégorie.
  Les exemples HTML proviennent des mêmes modèles `<template>` que les aperçus ;
  `demo/demo.js` gère leur rendu, la copie, le formulaire local et le sélecteur
  de thème.
- `tests/build-tokens.test.js` valide la génération des tokens et la cohérence
  du catalogue avec les styles et les exemples de la démo.

## Conventions

- `typography.css` est facultatif et s’active via `class="nz-base"` sur `<body>`.
- `--color-control-border` assure la lisibilité des contours de champs.


- Modifier `tokens/palette.json`, puis lancer `npm run build`; ne jamais éditer
  directement le CSS généré.
- Synchroniser catalogue, styles partagés et démonstration lorsqu'un composant,
  une variante ou un état évolue.
- Garder les exemples accessibles, responsive et sans dépendances externes.

## Évolutions P1

- Les composants CSS et le catalogue utilisent les sélecteurs publics `nz-*`;
  les anciens sélecteurs restent des alias transitoires.
- `src/styles/decorations.css` fournit la forme Soft Spectrum réutilisable ;
  la galerie ne conserve que son placement.
- Les espacements courants utilisent les tokens `--space-*` et les
  boutons / champs exposent les états désactivé, chargement, erreur et lecture seule.
- `tests/p1-components.test.js` vérifie les sélecteurs, états et la décoration.
