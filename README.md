# Zéro Charge Mentale — Rikki

Une application qui sert de hub à une personne ou à un foyer pour lui retirer la charge mentale du quotidien. Sur l'écran d'accueil du téléphone, elle s'appelle **Rikki**, du nom de l'écureuil qui y vit.

👉 **Pour l'installer sur vos téléphones : [docs/INSTALLATION.md](docs/INSTALLATION.md).**

Le produit est défini par un interrogatoire (« grilling ») documenté dans le dépôt :

- [docs/brief.md](docs/brief.md) : le brief initial
- [GLOSSARY.md](GLOSSARY.md) : le vocabulaire du domaine, utilisé tel quel dans le code
- [docs/adr/](docs/adr/) : les décisions d'architecture
- [.claude/skills/](.claude/skills/) : skills Claude Code utilisés pour le cadrage

## La v0

PWA (React + TypeScript + Vite) publiée sur GitHub Pages, données partagées via Supabase hébergé en Europe ([ADR 0023](docs/adr/0023-v0-react-stockage-local.md), [ADR 0024](docs/adr/0024-connexion-anonyme.md)).

- **Onboarding** : langue, créer la maison ou la rejoindre avec un code d'invitation, prénom, avatar, nom de son Rikki. Pas d'e-mail ni de mot de passe. Le foyer type est chargé d'office.
- **Interface principale** : la maison en 3D isométrique (salon, cuisine, chambre, salle de bain), l'avatar et Rikki, la question d'énergie (🪫 / 🔋 / ⚡), puis une seule prochaine action (une micro-étape) avec « Fait », « Pas maintenant » et « Je ne fais jamais ça ». En 🪫 : aucune tâche, juste Rikki.
- **Deux téléphones, une maison** : tâches, avancement et progression synchronisés en temps réel. Quand l'autre a l'app ouverte, son avatar apparaît dans la pièce.
- **Émotes** : câlin, bisou, pat pat. En direct si l'autre est là, sinon le geste l'attend à sa prochaine ouverture ([ADR 0025](docs/adr/0025-emotes-en-attente.md)).
- **Éditeur d'avatar** style Mii : 8 visages, 20 coiffures, 13 yeux, 10 sourcils, 8 nez, 13 bouches, moustaches, barbes, lunettes, couvre-chefs, tenues, et des curseurs de taille, inclinaison, écart et hauteur pour les yeux, les sourcils, le nez et la bouche, plus la silhouette.
- **Éditeur de tâches**, pour tous les membres : nom bilingue, domaine, pièce, fréquence, jour d'échéance, pour qui (tout le foyer, chacun pour soi, seulement moi, seulement l'autre), micro-étapes ordonnées avec effort et aide-mémoire.
- **Rappels personnels** : invisibles pour l'autre, affichés dans l'app à l'heure dite, et en notification si on l'active.
- **Réglages** : prénom, langue, nom de Rikki, notifications, code d'invitation, pièces et couleur de la maison, clé Gemini facultative pour la voix de Rikki, sauvegarde JSON.
- Interface en français et en japonais, choisie par membre.

Sans configuration Supabase, l'app tourne entièrement sur l'appareil (pratique pour développer ou essayer).

## Structure

```
src/
  domaine/     modèle et règles, fonctions pures testées (prochaine action, échéances, progression,
               foyer type, avatar, rappels)
  i18n/        textes FR / JA
  sync/        interface Backend, implémentations locale et Supabase, conversion en lignes
  stockage/    cache local et réglages propres au téléphone
  etat/        contexte React : foyer, membre, présence, émotes, session (énergie, « Pas maintenant »)
  compagnon/   cycle de vie de Rikki, phrases hors-ligne, client Gemini
  ui/          SVG de l'avatar, de Rikki et de la maison isométrique, petits composants
  ecrans/      Onboarding, Accueil, EditeurAvatar, EditeurTaches, EditeurTache, EditeurRappels, Reglages
supabase/
  migrations/  schéma, règles de sécurité (RLS) et fonctions SQL
  functions/   fonction Edge rikki-push (notifications Web Push)
  rappels-cron.sql  planification des rappels
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

Pour développer avec Supabase, copier `.env.example` en `.env.local` et le remplir.
