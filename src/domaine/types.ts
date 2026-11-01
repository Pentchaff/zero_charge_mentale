// Modèle du domaine. Les noms suivent GLOSSARY.md : ne pas les « traduire »
// en vocabulaire générique (user, todo, pet…).

export type Langue = 'fr' | 'ja';

/** Un texte affichable dans les deux langues de l'interface (ADR 0015). */
export type Texte = Partial<Record<Langue, string>>;

export type Effort = 'leger' | 'moyen' | 'lourd';

/** Énergie déclarée à l'ouverture : 🪫 vide, 🔋 normale, ⚡ pleine. */
export type Energie = 'vide' | 'normale' | 'pleine';

export type DomaineId = 'logement' | 'linge' | 'repas' | 'soins';

export type Frequence = 'quotidienne' | 'hebdomadaire' | 'mensuelle';

export type PieceId = 'salon' | 'cuisine' | 'chambre' | 'salleDeBain';

export type MembreId = string;
export type TacheId = string;

export interface MicroEtape {
  id: string;
  texte: Texte;
  effort: Effort;
  aideMemoire?: Texte;
}

/**
 * Pour qui la tâche est proposée.
 * - `commun` : pot commun, n'importe quel membre peut la faire (défaut).
 * - `chacun` : tâche personnelle, chaque membre la fait pour lui-même
 *   (se brosser les dents). Son avancement est suivi par membre et n'est
 *   jamais montré à l'autre (ADR 0005, ADR 0021).
 * - `membre` : réservée à un seul membre (ADR 0016).
 */
export type Portee =
  | { type: 'commun' }
  | { type: 'chacun' }
  | { type: 'membre'; membreId: MembreId };

/** Où en est une tâche. Clé `commun` ou l'id du membre pour une tâche personnelle. */
export interface Avancement {
  /** Fin de la dernière exécution complète (ms). Absent : jamais faite. */
  derniereFois?: number;
  /** Index de la prochaine micro-étape à proposer. */
  etape: number;
}

export interface Tache {
  id: TacheId;
  nom: Texte;
  domaine: DomaineId;
  piece: PieceId;
  frequence: Frequence;
  /**
   * Jour d'échéance facultatif (ADR 0013).
   * Hebdomadaire : 0 (dimanche) à 6 (samedi). Mensuelle : 1 à 28.
   */
  jourEcheance?: number;
  portee: Portee;
  microEtapes: MicroEtape[];
  /** Écartée (« Je ne fais jamais ça ») : n'est plus jamais proposée. */
  ecartee: boolean;
  avancement: Record<string, Avancement>;
  /** Vient du foyer type (pour savoir qu'une traduction japonaise existe). */
  origine: 'foyerType' | 'foyer';
}

export type FormeVisage = 'rond' | 'ovale' | 'carre' | 'pointu' | 'large' | 'long' | 'coeur' | 'poire';
export type Coiffure =
  | 'courte'
  | 'frange'
  | 'carre'
  | 'longue'
  | 'queue'
  | 'couettes'
  | 'chignon'
  | 'boucles'
  | 'herisse'
  | 'rase'
  | 'miLongue'
  | 'afro'
  | 'tresse'
  | 'meche'
  | 'iroquoise'
  | 'banane'
  | 'ondulee'
  | 'odango'
  | 'calvitie'
  | 'chauve';
export type FormeYeux =
  | 'ronds'
  | 'grands'
  | 'amande'
  | 'joyeux'
  | 'endormis'
  | 'points'
  | 'brillants'
  | 'cils'
  | 'fins'
  | 'etoiles'
  | 'tombants'
  | 'chat'
  | 'demiLune';
export type Sourcils =
  | 'fins'
  | 'epais'
  | 'arrondis'
  | 'courts'
  | 'accent'
  | 'touffus'
  | 'points'
  | 'arques'
  | 'droits'
  | 'aucun';
export type Nez = 'arc' | 'point' | 'rond' | 'triangle' | 'bouton' | 'long' | 'pointu' | 'aucun';
export type Bouche =
  | 'sourire'
  | 'grand'
  | 'petit'
  | 'chat'
  | 'neutre'
  | 'dents'
  | 'langue'
  | 'moue'
  | 'surpris'
  | 'coin'
  | 'anime'
  | 'bisou'
  | 'large';
