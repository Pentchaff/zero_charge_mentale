// État de l'app : le foyer (enregistré et partagé via le backend), la
// présence de l'autre membre, les émotes reçues, et la session en cours
// (énergie déclarée, tâches repoussées). La session n'est jamais enregistrée :
// « Pas maintenant » n'a aucune conséquence (glossaire).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Emote, Energie, Foyer, Langue, Membre, MembreId, TacheId, TypeEmote } from '../domaine/types';
import { creerTraduire, type Traduire } from '../i18n';
import { depotLocal, chargerReglagesAppareil, sauvegarderReglagesAppareil, type ReglagesAppareil } from '../stockage/depotLocal';
import type { Backend } from '../sync/backend';

interface Session {
  /** `undefined` : pas encore demandée. `null` : le membre a passé (= énergie basse). */
  energie: Energie | null | undefined;
  exclues: ReadonlySet<TacheId>;
}

const SESSION_VIDE: Session = { energie: undefined, exclues: new Set() };

type Etat = 'chargement' | 'pret' | 'erreur';

interface ContexteApp {
  backend: Backend;
  etat: Etat;
  erreur: string | null;
  foyer: Foyer | null;
  membre: Membre | null;
  langue: Langue;
  t: Traduire;
  modifierFoyer(f: (foyer: Foyer) => Foyer): void;
  installerFoyer(foyer: Foyer, membreActif: MembreId): void;
  /** Mode local seulement : plusieurs membres sur un même téléphone. */
  choisirMembre(id: MembreId): void;
  quitter(): Promise<void>;
  /** Langue utilisée tant qu'aucun membre n'existe (onboarding). */
  definirLangueAccueil(l: Langue): void;
  session: Session;
  /** Énergie effective : sans réponse, l'app considère l'énergie basse (glossaire). */
  energie: Energie;
  declarerEnergie(e: Energie | null): void;
  redemanderEnergie(): void;
  repousser(id: TacheId): void;
  oublierRepoussees(): void;
  /** Membres qui ont l'app ouverte en ce moment (ADR 0011). */
  enLigne: ReadonlySet<MembreId>;
  emoteRecue: Emote | null;
  oublierEmote(): void;
  envoyerEmote(vers: MembreId, type: TypeEmote): Promise<void>;
  reglagesAppareil: ReglagesAppareil;
  modifierReglagesAppareil(r: ReglagesAppareil): void;
}

const Contexte = createContext<ContexteApp | null>(null);

function langueDuNavigateur(): Langue {
  return typeof navigator !== 'undefined' && navigator.language?.startsWith('ja') ? 'ja' : 'fr';
}

