// Réglages : soi-même, notifications et rappels personnels, la maison, le
// foyer (code d'invitation ou membres de l'appareil), la voix de Rikki
// (Gemini, ADR 0009) et la sauvegarde.

import { useRef, useState } from 'react';
import { demanderAGemini } from '../compagnon/gemini';
import { ajouterMembre, modifierMaison, modifierMembre } from '../domaine/foyer';
import type { Foyer, PieceId } from '../domaine/types';
import { useFoyer } from '../etat/contexte';
import { LANGUES, type Cle } from '../i18n';
import { estFoyer } from '../stockage/depot';
import { normaliserFoyer } from '../stockage/depotLocal';
import { Avatar } from '../ui/avatar/Avatar';
import { Champ, Puces } from '../ui/commun';
import { EditeurRappels } from './EditeurRappels';
import { BlocInvitation, CreationMembre } from './Onboarding';
import { BlocCodeRetour } from './Persistance';

const PIECES: PieceId[] = ['salon', 'cuisine', 'chambre', 'salleDeBain'];
const MURS = ['#f6e7d2', '#e9f1e4', '#e4eef6', '#f6e4ea', '#efe6f6', '#fbf3d9', '#f3ddc6', '#dde8e3'];

export function Reglages() {
  const app = useFoyer();
  const { foyer, membre, t, langue, modifierFoyer, reglagesAppareil, modifierReglagesAppareil, backend, enLigne } = app;
  const synchro = backend.mode === 'supabase';
  const [ajout, setAjout] = useState(false);
  const [essai, setEssai] = useState<string | null>(null);
  const [erreurImport, setErreurImport] = useState(false);
  const [etatNotif, setEtatNotif] = useState<string | null>(null);
  const fichier = useRef<HTMLInputElement>(null);

  if (ajout) {
    return (
      <div className="ecran">
        <CreationMembre
          langueInitiale={langue}
          demanderLangue
          estAidant={false}
          compteur={foyer.compteur}
          onTermine={(m) => {
            modifierFoyer((f) => ajouterMembre(f, m));
            setAjout(false);
          }}
          onAnnuler={() => setAjout(false)}
        />
      </div>
    );
  }

  const majMoi = (modif: Parameters<typeof modifierMembre>[2]) => modifierFoyer((f) => modifierMembre(f, membre.id, modif));

  const basculerPiece = (p: PieceId) => {
    const pieces = foyer.maison.pieces.includes(p) ? foyer.maison.pieces.filter((x) => x !== p) : PIECES.filter((x) => x === p || foyer.maison.pieces.includes(x));
    if (pieces.length) modifierFoyer((f) => modifierMaison(f, { ...f.maison, pieces }));
  };

  const exporter = () => {
    const blob = new Blob([JSON.stringify(foyer, null, 2)], { type: 'application/json' });
    const lien = document.createElement('a');
    lien.href = URL.createObjectURL(blob);
    lien.download = 'rikki-foyer.json';
    lien.click();
    URL.revokeObjectURL(lien.href);
  };

  const importer = async (f: File) => {
    try {
      const contenu: unknown = JSON.parse(await f.text());
      if (!estFoyer(contenu)) throw new Error('format');
      const importe = normaliserFoyer(contenu as Foyer);
      app.installerFoyer(importe, importe.membres.find((m) => m.id === membre.id)?.id ?? importe.membres[0].id);
      setErreurImport(false);
    } catch {
      setErreurImport(true);
    }
  };

  const tester = async () => {
    setEssai('…');
    try {
      setEssai(
        await demanderAGemini(
          { langue, situation: 'accueil', prenom: membre.prenom, nomRikki: membre.nomRikki },
          { cle: reglagesAppareil.cleGemini, modele: reglagesAppareil.modeleGemini },
          8000,
        ),
      );
    } catch (e) {
      setEssai(`⚠️ ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const activerNotifications = async () => {
    setEtatNotif('…');
    try {
      const r = await backend.activerNotifications(membre.id);
      setEtatNotif(t(`notif.${r}` as Cle));
    } catch (e) {
      setEtatNotif(t('erreur.reseau', { detail: e instanceof Error ? e.message : String(e) }));
    }
  };

  return (
    <div className="ecran ecran-reglages">
      <h1>{t('reglages.titre')}</h1>

      <section className="carte">
        <h2>{t('reglages.moi')}</h2>
        <Champ etiquette={t('reglages.prenom')}>
          <input className="saisie" maxLength={30} value={membre.prenom} onChange={(e) => majMoi({ prenom: e.target.value })} />
        </Champ>
        <Champ etiquette={t('reglages.langue')}>
          <Puces options={LANGUES.map((l) => l.id)} valeur={membre.langue} onChange={(l) => majMoi({ langue: l })} libelle={(l) => LANGUES.find((x) => x.id === l)?.nom} />
        </Champ>
        <Champ etiquette={t('reglages.nomRikki')}>
          <input className="saisie" maxLength={20} value={membre.nomRikki} onChange={(e) => majMoi({ nomRikki: e.target.value })} />
        </Champ>
        <label className="case">
          <input type="checkbox" checked={membre.estAidant} onChange={(e) => majMoi({ estAidant: e.target.checked })} />
          <span>{t('reglages.aidant')}</span>
        </label>
      </section>

      <section className="carte">
        <h2>{t('rappel.titre')}</h2>
        <p className="champ-aide">{t('rappel.intro')}</p>
        <EditeurRappels />
      </section>

      {synchro && (
        <section className="carte">
          <h2>{t('notif.titre')}</h2>
          <p className="champ-aide">{t('notif.intro')}</p>
          <button type="button" className="bouton bouton--doux bouton--large" onClick={() => void activerNotifications()}>
            🔔 {t('notif.activer')}
          </button>
          {etatNotif && <p className="champ-aide">{etatNotif}</p>}
          <label className="case">
            <input type="checkbox" checked={membre.notifEmotes ?? false} onChange={(e) => majMoi({ notifEmotes: e.target.checked })} />
            <span>{t('notif.emotes')}</span>
          </label>
        </section>
      )}

      <section className="carte">
        <h2>{t('reglages.membres')}</h2>
        <ul className="liste-membres">
          {foyer.membres.map((m) => (
            <li key={m.id} className={m.id === membre.id ? 'membre membre--actif' : 'membre'}>
              <Avatar config={m.avatar} cadrage="tete" className="membre-tete" />
              <span className="membre-prenom">
                {m.prenom}
                {synchro && m.id !== membre.id && enLigne.has(m.id) && <span className="pastille-en-ligne"> · {t('reglages.enLigne')}</span>}
              </span>
              {!synchro && m.id !== membre.id && (
                <button type="button" className="bouton bouton--doux" onClick={() => app.choisirMembre(m.id)}>
                  {t('reglages.utiliserEnTantQue', { prenom: m.prenom })}
                </button>
              )}
            </li>
          ))}
        </ul>
        {synchro && foyer.codeInvitation ? (
          <>
            <p className="champ-aide">{t('reglages.inviter')}</p>
            <BlocInvitation code={foyer.codeInvitation} t={t} />
          </>
        ) : (
          <>
            <button type="button" className="bouton bouton--doux bouton--large" onClick={() => setAjout(true)}>
              ＋ {t('reglages.ajouterMembre')}
            </button>
            <p className="champ-aide">{t('reglages.invitationBientot')}</p>
          </>
        )}
      </section>

      {synchro && (
        <section className="carte">
          <h2>🔑 {t('retour.titre')}</h2>
          <p className="champ-aide">{t('retour.intro')}</p>
          <BlocCodeRetour />
          <p className="champ-aide">{t('retour.remplace')}</p>
        </section>
      )}

      <section className="carte">
        <h2>{t('reglages.maison')}</h2>
        <Champ etiquette={t('reglages.pieces')}>
          <div className="puces">
            {PIECES.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={foyer.maison.pieces.includes(p)}
                className={foyer.maison.pieces.includes(p) ? 'puce puce--active' : 'puce'}
                onClick={() => basculerPiece(p)}
              >
                {t(`piece.${p}` as Cle)}
              </button>
            ))}
          </div>
        </Champ>
        <Champ etiquette={t('reglages.couleurMurs')}>
          <div className="ea-nuancier">
            {MURS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                aria-pressed={foyer.maison.couleurMurs === c}
                className={foyer.maison.couleurMurs === c ? 'ea-couleur ea-couleur--active' : 'ea-couleur'}
                style={{ background: c }}
                onClick={() => modifierFoyer((f) => modifierMaison(f, { ...f.maison, couleurMurs: c }))}
              />
            ))}
          </div>
        </Champ>
      </section>

      <section className="carte">
        <h2>{t('reglages.compagnon')}</h2>
        <p className="champ-aide">{t('reglages.compagnonAide')}</p>
        <Champ etiquette={t('reglages.cle')}>
          <input
            className="saisie"
            type="password"
            autoComplete="off"
            value={reglagesAppareil.cleGemini}
            onChange={(e) => modifierReglagesAppareil({ ...reglagesAppareil, cleGemini: e.target.value.trim() })}
          />
        </Champ>
        <Champ etiquette={t('reglages.modele')}>
          <input className="saisie" value={reglagesAppareil.modeleGemini} onChange={(e) => modifierReglagesAppareil({ ...reglagesAppareil, modeleGemini: e.target.value.trim() })} />
        </Champ>
        <button type="button" className="bouton bouton--doux" disabled={!reglagesAppareil.cleGemini} onClick={tester}>
          {t('reglages.tester')}
        </button>
        {essai && <p className="bulle bulle--statique">{essai}</p>}
      </section>

      <section className="carte">
        <h2>{t('reglages.sauvegarde')}</h2>
        <div className="barre-actions">
          <button type="button" className="bouton bouton--doux" onClick={exporter}>
            ⬇️ {t('reglages.exporter')}
          </button>
          {!synchro && (
            <button type="button" className="bouton bouton--doux" onClick={() => fichier.current?.click()}>
              ⬆️ {t('reglages.importer')}
            </button>
          )}
          <input
            ref={fichier}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importer(f);
              e.target.value = '';
            }}
          />
        </div>
        {erreurImport && <p className="message-doux">{t('reglages.importErreur')}</p>}
        <button
          type="button"
          className="bouton-lien bouton-lien--discret"
          onClick={() => {
            if (window.confirm(t(synchro ? 'reglages.confirmerQuitter' : 'reglages.confirmerEffacer'))) void app.quitter();
          }}
        >
          {t(synchro ? 'reglages.quitter' : 'reglages.effacer')}
        </button>
      </section>
    </div>
  );
}