export type Moustache = 'aucune' | 'fine' | 'epaisse' | 'guidon' | 'pointes';
export type Barbe = 'aucune' | 'courte' | 'pleine' | 'bouc' | 'collier' | 'longue';
export type Lunettes = 'aucune' | 'rondes' | 'carrees' | 'ovales' | 'papillon' | 'demiLune' | 'soleil';
export type Coiffe =
  | 'aucune'
  | 'bonnet'
  | 'noeud'
  | 'casquette'
  | 'serreTete'
  | 'barrette'
  | 'fleur'
  | 'casque'
  | 'couronne';
export type Tenue = 'tshirt' | 'pull' | 'chemise' | 'sweat' | 'rayures' | 'salopette' | 'kimono';

/**
 * L'avatar : un assemblage de pièces interchangeables, style Mii (ADR 0017).
 * Les réglages numériques déplacent ou redimensionnent une pièce ; 0 (ou 1
 * pour une taille) est la position par défaut.
 */
export interface AvatarConfig {
  version: 2;
  visage: FormeVisage;
  peau: string;
  joues: boolean;
  rousseur: boolean;
  grainDeBeaute: boolean;

  coiffure: Coiffure;
  couleurCheveux: string;
  coiffureMiroir: boolean;

  sourcils: Sourcils;
  couleurSourcils: string;
  sourcilsTaille: number;
  sourcilsRotation: number;
  sourcilsEcart: number;
  sourcilsHauteur: number;

  yeux: FormeYeux;
  couleurYeux: string;
  yeuxTaille: number;
  yeuxRotation: number;
  yeuxEcart: number;
  yeuxHauteur: number;

  nez: Nez;
  nezTaille: number;
  nezHauteur: number;

  bouche: Bouche;
  couleurLevres: string;
  boucheTaille: number;
  boucheHauteur: number;

  moustache: Moustache;
  barbe: Barbe;

  lunettes: Lunettes;
  couleurLunettes: string;
  coiffe: Coiffe;

  tenue: Tenue;
  couleurTenue: string;
  /** Hauteur du corps (0,85 à 1,15). */
  stature: number;
  /** Largeur du corps (0,8 à 1,25). */
  corpulence: number;
}

export interface Membre {
  id: MembreId;
  prenom: string;
  langue: Langue;
  estAidant: boolean;
  avatar: AvatarConfig;
  /** Le nom que le membre donne à son Rikki. */
  nomRikki: string;
  /** Recevoir les émotes en notification (opt-in, ADR 0006, ADR 0025). */
  notifEmotes?: boolean;
}

export interface MaisonConfig {
  pieces: PieceId[];
  couleurMurs: string;
}

/**
 * Un rappel personnel (ADR 0006) : activé par le membre lui-même, jamais
 * visible par l'autre (ADR 0005). Le libellé reste vague, sans nom de
 * médicament (ADR 0007).
 */
export interface Rappel {
  id: string;
  libelle: string;
  /** Heure locale « HH:MM ». */
  heure: string;
  /** Jours ISO : 1 (lundi) à 7 (dimanche). */
  jours: number[];
  /** Fuseau IANA du téléphone au moment de l'enregistrement. */
  fuseau: string;
  actif: boolean;
}

export type TypeEmote = 'calin' | 'bisou' | 'patpat';

/** Une émote reçue (ADR 0011) : éphémère, effacée dès qu'elle a été vue. */
export interface Emote {
  de: MembreId;
  type: TypeEmote;
  envoyeLe: number;
}

export interface Foyer {
  version: 1;
  id: string;
  creeLe: number;
  /** Code à partager pour rejoindre le foyer (synchronisation uniquement). */
  codeInvitation?: string;
  membres: Membre[];
  taches: Tache[];
  /**
   * Compteur cumulatif du foyer (ADR 0020, ADR 0022) : +1 par micro-étape
   * faite, ne recule jamais. Jamais affiché comme un score (ADR 0001).
   */
  compteur: number;
  maison: MaisonConfig;
}
