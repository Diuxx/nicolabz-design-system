# Instructions générales

Pour toute création ou modification d'interface :

- Lire et appliquer `DESIGN.md`.
- Respecter les tokens CSS existants.
- Conserver l'esthétique Minimalist Monochrome UI.
- Toujours prendre en charge les thèmes clair et sombre.
- Réutiliser les composants existants avant d'en créer de nouveaux.
- Ne pas introduire de nouvelle direction graphique sans demande explicite.
- Privilégier les composants et conventions existants.
- Ne pas introduire de dépendance UI sans justification.

## Réutilisation du design system

- Ne pas recréer les couleurs et composants existants.
- Utiliser les tokens CSS du design system.
- Ne pas modifier les tokens localement dans les applications.
- Toute évolution globale doit être réalisée dans le dépôt
  nicolabz-design-system.
- Les styles métier spécifiques restent dans l'application.
- Modifier `tokens/palette.json`, puis régénérer `src/styles/theme.css` avec
  `npm run build` ; ne jamais modifier ce fichier généré manuellement.