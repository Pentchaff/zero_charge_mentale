// État de l'app : le foyer (persisté via le dépôt) et la session en cours
// (énergie déclarée, tâches repoussées). La session n'est jamais enregistrée
// dans le foyer : « Pas maintenant » n'a aucune conséquence (glossaire).

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Energie, Foyer, Langue, Membre, MembreId, TacheId } from '../domaine/types';
import { creerTraduire, type Traduire } from '../i18n';
import type { Depot } from '../stockage/depot';
import {
  chargerReglagesAppareil,
  sauvegarderReglagesAppareil,
  type ReglagesAppareil,
} from '../stockage/depotLocal';

interface Session {
  /** `undefined` : pas encore demandée. `null` : le membre a passé (= énergie basse). */
  energie: Energie | null | undefined;
  exclues: ReadonlySet<TacheId>;
}

const SESSION_VIDE: Session = { energie: undefined, exclues: new Set() };

interface ContexteApp {
  foyer: Foyer | null;
  membre: Membre | null;
  langue: Langue;
  t: Traduire;
  modifierFoyer(f: (foyer: Foyer) => Foyer): void;
  installerFoyer(foyer: Foyer, membreActif: MembreId): void;
  choisirMembre(id: MembreId): void;
  effacerTout(): void;
  /** Langue utilisée tant qu'aucun membre n'existe (onboarding). */
  definirLangueAccueil(l: Langue): void;
  session: Session;
  /** Énergie effective : sans réponse, l'app considère l'énergie basse (glossaire). */
  energie: Energie;
  declarerEnergie(e: Energie | null): void;
  /** Revient à la question d'énergie (le membre veut la changer). */
  redemanderEnergie(): void;
  repousser(id: TacheId): void;
  oublierRepoussees(): void;
  reglagesAppareil: ReglagesAppareil;
  modifierReglagesAppareil(r: ReglagesAppareil): void;
}

const Contexte = createContext<ContexteApp | null>(null);

function langueDuNavigateur(): Langue {
  return typeof navigator !== 'undefined' && navigator.language?.startsWith('ja') ? 'ja' : 'fr';
}

export function FournisseurApp({ depot, children }: { depot: Depot; children: ReactNode }) {
  const [foyer, setFoyer] = useState<Foyer | null>(() => depot.chargerFoyer());
  const [membreId, setMembreId] = useState<MembreId | null>(() => depot.chargerMembreActif());
  const [langueAccueil, setLangueAccueil] = useState<Langue>(langueDuNavigateur);
  const [session, setSession] = useState<Session>(SESSION_VIDE);
  const [reglagesAppareil, setReglagesAppareil] = useState(chargerReglagesAppareil);

  useEffect(() => {
    if (foyer) depot.sauvegarderFoyer(foyer);
  }, [depot, foyer]);

  const membre = useMemo(() => {
    if (!foyer) return null;
    return foyer.membres.find((m) => m.id === membreId) ?? foyer.membres[0] ?? null;
  }, [foyer, membreId]);

  const langue = membre?.langue ?? langueAccueil;
  const t = useMemo(() => creerTraduire(langue), [langue]);

  useEffect(() => {
    document.documentElement.lang = langue;
  }, [langue]);

  const modifierFoyer = useCallback((f: (foyer: Foyer) => Foyer) => {
    setFoyer((actuel) => (actuel ? f(actuel) : actuel));
  }, []);

  const choisirMembre = useCallback(
    (id: MembreId) => {
      setMembreId(id);
      depot.sauvegarderMembreActif(id);
      setSession(SESSION_VIDE); // chaque membre déclare sa propre énergie
    },
    [depot],
  );

  const installerFoyer = useCallback(
    (nouveau: Foyer, membreActif: MembreId) => {
      setFoyer(nouveau);
      choisirMembre(membreActif);
    },
    [choisirMembre],
  );

  const effacerTout = useCallback(() => {
    depot.effacer();
    setFoyer(null);
    setMembreId(null);
    setSession(SESSION_VIDE);
  }, [depot]);

  const valeur: ContexteApp = {
    foyer,
    membre,
    langue,
    t,
    modifierFoyer,
    installerFoyer,
    choisirMembre,
    effacerTout,
    definirLangueAccueil: setLangueAccueil,
    session,
    energie: session.energie ?? 'vide',
    declarerEnergie: (energie) => setSession((s) => ({ ...s, energie })),
    redemanderEnergie: () => setSession((s) => ({ ...s, energie: undefined })),
    repousser: (id) => setSession((s) => ({ ...s, exclues: new Set([...s.exclues, id]) })),
    oublierRepoussees: () => setSession((s) => ({ ...s, exclues: new Set() })),
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