export function FournisseurApp({ backend, children }: { backend: Backend; children: ReactNode }) {
  const [etat, setEtat] = useState<Etat>('chargement');
  const [erreur, setErreur] = useState<string | null>(null);
  const [foyer, setFoyerEtat] = useState<Foyer | null>(null);
  const foyerRef = useRef<Foyer | null>(null);
  const [membreId, setMembreId] = useState<MembreId | null>(null);
  const [langueAccueil, setLangueAccueil] = useState<Langue>(langueDuNavigateur);
  const [session, setSession] = useState<Session>(SESSION_VIDE);
  const [enLigne, setEnLigne] = useState<ReadonlySet<MembreId>>(new Set());
  const [emoteRecue, setEmoteRecue] = useState<Emote | null>(null);
  const [reglagesAppareil, setReglagesAppareil] = useState(chargerReglagesAppareil);

  const setFoyer = useCallback((f: Foyer | null) => {
    foyerRef.current = f;
    setFoyerEtat(f);
    if (f) depotLocal.sauvegarderFoyer(f); // cache pour démarrer hors-ligne
  }, []);

  useEffect(() => {
    let annule = false;
    backend
      .demarrer()
      .then(({ foyer: f, membreId: id }) => {
        if (annule) return;
        setFoyer(f);
        setMembreId(id);
        setEtat('pret');
      })
      .catch((e: unknown) => {
        if (annule) return;
        setErreur(e instanceof Error ? e.message : String(e));
        setEtat('erreur');
      });
    return () => {
      annule = true;
    };
  }, [backend, setFoyer]);

  const foyerId = foyer?.id ?? null;

  // Changements venus de l'autre téléphone.
  useEffect(() => {
    if (!foyerId) return;
    return backend.ecouter(foyerId, (f) => {
      if (foyerRef.current) setFoyer(f(foyerRef.current));
    });
  }, [backend, foyerId, setFoyer]);

  const membre = useMemo(() => {
    if (!foyer) return null;
    return foyer.membres.find((m) => m.id === membreId) ?? (backend.mode === 'local' ? foyer.membres[0] : null) ?? null;
  }, [foyer, membreId, backend.mode]);
  const idMembre = membre?.id ?? null;

  // Présence et émotes.
  useEffect(() => {
    if (!foyerId || !idMembre) return;
    return backend.salon(foyerId, idMembre, {
      presence: (ids) => setEnLigne(new Set(ids)),
      emote: (e) => setEmoteRecue(e),
    });
  }, [backend, foyerId, idMembre]);

  const langue = membre?.langue ?? langueAccueil;
  const t = useMemo(() => creerTraduire(langue), [langue]);

  useEffect(() => {
    document.documentElement.lang = langue;
  }, [langue]);

  const modifierFoyer = useCallback(
    (f: (foyer: Foyer) => Foyer) => {
      const avant = foyerRef.current;
      if (!avant) return;
      const apres = f(avant);
      if (apres === avant) return;
      setFoyer(apres);
      backend.pousser(avant, apres);
    },
    [backend, setFoyer],
  );

  const choisirMembre = useCallback((id: MembreId) => {
    setMembreId(id);
    depotLocal.sauvegarderMembreActif(id);
    setSession(SESSION_VIDE); // chaque membre déclare sa propre énergie
    setEmoteRecue(null);
  }, []);

  const installerFoyer = useCallback(
    (nouveau: Foyer, membreActif: MembreId) => {
      setFoyer(nouveau);
      if (backend.mode === 'local') backend.pousser(nouveau, nouveau);
      choisirMembre(membreActif);
    },
    [backend, choisirMembre, setFoyer],
  );

  const quitter = useCallback(async () => {
    await backend.quitter();
    foyerRef.current = null;
    setFoyerEtat(null);
    setMembreId(null);
    setSession(SESSION_VIDE);
    if (backend.mode === 'supabase') window.location.reload();
  }, [backend]);

  const valeur: ContexteApp = {
    backend,
    etat,
    erreur,
    foyer,
    membre,
    langue,
    t,
    modifierFoyer,
    installerFoyer,
    choisirMembre,
    quitter,
    definirLangueAccueil: setLangueAccueil,
    session,
    energie: session.energie ?? 'vide',
    declarerEnergie: (energie) => setSession((s) => ({ ...s, energie })),
    redemanderEnergie: () => setSession((s) => ({ ...s, energie: undefined })),
    repousser: (id) => setSession((s) => ({ ...s, exclues: new Set([...s.exclues, id]) })),
    oublierRepoussees: () => setSession((s) => ({ ...s, exclues: new Set() })),
    enLigne,
    emoteRecue,
    oublierEmote: () => setEmoteRecue(null),
    envoyerEmote: (vers, type) => (idMembre ? backend.envoyerEmote(idMembre, vers, type) : Promise.resolve()),
    reglagesAppareil,
    modifierReglagesAppareil: (r) => {
      setReglagesAppareil(r);
      sauvegarderReglagesAppareil(r);
    },
  };

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useApp(): ContexteApp {
  const c = useContext(Contexte);
  if (!c) throw new Error('useApp doit être utilisé dans <FournisseurApp>');
  return c;
}

/** Variante pour les écrans qui exigent un foyer et un membre (tout sauf l'onboarding). */
export function useFoyer(): ContexteApp & { foyer: Foyer; membre: Membre } {
  const c = useApp();
  if (!c.foyer || !c.membre) throw new Error('Aucun foyer');
  return c as ContexteApp & { foyer: Foyer; membre: Membre };
}
