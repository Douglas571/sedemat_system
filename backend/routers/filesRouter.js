// filesRouter.js
const express = require('express');
const passport = require('passport');
const FilesController = require('../controllers/filesController');
const multer = require('multer');

// Configure multer
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Routes

router.use(passport.authenticate('jwt', { session: false }));
router.post('/upload', upload.single('file'), FilesController.uploadFile);
router.get('/:id', FilesController.getFile);
router.put('/:id', FilesController.updateFile);
router.delete('/:id', FilesController.deleteFile);
router.get('/', FilesController.getAllFiles);

module.exports = router;