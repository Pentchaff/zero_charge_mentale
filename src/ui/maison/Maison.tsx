// La maison : le décor où vivent l'avatar et Rikki (ADR 0019), en 3D
// isométrique façon maison de poupée. Une pièce à la fois, coupée comme une
// scène de théâtre : deux murs au fond, le sol, des meubles de base, et des
// emplacements pour les décorations débloquées par la progression (ADR 0020).

import type { ReactNode } from 'react';
import type { MomentJournee } from '../../compagnon/cycleDeVie';
import type { Decoration } from '../../domaine/progression';
import type { PieceId } from '../../domaine/types';
import { Boite, COTE, HAUTEUR_MUR, HAUTEUR_VUE, LARGEUR_VUE, nuance, Plat, projeter, pts, SurMurDroit, SurMurGauche } from './iso';

interface Props {
  piece: PieceId;
  couleurMurs: string;
  moment: MomentJournee;
  decorations: ReadonlySet<Decoration>;
  children?: ReactNode;
}

const H = HAUTEUR_MUR;
const BOIS = '#c9a27a';
const BOIS_CLAIR = '#e2bf92';

const CIEL: Record<MomentJournee, [string, string]> = {
  matin: ['#ffd9a8', '#bfe3f2'],
  jour: ['#9fd3f0', '#d8f0fa'],
  soir: ['#f4a27a', '#f9d3a0'],
  nuit: ['#2c3561', '#4a4f86'],
};

function Fenetre({ y, l, z = 1.6, h = 1.7, moment }: { y: number; l: number; z?: number; h?: number; moment: MomentJournee }) {
  const [haut, bas] = CIEL[moment];
  const [ax, ay] = projeter(0, y, z + h);
  const [bx, by] = projeter(0, y, z);
  const astre = projeter(0.05, y + l * 0.7, z + h * 0.72);
  return (
    <g>
      <defs>
        <linearGradient id={`ciel-${moment}`} gradientUnits="userSpaceOnUse" x1={ax} y1={ay} x2={bx} y2={by}>
          <stop offset="0" stopColor={haut} />
          <stop offset="1" stopColor={bas} />
        </linearGradient>
      </defs>
      <SurMurGauche y={y} z={z} l={l} h={h} couleur={`url(#ciel-${moment})`} trait="#fffaf2" />
      {moment === 'nuit' ? (
        <g fill="#fff6c8">
          <circle cx={astre[0]} cy={astre[1]} r={6} />
          <circle cx={astre[0] + 3} cy={astre[1] - 2} r={5.5} fill={haut} />
        </g>
      ) : (
        <circle cx={astre[0]} cy={astre[1]} r={6} fill="#ffe27a" opacity={moment === 'soir' ? 0.75 : 1} />
      )}
      <polyline points={pts([0.05, y + l / 2, z], [0.05, y + l / 2, z + h])} stroke="#fffaf2" strokeWidth={2.5} fill="none" />
      <polyline points={pts([0.05, y, z + h / 2], [0.05, y + l, z + h / 2])} stroke="#fffaf2" strokeWidth={2.5} fill="none" />
      <Boite x={0.04} y={y - 0.1} z={z - 0.12} l={0.25} p={l + 0.2} h={0.12} couleur="#fffaf2" />
    </g>
  );
}

function Feuillage({ x, y, z, echelle = 1 }: { x: number; y: number; z: number; echelle?: number }) {
  const [cx, cy] = projeter(x, y, z);
  const e = echelle;
  return (
    <g>
      <ellipse cx={cx - 7 * e} cy={cy - 6 * e} rx={7 * e} ry={11 * e} fill="#7cc27a" transform={`rotate(-25 ${cx - 7 * e} ${cy - 6 * e})`} />
      <ellipse cx={cx + 7 * e} cy={cy - 7 * e} rx={7 * e} ry={11 * e} fill="#5fae6a" transform={`rotate(25 ${cx + 7 * e} ${cy - 7 * e})`} />
      <ellipse cx={cx} cy={cy - 12 * e} rx={6 * e} ry={13 * e} fill="#8fd68a" />
    </g>
  );
}

function Plante({ x, y, z = 0 }: { x: number; y: number; z?: number }) {
  return (
    <g>
      <Boite x={x} y={y} z={z} l={0.6} p={0.6} h={0.6} couleur="#e3936a" />
      <Feuillage x={x + 0.3} y={y + 0.3} z={z + 0.6} />
    </g>
  );
}

