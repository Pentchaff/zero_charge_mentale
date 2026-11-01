import { describe, expect, it } from 'vitest';
import { rappelEnCours } from './rappels';
import type { Rappel } from './types';

const r: Rappel = { id: 'r', libelle: 'Rappel du matin', heure: '08:30', jours: [1, 2, 3, 4, 5], fuseau: 'Europe/Paris', actif: true };

describe('rappelEnCours', () => {
  it("s'affiche à partir de l'heure, pendant quelques heures", () => {
    expect(rappelEnCours(r, new Date(2026, 10, 2, 8, 29))).toBe(false); // lundi
    expect(rappelEnCours(r, new Date(2026, 10, 2, 8, 30))).toBe(true);
    expect(rappelEnCours(r, new Date(2026, 10, 2, 11, 29))).toBe(true);
    expect(rappelEnCours(r, new Date(2026, 10, 2, 11, 30))).toBe(false);
  });

  it('respecte les jours et la désactivation', () => {
    expect(rappelEnCours(r, new Date(2026, 10, 1, 9, 0))).toBe(false); // dimanche
    expect(rappelEnCours({ ...r, actif: false }, new Date(2026, 10, 2, 9, 0))).toBe(false);
  });
});
