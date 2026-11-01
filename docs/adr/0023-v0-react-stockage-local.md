# v0 : React + TypeScript + Vite, données sur l'appareil

La v0 est une PWA React + TypeScript construite par Vite, déployée sur GitHub Pages par GitHub Actions (ADR 0004). Le foyer est enregistré dans le navigateur (localStorage) derrière une interface `Depot` ; Supabase (ADR 0007) viendra comme une autre implémentation de cette interface. Commencer sans serveur permet de faire essayer l'app à la première utilisatrice tout de suite, sans compte ni e-mail.

## Conséquences

- Sans synchronisation, les deux membres d'un foyer partagent un même appareil : le second membre se crée depuis l'onboarding ou les réglages, et on passe de l'un à l'autre en touchant son avatar. Le lien d'invitation et les émotes (ADR 0011) attendent Supabase.
- Le domaine (`src/domaine/`) est fait de fonctions pures sans dépendance à React ni au stockage : c'est ce qui sera synchronisé tel quel.
- Une sauvegarde manuelle (export / import JSON) évite de perdre le foyer en attendant la synchronisation.
- Le prompt système de Rikki vit dans le code en attendant d'être stocké dans Supabase (ADR 0009).

## Options écartées

- Preact ou JavaScript sans framework : plus léger, mais React est plus simple à faire évoluer et à faire relire.
- Brancher Supabase dès la v0 : demande un compte, un projet et la gestion de l'authentification avant même de savoir si l'app plaît.
