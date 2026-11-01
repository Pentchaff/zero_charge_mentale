# v0 : React + TypeScript + Vite, un mode local derrière la même interface que Supabase

La v0 est une PWA React + TypeScript construite par Vite, déployée sur GitHub Pages par GitHub Actions (ADR 0004). Le stockage passe par une interface `Backend` à deux implémentations : Supabase (ADR 0007, ADR 0024) quand l'app est construite avec `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, sinon tout dans le navigateur (localStorage). Le mode local sert au développement, aux tests et à essayer l'interface sans rien configurer.

## Conséquences

- En mode local, les deux membres d'un foyer partagent un même appareil : le second membre se crée depuis l'onboarding ou les réglages, et on passe de l'un à l'autre en touchant son avatar. Le code d'invitation, la présence et les notifications n'existent qu'avec Supabase.
- Le domaine (`src/domaine/`) est fait de fonctions pures sans dépendance à React ni au stockage. La synchro compare l'état avant et après chaque action et n'envoie que les lignes modifiées ; les modifications faites hors-ligne attendent dans une file enregistrée sur le téléphone.
- Une sauvegarde manuelle (export JSON) reste disponible dans les deux modes.
- Le prompt système de Rikki vit dans le code en attendant d'être stocké dans Supabase (ADR 0009).

## Options écartées

- Preact ou JavaScript sans framework : plus léger, mais React est plus simple à faire évoluer et à faire relire.
