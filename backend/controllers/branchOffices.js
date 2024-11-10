const express = require('express');
const router = express.Router();
const branchOfficeService = require('../services/branchOffices');
const logger = require('../utils/logger')

const passport = require('passport');

// Create a new Branch Office
router.post('/', 
    passport.authenticate('jwt', { session: false }), 
    async (req, res) => {
        try {

            let user = req.user

            logger.info({ message: "Creating branch Office", branchOffice: req.body})
            const newBranchOffice = await branchOfficeService.createBranchOffice(req.body, user);
            res.status(201).json(newBranchOffice);
        } catch (error) {
            logger.error({ message: "Error creating branch office", error})
            console.log({error})
            res.status(error.statusCode ?? 500).json({ error: { 
                msg: error.message, code: 1,
                ...error} 
            });
        }
});

// Get all Branch Offices
router.get('/', async (req, res) => {
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
router.put('/:id', 
    passport.authenticate('jwt', { session: false }), 
    async (req, res) => {
        try {

            let user = req.user

            console.log({updatingBranchOfficeUser: user})

            const updatedBranchOffice = await branchOfficeService.updateBranchOffice(req.params.id, req.body, user);
            res.json(updatedBranchOffice);
        } catch (error) {
            res.status(error.statusCode ?? 500).json({ error });
        }
});

// Delete a Branch Office
router.delete('/:id', 
    passport.authenticate('jwt', { session: false }), 
    async (req, res) => {

        let user = req.user

        try {
            await branchOfficeService.deleteBranchOffice(req.params.id, user);
            res.status(204).send();
        } catch (error) {
            res.status(error.statusCode ?? 500).json({ error });
        }
});

module.exports = router;