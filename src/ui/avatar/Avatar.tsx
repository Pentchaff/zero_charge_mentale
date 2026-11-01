// L'avatar : un personnage humain mignon en SVG, assemblé à partir de pièces
// interchangeables (ADR 0017). Grande tête, petit corps, comme un Mii.
// Repère : viewBox 0 0 200 240, tête centrée en (100, 96).

import type { CSSProperties } from 'react';
import type { AvatarConfig, Coiffure } from '../../domaine/types';

export type PoseAvatar = 'repos' | 'fait' | 'calin';

interface Props {
  config: AvatarConfig;
  pose?: PoseAvatar;
  /** N'affiche que la tête (vignettes de l'éditeur, en-tête). */
  teteSeule?: boolean;
  className?: string;
  style?: CSSProperties;
  titre?: string;
}

const CX = 100;
const CY = 96;

function assombrir(hex: string, facteur = 0.82): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (d: number) => Math.round(((n >> d) & 255) * facteur);
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
}

function Visage({ forme, peau }: { forme: AvatarConfig['visage']; peau: string }) {
  const contour = assombrir(peau, 0.88);
  const commun = { fill: peau, stroke: contour, strokeWidth: 2 };
  switch (forme) {
    case 'rond':
      return <ellipse cx={CX} cy={CY} rx={58} ry={60} {...commun} />;
    case 'ovale':
      return <ellipse cx={CX} cy={CY + 2} rx={52} ry={64} {...commun} />;
    case 'carre':
      return <rect x={CX - 57} y={CY - 60} width={114} height={122} rx={34} {...commun} />;
    case 'pointu':
      return (
        <path
          d={`M${CX},${CY + 64} C${CX - 38},${CY + 60} ${CX - 58},${CY + 26} ${CX - 58},${CY - 6}
             C${CX - 58},${CY - 42} ${CX - 32},${CY - 60} ${CX},${CY - 60}
             C${CX + 32},${CY - 60} ${CX + 58},${CY - 42} ${CX + 58},${CY - 6}
             C${CX + 58},${CY + 26} ${CX + 38},${CY + 60} ${CX},${CY + 64} Z`}
          {...commun}
        />
      );
  }
}

