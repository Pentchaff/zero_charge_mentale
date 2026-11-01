// Internationalisation intégrée dès le départ (ADR 0015) : la langue est
// celle du membre actif, pas celle du foyer.

import type { Langue, Texte } from '../domaine/types';
import { fr, type Cle } from './fr';
import { ja } from './ja';

export type { Cle };

const DICTIONNAIRES = { fr, ja } as const;

export const LANGUES: readonly { id: Langue; nom: string }[] = [
  { id: 'fr', nom: 'Français' },
  { id: 'ja', nom: '日本語' },
];

export type Traduire = (cle: Cle, variables?: Record<string, string | number>) => string;

export function creerTraduire(langue: Langue): Traduire {
  const dico = DICTIONNAIRES[langue];
  return (cle, variables) => {
    let texte: string = dico[cle] ?? fr[cle] ?? cle;
    if (variables) for (const [nom, valeur] of Object.entries(variables)) texte = texte.replaceAll(`{${nom}}`, String(valeur));
    return texte;
  };
}

/** Texte d'une tâche ou d'un aide-mémoire dans la langue voulue, sinon dans l'autre. */
export function texteDans(t: Texte | undefined, langue: Langue): string {
  if (!t) return '';
  return t[langue]?.trim() || t.fr?.trim() || t.ja?.trim() || '';
}

export function autreLangue(langue: Langue): Langue {
  return langue === 'fr' ? 'ja' : 'fr';
}
