import { describe, expect, it } from 'vitest';
import { AVATAR_PAR_DEFAUT } from './avatar';
import { creerFoyer, ecarterTache, marquerFait } from './foyer';
import { prochaineAction } from './prochaineAction';
import type { Foyer, Membre, Tache } from './types';

const MAINTENANT = new Date(2026, 10, 3, 10).getTime();

function membre(id: string): Membre {
  return { id, prenom: id, langue: 'fr', estAidant: id === 'a', avatar: AVATAR_PAR_DEFAUT, nomRikki: 'Rikki' };
}

function t(id: string, efforts: Tache['microEtapes'][number]['effort'][], extra: Partial<Tache> = {}): Tache {
  return {
    id,
    nom: { fr: id },
    domaine: 'logement',
    piece: 'salon',
    frequence: 'quotidienne',
    portee: { type: 'commun' },
    microEtapes: efforts.map((effort, i) => ({ id: `${id}-${i}`, effort, texte: { fr: `${id} ${i}` } })),
    ecartee: false,
    avancement: {},
    origine: 'foyer',
    ...extra,
  };
}

function foyerAvec(taches: Tache[]): Foyer {
  return { ...creerFoyer(membre('a'), MAINTENANT), membres: [membre('a'), membre('b')], taches };
}

describe('prochaineAction', () => {
  it('ne propose rien en mode 🪫', () => {
    const foyer = foyerAvec([t('x', ['leger'])]);
    expect(prochaineAction(foyer, 'a', 'vide', MAINTENANT)).toBeNull();
  });

  it("respecte effort ≤ énergie", () => {
    const foyer = foyerAvec([t('lourde', ['lourd']), t('legere', ['leger'])]);
    expect(prochaineAction(foyer, 'a', 'normale', MAINTENANT)?.tache.id).toBe('legere');
    expect(prochaineAction(foyer, 'a', 'pleine', MAINTENANT)?.tache.id).toBe('lourde');
  });

  it("préfère l'échéance la plus proche, puis la plus ancienne", () => {
    const hier = MAINTENANT - 86_400_000;
    const ilYaTroisJours = MAINTENANT - 3 * 86_400_000;
    const foyer = foyerAvec([
      t('recente', ['leger'], { avancement: { commun: { etape: 0, derniereFois: hier } } }),
      t('ancienne', ['leger'], { avancement: { commun: { etape: 0, derniereFois: ilYaTroisJours } } }),
    ]);
    expect(prochaineAction(foyer, 'a', 'normale', MAINTENANT)?.tache.id).toBe('ancienne');
  });

  it("n'est pas due si elle a été faite aujourd'hui, sauf si on en demande quand même", () => {
    const foyer = foyerAvec([t('x', ['leger'], { avancement: { commun: { etape: 0, derniereFois: MAINTENANT } } })]);
    expect(prochaineAction(foyer, 'a', 'normale', MAINTENANT)).toBeNull();
    expect(prochaineAction(foyer, 'a', 'normale', MAINTENANT, { ignorerEcheance: true })?.tache.id).toBe('x');
  });

  it('« Pas maintenant » passe à une autre tâche', () => {
    const foyer = foyerAvec([t('x', ['leger']), t('y', ['leger'])]);
    const exclues = new Set(['x']);
    expect(prochaineAction(foyer, 'a', 'normale', MAINTENANT, { exclues })?.tache.id).toBe('y');
  });

  it('propose les micro-étapes une par une, dans l’ordre', () => {
    let foyer = foyerAvec([t('x', ['leger', 'leger', 'leger'])]);
    expect(prochaineAction(foyer, 'a', 'normale', MAINTENANT)?.index).toBe(0);
    foyer = marquerFait(foyer, 'x', 'a', MAINTENANT).foyer;
    expect(prochaineAction(foyer, 'a', 'normale', MAINTENANT)?.index).toBe(1);
    // L'autre membre reprend là où le premier s'est arrêté (pot commun).
    expect(prochaineAction(foyer, 'b', 'normale', MAINTENANT)?.index).toBe(1);
  });

  it('termine la tâche après la dernière micro-étape', () => {
    let foyer = foyerAvec([t('x', ['leger', 'leger'])]);
    foyer = marquerFait(foyer, 'x', 'a', MAINTENANT).foyer;
    const r = marquerFait(foyer, 'x', 'a', MAINTENANT);
    expect(r.tacheTerminee).toBe(true);
    expect(r.foyer.compteur).toBe(2);
    expect(prochaineAction(r.foyer, 'a', 'normale', MAINTENANT)).toBeNull();
  });

  it('suit une tâche personnelle séparément pour chaque membre', () => {
    let foyer = foyerAvec([t('dents', ['leger'], { portee: { type: 'chacun' } })]);
    foyer = marquerFait(foyer, 'dents', 'a', MAINTENANT).foyer;
    expect(prochaineAction(foyer, 'a', 'normale', MAINTENANT)).toBeNull();
    expect(prochaineAction(foyer, 'b', 'normale', MAINTENANT)?.tache.id).toBe('dents');
  });

  it('ne propose une tâche réservée qu’à son membre', () => {
    const foyer = foyerAvec([t('poubelles', ['leger'], { portee: { type: 'membre', membreId: 'a' } })]);
    expect(prochaineAction(foyer, 'a', 'normale', MAINTENANT)?.tache.id).toBe('poubelles');
    expect(prochaineAction(foyer, 'b', 'normale', MAINTENANT)).toBeNull();
  });

  it('ne propose plus une tâche écartée', () => {
    const foyer = ecarterTache(foyerAvec([t('x', ['leger'])]), 'x');
    expect(prochaineAction(foyer, 'a', 'pleine', MAINTENANT, { ignorerEcheance: true })).toBeNull();
  });

  it('démarre le foyer type sur une micro-étape légère', () => {
    const foyer = creerFoyer(membre('a'), MAINTENANT);
    const action = prochaineAction(foyer, 'a', 'normale', MAINTENANT);
    expect(action?.etape.effort).toBe('leger');
  });
});
