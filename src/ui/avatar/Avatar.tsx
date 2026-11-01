// L'avatar : un personnage humain mignon en SVG, assemblé à partir de pièces
// interchangeables (ADR 0017). Grande tête, petit corps, comme un Mii.
// Chaque pièce du visage est dessinée autour de (0, 0) puis placée,
// tournée et redimensionnée selon les réglages de l'éditeur.
// Repère : viewBox 0 0 200 240, tête centrée en (100, 96).

import type { CSSProperties, ReactNode } from 'react';
import type { AvatarConfig, Coiffure, FormeVisage } from '../../domaine/types';

export type PoseAvatar = 'repos' | 'fait' | 'calin' | 'content';
export type Cadrage = 'complet' | 'tete' | 'yeux' | 'sourcils' | 'nez' | 'bouche' | 'menton';

interface Props {
  config: AvatarConfig;
  pose?: PoseAvatar;
  cadrage?: Cadrage;
  className?: string;
  style?: CSSProperties;
  titre?: string;
}

const CX = 100;
const CY = 96;
const ENCRE = '#3a2a22';

const CADRAGES: Record<Cadrage, string> = {
  complet: '0 0 200 284',
  tete: '14 0 172 180',
  yeux: '40 66 120 72',
  sourcils: '40 54 120 66',
  nez: '58 88 84 58',
  bouche: '52 102 96 66',
  menton: '30 80 140 120',
};

export function assombrir(hex: string, facteur = 0.82): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (d: number) => Math.round(((n >> d) & 255) * facteur);
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
}

/** Demi-largeur de chaque forme de visage, pour placer oreilles et cheveux. */
const LARGEUR: Record<FormeVisage, number> = {
  rond: 58,
  ovale: 53,
  carre: 57,
  pointu: 58,
  large: 64,
  long: 51,
  coeur: 59,
  poire: 57,
};

// ---------------------------------------------------------------- Visage

function Visage({ forme, peau }: { forme: FormeVisage; peau: string }) {
  const p = { fill: peau, stroke: assombrir(peau, 0.88), strokeWidth: 2 };
  switch (forme) {
    case 'rond':
      return <ellipse cx={CX} cy={CY} rx={58} ry={60} {...p} />;
    case 'ovale':
      return <ellipse cx={CX} cy={CY + 2} rx={53} ry={64} {...p} />;
    case 'large':
      return <ellipse cx={CX} cy={CY + 2} rx={64} ry={57} {...p} />;
    case 'carre':
      return <rect x={CX - 57} y={CY - 60} width={114} height={122} rx={34} {...p} />;
    case 'long':
      return <rect x={CX - 51} y={CY - 64} width={102} height={132} rx={44} {...p} />;
    case 'pointu':
      return (
        <path
          d={`M${CX},${CY + 64} C${CX - 38},${CY + 60} ${CX - 58},${CY + 26} ${CX - 58},${CY - 6}
             C${CX - 58},${CY - 42} ${CX - 32},${CY - 60} ${CX},${CY - 60}
             C${CX + 32},${CY - 60} ${CX + 58},${CY - 42} ${CX + 58},${CY - 6}
             C${CX + 58},${CY + 26} ${CX + 38},${CY + 60} ${CX},${CY + 64} Z`}
          {...p}
        />
      );
    case 'coeur':
      return (
        <path
          d={`M${CX},${CY + 62} C${CX - 22},${CY + 58} ${CX - 52},${CY + 36} ${CX - 58},${CY + 6}
             C${CX - 64},${CY - 36} ${CX - 40},${CY - 60} ${CX},${CY - 60}
             C${CX + 40},${CY - 60} ${CX + 64},${CY - 36} ${CX + 58},${CY + 6}
             C${CX + 52},${CY + 36} ${CX + 22},${CY + 58} ${CX},${CY + 62} Z`}
          {...p}
        />
      );
    case 'poire':
      return (
        <path
          d={`M${CX},${CY + 62} C${CX - 44},${CY + 62} ${CX - 60},${CY + 36} ${CX - 58},${CY + 6}
             C${CX - 56},${CY - 34} ${CX - 34},${CY - 60} ${CX},${CY - 60}
             C${CX + 34},${CY - 60} ${CX + 56},${CY - 34} ${CX + 58},${CY + 6}
             C${CX + 60},${CY + 36} ${CX + 44},${CY + 62} ${CX},${CY + 62} Z`}
          {...p}
        />
      );
  }
}

// ---------------------------------------------------------------- Cheveux

const CALOTTE_RAIE_MILIEU = `M${CX - 61},${CY + 14} C${CX - 68},${CY - 56} ${CX - 30},${CY - 70} ${CX},${CY - 70}
  C${CX + 30},${CY - 70} ${CX + 68},${CY - 56} ${CX + 61},${CY + 14}
  C${CX + 52},${CY - 20} ${CX + 26},${CY - 32} ${CX + 2},${CY - 46}
  C${CX - 24},${CY - 32} ${CX - 52},${CY - 20} ${CX - 61},${CY + 14} Z`;

const CALOTTE_RAIE_COTE = `M${CX - 61},${CY + 14} C${CX - 68},${CY - 56} ${CX - 30},${CY - 70} ${CX},${CY - 70}
  C${CX + 30},${CY - 70} ${CX + 68},${CY - 56} ${CX + 61},${CY + 14}
  C${CX + 50},${CY - 24} ${CX + 10},${CY - 34} ${CX - 18},${CY - 46}
  C${CX - 40},${CY - 30} ${CX - 56},${CY - 14} ${CX - 61},${CY + 14} Z`;

const CALOTTE_COURTE = `M${CX - 61},${CY + 6} C${CX - 66},${CY - 56} ${CX - 30},${CY - 70} ${CX},${CY - 70}
  C${CX + 30},${CY - 70} ${CX + 66},${CY - 56} ${CX + 61},${CY + 6}
  C${CX + 56},${CY - 18} ${CX + 46},${CY - 30} ${CX + 34},${CY - 36}
  C${CX + 14},${CY - 24} ${CX - 22},${CY - 26} ${CX - 40},${CY - 36}
  C${CX - 50},${CY - 28} ${CX - 58},${CY - 14} ${CX - 61},${CY + 6} Z`;

