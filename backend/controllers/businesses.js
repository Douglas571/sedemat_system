const express = require('express');
const router = express.Router();
const businessService = require('../services/businesses');
const logger = require('../utils/logger')

const path = require('path');
const fse = require('fs-extra');
const multer = require('multer');
const crypto = require('crypto');
const os = require('os');

const imagesUtils = require('../utils/images');

const passport = require('passport');

const { z } = require("zod")

const bausinessScheme = z.object({
    reminderInterval: z.number()
})

const { CertificateOfIncorporation, DocImage } = require('../database/models');

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
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
        const newBusiness = await businessService.createBusiness(req.body, req.user);
        res.status(201).json(newBusiness);
    } catch (error) {
        let msg = error.message
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

            if (error.fields.hasOwnProperty("unique_business_dni")) {
                console.log("DNI ya registrado")
                msg = "RIF ya registrado."
            }
            
        }
        let errorResponse = { error: { msg, code: 2 } }
        
        res.status(500).json(errorResponse);
    }
});

// router to check if a business is allowed to have an economic activity license 
router.get('/:businessId/elegible-for-economic-license', async (req, res) => {
    try {
        const { businessId } = req.params
        
        // call the service isEligibleForTheEconomicActivityLicense from businessService
        const results = await businessService.isEligibleForTheEconomicActivityLicense(businessId)

        // iff results has error
        if (results.error) {
            // set status to 400 
            // return results 
            return res.status(200).json({ error: results.error })
        }

        return res.status(200).json(results)
    } catch (error) {
        console.log({error})
        return res.status(500).json({ error: error.message })
    }
})

// Update a business
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        
        // verify the request body is well formed
        logger.info({message: "Updating business", body: req.body, businessId: req.params.id})

        const updatedBusiness = await businessService.updateBusiness(req.params.id, req.body, req.user);
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
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        
        logger.info({message: "Deleting business", businessId: req.params.id})
        await businessService.deleteBusiness(req.params.id, req.user);
        res.status(200).send();
    } catch (error) {
        console.log({error})
        res.status(400).json({ error: error });
    }
});


// create a multer storage to save the certificate of incorporation 
const TEMP = os.tmpdir()
const CERTIFICATES_OF_INCORPORATION_PATH = path.resolve(__dirname, '../uploads/certificates-of-incorporation')
fse.ensureDirSync(CERTIFICATES_OF_INCORPORATION_PATH)

// i will define a multer storage behavior 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // it will save files into zonations path
        cb(null, TEMP);
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
            const newDocImages = [];

            for (const [index, image] of docImages.entries()) {

                let newFilename = await imagesUtils.compressHorizontal({
                    filePath: image.path,
                    baseFileName: crypto.randomInt(100000, 999999),
                    destination: CERTIFICATES_OF_INCORPORATION_PATH
                })
                newDocImages.push({
                    certificateOfIncorporationId,
                    path: path.join(CERTIFICATES_OF_INCORPORATION_PATH, newFilename),
                    url: `/uploads/certificates-of-incorporation/${newFilename}`,
                    pageNumber: index + 1
                })
            }

            console.log({newDocImages})

            let registeringImagesPromises = newDocImages.map( async (docImage) => {


                const registeredDocImage = await DocImage.create(docImage)
                return registeredDocImage.toJSON()
            })

            const resolvedPromises = await Promise.allSettled(registeringImagesPromises)
            certificateOfIncorporation.docImages = resolvedPromises.map( image => image.value)

            res.status(201).json(certificateOfIncorporation);
        } catch (error) {
            console.log({error})
            logger.info(JSON.stringify(error, null, 2))
            res.status(500).json({ error: 'Failed to create certificateOfIncorporation' });
        }
    })
};

router.post('/coi', saveCertificateOfIncorporation)


module.exports = router