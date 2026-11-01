// Conversion entre le foyer en mémoire et les lignes Supabase, et calcul de
// ce qui a changé entre deux états. Fonctions pures, testées.

import { normaliserAvatar } from '../domaine/avatar';
import type { Avancement, Foyer, MaisonConfig, Membre, Tache } from '../domaine/types';

export interface LigneFoyer {
  id: string;
  cree_le: string;
  compteur: number;
  maison: MaisonConfig;
  code_invitation: string;
}

export interface LigneMembre {
  id: string;
  foyer_id: string;
  prenom: string;
  langue: 'fr' | 'ja';
  est_aidant: boolean;
  avatar: unknown;
  nom_rikki: string;
  notif_emotes: boolean;
}

export interface LigneTache {
  foyer_id: string;
  id: string;
  donnees: Omit<Tache, 'id' | 'avancement'>;
  maj_le: number;
}

export interface LigneAvancement {
  foyer_id: string;
  tache_id: string;
  cle: string;
  etape: number;
  derniere_fois: number | null;
  maj_le: number;
}

export function membreDepuisLigne(l: LigneMembre): Membre {
  return {
    id: l.id,
    prenom: l.prenom,
    langue: l.langue === 'ja' ? 'ja' : 'fr',
    estAidant: l.est_aidant,
    avatar: normaliserAvatar(l.avatar),
    nomRikki: l.nom_rikki,
    notifEmotes: l.notif_emotes,
  };
}

export function ligneDepuisMembre(m: Membre, foyerId: string): LigneMembre {
  return {
    id: m.id,
    foyer_id: foyerId,
    prenom: m.prenom,
    langue: m.langue,
    est_aidant: m.estAidant,
    avatar: m.avatar,
    nom_rikki: m.nomRikki,
    notif_emotes: m.notifEmotes ?? false,
  };
}

export function ligneDepuisTache(t: Tache, foyerId: string, majLe: number): LigneTache {
  const { id, avancement: _avancement, ...donnees } = t;
  return { foyer_id: foyerId, id, donnees, maj_le: majLe };
}

export function tacheDepuisLigne(l: LigneTache, avancement: Record<string, Avancement> = {}): Tache {
  return { ...l.donnees, id: l.id, avancement };
}

export function avancementDepuisLigne(l: LigneAvancement): Avancement {
  return l.derniere_fois === null ? { etape: l.etape } : { etape: l.etape, derniereFois: Number(l.derniere_fois) };
}

export function assemblerFoyer(
  foyer: LigneFoyer,
  membres: LigneMembre[],
  taches: LigneTache[],
  avancements: LigneAvancement[],
): Foyer {
  const parTache = new Map<string, Record<string, Avancement>>();
  for (const a of avancements) {
    const r = parTache.get(a.tache_id) ?? {};
    r[a.cle] = avancementDepuisLigne(a);
    parTache.set(a.tache_id, r);
  }
  return {
    version: 1,
    id: foyer.id,
    creeLe: Date.parse(foyer.cree_le) || Date.now(),
    codeInvitation: foyer.code_invitation,
    compteur: foyer.compteur,
    maison: foyer.maison,
    membres: membres.map(membreDepuisLigne),
    taches: taches.map((t) => tacheDepuisLigne(t, parTache.get(t.id))),
  };
}

export interface Differences {
  maison?: MaisonConfig;
  compteur: number;
  membres: Membre[];
  taches: Tache[];
  avancements: { tacheId: string; cle: string; avancement: Avancement }[];
}

const pareil = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Ce qu'il faut envoyer au serveur pour passer de `avant` à `apres`. */
export function differences(avant: Foyer, apres: Foyer): Differences {
  const d: Differences = { compteur: Math.max(0, apres.compteur - avant.compteur), membres: [], taches: [], avancements: [] };
  if (!pareil(avant.maison, apres.maison)) d.maison = apres.maison;

  const membresAvant = new Map(avant.membres.map((m) => [m.id, m]));
  for (const m of apres.membres) if (!pareil(membresAvant.get(m.id), m)) d.membres.push(m);

  const tachesAvant = new Map(avant.taches.map((t) => [t.id, t]));
  for (const t of apres.taches) {
    const ancienne = tachesAvant.get(t.id);
    const { avancement: _a, ...corps } = t;
    const corpsAvant = ancienne ? (({ avancement: _b, ...reste }) => reste)(ancienne) : undefined;
    if (!pareil(corpsAvant, corps)) d.taches.push(t);
    for (const [cle, av] of Object.entries(t.avancement)) {
      if (!pareil(ancienne?.avancement[cle], av)) d.avancements.push({ tacheId: t.id, cle, avancement: av });
    }
  }
  return d;
}

export function estVide(d: Differences): boolean {
  return !d.maison && d.compteur === 0 && d.membres.length === 0 && d.taches.length === 0 && d.avancements.length === 0;
}
