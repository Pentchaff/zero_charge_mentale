---
status: proposed
---

# Une émote attend l'autre membre, et peut le prévenir s'il l'a demandé

L'ADR 0011 décrivait des émotes visibles seulement quand les deux membres sont dans l'app. En pratique, l'un est au travail pendant que l'autre est à la maison : ils ne sont presque jamais en ligne en même temps. Une émote envoyée à un membre absent est donc gardée (une seule par destinataire, la plus récente remplace la précédente) et s'affiche à sa prochaine ouverture, puis elle est effacée. Il n'y a toujours ni historique, ni compteur, ni trace de qui a envoyé quoi et quand (ADR 0005). La présence, elle, reste stricte : l'avatar de l'autre n'apparaît que s'il a l'app ouverte, et il disparaît dès qu'elle passe en arrière-plan.

Le membre peut aussi choisir d'être prévenu par une notification quand il reçoit un geste. C'est une deuxième exception à l'ADR 0006, au même titre que le rappel de médicament : désactivée par défaut, activée par le membre lui-même.
