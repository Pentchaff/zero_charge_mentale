// Les pièces interchangeables de l'avatar (ADR 0017), leurs palettes et
// les bornes des réglages de taille et de position, comme dans l'éditeur Mii.

import type {
  AvatarConfig,
  Barbe,
  Bouche,
  Coiffe,
  Coiffure,
  FormeVisage,
  FormeYeux,
  Lunettes,
  Moustache,
  Nez,
  Sourcils,
  Tenue,
} from './types';

export const VISAGES: readonly FormeVisage[] = ['rond', 'ovale', 'carre', 'pointu', 'large', 'long', 'coeur', 'poire'];
export const COIFFURES: readonly Coiffure[] = [
  'courte',
  'frange',
  'carre',
  'longue',
  'miLongue',
  'queue',
  'couettes',
  'chignon',
  'odango',
  'tresse',
  'boucles',
  'ondulee',
  'afro',
  'meche',
  'herisse',
  'banane',
  'iroquoise',
  'rase',
  'calvitie',
  'chauve',
];
export const YEUX: readonly FormeYeux[] = [
  'ronds',
  'grands',
  'brillants',
  'amande',
  'cils',
  'chat',
  'tombants',
  'etoiles',
  'points',
  'fins',
  'demiLune',
  'joyeux',
  'endormis',
];
export const SOURCILS: readonly Sourcils[] = ['arrondis', 'fins', 'epais', 'courts', 'arques', 'droits', 'accent', 'touffus', 'points', 'aucun'];
export const NEZ: readonly Nez[] = ['arc', 'point', 'rond', 'bouton', 'triangle', 'long', 'pointu', 'aucun'];
export const BOUCHES: readonly Bouche[] = [
  'sourire',
  'large',
  'grand',
  'dents',
  'anime',
  'petit',
  'chat',
  'coin',
  'langue',
  'bisou',
  'moue',
  'surpris',
  'neutre',
];
export const MOUSTACHES: readonly Moustache[] = ['aucune', 'fine', 'epaisse', 'guidon', 'pointes'];
export const BARBES: readonly Barbe[] = ['aucune', 'courte', 'pleine', 'bouc', 'collier', 'longue'];
export const LUNETTES: readonly Lunettes[] = ['aucune', 'rondes', 'carrees', 'ovales', 'papillon', 'demiLune', 'soleil'];
export const COIFFES: readonly Coiffe[] = ['aucune', 'bonnet', 'casquette', 'noeud', 'serreTete', 'barrette', 'fleur', 'casque', 'couronne'];
export const TENUES: readonly Tenue[] = ['tshirt', 'pull', 'chemise', 'sweat', 'rayures', 'salopette', 'kimono'];

export const PEAUX = ['#fff0e4', '#ffe3cf', '#f9d1b0', '#efbb94', '#e0a87e', '#c98c62', '#a8714b', '#8d5a3b', '#62402b'];
export const CHEVEUX = [
  '#2b2220',
  '#4a3428',
  '#7a4b2a',
  '#a0582c',
  '#b0743c',
  '#e2b867',
  '#f3dfa2',
  '#c9c2bb',
  '#f4f1ec',
  '#e88aa0',
  '#7aa6d6',
  '#8fc49a',
  '#9b7fd1',
];
export const COULEURS_YEUX = ['#2b2220', '#5a3b26', '#8a5a2b', '#3f6d8f', '#4f7d4f', '#7a5aa8', '#6b7480'];
export const COULEURS_LEVRES = ['#8a3a32', '#c0584f', '#e07a7a', '#d9608a', '#a8506e', '#9a6a5a'];
export const COULEURS_LUNETTES = ['#4a3a34', '#2a2a33', '#b0743c', '#c0584f', '#5b7fb8', '#8fc49a', '#d9a832'];
export const COULEURS_TENUE = [
  '#f2a65a',
  '#f7d26a',
  '#8fcf9a',
  '#7ec4cf',
  '#8aa8e8',
  '#b79be8',
  '#f0a3c0',
  '#f5f0e6',
  '#c9b8a6',
  '#5c6b7a',
  '#3f4a5a',
];

