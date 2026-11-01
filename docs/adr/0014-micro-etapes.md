# Les grosses tâches sont décomposées en micro-étapes

Une personne en dépression ne peut pas « nettoyer la salle de bain ». Elle peut « passer un coup de produit à vitre sur le miroir ». L'app ne propose jamais une tâche grosse en bloc : elle la découpe en micro-étapes concrètes, présentées une par une dans l'ordre logique (trouver le matériel → nettoyer surface par surface → ranger le matériel).

Chaque micro-étape peut porter un aide-mémoire contextuel (« le chiffon à poussière est dans le deuxième tiroir ») configuré par l'aidant. L'aide-mémoire s'affiche avec la micro-étape.

## Conséquences

- Le modèle de données change : une tâche a une liste ordonnée de micro-étapes, chacune avec un effort, un texte et un aide-mémoire optionnel.
- La prochaine action (ADR 0013) propose une micro-étape, pas une tâche entière. Le membre peut s'arrêter entre deux micro-étapes sans conséquence.
- L'aidant est celui qui décompose les tâches et écrit les aide-mémoire. Le foyer type fournit des décompositions par défaut.
