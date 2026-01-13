// コイン画像をCanvas APIで生成してWebP形式で保存するスクリプト
// Node.jsで実行する場合は canvas パッケージが必要です
// npm install canvas

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const size = 128;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// 透明背景
ctx.clearRect(0, 0, size, size);

// 金色のグラデーション
const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
gradient.addColorStop(0, '#fff8dc');
gradient.addColorStop(0.3, '#ffd700');
gradient.addColorStop(0.7, '#ffb300');
gradient.addColorStop(1, '#b8860b');

// コインの円
ctx.beginPath();
ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
ctx.fillStyle = gradient;
ctx.fill();

// 縁取り
ctx.strokeStyle = '#8b6914';
ctx.lineWidth = 3;
ctx.stroke();

// 内側の円（立体感）
ctx.beginPath();
ctx.arc(size / 2, size / 2, size / 2 - 12, 0, Math.PI * 2);
ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
ctx.lineWidth = 2;
ctx.stroke();

// 中央のマーク（¥記号）
ctx.fillStyle = '#8b6914';
ctx.font = 'bold 48px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('¥', size / 2, size / 2);

// WebP形式で保存
const outputPath = path.join(__dirname, '..', 'public', 'coin.webp');
const buffer = canvas.toBuffer('image/webp', { quality: 0.9 });
fs.writeFileSync(outputPath, buffer);

console.log(`Coin image saved to: ${outputPath}`);
