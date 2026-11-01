// Le foyer partagé entre les téléphones via Supabase (ADR 0007, ADR 0024).
//
// - Connexion anonyme : pas d'e-mail, pas de mot de passe (ADR 0024).
// - Chaque modification locale est traduite en lignes à envoyer ; si le
//   réseau manque, elles attendent dans une file sauvegardée sur l'appareil.
// - Les changements de l'autre téléphone arrivent en temps réel ; au retour
//   au premier plan, l'app recharge tout pour rattraper ce qu'elle a manqué.
// - La présence (qui a l'app ouverte) et les émotes passent par un salon
//   temps réel ; une émote attend en base si l'autre n'est pas là (ADR 0025).

import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';
import type { Emote, Foyer, Membre, MembreId, Rappel, TypeEmote } from '../domaine/types';
import { depotLocal } from '../stockage/depotLocal';
import type { Backend, EcouteSalon, ResultatNotifications } from './backend';
import {
  assemblerFoyer,
  avancementDepuisLigne,
  differences,
  ligneDepuisTache,
  membreDepuisLigne,
  tacheDepuisLigne,
  type LigneAvancement,
  type LigneFoyer,
  type LigneMembre,
  type LigneTache,
} from './lignes';

type Operation =
  | { type: 'upsert'; table: 'taches' | 'avancements'; ligne: Record<string, unknown>; conflit: string }
  | { type: 'maison'; maison: unknown }
  | { type: 'membre'; ligne: Record<string, unknown> }
  | { type: 'compteur'; delta: number };

const CLE_FILE = 'rikki.fileSynchro';

function lireFile(): [string, Operation][] {
  try {
    return JSON.parse(localStorage.getItem(CLE_FILE) ?? '[]') as [string, Operation][];
  } catch {
    return [];
  }
}

function ecrireFile(file: Map<string, Operation>): void {
  try {
    localStorage.setItem(CLE_FILE, JSON.stringify([...file]));
  } catch {
    /* stockage indisponible : la file reste en mémoire */
  }
}

function base64VersOctets(base64: string): Uint8Array {
  const rembourre = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const brut = atob(rembourre);
  return Uint8Array.from(brut, (c) => c.charCodeAt(0));
}

export class BackendSupabase implements Backend {
  readonly mode = 'supabase' as const;
  private sb: SupabaseClient;
  private foyerId: string | null = null;
  private membreId: MembreId | null = null;
  private file = new Map<string, Operation>(lireFile());
  private envoiEnCours = false;
  /** Dernière écriture locale par ligne : on ignore les échos plus anciens. */
  private ecritures = new Map<string, number>();

