// Le foyer type : les tâches pré-remplies avec lesquelles le foyer démarre
// (ADR 0003), déjà décomposées en micro-étapes (ADR 0014), en français et en
// japonais (ADR 0015). L'ordre compte : à égalité d'urgence et d'ancienneté,
// la prochaine action suit cet ordre, qui commence par le plus doux.
//
// Pas de médicaments ici : un rappel de médicament est personnel et ajouté
// par le membre lui-même (ADR 0005, ADR 0006, ADR 0007).

import type { DomaineId, Effort, Frequence, MicroEtape, PieceId, Portee, Tache } from './types';

type Ligne = [effort: Effort, fr: string, ja: string];

function tache(
  id: string,
  nom: [fr: string, ja: string],
  domaine: DomaineId,
  piece: PieceId,
  frequence: Frequence,
  etapes: Ligne[],
  options: { jourEcheance?: number; portee?: Portee } = {},
): Tache {
  return {
    id: `ft-${id}`,
    nom: { fr: nom[0], ja: nom[1] },
    domaine,
    piece,
    frequence,
    jourEcheance: options.jourEcheance,
    portee: options.portee ?? { type: 'commun' },
    microEtapes: etapes.map(
      ([effort, fr, ja], i): MicroEtape => ({ id: `ft-${id}-${i + 1}`, effort, texte: { fr, ja } }),
    ),
    ecartee: false,
    avancement: {},
    origine: 'foyerType',
  };
}

const chacun: Portee = { type: 'chacun' };

