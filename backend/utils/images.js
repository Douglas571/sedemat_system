const sharp = require('sharp');
const path = require('path');

async function compress({filePath, destination, baseFileName, quality = 50, resize = false, normalize = false}) {
  let image = sharp(filePath);
  let metadata = await image.metadata();

  console.log({metadata})

  let webpFilename = `${baseFileName ?? Date.now()}.png`

  image = await image.png({ quality: 20 })

  if (resize && metadata.width > 1600) {
    console.log("resizing image")
    image = await image.resize(1600, 1900, { fit: 'inside' })
  }

  if (normalize) {
    image = await image.normalize()
  }

  let result = await image
    .greyscale()
    .toFile(path.resolve(destination, webpFilename ));
  
  return filename = webpFilename
}



async function compressWithoutNormalise({filePath, destination, baseFileName, quality = 50, resize = false}) {
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
    .toFile(path.resolve(destination, webpFilename ));
  
  return filename = webpFilename
}

async function compressHorizontal({filePath, destination, baseFileName, quality = 50, resize = false}) {
  let image = sharp(filePath);
  let metadata = await image.metadata();

  console.log({metadata})

  let webpFilename = `${baseFileName ?? Date.now()}.webp`

  image = await image.webp({ quality })

  if (resize && metadata.width > 1900) {
    console.log("resizing image")
    image = await image.resize(1900, 1600, { fit: 'inside' })
  }

  console.log("compressing image")
  let result = await image
    .greyscale()
    .toFile(path.resolve(destination, webpFilename));
  
  return filename = webpFilename
}

module.exports = {
  compress,
  compressWithoutNormalise,
  compressHorizontal
}