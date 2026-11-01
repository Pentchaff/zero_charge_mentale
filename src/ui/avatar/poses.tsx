// Les poses de l'avatar : ce que font ses bras, son visage et les objets
// qu'il tient. Une pose « tournée vers un côté » (câlin, bisou, pat pat,
// poêle…) est décrite pour la droite ; vers la gauche, les bras sont dessinés
// en miroir. Repère : celui de l'avatar (viewBox 0 0 200 284).

import type { Bouche } from '../../domaine/types';

export type PoseAvatar =
  // Poses de base
  | 'repos'
  | 'content'
  | 'fait'
  | 'calin' // serre quelque chose contre lui (Rikki, ou lui-même)
  | 'marche'
  // Émotes entre avatars
  | 'enlace'
  | 'bisou'
  | 'patpat'
  | 'tapote' // reçoit un pat pat
  | 'caresse' // fait pat pat à Rikki, plus bas
  // Activités dans la maison
  | 'lit'
  | 'boit'
  | 'cuisine'
  | 'arrose'
  | 'danse'
  | 'etire'
  | 'dort'
  // Gestes des micro-étapes
  | 'balaie'
  | 'vaisselle'
  | 'plie'
  | 'brosse';

export type Cote = 'gauche' | 'droite';

export type Objet = 'livre' | 'tasse' | 'poele' | 'assiette' | 'eponge' | 'balai' | 'linge' | 'brosse' | 'arrosoir';

interface Bras {
  /** Rotation à l'épaule, en degrés, sens horaire à l'écran (bras gauche : vers l'extérieur). */
  angle: number;
  /** Animation CSS du bras autour de l'épaule. */
  anim?: string;
  longueur?: number;
  objet?: Objet;
}

export interface DefPose {
  g: Bras;
  d: Bras;
  yeux?: 'joyeux' | 'endormis' | 'bas';
  bouche?: Bouche;
  /** Inclinaison de la tête vers le côté, en degrés. */
  tete?: number;
  /** Tout le corps penché vers le côté, en degrés. */
  corps?: number;
  /** Objet tenu à deux mains devant la poitrine. */
  devant?: Objet;
  casque?: boolean;
  joues?: boolean;
  /** Les bras passent devant le corps (ils se croisent devant la poitrine). */
  brasDevant?: boolean;
  /** La main droite et son objet passent devant le visage (brosse à dents). */
  mainDevantTete?: boolean;
}

export const POSES: Record<PoseAvatar, DefPose> = {
  repos: { g: { angle: 0 }, d: { angle: 0 } },
  content: { g: { angle: 12 }, d: { angle: -12 }, yeux: 'joyeux', bouche: 'large', joues: true },
  fait: { g: { angle: 140 }, d: { angle: -140 }, yeux: 'joyeux', bouche: 'grand' },
  calin: { g: { angle: -38 }, d: { angle: 38 }, yeux: 'joyeux', bouche: 'sourire', joues: true, brasDevant: true },
  marche: { g: { angle: 0, anim: 'balance' }, d: { angle: 0, anim: 'balance-inverse' } },

  enlace: { g: { angle: -58 }, d: { angle: -102 }, yeux: 'joyeux', bouche: 'sourire', tete: 12, corps: 5, joues: true, brasDevant: true },
  bisou: { g: { angle: -20 }, d: { angle: -62 }, yeux: 'joyeux', bouche: 'bisou', tete: 16, corps: 9, joues: true },
  patpat: { g: { angle: 8 }, d: { angle: -165, anim: 'tapote', longueur: 120 }, yeux: 'joyeux', bouche: 'large', corps: 3 },
  tapote: { g: { angle: 6 }, d: { angle: -6 }, yeux: 'joyeux', bouche: 'large', tete: 7, joues: true },
  caresse: { g: { angle: 4 }, d: { angle: -112, anim: 'tapote' }, yeux: 'joyeux', bouche: 'sourire', corps: 6 },

  lit: { g: { angle: -32 }, d: { angle: 32 }, yeux: 'bas', devant: 'livre' },
  boit: { g: { angle: -32 }, d: { angle: 32 }, bouche: 'sourire', devant: 'tasse' },
  cuisine: { g: { angle: -18 }, d: { angle: -76, anim: 'secoue', objet: 'poele' }, bouche: 'sourire', tete: 6 },
  arrose: { g: { angle: 4 }, d: { angle: -72, objet: 'arrosoir' }, bouche: 'sourire', tete: 6 },
  danse: { g: { angle: 150, anim: 'danse' }, d: { angle: -150, anim: 'danse-inverse' }, yeux: 'joyeux', bouche: 'grand', casque: true },
  etire: { g: { angle: 168 }, d: { angle: -168 }, yeux: 'joyeux', bouche: 'surpris' },
  dort: { g: { angle: -22 }, d: { angle: 22 }, yeux: 'endormis', bouche: 'petit' },

  balaie: { g: { angle: -24, anim: 'balaie' }, d: { angle: 22, anim: 'balaie' }, bouche: 'sourire', devant: 'balai' },
  vaisselle: { g: { angle: -30, objet: 'assiette' }, d: { angle: 36, anim: 'frotte', objet: 'eponge' }, bouche: 'sourire', yeux: 'bas', brasDevant: true },
  plie: { g: { angle: -40, anim: 'plie' }, d: { angle: 40, anim: 'plie-inverse' }, bouche: 'sourire', yeux: 'bas', devant: 'linge' },
  brosse: { g: { angle: 4 }, d: { angle: 150, anim: 'brosse', objet: 'brosse' }, bouche: 'dents', mainDevantTete: true },
};

