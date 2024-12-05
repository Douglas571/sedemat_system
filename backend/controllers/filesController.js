// filesController.js
const multer = require('multer');
const fse = require('fs-extra');
const crypto = require('crypto');
const os = require('os');

const FilesService = require('../services/filesService');
const { InvalidFileError } = require('../utils/errors');

const tempDir = os.tmpdir();
const uploadsDir = path.resolve(__dirname, '../uploads');

fse.ensureDirSync(tempDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const extension = file.originalname.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${extension}`;
    cb(null, fileName);
  },
})

const upload = multer({ storage });

const uploadFile = async (req, res) => {
  upload.single('file')(req, res, async (err) => {

    try {

      const file = req.file;

      if (!file || err) {
        console.log({err});
        return res.status(500).json({ message: 'Error in uploading file', error: err.message });
      }

      const { folder, description, shouldCompress } = req.body;

      // check if the folder is valid
      if (!['grossIncomes', 'payments'].includes(folder)) {
        let error = new InvalidFileError('Invalid folder');
        return res.status(error.statusCode ?? 500).json({error});
      }

      const FOLDERS = {
        'grossIncomes': 'seneat-declarations',
        'payments': 'payments',
      }

      // ensure destination folder exists
      let dirPath = path.resolve(uploadsDir, FOLDERS[folder]);
      ensureDirectoryExists(dirPath);

      // if is an image
      if (file.mimetype.startsWith('image')) {
        // if shouldCompress is true, compress image and move to destination folder
        if (shouldCompress) {
          const compressedFilename = await FilesService.compress({
            filePath: file.path,
            destination: dirPath,
            baseFileName: file.originalname,
          });

          // TODO: Call the function to compress the image
          const compressedFilePath = path.resolve(dirPath, compressedFilename);
          await fse.move(file.path, compressedFilePath);

          // update file path in database
          await FilesService.update(id, { path: compressedFilePath });
        } else {
          // move image to destination folder
          await fse.move(file.path, path.resolve(dirPath, file.originalname));
        }
      } else {
        // move other types of files to destination folder
        await fse.move(file.path, path.resolve(dirPath, file.originalname));
      }

      const savedFile = await FilesService.create({
        path: file.path,
        type: file.mimetype.split('/')[1],
        description,
        folder,
        userId: req.user.id, // Assuming JWT middleware adds `user` to req
      });

      res.status(201).json(savedFile);
    } catch (error) {
      res.status(error.statusCode ?? 500).json({ error });
    }
  });
  
    
  
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