function Halo({ x, y, z, nuit }: { x: number; y: number; z: number; nuit: boolean }) {
  if (!nuit) return null;
  const [cx, cy] = projeter(x, y, z);
  return <circle cx={cx} cy={cy} r={46} fill="#ffe7a3" opacity={0.35} />;
}

function Guirlande() {
  const couleurs = ['#ffd98a', '#9fd3f0', '#f6b3c8', '#a8e0b0'];
  const points: [number, number, number][] = [];
  for (let t = 0.4; t < COTE; t += 0.8) points.push([0.05, t, H - 0.35 - 0.15 * Math.sin(t * 2)]);
  for (let t = 0.4; t < COTE; t += 0.8) points.push([t, 0.05, H - 0.35 - 0.15 * Math.sin(t * 2)]);
  return (
    <g>
      {points.map(([x, y, z], i) => {
        const [cx, cy] = projeter(x, y, z);
        return <circle key={i} className="guirlande-lumiere" cx={cx} cy={cy} r={3} fill={couleurs[i % couleurs.length]} style={{ animationDelay: `${(i % 6) * 0.3}s` }} />;
      })}
    </g>
  );
}

function Tableau({ x, z = 2.3 }: { x: number; z?: number }) {
  const [cx, cy] = projeter(x + 0.95, 0.05, z + 0.45);
  return (
    <g>
      <SurMurDroit x={x} z={z} l={1.9} h={1.1} couleur="#fffaf2" trait="#b08a63" />
      <circle cx={cx + 8} cy={cy - 6} r={3.5} fill="#f7c948" />
      <polygon points={pts([x + 0.2, 0.05, z + 0.15], [x + 0.9, 0.05, z + 0.75], [x + 1.3, 0.05, z + 0.45], [x + 1.75, 0.05, z + 0.15])} fill="#8fcf9a" />
    </g>
  );
}

function Sol({ carrelage }: { carrelage: boolean }) {
  const cases = [];
  if (carrelage) {
    for (let i = 0; i < COTE; i++)
      for (let j = 0; j < COTE; j++)
        if ((i + j) % 2 === 0) cases.push(<Plat key={`${i}-${j}`} x={i} y={j} l={1} p={1} couleur="#e7eef0" />);
  }
  return (
    <g>
      {/* Épaisseur du plancher, côté spectateur. */}
      <polygon points={pts([COTE, 0, 0], [COTE, COTE, 0], [COTE, COTE, -0.4], [COTE, 0, -0.4])} fill={nuance(carrelage ? '#d5dfe2' : BOIS, 0.7)} />
      <polygon points={pts([0, COTE, 0], [COTE, COTE, 0], [COTE, COTE, -0.4], [0, COTE, -0.4])} fill={nuance(carrelage ? '#d5dfe2' : BOIS, 0.6)} />
      <Plat x={0} y={0} l={COTE} p={COTE} couleur={carrelage ? '#f6f9fa' : BOIS_CLAIR} />
      {carrelage
        ? cases
        : Array.from({ length: COTE - 1 }, (_, i) => (
            <polyline key={i} points={pts([0, i + 1, 0], [COTE, i + 1, 0])} stroke={BOIS} strokeWidth={1} fill="none" />
          ))}
    </g>
  );
}

function Murs({ couleur }: { couleur: string }) {
  const bord = nuance(couleur, 1.06);
  return (
    <g>
      <polygon points={pts([0, 0, 0], [0, COTE, 0], [0, COTE, H], [0, 0, H])} fill={nuance(couleur, 0.92)} />
      <polygon points={pts([0, 0, 0], [COTE, 0, 0], [COTE, 0, H], [0, 0, H])} fill={couleur} />
      {/* Plinthes */}
      <polygon points={pts([0.02, 0, 0], [0.02, COTE, 0], [0.02, COTE, 0.22], [0.02, 0, 0.22])} fill="#fffaf2" opacity={0.8} />
      <polygon points={pts([0, 0.02, 0], [COTE, 0.02, 0], [COTE, 0.02, 0.22], [0, 0.02, 0.22])} fill="#fffaf2" opacity={0.8} />
      {/* Épaisseur des murs coupés, comme une maison de poupée. */}
      <polygon points={pts([-0.3, -0.3, H], [0, 0, H], [0, COTE, H], [-0.3, COTE, H])} fill={bord} />
      <polygon points={pts([-0.3, -0.3, H], [COTE, -0.3, H], [COTE, 0, H], [0, 0, H])} fill={bord} />
      <polygon points={pts([-0.3, COTE, 0], [0, COTE, 0], [0, COTE, H], [-0.3, COTE, H])} fill={nuance(couleur, 0.78)} />
      <polygon points={pts([COTE, -0.3, 0], [COTE, 0, 0], [COTE, 0, H], [COTE, -0.3, H])} fill={nuance(couleur, 0.85)} />
    </g>
  );
}

