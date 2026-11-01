// La mise en scène de la maison : où se tiennent l'avatar et Rikki, ce qu'ils
// font, et comment ils s'y rendent. Tout est décrit par des « étapes » pures
// (placement + durée) que l'écran d'accueil joue l'une après l'autre.
//
// - Les activités occupent l'avatar quand il n'accomplit pas de micro-étape :
//   lire sur le canapé, cuisiner, prendre un bain… En mode 🪫, seulement des
//   activités calmes (ADR 0012).
// - Les émotes se jouent entre les personnages (ADR 0026) : si l'autre est là,
//   les deux avatars se rejoignent ; sinon c'est Rikki qui porte le geste.
//
// Repère : celui de la maison isométrique (iso.tsx), pièce de 8 × 8 unités.

import type { MomentJournee } from '../../compagnon/cycleDeVie';
import type { Decoration } from '../../domaine/progression';
import type { DomaineId, PieceId, TypeEmote } from '../../domaine/types';
import type { EtatRikki } from '../rikki/Rikki';
import type { Cote, PoseAvatar } from '../avatar/poses';

export interface Point {
  x: number;
  y: number;
}

/** Debout, assis, assis derrière la table, allongé (sur le lit ou le canapé), ou dans le bain. */
export type Posture = 'debout' | 'assis' | 'attable' | 'allongeLit' | 'allongeCanape' | 'bain';

export interface Placement {
  x: number;
  y: number;
  z: number;
  /** Où le personnage se remet debout avant de repartir. */
  sol: Point;
  pose: PoseAvatar;
  cote: Cote;
  posture: Posture;
  /** Durée du trajet jusqu'à ce placement, en ms (0 : sur place). */
  duree: number;
  /** Passe devant les autres personnages (câlin). */
  devant?: boolean;
}

export interface PlacementRikki {
  x: number;
  y: number;
  z: number;
  duree: number;
  /** Remplace l'état venu du cycle de vie (joie, câlin…). */
  etat?: EtatRikki;
  devant?: boolean;
  /** Rikki saute pour se déplacer. */
  saute?: boolean;
  /** Plus petit, pour se poser sur une tête. */
  echelle?: number;
}

export type Effet = 'coeurs' | 'bisou' | 'etoiles' | 'notes' | 'zzz';

export interface Etape {
  perso: Placement;
  rikki?: PlacementRikki;
  effet?: { type: Effet; x: number; y: number; z: number };
  ms: number;
}

export type IdActivite =
  | 'lireCanape'
  | 'siesteCanape'
  | 'the'
  | 'danser'
  | 'arroser'
  | 'calinRikki'
  | 'cuisiner'
  | 'theTable'
  | 'dormir'
  | 'lireLit'
  | 'etirer'
  | 'bain'
  | 'dents';

export interface Activite {
  id: IdActivite;
  piece: PieceId;
  /** Où l'on se tient pour y aller. */
  sol: Point;
  /** Où l'on s'installe, si ce n'est pas debout au même endroit. */
  place?: { x: number; y: number; z: number };
  pose: PoseAvatar;
  cote?: Cote;
  posture?: Posture;
  /** Possible en mode 🪫. */
  calme: boolean;
  moments?: readonly MomentJournee[];
  decoration?: Decoration;
  rikki: { x: number; y: number; z?: number; etat?: EtatRikki };
  effet?: Effet;
  /** L'avatar passe devant Rikki (son bras l'entoure). */
  devant?: boolean;
}

const JOURNEE: readonly MomentJournee[] = ['matin', 'jour', 'soir'];

/** Rikki serré contre l'avatar, à sa droite : un câlin de côté. */
function calinRikki(piece: PieceId, x: number, y: number): Activite {
  return { id: 'calinRikki', piece, sol: { x, y }, pose: 'enlace', calme: true, devant: true, rikki: { x: x + 0.62, y: y - 0.62, etat: 'calin' }, effet: 'coeurs' };
}

