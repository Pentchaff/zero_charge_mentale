import { describe, expect, it } from 'vitest';
import { creerTraduire, texteDans } from './index';
import { fr } from './fr';
import { ja } from './ja';

describe('i18n', () => {
  it('a les mêmes clés en japonais et en français', () => {
    expect(Object.keys(ja).sort()).toEqual(Object.keys(fr).sort());
  });

  it('remplace les variables', () => {
    expect(creerTraduire('fr')('action.pileVideSous', { rikki: 'Noisette' })).toBe('Noisette est là, avec toi.');
  });

  it("retombe sur l'autre langue quand une traduction manque", () => {
    expect(texteDans({ fr: 'Arroser' }, 'ja')).toBe('Arroser');
    expect(texteDans({ fr: 'Arroser', ja: '水やり' }, 'ja')).toBe('水やり');
  });
});
