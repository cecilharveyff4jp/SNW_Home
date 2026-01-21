"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Meta, BgConfig, Obj, MapConfig } from './types';
import { 
  basePath, 
  num, 
  clamp, 
  theme, 
  getDefaultSize, 
  rot, 
  checkOverlap, 
  getOverlapRect,
  FALLBACK 
} from './utils';

// 魚クイズ用の問題データ（30問に絞った版）
type FishQuestion = {
  id: number;
  kanji: string;
  correct: string;
  wrong1: string;
  wrong2: string;
};

const FISH_QUESTIONS: FishQuestion[] = [
  { id: 1, kanji: "鯖", correct: "さば", wrong1: "たい", wrong2: "ふぐ" },
  { id: 2, kanji: "鯛", correct: "たい", wrong1: "さば", wrong2: "かつお" },
  { id: 3, kanji: "鰯", correct: "いわし", wrong1: "あじ", wrong2: "さんま" },
  { id: 4, kanji: "鮪", correct: "まぐろ", wrong1: "かつお", wrong2: "ぶり" },
  { id: 5, kanji: "鰹", correct: "かつお", wrong1: "まぐろ", wrong2: "さば" },
  { id: 6, kanji: "鮭", correct: "さけ", wrong1: "ます", wrong2: "あゆ" },
  { id: 7, kanji: "鱒", correct: "ます", wrong1: "さけ", wrong2: "にじます" },
  { id: 8, kanji: "鮎", correct: "あゆ", wrong1: "さけ", wrong2: "わかさぎ" },
  { id: 9, kanji: "鰻", correct: "うなぎ", wrong1: "あなご", wrong2: "どじょう" },
  { id: 10, kanji: "鰈", correct: "かれい", wrong1: "ひらめ", wrong2: "したびらめ" },
  { id: 11, kanji: "鮃", correct: "ひらめ", wrong1: "かれい", wrong2: "したびらめ" },
  { id: 12, kanji: "鰆", correct: "さわら", wrong1: "かます", wrong2: "すずき" },
  { id: 13, kanji: "鯵", correct: "あじ", wrong1: "いわし", wrong2: "さんま" },
  { id: 14, kanji: "鯉", correct: "こい", wrong1: "ふな", wrong2: "きんぎょ" },
  { id: 15, kanji: "鱈", correct: "たら", wrong1: "ほっけ", wrong2: "すけとうだら" },
  { id: 16, kanji: "鰤", correct: "ぶり", wrong1: "かんぱち", wrong2: "ひらまさ" },
  { id: 17, kanji: "鰊", correct: "にしん", wrong1: "しゃけ", wrong2: "ほっけ" },
  { id: 18, kanji: "鯨", correct: "くじら", wrong1: "いるか", wrong2: "しゃち" },
  { id: 19, kanji: "蛸", correct: "たこ", wrong1: "いか", wrong2: "えび" },
  { id: 20, kanji: "烏賊", correct: "いか", wrong1: "たこ", wrong2: "くらげ" },
  { id: 21, kanji: "海老", correct: "えび", wrong1: "かに", wrong2: "しゃこ" },
  { id: 22, kanji: "蟹", correct: "かに", wrong1: "えび", wrong2: "しゃこ" },
  { id: 23, kanji: "蛤", correct: "はまぐり", wrong1: "あさり", wrong2: "しじみ" },
  { id: 24, kanji: "蜆", correct: "しじみ", wrong1: "あさり", wrong2: "はまぐり" },
  { id: 25, kanji: "浅蜊", correct: "あさり", wrong1: "しじみ", wrong2: "はまぐり" },
  { id: 26, kanji: "牡蠣", correct: "かき", wrong1: "ほたて", wrong2: "あわび" },
  { id: 27, kanji: "鮑", correct: "あわび", wrong1: "さざえ", wrong2: "とこぶし" },
  { id: 28, kanji: "海月", correct: "くらげ", wrong1: "いそぎんちゃく", wrong2: "ひとで" },
  { id: 29, kanji: "海星", correct: "ひとで", wrong1: "くらげ", wrong2: "うに" },
  { id: 30, kanji: "海胆", correct: "うに", wrong1: "くり", wrong2: "ひとで" },
];

// 四字熟語クイズ用の問題データ
type YojijukugoQuestion = {
  id: number;
  kanji: string;
  correct: string;
  wrong1: string;
  wrong2: string;
  meaning: string;
};

const YOJIJUKUGO_QUESTIONS: YojijukugoQuestion[] = [
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

// 英単語クイズ用の問題データ（大学入試レベル）
type EnglishQuestion = {
  word: string;
  correct: string;
  wrong1: string;
  wrong2: string;
  type: 'english_to_japanese' | 'japanese_to_english'; // 和訳か洋訳か
};

const ENGLISH_QUESTIONS: EnglishQuestion[] = [
  // 英→日（150問）
  { word: "abandon", correct: "捨てる", wrong1: "得る", wrong2: "保つ", type: "english_to_japanese" },
  { word: "ability", correct: "能力", wrong1: "責任", wrong2: "機会", type: "english_to_japanese" },
  { word: "absent", correct: "欠席して", wrong1: "出席して", wrong2: "遅刻して", type: "english_to_japanese" },
  { word: "absolute", correct: "絶対的な", wrong1: "相対的な", wrong2: "部分的な", type: "english_to_japanese" },
  { word: "absorb", correct: "吸収する", wrong1: "放出する", wrong2: "反射する", type: "english_to_japanese" },
  { word: "abstract", correct: "抽象的な", wrong1: "具体的な", wrong2: "現実的な", type: "english_to_japanese" },
  { word: "abundant", correct: "豊富な", wrong1: "不足した", wrong2: "普通の", type: "english_to_japanese" },
  { word: "academic", correct: "学問的な", wrong1: "実用的な", wrong2: "娯楽的な", type: "english_to_japanese" },
  { word: "accelerate", correct: "加速する", wrong1: "減速する", wrong2: "停止する", type: "english_to_japanese" },
  { word: "accept", correct: "受け入れる", wrong1: "拒否する", wrong2: "無視する", type: "english_to_japanese" },
  { word: "access", correct: "接近", wrong1: "距離", wrong2: "障害", type: "english_to_japanese" },
  { word: "accompany", correct: "同行する", wrong1: "置き去りにする", wrong2: "先導する", type: "english_to_japanese" },
  { word: "accomplish", correct: "成し遂げる", wrong1: "失敗する", wrong2: "始める", type: "english_to_japanese" },
  { word: "accurate", correct: "正確な", wrong1: "不正確な", wrong2: "曖昧な", type: "english_to_japanese" },
  { word: "achieve", correct: "達成する", wrong1: "諦める", wrong2: "試みる", type: "english_to_japanese" },
  { word: "acknowledge", correct: "認める", wrong1: "否定する", wrong2: "疑う", type: "english_to_japanese" },
  { word: "acquire", correct: "獲得する", wrong1: "失う", wrong2: "放棄する", type: "english_to_japanese" },
  { word: "adapt", correct: "適応する", wrong1: "抵抗する", wrong2: "逃避する", type: "english_to_japanese" },
  { word: "adequate", correct: "十分な", wrong1: "不十分な", wrong2: "過剰な", type: "english_to_japanese" },
  { word: "adjacent", correct: "隣接した", wrong1: "遠い", wrong2: "対向した", type: "english_to_japanese" },
  { word: "adjust", correct: "調整する", wrong1: "固定する", wrong2: "破壊する", type: "english_to_japanese" },
  { word: "admire", correct: "称賛する", wrong1: "軽蔑する", wrong2: "無視する", type: "english_to_japanese" },
  { word: "admit", correct: "認める", wrong1: "否定する", wrong2: "隠す", type: "english_to_japanese" },
  { word: "adopt", correct: "採用する", wrong1: "拒否する", wrong2: "延期する", type: "english_to_japanese" },
  { word: "advance", correct: "前進する", wrong1: "後退する", wrong2: "停止する", type: "english_to_japanese" },
  { word: "advantage", correct: "利点", wrong1: "欠点", wrong2: "中立", type: "english_to_japanese" },
  { word: "affect", correct: "影響を与える", wrong1: "無関係である", wrong2: "保護する", type: "english_to_japanese" },
  { word: "afford", correct: "余裕がある", wrong1: "不足する", wrong2: "拒否する", type: "english_to_japanese" },
  { word: "agriculture", correct: "農業", wrong1: "工業", wrong2: "商業", type: "english_to_japanese" },
  { word: "aim", correct: "目指す", wrong1: "避ける", wrong2: "放棄する", type: "english_to_japanese" },
  { word: "ancient", correct: "古代の", wrong1: "現代の", wrong2: "未来の", type: "english_to_japanese" },
  { word: "announce", correct: "発表する", wrong1: "隠す", wrong2: "延期する", type: "english_to_japanese" },
  { word: "annual", correct: "年1回の", wrong1: "月1回の", wrong2: "日1回の", type: "english_to_japanese" },
  { word: "anxious", correct: "不安な", wrong1: "安心した", wrong2: "無関心な", type: "english_to_japanese" },
  { word: "apparent", correct: "明白な", wrong1: "不明瞭な", wrong2: "隠された", type: "english_to_japanese" },
  { word: "appeal", correct: "訴える", wrong1: "拒否する", wrong2: "命令する", type: "english_to_japanese" },
  { word: "appear", correct: "現れる", wrong1: "消える", wrong2: "隠れる", type: "english_to_japanese" },
  { word: "appreciate", correct: "感謝する", wrong1: "批判する", wrong2: "無視する", type: "english_to_japanese" },
  { word: "approach", correct: "接近する", wrong1: "遠ざかる", wrong2: "停止する", type: "english_to_japanese" },
  { word: "appropriate", correct: "適切な", wrong1: "不適切な", wrong2: "無関係な", type: "english_to_japanese" },
  { word: "approve", correct: "承認する", wrong1: "拒否する", wrong2: "延期する", type: "english_to_japanese" },
  { word: "argue", correct: "議論する", wrong1: "同意する", wrong2: "沈黙する", type: "english_to_japanese" },
  { word: "artificial", correct: "人工的な", wrong1: "天然の", wrong2: "自然な", type: "english_to_japanese" },
  { word: "aspect", correct: "側面", wrong1: "全体", wrong2: "中心", type: "english_to_japanese" },
  { word: "assess", correct: "評価する", wrong1: "無視する", wrong2: "推測する", type: "english_to_japanese" },
  { word: "assign", correct: "割り当てる", wrong1: "回収する", wrong2: "拒否する", type: "english_to_japanese" },
  { word: "assist", correct: "援助する", wrong1: "妨害する", wrong2: "無視する", type: "english_to_japanese" },
  { word: "assume", correct: "仮定する", wrong1: "証明する", wrong2: "否定する", type: "english_to_japanese" },
  { word: "assure", correct: "保証する", wrong1: "疑う", wrong2: "拒否する", type: "english_to_japanese" },
  { word: "attach", correct: "取り付ける", wrong1: "外す", wrong2: "分離する", type: "english_to_japanese" },
  { word: "attempt", correct: "試みる", wrong1: "諦める", wrong2: "拒否する", type: "english_to_japanese" },
  { word: "attitude", correct: "態度", wrong1: "行動", wrong2: "結果", type: "english_to_japanese" },
  { word: "attribute", correct: "特質", wrong1: "欠点", wrong2: "結果", type: "english_to_japanese" },
  { word: "automatic", correct: "自動的な", wrong1: "手動の", wrong2: "意図的な", type: "english_to_japanese" },
  { word: "available", correct: "利用できる", wrong1: "利用不可の", wrong2: "禁止された", type: "english_to_japanese" },
  { word: "avoid", correct: "避ける", wrong1: "直面する", wrong2: "求める", type: "english_to_japanese" },
  { word: "aware", correct: "気づいている", wrong1: "無知な", wrong2: "無関心な", type: "english_to_japanese" },
  { word: "balance", correct: "バランス", wrong1: "不均衡", wrong2: "混乱", type: "english_to_japanese" },
  { word: "barrier", correct: "障壁", wrong1: "入口", wrong2: "通路", type: "english_to_japanese" },
  { word: "beneficial", correct: "有益な", wrong1: "有害な", wrong2: "無益な", type: "english_to_japanese" },
  { word: "benefit", correct: "利益", wrong1: "損失", wrong2: "負担", type: "english_to_japanese" },
  { word: "brief", correct: "短い", wrong1: "長い", wrong2: "永遠の", type: "english_to_japanese" },
  { word: "burden", correct: "負担", wrong1: "利益", wrong2: "喜び", type: "english_to_japanese" },
  { word: "capable", correct: "能力のある", wrong1: "無能な", wrong2: "拒否する", type: "english_to_japanese" },
  { word: "capacity", correct: "容量", wrong1: "空虚", wrong2: "欠如", type: "english_to_japanese" },
  { word: "capture", correct: "捕らえる", wrong1: "解放する", wrong2: "逃がす", type: "english_to_japanese" },
  { word: "catastrophe", correct: "大惨事", wrong1: "成功", wrong2: "幸運", type: "english_to_japanese" },
  { word: "century", correct: "世紀", wrong1: "年", wrong2: "月", type: "english_to_japanese" },
  { word: "challenge", correct: "挑戦", wrong1: "降参", wrong2: "回避", type: "english_to_japanese" },
  { word: "characteristic", correct: "特徴", wrong1: "欠点", wrong2: "平凡", type: "english_to_japanese" },
  { word: "civilization", correct: "文明", wrong1: "野蛮", wrong2: "混沌", type: "english_to_japanese" },
  { word: "claim", correct: "主張する", wrong1: "否定する", wrong2: "質問する", type: "english_to_japanese" },
  { word: "climate", correct: "気候", wrong1: "天気", wrong2: "季節", type: "english_to_japanese" },
  { word: "colleague", correct: "同僚", wrong1: "敵", wrong2: "上司", type: "english_to_japanese" },
  { word: "colony", correct: "植民地", wrong1: "独立国", wrong2: "同盟国", type: "english_to_japanese" },
  { word: "commerce", correct: "商業", wrong1: "農業", wrong2: "工業", type: "english_to_japanese" },
  { word: "commit", correct: "犯す", wrong1: "防ぐ", wrong2: "避ける", type: "english_to_japanese" },
  { word: "communicate", correct: "伝達する", wrong1: "隠す", wrong2: "拒否する", type: "english_to_japanese" },
  { word: "community", correct: "地域社会", wrong1: "個人", wrong2: "国家", type: "english_to_japanese" },
  { word: "compare", correct: "比較する", wrong1: "分離する", wrong2: "無視する", type: "english_to_japanese" },
  { word: "compete", correct: "競争する", wrong1: "協力する", wrong2: "降参する", type: "english_to_japanese" },
  { word: "complain", correct: "不平を言う", wrong1: "賞賛する", wrong2: "感謝する", type: "english_to_japanese" },
  { word: "complex", correct: "複雑な", wrong1: "単純な", wrong2: "明確な", type: "english_to_japanese" },
  { word: "component", correct: "構成要素", wrong1: "全体", wrong2: "結果", type: "english_to_japanese" },
  { word: "compose", correct: "構成する", wrong1: "破壊する", wrong2: "分解する", type: "english_to_japanese" },
  { word: "comprehensive", correct: "包括的な", wrong1: "部分的な", wrong2: "限定的な", type: "english_to_japanese" },
  { word: "concentrate", correct: "集中する", wrong1: "分散する", wrong2: "無視する", type: "english_to_japanese" },
  { word: "concept", correct: "概念", wrong1: "具体", wrong2: "現実", type: "english_to_japanese" },
  { word: "concern", correct: "関心", wrong1: "無関心", wrong2: "嫌悪", type: "english_to_japanese" },
  { word: "conclude", correct: "結論を出す", wrong1: "始める", wrong2: "継続する", type: "english_to_japanese" },
  { word: "concrete", correct: "具体的な", wrong1: "抽象的な", wrong2: "曖昧な", type: "english_to_japanese" },
  { word: "conduct", correct: "行う", wrong1: "中止する", wrong2: "拒否する", type: "english_to_japanese" },
  { word: "conference", correct: "会議", wrong1: "休憩", wrong2: "独白", type: "english_to_japanese" },
  { word: "confine", correct: "制限する", wrong1: "解放する", wrong2: "拡大する", type: "english_to_japanese" },
  { word: "confirm", correct: "確認する", wrong1: "否定する", wrong2: "疑う", type: "english_to_japanese" },
  { word: "conflict", correct: "対立", wrong1: "協調", wrong2: "平和", type: "english_to_japanese" },
  { word: "confront", correct: "直面する", wrong1: "回避する", wrong2: "逃げる", type: "english_to_japanese" },
  { word: "consequence", correct: "結果", wrong1: "原因", wrong2: "過程", type: "english_to_japanese" },
  { word: "conservative", correct: "保守的な", wrong1: "革新的な", wrong2: "急進的な", type: "english_to_japanese" },
  { word: "consider", correct: "考慮する", wrong1: "無視する", wrong2: "拒否する", type: "english_to_japanese" },
  { word: "consistent", correct: "一貫した", wrong1: "矛盾した", wrong2: "変動する", type: "english_to_japanese" },
  { word: "constant", correct: "不変の", wrong1: "変化する", wrong2: "一時的な", type: "english_to_japanese" },
  { word: "constitute", correct: "構成する", wrong1: "破壊する", wrong2: "分解する", type: "english_to_japanese" },
  { word: "construct", correct: "建設する", wrong1: "破壊する", wrong2: "放置する", type: "english_to_japanese" },
  { word: "consume", correct: "消費する", wrong1: "生産する", wrong2: "保存する", type: "english_to_japanese" },
  { word: "contact", correct: "接触", wrong1: "分離", wrong2: "距離", type: "english_to_japanese" },
  { word: "contain", correct: "含む", wrong1: "除外する", wrong2: "拒否する", type: "english_to_japanese" },
  { word: "contemporary", correct: "現代の", wrong1: "古代の", wrong2: "未来の", type: "english_to_japanese" },
  { word: "content", correct: "内容", wrong1: "形式", wrong2: "外観", type: "english_to_japanese" },
  { word: "context", correct: "文脈", wrong1: "内容", wrong2: "形式", type: "english_to_japanese" },
  { word: "contract", correct: "契約", wrong1: "拒否", wrong2: "破棄", type: "english_to_japanese" },
  { word: "contradict", correct: "矛盾する", wrong1: "一致する", wrong2: "支持する", type: "english_to_japanese" },
  { word: "contrary", correct: "反対の", wrong1: "同じ", wrong2: "類似の", type: "english_to_japanese" },
  { word: "contrast", correct: "対照", wrong1: "類似", wrong2: "同一", type: "english_to_japanese" },
  { word: "contribute", correct: "貢献する", wrong1: "妨害する", wrong2: "破壊する", type: "english_to_japanese" },
  { word: "control", correct: "制御する", wrong1: "放置する", wrong2: "解放する", type: "english_to_japanese" },
  { word: "controversial", correct: "議論の余地のある", wrong1: "明白な", wrong2: "確実な", type: "english_to_japanese" },
  { word: "convention", correct: "慣習", wrong1: "革新", wrong2: "違反", type: "english_to_japanese" },
  { word: "convert", correct: "変換する", wrong1: "維持する", wrong2: "固定する", type: "english_to_japanese" },
  { word: "convince", correct: "納得させる", wrong1: "疑わせる", wrong2: "拒否する", type: "english_to_japanese" },
  { word: "cooperate", correct: "協力する", wrong1: "対立する", wrong2: "拒否する", type: "english_to_japanese" },
  { word: "core", correct: "核心", wrong1: "表面", wrong2: "周辺", type: "english_to_japanese" },
  { word: "correspond", correct: "一致する", wrong1: "矛盾する", wrong2: "無関係である", type: "english_to_japanese" },
  { word: "create", correct: "創造する", wrong1: "破壊する", wrong2: "模倣する", type: "english_to_japanese" },
  { word: "crisis", correct: "危機", wrong1: "安定", wrong2: "平和", type: "english_to_japanese" },
  { word: "criterion", correct: "基準", wrong1: "結果", wrong2: "例外", type: "english_to_japanese" },
  { word: "critical", correct: "批判的な", wrong1: "賞賛的な", wrong2: "無関心な", type: "english_to_japanese" },
  { word: "cultivate", correct: "耕す", wrong1: "荒らす", wrong2: "放置する", type: "english_to_japanese" },
  { word: "cultural", correct: "文化的な", wrong1: "自然な", wrong2: "科学的な", type: "english_to_japanese" },
  { word: "curious", correct: "好奇心の強い", wrong1: "無関心な", wrong2: "恐れる", type: "english_to_japanese" },
  { word: "currency", correct: "通貨", wrong1: "商品", wrong2: "サービス", type: "english_to_japanese" },
  { word: "decade", correct: "10年", wrong1: "100年", wrong2: "1年", type: "english_to_japanese" },
  { word: "decline", correct: "衰退する", wrong1: "繁栄する", wrong2: "維持する", type: "english_to_japanese" },
  { word: "decrease", correct: "減少する", wrong1: "増加する", wrong2: "維持する", type: "english_to_japanese" },
  { word: "dedicate", correct: "捧げる", wrong1: "奪う", wrong2: "無視する", type: "english_to_japanese" },
  { word: "defeat", correct: "打ち負かす", wrong1: "勝つ", wrong2: "引き分ける", type: "english_to_japanese" },
  { word: "defend", correct: "守る", wrong1: "攻撃する", wrong2: "逃げる", type: "english_to_japanese" },
  { word: "define", correct: "定義する", wrong1: "曖昧にする", wrong2: "無視する", type: "english_to_japanese" },
  { word: "definite", correct: "明確な", wrong1: "曖昧な", wrong2: "不明な", type: "english_to_japanese" },
  { word: "deliberate", correct: "意図的な", wrong1: "偶然の", wrong2: "無意識の", type: "english_to_japanese" },
  { word: "democracy", correct: "民主主義", wrong1: "独裁", wrong2: "君主制", type: "english_to_japanese" },
  { word: "demonstrate", correct: "実証する", wrong1: "隠す", wrong2: "否定する", type: "english_to_japanese" },
  { word: "deny", correct: "否定する", wrong1: "肯定する", wrong2: "認める", type: "english_to_japanese" },
  { word: "depend", correct: "依存する", wrong1: "独立する", wrong2: "拒否する", type: "english_to_japanese" },
  { word: "derive", correct: "由来する", wrong1: "創造する", wrong2: "破壊する", type: "english_to_japanese" },
  { word: "descend", correct: "降りる", wrong1: "登る", wrong2: "留まる", type: "english_to_japanese" },

  // 日→英（150問）
  { word: "捨てる", correct: "abandon", wrong1: "obtain", wrong2: "keep", type: "japanese_to_english" },
  { word: "能力", correct: "ability", wrong1: "disability", wrong2: "responsibility", type: "japanese_to_english" },
  { word: "欠席して", correct: "absent", wrong1: "present", wrong2: "late", type: "japanese_to_english" },
  { word: "絶対的な", correct: "absolute", wrong1: "relative", wrong2: "partial", type: "japanese_to_english" },
  { word: "吸収する", correct: "absorb", wrong1: "emit", wrong2: "reflect", type: "japanese_to_english" },
  { word: "抽象的な", correct: "abstract", wrong1: "concrete", wrong2: "realistic", type: "japanese_to_english" },
  { word: "豊富な", correct: "abundant", wrong1: "scarce", wrong2: "ordinary", type: "japanese_to_english" },
  { word: "学問的な", correct: "academic", wrong1: "practical", wrong2: "recreational", type: "japanese_to_english" },
  { word: "加速する", correct: "accelerate", wrong1: "decelerate", wrong2: "stop", type: "japanese_to_english" },
  { word: "受け入れる", correct: "accept", wrong1: "reject", wrong2: "ignore", type: "japanese_to_english" },
  { word: "接近", correct: "access", wrong1: "distance", wrong2: "barrier", type: "japanese_to_english" },
  { word: "同行する", correct: "accompany", wrong1: "abandon", wrong2: "lead", type: "japanese_to_english" },
  { word: "成し遂げる", correct: "accomplish", wrong1: "fail", wrong2: "begin", type: "japanese_to_english" },
  { word: "正確な", correct: "accurate", wrong1: "inaccurate", wrong2: "vague", type: "japanese_to_english" },
  { word: "達成する", correct: "achieve", wrong1: "abandon", wrong2: "attempt", type: "japanese_to_english" },
  { word: "認める", correct: "acknowledge", wrong1: "deny", wrong2: "doubt", type: "japanese_to_english" },
  { word: "獲得する", correct: "acquire", wrong1: "lose", wrong2: "abandon", type: "japanese_to_english" },
  { word: "適応する", correct: "adapt", wrong1: "resist", wrong2: "escape", type: "japanese_to_english" },
  { word: "十分な", correct: "adequate", wrong1: "insufficient", wrong2: "excessive", type: "japanese_to_english" },
  { word: "隣接した", correct: "adjacent", wrong1: "distant", wrong2: "opposite", type: "japanese_to_english" },
  { word: "調整する", correct: "adjust", wrong1: "fix", wrong2: "destroy", type: "japanese_to_english" },
  { word: "称賛する", correct: "admire", wrong1: "despise", wrong2: "ignore", type: "japanese_to_english" },
  { word: "採用する", correct: "adopt", wrong1: "reject", wrong2: "postpone", type: "japanese_to_english" },
  { word: "前進する", correct: "advance", wrong1: "retreat", wrong2: "stop", type: "japanese_to_english" },
  { word: "利点", correct: "advantage", wrong1: "disadvantage", wrong2: "neutral", type: "japanese_to_english" },
  { word: "影響を与える", correct: "affect", wrong1: "ignore", wrong2: "protect", type: "japanese_to_english" },
  { word: "余裕がある", correct: "afford", wrong1: "lack", wrong2: "refuse", type: "japanese_to_english" },
  { word: "農業", correct: "agriculture", wrong1: "industry", wrong2: "commerce", type: "japanese_to_english" },
  { word: "目指す", correct: "aim", wrong1: "avoid", wrong2: "abandon", type: "japanese_to_english" },
  { word: "古代の", correct: "ancient", wrong1: "modern", wrong2: "future", type: "japanese_to_english" },
  { word: "発表する", correct: "announce", wrong1: "hide", wrong2: "postpone", type: "japanese_to_english" },
  { word: "年1回の", correct: "annual", wrong1: "monthly", wrong2: "daily", type: "japanese_to_english" },
  { word: "不安な", correct: "anxious", wrong1: "relieved", wrong2: "indifferent", type: "japanese_to_english" },
  { word: "明白な", correct: "apparent", wrong1: "unclear", wrong2: "hidden", type: "japanese_to_english" },
  { word: "訴える", correct: "appeal", wrong1: "refuse", wrong2: "command", type: "japanese_to_english" },
  { word: "現れる", correct: "appear", wrong1: "disappear", wrong2: "hide", type: "japanese_to_english" },
  { word: "感謝する", correct: "appreciate", wrong1: "criticize", wrong2: "ignore", type: "japanese_to_english" },
  { word: "接近する", correct: "approach", wrong1: "retreat", wrong2: "stop", type: "japanese_to_english" },
  { word: "適切な", correct: "appropriate", wrong1: "inappropriate", wrong2: "irrelevant", type: "japanese_to_english" },
  { word: "承認する", correct: "approve", wrong1: "reject", wrong2: "postpone", type: "japanese_to_english" },
  { word: "議論する", correct: "argue", wrong1: "agree", wrong2: "silence", type: "japanese_to_english" },
  { word: "人工的な", correct: "artificial", wrong1: "natural", wrong2: "organic", type: "japanese_to_english" },
  { word: "側面", correct: "aspect", wrong1: "whole", wrong2: "center", type: "japanese_to_english" },
  { word: "評価する", correct: "assess", wrong1: "ignore", wrong2: "guess", type: "japanese_to_english" },
  { word: "割り当てる", correct: "assign", wrong1: "collect", wrong2: "refuse", type: "japanese_to_english" },
  { word: "援助する", correct: "assist", wrong1: "hinder", wrong2: "ignore", type: "japanese_to_english" },
  { word: "仮定する", correct: "assume", wrong1: "prove", wrong2: "deny", type: "japanese_to_english" },
  { word: "保証する", correct: "assure", wrong1: "doubt", wrong2: "refuse", type: "japanese_to_english" },
  { word: "取り付ける", correct: "attach", wrong1: "detach", wrong2: "separate", type: "japanese_to_english" },
  { word: "試みる", correct: "attempt", wrong1: "abandon", wrong2: "refuse", type: "japanese_to_english" },
  { word: "態度", correct: "attitude", wrong1: "action", wrong2: "result", type: "japanese_to_english" },
  { word: "特質", correct: "attribute", wrong1: "defect", wrong2: "result", type: "japanese_to_english" },
  { word: "自動的な", correct: "automatic", wrong1: "manual", wrong2: "intentional", type: "japanese_to_english" },
  { word: "利用できる", correct: "available", wrong1: "unavailable", wrong2: "forbidden", type: "japanese_to_english" },
  { word: "避ける", correct: "avoid", wrong1: "confront", wrong2: "seek", type: "japanese_to_english" },
  { word: "気づいている", correct: "aware", wrong1: "ignorant", wrong2: "indifferent", type: "japanese_to_english" },
  { word: "バランス", correct: "balance", wrong1: "imbalance", wrong2: "chaos", type: "japanese_to_english" },
  { word: "障壁", correct: "barrier", wrong1: "entrance", wrong2: "passage", type: "japanese_to_english" },
  { word: "有益な", correct: "beneficial", wrong1: "harmful", wrong2: "useless", type: "japanese_to_english" },
  { word: "利益", correct: "benefit", wrong1: "loss", wrong2: "burden", type: "japanese_to_english" },
  { word: "短い", correct: "brief", wrong1: "long", wrong2: "eternal", type: "japanese_to_english" },
  { word: "負担", correct: "burden", wrong1: "benefit", wrong2: "joy", type: "japanese_to_english" },
  { word: "能力のある", correct: "capable", wrong1: "incapable", wrong2: "refusing", type: "japanese_to_english" },
  { word: "容量", correct: "capacity", wrong1: "emptiness", wrong2: "lack", type: "japanese_to_english" },
  { word: "捕らえる", correct: "capture", wrong1: "release", wrong2: "free", type: "japanese_to_english" },
  { word: "大惨事", correct: "catastrophe", wrong1: "success", wrong2: "fortune", type: "japanese_to_english" },
  { word: "世紀", correct: "century", wrong1: "year", wrong2: "month", type: "japanese_to_english" },
  { word: "挑戦", correct: "challenge", wrong1: "surrender", wrong2: "avoidance", type: "japanese_to_english" },
  { word: "特徴", correct: "characteristic", wrong1: "defect", wrong2: "mediocrity", type: "japanese_to_english" },
  { word: "文明", correct: "civilization", wrong1: "barbarism", wrong2: "chaos", type: "japanese_to_english" },
  { word: "主張する", correct: "claim", wrong1: "deny", wrong2: "question", type: "japanese_to_english" },
  { word: "気候", correct: "climate", wrong1: "weather", wrong2: "season", type: "japanese_to_english" },
  { word: "同僚", correct: "colleague", wrong1: "enemy", wrong2: "boss", type: "japanese_to_english" },
  { word: "植民地", correct: "colony", wrong1: "independent", wrong2: "alliance", type: "japanese_to_english" },
  { word: "商業", correct: "commerce", wrong1: "agriculture", wrong2: "industry", type: "japanese_to_english" },
  { word: "犯す", correct: "commit", wrong1: "prevent", wrong2: "avoid", type: "japanese_to_english" },
  { word: "伝達する", correct: "communicate", wrong1: "hide", wrong2: "refuse", type: "japanese_to_english" },
  { word: "地域社会", correct: "community", wrong1: "individual", wrong2: "nation", type: "japanese_to_english" },
  { word: "比較する", correct: "compare", wrong1: "separate", wrong2: "ignore", type: "japanese_to_english" },
  { word: "競争する", correct: "compete", wrong1: "cooperate", wrong2: "surrender", type: "japanese_to_english" },
  { word: "不平を言う", correct: "complain", wrong1: "praise", wrong2: "appreciate", type: "japanese_to_english" },
  { word: "複雑な", correct: "complex", wrong1: "simple", wrong2: "clear", type: "japanese_to_english" },
  { word: "構成要素", correct: "component", wrong1: "whole", wrong2: "result", type: "japanese_to_english" },
  { word: "構成する", correct: "compose", wrong1: "destroy", wrong2: "decompose", type: "japanese_to_english" },
  { word: "包括的な", correct: "comprehensive", wrong1: "partial", wrong2: "limited", type: "japanese_to_english" },
  { word: "集中する", correct: "concentrate", wrong1: "disperse", wrong2: "ignore", type: "japanese_to_english" },
  { word: "概念", correct: "concept", wrong1: "concrete", wrong2: "reality", type: "japanese_to_english" },
  { word: "関心", correct: "concern", wrong1: "indifference", wrong2: "aversion", type: "japanese_to_english" },
  { word: "結論を出す", correct: "conclude", wrong1: "begin", wrong2: "continue", type: "japanese_to_english" },
  { word: "具体的な", correct: "concrete", wrong1: "abstract", wrong2: "vague", type: "japanese_to_english" },
  { word: "行う", correct: "conduct", wrong1: "cancel", wrong2: "refuse", type: "japanese_to_english" },
  { word: "会議", correct: "conference", wrong1: "break", wrong2: "monologue", type: "japanese_to_english" },
  { word: "制限する", correct: "confine", wrong1: "release", wrong2: "expand", type: "japanese_to_english" },
  { word: "確認する", correct: "confirm", wrong1: "deny", wrong2: "doubt", type: "japanese_to_english" },
  { word: "対立", correct: "conflict", wrong1: "cooperation", wrong2: "peace", type: "japanese_to_english" },
  { word: "直面する", correct: "confront", wrong1: "avoid", wrong2: "escape", type: "japanese_to_english" },
  { word: "結果", correct: "consequence", wrong1: "cause", wrong2: "process", type: "japanese_to_english" },
  { word: "保守的な", correct: "conservative", wrong1: "progressive", wrong2: "radical", type: "japanese_to_english" },
  { word: "考慮する", correct: "consider", wrong1: "ignore", wrong2: "refuse", type: "japanese_to_english" },
  { word: "一貫した", correct: "consistent", wrong1: "contradictory", wrong2: "variable", type: "japanese_to_english" },
  { word: "不変の", correct: "constant", wrong1: "changing", wrong2: "temporary", type: "japanese_to_english" },
  { word: "建設する", correct: "construct", wrong1: "destroy", wrong2: "abandon", type: "japanese_to_english" },
  { word: "消費する", correct: "consume", wrong1: "produce", wrong2: "preserve", type: "japanese_to_english" },
  { word: "接触", correct: "contact", wrong1: "separation", wrong2: "distance", type: "japanese_to_english" },
  { word: "含む", correct: "contain", wrong1: "exclude", wrong2: "refuse", type: "japanese_to_english" },
  { word: "現代の", correct: "contemporary", wrong1: "ancient", wrong2: "future", type: "japanese_to_english" },
  { word: "内容", correct: "content", wrong1: "form", wrong2: "appearance", type: "japanese_to_english" },
  { word: "文脈", correct: "context", wrong1: "content", wrong2: "form", type: "japanese_to_english" },
  { word: "契約", correct: "contract", wrong1: "refusal", wrong2: "cancellation", type: "japanese_to_english" },
  { word: "矛盾する", correct: "contradict", wrong1: "agree", wrong2: "support", type: "japanese_to_english" },
  { word: "反対の", correct: "contrary", wrong1: "same", wrong2: "similar", type: "japanese_to_english" },
  { word: "対照", correct: "contrast", wrong1: "similarity", wrong2: "identity", type: "japanese_to_english" },
  { word: "貢献する", correct: "contribute", wrong1: "hinder", wrong2: "destroy", type: "japanese_to_english" },
  { word: "制御する", correct: "control", wrong1: "abandon", wrong2: "release", type: "japanese_to_english" },
  { word: "議論の余地のある", correct: "controversial", wrong1: "obvious", wrong2: "certain", type: "japanese_to_english" },
  { word: "慣習", correct: "convention", wrong1: "innovation", wrong2: "violation", type: "japanese_to_english" },
  { word: "変換する", correct: "convert", wrong1: "maintain", wrong2: "fix", type: "japanese_to_english" },
  { word: "納得させる", correct: "convince", wrong1: "doubt", wrong2: "refuse", type: "japanese_to_english" },
  { word: "協力する", correct: "cooperate", wrong1: "oppose", wrong2: "refuse", type: "japanese_to_english" },
  { word: "核心", correct: "core", wrong1: "surface", wrong2: "periphery", type: "japanese_to_english" },
  { word: "一致する", correct: "correspond", wrong1: "contradict", wrong2: "irrelevant", type: "japanese_to_english" },
  { word: "創造する", correct: "create", wrong1: "destroy", wrong2: "imitate", type: "japanese_to_english" },
  { word: "危機", correct: "crisis", wrong1: "stability", wrong2: "peace", type: "japanese_to_english" },
  { word: "基準", correct: "criterion", wrong1: "result", wrong2: "exception", type: "japanese_to_english" },
  { word: "批判的な", correct: "critical", wrong1: "praising", wrong2: "indifferent", type: "japanese_to_english" },
  { word: "耕す", correct: "cultivate", wrong1: "devastate", wrong2: "abandon", type: "japanese_to_english" },
  { word: "文化的な", correct: "cultural", wrong1: "natural", wrong2: "scientific", type: "japanese_to_english" },
  { word: "好奇心の強い", correct: "curious", wrong1: "indifferent", wrong2: "afraid", type: "japanese_to_english" },
  { word: "通貨", correct: "currency", wrong1: "commodity", wrong2: "service", type: "japanese_to_english" },
  { word: "10年", correct: "decade", wrong1: "century", wrong2: "year", type: "japanese_to_english" },
  { word: "衰退する", correct: "decline", wrong1: "prosper", wrong2: "maintain", type: "japanese_to_english" },
  { word: "減少する", correct: "decrease", wrong1: "increase", wrong2: "maintain", type: "japanese_to_english" },
  { word: "捧げる", correct: "dedicate", wrong1: "take", wrong2: "ignore", type: "japanese_to_english" },
  { word: "打ち負かす", correct: "defeat", wrong1: "win", wrong2: "draw", type: "japanese_to_english" },
  { word: "守る", correct: "defend", wrong1: "attack", wrong2: "flee", type: "japanese_to_english" },
  { word: "定義する", correct: "define", wrong1: "obscure", wrong2: "ignore", type: "japanese_to_english" },
  { word: "明確な", correct: "definite", wrong1: "vague", wrong2: "unclear", type: "japanese_to_english" },
  { word: "意図的な", correct: "deliberate", wrong1: "accidental", wrong2: "unconscious", type: "japanese_to_english" },
  { word: "民主主義", correct: "democracy", wrong1: "dictatorship", wrong2: "monarchy", type: "japanese_to_english" },
  { word: "実証する", correct: "demonstrate", wrong1: "hide", wrong2: "deny", type: "japanese_to_english" },
  { word: "否定する", correct: "deny", wrong1: "affirm", wrong2: "admit", type: "japanese_to_english" },
  { word: "依存する", correct: "depend", wrong1: "independent", wrong2: "refuse", type: "japanese_to_english" },
  { word: "由来する", correct: "derive", wrong1: "create", wrong2: "destroy", type: "japanese_to_english" },
  { word: "降りる", correct: "descend", wrong1: "ascend", wrong2: "stay", type: "japanese_to_english" },
];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tickerCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  const [meta, setMeta] = useState<Meta>({});
  const [objects, setObjects] = useState<Obj[]>([]);
  const [links, setLinks] = useState<Array<{ name: string; url: string; order: number; display: boolean }>>([]);
  const [err, setErr] = useState<string | null>(null);

  // マップ切替機能
  const [currentMapId, setCurrentMapId] = useState<string>('object');
  const [mapConfigs, setMapConfigs] = useState<MapConfig[]>([]);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [showMapManagement, setShowMapManagement] = useState(false);
  const [editingMapConfig, setEditingMapConfig] = useState<MapConfig | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 編集モード
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [editingObject, setEditingObject] = useState<Obj | null>(null);
  const [originalEditingId, setOriginalEditingId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<{ name: string; url: string; order: number; display: boolean; index: number } | null>(null);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasUnsavedLinksChanges, setHasUnsavedLinksChanges] = useState(false);
  const [showAddObjectModal, setShowAddObjectModal] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [lastSelectedType, setLastSelectedType] = useState("");
  const [modalSelectedType, setModalSelectedType] = useState("");
  const [undoStack, setUndoStack] = useState<Obj[][]>([]);
  const [redoStack, setRedoStack] = useState<Obj[][]>([]);
  const dragStartRef = useRef<{ objId: string; mx: number; my: number; objX: number; objY: number } | null>(null);
  const initialObjectsRef = useRef<Obj[]>([]);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null); // ダブルクリック検出用
  const lastClickRef = useRef<{ time: number; gridX: number; gridY: number } | null>(null); // onClick用ダブルクリック検出
  const [showMoveArrows, setShowMoveArrows] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [hoveredLinkIndex, setHoveredLinkIndex] = useState<number | null>(null);
  const [highlightedLinkIndex, setHighlightedLinkIndex] = useState<number | null>(null);
  const [showBirthdayCelebration, setShowBirthdayCelebration] = useState(false);
  const [birthdayPersonName, setBirthdayPersonName] = useState<string>('');
  const [birthdayAnimationStage, setBirthdayAnimationStage] = useState<number>(0); // 0: HappyBirthday, 2: Confetti
  const [isCameraMoving, setIsCameraMoving] = useState(false);
  const cameraMovingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPositionSizeExpanded, setIsPositionSizeExpanded] = useState(false);
  
  // 熊罠最高ダメージ記録管理
  const [bearTrapMaxDamage, setBearTrapMaxDamage] = useState<number>(0);
  
  // 溶鉱炉レベル画像のプリロード
  const fireLevelImagesRef = useRef<{ [key: string]: HTMLImageElement }>({});

  // 背景設定
  const [bgConfig, setBgConfig] = useState<BgConfig>({
    image: "map-bg.jpg",
    centerX: 50,
    centerY: 50,
    scale: 1.0,
    opacity: 1.0,
  });
  const [showBgConfigModal, setShowBgConfigModal] = useState(false);
  const [isBgSliderActive, setIsBgSliderActive] = useState(false); // スライダー操作中フラグ
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  
  // 熊と熊罠の画像用ref
  const bearImageRef = useRef<HTMLImageElement[]>([]); // 9種類の熊画像
  const bearTrapImageRef = useRef<HTMLImageElement | null>(null);
  
  // 個人オブジェクト追跡（ローカルストレージ）
  const [myObjectId, setMyObjectId] = useState<string | null>(null);
  const [showMyObjectSelector, setShowMyObjectSelector] = useState(false);
  const [myObjectSearchText, setMyObjectSearchText] = useState('');
  const [myObjectSortBy, setMyObjectSortBy] = useState<'name' | 'fire' | 'birthday'>('name');
  const [showFireLevelStats, setShowFireLevelStats] = useState(false);

  // テロップアニメーション用（LocalStorageで永続化）
  const [tickerHidden, setTickerHidden] = useState(false);
  const [tickerKey, setTickerKey] = useState(0); // テロップリセット用キー（データ再読み込み時のみ更新）
  const tickerStateBeforeAnimation = useRef<boolean>(false); // アニメーション前のテロップ状態を保存

  // サブマップではテロップを強制的に表示
  const isSubMap = currentMapId !== 'object';
  const effectiveTickerHidden = isSubMap ? false : tickerHidden;

  // スマホ画面判定（768px以下をモバイルとする）
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 熊罠→兵士アニメーション用
  type SoldierAnimation = {
    from: { x: number; y: number; label: string }; // 出発地（都市）
    to: { x: number; y: number; label: string }; // 目的地（熊罠）
    progress: number; // 0-1のアニメーション進捗
    startTime: number; // アニメーション開始時刻
    randomSeed: number; // ダメージ計算用のランダムシード（固定）
    totalDamage?: number; // 計算済みの合計ダメージ（固定値）
    damages?: Array<{ damage: number; isCritical: boolean }>; // 個別ダメージ配列（固定値）
    recordSaved?: boolean; // 記録保存済みフラグ
    isNewRecord?: boolean; // 新記録フラグ（表示用）
    bearIndex?: number; // 使用する熊画像のインデックス（0-8）
    soldiers: Array<{ // 兵士群（複数の兵士が行進）
      offsetX: number; // 隊列のオフセット
      offsetY: number;
      delay: number; // 出発タイミングのずれ
      type: 'shield' | 'archer' | 'spear'; // 兵士の種類
    }>;
  };
  const [soldierAnimations, setSoldierAnimations] = useState<SoldierAnimation[]>([]);
  const soldierAnimationRef = useRef<number | null>(null);
  const isAnimationStartingRef = useRef<boolean>(false); // アニメーション開始中フラグ

  // 花火アニメーション用
  type Firework = {
    x: number;
    y: number;
    mapX: number; // マップ座標X
    mapY: number; // マップ座標Y
    particles: Array<{
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      x: number;
      y: number;
    }>;
    startTime: number;
  };
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const fireworksAnimationRef = useRef<number | null>(null);

  // キラキラエフェクト用
  type Sparkle = {
    x: number;
    y: number;
    mapX: number; // マップ座標X
    mapY: number; // マップ座標Y
    particles: Array<{
      offsetX: number;
      offsetY: number;
      vx: number; // 速度ベクトルX
      vy: number; // 速度ベクトルY
      size: number;
      rotation: number;
      life: number;
      maxLife: number;
      color: string;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const sparklesAnimationRef = useRef<number | null>(null);

  // 花吹雪アニメーション用
  type CherryBlossom = {
    x: number; // スクリーン座標X
    y: number; // スクリーン座標Y
    mapX: number; // マップ座標X
    mapY: number; // マップ座標Y
    particles: Array<{
      offsetX: number; // 中心からのオフセットX
      offsetY: number; // 中心からのオフセットY
      vx: number; // 速度ベクトルX
      vy: number; // 速度ベクトルY
      size: number;
      rotation: number;
      life: number;
      maxLife: number;
      color: string;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [cherryBlossoms, setCherryBlossoms] = useState<CherryBlossom[]>([]);
  const cherryBlossomsAnimationRef = useRef<number | null>(null);

  // 隕石アニメーション用
  type Meteor = {
    x: number; // スクリーン座標X（開始位置）
    y: number; // スクリーン座標Y（開始位置）
    meteors: Array<{
      offsetX: number;
      offsetY: number;
      vx: number; // 横方向速度
      vy: number; // 縦方向速度
      size: number; // 大きさ（1=大、0.5=小）
      rotation: number;
      swayOffset: number; // 揺れのオフセット
      swaySpeed: number; // 揺れの速度
      life: number;
    }>;
    startTime: number;
  };
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const meteorsAnimationRef = useRef<number | null>(null);
  const meteorImageRef = useRef<HTMLImageElement | null>(null);

  // コインアニメーション用
  type CoinDrop = {
    x: number; // スクリーン座標X（開始位置）
    y: number; // スクリーン座標Y（開始位置）
    coins: Array<{
      offsetX: number;
      offsetY: number;
      vx: number; // 横方向速度
      vy: number; // 縦方向速度（初速）
      rotation: number;
      rotationSpeed: number; // 回転速度
      rotationAxis: 'x' | 'y' | 'z'; // 回転軸（縦回転、横回転、斜め回転）
      rotationAngle: number; // 3D回転角度
      size: number; // 大きさ（1=通常、1.5=大当たり）
      life: number;
      isJackpot: boolean; // 大当たりかどうか
    }>;  
    startTime: number;
    totalCoins: number; // このドロップで獲得したコイン枚数
    textPhysics?: { // 「+N枚」テキストの物理演算
      x: number;
      y: number;
      vx: number;
      vy: number;
    };
  };
  const [coinDrops, setCoinDrops] = useState<CoinDrop[]>([]);
  const coinDropsAnimationRef = useRef<number | null>(null);
  const coinImageRef = useRef<HTMLImageElement | null>(null);
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [fishQuizConsecutiveCorrect, setFishQuizConsecutiveCorrect] = useState<number>(0);
  const [yojijukugoQuizConsecutiveCorrect, setYojijukugoQuizConsecutiveCorrect] = useState<number>(0);
  const [englishQuizConsecutiveCorrect, setEnglishQuizConsecutiveCorrect] = useState<number>(0);

  // スロットアニメーション用
  type SlotAnimation = {
    x: number; // スクリーン座標X
    y: number; // スクリーン座標Y
    reels: Array<{
      symbols: string[]; // 絵柄配列
      offset: number; // リールのオフセット
      speed: number; // 回転速度
      stopping: boolean; // 停止中か
      stopped: boolean; // 停止完了か
      finalIndex: number; // 最終的に止まる絵柄のインデックス
      stopTime: number; // 停止開始時刻
    }>;
    startTime: number;
    result: string[]; // 結果（3つの絵柄）
    payout: number; // 配当
    isWin: boolean; // 当たりかどうか
  };
  const [slotAnimations, setSlotAnimations] = useState<SlotAnimation[]>([]);
  const slotAnimationsRef = useRef<number | null>(null);

  // 魚クイズアニメーション用
  type FishQuizState = {
    x: number; // スクリーン座標X
    y: number; // スクリーン座標Y
    question: FishQuestion;
    choices: string[];
    state: 'showing' | 'answering' | 'correct' | 'wrong' | 'insufficient_coins';
    selectedAnswer: string | null;
    startTime: number;
    reward: number;
    consecutiveCount: number; // 連続正解数
  };
  const [fishQuiz, setFishQuiz] = useState<FishQuizState | null>(null);

  // 四字熟語クイズアニメーション用
  type YojijukugoQuizState = {
    x: number; // スクリーン座標X
    y: number; // スクリーン座標Y
    question: YojijukugoQuestion;
    choices: string[];
    state: 'showing' | 'answering' | 'correct' | 'wrong' | 'insufficient_coins';
    selectedAnswer: string | null;
    startTime: number;
    reward: number;
    consecutiveCount: number; // 連続正解数
  };
  const [yojijukugoQuiz, setYojijukugoQuiz] = useState<YojijukugoQuizState | null>(null);

  // 英単語クイズアニメーション用
  type EnglishQuizState = {
    x: number; // スクリーン座標X
    y: number; // スクリーン座標Y
    question: EnglishQuestion;
    choices: string[];
    state: 'showing' | 'answering' | 'correct' | 'wrong' | 'insufficient_coins';
    selectedAnswer: string | null;
    startTime: number;
    reward: number;
    consecutiveCount: number; // 連続正解数
  };
  const [englishQuiz, setEnglishQuiz] = useState<EnglishQuizState | null>(null);

  // 猫アニメーション用
  type CatAnimation = {
    from: { x: number; y: number }; // 出発地（マップ座標）
    to: { x: number; y: number }; // 目的地（マップ座標）
    progress: number; // 0-1のアニメーション進捗
    startTime: number; // アニメーション開始時刻
    pawPrints: Array<{ // 足跡の配列
      x: number; // マップ座標X
      y: number; // マップ座標Y
      rotation: number; // 回転角度（ラジアン）
      scale: number; // スケール
      alpha: number; // 透明度
    }>;
    showCat: boolean; // 猫を表示するか
    catAlpha: number; // 猫の透明度
  };
  const [catAnimations, setCatAnimations] = useState<CatAnimation[]>([]);
  const catAnimationsDataRef = useRef<CatAnimation[]>([]); // 最新のアニメーションデータ
  const catAnimationRef = useRef<number | null>(null);
  const catImageRef = useRef<HTMLImageElement | null>(null);
  const pawImageRef = useRef<HTMLImageElement | null>(null);

  // バルーンアニメーション用
  type BalloonAnimation = {
    x: number; // スクリーン座標X
    y: number; // スクリーン座標Y
    balloons: Array<{
      offsetX: number;
      offsetY: number;
      vy: number; // 上昇速度
      swayOffset: number; // 揺れのオフセット
      swaySpeed: number; // 揺れの速度
      size: number; // 大きさ
      color: string; // 色
      life: number; // 残り寿命
      stringLength: number; // 紐の長さ
    }>;
    startTime: number;
  };
  const [balloonAnimations, setBalloonAnimations] = useState<BalloonAnimation[]>([]);
  const balloonAnimationRef = useRef<number | null>(null);

  // オーロラアニメーション用
  type AuroraAnimation = {
    waves: Array<{
      offsetY: number; // Y方向のオフセット
      amplitude: number; // 波の振幅
      frequency: number; // 波の周波数
      speed: number; // 波の速度
      phase: number; // 波の位相
      color: string; // グラデーション色
      alpha: number; // 透明度
    }>;
    startTime: number;
    life: number; // 残り寿命
  };
  const [auroraAnimations, setAuroraAnimations] = useState<AuroraAnimation[]>([]);
  const auroraAnimationRef = useRef<number | null>(null);

  // 蝶々アニメーション用
  type ButterflyAnimation = {
    butterflies: Array<{
      x: number; // スクリーン座標X
      y: number; // スクリーン座標Y
      vx: number; // X方向速度
      vy: number; // Y方向速度
      angle: number; // 進行方向角度
      flutterPhase: number; // 羽ばたき位相
      flutterSpeed: number; // 羽ばたき速度
      size: number; // 大きさ
      color: string; // 色
      life: number; // 残り寿命
      pathType: 'figure8' | 'random'; // 動きのパターン
      pathProgress: number; // パターンの進捗
    }>;
    startTime: number;
  };
  const [butterflyAnimations, setButterflyAnimations] = useState<ButterflyAnimation[]>([]);
  const butterflyAnimationRef = useRef<number | null>(null);

  // 流れ星アニメーション用
  type ShootingStarAnimation = {
    stars: Array<{
      x: number; // スクリーン座標X（開始位置）
      y: number; // スクリーン座標Y（開始位置）
      vx: number; // X方向速度
      vy: number; // Y方向速度
      length: number; // 尾の長さ
      brightness: number; // 明るさ
      life: number; // 残り寿命
      trailPoints: Array<{ x: number; y: number; alpha: number }>; // 尾の軌跡
    }>;
    startTime: number;
  };
  const [shootingStarAnimations, setShootingStarAnimations] = useState<ShootingStarAnimation[]>([]);
  const shootingStarAnimationRef = useRef<number | null>(null);

  // 紅葉アニメーション用
  type AutumnLeavesAnimation = {
    x: number; // スクリーン座標X
    y: number; // スクリーン座標Y
    leaves: Array<{
      offsetX: number;
      offsetY: number;
      vx: number; // 横方向速度
      vy: number; // 縦方向速度
      rotation: number; // 回転角度
      rotationSpeed: number; // 回転速度
      swayOffset: number; // 揺れ
      swaySpeed: number; // 揺れ速度
      size: number; // 大きさ
      color: string; // 色（赤、黄、橙）
      leafType: 'maple' | 'ginkgo' | 'oak'; // 葉の種類
      life: number;
    }>;
    startTime: number;
  };
  const [autumnLeavesAnimations, setAutumnLeavesAnimations] = useState<AutumnLeavesAnimation[]>([]);
  const autumnLeavesAnimationRef = useRef<number | null>(null);

  // 雪アニメーション用
  type SnowAnimation = {
    snowflakes: Array<{
      x: number; // スクリーン座標X
      y: number; // スクリーン座標Y
      vx: number; // 横方向速度
      vy: number; // 縦方向速度
      size: number; // 大きさ
      rotation: number; // 回転角度
      rotationSpeed: number; // 回転速度
      swayOffset: number; // 揺れ
      swaySpeed: number; // 揺れ速度
      opacity: number; // 透明度
      life: number;
    }>;
    startTime: number;
    duration: number; // 継続時間
  };
  const [snowAnimations, setSnowAnimations] = useState<SnowAnimation[]>([]);
  const snowAnimationRef = useRef<number | null>(null);

  // 紙吹雪アニメーション用（強化版）
  type ConfettiAnimation = {
    x: number; // スクリーン座標X
    y: number; // スクリーン座標Y
    confetti: Array<{
      offsetX: number;
      offsetY: number;
      vx: number; // 横方向速度
      vy: number; // 縦方向速度
      rotation: number; // 回転角度
      rotationSpeed: number; // 回転速度
      width: number; // 幅
      height: number; // 高さ
      color: string; // 色
      shape: 'rectangle' | 'circle' | 'star'; // 形状
      life: number;
    }>;
    startTime: number;
  };
  const [confettiAnimations, setConfettiAnimations] = useState<ConfettiAnimation[]>([]);
  const confettiAnimationRef = useRef<number | null>(null);

  // 虹アニメーション用
  type RainbowAnimation = {
    x: number; // スクリーン座標X（中心）
    y: number; // スクリーン座標Y（アーチの底）
    radius: number; // 虹の半径
    width: number; // 虹の幅
    alpha: number; // 透明度
    life: number; // 残り寿命
    startTime: number;
  };
  const [rainbowAnimations, setRainbowAnimations] = useState<RainbowAnimation[]>([]);
  const rainbowAnimationRef = useRef<number | null>(null);

  // 雨アニメーション用
  type RainAnimation = {
    raindrops: Array<{
      x: number; // スクリーン座標X
      y: number; // スクリーン座標Y
      vy: number; // 落下速度
      length: number; // 雨粒の長さ
      opacity: number; // 透明度
      splash: boolean; // 地面に当たったか
      splashProgress: number; // 跳ね返り進捗
      life: number;
    }>;
    startTime: number;
    duration: number; // 継続時間
  };
  const [rainAnimations, setRainAnimations] = useState<RainAnimation[]>([]);
  const rainAnimationRef = useRef<number | null>(null);

  // 魔法陣アニメーション用
  type MagicCircleAnimation = {
    x: number; // スクリーン座標X
    y: number; // スクリーン座標Y
    mapX: number; // マップ座標X
    mapY: number; // マップ座標Y
    radius: number; // 魔法陣の半径
    rotation: number; // 回転角度
    rotationSpeed: number; // 回転速度
    alpha: number; // 透明度
    life: number; // 残り寿命
    glowIntensity: number; // 発光の強さ
    startTime: number;
    targetObj: Obj;
  };
  const [magicCircleAnimations, setMagicCircleAnimations] = useState<MagicCircleAnimation[]>([]);
  const magicCircleAnimationRef = useRef<number | null>(null);

  // 炎アニメーション用
  type FlameAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    flames: Array<{
      offsetX: number;
      offsetY: number;
      size: number;
      vy: number;
      opacity: number;
      color: string;
      life: number;
      flicker: number;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [flameAnimations, setFlameAnimations] = useState<FlameAnimation[]>([]);
  const flameAnimationRef = useRef<number | null>(null);

  // 雷アニメーション用
  type ThunderAnimation = {
    segments: Array<{
      x: number;
      y: number;
      endX: number;
      endY: number;
      alpha: number;
      thickness: number;
    }>;
    startTime: number;
    life: number;
  };
  const [thunderAnimations, setThunderAnimations] = useState<ThunderAnimation[]>([]);
  const thunderAnimationRef = useRef<number | null>(null);

  // 波/水しぶきアニメーション用
  type WaveAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    drops: Array<{
      offsetX: number;
      offsetY: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      life: number;
    }>;
    rings: Array<{
      radius: number;
      alpha: number;
      speed: number;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [waveAnimations, setWaveAnimations] = useState<WaveAnimation[]>([]);
  const waveAnimationRef = useRef<number | null>(null);

  // 風/葉アニメーション用
  type WindAnimation = {
    leaves: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      life: number;
      color: string;
    }>;
    startTime: number;
    duration: number;
  };
  const [windAnimations, setWindAnimations] = useState<WindAnimation[]>([]);
  const windAnimationRef = useRef<number | null>(null);

  // 煙/霧アニメーション用
  type SmokeAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    clouds: Array<{
      offsetX: number;
      offsetY: number;
      size: number;
      vy: number;
      opacity: number;
      expansion: number;
      life: number;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [smokeAnimations, setSmokeAnimations] = useState<SmokeAnimation[]>([]);
  const smokeAnimationRef = useRef<number | null>(null);

  // 竜巻アニメーション用
  type TornadoAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    particles: Array<{
      angle: number;
      height: number;
      radius: number;
      speed: number;
      size: number;
      opacity: number;
    }>;
    rotation: number;
    startTime: number;
    life: number;
    targetObj: Obj;
  };
  const [tornadoAnimations, setTornadoAnimations] = useState<TornadoAnimation[]>([]);
  const tornadoAnimationRef = useRef<number | null>(null);

  // 宝石アニメーション用
  type GemAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    gems: Array<{
      offsetX: number;
      offsetY: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      color: string;
      sparkle: number;
      life: number;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [gemAnimations, setGemAnimations] = useState<GemAnimation[]>([]);
  const gemAnimationRef = useRef<number | null>(null);

  // 星の軌跡アニメーション用
  type StarTrailAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    stars: Array<{
      angle: number;
      radius: number;
      size: number;
      speed: number;
      trail: Array<{ x: number; y: number; alpha: number }>;
      color: string;
    }>;
    rotation: number;
    startTime: number;
    life: number;
    targetObj: Obj;
  };
  const [starTrailAnimations, setStarTrailAnimations] = useState<StarTrailAnimation[]>([]);
  const starTrailAnimationRef = useRef<number | null>(null);

  // 光の粒アニメーション用
  type LightParticleAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    particles: Array<{
      offsetX: number;
      offsetY: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
      life: number;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [lightParticleAnimations, setLightParticleAnimations] = useState<LightParticleAnimation[]>([]);
  const lightParticleAnimationRef = useRef<number | null>(null);

  // スパイラルアニメーション用
  type SpiralAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    particles: Array<{
      angle: number;
      radius: number;
      height: number;
      size: number;
      color: string;
      opacity: number;
    }>;
    rotation: number;
    expansion: number;
    startTime: number;
    life: number;
    targetObj: Obj;
  };
  const [spiralAnimations, setSpiralAnimations] = useState<SpiralAnimation[]>([]);
  const spiralAnimationRef = useRef<number | null>(null);

  // 鳥/羽アニメーション用
  type BirdAnimation = {
    birds: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      wingPhase: number;
      rotation: number;
      life: number;
    }>;
    feathers: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      size: number;
      opacity: number;
      life: number;
    }>;
    startTime: number;
    duration: number;
  };
  const [birdAnimations, setBirdAnimations] = useState<BirdAnimation[]>([]);
  const birdAnimationRef = useRef<number | null>(null);

  // ゴーストアニメーション用
  type GhostAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    ghosts: Array<{
      offsetX: number;
      offsetY: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      wavePhase: number;
      life: number;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [ghostAnimations, setGhostAnimations] = useState<GhostAnimation[]>([]);
  const ghostAnimationRef = useRef<number | null>(null);

  // 蜂アニメーション用
  type BeeAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    bees: Array<{
      offsetX: number;
      offsetY: number;
      angle: number;
      radius: number;
      speed: number;
      wingPhase: number;
      size: number;
      life: number;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [beeAnimations, setBeeAnimations] = useState<BeeAnimation[]>([]);
  const beeAnimationRef = useRef<number | null>(null);

  // 蛍アニメーション用
  type FireflyAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    fireflies: Array<{
      offsetX: number;
      offsetY: number;
      vx: number;
      vy: number;
      glow: number;
      glowPhase: number;
      size: number;
      life: number;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [fireflyAnimations, setFireflyAnimations] = useState<FireflyAnimation[]>([]);
  const fireflyAnimationRef = useRef<number | null>(null);

  // 爆発アニメーション用
  type ExplosionAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    particles: Array<{
      offsetX: number;
      offsetY: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      opacity: number;
      life: number;
    }>;
    shockwave: {
      radius: number;
      alpha: number;
    };
    flash: number;
    startTime: number;
    targetObj: Obj;
  };
  const [explosionAnimations, setExplosionAnimations] = useState<ExplosionAnimation[]>([]);
  const explosionAnimationRef = useRef<number | null>(null);

  // ターゲットアニメーション用
  type TargetAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    rings: Array<{
      radius: number;
      alpha: number;
      speed: number;
    }>;
    crosshair: {
      size: number;
      rotation: number;
      alpha: number;
    };
    startTime: number;
    life: number;
    targetObj: Obj;
  };
  const [targetAnimations, setTargetAnimations] = useState<TargetAnimation[]>([]);
  const targetAnimationRef = useRef<number | null>(null);

  // 怒りマークアニメーション用
  type AngerAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    marks: Array<{
      offsetX: number;
      offsetY: number;
      size: number;
      rotation: number;
      opacity: number;
      bounce: number;
      life: number;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [angerAnimations, setAngerAnimations] = useState<AngerAnimation[]>([]);
  const angerAnimationRef = useRef<number | null>(null);

  // 花びらアニメーション用
  type PetalAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    petals: Array<{
      offsetX: number;
      offsetY: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      size: number;
      color: string;
      opacity: number;
      life: number;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [petalAnimations, setPetalAnimations] = useState<PetalAnimation[]>([]);
  const petalAnimationRef = useRef<number | null>(null);

  // ひまわりアニメーション用
  type SunflowerAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    flowers: Array<{
      offsetX: number;
      offsetY: number;
      size: number;
      rotation: number;
      growth: number;
      opacity: number;
      life: number;
    }>;
    seeds: Array<{
      offsetX: number;
      offsetY: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      life: number;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [sunflowerAnimations, setSunflowerAnimations] = useState<SunflowerAnimation[]>([]);
  const sunflowerAnimationRef = useRef<number | null>(null);

  // バラアニメーション用
  type RoseAnimation = {
    x: number;
    y: number;
    mapX: number;
    mapY: number;
    petals: Array<{
      offsetX: number;
      offsetY: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      size: number;
      layer: number;
      opacity: number;
      life: number;
    }>;
    sparkles: Array<{
      offsetX: number;
      offsetY: number;
      size: number;
      opacity: number;
      life: number;
    }>;
    startTime: number;
    targetObj: Obj;
  };
  const [roseAnimations, setRoseAnimations] = useState<RoseAnimation[]>([]);
  const roseAnimationRef = useRef<number | null>(null);

  // カメラ：パン(tx,ty)は「画面座標系」での移動量（ピクセル）、scaleは倍率
  // 初期ズーム: 統一して1.0でスタート（SSRハイドレーションエラー回避）
  const [cam, setCam] = useState({ 
    tx: 0, 
    ty: 0, 
    scale: 1.0 
  });

  // 最高ダメージ記録をlocalStorageから読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bearTrapMaxDamage');
      if (stored) {
        setBearTrapMaxDamage(parseInt(stored, 10));
      }
    } catch (e) {
      console.error('Failed to load bearTrapMaxDamage:', e);
    }
  }, []);

  // コインの合計枚数をlocalStorageから読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem('totalCoins');
      if (stored) {
        setTotalCoins(parseInt(stored, 10));
      }
    } catch (e) {
      console.error('Failed to load totalCoins:', e);
    }
  }, []);

  // 溶鉱炉レベル画像のプリロード
  useEffect(() => {
    const basePath = process.env.NODE_ENV === 'production' ? '/SNW_Home' : '';
    const imagesToLoad = ['FC1', 'FC2', 'FC3', 'FC4', 'FC5', 'FC6', 'FC7', 'FC8', 'FC9', 'FC10'];
    imagesToLoad.forEach(name => {
      const img = new Image();
      img.src = `${basePath}/fire-levels/${name}.webp`;
      fireLevelImagesRef.current[name] = img;
    });
  }, []);

  // 隕石画像のプリロード
  useEffect(() => {
    const basePath = process.env.NODE_ENV === 'production' ? '/SNW_Home' : '';
    const img = new Image();
    img.src = `${basePath}/meteor.webp`;
    img.onload = () => {
      meteorImageRef.current = img;
    };
  }, []);

  // コイン画像のプリロード
  useEffect(() => {
    const basePath = process.env.NODE_ENV === 'production' ? '/SNW_Home' : '';
    const img = new Image();
    img.src = `${basePath}/coin.webp`;
    img.onload = () => {
      coinImageRef.current = img;
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // 初回のみ、モバイルの場合にズームを調整
      setCam(prev => {
        if (prev.scale === 1.0 && mobile) {
          return { ...prev, scale: 0.78 };
        }
        return prev;
      });
    };
    const checkDarkMode = () => {
      const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(darkMode);
    };
    
    checkMobile();
    checkDarkMode();
    
    window.addEventListener('resize', checkMobile);
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', checkDarkMode);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      darkModeQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 個人オブジェクトIDを読み込み（これは個人設定なのでlocalStorageのまま）
      const savedMyObjectId = localStorage.getItem('snw-my-object-id');
      if (savedMyObjectId) {
        setMyObjectId(savedMyObjectId);
      }
    }
  }, []);

  // 背景画像の読み込み
  useEffect(() => {
    if (bgConfig.image) {
      const img = new Image();
      img.src = `${basePath}/${bgConfig.image}`;
      img.onload = () => {
        bgImageRef.current = img;
        draw(); // 画像読み込み完了後に再描画
      };
      img.onerror = () => {
        console.error('Failed to load background image:', bgConfig.image);
        bgImageRef.current = null;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgConfig.image]);

  // 熊と熊罠の画像を読み込み
  useEffect(() => {
    // 9種類の熊画像をロード
    const bearImages: HTMLImageElement[] = new Array(9);
    let loadedCount = 0;
    
    for (let i = 1; i <= 9; i++) {
      const bearImg = new Image();
      const numStr = i.toString().padStart(2, '0');
      bearImg.src = `${basePath}/bear-img-${numStr}.webp`;
      const index = i - 1;
      bearImg.onload = () => {
        bearImages[index] = bearImg;
        loadedCount++;
        if (loadedCount === 9) {
          bearImageRef.current = bearImages;
          draw();
        }
      };
    }
    
    const trapImg = new Image();
    trapImg.src = `${basePath}/bear-trap-img.webp`;
    trapImg.onload = () => {
      bearTrapImageRef.current = trapImg;
      draw();
    };
    
    // 猫と足跡の画像読み込み
    const catImg = new Image();
    catImg.src = `${basePath}/cat.webp`;
    catImg.onload = () => {
      catImageRef.current = catImg;
      draw();
    };
    catImg.onerror = (e) => {
      console.error('猫画像読み込みエラー:', e);
    };
    
    const pawImg = new Image();
    pawImg.src = `${basePath}/paw.webp`;
    pawImg.onload = () => {
      pawImageRef.current = pawImg;
      draw();
    };
    pawImg.onerror = (e) => {
      console.error('足跡画像読み込みエラー:', e);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 背景設定変更時の再描画
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgConfig.centerX, bgConfig.centerY, bgConfig.scale, bgConfig.opacity]);

  // ウィンドウリサイズ時の再描画
  useEffect(() => {
    const handleResize = () => {
      // リサイズ時に強制的に再描画をトリガー
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        draw();
        rafRef.current = null;
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cam, objects, selectedId, isEditMode, showMoveArrows]);

  // LocalStorageからテロップ表示状態を読み込む
  useEffect(() => {
    const saved = localStorage.getItem('tickerHidden');
    if (saved !== null) {
      setTickerHidden(saved === 'true');
    }
  }, []);

  // tickerHiddenが変わったらLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('tickerHidden', String(tickerHidden));
  }, [tickerHidden]);

  // トースト自動消去
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // テロップはCSS keyframesで実装（state更新なし）
  // useEffect削除

  // テロップテキスト生成（HTML表示用）
  const tickerText = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    
    const getBirthdayMembers = (month: number) => {
      return objects
        .filter(obj => {
          if (!obj.birthday) return false;
          const match = obj.birthday.match(/(\d+)月/);
          if (!match) return false;
          const birthMonth = parseInt(match[1], 10);
          return birthMonth === month;
        })
        .map(obj => ({
          name: obj.label || '名前なし',
          date: obj.birthday!,
          day: parseInt(obj.birthday!.match(/(\d+)日/)?.[1] || '0', 10)
        }))
        .sort((a, b) => a.day - b.day);
    };
    
    const currentMonthMembers = getBirthdayMembers(currentMonth);
    const nextMonthMembers = getBirthdayMembers(nextMonth);
    
    const parts: string[] = [];
    if (currentMonthMembers.length > 0) {
      const memberList = currentMonthMembers.map(m => `${m.date} ${m.name}さん`).join('　');
      parts.push(`今月お誕生日を迎えるメンバーは・・・${memberList}です。　　お誕生日おめでとうございます。`);
    }
    if (nextMonthMembers.length > 0) {
      const memberList = nextMonthMembers.map(m => `${m.date} ${m.name}さん`).join('　');
      parts.push(`来月お誕生日を迎えるメンバーは・・・${memberList}です。`);
    }
    
    return parts.join('　　　　');
  }, [objects]);

  // 誕生日チェック（選択されたオブジェクトのbirthdayフィールドをチェックし、現在の月と一致すれば紙吹雪表示）
  useEffect(() => {
    if (selectedId) {
      const selectedObj = objects.find(o => String(o.id) === selectedId);
      if (selectedObj && selectedObj.birthday) {
        // M月D日 または MM月DD日 のパターンを検出（🎂なし）
        const birthdayPattern = /(\d{1,2})月(\d{1,2})日/;
        const match = selectedObj.birthday.match(birthdayPattern);
        if (match) {
          const birthdayMonth = parseInt(match[1], 10);
          const currentMonth = new Date().getMonth() + 1; // 0-11 → 1-12
          if (birthdayMonth === currentMonth) {
            setBirthdayPersonName((selectedObj as any).name || '');
            setBirthdayAnimationStage(0); // アニメーションを最初から開始
            setShowBirthdayCelebration(true);
          } else {
            setShowBirthdayCelebration(false);
          }
        } else {
          setShowBirthdayCelebration(false);
        }
      } else {
        setShowBirthdayCelebration(false);
      }
    } else {
      setShowBirthdayCelebration(false);
    }
  }, [selectedId, objects]);

  // 誕生日アニメーションステージの自動進行
  useEffect(() => {
    if (!showBirthdayCelebration) return;
    
    // showBirthdayCelebrationがtrueになったら、必ずステージ0から開始
    setBirthdayAnimationStage(0);
    
    // Happy Birthday表示後、2.5秒でステージ2（紙吹雪）へ
    const timer = setTimeout(() => setBirthdayAnimationStage(2), 2500);
    return () => clearTimeout(timer);
  }, [showBirthdayCelebration]);

  // 編集モーダルが開いたときに名前入力欄にフォーカス（一度だけ）
  // selectedIdが変わったときのみフォーカス（同じオブジェクトの編集中は再フォーカスしない）
  const lastFocusedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (editingObject && selectedId && selectedId !== lastFocusedIdRef.current) {
      lastFocusedIdRef.current = selectedId;
      
      // FLAG, MOUNTAIN, LAKEの場合は読み取り専用なのでフォーカスしない
      const isReadOnly = editingObject.type === "FLAG" || editingObject.type === "MOUNTAIN" || editingObject.type === "LAKE";
      if (!isReadOnly && nameInputRef.current) {
        // モーダルのアニメーションを考慮して少し遅延
        setTimeout(() => {
          const input = nameInputRef.current;
          if (input) {
            input.focus();
            // カーソルを末尾に配置
            const length = input.value.length;
            input.setSelectionRange(length, length);
          }
        }, 100);
      }
    } else if (!editingObject) {
      // モーダルが閉じてもlastFocusedIdRefはリセットしない（次に同じオブジェクトを開いたときに再フォーカスしないため）
    }
  }, [selectedId, editingObject]);

  // ヘッダーメニューの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showHeaderMenu && headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setShowHeaderMenu(false);
      }
    };
    if (showHeaderMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showHeaderMenu]);

  // ジェスチャ状態（ピンチ）
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<null | {
    startScale: number;
    startTx: number;
    startTy: number;
    startMid: { x: number; y: number };
    startDist: number;
  }>(null);

  // 現在のマップがベースマップかどうか
  const isBaseMap = useMemo(() => {
    const current = mapConfigs.find(m => m.id === currentMapId);
    return current?.isBase ?? true;
  }, [mapConfigs, currentMapId]);
  
  const cfg = useMemo(
    () => ({
      cols: num(meta.cols, FALLBACK.cols),
      rows: num(meta.rows, FALLBACK.rows),
      cell: num(meta.cellSize, FALLBACK.cellSize),
      name: String(meta.mapName || "SNW Map"),
    }),
    [meta]
  );

  // 現在のマップ設定を取得
  const currentMap = useMemo(() => {
    return mapConfigs.find(m => m.id === currentMapId);
  }, [mapConfigs, currentMapId]);

  // 表示可能なマップ一覧（参照モード時は表示中のもののみ）
  const visibleMaps = useMemo(() => {
    if (isEditMode) {
      return mapConfigs;  // 編集モードでは全マップ表示
    }
    return mapConfigs.filter(m => m.isVisible);  // 参照モードでは表示設定のもののみ
  }, [mapConfigs, isEditMode]);

  // 見た目（実機寄せ）
  const LOOK = useMemo(
    () => ({
      angle: -Math.PI / 4, // 45°
      padding: 40,

      // グリッド
      grid: "rgba(0,0,0,0.06)",
      gridMajor: "rgba(0,0,0,0.10)",
      majorEvery: 5,

      // 選択表現
      glowColor: "rgba(80,160,255,0.55)",
      ringColor: "rgba(80,160,255,0.90)",
    }),
    []
  );

  // マップ設定を取得
  async function loadMapConfigs() {
    try {
      const base = process.env.NEXT_PUBLIC_GAS_URL;
      if (!base) return;
      
      const res = await fetch(`${base}?action=getMaps`, { method: "GET" });
      const json = await res.json();
      if (json.ok && Array.isArray(json.maps)) {
        setMapConfigs(json.maps);
      }
    } catch (e) {
      console.error("マップ設定の取得に失敗:", e);
    }
  }

  // マップを切り替える
  async function switchMap(mapId: string) {
    if (mapId === currentMapId) return;
    
    // 未保存の変更がある場合は警告
    if (isEditMode && hasUnsavedChanges) {
      if (!confirm('未保存の変更があります。マップを切り替えますか？')) {
        return;
      }
    }
    
    setCurrentMapId(mapId);
    await loadMap(mapId);
    setShowMapSelector(false);
    setShowHeaderMenu(false);
  }

  async function loadMap(mapId?: string) {
    const targetMapId = mapId || currentMapId;
    setIsLoading(true);
    try {
      setErr(null);
      const base = process.env.NEXT_PUBLIC_GAS_URL;
      if (!base) {
        throw new Error(
          "Google Apps ScriptのURLが設定されていません。.env.localファイルにNEXT_PUBLIC_GAS_URLを設定してください。"
        );
      }

      const res = await fetch(`${base}?action=getMap&mapId=${targetMapId}`, { method: "GET" });
      const json = await res.json();
      if (!json.ok) {
        // マップが見つからない場合、ベースマップにフォールバック
        if (json.error === 'Map not found' && targetMapId !== 'object') {
          console.warn(`マップ ${targetMapId} が見つかりません。ベースマップにフォールバックします。`);
          setCurrentMapId('object');
          localStorage.setItem('currentMapId', 'object');
          return loadMap('object');
        }
        throw new Error(json.error || "マップデータの取得に失敗しました");
      }

      setMeta(json.meta || {});
      setObjects(Array.isArray(json.objects) ? json.objects : []);
      
      // 背景設定をmetaから読み込み（metaに設定がある場合のみ）
      if (json.meta) {
        const newBgConfig: BgConfig = {
          image: json.meta.bgImage || "map-bg.jpg",
          centerX: json.meta.bgCenterX ?? 50,
          centerY: json.meta.bgCenterY ?? 50,
          scale: json.meta.bgScale ?? 1.0,
          opacity: json.meta.bgOpacity ?? 1.0,
        };
        setBgConfig(newBgConfig);
      }
      
      // リンクデータを取得
      try {
        const linksRes = await fetch(`${base}?action=getLinks`, { method: "GET" });
        const linksJson = await linksRes.json();
        if (linksJson.ok && Array.isArray(linksJson.links)) {
          setLinks(linksJson.links);
        }
      } catch (e) {
        console.error("リンクデータの取得に失敗:", e);
        // リンクの取得に失敗してもマップは表示する
      }
      
      // カメラ位置とズームを特定の座標に設定
      // マイオブジェクトが設定されている場合はその座標、なければデフォルト(18, 19)
      let targetGridX = 18;
      let targetGridY = 19;
      
      // localStorageからmyObjectIdを読み込み、該当するオブジェクトがあればその座標を使用
      if (typeof window !== 'undefined') {
        const savedMyObjectId = localStorage.getItem('snw-my-object-id');
        if (savedMyObjectId) {
          const myObj = (Array.isArray(json.objects) ? json.objects : []).find((o: Obj) => o.id === savedMyObjectId);
          if (myObj && myObj.x !== undefined && myObj.y !== undefined) {
            targetGridX = num(myObj.x, 18);
            targetGridY = num(myObj.y, 19);
          }
        }
      }
      
      const targetScale = window.innerWidth <= 768 ? 0.78 : 1.0;
      
      // メタデータから設定を取得
      const cols = num(json.meta?.cols, FALLBACK.cols);
      const rows = num(json.meta?.rows, FALLBACK.rows);
      const cell = num(json.meta?.cellSize, FALLBACK.cellSize);
      
      // マップ中心（ピクセル座標）
      const cx = (cols * cell) / 2;
      const cy = (rows * cell) / 2;
      
      // 目標位置（ピクセル座標）
      const targetX = targetGridX * cell;
      const targetY = targetGridY * cell;
      
      // マップ中心からのオフセット
      const offsetX = targetX - cx;
      const offsetY = targetY - cy;
      
      // 回転を適用（-45度）
      const angle = -Math.PI / 4;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rotatedX = offsetX * cos - offsetY * sin;
      const rotatedY = offsetX * sin + offsetY * cos;
      
      // スケールを適用してパン量を計算（逆向き）
      const tx = -rotatedX * targetScale;
      const ty = -rotatedY * targetScale;
      
      setCam({ tx, ty, scale: targetScale });
      
      // カメラ移動中フラグを設定
      setIsCameraMoving(true);
      if (cameraMovingTimerRef.current) clearTimeout(cameraMovingTimerRef.current);
      cameraMovingTimerRef.current = setTimeout(() => setIsCameraMoving(false), 200);
      
      // データ再読み込み時にテロップをリセット
      setTickerKey(prev => prev + 1);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setErr(message);
      console.error("マップ読み込みエラー:", e);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }

  useEffect(() => {
    // 初回ロード時にマップ設定を取得してから最初のマップを読み込む
    async function init() {
      await loadMapConfigs();
      await loadMap();
    }
    init();
  }, []);

  // キャンバスのホイールイベントでページスクロールを防止 & ズーム機能
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // ズーム処理
      const delta = -e.deltaY;
      const factor = delta > 0 ? 1.08 : 0.92;
      
      setCam((prev) => {
        const newScale = clamp(prev.scale * factor, 0.35, 2.5);
        return { ...prev, scale: newScale };
      });
      
      // カメラ移動中フラグを設定
      setIsCameraMoving(true);
      if (cameraMovingTimerRef.current) clearTimeout(cameraMovingTimerRef.current);
      cameraMovingTimerRef.current = setTimeout(() => setIsCameraMoving(false), 200);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  // キーボードショートカット（Ctrl+Z, Ctrl+Y）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditMode) return;
      
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, undoStack, redoStack, objects]);

  // 描画要求（rafで間引き）
  const requestDraw = () => {
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
  };

  // 変換（スクリーン→マップ座標）: タップ選択の当たり判定で使う
  const screenToMap = (sx: number, sy: number, viewW: number, viewH: number) => {
    const mapW = cfg.cols * cfg.cell;
    const mapH = cfg.rows * cfg.cell;
    const cx = mapW / 2;
    const cy = mapH / 2;

    // 画面中心へ
    let x = sx - viewW / 2;
    let y = sy - viewH / 2;

    // パンを戻す
    x -= cam.tx;
    y -= cam.ty;

    // スケールを戻す
    x /= cam.scale;
    y /= cam.scale;

    // 回転を戻す（逆回転）
    const p = rot(x, y, -LOOK.angle);

    // マップ中心を戻す
    return { mx: p.x + cx, my: p.y + cy };
  };

  // 変換(マップ→スクリーン座標): アニメーション描画で使う
  // mxとmyはマップ左上を原点とするピクセル座標
  const mapToScreen = (mx: number, my: number, viewW: number, viewH: number) => {
    const mapW = cfg.cols * cfg.cell;
    const mapH = cfg.rows * cfg.cell;
    const cx = mapW / 2;
    const cy = mapH / 2;

    // 描画時の変換順序と同じ:
    // ctx.translate(viewW / 2, viewH / 2);
    // ctx.translate(cam.tx, cam.ty);
    // ctx.scale(cam.scale, cam.scale);
    // ctx.rotate(LOOK.angle);
    // ctx.translate(-cx, -cy);
    // この後、座標(mx, my)を描画
    
    // 1. translate(-cx, -cy) の効果: マップ中心を引く
    let x = mx - cx;
    let y = my - cy;

    // 2. rotate(LOOK.angle)
    const cosA = Math.cos(LOOK.angle);
    const sinA = Math.sin(LOOK.angle);
    const rx = x * cosA - y * sinA;
    const ry = x * sinA + y * cosA;

    // 3. scale(cam.scale, cam.scale)
    x = rx * cam.scale;
    y = ry * cam.scale;

    // 4. translate(cam.tx, cam.ty)
    x += cam.tx;
    y += cam.ty;

    // 5. translate(viewW / 2, viewH / 2)
    return { sx: x + viewW / 2, sy: y + viewH / 2 };
  };

  // オブジェクト選択（マップ座標mx,myが矩形内か）
  const hitTest = (mx: number, my: number) => {
    // 上に描かれる(奥→手前)を優先したいので、y→x降順で当たり判定
    const sorted = [...objects].sort((a, b) => {
      const ay = num(a.y, 0), by = num(b.y, 0);
      const ax = num(a.x, 0), bx = num(b.x, 0);
      // 手前優先＝大きい方から
      return (by - ay) || (bx - ax);
    });

    for (const o of sorted) {
      const x = num(o.x, 0) * cfg.cell;
      const y = num(o.y, 0) * cfg.cell;
      const w = Math.max(1, num(o.w, 1)) * cfg.cell;
      const h = Math.max(1, num(o.h, 1)) * cfg.cell;
      if (mx >= x && mx <= x + w && my >= y && my <= y + h) return o;
    }
    return null;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // fit to CSS size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const viewW = rect.width;
    const viewH = rect.height;

    const cell = cfg.cell;
    const mapW = cfg.cols * cell;
    const mapH = cfg.rows * cell;
    const cx = mapW / 2;
    const cy = mapH / 2;

    // 背景をクリア（透明に）
    ctx.clearRect(0, 0, viewW, viewH);
    
    // 背景画像を描画（設定されている場合、ロード完了後のみ、ベースマップのみ）
    if (!isInitialLoading && bgConfig.image && bgImageRef.current && currentMapId === 'object') {
      ctx.save();
      ctx.globalAlpha = bgConfig.opacity;
      
      // 画像の実際のサイズ
      const img = bgImageRef.current;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      
      // 拡大率を適用した画像サイズ
      const scaledW = imgW * bgConfig.scale;
      const scaledH = imgH * bgConfig.scale;
      
      // 中心点の座標（%から実座標へ変換）
      const centerPointX = imgW * (bgConfig.centerX / 100);
      const centerPointY = imgH * (bgConfig.centerY / 100);
      
      // 画像の描画位置を計算（中心点がビューポート中央に来るように）
      const drawX = (viewW / 2) - (centerPointX * bgConfig.scale);
      const drawY = (viewH / 2) - (centerPointY * bgConfig.scale);
      
      ctx.drawImage(img, drawX, drawY, scaledW, scaledH);
      ctx.restore();
    }

    // ===== カメラ変換（中心→パン→ズーム→回転→マップ中心へ）=====
    ctx.save();
    ctx.translate(viewW / 2, viewH / 2);
    ctx.translate(cam.tx, cam.ty);
    ctx.scale(cam.scale, cam.scale);
    ctx.rotate(LOOK.angle);
    ctx.translate(-cx, -cy);

    // グリッド（余白含めて拡張表示）
    // 回転とズームを考慮して、画面全体をカバーする広い範囲を確保
    const gridMargin = Math.max(viewW, viewH) / cam.scale;
    const gridStartX = Math.floor(-gridMargin / cell);
    const gridEndX = Math.ceil((mapW + gridMargin) / cell);
    const gridStartY = Math.floor(-gridMargin / cell);
    const gridEndY = Math.ceil((mapH + gridMargin) / cell);

    // 縦線
    for (let x = gridStartX; x <= gridEndX; x++) {
      const major = x % LOOK.majorEvery === 0;
      ctx.strokeStyle = major ? LOOK.gridMajor : LOOK.grid;
      ctx.lineWidth = major ? 1.2 : 1;
      ctx.beginPath();
      ctx.moveTo(x * cell, gridStartY * cell);
      ctx.lineTo(x * cell, gridEndY * cell);
      ctx.stroke();
    }
    // 横線
    for (let y = gridStartY; y <= gridEndY; y++) {
      const major = y % LOOK.majorEvery === 0;
      ctx.strokeStyle = major ? LOOK.gridMajor : LOOK.grid;
      ctx.lineWidth = major ? 1.2 : 1;
      ctx.beginPath();
      ctx.moveTo(gridStartX * cell, y * cell);
      ctx.lineTo(gridEndX * cell, y * cell);
      ctx.stroke();
    }

    // サブマップでの自陣範囲を描画（本部と旗）
    if (isSubMap) {
      ctx.save();
      // 薄い青色（雪原本部の箱と同じ色）
      ctx.fillStyle = "rgba(173, 216, 230, 0.3)"; // ライトブルー
      
      for (const obj of objects) {
        const type = (obj.type || "").toUpperCase();
        const objX = num(obj.x, 0);
        const objY = num(obj.y, 0);
        const objW = num(obj.w, 1);
        const objH = num(obj.h, 1);
        
        // 本部: 3×3のオブジェクト中心に15×15の自陣
        if (type === "HQ") {
          const centerX = objX + objW / 2;
          const centerY = objY + objH / 2;
          const territorySize = 15;
          const territoryX = Math.floor(centerX - territorySize / 2);
          const territoryY = Math.floor(centerY - territorySize / 2);
          
          ctx.fillRect(
            territoryX * cell,
            territoryY * cell,
            territorySize * cell,
            territorySize * cell
          );
        }
        
        // 旗: 1×1のオブジェクト中心に7×7の自陣
        if (type === "FLAG") {
          const centerX = objX + objW / 2;
          const centerY = objY + objH / 2;
          const territorySize = 7;
          const territoryX = Math.floor(centerX - territorySize / 2);
          const territoryY = Math.floor(centerY - territorySize / 2);
          
          ctx.fillRect(
            territoryX * cell,
            territoryY * cell,
            territorySize * cell,
            territorySize * cell
          );
        }
      }
      
      ctx.restore();
    }

    // Draw order
    // 描画順：奥→手前（y→x）で自然に重なる
    const sorted = [...objects].sort((a, b) => {
      const ay = num(a.y, 0), by = num(b.y, 0);
      const ax = num(a.x, 0), bx = num(b.x, 0);
      return (ay - by) || (ax - bx);
    });

    for (const o of sorted) {
      const id = String(o.id || "");
      const gx = num(o.x, 0) * cell;
      const gy = num(o.y, 0) * cell;
      const gw = Math.max(1, num(o.w, 1)) * cell;
      const gh = Math.max(1, num(o.h, 1)) * cell;

      const th = theme(o.type || "");
      
      // 選択中のオブジェクトの重なり判定
      const isSelected = selectedId && id && selectedId === id;
      const isDraggingThis = isDragging && dragStartRef.current?.objId === id;
      const hasOverlap = isSelected && isEditMode && objects.some(other => 
        other.id !== id && checkOverlap(o, other)
      );

      // 未保存の変更を検出（編集モード時）
      // 実際に変更されたオブジェクトのみを判定
      const isModified = isEditMode && initialObjectsRef.current.length > 0 && (() => {
        const initial = initialObjectsRef.current.find(orig => orig.id === id);
        if (!initial && id.startsWith("obj_")) return true; // 新規追加
        if (!initial) return false;
        // 各プロパティを比較して実際に変更があったかチェック
        return (
          initial.x !== o.x ||
          initial.y !== o.y ||
          initial.w !== o.w ||
          initial.h !== o.h ||
          initial.type !== o.type ||
          initial.label !== o.label ||
          initial.isFavorite !== o.isFavorite
        );
      })();

      // Flat rectangle rendering
      ctx.save();
      
      // ドラッグ中の視覚的エフェクト（影と浮かび）
      if (isDraggingThis) {
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        // 少し浮かせる（左上に移動）
        ctx.translate(-2, -2);
      }
      
      // サブマップでは都市とその他のみ背景を透明に
      const type = (o.type || "").toUpperCase();
      if (isSubMap && (type === "CITY" || !type || type === "")) {
        ctx.fillStyle = "rgba(0,0,0,0)"; // 完全透明（都市とその他のみ）
      } else {
        ctx.fillStyle = hasOverlap ? "rgba(239,68,68,0.25)" : th.top;
      }
      ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeStyle = hasOverlap ? "#dc2626" : (th.stroke || "rgba(0,0,0,0.2)");
      ctx.lineWidth = hasOverlap ? 3 : (isDraggingThis ? 3 : 2);
      ctx.strokeRect(gx, gy, gw, gh);
      
      ctx.restore();

      // お気に入りエフェクト（柔らかいぼかしで表現）- オブジェクト輪郭の直後に描画
      if (o.isFavorite) {
        ctx.save();
        
        // 外側：大きなぴんくのぼかし
        ctx.shadowColor = "rgba(255, 182, 193, 0.8)"; // ライトピンク
        ctx.shadowBlur = 30;
        ctx.strokeStyle = "rgba(255, 182, 193, 0.6)";
        ctx.lineWidth = 6;
        ctx.setLineDash([]);
        ctx.strokeRect(gx - 3, gy - 3, gw + 6, gh + 6);
        
        // 中間：ピーチのぼかし
        ctx.shadowColor = "rgba(255, 218, 185, 0.9)"; // ピーチ
        ctx.shadowBlur = 20;
        ctx.strokeStyle = "rgba(255, 218, 185, 0.7)";
        ctx.lineWidth = 4;
        ctx.strokeRect(gx - 2, gy - 2, gw + 4, gh + 4);
        
        // 内側：明るいコーラルピンク
        ctx.shadowColor = "rgba(255, 127, 80, 1)"; // コーラル
        ctx.shadowBlur = 12;
        ctx.strokeStyle = "rgba(255, 160, 122, 0.9)";
        ctx.lineWidth = 3;
        ctx.strokeRect(gx - 1, gy - 1, gw + 2, gh + 2);
        
        ctx.restore();
      }
      
      // 未保存変更のマーカー（オレンジの点線枠）- お気に入りエフェクトの上に描画
      if (isModified) {
        ctx.save();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(gx - 3, gy - 3, gw + 6, gh + 6);
        ctx.setLineDash([]);
        ctx.restore();
      }

      // マイオブジェクトエフェクト（紫のふわふわ光る輝き）- ベースマップのみ
      const isMyObject = !isEditMode && !isSubMap && myObjectId && id === myObjectId;
      if (isMyObject) {
        ctx.save();
        
        // 外側：大きな紫のふわふわぼかし
        ctx.shadowColor = "rgba(181, 107, 255, 0.8)"; // CITY紫
        ctx.shadowBlur = 40;
        ctx.strokeStyle = "rgba(181, 107, 255, 0.5)";
        ctx.lineWidth = 8;
        ctx.setLineDash([]);
        ctx.strokeRect(gx - 5, gy - 5, gw + 10, gh + 10);
        
        // 中間：明るい紫のぼかし
        ctx.shadowColor = "rgba(199, 143, 255, 0.9)"; // ライトパープル
        ctx.shadowBlur = 30;
        ctx.strokeStyle = "rgba(199, 143, 255, 0.7)";
        ctx.lineWidth = 6;
        ctx.strokeRect(gx - 4, gy - 4, gw + 8, gh + 8);
        
        // 内側：濃い紫の輝き
        ctx.shadowColor = "rgba(139, 92, 246, 1)"; // バイオレット
        ctx.shadowBlur = 20;
        ctx.strokeStyle = "rgba(167, 139, 250, 0.9)";
        ctx.lineWidth = 4;
        ctx.strokeRect(gx - 3, gy - 3, gw + 6, gh + 6);
        
        // 最内側：強い紫のコア
        ctx.shadowColor = "rgba(124, 58, 237, 1)"; // ディープパープル
        ctx.shadowBlur = 12;
        ctx.strokeStyle = "rgba(147, 51, 234, 1)";
        ctx.lineWidth = 3;
        ctx.strokeRect(gx - 2, gy - 2, gw + 4, gh + 4);
        
        ctx.restore();
      }

      // Selection ring
      if (isSelected) {
        ctx.save();
        ctx.shadowColor = hasOverlap ? "rgba(220,38,38,0.6)" : LOOK.glowColor;
        ctx.shadowBlur = 18;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.strokeStyle = hasOverlap ? "#dc2626" : LOOK.ringColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(gx, gy, gw, gh);
        ctx.stroke();
        ctx.restore();

        // 重なり部分をハイライト表示
        if (hasOverlap && isEditMode) {
          objects.forEach(other => {
            if (other.id !== id) {
              const overlap = getOverlapRect(o, other);
              if (overlap) {
                const ox = overlap.x * cell;
                const oy = overlap.y * cell;
                const ow = overlap.w * cell;
                const oh = overlap.h * cell;
                ctx.save();
                ctx.fillStyle = "rgba(239,68,68,0.35)";
                ctx.fillRect(ox, oy, ow, oh);
                ctx.strokeStyle = "#dc2626";
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(ox, oy, ow, oh);
                ctx.restore();
              }
            }
          });
        }
      }

      // 文字：水平のまま（回転を打ち消す）
      const label = (o.label ?? "").trim();
      if (label) {
        const center = { x: gx + gw / 2, y: gy + gh / 2 };

        ctx.save();
        ctx.translate(center.x, center.y);

        // ★ここで回転を戻す（文字は水平）
        ctx.rotate(-LOOK.angle);

        ctx.font = "12px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 山/湖/旗以外は文字の下地（読みやすく）
        const type = (o.type || "").toUpperCase();
        const noBackground = type === "MOUNTAIN" || type === "LAKE" || type === "FLAG";
        
        if (!noBackground) {
          const padX = 8;
          const w = ctx.measureText(label).width;
          const boxW = w + padX * 2;
          const boxH = 18;

          // 既知のタイプかどうかをチェック
          const knownTypes = ["HQ", "BEAR_TRAP", "STATUE", "CITY", "DEPOT"];
          const isKnownType = knownTypes.includes(type);
          
          // その他のオブジェクトは黒背景、それ以外は白背景
          ctx.fillStyle = isKnownType ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.75)";
          ctx.strokeStyle = "rgba(0,0,0,0.10)";
          ctx.lineWidth = 1;

          const x0 = -boxW / 2;
          const y0 = -boxH / 2;
          const r = 8;

          ctx.beginPath();
          ctx.moveTo(x0 + r, y0);
          ctx.arcTo(x0 + boxW, y0, x0 + boxW, y0 + boxH, r);
          ctx.arcTo(x0 + boxW, y0 + boxH, x0, y0 + boxH, r);
          ctx.arcTo(x0, y0 + boxH, x0, y0, r);
          ctx.arcTo(x0, y0, x0 + boxW, y0, r);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // その他のオブジェクトは白文字、それ以外は黒文字
        const knownTypes = ["HQ", "BEAR_TRAP", "STATUE", "CITY", "DEPOT"];
        const isKnownType = knownTypes.includes(type);
        ctx.fillStyle = isKnownType ? "#111" : "#fff";
        ctx.fillText(label, 0, 0);

        // 溶鉱炉レベル表示（都市ドメインの名前の上に小さく表示）
        if (type === "CITY" && o.Fire) {
          const fireValue = String(o.Fire).trim();
          
          // FC1～FC10の画像表示
          if (fireValue.match(/^FC([1-9]|10)$/i)) {
            const imageName = fireValue.toUpperCase();
            const img = fireLevelImagesRef.current[imageName];
            
            if (img && img.complete) {
              const imgWidth = 22 / cam.scale; // 小さく表示
              const imgHeight = 22 / cam.scale;
              const imgY = -28 / cam.scale; // ラベルの上
              
              ctx.save();
              ctx.globalAlpha = 0.9;
              ctx.drawImage(img, -imgWidth / 2, imgY, imgWidth, imgHeight);
              ctx.restore();
            }
          }
          // 数字1～30の場合は水色の丸に白字で表示
          else if (fireValue.match(/^([1-9]|[12][0-9]|30)$/)) {
            const level = parseInt(fireValue, 10);
            ctx.save();
            
            // FCアイコンより少し小さいサイズの円を描画
            const circleSize = 18 / cam.scale;
            const circleY = -28 / cam.scale; // ラベルの上（FCと同じ位置）
            
            // 白い縁取りの円を描画
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(0, circleY + circleSize / 2, circleSize / 2 + 1.5 / cam.scale, 0, Math.PI * 2);
            ctx.fill();
            
            // ロイヤルブルーの円を描画
            ctx.fillStyle = "#4169E1"; // ロイヤルブルー
            ctx.beginPath();
            ctx.arc(0, circleY + circleSize / 2, circleSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // 白い数字を描画
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            // 数字の桁数に応じてフォントサイズを調整
            const fontSize = level >= 10 ? 9 / cam.scale : 11 / cam.scale;
            ctx.font = `bold ${fontSize}px system-ui`;
            ctx.fillText(String(level), 0, circleY + circleSize / 2);
            
            ctx.restore();
          }
        }

        ctx.restore();
      }
    }

    ctx.restore();

    // 吹き出しを一番上のレイヤーに描画（選択されたオブジェクトにbirthdayまたはnoteがある場合）
    if (selectedId) {
      const selectedObj = objects.find(o => String(o.id) === selectedId);
      const isBearTrap = selectedObj && selectedObj.type === "BEAR_TRAP";
      const hasBirthday = selectedObj && selectedObj.birthday && selectedObj.birthday.trim();
      const hasNote = selectedObj && selectedObj.note && selectedObj.note.trim();
      
      // 熊罠は吹き出し表示せず、アニメーションを優先
      if ((hasBirthday || hasNote) && !isBearTrap) {
        ctx.save();
        ctx.translate(viewW / 2, viewH / 2);
        ctx.translate(cam.tx, cam.ty);
        ctx.scale(cam.scale, cam.scale);
        ctx.rotate(LOOK.angle);
        ctx.translate(-cx, -cy);

        const gx = num(selectedObj.x, 0) * cell;
        const gy = num(selectedObj.y, 0) * cell;
        const gw = Math.max(1, num(selectedObj.w, 1)) * cell;
        const gh = Math.max(1, num(selectedObj.h, 1)) * cell;
        const center = { x: gx + gw / 2, y: gy + gh / 2 };

        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate(-LOOK.angle);

        // 半透明設定（90%）
        ctx.globalAlpha = 0.9;

        // 吹き出しの内容を作成（誕生日 + note）
        let bubbleContent = '';
        if (hasBirthday) {
          bubbleContent = `🎂 ${selectedObj.birthday}`;
        }
        if (hasNote) {
          if (bubbleContent) bubbleContent += '\n';
          bubbleContent += selectedObj.note;
        }

        // 吹き出しのサイズ計算
        ctx.font = "13px system-ui";
        const maxWidth = isMobile ? 200 : 280;
        const lines: string[] = [];
        const words = bubbleContent.split('\n');
        
        for (const word of words) {
          if (!word) {
            lines.push('');
            continue;
          }
          const wordWidth = ctx.measureText(word).width;
          if (wordWidth <= maxWidth) {
            lines.push(word);
          } else {
            let currentLine = '';
            for (let i = 0; i < word.length; i++) {
              const testLine = currentLine + word[i];
              if (ctx.measureText(testLine).width > maxWidth) {
                lines.push(currentLine);
                currentLine = word[i];
              } else {
                currentLine = testLine;
              }
            }
            if (currentLine) lines.push(currentLine);
          }
        }

        const lineHeight = 20;
        const padding = 12;
        const bubbleWidth = Math.min(maxWidth, Math.max(...lines.map(l => ctx.measureText(l).width))) + padding * 2;
        const bubbleHeight = lines.length * lineHeight + padding * 2;
        const labelBoxH = 18;
        const bubbleY = -labelBoxH / 2 - bubbleHeight - 10 / cam.scale;  // 吹き出し全体を名前に近づける

        const gradient = ctx.createLinearGradient(
          -bubbleWidth / 2, bubbleY,
          bubbleWidth / 2, bubbleY + bubbleHeight
        );
        gradient.addColorStop(0, '#fef3c7');
        gradient.addColorStop(1, '#fde68a');

        const r = 6;  // 角丸を小さく
        const x0 = -bubbleWidth / 2;
        const y0 = bubbleY;

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1 / cam.scale;  // 線を細く

        ctx.beginPath();
        ctx.moveTo(x0 + r, y0);
        ctx.arcTo(x0 + bubbleWidth, y0, x0 + bubbleWidth, y0 + bubbleHeight, r);
        ctx.arcTo(x0 + bubbleWidth, y0 + bubbleHeight, x0, y0 + bubbleHeight, r);
        ctx.arcTo(x0, y0 + bubbleHeight, x0, y0, r);
        ctx.arcTo(x0, y0, x0 + bubbleWidth, y0, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const arrowSize = 8 / cam.scale;
        const arrowOffset = 1 / cam.scale;  // 三角形を吹き出しに詰める
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-arrowSize, y0 + bubbleHeight + arrowOffset);
        ctx.lineTo(0, y0 + bubbleHeight + arrowSize + arrowOffset);
        ctx.lineTo(arrowSize, y0 + bubbleHeight + arrowOffset);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.moveTo(-arrowSize + 1 / cam.scale, y0 + bubbleHeight + arrowOffset);
        ctx.lineTo(0, y0 + bubbleHeight + arrowSize - 1 / cam.scale + arrowOffset);
        ctx.lineTo(arrowSize - 1 / cam.scale, y0 + bubbleHeight + arrowOffset);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#78350f';
        ctx.font = "13px system-ui";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        const textX = x0 + padding;
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], textX, y0 + padding + i * lineHeight);
        }

        ctx.restore();
        ctx.restore();
      }
    }

    // 長押し時の移動矢印を表示
    if (showMoveArrows && isEditMode) {
      const arrowObj = objects.find(o => String(o.id) === showMoveArrows);
      if (arrowObj) {
        ctx.save();
        ctx.translate(viewW / 2, viewH / 2);
        ctx.translate(cam.tx, cam.ty);
        ctx.scale(cam.scale, cam.scale);
        ctx.rotate(LOOK.angle);
        ctx.translate(-cx, -cy);

        const ox = num(arrowObj.x, 0) * cell;
        const oy = num(arrowObj.y, 0) * cell;
        const ow = Math.max(1, num(arrowObj.w, 1)) * cell;
        const oh = Math.max(1, num(arrowObj.h, 1)) * cell;
        const centerX = ox + ow / 2;
        const centerY = oy + oh / 2;

        // 矢印のサイズと位置
        const arrowSize = 30;
        const arrowDistance = Math.max(ow, oh) / 2 + arrowSize + 10;

        // 矢印を描画する関数
        const drawArrow = (x: number, y: number, direction: 'up' | 'down' | 'left' | 'right') => {
          ctx.save();
          ctx.translate(x, y);

          // 矢印の背景円
          ctx.fillStyle = "rgba(59, 130, 246, 0.95)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, arrowSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // 矢印の向き（マップ回転と同じ角度で表示）
          let angle = 0;
          if (direction === 'up') angle = -Math.PI / 2;
          else if (direction === 'down') angle = Math.PI / 2;
          else if (direction === 'left') angle = Math.PI;
          else if (direction === 'right') angle = 0;

          ctx.rotate(angle);

          // 矢印の形
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(-4, -6);
          ctx.lineTo(-4, 6);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        };

        // 4方向に矢印を配置
        drawArrow(centerX, centerY - arrowDistance, 'up');
        drawArrow(centerX, centerY + arrowDistance, 'down');
        drawArrow(centerX - arrowDistance, centerY, 'left');
        drawArrow(centerX + arrowDistance, centerY, 'right');

        // OKボタン（左矢印と下矢印の下）
        // -45度回転を考慮した位置：左下方向
        const okButtonDistance = arrowDistance + arrowSize + 20;
        const okButtonX = centerX - okButtonDistance / Math.sqrt(2);
        const okButtonY = centerY + okButtonDistance / Math.sqrt(2);
        const okButtonWidth = 60;
        const okButtonHeight = 32;
        
        ctx.save();
        ctx.translate(okButtonX, okButtonY);
        // ボタンをマップと同じ角度に回転
        ctx.rotate(-LOOK.angle);
        
        // OKボタンの背景
        ctx.fillStyle = "rgba(34, 197, 94, 0.95)"; // 緑色
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 2;
        
        const radius = 8;
        ctx.beginPath();
        ctx.moveTo(-okButtonWidth/2 + radius, -okButtonHeight/2);
        ctx.arcTo(okButtonWidth/2, -okButtonHeight/2, okButtonWidth/2, okButtonHeight/2, radius);
        ctx.arcTo(okButtonWidth/2, okButtonHeight/2, -okButtonWidth/2, okButtonHeight/2, radius);
        ctx.arcTo(-okButtonWidth/2, okButtonHeight/2, -okButtonWidth/2, -okButtonHeight/2, radius);
        ctx.arcTo(-okButtonWidth/2, -okButtonHeight/2, okButtonWidth/2, -okButtonHeight/2, radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // OKテキスト
        ctx.fillStyle = "white";
        ctx.font = "bold 14px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("OK", 0, 0);
        
        ctx.restore();

        ctx.restore();
      }
    }

    // HUD - オブジェクト選択時のみ表示（ID、名前、座標）
    if (selectedId) {
      const selectedObj = objects.find(o => String(o.id) === selectedId);
      if (selectedObj) {
        const x = num(selectedObj.x, 0);
        const y = num(selectedObj.y, 0);
        const w = Math.max(1, num(selectedObj.w, 1));
        const h = Math.max(1, num(selectedObj.h, 1));
        
        // ゲーム座標への変換（参考値）
        // 全サイズ共通: オブジェクトの中心座標を使用
        const centerX = x + (w - 1) / 2;
        const centerY = y + (h - 1) / 2;
        
        // 参考値としてのゲーム座標（完全な精度は保証されません）
        const gameX = Math.round(centerX + 358.5);
        
        let yOffset = 395.5; // デフォルト（2×2基準）
        if (w >= 4 && h >= 4) {
          yOffset = 411.5; // 4×4
        } else if (w >= 3 && h >= 3) {
          yOffset = 395; // 3×3
        } else if (w === 1 && h === 1) {
          yOffset = 392; // 1×1
        }
        
        const gameY = Math.round(centerY + yOffset);
        
        // HUD表示（ID、名前、座標のみ）
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.font = "12px system-ui";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        const hudText = `ID:${selectedObj.id} | ${selectedObj.label || '名前なし'} | 座標(参考): X:${gameX} Y:${gameY}`;
        ctx.fillText(hudText, viewW - 10, 10);
      }
    }

    // 誕生日テロップ（参照モード時のみ表示、ベースマップのみ）
    if (!isEditMode && currentMapId === 'object') {
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      
      // 誕生日のあるメンバーを抽出
      const getBirthdayMembers = (month: number) => {
        return objects
          .filter(obj => {
            if (!obj.birthday) return false;
            // birthday形式: "○月●日" (例: "1月10日")
            const match = obj.birthday.match(/(\d+)月/);
            if (!match) return false;
            const birthMonth = parseInt(match[1], 10);
            return birthMonth === month;
          })
          .map(obj => {
            return {
              name: obj.label || '名前なし',
              date: obj.birthday!,
              day: parseInt(obj.birthday!.match(/(\d+)日/)?.[1] || '0', 10)
            };
          })
          .sort((a, b) => {
            // 日付順にソート
            return a.day - b.day;
          });
      };
      
      const currentMonthMembers = getBirthdayMembers(currentMonth);
      const nextMonthMembers = getBirthdayMembers(nextMonth);
      
      // テロップテキストを生成（1行にまとめる）
      const parts: string[] = [];
      if (currentMonthMembers.length > 0) {
        const memberList = currentMonthMembers
          .map(m => `${m.date} ${m.name}さん`)
          .join('　'); // カンマなし、全角スペースのみ
        parts.push(`今月お誕生日を迎えるメンバーは・・・${memberList}　　お誕生日おめでとうございます。`);
      }
      if (nextMonthMembers.length > 0) {
        const memberList = nextMonthMembers
          .map(m => `${m.date} ${m.name}さん`)
          .join('　'); // カンマなし、全角スペースのみ
        parts.push(`来月お誕生日を迎えるメンバーは・・・${memberList}`);
      }
      
      // 間隔を開けて1行に結合（Canvas描画は削除、HTMLテロップで表示）
      const tickerText = parts.join('　　　　');
    }

    // 兵士アニメーションの描画（最上位レイヤー）
    if (soldierAnimations.length > 0) {
      ctx.save();
      ctx.translate(viewW / 2, viewH / 2);
      ctx.translate(cam.tx, cam.ty);
      ctx.scale(cam.scale, cam.scale);
      ctx.rotate(LOOK.angle);
      ctx.translate(-cx, -cy);

      soldierAnimations.forEach((anim) => {
        const { from, to, progress, soldiers } = anim;
        
        // オブジェクトの座標（中心）
        // 左上座標 + 幅・高さの半分で中心を計算
        const fromX = from.x * cell + cell / 2;
        const fromY = from.y * cell + cell / 2;
        const toX = to.x * cell + cell / 2;
        const toY = to.y * cell + cell / 2;
        const time = Date.now();

        // 1. 熊罠のフェードイン（progress 0.0-0.15）完了後はフェードアウト
        if (progress > 0 && progress < 0.95) {
          ctx.save();
          ctx.translate(toX, toY);
          ctx.rotate(-LOOK.angle);
          
          const bearSize = 80;
          
          // フェードイン効果
          let trapAlpha = 1.0;
          if (progress < 0.15) {
            trapAlpha = progress / 0.15; // 0-0.15で0→1
          } else if (progress > 0.85) {
            trapAlpha = 1.0 - ((progress - 0.85) / 0.15); // 0.85-1.0で1→0
          }
          
          ctx.globalAlpha = trapAlpha;
          
          // 熊罠の画像を描画
          if (bearTrapImageRef.current) {
            ctx.globalCompositeOperation = 'source-over';
            const trapWidth = bearSize * 2.5;
            const trapHeight = bearSize * 2.5;
            ctx.drawImage(
              bearTrapImageRef.current,
              -trapWidth / 2,
              -trapHeight / 2,
              trapWidth,
              trapHeight
            );
          }
          
          ctx.restore();
        }

        // 2. 熊が上から落ちてくる（progress 0.15以降、アニメ終了前に消す）
        if (progress >= 0.15 && progress < 0.95) {
          ctx.save();
          ctx.translate(toX, toY);
          ctx.rotate(-LOOK.angle);
          
          const bearSize = 80;
          
          // 熊は最初から罠の位置に表示（単純なフェードイン）
          let bearAlpha = 0;
          let bearScale = 1.0;
          
          if (progress < 0.15) {
            bearAlpha = progress / 0.15; // フェードイン（0-0.15で0→1）
          } else if (progress >= 0.15 && progress <= 0.85) {
            bearAlpha = 1.0; // 完全に表示
          } else if (progress > 0.85) {
            bearAlpha = 1.0 - ((progress - 0.85) / 0.15); // フェードアウト
          }
          
          ctx.globalAlpha = bearAlpha;
          
          // ダメージが入った瞬間から揺れる
          let shakeX = 0;
          let shakeY = 0;
          if (progress > 0.45 && progress < 0.95) {
            const shakeIntensity = 3;
            shakeX = Math.sin(time / 20) * shakeIntensity;
            shakeY = Math.cos(time / 25) * shakeIntensity;
          }
          ctx.translate(shakeX, shakeY);
          
          ctx.scale(bearScale, bearScale);
          
          // 熊の画像を描画（ランダムに選択された熊）
          const bearIndex = anim.bearIndex !== undefined ? anim.bearIndex : 0;
          const selectedBearImage = bearImageRef.current[bearIndex];
          
          if (selectedBearImage) {
            ctx.globalCompositeOperation = 'source-over';
            const bearWidth = bearSize * 2;
            const bearHeight = bearSize * 2;
            const offsetY = -bearSize * 0.3;
            ctx.drawImage(
              selectedBearImage,
              -bearWidth / 2,
              -bearHeight / 2 + offsetY,
              bearWidth,
              bearHeight
            );
          }
          
          ctx.restore();
        }

        // 3. 地面の衝撃波エフェクト（攻撃時のみ - 兵士が到着してから）
        if (progress > 0.45 && progress < 0.75) {
          const time = Date.now();
          ctx.save();
          ctx.translate(toX, toY);
          
          // メイン衝撃波（複数層） - ランダムオフセットあり
          const waveCount = 8;
            for (let i = 0; i < waveCount; i++) {
              const wavePhase = (time / 400 + i * 0.25) % 1;
              const waveRadius = 120 * wavePhase;
              const waveAlpha = 0.6 * (1 - wavePhase) * (1 - wavePhase);
              
              // 衝撃波ごとにランダムオフセット
              const offsetAngle = ((i * 12345) % 360) * Math.PI / 180;
              const offsetDist = ((i * 6789) % 20) - 10; // -10 to +10
              const waveOffsetX = Math.cos(offsetAngle) * offsetDist;
              const waveOffsetY = Math.sin(offsetAngle) * offsetDist;
              
              // 外側のグラデーション
              const gradient = ctx.createRadialGradient(0, 0, waveRadius * 0.8, 0, 0, waveRadius);
              gradient.addColorStop(0, `rgba(255,100,0,0)`);
              gradient.addColorStop(0.7, `rgba(255,50,0,${waveAlpha})`);
              gradient.addColorStop(0.85, `rgba(200,0,0,${waveAlpha * 0.8})`);
              gradient.addColorStop(1, `rgba(100,0,0,0)`);
              
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 8;
              ctx.shadowColor = `rgba(255,100,0,${waveAlpha})`;
              ctx.shadowBlur = 25;
              ctx.beginPath();
              ctx.arc(waveOffsetX, waveOffsetY, waveRadius, 0, Math.PI * 2);
              ctx.stroke();
              
              // 内側の強い光
              if (wavePhase < 0.3) {
                ctx.strokeStyle = `rgba(255,255,200,${waveAlpha * 2})`;
                ctx.lineWidth = 3;
                ctx.shadowBlur = 35;
                ctx.shadowColor = `rgba(255,200,0,${waveAlpha * 1.5})`;
                ctx.beginPath();
                ctx.arc(waveOffsetX, waveOffsetY, waveRadius * 0.5, 0, Math.PI * 2);
                ctx.stroke();
              }
            }
            
            // 飛び散る破片・パーティクル（モバイル軽量化）
            const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const particleCount = isMobileDevice ? 10 : 30;
            for (let i = 0; i < particleCount; i++) {
              const angle = (i / particleCount) * Math.PI * 2 + time / 300;
              const particlePhase = (time / 600 + i * 0.1) % 1;
              const distance = 60 * particlePhase;
              
              // パーティクルごとのランダムオフセット
              const particleOffsetX = ((i * 3141) % 30) - 15; // -15 to +15
              const particleOffsetY = ((i * 5926) % 30) - 15; // -15 to +15
              
              const x = Math.cos(angle) * distance + particleOffsetX;
              const y = Math.sin(angle) * distance + particleOffsetY;
              const size = 4 * (1 - particlePhase);
              const alpha = 0.8 * (1 - particlePhase);
              
              ctx.fillStyle = `rgba(255,${150 - particlePhase * 100},0,${alpha})`;
              ctx.shadowColor = `rgba(255,100,0,${alpha})`;
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(x, y, size, 0, Math.PI * 2);
              ctx.fill();
            }
            
            // 地面の亀裂エフェクト（放射状の線・モバイル軽量化）
            const crackCount = isMobileDevice ? 6 : 12;
            for (let i = 0; i < crackCount; i++) {
              const angle = (i / crackCount) * Math.PI * 2 + time / 1000;
              const crackPhase = ((time / 500 + i * 0.15) % 1);
              const length = 80 * crackPhase;
              const alpha = 0.5 * (1 - crackPhase);
              
              // 亀裂ごとのランダムオフセット
              const crackOffsetX = ((i * 2718) % 24) - 12; // -12 to +12
              const crackOffsetY = ((i * 1828) % 24) - 12; // -12 to +12
              
              ctx.strokeStyle = `rgba(100,0,0,${alpha})`;
              ctx.lineWidth = 2;
              ctx.shadowBlur = 0;
              ctx.beginPath();
              ctx.moveTo(crackOffsetX, crackOffsetY);
              ctx.lineTo(Math.cos(angle) * length + crackOffsetX, Math.sin(angle) * length + crackOffsetY);
              ctx.stroke();
            }
            
            ctx.restore();
          }

        // 4. 兵士の描画（progress 0.28以降、熊が落ちてから攻撃開始）
        if (progress > 0.28 && progress < 1.0) {
          // フェードアウト効果（progress 0.85以降で徐々に透明に）
          let fadeAlpha = 1.0;
          if (progress > 0.85) {
            fadeAlpha = 1.0 - ((progress - 0.85) / 0.15); // 0.85-1.0で1.0→0.0
          }
          ctx.globalAlpha = fadeAlpha;

          // 兵士の描画（超リアルエフェクト）
          soldiers.forEach((soldier, idx) => {
          // 兵士の開始を0.28以降に調整（熊が着地してから）
          const soldierProgress = Math.max(0, Math.min(1, (progress - 0.28 - soldier.delay) / (0.72 - soldier.delay)));
          if (soldierProgress <= 0) return;

          // 往復アニメーション：0-0.5で往路、0.5-1.0で復路
          let moveProgress;
          if (soldierProgress <= 0.5) {
            // 往路：都市→熊罠
            moveProgress = soldierProgress * 2; // 0-0.5 を 0-1 にスケール
          } else {
            // 復路：熊罠→都市
            moveProgress = 1 - (soldierProgress - 0.5) * 2; // 0.5-1 を 1-0 にスケール
          }

          const currentX = fromX + (toX - fromX) * moveProgress + soldier.offsetX;
          const currentY = fromY + (toY - fromY) * moveProgress + soldier.offsetY;

          // 移動軌跡の煙・砂埃エフェクト
          if (soldierProgress > 0.1 && soldierProgress < 0.95) {
            ctx.save();
            for (let t = 0; t < 8; t++) {
              const trailSoldierProgress = soldierProgress - t * 0.03;
              if (trailSoldierProgress > 0) {
                let trailMoveProgress;
                if (trailSoldierProgress <= 0.5) {
                  trailMoveProgress = trailSoldierProgress * 2;
                } else {
                  trailMoveProgress = 1 - (trailSoldierProgress - 0.5) * 2;
                }
                const trailX = fromX + (toX - fromX) * trailMoveProgress + soldier.offsetX;
                const trailY = fromY + (toY - fromY) * trailMoveProgress + soldier.offsetY;
                
                ctx.globalAlpha = 0.4 - t * 0.05;
                ctx.fillStyle = t % 2 === 0 ? "#d0d0d0" : "#e8e8e8";
                ctx.beginPath();
                ctx.arc(trailX, trailY, 4 - t * 0.4, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            ctx.restore();
          }

          // スピードライン（疾走感）
          if (soldierProgress > 0.1 && soldierProgress < 0.9) {
            ctx.save();
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            
            for (let i = 0; i < 3; i++) {
              const lineSoldierProgress = soldierProgress - 0.05 - i * 0.03;
              if (lineSoldierProgress > 0) {
                let lineMoveProgress;
                if (lineSoldierProgress <= 0.5) {
                  lineMoveProgress = lineSoldierProgress * 2;
                } else {
                  lineMoveProgress = 1 - (lineSoldierProgress - 0.5) * 2;
                }
                const startX = fromX + (toX - fromX) * lineMoveProgress + soldier.offsetX;
                const startY = fromY + (toY - fromY) * lineMoveProgress + soldier.offsetY;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(currentX, currentY);
                ctx.stroke();
              }
            }
            ctx.restore();
          }

          ctx.save();
          ctx.translate(currentX, currentY);
          ctx.rotate(-LOOK.angle);

          const time = Date.now();
          const size = 12;
          
          // 兵士の影
          ctx.save();
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.beginPath();
          ctx.ellipse(0, size * 1.5, size * 0.8, size * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          // 走るアニメーション（脚の動き）
          const legAngle = Math.sin(soldierProgress * 20 + idx) * 0.4;
          
          // 兵士の種類に応じて色と装備を変える（アプリのパステル調に合わせて、違いを明確に）
          let bodyColor = "#DDA0DD"; // デフォルトプラム
          let helmetColor = "#E6B8E6"; // 淡いラベンダー
          
          if (soldier.type === 'shield') {
            bodyColor = "#9370DB"; // ミディアムパープル（盾兵 - 紫系）
            helmetColor = "#B8A8D8"; // 淡い紫
          } else if (soldier.type === 'archer') {
            bodyColor = "#FF9999"; // 明るいコーラル（弓兵 - ピンク系）
            helmetColor = "#FFCCCC"; // 淡いピンク
          } else if (soldier.type === 'spear') {
            bodyColor = "#FFB366"; // ライトオレンジ（槍兵 - オレンジ系）
            helmetColor = "#FFDAB3"; // ピーチ
          }
          
          // 体
          ctx.fillStyle = bodyColor;
          ctx.fillRect(-size * 0.3, size * 0.3, size * 0.6, size * 0.8);
          
          // 頭（肌色）
          ctx.fillStyle = "#ffdbac";
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
          ctx.fill();
          
          // 兵士のヘルメット
          ctx.fillStyle = helmetColor;
          ctx.beginPath();
          ctx.arc(0, -size * 0.15, size * 0.45, Math.PI, Math.PI * 2);
          ctx.fill();
          
          // 脚（走っている）
          ctx.strokeStyle = "#2c3e50";
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          
          ctx.save();
          ctx.translate(-size * 0.2, size * 1.1);
          ctx.rotate(legAngle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, size * 0.6);
          ctx.stroke();
          ctx.restore();
          
          ctx.save();
          ctx.translate(size * 0.2, size * 1.1);
          ctx.rotate(-legAngle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, size * 0.6);
          ctx.stroke();
          ctx.restore();
          
          // 武器（種類ごとに異なる）攻撃準備〜攻撃中（熊に到着してから）
          const isAttacking = soldierProgress > 0.45 && soldierProgress < 0.7;
          const attackPhase = isAttacking ? (soldierProgress - 0.45) / 0.25 : 0; // 0-1
          
          if (soldierProgress > 0.4 && soldierProgress < 0.75) {
            ctx.save();
            
            if (soldier.type === 'shield') {
              // 盾兵：盾を持つ + 剣の斬撃
              ctx.fillStyle = "#B0C4DE"; // ライトスティールブルー（パステル調）
              ctx.strokeStyle = "#9370DB"; // ミディアムパープル
              ctx.lineWidth = 2;
              ctx.shadowColor = "rgba(176,196,222,0.6)";
              ctx.shadowBlur = 8;
              
              // 盾の形（楕円）
              ctx.beginPath();
              ctx.ellipse(-size * 0.7, size * 0.5, size * 0.35, size * 0.55, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              
              // 盾の中央の装飾
              ctx.fillStyle = "#FFE55C"; // 明るいゴールドイエロー
              ctx.beginPath();
              ctx.arc(-size * 0.7, size * 0.5, size * 0.15, 0, Math.PI * 2);
              ctx.fill();
              
              // 攻撃時：剣の斬撃エフェクト
              if (isAttacking) {
                ctx.save();
                const slashAngle = -Math.PI / 4 + attackPhase * Math.PI / 2;
                const slashLength = size * 2.5;
                const slashX = size * 0.8;
                const slashY = 0;
                
                // 剣の軌跡（発光）
                ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - attackPhase)})`;
                ctx.lineWidth = 6;
                ctx.shadowColor = "rgba(200,200,255,0.9)";
                ctx.shadowBlur = 20;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(slashX, slashY);
                ctx.lineTo(
                  slashX + Math.cos(slashAngle) * slashLength,
                  slashY + Math.sin(slashAngle) * slashLength
                );
                ctx.stroke();
                
                // 剣身
                ctx.strokeStyle = "#c0c0c0";
                ctx.lineWidth = 3;
                ctx.shadowBlur = 15;
                ctx.shadowColor = "rgba(255,255,255,0.8)";
                ctx.stroke();
                ctx.restore();
              }
              
            } else if (soldier.type === 'archer') {
              // 弓兵：弓を持つ + 矢の発射
              ctx.strokeStyle = "#DEB887"; // バーリーウッド（明るめの茶色）
              ctx.lineWidth = 2;
              ctx.shadowColor = "rgba(222,184,135,0.6)";
              ctx.shadowBlur = 8;
              
              // 弓の形
              ctx.beginPath();
              ctx.arc(size * 0.8, 0, size * 0.5, -Math.PI * 0.3, Math.PI * 0.3, false);
              ctx.stroke();
              
              // 弓の弦
              ctx.strokeStyle = "#d3d3d3";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(size * 0.8, -size * 0.45);
              ctx.lineTo(size * 0.8, size * 0.45);
              ctx.stroke();
              
              // 攻撃時：矢の発射エフェクト
              if (isAttacking) {
                ctx.save();
                const arrowDistance = attackPhase * size * 8;
                const arrowX = size * 0.8 + arrowDistance;
                
                // 矢の軌跡（残像）
                for (let i = 0; i < 5; i++) {
                  const trailX = arrowX - i * size * 0.3;
                  const alpha = 0.6 * (1 - i * 0.2) * (1 - attackPhase);
                  
                  ctx.strokeStyle = `rgba(255,182,193,${alpha})`; // ライトピンク
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.moveTo(trailX - size * 0.3, 0);
                  ctx.lineTo(trailX, 0);
                  ctx.stroke();
                }
                
                // 矢本体
                ctx.strokeStyle = "#DEB887";
                ctx.lineWidth = 3;
                ctx.shadowColor = "rgba(255,229,92,0.8)"; // ゴールドイエロー
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.moveTo(arrowX - size * 0.4, 0);
                ctx.lineTo(arrowX, 0);
                ctx.stroke();
                
                // 矢じり（光る）
                ctx.fillStyle = "#fff";
                ctx.shadowColor = "rgba(255,255,200,1)";
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.moveTo(arrowX, 0);
                ctx.lineTo(arrowX - size * 0.1, -size * 0.08);
                ctx.lineTo(arrowX - size * 0.1, size * 0.08);
                ctx.fill();
                ctx.restore();
              } else if (soldierProgress > 0.25) {
                // 準備中の矢
                ctx.strokeStyle = "#DEB887";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(size * 0.6, 0);
                ctx.lineTo(size * 1.2, 0);
                ctx.stroke();
                
                ctx.fillStyle = "#E6B8E6"; // 淡いラベンダー
                ctx.beginPath();
                ctx.moveTo(size * 1.2, 0);
                ctx.lineTo(size * 1.1, -size * 0.08);
                ctx.lineTo(size * 1.1, size * 0.08);
                ctx.fill();
              }
              
            } else if (soldier.type === 'spear') {
              // 槍兵：長い槍を持つ + 突き攻撃
              const thrustOffset = isAttacking ? Math.sin(attackPhase * Math.PI) * size * 1.5 : 0;
              
              ctx.save();
              ctx.translate(thrustOffset, 0);
              
              ctx.shadowColor = "rgba(192,192,192,0.8)";
              ctx.shadowBlur = 10;
              
              // 槍の柄（茶色）
              ctx.strokeStyle = "#DEB887"; // 明るめの茶色
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(size * 0.5, size * 0.2);
              ctx.lineTo(size * 1.5, -size * 1.0);
              ctx.stroke();
              
              // 槍の穂先（銀色）
              ctx.fillStyle = "#F0E68C"; // カーキ（明るい黄色）
              ctx.strokeStyle = "#E6B8E6"; // 淡いラベンダー
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(size * 1.5, -size * 1.0);
              ctx.lineTo(size * 1.4, -size * 0.85);
              ctx.lineTo(size * 1.5, -size * 1.2);
              ctx.lineTo(size * 1.6, -size * 0.85);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
              
              // 攻撃時：突進エフェクト
              if (isAttacking) {
                // スピードライン（携帯対応）
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                const lineCount = isMobile ? 4 : 8; // 携帯では4本に削減
                for (let i = 0; i < lineCount; i++) {
                  const lineAlpha = 0.5 * (1 - attackPhase);
                  ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`;
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.moveTo(size * 1.5 - i * size * 0.3, -size * 1.0 + (Math.random() - 0.5) * size * 0.2);
                  ctx.lineTo(size * 1.5 - i * size * 0.3 - size * 0.5, -size * 1.0 + (Math.random() - 0.5) * size * 0.2);
                  ctx.stroke();
                }
                
                // 穂先の光
                ctx.save();
                ctx.fillStyle = "#fff";
                ctx.shadowColor = "rgba(255,255,255,1)";
                ctx.shadowBlur = 25;
                ctx.beginPath();
                ctx.arc(size * 1.5, -size * 1.0, size * 0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
              
              ctx.restore();
            }
            
            ctx.restore();
          }
          
          // 攻撃時の強力なエフェクト
          if (isAttacking) {
            ctx.save();
            
            // 兵士ごとにランダムオフセット（攻撃が散らばる）
            const attackOffsetX = ((idx * 7919) % 40) - 20; // -20 to +20
            const attackOffsetY = ((idx * 3137) % 40) - 20; // -20 to +20
            ctx.translate(attackOffsetX, attackOffsetY);
            
            // img-01の熊（インデックス0）の時は可愛いエフェクト
            const isCuteBear = anim.bearIndex === 0;
            
            if (isCuteBear) {
              // 可愛い「なでなで」エフェクト - 複数の波紋リング
              const shockAlpha = 0.8 * (1 - attackPhase);
              
              // 3つの重なる波紋リング（パステルカラー）
              const rings = [
                { radius: attackPhase * size * 3.2, color: [255, 192, 203], alpha: shockAlpha * 0.7 }, // パステルピンク
                { radius: attackPhase * size * 2.8, color: [255, 218, 185], alpha: shockAlpha * 0.8 }, // ピーチ
                { radius: attackPhase * size * 2.4, color: [221, 160, 221], alpha: shockAlpha * 0.9 }, // ラベンダー
              ];
              
              rings.forEach(ring => {
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, ring.radius);
                gradient.addColorStop(0, `rgba(${ring.color[0]},${ring.color[1]},${ring.color[2]},${ring.alpha})`);
                gradient.addColorStop(0.4, `rgba(${ring.color[0]},${ring.color[1]},${ring.color[2]},${ring.alpha * 0.6})`);
                gradient.addColorStop(0.7, `rgba(255,240,245,${ring.alpha * 0.3})`);
                gradient.addColorStop(1, `rgba(255,240,245,0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
                ctx.fill();
              });
              
              // キラキラ星のエフェクト（リングの周りに）- 可愛いサイズ！
              const starCount = 12;
              for (let i = 0; i < starCount; i++) {
                const angle = (i / starCount) * Math.PI * 2 + time / 200;
                const distance = attackPhase * size * 3.5 + Math.sin(time / 100 + i) * size * 0.8;
                const starX = Math.cos(angle) * distance;
                const starY = Math.sin(angle) * distance;
                const starSize = (1 - attackPhase) * size * 0.6; // 適切な可愛いサイズ
                
                ctx.save();
                ctx.translate(starX, starY);
                ctx.rotate(time / 80 + i); // もっと速く回る
                
                // 星の色（もっと明るいパステルカラー）
                const starColors = [
                  { fill: 'rgba(255,218,185,1.0)', glow: 'rgba(255,218,185,0.8)' }, // ピーチ
                  { fill: 'rgba(175,238,238,1.0)', glow: 'rgba(175,238,238,0.8)' }, // ミント
                  { fill: 'rgba(255,192,203,1.0)', glow: 'rgba(255,192,203,0.8)' }, // ピンク
                  { fill: 'rgba(255,255,224,1.0)', glow: 'rgba(255,255,224,0.8)' }, // ライトイエロー
                ];
                const starColor = starColors[i % 4];
                
                // 強力な発光エフェクト
                ctx.shadowColor = starColor.glow;
                ctx.shadowBlur = 30; // 8から30に
                
                // グラデーションで立体感
                const starGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, starSize);
                starGradient.addColorStop(0, starColor.fill);
                starGradient.addColorStop(0.7, starColor.fill.replace('1.0', `${(1 - attackPhase) * 0.9}`));
                starGradient.addColorStop(1, starColor.fill.replace('1.0', `${(1 - attackPhase) * 0.5}`));
                ctx.fillStyle = starGradient;
                
                // 8点星を描画（もっと豪華に）
                ctx.beginPath();
                for (let j = 0; j < 8; j++) {
                  const starAngle = (j / 8) * Math.PI * 2;
                  const isOuter = j % 2 === 0;
                  const radius = isOuter ? starSize : starSize * 0.4;
                  const x = Math.cos(starAngle) * radius;
                  const y = Math.sin(starAngle) * radius;
                  if (j === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                
                // 中心に白いハイライト
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.beginPath();
                ctx.arc(0, 0, starSize * 0.25, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
              }
              
              // ハート型エフェクト（火花の代わり）- もっと可愛く豪華に！
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
              const heartCount = isMobile ? 8 : 18; // 携帯8個、PC18個に大幅増量
              
              // パステルカラーパレット（より豊富に、もっと明るく）
              const heartColors = [
                { fill: 'rgba(255,182,193,1.0)', glow: 'rgba(255,182,193,0.9)' }, // ライトピンク
                { fill: 'rgba(255,192,203,1.0)', glow: 'rgba(255,192,203,0.9)' }, // ピンク
                { fill: 'rgba(221,160,221,1.0)', glow: 'rgba(221,160,221,0.9)' }, // プラム
                { fill: 'rgba(230,190,255,1.0)', glow: 'rgba(230,190,255,0.9)' }, // ライラック
                { fill: 'rgba(175,238,238,1.0)', glow: 'rgba(175,238,238,0.9)' }, // パウダーブルー
                { fill: 'rgba(255,218,185,1.0)', glow: 'rgba(255,218,185,0.9)' }, // ピーチパフ
                { fill: 'rgba(255,228,225,1.0)', glow: 'rgba(255,228,225,0.9)' }, // ミスティローズ
                { fill: 'rgba(240,248,255,1.0)', glow: 'rgba(240,248,255,0.9)' }, // アリスブルー
              ];
              
              for (let i = 0; i < heartCount; i++) {
                const angle = (i / heartCount) * Math.PI * 2 + time / 70;
                const distance = attackPhase * size * 4.5 + Math.sin(time / 90 + i * 0.5) * size * 0.8;
                const heartX = Math.cos(angle) * distance;
                const heartY = Math.sin(angle) * distance;
                
                // ハートのサイズを可愛く適切に！
                const sizeVariation = 1.2 + (i % 4) * 0.4; // 1.2, 1.6, 2.0, 2.4のバリエーション
                const heartSize = (1 - attackPhase) * size * 0.7 * sizeVariation; // 適切な可愛いサイズ
                
                // 脈打つアニメーション（もっと激しく）
                const pulseScale = 1 + Math.sin(time / 40 + i) * 0.25; // 0.15から0.25に
                
                ctx.save();
                ctx.translate(heartX, heartY);
                ctx.rotate(angle + Math.sin(time / 80 + i) * 0.5); // もっと揺れる
                ctx.scale(pulseScale, pulseScale);
                
                const colorIndex = i % heartColors.length;
                const color = heartColors[colorIndex];
                
                // 外側の光るオーラ（もっと強力に）
                ctx.shadowColor = color.glow;
                ctx.shadowBlur = isMobile ? 30 : 50; // 15から30、PCは50に大幅アップ
                ctx.shadowBlur = isMobile ? 15 : 25;
                
                // グラデーションで立体感を出す
                const heartGradient = ctx.createRadialGradient(
                  -heartSize * 0.2, -heartSize * 0.2, 0,
                  0, 0, heartSize * 1.2
                );
                heartGradient.addColorStop(0, color.fill.replace(/[\d.]+\)$/g, '1)'));
                heartGradient.addColorStop(0.6, color.fill);
                heartGradient.addColorStop(1, color.fill.replace(/[\d.]+\)$/g, '0.5)'));
                
                ctx.fillStyle = heartGradient;
                
                // ハート形を描画（より丸みを帯びた形に）
                ctx.beginPath();
                const topCurveHeight = heartSize * 0.35;
                ctx.moveTo(0, topCurveHeight);
                
                // 左上の曲線（より丸く）
                ctx.bezierCurveTo(
                  -heartSize / 2, -topCurveHeight * 1.2,
                  -heartSize * 1.1, topCurveHeight / 3,
                  0, heartSize * 1.1
                );
                
                // 右上の曲線（より丸く）
                ctx.bezierCurveTo(
                  heartSize * 1.1, topCurveHeight / 3,
                  heartSize / 2, -topCurveHeight * 1.2,
                  0, topCurveHeight
                );
                ctx.closePath();
                ctx.fill();
                
                // ハートの中心にハイライト（キラキラ感）
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.beginPath();
                ctx.arc(-heartSize * 0.2, -heartSize * 0.1, heartSize * 0.15, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
              }
              
              // 追加：ふわふわ浮遊する小さなハート（花吹雪みたいに）
              const floatingHeartCount = isMobile ? 3 : 6;
              for (let i = 0; i < floatingHeartCount; i++) {
                const angle = (i / floatingHeartCount) * Math.PI * 2 + time / 150;
                const floatOffset = Math.sin(time / 80 + i * 1.5) * size * 0.5;
                const distance = attackPhase * size * 3.5 + floatOffset;
                const heartX = Math.cos(angle) * distance;
                const heartY = Math.sin(angle) * distance;
                const tinyHeartSize = (1 - attackPhase) * size * 0.12;
                
                ctx.save();
                ctx.translate(heartX, heartY);
                ctx.rotate(time / 60 + i * 0.8);
                
                const colorIndex = (i * 2) % heartColors.length;
                ctx.fillStyle = heartColors[colorIndex].fill.replace(/[\d.]+\)$/g, `${(1 - attackPhase) * 0.7})`);
                ctx.shadowColor = heartColors[colorIndex].glow;
                ctx.shadowBlur = isMobile ? 8 : 15;
                
                ctx.beginPath();
                const topH = tinyHeartSize * 0.3;
                ctx.moveTo(0, topH);
                ctx.bezierCurveTo(-tinyHeartSize / 2, -topH, -tinyHeartSize, topH / 2, 0, tinyHeartSize);
                ctx.bezierCurveTo(tinyHeartSize, topH / 2, tinyHeartSize / 2, -topH, 0, topH);
                ctx.closePath();
                ctx.fill();
                
                ctx.restore();
              }
            } else {
              // 通常の攻撃エフェクト
              const shockRadius = attackPhase * size * 3;
              const shockAlpha = 0.8 * (1 - attackPhase);
              
              const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shockRadius);
              gradient.addColorStop(0, `rgba(255,182,193,${shockAlpha * 0.8})`); // ライトピンク
              gradient.addColorStop(0.5, `rgba(221,160,221,${shockAlpha * 0.5})`); // プラム
              gradient.addColorStop(1, `rgba(255,182,193,0)`);
              
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(0, 0, shockRadius, 0, Math.PI * 2);
              ctx.fill();
              
              // 攻撃の火花（携帯対応：さらに軽量化）
              const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
              const sparkCount = isMobile ? 3 : 6; // 携帯では3個に削減
              for (let i = 0; i < sparkCount; i++) {
                const angle = (i / sparkCount) * Math.PI * 2 + time / 100;
                const distance = attackPhase * size * 2.5;
                const sparkX = Math.cos(angle) * distance;
                const sparkY = Math.sin(angle) * distance;
                const sparkSize = (1 - attackPhase) * size * 0.15;
                
                ctx.fillStyle = `rgba(255,${200 - attackPhase * 150},0,${(1 - attackPhase) * 0.3})`; // 透明度をさらに下げる
                ctx.shadowColor = "rgba(255,150,0,0.3)"; // shadowBlurをさらに薄く
                ctx.shadowBlur = isMobile ? 4 : 8; // 携帯では4に
                ctx.beginPath();
                ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            
            ctx.restore();
          }
          
          // 戦闘オーラ（攻撃時のみ強化 - 兵士が到着してから）
          if (soldierProgress > 0.4 && soldierProgress < 0.7) {
            ctx.save();
            const isCuteBear = anim.bearIndex === 0;
            const auraAlpha = isAttacking ? 0.8 + Math.sin(time / 50 + idx) * 0.2 : 0.4 + Math.sin(time / 100 + idx) * 0.2;
            
            if (isCuteBear) {
              // 可愛い「なでなで」オーラ（パステルカラー）
              const auraColor = isAttacking ? `rgba(255,182,193,${auraAlpha})` : `rgba(255,192,203,${auraAlpha})`; // ピンク系
              ctx.strokeStyle = auraColor;
              ctx.lineWidth = isAttacking ? 3 : 2;
              ctx.shadowColor = isAttacking ? "rgba(255,182,193,0.8)" : "rgba(255,192,203,0.6)";
              ctx.shadowBlur = isAttacking ? 20 : 12;
            } else {
              // 通常の戦闘オーラ
              const auraColor = isAttacking ? `rgba(255,100,50,${auraAlpha})` : `rgba(255,50,50,${auraAlpha})`;
              ctx.strokeStyle = auraColor;
              ctx.lineWidth = isAttacking ? 4 : 2;
              ctx.shadowColor = isAttacking ? "rgba(255,100,0,0.9)" : "rgba(255,0,0,0.6)";
              ctx.shadowBlur = isAttacking ? 25 : 15;
            }
            
            ctx.beginPath();
            ctx.arc(0, size * 0.5, size * 1.2 + Math.sin(time / 80 + idx) * 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
          
            ctx.restore();
          });
        }

        // 5. TOTAL DAMAGE 表示（攻撃開始から最後まで常に表示、progress 1.0でも消えない）
        if (progress > 0.45) {
          ctx.save();
          
          // 熊罠の位置に移動
          ctx.translate(toX, toY);
          ctx.rotate(-LOOK.angle);
          
          // 熊のサイズ（画像と同じ）
          const bearSize = 80;
          
          // totalDamageは初期値として設定済み（固定値を使用）
          const totalDamage = anim.totalDamage || 0;
          
          // 角丸のテキストボックスを描画
          const boxWidth = bearSize * 3.2;
          const boxHeight = bearSize * 1.1;
          const boxX = -boxWidth / 2;
          const boxY = -bearSize * 2.45;
          const borderRadius = 10;
          
          // 透過性を持たせる（progress 0.88から1.0で透明化）ゆっくり消える
          let boxAlpha = 0.9;
          let textAlpha = 1.0;
          if (progress >= 1.0) {
            // progress 1.0で完全に透明
            boxAlpha = 0;
            textAlpha = 0;
          } else if (progress >= 0.88) {
            const fadeProgress = Math.min((progress - 0.88) / 0.12, 1.0); // 0.88-1.0でフェード
            boxAlpha = 0.9 * (1 - fadeProgress); // 0.9→0
            textAlpha = 1.0 * (1 - fadeProgress); // 1.0→0
          }
          
          ctx.globalAlpha = boxAlpha;
          
          // 背景ボックス（角丸） - 透明度を反映（もっと透明に）
          ctx.fillStyle = `rgba(0,0,0,${0.5 * boxAlpha})`;
          ctx.strokeStyle = `rgba(230,184,230,${textAlpha})`; // 淡いラベンダー（アプリの雰囲気に合わせて）
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
          ctx.fill();
          ctx.stroke();
          
          // テキストも段階的に透明化
          ctx.globalAlpha = textAlpha;
          
          // TOTAL DAMAGE テキスト（少し大きく）
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `bold ${bearSize * 0.28}px Arial`;
          
          // テキストにはtextAlphaを適用
          ctx.globalAlpha = textAlpha;
          
          // グラデーション効果（アプリの雰囲気に合わせてピンク/パープル系）
          const gradient = ctx.createLinearGradient(0, boxY, 0, boxY + boxHeight);
          gradient.addColorStop(0, `rgba(255,182,193,${textAlpha})`);  // ライトピンク
          gradient.addColorStop(0.5, `rgba(221,160,221,${textAlpha})`); // プラム
          gradient.addColorStop(1, `rgba(218,112,214,${textAlpha})`);   // オーキッド
          ctx.fillStyle = gradient;
          
          const totalText = `TOTAL DAMAGE`;
          const totalY = boxY + boxHeight * 0.38;
          ctx.fillText(totalText, 0, totalY);
          
          // 合計値を大きく表示（カウントアップアニメーション付き）
          // progress 0.45から開始して、0.75で最終値に到達
          let displayedDamage = totalDamage;
          if (progress >= 0.45 && progress < 0.75) {
            const countProgress = (progress - 0.45) / 0.3; // 0.45-0.75で0→1
            displayedDamage = Math.floor(totalDamage * countProgress);
          }
          
          const valueText = displayedDamage.toLocaleString();
          let valueFontSize = bearSize * 0.45;
          ctx.font = `bold ${valueFontSize}px Arial`;
          
          // テキスト幅を測定してボックス幅の90%に収まるように調整
          let textWidth = ctx.measureText(valueText).width;
          const maxWidth = boxWidth * 0.9; // ボックス幅の90%まで
          
          if (textWidth > maxWidth) {
            // はみ出る場合はフォントサイズを縮小
            valueFontSize = valueFontSize * (maxWidth / textWidth);
            ctx.font = `bold ${valueFontSize}px Arial`;
          }
          
          // 合計値にもtextAlphaを適用
          ctx.globalAlpha = textAlpha;
          ctx.fillStyle = gradient; // グラデーションを再適用
          
          const valueY = boxY + boxHeight * 0.75;
          ctx.fillText(valueText, 0, valueY);
          
          // NEW RECORDの場合、カウントアップ終了後にNEW RECORD!を表示
          if (anim.isNewRecord === true && progress >= 0.75) {
            ctx.globalAlpha = textAlpha; // 透明化に対応
            ctx.font = `bold ${bearSize * 0.28}px Arial`;
            ctx.shadowColor = `rgba(255,140,214,${textAlpha})`; // ピンク系の影
            ctx.shadowBlur = 25;
            ctx.fillStyle = `rgba(255,229,92,${textAlpha})`; // 明るいゴールドイエロー（華やか）
            const newRecordY = boxY + boxHeight * 0.2;
            ctx.fillText("NEW RECORD!", 0, newRecordY);
            ctx.shadowBlur = 0;
          }
          
          ctx.restore();
        }

        // 6. ダメージ数値表示（最上層：攻撃回数分だけ表示、自然に消えるまで）
        if (progress > 0.45 && anim.damages) {
          ctx.save();
          ctx.translate(toX, toY);
          ctx.rotate(-LOOK.angle);
          
          const bearSize = 80;
          const displayDuration = 1000 / 5500; // 各ダメージの表示時間（1.0秒）
          const attackDuration = 0.3; // 攻撃期間 (0.45-0.75)
          
          // 攻撃回数分だけダメージを表示
          const damages = anim.damages; // ローカル変数に保存してTypeScriptの型絞り込みを維持
          damages.forEach((damageInfo, damageIndex) => {
            const { damage, isCritical } = damageInfo;
            
            // 各攻撃のタイミングを計算（攻撃期間内で均等に分散）
            const attackProgress = 0.45 + (damageIndex / damages.length) * attackDuration;
            const damageEndProgress = attackProgress + displayDuration;
            
            // このダメージ表示期間内かチェック
            if (progress >= attackProgress && progress < damageEndProgress) {
              
              // 表示位置（360度に散らばらせる - 疑似ランダムでずらす）
              const pseudoRandom1 = ((damageIndex * 12345) % 100) / 100; // 0-1の疑似ランダム
              const pseudoRandom2 = ((damageIndex * 67890) % 100) / 100; // 0-1の疑似ランダム
              const angle = (damageIndex * 137.5 + pseudoRandom1 * 90 - 45) * Math.PI / 180; // 黄金角 ± ランダム45度
              const distance = bearSize * (0.8 + pseudoRandom2 * 0.8); // 距離もランダム（0.8-1.6倍）
              const offsetX = Math.cos(angle) * distance;
              const offsetY = Math.sin(angle) * distance - (progress - attackProgress) * 150;
              
              // フォント設定（大きく、クリティカルをさらに強調）
              const fontSize = isCritical ? bearSize * 0.4 : bearSize * 0.3;
              ctx.font = `bold ${fontSize}px Arial`;
              
              // フェード効果（ゆっくり消える）
              const damageLocalProgress = (progress - attackProgress) / displayDuration;
              let damageAlpha = 1.0;
              if (damageLocalProgress < 0.15) {
                damageAlpha = damageLocalProgress / 0.15;
              } else if (damageLocalProgress > 0.7) {
                damageAlpha = 1.0 - ((damageLocalProgress - 0.7) / 0.3);
              }
              
              // progress 0.89以降は全体を透明化（0.6秒待ってから）
              if (progress >= 0.89) {
                const fadeProgress = (progress - 0.89) / 0.11;
                damageAlpha *= (1 - fadeProgress); // 徐々に0に
              }
              
              ctx.globalAlpha = damageAlpha;
              
              // キュートな熊（ダメージ0）の場合はハートを表示
              const isCuteBear = anim.bearIndex === 0;
              
              if (isCuteBear) {
                // ハートを描画
                const heartSize = isCritical ? bearSize * 0.5 : bearSize * 0.4;
                
                ctx.save();
                ctx.translate(offsetX, offsetY);
                ctx.rotate((damageIndex * 30 + Date.now() / 100) * Math.PI / 180); // 回転アニメーション
                
                // ハートの色（パステルピンク）
                const heartColors = [
                  'rgba(255,182,193,1)', // ライトピンク
                  'rgba(255,192,203,1)', // ピンク
                  'rgba(221,160,221,1)', // プラム
                ];
                const heartColor = heartColors[damageIndex % 3];
                
                // 発光エフェクト
                ctx.shadowColor = heartColor;
                ctx.shadowBlur = 20;
                ctx.fillStyle = heartColor;
                
                // ハート形を描画
                ctx.beginPath();
                const topCurveHeight = heartSize * 0.3;
                ctx.moveTo(0, topCurveHeight);
                ctx.bezierCurveTo(-heartSize / 2, -topCurveHeight, -heartSize, topCurveHeight / 2, 0, heartSize);
                ctx.bezierCurveTo(heartSize, topCurveHeight / 2, heartSize / 2, -topCurveHeight, 0, topCurveHeight);
                ctx.closePath();
                ctx.fill();
                
                // 中心にハイライト
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.beginPath();
                ctx.arc(-heartSize * 0.2, -heartSize * 0.1, heartSize * 0.15, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
              } else {
                // 通常のダメージ数字を表示
                const damageText = damage.toLocaleString();
                
                // モバイル用軽量化：影を簡略化
                const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                
                if (!isMobileDevice) {
                  // PCのみ影を描画
                  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
                  ctx.shadowBlur = 4;
                  ctx.shadowOffsetX = 2;
                  ctx.shadowOffsetY = 2;
                }
                
                // 白い縁取りを描画
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = isCritical ? 5 : 3;
                ctx.strokeText(damageText, offsetX, offsetY);
                
                // 影をリセット
                ctx.shadowColor = "transparent";
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                
                // クリティカルはコーラルピンク、通常はローズピンク（アプリの雰囲気に合わせて）
                ctx.fillStyle = isCritical ? '#FF8C8C' : '#FF69B4';
                ctx.fillText(damageText, offsetX, offsetY);
              }
            }
          });
          
          ctx.restore();
        }
      });

      ctx.restore();
    }

    ctx.restore(); // カメラ変換終了

    // 猫アニメーションの描画（マップ座標をスクリーン座標に変換）
    const currentCatAnimations = catAnimationsDataRef.current;
    if (currentCatAnimations.length > 0 && pawImageRef.current && catImageRef.current) {
      currentCatAnimations.forEach((anim) => {
        // 足跡を描画
        anim.pawPrints.forEach((paw, pawIndex) => {
          // マップ座標（ピクセル）からスクリーン座標に変換
          const pawMapX = paw.x * cell;
          const pawMapY = paw.y * cell;
          const { sx: pawScreenX, sy: pawScreenY } = mapToScreen(pawMapX, pawMapY, viewW, viewH);
          
          // 古い足跡ほど薄くなる（最初の足跡＝インデックス0が最も薄い）
          const fadeRatio = pawIndex / Math.max(1, anim.pawPrints.length - 1);
          const fadeAlpha = 0.3 + fadeRatio * 0.7; // 0.3（最初）〜 1.0（最後）
          
          ctx.save();
          ctx.translate(pawScreenX, pawScreenY);
          ctx.rotate(paw.rotation);
          ctx.globalAlpha = paw.alpha * fadeAlpha * 0.7;
          
          const pawSize = 11 * paw.scale; // サイズを小さく
          ctx.drawImage(
            pawImageRef.current!,
            -pawSize / 2,
            -pawSize / 2,
            pawSize,
            pawSize
          );
          ctx.restore();
        });
        
        // 猫を描画
        if (anim.showCat) {
          const catMapX = anim.to.x * cell;
          const catMapY = anim.to.y * cell;
          const { sx: catScreenX, sy: catScreenY } = mapToScreen(catMapX, catMapY, viewW, viewH);
          
          ctx.save();
          ctx.translate(catScreenX, catScreenY);
          ctx.globalAlpha = anim.catAlpha;
          
          // ふわっと浮かぶアニメーション
          const floatOffset = Math.sin(Date.now() / 300) * 5;
          ctx.translate(0, floatOffset - 30);
          
          const catSize = 60;
          ctx.drawImage(
            catImageRef.current!,
            -catSize / 2,
            -catSize / 2,
            catSize,
            catSize
          );
          ctx.restore();
        }
      });
    }

    // バルーンアニメーションの描画
    if (balloonAnimations.length > 0) {
      balloonAnimations.forEach((anim) => {
        anim.balloons.forEach((balloon) => {
          const x = anim.x + balloon.offsetX;
          const y = anim.y + balloon.offsetY;
          
          ctx.save();
          ctx.globalAlpha = Math.min(balloon.life / 2, 1);
          
          // バルーン本体
          ctx.fillStyle = balloon.color;
          ctx.beginPath();
          ctx.ellipse(x, y, balloon.size, balloon.size * 1.2, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // ハイライト
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.ellipse(x - balloon.size * 0.3, y - balloon.size * 0.3, balloon.size * 0.3, balloon.size * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // 紐
          ctx.strokeStyle = balloon.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y + balloon.size * 1.2);
          ctx.lineTo(x, y + balloon.size * 1.2 + balloon.stringLength);
          ctx.stroke();
          
          ctx.restore();
        });
      });
    }

    // オーロラアニメーションの描画
    if (auroraAnimations.length > 0) {
      auroraAnimations.forEach((anim) => {
        anim.waves.forEach((wave) => {
          ctx.save();
          ctx.globalAlpha = wave.alpha;
          
          const gradient = ctx.createLinearGradient(0, wave.offsetY, 0, wave.offsetY + 100);
          gradient.addColorStop(0, wave.color);
          gradient.addColorStop(0.5, 'rgba(0,255,200,0.3)');
          gradient.addColorStop(1, 'rgba(100,0,255,0.1)');
          
          ctx.beginPath();
          for (let x = 0; x < viewW + 50; x += 10) {
            const y = wave.offsetY + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.lineTo(viewW, 0);
          ctx.lineTo(0, 0);
          ctx.closePath();
          ctx.fillStyle = gradient;
          ctx.fill();
          
          ctx.restore();
        });
      });
    }

    // 蝶々アニメーションの描画
    if (butterflyAnimations.length > 0) {
      butterflyAnimations.forEach((anim) => {
        anim.butterflies.forEach((bf) => {
          ctx.save();
          ctx.globalAlpha = Math.min(bf.life / 2, 1);
          ctx.translate(bf.x, bf.y);
          ctx.rotate(bf.angle);
          
          // 羽ばたき（左右の羽の開閉）
          const wingAngle = Math.sin(bf.flutterPhase) * 0.3;
          
          // 右の羽
          ctx.save();
          ctx.rotate(-wingAngle);
          ctx.fillStyle = bf.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, bf.size * 0.8, bf.size * 1.5, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          // 左の羽
          ctx.save();
          ctx.rotate(wingAngle);
          ctx.scale(-1, 1);
          ctx.fillStyle = bf.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, bf.size * 0.8, bf.size * 1.5, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          // 胴体
          ctx.fillStyle = '#333';
          ctx.fillRect(-bf.size * 0.1, -bf.size * 0.6, bf.size * 0.2, bf.size * 1.2);
          
          ctx.restore();
        });
      });
    }

    // 流れ星アニメーションの描画
    if (shootingStarAnimations.length > 0) {
      shootingStarAnimations.forEach((anim) => {
        anim.stars.forEach((star) => {
          ctx.save();
          
          // 尾の軌跡
          star.trailPoints.forEach((point, i) => {
            ctx.globalAlpha = point.alpha;
            ctx.fillStyle = `hsl(${200 + i * 2}, 100%, ${70 + i}%)`;
            const size = (star.trailPoints.length - i) / star.trailPoints.length * 3;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fill();
          });
          
          // 星本体
          ctx.globalAlpha = Math.min(star.life / 2, 1);
          ctx.fillStyle = '#fff';
          ctx.shadowColor = '#fff';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(star.x, star.y, 4, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        });
      });
    }

    // 紅葉アニメーションの描画
    if (autumnLeavesAnimations.length > 0) {
      autumnLeavesAnimations.forEach((anim) => {
        anim.leaves.forEach((leaf) => {
          const x = anim.x + leaf.offsetX;
          const y = anim.y + leaf.offsetY;
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(leaf.rotation);
          ctx.globalAlpha = Math.min(leaf.life / 3, 1);
          
          // 葉の形状（簡易的な楓型）
          ctx.fillStyle = leaf.color;
          ctx.beginPath();
          if (leaf.leafType === 'maple') {
            // 楓の葉
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
              const radius = leaf.size * (i % 2 === 0 ? 1 : 0.6);
              const px = Math.cos(angle) * radius;
              const py = Math.sin(angle) * radius;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
          } else {
            // 円形の葉
            ctx.arc(0, 0, leaf.size, 0, Math.PI * 2);
          }
          ctx.fill();
          
          // 葉脈
          ctx.strokeStyle = 'rgba(100,50,0,0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -leaf.size);
          ctx.lineTo(0, leaf.size);
          ctx.stroke();
          
          ctx.restore();
        });
      });
    }

    // 雪アニメーションの描画
    if (snowAnimations.length > 0) {
      snowAnimations.forEach((anim) => {
        anim.snowflakes.forEach((snow) => {
          ctx.save();
          ctx.translate(snow.x, snow.y);
          ctx.rotate(snow.rotation);
          ctx.globalAlpha = snow.opacity * Math.min(snow.life / 2, 1);
          
          // 雪の結晶
          ctx.fillStyle = '#fff';
          ctx.shadowColor = '#fff';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 0, snow.size / 2, 0, Math.PI * 2);
          ctx.fill();
          
          // 六角形の結晶模様
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * snow.size / 2, Math.sin(angle) * snow.size / 2);
            ctx.stroke();
          }
          
          ctx.restore();
        });
      });
    }

    // 紙吹雪アニメーションの描画
    if (confettiAnimations.length > 0) {
      confettiAnimations.forEach((anim) => {
        anim.confetti.forEach((conf) => {
          const x = anim.x + conf.offsetX;
          const y = anim.y + conf.offsetY;
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(conf.rotation);
          ctx.globalAlpha = Math.min(conf.life / 3, 1);
          ctx.fillStyle = conf.color;
          
          if (conf.shape === 'rectangle') {
            ctx.fillRect(-conf.width / 2, -conf.height / 2, conf.width, conf.height);
          } else if (conf.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, conf.width / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (conf.shape === 'star') {
            // 星形
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
              const radius = i % 2 === 0 ? conf.width : conf.width / 2;
              const px = Math.cos(angle) * radius;
              const py = Math.sin(angle) * radius;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
          }
          
          ctx.restore();
        });
      });
    }

    // 虹アニメーションの描画
    if (rainbowAnimations.length > 0) {
      rainbowAnimations.forEach((anim) => {
        ctx.save();
        ctx.globalAlpha = anim.alpha;
        
        const colors = [
          '#FF0000', // 赤
          '#FF7F00', // 橙
          '#FFFF00', // 黄
          '#00FF00', // 緑
          '#0000FF', // 青
          '#4B0082', // 藍
          '#9400D3', // 紫
        ];
        
        colors.forEach((color, i) => {
          const radius = anim.radius - i * anim.width / colors.length;
          ctx.strokeStyle = color;
          ctx.lineWidth = anim.width / colors.length;
          ctx.beginPath();
          ctx.arc(anim.x, anim.y, radius, Math.PI, 0);
          ctx.stroke();
        });
        
        ctx.restore();
      });
    }

    // 雨アニメーションの描画
    if (rainAnimations.length > 0) {
      rainAnimations.forEach((anim) => {
        anim.raindrops.forEach((drop) => {
          ctx.save();
          
          if (drop.splash) {
            // 跳ね返りの波紋
            ctx.globalAlpha = (1 - drop.splashProgress) * 0.5;
            ctx.strokeStyle = '#4dd0e1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(drop.x, drop.y, drop.splashProgress * 20, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            // 雨粒
            ctx.globalAlpha = drop.opacity;
            ctx.strokeStyle = '#4dd0e1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
            ctx.stroke();
          }
          
          ctx.restore();
        });
      });
    }

    // 魔法陣アニメーションの描画（マップ座標をスクリーン座標に変換）
    if (magicCircleAnimations.length > 0) {
      magicCircleAnimations.forEach((anim) => {
        const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
        
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(anim.rotation);
        ctx.globalAlpha = anim.alpha;
        
        // 外円
        ctx.strokeStyle = `rgba(138, 43, 226, ${anim.glowIntensity})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#8a2be2';
        ctx.shadowBlur = 20 * anim.glowIntensity;
        ctx.beginPath();
        ctx.arc(0, 0, anim.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 内円
        ctx.beginPath();
        ctx.arc(0, 0, anim.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        
        // 紋様（星形）
        ctx.fillStyle = `rgba(138, 43, 226, ${anim.glowIntensity * 0.5})`;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const radius = i % 2 === 0 ? anim.radius * 0.5 : anim.radius * 0.3;
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        
        // ルーン文字風の装飾
        ctx.strokeStyle = `rgba(255, 215, 0, ${anim.glowIntensity})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const x1 = Math.cos(angle) * anim.radius * 0.85;
          const y1 = Math.sin(angle) * anim.radius * 0.85;
          const x2 = Math.cos(angle) * anim.radius * 0.95;
          const y2 = Math.sin(angle) * anim.radius * 0.95;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        
        ctx.restore();
      });
    }

    // 炎アニメーションの描画
    flameAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.flames.forEach(flame => {
        ctx.save();
        ctx.globalAlpha = flame.opacity;
        ctx.fillStyle = flame.color;
        ctx.shadowColor = flame.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(screenX + flame.offsetX, screenY + flame.offsetY, flame.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });

    // 雷アニメーションの描画
    thunderAnimations.forEach(anim => {
      anim.segments.forEach(seg => {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 100, ${seg.alpha})`;
        ctx.lineWidth = seg.thickness;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(seg.x, seg.y);
        ctx.lineTo(seg.endX, seg.endY);
        ctx.stroke();
        ctx.restore();
      });
    });

    // 波/水しぶきアニメーションの描画
    waveAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.drops.forEach(drop => {
        ctx.save();
        ctx.globalAlpha = drop.opacity;
        ctx.fillStyle = '#4dd0e1';
        ctx.beginPath();
        ctx.arc(screenX + drop.offsetX, screenY + drop.offsetY, drop.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      anim.rings.forEach(ring => {
        ctx.save();
        ctx.globalAlpha = ring.alpha;
        ctx.strokeStyle = '#00bcd4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
    });

    // 風/葉アニメーションの描画
    windAnimations.forEach(anim => {
      anim.leaves.forEach(leaf => {
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rotation);
        ctx.globalAlpha = leaf.opacity;
        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.size, leaf.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });

    // 煙/霧アニメーションの描画
    smokeAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.clouds.forEach(cloud => {
        ctx.save();
        ctx.globalAlpha = cloud.opacity;
        ctx.fillStyle = '#808080';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#808080';
        ctx.beginPath();
        ctx.arc(screenX + cloud.offsetX, screenY + cloud.offsetY, cloud.size * cloud.expansion, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });

    // 竜巻アニメーションの描画
    tornadoAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.particles.forEach(p => {
        const x = screenX + Math.cos(p.angle + anim.rotation) * p.radius;
        const y = screenY - p.height + Math.sin(p.angle + anim.rotation) * p.radius * 0.5;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#a0a0a0';
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });

    // 宝石アニメーションの描画
    gemAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.gems.forEach(gem => {
        ctx.save();
        ctx.translate(screenX + gem.offsetX, screenY + gem.offsetY);
        ctx.rotate(gem.rotation);
        ctx.fillStyle = gem.color;
        ctx.shadowColor = gem.color;
        ctx.shadowBlur = 15 * gem.sparkle;
        ctx.fillRect(-gem.size/2, -gem.size/2, gem.size, gem.size);
        ctx.restore();
      });
    });

    // 星の軌跡アニメーションの描画
    starTrailAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.stars.forEach(star => {
        const x = Math.cos(anim.rotation + star.angle) * star.radius;
        const y = Math.sin(anim.rotation + star.angle) * star.radius;
        star.trail.forEach(t => {
          ctx.save();
          ctx.globalAlpha = t.alpha;
          ctx.fillStyle = star.color;
          ctx.shadowColor = star.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(screenX + t.x, screenY + t.y, star.size * t.alpha, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      });
    });

    // 光の粒アニメーションの描画
    lightParticleAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(screenX + p.offsetX, screenY + p.offsetY, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });

    // スパイラルアニメーションの描画
    spiralAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.particles.forEach(p => {
        const x = Math.cos(anim.rotation + p.angle) * p.radius;
        const y = Math.sin(anim.rotation + p.angle) * p.radius + p.height;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(screenX + x, screenY + y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });

    // 鳥/羽アニメーションの描画
    birdAnimations.forEach(anim => {
      anim.birds.forEach(bird => {
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.fillStyle = '#8b4513';
        const wing = Math.sin(bird.wingPhase) * 10;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-bird.size/2, wing);
        ctx.lineTo(-bird.size, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(bird.size/2, -wing);
        ctx.lineTo(bird.size, 0);
        ctx.stroke();
        ctx.restore();
      });
      anim.feathers.forEach(f => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);
        ctx.globalAlpha = f.opacity;
        ctx.fillStyle = '#d2691e';
        ctx.fillRect(-f.size/2, -f.size, f.size, f.size * 2);
        ctx.restore();
      });
    });

    // ゴーストアニメーションの描画
    ghostAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.ghosts.forEach(ghost => {
        ctx.save();
        ctx.globalAlpha = ghost.opacity;
        ctx.fillStyle = 'rgba(200, 200, 255, 0.6)';
        ctx.shadowColor = '#c8c8ff';
        ctx.shadowBlur = 20;
        const x = screenX + ghost.offsetX + Math.sin(ghost.wavePhase) * 10;
        ctx.beginPath();
        ctx.arc(x, screenY + ghost.offsetY, ghost.size/2, 0, Math.PI, true);
        ctx.lineTo(x - ghost.size/2, screenY + ghost.offsetY + ghost.size/2);
        for (let i = 0; i < 3; i++) {
          ctx.lineTo(x - ghost.size/2 + ghost.size/3 * i, screenY + ghost.offsetY + ghost.size/2 + 5);
          ctx.lineTo(x - ghost.size/2 + ghost.size/3 * (i+0.5), screenY + ghost.offsetY + ghost.size/2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
    });

    // 蜂アニメーションの描画
    beeAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.bees.forEach(bee => {
        const x = screenX + Math.cos(bee.angle) * bee.radius;
        const y = screenY + Math.sin(bee.angle) * bee.radius;
        ctx.save();
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(x, y, bee.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(x - bee.size/2, y - bee.size/2 + i * bee.size/3);
          ctx.lineTo(x + bee.size/2, y - bee.size/2 + i * bee.size/3);
          ctx.stroke();
        }
        ctx.restore();
      });
    });

    // 蛍アニメーションの描画
    fireflyAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.fireflies.forEach(ff => {
        ctx.save();
        ctx.globalAlpha = ff.glow;
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 20 * ff.glow;
        ctx.beginPath();
        ctx.arc(screenX + ff.offsetX, screenY + ff.offsetY, ff.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });

    // 爆発アニメーションの描画
    explosionAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      if (anim.flash > 0.1) {
        ctx.save();
        ctx.globalAlpha = anim.flash;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, viewW, viewH);
        ctx.restore();
      }
      if (anim.shockwave.alpha > 0.05) {
        ctx.save();
        ctx.globalAlpha = anim.shockwave.alpha;
        ctx.strokeStyle = '#ff6347';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, anim.shockwave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      anim.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(screenX + p.offsetX, screenY + p.offsetY, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });

    // ターゲットアニメーションの描画
    targetAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.rings.forEach(ring => {
        ctx.save();
        ctx.globalAlpha = ring.alpha;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(anim.crosshair.rotation);
      ctx.globalAlpha = anim.crosshair.alpha;
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      const size = anim.crosshair.size;
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      ctx.lineTo(size, 0);
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.stroke();
      ctx.restore();
    });

    // 怒りマークアニメーションの描画
    angerAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.marks.forEach(mark => {
        ctx.save();
        ctx.translate(screenX + mark.offsetX, screenY + mark.offsetY);
        ctx.rotate(mark.rotation);
        ctx.globalAlpha = mark.opacity;
        ctx.fillStyle = '#ff0000';
        ctx.font = `bold ${mark.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💢', 0, 0);
        ctx.restore();
      });
    });

    // 花びらアニメーションの描画
    petalAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.petals.forEach(petal => {
        ctx.save();
        ctx.translate(screenX + petal.offsetX, screenY + petal.offsetY);
        ctx.rotate(petal.rotation);
        ctx.globalAlpha = petal.opacity;
        ctx.fillStyle = petal.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size, petal.size * 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });

    // ひまわりアニメーションの描画
    sunflowerAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.flowers.forEach(flower => {
        if (flower.growth > 0) {
          ctx.save();
          ctx.translate(screenX + flower.offsetX, screenY + flower.offsetY);
          ctx.rotate(flower.rotation);
          ctx.globalAlpha = flower.opacity;
          const petals = 12;
          for (let i = 0; i < petals; i++) {
            ctx.fillStyle = '#ffd700';
            ctx.save();
            ctx.rotate((i / petals) * Math.PI * 2);
            ctx.beginPath();
            ctx.ellipse(flower.size * 0.6, 0, flower.size * 0.3, flower.size * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ctx.fillStyle = '#8b4513';
          ctx.beginPath();
          ctx.arc(0, 0, flower.size * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      anim.seeds.forEach(seed => {
        ctx.save();
        ctx.translate(screenX + seed.offsetX, screenY + seed.offsetY);
        ctx.rotate(seed.rotation);
        ctx.fillStyle = '#654321';
        ctx.fillRect(-seed.size/2, -seed.size/2, seed.size, seed.size);
        ctx.restore();
      });
    });

    // バラアニメーションの描画
    roseAnimations.forEach(anim => {
      const { sx: screenX, sy: screenY } = mapToScreen(anim.mapX, anim.mapY, viewW, viewH);
      anim.petals.forEach(petal => {
        ctx.save();
        ctx.translate(screenX + petal.offsetX, screenY + petal.offsetY);
        ctx.rotate(petal.rotation);
        ctx.globalAlpha = petal.opacity;
        const colors = ['#ff0066', '#ff3385', '#ff66a3'];
        ctx.fillStyle = colors[petal.layer];
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size, petal.size * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      anim.sparkles.forEach(sp => {
        ctx.save();
        ctx.globalAlpha = sp.opacity;
        ctx.fillStyle = '#ffccff';
        ctx.shadowColor = '#ffccff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(screenX + sp.offsetX, screenY + sp.offsetY, sp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    });

    // 花火アニメーションの描画（マップ座標をスクリーン座標に変換）
    if (fireworks.length > 0) {
      const now = Date.now();
      
      fireworks.forEach((fw, fwIdx) => {
        if (now < fw.startTime) return; // まだ開始していない
        
        // マップ座標から現在のスクリーン座標を計算
        const { sx: screenX, sy: screenY } = mapToScreen(fw.mapX, fw.mapY, viewW, viewH);
        
        fw.particles.forEach((p) => {
          if (p.life <= 0) return;
          
          ctx.save();
          const alpha = p.life / p.maxLife;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 15;
          
          // 大きめの円で描画
          const size = 4 + (1 - alpha) * 3;
          ctx.beginPath();
          ctx.arc(screenX + p.x, screenY + p.y, size, 0, Math.PI * 2);
          ctx.fill();
          
          // 光の尾
          ctx.globalAlpha = alpha * 0.5;
          ctx.beginPath();
          ctx.arc(screenX + p.x * 0.8, screenY + p.y * 0.8, size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        });
      });
    }

    // キラキラエフェクトの描画（マップ座標をスクリーン座標に変換）
    if (sparkles.length > 0) {
      sparkles.forEach((sp) => {
        // マップ座標から現在のスクリーン座標を計算
        const { sx: screenX, sy: screenY } = mapToScreen(sp.mapX, sp.mapY, viewW, viewH);
        
        sp.particles.forEach((p) => {
          if (p.life <= 0) return;
          
          ctx.save();
          ctx.translate(screenX + p.offsetX, screenY + p.offsetY);
          ctx.rotate(p.rotation);
          
          const alpha = p.life / p.maxLife;
          ctx.globalAlpha = alpha;
          
          // 星の形を描画
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 15;
          
          const size = p.size * (0.8 + alpha * 0.2); // 少し脈動
          
          // 4方向の光線（+型）
          ctx.lineWidth = size * 0.3;
          ctx.strokeStyle = p.color;
          ctx.lineCap = 'round';
          
          // 縦線
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(0, size);
          ctx.stroke();
          
          // 横線
          ctx.beginPath();
          ctx.moveTo(-size, 0);
          ctx.lineTo(size, 0);
          ctx.stroke();
          
          // 斜め線（X型）
          ctx.globalAlpha = alpha * 0.7;
          const diagSize = size * 0.7;
          ctx.lineWidth = size * 0.2;
          
          ctx.beginPath();
          ctx.moveTo(-diagSize, -diagSize);
          ctx.lineTo(diagSize, diagSize);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(diagSize, -diagSize);
          ctx.lineTo(-diagSize, diagSize);
          ctx.stroke();
          
          // 中心の明るい点
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        });
      });
    }

    // 花吹雪描画（キラキラと同じパターン）
    if (cherryBlossoms.length > 0) {
      cherryBlossoms.forEach((cb) => {
        // マップ座標からスクリーン座標に変換（カメラ移動に追従）
        const { sx: centerScreenX, sy: centerScreenY } = mapToScreen(cb.mapX, cb.mapY, viewW, viewH);
        
        cb.particles.forEach((p) => {
          const screenX = centerScreenX + p.offsetX;
          const screenY = centerScreenY + p.offsetY;
          
          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.life;
          
          // 花びらを描画（楕円形）
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // ハイライト効果
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.ellipse(-p.size * 0.2, -p.size * 0.2, p.size * 0.4, p.size * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        });
      });
    }

    // 隕石描画
    if (meteors.length > 0 && meteorImageRef.current) {
      meteors.forEach((m) => {
        m.meteors.forEach((meteor) => {
          const screenX = m.x + meteor.offsetX;
          const screenY = m.y + meteor.offsetY;
          
          ctx.save();
          ctx.translate(screenX, screenY);
          // 回転なし（45度の角度は画像自体に含まれる）
          ctx.globalAlpha = meteor.life;
          
          // サイズに応じて明度を調整（全体的に明るく、大きいほどさらに明るい）
          const brightness = 1.2 + meteor.size * 0.6; // 小(0.2)→1.32, 大(1.3)→1.98
          ctx.filter = `brightness(${brightness})`;
          
          // 隕石画像を描画
          const img = meteorImageRef.current!;
          const w = img.width * meteor.size * 0.5; // スケール調整
          const h = img.height * meteor.size * 0.5;
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
          
          ctx.restore();
        });
      });
    }

    // コイン描画
    if (coinDrops.length > 0) {
      coinDrops.forEach((drop, dropIndex) => {
        const elapsed = (Date.now() - drop.startTime) / 1000;
        
        // 「所有：NN枚」テキスト（1秒間表示）
        if (elapsed < 1.0) {
          ctx.save();
          ctx.translate(drop.x, drop.y - 40);
          
          const totalText = `（所有：${totalCoins.toLocaleString()}枚）`;
          const totalFontSize = drop.totalCoins >= 100 ? 18 : 16;
          ctx.font = `bold ${totalFontSize}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // フェードアウト効果
          const fadeAlpha = elapsed < 0.7 ? 1 : (1 - (elapsed - 0.7) / 0.3);
          ctx.globalAlpha = fadeAlpha;
          
          // 影
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          
          // 縁取り（白、丸み付き）
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 6;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.strokeText(totalText, 0, 0);
          
          // 本体（濃い金色）
          ctx.fillStyle = '#ffa500';
          ctx.fillText(totalText, 0, 0);
          
          ctx.restore();
        }
        
        // 「+N枚」テキスト（物理演算で弾き飛ばす）
        if (drop.textPhysics && elapsed < 3.0) {
          const textElapsed = elapsed;
          const gravity = 800;
          const textY = drop.textPhysics.y + drop.textPhysics.vy * textElapsed + 0.5 * gravity * textElapsed * textElapsed;
          const textX = drop.textPhysics.x + drop.textPhysics.vx * textElapsed;
          
          // フェードアウト効果
          const fadeAlpha = textElapsed < 2.0 ? 1 : (1 - (textElapsed - 2.0) / 1.0);
          
          if (fadeAlpha > 0) {
            ctx.save();
            ctx.translate(textX, textY);
            ctx.globalAlpha = fadeAlpha;
            
            // 獲得枚数のテキスト
            const displayText = drop.totalCoins >= 100 
              ? `🎉 JACKPOT! ${drop.totalCoins}枚 🎉`
              : `+${drop.totalCoins}枚`;
            
            // フォントサイズ（大当たりは大きく）
            const fontSize = drop.totalCoins >= 100 ? 40 : 32;
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 影
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            
            // テキストの縁取り（白、丸み付き）
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 10;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeText(displayText, 0, 0);
            
            // テキスト本体（金色または虹色）
            if (drop.totalCoins >= 100) {
              const gradient = ctx.createLinearGradient(-100, 0, 100, 0);
              gradient.addColorStop(0, '#ff0080');
              gradient.addColorStop(0.25, '#ff8c00');
              gradient.addColorStop(0.5, '#ffd700');
              gradient.addColorStop(0.75, '#00ff00');
              gradient.addColorStop(1, '#0080ff');
              ctx.fillStyle = gradient;
            } else {
              ctx.fillStyle = '#ffd700';
            }
            ctx.fillText(displayText, 0, 0);
            
            ctx.restore();
          }
        }
        
        // 各コインを描画
        drop.coins.forEach((coin) => {
          const screenX = drop.x + coin.offsetX;
          const screenY = drop.y + coin.offsetY;
          
          ctx.save();
          ctx.translate(screenX, screenY);
          
          // 3D回転を擬似的に表現
          let scaleX = 1;
          let scaleY = 1;
          
          if (coin.rotationAxis === 'x') {
            // 縦回転（X軸中心）
            scaleY = Math.abs(Math.cos(coin.rotationAngle));
          } else if (coin.rotationAxis === 'y') {
            // 横回転（Y軸中心）
            scaleX = Math.abs(Math.cos(coin.rotationAngle));
          } else {
            // 斜め回転（Z軸中心）
            ctx.rotate(coin.rotation);
          }
          
          ctx.scale(scaleX, scaleY);
          ctx.globalAlpha = coin.life;
          
          // コインの基本サイズ
          const coinSize = 30 * coin.size;
          
          // コイン画像があれば画像を描画、なければ円を描画
          if (coinImageRef.current) {
            const img = coinImageRef.current;
            ctx.drawImage(img, -coinSize / 2, -coinSize / 2, coinSize, coinSize);
          } else {
            // フォールバック：金色の円
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coinSize / 2);
            if (coin.isJackpot) {
              // 大当たりは虚色（レインボー）
              gradient.addColorStop(0, '#fff');
              gradient.addColorStop(0.3, '#ffd700');
              gradient.addColorStop(0.6, '#ff69b4');
              gradient.addColorStop(1, '#8a2be2');
            } else {
              // 通常は金色
              gradient.addColorStop(0, '#fff8dc');
              gradient.addColorStop(0.5, '#ffd700');
              gradient.addColorStop(1, '#b8860b');
            }
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, coinSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // 縁取り
            ctx.strokeStyle = coin.isJackpot ? '#ff1493' : '#8b6914';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          
          ctx.restore();
        });
      });
    }

    // スロット描画
    if (slotAnimations.length > 0) {
      slotAnimations.forEach((slot) => {
        // 画面の左右中央に配置
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        
        ctx.save();
        ctx.translate(centerX, slot.y);
        
        const slotWidth = 280;
        const slotHeight = 240;
        const reelWidth = 70;
        const reelHeight = 120;
        const symbolHeight = 60;
        
        // スロットマシンの背景（淡い青系、丸角）
        const gradient = ctx.createLinearGradient(-slotWidth / 2, -slotHeight / 2, slotWidth / 2, slotHeight / 2);
        gradient.addColorStop(0, '#dbeafe'); // 淡い青
        gradient.addColorStop(1, '#bfdbfe'); // 淡い青（少し濃いめ）
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(-slotWidth / 2, -slotHeight / 2, slotWidth, slotHeight, 12);
        ctx.fill();
        
        // 外枠
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // ヘッダー部分（保有コイン表示）
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.fillRect(-slotWidth / 2, -slotHeight / 2, slotWidth, 28);
        
        // 保有コイン表示（コインアイコン付き）
        const headerY = -slotHeight / 2 + 14;
        
        // 「保有」テキスト
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1e40af';
        ctx.fillText('保有', -35, headerY);
        
        // コインアイコン（小さく）
        ctx.fillStyle = '#fbbf24'; // 金色
        ctx.beginPath();
        ctx.arc(-20, headerY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // コイン枚数（大きいフォント）
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#1e40af';
        ctx.fillText(`${totalCoins}`, -8, headerY);
        
        // 「枚」テキスト
        const coinsWidth = ctx.measureText(`${totalCoins}`).width;
        ctx.font = 'bold 14px Arial';
        ctx.fillText('枚', -8 + coinsWidth + 4, headerY);
        
        // 3つのリール
        slot.reels.forEach((reel, reelIndex) => {
          const reelX = -slotWidth / 2 + 35 + reelIndex * 75;
          const reelY = -slotHeight / 2 + 38;
          
          // リール背景
          ctx.fillStyle = '#ffffff'; // 白
          ctx.fillRect(reelX, reelY, reelWidth, reelHeight);
          ctx.strokeStyle = '#93c5fd';
          ctx.lineWidth = 2;
          ctx.strokeRect(reelX, reelY, reelWidth, reelHeight);
          
          // クリッピング領域を設定（リールの外にはみ出さないように）
          ctx.save();
          ctx.beginPath();
          ctx.rect(reelX, reelY, reelWidth, reelHeight);
          ctx.clip();
          
          // シンボルを描画
          const currentOffset = reel.offset % (reel.symbols.length * symbolHeight);
          for (let i = -1; i < 4; i++) {
            const symbolIndex = Math.floor((currentOffset / symbolHeight + i) % reel.symbols.length);
            const adjustedIndex = symbolIndex < 0 ? reel.symbols.length + symbolIndex : symbolIndex;
            const symbol = reel.symbols[adjustedIndex];
            const symbolY = reelY + reelHeight / 2 - symbolHeight / 2 + i * symbolHeight - (currentOffset % symbolHeight);
            
            ctx.font = 'bold 38px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText(symbol, reelX + reelWidth / 2, symbolY + symbolHeight / 2);
          }
          
          ctx.restore();
        });
        
        // フッター部分（今回の結果表示）
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.fillRect(-slotWidth / 2, slotHeight / 2 - 28, slotWidth, 28);
        
        // 結果テキストと回すボタンで共通利用する変数
        const allStopped = slot.reels.every(r => r.stopped);
        const elapsed = (Date.now() - slot.startTime) / 1000;
        const canSpin = allStopped && elapsed >= 3 && totalCoins >= 10;
        
        // 結果テキスト
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // テキストに影を追加（視認性向上）
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        if (allStopped) {
          // 停止後は結果を表示
          if (slot.isWin) {
            ctx.fillStyle = '#16a34a'; // 濃い緑
            ctx.fillText(`あたり ${slot.payout}枚`, 0, slotHeight / 2 - 14);
          } else {
            ctx.fillStyle = '#dc2626'; // 濃い赤
            ctx.fillText('はずれ', 0, slotHeight / 2 - 14);
          }
        } else {
          // 回転中はbet -10枚を表示
          ctx.fillStyle = '#1e40af'; // 濃い青
          ctx.fillText('bet -10枚', 0, slotHeight / 2 - 14);
        }
        
        // 影をリセット
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // ×ボタン（右上）
        const closeButtonSize = 24;
        const closeButtonX = slotWidth / 2 - 30;
        const closeButtonY = -slotHeight / 2 + 5;
        
        // ボタン背景（白）
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(closeButtonX + closeButtonSize / 2, closeButtonY + closeButtonSize / 2, closeButtonSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // ボタン枠（青）
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // ×マーク（青）
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        const crossSize = 10;
        ctx.beginPath();
        ctx.moveTo(closeButtonX + closeButtonSize / 2 - crossSize / 2, closeButtonY + closeButtonSize / 2 - crossSize / 2);
        ctx.lineTo(closeButtonX + closeButtonSize / 2 + crossSize / 2, closeButtonY + closeButtonSize / 2 + crossSize / 2);
        ctx.moveTo(closeButtonX + closeButtonSize / 2 + crossSize / 2, closeButtonY + closeButtonSize / 2 - crossSize / 2);
        ctx.lineTo(closeButtonX + closeButtonSize / 2 - crossSize / 2, closeButtonY + closeButtonSize / 2 + crossSize / 2);
        ctx.stroke();
        
        // 回すボタン（常に表示）
        
        const buttonWidth = 100;
        const buttonHeight = 35;
        const buttonX = -buttonWidth / 2;
        const buttonY = slotHeight / 2 - 65; // リールの下、フッターの上
        
        // ボタン背景（押せる時は白、押せない時はグレー）
        if (canSpin) {
          // 有効時：白背景と影
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 3;
          
          ctx.fillStyle = '#ffffff';
        } else {
          // 無効時：グレー
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = '#6b7280';
        }
        
        ctx.beginPath();
        ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
        ctx.fill();
        
        // ボタン枠
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.strokeStyle = canSpin ? '#2563eb' : '#4b5563';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // ボタンテキスト（強調）
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // テキスト色（白背景の時は青、グレー背景の時は白）
        ctx.fillStyle = canSpin ? '#2563eb' : '#ffffff';
        ctx.fillText('回す', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        // 影をリセット
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.restore();
      });
    }

    // pendingPosition（クリックした位置）に赤い+マークを描画（編集モード時のみ）
    // カメラ変換の外で画面座標に直接描画
    if (isEditMode && pendingPosition) {
      ctx.save();
      
      // ワールド座標をスクリーン座標に変換
      const worldX = (pendingPosition.x + 0.5) * cfg.cell;
      const worldY = (pendingPosition.y + 0.5) * cfg.cell;
      
      // カメラ変換を手動で適用
      const cx = (cfg.cols * cfg.cell) / 2;
      const cy = (cfg.rows * cfg.cell) / 2;
      
      // 回転を考慮した座標変換
      const rotatedX = Math.cos(LOOK.angle) * (worldX - cx) - Math.sin(LOOK.angle) * (worldY - cy);
      const rotatedY = Math.sin(LOOK.angle) * (worldX - cx) + Math.cos(LOOK.angle) * (worldY - cy);
      
      // スケールとパンを適用
      const screenX = (viewW / 2) + (rotatedX * cam.scale) + cam.tx;
      const screenY = (viewH / 2) + (rotatedY * cam.scale) + cam.ty;
      
      // +マークの描画（スクリーン座標で）
      const markSize = 20;
      const lineWidth = 4;
      
      // 影付き赤い+マーク
      ctx.shadowColor = "rgba(239, 68, 68, 0.6)";
      ctx.shadowBlur = 8;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      
      // 縦線
      ctx.beginPath();
      ctx.moveTo(screenX, screenY - markSize / 2);
      ctx.lineTo(screenX, screenY + markSize / 2);
      ctx.stroke();
      
      // 横線
      ctx.beginPath();
      ctx.moveTo(screenX - markSize / 2, screenY);
      ctx.lineTo(screenX + markSize / 2, screenY);
      ctx.stroke();
      
      // 白い縁取り（視認性向上）
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "white";
      ctx.lineWidth = lineWidth + 2;
      ctx.globalAlpha = 0.3;
      
      ctx.beginPath();
      ctx.moveTo(screenX, screenY - markSize / 2);
      ctx.lineTo(screenX, screenY + markSize / 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(screenX - markSize / 2, screenY);
      ctx.lineTo(screenX + markSize / 2, screenY);
      ctx.stroke();
      
      ctx.restore();
    }
  };

  // アニメーション判定関数：どのアニメーションを表示するか決定
  const getActiveAnimation = (obj: Obj): string | null => {
    // 1. 誕生日チェック（最優先）
    if (obj.birthday) {
      const birthdayPattern = /(\d{1,2})月(\d{1,2})日/;
      const match = obj.birthday.match(birthdayPattern);
      if (match) {
        const birthdayMonth = parseInt(match[1], 10);
        const currentMonth = new Date().getMonth() + 1;
        if (birthdayMonth === currentMonth) {
          return 'birthday'; // 誕生日アニメを返す（既存の紙吹雪）
        }
      }
    }
    
    // 2. Type固有アニメ
    if (obj.type === 'BEAR_TRAP') {
      return 'beartrap';
    }
    
    // 3. Animationフィールド
    if (obj.Animation && obj.Animation.trim()) {
      const anim = obj.Animation.toLowerCase();
      if ([
        'fireworks', 'sparkle', 'beartrap', 'birthday', 'cherryblossom', 'meteor', 'coin', 'slot', 'fishquiz', 'yojijukugo', 'englishquiz', 'cat',
        'balloon', 'aurora', 'butterfly', 'shootingstar', 'autumnleaves', 'snow', 'confetti', 'rainbow', 'rain', 'magiccircle',
        'flame', 'thunder', 'wave', 'wind', 'smoke', 'tornado', 'gem', 'startrail', 'lightparticle', 'spiral',
        'bird', 'ghost', 'bee', 'firefly', 'explosion', 'target', 'anger', 'petal', 'sunflower', 'rose',
        'random'
      ].includes(anim)) {
        return anim;
      }
    }
    
    return null; // アニメーションなし
  };

  // 花火アニメーション開始関数
  const startFireworksAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    
    // オブジェクトのマップ座標を取得（中心位置）
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    
    // マップ座標からスクリーン座標に変換
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    // オブジェクト中心から360度に広がる花火
    const newFireworks: Firework[] = [];
    const colors = ['#ff1744', '#00e676', '#2979ff', '#ffd600', '#e040fb', '#00e5ff', '#ff6e40', '#ff4081'];
    
    const particles = [];
    const particleCount = 150; // 粒子数を増やして豪華に
    
    for (let j = 0; j < particleCount; j++) {
      // 360度均等に配置 + ランダム性
      const angle = (Math.PI * 2 * j) / particleCount + (Math.random() - 0.5) * 0.2;
      const speed = 8 + Math.random() * 12; // 速度を緩める（8-20）
      particles.push({
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: 0,
        y: 0,
      });
    }
    
    newFireworks.push({
      x: centerX,
      y: centerY,
      mapX: objMapX,
      mapY: objMapY,
      particles,
      startTime: Date.now(),
    });
    
    setFireworks(newFireworks);
  };

  // キラキラエフェクト開始関数
  const startSparkleAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    
    // オブジェクトのマップ座標を取得（中心位置）
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    
    // マップ座標からスクリーン座標に変換
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const particles = [];
    const particleCount = 120; // 粒子数を増やす
    const colors = ['#ffd700', '#ffed4e', '#fff59d', '#ffffff', '#ffe082', '#ffb300'];
    
    for (let i = 0; i < particleCount; i++) {
      // 360度均等に配置 + ランダム性
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.2;
      const speed = 6 + Math.random() * 10; // 速度を緩める（6-16）
      
      particles.push({
        offsetX: 0,
        offsetY: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 10,
        rotation: Math.random() * Math.PI * 2,
        life: 1.0,
        maxLife: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    setSparkles([{
      x: centerX,
      y: centerY,
      mapX: objMapX, // マップ座標を保存
      mapY: objMapY,
      particles,
      startTime: Date.now(),
      targetObj: obj,
    }]);
  };

  // 花吹雪アニメーション開始（オブジェクトを出発点とする）
  const startCherryBlossomAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    
    // オブジェクトのマップ座標を取得（中心位置）
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    
    // マップ座標からスクリーン座標に変換
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const particles = [];
    const particleCount = 100;
    const colors = ['#ffb7c5', '#ffc0cb', '#ffcce5', '#ffe4e1', '#fff0f5', '#ffd1dc', '#ff69b4', '#ffaad5'];
    
    for (let i = 0; i < particleCount; i++) {
      // 360度均等に配置 + ランダム性（キラキラと同じパターン）
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.2;
      const speed = 2 + Math.random() * 4; // 速度を遅く（2-6）散っていく様子が見えるように
      
      particles.push({
        offsetX: 0,
        offsetY: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 8 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        life: 1.0,
        maxLife: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    setCherryBlossoms([{
      x: centerX,
      y: centerY,
      mapX: objMapX,
      mapY: objMapY,
      particles,
      startTime: Date.now(),
      targetObj: obj,
    }]);
  };

  // 隕石アニメーション開始
  const startMeteorAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    
    // 画面右上から左下へ（ビュー座標系で開始）
    const startX = viewW + 100; // 右端外
    const startY = -200 + Math.random() * 400; // 上端外（高さランダム -200～200）
    
    const meteorsList: Array<{
      offsetX: number;
      offsetY: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      swayOffset: number;
      swaySpeed: number;
      life: number;
    }> = [];
    
    // ランダムな大きさの隕石1つ
    const randomSize = 0.2 + Math.random() * 1.1; // 0.2～1.3のランダムサイズ（幅拡大）
    meteorsList.push({
      offsetX: 0,
      offsetY: 0,
      vx: -2.0, // 左へ（スピードアップ）
      vy: 2.0, // 下へ（スピードアップ）
      size: randomSize, // ランダムサイズ
      rotation: -Math.PI / 4, // -45度（表示用、実際は回転しない）
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: 0.08, // 揺れを細かく
      life: 1.0,
    });
    
    // 既存の隕石に追加（消さない）
    setMeteors(prev => [...prev, {
      x: startX,
      y: startY,
      meteors: meteorsList,
      startTime: Date.now(),
    }]);
  };

  // コインアニメーション開始
  const startCoinAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    
    // オブジェクトのマップ座標を取得（中心位置）
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    
    // マップ座標からスクリーン座標に変換
    const { sx: startX, sy: startY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    // コイン枚数決定（1-25枚のランダム、大当たり100枚は1%）
    const isJackpot = Math.random() < 0.01; // 1%の確率で大当たり
    const coinCount = isJackpot ? 100 : Math.floor(Math.random() * 25) + 1; // 1-25枚
    
    const coinsList: Array<{
      offsetX: number;
      offsetY: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      rotationAxis: 'x' | 'y' | 'z';
      rotationAngle: number;
      size: number;
      life: number;
      isJackpot: boolean;
    }> = [];
    
    // コインを生成（上向きの扇状に飛び散る）
    for (let i = 0; i < coinCount; i++) {
      // 扇状の角度（上向き中心に左右120度の範囲）
      const fanAngle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 0.67); // -90度を中心に±60度
      const speed = 4 + Math.random() * 8; // 速度をアップ
      const vx = Math.cos(fanAngle) * speed;
      const vy = Math.sin(fanAngle) * speed; // 上方向に強く飛ぶ
      
      // 回転軸をランダムに選択
      const rotationAxes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
      const rotationAxis = rotationAxes[Math.floor(Math.random() * 3)];
      
      coinsList.push({
        offsetX: 0,
        offsetY: 0,
        vx: vx,
        vy: vy,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.4, // 回転速度を上げる
        rotationAxis: rotationAxis,
        rotationAngle: 0,
        size: isJackpot ? 1.5 : 1.0, // 大当たりは1.5倍
        life: 1.0,
        isJackpot: isJackpot,
      });
    }
    
    // 既存のコインに追加（消さない）
    setCoinDrops(prev => [...prev, {
      x: startX,
      y: startY,
      coins: coinsList,
      startTime: Date.now(),
      totalCoins: coinCount,
      textPhysics: {
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 200, // -100 ~ 100の横方向速度
        vy: -300 - Math.random() * 200, // -300 ~ -500の上方向初速
      },
    }]);
    
    // コイン総数を加算してlocalStorageに保存
    setTotalCoins(prev => {
      const newTotal = prev + coinCount;
      try {
        localStorage.setItem('totalCoins', newTotal.toString());
      } catch (e) {
        console.error('Failed to save totalCoins:', e);
      }
      return newTotal;
    });
  };

  // スロットアニメーション開始
  const startSlotAnimation = (objOrX: Obj | number, y?: number) => {
    // コインが10枚未満なら実行しない
    if (totalCoins < 10) {
      setToastMessage('⚠️ コインが足りません（10枚必要）');
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    
    let startX: number;
    let startY: number;
    
    // 引数が数値の場合は直接座標として使用、オブジェクトの場合は画面中央に配置
    if (typeof objOrX === 'number' && y !== undefined) {
      // 既存のスロット位置を再利用
      startX = objOrX;
      startY = y;
    } else {
      // オブジェクトから開始する場合は画面の中央に配置
      startX = viewW / 2;
      startY = viewH / 2;
    }
    
    // 10コイン消費
    setTotalCoins(prev => {
      const newTotal = Math.max(0, prev - 10);
      try {
        localStorage.setItem('totalCoins', newTotal.toString());
      } catch (e) {
        console.error('Failed to save totalCoins:', e);
      }
      return newTotal;
    });
    
    // 絵柄の種類
    const symbols = ['🍒', '🍋', '🔔', '7', 'BAR'];
    
    // 各リールの結果を事前に決定
    const result = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];
    
    // 配当計算（10枚ベットなので大きめに）
    let payout = 0;
    let isWin = false;
    
    if (result[0] === result[1] && result[1] === result[2]) {
      // 3つ揃い
      isWin = true;
      if (result[0] === '7') {
        payout = 1000; // 777 大当たり
      } else if (result[0] === 'BAR') {
        payout = 500; // BAR揃い
      } else {
        payout = 300; // その他揃い
      }
    } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
      // 2つ揃い
      isWin = true;
      payout = 50;
    }
    
    // 各リールの初期設定
    const reels = result.map((finalSymbol, index) => {
      // 結果の絵柄が何番目かを見つける
      const finalIndex = symbols.indexOf(finalSymbol);
      const symbolHeight = 60;
      
      return {
        symbols: symbols,
        offset: Math.random() * symbols.length * symbolHeight, // ランダムな初期位置
        speed: 40 + Math.random() * 20, // 高速回転
        stopping: false,
        stopped: false,
        finalIndex: finalIndex,
        stopTime: 0,
      };
    });
    
    // スロットアニメーションを開始
    setSlotAnimations(prev => [...prev, {
      x: startX,
      y: startY,
      reels: reels,
      startTime: Date.now(),
      result: result,
      payout: payout,
      isWin: isWin,
    }]);
  };

  // 魚クイズアニメーション開始
  const startFishQuizAnimation = (objOrX: Obj | number, y?: number) => {
    // コインチェック（10コイン必要）
    if (totalCoins < 10) {
      // コイン不足の場合は専用の状態を表示
      const canvas = canvasRef.current;
      if (!canvas) return;

      let startX: number, startY: number;
      if (typeof objOrX === 'number' && y !== undefined) {
        startX = objOrX;
        startY = y;
      } else if (typeof objOrX === 'object') {
        const rect = canvas.getBoundingClientRect();
        const gridX = (objOrX.x || 0) + Math.floor((objOrX.w || 1) / 2);
        const gridY = (objOrX.y || 0) + Math.floor((objOrX.h || 1) / 2);
        startX = (gridX - cam.tx) * cam.scale + rect.width / 2;
        startY = (gridY - cam.ty) * cam.scale + rect.height / 2;
      } else {
        return;
      }

      setFishQuiz({
        x: startX,
        y: startY,
        question: FISH_QUESTIONS[0], // ダミー
        choices: [],
        state: 'insufficient_coins',
        selectedAnswer: null,
        startTime: Date.now(),
        reward: 0,
        consecutiveCount: fishQuizConsecutiveCorrect,
      });
      return;
    }

    // コインを10枚消費
    const newTotal = totalCoins - 10;
    setTotalCoins(newTotal);
    localStorage.setItem('totalCoins', newTotal.toString());

    const canvas = canvasRef.current;
    if (!canvas) return;

    let startX: number, startY: number;
    if (typeof objOrX === 'number' && y !== undefined) {
      startX = objOrX;
      startY = y;
    } else if (typeof objOrX === 'object') {
      const rect = canvas.getBoundingClientRect();
      const gridX = (objOrX.x || 0) + Math.floor((objOrX.w || 1) / 2);
      const gridY = (objOrX.y || 0) + Math.floor((objOrX.h || 1) / 2);
      startX = (gridX - cam.tx) * cam.scale + rect.width / 2;
      startY = (gridY - cam.ty) * cam.scale + rect.height / 2;
    } else {
      return;
    }

    // localStorage から履歴を取得
    const asked = new Set(
      JSON.parse(localStorage.getItem("fishQuizAsked") || "[]")
    );
    const wrong = new Set(
      JSON.parse(localStorage.getItem("fishQuizWrong") || "[]")
    );

    // 未出題の問題を優先、なければ間違えた問題、全て正解していたらリセット
    const unasked = FISH_QUESTIONS.filter((q) => !asked.has(q.id));
    const wrongQuestions = FISH_QUESTIONS.filter((q) => wrong.has(q.id));

    let pool: typeof FISH_QUESTIONS = [];
    if (unasked.length > 0) {
      pool = unasked;
    } else if (wrongQuestions.length > 0) {
      pool = wrongQuestions;
    } else {
      // 全問正解したのでリセット
      localStorage.removeItem("fishQuizAsked");
      localStorage.removeItem("fishQuizWrong");
      pool = FISH_QUESTIONS;
    }

    // ランダムに問題を選択
    const randomQuestion = pool[Math.floor(Math.random() * pool.length)];
    
    // 選択肢をシャッフル
    const shuffledChoices = [randomQuestion.correct, randomQuestion.wrong1, randomQuestion.wrong2]
      .sort(() => Math.random() - 0.5);

    setFishQuiz({
      x: startX,
      y: startY,
      question: randomQuestion,
      choices: shuffledChoices,
      state: 'showing',
      selectedAnswer: null,
      startTime: Date.now(),
      reward: 0,
      consecutiveCount: fishQuizConsecutiveCorrect,
    });

    // 0.8秒後に回答モードに
    setTimeout(() => {
      setFishQuiz(prev => prev ? { ...prev, state: 'answering' } : null);
    }, 800);
  };

  // 四字熟語クイズアニメーション開始
  const startYojijukugoAnimation = (objOrX: Obj | number, y?: number) => {
    // コインチェック(10コイン必要)
    if (totalCoins < 10) {
      // コイン不足の場合は専用の状態を表示
      const canvas = canvasRef.current;
      if (!canvas) return;

      let startX: number, startY: number;
      if (typeof objOrX === 'number' && y !== undefined) {
        startX = objOrX;
        startY = y;
      } else if (typeof objOrX === 'object') {
        const rect = canvas.getBoundingClientRect();
        const gridX = (objOrX.x || 0) + Math.floor((objOrX.w || 1) / 2);
        const gridY = (objOrX.y || 0) + Math.floor((objOrX.h || 1) / 2);
        startX = (gridX - cam.tx) * cam.scale + rect.width / 2;
        startY = (gridY - cam.ty) * cam.scale + rect.height / 2;
      } else {
        return;
      }

      setYojijukugoQuiz({
        x: startX,
        y: startY,
        question: YOJIJUKUGO_QUESTIONS[0], // ダミー
        choices: [],
        state: 'insufficient_coins',
        selectedAnswer: null,
        startTime: Date.now(),
        reward: 0,
        consecutiveCount: yojijukugoQuizConsecutiveCorrect,
      });
      return;
    }

    // コインを10枚消費
    const newTotal = totalCoins - 10;
    setTotalCoins(newTotal);
    localStorage.setItem('totalCoins', newTotal.toString());

    const canvas = canvasRef.current;
    if (!canvas) return;

    let startX: number, startY: number;
    if (typeof objOrX === 'number' && y !== undefined) {
      startX = objOrX;
      startY = y;
    } else if (typeof objOrX === 'object') {
      const rect = canvas.getBoundingClientRect();
      const gridX = (objOrX.x || 0) + Math.floor((objOrX.w || 1) / 2);
      const gridY = (objOrX.y || 0) + Math.floor((objOrX.h || 1) / 2);
      startX = (gridX - cam.tx) * cam.scale + rect.width / 2;
      startY = (gridY - cam.ty) * cam.scale + rect.height / 2;
    } else {
      return;
    }

    // localStorage から履歴を取得
    const asked = new Set(
      JSON.parse(localStorage.getItem("yojijukugoQuizAsked") || "[]")
    );
    const wrong = new Set(
      JSON.parse(localStorage.getItem("yojijukugoQuizWrong") || "[]")
    );

    // 未出題の問題を優先、なければ間違えた問題、全て正解していたらリセット
    const unasked = YOJIJUKUGO_QUESTIONS.filter((q) => !asked.has(q.id));
    const wrongQuestions = YOJIJUKUGO_QUESTIONS.filter((q) => wrong.has(q.id));

    let pool: typeof YOJIJUKUGO_QUESTIONS = [];
    if (unasked.length > 0) {
      pool = unasked;
    } else if (wrongQuestions.length > 0) {
      pool = wrongQuestions;
    } else {
      // 全問正解したのでリセット
      localStorage.removeItem("yojijukugoQuizAsked");
      localStorage.removeItem("yojijukugoQuizWrong");
      pool = YOJIJUKUGO_QUESTIONS;
    }

    // ランダムに問題を選択
    const randomQuestion = pool[Math.floor(Math.random() * pool.length)];
    
    // 選択肢をシャッフル
    const shuffledChoices = [randomQuestion.correct, randomQuestion.wrong1, randomQuestion.wrong2]
      .sort(() => Math.random() - 0.5);

    setYojijukugoQuiz({
      x: startX,
      y: startY,
      question: randomQuestion,
      choices: shuffledChoices,
      state: 'showing',
      selectedAnswer: null,
      startTime: Date.now(),
      reward: 0,
      consecutiveCount: yojijukugoQuizConsecutiveCorrect,
    });

    // 0.8秒後に回答モードに
    setTimeout(() => {
      setYojijukugoQuiz(prev => prev ? { ...prev, state: 'answering' } : null);
    }, 800);
  };

  // 英単語クイズアニメーション開始
  const startEnglishQuizAnimation = (objOrX: Obj | number, y?: number) => {
    // コインチェック(10コイン必要)
    if (totalCoins < 10) {
      // コイン不足の場合は専用の状態を表示
      const canvas = canvasRef.current;
      if (!canvas) return;

      let startX: number, startY: number;
      if (typeof objOrX === 'number' && y !== undefined) {
        startX = objOrX;
        startY = y;
      } else if (typeof objOrX === 'object') {
        const rect = canvas.getBoundingClientRect();
        const gridX = (objOrX.x || 0) + Math.floor((objOrX.w || 1) / 2);
        const gridY = (objOrX.y || 0) + Math.floor((objOrX.h || 1) / 2);
        startX = (gridX - cam.tx) * cam.scale + rect.width / 2;
        startY = (gridY - cam.ty) * cam.scale + rect.height / 2;
      } else {
        return;
      }

      setEnglishQuiz({
        x: startX,
        y: startY,
        question: ENGLISH_QUESTIONS[0], // ダミー
        choices: [],
        state: 'insufficient_coins',
        selectedAnswer: null,
        startTime: Date.now(),
        reward: 0,
        consecutiveCount: englishQuizConsecutiveCorrect,
      });
      return;
    }

    // コインを10枚消費
    const newTotal = totalCoins - 10;
    setTotalCoins(newTotal);
    localStorage.setItem('totalCoins', newTotal.toString());

    const canvas = canvasRef.current;
    if (!canvas) return;

    let startX: number, startY: number;
    if (typeof objOrX === 'number' && y !== undefined) {
      startX = objOrX;
      startY = y;
    } else if (typeof objOrX === 'object') {
      const rect = canvas.getBoundingClientRect();
      const gridX = (objOrX.x || 0) + Math.floor((objOrX.w || 1) / 2);
      const gridY = (objOrX.y || 0) + Math.floor((objOrX.h || 1) / 2);
      startX = (gridX - cam.tx) * cam.scale + rect.width / 2;
      startY = (gridY - cam.ty) * cam.scale + rect.height / 2;
    } else {
      return;
    }

    // localStorage から履歴を取得
    const asked = new Set(
      JSON.parse(localStorage.getItem("englishQuizAsked") || "[]")
    );
    const wrong = new Set(
      JSON.parse(localStorage.getItem("englishQuizWrong") || "[]")
    );

    // 未出題の問題を優先、なければ間違えた問題、全て正解していたらリセット
    const unasked = ENGLISH_QUESTIONS.filter((q) => !asked.has(q.id));
    const wrongQuestions = ENGLISH_QUESTIONS.filter((q) => wrong.has(q.id));

    let pool: typeof ENGLISH_QUESTIONS = [];
    if (unasked.length > 0) {
      pool = unasked;
    } else if (wrongQuestions.length > 0) {
      pool = wrongQuestions;
    } else {
      // 全問正解したのでリセット
      localStorage.removeItem("englishQuizAsked");
      localStorage.removeItem("englishQuizWrong");
      pool = ENGLISH_QUESTIONS;
    }

    // ランダムに問題を選択
    const randomQuestion = pool[Math.floor(Math.random() * pool.length)];
    
    // 選択肢をシャッフル
    const shuffledChoices = [randomQuestion.correct, randomQuestion.wrong1, randomQuestion.wrong2]
      .sort(() => Math.random() - 0.5);

    setEnglishQuiz({
      x: startX,
      y: startY,
      question: randomQuestion,
      choices: shuffledChoices,
      state: 'showing',
      selectedAnswer: null,
      startTime: Date.now(),
      reward: 0,
      consecutiveCount: englishQuizConsecutiveCorrect,
    });

    // 0.8秒後に回答モードに
    setTimeout(() => {
      setEnglishQuiz(prev => prev ? { ...prev, state: 'answering' } : null);
    }, 800);
  };

  // バルーンアニメーション開始
  const startBalloonAnimation = (x: number, y: number) => {
    const balloons: BalloonAnimation['balloons'] = [];
    const colors = ['#ff6b9d', '#ffd93d', '#6bcf7f', '#6eb5ff', '#c77dff'];
    for (let i = 0; i < 10; i++) {
      balloons.push({
        offsetX: (Math.random() - 0.5) * 100,
        offsetY: 0,
        vy: 1 + Math.random() * 1,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.03 + Math.random() * 0.02,
        size: 15 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 5 + Math.random() * 3,
        stringLength: 30 + Math.random() * 20,
      });
    }
    setBalloonAnimations(prev => [...prev, { x, y, balloons, startTime: Date.now() }]);
  };

  // オーロラアニメーション開始
  const startAuroraAnimation = () => {
    const waves: AuroraAnimation['waves'] = [];
    const colors = ['rgba(0,255,150,0.5)', 'rgba(100,200,255,0.5)', 'rgba(200,100,255,0.5)'];
    for (let i = 0; i < 3; i++) {
      waves.push({
        offsetY: 50 + i * 30,
        amplitude: 30 + Math.random() * 20,
        frequency: 0.005 + Math.random() * 0.005,
        speed: 0.02 + Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2,
        color: colors[i],
        alpha: 0.7,
      });
    }
    setAuroraAnimations(prev => [...prev, { waves, startTime: Date.now(), life: 10 }]);
  };

  // 蝶々アニメーション開始
  const startButterflyAnimation = (x: number, y: number) => {
    const butterflies: ButterflyAnimation['butterflies'] = [];
    const colors = ['#ffeb3b', '#64b5f6', '#ffffff', '#f06292'];
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      butterflies.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        angle: angle,
        flutterPhase: Math.random() * Math.PI * 2,
        flutterSpeed: 0.2 + Math.random() * 0.1,
        size: 8 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 8 + Math.random() * 4,
        pathType: Math.random() < 0.5 ? 'figure8' : 'random',
        pathProgress: 0,
      });
    }
    setButterflyAnimations(prev => [...prev, { butterflies, startTime: Date.now() }]);
  };

  // 流れ星アニメーション開始
  const startShootingStarAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const stars: ShootingStarAnimation['stars'] = [];
    for (let i = 0; i < 3; i++) {
      const startX = rect.width * (0.7 + Math.random() * 0.3);
      const startY = Math.random() * rect.height * 0.3;
      stars.push({
        x: startX,
        y: startY,
        vx: -(3 + Math.random() * 2),
        vy: 2 + Math.random() * 1,
        length: 50 + Math.random() * 30,
        brightness: 0.8 + Math.random() * 0.2,
        life: 3 + Math.random() * 2,
        trailPoints: [],
      });
    }
    setShootingStarAnimations(prev => [...prev, { stars, startTime: Date.now() }]);
  };

  // 紅葉アニメーション開始
  const startAutumnLeavesAnimation = (x: number, y: number) => {
    const leaves: AutumnLeavesAnimation['leaves'] = [];
    const colors = ['#d32f2f', '#f57c00', '#fbc02d', '#c62828', '#ff6f00'];
    const leafTypes: Array<'maple' | 'ginkgo' | 'oak'> = ['maple', 'ginkgo', 'oak'];
    for (let i = 0; i < 30; i++) {
      leaves.push({
        offsetX: (Math.random() - 0.5) * 100,
        offsetY: -Math.random() * 50,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0.5 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.03 + Math.random() * 0.02,
        size: 8 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        leafType: leafTypes[Math.floor(Math.random() * leafTypes.length)],
        life: 8 + Math.random() * 4,
      });
    }
    setAutumnLeavesAnimations(prev => [...prev, { x, y, leaves, startTime: Date.now() }]);
  };

  // 雪アニメーション開始
  const startSnowAnimation = (duration: number = 20) => {
    const snowflakes: SnowAnimation['snowflakes'] = [];
    for (let i = 0; i < 30; i++) {
      snowflakes.push({
        x: Math.random() * 2000 - 500,
        y: Math.random() * -200,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 0.5 + 0.5,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.05 + 0.02,
        opacity: Math.random() * 0.5 + 0.5,
        life: 10,
      });
    }
    setSnowAnimations(prev => [...prev, { snowflakes, startTime: Date.now(), duration }]);
  };

  // 紙吹雪アニメーション開始
  const startConfettiAnimation = (x: number, y: number) => {
    const confetti: ConfettiAnimation['confetti'] = [];
    const colors = ['#ff6b9d', '#ffd93d', '#6bcf7f', '#6eb5ff', '#c77dff', '#ff5252', '#ffeb3b'];
    const shapes: Array<'rectangle' | 'circle' | 'star'> = ['rectangle', 'circle', 'star'];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      confetti.push({
        offsetX: 0,
        offsetY: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        width: 5 + Math.random() * 5,
        height: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        life: 5 + Math.random() * 3,
      });
    }
    setConfettiAnimations(prev => [...prev, { x, y, confetti, startTime: Date.now() }]);
  };

  // 虹アニメーション開始
  const startRainbowAnimation = (x: number, y: number) => {
    setRainbowAnimations(prev => [...prev, {
      x,
      y,
      radius: 200,
      width: 40,
      alpha: 0,
      life: 8,
      startTime: Date.now(),
    }]);
  };

  // 雨アニメーション開始
  const startRainAnimation = (duration: number = 15) => {
    const raindrops: RainAnimation['raindrops'] = [];
    for (let i = 0; i < 50; i++) {
      raindrops.push({
        x: Math.random() * 2000 - 500,
        y: Math.random() * -200,
        vy: Math.random() * 5 + 15,
        length: Math.random() * 10 + 15,
        opacity: Math.random() * 0.3 + 0.3,
        splash: false,
        splashProgress: 0,
        life: 3,
      });
    }
    setRainAnimations(prev => [...prev, { raindrops, startTime: Date.now(), duration }]);
  };

  // 魔法陣アニメーション開始
  const startMagicCircleAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    setMagicCircleAnimations(prev => [...prev, {
      x: centerX,
      y: centerY,
      mapX: objMapX,
      mapY: objMapY,
      radius: 60,
      rotation: 0,
      rotationSpeed: 0.05,
      alpha: 0,
      life: 5,
      glowIntensity: 1,
      startTime: Date.now(),
      targetObj: obj,
    }]);
  };

  // 炎アニメーション開始関数
  const startFlameAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const flames: FlameAnimation['flames'] = [];
    for (let i = 0; i < 20; i++) {
      flames.push({
        offsetX: (Math.random() - 0.5) * 40,
        offsetY: 0,
        size: Math.random() * 15 + 10,
        vy: -(Math.random() * 2 + 1),
        opacity: Math.random() * 0.5 + 0.5,
        color: ['#ff4500', '#ff6347', '#ffa500', '#ffff00'][Math.floor(Math.random() * 4)],
        life: Math.random() * 2 + 1,
        flicker: Math.random() * Math.PI * 2,
      });
    }
    setFlameAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, flames, startTime: Date.now(), targetObj: obj }]);
  };

  // 雷アニメーション開始関数
  const startThunderAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const segments: ThunderAnimation['segments'] = [];
    const startX = Math.random() * rect.width;
    let currentX = startX;
    let currentY = 0;
    while (currentY < rect.height) {
      const nextX = currentX + (Math.random() - 0.5) * 100;
      const nextY = currentY + Math.random() * 80 + 40;
      segments.push({ x: currentX, y: currentY, endX: nextX, endY: nextY, alpha: 1, thickness: Math.random() * 3 + 2 });
      currentX = nextX;
      currentY = nextY;
    }
    setThunderAnimations(prev => [...prev, { segments, startTime: Date.now(), life: 0.5 }]);
  };

  // 波/水しぶきアニメーション開始関数
  const startWaveAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const drops: WaveAnimation['drops'] = [];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      drops.push({
        offsetX: 0, offsetY: 0,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 5 + 3, opacity: 1, life: Math.random() + 1,
      });
    }
    const rings: WaveAnimation['rings'] = [{ radius: 0, alpha: 1, speed: 3 }];
    setWaveAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, drops, rings, startTime: Date.now(), targetObj: obj }]);
  };

  // 風/葉アニメーション開始関数
  const startWindAnimation = (count = 25) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const leaves: WindAnimation['leaves'] = [];
    for (let i = 0; i < count; i++) {
      leaves.push({
        x: -50, y: Math.random() * rect.height,
        vx: Math.random() * 3 + 2, vy: (Math.random() - 0.5) * 1,
        size: Math.random() * 8 + 5, rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1, opacity: Math.random() * 0.5 + 0.5,
        life: 10, color: ['#90ee90', '#7cfc00', '#00ff00', '#32cd32'][Math.floor(Math.random() * 4)],
      });
    }
    setWindAnimations(prev => [...prev, { leaves, startTime: Date.now(), duration: 8 }]);
  };

  // 煙/霧アニメーション開始関数
  const startSmokeAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const clouds: SmokeAnimation['clouds'] = [];
    for (let i = 0; i < 8; i++) {
      clouds.push({
        offsetX: (Math.random() - 0.5) * 30, offsetY: 0,
        size: Math.random() * 40 + 30, vy: -(Math.random() * 0.5 + 0.3),
        opacity: Math.random() * 0.3 + 0.2, expansion: 1, life: Math.random() * 3 + 2,
      });
    }
    setSmokeAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, clouds, startTime: Date.now(), targetObj: obj }]);
  };

  // 竜巻アニメーション開始関数
  const startTornadoAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const particles: TornadoAnimation['particles'] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2, height: Math.random() * 150,
        radius: Math.random() * 30 + 10, speed: Math.random() * 0.1 + 0.05,
        size: Math.random() * 4 + 2, opacity: Math.random() * 0.5 + 0.3,
      });
    }
    setTornadoAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, particles, rotation: 0, startTime: Date.now(), life: 5, targetObj: obj }]);
  };

  // 宝石アニメーション開始関数
  const startGemAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const gems: GemAnimation['gems'] = [];
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      gems.push({
        offsetX: 0, offsetY: 0, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 12 + 8, rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        color: ['#ff0080', '#00ffff', '#ffff00', '#00ff00', '#ff00ff'][Math.floor(Math.random() * 5)],
        sparkle: Math.random(), life: Math.random() * 2 + 1.5,
      });
    }
    setGemAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, gems, startTime: Date.now(), targetObj: obj }]);
  };

  // 星の軌跡アニメーション開始関数
  const startStarTrailAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const stars: StarTrailAnimation['stars'] = [];
    for (let i = 0; i < 5; i++) {
      stars.push({
        angle: (Math.PI * 2 * i) / 5, radius: 60, size: 8, speed: 0.05,
        trail: [], color: ['#ffff00', '#00ffff', '#ff00ff', '#00ff00'][Math.floor(Math.random() * 4)],
      });
    }
    setStarTrailAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, stars, rotation: 0, startTime: Date.now(), life: 5, targetObj: obj }]);
  };

  // 光の粒アニメーション開始関数
  const startLightParticleAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const particles: LightParticleAnimation['particles'] = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        offsetX: (Math.random() - 0.5) * 20, offsetY: 0,
        vx: (Math.random() - 0.5) * 1, vy: -(Math.random() * 2 + 1),
        size: Math.random() * 4 + 2, opacity: 1,
        color: ['#ffffff', '#ffff00', '#00ffff', '#ff00ff'][Math.floor(Math.random() * 4)],
        life: Math.random() * 2 + 1,
      });
    }
    setLightParticleAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, particles, startTime: Date.now(), targetObj: obj }]);
  };

  // スパイラルアニメーション開始関数
  const startSpiralAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const particles: SpiralAnimation['particles'] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        angle: (Math.PI * 2 * i) / 50, radius: (i / 50) * 80, height: 0,
        size: 4, color: `hsl(${(i / 50) * 360}, 100%, 50%)`, opacity: 0.8,
      });
    }
    setSpiralAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, particles, rotation: 0, expansion: 1, startTime: Date.now(), life: 4, targetObj: obj }]);
  };

  // 鳥/羽アニメーション開始関数
  const startBirdAnimation = (count = 5) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const birds: BirdAnimation['birds'] = [];
    for (let i = 0; i < count; i++) {
      birds.push({
        x: -50, y: Math.random() * rect.height * 0.5,
        vx: Math.random() * 2 + 2, vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 15 + 10, wingPhase: Math.random() * Math.PI * 2,
        rotation: 0, life: 10,
      });
    }
    setBirdAnimations(prev => [...prev, { birds, feathers: [], startTime: Date.now(), duration: 10 }]);
  };

  // ゴーストアニメーション開始関数
  const startGhostAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const ghosts: GhostAnimation['ghosts'] = [];
    for (let i = 0; i < 3; i++) {
      ghosts.push({
        offsetX: (Math.random() - 0.5) * 60, offsetY: (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 1, vy: -(Math.random() * 0.5 + 0.2),
        size: Math.random() * 30 + 25, opacity: 0.6, wavePhase: Math.random() * Math.PI * 2, life: 5,
      });
    }
    setGhostAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, ghosts, startTime: Date.now(), targetObj: obj }]);
  };

  // 蜂アニメーション開始関数
  const startBeeAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const bees: BeeAnimation['bees'] = [];
    for (let i = 0; i < 6; i++) {
      bees.push({
        offsetX: 0, offsetY: 0, angle: (Math.PI * 2 * i) / 6, radius: 40,
        speed: Math.random() * 0.05 + 0.08, wingPhase: Math.random() * Math.PI * 2,
        size: 8, life: 6,
      });
    }
    setBeeAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, bees, startTime: Date.now(), targetObj: obj }]);
  };

  // 蛍アニメーション開始関数
  const startFireflyAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const fireflies: FireflyAnimation['fireflies'] = [];
    for (let i = 0; i < 12; i++) {
      fireflies.push({
        offsetX: (Math.random() - 0.5) * 80, offsetY: (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        glow: Math.random(), glowPhase: Math.random() * Math.PI * 2, size: 5, life: 8,
      });
    }
    setFireflyAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, fireflies, startTime: Date.now(), targetObj: obj }]);
  };

  // 爆発アニメーション開始関数
  const startExplosionAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const particles: ExplosionAnimation['particles'] = [];
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particles.push({
        offsetX: 0, offsetY: 0, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 4,
        color: ['#ff4500', '#ff6347', '#ffa500', '#ffff00'][Math.floor(Math.random() * 4)],
        opacity: 1, life: Math.random() + 1,
      });
    }
    setExplosionAnimations(prev => [...prev, {
      x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, particles,
      shockwave: { radius: 0, alpha: 1 }, flash: 1, startTime: Date.now(), targetObj: obj,
    }]);
  };

  // ターゲットアニメーション開始関数
  const startTargetAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const rings: TargetAnimation['rings'] = [
      { radius: 80, alpha: 1, speed: -15 },
      { radius: 100, alpha: 0.8, speed: -18 },
      { radius: 120, alpha: 0.6, speed: -21 },
    ];
    setTargetAnimations(prev => [...prev, {
      x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, rings,
      crosshair: { size: 40, rotation: 0, alpha: 1 },
      startTime: Date.now(), life: 3, targetObj: obj,
    }]);
  };

  // 怒りマークアニメーション開始関数
  const startAngerAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const marks: AngerAnimation['marks'] = [];
    for (let i = 0; i < 3; i++) {
      marks.push({
        offsetX: (Math.random() - 0.5) * 40, offsetY: -50 - i * 25,
        size: 20 + i * 5, rotation: Math.random() * 0.4 - 0.2,
        opacity: 1, bounce: 0, life: 2,
      });
    }
    setAngerAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, marks, startTime: Date.now(), targetObj: obj }]);
  };

  // 花びらアニメーション開始関数
  const startPetalAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const petals: PetalAnimation['petals'] = [];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      petals.push({
        offsetX: 0, offsetY: 0, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.1,
        size: Math.random() * 8 + 6,
        color: ['#ffb7c5', '#ff69b4', '#ff1493', '#ffc0cb', '#db7093'][Math.floor(Math.random() * 5)],
        opacity: 1, life: Math.random() * 2 + 1.5,
      });
    }
    setPetalAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, petals, startTime: Date.now(), targetObj: obj }]);
  };

  // ひまわりアニメーション開始関数
  const startSunflowerAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const flowers: SunflowerAnimation['flowers'] = [];
    for (let i = 0; i < 3; i++) {
      flowers.push({
        offsetX: (i - 1) * 40, offsetY: 0, size: 0, rotation: 0,
        growth: 0, opacity: 1, life: 5,
      });
    }
    setSunflowerAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, flowers, seeds: [], startTime: Date.now(), targetObj: obj }]);
  };

  // バラアニメーション開始関数
  const startRoseAnimation = (obj: Obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const viewW = rect.width;
    const viewH = rect.height;
    const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
    const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
    const { sx: centerX, sy: centerY } = mapToScreen(objMapX, objMapY, viewW, viewH);
    
    const petals: RoseAnimation['petals'] = [];
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      petals.push({
        offsetX: 0, offsetY: 0, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
        rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 10 + 6, layer: Math.floor(Math.random() * 3),
        opacity: 1, life: Math.random() * 2.5 + 1.5,
      });
    }
    const sparkles: RoseAnimation['sparkles'] = [];
    setRoseAnimations(prev => [...prev, { x: centerX, y: centerY, mapX: objMapX, mapY: objMapY, petals, sparkles, startTime: Date.now(), targetObj: obj }]);
  };

  // 兵士アニメーション開始関数
  const startSoldierAnimation = (bearTrap: Obj) => {
    // アニメーション開始中または実行中の場合は何もしない
    if (isAnimationStartingRef.current || soldierAnimations.length > 0) {
      return;
    }
    
    // ロックをかける
    isAnimationStartingRef.current = true;
    
    // 携帯端末の場合、テロップを一時的にオフにする（パフォーマンス向上）
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobileDevice && !tickerHidden) {
      tickerStateBeforeAnimation.current = true; // 元の状態を保存
      setTickerHidden(true);
    }
    
    startNewAnimation(bearTrap);
  };

  // 新しいアニメーションを開始する内部関数
  const startNewAnimation = (bearTrap: Obj) => {
    const allCities = objects.filter(obj => {
      return obj.type === "CITY";
    });

    // ランダムに半分の都市を選択
    const shuffledCities = [...allCities].sort(() => Math.random() - 0.5);
    const selectedCities = shuffledCities.slice(0, Math.ceil(allCities.length / 2));

    // === ダメージ計算は1回だけ（全都市共通） ===
    const randomSeed = Math.random();
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const maxDamagesBase = 10 + Math.floor(randomSeed * 90); // 常に10-100個で計算（合計は同じ）
    const now = Date.now();
    const timeBonus = 1.0 + (now % 10000000) / 1000000;
    
    let calculatedTotalDamage = 0;
    const damagesArray: Array<{ damage: number; isCritical: boolean }> = [];
    
    for (let i = 0; i < maxDamagesBase; i++) {
      const seed = randomSeed * 1000000 + i * 1234;
      const damageVariation = 0.3 + (seed % 100) / 100 * 1.4;
      const baseDamage = Math.floor(5000 * damageVariation * timeBonus + Math.floor((seed % 145000)));
      const isCritical = (seed % 10) < 3;
      const multiplier = isCritical ? 10 : 1;
      const damage = Math.floor(baseDamage * multiplier);
      calculatedTotalDamage += damage;
      damagesArray.push({ damage, isCritical });
    }
    
    // モバイルでは表示用に10個だけ選択（合計は変わらない）
    const displayDamagesArray = isMobileDevice 
      ? damagesArray.filter((_, i) => i % Math.floor(damagesArray.length / 10) === 0).slice(0, 10)
      : damagesArray;

    // === 各都市からのアニメーションを作成（ダメージは共通、熊はランダム） ===
    const randomBearIndex = Math.floor(Math.random() * 9); // 0-8のランダムな熊を選択
    
    // 01番の熊（インデックス0）はキュートなので、みんな攻撃できずダメージゼロ
    if (randomBearIndex === 0) {
      calculatedTotalDamage = 0;
      damagesArray.length = 0; // 配列をクリア
    }
    
    const newAnimations: SoldierAnimation[] = selectedCities.map(city => {
      // モバイルでは兵士数を1-2人に削減、PCは1-5人
      const soldierCount = isMobileDevice 
        ? 1 + Math.floor(Math.random() * 2) 
        : 1 + Math.floor(Math.random() * 4);
      const soldiers = [];
      
      const types: Array<'shield' | 'archer' | 'spear'> = ['shield', 'archer', 'spear'];
      
      for (let i = 0; i < soldierCount; i++) {
        soldiers.push({
          offsetX: (Math.random() - 0.5) * 30,
          offsetY: (Math.random() - 0.5) * 30,
          delay: Math.random() * 0.2,
          type: types[i % 3],
        });
      }

      return {
        from: {
          x: num(city.x, 0),
          y: num(city.y, 0),
          label: city.label || "",
        },
        to: {
          x: num(bearTrap.x, 0),
          y: num(bearTrap.y, 0),
          label: bearTrap.label || "",
        },
        progress: 0,
        startTime: Date.now(),
        randomSeed: randomSeed, // ダメージ計算用の固定シード
        totalDamage: calculatedTotalDamage, // 初期値として設定（固定値）
        damages: displayDamagesArray, // 表示用ダメージ配列（モバイルは10個、PCは全部）
        bearIndex: randomBearIndex, // 全アニメーションで同じ熊を使用
        soldiers,
        recordSaved: false, // 記録保存フラグを初期化
        isNewRecord: false, // 新記録フラグを初期化
      };
    });

    setSoldierAnimations(newAnimations);
    
    // アニメーション開始完了、ロック解除
    isAnimationStartingRef.current = false;
  };

  // 兵士アニメーションのループ
  useEffect(() => {
    if (soldierAnimations.length === 0) return;

    const animate = () => {
      const now = Date.now();
      let allComplete = true;

      const updated = soldierAnimations.map(anim => {
        const elapsed = now - anim.startTime;
        const duration = 6500; // 6.5秒に延長（ダメ合計が残る時間を確保）
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress < 1) allComplete = false;
        
        // 攻撃アニメーション中盤（progress >= 0.6）で記録更新判定（一度だけ）
        let isNewRecord = anim.isNewRecord;
        let recordSaved = anim.recordSaved;
        
        if (progress >= 0.6 && !recordSaved && anim.totalDamage !== undefined) {
          const finalDamage = anim.totalDamage;
          const highScoreKey = 'bearTrapMaxDamage';
          
          if (finalDamage > bearTrapMaxDamage) {
            isNewRecord = true;
            setBearTrapMaxDamage(finalDamage);
            localStorage.setItem(highScoreKey, finalDamage.toString());
          } else {
            isNewRecord = false;
          }
          recordSaved = true;
        }
        
        return { ...anim, progress, isNewRecord, recordSaved };
      });

      setSoldierAnimations(updated);

      if (!allComplete) {
        soldierAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // アニメーション完了したら即座にクリア（遅延なし）
        setSoldierAnimations([]);
        
        // 携帯端末でテロップを一時的にオフにしていた場合、元に戻す
        if (tickerStateBeforeAnimation.current) {
          setTickerHidden(false);
          tickerStateBeforeAnimation.current = false;
        }
      }
    };

    soldierAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (soldierAnimationRef.current) {
        cancelAnimationFrame(soldierAnimationRef.current);
        soldierAnimationRef.current = null;
      }
    };
  }, [soldierAnimations.length > 0 ? soldierAnimations[0]?.startTime : 0]);

  // 猫アニメーション開始関数
  const startCatAnimation = (fromObj: Obj, toObj: Obj) => {
    const newAnimation: CatAnimation = {
      from: { 
        x: num(fromObj.x, 0) + num(fromObj.w, 1) / 2, 
        y: num(fromObj.y, 0) + num(fromObj.h, 1) / 2 
      }, // オブジェクトの真の中心（幅と高さを考慮）
      to: { 
        x: num(toObj.x, 0) + num(toObj.w, 1) / 2, 
        y: num(toObj.y, 0) + num(toObj.h, 1) / 2 
      }, // ターゲットの真の中心
      progress: 0,
      startTime: Date.now(),
      pawPrints: [],
      showCat: false,
      catAlpha: 0,
    };
    
    setCatAnimations([newAnimation]);
    catAnimationsDataRef.current = [newAnimation];
    requestDraw(); // 即座に描画
  };

  // 猫アニメーションループ
  useEffect(() => {
    if (catAnimations.length === 0) return;

    const animate = () => {
      const now = Date.now();
      let allComplete = true;

      const updated = catAnimations.map(anim => {
        const elapsed = now - anim.startTime;
        const duration = 5000; // 5秒
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress < 1) allComplete = false;
        
        // 足跡を追加（progress < 0.8の間、一定間隔で）
        let updatedPawPrints = anim.pawPrints;
        
        // 距離に応じて足跡の数を調整（10-50個）
        const dx = anim.to.x - anim.from.x;
        const dy = anim.to.y - anim.from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxPawCount = Math.max(10, Math.min(50, Math.floor(distance * 3))); // 距離×3、最小10、最大50
        
        const targetPawCount = Math.floor(Math.min(progress / 0.8, 1) * maxPawCount);
        
        if (updatedPawPrints.length < targetPawCount) {
          const newPawPrints = [...updatedPawPrints];
          
          while (newPawPrints.length < targetPawCount) {
            const t = newPawPrints.length / maxPawCount; // 現在の足跡の位置（0-1）
            
            // ベジェ曲線で大きく回り道するパス（Uターンや円を描く動き）
            const seed = anim.startTime;
            
            // ランダムな制御点を2つ作成（startTimeをシードにして再現性を持たせる）
            const angle1 = Math.sin(seed * 0.001) * Math.PI * 2;
            const angle2 = Math.cos(seed * 0.0015) * Math.PI * 2;
            const distance = Math.sqrt(Math.pow(anim.to.x - anim.from.x, 2) + Math.pow(anim.to.y - anim.from.y, 2));
            const controlDistance = distance * 0.6; // 制御点までの距離
            
            const cp1x = anim.from.x + Math.cos(angle1) * controlDistance;
            const cp1y = anim.from.y + Math.sin(angle1) * controlDistance;
            const cp2x = anim.to.x + Math.cos(angle2) * controlDistance;
            const cp2y = anim.to.y + Math.sin(angle2) * controlDistance;
            
            // 3次ベジェ曲線の計算
            const mt = 1 - t;
            const baseX = mt * mt * mt * anim.from.x +
                         3 * mt * mt * t * cp1x +
                         3 * mt * t * t * cp2x +
                         t * t * t * anim.to.x;
            const baseY = mt * mt * mt * anim.from.y +
                         3 * mt * mt * t * cp1y +
                         3 * mt * t * t * cp2y +
                         t * t * t * anim.to.y;
            
            // 細かい揺らぎを追加
            const dx = anim.to.x - anim.from.x;
            const dy = anim.to.y - anim.from.y;
            const perpX = -dy;
            const perpY = dx;
            const perpLen = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
            
            const wiggle = Math.sin(newPawPrints.length * 1.2 + seed * 0.001) * 0.3;
            
            const x = baseX + (perpX / perpLen) * wiggle;
            const y = baseY + (perpY / perpLen) * wiggle;
            
            // 進行方向（接線方向）を計算
            const dt = 0.01;
            const nextT = Math.min(t + dt, 1);
            const nextMt = 1 - nextT;
            const nextBaseX = nextMt * nextMt * nextMt * anim.from.x +
                             3 * nextMt * nextMt * nextT * cp1x +
                             3 * nextMt * nextT * nextT * cp2x +
                             nextT * nextT * nextT * anim.to.x;
            const nextBaseY = nextMt * nextMt * nextMt * anim.from.y +
                             3 * nextMt * nextMt * nextT * cp1y +
                             3 * nextMt * nextT * nextT * cp2y +
                             nextT * nextT * nextT * anim.to.y;
            const nextWiggle = Math.sin((newPawPrints.length + 1) * 1.2 + seed * 0.001) * 0.3;
            const nextX = nextBaseX + (perpX / perpLen) * nextWiggle;
            const nextY = nextBaseY + (perpY / perpLen) * nextWiggle;
            
            // 実際の進行方向（接線方向）の角度
            const tangentAngle = Math.atan2(nextY - y, nextX - x);
            
            // 左右判定は回転用に保持
            const isLeft = newPawPrints.length % 2 === 0;
            
            // 足跡の向きを調整（接線方向 + 40度補正）
            const rotation = tangentAngle + Math.PI / 2 + (40 * Math.PI / 180);
            
            newPawPrints.push({
              x,
              y,
              rotation,
              scale: 0.9 + (Math.sin(newPawPrints.length * 0.5) * 0.1),
              alpha: 1,
            });
          }
          
          updatedPawPrints = newPawPrints;
        }
        
        // 猫を表示（progress >= 0.8）
        let showCat = anim.showCat;
        let catAlpha = anim.catAlpha;
        if (progress >= 0.8) {
          showCat = true;
          // フェードイン
          const fadeProgress = (progress - 0.8) / 0.2;
          catAlpha = Math.min(fadeProgress, 1);
        }
        
        return { ...anim, progress, pawPrints: updatedPawPrints, showCat, catAlpha };
      });

      catAnimationsDataRef.current = updated; // refを即座に更新
      setCatAnimations(updated);
      requestDraw(); // 画面を更新

      if (!allComplete) {
        catAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // アニメーション完了後、少し待ってからクリア
        setTimeout(() => {
          setCatAnimations([]);
        }, 1000);
      }
    };

    catAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (catAnimationRef.current) {
        cancelAnimationFrame(catAnimationRef.current);
        catAnimationRef.current = null;
      }
    };
  }, [catAnimations.length > 0 ? catAnimations[0]?.startTime : 0, bearTrapMaxDamage]);

  // バルーンアニメーションループ
  useEffect(() => {
    if (balloonAnimations.length === 0) return;

    const animate = () => {
      const now = Date.now();
      const updated = balloonAnimations.map(anim => {
        const elapsed = (now - anim.startTime) / 1000;
        const updatedBalloons = anim.balloons.map(balloon => {
          const newOffsetY = balloon.offsetY - balloon.vy;
          const newSwayOffset = balloon.swayOffset + balloon.swaySpeed;
          const swayX = Math.sin(newSwayOffset) * 20;
          const newLife = balloon.life - 0.016;
          return {
            ...balloon,
            offsetX: swayX,
            offsetY: newOffsetY,
            swayOffset: newSwayOffset,
            life: newLife,
          };
        }).filter(b => b.life > 0);
        return { ...anim, balloons: updatedBalloons };
      }).filter(a => a.balloons.length > 0);

      setBalloonAnimations(updated);
      requestDraw();

      if (updated.length > 0) {
        balloonAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    balloonAnimationRef.current = requestAnimationFrame(animate);
    return () => {
      if (balloonAnimationRef.current) cancelAnimationFrame(balloonAnimationRef.current);
    };
  }, [balloonAnimations, requestDraw]);

  // オーロラアニメーションループ
  useEffect(() => {
    if (auroraAnimations.length === 0) return;

    const animate = () => {
      const now = Date.now();
      const updated = auroraAnimations.map(anim => {
        const elapsed = (now - anim.startTime) / 1000;
        const newLife = anim.life - 0.016;
        const updatedWaves = anim.waves.map(wave => {
          const newPhase = wave.phase + wave.speed;
          const fadeIn = Math.min(elapsed * 0.5, 1);
          const fadeOut = newLife < 2 ? newLife / 2 : 1;
          const newAlpha = wave.alpha * fadeIn * fadeOut;
          return { ...wave, phase: newPhase, alpha: newAlpha };
        });
        return { ...anim, waves: updatedWaves, life: newLife };
      }).filter(a => a.life > 0);

      setAuroraAnimations(updated);
      requestDraw();

      if (updated.length > 0) {
        auroraAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    auroraAnimationRef.current = requestAnimationFrame(animate);
    return () => {
      if (auroraAnimationRef.current) cancelAnimationFrame(auroraAnimationRef.current);
    };
  }, [auroraAnimations, requestDraw]);

  // 蝶々アニメーションループ
  useEffect(() => {
    if (butterflyAnimations.length === 0) return;

    const animate = () => {
      const now = Date.now();
      const updated = butterflyAnimations.map(anim => {
        const elapsed = (now - anim.startTime) / 1000;
        const updatedButterflies = anim.butterflies.map(bf => {
          let newX = bf.x;
          let newY = bf.y;
          let newAngle = bf.angle;

          if (bf.pathType === 'figure8') {
            const newPathProgress = bf.pathProgress + 0.02;
            const radius = 50;
            newX += Math.sin(newPathProgress) * radius * 0.1;
            newY += Math.sin(newPathProgress * 2) * radius * 0.05;
            return { ...bf, x: newX, y: newY, pathProgress: newPathProgress, flutterPhase: bf.flutterPhase + bf.flutterSpeed, life: bf.life - 0.016 };
          } else {
            newX += bf.vx;
            newY += bf.vy;
            if (Math.random() < 0.05) {
              newAngle += (Math.random() - 0.5) * 0.5;
            }
            return { ...bf, x: newX, y: newY, angle: newAngle, flutterPhase: bf.flutterPhase + bf.flutterSpeed, life: bf.life - 0.016 };
          }
        }).filter(bf => bf.life > 0);
        return { ...anim, butterflies: updatedButterflies };
      }).filter(a => a.butterflies.length > 0);

      setButterflyAnimations(updated);
      requestDraw();

      if (updated.length > 0) {
        butterflyAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    butterflyAnimationRef.current = requestAnimationFrame(animate);
    return () => {
      if (butterflyAnimationRef.current) cancelAnimationFrame(butterflyAnimationRef.current);
    };
  }, [butterflyAnimations, requestDraw]);

  // 流れ星アニメーションループ
  useEffect(() => {
    if (shootingStarAnimations.length === 0) return;

    const animate = () => {
      const now = Date.now();
      const updated = shootingStarAnimations.map(anim => {
        const updatedStars = anim.stars.map(star => {
          const newX = star.x + star.vx;
          const newY = star.y + star.vy;
          const newLife = star.life - 0.016;
          const newTrailPoints = [...star.trailPoints, { x: newX, y: newY, alpha: 1 }].slice(-20).map((p, i, arr) => ({
            ...p,
            alpha: (i / arr.length) * (newLife / 3),
          }));
          return { ...star, x: newX, y: newY, life: newLife, trailPoints: newTrailPoints };
        }).filter(s => s.life > 0);
        return { ...anim, stars: updatedStars };
      }).filter(a => a.stars.length > 0);

      setShootingStarAnimations(updated);
      requestDraw();

      if (updated.length > 0) {
        shootingStarAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    shootingStarAnimationRef.current = requestAnimationFrame(animate);
    return () => {
      if (shootingStarAnimationRef.current) cancelAnimationFrame(shootingStarAnimationRef.current);
    };
  }, [shootingStarAnimations, requestDraw]);

  // 紅葉アニメーションループ
  useEffect(() => {
    if (autumnLeavesAnimations.length === 0) return;

    const animate = () => {
      const now = Date.now();
      const updated = autumnLeavesAnimations.map(anim => {
        const updatedLeaves = anim.leaves.map(leaf => {
          const newOffsetX = leaf.offsetX + leaf.vx + Math.sin(leaf.swayOffset) * 0.5;
          const newOffsetY = leaf.offsetY + leaf.vy;
          const newRotation = leaf.rotation + leaf.rotationSpeed;
          const newSwayOffset = leaf.swayOffset + leaf.swaySpeed;
          const newLife = leaf.life - 0.016;
          return {
            ...leaf,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
            rotation: newRotation,
            swayOffset: newSwayOffset,
            life: newLife,
          };
        }).filter(l => l.life > 0);
        return { ...anim, leaves: updatedLeaves };
      }).filter(a => a.leaves.length > 0);

      setAutumnLeavesAnimations(updated);
      requestDraw();

      if (updated.length > 0) {
        autumnLeavesAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    autumnLeavesAnimationRef.current = requestAnimationFrame(animate);
    return () => {
      if (autumnLeavesAnimationRef.current) cancelAnimationFrame(autumnLeavesAnimationRef.current);
    };
  }, [autumnLeavesAnimations, requestDraw]);

  // 雪アニメーションループ
  useEffect(() => {
    if (snowAnimations.length === 0) return;

    const animate = () => {
      const now = Date.now();
      const updated = snowAnimations.map(anim => {
        const elapsed = (now - anim.startTime) / 1000;
        const updatedSnowflakes = anim.snowflakes.map(snow => {
          const newX = snow.x + snow.vx + Math.sin(snow.swayOffset) * 0.3;
          const newY = snow.y + snow.vy;
          const newRotation = snow.rotation + snow.rotationSpeed;
          const newSwayOffset = snow.swayOffset + snow.swaySpeed;
          const newLife = snow.life - 0.016;
          return {
            ...snow,
            x: newX,
            y: newY,
            rotation: newRotation,
            swayOffset: newSwayOffset,
            life: newLife,
          };
        }).filter(s => s.life > 0);
        
        const newLife = anim.duration - elapsed;
        if (newLife > 0 && Math.random() < 0.1 && updatedSnowflakes.length < 100) {
          updatedSnowflakes.push({
            x: Math.random() * 2000 - 500,
            y: -20,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 0.5 + 0.5,
            size: Math.random() * 8 + 4,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            swayOffset: Math.random() * Math.PI * 2,
            swaySpeed: Math.random() * 0.05 + 0.02,
            opacity: Math.random() * 0.5 + 0.5,
            life: 10,
          });
        }

        return { ...anim, snowflakes: updatedSnowflakes, duration: anim.duration };
      }).filter(a => (Date.now() - a.startTime) / 1000 < a.duration || a.snowflakes.length > 0);

      setSnowAnimations(updated);
      requestDraw();

      if (updated.length > 0) {
        snowAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    snowAnimationRef.current = requestAnimationFrame(animate);
    return () => {
      if (snowAnimationRef.current) cancelAnimationFrame(snowAnimationRef.current);
    };
  }, [snowAnimations, requestDraw]);

  // 紙吹雪アニメーションループ
  useEffect(() => {
    if (confettiAnimations.length === 0) return;

    const animate = () => {
      const now = Date.now();
      const updated = confettiAnimations.map(anim => {
        const updatedConfetti = anim.confetti.map(conf => {
          const newOffsetX = conf.offsetX + conf.vx;
          const newOffsetY = conf.offsetY + conf.vy;
          const newVy = conf.vy + 0.05; // 重力
          const newRotation = conf.rotation + conf.rotationSpeed;
          const newLife = conf.life - 0.016;
          return {
            ...conf,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
            vy: newVy,
            rotation: newRotation,
            life: newLife,
          };
        }).filter(c => c.life > 0);
        return { ...anim, confetti: updatedConfetti };
      }).filter(a => a.confetti.length > 0);

      setConfettiAnimations(updated);
      requestDraw();

      if (updated.length > 0) {
        confettiAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    confettiAnimationRef.current = requestAnimationFrame(animate);
    return () => {
      if (confettiAnimationRef.current) cancelAnimationFrame(confettiAnimationRef.current);
    };
  }, [confettiAnimations, requestDraw]);

  // 虹アニメーションループ
  useEffect(() => {
    if (rainbowAnimations.length === 0) return;

    const animate = () => {
      const now = Date.now();
      const updated = rainbowAnimations.map(anim => {
        const elapsed = (now - anim.startTime) / 1000;
        const newLife = anim.life - 0.016;
        const fadeIn = Math.min(elapsed * 0.5, 1);
        const fadeOut = newLife < 2 ? newLife / 2 : 1;
        const newAlpha = fadeIn * fadeOut * 0.7;
        return { ...anim, alpha: newAlpha, life: newLife };
      }).filter(a => a.life > 0);

      setRainbowAnimations(updated);
      requestDraw();

      if (updated.length > 0) {
        rainbowAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    rainbowAnimationRef.current = requestAnimationFrame(animate);
    return () => {
      if (rainbowAnimationRef.current) cancelAnimationFrame(rainbowAnimationRef.current);
    };
  }, [rainbowAnimations, requestDraw]);

  // 雨アニメーションループ
  useEffect(() => {
    if (rainAnimations.length === 0) return;

    const animate = () => {
      const now = Date.now();
      const updated = rainAnimations.map(anim => {
        const elapsed = (now - anim.startTime) / 1000;
        const updatedRaindrops = anim.raindrops.map(drop => {
          if (drop.splash) {
            const newSplashProgress = drop.splashProgress + 0.05;
            const newLife = drop.life - 0.016;
            return { ...drop, splashProgress: newSplashProgress, life: newLife };
          } else {
            const newY = drop.y + drop.vy;
            const newSplash = newY > 800;
            return { ...drop, y: newY, splash: newSplash, splashProgress: 0 };
          }
        }).filter(d => d.life > 0 && !d.splash || d.splash && d.splashProgress < 1);

        if (elapsed < anim.duration && Math.random() < 0.3 && updatedRaindrops.length < 200) {
          updatedRaindrops.push({
            x: Math.random() * 2000 - 500,
            y: -20,
            vy: Math.random() * 5 + 15,
            length: Math.random() * 10 + 15,
            opacity: Math.random() * 0.3 + 0.3,
            splash: false,
            splashProgress: 0,
            life: 3,
          });
        }

        return { ...anim, raindrops: updatedRaindrops };
      }).filter(a => (Date.now() - a.startTime) / 1000 < a.duration || a.raindrops.length > 0);

      setRainAnimations(updated);
      requestDraw();

      if (updated.length > 0) {
        rainAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    rainAnimationRef.current = requestAnimationFrame(animate);
    return () => {
      if (rainAnimationRef.current) cancelAnimationFrame(rainAnimationRef.current);
    };
  }, [rainAnimations, requestDraw]);

  // 魔法陣アニメーションループ
  useEffect(() => {
    if (magicCircleAnimations.length === 0) return;

    const animate = () => {
      const now = Date.now();
      const updated = magicCircleAnimations.map(anim => {
        const elapsed = (now - anim.startTime) / 1000;
        const newRotation = anim.rotation + anim.rotationSpeed;
        const newLife = anim.life - 0.016;
        const fadeIn = Math.min(elapsed * 2, 1);
        const fadeOut = newLife < 1 ? newLife : 1;
        const newAlpha = fadeIn * fadeOut;
        const pulse = Math.sin(elapsed * 3) * 0.3 + 0.7;
        const newGlowIntensity = pulse;
        return {
          ...anim,
          rotation: newRotation,
          life: newLife,
          alpha: newAlpha,
          glowIntensity: newGlowIntensity,
        };
      }).filter(a => a.life > 0);

      setMagicCircleAnimations(updated);
      requestDraw();

      if (updated.length > 0) {
        magicCircleAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    magicCircleAnimationRef.current = requestAnimationFrame(animate);
    return () => {
      if (magicCircleAnimationRef.current) cancelAnimationFrame(magicCircleAnimationRef.current);
    };
  }, [magicCircleAnimations, requestDraw]);

  // 炎アニメーションループ
  useEffect(() => {
    if (flameAnimations.length === 0) return;
    const animate = () => {
      const updated = flameAnimations.map(anim => {
        const updatedFlames = anim.flames.map(flame => ({
          ...flame,
          offsetY: flame.offsetY + flame.vy,
          offsetX: flame.offsetX + Math.sin(flame.flicker) * 2,
          flicker: flame.flicker + 0.2,
          opacity: flame.opacity * 0.98,
          life: flame.life - 0.016,
        })).filter(f => f.life > 0);
        return { ...anim, flames: updatedFlames };
      }).filter(a => a.flames.length > 0);
      setFlameAnimations(updated);
      requestDraw();
      if (updated.length > 0) flameAnimationRef.current = requestAnimationFrame(animate);
    };
    flameAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (flameAnimationRef.current) cancelAnimationFrame(flameAnimationRef.current); };
  }, [flameAnimations, requestDraw]);

  // 雷アニメーションループ
  useEffect(() => {
    if (thunderAnimations.length === 0) return;
    const animate = () => {
      const updated = thunderAnimations.map(anim => ({
        ...anim,
        life: anim.life - 0.016,
        segments: anim.segments.map(seg => ({ ...seg, alpha: seg.alpha * 0.9 })),
      })).filter(a => a.life > 0);
      setThunderAnimations(updated);
      requestDraw();
      if (updated.length > 0) thunderAnimationRef.current = requestAnimationFrame(animate);
    };
    thunderAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (thunderAnimationRef.current) cancelAnimationFrame(thunderAnimationRef.current); };
  }, [thunderAnimations, requestDraw]);

  // 波/水しぶきアニメーションループ
  useEffect(() => {
    if (waveAnimations.length === 0) return;
    const animate = () => {
      const updated = waveAnimations.map(anim => {
        const updatedDrops = anim.drops.map(drop => ({
          ...drop,
          offsetX: drop.offsetX + drop.vx,
          offsetY: drop.offsetY + drop.vy,
          vy: drop.vy + 0.3,
          opacity: drop.opacity * 0.97,
          life: drop.life - 0.016,
        })).filter(d => d.life > 0);
        const updatedRings = anim.rings.map(ring => ({
          ...ring,
          radius: ring.radius + ring.speed,
          alpha: ring.alpha * 0.95,
        })).filter(r => r.alpha > 0.05);
        return { ...anim, drops: updatedDrops, rings: updatedRings };
      }).filter(a => a.drops.length > 0 || a.rings.length > 0);
      setWaveAnimations(updated);
      requestDraw();
      if (updated.length > 0) waveAnimationRef.current = requestAnimationFrame(animate);
    };
    waveAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (waveAnimationRef.current) cancelAnimationFrame(waveAnimationRef.current); };
  }, [waveAnimations, requestDraw]);

  // 風/葉アニメーションループ
  useEffect(() => {
    if (windAnimations.length === 0) return;
    const animate = () => {
      const now = Date.now();
      const updated = windAnimations.map(anim => {
        const updatedLeaves = anim.leaves.map(leaf => ({
          ...leaf,
          x: leaf.x + leaf.vx,
          y: leaf.y + leaf.vy,
          rotation: leaf.rotation + leaf.rotationSpeed,
          life: leaf.life - 0.016,
        })).filter(l => l.life > 0 && l.x < 2000);
        return { ...anim, leaves: updatedLeaves };
      }).filter(a => (now - a.startTime) / 1000 < a.duration && a.leaves.length > 0);
      setWindAnimations(updated);
      requestDraw();
      if (updated.length > 0) windAnimationRef.current = requestAnimationFrame(animate);
    };
    windAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (windAnimationRef.current) cancelAnimationFrame(windAnimationRef.current); };
  }, [windAnimations, requestDraw]);

  // 煙/霧アニメーションループ
  useEffect(() => {
    if (smokeAnimations.length === 0) return;
    const animate = () => {
      const updated = smokeAnimations.map(anim => {
        const updatedClouds = anim.clouds.map(cloud => ({
          ...cloud,
          offsetY: cloud.offsetY + cloud.vy,
          expansion: cloud.expansion + 0.02,
          opacity: cloud.opacity * 0.98,
          life: cloud.life - 0.016,
        })).filter(c => c.life > 0);
        return { ...anim, clouds: updatedClouds };
      }).filter(a => a.clouds.length > 0);
      setSmokeAnimations(updated);
      requestDraw();
      if (updated.length > 0) smokeAnimationRef.current = requestAnimationFrame(animate);
    };
    smokeAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (smokeAnimationRef.current) cancelAnimationFrame(smokeAnimationRef.current); };
  }, [smokeAnimations, requestDraw]);

  // 竜巻アニメーションループ
  useEffect(() => {
    if (tornadoAnimations.length === 0) return;
    const animate = () => {
      const updated = tornadoAnimations.map(anim => ({
        ...anim,
        rotation: anim.rotation + 0.1,
        life: anim.life - 0.016,
        particles: anim.particles.map(p => ({
          ...p,
          angle: p.angle + p.speed,
          height: p.height + (Math.random() - 0.5) * 2,
        })),
      })).filter(a => a.life > 0);
      setTornadoAnimations(updated);
      requestDraw();
      if (updated.length > 0) tornadoAnimationRef.current = requestAnimationFrame(animate);
    };
    tornadoAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (tornadoAnimationRef.current) cancelAnimationFrame(tornadoAnimationRef.current); };
  }, [tornadoAnimations, requestDraw]);

  // 宝石アニメーションループ
  useEffect(() => {
    if (gemAnimations.length === 0) return;
    const animate = () => {
      const updated = gemAnimations.map(anim => {
        const updatedGems = anim.gems.map(gem => ({
          ...gem,
          offsetX: gem.offsetX + gem.vx,
          offsetY: gem.offsetY + gem.vy,
          vy: gem.vy + 0.3,
          rotation: gem.rotation + gem.rotationSpeed,
          sparkle: Math.sin(Date.now() * 0.01) * 0.5 + 0.5,
          life: gem.life - 0.016,
        })).filter(g => g.life > 0);
        return { ...anim, gems: updatedGems };
      }).filter(a => a.gems.length > 0);
      setGemAnimations(updated);
      requestDraw();
      if (updated.length > 0) gemAnimationRef.current = requestAnimationFrame(animate);
    };
    gemAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (gemAnimationRef.current) cancelAnimationFrame(gemAnimationRef.current); };
  }, [gemAnimations, requestDraw]);

  // 星の軌跡アニメーションループ
  useEffect(() => {
    if (starTrailAnimations.length === 0) return;
    const animate = () => {
      const updated = starTrailAnimations.map(anim => {
        const updatedStars = anim.stars.map(star => {
          const newAngle = star.angle + star.speed;
          const x = Math.cos(anim.rotation + newAngle) * star.radius;
          const y = Math.sin(anim.rotation + newAngle) * star.radius;
          const trail = [...star.trail, { x, y, alpha: 1 }].slice(-10).map((t, i) => ({ ...t, alpha: i / 10 }));
          return { ...star, angle: newAngle, trail };
        });
        return { ...anim, stars: updatedStars, rotation: anim.rotation + 0.02, life: anim.life - 0.016 };
      }).filter(a => a.life > 0);
      setStarTrailAnimations(updated);
      requestDraw();
      if (updated.length > 0) starTrailAnimationRef.current = requestAnimationFrame(animate);
    };
    starTrailAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (starTrailAnimationRef.current) cancelAnimationFrame(starTrailAnimationRef.current); };
  }, [starTrailAnimations, requestDraw]);

  // 光の粒アニメーションループ
  useEffect(() => {
    if (lightParticleAnimations.length === 0) return;
    const animate = () => {
      const updated = lightParticleAnimations.map(anim => {
        const updatedParticles = anim.particles.map(p => ({
          ...p,
          offsetX: p.offsetX + p.vx,
          offsetY: p.offsetY + p.vy,
          opacity: p.opacity * 0.98,
          life: p.life - 0.016,
        })).filter(p => p.life > 0);
        return { ...anim, particles: updatedParticles };
      }).filter(a => a.particles.length > 0);
      setLightParticleAnimations(updated);
      requestDraw();
      if (updated.length > 0) lightParticleAnimationRef.current = requestAnimationFrame(animate);
    };
    lightParticleAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (lightParticleAnimationRef.current) cancelAnimationFrame(lightParticleAnimationRef.current); };
  }, [lightParticleAnimations, requestDraw]);

  // スパイラルアニメーションループ
  useEffect(() => {
    if (spiralAnimations.length === 0) return;
    const animate = () => {
      const updated = spiralAnimations.map(anim => ({
        ...anim,
        rotation: anim.rotation + 0.05,
        expansion: anim.expansion + 0.02,
        life: anim.life - 0.016,
        particles: anim.particles.map(p => ({
          ...p,
          angle: p.angle + 0.05,
          height: Math.sin(anim.rotation + p.angle) * 50,
          radius: p.radius * anim.expansion,
        })),
      })).filter(a => a.life > 0);
      setSpiralAnimations(updated);
      requestDraw();
      if (updated.length > 0) spiralAnimationRef.current = requestAnimationFrame(animate);
    };
    spiralAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (spiralAnimationRef.current) cancelAnimationFrame(spiralAnimationRef.current); };
  }, [spiralAnimations, requestDraw]);

  // 鳥/羽アニメーションループ
  useEffect(() => {
    if (birdAnimations.length === 0) return;
    const animate = () => {
      const now = Date.now();
      const updated = birdAnimations.map(anim => {
        const updatedBirds = anim.birds.map(bird => ({
          ...bird,
          x: bird.x + bird.vx,
          y: bird.y + bird.vy,
          wingPhase: bird.wingPhase + 0.3,
          life: bird.life - 0.016,
        })).filter(b => b.life > 0 && b.x < 2000);
        const newFeathers = anim.feathers.map(f => ({
          ...f,
          x: f.x + f.vx,
          y: f.y + f.vy,
          vy: f.vy + 0.1,
          rotation: f.rotation + f.rotationSpeed,
          opacity: f.opacity * 0.99,
          life: f.life - 0.016,
        })).filter(f => f.life > 0);
        return { ...anim, birds: updatedBirds, feathers: newFeathers };
      }).filter(a => (now - a.startTime) / 1000 < a.duration);
      setBirdAnimations(updated);
      requestDraw();
      if (updated.length > 0) birdAnimationRef.current = requestAnimationFrame(animate);
    };
    birdAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (birdAnimationRef.current) cancelAnimationFrame(birdAnimationRef.current); };
  }, [birdAnimations, requestDraw]);

  // ゴーストアニメーションループ
  useEffect(() => {
    if (ghostAnimations.length === 0) return;
    const animate = () => {
      const updated = ghostAnimations.map(anim => {
        const updatedGhosts = anim.ghosts.map(ghost => ({
          ...ghost,
          offsetX: ghost.offsetX + ghost.vx,
          offsetY: ghost.offsetY + ghost.vy,
          vx: ghost.vx + (Math.random() - 0.5) * 0.1,
          vy: ghost.vy - 0.01,
          wavePhase: ghost.wavePhase + 0.1,
          life: ghost.life - 0.016,
        })).filter(g => g.life > 0);
        return { ...anim, ghosts: updatedGhosts };
      }).filter(a => a.ghosts.length > 0);
      setGhostAnimations(updated);
      requestDraw();
      if (updated.length > 0) ghostAnimationRef.current = requestAnimationFrame(animate);
    };
    ghostAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (ghostAnimationRef.current) cancelAnimationFrame(ghostAnimationRef.current); };
  }, [ghostAnimations, requestDraw]);

  // 蜂アニメーションループ
  useEffect(() => {
    if (beeAnimations.length === 0) return;
    const animate = () => {
      const updated = beeAnimations.map(anim => {
        const updatedBees = anim.bees.map(bee => ({
          ...bee,
          angle: bee.angle + bee.speed,
          wingPhase: bee.wingPhase + 0.5,
          life: bee.life - 0.016,
        })).filter(b => b.life > 0);
        return { ...anim, bees: updatedBees };
      }).filter(a => a.bees.length > 0);
      setBeeAnimations(updated);
      requestDraw();
      if (updated.length > 0) beeAnimationRef.current = requestAnimationFrame(animate);
    };
    beeAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (beeAnimationRef.current) cancelAnimationFrame(beeAnimationRef.current); };
  }, [beeAnimations, requestDraw]);

  // 蛍アニメーションループ
  useEffect(() => {
    if (fireflyAnimations.length === 0) return;
    const animate = () => {
      const updated = fireflyAnimations.map(anim => {
        const updatedFireflies = anim.fireflies.map(ff => ({
          ...ff,
          offsetX: ff.offsetX + ff.vx,
          offsetY: ff.offsetY + ff.vy,
          vx: ff.vx + (Math.random() - 0.5) * 0.1,
          vy: ff.vy + (Math.random() - 0.5) * 0.1,
          glowPhase: ff.glowPhase + 0.05,
          glow: Math.sin(ff.glowPhase) * 0.5 + 0.5,
          life: ff.life - 0.016,
        })).filter(f => f.life > 0);
        return { ...anim, fireflies: updatedFireflies };
      }).filter(a => a.fireflies.length > 0);
      setFireflyAnimations(updated);
      requestDraw();
      if (updated.length > 0) fireflyAnimationRef.current = requestAnimationFrame(animate);
    };
    fireflyAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (fireflyAnimationRef.current) cancelAnimationFrame(fireflyAnimationRef.current); };
  }, [fireflyAnimations, requestDraw]);

  // 爆発アニメーションループ
  useEffect(() => {
    if (explosionAnimations.length === 0) return;
    const animate = () => {
      const updated = explosionAnimations.map(anim => {
        const updatedParticles = anim.particles.map(p => ({
          ...p,
          offsetX: p.offsetX + p.vx,
          offsetY: p.offsetY + p.vy,
          vy: p.vy + 0.2,
          opacity: p.opacity * 0.96,
          life: p.life - 0.016,
        })).filter(p => p.life > 0);
        const updatedShockwave = { radius: anim.shockwave.radius + 15, alpha: anim.shockwave.alpha * 0.9 };
        return { ...anim, particles: updatedParticles, shockwave: updatedShockwave, flash: anim.flash * 0.85 };
      }).filter(a => a.particles.length > 0 || a.shockwave.alpha > 0.05);
      setExplosionAnimations(updated);
      requestDraw();
      if (updated.length > 0) explosionAnimationRef.current = requestAnimationFrame(animate);
    };
    explosionAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (explosionAnimationRef.current) cancelAnimationFrame(explosionAnimationRef.current); };
  }, [explosionAnimations, requestDraw]);

  // ターゲットアニメーションループ
  useEffect(() => {
    if (targetAnimations.length === 0) return;
    const animate = () => {
      const updated = targetAnimations.map(anim => {
        const updatedRings = anim.rings.map(ring => ({
          ...ring,
          radius: Math.max(0, ring.radius + ring.speed),
          alpha: ring.radius + ring.speed <= 0 ? 1 : ring.alpha * 0.95,
        })).filter(r => r.radius > 0 || r.alpha > 0.05);
        return {
          ...anim,
          rings: updatedRings,
          crosshair: { ...anim.crosshair, rotation: anim.crosshair.rotation + 0.05 },
          life: anim.life - 0.016,
        };
      }).filter(a => a.life > 0);
      setTargetAnimations(updated);
      requestDraw();
      if (updated.length > 0) targetAnimationRef.current = requestAnimationFrame(animate);
    };
    targetAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (targetAnimationRef.current) cancelAnimationFrame(targetAnimationRef.current); };
  }, [targetAnimations, requestDraw]);

  // 怒りマークアニメーションループ
  useEffect(() => {
    if (angerAnimations.length === 0) return;
    const animate = () => {
      const updated = angerAnimations.map(anim => {
        const updatedMarks = anim.marks.map(mark => ({
          ...mark,
          bounce: mark.bounce + 0.3,
          offsetY: mark.offsetY + Math.sin(mark.bounce) * 2,
          opacity: mark.opacity * 0.98,
          life: mark.life - 0.016,
        })).filter(m => m.life > 0);
        return { ...anim, marks: updatedMarks };
      }).filter(a => a.marks.length > 0);
      setAngerAnimations(updated);
      requestDraw();
      if (updated.length > 0) angerAnimationRef.current = requestAnimationFrame(animate);
    };
    angerAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (angerAnimationRef.current) cancelAnimationFrame(angerAnimationRef.current); };
  }, [angerAnimations, requestDraw]);

  // 花びらアニメーションループ
  useEffect(() => {
    if (petalAnimations.length === 0) return;
    const animate = () => {
      const updated = petalAnimations.map(anim => {
        const updatedPetals = anim.petals.map(petal => ({
          ...petal,
          offsetX: petal.offsetX + petal.vx,
          offsetY: petal.offsetY + petal.vy,
          vy: petal.vy + 0.1,
          rotation: petal.rotation + petal.rotationSpeed,
          opacity: petal.opacity * 0.99,
          life: petal.life - 0.016,
        })).filter(p => p.life > 0);
        return { ...anim, petals: updatedPetals };
      }).filter(a => a.petals.length > 0);
      setPetalAnimations(updated);
      requestDraw();
      if (updated.length > 0) petalAnimationRef.current = requestAnimationFrame(animate);
    };
    petalAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (petalAnimationRef.current) cancelAnimationFrame(petalAnimationRef.current); };
  }, [petalAnimations, requestDraw]);

  // ひまわりアニメーションループ
  useEffect(() => {
    if (sunflowerAnimations.length === 0) return;
    const animate = () => {
      const updated = sunflowerAnimations.map(anim => {
        const updatedFlowers = anim.flowers.map(flower => ({
          ...flower,
          growth: Math.min(1, flower.growth + 0.02),
          size: flower.growth * 50,
          rotation: flower.rotation + 0.01,
          life: flower.life - 0.016,
        })).filter(f => f.life > 0);
        const updatedSeeds = anim.seeds.map(seed => ({
          ...seed,
          offsetX: seed.offsetX + seed.vx,
          offsetY: seed.offsetY + seed.vy,
          vy: seed.vy + 0.2,
          rotation: seed.rotation + 0.1,
          life: seed.life - 0.016,
        })).filter(s => s.life > 0);
        return { ...anim, flowers: updatedFlowers, seeds: updatedSeeds };
      }).filter(a => a.flowers.length > 0 || a.seeds.length > 0);
      setSunflowerAnimations(updated);
      requestDraw();
      if (updated.length > 0) sunflowerAnimationRef.current = requestAnimationFrame(animate);
    };
    sunflowerAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (sunflowerAnimationRef.current) cancelAnimationFrame(sunflowerAnimationRef.current); };
  }, [sunflowerAnimations, requestDraw]);

  // バラアニメーションループ
  useEffect(() => {
    if (roseAnimations.length === 0) return;
    const animate = () => {
      const now = Date.now();
      const updated = roseAnimations.map(anim => {
        const updatedPetals = anim.petals.map(petal => ({
          ...petal,
          offsetX: petal.offsetX + petal.vx,
          offsetY: petal.offsetY + petal.vy,
          vy: petal.vy + 0.08,
          rotation: petal.rotation + petal.rotationSpeed,
          opacity: petal.opacity * 0.99,
          life: petal.life - 0.016,
        })).filter(p => p.life > 0);
        const updatedSparkles = anim.sparkles.map(sp => ({
          ...sp,
          opacity: sp.opacity * 0.95,
          life: sp.life - 0.016,
        })).filter(s => s.life > 0);
        if (Math.random() < 0.1 && updatedSparkles.length < 20) {
          updatedSparkles.push({
            offsetX: (Math.random() - 0.5) * 60,
            offsetY: (Math.random() - 0.5) * 60,
            size: Math.random() * 3 + 2,
            opacity: 1,
            life: 1,
          });
        }
        return { ...anim, petals: updatedPetals, sparkles: updatedSparkles };
      }).filter(a => a.petals.length > 0 || a.sparkles.length > 0);
      setRoseAnimations(updated);
      requestDraw();
      if (updated.length > 0) roseAnimationRef.current = requestAnimationFrame(animate);
    };
    roseAnimationRef.current = requestAnimationFrame(animate);
    return () => { if (roseAnimationRef.current) cancelAnimationFrame(roseAnimationRef.current); };
  }, [roseAnimations, requestDraw]);

  // 花火アニメーションループ
  useEffect(() => {
    if (fireworks.length === 0) return;

    const ANIMATION_DURATION = 12000; // 12秒で強制終了

    const animate = () => {
      const now = Date.now();
      
      // 最初の花火の開始時刻から一定時間経過したら全てクリア
      if (fireworks.length > 0 && fireworks[0] && now - fireworks[0].startTime > ANIMATION_DURATION) {
        setFireworks([]);
        fireworksAnimationRef.current = null;
        return;
      }
      
      const updated = fireworks.map(fw => {
        if (now < fw.startTime) return fw; // まだ開始していない
        
        const elapsed = (now - fw.startTime) / 1000; // 秒
        const updatedParticles = fw.particles.map(p => {
          const newX = p.x + p.vx;
          const newY = p.y + p.vy + 0.15; // 重力効果を強く（0.02→0.15）
          const newLife = Math.max(0, p.life - 0.0003);
          
          return {
            ...p,
            x: newX,
            y: newY,
            vy: p.vy + 0.15, // 重力加速を強く（0.02→0.15）
            life: newLife,
          };
        }).filter(p => p.life > 0);
        
        return {
          ...fw,
          particles: updatedParticles,
        };
      }).filter(fw => fw.particles.length > 0 || now < fw.startTime);
      
      setFireworks(updated);
      
      if (updated.length > 0) {
        fireworksAnimationRef.current = requestAnimationFrame(animate);
      } else {
        fireworksAnimationRef.current = null;
      }
    };
    
    fireworksAnimationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (fireworksAnimationRef.current) {
        cancelAnimationFrame(fireworksAnimationRef.current);
        fireworksAnimationRef.current = null;
      }
    };
  }, [fireworks]);

  // キラキラエフェクトアニメーションループ
  useEffect(() => {
    if (sparkles.length === 0) return;

    const ANIMATION_DURATION = 10000; // 10秒で強制終了

    const animate = () => {
      const now = Date.now();
      
      // 開始時刻から一定時間経過したら全てクリア
      if (sparkles.length > 0 && sparkles[0] && now - sparkles[0].startTime > ANIMATION_DURATION) {
        setSparkles([]);
        sparklesAnimationRef.current = null;
        return;
      }
      
      const updated = sparkles.map(sp => {
        const elapsed = (now - sp.startTime) / 1000; // 秒
        
        const updatedParticles = sp.particles.map(p => {
          // 速度ベクトルで移動
          const newOffsetX = p.offsetX + p.vx;
          const newOffsetY = p.offsetY + p.vy;
          const newLife = Math.max(0, p.life - 0.0003); // 寿命をさらに延ばす（0.001→0.0003 = 約3333フレーム = 約55秒）
          const newRotation = p.rotation + 0.15;
          
          return {
            ...p,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
            rotation: newRotation,
            life: newLife,
          };
        }).filter(p => p.life > 0);
        
        return {
          ...sp,
          particles: updatedParticles,
        };
      }).filter(sp => sp.particles.length > 0);
      
      setSparkles(updated);
      
      if (updated.length > 0) {
        sparklesAnimationRef.current = requestAnimationFrame(animate);
      } else {
        sparklesAnimationRef.current = null;
      }
    };
    
    sparklesAnimationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (sparklesAnimationRef.current) {
        cancelAnimationFrame(sparklesAnimationRef.current);
        sparklesAnimationRef.current = null;
      }
    };
  }, [sparkles]);

  // 花吹雪アニメーションループ
  useEffect(() => {
    if (cherryBlossoms.length === 0) return;
    
    const ANIMATION_DURATION = 10000; // 10秒で強制終了
    
    const animate = () => {
      const now = Date.now();
      
      // 開始時刻から一定時間経過したら全てクリア
      if (cherryBlossoms.length > 0 && cherryBlossoms[0] && now - cherryBlossoms[0].startTime > ANIMATION_DURATION) {
        setCherryBlossoms([]);
        cherryBlossomsAnimationRef.current = null;
        return;
      }
      
      const updated = cherryBlossoms.map(cb => {
        const updatedParticles = cb.particles.map(p => {
          // 速度ベクトルで移動
          const newOffsetX = p.offsetX + p.vx;
          const newOffsetY = p.offsetY + p.vy;
          const newLife = Math.max(0, p.life - 0.0003);
          const newRotation = p.rotation + 0.15;
          
          return {
            ...p,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
            vy: p.vy + 0.1, // 重力を弱めに（ゆっくり落ちる）
            rotation: newRotation,
            life: newLife,
          };
        }).filter(p => p.life > 0);
        
        return {
          ...cb,
          particles: updatedParticles,
        };
      }).filter(cb => cb.particles.length > 0);
      
      setCherryBlossoms(updated);
      
      // canvas全体を再描画
      requestDraw();
      
      if (updated.length > 0) {
        cherryBlossomsAnimationRef.current = requestAnimationFrame(animate);
      } else {
        cherryBlossomsAnimationRef.current = null;
      }
    };
    
    cherryBlossomsAnimationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (cherryBlossomsAnimationRef.current) {
        cancelAnimationFrame(cherryBlossomsAnimationRef.current);
        cherryBlossomsAnimationRef.current = null;
      }
    };
  }, [cherryBlossoms]);

  // 隕石アニメーションループ
  useEffect(() => {
    if (meteors.length === 0) return;
    
    const ANIMATION_DURATION = 15000; // 15秒で強制終了
    
    const animate = () => {
      const now = Date.now();
      
      // 開始時刻から一定時間経過したら全てクリア
      if (meteors.length > 0 && meteors[0] && now - meteors[0].startTime > ANIMATION_DURATION) {
        setMeteors([]);
        meteorsAnimationRef.current = null;
        return;
      }
      
      const updated = meteors.map(m => {
        const updatedMeteors = m.meteors.map(meteor => {
          // 微震しながら移動
          meteor.swayOffset += meteor.swaySpeed;
          const swayX = Math.sin(meteor.swayOffset) * 2; // 微震（揺れ幅小さく）
          
          const newOffsetX = meteor.offsetX + meteor.vx + swayX * 0.1;
          const newOffsetY = meteor.offsetY + meteor.vy;
          const newLife = Math.max(0, meteor.life - 0.0001); // ゆっくりフェード
          
          return {
            ...meteor,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
            life: newLife,
          };
        }).filter(meteor => meteor.life > 0);
        
        return {
          ...m,
          meteors: updatedMeteors,
        };
      }).filter(m => m.meteors.length > 0);
      
      setMeteors(updated);
      
      // canvas全体を再描画
      requestDraw();
      
      if (updated.length > 0) {
        meteorsAnimationRef.current = requestAnimationFrame(animate);
      } else {
        meteorsAnimationRef.current = null;
      }
    };
    
    meteorsAnimationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (meteorsAnimationRef.current) {
        cancelAnimationFrame(meteorsAnimationRef.current);
        meteorsAnimationRef.current = null;
      }
    };
  }, [meteors]);

  // コインアニメーションループ
  useEffect(() => {
    if (coinDrops.length === 0) return;
    
    const ANIMATION_DURATION = 10000; // 10秒で強制終了
    
    const animate = () => {
      const now = Date.now();
      
      // 開始時刻から一定時間経過したら全てクリア
      if (coinDrops.length > 0 && coinDrops[0] && now - coinDrops[0].startTime > ANIMATION_DURATION) {
        setCoinDrops([]);
        coinDropsAnimationRef.current = null;
        return;
      }
      
      const updated = coinDrops.map(drop => {
        const updatedCoins = drop.coins.map(coin => {
          // 重力加速度
          const newVy = coin.vy + 0.3; // 重力
          const newOffsetX = coin.offsetX + coin.vx;
          const newOffsetY = coin.offsetY + coin.vy;
          const newRotation = coin.rotation + coin.rotationSpeed;
          const newRotationAngle = coin.rotationAngle + coin.rotationSpeed;
          
          // 画面下に落ちたら消す
          const canvas = canvasRef.current;
          const viewH = canvas ? canvas.getBoundingClientRect().height : 1000;
          const screenY = drop.y + newOffsetY;
          
          const newLife = screenY > viewH + 50 ? 0 : Math.max(0, coin.life - 0.001);
          
          return {
            ...coin,
            offsetX: newOffsetX,
            offsetY: newOffsetY,
            vy: newVy,
            rotation: newRotation,
            rotationAngle: newRotationAngle,
            life: newLife,
          };
        }).filter(coin => coin.life > 0);
        
        return {
          ...drop,
          coins: updatedCoins,
        };
      }).filter(drop => drop.coins.length > 0);
      
      setCoinDrops(updated);
      
      // canvas全体を再描画
      requestDraw();
      
      if (updated.length > 0) {
        coinDropsAnimationRef.current = requestAnimationFrame(animate);
      } else {
        coinDropsAnimationRef.current = null;
      }
    };
    
    coinDropsAnimationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (coinDropsAnimationRef.current) {
        cancelAnimationFrame(coinDropsAnimationRef.current);
        coinDropsAnimationRef.current = null;
      }
    };
  }, [coinDrops]);

  // スロットアニメーションループ
  useEffect(() => {
    if (slotAnimations.length === 0) return;
    
    const animate = () => {
      const now = Date.now();
      
      const updated = slotAnimations.map(slot => {
        const elapsed = (now - slot.startTime) / 1000;
        
        const updatedReels = slot.reels.map((reel, index) => {
          if (reel.stopped) return reel;
          
          // 各リールを順番に止める（1秒、2秒、3秒後）
          const stopDelay = 1.5 + index * 0.7;
          
          if (elapsed >= stopDelay && !reel.stopping) {
            // 停止開始
            return {
              ...reel,
              stopping: true,
              stopTime: now,
            };
          }
          
          if (reel.stopping) {
            // 停止アニメーション（減速）
            const stopElapsed = (now - reel.stopTime) / 1000;
            if (stopElapsed < 0.5) {
              // 減速しながら目標位置に近づく
              const slowdownFactor = 1 - (stopElapsed / 0.5);
              const newSpeed = reel.speed * slowdownFactor * 0.3;
              const newOffset = reel.offset + newSpeed;
              
              return {
                ...reel,
                offset: newOffset,
                speed: newSpeed,
              };
            } else {
              // 完全停止（目標の絵柄に合わせる）
              const symbolHeight = 60;
              const finalOffset = reel.finalIndex * symbolHeight;
              
              // 全リール停止確認：最後のリール（index 2）が停止した瞬間に配当を加算
              if (index === 2 && slot.payout > 0) {
                setTotalCoins(prev => {
                  const newTotal = prev + slot.payout;
                  try {
                    localStorage.setItem('totalCoins', newTotal.toString());
                  } catch (e) {
                    console.error('Failed to save totalCoins:', e);
                  }
                  return newTotal;
                });
              }
              
              return {
                ...reel,
                offset: finalOffset,
                speed: 0,
                stopped: true,
              };
            }
          }
          
          // 通常の回転
          return {
            ...reel,
            offset: reel.offset + reel.speed,
          };
        });
        
        return {
          ...slot,
          reels: updatedReels,
        };
      }).filter(s => s !== null);
      
      setSlotAnimations(updated as SlotAnimation[]);
      
      // canvas全体を再描画
      requestDraw();
      
      if (updated.length > 0) {
        slotAnimationsRef.current = requestAnimationFrame(animate);
      } else {
        slotAnimationsRef.current = null;
      }
    };
    
    slotAnimationsRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (slotAnimationsRef.current) {
        cancelAnimationFrame(slotAnimationsRef.current);
        slotAnimationsRef.current = null;
      }
    };
  }, [slotAnimations]);

  // スロットを閉じる関数（配当を加算してから閉じる）
  const closeSlotMachine = () => {
    if (slotAnimations.length > 0) {
      const slot = slotAnimations[0];
      // リールが全部停止していて配当がある場合、コインを追加
      const allStopped = slot.reels.every(r => r.stopped);
      if (allStopped && slot.payout > 0) {
        setTotalCoins(prev => {
          const newTotal = prev + slot.payout;
          try {
            localStorage.setItem('totalCoins', newTotal.toString());
          } catch (e) {
            console.error('Failed to save totalCoins:', e);
          }
          return newTotal;
        });
      }
    }
    setSlotAnimations([]);
  };


  // 初期表示：最初は少し引き気味にして“ゲームっぽく”
  useEffect(() => {
    // 1回だけ、map全体が入りやすいように軽くズームアウト
    setCam((c) => (c.scale === 1 ? { ...c, scale: 0.9 } : c));

  }, []);

  // データ・カメラ変更で描画
  useEffect(() => {
    requestDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objects, cfg.cols, cfg.rows, cfg.cell, cam, selectedId, showMoveArrows, myObjectId, isEditMode, pendingPosition]);

  // 兵士アニメーション変更時も再描画
  useEffect(() => {
    if (soldierAnimations.length > 0) {
      requestDraw();
    }
  }, [soldierAnimations]);

  // 花火アニメーション変更時も再描画
  useEffect(() => {
    if (fireworks.length > 0) {
      requestDraw();
    }
  }, [fireworks]);

  // キラキラエフェクト変更時も再描画
  useEffect(() => {
    if (sparkles.length > 0) {
      requestDraw();
    }
  }, [sparkles]);

  // ====== 入力:パン＆ズーム（タッチ/マウス） ======
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); // ブラウザのデフォルト動作を防ぐ
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    // スロットマシンの判定（最優先で処理、全ての処理より前）
    if (slotAnimations.length > 0) {
      const slot = slotAnimations[0];
      const centerX = rect.width / 2;
      const centerY = slot.y;
      const slotWidth = 280;
      const slotHeight = 240;
      
      // スロットマシン全体の範囲判定（×ボタンも含むように大きめ）
      const slotLeft = centerX - slotWidth / 2 - 20;
      const slotRight = centerX + slotWidth / 2 + 20;
      const slotTop = centerY - slotHeight / 2 - 40; // ×ボタン用に上部を拡大
      const slotBottom = centerY + slotHeight / 2 + 20;
      
      // スロット範囲内のクリックかチェック
      const isInSlotArea = sx >= slotLeft && sx <= slotRight && sy >= slotTop && sy <= slotBottom;
      
      if (isInSlotArea) {
        // ★★★ スロット範囲内のクリックは全てここで処理 ★★★
        // ×ボタンと回すボタンのみ有効、それ以外は無効化
        
        // 1. ×ボタンの判定（右上、クリック範囲を拡大）
        const closeButtonX = centerX + slotWidth / 2 - 30;
        const closeButtonY = centerY - slotHeight / 2 + 5;
        const closeButtonSize = 24;
        const closeButtonPadding = 10;
        if (
          sx >= closeButtonX - closeButtonPadding && 
          sx <= closeButtonX + closeButtonSize + closeButtonPadding &&
          sy >= closeButtonY - closeButtonPadding && 
          sy <= closeButtonY + closeButtonSize + closeButtonPadding
        ) {
          closeSlotMachine();
          return; // ×ボタンクリック：スロットを閉じて終了
        }
        
        // 2. 回すボタンの判定
        const allStopped = slot.reels.every(r => r.stopped);
        const elapsed = (Date.now() - slot.startTime) / 1000;
        const canSpin = allStopped && elapsed >= 3 && totalCoins >= 10;
        
        const buttonWidth = 100;
        const buttonHeight = 35;
        const buttonX = centerX - buttonWidth / 2;
        const buttonY = centerY + slotHeight / 2 - 65;
        
        if (
          sx >= buttonX && sx <= buttonX + buttonWidth &&
          sy >= buttonY && sy <= buttonY + buttonHeight
        ) {
          if (canSpin) {
            startSlotAnimation(slot.x, slot.y);
          }
          return; // 回すボタンクリック：スロット再開（または無効）して終了
        }
        
        // 3. ×ボタンでも回すボタンでもない場合：何もせず終了
        // → 下のオブジェクト選択を完全に無効化
        return;
      } else {
        // スロット範囲外をクリック：スロットを閉じる
        closeSlotMachine();
        // そのまま下の処理に進む（オブジェクト選択など）
      }
    }

    const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);

    // ポインター情報を先に登録
    canvas.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // 編集モード時の処理（1本指のみ）
    if (isEditMode && pointersRef.current.size === 1) {
      const hit = hitTest(mx, my);
      
      if (hit && hit.id) {
        // タッチデバイスかどうかを判定
        const isTouchDevice = e.pointerType === 'touch';
        
        if (isTouchDevice) {
          // 矢印表示中のオブジェクトなら即座にドラッグ開始
          if (showMoveArrows && String(hit.id) === showMoveArrows) {
            pushToHistory(objects);
            dragStartRef.current = {
              objId: String(hit.id),
              mx,
              my,
              objX: num(hit.x, 0),
              objY: num(hit.y, 0),
            };
            setIsDragging(true);
            setSelectedId(String(hit.id));
            return;
          }
          
          // タッチデバイス：長押しでドラッグ＆矢印表示開始
          pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
          
          longPressTimerRef.current = setTimeout(() => {
            // 長押しが成立：ドラッグ開始＆矢印を表示
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const currentSx = pointerStartRef.current!.x - rect.left;
            const currentSy = pointerStartRef.current!.y - rect.top;
            const { mx: currentMx, my: currentMy } = screenToMap(currentSx, currentSy, rect.width, rect.height);
            
            pushToHistory(objects);
            dragStartRef.current = {
              objId: String(hit.id),
              mx: currentMx,
              my: currentMy,
              objX: num(hit.x, 0),
              objY: num(hit.y, 0),
            };
            setIsDragging(true);
            setSelectedId(String(hit.id));
            setShowMoveArrows(String(hit.id));
            
            // 触覚フィードバック（対応デバイスのみ）
            if ('vibrate' in navigator) {
              navigator.vibrate(50);
            }
          }, 500); // 500msの長押し
          return;
        } else {
          // マウス：即座にドラッグ開始（従来の動作）
          pushToHistory(objects);
          dragStartRef.current = {
            objId: String(hit.id),
            mx,
            my,
            objX: num(hit.x, 0),
            objY: num(hit.y, 0),
          };
          setIsDragging(true);
          setSelectedId(String(hit.id));
          return;
        }
      }
    }

    // 2本指になったらピンチ開始（ドラッグをキャンセル）
    if (pointersRef.current.size === 2) {
      // 長押しタイマーをクリア
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      pointerStartRef.current = null;
      setIsDragging(false);
      dragStartRef.current = null;
      
      const pts = [...pointersRef.current.values()];
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchRef.current = {
        startScale: cam.scale,
        startTx: cam.tx,
        startTy: cam.ty,
        startMid: mid,
        startDist: dist,
      };
    } else {
      pinchRef.current = null;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointersRef.current.get(e.pointerId);
    if (!prev) return;

    // 長押し待機中に移動したらキャンセル
    if (longPressTimerRef.current && pointerStartRef.current) {
      const moveDistance = Math.hypot(
        e.clientX - pointerStartRef.current.x,
        e.clientY - pointerStartRef.current.y
      );
      if (moveDistance > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
        pointerStartRef.current = null;
      }
    }

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // ピンチ中（2本指操作は常に優先）
    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = [...pointersRef.current.values()];
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);

      const ratio = dist / Math.max(1, pinchRef.current.startDist);
      const newScale = clamp(pinchRef.current.startScale * ratio, 0.35, 2.5);

      // “ピンチ中心が画面上でズレない”ように、パンを調整
      const dx = mid.x - pinchRef.current.startMid.x;
      const dy = mid.y - pinchRef.current.startMid.y;

      setCam({
        scale: newScale,
        tx: pinchRef.current.startTx + dx,
        ty: pinchRef.current.startTy + dy,
      });
      return;
    }

    // 編集モード：オブジェクトドラッグ中（1本指のみ）
    if (isDragging && dragStartRef.current && pointersRef.current.size === 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);

      const deltaX = mx - dragStartRef.current.mx;
      const deltaY = my - dragStartRef.current.my;

      const newX = dragStartRef.current.objX + deltaX / cfg.cell;
      const newY = dragStartRef.current.objY + deltaY / cfg.cell;

      // グリッドマスに合わせて整数座標に丸める
      const snappedX = Math.round(newX);
      const snappedY = Math.round(newY);

      // オブジェクトの位置を更新
      setObjects((prev) =>
        prev.map((o) =>
          o.id === dragStartRef.current?.objId
            ? { ...o, x: snappedX, y: snappedY }
            : o
        )
      );
      setHasUnsavedChanges(true);
      return;
    }

    // パン操作（2本指の時はピンチを優先、1本指のみパン可能）
    if (pointersRef.current.size === 1 && !pinchRef.current) {
      if (isEditMode) {
        // 編集モード：ドラッグ中でなければパン可能
        if (!isDragging) {
          const dx = e.clientX - prev.x;
          const dy = e.clientY - prev.y;
          setCam((c) => ({ ...c, tx: c.tx + dx, ty: c.ty + dy }));
          
          // カメラ移動中フラグを設定
          setIsCameraMoving(true);
          if (cameraMovingTimerRef.current) clearTimeout(cameraMovingTimerRef.current);
          cameraMovingTimerRef.current = setTimeout(() => setIsCameraMoving(false), 200);
        }
      } else {
        // 閲覧モード：常にパン可能
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        setCam((c) => ({ ...c, tx: c.tx + dx, ty: c.ty + dy }));
        
        // カメラ移動中フラグを設定
        setIsCameraMoving(true);
        if (cameraMovingTimerRef.current) clearTimeout(cameraMovingTimerRef.current);
        cameraMovingTimerRef.current = setTimeout(() => setIsCameraMoving(false), 200);
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    // スロットマシン表示中はオブジェクト選択を完全にブロック
    if (slotAnimations.length > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const slot = slotAnimations[0];
        const centerX = rect.width / 2;
        const centerY = slot.y;
        const slotWidth = 280;
        const slotHeight = 240;
        const slotLeft = centerX - slotWidth / 2 - 20;
        const slotRight = centerX + slotWidth / 2 + 20;
        const slotTop = centerY - slotHeight / 2 - 40;
        const slotBottom = centerY + slotHeight / 2 + 20;
        const isInSlotArea = sx >= slotLeft && sx <= slotRight && sy >= slotTop && sy <= slotBottom;
        
        if (isInSlotArea) {
          // スロット範囲内のクリックは全て無視
          if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
          pointerStartRef.current = null;
          pointersRef.current.delete(e.pointerId);
          return;
        }
      }
    }
    
    // 長押しタイマーをクリア
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // タッチデバイスで短いタップの場合、ダブルタップ検出を優先
    if (e.pointerType === 'touch' && pointerStartRef.current && !isDragging && isEditMode) {
      const tapDuration = Date.now() - pointerStartRef.current.time;
      if (tapDuration < 500) {
        const currentTime = Date.now();
        const canvas = canvasRef.current;
        
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const sx = e.clientX - rect.left;
          const sy = e.clientY - rect.top;
          
          // ダブルタップ検出（400ms以内、50px以内）- 時間を少し延長
          if (lastTapRef.current) {
            const timeDiff = currentTime - lastTapRef.current.time;
            const distDiff = Math.hypot(
              sx - lastTapRef.current.x,
              sy - lastTapRef.current.y
            );
            
            if (timeDiff < 400 && distDiff < 50) {
              // ダブルタップ検出！
              lastTapRef.current = null;
              
              // ダブルクリックと同じ処理を実行
              const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);
              const hit = hitTest(mx, my);
              if (hit) {
                pushToHistory(objects);
                setEditingObject(hit);
                setOriginalEditingId(hit.id || null);
                setShowMoveArrows(null); // 編集ダイアログを開くときは矢印を閉じる
                if (isMobile) setIsPositionSizeExpanded(false); // モバイルではアコーディオンを閉じる
              } else {
                const gridX = Math.floor(mx / cfg.cell);
                const gridY = Math.floor(my / cfg.cell);
                setPendingPosition({ x: gridX, y: gridY });
                setModalSelectedType(lastSelectedType);
                setShowAddObjectModal(true);
              }
              pointerStartRef.current = null;
              
              // グリッドスナップ（編集モード時のみ）
              if (dragStartRef.current) {
                setObjects((prev) =>
                  prev.map((o) => {
                    if (o.id === dragStartRef.current?.objId) {
                      return {
                        ...o,
                        x: Math.round(num(o.x, 0)),
                        y: Math.round(num(o.y, 0)),
                      };
                    }
                    return o;
                  })
                );
              }

              pointersRef.current.delete(e.pointerId);
              pinchRef.current = null;
              setIsDragging(false);
              dragStartRef.current = null;
              return; // ダブルタップ検出したら早期リターン
            }
          }
          
          // 単一タップ：次のタップのために記録
          lastTapRef.current = { time: currentTime, x: sx, y: sy };
          
          // 矢印表示中は矢印を消さない（OKボタンでのみ終了）
          // ただし矢印表示中でない場合は選択処理を行う
          if (!showMoveArrows) {
            const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);
            const hit = hitTest(mx, my);
            
            // 参照モード時に熊罠をタップ → handleCanvasClick で処理するのでここでは何もしない
            if (!isEditMode && hit && hit.type === "BEAR_TRAP") {
              setSelectedId(String(hit.id));
              return;
            }
            
            if (hit && hit.id) {
              setSelectedId(String(hit.id));
            } else {
              setSelectedId(null);
            }
          }
        }
      }
    }
    
    pointerStartRef.current = null;
    
    // グリッドスナップ（編集モード時のみ）
    if (isDragging && dragStartRef.current && isEditMode) {
      setObjects((prev) =>
        prev.map((o) => {
          if (o.id === dragStartRef.current?.objId) {
            return {
              ...o,
              x: Math.round(num(o.x, 0)),
              y: Math.round(num(o.y, 0)),
            };
          }
          return o;
        })
      );
    }

    pointersRef.current.delete(e.pointerId);
    pinchRef.current = null;
    setIsDragging(false);
    dragStartRef.current = null;
    // 矢印はOKボタンでのみ消すので、ここでは消さない
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    // 長押しタイマーをクリア
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pointerStartRef.current = null;
    
    pointersRef.current.delete(e.pointerId);
    pinchRef.current = null;
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // タップ選択（短いクリック/タップ）
  const onClick = (e: React.MouseEvent) => {
    // スロットマシン表示中はオブジェクト選択を完全にブロック
    if (slotAnimations.length > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const slot = slotAnimations[0];
        const centerX = rect.width / 2;
        const centerY = slot.y;
        const slotWidth = 280;
        const slotHeight = 240;
        const slotLeft = centerX - slotWidth / 2 - 20;
        const slotRight = centerX + slotWidth / 2 + 20;
        const slotTop = centerY - slotHeight / 2 - 40;
        const slotBottom = centerY + slotHeight / 2 + 20;
        const isInSlotArea = sx >= slotLeft && sx <= slotRight && sy >= slotTop && sy <= slotBottom;
        
        if (isInSlotArea) {
          // スロット範囲内のクリックは全て無視
          return;
        }
      }
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);
    const gridX = Math.floor(mx / cfg.cell);
    const gridY = Math.floor(my / cfg.cell);
    
    const now = Date.now();
    const lastClick = lastClickRef.current;
    
    // ダブルクリック判定（300ms以内 & 同じグリッド位置）
    const isDoubleClick = lastClick && 
      (now - lastClick.time) < 300 && 
      lastClick.gridX === gridX && 
      lastClick.gridY === gridY;
    
    if (isDoubleClick) {
      // タイマーをクリア
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      lastClickRef.current = null;
      
      // ダブルクリック処理を実行
      if (isEditMode) {
        const hit = hitTest(mx, my);
        
        if (hit && hit.id) {
          // 既存オブジェクトをダブルクリック → 編集
          pushToHistory(objects);
          setShowMoveArrows(null);
          setEditingObject(hit);
          setOriginalEditingId(hit.id || null);
          if (isMobile) setIsPositionSizeExpanded(false);
          setPendingPosition(null);
        } else {
          // 空白エリアをダブルクリック → 新規追加モーダル
          setPendingPosition({ x: gridX, y: gridY });
          setShowAddObjectModal(true);
          setModalSelectedType(lastSelectedType || "FLAG");
          setSelectedId(null);
        }
      }
      return;
    }
    
    // 今回のクリックを記録
    lastClickRef.current = { time: now, gridX, gridY };
    
    // ダブルクリック検出のため、シングルクリック処理を遅延
    // 既存のタイマーをクリア
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    
    // まず最初にhit判定
    const hit = hitTest(mx, my);
    
    // 編集モードでの空白エリアクリックは遅延処理（ダブルクリック優先）
    if (isEditMode && !hit && !e.ctrlKey) {
      clickTimerRef.current = setTimeout(() => {
        // 空白箇所をクリック：その位置をpendingPositionに設定
        setPendingPosition({ x: gridX, y: gridY });
        setShowMoveArrows(null);
        setSelectedId(null);
        clickTimerRef.current = null;
      }, 250); // 250ms遅延
      return;
    }
    
    // 参照モードでの空白エリアクリック：アニメーションをクリア＋選択解除
    if (!isEditMode && !hit) {
      setFireworks([]);
      setSparkles([]);
      setCatAnimations([]);
      catAnimationsDataRef.current = [];
      setSelectedId(null);
      requestDraw();
      return;
    }
    
    // OKボタンのクリック判定（矢印表示中のみ）
    if (isEditMode && showMoveArrows) {
      const arrowObj = objects.find(o => String(o.id) === showMoveArrows);
      if (arrowObj) {
        const ox = num(arrowObj.x, 0) * cfg.cell;
        const oy = num(arrowObj.y, 0) * cfg.cell;
        const ow = Math.max(1, num(arrowObj.w, 1)) * cfg.cell;
        const oh = Math.max(1, num(arrowObj.h, 1)) * cfg.cell;
        const centerX = ox + ow / 2;
        const centerY = oy + oh / 2;
        
        const arrowSize = 30;
        const arrowDistance = Math.max(ow, oh) / 2 + arrowSize + 10;
        const okButtonDistance = arrowDistance + arrowSize + 20;
        const okButtonX = centerX - okButtonDistance / Math.sqrt(2);
        const okButtonY = centerY + okButtonDistance / Math.sqrt(2);
        const okButtonWidth = 60;
        const okButtonHeight = 32;
        
        // OKボタンの当たり判定
        if (Math.abs(mx - okButtonX) <= okButtonWidth / 2 && Math.abs(my - okButtonY) <= okButtonHeight / 2) {
          // OKボタンがクリックされた！
          setShowMoveArrows(null);
          return;
        }
      }
    }
    
    // 矢印がクリックされたかチェック（編集モード時のみ）
    if (isEditMode && showMoveArrows) {
      const arrowObj = objects.find(o => String(o.id) === showMoveArrows);
      if (arrowObj) {
        const ox = num(arrowObj.x, 0) * cfg.cell;
        const oy = num(arrowObj.y, 0) * cfg.cell;
        const ow = Math.max(1, num(arrowObj.w, 1)) * cfg.cell;
        const oh = Math.max(1, num(arrowObj.h, 1)) * cfg.cell;
        const centerX = ox + ow / 2;
        const centerY = oy + oh / 2;
        
        const arrowSize = 30;
        const arrowDistance = Math.max(ow, oh) / 2 + arrowSize + 10;
        const arrowRadius = arrowSize / 2;
        
        // 各矢印の位置
        const arrows = [
          { x: centerX, y: centerY - arrowDistance, dir: 'up' as const, dx: 0, dy: -1 },
          { x: centerX, y: centerY + arrowDistance, dir: 'down' as const, dx: 0, dy: 1 },
          { x: centerX - arrowDistance, y: centerY, dir: 'left' as const, dx: -1, dy: 0 },
          { x: centerX + arrowDistance, y: centerY, dir: 'right' as const, dx: 1, dy: 0 },
        ];
        
        for (const arrow of arrows) {
          const dist = Math.hypot(mx - arrow.x, my - arrow.y);
          if (dist <= arrowRadius + 5) {
            // 矢印がクリックされた！
            pushToHistory(objects);
            setObjects((prev) =>
              prev.map((o) =>
                o.id === showMoveArrows
                  ? { 
                      ...o, 
                      x: num(o.x, 0) + arrow.dx, 
                      y: num(o.y, 0) + arrow.dy 
                    }
                  : o
              )
            );
            setHasUnsavedChanges(true);
            
            // 触覚フィードバック
            if ('vibrate' in navigator) {
              navigator.vibrate(30);
            }
            return;
          }
        }
      }
    }
    
    // Ctrl+クリックで新規オブジェクト追加（編集モード時）
    if (isEditMode && e.ctrlKey) {
      pushToHistory(objects);
      const newId = `obj_${Date.now()}`;
      const defaultSize = getDefaultSize("FLAG");
      const newObj: Obj = {
        id: newId,
        type: "FLAG",
        label: "🚩",
        x: gridX,
        y: gridY,
        w: defaultSize.w,
        h: defaultSize.h,
      };
      setObjects((prev) => [...prev, newObj]);
      setSelectedId(newId);
      setEditingObject(newObj);
      setOriginalEditingId(newId);  // 新規追加時も元のIDとして設定
      if (isMobile) setIsPositionSizeExpanded(false); // モバイルではアコーディオンを閉じる
      setHasUnsavedChanges(true);
      setPendingPosition(null);
      return;
    }

    // hit変数を取得（再利用）
    // const hit = hitTest(mx, my); // 既に上で定義済み
    
    // 参照モード時にオブジェクトをタップした場合、アニメーション判定（ベースマップのみ）
    if (!isEditMode && hit && currentMapId === 'object') {
      // 参照モードではダブルクリック判定をスキップ
      lastClickRef.current = null;
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      
      const animationType = getActiveAnimation(hit);
      
      // 隕石とコイン以外のアニメーションをクリックした場合のみクリア
      if (animationType !== 'meteor' && animationType !== 'coin') {
        // 他のオブジェクトをクリックした場合、進行中のアニメーションをクリア
        setFireworks([]);
        setSparkles([]);
        setCherryBlossoms([]);
        setMeteors([]);
        setCoinDrops([]);
        setCatAnimations([]);
        catAnimationsDataRef.current = []; // refもクリア
        setBalloonAnimations([]);
        setAuroraAnimations([]);
        setButterflyAnimations([]);
        setShootingStarAnimations([]);
        setAutumnLeavesAnimations([]);
        setSnowAnimations([]);
        setConfettiAnimations([]);
        setRainbowAnimations([]);
        setRainAnimations([]);
        setMagicCircleAnimations([]);
      }
      
      // ランダムアニメーションの場合は実際のアニメーションタイプを選択
      let actualAnimationType = animationType;
      if (animationType === 'random') {
        const allAnimations = [
          'fireworks', 'sparkle', 'beartrap', 'birthday', 'cherryblossom', 'meteor', 'coin', 'slot', 'fishquiz', 'yojijukugo', 'englishquiz', 'cat',
          'balloon', 'aurora', 'butterfly', 'shootingstar', 'autumnleaves', 'snow', 'confetti', 'rainbow', 'rain', 'magiccircle',
          'flame', 'thunder', 'wave', 'wind', 'smoke', 'tornado', 'gem', 'startrail', 'lightparticle', 'spiral',
          'bird', 'ghost', 'bee', 'firefly', 'explosion', 'target', 'anger', 'petal', 'sunflower', 'rose'
        ];
        actualAnimationType = allAnimations[Math.floor(Math.random() * allAnimations.length)];
      }
      
      if (actualAnimationType === 'birthday') {
        // 誕生日アニメーション（紙吹雪）
        // 一度falseにしてからtrueにすることで、useEffectを確実に発火させる
        setShowBirthdayCelebration(false);
        setTimeout(() => setShowBirthdayCelebration(true), 0);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'beartrap') {
        // 熊罠アニメーション
        startSoldierAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'fireworks') {
        // 花火アニメーション
        startFireworksAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'sparkle') {
        // キラキラエフェクト
        startSparkleAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'cherryblossom') {
        // 花吹雪アニメーション
        startCherryBlossomAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'meteor') {
        // 隕石アニメーション
        startMeteorAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'coin') {
        // コインアニメーション
        startCoinAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'slot') {
        // スロットアニメーション
        startSlotAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'fishquiz') {
        // 魚クイズアニメーション
        startFishQuizAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'yojijukugo') {
        // 四字熟語クイズアニメーション
        startYojijukugoAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'englishquiz') {
        // 英単語クイズアニメーション
        startEnglishQuizAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'cat') {
        // 猫アニメーション：画面内に見えている都市をターゲットに
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const viewW = rect.width;
        const viewH = rect.height;
        
        // 画面内に見えているオブジェクトを取得
        const visibleObjects = objects.filter(obj => {
          // 自分自身も含める（散歩して帰ってくる動作を許可）
          if (obj.type !== 'CITY') return false; // 都市のみ
          
          // オブジェクトの中心座標（マップ座標）
          const objMapX = (num(obj.x, 0) + num(obj.w, 1) / 2) * cfg.cell;
          const objMapY = (num(obj.y, 0) + num(obj.h, 1) / 2) * cfg.cell;
          
          // スクリーン座標に変換
          const { sx, sy } = mapToScreen(objMapX, objMapY, viewW, viewH);
          
          // 画面内にあるかチェック（マージン付き）
          const margin = 100; // 画面端から100px以内も含める
          return sx >= -margin && sx <= viewW + margin && 
                 sy >= -margin && sy <= viewH + margin;
        });
        
        if (visibleObjects.length > 0) {
          // ランダムに都市を選択
          const randomTarget = visibleObjects[Math.floor(Math.random() * visibleObjects.length)];
          startCatAnimation(hit, randomTarget);
        }
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'balloon') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        startBalloonAnimation(rect.width / 2, rect.height / 2);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'aurora') {
        startAuroraAnimation();
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'butterfly') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        startButterflyAnimation(rect.width / 2, rect.height / 2);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'shootingstar') {
        startShootingStarAnimation();
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'autumnleaves') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        startAutumnLeavesAnimation(rect.width / 2, rect.height * 0.2);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'snow') {
        startSnowAnimation(20);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'confetti') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        startConfettiAnimation(rect.width / 2, rect.height / 2);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'rainbow') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        startRainbowAnimation(rect.width / 2, rect.height * 0.7);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'rain') {
        startRainAnimation(15);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'magiccircle') {
        startMagicCircleAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'flame') {
        startFlameAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'thunder') {
        startThunderAnimation();
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'wave') {
        startWaveAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'wind') {
        startWindAnimation(25);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'smoke') {
        startSmokeAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'tornado') {
        startTornadoAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'gem') {
        startGemAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'startrail') {
        startStarTrailAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'lightparticle') {
        startLightParticleAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'spiral') {
        startSpiralAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'bird') {
        startBirdAnimation(5);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'ghost') {
        startGhostAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'bee') {
        startBeeAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'firefly') {
        startFireflyAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'explosion') {
        startExplosionAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'target') {
        startTargetAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'anger') {
        startAngerAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'petal') {
        startPetalAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'sunflower') {
        startSunflowerAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else if (actualAnimationType === 'rose') {
        startRoseAnimation(hit);
        setSelectedId(hit?.id ? String(hit.id) : null);
      } else {
        // アニメーションなし：通常の選択
        setSelectedId(hit?.id ? String(hit.id) : null);
      }
      return;
    }
    
    // 参照モード時に空欄をクリックした場合、アニメーションをクリア
    if (!isEditMode && !hit) {
      setFireworks([]);
      setSparkles([]);
      setCherryBlossoms([]);
      setMeteors([]);
      setCoinDrops([]);
      setCatAnimations([]);
      catAnimationsDataRef.current = [];
      setBalloonAnimations([]);
      setAuroraAnimations([]);
      setButterflyAnimations([]);
      setShootingStarAnimations([]);
      setAutumnLeavesAnimations([]);
      setSnowAnimations([]);
      setConfettiAnimations([]);
      setRainbowAnimations([]);
      setRainAnimations([]);
      setMagicCircleAnimations([]);
      setFlameAnimations([]);
      setThunderAnimations([]);
      setWaveAnimations([]);
      setWindAnimations([]);
      setSmokeAnimations([]);
      setTornadoAnimations([]);
      setGemAnimations([]);
      setStarTrailAnimations([]);
      setLightParticleAnimations([]);
      setSpiralAnimations([]);
      setBirdAnimations([]);
      setGhostAnimations([]);
      setBeeAnimations([]);
      setFireflyAnimations([]);
      setExplosionAnimations([]);
      setTargetAnimations([]);
      setAngerAnimations([]);
      setPetalAnimations([]);
      setSunflowerAnimations([]);
      setRoseAnimations([]);
      setSelectedId(null);
      // requestDrawを呼び出して即座に反映
      requestDraw();
      return;
    }
    
    // 矢印が表示されている場合、矢印以外をクリックしたら閉じる
    if (showMoveArrows) {
      if (hit?.id && String(hit.id) === showMoveArrows) {
        // 同じオブジェクトをクリック：矢印を閉じる
        setShowMoveArrows(null);
      } else {
        // 他の場所をクリック：矢印を閉じて選択を変更
        setShowMoveArrows(null);
        setSelectedId(hit?.id ? String(hit.id) : null);
        
        // アニメーションをクリア（空欄クリック時も含む）
        if (!hit || !getActiveAnimation(hit)) {
          setFireworks([]);
          setSparkles([]);
          setCherryBlossoms([]);
          setMeteors([]);
          setCoinDrops([]);
          setCatAnimations([]);
          catAnimationsDataRef.current = [];
          setBalloonAnimations([]);
          setAuroraAnimations([]);
          setButterflyAnimations([]);
          setShootingStarAnimations([]);
          setAutumnLeavesAnimations([]);
          setSnowAnimations([]);
          setConfettiAnimations([]);
          setRainbowAnimations([]);
          setRainAnimations([]);
          setMagicCircleAnimations([]);
          setFlameAnimations([]);
          setThunderAnimations([]);
          setWaveAnimations([]);
          setWindAnimations([]);
          setSmokeAnimations([]);
          setTornadoAnimations([]);
          setGemAnimations([]);
          setStarTrailAnimations([]);
          setLightParticleAnimations([]);
          setSpiralAnimations([]);
          setBirdAnimations([]);
          setGhostAnimations([]);
          setBeeAnimations([]);
          setFireflyAnimations([]);
          setExplosionAnimations([]);
          setTargetAnimations([]);
          setAngerAnimations([]);
          setPetalAnimations([]);
          setSunflowerAnimations([]);
          setRoseAnimations([]);
        }
      }
    } else {
      setSelectedId(hit?.id ? String(hit.id) : null);
      
      // アニメーションをクリア（空欄クリック時も含む）
      if (!hit || !getActiveAnimation(hit)) {
        setFireworks([]);
        setSparkles([]);
        setCherryBlossoms([]);
        setMeteors([]);
        setCoinDrops([]);
        setCatAnimations([]);
        catAnimationsDataRef.current = [];
        setBalloonAnimations([]);
        setAuroraAnimations([]);
        setButterflyAnimations([]);
        setShootingStarAnimations([]);
        setAutumnLeavesAnimations([]);
        setSnowAnimations([]);
        setConfettiAnimations([]);
        setRainbowAnimations([]);
        setRainAnimations([]);
        setMagicCircleAnimations([]);
        setFlameAnimations([]);
        setThunderAnimations([]);
        setWaveAnimations([]);
        setWindAnimations([]);
        setSmokeAnimations([]);
        setTornadoAnimations([]);
        setGemAnimations([]);
        setStarTrailAnimations([]);
        setLightParticleAnimations([]);
        setSpiralAnimations([]);
        setBirdAnimations([]);
        setGhostAnimations([]);
        setBeeAnimations([]);
        setFireflyAnimations([]);
        setExplosionAnimations([]);
        setTargetAnimations([]);
        setAngerAnimations([]);
        setPetalAnimations([]);
        setSunflowerAnimations([]);
        setRoseAnimations([]);
      }
    }
  };

  // ダブルクリックで編集（編集モード時のみ）
  const onDoubleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    // シングルクリックのタイマーをクリア
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const { mx, my } = screenToMap(sx, sy, rect.width, rect.height);
    const gridX = Math.floor(mx / cfg.cell);
    const gridY = Math.floor(my / cfg.cell);
    
    const hit = hitTest(mx, my);
    
    if (hit) {
      // オブジェクト上でダブルクリック：編集
      pushToHistory(objects);
      setShowMoveArrows(null);
      setEditingObject(hit);
      setOriginalEditingId(hit.id || null);
      if (isMobile) setIsPositionSizeExpanded(false);
      setPendingPosition(null);
    } else {
      // 空白箇所でダブルクリック：新規追加モーダル表示
      setPendingPosition({ x: gridX, y: gridY });
      setModalSelectedType(lastSelectedType || "FLAG");
      setShowAddObjectModal(true);
    }
  };

  // 編集モード認証
  const handlePasswordSubmit = () => {
    if (password === "snow1234") {
      setIsEditMode(true);
      setShowPasswordModal(false);
      setShowMoveArrows(null);
      // 初期状態を保存
      initialObjectsRef.current = JSON.parse(JSON.stringify(objects));
      setHasUnsavedChanges(false);
      // Undo/Redoスタックをリセット
      setUndoStack([]);
      setRedoStack([]);
      // ヘッダーが見えるようにスクロールをトップに戻す
      window.scrollTo(0, 0);
      // パスワードをlocalStorageに保存
      try {
        localStorage.setItem('snw_edit_password', password);
      } catch (e) {
        console.warn('localStorageにパスワードを保存できませんでした', e);
      }
      setPassword("");
    } else {
      alert("パスワードが間違っています");
    }
  };

  // 履歴に追加（変更前の状態を保存）
  const pushToHistory = (currentObjects: Obj[]) => {
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(currentObjects))]);
    setRedoStack([]); // 新しい変更があったらredoスタックをクリア
  };

  // Undo（戻る）
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    // 現在の状態をredoスタックに保存
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(objects))]);
    setUndoStack(newUndoStack);
    setObjects(previousState);
    setHasUnsavedChanges(true);
  };

  // Redo（進む）
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    // 現在の状態をundoスタックに保存
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(objects))]);
    setRedoStack(newRedoStack);
    setObjects(nextState);
    setHasUnsavedChanges(true);
  };

  const exitEditMode = () => {
    if (hasUnsavedChanges || hasUnsavedLinksChanges) {
      if (!confirm("⚠️ 保存されていない変更があります。編集モードを終了してもよろしいですか？\n\n変更は破棄されます。")) {
        return;
      }
      // 変更を破棄して元に戻す
      setObjects(initialObjectsRef.current);
    }
    setIsEditMode(false);
    setSelectedId(null);
    setEditingObject(null);
    setOriginalEditingId(null);
    setShowMoveArrows(null);
    setHasUnsavedChanges(false);
    setHasUnsavedLinksChanges(false);
  };

  // 重なりチェック
  const hasAnyOverlap = useMemo(() => {
    if (!isEditMode) return false;
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        if (checkOverlap(objects[i], objects[j])) {
          return true;
        }
      }
    }
    return false;
  }, [objects, isEditMode]);

  // GASへ保存
  const saveToGAS = async () => {
    if (hasAnyOverlap) {
      setToastMessage("⚠️ 重なりを解消してください");
      return;
    }

    setIsLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_GAS_URL;
      if (!base) {
        setToastMessage("❌ URL未設定");
        setIsLoading(false);
        return;
      }

      const actorName = "anonymous"; // 常にanonymousで保存

      const res = await fetch(`${base}?action=saveMap`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          password: "snow1234",
          actor: actorName,
          mapId: currentMapId,
          objects,
          meta: {
            ...meta,
            bgImage: bgConfig.image,
            bgCenterX: bgConfig.centerX,
            bgCenterY: bgConfig.centerY,
            bgScale: bgConfig.scale,
            bgOpacity: bgConfig.opacity,
          },
        }),
      });

      const text = await res.text();

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`GASからの応答が不正です: ${text.substring(0, 200)}`);
      }

      if (!json.ok) {
        throw new Error(json.error || "保存に失敗しました");
      }

      setToastMessage("✅ 保存完了");
      // 初期状態を更新（カメラ位置は維持）
      initialObjectsRef.current = JSON.parse(JSON.stringify(objects));
      setHasUnsavedChanges(false);
      // 再読込はしない（カメラ位置を維持）
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("保存エラー詳細:", e);
      setToastMessage(`❌ 保存エラー: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLinksToGAS = async () => {
    setIsLoading(true);

    try {
      const base = process.env.NEXT_PUBLIC_GAS_URL;
      if (!base) {
        setToastMessage("❌ URL未設定");
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${base}?action=saveLinks`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          password: "snow1234",
          links: links.map((link, index) => ({
            ...link,
            order: index + 1,  // 現在の並び順を保存
            display: true
          })),
        }),
      });

      const text = await res.text();
      const json = JSON.parse(text);

      if (!json.ok) {
        throw new Error(json.error || "リンク保存に失敗しました");
      }

      setToastMessage("✅ リンク保存完了");
      setHasUnsavedLinksChanges(false);
      await loadMap(); // リンクを再読込
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("リンク保存エラー:", e);
      setToastMessage(`❌ リンク保存エラー: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ 
      fontFamily: "system-ui", 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      overflow: "hidden", 
      position: "relative",
    }}>
      {/* 超半透明の白いオーバーレイ */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      {/* 誕生日お祝い紙吹雪オーバーレイ */}
      {showBirthdayCelebration && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 9998,
          overflow: "hidden",
        }}>
          {/* ステージ0: Happy Birthday筆記体アニメーション */}
          {birthdayAnimationStage === 0 && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: isMobile ? 56 : 90,
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', 'Comic Sans MS', cursive",
                fontStyle: "italic",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #ff6b9d 0%, #ffd93d 25%, #6bcf7f 50%, #4d9fff 75%, #b57fff 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradientFlow 3s ease infinite, fadeInUp 2s ease-out",
                filter: "drop-shadow(0 0 20px rgba(255,215,0,0.7))",
                letterSpacing: isMobile ? 2 : 4,
                textShadow: "0 0 30px rgba(255,107,157,0.5)",
              }}>
                Happy Birthday!!
              </div>
            </div>
          )}
          {birthdayAnimationStage === 2 && (
            <>
              {/* 背景グロー */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: isMobile ? "150%" : "100%",
                height: isMobile ? "150%" : "100%",
                background: "radial-gradient(circle, rgba(255,107,157,0.05) 0%, rgba(77,159,255,0.03) 40%, transparent 70%)",
                animation: "pulse 4s ease-in-out infinite",
              }} />

              {/* メインタイトル - 軽いぼかし背景 */}
              <div style={{
                position: "absolute",
                top: isMobile ? "15%" : "20%",
                left: "50%",
                transform: "translate(-50%, 0)",
                padding: isMobile ? "10px 24px" : "14px 40px",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(8px)",
                borderRadius: 16,
                animation: "fadeIn 2s ease-out",
                opacity: 0,
                animationFillMode: "forwards",
              }}>
            <div style={{
              fontSize: isMobile ? 28 : 52,
              fontWeight: "900",
              background: "linear-gradient(135deg, #ff6b9d 0%, #ffd93d 25%, #6bcf7f 50%, #4d9fff 75%, #b57fff 100%)",
              backgroundSize: "300% 300%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradientFlow 4s ease infinite",
              letterSpacing: isMobile ? 4 : 8,
              textAlign: "center",
              filter: "drop-shadow(0 0 20px rgba(255,215,0,0.5))",
              whiteSpace: "nowrap",
            }}>
              HAPPY BIRTHDAY
            </div>
              </div>

              {/* 光の粒子エフェクト - 画面全体から */}
              {!isCameraMoving && Array.from({ length: 80 }).map((_, i) => {
                const startX = Math.random() * 100;
                const startY = Math.random() * 100;
                const delay = Math.random() * 5;
                const duration = 3 + Math.random() * 4; // 3-7秒にゆっくり
                const size = isMobile ? (2 + Math.random() * 4) : (3 + Math.random() * 6);
                const colors = ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4d9fff', '#b57fff', '#fff'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                return (
                  <div
                    key={`particle-${i}`}
                    style={{
                      position: "absolute",
                      left: `${startX}%`,
                      top: `${startY}%`,
                      width: size,
                      height: size,
                      borderRadius: "50%",
                      background: color,
                      animation: `particleFloat ${duration}s ease-in-out ${delay}s infinite`,
                      boxShadow: `0 0 ${size * 4}px ${color}, 0 0 ${size * 8}px ${color}`,
                      opacity: 0,
                    }}
                  />
                );
              })}

              {/* 紙吹雪 - 画面全体から舞い散る */}
              {!isCameraMoving && Array.from({ length: 100 }).map((_, i) => {
                const startSide = Math.floor(Math.random() * 4); // 0:top, 1:right, 2:bottom, 3:left
                let startX, startY;
                
                if (startSide === 0) { // top
                  startX = Math.random() * 100;
                  startY = -5;
                } else if (startSide === 1) { // right
                  startX = 105;
                  startY = Math.random() * 100;
                } else if (startSide === 2) { // bottom
                  startX = Math.random() * 100;
                  startY = 105;
                } else { // left
                  startX = -5;
                  startY = Math.random() * 100;
                }
                
                const delay = Math.random() * 5; // 0-5秒
                const duration = 6 + Math.random() * 4; // 6-10秒にゆっくり
                const size = isMobile ? (8 + Math.random() * 12) : (10 + Math.random() * 16);
                const rotate = Math.random() * 360;
                
                const colors = [
                  { base: '#ff6b9d', glow: 'rgba(255,107,157,0.8)' },
                  { base: '#ffd93d', glow: 'rgba(255,217,61,0.8)' },
                  { base: '#6bcf7f', glow: 'rgba(107,207,127,0.8)' },
                  { base: '#4d9fff', glow: 'rgba(77,159,255,0.8)' },
                  { base: '#b57fff', glow: 'rgba(181,127,255,0.8)' },
                  { base: '#ff8c42', glow: 'rgba(255,140,66,0.8)' },
                ];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const shapeType = Math.floor(Math.random() * 5); // 0-4: 様々な形
                
                let shapeStyle: React.CSSProperties = {};
                if (shapeType === 0) {
                  // 円
                  shapeStyle = {
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color.base}, ${color.glow})`,
                  };
                } else if (shapeType === 1) {
                  // 四角
                  shapeStyle = {
                    width: size,
                    height: size,
                    borderRadius: size * 0.2,
                    background: `linear-gradient(135deg, ${color.base}, ${color.glow})`,
                  };
                } else if (shapeType === 2) {
                  // 星
                  shapeStyle = {
                    width: size,
                    height: size,
                    background: color.base,
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  };
                } else if (shapeType === 3) {
                  // ダイヤモンド
                  shapeStyle = {
                    width: size,
                    height: size,
                    background: color.base,
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  };
                } else {
                  // 六角形
                  shapeStyle = {
                    width: size,
                    height: size,
                    background: color.base,
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                  };
                }
                
                return (
                  <div
                    key={`confetti-${i}`}
                    style={{
                      position: "absolute",
                      left: `${startX}%`,
                      top: `${startY}%`,
                      animation: `confettiExplode ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s infinite`,
                      transform: `rotate(${rotate}deg)`,
                      opacity: 0,
                      filter: `drop-shadow(0 0 ${size * 0.5}px ${color.glow})`,
                      ...shapeStyle,
                    }}
                  />
                );
              })}

              {/* ネオンリング */}
              {!isCameraMoving && Array.from({ length: 3 }).map((_, i) => {
                const delay = i * 1.5;
                const size = isMobile ? (200 + i * 100) : (300 + i * 150);
                return (
                  <div
                    key={`ring-${i}`}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: size,
                      height: size,
                      marginLeft: -size / 2,
                      marginTop: -size / 2,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      animation: `ringExpand 4s ease-out ${delay}s infinite`,
                      opacity: 0,
                    }}
                  />
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            animation: "snowflakeAnimation 3s infinite linear",
            display: "inline-block",
            transformOrigin: "center center",
            lineHeight: 1,
          }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 中心の六角形 */}
              <circle cx="32" cy="32" r="4" fill="white" opacity="0.9"/>
              
              {/* 6本の主軸 */}
              <line x1="32" y1="8" x2="32" y2="56" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <line x1="11.7" y1="20" x2="52.3" y2="44" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              <line x1="11.7" y1="44" x2="52.3" y2="20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              
              {/* 上方向の枝 */}
              <line x1="32" y1="18" x2="26" y2="13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="32" y1="18" x2="38" y2="13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="32" y1="14" x2="28" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="14" x2="36" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              
              {/* 下方向の枝 */}
              <line x1="32" y1="46" x2="26" y2="51" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="32" y1="46" x2="38" y2="51" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="32" y1="50" x2="28" y2="54" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="32" y1="50" x2="36" y2="54" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              
              {/* 右上方向の枝 */}
              <line x1="40.5" y1="26.9" x2="42.5" y2="21.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="40.5" y1="26.9" x2="45" y2="29" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="43.8" y1="24.6" x2="46" y2="19.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="43.8" y1="24.6" x2="47.8" y2="26.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              
              {/* 右下方向の枝 */}
              <line x1="40.5" y1="37.1" x2="42.5" y2="42.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="40.5" y1="37.1" x2="45" y2="35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="43.8" y1="39.4" x2="46" y2="44.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="43.8" y1="39.4" x2="47.8" y2="37.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              
              {/* 左上方向の枝 */}
              <line x1="23.5" y1="26.9" x2="21.5" y2="21.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="23.5" y1="26.9" x2="19" y2="29" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="20.2" y1="24.6" x2="18" y2="19.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="20.2" y1="24.6" x2="16.2" y2="26.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              
              {/* 左下方向の枝 */}
              <line x1="23.5" y1="37.1" x2="21.5" y2="42.5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="23.5" y1="37.1" x2="19" y2="35" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="20.2" y1="39.4" x2="18" y2="44.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="20.2" y1="39.4" x2="16.2" y2="37.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      )}
      {/* トースト通知 */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: toastMessage.startsWith("✅") 
            ? "rgba(34, 197, 94, 0.95)"  // 緑色（成功）
            : "rgba(220, 38, 38, 0.95)",  // 赤色（エラー）
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          zIndex: 10000,
          maxWidth: "90%",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "600",
          animation: "toastFadeIn 0.3s ease-out",
        }}>
          {toastMessage}
        </div>
      )}
      <style jsx global>{`
        @keyframes snowflakeAnimation {
          0% {
            transform: rotate(0deg) scale(0.8);
            opacity: 0.7;
          }
          25% {
            transform: rotate(90deg) scale(1.1);
            opacity: 0.9;
          }
          50% {
            transform: rotate(180deg) scale(0.8);
            opacity: 1;
          }
          75% {
            transform: rotate(270deg) scale(1.1);
            opacity: 0.9;
          }
          100% {
            transform: rotate(360deg) scale(0.8);
            opacity: 0.7;
          }
        }
        @keyframes toastFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes savePulse {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
          }
          50% {
            box-shadow: 0 6px 20px rgba(22, 163, 74, 0.7);
          }
        }
        @keyframes bubblePop {
          0% {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.8);
          }
          50% {
            transform: translate(-50%, -100%) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
          }
        }
      `}</style>

      <div style={{ 
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: (isMobile && isEditMode) ? "2px 4px" : (isMobile ? "4px 4px" : "8px"), 
        display: "flex", 
        gap: isMobile ? "4px" : "6px", 
        alignItems: "center", 
        background: "rgba(255, 255, 255, 0.2)", 
        backgroundImage: `url('${basePath}/header-bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.3)",
        flexWrap: "wrap",
        fontSize: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}>
        {/* 半透明オーバーレイ */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          zIndex: -1,
        }} />
        <div style={{ position: "relative" }} ref={headerMenuRef}>
          <h1 
            onClick={() => setShowHeaderMenu(!showHeaderMenu)}
            style={{ 
              margin: 0, 
              fontSize: isMobile ? "14px" : "clamp(16px, 4vw, 20px)", 
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: isMobile ? "100px" : "200px",
              color: "white",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.6), 1px -1px 2px rgba(0,0,0,0.6), -1px 1px 2px rgba(0,0,0,0.6)",
              fontWeight: "bold",
              position: "relative",
              zIndex: 1,
              cursor: "pointer",
            }}
          >
            {isInitialLoading ? "読込中..." : cfg.name}
          </h1>
          
          {/* ドロップダウンメニュー */}
          {showHeaderMenu && (
            <div 
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 8,
                background: isDarkMode ? "#1f2937" : "white",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                minWidth: 280,
                zIndex: 200,
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* マップ切替（表示可能なマップが2つ以上の場合のみ） */}
              {visibleMaps.length > 1 && (
                <>
                  <div 
                    style={{
                      padding: "12px 16px",
                      borderBottom: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                      userSelect: "none",
                      fontWeight: 600,
                      color: isDarkMode ? "#9ca3af" : "#6b7280",
                      fontSize: "13px",
                      background: isDarkMode ? "#111827" : "#f9fafb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>🗺️ マップ切替</span>
                    {isEditMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMapManagement(true);
                          setShowHeaderMenu(false);
                        }}
                        style={{
                          padding: "4px 8px",
                          fontSize: "11px",
                          background: "#2563eb",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        管理
                      </button>
                    )}
                  </div>
                  
                  {/* マップ一覧 */}
                  {visibleMaps.map((map, index) => {
                    const isCurrent = map.id === currentMapId;
                    
                    return (
                      <div 
                        key={map.id}
                        style={{
                          padding: "10px 16px 10px 32px",
                          cursor: isCurrent ? "default" : "pointer",
                          borderBottom: index < visibleMaps.length - 1 ? (isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb") : (isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb"),
                          transition: "background 0.2s",
                          userSelect: "none",
                          fontSize: "14px",
                          background: isCurrent 
                            ? (isDarkMode ? "#1e3a8a" : "#dbeafe") 
                            : (isDarkMode ? "#1f2937" : "white"),
                          color: isDarkMode ? "#e5e7eb" : "#1f2937",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          opacity: map.isVisible ? 1 : 0.5,
                        }}
                        onClick={(e) => {
                          if (!isCurrent) {
                            e.stopPropagation();
                            switchMap(map.id);
                          }
                        }}
                      >
                        <span style={{ flex: 1 }}>
                          {isCurrent && "✓ "}
                          {map.name}
                          {!map.isVisible && " (非表示)"}
                        </span>
                        {isEditMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMapConfig(map);
                              setShowMapManagement(true);
                              setShowHeaderMenu(false);
                            }}
                            style={{
                              padding: "2px 6px",
                              fontSize: "11px",
                              background: isDarkMode ? "#374151" : "#e5e7eb",
                              color: isDarkMode ? "#e5e7eb" : "#1f2937",
                              border: "none",
                              borderRadius: 3,
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                          >
                            編集
                          </button>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
              
              {/* リンク集（見出し） */}
              <div 
                style={{
                  padding: "12px 16px",
                  borderBottom: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                  userSelect: "none",
                  fontWeight: 600,
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                  fontSize: "13px",
                  background: isDarkMode ? "#111827" : "#f9fafb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>🔗 リンク集</span>
                {isEditMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingLink({ name: "", url: "", order: 0, display: true, index: -1 });
                      setShowAddLinkModal(true);
                      setShowHeaderMenu(false);
                    }}
                    style={{
                      padding: "4px 8px",
                      fontSize: "11px",
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    ＋追加
                  </button>
                )}
              </div>
              
              {/* リンク集のサブメニュー - スプレッドシートから動的に生成 */}
              {links.filter(link => link.display).map((link, displayIndex) => {
                const actualIndex = links.indexOf(link);  // 元の配列でのインデックス
                const isHighlighted = highlightedLinkIndex === actualIndex;
                const isHovered = hoveredLinkIndex === actualIndex;
                
                return (
                <div 
                  key={actualIndex}
                  style={{
                    padding: "10px 16px 10px 32px",
                    cursor: "pointer",
                    borderBottom: displayIndex < links.filter(l => l.display).length - 1 ? (isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb") : "none",
                    transition: "background 0.2s",
                    userSelect: "none",
                    fontSize: "14px",
                    background: isHighlighted 
                      ? (isDarkMode ? "#1e3a8a" : "#dbeafe") 
                      : (isHovered ? (isDarkMode ? "#374151" : "#f3f4f6") : (isDarkMode ? "#1f2937" : "white")),
                    color: isDarkMode ? "#e5e7eb" : "#1f2937",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={() => setHoveredLinkIndex(actualIndex)}
                  onMouseLeave={() => setHoveredLinkIndex(null)}
                >
                  <span 
                    onClick={(e) => {
                      if (!isEditMode) {
                        e.stopPropagation();
                        window.open(link.url, "_blank");
                        setShowHeaderMenu(false);
                      }
                    }}
                    style={{ flex: 1, cursor: isEditMode ? "default" : "pointer" }}
                  >
                    {link.name}
                  </span>
                  {isEditMode && (
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (actualIndex > 0) {
                            const newLinks = [...links];
                            [newLinks[actualIndex - 1], newLinks[actualIndex]] = [newLinks[actualIndex], newLinks[actualIndex - 1]];
                            setLinks(newLinks);
                            setHasUnsavedLinksChanges(true);
                            setHighlightedLinkIndex(actualIndex - 1);  // 移動先をハイライト
                          }
                        }}
                        disabled={actualIndex === 0}
                        style={{
                          padding: "2px 6px",
                          fontSize: "11px",
                          background: actualIndex === 0 ? "#d1d5db" : "#6366f1",
                          color: "white",
                          border: "none",
                          borderRadius: 3,
                          cursor: actualIndex === 0 ? "not-allowed" : "pointer",
                          userSelect: "none",
                          opacity: actualIndex === 0 ? 0.5 : 1,
                        }}
                        title="上に移動"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (actualIndex < links.length - 1) {
                            const newLinks = [...links];
                            [newLinks[actualIndex], newLinks[actualIndex + 1]] = [newLinks[actualIndex + 1], newLinks[actualIndex]];
                            setLinks(newLinks);
                            setHasUnsavedLinksChanges(true);
                            setHighlightedLinkIndex(actualIndex + 1);  // 移動先をハイライト
                          }
                        }}
                        disabled={actualIndex === links.length - 1}
                        style={{
                          padding: "2px 6px",
                          fontSize: "11px",
                          background: actualIndex === links.length - 1 ? "#d1d5db" : "#6366f1",
                          color: "white",
                          border: "none",
                          borderRadius: 3,
                          cursor: actualIndex === links.length - 1 ? "not-allowed" : "pointer",
                          userSelect: "none",
                          opacity: actualIndex === links.length - 1 ? 0.5 : 1,
                        }}
                        title="下に移動"
                      >
                        ↓
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingLink({ ...link, index: actualIndex });
                          setShowHeaderMenu(false);
                        }}
                        style={{
                          padding: "2px 6px",
                          fontSize: "11px",
                          background: "#059669",
                          color: "white",
                          border: "none",
                          borderRadius: 3,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        編集
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLinks(links.map((l, i) => 
                            i === actualIndex ? { ...l, display: false } : l
                          ));
                          setHasUnsavedLinksChanges(true);
                        }}
                        style={{
                          padding: "2px 6px",
                          fontSize: "11px",
                          background: "#f59e0b",
                          color: "white",
                          border: "none",
                          borderRadius: 3,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        title="非表示にする"
                      >
                        非表示
                      </button>
                    </div>
                  )}
                </div>
              );
              })}
              
              {/* 編集モード時：非表示のリンク一覧 */}
              {isEditMode && links.filter(link => !link.display).length > 0 && (
                <>
                  <div style={{
                    padding: "12px 16px",
                    borderTop: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                    userSelect: "none",
                    fontWeight: 600,
                    color: isDarkMode ? "#6b7280" : "#9ca3af",
                    fontSize: "13px",
                    background: isDarkMode ? "#111827" : "#f9fafb",
                  }}>
                    👻 非表示のリンク
                  </div>
                  {links.filter(link => !link.display).map((link, hiddenIndex) => {
                    const actualIndex = links.indexOf(link);
                    return (
                      <div 
                        key={actualIndex}
                        style={{
                          padding: "10px 16px 10px 32px",
                          borderBottom: hiddenIndex < links.filter(l => !l.display).length - 1 ? (isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb") : "none",
                          userSelect: "none",
                          fontSize: "14px",
                          background: isDarkMode ? "#111827" : "#fafafa",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          opacity: 0.6,
                        }}
                      >
                        <span style={{ flex: 1, textDecoration: "line-through", color: isDarkMode ? "#6b7280" : "#9ca3af" }}>
                          {link.name}
                        </span>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLinks(links.map((l, i) => 
                                i === actualIndex ? { ...l, display: true } : l
                              ));
                              setHasUnsavedLinksChanges(true);
                            }}
                            style={{
                              padding: "2px 6px",
                              fontSize: "11px",
                              background: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: 3,
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            title="再表示する"
                          >
                            表示
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`「${link.name}」を完全に削除しますか？`)) {
                                setLinks(links.filter((_, i) => i !== actualIndex));
                                setHasUnsavedLinksChanges(true);
                              }
                            }}
                            style={{
                              padding: "2px 6px",
                              fontSize: "11px",
                              background: "#dc2626",
                              color: "white",
                              border: "none",
                              borderRadius: 3,
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            title="完全に削除"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              
              {/* 設定セクション区切り */}
              <div style={{
                borderTop: isDarkMode ? "2px solid #374151" : "2px solid #e5e7eb",
                margin: "4px 0",
              }} />
              
              {/* 背景変更（編集モード時のみ） */}
              {isEditMode && (
                <div
                  onClick={() => {
                    setShowBgConfigModal(true);
                    setShowHeaderMenu(false);
                  }}
                  style={{
                    padding: "12px 16px 12px 32px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    userSelect: "none",
                    fontSize: "14px",
                    background: isDarkMode ? "#1f2937" : "white",
                    color: isDarkMode ? "#e5e7eb" : "#1f2937",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "600",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? "#374151" : "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDarkMode ? "#1f2937" : "white";
                  }}
                >
                  🖼️ <span>背景画像設定</span>
                </div>
              )}
              
              {/* マイオブジェクト設定（参照モード時のみ） */}
              {!isEditMode && (
                <div
                  onClick={() => {
                    setShowMyObjectSelector(true);
                    setShowHeaderMenu(false);
                  }}
                  style={{
                    padding: "12px 16px 12px 32px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    userSelect: "none",
                    fontSize: "14px",
                    background: myObjectId 
                      ? "#5b21b6"
                      : (isDarkMode ? "#1f2937" : "white"),
                    color: myObjectId
                      ? "#c4b5fd"
                      : (isDarkMode ? "#e5e7eb" : "#1f2937"),
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "600",
                  }}
                  onMouseEnter={(e) => {
                    if (myObjectId) {
                      e.currentTarget.style.background = "#6d28d9";
                    } else {
                      e.currentTarget.style.background = isDarkMode ? "#374151" : "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (myObjectId) {
                      e.currentTarget.style.background = "#5b21b6";
                    } else {
                      e.currentTarget.style.background = isDarkMode ? "#1f2937" : "white";
                    }
                  }}
                >
                  {myObjectId ? "✓" : "📍"} <span>マイオブジェクト設定</span>
                </div>
              )}
              
              {/* 熊罠最高ダメージ記録 */}
              {!isEditMode && bearTrapMaxDamage > 0 && (
                <div
                  style={{
                    padding: "12px 16px 12px 32px",
                    fontSize: "14px",
                    background: isDarkMode ? "#1f2937" : "white",
                    color: isDarkMode ? "#e5e7eb" : "#1f2937",
                    borderTop: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: isDarkMode ? "#9ca3af" : "#6b7280" }}>🐻 最高ダメージ記録</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBearTrapMaxDamage(0);
                        setSoldierAnimations([]); // アニメーションもクリア
                        try {
                          localStorage.removeItem('bearTrapMaxDamage');
                        } catch (err) {
                          console.error('Failed to remove bearTrapMaxDamage:', err);
                        }
                      }}
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        border: "1px solid #ef4444",
                        background: "transparent",
                        color: "#ef4444",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ef4444";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#ef4444";
                      }}
                    >
                      リセット
                    </button>
                  </div>
                  <div style={{ 
                    fontSize: "18px", 
                    fontWeight: "bold", 
                    color: "#fbbf24",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)"
                  }}>
                    {bearTrapMaxDamage.toLocaleString()}
                  </div>
                </div>
              )}
              
              {/* コイン獲得枚数 */}
              {!isEditMode && totalCoins > 0 && (
                <div
                  style={{
                    padding: "12px 16px 12px 32px",
                    fontSize: "14px",
                    background: isDarkMode ? "#1f2937" : "white",
                    color: isDarkMode ? "#e5e7eb" : "#1f2937",
                    borderTop: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: isDarkMode ? "#9ca3af" : "#6b7280" }}>🪙 コイン獲得枚数</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTotalCoins(0);
                        setCoinDrops([]); // アニメーションもクリア
                        try {
                          localStorage.removeItem('totalCoins');
                        } catch (err) {
                          console.error('Failed to remove totalCoins:', err);
                        }
                      }}
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        border: "1px solid #ef4444",
                        background: "transparent",
                        color: "#ef4444",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ef4444";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#ef4444";
                      }}
                    >
                      リセット
                    </button>
                  </div>
                  <div style={{ 
                    fontSize: "18px", 
                    fontWeight: "bold", 
                    color: "#fbbf24",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)"
                  }}>
                    {totalCoins.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={() => loadMap(currentMapId)} style={{ 
          padding: isMobile ? "8px 8px" : "6px 10px", 
          fontSize: isMobile ? "16px" : "13px", 
          whiteSpace: "nowrap", 
          minWidth: "auto",
          minHeight: isMobile ? "36px" : "auto",
          fontWeight: isMobile ? "bold" : "normal",
          position: "relative",
          zIndex: 1,
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          background: "white",
          color: "#1f2937",
          cursor: "pointer",
          userSelect: "none",
        }}>
          {isMobile ? "🔄" : (isEditMode ? "リセット" : "再読込")}
        </button>
        {!isEditMode ? (
          <>
            <div
              onClick={() => setTickerHidden(!tickerHidden)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: isMobile ? "6px 10px" : "6px 12px",
                background: "white",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 6,
                cursor: "pointer",
                userSelect: "none",
                minHeight: isMobile ? "36px" : "auto",
              }}
              title={tickerHidden ? "テロップを表示" : "テロップを非表示"}
            >
              <span style={{
                fontSize: isMobile ? 12 : 13,
                fontWeight: 500,
                color: "#333",
                whiteSpace: "nowrap",
              }}>
                テロップ
              </span>
              <div style={{
                position: "relative",
                width: "44px",
                height: "22px",
                background: effectiveTickerHidden ? "#d1d5db" : "#fbbf24",
                borderRadius: "11px",
                transition: "background 0.3s",
              }}>
                <div style={{
                  position: "absolute",
                  top: "2px",
                  left: effectiveTickerHidden ? "2px" : "22px",
                  width: "18px",
                  height: "18px",
                  background: "white",
                  borderRadius: "50%",
                  transition: "left 0.3s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }} />
              </div>
              <span style={{
                fontSize: isMobile ? 11 : 12,
                fontWeight: 600,
                color: tickerHidden ? "#9ca3af" : "#f59e0b",
                minWidth: "28px",
              }}>
                {tickerHidden ? "OFF" : "ON"}
              </span>
            </div>
            <button
              onClick={() => {
                // localStorageからパスワードを読み込んで自動認証を試みる
                try {
                  const savedPassword = localStorage.getItem('snw_edit_password');
                  if (savedPassword === 'snow1234') {
                    setIsEditMode(true);
                    setShowMoveArrows(null);
                    initialObjectsRef.current = JSON.parse(JSON.stringify(objects));
                    setHasUnsavedChanges(false);
                    setUndoStack([]);
                    setRedoStack([]);
                    window.scrollTo(0, 0);
                  } else {
                    setShowPasswordModal(true);
                  }
                } catch {
                  setShowPasswordModal(true);
                }
              }}
              style={{
                padding: isMobile ? "6px 8px" : "6px 10px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: isMobile ? "bold" : "normal",
                whiteSpace: "nowrap",
                minHeight: isMobile ? "36px" : "auto",
                position: "relative",
                zIndex: 1,
                userSelect: "none",
              }}
            >
              {isMobile ? "編集" : "🔓 編集モード"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              style={{
                padding: isMobile ? "8px 12px" : "6px 8px",
                background: undoStack.length === 0 ? "#d1d5db" : "#6b7280",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: undoStack.length === 0 ? "not-allowed" : "pointer",
                opacity: undoStack.length === 0 ? 0.5 : 1,
                fontSize: isMobile ? "16px" : "13px",
                minWidth: "auto",
                minHeight: isMobile ? "40px" : "auto",
                position: "relative",
                zIndex: 1,
                userSelect: "none",
              }}
              title="戻る (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              style={{
                padding: isMobile ? "8px 12px" : "6px 10px",
                background: redoStack.length === 0 ? "#d1d5db" : "#6b7280",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: redoStack.length === 0 ? "not-allowed" : "pointer",
                opacity: redoStack.length === 0 ? 0.5 : 1,
                fontSize: isMobile ? "16px" : "13px",
                fontWeight: isMobile ? "bold" : "normal",
                minWidth: "auto",
                minHeight: isMobile ? "40px" : "auto",
                position: "relative",
                zIndex: 1,
                userSelect: "none",
              }}
              title="進む (Ctrl+Y)"
            >
              {isMobile ? "↷" : "↷ 進む"}
            </button>
            <button
              onClick={async () => {
                // マップが編集されている場合は保存
                if (hasUnsavedChanges) {
                  await saveToGAS();
                }
                // リンク集が編集されている場合は保存
                if (hasUnsavedLinksChanges) {
                  await saveLinksToGAS();
                }
              }}
              disabled={hasAnyOverlap || (!hasUnsavedChanges && !hasUnsavedLinksChanges)}
              style={{
                padding: isMobile ? "8px 16px" : "8px 14px",
                background: (hasAnyOverlap || (!hasUnsavedChanges && !hasUnsavedLinksChanges)) ? "#9ca3af" : "#16a34a",
                color: "white",
                border: (hasAnyOverlap || (!hasUnsavedChanges && !hasUnsavedLinksChanges)) ? "none" : "2px solid #22c55e",
                borderRadius: 8,
                cursor: (hasAnyOverlap || (!hasUnsavedChanges && !hasUnsavedLinksChanges)) ? "not-allowed" : "pointer",
                opacity: (hasAnyOverlap || (!hasUnsavedChanges && !hasUnsavedLinksChanges)) ? 0.6 : 1,
                fontSize: isMobile ? "14px" : "14px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                minHeight: isMobile ? "40px" : "auto",
                position: "relative",
                zIndex: 1,
                boxShadow: (hasAnyOverlap || !hasUnsavedChanges) ? "none" : "0 4px 12px rgba(22, 163, 74, 0.4)",
                animation: (hasAnyOverlap || !hasUnsavedChanges) ? "none" : "savePulse 2s ease-in-out infinite",
                transform: (hasAnyOverlap || !hasUnsavedChanges) ? "none" : "scale(1.05)",
                userSelect: "none",
              }}
              title={
                hasAnyOverlap 
                  ? "オブジェクトが重なっているため保存できません" 
                  : !hasUnsavedChanges 
                  ? "変更がないため保存できません"
                  : ""
              }
            >
              {isMobile ? "💾 保存" : "💾 保存"}
            </button>
            <button
              onClick={() => {
                // pendingPositionがあればそれを使用、なければマップ中央
                if (!pendingPosition) {
                  const centerX = Math.floor(cfg.cols / 2);
                  const centerY = Math.floor(cfg.rows / 2);
                  setPendingPosition({ x: centerX, y: centerY });
                }
                setShowAddObjectModal(true);
                setModalSelectedType(lastSelectedType || "FLAG");
              }}
              style={{
                padding: isMobile ? "6px 8px" : "6px 10px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: isMobile ? "12px" : "13px",
                whiteSpace: "nowrap",
                fontWeight: "bold",
                minHeight: isMobile ? "36px" : "auto",
                position: "relative",
                zIndex: 1,
                userSelect: "none",
              }}
            >
              {isMobile ? "新規" : "➕ 新規オブジェクト"}
            </button>
            <button
              onClick={exitEditMode}
              style={{
                padding: isMobile ? "6px 8px" : "6px 10px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: isMobile ? "bold" : "normal",
                whiteSpace: "nowrap",
                minHeight: isMobile ? "36px" : "auto",
                position: "relative",
                zIndex: 1,
                userSelect: "none",
              }}
            >
              {isMobile ? "終了" : "🔒 編集終了"}
            </button>
          </>
        )}
        <div style={{ 
          marginLeft: "auto", 
          opacity: 0.8, 
          fontSize: "11px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "flex",
          gap: "4px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <span style={{ display: "none" }}>objects: {objects.length}</span>
          {isEditMode && <span style={{ color: "#2563eb", fontWeight: "bold" }}>🔧</span>}
          {hasUnsavedChanges && <span style={{ color: "#f59e0b", fontWeight: "bold" }}>🟡</span>}
          {hasAnyOverlap && <span style={{ color: "#dc2626", fontWeight: "bold" }}>⚠️</span>}
        </div>
      </div>

      {/* パスワード認証モーダル */}
      {showPasswordModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
            overflowY: "auto",
          }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: 12,
              width: "100%",
              maxWidth: "400px",
              minWidth: "280px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px 0", userSelect: "none" }}>編集モード認証</h2>
            <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#666", userSelect: "none" }}>
              パスワードを入力してください
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              placeholder="パスワード"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
                boxSizing: "border-box",
              }}
              autoFocus
            />
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  background: "white",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handlePasswordSubmit}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                ログイン
              </button>
            </div>
          </div>
        </div>
      )}

      {/* マップ管理モーダル */}
      {showMapManagement && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "12px" : "16px",
            overflowY: "auto",
          }}
          onClick={() => {
            setShowMapManagement(false);
            setEditingMapConfig(null);
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              width: "100%",
              maxWidth: isMobile ? "min(calc(100vw - 32px), 460px)" : "520px",
              maxHeight: isMobile ? "calc(100vh - 24px)" : "90vh",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              padding: isMobile ? "12px 16px" : "18px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <h2 style={{ margin: 0, color: "white", fontSize: isMobile ? 17 : 20, fontWeight: 600, userSelect: "none" }}>
                🗺️ マップ管理
              </h2>
            </div>
            <div style={{ padding: isMobile ? "14px" : "20px", overflowY: "auto", flex: 1 }}>
              {mapConfigs.map((map) => (
                <div 
                  key={map.id}
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    background: map.id === currentMapId ? "#eff6ff" : "#f9fafb",
                    border: map.id === currentMapId ? "2px solid #2563eb" : "1px solid #e5e7eb",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <input
                      type="text"
                      value={editingMapConfig?.id === map.id ? editingMapConfig.name : map.name}
                      onChange={(e) => {
                        if (editingMapConfig?.id === map.id) {
                          setEditingMapConfig({ ...editingMapConfig, name: e.target.value });
                        }
                      }}
                      disabled={editingMapConfig?.id !== map.id}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "2px solid #e5e7eb",
                        borderRadius: 6,
                        fontSize: 14,
                        background: editingMapConfig?.id === map.id ? "white" : "#f3f4f6",
                      }}
                    />
                    {map.id === currentMapId && (
                      <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>✓ 表示中</span>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {editingMapConfig?.id === map.id ? (
                      <>
                        <button
                          onClick={async () => {
                            try {
                              const base = process.env.NEXT_PUBLIC_GAS_URL;
                              if (!base) return;
                              
                              const res = await fetch(`${base}?action=updateMapConfig`, {
                                method: "POST",
                                headers: { "Content-Type": "text/plain" },
                                body: JSON.stringify({
                                  password: "snow1234",
                                  mapId: editingMapConfig.id,
                                  name: editingMapConfig.name,
                                }),
                              });
                              
                              const json = await res.json();
                              if (json.ok) {
                                await loadMapConfigs();
                                setEditingMapConfig(null);
                                setToastMessage("✅ マップ名を更新しました");
                              }
                            } catch (e) {
                              console.error(e);
                              setToastMessage("❌ 更新に失敗しました");
                            }
                          }}
                          style={{
                            padding: "6px 12px",
                            fontSize: 12,
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingMapConfig(null)}
                          style={{
                            padding: "6px 12px",
                            fontSize: 12,
                            background: "#6b7280",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          キャンセル
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingMapConfig(map)}
                          style={{
                            padding: "6px 12px",
                            fontSize: 12,
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          名前変更
                        </button>
                        {!map.isBase && (
                          <>
                            <button
                              onClick={async () => {
                                try {
                                  const base = process.env.NEXT_PUBLIC_GAS_URL;
                                  if (!base) return;
                                  
                                  const res = await fetch(`${base}?action=updateMapConfig`, {
                                    method: "POST",
                                    headers: { "Content-Type": "text/plain" },
                                    body: JSON.stringify({
                                      password: "snow1234",
                                      mapId: map.id,
                                      isVisible: !map.isVisible,
                                    }),
                                  });
                                  
                                  const json = await res.json();
                                  if (json.ok) {
                                    await loadMapConfigs();
                                    setToastMessage(`✅ ${!map.isVisible ? "表示" : "非表示"}に設定しました`);
                                  }
                                } catch (e) {
                                  console.error(e);
                                  setToastMessage("❌ 更新に失敗しました");
                                }
                              }}
                              style={{
                                padding: "6px 12px",
                                fontSize: 12,
                                background: map.isVisible ? "#f59e0b" : "#10b981",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                              }}
                            >
                              {map.isVisible ? "非表示にする" : "表示する"}
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`ベースマップ（${mapConfigs.find(m => m.isBase)?.name}）の内容を「${map.name}」にコピーしますか？`)) {
                                  return;
                                }
                                
                                try {
                                  const base = process.env.NEXT_PUBLIC_GAS_URL;
                                  if (!base) return;
                                  
                                  setIsLoading(true);
                                  const res = await fetch(`${base}?action=copyMap`, {
                                    method: "POST",
                                    headers: { "Content-Type": "text/plain" },
                                    body: JSON.stringify({
                                      password: "snow1234",
                                      targetMapId: map.id,
                                    }),
                                  });
                                  
                                  const json = await res.json();
                                  if (json.ok) {
                                    setToastMessage(`✅ ${json.copied}件のオブジェクトをコピーしました`);
                                    if (map.id === currentMapId) {
                                      await loadMap();
                                    }
                                  }
                                } catch (e) {
                                  console.error(e);
                                  setToastMessage("❌ コピーに失敗しました");
                                } finally {
                                  setIsLoading(false);
                                }
                              }}
                              style={{
                                padding: "6px 12px",
                                fontSize: 12,
                                background: "#8b5cf6",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                              }}
                            >
                              ベースからコピー
                            </button>
                          </>
                        )}
                        {map.id !== currentMapId && (
                          <button
                            onClick={() => switchMap(map.id)}
                            style={{
                              padding: "6px 12px",
                              fontSize: 12,
                              background: "#059669",
                              color: "white",
                              border: "none",
                              borderRadius: 4,
                              cursor: "pointer",
                            }}
                          >
                            このマップに切替
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  
                  {map.isBase && (
                    <div style={{ 
                      marginTop: 8, 
                      fontSize: 11, 
                      color: "#6b7280",
                      padding: "6px 10px",
                      background: "#fef3c7",
                      borderRadius: 4,
                      border: "1px solid #fcd34d",
                    }}>
                      ⭐ ベースマップ（非表示にできません）
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{
              padding: isMobile ? "12px 16px" : "16px 24px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "flex-end",
            }}>
              <button
                onClick={() => {
                  setShowMapManagement(false);
                  setEditingMapConfig(null);
                }}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新規オブジェクト追加モーダル（スマホ対応） */}
      {showAddObjectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
            overflowY: "auto",
          }}
          onClick={() => setShowAddObjectModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: 12,
              width: "100%",
              maxWidth: "400px",
              minWidth: "280px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px 0", userSelect: "none" }}>新規施設を追加</h2>
            <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#666", userSelect: "none" }}>
              {pendingPosition 
                ? `クリックした位置 (${pendingPosition.x}, ${pendingPosition.y}) に新しい施設を追加します`
                : "マップの中央に新しい施設を追加します"}
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500, userSelect: "none" }}>
                タイプを選択
              </label>
              <select
                value={modalSelectedType}
                onChange={(e) => setModalSelectedType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              >
                <option value="">（選択してください）</option>
                <option value="HQ">本部</option>
                <option value="BEAR_TRAP">熊罠</option>
                <option value="STATUE">同盟建造物</option>
                <option value="CITY">都市</option>
                <option value="DEPOT">同盟資材</option>
                <option value="FLAG">旗</option>
                <option value="MOUNTAIN">山</option>
                <option value="LAKE">湖</option>
                <option value="OTHER">その他</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setShowAddObjectModal(false);
                  setPendingPosition(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  background: "white",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (!modalSelectedType) {
                    alert("タイプを選択してください");
                    return;
                  }
                  pushToHistory(objects);
                  const centerX = pendingPosition ? pendingPosition.x : Math.floor(cfg.cols / 2);
                  const centerY = pendingPosition ? pendingPosition.y : Math.floor(cfg.rows / 2);
                  const newId = `obj_${Date.now()}`;
                  const defaultSize = getDefaultSize(modalSelectedType);
                  
                  let newLabel = "新規施設";
                  if (modalSelectedType === "FLAG") newLabel = "🚩";
                  else if (modalSelectedType === "MOUNTAIN") newLabel = "🏔️";
                  else if (modalSelectedType === "LAKE") newLabel = "🌊";
                  
                  const newObj: Obj = {
                    id: newId,
                    type: modalSelectedType,
                    label: newLabel,
                    x: centerX,
                    y: centerY,
                    w: defaultSize.w,
                    h: defaultSize.h,
                  };
                  setObjects((prev) => [...prev, newObj]);
                  setSelectedId(newId);
                  setEditingObject(newObj);
                  setOriginalEditingId(newId);  // 新規追加時も元のIDとして設定
                  if (isMobile) setIsPositionSizeExpanded(false); // モバイルではアコーディオンを閉じる
                  setHasUnsavedChanges(true);
                  setLastSelectedType(modalSelectedType);
                  setShowAddObjectModal(false);
                  setPendingPosition(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {err && (
        <div
          style={{
            margin: "0 12px",
            padding: "12px 16px",
            flexShrink: 0,
            background: "rgba(220, 38, 38, 0.1)",
            border: "1px solid rgba(220, 38, 38, 0.3)",
            borderRadius: 8,
            color: "#991b1b",
            fontSize: 14,
          }}
        >
          <strong>⚠️ エラー:</strong> {err}
        </div>
      )}

      <div
        style={{
          margin: isMobile ? "0" : "12px",
          marginTop: isMobile ? "52px" : "60px",
          marginBottom: isMobile ? "0" : "12px",
          flex: 1,
          border: isMobile ? "none" : "1px solid rgba(0,0,0,0.10)",
          borderRadius: isMobile ? 0 : 12,
          overflow: "hidden",
          background: "transparent",
          touchAction: "none",
          minHeight: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ 
            width: "100%", 
            height: "100%", 
            display: "block",
            userSelect: "none",
            position: "relative",
            zIndex: 1,
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none"
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        />
        
        {/* 誕生日テロップ（CSS keyframes実装） */}
        {!isEditMode && !effectiveTickerHidden && !showBirthdayCelebration && !isLoading && currentMapId === 'object' && (
          <div style={{
              position: "absolute",
              top: 28,
              left: 0,
              right: 0,
              height: 22,
              background: "linear-gradient(to bottom, rgba(255,255,200,0.5), rgba(255,255,200,0.7))",
              backdropFilter: "blur(2px)",
              overflow: "hidden",
              zIndex: 10,
              pointerEvents: "none",
            }}>
              <div 
                key={tickerKey}
                style={{
                  position: "absolute",
                  display: "flex",
                  whiteSpace: "nowrap",
                  animation: "tickerScroll 60s linear infinite",
                }}>
                <span style={{
                  fontSize: 14,
                  fontFamily: "system-ui",
                  color: "#4a4a4a",
                  lineHeight: "22px",
                  paddingRight: "100vw",
                }}>
                  {tickerText}
                </span>
                <span style={{
                  fontSize: 14,
                  fontFamily: "system-ui",
                  color: "#4a4a4a",
                  lineHeight: "22px",
                  paddingRight: "100vw",
                }}>
                  {tickerText}
                </span>
              </div>
            </div>
        )}

        {/* サブマップのテロップ（マップ名表示） */}
        {!effectiveTickerHidden && !showBirthdayCelebration && !isLoading && isSubMap && (
          <div style={{
              position: "absolute",
              top: 28,
              left: 0,
              right: 0,
              height: 22,
              background: "linear-gradient(to bottom, rgba(200,220,255,0.5), rgba(200,220,255,0.7))",
              backdropFilter: "blur(2px)",
              overflow: "hidden",
              zIndex: 10,
              pointerEvents: "none",
            }}>
              <div 
                key={`${tickerKey}-${currentMapId}`}
                style={{
                  position: "absolute",
                  display: "flex",
                  whiteSpace: "nowrap",
                  animation: "tickerScroll 30s linear infinite",
                }}>
                <span style={{
                  fontSize: 14,
                  fontFamily: "system-ui",
                  fontWeight: 600,
                  color: "#1e40af",
                  lineHeight: "22px",
                  paddingRight: "100vw",
                }}>
                  {currentMap?.name || 'サブマップ'}（{isEditMode ? '編集中' : '参照中'}）
                </span>
                <span style={{
                  fontSize: 14,
                  fontFamily: "system-ui",
                  fontWeight: 600,
                  color: "#1e40af",
                  lineHeight: "22px",
                  paddingRight: "100vw",
                }}>
                  {currentMap?.name || 'サブマップ'}（{isEditMode ? '編集中' : '参照中'}）
                </span>
              </div>
            </div>
        )}
        
        {/* ズームボタン */}
        <div
          style={{
            position: "absolute",
            bottom: isMobile ? 12 : 16,
            right: isMobile ? 8 : 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => {
              setCam((prev) => {
                const newScale = Math.min(prev.scale * 1.2, 3);
                return { ...prev, scale: newScale };
              });
              
              // カメラ移動中フラグを設定
              setIsCameraMoving(true);
              if (cameraMovingTimerRef.current) clearTimeout(cameraMovingTimerRef.current);
              cameraMovingTimerRef.current = setTimeout(() => setIsCameraMoving(false), 200);
            }}
            style={{
              width: 40,
              height: 40,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              background: "white",
              cursor: "pointer",
              fontSize: 20,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "all 0.2s",
              userSelect: "none",
              WebkitUserSelect: "none",
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title="ズームイン"
          >
            +
          </button>
          <button
            onClick={() => {
              setCam((prev) => {
                const newScale = Math.max(prev.scale / 1.2, 0.1);
                return { ...prev, scale: newScale };
              });
              
              // カメラ移動中フラグを設定
              setIsCameraMoving(true);
              if (cameraMovingTimerRef.current) clearTimeout(cameraMovingTimerRef.current);
              cameraMovingTimerRef.current = setTimeout(() => setIsCameraMoving(false), 200);
            }}
            style={{
              width: 40,
              height: 40,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              background: "white",
              cursor: "pointer",
              fontSize: 20,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "all 0.2s",
              userSelect: "none",
              WebkitUserSelect: "none",
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title="ズームアウト"
          >
            −
          </button>
          
          {/* ズームレベル表示 */}
          <div
            style={{
              width: 40,
              padding: "4px 0",
              background: "rgba(255,255,255,0.7)",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: "500",
              color: "#6b7280",
              textAlign: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              userSelect: "none",
            }}
          >
            ×{cam.scale.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 編集ダイアログ */}
      {editingObject && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "12px" : "16px",
            overflowY: "auto",
          }}
          onClick={() => {
            setEditingObject(null);
            setOriginalEditingId(null);
            window.scrollTo(0, 0);
          }}
        >
          <div
            style={{
              background: "white",
              padding: "0",
              borderRadius: 16,
              width: "100%",
              maxWidth: isMobile ? "min(calc(100vw - 32px), 460px)" : "480px",
              minWidth: isMobile ? "auto" : "280px",
              maxHeight: isMobile ? "calc(100vh - 24px)" : "90vh",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              margin: "0 auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              padding: isMobile ? "12px 16px" : "18px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              flexShrink: 0,
            }}>
              <h2 style={{ margin: 0, color: "white", fontSize: isMobile ? 17 : 20, fontWeight: 600, userSelect: "none" }}>オブジェクト編集</h2>
            </div>
            <div style={{ padding: isMobile ? "14px" : "20px", overflowY: "auto", flex: 1 }}>
            
            {/* ID入力フィールド */}
            <div style={{ 
              marginBottom: isMobile ? 8 : 12,
              display: isMobile ? "grid" : "block",
              gridTemplateColumns: isMobile ? "70px 1fr" : "auto",
              gap: isMobile ? "8px" : "0",
              alignItems: isMobile ? "center" : "flex-start",
              background: isMobile ? "linear-gradient(to right, rgba(107, 114, 128, 0.03), rgba(156, 163, 175, 0.03))" : "transparent",
              padding: isMobile ? "10px" : "0",
              borderRadius: isMobile ? 8 : 0,
              border: isMobile ? "1px solid rgba(107, 114, 128, 0.1)" : "none",
            }}>
              <label style={{ 
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 4 : 0,
                marginBottom: isMobile ? 0 : 6, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                {isMobile && "🔖"}
                <span>ID</span>
              </label>
              <input
                type="text"
                value={editingObject.id != null ? String(editingObject.id) : ""}
                onChange={(e) => {
                  const newId = e.target.value.trim();
                  setEditingObject({ ...editingObject, id: newId });
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: (() => {
                    const newId = editingObject.id != null ? String(editingObject.id) : "";
                    const isDuplicate = objects.some(o => String(o.id) === newId && String(o.id) !== originalEditingId);
                    return isDuplicate ? "2px solid #dc2626" : "2px solid #e5e7eb";
                  })(),
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: "border-box",
                  backgroundColor: "white",
                  color: "#1f2937",
                  transition: "all 0.2s",
                  outline: "none",
                  boxShadow: isMobile ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
                onFocus={(e) => {
                  const newId = editingObject.id != null ? String(editingObject.id) : "";
                  const isDuplicate = objects.some(o => String(o.id) === newId && String(o.id) !== originalEditingId);
                  if (!isDuplicate) {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  const newId = editingObject.id != null ? String(editingObject.id) : "";
                  const isDuplicate = objects.some(o => String(o.id) === newId && String(o.id) !== originalEditingId);
                  e.target.style.borderColor = isDuplicate ? "#dc2626" : "#e5e7eb";
                  e.target.style.boxShadow = isMobile ? "0 1px 3px rgba(0,0,0,0.1)" : "none";
                }}
              />
              {(() => {
                const currentId = editingObject.id != null ? String(editingObject.id) : "";
                const isDuplicate = objects.some(o => String(o.id) === currentId && String(o.id) !== originalEditingId);
                return isDuplicate ? (
                  <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#dc2626", userSelect: "none" }}>
                    ⚠️ このIDは既に使用されています
                  </p>
                ) : null;
              })()}
            </div>

            <div style={{ 
              marginBottom: isMobile ? 8 : 12,
              display: isMobile ? "grid" : "block",
              gridTemplateColumns: isMobile ? "70px 1fr" : "auto",
              gap: isMobile ? "8px" : "0",
              alignItems: isMobile ? "center" : "flex-start",
              background: isMobile ? "linear-gradient(to right, rgba(59, 130, 246, 0.03), rgba(147, 197, 253, 0.03))" : "transparent",
              padding: isMobile ? "10px" : "0",
              borderRadius: isMobile ? 8 : 0,
              border: isMobile ? "1px solid rgba(59, 130, 246, 0.1)" : "none",
            }}>
              <label style={{ 
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 4 : 0,
                marginBottom: isMobile ? 0 : 6, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                {isMobile && "📝"}
                <span>名前</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={editingObject.label || ""}
                onChange={(e) => setEditingObject({ ...editingObject, label: e.target.value })}
                readOnly={editingObject.type === "FLAG" || editingObject.type === "MOUNTAIN" || editingObject.type === "LAKE"}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: "border-box",
                  backgroundColor: (editingObject.type === "FLAG" || editingObject.type === "MOUNTAIN" || editingObject.type === "LAKE") ? "#f9fafb" : "white",
                  color: "#1f2937",
                  cursor: (editingObject.type === "FLAG" || editingObject.type === "MOUNTAIN" || editingObject.type === "LAKE") ? "not-allowed" : "text",
                  transition: "all 0.2s",
                  outline: "none",
                  boxShadow: isMobile ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
                onFocus={(e) => {
                  if (editingObject.type !== "FLAG" && editingObject.type !== "MOUNTAIN" && editingObject.type !== "LAKE") {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = isMobile ? "0 1px 3px rgba(0,0,0,0.1)" : "none";
                }}
              />
            </div>

            {/* 誕生日入力フィールド（ベースマップのみ） */}
            {currentMap?.isBase && (
            <div style={{ 
              marginBottom: isMobile ? 8 : 12,
              display: isMobile ? "grid" : "block",
              gridTemplateColumns: isMobile ? "70px 1fr" : "auto",
              gap: isMobile ? "8px" : "0",
              alignItems: isMobile ? "center" : "flex-start",
              background: isMobile ? "linear-gradient(to right, rgba(251, 146, 60, 0.03), rgba(254, 215, 170, 0.03))" : "transparent",
              padding: isMobile ? "10px" : "0",
              borderRadius: isMobile ? 8 : 0,
              border: isMobile ? "1px solid rgba(251, 146, 60, 0.1)" : "none",
            }}>
              <label style={{ 
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 4 : 0,
                marginBottom: isMobile ? 0 : 6, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                {isMobile && "🎂"}
                <span>誕生日</span>
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={(() => {
                    if (!editingObject.birthday) return '';
                    const match = editingObject.birthday.match(/(\d{1,2})月/);
                    return match ? match[1] : '';
                  })()}
                  onChange={(e) => {
                    const month = e.target.value;
                    if (!month) {
                      setEditingObject({ ...editingObject, birthday: '' });
                    } else {
                      const currentDay = (() => {
                        if (!editingObject.birthday) return '1';
                        const match = editingObject.birthday.match(/(\d{1,2})日/);
                        return match ? match[1] : '1';
                      })();
                      setEditingObject({ ...editingObject, birthday: `${month}月${currentDay}日` });
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 15,
                    boxSizing: "border-box",
                    backgroundColor: "white",
                    color: "#1f2937",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="">--月</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}月</option>
                  ))}
                </select>
                <select
                  value={(() => {
                    if (!editingObject.birthday) return '';
                    const match = editingObject.birthday.match(/(\d{1,2})日/);
                    return match ? match[1] : '';
                  })()}
                  onChange={(e) => {
                    const day = e.target.value;
                    const currentMonth = (() => {
                      if (!editingObject.birthday) return '';
                      const match = editingObject.birthday.match(/(\d{1,2})月/);
                      return match ? match[1] : '';
                    })();
                    if (!day || !currentMonth) {
                      setEditingObject({ ...editingObject, birthday: '' });
                    } else {
                      setEditingObject({ ...editingObject, birthday: `${currentMonth}月${day}日` });
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "2px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 15,
                    boxSizing: "border-box",
                    backgroundColor: "white",
                    color: "#1f2937",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="">--日</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}日</option>
                  ))}
                </select>
              </div>
            </div>
            )}

            {/* タイプ */}
            <div style={{ 
              marginBottom: isMobile ? 8 : 12,
              display: isMobile ? "grid" : "block",
              gridTemplateColumns: isMobile ? "70px 1fr" : "auto",
              gap: isMobile ? "8px" : "0",
              alignItems: isMobile ? "center" : "flex-start",
              background: isMobile ? "linear-gradient(to right, rgba(147, 51, 234, 0.03), rgba(196, 181, 253, 0.03))" : "transparent",
              padding: isMobile ? "10px" : "0",
              borderRadius: isMobile ? 8 : 0,
              border: isMobile ? "1px solid rgba(147, 51, 234, 0.1)" : "none",
            }}>
              <label style={{ 
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 4 : 0,
                marginBottom: isMobile ? 0 : 6, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                {isMobile && "🏷️"}
                <span>タイプ</span>
              </label>
              <select
                value={editingObject.type || "OTHER"}
                onChange={(e) => {
                  const newType = e.target.value;
                  const defaultSize = getDefaultSize(newType);
                  let newLabel = editingObject.label;
                  if (newType === "FLAG") newLabel = "🚩";
                  else if (newType === "MOUNTAIN") newLabel = "🏔️";
                  else if (newType === "LAKE") newLabel = "🌊";
                  setEditingObject({ 
                    ...editingObject, 
                    type: newType,
                    label: newLabel,
                    w: defaultSize.w,
                    h: defaultSize.h,
                  });
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: "border-box",
                  backgroundColor: "white",
                  color: "#1f2937",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="HQ">本部</option>
                <option value="BEAR_TRAP">熊罠</option>
                <option value="STATUE">同盟建造物</option>
                <option value="CITY">都市</option>
                <option value="DEPOT">同盟資材</option>
                <option value="FLAG">旗</option>
                <option value="MOUNTAIN">山</option>
                <option value="LAKE">湖</option>
                <option value="OTHER">その他</option>
              </select>
            </div>

            {/* サイズセクション（サブマップ用） */}
            {!currentMap?.isBase && (
            <div style={{ marginBottom: isMobile ? 8 : 12 }}>
              {/* 幅 */}
              <div style={{ 
                marginBottom: isMobile ? 8 : 10,
                display: isMobile ? "grid" : "block",
                gridTemplateColumns: isMobile ? "70px 1fr" : "auto",
                gap: isMobile ? "8px" : "0",
                alignItems: isMobile ? "center" : "flex-start",
                background: isMobile ? "linear-gradient(to right, rgba(34, 197, 94, 0.03), rgba(134, 239, 172, 0.03))" : "transparent",
                padding: isMobile ? "10px" : "0",
                borderRadius: isMobile ? 8 : 0,
                border: isMobile ? "1px solid rgba(34, 197, 94, 0.1)" : "none",
              }}>
                <label style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 4 : 0,
                  marginBottom: isMobile ? 0 : 6, 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: "#374151",
                  userSelect: "none",
                }}>
                  {isMobile && "↔️"}
                  <span>幅</span>
                </label>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    onClick={() => setEditingObject({ ...editingObject, w: Math.max(1, (editingObject.w || 1) - 1) })}
                    style={{
                      width: 40,
                      height: 46,
                      border: "2px solid #e5e7eb",
                      borderRadius: 8,
                      background: "white",
                      cursor: "pointer",
                      fontSize: 20,
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6b7280",
                      flexShrink: 0,
                      userSelect: "none",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f3f4f6";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editingObject.w || 1}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setEditingObject({ ...editingObject, w: Math.max(1, val === '' ? 1 : Number(val)) });
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 8px",
                      border: "2px solid #e5e7eb",
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      color: "#1f2937",
                      outline: "none",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  />
                  <button
                    onClick={() => setEditingObject({ ...editingObject, w: (editingObject.w || 1) + 1 })}
                    style={{
                      width: 40,
                      height: 46,
                      border: "2px solid #e5e7eb",
                      borderRadius: 8,
                      background: "white",
                      cursor: "pointer",
                      fontSize: 20,
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6b7280",
                      flexShrink: 0,
                      userSelect: "none",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f3f4f6";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 高さ */}
              <div style={{ 
                marginBottom: 0,
                display: isMobile ? "grid" : "block",
                gridTemplateColumns: isMobile ? "70px 1fr" : "auto",
                gap: isMobile ? "8px" : "0",
                alignItems: isMobile ? "center" : "flex-start",
                background: isMobile ? "linear-gradient(to right, rgba(34, 197, 94, 0.03), rgba(134, 239, 172, 0.03))" : "transparent",
                padding: isMobile ? "10px" : "0",
                borderRadius: isMobile ? 8 : 0,
                border: isMobile ? "1px solid rgba(34, 197, 94, 0.1)" : "none",
              }}>
                <label style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 4 : 0,
                  marginBottom: isMobile ? 0 : 6, 
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: "#374151",
                  userSelect: "none",
                }}>
                  {isMobile && "↕️"}
                  <span>高さ</span>
                </label>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    onClick={() => setEditingObject({ ...editingObject, h: Math.max(1, (editingObject.h || 1) - 1) })}
                    style={{
                      width: 40,
                      height: 46,
                      border: "2px solid #e5e7eb",
                      borderRadius: 8,
                      background: "white",
                      cursor: "pointer",
                      fontSize: 20,
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6b7280",
                      flexShrink: 0,
                      userSelect: "none",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f3f4f6";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editingObject.h || 1}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setEditingObject({ ...editingObject, h: Math.max(1, val === '' ? 1 : Number(val)) });
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 8px",
                      border: "2px solid #e5e7eb",
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: "border-box",
                      backgroundColor: "white",
                      color: "#1f2937",
                      outline: "none",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  />
                  <button
                    onClick={() => setEditingObject({ ...editingObject, h: (editingObject.h || 1) + 1 })}
                    style={{
                      width: 40,
                      height: 46,
                      border: "2px solid #e5e7eb",
                      borderRadius: 8,
                      background: "white",
                      cursor: "pointer",
                      fontSize: 20,
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6b7280",
                      flexShrink: 0,
                      userSelect: "none",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f3f4f6";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            )}

            {/* 位置・サイズセクション（アコーディオン）- ベースマップのみ */}
            {currentMap?.isBase && (
            <div style={{ marginBottom: isMobile ? 8 : 12 }}>
              <button
                onClick={() => setIsPositionSizeExpanded(!isPositionSizeExpanded)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "#f9fafb",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  userSelect: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <span>溶鉱炉/アニメーション/位置/サイズ設定</span>
                <span style={{ fontSize: 12, transition: "transform 0.2s", transform: isPositionSizeExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              
              {isPositionSizeExpanded && (
                <div style={{ marginTop: 12 }}>
                  {/* 溶鉱炉Lv (Fire) */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                      溶鉱炉Lv
                    </label>
                    <select
                      value={editingObject.Fire || ""}
                      onChange={(e) => setEditingObject({ ...editingObject, Fire: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "2px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 14,
                        boxSizing: "border-box",
                        backgroundColor: "white",
                        color: "#1f2937",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">選択してください</option>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={String(num)}>{num}</option>
                      ))}
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                        <option key={`FC${num}`} value={`FC${num}`}>FC{num}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Animation */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                      アニメーション
                    </label>
                    <select
                      value={editingObject.Animation || ""}
                      onChange={(e) => setEditingObject({ ...editingObject, Animation: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "2px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 14,
                        boxSizing: "border-box",
                        backgroundColor: "white",
                        color: "#1f2937",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">なし</option>
                      <option value="random">🎲 ランダム</option>
                      <option value="fireworks">🎆 花火</option>
                      <option value="sparkle">✨ キラキラ</option>
                      <option value="beartrap">🐻 熊罠</option>
                      <option value="birthday">🎂 誕生日じゃないけど</option>
                      <option value="cherryblossom">🌸 花吹雪</option>
                      <option value="meteor">☄️ 隕石</option>
                      <option value="coin">💰 コイン</option>
                      <option value="slot">🎰 スロット</option>
                      <option value="fishquiz">🐟 魚クイズ</option>
                      <option value="yojijukugo">🔤 四字熟語クイズ</option>
                      <option value="englishquiz">📖 英単語クイズ</option>
                      <option value="cat">🐱 猫</option>
                      <option value="balloon">🎈 バルーン</option>
                      <option value="aurora">💫 オーロラ</option>
                      <option value="butterfly">🦋 蝶々</option>
                      <option value="shootingstar">🌟 流れ星</option>
                      <option value="autumnleaves">🍂 紅葉</option>
                      <option value="snow">❄️ 雪</option>
                      <option value="confetti">🎊 紙吹雪</option>
                      <option value="rainbow">🌈 虹</option>
                      <option value="rain">💧 雨</option>
                      <option value="magiccircle">🎭 魔法陣</option>
                      <option value="flame">🔥 炎</option>
                      <option value="thunder">⚡ 雷</option>
                      <option value="wave">🌊 波</option>
                      <option value="wind">🍃 風</option>
                      <option value="smoke">💨 煙</option>
                      <option value="tornado">🌪️ 竜巻</option>
                      <option value="gem">💎 宝石</option>
                      <option value="startrail">⭐ 星の軌跡</option>
                      <option value="lightparticle">✨ 光の粒</option>
                      <option value="spiral">💫 スパイラル</option>
                      <option value="bird">🦅 鳥</option>
                      <option value="ghost">👻 ゴースト</option>
                      <option value="bee">🐝 蜂</option>
                      <option value="firefly">🦋 蛍</option>
                      <option value="explosion">💥 爆発</option>
                      <option value="target">🎯 ターゲット</option>
                      <option value="anger">💢 怒り</option>
                      <option value="petal">🌺 花びら</option>
                      <option value="sunflower">🌻 ひまわり</option>
                      <option value="rose">🌹 バラ</option>
                    </select>
                  </div>
                  
                  {/* X座標 */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                      X座標
                    </label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => setEditingObject({ ...editingObject, x: Math.max(0, (editingObject.x || 0) - 1) })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={editingObject.x || 0}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setEditingObject({ ...editingObject, x: val === '' ? 0 : Number(val) });
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 8px",
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 16,
                          boxSizing: "border-box",
                          backgroundColor: "white",
                          color: "#1f2937",
                          outline: "none",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      />
                      <button
                        onClick={() => setEditingObject({ ...editingObject, x: (editingObject.x || 0) + 1 })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Y座標 */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                      Y座標
                    </label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => setEditingObject({ ...editingObject, y: Math.max(0, (editingObject.y || 0) - 1) })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={editingObject.y || 0}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setEditingObject({ ...editingObject, y: val === '' ? 0 : Number(val) });
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 8px",
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 16,
                          boxSizing: "border-box",
                          backgroundColor: "white",
                          color: "#1f2937",
                          outline: "none",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      />
                      <button
                        onClick={() => setEditingObject({ ...editingObject, y: (editingObject.y || 0) + 1 })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* 幅 */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                      幅
                    </label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => setEditingObject({ ...editingObject, w: Math.max(1, (editingObject.w || 1) - 1) })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={editingObject.w || 1}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setEditingObject({ ...editingObject, w: Math.max(1, val === '' ? 1 : Number(val)) });
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 8px",
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 16,
                          boxSizing: "border-box",
                          backgroundColor: "white",
                          color: "#1f2937",
                          outline: "none",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      />
                      <button
                        onClick={() => setEditingObject({ ...editingObject, w: (editingObject.w || 1) + 1 })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* 高さ */}
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                      高さ
                    </label>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => setEditingObject({ ...editingObject, h: Math.max(1, (editingObject.h || 1) - 1) })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={editingObject.h || 1}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setEditingObject({ ...editingObject, h: Math.max(1, val === '' ? 1 : Number(val)) });
                        }}
                        style={{
                          flex: 1,
                          padding: "12px 8px",
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 16,
                          boxSizing: "border-box",
                          backgroundColor: "white",
                          color: "#1f2937",
                          outline: "none",
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      />
                      <button
                        onClick={() => setEditingObject({ ...editingObject, h: (editingObject.h || 1) + 1 })}
                        style={{
                          width: 40,
                          height: 46,
                          border: "2px solid #e5e7eb",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 20,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6b7280",
                          flexShrink: 0,
                          userSelect: "none",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3f4f6";
                          e.currentTarget.style.borderColor = "#d1d5db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* お気に入り - ベースマップのみ */}
            {currentMap?.isBase && (
            <div style={{ 
              marginBottom: isMobile ? 10 : 16, 
              padding: isMobile ? "10px" : "14px", 
              background: "#fef3c7", 
              borderRadius: 8,
              border: "2px solid #fbbf24",
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={editingObject.isFavorite || false}
                  onChange={(e) => setEditingObject({ ...editingObject, isFavorite: e.target.checked })}
                  style={{
                    width: 20,
                    height: 20,
                    cursor: "pointer",
                    accentColor: "#f59e0b",
                  }}
                />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#92400e", userSelect: "none" }}>
                  お気に入り（注目マーク）
                </span>
              </label>
              <p style={{ margin: "8px 0 0 30px", fontSize: 12, color: "#78350f", lineHeight: 1.5, userSelect: "none" }}>
                チェックするとマップ上でピンク系の柔らかいぼかしで目立つように表示されます
              </p>
            </div>
            )}

            {/* メモ欄 - ベースマップのみ */}
            {currentMap?.isBase && (
            <div style={{ 
              marginBottom: isMobile ? 10 : 16,
              display: isMobile ? "block" : "block",
            }}>
              <label style={{ 
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 8, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                <span>メモ</span>
                <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, userSelect: "none" }}>（選択時に吹き出しで表示されます）</span>
              </label>
              <textarea
                value={editingObject.note || ""}
                onChange={(e) => setEditingObject({ ...editingObject, note: e.target.value })}
                placeholder="このオブジェクトについてのメモを入力してください..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box",
                  backgroundColor: "white",
                  color: "#1f2937",
                  minHeight: "80px",
                  resize: "vertical",
                  fontFamily: "system-ui",
                  lineHeight: 1.5,
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            )}

            {/* メインアクションボタン */}
            <div style={{ 
              display: "flex", 
              gap: 10,
              paddingTop: 8, 
              borderTop: "1px solid #e5e7eb" 
            }}>
              {/* PC版：削除ボタンを左側に小さく配置 */}
              {!isMobile && (
                <button
                  onClick={() => {
                    if (confirm("本当に削除しますか？")) {
                      setObjects((prev) => prev.filter((o) => o.id !== editingObject.id));
                      setEditingObject(null);
                      setOriginalEditingId(null);
                      setSelectedId(null);
                      setHasUnsavedChanges(true);
                      window.scrollTo(0, 0);
                    }
                  }}
                  style={{
                    padding: "9px 14px",
                    background: "white",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    minWidth: "auto",
                    transition: "all 0.2s",
                    opacity: 0.7,
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.borderColor = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.7";
                    e.currentTarget.style.borderColor = "#fca5a5";
                  }}
                >
                  🗑️
                </button>
              )}
              <div style={{ flex: 1 }} />
              
              {/* キャンセルと更新ボタン */}
              <div style={{ 
                display: "flex", 
                gap: 10,
                width: isMobile ? "100%" : "auto",
              }}>
                <button
                  onClick={() => {
                    setEditingObject(null);
                    setOriginalEditingId(null);
                    window.scrollTo(0, 0);
                  }}
                  style={{
                    padding: isMobile ? "13px 0" : "11px 24px",
                    border: "2px solid #d1d5db",
                    borderRadius: 8,
                    background: "white",
                    color: "#374151",
                    cursor: "pointer",
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    flex: isMobile ? 1 : "0 0 auto",
                    minWidth: isMobile ? 0 : "auto",
                    transition: "all 0.2s",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  {isMobile ? "閉じる" : "キャンセル"}
                </button>
                <button
                  onClick={() => {
                    // 必須入力チェック
                    if (!editingObject.label || editingObject.label.trim() === "") {
                      alert("名前を入力してください");
                      return;
                    }
                    if (!editingObject.type) {
                      alert("タイプを選択してください");
                      return;
                    }
                    const idStr = editingObject.id != null ? String(editingObject.id).trim() : "";
                    if (!idStr) {
                      alert("IDを入力してください");
                      return;
                    }
                    
                    // ID重複チェック
                    const isDuplicate = objects.some(o => String(o.id) === idStr && String(o.id) !== originalEditingId);
                    if (isDuplicate) {
                      alert("このIDは既に使用されています。別のIDを入力してください。");
                      return;
                    }
                    
                    // グリッドスナップを適用し、全角ハイフンを半角に変換
                    const snappedObject = {
                      ...editingObject,
                      id: idStr,  // IDを文字列として明示的に設定
                      label: (editingObject.label || '').replace(/ー/g, '-'),  // 全角ハイフンを半角に変換
                      x: Math.round(num(editingObject.x, 0)),
                      y: Math.round(num(editingObject.y, 0)),
                      w: Math.max(1, Math.round(num(editingObject.w, 1))),
                      h: Math.max(1, Math.round(num(editingObject.h, 1))),
                    };
                    
                    // IDが変更されている場合、selectedIdも更新
                    if (originalEditingId && originalEditingId !== idStr) {
                      setSelectedId(idStr);
                    }
                    
                    setObjects((prev) =>
                      prev.map((o) => (o.id === originalEditingId ? snappedObject : o))
                    );
                    setEditingObject(null);
                    setOriginalEditingId(null);
                    setHasUnsavedChanges(true);
                    window.scrollTo(0, 0);
                  }}
                  style={{
                    padding: isMobile ? "13px 0" : "11px 28px",
                    background: "#2563eb",
                    color: "white",
                    border: "2px solid #2563eb",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: isMobile ? 15 : 14,
                    fontWeight: 600,
                    flex: isMobile ? 1 : "0 0 auto",
                    minWidth: isMobile ? 0 : "auto",
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                    transition: "all 0.2s",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1d4ed8";
                    e.currentTarget.style.borderColor = "#1d4ed8";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#2563eb";
                    e.currentTarget.style.borderColor = "#2563eb";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.3)";
                  }}
                >
                  {isMobile ? "✓ 更新" : "更新"}
                </button>
              </div>
            </div>
            
            {/* スマホ版：削除ボタンを小さく控えめに下部に配置 */}
            {isMobile && (
              <div style={{ 
                paddingTop: 12,
                textAlign: "center",
              }}>
                <button
                  onClick={() => {
                    if (confirm("⚠️ 本当に削除しますか？\n\nこの操作は取り消せません。")) {
                      setObjects((prev) => prev.filter((o) => o.id !== editingObject.id));
                      setEditingObject(null);
                      setOriginalEditingId(null);
                      setSelectedId(null);
                      setHasUnsavedChanges(true);
                      window.scrollTo(0, 0);
                    }
                  }}
                  style={{
                    padding: "8px 20px",
                    background: "transparent",
                    color: "#9ca3af",
                    border: "1px dashed #d1d5db",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    transition: "all 0.2s",
                    userSelect: "none",
                  }}
                >
                  🗑️ このオブジェクトを削除
                </button>
                
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* リンク編集/追加モーダル */}
      {(editingLink || showAddLinkModal) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "16px" : "20px",
          }}
          onClick={() => {
            setEditingLink(null);
            setShowAddLinkModal(false);
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: isMobile ? "20px" : "28px",
              maxWidth: 500,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              margin: "0 0 20px 0", 
              fontSize: isMobile ? 18 : 20, 
              fontWeight: 700,
              color: "#1f2937",
              userSelect: "none",
            }}>
              {editingLink ? "リンク編集" : "リンク追加"}
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                表示名（絵文字含む）
              </label>
              <input
                type="text"
                value={editingLink?.name || ""}
                onChange={(e) => {
                  if (editingLink) {
                    setEditingLink({ ...editingLink, name: e.target.value });
                  }
                }}
                placeholder="例: 🎁 交換センター"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151", userSelect: "none" }}>
                URL
              </label>
              <input
                type="url"
                value={editingLink?.url || ""}
                onChange={(e) => {
                  if (editingLink) {
                    setEditingLink({ ...editingLink, url: e.target.value });
                  }
                }}
                placeholder="https://example.com"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {!showAddLinkModal && editingLink && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={editingLink.display}
                    onChange={(e) => {
                      setEditingLink({ ...editingLink, display: e.target.checked });
                    }}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                    メニューに表示する
                  </span>
                </label>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                onClick={() => {
                  setEditingLink(null);
                  setShowAddLinkModal(false);
                }}
                style={{
                  flex: 1,
                  padding: "11px 24px",
                  border: "2px solid #d1d5db",
                  borderRadius: 8,
                  background: "white",
                  color: "#374151",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (!editingLink?.name || !editingLink?.url) {
                    alert("表示名とURLを入力してください");
                    return;
                  }

                  if (showAddLinkModal) {
                    // 新規追加
                    const newLink = { 
                      name: editingLink.name || "", 
                      url: editingLink.url || "", 
                      order: links.length + 1,
                      display: true  // 新規追加は常に表示
                    };
                    setLinks([...links, newLink]);
                    setHasUnsavedLinksChanges(true);
                  } else if (editingLink) {
                    // 編集
                    setLinks(links.map((link, i) => 
                      i === editingLink.index 
                        ? { name: editingLink.name, url: editingLink.url, order: link.order, display: editingLink.display }
                        : link
                    ));
                    setHasUnsavedLinksChanges(true);
                  }

                  setEditingLink(null);
                  setShowAddLinkModal(false);
                  setHasUnsavedChanges(true);
                }}
                style={{
                  flex: 1,
                  padding: "11px 28px",
                  background: "#2563eb",
                  color: "white",
                  border: "2px solid #2563eb",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                {editingLink && !showAddLinkModal ? "更新" : "追加"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 背景設定モーダル */}
      {showBgConfigModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isBgSliderActive ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "16px" : "20px",
            transition: "background 0.2s ease",
          }}
          onClick={() => setShowBgConfigModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: isMobile ? "20px" : "28px",
              maxWidth: 500,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              opacity: isBgSliderActive ? 0.15 : 1,
              transition: "opacity 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              margin: "0 0 20px 0", 
              fontSize: isMobile ? 20 : 22, 
              fontWeight: 600,
              color: "#1f2937",
              userSelect: "none",
            }}>
              🖼️ 背景画像設定
            </h2>
            
            {/* 画像選択 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                背景画像
              </label>
              <select
                value={bgConfig.image}
                onChange={(e) => setBgConfig({...bgConfig, image: e.target.value})}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 15,
                  boxSizing: "border-box",
                  backgroundColor: "white",
                  color: "#1f2937",
                  cursor: "pointer",
                }}
              >
                <option value="map-bg.jpg">map-bg.jpg (デフォルト)</option>
                <option value="map-bg2.jpg">map-bg2.jpg</option>
                <option value="map-bg3.webp">map-bg3.webp</option>
                <option value="map-bg4.jpg">map-bg4.jpg</option>
                <option value="map-bg5.jpg">map-bg5.jpg</option>
                <option value="map-bg6.webp">map-bg6.webp</option>
              </select>
            </div>

            {/* 中心点X */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                中心点X: {bgConfig.centerX}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={bgConfig.centerX}
                onChange={(e) => setBgConfig({...bgConfig, centerX: Number(e.target.value)})}
                onPointerDown={() => setIsBgSliderActive(true)}
                onPointerUp={() => setIsBgSliderActive(false)}
                onPointerCancel={() => setIsBgSliderActive(false)}
                style={{
                  width: "100%",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* 中心点Y */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                中心点Y: {bgConfig.centerY}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={bgConfig.centerY}
                onChange={(e) => setBgConfig({...bgConfig, centerY: Number(e.target.value)})}
                onPointerDown={() => setIsBgSliderActive(true)}
                onPointerUp={() => setIsBgSliderActive(false)}
                onPointerCancel={() => setIsBgSliderActive(false)}
                style={{
                  width: "100%",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* 拡大率 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                拡大率: {bgConfig.scale.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.05"
                value={bgConfig.scale}
                onChange={(e) => setBgConfig({...bgConfig, scale: Number(e.target.value)})}
                onPointerDown={() => setIsBgSliderActive(true)}
                onPointerUp={() => setIsBgSliderActive(false)}
                onPointerCancel={() => setIsBgSliderActive(false)}
                style={{
                  width: "100%",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* 透明度 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: "block", 
                marginBottom: 8, 
                fontSize: 13, 
                fontWeight: 600, 
                color: "#374151",
                userSelect: "none",
              }}>
                透明度: {(bgConfig.opacity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgConfig.opacity}
                onChange={(e) => setBgConfig({...bgConfig, opacity: Number(e.target.value)})}
                onPointerDown={() => setIsBgSliderActive(true)}
                onPointerUp={() => setIsBgSliderActive(false)}
                onPointerCancel={() => setIsBgSliderActive(false)}
                style={{
                  width: "100%",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* ボタン */}
            <div style={{ 
              display: "flex", 
              gap: 12, 
              marginTop: 24,
            }}>
              <button
                onClick={() => setShowBgConfigModal(false)}
                style={{
                  flex: 1,
                  padding: "11px 28px",
                  background: "white",
                  color: "#6b7280",
                  border: "2px solid #d1d5db",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  // 背景設定変更を未保存としてマーク
                  setHasUnsavedChanges(true);
                  setShowBgConfigModal(false);
                  setToastMessage("💾 背景設定を変更しました。保存してください");
                }}
                style={{
                  flex: 1,
                  padding: "11px 28px",
                  background: "#8b5cf6",
                  color: "white",
                  border: "2px solid #8b5cf6",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* マイオブジェクト選択モーダル */}
      {showMyObjectSelector && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "16px" : "20px",
          }}
          onClick={() => {
            setShowMyObjectSelector(false);
            setMyObjectSearchText('');
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: isMobile ? "20px" : "28px",
              maxWidth: 600,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 右上の閉じるボタン */}
            <button
              onClick={() => {
                setShowMyObjectSelector(false);
                setMyObjectSearchText('');
              }}
              style={{
                position: "absolute",
                top: isMobile ? 12 : 16,
                right: isMobile ? 12 : 16,
                width: 32,
                height: 32,
                border: "none",
                borderRadius: 6,
                background: "#f3f4f6",
                color: "#6b7280",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: "bold",
                transition: "all 0.2s",
                userSelect: "none",
                zIndex: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e5e7eb";
                e.currentTarget.style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.color = "#6b7280";
              }}
              title="閉じる"
            >
              ✕
            </button>
            
            <h2 style={{ 
              margin: "0 0 20px 0", 
              fontSize: isMobile ? 20 : 22, 
              fontWeight: 600,
              color: "#1f2937",
              userSelect: "none",
            }}>
              📍 マイオブジェクト設定
            </h2>
            
            <p style={{
              margin: "0 0 20px 0",
              fontSize: 12,
              color: "#6b7280",
              userSelect: "none",
            }}>
              自分のオブジェクトを選択すると、マップを開いた時に自動的にそのオブジェクトが中心に表示されます。<br/>
              （設定はこの端末にのみ保存されます）
            </p>
            
            {/* 検索フィールド */}
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                placeholder="🔍 都市名で検索..."
                value={myObjectSearchText}
                onChange={(e) => setMyObjectSearchText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box",
                  outline: "none",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#5b21b6"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
              />
            </div>
            
            {/* 並び替えボタン */}
            <div style={{ 
              marginBottom: 20, 
              display: 'flex', 
              gap: 6,
              flexWrap: 'wrap'
            }}>
              {(['name', 'fire', 'birthday'] as const).map((sortType) => {
                const isActive = myObjectSortBy === sortType;
                const labels = {
                  name: '名前順',
                  fire: '溶鉱炉LV',
                  birthday: '誕生日順'
                };
                return (
                  <button
                    key={sortType}
                    onClick={() => setMyObjectSortBy(sortType)}
                    style={{
                      padding: '6px 12px',
                      background: isActive ? '#5b21b6' : '#f3f4f6',
                      color: isActive ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      userSelect: 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {labels[sortType]}
                  </button>
                );
              })}
            </div>
            
            {/* クリアボタン */}
            {myObjectId && (
              <button
                onClick={() => {
                  setMyObjectId(null);
                  try {
                    localStorage.removeItem('snw-my-object-id');
                  } catch (err) {
                    console.error('マイオブジェクトIDの削除に失敗:', err);
                  }
                  setShowMyObjectSelector(false);
                  setMyObjectSearchText('');
                }}
                style={{
                  padding: "10px 16px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 20,
                  userSelect: "none",
                }}
              >
                ✕ 設定をクリア
              </button>
            )}
            
            {/* オブジェクト一覧 */}
            {(() => {
              // カタカナ→ひらがな変換
              const toHiragana = (str: string) => {
                return str.replace(/[\u30a1-\u30f6]/g, (match) => {
                  const chr = match.charCodeAt(0) - 0x60;
                  return String.fromCharCode(chr);
                });
              };
              
              // ひらがな→カタカナ変換
              const toKatakana = (str: string) => {
                return str.replace(/[\u3041-\u3096]/g, (match) => {
                  const chr = match.charCodeAt(0) + 0x60;
                  return String.fromCharCode(chr);
                });
              };
              
              // ローマ字→ひらがな簡易変換（主要なパターンのみ）
              const romajiToHiragana = (str: string) => {
                const map: Record<string, string> = {
                  'kya': 'きゃ', 'kyu': 'きゅ', 'kyo': 'きょ',
                  'sha': 'しゃ', 'shu': 'しゅ', 'sho': 'しょ',
                  'cha': 'ちゃ', 'chu': 'ちゅ', 'cho': 'ちょ',
                  'nya': 'にゃ', 'nyu': 'にゅ', 'nyo': 'にょ',
                  'hya': 'ひゃ', 'hyu': 'ひゅ', 'hyo': 'ひょ',
                  'mya': 'みゃ', 'myu': 'みゅ', 'myo': 'みょ',
                  'rya': 'りゃ', 'ryu': 'りゅ', 'ryo': 'りょ',
                  'gya': 'ぎゃ', 'gyu': 'ぎゅ', 'gyo': 'ぎょ',
                  'ja': 'じゃ', 'ju': 'じゅ', 'jo': 'じょ',
                  'bya': 'びゃ', 'byu': 'びゅ', 'byo': 'びょ',
                  'pya': 'ぴゃ', 'pyu': 'ぴゅ', 'pyo': 'ぴょ',
                  'ka': 'か', 'ki': 'き', 'ku': 'く', 'ke': 'け', 'ko': 'こ',
                  'sa': 'さ', 'shi': 'し', 'su': 'す', 'se': 'せ', 'so': 'そ',
                  'ta': 'た', 'chi': 'ち', 'tsu': 'つ', 'te': 'て', 'to': 'と',
                  'na': 'な', 'ni': 'に', 'nu': 'ぬ', 'ne': 'ね', 'no': 'の',
                  'ha': 'は', 'hi': 'ひ', 'fu': 'ふ', 'he': 'へ', 'ho': 'ほ',
                  'ma': 'ま', 'mi': 'み', 'mu': 'む', 'me': 'め', 'mo': 'も',
                  'ya': 'や', 'yu': 'ゆ', 'yo': 'よ',
                  'ra': 'ら', 'ri': 'り', 'ru': 'る', 're': 'れ', 'ro': 'ろ',
                  'wa': 'わ', 'wo': 'を', 'nn': 'ん', 'n': 'ん',
                  'ga': 'が', 'gi': 'ぎ', 'gu': 'ぐ', 'ge': 'げ', 'go': 'ご',
                  'za': 'ざ', 'ji': 'じ', 'zu': 'ず', 'ze': 'ぜ', 'zo': 'ぞ',
                  'da': 'だ', 'di': 'ぢ', 'du': 'づ', 'de': 'で', 'do': 'ど',
                  'ba': 'ば', 'bi': 'び', 'bu': 'ぶ', 'be': 'べ', 'bo': 'ぼ',
                  'pa': 'ぱ', 'pi': 'ぴ', 'pu': 'ぷ', 'pe': 'ぺ', 'po': 'ぽ',
                  'a': 'あ', 'i': 'い', 'u': 'う', 'e': 'え', 'o': 'お',
                };
                
                let result = str.toLowerCase();
                // 長いパターンから順に変換
                const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);
                for (const key of sortedKeys) {
                  result = result.split(key).join(map[key]);
                }
                return result;
              };
              
              // 柔軟な検索マッチング
              const flexibleMatch = (label: string, searchText: string) => {
                if (!searchText) return true;
                
                const labelLower = label.toLowerCase();
                const searchLower = searchText.toLowerCase();
                
                // 1. 直接マッチ
                if (labelLower.includes(searchLower)) return true;
                
                // 2. ひらがな化してマッチ
                const labelHiragana = toHiragana(label);
                const searchHiragana = toHiragana(searchText);
                if (labelHiragana.includes(searchHiragana)) return true;
                
                // 3. カタカナ化してマッチ
                const labelKatakana = toKatakana(label);
                const searchKatakana = toKatakana(searchText);
                if (labelKatakana.includes(searchKatakana)) return true;
                
                // 4. ローマ字→ひらがな変換してマッチ
                const searchFromRomaji = romajiToHiragana(searchText);
                if (labelHiragana.includes(searchFromRomaji)) return true;
                if (toKatakana(labelHiragana).includes(toKatakana(searchFromRomaji))) return true;
                
                return false;
              };
              
              const cityObjects = objects.filter(obj => obj.id && obj.label && obj.type === 'CITY');
              const filteredCities = cityObjects.filter(obj => 
                flexibleMatch(obj.label || '', myObjectSearchText)
              ).sort((a, b) => {
                try {
                  // ソート処理
                  if (myObjectSortBy === 'name') {
                    return (a.label || '').localeCompare(b.label || '', 'ja');
                  } else if (myObjectSortBy === 'fire') {
                    // 溶鉱炉LVでソート（FC優先、数字降順）
                    const parseFireLevel = (fire?: string | number) => {
                      if (fire === undefined || fire === null) return { hasFC: false, level: 0 };
                      const fireStr = String(fire);
                      const hasFC = fireStr.toUpperCase().includes('FC');
                      const levelMatch = fireStr.match(/(\d+)/);
                      const level = levelMatch ? parseInt(levelMatch[1], 10) : 0;
                      return { hasFC, level };
                    };
                    const aFire = parseFireLevel(a.Fire);
                    const bFire = parseFireLevel(b.Fire);
                    // FC持ちを優先
                    if (aFire.hasFC !== bFire.hasFC) return aFire.hasFC ? -1 : 1;
                    // レベル降順
                    if (aFire.level !== bFire.level) return bFire.level - aFire.level;
                    // 同じレベルなら名前順
                    return (a.label || '').localeCompare(b.label || '', 'ja');
                  } else if (myObjectSortBy === 'birthday') {
                    // 誕生日でソート（月→日の順）
                    const parseBirthday = (bd?: string) => {
                      if (!bd) return { month: 99, day: 99 };
                      const monthMatch = bd.match(/(\d+)月/);
                      const dayMatch = bd.match(/(\d+)日/);
                      return {
                        month: monthMatch ? parseInt(monthMatch[1], 10) : 99,
                        day: dayMatch ? parseInt(dayMatch[1], 10) : 99
                      };
                    };
                    const aBd = parseBirthday(a.birthday);
                    const bBd = parseBirthday(b.birthday);
                    if (aBd.month !== bBd.month) return aBd.month - bBd.month;
                    if (aBd.day !== bBd.day) return aBd.day - bBd.day;
                    // 同じ誕生日なら名前順
                    return (a.label || '').localeCompare(b.label || '', 'ja');
                  }
                  return 0;
                } catch (err) {
                  console.error('Sort error:', err);
                  return 0;
                }
              });
              
              return (
                <>
                  <div style={{
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{
                      fontSize: 13,
                      color: "#6b7280",
                      fontWeight: 600,
                      userSelect: "none",
                    }}>
                      都市数: {filteredCities.length} / {cityObjects.length}
                    </div>
                    <button
                      onClick={() => setShowFireLevelStats(true)}
                      style={{
                        padding: '5px 20px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        userSelect: 'none',
                        minWidth: 70,
                      }}
                    >
                      集計
                    </button>
                  </div>
                  
                  <div style={{
                    maxHeight: "50vh",
                    overflowY: "auto",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                  }}>
                    {filteredCities.length === 0 ? (
                      <div style={{
                        padding: "40px 20px",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: 14,
                      }}>
                        該当する都市が見つかりません
                      </div>
                    ) : (
                      filteredCities.map((obj, index) => {
                const isSelected = myObjectId === obj.id;
                return (
                  <div
                    key={obj.id || index}
                    onClick={() => {
                      const newId = obj.id || null;
                      setMyObjectId(newId);
                      try {
                        if (newId) {
                          localStorage.setItem('snw-my-object-id', newId);
                          
                          // カメラを選択したオブジェクトに即座に移動
                          const cols = meta.cols ?? 60;
                          const rows = meta.rows ?? 40;
                          const cell = meta.cellSize ?? 24;
                          const targetScale = window.innerWidth <= 768 ? 0.78 : 1.0;
                          
                          const cx = (cols * cell) / 2;
                          const cy = (rows * cell) / 2;
                          const targetX = (obj.x ?? 0) * cell;
                          const targetY = (obj.y ?? 0) * cell;
                          const offsetX = targetX - cx;
                          const offsetY = targetY - cy;
                          
                          const angle = -Math.PI / 4;
                          const cos = Math.cos(angle);
                          const sin = Math.sin(angle);
                          const rotatedX = offsetX * cos - offsetY * sin;
                          const rotatedY = offsetX * sin + offsetY * cos;
                          
                          const tx = -rotatedX * targetScale;
                          const ty = -rotatedY * targetScale;
                          
                          setCam({ tx, ty, scale: targetScale });
                        } else {
                          localStorage.removeItem('snw-my-object-id');
                        }
                      } catch (err) {
                        console.error('マイオブジェクトIDの保存に失敗:', err);
                      }
                      setShowMyObjectSelector(false);
                      setMyObjectSearchText('');
                    }}
                    style={{
                      padding: "12px 16px",
                      borderBottom: index < filteredCities.length - 1 ? "1px solid #e5e7eb" : "none",
                      cursor: "pointer",
                      background: isSelected ? "#dbeafe" : "white",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "white";
                    }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `2px solid ${isSelected ? "#2563eb" : "#d1d5db"}`,
                      background: isSelected ? "#2563eb" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {isSelected && (
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "white",
                        }}/>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 15 }}>
                        {obj.label}
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2, display: 'flex', gap: 6 }}>
                        <span style={{ display: 'inline-block', width: 95 }}>
                          {obj.id && obj.id.length >= 10 ? obj.id.substring(0, 10) + '...' : obj.id}
                        </span>
                        <span>|</span>
                        <span style={{ display: 'inline-block', width: 50 }}>
                          {(() => {
                            const fireValue = obj.Fire !== undefined && obj.Fire !== null ? String(obj.Fire) : '0';
                            // FC付きはそのまま表示
                            if (fireValue.toUpperCase().includes('FC')) {
                              return fireValue;
                            }
                            // 数字のみの場合はLvを付ける
                            return `Lv${fireValue}`;
                          })()}
                        </span>
                        <span>|</span>
                        <span>
                          {obj.birthday || '未設定'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
                    )}
                  </div>
                </>
              );
            })()}
            
            {/* 閉じるボタン */}
            <button
              onClick={() => {
                setShowMyObjectSelector(false);
                setMyObjectSearchText(''); // 検索テキストをリセット
              }}
              style={{
                width: "100%",
                padding: "11px 28px",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                marginTop: 20,
                userSelect: "none",
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 溶鉱炉レベル集計モーダル */}
      {showFireLevelStats && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10001,
          padding: 20,
        }}>
          <div style={{
            background: "white",
            borderRadius: 16,
            padding: isMobile ? 20 : 30,
            maxWidth: 450,
            width: "100%",
            maxHeight: "80vh",
            overflowY: "auto",
            position: "relative",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <button
              onClick={() => setShowFireLevelStats(false)}
              style={{
                position: "absolute",
                top: 15,
                right: 15,
                background: "transparent",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#9ca3af",
                padding: 5,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
            
            <h2 style={{ 
              margin: "0 0 20px 0", 
              fontSize: isMobile ? 20 : 22, 
              fontWeight: 600,
              color: "#1f2937",
              userSelect: "none",
            }}>
              集計
            </h2>
            
            {(() => {
              const cityObjects = objects.filter(obj => obj.id && obj.label && obj.type === 'CITY');
              const stats: { [key: string]: number } = {};
              
              cityObjects.forEach(obj => {
                const fireValue = obj.Fire !== undefined && obj.Fire !== null ? String(obj.Fire).trim() : '0';
                stats[fireValue] = (stats[fireValue] || 0) + 1;
              });
              
              // FC10からFC1
              const fcLevels = [];
              for (let i = 10; i >= 1; i--) {
                const key = `FC${i}`;
                if (stats[key]) {
                  fcLevels.push({ label: key, count: stats[key], isFC: true, level: i });
                }
              }
              
              // Lv30からLv21
              const highLevels = [];
              for (let i = 30; i >= 21; i--) {
                const count = stats[String(i)] || 0;
                if (count > 0) {
                  highLevels.push({ label: `Lv${i}`, count, isFC: false, level: i });
                }
              }
              
              // Lv20以下をまとめる
              let low20Count = 0;
              for (let i = 1; i <= 20; i++) {
                low20Count += stats[String(i)] || 0;
              }
              
              const allStats = [...fcLevels, ...highLevels];
              if (low20Count > 0) {
                allStats.push({ label: 'Lv20以下', count: low20Count, isFC: false, level: 0 });
              }
              
              const basePath = process.env.NODE_ENV === 'production' ? '/SNW_Home' : '';
              
              return (
                <div style={{ marginBottom: 20 }}>
                  {allStats.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderBottom: index < allStats.length - 1 ? '1px solid #e5e7eb' : 'none',
                        gap: 12,
                      }}
                    >
                      <div style={{
                        width: 80,
                        fontWeight: 600,
                        color: '#1f2937',
                        fontSize: 15,
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {item.isFC ? (
                          <img 
                            src={`${basePath}/fire-levels/FC${item.level}.webp`}
                            alt={`FC${item.level}`}
                            style={{
                              width: 22,
                              height: 22,
                              opacity: 0.9,
                            }}
                          />
                        ) : item.level > 0 ? (
                          <svg width="18" height="18" viewBox="0 0 18 18">
                            <circle cx="9" cy="9" r="9" fill="#ffffff" />
                            <circle cx="9" cy="9" r="8" fill="#4169E1" />
                            <text
                              x="9"
                              y="9"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#ffffff"
                              fontSize={item.level >= 10 ? "9" : "11"}
                              fontWeight="bold"
                              fontFamily="system-ui"
                            >
                              {item.level}
                            </text>
                          </svg>
                        ) : (
                          <div style={{
                            width: 18,
                            height: 18,
                            background: '#4169E1',
                            borderRadius: '50%',
                            border: '1.5px solid #ffffff',
                          }} />
                        )}
                      </div>
                      <div style={{
                        flex: 1,
                        textAlign: 'right',
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#5b21b6',
                      }}>
                        {item.count}
                      </div>
                    </div>
                  ))}
                  
                  <div style={{
                    marginTop: 20,
                    padding: '12px',
                    background: '#f3f4f6',
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#1f2937',
                    }}>
                      合計
                    </div>
                    <div style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: '#5b21b6',
                    }}>
                      {cityObjects.length}
                    </div>
                  </div>
                </div>
              );
            })()}
            
            <button
              onClick={() => setShowFireLevelStats(false)}
              style={{
                width: "100%",
                padding: "11px 28px",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                userSelect: "none",
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 魚クイズモーダル */}
      {fishQuiz && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => {
            if (fishQuiz.state === 'correct' || fishQuiz.state === 'wrong') {
              setFishQuiz(null);
            }
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "600px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {fishQuiz.state === 'showing' && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => {
                    // 問題に答える前に閉じた場合は掛け金を返金
                    const refundTotal = totalCoins + 10;
                    setTotalCoins(refundTotal);
                    localStorage.setItem('totalCoins', refundTotal.toString());
                    setFishQuiz(null);
                  }}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "40px",
                    cursor: "pointer",
                    color: "#999",
                    lineHeight: "1",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#333"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#999"; }}
                >
                  ×
                </button>
                <div style={{
                  fontSize: "100px",
                  marginBottom: "20px",
                  animation: "pulse 0.8s ease-in-out",
                }}>
                  🐟
                </div>
                <h2 style={{ fontSize: "24px", color: "#333" }}>
                  問題を準備中...
                </h2>
              </div>
            )}

            {fishQuiz.state === 'answering' && (
              <div>
                <button
                  onClick={() => {
                    // 問題に答える前に閉じた場合は掛け金を返金
                    const refundTotal = totalCoins + 10;
                    setTotalCoins(refundTotal);
                    localStorage.setItem('totalCoins', refundTotal.toString());
                    setFishQuiz(null);
                  }}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "40px",
                    cursor: "pointer",
                    color: "#999",
                    lineHeight: "1",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#333"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#999"; }}
                >
                  ×
                </button>
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                  <div style={{
                    fontSize: "120px",
                    fontWeight: "bold",
                    color: "#333",
                    marginBottom: "15px",
                  }}>
                    {fishQuiz.question.kanji}
                  </div>
                  <p style={{ fontSize: "20px", color: "#666", marginBottom: "10px" }}>
                    この漢字の読み方は？
                  </p>
                  {fishQuizConsecutiveCorrect > 0 && (
                    <div style={{
                      background: "#f0fdf4",
                      padding: "10px",
                      borderRadius: "8px",
                      marginTop: "10px",
                    }}>
                      <div style={{ fontSize: "14px", color: "#37b24d", fontWeight: "bold" }}>
                        🔥 連続正解中: {fishQuizConsecutiveCorrect}回
                      </div>
                      <div style={{ fontSize: "13px", color: "#666", marginTop: "3px" }}>
                        次回ボーナス: ×{Math.min(fishQuizConsecutiveCorrect + 1, 1000)}倍 ({Math.min(fishQuizConsecutiveCorrect + 1, 1000) * 10}コイン)
                      </div>
                    </div>
                  )}
                  {fishQuizConsecutiveCorrect === 0 && (
                    <div style={{ fontSize: "14px", color: "#999", marginTop: "5px" }}>
                      正解で ×1倍 (10コイン)！
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  {fishQuiz.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const isCorrect = choice === fishQuiz.question.correct;
                        
                        if (isCorrect) {
                          // 正解：掛け金×倍率（上限1000倍）
                          const newConsecutive = fishQuizConsecutiveCorrect + 1;
                          const multiplier = Math.min(newConsecutive, 1000);
                          const reward = 10 * multiplier;
                          setFishQuizConsecutiveCorrect(newConsecutive);
                          
                          const newTotal = totalCoins + reward;
                          setTotalCoins(newTotal);
                          localStorage.setItem('totalCoins', newTotal.toString());

                          // localStorageに問題IDを記録
                          const asked = new Set(JSON.parse(localStorage.getItem("fishQuizAsked") || "[]"));
                          asked.add(fishQuiz.question.id);
                          localStorage.setItem("fishQuizAsked", JSON.stringify([...asked]));

                          const wrong = new Set(JSON.parse(localStorage.getItem("fishQuizWrong") || "[]"));
                          wrong.delete(fishQuiz.question.id);
                          localStorage.setItem("fishQuizWrong", JSON.stringify([...wrong]));
                          
                          setFishQuiz({
                            ...fishQuiz,
                            selectedAnswer: choice,
                            state: 'correct',
                            reward: reward,
                            consecutiveCount: newConsecutive,
                          });
                        } else {
                          // 不正解：連続正解数をリセット
                          setFishQuizConsecutiveCorrect(0);

                          // 間違えた問題をlocalStorageに記録
                          const wrong = new Set(JSON.parse(localStorage.getItem("fishQuizWrong") || "[]"));
                          wrong.add(fishQuiz.question.id);
                          localStorage.setItem("fishQuizWrong", JSON.stringify([...wrong]));
                          
                          setFishQuiz({
                            ...fishQuiz,
                            selectedAnswer: choice,
                            state: 'wrong',
                            reward: 0,
                            consecutiveCount: 0,
                          });
                        }
                      }}
                      style={{
                        padding: "20px",
                        fontSize: "28px",
                        fontWeight: "bold",
                        background: "#f8f9fa",
                        border: "3px solid #ddd",
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {fishQuiz.state === 'correct' && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setFishQuiz(null)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "40px",
                    cursor: "pointer",
                    color: "#999",
                    lineHeight: "1",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#333"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#999"; }}
                >
                  ×
                </button>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#37b24d",
                  marginBottom: "20px",
                  animation: "bounce 0.5s",
                }}>
                  🎉 正解！ 🎉
                </div>
                <p style={{ fontSize: "18px", color: "#666", marginBottom: "10px" }}>
                  「{fishQuiz.question.kanji}」は「{fishQuiz.question.correct}」です
                </p>
                <div style={{
                  background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                  padding: "15px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                }}>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#37b24d", marginBottom: "5px" }}>
                    💰 +{fishQuiz.reward} コイン獲得！
                  </div>
                  {fishQuiz.consecutiveCount > 0 && (
                    <div style={{ fontSize: "16px", color: "#666" }}>
                      連続正解 {fishQuiz.consecutiveCount} 回！
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setFishQuiz(null);
                    setTimeout(() => {
                      const canvas = canvasRef.current;
                      if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        startFishQuizAnimation(rect.width / 2, rect.height / 2);
                      }
                    }, 100);
                  }}
                  style={{
                    padding: "12px 40px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "50px",
                    cursor: "pointer",
                  }}
                >
                  次の問題
                </button>
              </div>
            )}

            {fishQuiz.state === 'wrong' && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setFishQuiz(null)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "40px",
                    cursor: "pointer",
                    color: "#999",
                    lineHeight: "1",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#333"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#999"; }}
                >
                  ×
                </button>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#fa5252",
                  marginBottom: "20px",
                  animation: "shake 0.5s",
                }}>
                  😢 残念！
                </div>
                <p style={{ fontSize: "18px", color: "#666", marginBottom: "10px" }}>
                  正解は「{fishQuiz.question.correct}」でした
                </p>
                {fishQuizConsecutiveCorrect > 0 && (
                  <p style={{ fontSize: "16px", color: "#fa5252", marginBottom: "15px" }}>
                    連続正解がリセットされました
                  </p>
                )}
                <button
                  onClick={() => setFishQuiz(null)}
                  style={{
                    padding: "12px 40px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "50px",
                    cursor: "pointer",
                  }}
                >
                  閉じる
                </button>
              </div>
            )}

            {fishQuiz.state === 'insufficient_coins' && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "80px",
                  marginBottom: "20px",
                }}>
                  💸
                </div>
                <div style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#fa5252",
                  marginBottom: "15px",
                }}>
                  コイン不足
                </div>
                <p style={{ fontSize: "18px", color: "#666", marginBottom: "25px" }}>
                  魚クイズには10コインが必要です
                </p>
                <button
                  onClick={() => setFishQuiz(null)}
                  style={{
                    padding: "12px 40px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "50px",
                    cursor: "pointer",
                  }}
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 英単語クイズモーダル */}
      {englishQuiz && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => {
            if (englishQuiz.state === 'correct' || englishQuiz.state === 'wrong') {
              setEnglishQuiz(null);
            }
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "600px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {englishQuiz.state === 'showing' && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => {
                    const refundTotal = totalCoins + 10;
                    setTotalCoins(refundTotal);
                    localStorage.setItem('totalCoins', refundTotal.toString());
                    setEnglishQuiz(null);
                  }}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "40px",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: "1",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                >
                  ×
                </button>
                <div style={{
                  fontSize: "80px",
                  color: "white",
                  marginBottom: "20px",
                  animation: "pulse 0.8s ease-in-out",
                }}>
                  📖
                </div>
                <h2 style={{ fontSize: "24px", color: "white" }}>
                  問題を準備中...
                </h2>
              </div>
            )}

            {englishQuiz.state === 'answering' && (
              <div>
                <button
                  onClick={() => {
                    const refundTotal = totalCoins + 10;
                    setTotalCoins(refundTotal);
                    localStorage.setItem('totalCoins', refundTotal.toString());
                    setEnglishQuiz(null);
                  }}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "40px",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: "1",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                >
                  ×
                </button>
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                  <div style={{
                    fontSize: "80px",
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: "15px",
                  }}>
                    {englishQuiz.question.word}
                  </div>
                  <p style={{ fontSize: "20px", color: "white", marginBottom: "10px" }}>
                    {englishQuiz.question.type === 'english_to_japanese'
                      ? 'この英単語の意味は？'
                      : 'この日本語を英語で？'}
                  </p>
                  {englishQuizConsecutiveCorrect > 0 && (
                    <div style={{
                      background: "rgba(255,255,255,0.2)",
                      padding: "10px",
                      borderRadius: "8px",
                      marginTop: "10px",
                    }}>
                      <div style={{ fontSize: "14px", color: "white", fontWeight: "bold" }}>
                        🔥 連続正解中: {englishQuizConsecutiveCorrect}回
                      </div>
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)", marginTop: "3px" }}>
                        次回ボーナス: ×{Math.min(englishQuizConsecutiveCorrect + 1, 1000)}倍 ({Math.min(englishQuizConsecutiveCorrect + 1, 1000) * 10}コイン)
                      </div>
                    </div>
                  )}
                  {englishQuizConsecutiveCorrect === 0 && (
                    <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", marginTop: "5px" }}>
                      正解で ×1倍 (10コイン)！
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  {englishQuiz.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const isCorrect = choice === englishQuiz.question.correct;
                        
                        if (isCorrect) {
                          const newConsecutive = englishQuizConsecutiveCorrect + 1;
                          const multiplier = Math.min(newConsecutive, 1000);
                          const reward = 10 * multiplier;
                          setEnglishQuizConsecutiveCorrect(newConsecutive);
                          
                          const newTotal = totalCoins + reward;
                          setTotalCoins(newTotal);
                          localStorage.setItem('totalCoins', newTotal.toString());

                          // localStorageに問題IDを記録
                          const asked = new Set(JSON.parse(localStorage.getItem("englishQuizAsked") || "[]"));
                          asked.add(englishQuiz.question.id);
                          localStorage.setItem("englishQuizAsked", JSON.stringify([...asked]));

                          const wrong = new Set(JSON.parse(localStorage.getItem("englishQuizWrong") || "[]"));
                          wrong.delete(englishQuiz.question.id);
                          localStorage.setItem("englishQuizWrong", JSON.stringify([...wrong]));
                          
                          setEnglishQuiz({
                            ...englishQuiz,
                            selectedAnswer: choice,
                            state: 'correct',
                            reward: reward,
                            consecutiveCount: newConsecutive,
                          });
                        } else {
                          setEnglishQuizConsecutiveCorrect(0);

                          // 間違えた問題をlocalStorageに記録
                          const wrong = new Set(JSON.parse(localStorage.getItem("englishQuizWrong") || "[]"));
                          wrong.add(englishQuiz.question.id);
                          localStorage.setItem("englishQuizWrong", JSON.stringify([...wrong]));
                          
                          setEnglishQuiz({
                            ...englishQuiz,
                            selectedAnswer: choice,
                            state: 'wrong',
                            reward: 0,
                            consecutiveCount: 0,
                          });
                        }
                      }}
                      style={{
                        padding: "20px",
                        fontSize: "28px",
                        fontWeight: "bold",
                        background: "rgba(255,255,255,0.95)",
                        border: "3px solid rgba(255,255,255,0.3)",
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        color: "#764ba2",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {englishQuiz.state === 'correct' && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setEnglishQuiz(null)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "40px",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: "1",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                >
                  ×
                </button>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "20px",
                  animation: "bounce 0.5s",
                }}>
                  🎉 正解！ 🎉
                </div>
                <p style={{ fontSize: "18px", color: "white", marginBottom: "10px" }}>
                  「{englishQuiz.question.word}」は「{englishQuiz.question.correct}」です
                </p>
                <div style={{
                  background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                  padding: "15px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                }}>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#37b24d", marginBottom: "5px" }}>
                    💰 +{englishQuiz.reward} コイン獲得！
                  </div>
                  {englishQuiz.consecutiveCount > 0 && (
                    <div style={{ fontSize: "16px", color: "#666" }}>
                      連続正解 {englishQuiz.consecutiveCount} 回！
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEnglishQuiz(null);
                    setTimeout(() => {
                      const canvas = canvasRef.current;
                      if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        startEnglishQuizAnimation(rect.width / 2, rect.height / 2);
                      }
                    }, 100);
                  }}
                  style={{
                    padding: "12px 40px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "50px",
                    cursor: "pointer",
                  }}
                >
                  次の問題
                </button>
              </div>
            )}

            {englishQuiz.state === 'wrong' && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setEnglishQuiz(null)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "40px",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: "1",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                >
                  ×
                </button>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "20px",
                  animation: "shake 0.5s",
                }}>
                  😢 残念！
                </div>
                <p style={{ fontSize: "18px", color: "white", marginBottom: "10px" }}>
                  正解は「{englishQuiz.question.correct}」でした
                </p>
                {englishQuizConsecutiveCorrect > 0 && (
                  <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.9)", marginBottom: "15px" }}>
                    連続正解がリセットされました
                  </p>
                )}
                <button
                  onClick={() => setEnglishQuiz(null)}
                  style={{
                    padding: "12px 40px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "50px",
                    cursor: "pointer",
                  }}
                >
                  閉じる
                </button>
              </div>
            )}

            {englishQuiz.state === 'insufficient_coins' && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "white", marginBottom: "20px" }}>
                  コイン不足
                </div>
                <p style={{ fontSize: "18px", color: "white", marginBottom: "25px" }}>
                  英単語クイズには10コインが必要です
                </p>
                <button
                  onClick={() => setEnglishQuiz(null)}
                  style={{
                    padding: "12px 40px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    background: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "50px",
                    cursor: "pointer",
                  }}
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 四字熟語クイズUI */}
      {yojijukugoQuiz && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => {
            if (yojijukugoQuiz.state === 'correct' || yojijukugoQuiz.state === 'wrong') {
              setYojijukugoQuiz(null);
            }
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "600px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {yojijukugoQuiz.state === 'showing' && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => {
                    const refundTotal = totalCoins + 10;
                    setTotalCoins(refundTotal);
                    localStorage.setItem('totalCoins', refundTotal.toString());
                    setYojijukugoQuiz(null);
                  }}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "40px",
                    cursor: "pointer",
                    color: "#fff",
                    lineHeight: "1",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#fdd"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#fff"; }}
                >
                  ×
                </button>
                <div style={{
                  fontSize: "100px",
                  marginBottom: "20px",
                  animation: "pulse 0.8s ease-in-out",
                }}>
                  🔤
                </div>
                <h2 style={{ fontSize: "24px", color: "#fff" }}>
                  問題を準備中...
                </h2>
              </div>
            )}

            {yojijukugoQuiz.state === 'answering' && (
              <div>
                <button
                  onClick={() => {
                    const refundTotal = totalCoins + 10;
                    setTotalCoins(refundTotal);
                    localStorage.setItem('totalCoins', refundTotal.toString());
                    setYojijukugoQuiz(null);
                  }}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "40px",
                    cursor: "pointer",
                    color: "#fff",
                    lineHeight: "1",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#fdd"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#fff"; }}
                >
                  ×
                </button>
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                  <div style={{
                    fontSize: "120px",
                    fontWeight: "bold",
                    color: "#fff",
                    marginBottom: "15px",
                  }}>
                    {yojijukugoQuiz.question.kanji}
                  </div>
                  <p style={{ fontSize: "20px", color: "#fff", marginBottom: "10px" }}>
                    この四字熟語の読み方は？
                  </p>
                  {yojijukugoQuizConsecutiveCorrect > 0 && (
                    <div style={{
                      background: "rgba(255,255,255,0.2)",
                      padding: "10px",
                      borderRadius: "8px",
                      marginTop: "10px",
                    }}>
                      <div style={{ fontSize: "14px", color: "#fff", fontWeight: "bold" }}>
                        🔥 連続正解中: {yojijukugoQuizConsecutiveCorrect}回
                      </div>
                      <div style={{ fontSize: "13px", color: "#fff", marginTop: "3px" }}>
                        次回ボーナス: ×{Math.min(yojijukugoQuizConsecutiveCorrect + 1, 1000)}倍 ({Math.min(yojijukugoQuizConsecutiveCorrect + 1, 1000) * 10}コイン)
                      </div>
                    </div>
                  )}
                  {yojijukugoQuizConsecutiveCorrect === 0 && (
                    <div style={{ fontSize: "14px", color: "#fff", marginTop: "5px" }}>
                      正解で ×1倍 (10コイン)！
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  {yojijukugoQuiz.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const isCorrect = choice === yojijukugoQuiz.question.correct;
                        
                        if (isCorrect) {
                          const newConsecutive = yojijukugoQuizConsecutiveCorrect + 1;
                          const multiplier = Math.min(newConsecutive, 1000);
                          const reward = 10 * multiplier;
                          setYojijukugoQuizConsecutiveCorrect(newConsecutive);
                          
                          const newTotal = totalCoins + reward;
                          setTotalCoins(newTotal);
                          localStorage.setItem('totalCoins', newTotal.toString());

                          // localStorageに問題IDを記録
                          const asked = new Set(JSON.parse(localStorage.getItem("yojijukugoQuizAsked") || "[]"));
                          asked.add(yojijukugoQuiz.question.id);
                          localStorage.setItem("yojijukugoQuizAsked", JSON.stringify([...asked]));

                          const wrong = new Set(JSON.parse(localStorage.getItem("yojijukugoQuizWrong") || "[]"));
                          wrong.delete(yojijukugoQuiz.question.id);
                          localStorage.setItem("yojijukugoQuizWrong", JSON.stringify([...wrong]));
                          
                          setYojijukugoQuiz({
                            ...yojijukugoQuiz,
                            selectedAnswer: choice,
                            state: 'correct',
                            reward: reward,
                            consecutiveCount: newConsecutive,
                          });
                        } else {
                          setYojijukugoQuizConsecutiveCorrect(0);

                          // 間違えた問題をlocalStorageに記録
                          const wrong = new Set(JSON.parse(localStorage.getItem("yojijukugoQuizWrong") || "[]"));
                          wrong.add(yojijukugoQuiz.question.id);
                          localStorage.setItem("yojijukugoQuizWrong", JSON.stringify([...wrong]));
                          
                          setYojijukugoQuiz({
                            ...yojijukugoQuiz,
                            selectedAnswer: choice,
                            state: 'wrong',
                            reward: 0,
                            consecutiveCount: 0,
                          });
                        }
                      }}
                      style={{
                        padding: "20px",
                        fontSize: "28px",
                        fontWeight: "bold",
                        background: "rgba(255,255,255,0.9)",
                        border: "3px solid rgba(255,255,255,0.5)",
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        color: "#333",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {yojijukugoQuiz.state === 'correct' && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setYojijukugoQuiz(null)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "40px",
                    cursor: "pointer",
                    color: "#fff",
                    lineHeight: "1",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#fdd"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#fff"; }}
                >
                  ×
                </button>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#fff",
                  marginBottom: "20px",
                  animation: "bounce 0.5s",
                }}>
                  🎉 正解！ 🎉
                </div>
                <p style={{ fontSize: "18px", color: "#fff", marginBottom: "10px" }}>
                  「{yojijukugoQuiz.question.kanji}」は「{yojijukugoQuiz.question.correct}」です
                </p>
                <div style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}>
                  <div style={{ fontSize: "15px", color: "#fff", lineHeight: "1.6" }}>
                    📚 {yojijukugoQuiz.question.meaning}
                  </div>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.3)",
                  padding: "15px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                }}>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#fff", marginBottom: "5px" }}>
                    💰 +{yojijukugoQuiz.reward} コイン獲得！
                  </div>
                  {yojijukugoQuiz.consecutiveCount > 0 && (
                    <div style={{ fontSize: "16px", color: "#fff" }}>
                      連続正解 {yojijukugoQuiz.consecutiveCount} 回！
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setYojijukugoQuiz(null);
                    setTimeout(() => {
                      const canvas = canvasRef.current;
                      if (canvas) {
                        const rect = canvas.getBoundingClientRect();
                        startYojijukugoAnimation(rect.width / 2, rect.height / 2);
                      }
                    }, 100);
                  }}
                  style={{
                    padding: "12px 40px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    background: "rgba(255,255,255,0.9)",
                    color: "#f5576c",
                    border: "none",
                    borderRadius: "50px",
                    cursor: "pointer",
                  }}
                >
                  次の問題
                </button>
              </div>
            )}

            {yojijukugoQuiz.state === 'wrong' && (
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setYojijukugoQuiz(null)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    fontSize: "40px",
                    cursor: "pointer",
                    color: "#fff",
                    lineHeight: "1",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#fdd"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#fff"; }}
                >
                  ×
                </button>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#fff",
                  marginBottom: "20px",
                  animation: "shake 0.5s",
                }}>
                  😢 残念！
                </div>
                <p style={{ fontSize: "18px", color: "#fff", marginBottom: "10px" }}>
                  正解は「{yojijukugoQuiz.question.correct}」でした
                </p>
                {yojijukugoQuizConsecutiveCorrect > 0 && (
                  <p style={{ fontSize: "16px", color: "#fff", marginBottom: "15px" }}>
                    連続正解がリセットされました
                  </p>
                )}
                <button
                  onClick={() => setYojijukugoQuiz(null)}
                  style={{
                    padding: "12px 40px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    background: "rgba(255,255,255,0.7)",
                    color: "#333",
                    border: "none",
                    borderRadius: "50px",
                    cursor: "pointer",
                  }}
                >
                  閉じる
                </button>
              </div>
            )}

            {yojijukugoQuiz.state === 'insufficient_coins' && (
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "80px",
                  marginBottom: "20px",
                }}>
                  💰
                </div>
                <h2 style={{ fontSize: "28px", color: "#fff", marginBottom: "15px" }}>
                  コインが不足しています
                </h2>
                <p style={{ fontSize: "18px", color: "#fff", marginBottom: "20px" }}>
                  四字熟語クイズには10コインが必要です
                </p>
                <button
                  onClick={() => setYojijukugoQuiz(null)}
                  style={{
                    padding: "12px 40px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    background: "rgba(255,255,255,0.9)",
                    color: "#333",
                    border: "none",
                    borderRadius: "50px",
                    cursor: "pointer",
                  }}
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ 
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: isMobile ? "4px 2px" : "8px 12px", 
        fontSize: isMobile ? 10 : 12, 
        opacity: 0.7,
        wordBreak: "break-word",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        zIndex: 90,
        userSelect: "none"
      }}>
        {isEditMode
          ? (isMobile 
              ? "編集：長押しでドラッグ＆矢印表示 / 矢印タップで移動 / OKボタンで移動終了 / ダブルタップで編集"
              : "編集モード：ドラッグで移動 / ダブルクリックで編集 / 「➕新規オブジェクト」ボタンまたはCtrl+クリックで施設追加 / 🟡オレンジ枠=未保存")
          : (isMobile
              ? "操作：ドラッグでパン / ピンチでズーム"
              : "操作：ドラッグで移動（パン）／ピンチでズーム／タップで選択（リング表示）／文字は水平固定")}
      </div>
    </main>
  );
}