const CALOTTE_FRANGE = `M${CX - 61},${CY + 6} C${CX - 66},${CY - 56} ${CX - 30},${CY - 70} ${CX},${CY - 70}
  C${CX + 30},${CY - 70} ${CX + 66},${CY - 56} ${CX + 61},${CY + 6}
  C${CX + 56},${CY - 18} ${CX + 46},${CY - 24} ${CX + 38},${CY - 14}
  L${CX + 26},${CY - 24} L${CX + 14},${CY - 13} L${CX + 2},${CY - 24} L${CX - 10},${CY - 13}
  L${CX - 22},${CY - 24} L${CX - 34},${CY - 12} C${CX - 48},${CY - 18} ${CX - 58},${CY - 6} ${CX - 61},${CY + 6} Z`;

function CheveuxArriere({ coiffure, couleur }: { coiffure: Coiffure; couleur: string }) {
  const fonce = assombrir(couleur, 0.7);
  switch (coiffure) {
    case 'longue':
      return (
        <path
          d={`M${CX - 62},${CY - 10} C${CX - 66},${CY - 70} ${CX + 66},${CY - 70} ${CX + 62},${CY - 10}
             L${CX + 68},${CY + 96} C${CX + 40},${CY + 108} ${CX - 40},${CY + 108} ${CX - 68},${CY + 96} Z`}
          fill={couleur}
        />
      );
    case 'ondulee':
      return (
        <path
          d={`M${CX - 62},${CY - 10} C${CX - 66},${CY - 70} ${CX + 66},${CY - 70} ${CX + 62},${CY - 10}
             C${CX + 76},${CY + 20} ${CX + 58},${CY + 40} ${CX + 72},${CY + 64}
             C${CX + 84},${CY + 86} ${CX + 60},${CY + 104} ${CX + 44},${CY + 98}
             C${CX + 20},${CY + 110} ${CX - 20},${CY + 110} ${CX - 44},${CY + 98}
             C${CX - 60},${CY + 104} ${CX - 84},${CY + 86} ${CX - 72},${CY + 64}
             C${CX - 58},${CY + 40} ${CX - 76},${CY + 20} ${CX - 62},${CY - 10} Z`}
          fill={couleur}
        />
      );
    case 'miLongue':
      return (
        <path
          d={`M${CX - 63},${CY - 8} C${CX - 66},${CY - 72} ${CX + 66},${CY - 72} ${CX + 63},${CY - 8}
             L${CX + 66},${CY + 60} C${CX + 40},${CY + 72} ${CX - 40},${CY + 72} ${CX - 66},${CY + 60} Z`}
          fill={couleur}
        />
      );
    case 'carre':
      return (
        <path
          d={`M${CX - 64},${CY - 8} C${CX - 66},${CY - 72} ${CX + 66},${CY - 72} ${CX + 64},${CY - 8}
             L${CX + 66},${CY + 46} C${CX + 40},${CY + 56} ${CX - 40},${CY + 56} ${CX - 66},${CY + 46} Z`}
          fill={couleur}
        />
      );
    case 'meche':
      return (
        <path
          d={`M${CX - 64},${CY - 8} C${CX - 66},${CY - 72} ${CX + 66},${CY - 72} ${CX + 64},${CY - 8}
             L${CX + 64},${CY + 24} C${CX + 40},${CY + 32} ${CX - 40},${CY + 32} ${CX - 64},${CY + 24} Z`}
          fill={couleur}
        />
      );
    case 'queue':
      return (
        <g fill={couleur}>
          <ellipse cx={CX + 66} cy={CY - 20} rx={16} ry={34} transform={`rotate(24 ${CX + 66} ${CY - 20})`} />
          <circle cx={CX + 52} cy={CY - 48} r={9} fill={fonce} />
        </g>
      );
    case 'couettes':
      return (
        <g fill={couleur}>
          <ellipse cx={CX - 72} cy={CY + 18} rx={15} ry={36} transform={`rotate(14 ${CX - 72} ${CY + 18})`} />
          <ellipse cx={CX + 72} cy={CY + 18} rx={15} ry={36} transform={`rotate(-14 ${CX + 72} ${CY + 18})`} />
          <circle cx={CX - 62} cy={CY - 14} r={7} fill="#f0a3c0" />
          <circle cx={CX + 62} cy={CY - 14} r={7} fill="#f0a3c0" />
        </g>
      );
    case 'chignon':
      return <circle cx={CX} cy={CY - 68} r={22} fill={couleur} />;
    case 'odango':
      return (
        <g fill={couleur}>
          <circle cx={CX - 44} cy={CY - 60} r={18} />
          <circle cx={CX + 44} cy={CY - 60} r={18} />
        </g>
      );
    case 'boucles':
      return (
        <g fill={couleur}>
          {[-60, -48, 48, 60].map((dx, i) => (
            <circle key={i} cx={CX + dx} cy={CY + (Math.abs(dx) > 50 ? 10 : 30)} r={16} />
          ))}
        </g>
      );
    case 'afro':
      return <circle cx={CX} cy={CY - 16} r={80} fill={couleur} />;
    default:
      return null;
  }
}

/** Cheveux qui tombent devant l'épaule (tresse), dessinés par-dessus le corps. */
function CheveuxEpaule({ coiffure, couleur }: { coiffure: Coiffure; couleur: string }) {
  if (coiffure !== 'tresse') return null;
  const fonce = assombrir(couleur, 0.8);
  return (
    <g fill={couleur} stroke={fonce} strokeWidth={2}>
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={CX + 46 + i * 2} cy={CY + 40 + i * 17} rx={11 - i} ry={11} />
      ))}
      <path d={`M${CX + 52},${CY + 118} l-6,14 l6,-4 l6,4 z`} />
      <rect x={CX + 47} y={CY + 108} width={12} height={5} rx={2} fill="#f0a3c0" stroke="none" />
    </g>
  );
}

