// L'interface principale : la maison, l'avatar et Rikki, et une seule
// prochaine action (ADR 0002). En mode 🪫, aucune tâche : juste de la
// présence (ADR 0012). Quand l'autre membre a l'app ouverte, son avatar
// apparaît dans la pièce et l'on peut lui envoyer une émote (ADR 0011).
// Les personnages vivent dans la maison (activités, marche) et les émotes
// se jouent entre eux (ADR 0026) : voir ui/maison/scene.ts.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { activiteSelonHeure, momentSelonHeure, type ActiviteRikki } from '../compagnon/cycleDeVie';
import { parole } from '../compagnon/gemini';
import type { Situation } from '../compagnon/phrases';
import { ecarterTache, marquerFait, remettreTache } from '../domaine/foyer';
import { candidates } from '../domaine/prochaineAction';
import { accessoiresRikki, decorationsDebloquees, nouvellesRecompenses, tailleRikki } from '../domaine/progression';
import type { Energie, Membre, PieceId, TypeEmote } from '../domaine/types';
import { useFoyer } from '../etat/contexte';
import { texteDans, type Cle } from '../i18n';
import { Toast, type Annonce } from '../ui/commun';
import { EffetScene, HabitantAvatar, HabitantRikki } from '../ui/maison/Habitants';
import { Maison } from '../ui/maison/Maison';
import {
  activitesPossibles,
  choisirActivite,
  dureeScript,
  ENTREE,
  gesteDeLaTache,
  placementDebout,
  POSTES,
  scriptActivite,
  scriptAttente,
  scriptEmoteParRikki,
  scriptFait,
  scriptsEmoteEnDirect,
  type Etape,
  type IdActivite,
  type Placement,
} from '../ui/maison/scene';
import { useActeur, type EtatActeur } from '../ui/maison/useActeur';
import type { EtatRikki } from '../ui/rikki/Rikki';
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

/** Un personnage qui entre dans la pièce par le bord, côté spectateur. */
function departEntree(): EtatActeur {
  const p = placementDebout(ENTREE);
  return { perso: p, rikki: { x: ENTREE.x + 0.4, y: ENTREE.y - 0.6, z: 0, duree: 0 }, effet: null };
}

function entrer(): Etape {
  const d = departEntree();
  return { perso: d.perso, rikki: d.rikki, ms: 30 };
}

/** Durée d'une activité : assez pour qu'on la voie vivre, assez court pour que la maison bouge. */
function dureeActivite(): number {
  return 11_000 + Math.round(Math.random() * 9_000);
}

