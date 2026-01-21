// 魚クイズ用の問題データ
export type FishQuestion = {
  id: number;
  kanji: string;
  correct: string;
  wrong1: string;
  wrong2: string;
};

export const FISH_QUESTIONS: FishQuestion[] = [
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