/** Épaules, dans le repère de l'avatar (avant corpulence et stature). */
export const EPAULE_G: [number, number] = [62, 184];
export const EPAULE_D: [number, number] = [138, 184];

/** Où se trouve la main au bout d'un bras tourné de `angle` degrés. */
export function positionMain(epaule: [number, number], cote: 'g' | 'd', angle: number, longueur = 46): [number, number] {
  const vx = cote === 'g' ? -4 : 4;
  const vy = longueur - 2;
  const a = (angle * Math.PI) / 180;
  return [epaule[0] + vx * Math.cos(a) - vy * Math.sin(a), epaule[1] + vx * Math.sin(a) + vy * Math.cos(a)];
}

/** Un objet tenu à la main, dessiné autour de la main (x, y). */
export function ObjetTenu({ objet, x, y }: { objet: Objet; x: number; y: number }) {
  switch (objet) {
    case 'poele':
      return (
        <g transform={`translate(${x} ${y})`} className="objet objet-poele">
          <rect x={4} y={-3} width={24} height={6} rx={3} fill="#5a4a42" />
          <path d="M26,-4 L66,-4 Q64,8 46,8 Q30,8 26,-4 Z" fill="#4b5568" stroke="#363d4a" strokeWidth={2} strokeLinejoin="round" />
          <ellipse className="objet-crepe" cx={46} cy={-7} rx={15} ry={4} fill="#f2c26b" stroke="#d9a04a" strokeWidth={1.5} />
          <g className="objet-vapeur" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.8}>
            <path d="M40,-18 q-5,-8 0,-16" />
            <path d="M54,-20 q-5,-8 0,-16" />
          </g>
        </g>
      );
    case 'arrosoir':
      return (
        <g transform={`translate(${x} ${y})`} className="objet objet-arrosoir">
          <path d="M-2,-14 Q14,-28 30,-14" fill="none" stroke="#5f9e4f" strokeWidth={4} strokeLinecap="round" />
          <rect x={2} y={-14} width={30} height={26} rx={6} fill="#8fcf7a" stroke="#5f9e4f" strokeWidth={2} />
          <path d="M32,-4 L54,-18 L56,-14 L34,2 Z" fill="#8fcf7a" stroke="#5f9e4f" strokeWidth={2} strokeLinejoin="round" />
          <g className="objet-gouttes" fill="#7ec4ea">
            <ellipse cx={60} cy={-6} rx={2.5} ry={3.5} />
            <ellipse cx={66} cy={2} rx={2.5} ry={3.5} />
            <ellipse cx={58} cy={8} rx={2.5} ry={3.5} />
          </g>
        </g>
      );
    case 'eponge':
      return (
        <g transform={`translate(${x} ${y})`} className="objet">
          <rect x={-10} y={-8} width={20} height={14} rx={3} fill="#f7d26a" stroke="#d9a832" strokeWidth={1.5} />
          <rect x={-10} y={2} width={20} height={5} rx={2} fill="#8fcf7a" />
          <g className="objet-bulles" fill="#ffffff" stroke="#bfe6f2" strokeWidth={1.2}>
            <circle cx={-14} cy={-14} r={4} />
            <circle cx={-4} cy={-20} r={3} />
            <circle cx={8} cy={-16} r={3.5} />
          </g>
        </g>
      );
    case 'assiette':
      return (
        <g transform={`translate(${x} ${y})`} className="objet">
          <ellipse cx={20} cy={-2} rx={24} ry={9} fill="#ffffff" stroke="#c9d6dc" strokeWidth={2} />
          <ellipse cx={20} cy={-3} rx={13} ry={4.5} fill="none" stroke="#dfe8ec" strokeWidth={1.5} />
        </g>
      );
    case 'brosse':
      return (
        <g transform={`translate(${x} ${y}) rotate(-20)`} className="objet">
          <rect x={-30} y={-3} width={34} height={6} rx={3} fill="#7ec4cf" stroke="#4f8f86" strokeWidth={1.2} />
          <rect x={-34} y={-8} width={9} height={6} rx={2} fill="#ffffff" stroke="#c9d6dc" strokeWidth={1} />
          <g className="objet-bulles" fill="#ffffff" stroke="#bfe6f2" strokeWidth={1.2}>
            <circle cx={-40} cy={-14} r={3.5} />
            <circle cx={-30} cy={-20} r={2.5} />
          </g>
        </g>
      );
    default:
      return null;
  }
}

