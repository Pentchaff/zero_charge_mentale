import { describe, expect, it } from 'vitest';
import { COIFFES } from './avatar';
import { coiffesDisponibles, nouvellesRecompenses, PALIERS, tailleRikki } from './progression';

describe('progression', () => {
  it('a des paliers strictement croissants', () => {
    for (let i = 1; i < PALIERS.length; i++) expect(PALIERS[i].seuil).toBeGreaterThan(PALIERS[i - 1].seuil);
  });

  it('entrelace les trois axes', () => {
    for (let i = 1; i < PALIERS.length; i++) expect(PALIERS[i].axe).not.toBe(PALIERS[i - 1].axe);
  });

  it('donne les récompenses franchies', () => {
    expect(nouvellesRecompenses(1, 2).map((r) => r.id)).toEqual(['maison:plante']);
    expect(nouvellesRecompenses(2, 3)).toEqual([]);
  });

  it('débloque les coiffes avec le compteur', () => {
    expect(coiffesDisponibles(0, COIFFES)).not.toContain('fleur');
    expect(coiffesDisponibles(5, COIFFES)).toContain('fleur');
  });

  it('fait grandir Rikki sans jamais le faire rétrécir', () => {
    let avant = tailleRikki(0);
    for (let c = 1; c < 500; c++) {
      const apres = tailleRikki(c);
      expect(apres).toBeGreaterThanOrEqual(avant);
      avant = apres;
    }
    expect(avant).toBeLessThan(1.1);
  });
});
