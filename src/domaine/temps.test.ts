import { describe, expect, it } from 'vitest';
import { ajouterJours, debutDuJour, estDue, prochaineEcheance } from './temps';

// Mardi 3 novembre 2026, 10 h (heure locale).
const MARDI = new Date(2026, 10, 3, 10).getTime();
const jour = (n: number) => debutDuJour(ajouterJours(MARDI, n));

describe('prochaineEcheance', () => {
  it("rend une tâche jamais faite due aujourd'hui", () => {
    expect(prochaineEcheance('quotidienne', undefined, undefined, MARDI)).toBe(jour(0));
    expect(prochaineEcheance('hebdomadaire', undefined, undefined, MARDI)).toBe(jour(0));
  });

  it("attend le jour d'échéance pour une tâche jamais faite", () => {
    // Jeudi = 4.
    expect(prochaineEcheance('hebdomadaire', 4, undefined, MARDI)).toBe(jour(2));
    expect(prochaineEcheance('hebdomadaire', 2, undefined, MARDI)).toBe(jour(0));
  });

  it('remet une tâche quotidienne au lendemain', () => {
    expect(prochaineEcheance('quotidienne', undefined, MARDI, MARDI)).toBe(jour(1));
  });

  it('remet une tâche hebdomadaire sept jours plus tard', () => {
    expect(prochaineEcheance('hebdomadaire', undefined, MARDI, MARDI)).toBe(jour(7));
  });

  it("tolère une tâche hebdomadaire faite un peu en avance ou en retard", () => {
    // Échéance le mardi. Faite le lundi (en avance) ou le mercredi (en retard) :
    // la prochaine échéance est le mardi suivant le plus proche.
    expect(prochaineEcheance('hebdomadaire', 2, jour(-1), MARDI)).toBe(jour(7));
    expect(prochaineEcheance('hebdomadaire', 2, jour(1), MARDI)).toBe(jour(7));
    expect(prochaineEcheance('hebdomadaire', 2, jour(0), MARDI)).toBe(jour(7));
  });

  it("gère le quantième d'une tâche mensuelle", () => {
    const le15 = new Date(2026, 10, 15, 9).getTime();
    expect(prochaineEcheance('mensuelle', 15, le15, le15)).toBe(new Date(2026, 11, 15).getTime());
    expect(prochaineEcheance('mensuelle', 15, undefined, MARDI)).toBe(new Date(2026, 10, 15).getTime());
  });
});

describe('estDue', () => {
  it("considère due une échéance passée ou aujourd'hui", () => {
    expect(estDue(jour(-3), MARDI)).toBe(true);
    expect(estDue(jour(0), MARDI)).toBe(true);
    expect(estDue(jour(1), MARDI)).toBe(false);
  });
});
