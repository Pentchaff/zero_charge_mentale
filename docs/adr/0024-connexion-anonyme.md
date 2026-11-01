# Connexion anonyme plutôt que lien magique par e-mail

L'ADR 0007 prévoyait une connexion par lien magique. Sur iPhone, l'app installée sur l'écran d'accueil ne partage pas son stockage avec Safari : le lien reçu par e-mail s'ouvre dans Safari et la session n'arrive jamais dans l'app. Chaque téléphone se connecte donc anonymement (Supabase `signInAnonymously`) ; on rejoint le foyer avec un code d'invitation de 8 caractères. Pas d'e-mail, pas de mot de passe, rien à retenir pour une personne en dépression.

## Conséquences

- Si le stockage de l'app est effacé (navigation privée, navigateur intégré à une messagerie, passage de Safari à l'app installée sur iPhone), le téléphone perd sa session. Chaque membre a donc un **code de retour** personnel de 12 caractères, affiché à la fin de l'inscription et dans les réglages : il rattache le membre existant (avatar, Rikki, avancement personnel) à la nouvelle session. Seule son empreinte est stockée, et en demander un nouveau invalide l'ancien.
- L'app demande au navigateur un stockage durable et avertit quand elle tourne dans un navigateur qui efface tout à la fermeture.
- Le code d'invitation est le seul secret du foyer. Il est assez long pour ne pas être deviné, et un foyer est limité à 6 membres.
- Pour pouvoir récupérer un compte plus tard, on pourra rattacher un e-mail à l'utilisateur anonyme (Supabase le permet) sans changer le modèle de données.

## Options écartées

- Code à usage unique reçu par e-mail : fonctionne dans l'app installée, mais ajoute une étape et une boîte mail à ouvrir.
