// Ce dont l'app a besoin pour stocker et partager le foyer. Deux
// implémentations : tout sur l'appareil (v0 sans serveur), ou Supabase.

import type { Emote, Foyer, Membre, MembreId, Rappel, TypeEmote } from '../domaine/types';

export type ResultatNotifications = 'ok' | 'refuse' | 'indisponible';

export interface EcouteSalon {
  /** Membres du foyer qui ont l'app ouverte en ce moment (ADR 0011). */
  presence(ids: MembreId[]): void;
  emote(e: Emote): void;
}

export interface Backend {
  readonly mode: 'local' | 'supabase';
  demarrer(): Promise<{ foyer: Foyer | null; membreId: MembreId | null }>;
  creerFoyer(premier: Membre, brouillon: Foyer): Promise<{ foyer: Foyer; membreId: MembreId }>;
  rejoindreFoyer(code: string, membre: Membre): Promise<{ foyer: Foyer; membreId: MembreId }>;
  /** Envoie ce qui a changé. Ne bloque jamais l'interface. */
  pousser(avant: Foyer, apres: Foyer): void;
  /** Applique les changements faits ailleurs (l'autre téléphone). */
  ecouter(foyerId: string, appliquer: (f: (foyer: Foyer) => Foyer) => void): () => void;
  salon(foyerId: string, membreId: MembreId, ecoute: EcouteSalon): () => void;
  envoyerEmote(de: MembreId, vers: MembreId, type: TypeEmote): Promise<void>;
  listerRappels(membreId: MembreId): Promise<Rappel[]>;
  enregistrerRappel(membreId: MembreId, rappel: Rappel): Promise<void>;
  supprimerRappel(membreId: MembreId, id: string): Promise<void>;
  activerNotifications(membreId: MembreId): Promise<ResultatNotifications>;
  quitter(): Promise<void>;
}
