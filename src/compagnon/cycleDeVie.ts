// Cycle de vie de Rikki : il « existe » même quand le membre ne fait rien.
// Ses activités autonomes suivent l'heure du jour, jamais l'activité du membre.

export type ActiviteRikki = 'eveille' | 'dort' | 'grignote' | 'fenetre';

/** Ce que fait Rikki quand personne ne lui demande rien, selon l'heure locale. */
export function activiteSelonHeure(heure: number): ActiviteRikki {
  if (heure >= 23 || heure < 7) return 'dort';
  if (heure === 8 || heure === 12 || heure === 19) return 'grignote';
  if (heure >= 15 && heure < 17) return 'fenetre';
  return 'eveille';
}

export type MomentJournee = 'matin' | 'jour' | 'soir' | 'nuit';

/** Pour la couleur du ciel par la fenêtre de la maison. */
export function momentSelonHeure(heure: number): MomentJournee {
  if (heure >= 6 && heure < 10) return 'matin';
  if (heure >= 10 && heure < 18) return 'jour';
  if (heure >= 18 && heure < 21) return 'soir';
  return 'nuit';
}
