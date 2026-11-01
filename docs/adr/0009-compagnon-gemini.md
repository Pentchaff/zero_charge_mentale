# Le compagnon parle via l'API Gemini, appelée depuis le smartphone

Le compagnon parle avec un modèle de langage (Gemini) piloté par un prompt système stocké dans Supabase. La clé API Gemini est stockée sur le smartphone du membre (pas de serveur privé intermédiaire). L'appel part directement du client vers l'API Gemini.

Le prompt système définit le ton (ami bienveillant, jamais coach), les interdits (aucune référence au temps écoulé, au nombre de tâches, aucun reproche) et le vocabulaire aligné sur le glossaire du projet.

## Conséquences

- Pas de serveur privé à maintenir : l'architecture reste une PWA + Supabase (ADR 0004, ADR 0007).
- La clé API est exposée côté client. Risque acceptable : l'app est utilisée par deux personnes connues, pas le grand public. Si l'app s'ouvre un jour, il faudra passer par un proxy serveur.
- Un fallback hors-ligne est nécessaire : quand Gemini est injoignable, le compagnon affiche une animation muette ou une phrase générique pré-enregistrée, sans jamais paraître cassé.
