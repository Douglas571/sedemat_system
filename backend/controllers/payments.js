const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();


const logger = require('../utils/logger')



const paymentService = require('../services/payments')


router.get('/', async (req, res) => {
    try {
        const payments = await paymentService.findAll();
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching payments' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newPayment = await paymentService.createPayment(req.body);
        res.status(201).json(newPayment);
    } catch (error) {
        console.log({error})
        let msg = error.message
        let code = 0
        if (error.name == "SequelizeUniqueConstraintError"){

            if (error.fields.hasOwnProperty("reference")) {
                logger.error("referencia duplicada")
                msg = "Esta referencia ya existe."
            }
            
        }
        logger.error({error})
        let errorResponse = { error: { msg, code: 1 } }
        res.status(500).json(errorResponse);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const payment = await paymentService.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching payment' });
    }
});

router.put('/:id', async (req, res) => {

    try {
        const updatedPayment = await paymentService.updatePayment(req.params.id, req.body);
        res.json(updatedPayment);
    } catch (error) {
        // if node env is test, print error
        if (process.env.NODE_ENV === 'test') {
            console.log({error})
        }
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            let msg = error.message
            let code = 0
            if (error.name == "SequelizeUniqueConstraintError"){

                if (error.fields.hasOwnProperty("reference")) {
                    logger.error("referencia duplicada")
                    msg = "Esta referencia ya existe."
                }
                
            }
            res.status(500).json({ error: msg });
        }
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedPayment = await paymentService.deletePayment(req.params.id);
        
        res.status(204).json(deletedPayment);
    } catch (error) {
        console.log({error})
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error deleting payment' });
        }
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("executing the destination fuction")
        cb(null, 'uploads/'); // Specify the destination directory for uploaded images
    },
    filename: (req, file, cb) => {
        console.log('creating file name')
        //cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Specify the filename for uploaded images
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Set file size limit (e.g., 5MB)
    fileFilter: (req, file, cb) => {
        
        // Only accept image files
        console.log("executing file filter")
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

router.post('/upload', upload.single('image'), (req, res) => {
    try {
        console.log("executing the route")
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an image' });
        }
        res.status(200).json({ message: 'Image uploaded successfully', file: req.file,
            path: req.file.destination + req.file.filename
        });
    } catch (error) {
        console.log("there was an error")
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;