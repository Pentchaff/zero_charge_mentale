// Trois axes de progression, un seul compteur (ADR 0020, ADR 0022).
// Le compteur ne recule jamais : rien ne se perd, rien ne se « reverrouille ».

import type { Coiffe, Lunettes, Tenue } from './types';

export type Axe = 'rikki' | 'avatar' | 'maison';

export type Decoration =
  | 'plante'
  | 'tableau'
  | 'tapis'
  | 'lampe'
  | 'coussins'
  | 'guirlande'
  | 'etagere'
  | 'aquarium';

export type AccessoireRikki = 'echarpe' | 'feuille' | 'glandDore' | 'cape';

export type Recompense =
  | { id: string; seuil: number; axe: 'maison'; decoration: Decoration }
  | { id: string; seuil: number; axe: 'rikki'; accessoire: AccessoireRikki }
  | { id: string; seuil: number; axe: 'avatar'; coiffe: Coiffe }
  | { id: string; seuil: number; axe: 'avatar'; lunettes: Lunettes }
  | { id: string; seuil: number; axe: 'avatar'; tenue: Tenue };

/** Paliers entrelacés : chaque petite tranche de micro-étapes donne quelque chose de visible. */
export const PALIERS: readonly Recompense[] = [
  { id: 'maison:plante', seuil: 2, axe: 'maison', decoration: 'plante' },
  { id: 'avatar:fleur', seuil: 5, axe: 'avatar', coiffe: 'fleur' },
  { id: 'rikki:echarpe', seuil: 8, axe: 'rikki', accessoire: 'echarpe' },
  { id: 'maison:tableau', seuil: 12, axe: 'maison', decoration: 'tableau' },
  { id: 'avatar:rayures', seuil: 16, axe: 'avatar', tenue: 'rayures' },
  { id: 'maison:tapis', seuil: 20, axe: 'maison', decoration: 'tapis' },
  { id: 'rikki:feuille', seuil: 25, axe: 'rikki', accessoire: 'feuille' },
  { id: 'avatar:soleil', seuil: 30, axe: 'avatar', lunettes: 'soleil' },
  { id: 'maison:lampe', seuil: 36, axe: 'maison', decoration: 'lampe' },
  { id: 'avatar:casque', seuil: 42, axe: 'avatar', coiffe: 'casque' },
  { id: 'maison:coussins', seuil: 48, axe: 'maison', decoration: 'coussins' },
  { id: 'rikki:glandDore', seuil: 55, axe: 'rikki', accessoire: 'glandDore' },
  { id: 'avatar:salopette', seuil: 62, axe: 'avatar', tenue: 'salopette' },
  { id: 'maison:guirlande', seuil: 70, axe: 'maison', decoration: 'guirlande' },
  { id: 'avatar:kimono', seuil: 80, axe: 'avatar', tenue: 'kimono' },
  { id: 'maison:etagere', seuil: 90, axe: 'maison', decoration: 'etagere' },
  { id: 'rikki:cape', seuil: 100, axe: 'rikki', accessoire: 'cape' },
  { id: 'avatar:couronne', seuil: 115, axe: 'avatar', coiffe: 'couronne' },
  { id: 'maison:aquarium', seuil: 130, axe: 'maison', decoration: 'aquarium' },
];

export function recompensesDebloquees(compteur: number): Recompense[] {
  return PALIERS.filter((r) => r.seuil <= compteur);
}

/** Récompenses gagnées en passant de `avant` à `apres`. */
export function nouvellesRecompenses(avant: number, apres: number): Recompense[] {
  return PALIERS.filter((r) => r.seuil > avant && r.seuil <= apres);
}

/** Options d'avatar verrouillées au départ ; tout le reste est libre dès l'onboarding. */
export const COIFFES_A_DEBLOQUER: readonly Coiffe[] = ['fleur', 'casque', 'couronne'];
export const LUNETTES_A_DEBLOQUER: readonly Lunettes[] = ['soleil'];
export const TENUES_A_DEBLOQUER: readonly Tenue[] = ['rayures', 'salopette', 'kimono'];

export function coiffesDisponibles(compteur: number, toutes: readonly Coiffe[]): Coiffe[] {
  const gagnees = new Set(recompensesDebloquees(compteur).flatMap((r) => ('coiffe' in r ? [r.coiffe] : [])));
  return toutes.filter((c) => !COIFFES_A_DEBLOQUER.includes(c) || gagnees.has(c));
}

export function lunettesDisponibles(compteur: number, toutes: readonly Lunettes[]): Lunettes[] {
  const gagnees = new Set(recompensesDebloquees(compteur).flatMap((r) => ('lunettes' in r ? [r.lunettes] : [])));
  return toutes.filter((l) => !LUNETTES_A_DEBLOQUER.includes(l) || gagnees.has(l));
}

export function tenuesDisponibles(compteur: number, toutes: readonly Tenue[]): Tenue[] {
  const gagnees = new Set(recompensesDebloquees(compteur).flatMap((r) => ('tenue' in r ? [r.tenue] : [])));
  return toutes.filter((t) => !TENUES_A_DEBLOQUER.includes(t) || gagnees.has(t));
}

export function decorationsDebloquees(compteur: number): Set<Decoration> {
  return new Set(recompensesDebloquees(compteur).flatMap((r) => ('decoration' in r ? [r.decoration] : [])));
}

export function accessoiresRikki(compteur: number): Set<AccessoireRikki> {
  return new Set(recompensesDebloquees(compteur).flatMap((r) => ('accessoire' in r ? [r.accessoire] : [])));
}

/**
 * Taille de Rikki : il grandit doucement puis plafonne. Croissance continue
 * plutôt que par paliers, pour que chaque geste compte un peu.
 */
export function tailleRikki(compteur: number): number {
  return 0.78 + 0.3 * (1 - Math.exp(-compteur / 60));
}
