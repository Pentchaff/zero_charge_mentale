// Onboarding (ADR 0018) : seul ou à deux → son avatar → nommer son Rikki →
// c'est parti. Le foyer type est chargé d'office, aucune autre question.
// En v0, sans synchronisation, l'autre membre crée son avatar sur le même
// appareil (ADR 0023).

import { useState } from 'react';
import { AVATAR_PAR_DEFAUT } from '../domaine/avatar';
import { ajouterMembre, creerFoyer, nouvelId } from '../domaine/foyer';
import type { Foyer, Langue, Membre } from '../domaine/types';
import { useApp } from '../etat/contexte';
import { creerTraduire, LANGUES } from '../i18n';
import { Avatar } from '../ui/avatar/Avatar';
import { Rikki } from '../ui/rikki/Rikki';
import { EditeurAvatar } from './EditeurAvatar';

const NOM_RIKKI: Record<Langue, string> = { fr: 'Rikki', ja: 'リッキー' };

function ChoixLangue({ onChoix }: { onChoix(l: Langue): void }) {
  return (
    <div className="choix-langue">
      {LANGUES.map((l) => (
        <button key={l.id} type="button" className="bouton bouton--grand" lang={l.id} onClick={() => onChoix(l.id)}>
          {l.nom}
        </button>
      ))}
    </div>
  );
}

/**
 * Création d'un membre : langue (facultative), prénom, avatar, nom de Rikki.
 * Parle dans la langue choisie par ce membre, pas dans celle de l'appareil.
 */
export function CreationMembre({
  langueInitiale,
  demanderLangue,
  estAidant,
  compteur,
  titre,
  onTermine,
  onAnnuler,
}: {
  langueInitiale: Langue;
  demanderLangue: boolean;
  estAidant: boolean;
  compteur: number;
  titre?: string;
  onTermine(m: Membre): void;
  onAnnuler?(): void;
}) {
  const [etape, setEtape] = useState<'langue' | 'prenom' | 'avatar' | 'rikki'>(demanderLangue ? 'langue' : 'prenom');
  const [membre, setMembre] = useState<Membre>(() => ({
    id: nouvelId('membre'),
    prenom: '',
    langue: langueInitiale,
    estAidant,
    avatar: AVATAR_PAR_DEFAUT,
    nomRikki: NOM_RIKKI[langueInitiale],
  }));
  const t = creerTraduire(membre.langue);
  const maj = (m: Partial<Membre>) => setMembre((x) => ({ ...x, ...m }));

  return (
    <div className="onboarding-etape" lang={membre.langue}>
      {titre && <p className="onboarding-surtitre">{titre}</p>}

      {etape === 'langue' && (
        <>
          <h1>{t('onboarding.langue')}</h1>
          <ChoixLangue
            onChoix={(langue) => {
              maj({ langue, nomRikki: NOM_RIKKI[langue] });
              setEtape('prenom');
            }}
          />
        </>
      )}

      {etape === 'prenom' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (membre.prenom.trim()) setEtape('avatar');
          }}
        >
          <h1>{t('onboarding.prenom')}</h1>
          <input
            className="saisie saisie--grande"
            autoFocus
            value={membre.prenom}
            placeholder={t('onboarding.prenomExemple')}
            onChange={(e) => maj({ prenom: e.target.value })}
          />
          <button type="submit" className="bouton bouton--principal bouton--large" disabled={!membre.prenom.trim()}>
            {t('commun.suivant')}
          </button>
        </form>
      )}

      {etape === 'avatar' && (
        <>
          <h1>{t('onboarding.avatar')}</h1>
          <EditeurAvatar valeur={membre.avatar} onChange={(avatar) => maj({ avatar })} compteur={compteur} t={t} />
          <button type="button" className="bouton bouton--principal bouton--large" onClick={() => setEtape('rikki')}>
            {t('commun.suivant')}
          </button>
        </>
      )}

      {etape === 'rikki' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onTermine({ ...membre, prenom: membre.prenom.trim(), nomRikki: membre.nomRikki.trim() || NOM_RIKKI[membre.langue] });
          }}
        >
          <div className="duo">
            <Avatar config={membre.avatar} className="duo-avatar" />
            <Rikki etat="eveille" className="duo-rikki" />
          </div>
          <h1>{t('onboarding.rikki')}</h1>
          <input className="saisie saisie--grande" value={membre.nomRikki} onChange={(e) => maj({ nomRikki: e.target.value })} />
          <button type="submit" className="bouton bouton--principal bouton--large">
            {t('commun.suivant')}
          </button>
        </form>
      )}

      {onAnnuler && (
        <button type="button" className="bouton-lien" onClick={onAnnuler}>
          {t('commun.annuler')}
        </button>
      )}
    </div>
  );
}

