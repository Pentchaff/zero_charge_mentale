// Petite boîte à outils de projection isométrique pour la maison (ADR 0019).
// Repère du monde : x vers la droite-avant, y vers la gauche-avant, z vers le
// haut. Le coin du fond de la pièce est en (0, 0, 0).

import type { ReactNode } from 'react';

export const UNITE = 24;
export const COTE = 8; // taille de la pièce en unités
export const HAUTEUR_MUR = 4.2;
export const LARGEUR_VUE = 360;
export const HAUTEUR_VUE = 316;
const OX = LARGEUR_VUE / 2;
const OY = HAUTEUR_MUR * UNITE + 10;
const COS = Math.cos(Math.PI / 6);

export function projeter(x: number, y: number, z = 0): [number, number] {
  return [OX + (x - y) * UNITE * COS, OY + (x + y) * UNITE * 0.5 - z * UNITE];
}

export function pts(...points: [number, number, number][]): string {
  return points.map(([x, y, z]) => projeter(x, y, z).map((n) => n.toFixed(1)).join(',')).join(' ');
}

export function nuance(hex: string, facteur: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (d: number) => Math.min(255, Math.round(((n >> d) & 255) * facteur));
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
}

/** Position en pourcentage de la vue, pour poser un personnage HTML sur le sol. */
export function positionEcran(x: number, y: number, z = 0): { left: string; top: string } {
  const [sx, sy] = projeter(x, y, z);
  return { left: `${(sx / LARGEUR_VUE) * 100}%`, top: `${(sy / HAUTEUR_VUE) * 100}%` };
}

interface PropsBoite {
  x: number;
  y: number;
  z?: number;
  /** Longueur selon x, profondeur selon y, hauteur selon z. */
  l: number;
  p: number;
  h: number;
  couleur: string;
  dessus?: string;
  opacite?: number;
  children?: ReactNode;
}

/** Un pavé vu en isométrique : dessus, face avant-droite (x max) et face avant-gauche (y max). */
export function Boite({ x, y, z = 0, l, p, h, couleur, dessus, opacite }: PropsBoite) {
  const x2 = x + l;
  const y2 = y + p;
  const z2 = z + h;
  const trait = nuance(couleur, 0.7);
  return (
    <g opacity={opacite} stroke={trait} strokeWidth={0.8} strokeLinejoin="round">
      <polygon points={pts([x2, y, z], [x2, y2, z], [x2, y2, z2], [x2, y, z2])} fill={nuance(couleur, 0.86)} />
      <polygon points={pts([x, y2, z], [x2, y2, z], [x2, y2, z2], [x, y2, z2])} fill={nuance(couleur, 0.74)} />
      <polygon points={pts([x, y, z2], [x2, y, z2], [x2, y2, z2], [x, y2, z2])} fill={dessus ?? couleur} />
    </g>
  );
}

/** Un rectangle posé à plat (tapis, flaque, plateau) à la hauteur z. */
export function Plat({ x, y, z = 0, l, p, couleur, trait }: { x: number; y: number; z?: number; l: number; p: number; couleur: string; trait?: string }) {
  return <polygon points={pts([x, y, z], [x + l, y, z], [x + l, y + p, z], [x, y + p, z])} fill={couleur} stroke={trait} strokeWidth={trait ? 1 : 0} />;
}

/** Un rectangle sur le mur de gauche (plan x = 0) : fenêtre, tableau, miroir. */
export function SurMurGauche({ y, z, l, h, couleur, trait, epaisseur = 0.04 }: { y: number; z: number; l: number; h: number; couleur: string; trait?: string; epaisseur?: number }) {
  return (
    <polygon
      points={pts([epaisseur, y, z], [epaisseur, y + l, z], [epaisseur, y + l, z + h], [epaisseur, y, z + h])}
      fill={couleur}
      stroke={trait}
      strokeWidth={trait ? 3 : 0}
      strokeLinejoin="round"
    />
  );
}

/** Un rectangle sur le mur de droite (plan y = 0). */
export function SurMurDroit({ x, z, l, h, couleur, trait, epaisseur = 0.04 }: { x: number; z: number; l: number; h: number; couleur: string; trait?: string; epaisseur?: number }) {
  return (
    <polygon
      points={pts([x, epaisseur, z], [x + l, epaisseur, z], [x + l, epaisseur, z + h], [x, epaisseur, z + h])}
      fill={couleur}
      stroke={trait}
      strokeWidth={trait ? 3 : 0}
      strokeLinejoin="round"
    />
  );
}