function CheveuxAvant({ coiffure, couleur }: { coiffure: Coiffure; couleur: string }) {
  const ombre = assombrir(couleur, 0.85);
  const p = { fill: couleur, stroke: ombre, strokeWidth: 2, strokeLinejoin: 'round' as const };
  switch (coiffure) {
    case 'chauve':
      return null;
    case 'courte':
      return <path d={CALOTTE_COURTE} {...p} />;
    case 'frange':
    case 'carre':
      return <path d={CALOTTE_FRANGE} {...p} />;
    case 'longue':
    case 'queue':
    case 'chignon':
    case 'couettes':
    case 'odango':
    case 'tresse':
      return <path d={CALOTTE_RAIE_MILIEU} {...p} />;
    case 'miLongue':
    case 'ondulee':
      return <path d={CALOTTE_RAIE_COTE} {...p} />;
    case 'meche':
      return (
        <path
          d={`M${CX - 62},${CY + 24} C${CX - 70},${CY - 56} ${CX - 30},${CY - 72} ${CX},${CY - 72}
             C${CX + 32},${CY - 72} ${CX + 68},${CY - 54} ${CX + 61},${CY + 8}
             C${CX + 54},${CY - 20} ${CX + 40},${CY - 32} ${CX + 24},${CY - 36}
             C${CX + 6},${CY - 20} ${CX - 24},${CY - 12} ${CX - 48},${CY + 2}
             C${CX - 52},${CY + 10} ${CX - 56},${CY + 16} ${CX - 62},${CY + 24} Z`}
          {...p}
        />
      );
    case 'boucles':
      return (
        <g {...p}>
          {[
            [-46, -34, 18],
            [-24, -52, 20],
            [2, -58, 21],
            [28, -52, 20],
            [48, -34, 18],
            [-56, -10, 14],
            [56, -10, 14],
          ].map(([dx, dy, r], i) => (
            <circle key={i} cx={CX + dx} cy={CY + dy} r={r} />
          ))}
        </g>
      );
    case 'afro':
      return (
        <g {...p}>
          {[-50, -34, -17, 0, 17, 34, 50].map((dx, i) => (
            <circle key={i} cx={CX + dx} cy={CY - 40 + Math.abs(dx) * 0.5} r={15} />
          ))}
        </g>
      );
    case 'herisse':
      return (
        <path
          d={`M${CX - 61},${CY + 2} C${CX - 70},${CY - 40} ${CX - 56},${CY - 58} ${CX - 44},${CY - 60}
             Q${CX - 44},${CY - 80} ${CX - 26},${CY - 70} Q${CX - 16},${CY - 90} ${CX},${CY - 74}
             Q${CX + 16},${CY - 90} ${CX + 26},${CY - 70} Q${CX + 44},${CY - 80} ${CX + 44},${CY - 60}
             C${CX + 56},${CY - 58} ${CX + 70},${CY - 40} ${CX + 61},${CY + 2}
             C${CX + 50},${CY - 30} ${CX - 50},${CY - 30} ${CX - 61},${CY + 2} Z`}
          {...p}
        />
      );
    case 'banane':
      return (
        <path
          d={`M${CX - 60},${CY + 2} C${CX - 66},${CY - 40} ${CX - 50},${CY - 62} ${CX - 30},${CY - 66}
             C${CX - 20},${CY - 94} ${CX + 40},${CY - 98} ${CX + 52},${CY - 70}
             C${CX + 66},${CY - 56} ${CX + 66},${CY - 30} ${CX + 60},${CY + 2}
             C${CX + 50},${CY - 26} ${CX + 20},${CY - 34} ${CX - 10},${CY - 32}
             C${CX - 34},${CY - 30} ${CX - 52},${CY - 20} ${CX - 60},${CY + 2} Z`}
          {...p}
        />
      );
    case 'iroquoise':
      return (
        <g>
          <path d={CALOTTE_COURTE} fill={couleur} opacity={0.3} />
          <path
            d={`M${CX - 13},${CY - 46} L${CX - 16},${CY - 78} L${CX - 5},${CY - 70} L${CX},${CY - 94}
               L${CX + 5},${CY - 70} L${CX + 16},${CY - 78} L${CX + 13},${CY - 46} Z`}
            {...p}
          />
        </g>
      );
    case 'rase':
      return <path d={CALOTTE_COURTE} fill={couleur} opacity={0.45} />;
    case 'calvitie':
      return (
        <g fill={couleur}>
          <path d={`M${CX - 60},${CY + 14} C${CX - 64},${CY - 10} ${CX - 58},${CY - 28} ${CX - 46},${CY - 38} C${CX - 50},${CY - 20} ${CX - 52},${CY - 4} ${CX - 52},${CY + 14} Z`} />
          <path d={`M${CX + 60},${CY + 14} C${CX + 64},${CY - 10} ${CX + 58},${CY - 28} ${CX + 46},${CY - 38} C${CX + 50},${CY - 20} ${CX + 52},${CY - 4} ${CX + 52},${CY + 14} Z`} />
        </g>
      );
  }
}

// ---------------------------------------------------------------- Yeux

