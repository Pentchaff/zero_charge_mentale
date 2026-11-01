# Zéro Charge Mentale — Rikki

Une application qui sert de hub à une personne ou à un foyer pour lui retirer la charge mentale du quotidien. Sur l'écran d'accueil du téléphone, elle s'appelle **Rikki**, du nom de l'écureuil qui y vit.

Le produit est défini par un interrogatoire (« grilling ») documenté dans le dépôt :

- [docs/brief.md](docs/brief.md) : le brief initial
- [GLOSSARY.md](GLOSSARY.md) : le vocabulaire du domaine, utilisé tel quel dans le code
- [docs/adr/](docs/adr/) : les décisions d'architecture
- [.claude/skills/](.claude/skills/) : skills Claude Code utilisés pour le cadrage

## La v0

PWA statique (React + TypeScript + Vite), données enregistrées sur l'appareil ([ADR 0023](docs/adr/0023-v0-react-stockage-local.md)).

- **Onboarding** : langue, seul ou à deux, prénom, avatar, nom de son Rikki. Le foyer type est chargé d'office.
- **Interface principale** : la maison, l'avatar et Rikki, la question d'énergie (🪫 / 🔋 / ⚡), puis une seule prochaine action (une micro-étape) avec « Fait », « Pas maintenant » et « Je ne fais jamais ça ». En 🪫 : aucune tâche, juste Rikki.
- **Éditeur d'avatar** style Mii : vignettes, couleurs, bouton « au hasard ». Certaines options arrivent avec la progression.
- **Éditeur de tâches** (aidant) : nom bilingue, domaine, pièce, fréquence, jour d'échéance, pour qui, micro-étapes ordonnées avec effort et aide-mémoire.
- **Réglages** : prénom, langue, nom de Rikki, pièces et couleur de la maison, membres de l'appareil, clé Gemini facultative pour la voix de Rikki, sauvegarde JSON.
- Interface en français et en japonais, choisie par membre.

Pas encore là : synchronisation Supabase, lien d'invitation, émotes, rappel de médicament.

## Structure

```
src/
  domaine/     modèle et règles, fonctions pures testées (prochaine action, échéances, progression, foyer type)
  i18n/        textes FR / JA
  stockage/    interface Depot et implémentation locale
  etat/        contexte React : foyer, membre actif, session (énergie, « Pas maintenant »)
  compagnon/   cycle de vie de Rikki, phrases hors-ligne, client Gemini
  ui/          SVG de l'avatar, de Rikki et de la maison, petits composants
  ecrans/      Onboarding, Accueil, EditeurAvatar, EditeurTaches, EditeurTache, Reglages
public/        manifest, service worker, icônes
```

## Développer

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run build
```

Le déploiement sur GitHub Pages se fait par `.github/workflows/deploy.yml` à chaque push sur `main` (activer une fois Settings → Pages → Source : GitHub Actions).
