// Calcul de l'échéance naturelle d'une tâche (ADR 0013).
// Tout est en heure locale : « aujourd'hui » est celui du membre.

import type { Frequence } from './types';

export const JOUR_MS = 24 * 60 * 60 * 1000;

export function debutDuJour(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function ajouterJours(t: number, n: number): number {
  const d = new Date(t);
  d.setDate(d.getDate() + n);
  return d.getTime();
}

function ajouterMois(t: number, n: number): number {
  const d = new Date(t);
  d.setMonth(d.getMonth() + n);
  return d.getTime();
}

/** Premier jour (début de journée) ≥ `depuis` qui tombe sur le jour de semaine voulu. */
function prochainJourSemaine(depuis: number, jourSemaine: number): number {
  let t = debutDuJour(depuis);
  for (let i = 0; i < 7; i++) {
    if (new Date(t).getDay() === jourSemaine) return t;
    t = ajouterJours(t, 1);
  }
  return t;
}

/** Premier jour (début de journée) ≥ `depuis` qui tombe sur le quantième voulu. */
function prochainQuantieme(depuis: number, quantieme: number): number {
  const d = new Date(debutDuJour(depuis));
  if (d.getDate() > quantieme) d.setMonth(d.getMonth() + 1);
  d.setDate(quantieme);
  return d.getTime();
}

/**
 * Échéance naturelle (début de journée, en ms) de la prochaine exécution.
 *
 * - Jamais faite : due tout de suite, ou au prochain jour d'échéance s'il y en a un.
 * - Avec un jour d'échéance, faire la tâche un peu en avance ou un peu en
 *   retard compte pour l'échéance la plus proche : on tolère une
 *   demi-période de part et d'autre. Pas de notion de « retard » cumulé.
 */
export function prochaineEcheance(
  frequence: Frequence,
  jourEcheance: number | undefined,
  derniereFois: number | undefined,
  maintenant: number,
): number {
  if (derniereFois === undefined) {
    if (jourEcheance === undefined || frequence === 'quotidienne') return debutDuJour(maintenant);
    return frequence === 'hebdomadaire'
      ? prochainJourSemaine(maintenant, jourEcheance)
      : prochainQuantieme(maintenant, jourEcheance);
  }

  const jourFait = debutDuJour(derniereFois);
  switch (frequence) {
    case 'quotidienne':
      return ajouterJours(jourFait, 1);
    case 'hebdomadaire':
      return jourEcheance === undefined
        ? ajouterJours(jourFait, 7)
        : prochainJourSemaine(ajouterJours(jourFait, 4), jourEcheance);
    case 'mensuelle':
      return jourEcheance === undefined
        ? ajouterMois(jourFait, 1)
        : prochainQuantieme(ajouterJours(jourFait, 16), jourEcheance);
  }
}

/** La tâche est-elle à faire aujourd'hui (échéance atteinte) ? */
export function estDue(echeance: number, maintenant: number): boolean {
  return echeance <= debutDuJour(maintenant);
}