export type ReglageNumerique = Extract<
  keyof AvatarConfig,
  | 'sourcilsTaille'
  | 'sourcilsRotation'
  | 'sourcilsEcart'
  | 'sourcilsHauteur'
  | 'yeuxTaille'
  | 'yeuxRotation'
  | 'yeuxEcart'
  | 'yeuxHauteur'
  | 'nezTaille'
  | 'nezHauteur'
  | 'boucheTaille'
  | 'boucheHauteur'
  | 'stature'
  | 'corpulence'
>;

/** Bornes et pas des curseurs ; `defaut` est la position neutre. */
export const REGLAGES: Record<ReglageNumerique, { min: number; max: number; pas: number; defaut: number }> = {
  sourcilsTaille: { min: 0.6, max: 1.5, pas: 0.05, defaut: 1 },
  sourcilsRotation: { min: -25, max: 25, pas: 1, defaut: 0 },
  sourcilsEcart: { min: -8, max: 12, pas: 1, defaut: 0 },
  sourcilsHauteur: { min: -10, max: 14, pas: 1, defaut: 0 },
  yeuxTaille: { min: 0.6, max: 1.5, pas: 0.05, defaut: 1 },
  yeuxRotation: { min: -20, max: 20, pas: 1, defaut: 0 },
  yeuxEcart: { min: -8, max: 12, pas: 1, defaut: 0 },
  yeuxHauteur: { min: -12, max: 14, pas: 1, defaut: 0 },
  nezTaille: { min: 0.6, max: 1.6, pas: 0.05, defaut: 1 },
  nezHauteur: { min: -10, max: 10, pas: 1, defaut: 0 },
  boucheTaille: { min: 0.6, max: 1.5, pas: 0.05, defaut: 1 },
  boucheHauteur: { min: -10, max: 12, pas: 1, defaut: 0 },
  stature: { min: 0.85, max: 1.15, pas: 0.01, defaut: 1 },
  corpulence: { min: 0.8, max: 1.25, pas: 0.01, defaut: 1 },
};

export const AVATAR_PAR_DEFAUT: AvatarConfig = {
  version: 2,
  visage: 'rond',
  peau: PEAUX[2],
  joues: true,
  rousseur: false,
  grainDeBeaute: false,
  coiffure: 'courte',
  couleurCheveux: CHEVEUX[1],
  coiffureMiroir: false,
  sourcils: 'arrondis',
  couleurSourcils: CHEVEUX[1],
  sourcilsTaille: 1,
  sourcilsRotation: 0,
  sourcilsEcart: 0,
  sourcilsHauteur: 0,
  yeux: 'ronds',
  couleurYeux: COULEURS_YEUX[0],
  yeuxTaille: 1,
  yeuxRotation: 0,
  yeuxEcart: 0,
  yeuxHauteur: 0,
  nez: 'arc',
  nezTaille: 1,
  nezHauteur: 0,
  bouche: 'sourire',
  couleurLevres: COULEURS_LEVRES[0],
  boucheTaille: 1,
  boucheHauteur: 0,
  moustache: 'aucune',
  barbe: 'aucune',
  lunettes: 'aucune',
  couleurLunettes: COULEURS_LUNETTES[0],
  coiffe: 'aucune',
  tenue: 'tshirt',
  couleurTenue: COULEURS_TENUE[3],
  stature: 1,
  corpulence: 1,
};

function borner(n: unknown, r: { min: number; max: number; defaut: number }): number {
  return typeof n === 'number' && Number.isFinite(n) ? Math.min(r.max, Math.max(r.min, n)) : r.defaut;
}

function parmi<T>(v: unknown, liste: readonly T[], defaut: T): T {
  return liste.includes(v as T) ? (v as T) : defaut;
}

function couleur(v: unknown, defaut: string): string {
  return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : defaut;
}

/**
 * Rend un avatar complet et valide à partir de n'importe quoi : un avatar de
 * la première version (sans réglages), des données synchronisées incomplètes…
 */
