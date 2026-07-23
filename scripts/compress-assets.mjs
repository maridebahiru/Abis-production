import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const assetsDir = path.join(process.cwd(), 'src', 'assets');

async function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && /\.(jpe?g|png)$/i.test(entry.name)) {
      const stats = fs.statSync(fullPath);
      const originalMB = (stats.size / (1024 * 1024)).toFixed(2);

      if (stats.size > 400 * 1024) {
        console.log(`Compressing: ${path.relative(assetsDir, fullPath)} (${originalMB} MB)`);
        const tempPath = fullPath + '.tmp';

        try {
          await sharp(fullPath)
            .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80, mozjpeg: true })
            .toFile(tempPath);

          fs.renameSync(tempPath, fullPath);

          const newStats = fs.statSync(fullPath);
          const newKB = (newStats.size / 1024).toFixed(0);
          console.log(`  └─ Optimized: ${newKB} KB (Reduced by ${(100 - (newStats.size / stats.size) * 100).toFixed(1)}%)`);
        } catch (err) {
          console.error(`  └─ Error processing ${entry.name}:`, err.message);
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
      }
    }
  }
}

console.log('Starting Asset Image Optimization...');
processDirectory(assetsDir)
  .then(() => console.log('\nAll studio asset images successfully compressed!'))
  .catch((err) => console.error('Optimization failed:', err));