/** Un œil dessiné autour de (0, 0) ; le coin extérieur est du côté des x négatifs. */
function Oeil({ forme, couleur }: { forme: AvatarConfig['yeux']; couleur: string }) {
  switch (forme) {
    case 'ronds':
      return (
        <g>
          <ellipse rx={6} ry={8} fill={couleur} />
          <circle cx={2} cy={-3} r={2.2} fill="#fff" />
        </g>
      );
    case 'grands':
      return (
        <g>
          <ellipse rx={10} ry={12} fill="#fff" stroke={ENCRE} strokeWidth={1.5} />
          <circle cy={2} r={7} fill={couleur} />
          <circle cy={2} r={3} fill="#1e1612" />
          <circle cx={3} cy={-2} r={2.5} fill="#fff" />
        </g>
      );
    case 'brillants':
      return (
        <g>
          <ellipse rx={9} ry={11.5} fill={couleur} />
          <ellipse cy={4} rx={6} ry={5} fill="#fff" opacity={0.22} />
          <circle cx={3} cy={-4} r={3.6} fill="#fff" />
          <circle cx={-3.5} cy={4.5} r={1.6} fill="#fff" />
          <path d="M-10,-6 Q0,-15 10,-7" fill="none" stroke={ENCRE} strokeWidth={2.6} strokeLinecap="round" />
        </g>
      );
    case 'amande':
      return (
        <g>
          <path d="M-10,0 Q0,-9 10,0 Q0,6 -10,0 Z" fill="#fff" stroke={ENCRE} strokeWidth={1.5} />
          <circle cy={-0.5} r={4.2} fill={couleur} />
          <circle cx={1.5} cy={-2} r={1.3} fill="#fff" />
        </g>
      );
    case 'cils':
      return (
        <g>
          <ellipse rx={6} ry={8} fill={couleur} />
          <circle cx={2} cy={-3} r={2.2} fill="#fff" />
          <path d="M-5,-5 L-10,-9 M-2,-7.5 L-4,-12.5 M-6.5,-1 L-11.5,-3" stroke={ENCRE} strokeWidth={1.8} strokeLinecap="round" />
        </g>
      );
    case 'chat':
      return (
        <g>
          <path d="M10,3 Q1,-8 -11,-5 Q-3,7 10,3 Z" fill="#fff" stroke={ENCRE} strokeWidth={1.6} />
          <circle cx={-0.5} cy={-0.5} r={4.3} fill={couleur} />
          <circle cx={1} cy={-2} r={1.3} fill="#fff" />
          <path d="M-11,-5 L-15,-9" stroke={ENCRE} strokeWidth={2.2} strokeLinecap="round" />
        </g>
      );
    case 'tombants':
      return (
        <g>
          <path d="M10,-3 Q0,-8 -10,2 Q0,6 10,-3 Z" fill="#fff" stroke={ENCRE} strokeWidth={1.5} />
          <circle cy={-0.5} r={4} fill={couleur} />
          <circle cx={1.5} cy={-2} r={1.2} fill="#fff" />
        </g>
      );
    case 'etoiles':
      return (
        <g>
          <circle r={8.5} fill={couleur} />
          <path d="M2,-7 L3.3,-3.4 L7,-3.2 L4.1,-0.9 L5.1,2.7 L2,0.6 L-1.1,2.7 L-0.1,-0.9 L-3,-3.2 L0.7,-3.4 Z" fill="#fff" />
        </g>
      );
    case 'points':
      return <circle r={3.6} fill={ENCRE} />;
    case 'fins':
      return <path d="M-8,0 Q0,-3 8,0" fill="none" stroke={ENCRE} strokeWidth={3.2} strokeLinecap="round" />;
    case 'demiLune':
      return (
        <g>
          <path d="M-8,-1 A8,8 0 0,0 8,-1 Z" fill={couleur} />
          <path d="M-9.5,-1 L9.5,-1" stroke={ENCRE} strokeWidth={2.6} strokeLinecap="round" />
        </g>
      );
    case 'joyeux':
      return <path d="M-8,2 Q0,-8 8,2" fill="none" stroke={ENCRE} strokeWidth={3.2} strokeLinecap="round" />;
    case 'endormis':
      return <path d="M-8,0 Q0,6 8,0" fill="none" stroke={ENCRE} strokeWidth={3} strokeLinecap="round" />;
  }
}

function Sourcil({ forme, couleur }: { forme: AvatarConfig['sourcils']; couleur: string }) {
  const t = { fill: 'none', stroke: couleur, strokeLinecap: 'round' as const };
  switch (forme) {
    case 'aucun':
      return null;
    case 'arrondis':
      return <path d="M-8,2 Q0,-5 8,2" {...t} strokeWidth={2.6} />;
    case 'fins':
      return <path d="M-8,0 Q0,-1.5 8,0" {...t} strokeWidth={1.8} />;
    case 'epais':
      return <path d="M-8,0 L8,0" {...t} strokeWidth={5} />;
    case 'courts':
      return <path d="M-3,0 L5,0" {...t} strokeWidth={4} />;
    case 'arques':
      return <path d="M-9,3 Q-4,-5 8,-1" {...t} strokeWidth={2.6} />;
    case 'droits':
      return <rect x={-9} y={-2.5} width={18} height={5} rx={2} fill={couleur} />;
    case 'accent':
      return <path d="M-8,3 L0,-3 L8,3" {...t} strokeWidth={2.6} strokeLinejoin="round" />;
    case 'touffus':
      return <path d="M-9,2 Q-2,-7 9,-1 Q-1,-1 -9,2 Z" fill={couleur} stroke={couleur} strokeWidth={1.5} strokeLinejoin="round" />;
    case 'points':
      return <ellipse cx={2} rx={3.6} ry={2.6} fill={couleur} />;
  }
}

