# DESIGN.md — Nicolabz Design System

## 1. Direction artistique

Créer des interfaces modernes, minimalistes et fonctionnelles.

Style : **Minimalist Monochrome UI / Soft Spectrum**.

L'interface doit privilégier :
- La simplicité visuelle.
- Une typographie lisible et une hiérarchie claire.
- Des espaces généreux et réguliers.
- Des composants sobres et cohérents.
- Une utilisation très limitée des couleurs.
- Une esthétique professionnelle, légère et intemporelle.

**Règle principale :** ne jamais introduire une nouvelle esthétique sans justification. Conserver l'identité graphique existante.

## 2. Thèmes

L'interface doit prendre en charge les modes clair et sombre.

### Mode clair — Soft Spectrum

- Fond principal : `#FAFAF8`
- Surfaces : `#FFFFFF`
- Texte principal : `#17191C`
- Texte secondaire : `#656B6B`
- Bordures : `#E2E5E1`
- Boutons principaux : noir avec texte blanc

Une forme organique multicolore peut apparaître en arrière-plan.

Couleurs de la forme :
- Lavande : `#D7C7F5`
- Bleu : `#B9DDE8`
- Pêche : `#F1CDBE`
- Menthe : `#C7E5D2`

La forme doit rester translucide, douce, floutée et placée **derrière l'ensemble du contenu**, jamais au-dessus des composants.

### Mode sombre — Graphite Sage

- Fond principal : `#111513`
- Surfaces : `#1A201C`
- Texte principal : `#EDF1ED`
- Texte secondaire : `#A0ABA2`
- Bordures : `#343E37`
- Accent : `#A5BDA9`

Conserver une esthétique sobre et sombre, sans dégradés trop visibles.

## 3. Composants

### Cartes
- Fond uni.
- Bordure fine de 1 px.
- Coins légèrement arrondis (14 px).
- Pas d'ombres importantes.
- Espacement interne de 24 px.

### Boutons
- Design compact.
- Coins arrondis de 8 px.
- Couleur principale issue du thème.
- Effet hover discret.
- Pas de dégradés sur les boutons.

### Formulaires
- Labels courts et lisibles.
- Champs simples avec bordures fines.
- Hauteur minimale de 42 px.
- Focus discret utilisant la couleur d'accent.
- Ne pas utiliser le contour bleu natif comme seule indication de focus.

### Typographie
- Police système ou Inter.
- Titres avec un contraste typographique marqué.
- Corps de texte simple et lisible.
- Labels techniques en police monospace.
- Pas de typographies décoratives.

## 4. Mise en page

- Largeur maximale du contenu : 1160 px.
- Espacements cohérents basés sur des multiples de 4 px.
- Favoriser les grilles simples.
- Éviter les composants surchargés.
- Respecter les adaptations mobiles.
- Conserver des zones de respiration autour des contenus.

## 5. Gestion des couleurs

Toujours utiliser des variables CSS sémantiques :

- `--color-background`
- `--color-surface`
- `--color-text`
- `--color-text-secondary`
- `--color-border`
- `--color-accent`
- `--color-button`

Ne jamais ajouter de couleurs hexadécimales directement dans un nouveau composant si un token existant convient.

## 6. Interdictions

Ne pas :
- Ajouter des couleurs vives sans nécessité fonctionnelle.
- Utiliser de grosses ombres portées.
- Ajouter du glassmorphism systématiquement.
- Multiplier les bordures épaisses.
- Utiliser des animations excessives.
- Introduire un nouveau style de bouton ou de carte sans raison.
- Placer les éléments décoratifs au-dessus du contenu.
- Modifier la palette pour un composant isolé.

## 7. Instructions pour l'agent

Avant toute modification d'interface :

1. Examiner les composants et styles existants.
2. Réutiliser les tokens et composants disponibles.
3. Respecter les conventions de ce document.
4. Préserver la cohérence entre les modes clair et sombre.
5. Maintenir l'accessibilité et le responsive.
6. Éviter d'ajouter des dépendances UI inutiles.
7. Privilégier une modification simple et localisée.

En cas d'ambiguïté visuelle, privilégier systématiquement la solution la plus minimaliste et cohérente avec l'existant.