/** Un objet tenu à deux mains devant la poitrine (livre, tasse, linge, balai). */
export function ObjetDevant({ objet }: { objet: Objet }) {
  switch (objet) {
    case 'livre':
      return (
        <g className="objet objet-livre">
          <path d="M100,206 Q82,198 66,204 L66,236 Q82,230 100,238 Q118,230 134,236 L134,204 Q118,198 100,206 Z" fill="#e98aa3" stroke="#c0587a" strokeWidth={2} strokeLinejoin="round" />
          <path d="M100,208 Q84,201 70,206 L70,231 Q84,226 100,233 Z" fill="#fffaf2" />
          <path d="M100,208 Q116,201 130,206 L130,231 Q116,226 100,233 Z" fill="#fffaf2" />
          <g stroke="#d9cbbb" strokeWidth={1.5}>
            <path d="M76,213 L94,216 M76,220 L94,223 M106,216 L124,213 M106,223 L124,220" />
          </g>
          <path className="objet-page" d="M100,208 Q116,201 130,206 L130,231 Q116,226 100,233 Z" fill="#fff6e6" stroke="#e8dccb" strokeWidth={1} />
          <path d="M100,206 L100,238" stroke="#c0587a" strokeWidth={2} />
        </g>
      );
    case 'tasse':
      return (
        <g className="objet objet-tasse">
          <g className="objet-vapeur" fill="none" stroke="#ffffff" strokeWidth={3.5} strokeLinecap="round" opacity={0.85}>
            <path d="M94,192 q-6,-8 0,-16" />
            <path d="M107,190 q-6,-8 0,-16" />
          </g>
          <path d="M116,208 q14,0 14,10 q0,10 -14,10" fill="none" stroke="#e3936a" strokeWidth={5} />
          <rect x={82} y={200} width={36} height={34} rx={8} fill="#f6c3a0" stroke="#e3936a" strokeWidth={2} />
          <path d="M92,214 C88,210 90,206 93,208 C96,206 98,210 92,214 Z" fill="#f4978e" transform="translate(4 4) scale(1.3) translate(-22 -50)" />
        </g>
      );
    case 'linge':
      return (
        <g className="objet objet-linge">
          <path d="M70,206 L86,200 Q100,208 114,200 L130,206 L134,220 L122,222 L122,238 L78,238 L78,222 L66,220 Z" fill="#8ec5e8" stroke="#5f9ec8" strokeWidth={2} strokeLinejoin="round" />
          <path d="M86,200 Q100,212 114,200" fill="none" stroke="#5f9ec8" strokeWidth={2} />
        </g>
      );
    case 'balai':
      return (
        <g className="objet objet-balai">
          <path d="M84,196 L150,262" stroke="#b08a63" strokeWidth={6} strokeLinecap="round" />
          <path d="M140,252 L170,250 L178,280 L134,280 Z" fill="#f2c94c" stroke="#c9962a" strokeWidth={2} strokeLinejoin="round" />
          <path d="M146,262 L144,278 M156,260 L156,278 M166,258 L168,278" stroke="#c9962a" strokeWidth={1.5} />
        </g>
      );
    default:
      return null;
  }
}
