// Mes rappels : personnels, activés par le membre lui-même (ADR 0006), jamais
// visibles par l'autre (ADR 0005). Libellé volontairement vague, sans nom de
// médicament (ADR 0007).

import { useEffect, useState } from 'react';
import { nouvelId } from '../domaine/foyer';
import { fuseauDuTelephone } from '../domaine/rappels';
import type { Rappel } from '../domaine/types';
import { useFoyer } from '../etat/contexte';
import type { Cle } from '../i18n';

const JOURS_ISO = [1, 2, 3, 4, 5, 6, 7];

function rappelVierge(libelle: string): Rappel {
  return { id: crypto.randomUUID?.() ?? nouvelId('rappel'), libelle, heure: '08:30', jours: [...JOURS_ISO], fuseau: fuseauDuTelephone(), actif: true };
}

export function EditeurRappels() {
  const { backend, membre, t } = useFoyer();
  const [rappels, setRappels] = useState<Rappel[] | null>(null);
  const [brouillon, setBrouillon] = useState<Rappel | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = () =>
    backend
      .listerRappels(membre.id)
      .then(setRappels)
      .catch((e: unknown) => setErreur(String(e)));

  useEffect(() => {
    void charger();
  }, [membre.id]);

  const enregistrer = async (r: Rappel) => {
    try {
      await backend.enregistrerRappel(membre.id, { ...r, libelle: r.libelle.trim() || t('rappel.libelleDefaut'), fuseau: fuseauDuTelephone() });
      setBrouillon(null);
      setErreur(null);
      await charger();
    } catch (e) {
      setErreur(t('erreur.reseau', { detail: e instanceof Error ? e.message : String(e) }));
    }
  };

  const libelleJour = (j: number) => t(`jour.${j % 7}` as Cle);

  return (
    <div className="editeur-rappels">
      {rappels?.length === 0 && !brouillon && <p className="champ-aide">{t('rappel.aucun')}</p>}
      <ul className="liste-rappels">
        {rappels?.map((r) => (
          <li key={r.id} className="ligne-rappel">
            <button type="button" className="ligne-rappel-texte" onClick={() => setBrouillon(r)}>
              <strong>{r.heure}</strong> · {r.libelle}
              <span className="champ-aide">{r.jours.length === 7 ? t('rappel.tousLesJours') : r.jours.map(libelleJour).join(' ')}</span>
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={r.actif}
              className={r.actif ? 'puce puce--active' : 'puce'}
              onClick={() => void enregistrer({ ...r, actif: !r.actif })}
            >
              {r.actif ? t('rappel.actif') : t('rappel.inactif')}
            </button>
          </li>
        ))}
      </ul>

      {brouillon ? (
        <div className="carte-etape">
          <label className="champ">
            <span className="champ-etiquette">{t('rappel.libelle')}</span>
            <input
              className="saisie"
              maxLength={60}
              value={brouillon.libelle}
              placeholder={t('rappel.libelleDefaut')}
              onChange={(e) => setBrouillon({ ...brouillon, libelle: e.target.value })}
            />
            <span className="champ-aide">{t('rappel.libelleAide')}</span>
          </label>
          <label className="champ">
            <span className="champ-etiquette">{t('rappel.heure')}</span>
            <input className="saisie saisie--heure" type="time" value={brouillon.heure} onChange={(e) => setBrouillon({ ...brouillon, heure: e.target.value })} />
          </label>
          <div className="champ">
            <span className="champ-etiquette">{t('rappel.jours')}</span>
            <div className="puces">
              {JOURS_ISO.map((j) => {
                const actif = brouillon.jours.includes(j);
                return (
                  <button
                    key={j}
                    type="button"
                    aria-pressed={actif}
                    className={actif ? 'puce puce--active' : 'puce'}
                    onClick={() => {
                      const jours = actif ? brouillon.jours.filter((x) => x !== j) : [...brouillon.jours, j].sort();
                      if (jours.length) setBrouillon({ ...brouillon, jours });
                    }}
                  >
                    {libelleJour(j)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="barre-actions">
            <button type="button" className="bouton bouton--principal" onClick={() => void enregistrer(brouillon)}>
              {t('commun.enregistrer')}
            </button>
            <button type="button" className="bouton bouton--doux" onClick={() => setBrouillon(null)}>
              {t('commun.annuler')}
            </button>
          </div>
          {rappels?.some((r) => r.id === brouillon.id) && (
            <button
              type="button"
              className="bouton-lien bouton-lien--discret"
              onClick={async () => {
                await backend.supprimerRappel(membre.id, brouillon.id);
                setBrouillon(null);
                await charger();
              }}
            >
              {t('rappel.supprimer')}
            </button>
          )}
        </div>
      ) : (
        <button type="button" className="bouton bouton--doux bouton--large" onClick={() => setBrouillon(rappelVierge(t('rappel.libelleDefaut')))}>
          ＋ {t('rappel.ajouter')}
        </button>
      )}
      {erreur && <p className="message-doux">{erreur}</p>}
    </div>
  );
}
