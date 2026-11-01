// Éditeur d'avatar, style Mii (ADR 0017) : un aperçu en grand, des onglets
// par partie du visage, des vignettes qui montrent chaque option directement
// sur l'avatar, et des curseurs pour la taille, la rotation, l'écart et la
// hauteur de chaque pièce. Pas de formulaire : on touche, on voit.

import { useState, type ReactNode } from 'react';
import {
  avatarAuHasard,
  BARBES,
  BOUCHES,
  CHEVEUX,
  COIFFES,
  COIFFURES,
  COULEURS_LEVRES,
  COULEURS_LUNETTES,
  COULEURS_TENUE,
  COULEURS_YEUX,
  LUNETTES,
  MOUSTACHES,
  NEZ,
  PEAUX,
  REGLAGES,
  SOURCILS,
  TENUES,
  VISAGES,
  YEUX,
  type ReglageNumerique,
} from '../domaine/avatar';
import { coiffesDisponibles, lunettesDisponibles, tenuesDisponibles } from '../domaine/progression';
import type { AvatarConfig } from '../domaine/types';
import type { Cle, Traduire } from '../i18n';
import { Avatar, type Cadrage } from '../ui/avatar/Avatar';

type Onglet = 'visage' | 'cheveux' | 'sourcils' | 'yeux' | 'nez' | 'bouche' | 'pilosite' | 'accessoires' | 'tenue';

const ONGLETS: { id: Onglet; icone: string }[] = [
  { id: 'visage', icone: '🙂' },
  { id: 'cheveux', icone: '💇' },
  { id: 'sourcils', icone: '〰️' },
  { id: 'yeux', icone: '👀' },
  { id: 'nez', icone: '👃' },
  { id: 'bouche', icone: '👄' },
  { id: 'pilosite', icone: '🧔' },
  { id: 'accessoires', icone: '👓' },
  { id: 'tenue', icone: '👕' },
];

interface Props {
  valeur: AvatarConfig;
  onChange(a: AvatarConfig): void;
  /** Compteur du foyer, pour les options débloquées (ADR 0020). */
  compteur: number;
  t: Traduire;
}

type Changer = (a: AvatarConfig) => void;

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="ea-section">
      <h3 className="ea-section-titre">{titre}</h3>
      {children}
    </section>
  );
}

function Vignettes<K extends keyof AvatarConfig>({
  champ,
  options,
  valeur,
  onChange,
  cadrage = 'tete',
  t,
  titre,
}: {
  champ: K;
  options: readonly AvatarConfig[K][];
  valeur: AvatarConfig;
  onChange: Changer;
  cadrage?: Cadrage;
  t: Traduire;
  titre: string;
}) {
  return (
    <div className={`ea-vignettes ea-vignettes--${cadrage}`} role="radiogroup" aria-label={titre}>
      {options.map((o, i) => {
        const essai = { ...valeur, [champ]: o };
        const actif = valeur[champ] === o;
        return (
          <button
            key={String(o)}
            type="button"
            role="radio"
            aria-checked={actif}
            aria-label={t('avatar.option', { n: i + 1 })}
            className={actif ? 'ea-vignette ea-vignette--active' : 'ea-vignette'}
            onClick={() => onChange(essai)}
          >
            <Avatar config={essai} cadrage={cadrage} />
          </button>
        );
      })}
    </div>
  );
}

type ChampCouleur = 'peau' | 'couleurCheveux' | 'couleurSourcils' | 'couleurYeux' | 'couleurLevres' | 'couleurLunettes' | 'couleurTenue';

function Nuancier({
  champs,
  couleurs,
  valeur,
  onChange,
  titre,
}: {
  /** Le premier champ est celui affiché ; les autres suivent (cheveux → sourcils). */
  champs: [ChampCouleur, ...ChampCouleur[]];
  couleurs: readonly string[];
  valeur: AvatarConfig;
  onChange: Changer;
  titre: string;
}) {
  const [champ] = champs;
  return (
    <div className="ea-nuancier" role="radiogroup" aria-label={titre}>
      {couleurs.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={valeur[champ] === c}
          aria-label={c}
          className={valeur[champ] === c ? 'ea-couleur ea-couleur--active' : 'ea-couleur'}
          style={{ background: c }}
          onClick={() => onChange({ ...valeur, ...Object.fromEntries(champs.map((k) => [k, c])) })}
        />
      ))}
    </div>
  );
}

const ICONES_REGLAGE: Record<string, string> = {
  Taille: '↕︎',
  Rotation: '↻',
  Ecart: '↔︎',
  Hauteur: '⇅',
  stature: '📏',
  corpulence: '⬌',
};

