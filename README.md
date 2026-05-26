# MyLittleHero

Plateforme premium de mini-films personnalisés pour enfants — homepage marketing (v1).

## Stack

- Next.js (App Router)
- React
- Tailwind CSS v4
- TypeScript

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    Header.tsx
    Hero.tsx
    MoviePosterGrid.tsx
    HowItWorks.tsx
    ThemeSection.tsx
    ParentTrustSection.tsx
    CTAFooter.tsx
    ui/Button.tsx
  lib/
    data.ts
```

## Remplacer les images du mur d'affiches (hero)

Fichier central : `src/lib/leo-example-posters.ts` (réexporté par `hero-posters.ts`)

- Format recommandé : **1080 × 1620 px** (ratio 2:3)
- Fichiers dans `public/posters/`

Les cinq affiches d'exemple sont dans `public/posters/` (voir `src/lib/leo-example-posters.ts`).

## Prochaines étapes
- Parcours upload photo, choix du thème et paiement
