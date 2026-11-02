// Les personnages posés dans la maison : l'avatar, Rikki, et les petits
// effets (cœurs, notes, étoiles) qui accompagnent ce qu'ils font. Leur
// position vient de la scène (scene.ts) ; ils marchent d'un point à l'autre
// grâce à une transition CSS de la durée du trajet.

import type { CSSProperties, ReactNode } from 'react';
import type { AvatarConfig } from '../../domaine/types';
import type { AccessoireRikki } from '../../domaine/progression';
import { Avatar } from '../avatar/Avatar';
import { Rikki, type EtatRikki } from '../rikki/Rikki';
import { positionEcran, projeter } from './iso';
import { PremierPlan } from './Maison';
import type { Effet, Placement, PlacementRikki } from './scene';

/** Profondeur d'affichage : plus on est près du spectateur, plus on passe devant. */
export function profondeur(x: number, y: number, devant = false): number {
  return Math.round(projeter(x, y, 0)[1]) + (devant ? 20 : 0);
}

function stylePosition(x: number, y: number, z: number, duree: number, devant?: boolean): CSSProperties {
  const transition = duree > 0 ? `left ${duree}ms linear, top ${duree}ms linear` : 'none';
  return { ...positionEcran(x, y, z), zIndex: profondeur(x, y, devant), transition };
}

interface PropsAvatar {
  placement: Placement;
  config: AvatarConfig;
  titre: string;
  /** Pour l'avatar de l'autre : un bouton qui ouvre les émotes. */
  onClick?: () => void;
  etiquette?: string;
  libelle?: string;
}

export function HabitantAvatar({ placement: p, config, titre, onClick, etiquette, libelle }: PropsAvatar) {
  const classes = ['habitant', 'habitant-avatar', `habitant--${p.posture}`, `habitant--${p.pose}`, onClick && 'habitant-autre'].filter(Boolean).join(' ');
  const style = stylePosition(p.x, p.y, p.z, p.duree, p.devant);
  const contenu: ReactNode = (
    <>
      <span className="habitant-corps">
        <Avatar config={config} pose={p.pose} cote={p.cote} assis={p.posture === 'assis' || p.posture === 'attable'} titre={titre} />
      </span>
      {etiquette && <span className="etiquette-prenom">{etiquette}</span>}
    </>
  );
  const premierPlan =
    p.posture === 'bain' || p.posture === 'attable' || p.posture === 'allongeLit' || p.posture === 'allongeCanape' ? (
      <PremierPlan posture={p.posture} style={{ zIndex: profondeur(p.x, p.y, p.devant) + 1 }} />
    ) : null;
  return (
    <>
      {onClick ? (
        <button type="button" className={classes} style={style} aria-label={libelle} onClick={onClick}>
          {contenu}
        </button>
      ) : (
        <div className={classes} style={style}>
          {contenu}
        </div>
      )}
      {premierPlan}
    </>
  );
}

interface PropsRikki {
  placement: PlacementRikki;
  etat: EtatRikki;
  taille: number;
  accessoires: ReadonlySet<AccessoireRikki>;
  titre?: string;
  autre?: boolean;
}

export function HabitantRikki({ placement: p, etat, taille, accessoires, titre, autre }: PropsRikki) {
  const style = stylePosition(p.x, p.y, p.z, p.duree, p.devant);
  const sauts = p.saute && p.duree > 0 ? Math.max(1, Math.round(p.duree / 340)) : 0;
  return (
    <div className={['habitant', 'habitant-rikki', autre && 'habitant-rikki--autre'].filter(Boolean).join(' ')} style={style}>
      <span
        className={sauts ? 'habitant-corps habitant-corps--saute' : 'habitant-corps'}
        // La clé relance l'animation de saut à chaque nouveau trajet.
        key={`${p.x}-${p.y}-${p.z}`}
        style={sauts ? { animationIterationCount: sauts } : undefined}
      >
        <Rikki etat={p.etat ?? etat} taille={taille * (p.echelle ?? 1)} accessoires={accessoires} titre={titre} />
      </span>
    </div>
  );
}

