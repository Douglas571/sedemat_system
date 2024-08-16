const express = require('express');
const router = express.Router();

// Import the controller functions (you will implement these)
const {
    createZonation,
    getZonationById,
    getAllZonations,
    updateZonation,
    deleteZonation,
} = require('../controllers/zonations');

// POST /zonations - Create a new zonation
router.post('/zonations', createZonation);

// GET /zonations/:id - Get a zonation by ID
router.get('/zonations/:id', getZonationById);

// GET /zonations - Get all zonations
router.get('/zonations', getAllZonations);

// PUT /zonations/:id - Update a zonation by ID
router.put('/zonations/:id', updateZonation);

// DELETE /zonations/:id - Delete a zonation by ID
router.delete('/zonations/:id', deleteZonation);

module.exports = router;