/** Cheveux derrière la tête (longueur). */
function CheveuxArriere({ coiffure, couleur }: { coiffure: Coiffure; couleur: string }) {
  switch (coiffure) {
    case 'longue':
      return (
        <path
          d={`M${CX - 62},${CY - 10} C${CX - 66},${CY - 70} ${CX + 66},${CY - 70} ${CX + 62},${CY - 10}
             L${CX + 66},${CY + 92} C${CX + 40},${CY + 104} ${CX - 40},${CY + 104} ${CX - 66},${CY + 92} Z`}
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
    case 'queue':
      return (
        <g fill={couleur}>
          <ellipse cx={CX + 66} cy={CY - 20} rx={16} ry={34} transform={`rotate(24 ${CX + 66} ${CY - 20})`} />
          <circle cx={CX + 52} cy={CY - 48} r={9} fill={assombrir(couleur, 0.7)} />
        </g>
      );
    case 'chignon':
      return <circle cx={CX} cy={CY - 66} r={22} fill={couleur} />;
    case 'boucles':
      return (
        <g fill={couleur}>
          {[-60, -48, 48, 60].map((dx, i) => (
            <circle key={i} cx={CX + dx} cy={CY + (Math.abs(dx) > 50 ? 10 : 30)} r={16} />
          ))}
        </g>
      );
    default:
      return null;
  }
}

/** Cheveux devant (dessus de la tête et frange). */
function CheveuxAvant({ coiffure, couleur }: { coiffure: Coiffure; couleur: string }) {
  const ombre = assombrir(couleur, 0.85);
  // Calotte : couvre le haut du crâne jusqu'au front.
  const calotte = `M${CX - 61},${CY + 6} C${CX - 66},${CY - 56} ${CX - 30},${CY - 70} ${CX},${CY - 70}
                   C${CX + 30},${CY - 70} ${CX + 66},${CY - 56} ${CX + 61},${CY + 6}
                   C${CX + 56},${CY - 18} ${CX + 46},${CY - 30} ${CX + 34},${CY - 36}`;
  switch (coiffure) {
    case 'chauve':
      return null;
    case 'courte':
      return (
        <path
          d={`${calotte} C${CX + 14},${CY - 24} ${CX - 22},${CY - 26} ${CX - 40},${CY - 36}
              C${CX - 50},${CY - 28} ${CX - 58},${CY - 14} ${CX - 61},${CY + 6} Z`}
          fill={couleur}
          stroke={ombre}
          strokeWidth={2}
        />
      );
    case 'frange':
    case 'carre':
      return (
        <path
          d={`${calotte} C${CX + 34},${CY - 24} ${CX + 30},${CY - 16} ${CX + 26},${CY - 14}
              L${CX + 16},${CY - 24} L${CX + 6},${CY - 13} L${CX - 6},${CY - 24} L${CX - 16},${CY - 13}
              L${CX - 28},${CY - 24} L${CX - 38},${CY - 12} C${CX - 50},${CY - 18} ${CX - 58},${CY - 6} ${CX - 61},${CY + 6} Z`}
          fill={couleur}
          stroke={ombre}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      );
    case 'longue':
    case 'queue':
    case 'chignon':
      // Raie au milieu, mèches tirées sur les côtés.
      return (
        <path
          d={`M${CX - 61},${CY + 14} C${CX - 68},${CY - 56} ${CX - 30},${CY - 70} ${CX},${CY - 70}
              C${CX + 30},${CY - 70} ${CX + 68},${CY - 56} ${CX + 61},${CY + 14}
              C${CX + 52},${CY - 20} ${CX + 26},${CY - 32} ${CX + 2},${CY - 46}
              C${CX - 24},${CY - 32} ${CX - 52},${CY - 20} ${CX - 61},${CY + 14} Z`}
          fill={couleur}
          stroke={ombre}
          strokeWidth={2}
        />
      );
    case 'boucles':
      return (
        <g fill={couleur} stroke={ombre} strokeWidth={2}>
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
    case 'herisse':
      return (
        <path
          d={`M${CX - 61},${CY + 2} C${CX - 70},${CY - 40} ${CX - 56},${CY - 58} ${CX - 44},${CY - 60}
              Q${CX - 44},${CY - 80} ${CX - 26},${CY - 70} Q${CX - 16},${CY - 90} ${CX},${CY - 74}
              Q${CX + 16},${CY - 90} ${CX + 26},${CY - 70} Q${CX + 44},${CY - 80} ${CX + 44},${CY - 60}
              C${CX + 56},${CY - 58} ${CX + 70},${CY - 40} ${CX + 61},${CY + 2}
              C${CX + 50},${CY - 30} ${CX - 50},${CY - 30} ${CX - 61},${CY + 2} Z`}
          fill={couleur}
          stroke={ombre}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      );
  }
}

function Yeux({ forme, couleur }: { forme: AvatarConfig['yeux']; couleur: string }) {
  const y = CY + 8;
  const xs = [CX - 23, CX + 23];
  switch (forme) {
    case 'ronds':
      return (
        <g className="avatar-yeux">
          {xs.map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={y} rx={6} ry={8} fill={couleur} />
              <circle cx={x + 2} cy={y - 3} r={2.2} fill="#fff" />
            </g>
          ))}
        </g>
      );
    case 'grands':
      return (
        <g className="avatar-yeux">
          {xs.map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={y} rx={10} ry={12} fill="#fff" stroke="#3a2a22" strokeWidth={1.5} />
              <circle cx={x} cy={y + 2} r={7} fill={couleur} />
              <circle cx={x} cy={y + 2} r={3} fill="#1e1612" />
              <circle cx={x + 3} cy={y - 2} r={2.5} fill="#fff" />
            </g>
          ))}
        </g>
      );
    case 'amande':
      return (
        <g className="avatar-yeux">
          {xs.map((x) => (
            <g key={x}>
              <path d={`M${x - 10},${y} Q${x},${y - 9} ${x + 10},${y} Q${x},${y + 6} ${x - 10},${y} Z`} fill="#fff" stroke="#3a2a22" strokeWidth={1.5} />
              <circle cx={x} cy={y - 0.5} r={4.2} fill={couleur} />
              <circle cx={x + 1.5} cy={y - 2} r={1.3} fill="#fff" />
            </g>
          ))}
        </g>
      );
    case 'joyeux':
      return (
        <g fill="none" stroke="#3a2a22" strokeWidth={3.2} strokeLinecap="round">
          {xs.map((x) => (
            <path key={x} d={`M${x - 8},${y + 2} Q${x},${y - 8} ${x + 8},${y + 2}`} />
          ))}
        </g>
      );
    case 'endormis':
      return (
        <g fill="none" stroke="#3a2a22" strokeWidth={3} strokeLinecap="round">
          {xs.map((x) => (
            <path key={x} d={`M${x - 8},${y} Q${x},${y + 6} ${x + 8},${y}`} />
          ))}
        </g>
      );
  }
}

