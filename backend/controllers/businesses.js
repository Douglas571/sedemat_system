const express = require('express');
const router = express.Router();
const businessService = require('../services/businesses');
const logger = require('../utils/logger')

const { z } = require("zod")

const bausinessScheme = z.object({
    reminderInterval: z.number()
})

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
        logger.info({message: `Lookinf for business by id: ${req.params.id}`})
        const business = await businessService.getBusinessById(req.params.id);
        if (!business) {
            return res.status(404).json({ error: 'Business not found' });
        }
        res.json(business);
    } catch (error) {
        logger.error({message: "Error looking for business", error})
        console.log({error})
        res.status(500).json({ error: error.message });
    }
});

// create an object Business
    // with a method to parse from database
    // with a method to transform to database model 

// Register a new business
router.post('/', async (req, res) => {
    try {
        // todo: verify the request body is well formed
        // const parsedBusiness = {
        //     business_name: req.body.businessName,
        //     dni: req.body.dni,
        //     email: req.body.email,
        //     establishment_date: req.body.establishmentDate,
        //     expiration_date: req.body.expirationDate,
        //     board_expiration_date: req.body.boardExpirationDate
        // }

        // create a dto so i can use camelCase for the api, and snake_case for the backend
        logger.info({message: "Creating new business", body: req.body})
        const newBusiness = await businessService.createBusiness(req.body);
        res.status(201).json(newBusiness);
    } catch (error) {
        let msg = "error random"
        let code = 0
        console.log({error})
        logger.error({message: "Error creating business", error})
        if (error.name == "SequelizeUniqueConstraintError"){
            // console.log({gotanerror: error})

            console.log({ keys: error.fields})
            if (error.fields.hasOwnProperty("business_name")) {
                console.log("Razón social ya registrada")
                msg = "Razón social ya registrada."
            }
            
        }
        let errorResponse = { error: { msg, code: 2 } }
        
        res.status(500).json(errorResponse);
    }
});

// Update a business
router.put('/:id', async (req, res) => {
    try {
        
        // verify the request body is well formed
        logger.info({message: "Updating business", body: req.body, businessId: req.params.id})

        const updatedBusiness = await businessService.updateBusiness(req.params.id, req.body);
        res.json(updatedBusiness);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a business
router.delete('/:id', async (req, res) => {
    try {
        logger.info({message: "Deleting business", businessId: req.params.id})
        await businessService.deleteBusiness(req.params.id);
        res.status(200).send();
    } catch (error) {
        console.log({error})
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;