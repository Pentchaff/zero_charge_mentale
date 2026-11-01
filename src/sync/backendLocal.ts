// Tout sur l'appareil : le foyer dans localStorage, les membres partagent le
// téléphone. Les émotes attendent que l'autre membre reprenne l'appareil.

import type { Emote, Membre, Rappel } from '../domaine/types';
import { depotLocal } from '../stockage/depotLocal';
import type { Backend } from './backend';

const CLE_EMOTES = 'rikki.emotesLocales';
const CLE_RAPPELS = 'rikki.rappelsLocaux';

function lireJson<T>(cle: string, defaut: T): T {
  try {
    return (JSON.parse(localStorage.getItem(cle) ?? 'null') as T) ?? defaut;
  } catch {
    return defaut;
  }
}

function ecrireJson(cle: string, valeur: unknown): void {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    /* stockage indisponible */
  }
}

export const backendLocal: Backend = {
  mode: 'local',
  async demarrer() {
    return { foyer: depotLocal.chargerFoyer(), membreId: depotLocal.chargerMembreActif() };
  },
  async creerFoyer(premier: Membre, brouillon) {
    return { foyer: brouillon, membreId: premier.id };
  },
  async rejoindreFoyer() {
    throw new Error('sans_synchro');
  },
  pousser(_avant, apres) {
    depotLocal.sauvegarderFoyer(apres);
  },
  ecouter() {
    return () => {};
  },
  salon(_foyerId, membreId, ecoute) {
    const verifier = () => {
      const enAttente = lireJson<Record<string, Emote>>(CLE_EMOTES, {});
      const e = enAttente[membreId];
      if (e) {
        delete enAttente[membreId];
        ecrireJson(CLE_EMOTES, enAttente);
        ecoute.emote(e);
      }
    };
    ecoute.presence([membreId]);
    const minuteur = setTimeout(verifier, 800);
    return () => clearTimeout(minuteur);
  },
  async envoyerEmote(de, vers, type) {
    const enAttente = lireJson<Record<string, Emote>>(CLE_EMOTES, {});
    enAttente[vers] = { de, type, envoyeLe: Date.now() };
    ecrireJson(CLE_EMOTES, enAttente);
  },
  async listerRappels(membreId) {
    return lireJson<Record<string, Rappel[]>>(CLE_RAPPELS, {})[membreId] ?? [];
  },
  async enregistrerRappel(membreId, rappel) {
    const tous = lireJson<Record<string, Rappel[]>>(CLE_RAPPELS, {});
    const liste = (tous[membreId] ?? []).filter((r) => r.id !== rappel.id);
    tous[membreId] = [...liste, rappel].sort((a, b) => a.heure.localeCompare(b.heure));
    ecrireJson(CLE_RAPPELS, tous);
  },
  async supprimerRappel(membreId, id) {
    const tous = lireJson<Record<string, Rappel[]>>(CLE_RAPPELS, {});
    tous[membreId] = (tous[membreId] ?? []).filter((r) => r.id !== id);
    ecrireJson(CLE_RAPPELS, tous);
  },
  async activerNotifications() {
    return 'indisponible';
  },
  async nouveauCodeRetour() {
    throw new Error('sans_synchro');
  },
  async reprendre() {
    throw new Error('sans_synchro');
  },
  async quitter() {
    depotLocal.effacer();
    try {
      localStorage.removeItem(CLE_EMOTES);
      localStorage.removeItem(CLE_RAPPELS);
    } catch {
      /* rien */
    }
  },
};
