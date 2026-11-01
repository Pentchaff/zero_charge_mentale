import type { Foyer, MembreId } from '../domaine/types';
import { estFoyer, type Depot } from './depot';

const CLE_FOYER = 'rikki.foyer';
const CLE_MEMBRE = 'rikki.membreActif';

function lire(cle: string): string | null {
  try {
    return localStorage.getItem(cle);
  } catch {
    return null;
  }
}

function ecrire(cle: string, valeur: string): void {
  try {
    localStorage.setItem(cle, valeur);
  } catch {
    // Stockage indisponible (navigation privée) : l'app continue en mémoire.
  }
}

export const depotLocal: Depot = {
  chargerFoyer() {
    const brut = lire(CLE_FOYER);
    if (!brut) return null;
    try {
      const foyer: unknown = JSON.parse(brut);
      return estFoyer(foyer) ? (foyer as Foyer) : null;
    } catch {
      return null;
    }
  },
  sauvegarderFoyer(foyer) {
    ecrire(CLE_FOYER, JSON.stringify(foyer));
  },
  effacer() {
    try {
      localStorage.removeItem(CLE_FOYER);
      localStorage.removeItem(CLE_MEMBRE);
    } catch {
      /* rien */
    }
  },
  chargerMembreActif() {
    return lire(CLE_MEMBRE) as MembreId | null;
  },
  sauvegarderMembreActif(id) {
    ecrire(CLE_MEMBRE, id);
  },
};

/** Réglages propres au téléphone, jamais synchronisés : la clé Gemini (ADR 0009). */
export interface ReglagesAppareil {
  cleGemini: string;
  modeleGemini: string;
}

const CLE_APPAREIL = 'rikki.appareil';
export const MODELE_GEMINI_PAR_DEFAUT = 'gemini-flash-latest';

export function chargerReglagesAppareil(): ReglagesAppareil {
  try {
    const r = JSON.parse(lire(CLE_APPAREIL) ?? '{}') as Partial<ReglagesAppareil>;
    return { cleGemini: r.cleGemini ?? '', modeleGemini: r.modeleGemini || MODELE_GEMINI_PAR_DEFAUT };
  } catch {
    return { cleGemini: '', modeleGemini: MODELE_GEMINI_PAR_DEFAUT };
  }
}

export function sauvegarderReglagesAppareil(r: ReglagesAppareil): void {
  ecrire(CLE_APPAREIL, JSON.stringify(r));
}
