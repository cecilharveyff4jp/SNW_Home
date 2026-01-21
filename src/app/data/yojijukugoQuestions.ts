// 四字熟語クイズ用の型定義
export type YojijukugoQuestion = {
  id: number;
  kanji: string;
  correct: string;
  wrong1: string;
  wrong2: string;
  meaning: string;
};

// 四字熟語クイズ用の問題データ（30問）
export const YOJIJUKUGO_QUESTIONS: YojijukugoQuestion[] = [
  { id: 1, kanji: "一期一会", correct: "いちごいちえ", wrong1: "いっきいっかい", wrong2: "いっきいちえ", meaning: "一生に一度だけの出会い。その機会を大切にすべきという教え" },
  { id: 2, kanji: "四面楚歌", correct: "しめんそか", wrong1: "よんめんそか", wrong2: "しめんそうか", meaning: "周囲が敵や反対者ばかりで、孤立無援の状態" },
  { id: 3, kanji: "一心不乱", correct: "いっしんふらん", wrong1: "いっしんふみだれ", wrong2: "いっしんぶらん", meaning: "一つのことに心を集中して、他のことに心を奪われないこと" },
  { id: 4, kanji: "七転八起", correct: "しちてんはっき", wrong1: "ななころびやおき", wrong2: "しちてんばっき", meaning: "何度失敗してもくじけずに、奮起すること" },
  { id: 5, kanji: "温故知新", correct: "おんこちしん", wrong1: "おんこちあたらし", wrong2: "あたたかこちしん", meaning: "古いことを学んで、そこから新しい知識や見解を得ること" },
  { id: 6, kanji: "諸行無常", correct: "しょぎょうむじょう", wrong1: "しょこうむじょう", wrong2: "もろぎょうむじょう", meaning: "この世のすべてのものは常に変化して、永遠不変なものはないということ" },
  { id: 7, kanji: "因果応報", correct: "いんがおうほう", wrong1: "いんかおうほう", wrong2: "いんがおうぼう", meaning: "善い行いには善い報い、悪い行いには悪い報いがあるということ" },
  { id: 8, kanji: "自業自得", correct: "じごうじとく", wrong1: "じぎょうじとく", wrong2: "じごうじえ", meaning: "自分の行いの報いを自分自身が受けること" },
  { id: 9, kanji: "弱肉強食", correct: "じゃくにくきょうしょく", wrong1: "よわにくつよしょく", wrong2: "じゃくにくごうしょく", meaning: "弱い者が強い者の餌食になること。力の強い者が弱い者を支配する社会" },
  { id: 10, kanji: "以心伝心", correct: "いしんでんしん", wrong1: "いこころつたえこころ", wrong2: "もっていしんでんしん", meaning: "言葉を使わなくても、心から心へ通じ合うこと" },
  { id: 11, kanji: "十人十色", correct: "じゅうにんといろ", wrong1: "じゅうにんじゅっしょく", wrong2: "とおにんといろ", meaning: "人はそれぞれ考え方や好みが違うということ" },
  { id: 12, kanji: "百発百中", correct: "ひゃっぱつひゃくちゅう", wrong1: "ひゃくはつひゃくちゅう", wrong2: "ひゃっぱつももちゅう", meaning: "何度やっても必ず成功すること。予想や計画が必ず当たること" },
  { id: 13, kanji: "異口同音", correct: "いくどうおん", wrong1: "いこうどうおん", wrong2: "ことなりくちどうおん", meaning: "多くの人が同じことを言うこと。意見が一致すること" },
  { id: 14, kanji: "臨機応変", correct: "りんきおうへん", wrong1: "のぞむききおうへん", wrong2: "りんきおうべん", meaning: "その場その場の状況に応じて、適切な処置をとること" },
  { id: 15, kanji: "試行錯誤", correct: "しこうさくご", wrong1: "しぎょうさくご", wrong2: "ためしこうさくご", meaning: "新しいことを試みる際、失敗を繰り返しながら解決策を見出すこと" },
  { id: 16, kanji: "適材適所", correct: "てきざいてきしょ", wrong1: "てきざいてきところ", wrong2: "かなうざいてきしょ", meaning: "その人の能力や性質に合った地位や任務につけること" },
  { id: 17, kanji: "意気投合", correct: "いきとうごう", wrong1: "いきなげあう", wrong2: "おもういきとうごう", meaning: "互いの気持ちや考えがぴったり合うこと" },
  { id: 18, kanji: "質実剛健", correct: "しつじつごうけん", wrong1: "しちじつごうけん", wrong2: "しつみごうけん", meaning: "飾り気がなく真面目で、心身ともに強くたくましいこと" },
  { id: 19, kanji: "率先垂範", correct: "そっせんすいはん", wrong1: "りっせんすいはん", wrong2: "そっせんたれはん", meaning: "人の先頭に立ち、自ら模範を示すこと" },
  { id: 20, kanji: "切磋琢磨", correct: "せっさたくま", wrong1: "せっさたくみがく", wrong2: "きりみがきたくま", meaning: "学問や人格を磨くため、互いに励まし合い競い合うこと" },
  { id: 21, kanji: "朝令暮改", correct: "ちょうれいぼかい", wrong1: "あされいゆうがいかい", wrong2: "ちょうれいくれかい", meaning: "命令や方針が頻繁に変わり、一定しないこと" },
  { id: 22, kanji: "有言実行", correct: "ゆうげんじっこう", wrong1: "ゆうげんじつぎょう", wrong2: "ありことじっこう", meaning: "口に出したことは必ず実行すること" },
  { id: 23, kanji: "前代未聞", correct: "ぜんだいみもん", wrong1: "まえだいみもん", wrong2: "ぜんだいみみず", meaning: "今まで一度も聞いたことがないほど珍しいこと" },
  { id: 24, kanji: "危機一髪", correct: "ききいっぱつ", wrong1: "ききいちはつ", wrong2: "ききひとつかみ", meaning: "非常に危険な瀬戸際のこと" },
  { id: 25, kanji: "絶体絶命", correct: "ぜったいぜつめい", wrong1: "ぜったいぜつみょう", wrong2: "ぜつたいぜつめい", meaning: "逃げ道がなく、絶望的な状況のこと" },
  { id: 26, kanji: "神出鬼没", correct: "しんしゅつきぼつ", wrong1: "かみでおになし", wrong2: "しんしゅっきぼつ", meaning: "出没が予測できず、行動が自由自在なこと" },
  { id: 27, kanji: "天真爛漫", correct: "てんしんらんまん", wrong1: "てんしんらんばん", wrong2: "あまごころらんまん", meaning: "飾り気がなく、純真で明るいこと" },
  { id: 28, kanji: "傍若無人", correct: "ぼうじゃくぶじん", wrong1: "かたわかわかものぶじん", wrong2: "ぼうじゃくむにん", meaning: "人前を気にせず、勝手気ままに振る舞うこと" },
  { id: 29, kanji: "優柔不断", correct: "ゆうじゅうふだん", wrong1: "やさしいやわらかふだん", wrong2: "ゆうじゅうぶだん", meaning: "決断力に欠け、ぐずぐずして決められないこと" },
  { id: 30, kanji: "意味深長", correct: "いみしんちょう", wrong1: "いみふかながい", wrong2: "いみしんなが", meaning: "言葉や行動に深い意味が含まれていること" },
];
