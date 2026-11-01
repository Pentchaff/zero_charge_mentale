// Les pièces interchangeables de l'avatar (ADR 0017) et leurs palettes.

import type {
  AvatarConfig,
  Bouche,
  Coiffe,
  Coiffure,
  FormeVisage,
  FormeYeux,
  Lunettes,
  Sourcils,
  Tenue,
} from './types';

export const VISAGES: readonly FormeVisage[] = ['rond', 'ovale', 'carre', 'pointu'];
export const COIFFURES: readonly Coiffure[] = [
  'courte',
  'frange',
  'carre',
  'longue',
  'queue',
  'chignon',
  'boucles',
  'herisse',
  'chauve',
];
export const YEUX: readonly FormeYeux[] = ['ronds', 'grands', 'amande', 'joyeux', 'endormis'];
export const SOURCILS: readonly Sourcils[] = ['fins', 'epais', 'arrondis', 'aucun'];
export const BOUCHES: readonly Bouche[] = ['sourire', 'grand', 'petit', 'chat', 'neutre'];
export const LUNETTES: readonly Lunettes[] = ['aucune', 'rondes', 'carrees', 'soleil'];
export const COIFFES: readonly Coiffe[] = ['aucune', 'bonnet', 'noeud', 'fleur', 'casque', 'couronne'];
export const TENUES: readonly Tenue[] = ['tshirt', 'pull', 'rayures', 'salopette', 'kimono'];

export const PEAUX = ['#ffe3cf', '#f9d1b0', '#efbb94', '#d99d72', '#b77b52', '#8d5a3b', '#62402b'];
export const CHEVEUX = [
  '#2b2220',
  '#4a3428',
  '#7a4b2a',
  '#b0743c',
  '#e2b867',
  '#c9c2bb',
  '#e88aa0',
  '#7aa6d6',
  '#8fc49a',
];
export const COULEURS_YEUX = ['#2b2220', '#5a3b26', '#3f6d8f', '#4f7d4f', '#7a5aa8'];
export const COULEURS_TENUE = [
  '#f2a65a',
  '#f7d26a',
  '#8fcf9a',
  '#7ec4cf',
  '#8aa8e8',
  '#b79be8',
  '#f0a3c0',
  '#f5f0e6',
  '#5c6b7a',
];

export const AVATAR_PAR_DEFAUT: AvatarConfig = {
  visage: 'rond',
  peau: PEAUX[1],
  coiffure: 'courte',
  couleurCheveux: CHEVEUX[1],
  yeux: 'ronds',
  couleurYeux: COULEURS_YEUX[0],
  sourcils: 'arrondis',
  bouche: 'sourire',
  joues: true,
  lunettes: 'aucune',
  coiffe: 'aucune',
  tenue: 'tshirt',
  couleurTenue: COULEURS_TENUE[3],
};

function auHasard<T>(liste: readonly T[], aleatoire: () => number): T {
  return liste[Math.floor(aleatoire() * liste.length)];
}

/**
 * Un avatar au hasard, pour le bouton 🎲 de l'éditeur. Les options
 * verrouillées par la progression sont passées en paramètre.
 */
export function avatarAuHasard(
  disponibles: { coiffes: readonly Coiffe[]; lunettes: readonly Lunettes[]; tenues: readonly Tenue[] },
  aleatoire: () => number = Math.random,
): AvatarConfig {
  return {
    visage: auHasard(VISAGES, aleatoire),
    peau: auHasard(PEAUX, aleatoire),
    coiffure: auHasard(COIFFURES, aleatoire),
    couleurCheveux: auHasard(CHEVEUX, aleatoire),
    yeux: auHasard(YEUX, aleatoire),
    couleurYeux: auHasard(COULEURS_YEUX, aleatoire),
    sourcils: auHasard(SOURCILS, aleatoire),
    bouche: auHasard(BOUCHES, aleatoire),
    joues: aleatoire() < 0.6,
    // Les accessoires restent rares, sinon tous les avatars se ressemblent.
    lunettes: aleatoire() < 0.3 ? auHasard(disponibles.lunettes, aleatoire) : 'aucune',
    coiffe: aleatoire() < 0.3 ? auHasard(disponibles.coiffes, aleatoire) : 'aucune',
    tenue: auHasard(disponibles.tenues, aleatoire),
    couleurTenue: auHasard(COULEURS_TENUE, aleatoire),
  };
}
