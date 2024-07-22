const express = require('express');
const router = express.Router();
const branchOfficeService = require('./services');
const logger = require('../utils/logger')

// Create a new Branch Office
router.post('/', async (req, res) => {
    try {
        console.log({body: req.body})
        const newBranchOffice = await branchOfficeService.createBranchOffice(req.body);
        res.status(201).json(newBranchOffice);
    } catch (error) {
        res.status(500).json({ error: { msg: error.message, code: 1 } });
    }
});

// Get all Branch Offices
router.get('/', async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

    try {
        const { businessid: businessId } = req.query; // Extract businessId from query params

        if (businessId) {
            const branchOffices = await branchOfficeService.getBranchOfficesByBusinessId(businessId);
            return res.status(200).json(branchOffices);
        }

        const branchOffices = await branchOfficeService.getAllBranchOffices();
        res.json(branchOffices);
        
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: { msg: error.message, code: 1 } });
    }
});

// Get a Branch Office by ID
router.get('/:id', async (req, res) => {
    try {
        const branchOffice = await branchOfficeService.getBranchOfficeById(req.params.id);
        res.json(branchOffice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a Branch Office
router.put('/:id', async (req, res) => {
    try {
        const updatedBranchOffice = await branchOfficeService.updateBranchOffice(req.params.id, req.body);
        res.json(updatedBranchOffice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a Branch Office
router.delete('/:id', async (req, res) => {
    try {
        await branchOfficeService.deleteBranchOffice(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;