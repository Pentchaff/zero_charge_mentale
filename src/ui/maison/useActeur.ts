// Joue les étapes d'une scène pour un personnage (et son Rikki), l'une après
// l'autre. Quand le script est fini, l'acteur demande la suite à `suite`
// (une nouvelle activité, ou attendre au poste de la micro-étape).

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Effet, Etape, Placement, PlacementRikki } from './scene';

export interface EtatActeur {
  perso: Placement;
  rikki: PlacementRikki;
  effet: { type: Effet; x: number; y: number; z: number; cle: number } | null;
}

export interface Acteur {
  etat: EtatActeur;
  /** Remplace ce qui se joue par ce script (émote, « Fait », changement de pièce). */
  jouer(etapes: Etape[]): void;
  /** La position actuelle, pour construire le script suivant. */
  ici(): Placement;
}

export function useActeur(depart: () => EtatActeur, suite: (depuis: Placement) => Etape[]): Acteur {
  const [etat, setEtat] = useState<EtatActeur>(depart);
  const etatRef = useRef(etat);
  const file = useRef<Etape[]>([]);
  const minuteur = useRef<number | undefined>(undefined);
  const suiteRef = useRef(suite);
  suiteRef.current = suite;

  const avancer = useCallback(() => {
    window.clearTimeout(minuteur.current);
    if (!file.current.length) file.current = suiteRef.current(etatRef.current.perso);
    const etape = file.current.shift();
    if (!etape) return;
    const prec = etatRef.current;
    const suivant: EtatActeur = {
      perso: etape.perso,
      rikki: etape.rikki ?? { ...prec.rikki, duree: 0, saute: false },
      effet: etape.effet ? { ...etape.effet, cle: Date.now() + Math.random() } : null,
    };
    etatRef.current = suivant;
    setEtat(suivant);
    minuteur.current = window.setTimeout(avancer, Math.max(16, etape.ms));
  }, []);

  useEffect(() => () => window.clearTimeout(minuteur.current), []);

  const jouer = useCallback(
    (etapes: Etape[]) => {
      file.current = [...etapes];
      avancer();
    },
    [avancer],
  );

  const ici = useCallback(() => etatRef.current.perso, []);

  return { etat, jouer, ici };
}
