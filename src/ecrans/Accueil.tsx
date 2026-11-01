// L'interface principale : la maison, l'avatar et Rikki, et une seule
// prochaine action (ADR 0002). En mode 🪫, aucune tâche : juste de la
// présence (ADR 0012). Quand l'autre membre a l'app ouverte, son avatar
// apparaît dans la pièce et l'on peut lui envoyer une émote (ADR 0011).

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { activiteSelonHeure, momentSelonHeure, type ActiviteRikki } from '../compagnon/cycleDeVie';
import { parole } from '../compagnon/gemini';
import type { Situation } from '../compagnon/phrases';
import { ecarterTache, marquerFait, remettreTache } from '../domaine/foyer';
import { candidates } from '../domaine/prochaineAction';
import { accessoiresRikki, decorationsDebloquees, nouvellesRecompenses, tailleRikki } from '../domaine/progression';
import type { Energie, Membre, PieceId, TypeEmote } from '../domaine/types';
import { useFoyer } from '../etat/contexte';
import { texteDans, type Cle } from '../i18n';
import { Avatar, type PoseAvatar } from '../ui/avatar/Avatar';
import { Toast, type Annonce } from '../ui/commun';
import { positionEcran } from '../ui/maison/iso';
import { Maison } from '../ui/maison/Maison';
import { Rikki, type EtatRikki } from '../ui/rikki/Rikki';
import { BandeauRappels } from './BandeauRappels';

const ENERGIES: { id: Energie; icone: string }[] = [
  { id: 'vide', icone: '🪫' },
  { id: 'normale', icone: '🔋' },
  { id: 'pleine', icone: '⚡' },
];

export const EMOTES: { id: TypeEmote; icone: string }[] = [
  { id: 'calin', icone: '🤗' },
  { id: 'bisou', icone: '😘' },
  { id: 'patpat', icone: '🫳' },
];

const PIECE_SELON_ACTIVITE: Record<ActiviteRikki, PieceId> = {
  dort: 'chambre',
  grignote: 'cuisine',
  fenetre: 'salon',
  eveille: 'salon',
};

/** L'heure courante, rafraîchie chaque minute (cycle de vie de Rikki). */
function useMaintenant(): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setMaintenant(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  return maintenant;
}

function styleSol(x: number, y: number): CSSProperties {
  const p = positionEcran(x, y);
  return { ...p, zIndex: Math.round(parseFloat(p.top) * 10) };
}

