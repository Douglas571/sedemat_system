const sharp = require('sharp');
const path = require('path');

async function compress({filePath, destination, baseFileName, quality = 50, resize = false}) {
  let image = sharp(filePath);
  let metadata = await image.metadata();

  console.log({metadata})

  let webpFilename = `${baseFileName ?? Date.now()}.webp`

  image = await image.webp({ quality })

  if (resize && metadata.width > 1600) {
    console.log("resizing image")
    image = await image.resize(1600, 1900, { fit: 'inside' })
  }
  let result = await image
    .greyscale()
    .normalise()
    .toFile(path.resolve(destination, webpFilename ));
  
  return filename = webpFilename
}

module.exports = {
  compress
}