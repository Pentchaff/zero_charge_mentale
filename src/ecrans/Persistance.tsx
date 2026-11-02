// Petits écrans pour ne jamais perdre sa maison : alerte quand le navigateur
// risque de tout oublier, et code de retour personnel (ADR 0024).

import { useEffect, useRef, useState } from 'react';
import { useApp } from '../etat/contexte';
import type { Traduire } from '../i18n';
import { diagnosticStockage, stockageFragile } from '../stockage/persistance';

export function formaterCodeRetour(code: string): string {
  const c = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return c.match(/.{1,4}/g)?.join('-') ?? c;
}

const CLE_ASTUCE = 'rikki.astuceInstallationVue';

/** Alerte (navigateur qui efface tout) ou astuce (iPhone dans Safari). */
export function AlerteStockage({ t, astuce = false }: { t: Traduire; astuce?: boolean }) {
  const [masquee, setMasquee] = useState(() => {
    try {
      return localStorage.getItem(CLE_ASTUCE) === '1';
    } catch {
      return false;
    }
  });
  const d = diagnosticStockage();
  if (stockageFragile(d)) {
    return (
      <div className="carte alerte-stockage" role="alert">
        <p className="carte-repos-titre">⚠️ {t('alerte.fragile')}</p>
        <p>{t('alerte.fragileSous')}</p>
      </div>
    );
  }
  if (astuce && d.iosNavigateur && !masquee) {
    return (
      <div className="carte alerte-stockage alerte-stockage--douce">
        <p>📲 {t('alerte.installer')}</p>
        <button
          type="button"
          className="bouton-lien"
          onClick={() => {
            try {
              localStorage.setItem(CLE_ASTUCE, '1');
            } catch {
              /* rien */
            }
            setMasquee(true);
          }}
        >
          {t('commun.fermer')}
        </button>
      </div>
    );
  }
  return null;
}

/** Affiche (et renouvelle) le code de retour du membre. */
export function BlocCodeRetour({ automatique = false }: { automatique?: boolean }) {
  const { backend, t } = useApp();
  const [code, setCode] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);
  const dejaDemande = useRef(false);

  const obtenir = async () => {
    dejaDemande.current = true;
    setErreur(null);
    try {
      setCode(await backend.nouveauCodeRetour());
    } catch (e) {
      setErreur(t('erreur.reseau', { detail: e instanceof Error ? e.message : String(e) }));
    }
  };

  useEffect(() => {
    if (automatique && !dejaDemande.current) void obtenir();
  }, [automatique]);

  return (
    <div className="bloc-invitation">
      {code ? (
        <>
          <p className="code-invitation code-retour">{formaterCodeRetour(code)}</p>
          <button
            type="button"
            className="bouton bouton--doux"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(formaterCodeRetour(code));
                setCopie(true);
              } catch {
                /* presse-papiers indisponible */
              }
            }}
          >
            📋 {t('retour.copier')}
          </button>
          {copie && <p className="champ-aide">✓ {t('retour.copie')}</p>}
          <p className="champ-aide">{t('retour.garder')}</p>
        </>
      ) : (
        !automatique && (
          <button type="button" className="bouton bouton--doux bouton--large" onClick={() => void obtenir()}>
            🔑 {t('retour.afficher')}
          </button>
        )
      )}
      {erreur && <p className="message-doux">{erreur}</p>}
    </div>
  );
}