function Salon({ deco, nuit, moment }: { deco: ReadonlySet<Decoration>; nuit: boolean; moment: MomentJournee }) {
  return (
    <g>
      <Fenetre y={1.4} l={2.2} moment={moment} />
      {deco.has('etagere') && (
        <g>
          <Boite x={0.6} y={0.02} z={2.2} l={2} p={0.45} h={0.08} couleur={BOIS} />
          <Boite x={0.6} y={0.02} z={2.95} l={2} p={0.45} h={0.08} couleur={BOIS} />
          {['#8aa8e8', '#f0a3c0', '#8fcf9a', '#f7d26a', '#b79be8'].map((c, i) => (
            <Boite key={c} x={0.75 + i * 0.3} y={0.08} z={2.28} l={0.22} p={0.32} h={0.45 + (i % 2) * 0.12} couleur={c} />
          ))}
          <Feuillage x={2.2} y={0.25} z={3.03} echelle={0.6} />
        </g>
      )}
      {deco.has('tableau') && <Tableau x={4.3} />}
      {deco.has('plante') && <Plante x={0.25} y={0.25} />}
      {deco.has('tapis') && (
        <g>
          <Plat x={2.6} y={2.5} l={4.8} p={3.4} couleur="#e8b4c8" />
          <Plat x={2.9} y={2.8} l={4.2} p={2.8} couleur="none" trait="#fff6ee" />
        </g>
      )}
      {/* Meuble télé */}
      <Boite x={0.2} y={4.4} l={0.9} p={2.4} h={0.7} couleur={BOIS} />
      <Boite x={0.35} y={4.7} z={0.7} l={0.15} p={1.8} h={1.1} couleur="#3d4250" dessus="#2a2e38" />
      {deco.has('aquarium') && (
        <g>
          <Boite x={0.2} y={7.05} l={0.9} p={0.8} h={0.8} couleur={BOIS} />
          <Boite x={0.25} y={7.1} z={0.8} l={0.8} p={0.7} h={0.6} couleur="#bfe6f2" opacite={0.85} />
          <circle className="poisson" cx={projeter(0.7, 7.5, 1.1)[0]} cy={projeter(0.7, 7.5, 1.1)[1]} r={3} fill="#f7a35c" />
        </g>
      )}
      {/* Canapé contre le mur de droite */}
      <Boite x={3.4} y={0.2} l={3.8} p={0.5} h={1.5} couleur="#7aa8bb" />
      <Boite x={3.05} y={0.2} l={0.35} p={1.75} h={1.05} couleur="#6b98ab" />
      <Boite x={3.4} y={0.7} l={3.8} p={1.25} h={0.75} couleur="#8fb8c9" />
      <Boite x={7.2} y={0.2} l={0.35} p={1.75} h={1.05} couleur="#6b98ab" />
      {deco.has('coussins') && (
        <g>
          <Boite x={3.8} y={0.72} z={0.75} l={0.9} p={0.28} h={0.6} couleur="#f6c3a0" />
          <Boite x={5.9} y={0.72} z={0.75} l={0.9} p={0.28} h={0.6} couleur="#f0a3c0" />
        </g>
      )}
      {deco.has('lampe') && (
        <g>
          <Halo x={7.8} y={0.6} z={2.4} nuit={nuit} />
          <Boite x={7.8} y={0.55} l={0.1} p={0.1} h={2.2} couleur="#8a7a6a" />
          <Boite x={7.5} y={0.25} z={2.2} l={0.7} p={0.7} h={0.6} couleur="#ffd98a" />
        </g>
      )}
      {/* Table basse */}
      <Boite x={4.2} y={3.1} l={1.8} p={1.1} h={0.45} couleur={BOIS} dessus={BOIS_CLAIR} />
      <Boite x={4.5} y={3.35} z={0.45} l={0.3} p={0.3} h={0.25} couleur="#fffaf2" />
    </g>
  );
}

