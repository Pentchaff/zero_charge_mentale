// Petits composants partagés par les écrans.

import { useEffect, type ReactNode } from 'react';

/** Rangée de puces à choix unique (domaine, fréquence, effort…). */
export function Puces<T extends string | number>({
  options,
  valeur,
  onChange,
  libelle,
  etiquette,
}: {
  options: readonly T[];
  valeur: T | undefined;
  onChange(v: T): void;
  libelle(v: T): ReactNode;
  etiquette?: string;
}) {
  return (
    <div className="puces" role="radiogroup" aria-label={etiquette}>
      {options.map((o) => (
        <button
          key={String(o)}
          type="button"
          role="radio"
          aria-checked={o === valeur}
          className={o === valeur ? 'puce puce--active' : 'puce'}
          onClick={() => onChange(o)}
        >
          {libelle(o)}
        </button>
      ))}
    </div>
  );
}

export function Champ({ etiquette, aide, children }: { etiquette: string; aide?: string; children: ReactNode }) {
  return (
    <label className="champ">
      <span className="champ-etiquette">{etiquette}</span>
      {children}
      {aide && <span className="champ-aide">{aide}</span>}
    </label>
  );
}

export interface Annonce {
  id: number;
  texte: string;
  action?: { libelle: string; faire(): void };
  duree?: number;
}

/** Une annonce douce en bas de l'écran (nouveauté débloquée, annulation possible). */
export function Toast({ annonce, onFin }: { annonce: Annonce | null; onFin(): void }) {
  useEffect(() => {
    if (!annonce) return;
    const minuteur = setTimeout(onFin, annonce.duree ?? 3500);
    return () => clearTimeout(minuteur);
  }, [annonce, onFin]);

  if (!annonce) return null;
  return (
    <div className="toast" role="status" key={annonce.id}>
      <span>{annonce.texte}</span>
      {annonce.action && (
        <button
          type="button"
          className="toast-action"
          onClick={() => {
            annonce.action?.faire();
            onFin();
          }}
        >
          {annonce.action.libelle}
        </button>
      )}
    </div>
  );
}
