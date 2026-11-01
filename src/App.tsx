import { useState } from 'react';
import { Accueil } from './ecrans/Accueil';
import { EcranAvatar } from './ecrans/EcranAvatar';
import { EditeurTaches } from './ecrans/EditeurTaches';
import { Onboarding } from './ecrans/Onboarding';
import { AlerteStockage } from './ecrans/Persistance';
import { Reglages } from './ecrans/Reglages';
import { useApp, useFoyer } from './etat/contexte';
import type { Cle } from './i18n';
import { Avatar } from './ui/avatar/Avatar';
import { Rikki } from './ui/rikki/Rikki';

type Onglet = 'accueil' | 'avatar' | 'taches' | 'reglages';

const ONGLETS: Onglet[] = ['accueil', 'avatar', 'taches', 'reglages'];
const ICONES: Record<Onglet, string> = { accueil: '🏡', avatar: '🧑', taches: '📝', reglages: '⚙️' };

function Coquille() {
  const { foyer, membre, t, choisirMembre, backend, enLigne } = useFoyer();
  const [onglet, setOnglet] = useState<Onglet>('accueil');
  const local = backend.mode === 'local';
  const autres = foyer.membres.filter((m) => m.id !== membre.id);

  return (
    <div className="coquille">
      <header className="entete">
        <span className="entete-nom">{t('app.nom')}</span>
        <div className="entete-membres">
          {autres.map((m) => {
            const present = !local && enLigne.has(m.id);
            return (
              <button
                key={m.id}
                type="button"
                className={present ? 'entete-membre entete-membre--present' : 'entete-membre'}
                onClick={() => (local ? choisirMembre(m.id) : setOnglet('accueil'))}
                title={m.prenom}
                aria-label={local ? t('reglages.utiliserEnTantQue', { prenom: m.prenom }) : m.prenom}
              >
                <Avatar config={m.avatar} cadrage="tete" />
              </button>
            );
          })}
          <span className="entete-moi">
            <Avatar config={membre.avatar} cadrage="tete" />
            <span>{membre.prenom}</span>
          </span>
        </div>
      </header>

      <main className="contenu" key={`${membre.id}-${onglet}`}>
        {onglet === 'accueil' && <AlerteStockage t={t} astuce />}
        {onglet === 'accueil' && <Accueil />}
        {onglet === 'avatar' && <EcranAvatar />}
        {onglet === 'taches' && <EditeurTaches />}
        {onglet === 'reglages' && <Reglages />}
      </main>

      <nav className="navigation">
        {ONGLETS.map((o) => (
          <button
            key={o}
            type="button"
            className={o === onglet ? 'nav-bouton nav-bouton--actif' : 'nav-bouton'}
            aria-current={o === onglet ? 'page' : undefined}
            onClick={() => setOnglet(o)}
          >
            <span aria-hidden="true">{ICONES[o]}</span>
            <span>{t(`nav.${o}` as Cle)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export function App() {
  const { etat, erreur, foyer, membre, t } = useApp();
  if (etat === 'chargement') {
    return (
      <div className="ecran-attente">
        <Rikki etat="eveille" className="onboarding-rikki" />
      </div>
    );
  }
  if (etat === 'erreur') {
    return (
      <div className="ecran-attente">
        <Rikki etat="dort" className="onboarding-rikki" />
        <p className="carte-repos-titre">{t('erreur.demarrage')}</p>
        <p className="champ-aide">{erreur}</p>
        <button type="button" className="bouton bouton--principal" onClick={() => window.location.reload()}>
          {t('erreur.reessayer')}
        </button>
      </div>
    );
  }
  return foyer && membre ? <Coquille /> : <Onboarding />;
}
