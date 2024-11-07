const express = require('express');
const buildingDocController = require('../controllers/buildingDocs');
const multer = require('multer');
const path = require('path');
const fse = require('fs-extra')
const os = require('os')
const TEMP = os.tmpdir()

const router = express.Router();

fse.ensureDirSync(path.join(__dirname, '..', 'uploads', 'building'));

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        
        cb(null, TEMP);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Routes
router.post('/', upload.array('docImages', 10), buildingDocController.createBuildingDoc);
router.get('/', buildingDocController.getAllBuildingDocs);
router.get('/:id', buildingDocController.getBuildingDocById);
router.put('/:id', buildingDocController.updateBuildingDoc);
router.delete('/:id', buildingDocController.deleteBuildingDoc);

module.exports = router;