const express = require('express');
const leaseDocController = require('../controllers/leaseDoc');
const multer = require('multer');
const path = require('path');

const fse = require('fs-extra')


const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fse.ensureDirSync(path.join(__dirname, '..', 'uploads', 'lease'));
        cb(null, path.join(__dirname, '..', 'uploads', 'lease'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Routes
router.post('/', upload.array('docImages'), leaseDocController.createLeaseDoc);
router.get('/', leaseDocController.getAllLeaseDocs);
router.get('/:id', leaseDocController.getLeaseDocById);
router.put('/:id', leaseDocController.updateLeaseDoc);
router.delete('/:id', leaseDocController.deleteLeaseDoc);

module.exports = router;