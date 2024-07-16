const express = require('express');
const router = express.Router();
const businessService = require('./services');

// Get all businesses
router.get('/', async (req, res) => {
    try {
        const businesses = await businessService.getAllBusinesses();
        res.json(businesses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get business by ID
router.get('/:id', async (req, res) => {
    try {
        const business = await businessService.getBusinessById(req.params.id);
        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }
        res.json(business);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register a new business
router.post('/', async (req, res) => {
    try {
        const newBusiness = await businessService.createBusiness(req.body);
        res.status(201).json(newBusiness);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a business
router.put('/:id', async (req, res) => {
    try {
        const updatedBusiness = await businessService.updateBusiness(req.params.id, req.body);
        res.json(updatedBusiness);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a business
router.delete('/:id', async (req, res) => {
    try {
        await businessService.deleteBusiness(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;