const express = require('express');
const multer = require('multer');
const path = require('path');
const permitDocsController = require('../controllers/permitDocs');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/permissions'));
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Routes
router.post('/', upload.array('docImages', 10), permitDocsController.createPermission);
router.get('/', permitDocsController.getAllPermissions);
router.get('/:id', permitDocsController.getPermissionById);
router.put('/:id', upload.array('docImages', 10), permitDocsController.updatePermission);
router.delete('/:id', permitDocsController.deletePermission);

module.exports = router;