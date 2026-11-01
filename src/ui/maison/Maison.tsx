// La maison : le décor où vivent l'avatar et Rikki (ADR 0019). SVG modulaire :
// une pièce à la fois, des meubles de base, et des emplacements pour les
// décorations débloquées par la progression (ADR 0020).
// Repère : viewBox 0 0 400 260 ; le sol commence à y = 190.

import type { ReactNode } from 'react';
import type { MomentJournee } from '../../compagnon/cycleDeVie';
import type { Decoration } from '../../domaine/progression';
import type { PieceId } from '../../domaine/types';

interface Props {
  piece: PieceId;
  couleurMurs: string;
  moment: MomentJournee;
  decorations: ReadonlySet<Decoration>;
  children?: ReactNode;
}

const CIEL: Record<MomentJournee, [string, string]> = {
  matin: ['#ffd9a8', '#bfe3f2'],
  jour: ['#9fd3f0', '#d8f0fa'],
  soir: ['#f4a27a', '#f9d3a0'],
  nuit: ['#2c3561', '#4a4f86'],
};

function Fenetre({ x, moment }: { x: number; moment: MomentJournee }) {
  const [haut, bas] = CIEL[moment];
  const id = `ciel-${moment}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={haut} />
          <stop offset="1" stopColor={bas} />
        </linearGradient>
      </defs>
      <rect x={x} y={34} width={86} height={84} rx={8} fill={`url(#${id})`} stroke="#fffaf2" strokeWidth={7} />
      {moment === 'nuit' ? (
        <g fill="#fff6c8">
          <circle cx={x + 62} cy={56} r={9} />
          <circle cx={x + 66} cy={53} r={8} fill={haut} />
          <circle cx={x + 22} cy={50} r={1.6} />
          <circle cx={x + 36} cy={74} r={1.3} />
          <circle cx={x + 18} cy={92} r={1.4} />
        </g>
      ) : (
        <g>
          <circle cx={x + 64} cy={58} r={10} fill="#ffe27a" opacity={moment === 'soir' ? 0.7 : 1} />
          <ellipse cx={x + 28} cy={88} rx={16} ry={7} fill="#fff" opacity={0.85} />
        </g>
      )}
      <path d={`M${x + 43},34 L${x + 43},118 M${x},76 L${x + 86},76`} stroke="#fffaf2" strokeWidth={4} />
      <rect x={x - 8} y={116} width={102} height={8} rx={3} fill="#fffaf2" />
    </g>
  );
}

function Plante({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0,0 C-22,-10 -26,-34 -8,-44 C-6,-28 -2,-14 0,0 Z" fill="#7cc27a" />
      <path d="M0,0 C22,-12 28,-36 10,-48 C8,-30 4,-14 0,0 Z" fill="#5fae6a" />
      <path d="M0,0 C-4,-20 2,-44 0,-58 C10,-40 8,-18 0,0 Z" fill="#8fd68a" />
      <path d="M-14,0 L14,0 L10,24 L-10,24 Z" fill="#e3936a" />
      <rect x={-16} y={-3} width={32} height={6} rx={3} fill="#d07f58" />
    </g>
  );
}

function Lampe({ x, nuit }: { x: number; nuit: boolean }) {
  return (
    <g>
      {nuit && <circle cx={x} cy={100} r={46} fill="#ffe7a3" opacity={0.35} />}
      <rect x={x - 2} y={110} width={4} height={90} fill="#8a7a6a" />
      <ellipse cx={x} cy={202} rx={14} ry={4} fill="#8a7a6a" />
      <path d={`M${x - 20},112 L${x + 20},112 L${x + 12},84 L${x - 12},84 Z`} fill="#ffd98a" stroke="#e0b25a" strokeWidth={2} />
    </g>
  );
}

function Guirlande() {
  const couleurs = ['#ffd98a', '#9fd3f0', '#f6b3c8', '#a8e0b0'];
  return (
    <g>
      <path d="M0,14 Q50,34 100,16 Q150,34 200,16 Q250,34 300,16 Q350,34 400,14" fill="none" stroke="#7a6a5a" strokeWidth={1.5} />
      {Array.from({ length: 12 }, (_, i) => {
        const x = 16 + i * 33;
        const y = 22 + (i % 3 === 1 ? 6 : 2);
        return <circle key={i} className="guirlande-lumiere" cx={x} cy={y} r={4} fill={couleurs[i % couleurs.length]} style={{ animationDelay: `${i * 0.25}s` }} />;
      })}
    </g>
  );
}

function Tableau({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={64} height={46} rx={4} fill="#fffaf2" stroke="#b08a63" strokeWidth={5} />
      <path d="M6,40 L24,20 L36,32 L44,24 L58,40 Z" fill="#8fcf9a" />
      <circle cx={46} cy={14} r={6} fill="#f7c948" />
    </g>
  );
}

