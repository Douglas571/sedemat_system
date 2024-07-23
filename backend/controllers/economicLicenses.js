// routes/economicLicenseRouter.js
const express = require('express');
const router = express.Router();
const economicLicenseService = require('../services/economicLicenses');

const logger = require('../utils/logger')

// Create a new economic license
router.post('/', async (req, res) => {
    try {
        const newLicense = await economicLicenseService.createEconomicLicense(req.body);
        res.status(201).json(newLicense);
    } catch (error) {
        console.log({error})
        logger.error(error)
        res.status(500).json({ error: error.message });
    }
});

// Get all economic licenses
router.get('/', async (req, res) => {
    try {
        const licenses = await economicLicenseService.getEconomicLicenses();
        res.status(200).json(licenses);
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: error.message });
    }
});

// Get a specific economic license by ID
router.get('/:id', async (req, res) => {
    try {
        const license = await economicLicenseService.getEconomicLicenseById(req.params.id);
        res.status(200).json(license);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an economic license by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedLicense = await economicLicenseService.updateEconomicLicense(req.params.id, req.body);
        res.status(200).json(updatedLicense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an economic license by ID
router.delete('/:id', async (req, res) => {
    try {
        await economicLicenseService.deleteEconomicLicense(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;