export const ACTIVITES: readonly Activite[] = [
  // Salon
  { id: 'lireCanape', piece: 'salon', sol: { x: 5.1, y: 2.7 }, place: { x: 5.1, y: 1.55, z: 0.42 }, pose: 'lit', posture: 'assis', calme: true, rikki: { x: 6.9, y: 1.0, z: 0.75 } },
  { id: 'siesteCanape', piece: 'salon', sol: { x: 5.2, y: 2.7 }, place: { x: 5.3, y: 1.3, z: 0.75 }, pose: 'dort', posture: 'allongeCanape', calme: true, moments: ['jour', 'soir'], rikki: { x: 6.4, y: 3.2 }, effet: 'zzz' },
  { id: 'the', piece: 'salon', sol: { x: 3.4, y: 3.9 }, pose: 'boit', calme: true, rikki: { x: 4.9, y: 2.4 } },
  { id: 'danser', piece: 'salon', sol: { x: 2.6, y: 6.2 }, pose: 'danse', calme: false, moments: JOURNEE, rikki: { x: 4.2, y: 4.8, etat: 'joie' }, effet: 'notes' },
  { id: 'arroser', piece: 'salon', sol: { x: 0.9, y: 2.2 }, pose: 'arrose', calme: true, moments: JOURNEE, decoration: 'plante', rikki: { x: 0.45, y: 3.9 } },
  calinRikki('salon', 3.6, 5.4),
  // Cuisine
  { id: 'cuisiner', piece: 'cuisine', sol: { x: 2.1, y: 3.4 }, pose: 'cuisine', cote: 'gauche', calme: false, moments: JOURNEE, rikki: { x: 3.6, y: 1.9 } },
  { id: 'theTable', piece: 'cuisine', sol: { x: 4.6, y: 3.4 }, place: { x: 5.1, y: 3.75, z: 0.32 }, pose: 'boit', posture: 'attable', calme: true, rikki: { x: 6.7, y: 2.6 } },
  calinRikki('cuisine', 2.6, 3.6),
  // Chambre
  { id: 'dormir', piece: 'chambre', sol: { x: 4.8, y: 4.6 }, place: { x: 4.9, y: 2.2, z: 1.0 }, pose: 'dort', posture: 'allongeLit', calme: true, moments: ['nuit', 'jour'], rikki: { x: 6.6, y: 3.2 }, effet: 'zzz' },
  { id: 'lireLit', piece: 'chambre', sol: { x: 4.8, y: 4.6 }, place: { x: 4.8, y: 2.6, z: 0.62 }, pose: 'lit', posture: 'assis', calme: true, rikki: { x: 6.0, y: 1.4, z: 1.0 } },
  { id: 'etirer', piece: 'chambre', sol: { x: 2.6, y: 5.2 }, pose: 'etire', calme: false, moments: ['matin', 'jour'], rikki: { x: 4.2, y: 4.1 } },
  { id: 'arroser', piece: 'chambre', sol: { x: 0.9, y: 2.2 }, pose: 'arrose', calme: true, moments: JOURNEE, decoration: 'plante', rikki: { x: 0.45, y: 3.9 } },
  calinRikki('chambre', 2.2, 5.6),
  // Salle de bain
  { id: 'bain', piece: 'salleDeBain', sol: { x: 5.2, y: 3.4 }, place: { x: 5.3, y: 1.15, z: -0.55 }, pose: 'content', posture: 'bain', calme: true, rikki: { x: 3.6, y: 3.6 } },
  { id: 'dents', piece: 'salleDeBain', sol: { x: 1.9, y: 2.8 }, pose: 'brosse', cote: 'gauche', calme: false, rikki: { x: 3.0, y: 1.4 } },
  calinRikki('salleDeBain', 2.8, 5.0),
];

/** Là où l'avatar attend, prêt, quand une micro-étape de cette pièce est proposée. */
export const POSTES: Record<PieceId, Point & { cote: Cote }> = {
  salon: { x: 3.9, y: 5.2, cote: 'droite' },
  cuisine: { x: 2.4, y: 2.3, cote: 'gauche' },
  chambre: { x: 2.4, y: 5.0, cote: 'gauche' },
  salleDeBain: { x: 2.2, y: 3.0, cote: 'gauche' },
};

/** Par où l'on entre dans une pièce : le bord côté spectateur. */
export const ENTREE: Point = { x: 7.4, y: 7.6 };

/** Vitesse de marche, en unités par seconde. */
const VITESSE = 1.9;

export function activitesPossibles(
  piece: PieceId,
  options: { moment: MomentJournee; calme: boolean; decorations: ReadonlySet<Decoration> },
): Activite[] {
  return ACTIVITES.filter(
    (a) =>
      a.piece === piece &&
      (!options.calme || a.calme) &&
      (!a.moments || a.moments.includes(options.moment)) &&
      (!a.decoration || options.decorations.has(a.decoration)),
  );
}

