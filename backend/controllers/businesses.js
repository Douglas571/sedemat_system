const express = require('express');
const router = express.Router();
const businessService = require('../services/businesses');
const logger = require('../utils/logger')

const path = require('path');
const fse = require('fs-extra');
const multer = require('multer');

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
        console.log({error})
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
            if (error.fields.hasOwnProperty("businessName")) {
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
        console.log({error})
        if (error.message == "Razón social ya registrada."){
            res.status(400).json({ error: {
                message: error.message
            }})

        } else {
            res.status(500).json({ error: "We have some problems" });
        }
        
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


// create a multer storage to save the certificate of incorporation 
const CERTIFICATES_OF_INCORPORATION_PATH = path.resolve(__dirname, '../uploads/certificates-of-incorporation')
fse.ensureDirSync(CERTIFICATES_OF_INCORPORATION_PATH)

// i will define a multer storage behavior 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // it will save files into zonations path
        cb(null, CERTIFICATES_OF_INCORPORATION_PATH);
    },
    filename: (req, file, cb) => {

        // it will asign a random id to each file
        const randomCode = crypto.randomInt(100000, 999999);
        const ext = path.extname(file.originalname);
        cb(null, `${randomCode}${ext}`);
    }
});

// certificate of incorporation to storage
const coi_storage = multer({
    storage
})

async function saveCertificateOfIncorporation(req, res) {
    coi_storage.array("docImages")(req, res, async (err) => {
        try {
            const { businessId, expirationDate } = req.body;
            const docImages = req.files; 

            // save the certificate of incorporation instace
            const certificateOfIncorporation = (await CertificateOfIncorporation.create({
                businessId, expirationDate
            })).toJSON()

            const certificateOfIncorporationId = certificateOfIncorporation.id
            
            // register every image 
            const newDocImages = docImages.map( (image, index) => {
                return {
                    certificateOfIncorporationId,
                    path: image.path,
                    url: `/uploads/certificates-of-incorporation/${image.filename}`,
                    pageNumber: index + 1
                }
            })

            let INTERMEDIATE_DOC_IMAGES = newDocImages.map( async (docImage) => {
                const registeredDocImage = await DocImage.create(docImage)
                return registeredDocImage.toJSON()
            })

            certificateOfIncorporation.docImages = (await Promise.allSettled(INTERMEDIATE_DOC_IMAGES)).map( r => r.value )

            res.status(201).json(certificateOfIncorporation);
        } catch (error) {
            logger.info(JSON.stringify(error, null, 2))
            res.status(500).json({ error: 'Failed to create certificateOfIncorporation' });
        }
    })
};

router.post('/coi', saveCertificateOfIncorporation)




module.exports = router;