// filesController.js
const multer = require('multer');
const fse = require('fs-extra');
const crypto = require('crypto');
const os = require('os');
const path = require('path');

const sharp = require('sharp');

const FilesService = require('../services/filesService');
const { InvalidFileError, UserNotAuthorizedError } = require('../utils/errors');
const ROLES = require('../utils/auth/roles');

const tempDir = os.tmpdir();
const uploadsDir = path.resolve(__dirname, '../uploads');

const { getFolderName } = require('../utils/files')

fse.ensureDirSync(tempDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("executing the destination fuction")
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    console.log('creating file name')
    const extension = file.originalname.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${extension}`;
    cb(null, fileName);
  },
})

const upload = multer({ storage });

const uploadFile = async (req, res) => {

  const FOLDERS = {
    'grossIncomes': 'seneat-declarations',
    'payments': 'payments',
  }

  upload.single('file')(req, res, async (err) => {
    try {

      let user = req.user

      if (Object.keys(FOLDERS).indexOf(req.body.folder) === -1) {
        throw new InvalidFileError('Invalid folder');
      }

      if (req.body.folder === 'grossIncomes' && [ROLES.FISCAL, ROLES.COLLECTOR].indexOf(user.roleId) === -1) {
        throw new UserNotAuthorizedError("Only fiscals and collectors can upload gross income files.");
      }
  

      const file = req.file;
      let destinyFilePath = ''
      let dirPath = ''

      if (err) {
        console.log({err})
        throw new InvalidFileError(err.message);
      }

      if (!file) {
        console.log('No file uploaded')
        throw new InvalidFileError('No file uploaded');
      }

      const { folder, description, shouldCompress } = req.body;
      const isAnImage = file.mimetype.startsWith('image');

      // check if the folder is valid
      if (!['grossIncomes', 'payments'].includes(folder)) {
        let error = new InvalidFileError('Invalid folder');
        return res.status(error.statusCode ?? 500).json({error});
      }

      // ensure destination folder exists
      dirPath = path.resolve(uploadsDir, getFolderName(), FOLDERS[folder]);
      destinyFilePath = path.resolve(dirPath, file.filename)
      await fse.ensureDir(dirPath);

      // if is an image
      if (isAnImage) {
        // console.log({isAnImage, file})
        
        let image = sharp(file.path);
        const metadata = await image.metadata();

        const newFilename = file.filename.split('.')[0] + '.png';
        destinyFilePath = path.resolve(dirPath, newFilename);

        // get the width and height 
        image = await image.png({ quality: 50 })

        // if is horizontal image 
        if ((metadata.width > metadata.height) && metadata.width > 1900) {
          // console.log("image is horizontal")
          image = await image.resize(1900, 1600, { fit: 'inside' })
        }

        // if is vertical image 
        if ((metadata.width < metadata.height) && metadata.height > 1600) {
          // console.log("image is vertical")
          image = await image.resize(1600, 1900, { fit: 'inside' })
        }

        image = await image.greyscale()

        image = await image.normalize()

        await image.toFile(destinyFilePath);

      } else {
        // move other types of files to destination folder
        console.log({file, destinyFilePath})
        await fse.move(file.path, destinyFilePath);
      }

      // make it relative so it can be saved in db
      destinyFilePath = destinyFilePath.split('backend')[1]

      const savedFile = await FilesService.create({
        path: destinyFilePath,
        type: isAnImage ? 'image' : 'pdf', // TODO: Add other file types,
        description,
        folder,
        createdByUserId: req.user.id, // Assuming JWT middleware adds `user` to req
      });

      res.status(201).json(savedFile);
    } catch (error) {
      console.log({error})
      res.status(error.statusCode ?? 500).json({ error });
    }
    
  })

    
  
};

const getFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await FilesService.getById(id);
    res.json(file);
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error });
  }
};

const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedFile = await FilesService.update(id, updateData);
    res.json(updatedFile);
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    await FilesService.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error });
  }
};

const getAllFiles = async (req, res) => {
  try {
    const files = await FilesService.getAll();
    res.json(files);
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error });
  }
};

module.exports = {
  uploadFile,
  getFile,
  updateFile,
  deleteFile,
  getAllFiles,
};