function SourcilsSvg({ forme, couleur }: { forme: AvatarConfig['sourcils']; couleur: string }) {
  const y = CY - 10;
  if (forme === 'aucun') return null;
  const largeur = forme === 'epais' ? 5 : 2.6;
  return (
    <g fill="none" stroke={assombrir(couleur, 0.9)} strokeWidth={largeur} strokeLinecap="round">
      {[CX - 23, CX + 23].map((x) =>
        forme === 'arrondis' ? (
          <path key={x} d={`M${x - 8},${y + 2} Q${x},${y - 5} ${x + 8},${y + 2}`} />
        ) : (
          <path key={x} d={`M${x - 8},${y} L${x + 8},${y}`} />
        ),
      )}
    </g>
  );
}

function BoucheSvg({ forme }: { forme: AvatarConfig['bouche'] }) {
  const y = CY + 34;
  const trait = { fill: 'none', stroke: '#7a3b2e', strokeWidth: 3, strokeLinecap: 'round' as const };
  switch (forme) {
    case 'sourire':
      return <path d={`M${CX - 12},${y - 2} Q${CX},${y + 9} ${CX + 12},${y - 2}`} {...trait} />;
    case 'grand':
      return (
        <g>
          <path d={`M${CX - 14},${y - 4} Q${CX},${y - 3} ${CX + 14},${y - 4} Q${CX + 12},${y + 14} ${CX},${y + 14} Q${CX - 12},${y + 14} ${CX - 14},${y - 4} Z`} fill="#8a3a32" />
          <ellipse cx={CX} cy={y + 9} rx={7} ry={4} fill="#f08a8a" />
        </g>
      );
    case 'petit':
      return <ellipse cx={CX} cy={y + 2} rx={4.5} ry={5.5} fill="#8a3a32" />;
    case 'chat':
      return <path d={`M${CX - 12},${y} Q${CX - 6},${y + 7} ${CX},${y} Q${CX + 6},${y + 7} ${CX + 12},${y}`} {...trait} />;
    case 'neutre':
      return <path d={`M${CX - 8},${y + 2} L${CX + 8},${y + 2}`} {...trait} />;
  }
}

