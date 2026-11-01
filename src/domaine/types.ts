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

export type FormeVisage = 'rond' | 'ovale' | 'carre' | 'pointu';
export type Coiffure =
  | 'courte'
  | 'frange'
  | 'carre'
  | 'longue'
  | 'queue'
  | 'chignon'
  | 'boucles'
  | 'herisse'
  | 'chauve';
export type FormeYeux = 'ronds' | 'grands' | 'amande' | 'joyeux' | 'endormis';
export type Sourcils = 'fins' | 'epais' | 'arrondis' | 'aucun';
export type Bouche = 'sourire' | 'grand' | 'petit' | 'chat' | 'neutre';
export type Lunettes = 'aucune' | 'rondes' | 'carrees' | 'soleil';
export type Coiffe = 'aucune' | 'bonnet' | 'noeud' | 'fleur' | 'casque' | 'couronne';
export type Tenue = 'tshirt' | 'pull' | 'rayures' | 'salopette' | 'kimono';

/** L'avatar : un assemblage de pièces interchangeables, style Mii (ADR 0017). */
export interface AvatarConfig {
  visage: FormeVisage;
  peau: string;
  coiffure: Coiffure;
  couleurCheveux: string;
  yeux: FormeYeux;
  couleurYeux: string;
  sourcils: Sourcils;
  bouche: Bouche;
  joues: boolean;
  lunettes: Lunettes;
  coiffe: Coiffe;
  tenue: Tenue;
  couleurTenue: string;
}

export interface Membre {
  id: MembreId;
  prenom: string;
  langue: Langue;
  estAidant: boolean;
  avatar: AvatarConfig;
  /** Le nom que le membre donne à son Rikki. */
  nomRikki: string;
}

export interface MaisonConfig {
  pieces: PieceId[];
  couleurMurs: string;
}

export interface Foyer {
  version: 1;
  id: string;
  creeLe: number;
  membres: Membre[];
  taches: Tache[];
  /**
   * Compteur cumulatif du foyer (ADR 0020, ADR 0022) : +1 par micro-étape
   * faite, ne recule jamais. Jamais affiché comme un score (ADR 0001).
   */
  compteur: number;
  maison: MaisonConfig;
}
