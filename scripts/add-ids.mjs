import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
const content = fs.readFileSync(filePath, 'utf-8');

// ENGLISH_QUESTIONSの開始位置と終了位置を探す
const startMarker = 'const ENGLISH_QUESTIONS: EnglishQuestion[] = [';
const endMarker = '];';

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error('ENGLISH_QUESTIONS not found');
  process.exit(1);
}

const searchStart = startIndex + startMarker.length;
const endIndex = content.indexOf(endMarker, searchStart);
if (endIndex === -1) {
  console.error('End of ENGLISH_QUESTIONS not found');
  process.exit(1);
}

// ENGLISH_QUESTIONSの中身を抽出
const arrayContent = content.substring(searchStart, endIndex);

// 各行を処理してidを追加
let idCounter = 1;
const updatedArrayContent = arrayContent.replace(/\{ word:/g, () => {
  return `{ id: ${idCounter++}, word:`;
});

// ファイルを更新
const updatedContent = content.substring(0, searchStart) + updatedArrayContent + content.substring(endIndex);

fs.writeFileSync(filePath, updatedContent, 'utf-8');

console.log(`✅ Added id fields to ${idCounter - 1} English questions`);
