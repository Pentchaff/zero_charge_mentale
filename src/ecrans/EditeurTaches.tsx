// Éditeur de tâches, pour l'aidant (ADR 0014, ADR 0016). C'est le seul
// endroit de l'app où les tâches apparaissent en liste : le membre qui
// utilise l'app au quotidien ne voit qu'une prochaine action à la fois.

import { useState } from 'react';
import { enregistrerTache, remettreTache, tacheVierge } from '../domaine/foyer';
import type { DomaineId, Tache } from '../domaine/types';
import { useFoyer } from '../etat/contexte';
import { texteDans, type Cle } from '../i18n';
import { EditeurTache } from './EditeurTache';

const DOMAINES: DomaineId[] = ['logement', 'linge', 'repas', 'soins'];
const ICONES: Record<DomaineId, string> = { logement: '🏠', linge: '🧺', repas: '🍙', soins: '🫧' };

export function EditeurTaches() {
  const { foyer, membre, t, langue, modifierFoyer } = useFoyer();
  const [enCours, setEnCours] = useState<Tache | null>(null);
  const [voirEcartees, setVoirEcartees] = useState(false);

  if (enCours) {
    return (
      <EditeurTache
        tache={enCours}
        estNouvelle={!foyer.taches.some((x) => x.id === enCours.id)}
        onEnregistrer={(tache) => {
          modifierFoyer((f) => enregistrerTache(f, tache));
          setEnCours(null);
        }}
        onAnnuler={() => setEnCours(null)}
      />
    );
  }

  const actives = foyer.taches.filter((x) => !x.ecartee);
  const ecartees = foyer.taches.filter((x) => x.ecartee);

  const resume = (x: Tache) => {
    const morceaux = [
      t(`frequence.${x.frequence}` as Cle),
      x.microEtapes.length === 1 ? t('taches.uneEtape') : t('taches.nbEtapes', { n: x.microEtapes.length }),
    ];
    if (x.portee.type === 'chacun') morceaux.push(t('taches.pourChacun'));
    if (x.portee.type === 'membre') {
      const portee = x.portee;
      const qui = foyer.membres.find((m) => m.id === portee.membreId);
      if (qui) morceaux.push(t('taches.seulement', { prenom: qui.prenom }));
    }
    return morceaux.join(' · ');
  };

  return (
    <div className="ecran ecran-taches">
      <h1>{t('taches.titre')}</h1>
      <p className="intro">{t('taches.intro')}</p>

      <button type="button" className="bouton bouton--principal bouton--large" onClick={() => setEnCours(membre.estAidant ? tacheVierge() : { ...tacheVierge(), portee: { type: 'membre', membreId: membre.id } })}>
        ＋ {t('taches.nouvelle')}
      </button>

      {DOMAINES.map((d) => {
        const liste = actives.filter((x) => x.domaine === d);
        if (liste.length === 0) return null;
        return (
          <section key={d} className="groupe-taches">
            <h2>
              <span aria-hidden="true">{ICONES[d]}</span> {t(`domaine.${d}` as Cle)}
            </h2>
            <ul className="liste-taches">
              {liste.map((x) => (
                <li key={x.id}>
                  <button type="button" className="ligne-tache" onClick={() => setEnCours(x)}>
                    <span className="ligne-tache-nom">{texteDans(x.nom, langue)}</span>
                    <span className="ligne-tache-resume">{resume(x)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {ecartees.length > 0 && (
        <section className="groupe-taches groupe-taches--ecartees">
          <button type="button" className="bouton-lien" onClick={() => setVoirEcartees((v) => !v)} aria-expanded={voirEcartees}>
            {voirEcartees ? '▾' : '▸'} {t('taches.ecartees')} ({ecartees.length})
          </button>
          {voirEcartees && (
            <ul className="liste-taches">
              {ecartees.map((x) => (
                <li key={x.id} className="ligne-ecartee">
                  <span>{texteDans(x.nom, langue)}</span>
                  <button type="button" className="bouton bouton--doux" onClick={() => modifierFoyer((f) => remettreTache(f, x.id))}>
                    {t('taches.remettre')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