function Tapis({ cx, couleur = '#e8b4c8' }: { cx: number; couleur?: string }) {
  return (
    <g>
      <ellipse cx={cx} cy={228} rx={110} ry={22} fill={couleur} opacity={0.85} />
      <ellipse cx={cx} cy={228} rx={88} ry={15} fill="none" stroke="#fff6ee" strokeWidth={3} strokeDasharray="6 6" />
    </g>
  );
}

function Salon({ deco, nuit }: { deco: ReadonlySet<Decoration>; nuit: boolean }) {
  return (
    <g>
      {deco.has('etagere') && (
        <g transform="translate(150 54)">
          <rect width={70} height={6} fill="#b08a63" />
          <rect y={44} width={70} height={6} fill="#b08a63" />
          {[['#8aa8e8', 6, 22], ['#f0a3c0', 16, 26], ['#8fcf9a', 26, 20], ['#f7d26a', 36, 24]].map(([c, x, h]) => (
            <rect key={String(x)} x={Number(x)} y={44 - Number(h)} width={9} height={Number(h)} fill={String(c)} />
          ))}
          <Plante x={58} y={-14} />
        </g>
      )}
      {deco.has('tableau') && <Tableau x={268} y={60} />}
      {deco.has('tapis') && <Tapis cx={200} />}
      {/* Canapé */}
      <g>
        <rect x={236} y={132} width={140} height={46} rx={18} fill="#8fb8c9" />
        <rect x={226} y={156} width={160} height={42} rx={16} fill="#7aa8bb" />
        <rect x={222} y={146} width={22} height={52} rx={10} fill="#6b98ab" />
        <rect x={368} y={146} width={22} height={52} rx={10} fill="#6b98ab" />
        <rect x={238} y={196} width={8} height={10} fill="#6b5a4a" />
        <rect x={366} y={196} width={8} height={10} fill="#6b5a4a" />
        {deco.has('coussins') && (
          <g>
            <rect x={252} y={138} width={36} height={30} rx={10} fill="#f6c3a0" transform="rotate(-8 270 153)" />
            <rect x={322} y={138} width={36} height={30} rx={10} fill="#f0a3c0" transform="rotate(8 340 153)" />
          </g>
        )}
      </g>
      {deco.has('lampe') && <Lampe x={206} nuit={nuit} />}
      {deco.has('aquarium') && (
        <g transform="translate(140 150)">
          <rect x={0} y={34} width={56} height={22} fill="#b08a63" />
          <rect x={4} y={0} width={48} height={34} rx={4} fill="#bfe6f2" stroke="#8fb8c9" strokeWidth={3} />
          <path className="poisson" d="M20,16 q8,-7 14,0 q-6,7 -14,0 z M34,16 l6,-5 l0,10 z" fill="#f7a35c" />
          <path d="M10,34 q4,-10 0,-14 M44,34 q-4,-12 2,-16" stroke="#6fbf7a" strokeWidth={3} fill="none" />
        </g>
      )}
    </g>
  );
}

function Cuisine({ deco }: { deco: ReadonlySet<Decoration> }) {
  return (
    <g>
      {/* Frigo */}
      <rect x={330} y={70} width={60} height={136} rx={10} fill="#f5f2ec" stroke="#d8d2c8" strokeWidth={3} />
      <path d="M330,120 L390,120" stroke="#d8d2c8" strokeWidth={3} />
      <rect x={378} y={88} width={5} height={20} rx={2} fill="#bdb6aa" />
      <rect x={378} y={132} width={5} height={28} rx={2} fill="#bdb6aa" />
      {/* Plan de travail avec évier */}
      <rect x={150} y={150} width={176} height={56} fill="#e9c9a0" />
      <rect x={146} y={142} width={184} height={12} rx={4} fill="#c9a27a" />
      <rect x={200} y={144} width={50} height={8} rx={3} fill="#9fb8c4" />
      <path d="M226,144 L226,120 Q226,112 236,112 L240,112" fill="none" stroke="#9aa4ac" strokeWidth={4} strokeLinecap="round" />
      {[170, 262].map((x) => (
        <rect key={x} x={x} y={162} width={44} height={36} rx={4} fill="#f0d6b4" stroke="#d9b48a" strokeWidth={2} />
      ))}
      {/* Étagère à épices */}
      <rect x={160} y={60} width={110} height={6} fill="#b08a63" />
      {['#f7a35c', '#8fcf9a', '#f7d26a', '#f0a3c0'].map((c, i) => (
        <rect key={c} x={170 + i * 24} y={42} width={14} height={18} rx={3} fill={c} />
      ))}
      {deco.has('plante') && <Plante x={290} y={118} />}
    </g>
  );
}

