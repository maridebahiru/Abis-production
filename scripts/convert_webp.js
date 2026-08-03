const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext) && !entry.name.endsWith('.webp')) {
        const webpPath = fullPath.substring(0, fullPath.lastIndexOf('.')) + '.webp';
        try {
          await sharp(fullPath)
            .webp({ quality: 82, effort: 4 })
            .toFile(webpPath);
          const origSize = (fs.statSync(fullPath).size / 1024).toFixed(1);
          const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(1);
          console.log(`Converted ${entry.name} (${origSize} KB -> ${webpSize} KB)`);
        } catch (err) {
          console.error(`Error converting ${fullPath}:`, err.message);
        }
      }
    }
  }
}

async function main() {
  console.log('Starting WebP conversion for src/assets and public...');
  await processDirectory(path.join(process.cwd(), 'src', 'assets'));
  await processDirectory(path.join(process.cwd(), 'public'));
  console.log('WebP conversion complete!');
}

main();
