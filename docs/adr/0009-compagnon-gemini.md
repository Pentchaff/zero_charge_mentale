# Le compagnon parle via l'API Gemini

Le compagnon ne dit pas des phrases tirées d'une liste : il parle avec un modèle de langage (Gemini) piloté par un prompt système personnel hébergé sur un serveur privé du foyer. Cela lui donne une personnalité cohérente et une capacité à varier ses réponses. Le prompt système définit le ton (ami bienveillant, jamais coach), les interdits (aucune référence au temps écoulé, au nombre de tâches, aucun reproche) et le vocabulaire aligné sur le glossaire du projet.

Le serveur privé est nécessaire pour deux raisons : le prompt système contient la personnalité du compagnon (donnée sensible du foyer) et les appels à Gemini nécessitent une clé API qui ne doit pas être exposée côté client.

## Conséquences

- L'app n'est plus 100 % statique (ADR 0004 reste vrai pour le front, mais un serveur privé entre en jeu pour les réponses du compagnon).
- Un fallback hors-ligne est nécessaire : quand le serveur ou Gemini est injoignable, le compagnon affiche une animation muette ou une phrase générique pré-enregistrée, sans jamais paraître cassé.