function Cuisine({ deco, moment }: { deco: ReadonlySet<Decoration>; moment: MomentJournee }) {
  const pied = (x: number, y: number) => <Boite key={`${x}-${y}`} x={x} y={y} l={0.12} p={0.12} h={0.95} couleur={BOIS} />;
  return (
    <g>
      <Fenetre y={5} l={2} moment={moment} />
      {/* Placards hauts */}
      <Boite x={1.4} y={0.02} z={2.5} l={4} p={0.6} h={0.9} couleur="#f0d6b4" />
      {/* Plan de travail en L */}
      <Boite x={0.2} y={0.2} l={1.2} p={4.2} h={1.25} couleur="#e9c9a0" dessus="#c9a27a" />
      <Boite x={1.4} y={0.2} l={4} p={1.2} h={1.25} couleur="#e9c9a0" dessus="#c9a27a" />
      <Plat x={0.35} y={2.6} z={1.26} l={0.9} p={1.2} couleur="#4a4a52" />
      <Plat x={2.6} y={0.35} z={1.26} l={1.2} p={0.8} couleur="#9fb8c4" />
      <Boite x={3.1} y={0.25} z={1.25} l={0.12} p={0.12} h={0.5} couleur="#9aa4ac" />
      {deco.has('plante') && <Plante x={0.45} y={0.45} z={1.25} />}
      {/* Frigo */}
      <Boite x={5.6} y={0.2} l={1.5} p={1.3} h={3.1} couleur="#f5f2ec" />
      <polyline points={pts([7.11, 0.5, 2.1], [7.11, 0.5, 2.7])} stroke="#bdb6aa" strokeWidth={3} strokeLinecap="round" />
      <polyline points={pts([7.11, 0.5, 0.6], [7.11, 0.5, 1.6])} stroke="#bdb6aa" strokeWidth={3} strokeLinecap="round" />
      {/* Table et chaises */}
      <Boite x={3.4} y={4.6} l={0.6} p={0.7} h={0.5} couleur="#d9b48a" />
      <Boite x={3.4} y={4.6} z={0.5} l={0.12} p={0.7} h={0.8} couleur="#d9b48a" />
      {pied(4.3, 4.3)}
      {pied(6.2, 4.3)}
      {pied(4.3, 5.7)}
      {pied(6.2, 5.7)}
      <Boite x={4.2} y={4.2} z={0.95} l={2.2} p={1.6} h={0.14} couleur={BOIS} dessus={BOIS_CLAIR} />
      <Boite x={5} y={4.7} z={1.09} l={0.5} p={0.5} h={0.12} couleur="#ffffff" />
    </g>
  );
}

function Chambre({ deco, nuit, moment }: { deco: ReadonlySet<Decoration>; nuit: boolean; moment: MomentJournee }) {
  return (
    <g>
      <Fenetre y={1.2} l={2} moment={moment} />
      {deco.has('tableau') && <Tableau x={0.9} />}
      {deco.has('plante') && <Plante x={0.25} y={0.25} />}
      {deco.has('tapis') && <Plat x={2} y={3.6} l={4.2} p={3} couleur="#c7b8ea" />}
      {/* Armoire */}
      <Boite x={0.2} y={4.6} l={1.1} p={2.6} h={3.1} couleur={BOIS} />
      <polyline points={pts([1.31, 5.9, 0.2], [1.31, 5.9, 2.9])} stroke={nuance(BOIS, 0.7)} strokeWidth={1.5} fill="none" />
      {/* Lit */}
      <Boite x={3.4} y={0.2} l={2.8} p={0.25} h={1.7} couleur="#b08a63" />
      <Boite x={3.4} y={0.45} l={2.8} p={3.4} h={0.55} couleur="#b08a63" />
      <Boite x={3.5} y={0.5} z={0.55} l={2.6} p={3.25} h={0.3} couleur="#fffaf2" />
      <Boite x={3.8} y={0.65} z={0.85} l={2} p={0.7} h={0.22} couleur="#ffffff" />
      <Boite x={3.48} y={1.6} z={0.85} l={2.64} p={2.2} h={0.18} couleur="#9cc7a8" />
      {/* Table de nuit */}
      <Boite x={6.5} y={0.2} l={1} p={0.9} h={0.9} couleur={BOIS} />
      {deco.has('lampe') ? (
        <g>
          <Halo x={7} y={0.65} z={1.5} nuit={nuit} />
          <Boite x={6.95} y={0.6} z={0.9} l={0.1} p={0.1} h={0.35} couleur="#8a7a6a" />
          <Boite x={6.75} y={0.4} z={1.25} l={0.5} p={0.5} h={0.4} couleur="#ffd98a" />
        </g>
      ) : (
        <Boite x={6.7} y={0.4} z={0.9} l={0.5} p={0.35} h={0.12} couleur="#f6c3a0" />
      )}
    </g>
  );
}