function Chambre({ deco, nuit }: { deco: ReadonlySet<Decoration>; nuit: boolean }) {
  return (
    <g>
      {deco.has('tableau') && <Tableau x={300} y={56} />}
      {deco.has('tapis') && <Tapis cx={180} couleur="#c7b8ea" />}
      {/* Lit */}
      <rect x={250} y={120} width={14} height={86} rx={6} fill="#b08a63" />
      <rect x={258} y={160} width={140} height={34} rx={6} fill="#fffaf2" />
      <rect x={258} y={190} width={140} height={14} fill="#b08a63" />
      <rect x={268} y={146} width={44} height={22} rx={10} fill="#ffffff" stroke="#e8e0d4" strokeWidth={2} />
      <path d="M300,162 L398,162 L398,196 L300,196 Z" fill="#9cc7a8" />
      <path d="M300,174 L398,174" stroke="#87b394" strokeWidth={3} />
      {/* Table de nuit */}
      <rect x={196} y={160} width={44} height={44} rx={4} fill="#c9a27a" />
      <rect x={202} y={172} width={32} height={6} rx={3} fill="#b08a63" />
      {deco.has('lampe') ? (
        <g>
          {nuit && <circle cx={218} cy={140} r={30} fill="#ffe7a3" opacity={0.4} />}
          <rect x={215} y={142} width={6} height={18} fill="#8a7a6a" />
          <path d="M204,144 L232,144 L226,124 L210,124 Z" fill="#ffd98a" />
        </g>
      ) : (
        <rect x={208} y={146} width={20} height={14} rx={3} fill="#f6c3a0" />
      )}
    </g>
  );
}

function SalleDeBain() {
  return (
    <g>
      {/* Carrelage */}
      <g opacity={0.35} stroke="#ffffff" strokeWidth={2}>
        <path d="M0,130 L400,130" />
        {Array.from({ length: 13 }, (_, i) => (
          <path key={`v${i}`} d={`M${i * 32},130 L${i * 32},190`} />
        ))}
        <path d="M0,160 L400,160" />
      </g>
      {/* Miroir et lavabo */}
      <ellipse cx={200} cy={74} rx={30} ry={38} fill="#d8eef6" stroke="#c9b28f" strokeWidth={5} />
      <path d="M186,58 L198,46 M190,72 L206,56" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" />
      <path d="M168,140 L232,140 Q228,166 200,166 Q172,166 168,140 Z" fill="#ffffff" stroke="#d8d2c8" strokeWidth={3} />
      <rect x={192} y={166} width={16} height={38} fill="#ece6dc" />
      {/* Baignoire */}
      <path d="M250,150 L398,150 L392,196 Q388,206 376,206 L272,206 Q260,206 256,196 Z" fill="#ffffff" stroke="#d8d2c8" strokeWidth={3} />
      <path d="M262,150 Q264,140 276,142 Q284,134 296,140 Q308,134 316,142" fill="#eaf6fb" stroke="#cfe6ef" strokeWidth={2} />
      <path d="M380,150 L380,112 Q380,104 372,104 L362,104" fill="none" stroke="#9aa4ac" strokeWidth={4} strokeLinecap="round" />
      {/* Machine à laver */}
      <rect x={20} y={136} width={64} height={68} rx={8} fill="#f5f2ec" stroke="#d8d2c8" strokeWidth={3} />
      <circle cx={52} cy={174} r={20} fill="#cfe6ef" stroke="#bdb6aa" strokeWidth={4} />
      <circle cx={34} cy={148} r={3} fill="#9fd3a8" />
    </g>
  );
}

export function Maison({ piece, couleurMurs, moment, decorations, children }: Props) {
  const nuit = moment === 'nuit';
  return (
    <div className="maison">
      <svg viewBox="0 0 400 260" className="maison-svg" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <rect width={400} height={190} fill={couleurMurs} />
        <rect y={182} width={400} height={10} fill="#fffaf2" opacity={0.7} />
        <rect y={190} width={400} height={70} fill="#d9b48a" />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M${i * 64 + (i % 2) * 20},190 L${i * 64 + (i % 2) * 20},260`} stroke="#c9a27a" strokeWidth={2} />
        ))}
        <path d="M0,224 L400,224" stroke="#c9a27a" strokeWidth={2} />
        {piece !== 'salleDeBain' && <Fenetre x={40} moment={moment} />}
        {piece === 'salleDeBain' && (
          <g transform="translate(80 0) scale(0.7)">
            <Fenetre x={0} moment={moment} />
          </g>
        )}
        {decorations.has('guirlande') && <Guirlande />}
        {piece === 'salon' && <Salon deco={decorations} nuit={nuit} />}
        {piece === 'cuisine' && <Cuisine deco={decorations} />}
        {piece === 'chambre' && <Chambre deco={decorations} nuit={nuit} />}
        {piece === 'salleDeBain' && <SalleDeBain />}
        {decorations.has('plante') && piece !== 'cuisine' && <Plante x={piece === 'salleDeBain' ? 120 : 26} y={180} />}
        {nuit && <rect width={400} height={260} fill="#1e2350" opacity={0.18} />}
      </svg>
      <div className="maison-habitants">{children}</div>
    </div>
  );
}
