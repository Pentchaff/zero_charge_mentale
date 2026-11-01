# Algorithme de la prochaine action : effort, urgence, ancienneté

Quand l'énergie est 🔋 ou ⚡, l'app choisit la prochaine action dans le pot commun selon trois critères, dans cet ordre :

1. **Effort ≤ énergie** : la tâche n'est pas plus lourde que ce que le membre peut faire.
2. **Urgence** : la tâche dont l'échéance naturelle est la plus proche.
3. **Ancienneté** : entre deux tâches d'urgence égale, celle qui n'a pas été faite depuis le plus longtemps.

Si la tâche ne convient pas, « Pas maintenant » en donne une autre. C'est le membre qui affine, pas le code. Pas d'algorithme sophistiqué, pas de machine learning.

Chaque tâche a une fréquence (quotidienne, hebdomadaire, mensuelle) et un jour d'échéance optionnel.
