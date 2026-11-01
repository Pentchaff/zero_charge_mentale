// Rikki parle via l'API Gemini, appelée directement depuis le téléphone
// (ADR 0009). La clé est saisie par le membre et ne quitte pas l'appareil.
// Si Gemini ne répond pas vite, on retombe sur une phrase pré-enregistrée :
// Rikki ne doit jamais paraître cassé.

import type { Langue } from '../domaine/types';
import { phraseAuHasard, type Situation } from './phrases';

/**
 * Prompt système de Rikki. La v0 le garde dans le code ; il ira dans
 * Supabase avec la synchronisation (ADR 0009).
 */
export const PROMPT_SYSTEME = `Tu es Rikki, un petit écureuil qui vit dans la maison d'une personne et lui tient compagnie.
Tu es un ami bienveillant, jamais un coach.
Règles absolues :
- Une seule phrase courte (12 mots maximum en français, 30 caractères maximum en japonais).
- Jamais de référence au temps écoulé (« ça fait longtemps », « enfin », « déjà »).
- Jamais de nombre de tâches, de score, de retard, de reproche, de conseil ou de pression.
- Jamais de question qui demande un effort.
- Ton chaleureux, simple, un peu espiègle. Un emoji au maximum.
- Réponds dans la langue demandée : « fr » = français, « ja » = japonais familier et doux.
- Vocabulaire : on parle de « la maison », de « tâches » et de « petits gestes », pas de corvées.`;

const DESCRIPTION: Record<Situation, string> = {
  accueil: "La personne vient d'ouvrir l'app. Salue-la.",
  fait: 'La personne vient de faire un petit geste pour la maison. Réjouis-toi avec elle.',
  tacheTerminee: 'La personne vient de terminer une tâche entière. Fête-le doucement.',
  pasMaintenant: 'La personne ne veut pas faire ce qui était proposé. Rassure-la : aucun problème.',
  ecartee: 'La personne a décidé de ne jamais faire une certaine tâche. Accepte-le avec légèreté.',
  pileVide: "La personne n'a plus d'énergie. Elle n'a rien à faire. Sois une présence douce.",
  tranquille: "Il n'y a rien à faire pour l'instant. Dis une petite chose paisible.",
  dort: 'Tu dors. Murmure quelque chose dans ton sommeil.',
};

export interface ContexteParole {
  langue: Langue;
  situation: Situation;
  prenom: string;
  nomRikki: string;
  /** Texte de la micro-étape concernée, s'il y en a une. */
  geste?: string;
}

export interface ConfigGemini {
  cle: string;
  modele: string;
}

export async function demanderAGemini(
  contexte: ContexteParole,
  config: ConfigGemini,
  delaiMs = 4000,
): Promise<string> {
  const controle = new AbortController();
  const minuteur = setTimeout(() => controle.abort(), delaiMs);
  try {
    const reponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.modele)}:generateContent`,
      {
        method: 'POST',
        signal: controle.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.cle },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: PROMPT_SYSTEME.replaceAll('Rikki', contexte.nomRikki) }] },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: [
                    `Langue : ${contexte.langue}`,
                    `Prénom de la personne : ${contexte.prenom}`,
                    `Situation : ${DESCRIPTION[contexte.situation]}`,
                    contexte.geste ? `Petit geste concerné : ${contexte.geste}` : '',
                  ]
                    .filter(Boolean)
                    .join('\n'),
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.9, maxOutputTokens: 80 },
        }),
      },
    );
    if (!reponse.ok) throw new Error(`Gemini ${reponse.status}`);
    const json = (await reponse.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const texte = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
    if (!texte) throw new Error('Gemini : réponse vide');
    return texte.split('\n')[0];
  } finally {
    clearTimeout(minuteur);
  }
}

/** Ce que dit Rikki : Gemini si configuré et joignable, sinon une phrase pré-enregistrée. */
export async function parole(contexte: ContexteParole, config: ConfigGemini | null): Promise<string> {
  const repli = phraseAuHasard(contexte.langue, contexte.situation, { prenom: contexte.prenom });
  if (!config?.cle || (typeof navigator !== 'undefined' && !navigator.onLine)) return repli;
  try {
    return await demanderAGemini(contexte, config);
  } catch {
    return repli;
  }
}
