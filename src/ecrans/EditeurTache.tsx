// Formulaire d'une tâche : nom, domaine, pièce, fréquence, jour d'échéance,
// pour qui, et la liste ordonnée des micro-étapes avec effort et aide-mémoire.
// Chaque texte s'écrit dans la langue de l'aidant, avec une traduction
// facultative dans l'autre langue (ADR 0015).

import { useState } from 'react';
import { nouvelId } from '../domaine/foyer';
import type { DomaineId, Effort, Frequence, Langue, MicroEtape, PieceId, Portee, Tache, Texte } from '../domaine/types';
import { useFoyer } from '../etat/contexte';
import { autreLangue, type Cle } from '../i18n';
import { Champ, Puces } from '../ui/commun';

const DOMAINES: DomaineId[] = ['logement', 'linge', 'repas', 'soins'];
const PIECES: PieceId[] = ['salon', 'cuisine', 'chambre', 'salleDeBain'];
const FREQUENCES: Frequence[] = ['quotidienne', 'hebdomadaire', 'mensuelle'];
const EFFORTS: Effort[] = ['leger', 'moyen', 'lourd'];
const JOURS_SEMAINE = [1, 2, 3, 4, 5, 6, 0];
const ICONE_EFFORT: Record<Effort, string> = { leger: '🪶', moyen: '🧺', lourd: '🪨' };

interface Props {
  tache: Tache;
  estNouvelle: boolean;
  onEnregistrer(t: Tache): void;
  onAnnuler(): void;
}

function TexteBilingue({
  valeur,
  onChange,
  langue,
  etiquette,
  exemple,
  etiquetteTraduction,
  multiligne = false,
}: {
  valeur: Texte | undefined;
  onChange(t: Texte): void;
  langue: Langue;
  etiquette: string;
  exemple: string;
  etiquetteTraduction: string;
  multiligne?: boolean;
}) {
  const autre = autreLangue(langue);
  const v = valeur ?? {};
  const Saisie = multiligne ? 'textarea' : 'input';
  return (
    <div className="texte-bilingue">
      <Champ etiquette={etiquette}>
        <Saisie
          className="saisie"
          lang={langue}
          value={v[langue] ?? ''}
          placeholder={exemple}
          onChange={(e) => onChange({ ...v, [langue]: e.target.value })}
        />
      </Champ>
      <Champ etiquette={etiquetteTraduction}>
        <Saisie
          className="saisie saisie--traduction"
          lang={autre}
          value={v[autre] ?? ''}
          onChange={(e) => onChange({ ...v, [autre]: e.target.value })}
        />
      </Champ>
    </div>
  );
}

const estVide = (t: Texte | undefined) => !t?.fr?.trim() && !t?.ja?.trim();

function nettoyer(t: Texte | undefined): Texte | undefined {
  if (!t) return undefined;
  const propre: Texte = {};
  if (t.fr?.trim()) propre.fr = t.fr.trim();
  if (t.ja?.trim()) propre.ja = t.ja.trim();
  return Object.keys(propre).length ? propre : undefined;
}

