// L'interface principale : la maison, l'avatar et Rikki, et une seule
// prochaine action (ADR 0002). En mode 🪫, aucune tâche : juste de la
// présence (ADR 0012).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { activiteSelonHeure, momentSelonHeure, type ActiviteRikki } from '../compagnon/cycleDeVie';
import { parole } from '../compagnon/gemini';
import type { Situation } from '../compagnon/phrases';
import { ecarterTache, marquerFait, remettreTache } from '../domaine/foyer';
import { candidates } from '../domaine/prochaineAction';
import {
  accessoiresRikki,
  decorationsDebloquees,
  nouvellesRecompenses,
  tailleRikki,
} from '../domaine/progression';
import type { Energie, PieceId } from '../domaine/types';
import { useFoyer } from '../etat/contexte';
import { texteDans, type Cle } from '../i18n';
import { Avatar, type PoseAvatar } from '../ui/avatar/Avatar';
import { Toast, type Annonce } from '../ui/commun';
import { Maison } from '../ui/maison/Maison';
import { Rikki, type EtatRikki } from '../ui/rikki/Rikki';

const ENERGIES: { id: Energie; icone: string }[] = [
  { id: 'vide', icone: '🪫' },
  { id: 'normale', icone: '🔋' },
  { id: 'pleine', icone: '⚡' },
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

export function Accueil() {
  const app = useFoyer();
  const { foyer, membre, t, langue, session, energie, modifierFoyer, reglagesAppareil } = app;
  const maintenant = useMaintenant();
  const heure = new Date(maintenant).getHours();

  const [quandMeme, setQuandMeme] = useState(false);
  const [pose, setPose] = useState<PoseAvatar>('repos');
  const [joie, setJoie] = useState(false);
  const [bulle, setBulle] = useState('');
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [pieceVisitee, setPieceVisitee] = useState<PieceId | null>(null);
  const minuteurs = useRef<number[]>([]);
  const numeroParole = useRef(0);

  useEffect(() => () => minuteurs.current.forEach(clearTimeout), []);

  const energieDeclaree = session.energie !== undefined;
  const liste = useMemo(
    () =>
      energieDeclaree
        ? candidates(foyer, membre.id, energie, maintenant, { exclues: session.exclues, ignorerEcheance: quandMeme })
        : [],
    [foyer, membre.id, energie, maintenant, session.exclues, quandMeme, energieDeclaree],
  );
  const action = liste[0] ?? null;
  const toutRepousse =
    !action &&
    session.exclues.size > 0 &&
    candidates(foyer, membre.id, energie, maintenant, { ignorerEcheance: quandMeme }).length > 0;

  const activite = activiteSelonHeure(heure);
  const etatRikki: EtatRikki = joie ? 'joie' : energieDeclaree && energie === 'vide' ? 'calin' : activite;
  const poseAvatar: PoseAvatar = pose === 'fait' ? 'fait' : energieDeclaree && energie === 'vide' ? 'calin' : 'repos';

  // Rikki change de pièce avec la micro-étape (ADR 0019) ; sinon il suit sa journée.
  const pieceAuto = action?.tache.piece ?? (energie === 'vide' && energieDeclaree ? 'chambre' : PIECE_SELON_ACTIVITE[activite]);
  const piecesMaison = foyer.maison.pieces.length ? foyer.maison.pieces : (['salon'] as PieceId[]);
  const piece = pieceVisitee ?? (piecesMaison.includes(pieceAuto) ? pieceAuto : piecesMaison[0]);

  useEffect(() => setPieceVisitee(null), [action?.tache.id]);

  const dire = useCallback(
    (situation: Situation, geste?: string) => {
      const numero = ++numeroParole.current;
      const config = reglagesAppareil.cleGemini
        ? { cle: reglagesAppareil.cleGemini, modele: reglagesAppareil.modeleGemini }
        : null;
      void parole({ langue, situation, prenom: membre.prenom, nomRikki: membre.nomRikki, geste }, config).then((texte) => {
        if (numero === numeroParole.current) setBulle(texte);
      });
    },
    [langue, membre.prenom, membre.nomRikki, reglagesAppareil],
  );

  // Ce que dit Rikki quand le contexte change.
  useEffect(() => {
    if (!energieDeclaree) dire(activite === 'dort' ? 'dort' : 'accueil');
    else if (energie === 'vide') dire('pileVide');
  }, [energieDeclaree, energie, membre.id]);

  useEffect(() => {
    if (energieDeclaree && energie !== 'vide' && !action && !toutRepousse) dire('tranquille');
  }, [energieDeclaree, energie, action === null, toutRepousse]);

  const finAnnonce = useCallback(() => setAnnonce(null), []);

  const plusTard = (f: () => void, ms: number) => {
    minuteurs.current.push(window.setTimeout(f, ms));
  };

  const fait = () => {
    if (!action) return;
    const avant = foyer.compteur;
    const { foyer: suivant, tacheTerminee } = marquerFait(foyer, action.tache.id, membre.id, Date.now());
    modifierFoyer(() => suivant);
    setPose('fait');
    setJoie(true);
    plusTard(() => setPose('repos'), 1200);
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

  const declarer = (e: Energie | null) => {
    setQuandMeme(false);
    app.declarerEnergie(e);
  };

  return (
    <div className="ecran ecran-accueil">
      <Maison
        piece={piece}
        couleurMurs={foyer.maison.couleurMurs}
        moment={momentSelonHeure(heure)}
        decorations={decorationsDebloquees(foyer.compteur)}
      >
        {bulle && (
          <div className="bulle" key={bulle} aria-live="polite">
            {bulle}
          </div>
        )}
        <div className={`habitant habitant-avatar habitant-avatar--${poseAvatar}`}>
          <Avatar config={membre.avatar} pose={poseAvatar} titre={membre.prenom} />
        </div>
        <div className={`habitant habitant-rikki habitant-rikki--${etatRikki}`}>
          <Rikki etat={etatRikki} taille={tailleRikki(foyer.compteur)} accessoires={accessoiresRikki(foyer.compteur)} titre={membre.nomRikki} />
        </div>
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
                <span aria-hidden="true">💡</span> <strong>{t('action.aideMemoire')} :</strong>{' '}
                {texteDans(action.etape.aideMemoire, langue)}
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
