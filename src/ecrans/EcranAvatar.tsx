// L'avatar reste modifiable à tout moment (ADR 0017).

import { useState } from 'react';
import { modifierMembre } from '../domaine/foyer';
import { useFoyer } from '../etat/contexte';
import { EditeurAvatar } from './EditeurAvatar';

export function EcranAvatar() {
  const { foyer, membre, t, modifierFoyer } = useFoyer();
  const [brouillon, setBrouillon] = useState(membre.avatar);
  const modifie = JSON.stringify(brouillon) !== JSON.stringify(membre.avatar);

  return (
    <div className="ecran ecran-avatar">
      <h1>{t('avatar.titre')}</h1>
      <EditeurAvatar valeur={brouillon} onChange={setBrouillon} compteur={foyer.compteur} t={t} />
      {modifie && (
        <div className="barre-actions barre-actions--flottante">
          <button
            type="button"
            className="bouton bouton--principal"
            onClick={() => modifierFoyer((f) => modifierMembre(f, membre.id, { avatar: brouillon }))}
          >
            {t('commun.enregistrer')}
          </button>
          <button type="button" className="bouton bouton--doux" onClick={() => setBrouillon(membre.avatar)}>
            {t('commun.annuler')}
          </button>
        </div>
      )}
    </div>
  );
}
