// Onboarding (ADR 0018) : seul ou à deux → son avatar → nommer son Rikki →
// c'est parti. Le foyer type est chargé d'office, aucune autre question.
// Avec la synchronisation, l'autre membre rejoint le foyer sur son propre
// téléphone grâce au code d'invitation. Sans synchronisation (ADR 0023), il
// crée son avatar sur le même appareil.

import { useState } from 'react';
import { AVATAR_PAR_DEFAUT } from '../domaine/avatar';
import { ajouterMembre, creerFoyer, nouvelId } from '../domaine/foyer';
import type { Foyer, Langue, Membre } from '../domaine/types';
import { useApp } from '../etat/contexte';
import { creerTraduire, LANGUES, type Traduire } from '../i18n';
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

export function estIosNavigateur(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const installe = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
  return ios && !installe;
}

/** Sur iPhone, l'app installée ne partage pas ses données avec Safari : il faut installer d'abord. */
export function AideInstallation({ t }: { t: Traduire }) {
  if (!estIosNavigateur()) return null;
  return (
    <div className="carte aide-installation">
      <p className="carte-repos-titre">📲 {t('installation.titre')}</p>
      <ol>
        <li>{t('installation.etape1')}</li>
        <li>{t('installation.etape2')}</li>
        <li>{t('installation.etape3')}</li>
      </ol>
    </div>
  );
}

export function formaterCode(code: string): string {
  const c = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return c.length > 4 ? `${c.slice(0, 4)}-${c.slice(4)}` : c;
}

export function lienInvitation(code: string): string {
  return `${window.location.origin}${window.location.pathname}?invitation=${code}`;
}