function LunettesSvg({ forme }: { forme: AvatarConfig['lunettes'] }) {
  const y = CY + 8;
  switch (forme) {
    case 'aucune':
      return null;
    case 'rondes':
      return (
        <g fill="rgba(255,255,255,0.15)" stroke="#4a3a34" strokeWidth={3}>
          <circle cx={CX - 23} cy={y} r={14} />
          <circle cx={CX + 23} cy={y} r={14} />
          <path d={`M${CX - 9},${y - 2} Q${CX},${y - 7} ${CX + 9},${y - 2}`} fill="none" />
        </g>
      );
    case 'carrees':
      return (
        <g fill="rgba(255,255,255,0.15)" stroke="#4a3a34" strokeWidth={3}>
          <rect x={CX - 38} y={y - 11} width={30} height={22} rx={5} />
          <rect x={CX + 8} y={y - 11} width={30} height={22} rx={5} />
          <path d={`M${CX - 8},${y - 3} L${CX + 8},${y - 3}`} />
        </g>
      );
    case 'soleil':
      return (
        <g stroke="#2a2a33" strokeWidth={3}>
          <path d={`M${CX - 40},${y - 10} L${CX - 6},${y - 10} Q${CX - 6},${y + 14} ${CX - 23},${y + 14} Q${CX - 40},${y + 14} ${CX - 40},${y - 10} Z`} fill="#2f3440" />
          <path d={`M${CX + 6},${y - 10} L${CX + 40},${y - 10} Q${CX + 40},${y + 14} ${CX + 23},${y + 14} Q${CX + 6},${y + 14} ${CX + 6},${y - 10} Z`} fill="#2f3440" />
          <path d={`M${CX - 6},${y - 8} L${CX + 6},${y - 8}`} />
          <path d={`M${CX - 34},${y - 4} L${CX - 26},${y - 4}`} stroke="#8a93a8" strokeWidth={2.5} strokeLinecap="round" />
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
    case 'noeud':
      return (
        <g transform={`translate(${CX + 40} ${CY - 54}) rotate(18)`}>
          <path d="M0,0 L-20,-12 L-20,12 Z M0,0 L20,-12 L20,12 Z" fill="#f08aa6" stroke="#c9607e" strokeWidth={2} strokeLinejoin="round" />
          <circle r={5} fill="#c9607e" />
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

function Corps({ config, pose }: { config: AvatarConfig; pose: PoseAvatar }) {
  const c = config.couleurTenue;
  const ombre = assombrir(c);
  const peau = config.peau;
  // Rotation horaire à l'écran : le bras gauche monte avec un angle positif.
  const brasG = pose === 'fait' ? 140 : pose === 'calin' ? -35 : 0;
  const brasD = pose === 'fait' ? -140 : pose === 'calin' ? 35 : 0;
  return (
    <g>
      {/* Bras : pivotent à l'épaule pour les gestes. */}
      <g className="avatar-bras" style={{ transform: `rotate(${brasG}deg)`, transformOrigin: '62px 184px' }}>
        <rect x={48} y={180} width={20} height={46} rx={10} fill={c} stroke={ombre} strokeWidth={2} />
        <circle cx={58} cy={228} r={9} fill={peau} />
      </g>
      <g className="avatar-bras" style={{ transform: `rotate(${brasD}deg)`, transformOrigin: '138px 184px' }}>
        <rect x={132} y={180} width={20} height={46} rx={10} fill={c} stroke={ombre} strokeWidth={2} />
        <circle cx={142} cy={228} r={9} fill={peau} />
      </g>
      <rect x={90} y={150} width={20} height={20} fill={assombrir(peau, 0.92)} />
      <path d="M54,240 C52,190 70,166 100,166 C130,166 148,190 146,240 Z" fill={c} stroke={ombre} strokeWidth={2} />
      {config.tenue === 'pull' && <path d="M84,168 Q100,182 116,168" fill="none" stroke={ombre} strokeWidth={5} strokeLinecap="round" />}
      {config.tenue === 'rayures' && (
        <g stroke="#fff8ee" strokeWidth={6} opacity={0.75}>
          <path d="M60,192 L140,192" />
          <path d="M56,210 L144,210" />
          <path d="M55,228 L145,228" />
        </g>
      )}
      {config.tenue === 'salopette' && (
        <g>
          <path d="M72,200 L128,200 L140,240 L60,240 Z" fill="#5b7fb8" stroke="#45628f" strokeWidth={2} />
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

export function Avatar({ config, pose = 'repos', teteSeule = false, className, style, titre }: Props) {
  const viewBox = teteSeule ? '18 2 164 176' : '0 0 200 240';
  return (
    <svg
      viewBox={viewBox}
      className={['avatar', `avatar--${pose}`, className].filter(Boolean).join(' ')}
      style={style}
      role="img"
      aria-label={titre}
    >
      {titre && <title>{titre}</title>}
      <CheveuxArriere coiffure={config.coiffure} couleur={config.couleurCheveux} />
      {!teteSeule && <Corps config={config} pose={pose} />}
      <g className="avatar-tete">
        {/* Oreilles */}
        <circle cx={CX - 57} cy={CY + 12} r={10} fill={config.peau} stroke={assombrir(config.peau, 0.88)} strokeWidth={2} />
        <circle cx={CX + 57} cy={CY + 12} r={10} fill={config.peau} stroke={assombrir(config.peau, 0.88)} strokeWidth={2} />
        <Visage forme={config.visage} peau={config.peau} />
        {config.joues && (
          <g fill="#f4978e" opacity={0.45}>
            <ellipse cx={CX - 34} cy={CY + 28} rx={9} ry={6} />
            <ellipse cx={CX + 34} cy={CY + 28} rx={9} ry={6} />
          </g>
        )}
        <Yeux forme={pose === 'fait' ? 'joyeux' : config.yeux} couleur={config.couleurYeux} />
        <SourcilsSvg forme={config.sourcils} couleur={config.couleurCheveux} />
        <path d={`M${CX - 3},${CY + 22} Q${CX},${CY + 25} ${CX + 3},${CY + 22}`} fill="none" stroke={assombrir(config.peau, 0.75)} strokeWidth={2} strokeLinecap="round" />
        <BoucheSvg forme={pose === 'fait' ? 'grand' : config.bouche} />
        <CheveuxAvant coiffure={config.coiffure} couleur={config.couleurCheveux} />
        <LunettesSvg forme={config.lunettes} />
        <CoiffeSvg forme={config.coiffe} couleurTenue={config.couleurTenue} />
      </g>
    </svg>
  );
}