/** Tire une activité, si possible différente de celles à éviter (la précédente, celle de l'autre). */
export function choisirActivite(possibles: readonly Activite[], hasard: number, eviter: readonly IdActivite[] = []): Activite | null {
  const libres = possibles.filter((a) => !eviter.includes(a.id));
  const liste = libres.length ? libres : possibles;
  if (!liste.length) return null;
  return liste[Math.min(liste.length - 1, Math.floor(hasard * liste.length))];
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Durée d'un trajet à pied, en ms. */
export function dureeTrajet(a: Point, b: Point): number {
  return Math.round((distance(a, b) / VITESSE) * 1000);
}

/** Le côté vers lequel on regarde quand on va de a vers b (x écran = x − y). */
export function coteVers(a: Point, b: Point): Cote {
  return b.x - b.y >= a.x - a.y ? 'droite' : 'gauche';
}

export function placementDebout(p: Point, pose: PoseAvatar = 'repos', cote: Cote = 'droite'): Placement {
  return { x: p.x, y: p.y, z: 0, sol: { x: p.x, y: p.y }, pose, cote, posture: 'debout', duree: 0 };
}

/** Se lever s'il le faut, puis marcher jusqu'à `vers`. */
export function marcher(depuis: Placement, vers: Point): Etape[] {
  const etapes: Etape[] = [];
  let ici: Point = { x: depuis.x, y: depuis.y };
  if (depuis.posture !== 'debout' || depuis.z !== 0) {
    ici = depuis.sol;
    etapes.push({ perso: { ...placementDebout(ici, 'repos', depuis.cote), duree: 350 }, ms: 400 });
  }
  const duree = dureeTrajet(ici, vers);
  if (duree > 60) {
    etapes.push({ perso: { ...placementDebout(vers, 'marche', coteVers(ici, vers)), duree }, ms: duree });
  }
  return etapes;
}

/** Rikki suit l'avatar en sautillant, puis se pose à côté de lui. */
function rikkiVers(p: { x: number; y: number; z?: number; etat?: EtatRikki }, duree: number, saute = true): PlacementRikki {
  return { x: p.x, y: p.y, z: p.z ?? 0, duree, etat: p.etat, saute };
}

/** Rikki se tient à droite de l'avatar, sur le même plan à l'écran. */
function rikkiACote(p: Point, duree: number): PlacementRikki {
  const c = placeACote(p, p.x - p.y > 3.5 ? 'gauche' : 'droite', 1.35);
  return { x: c.x, y: c.y, z: 0, duree, saute: duree > 0 };
}

/** Hauteur, au-dessus du point d'appui, où naissent les effets (au-dessus de la tête). */
const HAUTEUR_EFFET: Record<Posture, number> = { debout: 4.4, assis: 4.0, attable: 4.0, allongeLit: 1.9, allongeCanape: 1.9, bain: 4.2 };

/** Aller jusqu'à une activité, s'y installer et y rester `ms`. */
export function scriptActivite(depuis: Placement, activite: Activite, ms: number): Etape[] {
  const trajet = marcher(depuis, activite.sol);
  const tempsTrajet = trajet.reduce((t, e) => t + e.ms, 0);
  const rikkiEnRoute = rikkiACote(activite.sol, Math.max(400, tempsTrajet));
  const avecRikki = trajet.map((e, i) => (i === trajet.length - 1 ? { ...e, rikki: rikkiEnRoute } : e));
  const place = activite.place ?? { ...activite.sol, z: 0 };
  return [
    ...avecRikki,
    {
      perso: {
        ...place,
        sol: activite.sol,
        pose: activite.pose,
        cote: activite.cote ?? 'droite',
        posture: activite.posture ?? 'debout',
        duree: activite.place ? 350 : 0,
        devant: activite.devant,
      },
      rikki: rikkiVers(activite.rikki, 700),
      effet: activite.effet ? { type: activite.effet, x: place.x, y: place.y, z: place.z + HAUTEUR_EFFET[activite.posture ?? 'debout'] } : undefined,
      ms,
    },
  ];
}

/** Attendre debout, prêt, à un endroit (la micro-étape proposée). */
export function scriptAttente(depuis: Placement, poste: Point & { cote: Cote }, ms: number): Etape[] {
  const trajet = marcher(depuis, poste);
  const tempsTrajet = trajet.reduce((t, e) => t + e.ms, 0);
  return [
    ...trajet.map((e, i) => (i === trajet.length - 1 ? { ...e, rikki: rikkiACote(poste, Math.max(400, tempsTrajet)) } : e)),
    { perso: placementDebout(poste, 'repos', poste.cote), rikki: rikkiACote(poste, 0), ms },
  ];
}

/** Le geste que l'avatar mime quand une micro-étape est faite. */
export function gesteDeLaTache(domaine: DomaineId, piece: PieceId): PoseAvatar {
  switch (domaine) {
    case 'repas':
      return 'cuisine';
    case 'linge':
      return 'plie';
    case 'logement':
      return piece === 'cuisine' ? 'vaisselle' : 'balaie';
    case 'soins':
      return piece === 'salleDeBain' ? 'brosse' : piece === 'cuisine' ? 'boit' : 'etire';
  }
}

/** « Fait » : l'avatar mime la micro-étape, puis saute de joie. */
export function scriptFait(depuis: Placement, geste: PoseAvatar): Etape[] {
  const ici = depuis.posture === 'debout' ? { x: depuis.x, y: depuis.y } : depuis.sol;
  const debout = placementDebout(ici, geste, depuis.cote);
  return [
    { perso: { ...debout, duree: depuis.posture === 'debout' ? 0 : 350 }, ms: 1700 },
    {
      perso: { ...debout, pose: 'fait' },
      rikki: { ...rikkiACote(ici, 0), etat: 'joie' },
      effet: { type: 'etoiles', x: ici.x, y: ici.y, z: 4.6 },
      ms: 1300,
    },
  ];
}

// ---------------------------------------------------------------- Émotes

const DUREE_GESTE = 2800;

/** Où l'envoyeur se place à côté du receveur, sur le même plan à l'écran. */
export function placeACote(receveur: Point, cote: Cote, ecart: number): Point {
  // Décaler de (+e, −e) déplace à l'horizontale à l'écran.
  const e = cote === 'droite' ? ecart : -ecart;
  return { x: Math.max(0.4, Math.min(7.6, receveur.x + e)), y: Math.max(0.4, Math.min(7.6, receveur.y - e)) };
}

const ECART: Record<TypeEmote, number> = { calin: 0.72, bisou: 0.82, patpat: 0.86 };
const POSES_EMOTE: Record<TypeEmote, { envoyeur: PoseAvatar; receveur: PoseAvatar; effet: Effet }> = {
  calin: { envoyeur: 'enlace', receveur: 'enlace', effet: 'coeurs' },
  bisou: { envoyeur: 'bisou', receveur: 'content', effet: 'bisou' },
  patpat: { envoyeur: 'patpat', receveur: 'tapote', effet: 'etoiles' },
};

/**
 * Les deux avatars sont dans la pièce : l'envoyeur va rejoindre le receveur,
 * le geste se joue, puis chacun reprend sa journée. Les deux scripts ont la
 * même durée pour rester synchrones.
 */
export function scriptsEmoteEnDirect(type: TypeEmote, envoyeur: Placement, receveur: Placement): { envoyeur: Etape[]; receveur: Etape[] } {
  // Le receveur se lève et se tourne vers l'envoyeur.
  const pointReceveur = receveur.posture === 'debout' ? { x: receveur.x, y: receveur.y } : receveur.sol;
  const depart = envoyeur.posture === 'debout' ? { x: envoyeur.x, y: envoyeur.y } : envoyeur.sol;
  // L'envoyeur arrive du côté où il se trouve déjà.
  const coteArrivee: Cote = depart.x - depart.y >= pointReceveur.x - pointReceveur.y ? 'droite' : 'gauche';
  const rejoint = placeACote(pointReceveur, coteArrivee, ECART[type]);
  const aller = marcher(envoyeur, rejoint);
  const tempsAller = aller.reduce((t, e) => t + e.ms, 0);
  const versReceveur: Cote = coteArrivee === 'droite' ? 'gauche' : 'droite';
  const versEnvoyeur: Cote = coteArrivee;
  const poses = POSES_EMOTE[type];
  // Pour le câlin et le bisou, celui qui est à gauche à l'écran passe devant.
  const envoyeurDevant = coteArrivee === 'gauche';

  const enAttente = placementDebout(pointReceveur, 'repos', versEnvoyeur);
  const geste: Etape = {
    perso: { ...placementDebout(rejoint, poses.envoyeur, versReceveur), devant: envoyeurDevant },
    effet: { type: poses.effet, x: (rejoint.x + pointReceveur.x) / 2, y: (rejoint.y + pointReceveur.y) / 2, z: 4.8 },
    ms: DUREE_GESTE,
  };
  const retour = marcher(geste.perso, depart);
  const tempsRetour = retour.reduce((t, e) => t + e.ms, 0);

  return {
    envoyeur: [...aller, geste, ...retour],
    receveur: [
      { perso: { ...enAttente, duree: receveur.posture === 'debout' ? 0 : 350 }, ms: Math.max(1, tempsAller) },
      { perso: { ...placementDebout(pointReceveur, poses.receveur, versEnvoyeur), devant: !envoyeurDevant }, ms: DUREE_GESTE },
      { perso: { ...placementDebout(pointReceveur, 'content', versEnvoyeur) }, ms: Math.max(1, tempsRetour) },
    ],
  };
}

/**
 * L'autre n'est pas là : c'est Rikki qui porte le geste. À l'envoi, le membre
 * le confie à Rikki ; à la réception, Rikki le lui rend.
 */
export function scriptEmoteParRikki(type: TypeEmote, depuis: Placement, sens: 'envoi' | 'reception'): Etape[] {
  const ici = depuis.posture === 'debout' ? { x: depuis.x, y: depuis.y } : depuis.sol;
  // Près du mur de droite, on se tourne vers la gauche pour laisser de la place à Rikki.
  const cote: Cote = ici.x - ici.y > 3.5 ? 'gauche' : 'droite';
  const debout = placementDebout(ici, 'repos', cote);
  const etapes: Etape[] = [];
  if (depuis.posture !== 'debout') etapes.push({ perso: { ...debout, duree: 350 }, ms: 400 });
  // Rikki accourt à côté.
  const aCote = placeACote(ici, cote, 1.15);
  etapes.push({ perso: debout, rikki: { x: aCote.x, y: aCote.y, z: 0, duree: 700, saute: true }, ms: 800 });

  const effet = (z: number, decalage = 0.4) => {
    const p = placeACote(ici, cote, decalage);
    return { type: POSES_EMOTE[type].effet, x: p.x, y: p.y, z };
  };
  switch (type) {
    case 'calin': {
      // Un câlin de côté : le bras de l'avatar entoure Rikki.
      const serre = placeACote(ici, cote, 0.62);
      etapes.push({
        perso: { ...debout, pose: 'enlace', devant: true },
        rikki: { x: serre.x, y: serre.y, z: 0, duree: 400, etat: 'calin', saute: true },
        effet: effet(4.4),
        ms: DUREE_GESTE,
      });
      break;
    }
    case 'bisou': {
      // Rikki saute à hauteur de joue.
      const joue = placeACote(ici, cote, 0.85);
      etapes.push({
        // À l'envoi, on fait le bisou à Rikki ; à la réception, c'est Rikki qui l'apporte.
        perso: { ...debout, pose: sens === 'envoi' ? 'bisou' : 'content' },
        rikki: { x: joue.x, y: joue.y, z: 1.6, duree: 400, etat: 'calin', devant: true, saute: true },
        effet: effet(4.6),
        ms: DUREE_GESTE,
      });
      break;
    }
    case 'patpat':
      etapes.push(
        sens === 'envoi'
          ? {
              perso: { ...debout, pose: 'caresse' },
              rikki: { x: aCote.x, y: aCote.y, z: 0, duree: 0, etat: 'joie' },
              effet: effet(3.4, 1.15),
              ms: DUREE_GESTE,
            }
          : {
              // Rikki grimpe sur la tête et tapote.
              perso: { ...debout, pose: 'tapote' },
              rikki: { x: ici.x + 0.02, y: ici.y + 0.02, z: 3.55, duree: 500, etat: 'joie', devant: true, saute: true, echelle: 0.55 },
              effet: effet(5.6, 0),
              ms: DUREE_GESTE,
            },
      );
      break;
  }
  etapes.push({ perso: { ...debout, pose: 'content' }, rikki: { ...rikkiACote(ici, 500), etat: 'joie' }, ms: 1200 });
  return etapes;
}

/** Durée totale d'un script, en ms. */
export function dureeScript(etapes: readonly Etape[]): number {
  return etapes.reduce((t, e) => t + e.ms, 0);
}
