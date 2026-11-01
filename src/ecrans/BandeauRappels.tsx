// Le rappel personnel du moment, affiché doucement en haut de l'action.
// Personnel : il n'est jamais montré à l'autre membre (ADR 0005).

import { useEffect, useState } from 'react';
import { cleDuJour, rappelEnCours } from '../domaine/rappels';
import type { Rappel } from '../domaine/types';
import { useFoyer } from '../etat/contexte';

function cleVu(id: string, jour: string) {
  return `rikki.rappelVu.${id}.${jour}`;
}

function dejaVu(id: string, jour: string): boolean {
  try {
    return localStorage.getItem(cleVu(id, jour)) === '1';
  } catch {
    return false;
  }
}

export function BandeauRappels() {
  const { backend, membre, t } = useFoyer();
  const [rappels, setRappels] = useState<Rappel[]>([]);
  const [maintenant, setMaintenant] = useState(() => new Date());
  const [masques, setMasques] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    let actif = true;
    const charger = () =>
      backend
        .listerRappels(membre.id)
        .then((r) => actif && setRappels(r))
        .catch(() => {});
    void charger();
    const minuteur = setInterval(() => {
      setMaintenant(new Date());
    }, 60_000);
    const auRetour = () => {
      if (document.visibilityState === 'visible') {
        setMaintenant(new Date());
        void charger();
      }
    };
    document.addEventListener('visibilitychange', auRetour);
    return () => {
      actif = false;
      clearInterval(minuteur);
      document.removeEventListener('visibilitychange', auRetour);
    };
  }, [backend, membre.id]);

  const jour = cleDuJour(maintenant);
  const rappel = rappels.find((r) => rappelEnCours(r, maintenant) && !masques.has(r.id) && !dejaVu(r.id, jour));
  if (!rappel) return null;

  const masquer = () => setMasques((m) => new Set([...m, rappel.id]));
  return (
    <div className="carte carte-rappel" role="status">
      <p className="carte-rappel-titre">🐿️ {rappel.libelle}</p>
      <div className="barre-actions barre-actions--centre">
        <button
          type="button"
          className="bouton bouton--fait"
          onClick={() => {
            try {
              localStorage.setItem(cleVu(rappel.id, jour), '1');
            } catch {
              /* rien */
            }
            masquer();
          }}
        >
          {t('rappel.fait')}
        </button>
        <button type="button" className="bouton bouton--doux" onClick={masquer}>
          {t('action.pasMaintenant')}
        </button>
      </div>
    </div>
  );
}