function NezSvg({ forme, peau }: { forme: AvatarConfig['nez']; peau: string }) {
  const ombre = assombrir(peau, 0.72);
  const t = { fill: 'none', stroke: ombre, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (forme) {
    case 'aucun':
      return null;
    case 'arc':
      return <path d="M-3,0 Q0,3 3,0" {...t} />;
    case 'point':
      return <circle r={1.8} fill={ombre} />;
    case 'rond':
      return (
        <g>
          <ellipse rx={5.5} ry={4.5} fill={assombrir(peau, 0.93)} />
          <circle cx={-1.5} cy={-1.5} r={1.4} fill="#fff" opacity={0.6} />
        </g>
      );
    case 'bouton':
      return (
        <g fill={ombre}>
          <circle cx={-2.6} cy={1} r={1.3} />
          <circle cx={2.6} cy={1} r={1.3} />
        </g>
      );
    case 'triangle':
      return <path d="M0,-7 L4,2 Q0,4 -2,2" {...t} />;
    case 'long':
      return <path d="M0,-11 L3,2 L-1,3" {...t} />;
    case 'pointu':
      return <path d="M-1,-8 Q6,2 0,3 Q-2,3 -3,1" {...t} />;
  }
}

function BoucheSvg({ forme, levres }: { forme: AvatarConfig['bouche']; levres: string }) {
  const interieur = assombrir(levres, 0.75);
  const t = { fill: 'none', stroke: levres, strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (forme) {
    case 'sourire':
      return <path d="M-12,-2 Q0,9 12,-2" {...t} />;
    case 'large':
      return <path d="M-17,-3 Q0,12 17,-3" {...t} />;
    case 'grand':
      return (
        <g>
          <path d="M-14,-4 Q0,-3 14,-4 Q12,14 0,14 Q-12,14 -14,-4 Z" fill={interieur} />
          <ellipse cy={9} rx={7} ry={4} fill="#f08a8a" />
        </g>
      );
    case 'dents':
      return (
        <g>
          <path d="M-14,-4 Q0,-3 14,-4 Q12,13 0,13 Q-12,13 -14,-4 Z" fill={interieur} />
          <path d="M-13,-3 Q0,-2 13,-3 L12,2 Q0,3.5 -12,2 Z" fill="#fff" />
        </g>
      );
    case 'anime':
      return (
        <g>
          <path d="M-8,-2 L8,-2 Q0,12 -8,-2 Z" fill={interieur} strokeLinejoin="round" stroke={interieur} strokeWidth={1.5} />
          <ellipse cy={4} rx={3.5} ry={2} fill="#f08a8a" />
        </g>
      );
    case 'petit':
      return <ellipse cy={1} rx={4.5} ry={5.5} fill={interieur} />;
    case 'chat':
      return <path d="M-12,-1 Q-6,6 0,-1 Q6,6 12,-1" {...t} />;
    case 'coin':
      return <path d="M-10,1 Q2,6 11,-4" {...t} />;
    case 'langue':
      return (
        <g>
          <ellipse cx={3} cy={5} rx={4.5} ry={5} fill="#f08a8a" stroke={levres} strokeWidth={1.5} />
          <path d="M-12,-1 Q0,7 12,-1" {...t} />
        </g>
      );
    case 'bisou':
      return (
        <g>
          <ellipse rx={5} ry={4.5} fill={levres} />
          <ellipse rx={1.8} ry={1.6} fill={interieur} />
        </g>
      );
    case 'moue':
      return <path d="M-7,3 Q0,-2 7,3" {...t} />;
    case 'surpris':
      return <ellipse cy={2} rx={6} ry={8} fill={interieur} />;
    case 'neutre':
      return <path d="M-8,1 L8,1" {...t} />;
  }
}

function MoustacheSvg({ forme, couleur }: { forme: AvatarConfig['moustache']; couleur: string }) {
  switch (forme) {
    case 'aucune':
      return null;
    case 'fine':
      return <path d="M-12,2 Q-6,-3 0,0 Q6,-3 12,2" fill="none" stroke={couleur} strokeWidth={3} strokeLinecap="round" />;
    case 'epaisse':
      return <path d="M-15,3 Q-8,-7 0,-1 Q8,-7 15,3 Q8,1 0,3 Q-8,1 -15,3 Z" fill={couleur} />;
    case 'guidon':
      return (
        <path
          d="M-19,-6 Q-21,3 -12,2 Q-6,1 0,-1 Q6,1 12,2 Q21,3 19,-6 Q17,0 12,-2 Q6,-6 0,-4 Q-6,-6 -12,-2 Q-17,0 -19,-6 Z"
          fill={couleur}
        />
      );
    case 'pointes':
      return <path d="M-15,4 L0,-3 L15,4 L0,2 Z" fill={couleur} strokeLinejoin="round" stroke={couleur} strokeWidth={1.5} />;
  }
}

function BarbeSvg({ forme, couleur, largeur }: { forme: AvatarConfig['barbe']; couleur: string; largeur: number }) {
  const w = largeur - 6;
  const croissant = (bas: number, epaisseur: number) =>
    `M${CX - w},${CY + 6} C${CX - w + 2},${CY + bas - 8} ${CX - 24},${CY + bas} ${CX},${CY + bas}
     C${CX + 24},${CY + bas} ${CX + w - 2},${CY + bas - 8} ${CX + w},${CY + 6}
     C${CX + w - 10},${CY + 40 - epaisseur} ${CX + 20},${CY + 48 - epaisseur} ${CX},${CY + 48 - epaisseur}
     C${CX - 20},${CY + 48 - epaisseur} ${CX - w + 10},${CY + 40 - epaisseur} ${CX - w},${CY + 6} Z`;
  switch (forme) {
    case 'aucune':
      return null;
    case 'courte':
      return <path d={croissant(64, 0)} fill={couleur} opacity={0.32} />;
    case 'pleine':
      return <path d={croissant(76, 4)} fill={couleur} />;
    case 'longue':
      return <path d={croissant(110, 4)} fill={couleur} />;
    case 'collier':
      return (
        <path
          d={`M${CX - w},${CY + 4} C${CX - w + 2},${CY + 54} ${CX - 24},${CY + 64} ${CX},${CY + 64} C${CX + 24},${CY + 64} ${CX + w - 2},${CY + 54} ${CX + w},${CY + 4}`}
          fill="none"
          stroke={couleur}
          strokeWidth={6}
          strokeLinecap="round"
        />
      );
    case 'bouc':
      return <path d={`M${CX - 11},${CY + 48} Q${CX},${CY + 44} ${CX + 11},${CY + 48} Q${CX + 10},${CY + 66} ${CX},${CY + 68} Q${CX - 10},${CY + 66} ${CX - 11},${CY + 48} Z`} fill={couleur} />;
  }
}

// ---------------------------------------------------------------- Accessoires

function LunettesSvg({ forme, couleur, dx, y, taille }: { forme: AvatarConfig['lunettes']; couleur: string; dx: number; y: number; taille: number }) {
  if (forme === 'aucune') return null;
  const r = 13.5 * (0.75 + 0.25 * taille);
  const g = CX - dx;
  const d = CX + dx;
  const verre = 'rgba(255,255,255,0.18)';
  const p = { fill: verre, stroke: couleur, strokeWidth: 3 };
  const pont = <path d={`M${g + r - 2},${y - 2} Q${CX},${y - 7} ${d - r + 2},${y - 2}`} fill="none" stroke={couleur} strokeWidth={3} />;
  switch (forme) {
    case 'rondes':
      return (
        <g>
          <circle cx={g} cy={y} r={r} {...p} />
          <circle cx={d} cy={y} r={r} {...p} />
          {pont}
        </g>
      );
    case 'carrees':
      return (
        <g>
          <rect x={g - r - 1} y={y - r * 0.8} width={2 * r + 2} height={r * 1.6} rx={5} {...p} />
          <rect x={d - r - 1} y={y - r * 0.8} width={2 * r + 2} height={r * 1.6} rx={5} {...p} />
          {pont}
        </g>
      );
    case 'ovales':
      return (
        <g>
          <ellipse cx={g} cy={y} rx={r + 1} ry={r * 0.75} {...p} strokeWidth={2} />
          <ellipse cx={d} cy={y} rx={r + 1} ry={r * 0.75} {...p} strokeWidth={2} />
          {pont}
        </g>
      );
    case 'papillon':
      return (
        <g>
          <path d={`M${g + r},${y - 4} Q${g + r},${y + r} ${g},${y + r * 0.8} Q${g - r},${y + r * 0.6} ${g - r - 4},${y - r}  Q${g},${y - r * 0.6} ${g + r},${y - 4} Z`} {...p} />
          <path d={`M${d - r},${y - 4} Q${d - r},${y + r} ${d},${y + r * 0.8} Q${d + r},${y + r * 0.6} ${d + r + 4},${y - r}  Q${d},${y - r * 0.6} ${d - r},${y - 4} Z`} {...p} />
          {pont}
        </g>
      );
    case 'demiLune':
      return (
        <g fill="none" stroke={couleur} strokeWidth={3}>
          <path d={`M${g - r},${y} A${r},${r * 0.8} 0 0,0 ${g + r},${y} Z`} fill={verre} />
          <path d={`M${d - r},${y} A${r},${r * 0.8} 0 0,0 ${d + r},${y} Z`} fill={verre} />
          <path d={`M${g + r},${y} Q${CX},${y - 4} ${d - r},${y}`} />
        </g>
      );
    case 'soleil':
      return (
        <g stroke={couleur} strokeWidth={3}>
          <path d={`M${g - r - 2},${y - r * 0.75} L${g + r},${y - r * 0.75} Q${g + r},${y + r} ${g},${y + r} Q${g - r - 2},${y + r} ${g - r - 2},${y - r * 0.75} Z`} fill="#2f3440" />
          <path d={`M${d - r},${y - r * 0.75} L${d + r + 2},${y - r * 0.75} Q${d + r + 2},${y + r} ${d},${y + r} Q${d - r},${y + r} ${d - r},${y - r * 0.75} Z`} fill="#2f3440" />
          <path d={`M${g + r},${y - r * 0.6} L${d - r},${y - r * 0.6}`} />
          <path d={`M${g - r + 4},${y - 3} L${g - 2},${y - 3}`} stroke="#8a93a8" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
  }
}

function CoiffeSvg({ forme, couleurTenue }: { forme: AvatarConfig['coiffe']; couleurTenue: string }) {
  switch (forme) {
    case 'aucune':
      return null;
    case 'bonnet':
      return (
        <g>
          <path d={`M${CX - 62},${CY - 20} C${CX - 62},${CY - 86} ${CX + 62},${CY - 86} ${CX + 62},${CY - 20} Z`} fill={couleurTenue} stroke={assombrir(couleurTenue)} strokeWidth={2} />
          <rect x={CX - 66} y={CY - 32} width={132} height={18} rx={9} fill={assombrir(couleurTenue, 0.9)} />
          <circle cx={CX} cy={CY - 82} r={11} fill="#fff8ee" stroke={assombrir(couleurTenue)} strokeWidth={2} />
        </g>
      );
    case 'casquette':
      return (
        <g>
          <path d={`M${CX - 60},${CY - 26} C${CX - 60},${CY - 84} ${CX + 60},${CY - 84} ${CX + 60},${CY - 26} Z`} fill={couleurTenue} stroke={assombrir(couleurTenue)} strokeWidth={2} />
          <path d={`M${CX - 62},${CY - 26} Q${CX - 10},${CY - 34} ${CX + 74},${CY - 18} Q${CX + 50},${CY - 10} ${CX - 62},${CY - 18} Z`} fill={assombrir(couleurTenue, 0.85)} />
          <circle cx={CX} cy={CY - 80} r={4} fill={assombrir(couleurTenue, 0.7)} />
        </g>
      );
    case 'noeud':
      return (
        <g transform={`translate(${CX + 40} ${CY - 54}) rotate(18)`}>
          <path d="M0,0 L-20,-12 L-20,12 Z M0,0 L20,-12 L20,12 Z" fill="#f08aa6" stroke="#c9607e" strokeWidth={2} strokeLinejoin="round" />
          <circle r={5} fill="#c9607e" />
        </g>
      );
    case 'serreTete':
      return <path d={`M${CX - 58},${CY - 6} C${CX - 64},${CY - 78} ${CX + 64},${CY - 78} ${CX + 58},${CY - 6}`} fill="none" stroke={couleurTenue} strokeWidth={8} strokeLinecap="round" />;
    case 'barrette':
      return (
        <g transform={`translate(${CX - 38} ${CY - 40}) rotate(-30)`}>
          <rect x={-12} y={-4} width={24} height={8} rx={4} fill="#f7c948" stroke="#c9962a" strokeWidth={1.5} />
          <circle cx={-6} r={2} fill="#fff" />
        </g>
      );
    case 'fleur':
      return (
        <g transform={`translate(${CX - 42} ${CY - 50})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={0} cy={-9} rx={6} ry={9} fill="#ffd1dc" stroke="#e98aa3" strokeWidth={1.5} transform={`rotate(${a})`} />
          ))}
          <circle r={5} fill="#f7c948" />
        </g>
      );
    case 'casque':
      return (
        <g fill="none" stroke="#4b5568" strokeWidth={7} strokeLinecap="round">
          <path d={`M${CX - 62},${CY + 4} C${CX - 66},${CY - 84} ${CX + 66},${CY - 84} ${CX + 62},${CY + 4}`} />
          <rect x={CX - 74} y={CY - 8} width={20} height={32} rx={9} fill="#7ec4cf" stroke="#4b5568" strokeWidth={4} />
          <rect x={CX + 54} y={CY - 8} width={20} height={32} rx={9} fill="#7ec4cf" stroke="#4b5568" strokeWidth={4} />
        </g>
      );
    case 'couronne':
      return (
        <g transform={`translate(${CX} ${CY - 68})`}>
          <path d="M-26,8 L-30,-18 L-14,-4 L0,-24 L14,-4 L30,-18 L26,8 Z" fill="#f7c948" stroke="#c9962a" strokeWidth={2} strokeLinejoin="round" />
          <circle cx={0} cy={-2} r={4} fill="#e98aa3" />
        </g>
      );
  }
}

// ---------------------------------------------------------------- Corps

function Corps({ config, pose }: { config: AvatarConfig; pose: PoseAvatar }) {
  const c = config.couleurTenue;
  const ombre = assombrir(c);
  const peau = config.peau;
  // Rotation horaire à l'écran : le bras gauche monte avec un angle positif.
  const brasG = pose === 'fait' ? 140 : pose === 'calin' ? -35 : 0;
  const brasD = pose === 'fait' ? -140 : pose === 'calin' ? 35 : 0;
  const bas = config.tenue === 'kimono' ? 262 : 236;
  const pantalon = config.tenue === 'salopette' ? '#5b7fb8' : config.tenue === 'kimono' ? assombrir(c, 0.8) : '#6b7a99';
  return (
    <g transform={`translate(100 166) scale(${config.corpulence} ${config.stature}) translate(-100 -166)`}>
      <g className="avatar-bras" style={{ transform: `rotate(${brasG}deg)`, transformOrigin: '62px 184px' }}>
        <rect x={48} y={180} width={20} height={46} rx={10} fill={c} stroke={ombre} strokeWidth={2} />
        <circle cx={58} cy={228} r={9} fill={peau} />
      </g>
      <g className="avatar-bras" style={{ transform: `rotate(${brasD}deg)`, transformOrigin: '138px 184px' }}>
        <rect x={132} y={180} width={20} height={46} rx={10} fill={c} stroke={ombre} strokeWidth={2} />
        <circle cx={142} cy={228} r={9} fill={peau} />
      </g>
      {/* Jambes et chaussures : l'avatar tient debout dans la maison. */}
      <g>
        <rect x={78} y={222} width={19} height={46} rx={8} fill={pantalon} stroke={assombrir(pantalon, 0.8)} strokeWidth={2} />
        <rect x={103} y={222} width={19} height={46} rx={8} fill={pantalon} stroke={assombrir(pantalon, 0.8)} strokeWidth={2} />
        <ellipse cx={86} cy={270} rx={14} ry={8} fill="#5a4a42" />
        <ellipse cx={114} cy={270} rx={14} ry={8} fill="#5a4a42" />
      </g>
      <rect x={90} y={148} width={20} height={22} fill={assombrir(peau, 0.92)} />
      {config.tenue === 'sweat' && <path d="M70,176 Q100,150 130,176 L124,186 Q100,166 76,186 Z" fill={ombre} />}
      <path d={`M56,226 C52,188 70,166 100,166 C130,166 148,188 144,226 Q144,${bas} 100,${bas} Q56,${bas} 56,226 Z`} fill={c} stroke={ombre} strokeWidth={2} />
      {config.tenue === 'pull' && <path d="M84,168 Q100,182 116,168" fill="none" stroke={ombre} strokeWidth={5} strokeLinecap="round" />}
      {config.tenue === 'chemise' && (
        <g>
          <path d="M100,170 L84,166 L90,184 Z M100,170 L116,166 L110,184 Z" fill="#fffaf2" stroke={ombre} strokeWidth={1.5} strokeLinejoin="round" />
          <path d="M100,172 L100,234" stroke={ombre} strokeWidth={1.5} />
          {[190, 206, 222].map((y) => (
            <circle key={y} cx={104} cy={y} r={2} fill={ombre} />
          ))}
        </g>
      )}
      {config.tenue === 'sweat' && (
        <g>
          <path d="M94,172 L92,196 M106,172 L108,196" stroke="#fffaf2" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M78,206 L122,206 L117,226 L83,226 Z" fill="none" stroke={ombre} strokeWidth={2} strokeLinejoin="round" />
        </g>
      )}
      {config.tenue === 'rayures' && (
        <g stroke="#fff8ee" strokeWidth={6} opacity={0.75}>
          <path d="M60,192 L140,192" />
          <path d="M56,210 L144,210" />
          <path d="M55,228 L145,228" />
        </g>
      )}
      {config.tenue === 'salopette' && (
        <g>
          <path d="M70,200 L130,200 L142,228 Q140,236 100,236 Q60,236 58,228 Z" fill="#5b7fb8" stroke="#45628f" strokeWidth={2} />
          <path d="M80,200 L86,168 M120,200 L114,168" stroke="#5b7fb8" strokeWidth={6} />
          <circle cx={84} cy={204} r={3} fill="#f7c948" />
          <circle cx={116} cy={204} r={3} fill="#f7c948" />
        </g>
      )}
      {config.tenue === 'kimono' && (
        <g>
          <path d="M86,168 L100,206 L114,168" fill="none" stroke="#fff8ee" strokeWidth={6} strokeLinejoin="round" />
          <rect x={58} y={206} width={84} height={12} fill={assombrir(c, 0.7)} />
        </g>
      )}
    </g>
  );
}

function Miroir({ actif, children }: { actif: boolean; children: ReactNode }) {
  return actif ? <g transform={`translate(${2 * CX} 0) scale(-1 1)`}>{children}</g> : <>{children}</>;
}

/** Adapte les cheveux (dessinés pour une demi-largeur de 58) à la forme du visage. */
function Ajuste({ largeur, children }: { largeur: number; children: ReactNode }) {
  const k = largeur / 58;
  return k === 1 ? <>{children}</> : <g transform={`translate(${CX} 0) scale(${k} 1) translate(${-CX} 0)`}>{children}</g>;
}

export function Avatar({ config, pose = 'repos', cadrage = 'complet', className, style, titre }: Props) {
  const a = config;
  const largeur = LARGEUR[a.visage];
  const joyeux = pose === 'fait' || pose === 'content';
  const yeux = joyeux ? 'joyeux' : a.yeux;
  const bouche = pose === 'fait' ? 'grand' : pose === 'content' ? 'large' : a.bouche;

  const yYeux = CY + 8 - a.yeuxHauteur;
  const dxYeux = 23 + a.yeuxEcart;
  const ySourcils = CY - 10 - a.sourcilsHauteur;
  const dxSourcils = 23 + a.sourcilsEcart;
  const yNez = CY + 22 - a.nezHauteur;
  const yBouche = CY + 34 - a.boucheHauteur;
  const avecCorps = cadrage === 'complet';

  return (
    <svg
      viewBox={CADRAGES[cadrage]}
      className={['avatar', `avatar--${pose}`, className].filter(Boolean).join(' ')}
      style={style}
      role="img"
      aria-label={titre}
    >
      {titre && <title>{titre}</title>}
      <Ajuste largeur={largeur}>
        <Miroir actif={a.coiffureMiroir}>
          <CheveuxArriere coiffure={a.coiffure} couleur={a.couleurCheveux} />
        </Miroir>
      </Ajuste>
      {avecCorps && <Corps config={a} pose={pose} />}
      {avecCorps && (
        <Miroir actif={a.coiffureMiroir}>
          <CheveuxEpaule coiffure={a.coiffure} couleur={a.couleurCheveux} />
        </Miroir>
      )}
      <g className="avatar-tete">
        <circle cx={CX - largeur + 1} cy={CY + 12} r={10} fill={a.peau} stroke={assombrir(a.peau, 0.88)} strokeWidth={2} />
        <circle cx={CX + largeur - 1} cy={CY + 12} r={10} fill={a.peau} stroke={assombrir(a.peau, 0.88)} strokeWidth={2} />
        <Visage forme={a.visage} peau={a.peau} />
        {(a.joues || joyeux) && (
          <g fill="#f4978e" opacity={joyeux ? 0.6 : 0.45}>
            <ellipse cx={CX - 34} cy={CY + 28} rx={9} ry={6} />
            <ellipse cx={CX + 34} cy={CY + 28} rx={9} ry={6} />
          </g>
        )}
        {a.rousseur && (
          <g fill={assombrir(a.peau, 0.7)} opacity={0.55}>
            {[-40, -34, -28, -37, 28, 34, 40, 37].map((dx, i) => (
              <circle key={i} cx={CX + dx} cy={CY + 22 + (i % 4 === 3 ? 6 : (i % 2) * 3)} r={1.4} />
            ))}
          </g>
        )}
        {a.grainDeBeaute && <circle cx={CX + 26} cy={CY + 36} r={1.8} fill={assombrir(a.peau, 0.45)} />}

        <BarbeSvg forme={a.barbe} couleur={a.couleurCheveux} largeur={largeur} />

        <g className="avatar-yeux">
          <g transform={`translate(${CX - dxYeux} ${yYeux}) rotate(${a.yeuxRotation}) scale(${a.yeuxTaille})`}>
            <Oeil forme={yeux} couleur={a.couleurYeux} />
          </g>
          <g transform={`translate(${CX + dxYeux} ${yYeux}) scale(-1 1) rotate(${a.yeuxRotation}) scale(${a.yeuxTaille})`}>
            <Oeil forme={yeux} couleur={a.couleurYeux} />
          </g>
        </g>
        <g transform={`translate(${CX - dxSourcils} ${ySourcils}) rotate(${a.sourcilsRotation}) scale(${a.sourcilsTaille})`}>
          <Sourcil forme={a.sourcils} couleur={a.couleurSourcils} />
        </g>
        <g transform={`translate(${CX + dxSourcils} ${ySourcils}) scale(-1 1) rotate(${a.sourcilsRotation}) scale(${a.sourcilsTaille})`}>
          <Sourcil forme={a.sourcils} couleur={a.couleurSourcils} />
        </g>
        <g transform={`translate(${CX} ${yNez}) scale(${a.nezTaille})`}>
          <NezSvg forme={a.nez} peau={a.peau} />
        </g>
        <g transform={`translate(${CX} ${yBouche}) scale(${a.boucheTaille})`}>
          <BoucheSvg forme={bouche} levres={a.couleurLevres} />
        </g>
        <g transform={`translate(${CX} ${yBouche - 7}) scale(${0.85 + 0.15 * a.boucheTaille})`}>
          <MoustacheSvg forme={a.moustache} couleur={a.couleurCheveux} />
        </g>

        <Ajuste largeur={largeur}>
          <Miroir actif={a.coiffureMiroir}>
            <CheveuxAvant coiffure={a.coiffure} couleur={a.couleurCheveux} />
          </Miroir>
        </Ajuste>
        <LunettesSvg forme={a.lunettes} couleur={a.couleurLunettes} dx={dxYeux} y={yYeux} taille={a.yeuxTaille} />
        <Ajuste largeur={largeur}>
          <CoiffeSvg forme={a.coiffe} couleurTenue={a.couleurTenue} />
        </Ajuste>
      </g>
    </svg>
  );
}