export function normaliserAvatar(brut: unknown): AvatarConfig {
  const a = (typeof brut === 'object' && brut !== null ? brut : {}) as Record<string, unknown>;
  const d = AVATAR_PAR_DEFAUT;
  const r = Object.fromEntries(
    (Object.keys(REGLAGES) as ReglageNumerique[]).map((k) => [k, borner(a[k], REGLAGES[k])]),
  ) as Record<ReglageNumerique, number>;
  const cheveux = couleur(a.couleurCheveux, d.couleurCheveux);
  return {
    version: 2,
    visage: parmi(a.visage, VISAGES, d.visage),
    peau: couleur(a.peau, d.peau),
    joues: typeof a.joues === 'boolean' ? a.joues : d.joues,
    rousseur: a.rousseur === true,
    grainDeBeaute: a.grainDeBeaute === true,
    coiffure: parmi(a.coiffure, COIFFURES, d.coiffure),
    couleurCheveux: cheveux,
    coiffureMiroir: a.coiffureMiroir === true,
    sourcils: parmi(a.sourcils, SOURCILS, d.sourcils),
    couleurSourcils: couleur(a.couleurSourcils, cheveux),
    yeux: parmi(a.yeux, YEUX, d.yeux),
    couleurYeux: couleur(a.couleurYeux, d.couleurYeux),
    nez: parmi(a.nez, NEZ, d.nez),
    bouche: parmi(a.bouche, BOUCHES, d.bouche),
    couleurLevres: couleur(a.couleurLevres, d.couleurLevres),
    moustache: parmi(a.moustache, MOUSTACHES, d.moustache),
    barbe: parmi(a.barbe, BARBES, d.barbe),
    lunettes: parmi(a.lunettes, LUNETTES, d.lunettes),
    couleurLunettes: couleur(a.couleurLunettes, d.couleurLunettes),
    coiffe: parmi(a.coiffe, COIFFES, d.coiffe),
    tenue: parmi(a.tenue, TENUES, d.tenue),
    couleurTenue: couleur(a.couleurTenue, d.couleurTenue),
    ...r,
  };
}

function auHasard<T>(liste: readonly T[], aleatoire: () => number): T {
  return liste[Math.floor(aleatoire() * liste.length)];
}

/**
 * Un avatar au hasard, pour le bouton 🎲 de l'éditeur. Les options
 * verrouillées par la progression sont passées en paramètre. Les réglages de
 * position restent neutres : le hasard ne doit pas donner un visage étrange.
 */
export function avatarAuHasard(
  disponibles: { coiffes: readonly Coiffe[]; lunettes: readonly Lunettes[]; tenues: readonly Tenue[] },
  aleatoire: () => number = Math.random,
): AvatarConfig {
  const cheveux = auHasard(CHEVEUX, aleatoire);
  const rare = (p: number) => aleatoire() < p;
  return {
    ...AVATAR_PAR_DEFAUT,
    visage: auHasard(VISAGES, aleatoire),
    peau: auHasard(PEAUX, aleatoire),
    joues: rare(0.6),
    rousseur: rare(0.15),
    grainDeBeaute: rare(0.1),
    coiffure: auHasard(COIFFURES, aleatoire),
    couleurCheveux: cheveux,
    coiffureMiroir: rare(0.5),
    sourcils: auHasard(SOURCILS.filter((s) => s !== 'aucun'), aleatoire),
    couleurSourcils: cheveux,
    yeux: auHasard(YEUX, aleatoire),
    couleurYeux: auHasard(COULEURS_YEUX, aleatoire),
    nez: auHasard(NEZ, aleatoire),
    bouche: auHasard(BOUCHES.filter((b) => b !== 'moue' && b !== 'surpris'), aleatoire),
    couleurLevres: auHasard(COULEURS_LEVRES, aleatoire),
    moustache: rare(0.12) ? auHasard(MOUSTACHES, aleatoire) : 'aucune',
    barbe: rare(0.12) ? auHasard(BARBES, aleatoire) : 'aucune',
    lunettes: rare(0.3) ? auHasard(disponibles.lunettes, aleatoire) : 'aucune',
    couleurLunettes: auHasard(COULEURS_LUNETTES, aleatoire),
    coiffe: rare(0.25) ? auHasard(disponibles.coiffes, aleatoire) : 'aucune',
    tenue: auHasard(disponibles.tenues, aleatoire),
    couleurTenue: auHasard(COULEURS_TENUE, aleatoire),
  };
}
