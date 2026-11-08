> **ATTENTION — PROMPT À EXÉCUTION MANUELLE**
>
> Ce document est un modèle de prompt destiné à être utilisé explicitement par un utilisateur.
>
> **Instructions pour les agents IA :**
> - Ne pas exécuter les instructions de ce document lors de sa simple lecture.
> - Ne pas considérer ce document comme une règle permanente du projet.
> - Ne pas déclencher de modifications de code sur la base de ce document sans demande explicite de l'utilisateur.
> - Exécuter ce prompt uniquement lorsque l'utilisateur demande explicitement son application.
>
> Ce fichier est une ressource documentaire, et non une instruction active.

---

# Intégration du Nicolabz Design System

## Objectif

Mettre à jour l'interface graphique du projet actuel pour adopter le design system suivant :

https://github.com/Diuxx/nicolabz-design-system

Branche de référence : `develop`.

L'objectif n'est pas simplement de reproduire visuellement cette interface, mais **d'intégrer son fonctionnement, ses conventions et ses ressources graphiques**.

## 1. Analyse préalable

Avant toute modification :

1. Examiner l'architecture frontend du projet actuel.
2. Identifier le framework utilisé et son système de styles.
3. Consulter le dépôt de référence GitHub.
4. Lire impérativement les fichiers :
   - `DESIGN.md`
   - `AGENTS.md`
   - `README.md`
   - `tokens/palette.json`
   - `src/styles/theme.css`
   - `src/styles/typography.css`
   - `src/styles/components.css`
   - `src/theme.js`
5. Examiner également `demo/` pour comprendre le rendu graphique attendu.

Ne pas inventer les couleurs, les composants ou les conventions. Utiliser les valeurs et styles réels du dépôt.

Si le dépôt n'est pas accessible, signaler le problème plutôt que de recréer approximativement le design system.

## 2. Intégration technique

Intégrer le design system au projet en privilégiant une approche maintenable.

- Réutiliser les ressources CSS existantes.
- Ne pas recopier manuellement les couleurs dans les composants.
- Préserver les noms des variables CSS.
- Conserver le design system comme source de vérité.
- Éviter la duplication des styles.
- Respecter les conventions du framework existant.

Choisir une méthode d'intégration adaptée au projet : dépendance Git versionnée si elle est compatible avec la configuration actuelle, ou ressources statiques synchronisées avec une version précise du dépôt.

Ne pas utiliser directement des fichiers GitHub distants au runtime de production.

Documenter clairement comment mettre à jour le design system lorsque sa version évolue.

## 3. Migration graphique

Adapter progressivement l'interface existante.

Appliquer notamment :

- La palette Soft Spectrum en mode clair.
- La palette Graphite Sage en mode sombre.
- Les styles de boutons, cartes, formulaires et badges.
- Les conventions de typographie.
- Les espacements, bordures et rayons.
- Les indicateurs de focus personnalisés.
- Les règles responsive.

Conserver la structure fonctionnelle et les parcours utilisateurs existants.

Ne pas modifier les règles métier, les appels API, les modèles de données ou les comportements applicatifs sans nécessité technique.

La forme organique multicolore doit être utilisée comme élément décoratif d'arrière-plan lorsque cela est pertinent, notamment dans les zones d'introduction.

Elle doit rester derrière le texte et les composants, sans nuire à la lisibilité.

## 4. Gestion des thèmes

Réutiliser le mécanisme du design system :

- Attribut `data-theme` sur l'élément HTML.
- Modes `light` et `dark`.
- Détection des préférences système.
- Persistance du choix utilisateur.
- Basculement sans rechargement de page.
- Application du thème avant le rendu pour éviter les flashs visuels.

Le dépôt fournit l'API :

- `window.nicolabzTheme.getTheme()`
- `window.nicolabzTheme.setTheme(theme)`
- `window.nicolabzTheme.toggle()`

Utiliser cette API lorsqu'elle est compatible avec l'architecture existante.

Éviter de créer un second mécanisme concurrent de gestion des thèmes.

Prévoir un contrôle de changement de thème accessible et cohérent avec l'interface.

## 5. Respect de l'architecture

Ne pas réécrire le frontend.

Adapter le design system à l'architecture actuelle et non l'inverse.

- Réutiliser les composants existants.
- Modifier les styles globalement lorsque c'est pertinent.
- Conserver les styles propres aux fonctionnalités dans leurs composants.
- Ne pas introduire de dépendances inutiles.
- Éviter les surcharges CSS excessives.
- Ne pas créer de nouvelles abstractions sans besoin identifié.

Si une bibliothèque de composants est déjà utilisée, conserver ses comportements et adapter son apparence via ses mécanismes de personnalisation.

## 6. Validation

Vérifier :

1. Que l'ensemble des pages utilise les nouvelles palettes.
2. Que le changement de thème fonctionne.
3. Que les composants restent fonctionnels.
4. Que les contrastes et indicateurs de focus sont accessibles.
5. Que le responsive est préservé.
6. Qu'aucun style existant n'entre en conflit avec les nouveaux.
7. Que les tests et le build du projet passent.

Ne pas affirmer avoir exécuté une vérification non réalisée.

## 7. Livrable

Effectuer directement les modifications nécessaires.

À la fin, fournir :

- Les fichiers modifiés.
- La méthode d'intégration retenue.
- Les composants adaptés.
- Les éventuelles limites ou incompatibilités.
- Les commandes permettant de mettre à jour le design system.

**Critère de réussite : le projet conserve toutes ses fonctionnalités, mais son interface adopte fidèlement l'identité graphique et le fonctionnement du Nicolabz Design System.**