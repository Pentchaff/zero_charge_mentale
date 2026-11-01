// Phrases pré-enregistrées de Rikki : le repli hors-ligne de Gemini (ADR 0009),
// et sa voix par défaut quand aucune clé n'est configurée.
// Jamais de temps écoulé, de compte, de reproche ni de pression (ADR 0001).

import type { Langue } from '../domaine/types';

export type Situation =
  | 'accueil'
  | 'fait'
  | 'tacheTerminee'
  | 'pasMaintenant'
  | 'ecartee'
  | 'pileVide'
  | 'tranquille'
  | 'dort';

export const PHRASES: Record<Langue, Record<Situation, readonly string[]>> = {
  fr: {
    accueil: ['Coucou {prenom} !', 'Je suis content de te voir.', 'On est bien, ici.', 'Hé, {prenom} !'],
    fait: ['Bien joué !', 'Youpi !', 'Ça, c’est fait.', 'Tu vois, c’était tout petit.', 'Merci pour la maison !'],
    tacheTerminee: ['Et voilà, c’est complètement fini !', 'Tout est fait, bravo !', 'Quelle équipe, nous deux !'],
    pasMaintenant: ['D’accord !', 'Pas de souci.', 'Ça marche.', 'On verra une autre fois.'],
    ecartee: ['Compris, on oublie celle-là.', 'Ok, une chose de moins à penser.'],
    pileVide: ['Je reste avec toi.', 'On se repose ensemble.', 'Tu n’as rien à faire. Moi non plus.', 'Je suis là.'],
    tranquille: ['Tout va bien.', 'On peut juste traîner un peu.', 'Je grignote, tu veux une noisette ?'],
    dort: ['Zzz…', 'Mmh… zzz…'],
  },
  ja: {
    accueil: ['やあ、{prenom}！', '会えてうれしいな。', 'ここ、いい感じだね。', 'おかえり、{prenom}！'],
    fait: ['やったね！', 'わーい！', 'できたね。', 'ほらね、ちょっとだけだったでしょ。', 'おうちのためにありがとう！'],
    tacheTerminee: ['ぜんぶできたよ！', 'おわり！すごいね！', 'いいチームだね、ぼくたち！'],
    pasMaintenant: ['いいよ！', '大丈夫だよ。', 'オッケー。', 'また今度ね。'],
    ecartee: ['わかった、それはもう忘れよう。', 'オッケー、考えることがひとつへったね。'],
    pileVide: ['そばにいるよ。', 'いっしょに休もう。', '何もしなくていいよ。ぼくもね。', 'ここにいるよ。'],
    tranquille: ['だいじょうぶ。', 'ちょっとのんびりしよう。', 'どんぐり食べる？'],
    dort: ['すやすや…', 'むにゃ… zzz…'],
  },
};

export function phraseAuHasard(
  langue: Langue,
  situation: Situation,
  variables: Record<string, string>,
  aleatoire: () => number = Math.random,
): string {
  const liste = PHRASES[langue][situation];
  let phrase = liste[Math.floor(aleatoire() * liste.length)];
  for (const [nom, valeur] of Object.entries(variables)) phrase = phrase.replaceAll(`{${nom}}`, valeur);
  return phrase;
}
