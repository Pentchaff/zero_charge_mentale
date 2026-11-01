// Les opérations sur un foyer. Fonctions pures : elles rendent un nouveau
// foyer, ce qui les rend testables et prêtes pour une synchro (ADR 0007).

import { creerFoyerType } from './foyerType';
import { avancementDe, cleAvancement } from './prochaineAction';
import type { Foyer, MaisonConfig, Membre, MembreId, Tache, TacheId } from './types';

export function nouvelId(prefixe: string): string {
  const alea =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefixe}-${alea}`;
}

export const MAISON_PAR_DEFAUT: MaisonConfig = {
  pieces: ['salon', 'cuisine', 'chambre', 'salleDeBain'],
  couleurMurs: '#f6e7d2',
};

export function creerFoyer(premierMembre: Membre, maintenant: number): Foyer {
  return {
    version: 1,
    id: nouvelId('foyer'),
    creeLe: maintenant,
    membres: [premierMembre],
    taches: creerFoyerType(),
    compteur: 0,
    maison: MAISON_PAR_DEFAUT,
  };
}

export function ajouterMembre(foyer: Foyer, membre: Membre): Foyer {
  return { ...foyer, membres: [...foyer.membres, membre] };
}

export function modifierMembre(foyer: Foyer, id: MembreId, modif: Partial<Omit<Membre, 'id'>>): Foyer {
  return { ...foyer, membres: foyer.membres.map((m) => (m.id === id ? { ...m, ...modif } : m)) };
}

function remplacerTache(foyer: Foyer, id: TacheId, f: (t: Tache) => Tache): Foyer {
  return { ...foyer, taches: foyer.taches.map((t) => (t.id === id ? f(t) : t)) };
}

export interface ResultatFait {
  foyer: Foyer;
  /** La micro-étape faite était la dernière : la tâche entière est faite. */
  tacheTerminee: boolean;
}

/**
 * « Fait » sur une micro-étape : la tâche avance d'un cran ; après la
 * dernière micro-étape elle repart du début et sa date de dernière fois est
 * mise à jour. Le compteur du foyer gagne 1. Aucune trace de qui l'a fait
 * dans le pot commun (ADR 0005).
 */
export function marquerFait(foyer: Foyer, tacheId: TacheId, membreId: MembreId, maintenant: number): ResultatFait {
  const tache = foyer.taches.find((t) => t.id === tacheId);
  if (!tache || tache.microEtapes.length === 0) return { foyer, tacheTerminee: false };

  const cle = cleAvancement(tache, membreId);
  const av = avancementDe(tache, membreId);
  const suivante = av.etape + 1;
  const tacheTerminee = suivante >= tache.microEtapes.length;
  const nouvelAvancement = tacheTerminee ? { etape: 0, derniereFois: maintenant } : { ...av, etape: suivante };

  return {
    foyer: {
      ...remplacerTache(foyer, tacheId, (t) => ({
        ...t,
        avancement: { ...t.avancement, [cle]: nouvelAvancement },
      })),
      compteur: foyer.compteur + 1,
    },
    tacheTerminee,
  };
}

/** « Je ne fais jamais ça » : la tâche quitte le foyer (elle n'est plus jamais proposée). */
export function ecarterTache(foyer: Foyer, id: TacheId): Foyer {
  return remplacerTache(foyer, id, (t) => ({ ...t, ecartee: true }));
}

/** L'aidant remet une tâche écartée dans le foyer, depuis l'éditeur de tâches. */
export function remettreTache(foyer: Foyer, id: TacheId): Foyer {
  return remplacerTache(foyer, id, (t) => ({ ...t, ecartee: false }));
}

/**
 * Crée ou met à jour une tâche depuis l'éditeur. Si le nombre de micro-étapes
 * a diminué, l'avancement est ramené dans les bornes.
 */
export function enregistrerTache(foyer: Foyer, tache: Tache): Foyer {
  const avancement = Object.fromEntries(
    Object.entries(tache.avancement).map(([cle, av]) => [
      cle,
      { ...av, etape: av.etape < tache.microEtapes.length ? av.etape : 0 },
    ]),
  );
  const propre = { ...tache, avancement };
  const existe = foyer.taches.some((t) => t.id === tache.id);
  return existe
    ? remplacerTache(foyer, tache.id, () => propre)
    : { ...foyer, taches: [...foyer.taches, propre] };
}

export function modifierMaison(foyer: Foyer, maison: MaisonConfig): Foyer {
  return { ...foyer, maison };
}

/** Une tâche vide prête à être remplie dans l'éditeur. */
export function tacheVierge(): Tache {
  return {
    id: nouvelId('tache'),
    nom: {},
    domaine: 'logement',
    piece: 'salon',
    frequence: 'hebdomadaire',
    portee: { type: 'commun' },
    microEtapes: [{ id: nouvelId('etape'), texte: {}, effort: 'leger' }],
    ecartee: false,
    avancement: {},
    origine: 'foyer',
  };
}