function Coeur({ couleur = '#f4978e' }: { couleur?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden="true">
      <path d="M0,9 C-14,-1 -8,-12 0,-5 C8,-12 14,-1 0,9 Z" fill={couleur} stroke="#e07a72" strokeWidth={1.5} />
    </svg>
  );
}

function Etoile({ couleur = '#ffd98a' }: { couleur?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden="true">
      <path d="M0,-10 L2.6,-2.6 L10,0 L2.6,2.6 L0,10 L-2.6,2.6 L-10,0 L-2.6,-2.6 Z" fill={couleur} />
    </svg>
  );
}

function Levres() {
  return (
    <svg viewBox="-14 -10 28 20" aria-hidden="true">
      <path d="M-12,0 Q-6,-8 0,-3 Q6,-8 12,0 Q6,8 0,7 Q-6,8 -12,0 Z" fill="#e98aa3" stroke="#c0587a" strokeWidth={1.5} />
      <path d="M-11,0 Q0,3 11,0" stroke="#c0587a" strokeWidth={1.5} fill="none" />
    </svg>
  );
}

const PARTICULES: Record<Effet, { contenu: ReactNode; dx: number; delai: number }[]> = {
  coeurs: [
    { contenu: <Coeur />, dx: -18, delai: 0 },
    { contenu: <Coeur couleur="#f6b3c8" />, dx: 14, delai: 0.35 },
    { contenu: <Coeur />, dx: -2, delai: 0.8 },
    { contenu: <Coeur couleur="#f6b3c8" />, dx: 22, delai: 1.3 },
    { contenu: <Coeur />, dx: -22, delai: 1.7 },
  ],
  bisou: [
    { contenu: <Levres />, dx: 0, delai: 0.2 },
    { contenu: <Coeur />, dx: -18, delai: 0.6 },
    { contenu: <Coeur couleur="#f6b3c8" />, dx: 18, delai: 1.1 },
  ],
  etoiles: [
    { contenu: <Etoile />, dx: -20, delai: 0 },
    { contenu: <Etoile couleur="#fff1b8" />, dx: 18, delai: 0.25 },
    { contenu: <Etoile />, dx: 2, delai: 0.55 },
    { contenu: <Etoile couleur="#fff1b8" />, dx: -10, delai: 0.9 },
  ],
  notes: [
    { contenu: <span className="note-musique">♪</span>, dx: -18, delai: 0 },
    { contenu: <span className="note-musique">♫</span>, dx: 16, delai: 0.9 },
    { contenu: <span className="note-musique">♪</span>, dx: 0, delai: 1.8 },
  ],
  zzz: [
    { contenu: <span className="zzz">z</span>, dx: 0, delai: 0 },
    { contenu: <span className="zzz">z</span>, dx: 12, delai: 1.2 },
  ],
};

/** Les effets en boucle (notes) durent toute l'activité ; les autres ne passent qu'une fois. */
const EN_BOUCLE: ReadonlySet<Effet> = new Set(['notes', 'zzz']);

export function EffetScene({ effet }: { effet: { type: Effet; x: number; y: number; z: number; cle: number } }) {
  return (
    <span
      className={`effet-scene effet-scene--${effet.type}${EN_BOUCLE.has(effet.type) ? ' effet-scene--boucle' : ''}`}
      style={{ ...positionEcran(effet.x, effet.y, effet.z), zIndex: 400 }}
      aria-hidden="true"
    >
      {PARTICULES[effet.type].map((p, i) => (
        <span key={i} className="particule" style={{ left: `${p.dx}px`, animationDelay: `${p.delai}s` }}>
          {p.contenu}
        </span>
      ))}
    </span>
  );
}