type Etape = 'langue' | 'combien' | 'premier' | 'invitation' | 'second' | 'fini';

export function Onboarding() {
  const { t, langue, definirLangueAccueil, installerFoyer } = useApp();
  const [etape, setEtape] = useState<Etape>('langue');
  const [aDeux, setADeux] = useState(false);
  const [foyer, setFoyer] = useState<Foyer | null>(null);

  const premier = foyer?.membres[0];

  return (
    <div className="onboarding">
      {etape === 'langue' && (
        <div className="onboarding-etape">
          <Rikki etat="eveille" className="onboarding-rikki" />
          <h1>{t('onboarding.bonjour')}</h1>
          <p>{t('onboarding.langue')}</p>
          <ChoixLangue
            onChoix={(l) => {
              definirLangueAccueil(l);
              setEtape('combien');
            }}
          />
        </div>
      )}

      {etape === 'combien' && (
        <div className="onboarding-etape">
          <Rikki etat="eveille" className="onboarding-rikki" />
          <h1>{t('onboarding.seulOuPlusieurs')}</h1>
          <div className="choix-langue">
            <button type="button" className="bouton bouton--grand" onClick={() => (setADeux(false), setEtape('premier'))}>
              🧍 {t('onboarding.seul')}
            </button>
            <button type="button" className="bouton bouton--grand" onClick={() => (setADeux(true), setEtape('premier'))}>
              🧍🧍 {t('onboarding.aDeux')}
            </button>
          </div>
        </div>
      )}

      {etape === 'premier' && (
        <CreationMembre
          langueInitiale={langue}
          demanderLangue={false}
          estAidant
          compteur={0}
          onTermine={(m) => {
            setFoyer(creerFoyer(m, Date.now()));
            setEtape(aDeux ? 'invitation' : 'fini');
          }}
        />
      )}

      {etape === 'invitation' && (
        <div className="onboarding-etape">
          <h1>{t('onboarding.invitation')}</h1>
          <p>{t('onboarding.invitationTexte')}</p>
          <button type="button" className="bouton bouton--principal bouton--large" onClick={() => setEtape('second')}>
            {t('onboarding.ajouterAutre')}
          </button>
          <button type="button" className="bouton bouton--doux bouton--large" onClick={() => setEtape('fini')}>
            {t('onboarding.plusTard')}
          </button>
        </div>
      )}

      {etape === 'second' && foyer && (
        <CreationMembre
          langueInitiale={langue === 'fr' ? 'ja' : 'fr'}
          demanderLangue
          estAidant={false}
          compteur={0}
          titre={t('onboarding.autreMembre')}
          onTermine={(m) => {
            setFoyer(ajouterMembre(foyer, m));
            setEtape('fini');
          }}
          onAnnuler={() => setEtape('fini')}
        />
      )}

      {etape === 'fini' && foyer && premier && (
        <div className="onboarding-etape">
          <div className="duo">
            {foyer.membres.map((m) => (
              <Avatar key={m.id} config={m.avatar} pose="fait" className="duo-avatar" />
            ))}
            <Rikki etat="joie" className="duo-rikki" />
          </div>
          <h1>{t('onboarding.cestParti')}</h1>
          <p>{t('onboarding.pret', { rikki: premier.nomRikki })}</p>
          <button type="button" className="bouton bouton--principal bouton--large" onClick={() => installerFoyer(foyer, premier.id)}>
            {t('onboarding.cestParti')}
          </button>
        </div>
      )}
    </div>
  );
}
