// Quand afficher un rappel dans l'app (en plus de la notification, si elle
// est activée). Un rappel reste visible quelques heures après son heure, sans
// jamais devenir « en retard » (ADR 0001) : passé ce délai, il disparaît.

import type { Rappel } from './types';

export const FENETRE_RAPPEL_MIN = 3 * 60;

export function jourIso(d: Date): number {
  return d.getDay() === 0 ? 7 : d.getDay();
}

export function cleDuJour(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Le rappel est-il à montrer maintenant ? (heure locale du téléphone) */
export function rappelEnCours(r: Rappel, maintenant: Date): boolean {
  if (!r.actif || !r.jours.includes(jourIso(maintenant))) return false;
  const [h, m] = r.heure.split(':').map(Number);
  const minutes = maintenant.getHours() * 60 + maintenant.getMinutes();
  const debut = h * 60 + m;
  return minutes >= debut && minutes < debut + FENETRE_RAPPEL_MIN;
}

export function fuseauDuTelephone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris';
  } catch {
    return 'Europe/Paris';
  }
}