function Curseurs({
  champs,
  valeur,
  onChange,
  t,
}: {
  champs: ReglageNumerique[];
  valeur: AvatarConfig;
  onChange: Changer;
  t: Traduire;
}) {
  const modifie = champs.some((c) => valeur[c] !== REGLAGES[c].defaut);
  return (
    <div className="ea-curseurs">
      {champs.map((c) => {
        const r = REGLAGES[c];
        const suffixe = c.replace(/^(sourcils|yeux|nez|bouche)/, '');
        const cle = (suffixe === c ? `avatar.${c}` : `avatar.reglage.${suffixe}`) as Cle;
        return (
          <label key={c} className="ea-curseur">
            <span className="ea-curseur-etiquette">
              <span aria-hidden="true">{ICONES_REGLAGE[suffixe] ?? '•'}</span> {t(cle)}
            </span>
            <input
              type="range"
              min={r.min}
              max={r.max}
              step={r.pas}
              value={valeur[c]}
              onChange={(e) => onChange({ ...valeur, [c]: Number(e.target.value) })}
            />
          </label>
        );
      })}
      {modifie && (
        <button
          type="button"
          className="bouton-lien ea-reinitialiser"
          onClick={() => onChange({ ...valeur, ...Object.fromEntries(champs.map((c) => [c, REGLAGES[c].defaut])) })}
        >
          ↺ {t('avatar.reinitialiser')}
        </button>
      )}
    </div>
  );
}

function Interrupteur({ actif, onChange, libelle }: { actif: boolean; onChange(v: boolean): void; libelle: string }) {
  return (
    <button type="button" role="switch" aria-checked={actif} className={actif ? 'puce puce--active' : 'puce'} onClick={() => onChange(!actif)}>
      {libelle}
    </button>
  );
}