/** Le code d'invitation, à partager avec l'autre membre du foyer. */
export function BlocInvitation({ code, t }: { code: string; t: Traduire }) {
  const [copie, setCopie] = useState(false);
  const lien = lienInvitation(code);
  const partager = async () => {
    const texte = t('invitation.message', { code: formaterCode(code) });
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Rikki', text: texte, url: lien });
        return;
      }
      await navigator.clipboard.writeText(`${texte}\n${lien}`);
      setCopie(true);
    } catch {
      /* partage annulé */
    }
  };
  return (
    <div className="bloc-invitation">
      <p className="code-invitation" aria-label={t('invitation.code')}>
        {formaterCode(code)}
      </p>
      <button type="button" className="bouton bouton--principal bouton--large" onClick={partager}>
        💌 {t('invitation.partager')}
      </button>
      {copie && <p className="champ-aide">✓ {t('invitation.copie')}</p>}
      <p className="champ-aide">{t('invitation.aide')}</p>
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
  occupe = false,
}: {
  langueInitiale: Langue;
  demanderLangue: boolean;
  estAidant: boolean;
  compteur: number;
  titre?: string;
  onTermine(m: Membre): void;
  onAnnuler?(): void;
  occupe?: boolean;
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
            maxLength={30}
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
          <input className="saisie saisie--grande" maxLength={20} value={membre.nomRikki} onChange={(e) => maj({ nomRikki: e.target.value })} />
          <button type="submit" className="bouton bouton--principal bouton--large" disabled={occupe}>
            {occupe ? '…' : t('commun.suivant')}
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

type Etape = 'langue' | 'choix' | 'code' | 'rejoindre' | 'combien' | 'premier' | 'invitation' | 'second' | 'fini';

function codeDansAdresse(): string {
  try {
    return new URLSearchParams(window.location.search).get('invitation') ?? '';
  } catch {
    return '';
  }
}

export function Onboarding() {
  const { t, langue, definirLangueAccueil, installerFoyer, backend } = useApp();
  const synchro = backend.mode === 'supabase';
  const [etape, setEtape] = useState<Etape>('langue');
  const [aDeux, setADeux] = useState(false);
  const [foyer, setFoyer] = useState<Foyer | null>(null);
  const [membreActif, setMembreActif] = useState<string | null>(null);
  const [code, setCode] = useState(codeDansAdresse);
  const [erreur, setErreur] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);

  const premier = foyer?.membres.find((m) => m.id === membreActif) ?? foyer?.membres[0];

  const creer = async (m: Membre) => {
    setOccupe(true);
    setErreur(null);
    try {
      const brouillon = creerFoyer(m, Date.now());
      const r = await backend.creerFoyer(m, brouillon);
      setFoyer(r.foyer);
      setMembreActif(r.membreId);
      setEtape(aDeux ? 'invitation' : 'fini');
    } catch (e) {
      setErreur(t('erreur.reseau', { detail: e instanceof Error ? e.message : String(e) }));
    } finally {
      setOccupe(false);
    }
  };

  const rejoindre = async (m: Membre) => {
    setOccupe(true);
    setErreur(null);
    try {
      const r = await backend.rejoindreFoyer(code, m);
      setFoyer(r.foyer);
      setMembreActif(r.membreId);
      window.history.replaceState(null, '', window.location.pathname);
      setEtape('fini');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setErreur(message === 'code_inconnu' ? t('invitation.inconnu') : t('erreur.reseau', { detail: message }));
      setEtape('code');
    } finally {
      setOccupe(false);
    }
  };

  return (
    <div className="onboarding">
      {etape === 'langue' && (
        <div className="onboarding-etape">
          <Rikki etat="eveille" className="onboarding-rikki" />
          <h1>{t('onboarding.bonjour')}</h1>
          <AideInstallation t={t} />
          <p>{t('onboarding.langue')}</p>
          <ChoixLangue
            onChoix={(l) => {
              definirLangueAccueil(l);
              setEtape(!synchro ? 'combien' : code ? 'code' : 'choix');
            }}
          />
        </div>
      )}

      {etape === 'choix' && (
        <div className="onboarding-etape">
          <Rikki etat="eveille" className="onboarding-rikki" />
          <h1>{t('onboarding.bienvenue')}</h1>
          <div className="choix-langue">
            <button type="button" className="bouton bouton--grand" onClick={() => setEtape('combien')}>
              🏡 {t('onboarding.creer')}
            </button>
            <button type="button" className="bouton bouton--grand" onClick={() => setEtape('code')}>
              💌 {t('onboarding.rejoindre')}
            </button>
          </div>
        </div>
      )}

      {etape === 'code' && (
        <form
          className="onboarding-etape"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.replace(/[^A-Za-z0-9]/g, '').length >= 8) setEtape('rejoindre');
          }}
        >
          <h1>{t('invitation.saisir')}</h1>
          <input
            className="saisie saisie--grande saisie--code"
            autoFocus
            autoCapitalize="characters"
            autoComplete="off"
            value={formaterCode(code)}
            placeholder="ABCD-1234"
            onChange={(e) => setCode(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase())}
          />
          {erreur && <p className="message-doux">{erreur}</p>}
          <button type="submit" className="bouton bouton--principal bouton--large" disabled={code.length < 8}>
            {t('commun.suivant')}
          </button>
          <button type="button" className="bouton-lien" onClick={() => (setErreur(null), setEtape('choix'))}>
            {t('commun.retour')}
          </button>
        </form>
      )}

      {etape === 'rejoindre' && (
        <>
          <CreationMembre langueInitiale={langue} demanderLangue={false} estAidant={false} compteur={0} occupe={occupe} onTermine={rejoindre} />
          {erreur && <p className="message-doux">{erreur}</p>}
        </>
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
        <>
          <CreationMembre langueInitiale={langue} demanderLangue={false} estAidant compteur={0} occupe={occupe} onTermine={creer} />
          {erreur && <p className="message-doux">{erreur}</p>}
        </>
      )}

      {etape === 'invitation' && foyer && (
        <div className="onboarding-etape">
          <h1>{t('onboarding.invitation')}</h1>
          {synchro && foyer.codeInvitation ? (
            <>
              <p>{t('onboarding.invitationSynchro')}</p>
              <BlocInvitation code={foyer.codeInvitation} t={t} />
              <button type="button" className="bouton bouton--doux bouton--large" onClick={() => setEtape('fini')}>
                {t('commun.suivant')}
              </button>
            </>
          ) : (
            <>
              <p>{t('onboarding.invitationTexte')}</p>
              <button type="button" className="bouton bouton--principal bouton--large" onClick={() => setEtape('second')}>
                {t('onboarding.ajouterAutre')}
              </button>
              <button type="button" className="bouton bouton--doux bouton--large" onClick={() => setEtape('fini')}>
                {t('onboarding.plusTard')}
              </button>
            </>
          )}
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
