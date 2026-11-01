import { describe, expect, it } from 'vitest';
import { AVATAR_PAR_DEFAUT } from '../domaine/avatar';
import { creerFoyer, marquerFait, modifierMembre } from '../domaine/foyer';
import type { Membre } from '../domaine/types';
import { assemblerFoyer, differences, estVide, ligneDepuisMembre, ligneDepuisTache } from './lignes';

const membre: Membre = { id: 'u1', prenom: 'A', langue: 'fr', estAidant: true, avatar: AVATAR_PAR_DEFAUT, nomRikki: 'Rikki' };

describe('differences', () => {
  it('ne trouve rien entre deux états identiques', () => {
    const f = creerFoyer(membre, 0);
    expect(estVide(differences(f, f))).toBe(true);
  });

  it('isole un avancement et le compteur après « Fait »', () => {
    const f = creerFoyer(membre, 0);
    const { foyer: g } = marquerFait(f, 'ft-vaisselle', 'u1', 1000);
    const d = differences(f, g);
    expect(d.compteur).toBe(1);
    expect(d.taches).toEqual([]);
    expect(d.avancements).toEqual([{ tacheId: 'ft-vaisselle', cle: 'commun', avancement: { etape: 1 } }]);
  });

  it('isole un membre modifié', () => {
    const f = creerFoyer(membre, 0);
    const g = modifierMembre(f, 'u1', { prenom: 'B' });
    expect(differences(f, g).membres.map((m) => m.prenom)).toEqual(['B']);
  });
});

describe('assemblerFoyer', () => {
  it('reconstruit le foyer depuis les lignes', () => {
    const f = creerFoyer(membre, 0);
    const t = f.taches[0];
    const r = assemblerFoyer(
      { id: 'f1', cree_le: '2026-11-01T00:00:00Z', compteur: 3, maison: f.maison, code_invitation: 'ABCD1234' },
      [ligneDepuisMembre(membre, 'f1')],
      [ligneDepuisTache(t, 'f1', 0)],
      [{ foyer_id: 'f1', tache_id: t.id, cle: 'u1', etape: 0, derniere_fois: 42, maj_le: 0 }],
    );
    expect(r.compteur).toBe(3);
    expect(r.codeInvitation).toBe('ABCD1234');
    expect(r.taches[0].avancement).toEqual({ u1: { etape: 0, derniereFois: 42 } });
    expect(r.membres[0].avatar.version).toBe(2);
  });
});
