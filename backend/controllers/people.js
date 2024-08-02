const express = require('express');
const router = express.Router();
const personService = require('../services/people');


const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra')
const logger = require('../utils/logger');

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
const PFP_PATH = path.resolve(__dirname, '../uploads/pfp')
fse.ensureDirSync(PFP_PATH)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PFP_PATH);
    },
    filename: (req, file, cb) => {
        const randomCode = crypto.randomInt(100000, 999999);
        const ext = path.extname(file.originalname);
        cb(null, `${randomCode}${ext}`);
    }
});

const upload = multer({ storage });
const uploadProfilePicture = (req, res) => {
    upload.single('image')(req, res, (err) => {
    if (err) {
            console.log({err})
        return res.status(500).json({ message: 'Error in uploading file', error: err.message });
        }

        if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileUrl = `/uploads/pfp/${req.file.filename}`;
        res.status(200).json({ url: fileUrl });
    });
};

router.post('/pfp', uploadProfilePicture)


module.exports = router;