function SalleDeBain({ deco, moment }: { deco: ReadonlySet<Decoration>; moment: MomentJournee }) {
  const hublot = Array.from({ length: 12 }, (_, i): [number, number, number] => {
    const a = (i / 12) * Math.PI * 2;
    return [1.41, 6.35 + 0.42 * Math.cos(a), 0.72 + 0.42 * Math.sin(a)];
  });
  return (
    <g>
      {/* Faïence à mi-hauteur */}
      <polygon points={pts([0.01, 0, 0], [0.01, COTE, 0], [0.01, COTE, 1.6], [0.01, 0, 1.6])} fill="#eaf4f6" />
      <polygon points={pts([0, 0.01, 0], [COTE, 0.01, 0], [COTE, 0.01, 1.6], [0, 0.01, 1.6])} fill="#f1f8fa" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} stroke="#d5e4e8" strokeWidth={0.8}>
          <polyline points={pts([0.02, i + 1, 0], [0.02, i + 1, 1.6])} fill="none" />
          <polyline points={pts([i + 1, 0.02, 0], [i + 1, 0.02, 1.6])} fill="none" />
        </g>
      ))}
      <Fenetre y={5.2} l={1.4} z={2.3} h={1.2} moment={moment} />
      <SurMurGauche y={2.1} z={1.9} l={1.4} h={1.3} couleur="#d8eef6" trait="#c9b28f" />
      {deco.has('plante') && <Plante x={0.25} y={0.25} />}
      <Plat x={4} y={2.5} l={2} p={1} couleur="#f6c3c8" />
      {/* Lavabo */}
      <Boite x={0.2} y={2} l={1} p={1.6} h={1.05} couleur="#f5f2ec" />
      <Plat x={0.35} y={2.3} z={1.06} l={0.7} p={1} couleur="#cfe6ef" />
      {/* Toilettes */}
      <Boite x={0.2} y={4.05} l={0.5} p={1} h={1.3} couleur="#ffffff" />
      <Boite x={0.7} y={4.2} l={0.75} p={0.7} h={0.6} couleur="#ffffff" />
      {/* Machine à laver */}
      <Boite x={0.2} y={5.7} l={1.2} p={1.3} h={1.4} couleur="#f5f2ec" />
      <polygon points={pts(...hublot)} fill="#cfe6ef" stroke="#bdb6aa" strokeWidth={2.5} />
      {/* Baignoire */}
      <Boite x={3.4} y={0.2} l={3.9} p={1.9} h={1} couleur="#ffffff" />
      <Plat x={3.6} y={0.4} z={0.96} l={3.5} p={1.5} couleur="#bfe6f2" />
      <Boite x={7} y={0.25} z={1} l={0.15} p={0.15} h={0.5} couleur="#9aa4ac" />
    </g>
  );
}

export function Maison({ piece, couleurMurs, moment, decorations, children }: Props) {
  const nuit = moment === 'nuit';
  return (
    <div className="maison">
      <svg viewBox={`0 0 ${LARGEUR_VUE} ${HAUTEUR_VUE}`} className="maison-svg" aria-hidden="true">
        <Sol carrelage={piece === 'salleDeBain' || piece === 'cuisine'} />
        <Murs couleur={couleurMurs} />
        {decorations.has('guirlande') && <Guirlande />}
        {piece === 'salon' && <Salon deco={decorations} nuit={nuit} moment={moment} />}
        {piece === 'cuisine' && <Cuisine deco={decorations} moment={moment} />}
        {piece === 'chambre' && <Chambre deco={decorations} nuit={nuit} moment={moment} />}
        {piece === 'salleDeBain' && <SalleDeBain deco={decorations} moment={moment} />}
        {nuit && <rect width={LARGEUR_VUE} height={HAUTEUR_VUE} fill="#1e2350" opacity={0.2} />}
        {moment === 'soir' && <rect width={LARGEUR_VUE} height={HAUTEUR_VUE} fill="#f4a27a" opacity={0.07} />}
      </svg>
      <div className="maison-habitants">{children}</div>
    </div>
  );
}
