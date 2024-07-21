const express = require('express');
const router = express.Router();
const economicActivityService = require('./economicActivityService');

// Create a new economic activity
router.post('/', async (req, res) => {
    try {
        const newEconomicActivity = await economicActivityService.createEconomicActivity(req.body);
        res.status(201).json(newEconomicActivity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all economic activities
router.get('/', async (req, res) => {
    try {
        const economicActivities = await economicActivityService.getAllEconomicActivities();
        res.status(200).json(economicActivities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get an economic activity by ID
router.get('/:id', async (req, res) => {
    try {
        const economicActivity = await economicActivityService.getEconomicActivityById(req.params.id);
        if (!economicActivity) {
            return res.status(404).json({ error: 'Economic activity not found' });
        }
        res.status(200).json(economicActivity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an economic activity
router.put('/:id', async (req, res) => {
    try {
        const updatedEconomicActivity = await economicActivityService.updateEconomicActivity(req.params.id, req.body);
        res.status(200).json(updatedEconomicActivity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an economic activity
router.delete('/:id', async (req, res) => {
    try {
        await economicActivityService.deleteEconomicActivity(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;