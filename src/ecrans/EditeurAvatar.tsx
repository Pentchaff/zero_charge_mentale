// Éditeur d'avatar, style Mii (ADR 0017) : un aperçu en grand, des onglets,
// et des vignettes qui montrent chaque option directement sur l'avatar.
// Pas de formulaire : on touche, on voit.

import { useState, type ReactNode } from 'react';
import {
  avatarAuHasard,
  BOUCHES,
  CHEVEUX,
  COIFFES,
  COIFFURES,
  COULEURS_TENUE,
  COULEURS_YEUX,
  LUNETTES,
  PEAUX,
  SOURCILS,
  TENUES,
  VISAGES,
  YEUX,
} from '../domaine/avatar';
import { coiffesDisponibles, lunettesDisponibles, tenuesDisponibles } from '../domaine/progression';
import type { AvatarConfig } from '../domaine/types';
import type { Cle, Traduire } from '../i18n';
import { Avatar } from '../ui/avatar/Avatar';

type Onglet = 'visage' | 'cheveux' | 'yeux' | 'bouche' | 'tenue' | 'accessoires';

const ONGLETS: { id: Onglet; icone: string }[] = [
  { id: 'visage', icone: '🙂' },
  { id: 'cheveux', icone: '💇' },
  { id: 'yeux', icone: '👀' },
  { id: 'bouche', icone: '👄' },
  { id: 'tenue', icone: '👕' },
  { id: 'accessoires', icone: '🎀' },
];

interface Props {
  valeur: AvatarConfig;
  onChange(a: AvatarConfig): void;
  /** Compteur du foyer, pour les options débloquées (ADR 0020). */
  compteur: number;
  t: Traduire;
}

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
  corpsEntier = false,
  t,
  titre,
}: {
  champ: K;
  options: readonly AvatarConfig[K][];
  valeur: AvatarConfig;
  onChange(a: AvatarConfig): void;
  corpsEntier?: boolean;
  t: Traduire;
  titre: string;
}) {
  return (
    <div className="ea-vignettes" role="radiogroup" aria-label={titre}>
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
            <Avatar config={essai} teteSeule={!corpsEntier} />
          </button>
        );
      })}
    </div>
  );
}

function Nuancier<K extends 'peau' | 'couleurCheveux' | 'couleurYeux' | 'couleurTenue'>({
  champ,
  couleurs,
  valeur,
  onChange,
  titre,
}: {
  champ: K;
  couleurs: readonly string[];
  valeur: AvatarConfig;
  onChange(a: AvatarConfig): void;
  titre: string;
}) {
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
          onClick={() => onChange({ ...valeur, [champ]: c })}
        />
      ))}
    </div>
  );
}

export function EditeurAvatar({ valeur, onChange, compteur, t }: Props) {
  const [onglet, setOnglet] = useState<Onglet>('visage');
  const coiffes = coiffesDisponibles(compteur, COIFFES);
  const lunettes = lunettesDisponibles(compteur, LUNETTES);
  const tenues = tenuesDisponibles(compteur, TENUES);
  const [rebond, setRebond] = useState(0);

  const changer = (a: AvatarConfig) => {
    onChange(a);
    setRebond((n) => n + 1);
  };
  const commun = { valeur, onChange: changer, t };

  return (
    <div className="editeur-avatar">
      <div className="ea-apercu">
        <div key={rebond} className="ea-apercu-avatar">
          <Avatar config={valeur} />
        </div>
        <button
          type="button"
          className="bouton bouton--doux ea-hasard"
          onClick={() => changer(avatarAuHasard({ coiffes, lunettes, tenues }))}
        >
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
              <Nuancier champ="peau" couleurs={PEAUX} titre={t('avatar.peau')} {...commun} />
            </Section>
            <Section titre={t('avatar.joues')}>
              <Vignettes champ="joues" options={[true, false]} titre={t('avatar.joues')} {...commun} />
            </Section>
          </>
        )}
        {onglet === 'cheveux' && (
          <>
            <Section titre={t('avatar.coiffure')}>
              <Vignettes champ="coiffure" options={COIFFURES} titre={t('avatar.coiffure')} {...commun} />
            </Section>
            <Section titre={t('avatar.couleur')}>
              <Nuancier champ="couleurCheveux" couleurs={CHEVEUX} titre={t('avatar.couleur')} {...commun} />
            </Section>
          </>
        )}
        {onglet === 'yeux' && (
          <>
            <Section titre={t('avatar.yeux')}>
              <Vignettes champ="yeux" options={YEUX} titre={t('avatar.yeux')} {...commun} />
            </Section>
            <Section titre={t('avatar.couleurYeux')}>
              <Nuancier champ="couleurYeux" couleurs={COULEURS_YEUX} titre={t('avatar.couleurYeux')} {...commun} />
            </Section>
            <Section titre={t('avatar.sourcils')}>
              <Vignettes champ="sourcils" options={SOURCILS} titre={t('avatar.sourcils')} {...commun} />
            </Section>
          </>
        )}
        {onglet === 'bouche' && (
          <Section titre={t('avatar.bouche')}>
            <Vignettes champ="bouche" options={BOUCHES} titre={t('avatar.bouche')} {...commun} />
          </Section>
        )}
        {onglet === 'tenue' && (
          <>
            <Section titre={t('avatar.tenue')}>
              <Vignettes champ="tenue" options={tenues} corpsEntier titre={t('avatar.tenue')} {...commun} />
            </Section>
            <Section titre={t('avatar.couleurTenue')}>
              <Nuancier champ="couleurTenue" couleurs={COULEURS_TENUE} titre={t('avatar.couleurTenue')} {...commun} />
            </Section>
          </>
        )}
        {onglet === 'accessoires' && (
          <>
            <Section titre={t('avatar.lunettes')}>
              <Vignettes champ="lunettes" options={lunettes} titre={t('avatar.lunettes')} {...commun} />
            </Section>
            <Section titre={t('avatar.coiffe')}>
              <Vignettes champ="coiffe" options={coiffes} titre={t('avatar.coiffe')} {...commun} />
            </Section>
          </>
        )}
        {(onglet === 'tenue' || onglet === 'accessoires') && (
          <p className="ea-nouveautes">✨ {t('avatar.nouveautes')}</p>
        )}
      </div>
    </div>
  );
}