export function EditeurTache({ tache, estNouvelle, onEnregistrer, onAnnuler }: Props) {
  const { foyer, t, langue } = useFoyer();
  const [brouillon, setBrouillon] = useState<Tache>(tache);
  const [erreur, setErreur] = useState<string | null>(null);

  const maj = (modif: Partial<Tache>) => setBrouillon((b) => ({ ...b, ...modif }));
  const majEtape = (i: number, modif: Partial<MicroEtape>) =>
    setBrouillon((b) => ({ ...b, microEtapes: b.microEtapes.map((e, j) => (j === i ? { ...e, ...modif } : e)) }));
  const deplacer = (i: number, delta: number) =>
    setBrouillon((b) => {
      const liste = [...b.microEtapes];
      const j = i + delta;
      if (j < 0 || j >= liste.length) return b;
      [liste[i], liste[j]] = [liste[j], liste[i]];
      return { ...b, microEtapes: liste };
    });
  const retirer = (i: number) => setBrouillon((b) => ({ ...b, microEtapes: b.microEtapes.filter((_, j) => j !== i) }));
  const ajouter = () =>
    setBrouillon((b) => ({ ...b, microEtapes: [...b.microEtapes, { id: nouvelId('etape'), texte: {}, effort: 'leger' }] }));

  const traduction = t('tache.traduction');

  // « Pour qui ? » : pot commun, chacun pour soi, ou un membre précis (ADR 0016).
  const optionsPortee = ['commun', 'chacun', ...foyer.membres.map((m) => `membre:${m.id}`)];
  const porteeActuelle =
    brouillon.portee.type === 'membre' ? `membre:${brouillon.portee.membreId}` : brouillon.portee.type;
  const choisirPortee = (v: string) => {
    const portee: Portee = v.startsWith('membre:')
      ? { type: 'membre', membreId: v.slice('membre:'.length) }
      : { type: v as 'commun' | 'chacun' };
    maj({ portee });
  };
  const libellePortee = (v: string) => {
    if (v === 'commun') return t('tache.commun');
    if (v === 'chacun') return t('tache.chacun');
    const m = foyer.membres.find((x) => `membre:${x.id}` === v);
    return t('tache.seulement', { prenom: m?.prenom ?? '?' });
  };

  const enregistrer = (ecartee = brouillon.ecartee) => {
    const nom = nettoyer(brouillon.nom);
    if (!nom) return setErreur(t('tache.erreurNom'));
    const microEtapes = brouillon.microEtapes
      .filter((e) => !estVide(e.texte))
      .map((e) => ({ ...e, texte: nettoyer(e.texte) ?? {}, aideMemoire: nettoyer(e.aideMemoire) }));
    if (microEtapes.length === 0) return setErreur(t('tache.erreurEtape'));
    onEnregistrer({ ...brouillon, nom, microEtapes, ecartee });
  };

  return (
    <div className="ecran ecran-tache">
      <div className="barre-titre">
        <button type="button" className="bouton-lien" onClick={onAnnuler}>
          ‹ {t('commun.retour')}
        </button>
        <h1>{estNouvelle ? t('tache.titreNouvelle') : t('tache.titreModifier')}</h1>
      </div>

      <TexteBilingue
        valeur={brouillon.nom}
        onChange={(nom) => maj({ nom })}
        langue={langue}
        etiquette={t('tache.nom')}
        exemple={t('tache.nomExemple')}
        etiquetteTraduction={traduction}
      />

      <Champ etiquette={t('tache.domaine')}>
        <Puces options={DOMAINES} valeur={brouillon.domaine} onChange={(domaine) => maj({ domaine })} libelle={(d) => t(`domaine.${d}` as Cle)} />
      </Champ>

      <Champ etiquette={t('tache.piece')}>
        <Puces options={PIECES} valeur={brouillon.piece} onChange={(piece) => maj({ piece })} libelle={(p) => t(`piece.${p}` as Cle)} />
      </Champ>

      <Champ etiquette={t('tache.frequence')}>
        <Puces
          options={FREQUENCES}
          valeur={brouillon.frequence}
          onChange={(frequence) => maj({ frequence, jourEcheance: undefined })}
          libelle={(f) => t(`frequence.${f}` as Cle)}
        />
      </Champ>

      {brouillon.frequence === 'hebdomadaire' && (
        <Champ etiquette={t('tache.jour')}>
          <Puces
            options={[-1, ...JOURS_SEMAINE]}
            valeur={brouillon.jourEcheance ?? -1}
            onChange={(j) => maj({ jourEcheance: j === -1 ? undefined : j })}
            libelle={(j) => (j === -1 ? t('tache.aucunJour') : t(`jour.${j}` as Cle))}
          />
        </Champ>
      )}
      {brouillon.frequence === 'mensuelle' && (
        <Champ etiquette={t('tache.jour')}>
          <select
            className="saisie"
            value={brouillon.jourEcheance ?? ''}
            onChange={(e) => maj({ jourEcheance: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">{t('tache.aucunJour')}</option>
            {Array.from({ length: 28 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {t('tache.quantieme', { n })}
              </option>
            ))}
          </select>
        </Champ>
      )}

      <Champ etiquette={t('tache.pourQui')}>
        <Puces options={optionsPortee} valeur={porteeActuelle} onChange={choisirPortee} libelle={libellePortee} />
      </Champ>

      <section className="etapes">
        <h2>{t('tache.etapes')}</h2>
        <p className="champ-aide">{t('tache.etapesAide')}</p>
        <ol className="liste-etapes">
          {brouillon.microEtapes.map((e, i) => (
            <li key={e.id} className="carte-etape">
              <div className="carte-etape-entete">
                <span className="carte-etape-numero">{i + 1}</span>
                <div className="carte-etape-outils">
                  <button type="button" className="icone" aria-label={t('tache.monter')} disabled={i === 0} onClick={() => deplacer(i, -1)}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className="icone"
                    aria-label={t('tache.descendre')}
                    disabled={i === brouillon.microEtapes.length - 1}
                    onClick={() => deplacer(i, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="icone"
                    aria-label={t('tache.retirerEtape')}
                    disabled={brouillon.microEtapes.length === 1}
                    onClick={() => retirer(i)}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <TexteBilingue
                valeur={e.texte}
                onChange={(texte) => majEtape(i, { texte })}
                langue={langue}
                etiquette={t('tache.geste')}
                exemple={t('tache.etapeExemple')}
                etiquetteTraduction={traduction}
              />
              <Champ etiquette={t('tache.effort')}>
                <Puces
                  options={EFFORTS}
                  valeur={e.effort}
                  onChange={(effort) => majEtape(i, { effort })}
                  libelle={(f) => `${ICONE_EFFORT[f]} ${t(`effort.${f}` as Cle)}`}
                />
              </Champ>
              {e.aideMemoire !== undefined ? (
                <TexteBilingue
                  valeur={e.aideMemoire}
                  onChange={(aideMemoire) => majEtape(i, { aideMemoire })}
                  langue={langue}
                  etiquette={`💡 ${t('tache.aideMemoire')}`}
                  exemple={t('tache.aideMemoireExemple')}
                  etiquetteTraduction={traduction}
                  multiligne
                />
              ) : (
                <button type="button" className="bouton-lien" onClick={() => majEtape(i, { aideMemoire: {} })}>
                  💡 ＋ {t('tache.aideMemoire')}
                </button>
              )}
            </li>
          ))}
        </ol>
        <button type="button" className="bouton bouton--doux bouton--large" onClick={ajouter}>
          ＋ {t('tache.ajouterEtape')}
        </button>
      </section>

      {erreur && (
        <p className="message-doux" role="alert">
          {erreur}
        </p>
      )}

      <div className="barre-actions">
        <button type="button" className="bouton bouton--principal" onClick={() => enregistrer()}>
          {t('commun.enregistrer')}
        </button>
        <button type="button" className="bouton bouton--doux" onClick={onAnnuler}>
          {t('commun.annuler')}
        </button>
      </div>

      {!estNouvelle && !brouillon.ecartee && (
        <button type="button" className="bouton-lien bouton-lien--discret" onClick={() => enregistrer(true)}>
          {t('tache.ecarter')}
        </button>
      )}
    </div>
  );
}
