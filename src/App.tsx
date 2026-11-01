import { useEffect, useState } from 'react';
import { Accueil } from './ecrans/Accueil';
import { EcranAvatar } from './ecrans/EcranAvatar';
import { EditeurTaches } from './ecrans/EditeurTaches';
import { Onboarding } from './ecrans/Onboarding';
import { Reglages } from './ecrans/Reglages';
import { useApp, useFoyer } from './etat/contexte';
import type { Cle } from './i18n';
import { Avatar } from './ui/avatar/Avatar';

type Onglet = 'accueil' | 'avatar' | 'taches' | 'reglages';

const ICONES: Record<Onglet, string> = { accueil: '🏡', avatar: '🧑', taches: '📝', reglages: '⚙️' };

function Coquille() {
  const { foyer, membre, t, choisirMembre } = useFoyer();
  const [onglet, setOnglet] = useState<Onglet>('accueil');
  // L'éditeur de tâches est l'outil de l'aidant (ADR 0014).
  const onglets: Onglet[] = membre.estAidant ? ['accueil', 'avatar', 'taches', 'reglages'] : ['accueil', 'avatar', 'reglages'];

  useEffect(() => {
    if (!onglets.includes(onglet)) setOnglet('accueil');
  }, [membre.id, membre.estAidant]);

  const autres = foyer.membres.filter((m) => m.id !== membre.id);

  return (
    <div className="coquille">
      <header className="entete">
        <span className="entete-nom">{t('app.nom')}</span>
        <div className="entete-membres">
          {autres.map((m) => (
            <button key={m.id} type="button" className="entete-membre" onClick={() => choisirMembre(m.id)} title={m.prenom}>
              <Avatar config={m.avatar} teteSeule />
            </button>
          ))}
          <span className="entete-moi">
            <Avatar config={membre.avatar} teteSeule />
            <span>{membre.prenom}</span>
          </span>
        </div>
      </header>

      <main className="contenu" key={`${membre.id}-${onglet}`}>
        {onglet === 'accueil' && <Accueil />}
        {onglet === 'avatar' && <EcranAvatar />}
        {onglet === 'taches' && <EditeurTaches />}
        {onglet === 'reglages' && <Reglages />}
      </main>

      <nav className="navigation">
        {onglets.map((o) => (
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
  const { foyer, membre } = useApp();
  return foyer && membre ? <Coquille /> : <Onboarding />;
}
