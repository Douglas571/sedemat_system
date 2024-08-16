// controllers/zonationController.js

// Import any necessary models, utilities, or libraries
const {Zonation, DocImage} = require('../database/models'); // Example model, adjust according to your setup
const logger = require('../utils/logger');
const path = require("path")
const fse = require('fs-extra')
const multer = require('multer');
const crypto = require('crypto');

const ZONATIONS_PATH = path.resolve(__dirname, '../uploads/zonations')
fse.ensureDirSync(ZONATIONS_PATH)

// i will define a multer storage behavior 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // it will save files into zonations path
        cb(null, ZONATIONS_PATH);
    },
    filename: (req, file, cb) => {

        // it will asign a random id to each file
        const randomCode = crypto.randomInt(100000, 999999);
        const ext = path.extname(file.originalname);
        cb(null, `${randomCode}${ext}`);
    }
});

const upload = multer({
    storage
})

// Controller function to create a new zonation
exports.createZonation = async (req, res) => {
    upload.array("docImages")(req, res, async (err) => {
        try {
            const { branchOfficeId } = req.body;
            const docImages = req.files; 
            

            // save the zonation instace 
            const zonation = (await Zonation.create({branchOfficeId})).toJSON()
            const { id: zonationId } = zonation

            // register every image 
            const newDocImages = docImages.map( (image, index) => {
                return {
                    zonationId,
                    path: image.path,
                    url: `/uploads/zonations/${image.filename}`,
                    pageNumber: index + 1
                }
            })

            let INTERMEDIATE_DOC_IMAGES = newDocImages.map( async (docImage) => {
                const registeredDocImage = await DocImage.create(docImage)
                return registeredDocImage.toJSON()
            })

            zonation.docImages = (await Promise.allSettled(INTERMEDIATE_DOC_IMAGES)).map( r => r.value )

            res.status(201).json(zonation);
        } catch (error) {
            logger.info(JSON.stringify(error, null, 2))
            res.status(500).json({ error: 'Failed to create zonation' });
        }
    })
};

// Controller function to get a zonation by ID
exports.getZonationById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find zonation by ID
        const zonation = await Zonation.findByPk(id, {
            include: [
                {
                    model: DocImage,
                    as: 'docImages'
                }
            ]
        });

        if (!zonation) {
            return res.status(404).json({ error: 'Zonation not found' });
        }

        // Send response
        res.status(200).json(zonation);
    } catch (error) {
        console.log({error})
        res.status(500).json({ error: 'Failed to get zonation' });
    }
};

// Controller function to get all zonations
exports.getAllZonations = async (req, res) => {
    try {
        // Retrieve all zonations from the database
        const zonations = await Zonation.findAll();

        // Send response
        res.status(200).json(zonations);
    } catch (error) {
        logger.error({error})
        console.log({error})

        res.status(500).json({ error: 'Failed to retrieve zonations' });
    }
};

// Controller function to update a zonation by ID
exports.updateZonation = async (req, res) => {
    try {
        const { id } = req.params;
        const { branchOfficeId } = req.body;
        //const docImages = req.files; // Assuming you're handling file uploads

        // Find the zonation by ID
        const zonation = await Zonation.findByPk(id);

        if (!zonation) {
            return res.status(404).json({ error: 'Zonation not found' });
        }

        // Update the zonation's fields
        zonation.branchOfficeId = branchOfficeId;
        //zonation.docImages = docImages;

        // Save the updated zonation to the database
        await zonation.save();

        // Send response
        res.status(200).json(zonation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update zonation' });
    }
};

// Controller function to delete a zonation by ID
exports.deleteZonation = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the zonation by ID
        const zonation = await Zonation.findByPk(id);

        if (!zonation) {
            return res.status(404).json({ error: 'Zonation not found' });
        }

        // Delete the zonation from the database
        await zonation.destroy();

        // Send response
        res.status(204).json({ message: 'Zonation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete zonation' });
    }
};