export function Accueil() {
  const app = useFoyer();
  const { foyer, membre, t, langue, session, energie, modifierFoyer, reglagesAppareil, enLigne, emoteRecue } = app;
  const maintenant = useMaintenant();
  const heure = new Date(maintenant).getHours();

  const [quandMeme, setQuandMeme] = useState(false);
  const [pose, setPose] = useState<PoseAvatar | null>(null);
  const [joie, setJoie] = useState(false);
  const [bulle, setBulle] = useState('');
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [pieceVisitee, setPieceVisitee] = useState<PieceId | null>(null);
  const [destinataire, setDestinataire] = useState<Membre | null>(null);
  const [envol, setEnvol] = useState<{ icone: string; cle: number; vers: 'autre' | 'moi' } | null>(null);
  const minuteurs = useRef<number[]>([]);
  const numeroParole = useRef(0);

  useEffect(() => () => minuteurs.current.forEach(clearTimeout), []);
  const plusTard = (f: () => void, ms: number) => {
    minuteurs.current.push(window.setTimeout(f, ms));
  };

  const autres = foyer.membres.filter((m) => m.id !== membre.id);
  const autresEnLigne = app.backend.mode === 'supabase' ? autres.filter((m) => enLigne.has(m.id)) : [];
  const autreVisible = autresEnLigne[0] ?? null;

  const energieDeclaree = session.energie !== undefined;
  const liste = useMemo(
    () => (energieDeclaree ? candidates(foyer, membre.id, energie, maintenant, { exclues: session.exclues, ignorerEcheance: quandMeme }) : []),
    [foyer, membre.id, energie, maintenant, session.exclues, quandMeme, energieDeclaree],
  );
  const action = liste[0] ?? null;
  const toutRepousse =
    !action && session.exclues.size > 0 && candidates(foyer, membre.id, energie, maintenant, { ignorerEcheance: quandMeme }).length > 0;

  const activite = activiteSelonHeure(heure);
  const modeRepos = energieDeclaree && energie === 'vide';
  const etatRikki: EtatRikki = joie ? 'joie' : modeRepos ? 'calin' : activite;
  const poseAvatar: PoseAvatar = pose ?? (modeRepos ? 'calin' : 'repos');

  // Rikki change de pièce avec la micro-étape (ADR 0019) ; sinon il suit sa journée.
  const pieceAuto = action?.tache.piece ?? (modeRepos ? 'chambre' : PIECE_SELON_ACTIVITE[activite]);
  const piecesMaison = foyer.maison.pieces.length ? foyer.maison.pieces : (['salon'] as PieceId[]);
  const piece = pieceVisitee ?? (piecesMaison.includes(pieceAuto) ? pieceAuto : piecesMaison[0]);

  useEffect(() => setPieceVisitee(null), [action?.tache.id]);

  const dire = useCallback(
    (situation: Situation, geste?: string) => {
      const numero = ++numeroParole.current;
      const config = reglagesAppareil.cleGemini ? { cle: reglagesAppareil.cleGemini, modele: reglagesAppareil.modeleGemini } : null;
      void parole({ langue, situation, prenom: membre.prenom, nomRikki: membre.nomRikki, geste }, config).then((texte) => {
        if (numero === numeroParole.current) setBulle(texte);
      });
    },
    [langue, membre.prenom, membre.nomRikki, reglagesAppareil],
  );

  useEffect(() => {
    if (!energieDeclaree) dire(activite === 'dort' ? 'dort' : 'accueil');
    else if (energie === 'vide') dire('pileVide');
  }, [energieDeclaree, energie, membre.id]);

  useEffect(() => {
    if (energieDeclaree && energie !== 'vide' && !action && !toutRepousse) dire('tranquille');
  }, [energieDeclaree, energie, action === null, toutRepousse]);

  // Une émote arrive : l'avatar la reçoit, Rikki la raconte.
  useEffect(() => {
    if (!emoteRecue) return;
    const de = foyer.membres.find((m) => m.id === emoteRecue.de);
    const icone = EMOTES.find((e) => e.id === emoteRecue.type)?.icone ?? '💕';
    numeroParole.current++;
    setBulle(t(`emote.recue.${emoteRecue.type}` as Cle, { de: de?.prenom ?? '' }));
    setPose('content');
    setEnvol({ icone, cle: Date.now(), vers: 'moi' });
    plusTard(() => setPose(null), 3500);
    plusTard(() => setEnvol(null), 3000);
    plusTard(app.oublierEmote, 3600);
  }, [emoteRecue]);

  const fait = () => {
    if (!action) return;
    const avant = foyer.compteur;
    const { foyer: suivant, tacheTerminee } = marquerFait(foyer, action.tache.id, membre.id, Date.now());
    modifierFoyer(() => suivant);
    setPose('fait');
    setJoie(true);
    plusTard(() => setPose(null), 1200);
    plusTard(() => setJoie(false), 1800);
    dire(tacheTerminee ? 'tacheTerminee' : 'fait', texteDans(action.etape.texte, langue));
    const gagnees = nouvellesRecompenses(avant, suivant.compteur);
    if (gagnees.length) {
      setAnnonce({
        id: Date.now(),
        texte: `✨ ${t('recompense.nouveau')} ${gagnees.map((r) => t(`recompense.${r.id}` as Cle)).join(', ')}`,
        duree: 4500,
      });
    }
  };

  const pasMaintenant = () => {
    if (!action) return;
    app.repousser(action.tache.id);
    dire('pasMaintenant');
  };

  const jamais = () => {
    if (!action) return;
    const id = action.tache.id;
    modifierFoyer((f) => ecarterTache(f, id));
    dire('ecartee');
    setAnnonce({
      id: Date.now(),
      texte: t('action.ecartee'),
      duree: 6000,
      action: { libelle: t('commun.annuler'), faire: () => modifierFoyer((f) => remettreTache(f, id)) },
    });
  };

  const envoyer = async (vers: Membre, type: TypeEmote) => {
    setDestinataire(null);
    const icone = EMOTES.find((e) => e.id === type)?.icone ?? '💕';
    setPose('calin');
    setEnvol({ icone, cle: Date.now(), vers: 'autre' });
    plusTard(() => setPose(null), 1500);
    plusTard(() => setEnvol(null), 1800);
    try {
      await app.envoyerEmote(vers.id, type);
      numeroParole.current++;
      setBulle(enLigne.has(vers.id) && app.backend.mode === 'supabase' ? t('emote.envoyee', { prenom: vers.prenom }) : t('emote.envoyeeHorsLigne', { prenom: vers.prenom }));
    } catch {
      setAnnonce({ id: Date.now(), texte: t('emote.echec'), duree: 4000 });
    }
  };

  const declarer = (e: Energie | null) => {
    setQuandMeme(false);
    app.declarerEnergie(e);
  };

  const finAnnonce = useCallback(() => setAnnonce(null), []);

  // Placement dans la pièce (unités isométriques). Avec l'autre membre, on se pousse un peu.
  const moi = autreVisible ? { x: 3.3, y: 6.1 } : { x: 3.8, y: 5.6 };
  const monRikki = autreVisible ? { x: 5.1, y: 6.7 } : { x: 5.6, y: 5.9 };
  const lui = { x: 6.8, y: 4.8 };
  const sonRikki = { x: 6.7, y: 3.5 };

  return (
    <div className="ecran ecran-accueil">
      <Maison piece={piece} couleurMurs={foyer.maison.couleurMurs} moment={momentSelonHeure(heure)} decorations={decorationsDebloquees(foyer.compteur)}>
        {bulle && (
          <div className="bulle" key={bulle} aria-live="polite">
            {bulle}
          </div>
        )}
        {autres.length > 0 && (
          <button type="button" className="bouton-emote" aria-label={t('emote.envoyer')} onClick={() => setDestinataire(autreVisible ?? autres[0])}>
            💌
          </button>
        )}
        <div className={`habitant habitant-avatar habitant--${poseAvatar}`} style={styleSol(moi.x, moi.y)}>
          <Avatar config={membre.avatar} pose={poseAvatar} titre={membre.prenom} />
        </div>
        <div className="habitant habitant-rikki" style={styleSol(monRikki.x, monRikki.y)}>
          <Rikki etat={etatRikki} taille={tailleRikki(foyer.compteur)} accessoires={accessoiresRikki(foyer.compteur)} titre={membre.nomRikki} />
        </div>
        {autreVisible && (
          <>
            <button
              type="button"
              className="habitant habitant-avatar habitant-autre"
              style={styleSol(lui.x, lui.y)}
              aria-label={t('emote.envoyerA', { prenom: autreVisible.prenom })}
              onClick={() => setDestinataire(autreVisible)}
            >
              <Avatar config={autreVisible.avatar} pose={emoteRecue?.de === autreVisible.id ? 'calin' : 'repos'} titre={autreVisible.prenom} />
              <span className="etiquette-prenom">{autreVisible.prenom}</span>
            </button>
            <div className="habitant habitant-rikki habitant-rikki--autre" style={styleSol(sonRikki.x, sonRikki.y)}>
              <Rikki etat={activite === 'dort' ? 'dort' : 'eveille'} taille={tailleRikki(foyer.compteur) * 0.85} accessoires={accessoiresRikki(foyer.compteur)} />
            </div>
          </>
        )}
        {envol && (
          <span
            key={envol.cle}
            className={`envol-emote envol-emote--${envol.vers === 'moi' ? 'recue' : autreVisible ? 'vers-autre' : 'envoyee'}`}
            style={envol.vers === 'moi' ? positionEcran(moi.x, moi.y, 3.2) : positionEcran(moi.x, moi.y, 3)}
            aria-hidden="true"
          >
            {envol.icone}
          </span>
        )}
      </Maison>

      {piecesMaison.length > 1 && (
        <div className="pieces" role="tablist">
          {piecesMaison.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={p === piece}
              className={p === piece ? 'piece-bouton piece-bouton--active' : 'piece-bouton'}
              onClick={() => setPieceVisitee(p)}
            >
              {t(`piece.${p}` as Cle)}
            </button>
          ))}
        </div>
      )}

      {destinataire && (
        <div className="carte carte-emotes" role="dialog" aria-label={t('emote.envoyerA', { prenom: destinataire.prenom })}>
          {autres.length > 1 && (
            <div className="puces">
              {autres.map((m) => (
                <button key={m.id} type="button" className={m.id === destinataire.id ? 'puce puce--active' : 'puce'} onClick={() => setDestinataire(m)}>
                  {m.prenom}
                </button>
              ))}
            </div>
          )}
          <p className="carte-emotes-titre">{t('emote.envoyerA', { prenom: destinataire.prenom })}</p>
          <div className="choix-emotes">
            {EMOTES.map((e) => (
              <button key={e.id} type="button" className="bouton-energie" onClick={() => void envoyer(destinataire, e.id)}>
                <span className="bouton-energie-icone" aria-hidden="true">
                  {e.icone}
                </span>
                <span>{t(`emote.${e.id}` as Cle)}</span>
              </button>
            ))}
          </div>
          <button type="button" className="bouton-lien" onClick={() => setDestinataire(null)}>
            {t('commun.fermer')}
          </button>
        </div>
      )}

      <BandeauRappels />

      <section className="zone-action">
        {!energieDeclaree ? (
          <div className="carte carte-energie">
            <h2>{t('energie.question')}</h2>
            <div className="choix-energie">
              {ENERGIES.map((e) => (
                <button key={e.id} type="button" className={`bouton-energie bouton-energie--${e.id}`} onClick={() => declarer(e.id)}>
                  <span className="bouton-energie-icone" aria-hidden="true">
                    {e.icone}
                  </span>
                  <span>{t(`energie.${e.id}` as Cle)}</span>
                </button>
              ))}
            </div>
            <button type="button" className="bouton-lien" onClick={() => declarer(null)}>
              {t('energie.passer')}
            </button>
          </div>
        ) : energie === 'vide' ? (
          <div className="carte carte-repos">
            <p className="carte-repos-titre">{t('action.pileVide')}</p>
            <p>{t('action.pileVideSous', { rikki: membre.nomRikki })}</p>
          </div>
        ) : action ? (
          <div className="carte carte-action" key={`${action.tache.id}-${action.index}`}>
            <p className="carte-action-tache">{texteDans(action.tache.nom, langue)}</p>
            <p className="carte-action-etape">{texteDans(action.etape.texte, langue)}</p>
            {action.etape.aideMemoire && texteDans(action.etape.aideMemoire, langue) && (
              <p className="aide-memoire">
                <span aria-hidden="true">💡</span> <strong>{t('action.aideMemoire')} :</strong> {texteDans(action.etape.aideMemoire, langue)}
              </p>
            )}
            <div className="carte-action-boutons">
              <button type="button" className="bouton bouton--fait" onClick={fait}>
                {t('action.fait')}
              </button>
              <button type="button" className="bouton bouton--doux" onClick={pasMaintenant}>
                {t('action.pasMaintenant')}
              </button>
            </div>
            <button type="button" className="bouton-lien bouton-lien--discret" onClick={jamais}>
              {t('action.jamais')}
            </button>
          </div>
        ) : toutRepousse ? (
          <div className="carte carte-repos">
            <p className="carte-repos-titre">{t('action.cestBien')}</p>
            <button type="button" className="bouton-lien" onClick={app.oublierRepoussees}>
              {t('action.revoir')}
            </button>
          </div>
        ) : (
          <div className="carte carte-repos">
            <p className="carte-repos-titre">{t('action.tranquille')}</p>
            <p>{t('action.tranquilleSous')}</p>
            {!quandMeme && (
              <button type="button" className="bouton-lien" onClick={() => setQuandMeme(true)}>
                {t('action.quandMeme')}
              </button>
            )}
          </div>
        )}

        {energieDeclaree && (
          <button type="button" className="bouton-lien bouton-energie-changer" onClick={app.redemanderEnergie}>
            {ENERGIES.find((e) => e.id === energie)?.icone} {t('energie.changer')}
          </button>
        )}
      </section>

      <Toast annonce={annonce} onFin={finAnnonce} />
    </div>
  );
}
