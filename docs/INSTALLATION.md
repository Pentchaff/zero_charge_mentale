# Installer Rikki sur vos deux téléphones

Ce guide part de zéro et compte environ 30 minutes. Les étapes 1 à 7 suffisent pour que vous partagiez la maison dès demain : tâches synchronisées, avatars, émotes, rappels affichés dans l'app. L'étape 8 (notifications sur l'écran verrouillé) est facultative et peut attendre.

## 1. Créer le projet Supabase (5 min)

1. Sur [supabase.com](https://supabase.com), créer un compte puis **New project**.
2. Région : **Europe** (Paris `eu-west-3` ou Francfort `eu-central-1`), voir l'ADR 0007. Choisir un mot de passe de base de données et le garder quelque part (il ne servira pas à l'app).
3. Attendre que le projet soit prêt (1 à 2 minutes).

## 2. Créer les tables (2 min)

1. Menu de gauche : **SQL Editor** → **New query**.
2. Coller tout le contenu de [`supabase/migrations/20261101000000_rikki.sql`](../supabase/migrations/20261101000000_rikki.sql), puis **Run**. Le message attendu est « Success. No rows returned ».
3. Nouvelle requête : coller [`supabase/migrations/20261102000000_code_retour.sql`](../supabase/migrations/20261102000000_code_retour.sql) (le code de retour), puis **Run**.

Les deux scripts peuvent être relancés sans danger. Si tu avais déjà exécuté le premier, il suffit d'exécuter le second.

## 3. Autoriser la connexion anonyme (1 min)

Rikki ne demande ni e-mail ni mot de passe (ADR 0024).

**Authentication** → **Sign In / Providers** (ou **Providers**, selon la version du tableau de bord) → activer **Allow anonymous sign-ins** → **Save**.

## 4. Récupérer l'adresse et la clé publique (1 min)

**Project Settings** → **API Keys** (ou **Data API**) :

- **Project URL** : `https://xxxxxxxx.supabase.co`
- **Publishable key** (`sb_publishable_…`) ou, sur les anciens projets, la clé **anon public**.

Cette clé est publique par conception : ce sont les règles de sécurité créées à l'étape 2 qui protègent les données. Ne jamais utiliser la clé **secret** / **service_role** dans l'app.

## 5. Configurer GitHub (3 min)

Dans le dépôt GitHub :

1. **Settings** → **Secrets and variables** → **Actions** → onglet **Variables** → **New repository variable** :
   - `SUPABASE_URL` = l'adresse de l'étape 4
   - `SUPABASE_ANON_KEY` = la clé publique de l'étape 4
2. **Settings** → **Pages** → **Source** : **GitHub Actions**.

## 6. Publier l'app (5 min)

Le workflow `.github/workflows/deploy.yml` publie la **branche par défaut** du dépôt (aujourd'hui `claude/cool-goldberg-7g852x`). Il suffit donc de fusionner la branche de la v0 dans la branche par défaut (par une pull request). L'onglet **Actions** montre le déploiement ; à la fin, l'app est en ligne à l'adresse :

**https://pentchaff.github.io/zero_charge_mentale/**

Pour vérifier que la synchro est bien branchée : sur l'écran d'accueil de l'app, le choix « Créer notre maison / Rejoindre avec un code » doit apparaître. S'il ne propose que « Seul·e / À deux », les variables de l'étape 5 n'ont pas été prises en compte : relancer le workflow (**Actions** → **Déployer sur GitHub Pages** → **Run workflow**).

## 7. Installer sur les deux téléphones (5 min)

> Sur iPhone, l'app installée sur l'écran d'accueil ne partage pas ses données avec Safari. Il faut donc **installer d'abord**, puis tout faire depuis l'icône Rikki.

**Ton téléphone (tu crées la maison)**

1. Ouvrir l'adresse de l'étape 6 dans Safari (ou Chrome sur Android).
2. iPhone : bouton **Partager** → **Sur l'écran d'accueil** → **Ajouter**. Android : menu ⋮ → **Installer l'application**.
3. Ouvrir **Rikki** depuis l'écran d'accueil.
4. Français → **Créer notre maison** → **À deux** → prénom, avatar, nom de ton Rikki.
5. L'écran suivant montre le **code d'invitation** (8 caractères) et un bouton **Envoyer l'invitation** (LINE, SMS, etc.). Le code reste disponible dans **Réglages → Le foyer**.

**Le téléphone de ta femme**

1. Elle ouvre le lien reçu dans **Safari**.
2. **Partager** → **Sur l'écran d'accueil** → **Ajouter**.
3. Elle ouvre **Rikki** depuis l'écran d'accueil → **日本語** → **コードで参加する** → elle tape le code → prénom, avatar, nom de son Rikki.

À la fin de l'inscription, chacun voit son **code de retour** (12 caractères) : faites-en une capture d'écran. Il permet de retrouver sa maison, son avatar et son Rikki si le téléphone oublie tout. Il reste disponible dans **Réglages → Mon code de retour**.

C'est tout : vous partagez maintenant la même maison. Quand vous avez tous les deux l'app ouverte, l'avatar de l'autre apparaît dans la pièce ; touchez-le (ou le bouton 💌) pour envoyer un câlin, un bisou ou un pat pat. Si l'autre n'a pas l'app ouverte, le geste l'attend et s'affiche à sa prochaine ouverture.

## 8. (Facultatif) Notifications : rappels et gestes sur l'écran verrouillé

Sans cette étape, les rappels s'affichent dans l'app quand on l'ouvre, et les gestes arrivent à l'ouverture. Avec elle, le téléphone sonne doucement à l'heure du rappel (iPhone : iOS 16.4 minimum, app installée sur l'écran d'accueil).

1. **Clés VAPID** : sur un ordinateur avec Node.js, lancer :

   ```bash
   npx web-push generate-vapid-keys
   ```

   Garder la **Public Key** et la **Private Key**.
2. **GitHub** : ajouter la variable `VAPID_PUBLIC_KEY` (clé publique), puis relancer le déploiement.
3. **Fonction Edge** : Supabase → **Edge Functions** → **Deploy a new function** → **Via Editor** → nom `rikki-push` → coller [`supabase/functions/rikki-push/index.ts`](../supabase/functions/rikki-push/index.ts) → **Deploy**. Dans les réglages de la fonction, **désactiver « Verify JWT with legacy secret » / « Enforce JWT verification »**.

   Avec la CLI, c'est équivalent à :

   ```bash
   npx supabase functions deploy rikki-push --project-ref <REF_PROJET> --no-verify-jwt
   ```

4. **Secrets de la fonction** : **Edge Functions** → **Secrets** :
   - `VAPID_PUBLIC_KEY` = clé publique
   - `VAPID_PRIVATE_KEY` = clé privée
   - `VAPID_SUBJECT` = `mailto:` suivi de ton e-mail
   - `RIKKI_CRON_SECRET` = une longue suite de caractères au hasard
5. **Planification** : ouvrir [`supabase/rappels-cron.sql`](../supabase/rappels-cron.sql), remplacer `<REF_PROJET>` (la partie `xxxxxxxx` de l'adresse Supabase) et `<SECRET_CRON>` (la même valeur que `RIKKI_CRON_SECRET`), puis l'exécuter dans le **SQL Editor**.
6. Dans l'app, sur chaque téléphone : **Réglages → Notifications → Autoriser les notifications sur ce téléphone**. Cocher « Me prévenir quand je reçois un geste » si on le souhaite.

## Développer en local

```bash
cp .env.example .env.local
```

Remplir `.env.local` avec l'adresse et la clé de l'étape 4, puis :

```bash
npm install
```

```bash
npm run dev
```

Sans `.env.local`, l'app tourne entièrement sur l'appareil, sans compte (pratique pour essayer l'interface).

## En cas de souci

| Symptôme | Piste |
| --- | --- |
| « Rikki n'arrive pas à se réveiller » + `connexion_anonyme` | L'étape 3 n'est pas faite. |
| « Ce code ne correspond à aucune maison » | Vérifier les 8 caractères (le tiret est facultatif). |
| Il faut tout refaire en rouvrant l'app | Le navigateur efface ses données à la fermeture : **navigation privée** de Safari, ou lien ouvert **dans LINE, Messenger, Gmail…** (navigateur intégré, l'app affiche alors un avertissement). Ouvrir le lien dans Safari normal, installer sur l'écran d'accueil, puis **J'avais déjà une maison** avec le code de retour. |
| La maison est vide après avoir installé l'app sur l'iPhone | Sur iPhone, Safari et l'app installée sont deux espaces séparés. Dans l'app installée : **J'avais déjà une maison** → code de retour. |
| « Pas disponible ici » pour les notifications | Sur iPhone, ouvrir Rikki depuis l'écran d'accueil (pas depuis Safari), iOS 16.4 ou plus récent, et l'étape 8.2 faite. |
| Les rappels ne sonnent pas | Étapes 8.3 à 8.5 ; dans Supabase, **Edge Functions → rikki-push → Logs** doit montrer un appel par minute. |