export function Accueil() {
  const app = useFoyer();
  const { foyer, membre, t, langue, session, energie, modifierFoyer, reglagesAppareil, enLigne, emoteRecue } = app;
  const maintenant = useMaintenant();
  const heure = new Date(maintenant).getHours();

  const [quandMeme, setQuandMeme] = useState(false);
  const [bulle, setBulle] = useState('');
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [pieceVisitee, setPieceVisitee] = useState<PieceId | null>(null);
  // Pendant un geste (« Fait », émote), on reste dans la pièce même si la micro-étape suivante est ailleurs.
  const [pieceRetenue, setPieceRetenue] = useState<PieceId | null>(null);
  const [destinataire, setDestinataire] = useState<Membre | null>(null);
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
  const moment = momentSelonHeure(heure);
  const modeRepos = energieDeclaree && energie === 'vide';
  const etatRikki: EtatRikki = modeRepos ? 'calin' : activite;
  const decorations = useMemo(() => decorationsDebloquees(foyer.compteur), [foyer.compteur]);

  // Rikki change de pièce avec la micro-étape (ADR 0019) ; sinon il suit sa journée.
  const pieceAuto = action?.tache.piece ?? (modeRepos ? 'chambre' : PIECE_SELON_ACTIVITE[activite]);
  const piecesMaison = foyer.maison.pieces.length ? foyer.maison.pieces : (['salon'] as PieceId[]);
  const piece = pieceVisitee ?? pieceRetenue ?? (piecesMaison.includes(pieceAuto) ? pieceAuto : piecesMaison[0]);
  // Une micro-étape de cette pièce est proposée : l'avatar attend à son poste, prêt.
  const auPoste = action !== null && action.tache.piece === piece;

  useEffect(() => setPieceVisitee(null), [action?.tache.id]);

  // ---------------------------------------------------------------- Mise en scène

  // Ce que les acteurs lisent quand ils choisissent la suite (toujours à jour).
  const contexte = useRef({ piece, auPoste, calme: modeRepos, moment, decorations });
  contexte.current = { piece, auPoste, calme: modeRepos, moment, decorations };
  const activiteMoi = useRef<IdActivite | null>(null);
  const activiteAutre = useRef<IdActivite | null>(null);
  // Pendant un geste (émote, « Fait »), rien ne vient l'interrompre.
  const occupeJusqua = useRef(0);

  const prochaineActivite = (depuis: Placement, mienne: { current: IdActivite | null }, autre: { current: IdActivite | null }): Etape[] => {
    const c = contexte.current;
    const possibles = activitesPossibles(c.piece, { moment: c.moment, calme: c.calme, decorations: c.decorations });
    const choisie = choisirActivite(possibles, Math.random(), [mienne.current, autre.current].filter((a): a is IdActivite => a !== null));
    mienne.current = choisie?.id ?? null;
    return choisie ? scriptActivite(depuis, choisie, dureeActivite()) : scriptAttente(depuis, POSTES[c.piece], 20_000);
  };

  const moi = useActeur(departEntree, (depuis) =>
    contexte.current.auPoste ? scriptAttente(depuis, POSTES[contexte.current.piece], 60_000) : prochaineActivite(depuis, activiteMoi, activiteAutre),
  );
  // L'autre n'a plus l'app ouverte : son avatar ne joue plus rien (il n'est plus affiché).
  const autreLa = useRef(false);
  autreLa.current = autreVisible !== null;
  const lui = useActeur(departEntree, (depuis) =>
    autreLa.current ? prochaineActivite(depuis, activiteAutre, activiteMoi) : [{ perso: depuis, ms: 60_000 }],
  );

  /** Un geste commence : rien ne l'interrompt, et l'on reste dans la pièce jusqu'à sa fin. */
  const occuper = (etapes: Etape[]) => {
    const duree = dureeScript(etapes);
    occupeJusqua.current = Date.now() + duree;
    setPieceRetenue(piece);
    plusTard(() => {
      if (Date.now() >= occupeJusqua.current - 50) setPieceRetenue(null);
    }, duree);
  };

  // Changement de pièce : on y entre par le bord. Sinon, on reprend la suite là où l'on est.
  const pieceJouee = useRef<PieceId | null>(null);
  useEffect(() => {
    const nouvellePiece = pieceJouee.current !== piece;
    pieceJouee.current = piece;
    if (nouvellePiece) {
      occupeJusqua.current = 0;
      activiteMoi.current = null;
      moi.jouer([entrer()]);
      if (autreVisible) lui.jouer([entrer()]);
      return;
    }
    if (Date.now() < occupeJusqua.current) return;
    activiteMoi.current = null;
    moi.jouer([]);
  }, [piece, auPoste, modeRepos, action?.tache.id]);

  // L'autre ouvre l'app : son avatar entre dans la pièce.
  useEffect(() => {
    if (!autreVisible) return;
    activiteAutre.current = null;
    lui.jouer([entrer()]);
  }, [autreVisible?.id]);

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

  /** Joue une émote : entre les deux avatars si l'autre est là, sinon avec Rikki. */
  const jouerEmote = (type: TypeEmote, sens: 'envoi' | 'reception', enDirect: boolean) => {
    if (enDirect) {
      const scripts =
        sens === 'envoi' ? scriptsEmoteEnDirect(type, moi.ici(), lui.ici()) : scriptsEmoteEnDirect(type, lui.ici(), moi.ici());
      const [miens, siens] = sens === 'envoi' ? [scripts.envoyeur, scripts.receveur] : [scripts.receveur, scripts.envoyeur];
      occuper(miens);
      moi.jouer(miens);
      lui.jouer(siens);
    } else {
      const etapes = scriptEmoteParRikki(type, moi.ici(), sens);
      occuper(etapes);
      moi.jouer(etapes);
    }
  };

  // Une émote arrive : elle se joue dans la maison, Rikki la raconte.
  useEffect(() => {
    if (!emoteRecue) return;
    const de = foyer.membres.find((m) => m.id === emoteRecue.de);
    numeroParole.current++;
    setBulle(t(`emote.recue.${emoteRecue.type}` as Cle, { de: de?.prenom ?? '' }));
    jouerEmote(emoteRecue.type, 'reception', autreVisible !== null && emoteRecue.de === autreVisible.id);
    plusTard(app.oublierEmote, 3600);
  }, [emoteRecue]);

  const fait = () => {
    if (!action) return;
    const avant = foyer.compteur;
    const { foyer: suivant, tacheTerminee } = marquerFait(foyer, action.tache.id, membre.id, Date.now());
    const etapes = scriptFait(moi.ici(), gesteDeLaTache(action.tache.domaine, action.tache.piece));
    occuper(etapes);
    moi.jouer(etapes);
    modifierFoyer(() => suivant);
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
    jouerEmote(type, 'envoi', autreVisible !== null && vers.id === autreVisible.id);
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

  const taille = tailleRikki(foyer.compteur);
  const accessoires = useMemo(() => accessoiresRikki(foyer.compteur), [foyer.compteur]);

  return (
    <div className="ecran ecran-accueil">
      <Maison piece={piece} couleurMurs={foyer.maison.couleurMurs} moment={moment} decorations={decorations}>
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
        <HabitantAvatar placement={moi.etat.perso} config={membre.avatar} titre={membre.prenom} />
        <HabitantRikki placement={moi.etat.rikki} etat={etatRikki} taille={taille} accessoires={accessoires} titre={membre.nomRikki} />
        {moi.etat.effet && <EffetScene key={moi.etat.effet.cle} effet={moi.etat.effet} />}
        {autreVisible && (
          <>
            <HabitantAvatar
              placement={lui.etat.perso}
              config={autreVisible.avatar}
              titre={autreVisible.prenom}
              etiquette={autreVisible.prenom}
              libelle={t('emote.envoyerA', { prenom: autreVisible.prenom })}
              onClick={() => setDestinataire(autreVisible)}
            />
            <HabitantRikki placement={lui.etat.rikki} etat={activite === 'dort' ? 'dort' : 'eveille'} taille={taille * 0.85} accessoires={accessoires} autre />
            {lui.etat.effet && <EffetScene key={lui.etat.effet.cle} effet={lui.etat.effet} />}
          </>
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