  constructor() {
    this.sb = createClient(CONFIG.supabaseUrl, CONFIG.supabaseCle, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'rikki.session' },
    });
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => void this.vider());
    }
  }

  // ------------------------------------------------------------ Démarrage

  private async session(): Promise<string> {
    const { data } = await this.sb.auth.getSession();
    if (data.session) return data.session.user.id;
    const { data: connexion, error } = await this.sb.auth.signInAnonymously();
    if (error || !connexion.user) throw new Error(`connexion_anonyme: ${error?.message ?? 'inconnue'}`);
    return connexion.user.id;
  }

  private async chargerDepuisServeur(foyerId: string): Promise<Foyer> {
    const [f, m, t, a] = await Promise.all([
      this.sb.from('foyers').select('*').eq('id', foyerId).single(),
      this.sb.from('membres').select('*').eq('foyer_id', foyerId).order('cree_le'),
      this.sb.from('taches').select('*').eq('foyer_id', foyerId),
      this.sb.from('avancements').select('*').eq('foyer_id', foyerId),
    ]);
    const erreur = f.error ?? m.error ?? t.error ?? a.error;
    if (erreur) throw erreur;
    return assemblerFoyer(f.data as LigneFoyer, m.data as LigneMembre[], t.data as LigneTache[], a.data as LigneAvancement[]);
  }

  async demarrer() {
    let membreId: string;
    try {
      membreId = await this.session();
    } catch (e) {
      // Hors-ligne au démarrage : on repart du dernier état connu.
      const cache = depotLocal.chargerFoyer();
      const id = depotLocal.chargerMembreActif();
      if (cache && id) {
        this.foyerId = cache.id;
        this.membreId = id;
        return { foyer: cache, membreId: id };
      }
      throw e;
    }
    this.membreId = membreId;
    depotLocal.sauvegarderMembreActif(membreId);
    try {
      const { data, error } = await this.sb.from('membres').select('foyer_id').eq('id', membreId).maybeSingle();
      if (error) throw error;
      if (!data) return { foyer: null, membreId };
      this.foyerId = data.foyer_id as string;
      await this.vider();
      return { foyer: await this.chargerDepuisServeur(this.foyerId), membreId };
    } catch (e) {
      const cache = depotLocal.chargerFoyer();
      if (cache) {
        this.foyerId = cache.id;
        return { foyer: cache, membreId };
      }
      throw e;
    }
  }

  async creerFoyer(premier: Membre, brouillon: Foyer) {
    const membreId = await this.session();
    const { data, error } = await this.sb.rpc('creer_foyer', {
      p_prenom: premier.prenom,
      p_langue: premier.langue,
      p_avatar: premier.avatar,
      p_nom_rikki: premier.nomRikki,
      p_maison: brouillon.maison,
    });
    if (error) throw error;
    const ligne = data as LigneFoyer;
    this.foyerId = ligne.id;
    this.membreId = membreId;
    const maintenant = Date.now();
    const { error: erreurTaches } = await this.sb
      .from('taches')
      .upsert(brouillon.taches.map((t) => ligneDepuisTache(t, ligne.id, maintenant)), { onConflict: 'foyer_id,id' });
    if (erreurTaches) throw erreurTaches;
    return { foyer: await this.chargerDepuisServeur(ligne.id), membreId };
  }

  async rejoindreFoyer(code: string, membre: Membre) {
    const membreId = await this.session();
    const { data, error } = await this.sb.rpc('rejoindre_foyer', {
      p_code: code,
      p_prenom: membre.prenom,
      p_langue: membre.langue,
      p_avatar: membre.avatar,
      p_nom_rikki: membre.nomRikki,
    });
    if (error) throw new Error(error.message.includes('code_inconnu') ? 'code_inconnu' : error.message);
    this.foyerId = data as string;
    this.membreId = membreId;
    return { foyer: await this.chargerDepuisServeur(this.foyerId), membreId };
  }

  // ------------------------------------------------------------ Envoi

  pousser(avant: Foyer, apres: Foyer): void {
    const foyerId = apres.id;
    const d = differences(avant, apres);
    const maintenant = Date.now();
    if (d.maison) this.file.set('maison', { type: 'maison', maison: d.maison });
    if (d.compteur > 0) {
      const enAttente = this.file.get('compteur');
      const deja = enAttente?.type === 'compteur' ? enAttente.delta : 0;
      this.file.set('compteur', { type: 'compteur', delta: deja + d.compteur });
    }
    for (const m of d.membres) {
      if (m.id !== this.membreId) continue; // chacun ne modifie que son propre profil
      this.file.set(`m:${m.id}`, {
        type: 'membre',
        ligne: { prenom: m.prenom, langue: m.langue, est_aidant: m.estAidant, avatar: m.avatar, nom_rikki: m.nomRikki, notif_emotes: m.notifEmotes ?? false },
      });
    }
    for (const t of d.taches) {
      const cle = `t:${t.id}`;
      this.ecritures.set(cle, maintenant);
      this.file.set(cle, { type: 'upsert', table: 'taches', ligne: { ...ligneDepuisTache(t, foyerId, maintenant) }, conflit: 'foyer_id,id' });
    }
    for (const a of d.avancements) {
      if (a.cle !== 'commun' && a.cle !== this.membreId) continue;
      const cle = `a:${a.tacheId}:${a.cle}`;
      this.ecritures.set(cle, maintenant);
      const ligne: LigneAvancement = {
        foyer_id: foyerId,
        tache_id: a.tacheId,
        cle: a.cle,
        etape: a.avancement.etape,
        derniere_fois: a.avancement.derniereFois ?? null,
        maj_le: maintenant,
      };
      this.file.set(cle, { type: 'upsert', table: 'avancements', ligne: { ...ligne }, conflit: 'foyer_id,tache_id,cle' });
    }
    ecrireFile(this.file);
    void this.vider();
  }

  private async executer(op: Operation): Promise<void> {
    if (op.type === 'upsert') {
      const { error } = await this.sb.from(op.table).upsert(op.ligne, { onConflict: op.conflit });
      if (error) throw error;
    } else if (op.type === 'maison') {
      const { error } = await this.sb.from('foyers').update({ maison: op.maison }).eq('id', this.foyerId!);
      if (error) throw error;
    } else if (op.type === 'membre') {
      const { error } = await this.sb.from('membres').update(op.ligne).eq('id', this.membreId!);
      if (error) throw error;
    } else {
      const { error } = await this.sb.rpc('ajouter_au_compteur', { p_delta: op.delta });
      if (error) throw error;
    }
  }

  private async vider(): Promise<void> {
    if (this.envoiEnCours || !this.foyerId) return;
    this.envoiEnCours = true;
    try {
      for (const [cle, op] of [...this.file]) {
        await this.executer(op);
        // Une nouvelle version a pu arriver pendant l'envoi : on ne la perd pas.
        if (this.file.get(cle) === op) this.file.delete(cle);
        ecrireFile(this.file);
      }
    } catch {
      setTimeout(() => void this.vider(), 8000);
    } finally {
      this.envoiEnCours = false;
    }
  }

  // ------------------------------------------------------------ Réception

  private plusAncien(cle: string, majLe: number): boolean {
    return majLe < (this.ecritures.get(cle) ?? 0);
  }

  ecouter(foyerId: string, appliquer: (f: (foyer: Foyer) => Foyer) => void): () => void {
    const filtre = `foyer_id=eq.${foyerId}`;
    let premiereConnexion = true;

    const recharger = async () => {
      await this.vider();
      if (this.file.size > 0) return; // hors-ligne : on garde l'état local
      try {
        const frais = await this.chargerDepuisServeur(foyerId);
        appliquer(() => frais);
      } catch {
        /* réessai au prochain retour */
      }
    };

    const canal: RealtimeChannel = this.sb
      .channel(`donnees-${foyerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'taches', filter: filtre }, (p) => {
        const l = p.new as LigneTache;
        if (!l?.id || this.plusAncien(`t:${l.id}`, Number(l.maj_le))) return;
        appliquer((f) => {
          const existe = f.taches.find((t) => t.id === l.id);
          const tache = tacheDepuisLigne(l, existe?.avancement ?? {});
          return { ...f, taches: existe ? f.taches.map((t) => (t.id === l.id ? tache : t)) : [...f.taches, tache] };
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avancements', filter: filtre }, (p) => {
        const l = p.new as LigneAvancement;
        if (!l?.tache_id || this.plusAncien(`a:${l.tache_id}:${l.cle}`, Number(l.maj_le))) return;
        appliquer((f) => ({
          ...f,
          taches: f.taches.map((t) => (t.id === l.tache_id ? { ...t, avancement: { ...t.avancement, [l.cle]: avancementDepuisLigne(l) } } : t)),
        }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'membres', filter: filtre }, (p) => {
        if (p.eventType === 'DELETE') {
          const id = (p.old as { id?: string }).id;
          if (id) appliquer((f) => ({ ...f, membres: f.membres.filter((m) => m.id !== id) }));
          return;
        }
        const m = membreDepuisLigne(p.new as LigneMembre);
        if (m.id === this.membreId && this.file.has(`m:${m.id}`)) return;
        appliquer((f) => ({
          ...f,
          membres: f.membres.some((x) => x.id === m.id) ? f.membres.map((x) => (x.id === m.id ? m : x)) : [...f.membres, m],
        }));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'foyers', filter: `id=eq.${foyerId}` }, (p) => {
        const l = p.new as LigneFoyer;
        appliquer((f) => ({
          ...f,
          compteur: Math.max(f.compteur, l.compteur),
          maison: this.file.has('maison') ? f.maison : l.maison,
        }));
      })
      .subscribe((statut) => {
        if (statut === 'SUBSCRIBED') {
          if (!premiereConnexion) void recharger();
          premiereConnexion = false;
        }
      });

    const auRetour = () => {
      if (document.visibilityState === 'visible') void recharger();
    };
    document.addEventListener('visibilitychange', auRetour);
    return () => {
      document.removeEventListener('visibilitychange', auRetour);
      void this.sb.removeChannel(canal);
    };
  }

  // ------------------------------------------------------------ Présence et émotes

  salon(foyerId: string, membreId: MembreId, ecoute: EcouteSalon): () => void {
    const recevoir = async () => {
      const { data } = await this.sb.from('emotes').select('*').eq('destinataire', membreId).maybeSingle();
      if (!data) return;
      await this.sb.from('emotes').delete().eq('destinataire', membreId);
      ecoute.emote({ de: data.de as string, type: data.type as TypeEmote, envoyeLe: Date.parse(data.envoye_le as string) });
    };

    const canal = this.sb.channel(`salon-${foyerId}`, { config: { presence: { key: membreId } } });
    const signalerPresence = () => ecoute.presence(Object.keys(canal.presenceState()));
    canal
      .on('presence', { event: 'sync' }, signalerPresence)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emotes', filter: `destinataire=eq.${membreId}` }, (p) => {
        if (p.eventType !== 'DELETE') void recevoir();
      })
      .subscribe((statut) => {
        if (statut === 'SUBSCRIBED') {
          void canal.track({ depuis: Date.now() });
          void recevoir();
        }
      });

    // Pas de fantôme : on quitte la présence dès que l'app passe en arrière-plan.
    const visibilite = () => {
      if (document.visibilityState === 'visible') {
        void canal.track({ depuis: Date.now() });
        void recevoir();
      } else {
        void canal.untrack();
      }
    };
    document.addEventListener('visibilitychange', visibilite);
    return () => {
      document.removeEventListener('visibilitychange', visibilite);
      void canal.untrack();
      void this.sb.removeChannel(canal);
    };
  }

  async envoyerEmote(_de: MembreId, vers: MembreId, type: TypeEmote): Promise<void> {
    const { error } = await this.sb.rpc('envoyer_emote', { p_vers: vers, p_type: type });
    if (error) throw error;
    // Notification facultative (si le destinataire l'a demandée) : sans attendre.
    void this.sb.functions.invoke('rikki-push', { body: { type: 'emote', vers, typeEmote: type } }).catch(() => {});
  }

  // ------------------------------------------------------------ Rappels et notifications

  async listerRappels(membreId: MembreId): Promise<Rappel[]> {
    const { data, error } = await this.sb.from('rappels').select('*').eq('membre_id', membreId).order('heure');
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id as string,
      libelle: r.libelle as string,
      heure: r.heure as string,
      jours: (r.jours as number[]) ?? [1, 2, 3, 4, 5, 6, 7],
      fuseau: r.fuseau as string,
      actif: r.actif as boolean,
    }));
  }

  async enregistrerRappel(membreId: MembreId, r: Rappel): Promise<void> {
    const { error } = await this.sb.from('rappels').upsert({
      id: r.id,
      membre_id: membreId,
      libelle: r.libelle,
      heure: r.heure,
      jours: r.jours,
      fuseau: r.fuseau,
      actif: r.actif,
    });
    if (error) throw error;
  }

  async supprimerRappel(_membreId: MembreId, id: string): Promise<void> {
    const { error } = await this.sb.from('rappels').delete().eq('id', id);
    if (error) throw error;
  }

  async activerNotifications(membreId: MembreId): Promise<ResultatNotifications> {
    if (!CONFIG.vapidPublique || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      return 'indisponible';
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return 'refuse';
    const enregistrement = await navigator.serviceWorker.ready;
    const abonnement =
      (await enregistrement.pushManager.getSubscription()) ??
      (await enregistrement.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64VersOctets(CONFIG.vapidPublique) as BufferSource,
      }));
    const json = abonnement.toJSON();
    const { error } = await this.sb.from('abonnements_push').upsert({
      endpoint: abonnement.endpoint,
      membre_id: membreId,
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
    });
    if (error) throw error;
    return 'ok';
  }

  async quitter(): Promise<void> {
    await this.sb.rpc('quitter_foyer');
    await this.sb.auth.signOut();
    this.file.clear();
    ecrireFile(this.file);
    depotLocal.effacer();
    this.foyerId = null;
  }
}

export type { Emote };
