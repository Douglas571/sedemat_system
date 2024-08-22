const express = require('express');
const multer = require('multer');
const path = require('path');
const permitDocsController = require('../controllers/permitDocs');

const fse = require('fs-extra')

const router = express.Router();
fse.ensureDirSync(path.join(__dirname, '../uploads/permit-docs'));

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/permit-docs'));
    },
    filename: function (req, file, cb) {
        
        cb(null, `${Date.now()}.${file.mimetype.split('/')[1]}`);
    }
});

const upload = multer({ storage });

// Routes
router.post('/', upload.array('docImages', 10), permitDocsController.createPermitDoc);
router.get('/', permitDocsController.getAllPermitDocs);
router.get('/:id', permitDocsController.getPermitDocById);
router.put('/:id', upload.array('docImages', 10), permitDocsController.updatePermitDoc);
router.delete('/:id', permitDocsController.deletePermitDoc);

module.exports = router;