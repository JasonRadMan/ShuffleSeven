import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const sourceImage = 'attached_assets/stock_images/minimalist_golden_sh_bb96a6c6.jpg';
  const outputDir = 'public/assets';
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate 192x192 icon
  await sharp(sourceImage)
    .resize(192, 192, {
      fit: 'cover',
      position: 'center'
    })
    .png()
    .toFile(path.join(outputDir, 'icon-192.png'));
  
  console.log('✅ Generated icon-192.png');
  
  // Generate 512x512 icon
  await sharp(sourceImage)
    .resize(512, 512, {
      fit: 'cover',
      position: 'center'
    })
    .png()
    .toFile(path.join(outputDir, 'icon-512.png'));
  
  console.log('✅ Generated icon-512.png');
  
  // Generate favicon (32x32)
  await sharp(sourceImage)
    .resize(32, 32, {
      fit: 'cover',
      position: 'center'
    })
    .toFile(path.join('public', 'favicon.ico'));
  
  console.log('✅ Generated favicon.ico');
}

generateIcons()
  .then(() => console.log('✅ All icons generated successfully!'))
  .catch(err => console.error('Error generating icons:', err));
