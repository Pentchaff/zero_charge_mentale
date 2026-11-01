// Choix de la prochaine action (ADR 0002, 0012, 0013, 0014, 0016).
// Volontairement simple : effort ≤ énergie, puis urgence, puis ancienneté.
// C'est le membre qui affine avec « Pas maintenant », pas le code.

import { estDue, prochaineEcheance } from './temps';
import type { Avancement, Effort, Energie, Foyer, MembreId, MicroEtape, Tache, TacheId } from './types';

/** Efforts acceptables pour chaque énergie. 🪫 : aucun (mode pile vide, ADR 0012). */
export const EFFORTS_PAR_ENERGIE: Record<Energie, readonly Effort[]> = {
  vide: [],
  normale: ['leger', 'moyen'],
  pleine: ['leger', 'moyen', 'lourd'],
};

export interface ProchaineAction {
  tache: Tache;
  etape: MicroEtape;
  /** Index de la micro-étape dans la tâche (0-based). */
  index: number;
  echeance: number;
}

/** Clé d'avancement : partagée pour le pot commun, propre au membre pour une tâche personnelle. */
export function cleAvancement(tache: Tache, membreId: MembreId): string {
  return tache.portee.type === 'chacun' ? membreId : 'commun';
}

export function avancementDe(tache: Tache, membreId: MembreId): Avancement {
  return tache.avancement[cleAvancement(tache, membreId)] ?? { etape: 0 };
}

export function concerne(tache: Tache, membreId: MembreId): boolean {
  return tache.portee.type !== 'membre' || tache.portee.membreId === membreId;
}

export interface OptionsChoix {
  /** Tâches repoussées par « Pas maintenant » pendant cette ouverture de l'app. */
  exclues?: ReadonlySet<TacheId>;
  /** Proposer aussi les tâches pas encore dues (le membre en a envie). */
  ignorerEcheance?: boolean;
}

export function candidates(
  foyer: Foyer,
  membreId: MembreId,
  energie: Energie,
  maintenant: number,
  options: OptionsChoix = {},
): ProchaineAction[] {
  const effortsOk = EFFORTS_PAR_ENERGIE[energie];
  if (effortsOk.length === 0) return [];

  const resultat: ProchaineAction[] = [];
  for (const tache of foyer.taches) {
    if (tache.ecartee || tache.microEtapes.length === 0) continue;
    if (!concerne(tache, membreId)) continue;
    if (options.exclues?.has(tache.id)) continue;

    const av = avancementDe(tache, membreId);
    const index = Math.min(av.etape, tache.microEtapes.length - 1);
    const etape = tache.microEtapes[index];
    if (!effortsOk.includes(etape.effort)) continue;

    const echeance = prochaineEcheance(tache.frequence, tache.jourEcheance, av.derniereFois, maintenant);
    // Une tâche commencée reste proposée jusqu'au bout, même si elle n'est pas « due ».
    const commencee = index > 0;
    if (!options.ignorerEcheance && !commencee && !estDue(echeance, maintenant)) continue;

    resultat.push({ tache, etape, index, echeance });
  }

  return resultat.sort((a, b) => {
    if (a.echeance !== b.echeance) return a.echeance - b.echeance;
    const da = avancementDe(a.tache, membreId).derniereFois ?? -Infinity;
    const db = avancementDe(b.tache, membreId).derniereFois ?? -Infinity;
    if (da !== db) return da - db;
    return 0; // tri stable : à égalité, l'ordre du foyer (le foyer type commence par le plus doux)
  });
}

export function prochaineAction(
  foyer: Foyer,
  membreId: MembreId,
  energie: Energie,
  maintenant: number,
  options: OptionsChoix = {},
): ProchaineAction | null {
  return candidates(foyer, membreId, energie, maintenant, options)[0] ?? null;
}
