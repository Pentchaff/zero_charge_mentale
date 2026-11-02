import { describe, expect, it } from 'vitest';
import { navigateurIntegre } from './persistance';

describe('navigateurIntegre', () => {
  it('reconnaît les navigateurs des messageries', () => {
    expect(navigateurIntegre('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/14.10.0')).toBe(true);
    expect(navigateurIntegre('Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Mobile/15E148 [FBAN/FBIOS;FBAV/450.0]')).toBe(true);
    expect(navigateurIntegre('Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36')).toBe(true);
  });

  it('laisse tranquilles Safari et Chrome', () => {
    expect(navigateurIntegre('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1')).toBe(false);
    expect(navigateurIntegre('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36')).toBe(false);
  });
});
