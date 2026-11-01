import { describe, expect, it } from 'vitest';
import type { MomentJournee } from '../../compagnon/cycleDeVie';
import type { Decoration } from '../../domaine/progression';
import type { PieceId, TypeEmote } from '../../domaine/types';
import {
  ACTIVITES,
  activitesPossibles,
  choisirActivite,
  dureeScript,
  gesteDeLaTache,
  marcher,
  placementDebout,
  POSTES,
  scriptActivite,
  scriptEmoteParRikki,
  scriptFait,
  scriptsEmoteEnDirect,
  type Placement,
} from './scene';

const PIECES: PieceId[] = ['salon', 'cuisine', 'chambre', 'salleDeBain'];
const MOMENTS: MomentJournee[] = ['matin', 'jour', 'soir', 'nuit'];
const EMOTES: TypeEmote[] = ['calin', 'bisou', 'patpat'];
const AUCUNE = new Set<Decoration>();

const dansLaPiece = (x: number, y: number) => x >= 0 && x <= 8 && y >= 0 && y <= 8;

describe('activités', () => {
  it('il y a toujours quelque chose de calme à faire, dans chaque pièce, à toute heure, sans décoration', () => {
    for (const piece of PIECES)
      for (const moment of MOMENTS) expect(activitesPossibles(piece, { moment, calme: true, decorations: AUCUNE }).length).toBeGreaterThan(0);
  });

  it('en mode 🪫, seulement des activités calmes', () => {
    const possibles = activitesPossibles('salon', { moment: 'jour', calme: true, decorations: new Set(['plante']) });
    expect(possibles.every((a) => a.calme)).toBe(true);
    expect(possibles.some((a) => a.id === 'danser')).toBe(false);
  });

  it('respecte l’heure et les décorations débloquées', () => {
    expect(activitesPossibles('salon', { moment: 'nuit', calme: false, decorations: AUCUNE }).some((a) => a.id === 'danser')).toBe(false);
    expect(activitesPossibles('salon', { moment: 'jour', calme: false, decorations: AUCUNE }).some((a) => a.id === 'arroser')).toBe(false);
    expect(activitesPossibles('salon', { moment: 'jour', calme: false, decorations: new Set(['plante']) }).some((a) => a.id === 'arroser')).toBe(true);
  });

  it('tous les points restent dans la pièce', () => {
    for (const a of ACTIVITES) {
      expect(dansLaPiece(a.sol.x, a.sol.y)).toBe(true);
      expect(dansLaPiece(a.rikki.x, a.rikki.y)).toBe(true);
      if (a.place) expect(dansLaPiece(a.place.x, a.place.y)).toBe(true);
    }
    for (const p of PIECES) expect(dansLaPiece(POSTES[p].x, POSTES[p].y)).toBe(true);
  });

  it('évite la précédente et celle de l’autre quand c’est possible', () => {
    const possibles = activitesPossibles('salon', { moment: 'jour', calme: false, decorations: AUCUNE });
    for (const h of [0, 0.3, 0.6, 0.99]) expect(choisirActivite(possibles, h, ['the', 'danser'])?.id).not.toMatch(/^(the|danser)$/);
    const seule = possibles.filter((a) => a.id === 'the');
    expect(choisirActivite(seule, 0.5, ['the'])?.id).toBe('the');
    expect(choisirActivite([], 0.5)).toBeNull();
  });

  it('on se lève avant de repartir, et l’on finit installé', () => {
    const lit = ACTIVITES.find((a) => a.id === 'lireCanape')!;
    const etapes = scriptActivite(placementDebout({ x: 7, y: 7 }), lit, 10_000);
    const fin = etapes[etapes.length - 1].perso;
    expect(fin.posture).toBe('assis');
    expect(fin.pose).toBe('lit');
    expect(etapes.some((e) => e.perso.pose === 'marche')).toBe(true);

    const assis: Placement = { ...fin };
    const repart = marcher(assis, { x: 2, y: 6 });
    expect(repart[0].perso.posture).toBe('debout');
    expect(repart[0].perso.x).toBe(lit.sol.x);
  });
});

describe('« Fait »', () => {
  it('l’avatar mime la micro-étape puis saute de joie', () => {
    const etapes = scriptFait(placementDebout({ x: 3, y: 3 }), 'vaisselle');
    expect(etapes.map((e) => e.perso.pose)).toEqual(['vaisselle', 'fait']);
  });

  it('le geste dépend du domaine et de la pièce', () => {
    expect(gesteDeLaTache('repas', 'cuisine')).toBe('cuisine');
    expect(gesteDeLaTache('linge', 'salleDeBain')).toBe('plie');
    expect(gesteDeLaTache('logement', 'cuisine')).toBe('vaisselle');
    expect(gesteDeLaTache('logement', 'salon')).toBe('balaie');
    expect(gesteDeLaTache('soins', 'salleDeBain')).toBe('brosse');
  });
});

describe('émotes', () => {
  const envoyeur = placementDebout({ x: 1.5, y: 6.5 });
  const receveur: Placement = { x: 5.1, y: 1.55, z: 0.42, sol: { x: 5.1, y: 2.7 }, pose: 'lit', cote: 'droite', posture: 'assis', duree: 0 };

  it('en direct, les deux scripts durent autant et les avatars se retrouvent côte à côte', () => {
    for (const type of EMOTES) {
      const s = scriptsEmoteEnDirect(type, envoyeur, receveur);
      expect(dureeScript(s.envoyeur)).toBe(dureeScript(s.receveur));
      const geste = s.envoyeur.find((e) => e.perso.pose !== 'marche' && e.perso.pose !== 'repos')!.perso;
      const enFace = s.receveur.find((e) => e.ms === 2800)!.perso;
      // Même profondeur à l'écran : x + y identiques.
      expect(geste.x + geste.y).toBeCloseTo(enFace.x + enFace.y, 5);
      // Ils se regardent.
      expect(geste.cote).not.toBe(enFace.cote);
      // Le receveur s'est levé du canapé.
      expect(enFace.posture).toBe('debout');
      // L'envoyeur rentre à sa place.
      const fin = s.envoyeur[s.envoyeur.length - 1].perso;
      expect([fin.x, fin.y]).toEqual([envoyeur.x, envoyeur.y]);
    }
  });

  it('le câlin est un vrai câlin : les deux avatars s’enlacent', () => {
    const s = scriptsEmoteEnDirect('calin', envoyeur, receveur);
    expect(s.envoyeur.some((e) => e.perso.pose === 'enlace')).toBe(true);
    expect(s.receveur.some((e) => e.perso.pose === 'enlace')).toBe(true);
  });

  it('sans l’autre, Rikki porte le geste et l’avatar finit debout et content', () => {
    for (const type of EMOTES)
      for (const sens of ['envoi', 'reception'] as const) {
        const etapes = scriptEmoteParRikki(type, receveur, sens);
        expect(etapes[0].perso.posture).toBe('debout');
        expect(etapes.some((e) => e.rikki?.etat !== undefined)).toBe(true);
        expect(etapes[etapes.length - 1].perso.pose).toBe('content');
      }
  });
});
