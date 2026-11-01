# Les compagnons des deux membres interagissent via des émotes

Quand les deux membres sont dans l'app, leurs écureuils apparaissent côte à côte et font des animations communes. Un membre peut envoyer une émote au compagnon de l'autre : câlin, bisou, pat pat sur la tête. L'autre voit son écureuil recevoir le geste. C'est un canal d'attention, pas de communication : on ne dit rien, on montre qu'on pense à l'autre.

## Conséquences

- Synchronisation temps réel de l'état des compagnons via Supabase (ADR 0007).
- Le compagnon de l'autre n'est visible que lorsqu'il est en ligne : pas de fantôme ni de trace de la dernière connexion (ADR 0005, ADR 0006).
- L'émote est éphémère : pas d'historique des gestes envoyés.
