// Port de stockage du foyer. La v0 garde tout sur l'appareil (ADR 0023) ;
// une implémentation Supabase (ADR 0007) prendra la même forme.

import type { Foyer, MembreId } from '../domaine/types';

export interface Depot {
  chargerFoyer(): Foyer | null;
  sauvegarderFoyer(foyer: Foyer): void;
  effacer(): void;
  /** Le membre qui utilise cet appareil. Propre à l'appareil, jamais partagé. */
  chargerMembreActif(): MembreId | null;
  sauvegarderMembreActif(id: MembreId): void;
}

/** Vérifie qu'un objet (fichier importé, stockage) a bien la forme d'un foyer. */
export function estFoyer(x: unknown): x is Foyer {
  if (typeof x !== 'object' || x === null) return false;
  const f = x as Partial<Foyer>;
  return (
    f.version === 1 &&
    typeof f.id === 'string' &&
    Array.isArray(f.membres) &&
    Array.isArray(f.taches) &&
    typeof f.compteur === 'number' &&
    typeof f.maison === 'object'
  );
}