export function creerFoyerType(): Tache[] {
  return [
    // Soins de base : personnels, chacun pour soi.
    tache('eau', ["Boire un verre d'eau", '水を一杯飲む'], 'soins', 'cuisine', 'quotidienne', [
      ['leger', "Remplir un verre d'eau et le boire", 'コップに水を入れて飲む'],
    ], { portee: chacun }),
    tache('dents', ['Se brosser les dents', '歯をみがく'], 'soins', 'salleDeBain', 'quotidienne', [
      ['leger', 'Mettre du dentifrice sur la brosse', '歯ブラシに歯みがき粉をつける'],
      ['leger', 'Se brosser les dents', '歯をみがく'],
    ], { portee: chacun }),
    tache('manger', ['Manger quelque chose', '何か食べる'], 'soins', 'cuisine', 'quotidienne', [
      ['leger', 'Prendre quelque chose à manger, même tout petit', '何か食べ物を取る（少しでも大丈夫）'],
      ['leger', 'Le manger tranquillement', 'ゆっくり食べる'],
    ], { portee: chacun }),
    tache('habiller', ["S'habiller", '着替える'], 'soins', 'chambre', 'quotidienne', [
      ['leger', 'Choisir un vêtement confortable', '楽な服を選ぶ'],
      ['leger', 'Le mettre', 'それを着る'],
    ], { portee: chacun }),
    tache('douche', ['Prendre une douche', 'シャワーを浴びる'], 'soins', 'salleDeBain', 'quotidienne', [
      ['leger', 'Préparer une serviette propre', 'きれいなタオルを用意する'],
      ['leger', "Faire couler l'eau chaude", 'お湯を出す'],
      ['moyen', 'Se laver', '体を洗う'],
      ['leger', "Se sécher et s'habiller confortablement", '体をふいて楽な服を着る'],
    ], { portee: chacun }),

    // Logement.
    tache('aerer', ['Aérer la chambre', '寝室の換気をする'], 'logement', 'chambre', 'quotidienne', [
      ['leger', 'Ouvrir la fenêtre de la chambre', '寝室の窓を開ける'],
      ['leger', 'Refermer la fenêtre un peu plus tard', '少ししたら窓を閉める'],
    ]),
    tache('rangerSalon', ['Ranger un peu le salon', 'リビングを少し片付ける'], 'logement', 'salon', 'quotidienne', [
      ['leger', 'Ramener les tasses à la cuisine', 'カップを台所に持っていく'],
      ['leger', 'Plier le plaid sur le canapé', 'ソファのブランケットをたたむ'],
      ['leger', 'Remettre trois objets à leur place', '物を3つ元の場所に戻す'],
    ]),
    tache('vaisselle', ['Faire la vaisselle', '食器を洗う'], 'logement', 'cuisine', 'quotidienne', [
      ['leger', "Rassembler la vaisselle sale près de l'évier", '汚れた食器をシンクに集める'],
      ['leger', "Remplir l'évier d'eau chaude savonneuse", 'シンクにお湯と洗剤をためる'],
      ['moyen', 'Laver les verres et les tasses', 'コップとカップを洗う'],
      ['moyen', 'Laver les assiettes et les couverts', 'お皿とカトラリーを洗う'],
      ['moyen', 'Laver les casseroles', '鍋を洗う'],
      ['leger', "Laisser sécher sur l'égouttoir", '水切りかごで乾かす'],
    ]),
    tache('poubelles', ['Sortir les poubelles', 'ゴミを出す'], 'logement', 'cuisine', 'hebdomadaire', [
      ['leger', 'Fermer le sac poubelle', 'ゴミ袋の口をしばる'],
      ['moyen', 'Descendre le sac aux poubelles', 'ゴミ袋をゴミ置き場に持っていく'],
      ['leger', 'Mettre un nouveau sac', '新しいゴミ袋をセットする'],
    ]),
    tache('salleDeBain', ['Nettoyer la salle de bain', 'お風呂場を掃除する'], 'logement', 'salleDeBain', 'hebdomadaire', [
      ['leger', 'Sortir le produit et un chiffon', '洗剤と布を用意する'],
      ['leger', 'Passer un coup de produit à vitre sur le miroir', '鏡にガラスクリーナーをかけて拭く'],
      ['leger', 'Essuyer le lavabo', '洗面台を拭く'],
      ['moyen', 'Nettoyer les toilettes', 'トイレを掃除する'],
      ['lourd', 'Frotter la baignoire ou la douche', '浴槽かシャワーをこする'],
      ['leger', 'Ranger le produit et le chiffon', '洗剤と布を片付ける'],
    ]),
    tache('aspirateur', ["Passer l'aspirateur", '掃除機をかける'], 'logement', 'salon', 'hebdomadaire', [
      ['leger', "Sortir l'aspirateur", '掃除機を出す'],
      ['leger', 'Ramasser ce qui traîne par terre', '床に落ちている物を拾う'],
      ['moyen', 'Aspirer le salon', 'リビングに掃除機をかける'],
      ['moyen', 'Aspirer la chambre', '寝室に掃除機をかける'],
      ['leger', "Ranger l'aspirateur", '掃除機を片付ける'],
    ]),
    tache('draps', ['Changer les draps', 'シーツを替える'], 'logement', 'chambre', 'mensuelle', [
      ['moyen', 'Enlever les draps du lit', 'ベッドからシーツをはがす'],
      ['leger', 'Mettre les draps sales dans le panier à linge', '汚れたシーツを洗濯かごに入れる'],
      ['leger', 'Prendre des draps propres', 'きれいなシーツを出す'],
      ['moyen', 'Mettre le drap housse', 'ボックスシーツをつける'],
      ['lourd', 'Mettre la housse de couette', '掛け布団カバーをつける'],
    ]),

    // Linge.
    tache('machine', ['Lancer une machine', '洗濯機を回す'], 'linge', 'salleDeBain', 'hebdomadaire', [
      ['leger', 'Rassembler le linge sale', '汚れた服を集める'],
      ['leger', 'Mettre le linge dans la machine', '洗濯物を洗濯機に入れる'],
      ['leger', 'Ajouter la lessive', '洗剤を入れる'],
      ['leger', 'Lancer le programme', 'スタートボタンを押す'],
    ]),
    tache('etendre', ['Étendre le linge', '洗濯物を干す'], 'linge', 'salleDeBain', 'hebdomadaire', [
      ['leger', 'Sortir le linge de la machine', '洗濯機から洗濯物を出す'],
      ['leger', "Installer l'étendoir", '物干しを用意する'],
      ['moyen', 'Étendre les vêtements', '服を干す'],
    ]),
    tache('plier', ['Plier et ranger le linge', '洗濯物をたたんでしまう'], 'linge', 'chambre', 'hebdomadaire', [
      ['leger', 'Décrocher le linge sec', '乾いた洗濯物を取り込む'],
      ['leger', 'Associer les chaussettes par paires', '靴下をペアにする'],
      ['moyen', 'Plier les t-shirts', 'Tシャツをたたむ'],
      ['moyen', "Ranger le linge dans l'armoire", '洗濯物をクローゼットにしまう'],
    ]),

    // Repas et courses.
    tache('repas', ['Préparer un repas simple', '簡単なごはんを作る'], 'repas', 'cuisine', 'quotidienne', [
      ['leger', 'Choisir quelque chose de simple à manger', '簡単に食べられるものを選ぶ'],
      ['leger', 'Sortir les ingrédients', '材料を出す'],
      ['moyen', 'Cuisiner ou réchauffer', '料理するか温める'],
      ['leger', "Mettre la vaisselle sale dans l'évier", '使った食器をシンクに置く'],
    ]),
    tache('frigo', ['Vérifier le frigo', '冷蔵庫をチェックする'], 'repas', 'cuisine', 'hebdomadaire', [
      ['leger', 'Jeter ce qui est périmé', '期限切れの物を捨てる'],
      ['leger', 'Essuyer une étagère du frigo', '冷蔵庫の棚を1段拭く'],
    ]),
    tache('listeCourses', ['Faire la liste de courses', '買い物リストを作る'], 'repas', 'cuisine', 'hebdomadaire', [
      ['leger', 'Ouvrir le frigo et regarder ce qui manque', '冷蔵庫を開けて足りない物を見る'],
      ['leger', 'Noter trois choses à acheter', '買う物を3つメモする'],
    ]),
    tache('courses', ['Faire les courses', '買い物に行く'], 'repas', 'cuisine', 'hebdomadaire', [
      ['leger', 'Prendre les sacs et la liste', '買い物袋とリストを持つ'],
      ['lourd', 'Aller au magasin et acheter ce qui est sur la liste', 'お店に行ってリストの物を買う'],
      ['moyen', 'Ranger les courses', '買った物をしまう'],
    ]),
  ];
}
