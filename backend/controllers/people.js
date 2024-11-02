const express = require('express');
const router = express.Router();
const personService = require('../services/people');


const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const os = require('os');
const fse = require('fs-extra')
const logger = require('../utils/logger');

const imageUtils = require('../utils/images');

router.post('/', async (req, res) => {
    try {
        const newPerson = await personService.createPerson(req.body);
        res.status(201).json(newPerson);
    } catch (error) {
        res.status(500).json({ error: error.message, value: error.value });
    }
});

router.get('/', async (req, res) => {
    try {
        const people = await personService.getPeople();
        res.status(200).json(people);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const person = await personService.getPersonById(req.params.id);
        res.status(200).json(person);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedPerson = await personService.updatePerson(req.params.id, req.body);
        res.status(200).json(updatedPerson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await personService.deletePerson(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Set up multer for file upload
const TEMP = os.tmpdir()
const PFP_PATH = path.resolve(__dirname, '../uploads/pfp')
const DNI_PATH = path.resolve(__dirname, '../uploads/dni')
const RIF_PATH = path.resolve(__dirname, '../uploads/rif')
fse.ensureDirSync(DNI_PATH)
fse.ensureDirSync(RIF_PATH)
fse.ensureDirSync(PFP_PATH)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, TEMP);
    },
    filename: (req, file, cb) => {
        const randomCode = crypto.randomInt(100000, 999999);
        const ext = path.extname(file.originalname);
        cb(null, `${randomCode}${ext}`);
    }
});

const upload = multer({ storage });
const uploadProfilePicture = (req, res) => {
    upload.single('image')(req, res, async (err) => {
    if (err) {
            console.log({err})
        return res.status(500).json({ message: 'Error in uploading file', error: err.message });
        }

        if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
        }

        const compressedFilename = await imageUtils.compress({
            filePath: path.resolve(TEMP, req.file.filename),
            destination: PFP_PATH,
            baseFileName: crypto.randomInt(100000, 999999),
            // resize: true,
        });

        const fileUrl = path.join(`/uploads/pfp/`, compressedFilename);
        res.status(200).json({ url: fileUrl });
    });
};

router.post('/pfp', uploadProfilePicture)

// configure the storage
const dni_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, TEMP);
    },
    filename: (req, file, cb) => {
        const randomCode = crypto.randomInt(100000, 999999);
        const ext = path.extname(file.originalname);
        cb(null, `${randomCode}${ext}`);
    }
});
const rif_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, TEMP);
    },
    filename: (req, file, cb) => {
        const randomCode = crypto.randomInt(100000, 999999);
        const ext = path.extname(file.originalname);
        cb(null, `${randomCode}${ext}`);
    }
});
const dni_upload = multer({ storage: dni_storage })
const rif_upload = multer({ storage: rif_storage })

// take the image, and return the address to that folder
const uploadDniPicture = (req, res) => {
    dni_upload.single('image')(req, res, async (err) => {
        if (err) {
            console.log({err})
            return res.status(500).json({ message: 'Error in uploading file', error: err.message });
        }

        if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
        }

        const compressedFilename = await imageUtils.compress({
            filePath: path.resolve(TEMP, req.file.filename),
            destination: DNI_PATH,
            baseFileName: crypto.randomInt(100000, 999999),
            // resize: true,
        })

        const fileUrl = path.join(`/uploads/dni/`, compressedFilename);
        res.status(200).json({ url: fileUrl });
    });
};

router.post('/dni', uploadDniPicture)

const uploadRifPicture = (req, res) => {
    rif_upload.single('image')(req, res, async (err) => {
        if (err) {
            console.log({err})
            return res.status(500).json({ message: 'Error in uploading file', error: err.message });
        }

        if (!req.file) {
        return res.status(400).json({ error: {
            message: 'No file uploaded'
        }});
        }

        const compressedFilename = await imageUtils.compress({
            filePath: path.resolve(TEMP, req.file.filename),
            destination: RIF_PATH,
            baseFileName: crypto.randomInt(100000, 999999),
            // resize: true,
        })

        const fileUrl = path.join('/uploads/rif', compressedFilename);
        res.status(200).json({ url: fileUrl });
    });
};

router.post('/rif', uploadRifPicture)

module.exports = router;