export function EditeurAvatar({ valeur, onChange, compteur, t }: Props) {
  const [onglet, setOnglet] = useState<Onglet>('visage');
  const coiffes = coiffesDisponibles(compteur, COIFFES);
  const lunettes = lunettesDisponibles(compteur, LUNETTES);
  const tenues = tenuesDisponibles(compteur, TENUES);
  const [rebond, setRebond] = useState(0);

  const changer: Changer = (a) => {
    onChange(a);
    setRebond((n) => n + 1);
  };
  const commun = { valeur, onChange: changer, t };
  const v = valeur;

  return (
    <div className="editeur-avatar">
      <div className="ea-apercu">
        <div key={rebond} className="ea-apercu-avatar">
          <Avatar config={valeur} />
        </div>
        <button type="button" className="bouton bouton--doux ea-hasard" onClick={() => changer(avatarAuHasard({ coiffes, lunettes, tenues }))}>
          🎲 {t('commun.auHasard')}
        </button>
      </div>

      <div className="ea-onglets" role="tablist">
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={onglet === o.id}
            className={onglet === o.id ? 'ea-onglet ea-onglet--actif' : 'ea-onglet'}
            onClick={() => setOnglet(o.id)}
          >
            <span aria-hidden="true">{o.icone}</span>
            <span className="ea-onglet-texte">{t(`avatar.onglet.${o.id}` as Cle)}</span>
          </button>
        ))}
      </div>

      <div className="ea-panneau" role="tabpanel">
        {onglet === 'visage' && (
          <>
            <Section titre={t('avatar.forme')}>
              <Vignettes champ="visage" options={VISAGES} titre={t('avatar.forme')} {...commun} />
            </Section>
            <Section titre={t('avatar.peau')}>
              <Nuancier champs={['peau']} couleurs={PEAUX} titre={t('avatar.peau')} {...commun} />
            </Section>
            <Section titre={t('avatar.traits')}>
              <div className="puces">
                <Interrupteur actif={v.joues} onChange={(joues) => changer({ ...v, joues })} libelle={t('avatar.joues')} />
                <Interrupteur actif={v.rousseur} onChange={(rousseur) => changer({ ...v, rousseur })} libelle={t('avatar.rousseur')} />
                <Interrupteur actif={v.grainDeBeaute} onChange={(grainDeBeaute) => changer({ ...v, grainDeBeaute })} libelle={t('avatar.grainDeBeaute')} />
              </div>
            </Section>
          </>
        )}
        {onglet === 'cheveux' && (
          <>
            <Section titre={t('avatar.coiffure')}>
              <Vignettes champ="coiffure" options={COIFFURES} titre={t('avatar.coiffure')} {...commun} />
            </Section>
            <Section titre={t('avatar.couleur')}>
              <Nuancier champs={['couleurCheveux', 'couleurSourcils']} couleurs={CHEVEUX} titre={t('avatar.couleur')} {...commun} />
            </Section>
            <div className="puces">
              <Interrupteur actif={v.coiffureMiroir} onChange={(coiffureMiroir) => changer({ ...v, coiffureMiroir })} libelle={`⇋ ${t('avatar.miroir')}`} />
            </div>
          </>
        )}
        {onglet === 'sourcils' && (
          <>
            <Section titre={t('avatar.sourcils')}>
              <Vignettes champ="sourcils" options={SOURCILS} cadrage="sourcils" titre={t('avatar.sourcils')} {...commun} />
            </Section>
            <Section titre={t('avatar.couleur')}>
              <Nuancier champs={['couleurSourcils']} couleurs={CHEVEUX} titre={t('avatar.couleur')} {...commun} />
            </Section>
            <Section titre={t('avatar.ajuster')}>
              <Curseurs champs={['sourcilsTaille', 'sourcilsRotation', 'sourcilsEcart', 'sourcilsHauteur']} {...commun} />
            </Section>
          </>
        )}
        {onglet === 'yeux' && (
          <>
            <Section titre={t('avatar.yeux')}>
              <Vignettes champ="yeux" options={YEUX} cadrage="yeux" titre={t('avatar.yeux')} {...commun} />
            </Section>
            <Section titre={t('avatar.couleurYeux')}>
              <Nuancier champs={['couleurYeux']} couleurs={COULEURS_YEUX} titre={t('avatar.couleurYeux')} {...commun} />
            </Section>
            <Section titre={t('avatar.ajuster')}>
              <Curseurs champs={['yeuxTaille', 'yeuxRotation', 'yeuxEcart', 'yeuxHauteur']} {...commun} />
            </Section>
          </>
        )}
        {onglet === 'nez' && (
          <>
            <Section titre={t('avatar.onglet.nez')}>
              <Vignettes champ="nez" options={NEZ} cadrage="nez" titre={t('avatar.onglet.nez')} {...commun} />
            </Section>
            <Section titre={t('avatar.ajuster')}>
              <Curseurs champs={['nezTaille', 'nezHauteur']} {...commun} />
            </Section>
          </>
        )}
        {onglet === 'bouche' && (
          <>
            <Section titre={t('avatar.bouche')}>
              <Vignettes champ="bouche" options={BOUCHES} cadrage="bouche" titre={t('avatar.bouche')} {...commun} />
            </Section>
            <Section titre={t('avatar.couleurLevres')}>
              <Nuancier champs={['couleurLevres']} couleurs={COULEURS_LEVRES} titre={t('avatar.couleurLevres')} {...commun} />
            </Section>
            <Section titre={t('avatar.ajuster')}>
              <Curseurs champs={['boucheTaille', 'boucheHauteur']} {...commun} />
            </Section>
          </>
        )}
        {onglet === 'pilosite' && (
          <>
            <Section titre={t('avatar.moustache')}>
              <Vignettes champ="moustache" options={MOUSTACHES} cadrage="bouche" titre={t('avatar.moustache')} {...commun} />
            </Section>
            <Section titre={t('avatar.barbe')}>
              <Vignettes champ="barbe" options={BARBES} cadrage="menton" titre={t('avatar.barbe')} {...commun} />
            </Section>
          </>
        )}
        {onglet === 'accessoires' && (
          <>
            <Section titre={t('avatar.lunettes')}>
              <Vignettes champ="lunettes" options={lunettes} cadrage="yeux" titre={t('avatar.lunettes')} {...commun} />
            </Section>
            <Section titre={t('avatar.couleurLunettes')}>
              <Nuancier champs={['couleurLunettes']} couleurs={COULEURS_LUNETTES} titre={t('avatar.couleurLunettes')} {...commun} />
            </Section>
            <Section titre={t('avatar.coiffe')}>
              <Vignettes champ="coiffe" options={coiffes} titre={t('avatar.coiffe')} {...commun} />
            </Section>
          </>
        )}
        {onglet === 'tenue' && (
          <>
            <Section titre={t('avatar.tenue')}>
              <Vignettes champ="tenue" options={tenues} cadrage="complet" titre={t('avatar.tenue')} {...commun} />
            </Section>
            <Section titre={t('avatar.couleurTenue')}>
              <Nuancier champs={['couleurTenue']} couleurs={COULEURS_TENUE} titre={t('avatar.couleurTenue')} {...commun} />
            </Section>
            <Section titre={t('avatar.corps')}>
              <Curseurs champs={['stature', 'corpulence']} {...commun} />
            </Section>
          </>
        )}
        {(onglet === 'tenue' || onglet === 'accessoires') && <p className="ea-nouveautes">✨ {t('avatar.nouveautes')}</p>}
      </div>
    </div>
  );
}
