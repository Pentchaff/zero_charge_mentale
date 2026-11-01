import { describe, expect, it } from 'vitest';
import { AVATAR_PAR_DEFAUT, avatarAuHasard, COIFFES, LUNETTES, normaliserAvatar, REGLAGES, TENUES } from './avatar';

describe('normaliserAvatar', () => {
  it("complète un avatar de la première version sans perdre ses choix", () => {
    const v1 = { visage: 'ovale', peau: '#efbb94', coiffure: 'longue', couleurCheveux: '#7a4b2a', yeux: 'amande', bouche: 'chat', lunettes: 'rondes', tenue: 'pull' };
    const a = normaliserAvatar(v1);
    expect(a.version).toBe(2);
    expect(a.coiffure).toBe('longue');
    expect(a.yeux).toBe('amande');
    expect(a.couleurSourcils).toBe('#7a4b2a'); // suit la couleur des cheveux
    expect(a.yeuxTaille).toBe(1);
  });

  it('remplace les valeurs inconnues et borne les réglages', () => {
    const a = normaliserAvatar({ coiffure: 'perruque', yeuxTaille: 99, peau: 'rouge' });
    expect(a.coiffure).toBe(AVATAR_PAR_DEFAUT.coiffure);
    expect(a.yeuxTaille).toBe(REGLAGES.yeuxTaille.max);
    expect(a.peau).toBe(AVATAR_PAR_DEFAUT.peau);
  });

  it('accepte n’importe quoi', () => {
    expect(normaliserAvatar(null)).toEqual(AVATAR_PAR_DEFAUT);
  });
});

describe('avatarAuHasard', () => {
  it('ne donne que des options disponibles et des réglages neutres', () => {
    const disponibles = { coiffes: COIFFES.slice(0, 3), lunettes: LUNETTES.slice(0, 2), tenues: TENUES.slice(0, 2) };
    for (let i = 0; i < 50; i++) {
      const a = avatarAuHasard(disponibles);
      expect(['aucune', ...disponibles.coiffes]).toContain(a.coiffe);
      expect(disponibles.tenues).toContain(a.tenue);
      expect(a.yeuxEcart).toBe(0);
      expect(normaliserAvatar(a)).toEqual(a);
    }
  });
});
