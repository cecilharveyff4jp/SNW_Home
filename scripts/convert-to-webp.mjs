import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, parse } from 'path';
import { existsSync } from 'fs';

const publicDir = './public';
const backupDir = './public/backup-png';

async function convertToWebP() {
  try {
    // バックアップディレクトリを作成
    if (!existsSync(backupDir)) {
      await mkdir(backupDir, { recursive: true });
      console.log('✓ バックアップディレクトリを作成しました');
    }

    // bear-*.png ファイルを取得
    const files = await readdir(publicDir);
    const bearFiles = files.filter(file => 
      file.startsWith('bear-') && file.endsWith('.png')
    );

    console.log(`\n${bearFiles.length}個のファイルを変換します...\n`);

    let totalOriginalSize = 0;
    let totalWebPSize = 0;

    for (const file of bearFiles) {
      const inputPath = join(publicDir, file);
      const { name } = parse(file);
      const outputPath = join(publicDir, `${name}.webp`);
      const backupPath = join(backupDir, file);

      try {
        // 元のファイルサイズを取得
        const originalStats = await sharp(inputPath).metadata();
        const originalSize = (await sharp(inputPath).toBuffer()).length;
        
        // WebPに変換（品質80%で高品質を維持）
        const webpBuffer = await sharp(inputPath)
          .webp({ quality: 80, effort: 6 })
          .toFile(outputPath);

        // 元のPNGをバックアップに移動
        await sharp(inputPath).toFile(backupPath);

        totalOriginalSize += originalSize;
        totalWebPSize += webpBuffer.size;

        const reduction = ((1 - webpBuffer.size / originalSize) * 100).toFixed(1);

        console.log(`✓ ${file}`);
        console.log(`  ${originalStats.width}x${originalStats.height}`);
        console.log(`  PNG: ${(originalSize / 1024).toFixed(2)} KB → WebP: ${(webpBuffer.size / 1024).toFixed(2)} KB`);
        console.log(`  削減率: ${reduction}%\n`);

      } catch (err) {
        console.error(`✗ ${file} の変換に失敗:`, err.message);
      }
    }

    console.log('\n=== 変換完了 ===');
    console.log(`合計元サイズ: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`合計WebPサイズ: ${(totalWebPSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`合計削減率: ${((1 - totalWebPSize / totalOriginalSize) * 100).toFixed(1)}%`);
    console.log(`\n元のPNGファイルは ${backupDir} に保存されています。`);
    console.log('問題なければ、後でバックアップディレクトリを削除できます。');

  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

convertToWebP();
