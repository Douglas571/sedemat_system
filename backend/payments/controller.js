const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();



const paymentService = require('./services')


router.get('/', async (req, res) => {
    try {
        const payments = await paymentService.findAll();
        res.json({ data: payments });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching payments' });
    }
});

router.post('/', async (req, res) => {
    const newPaymentData = {
        reference: req.body.reference,
        amount: req.body.amount,
        comment: req.body.comment,
        image: req.body.image,
        dni: req.body.dni,
        account: req.body.account,
        paymentDate: req.body.paymentDate,
        liquidationDate: req.body.liquidationDate,
        state: req.body.state,
        business_name: req.body.business_name
    };

    console.log("I got here")
    try {
        const newPayment = await paymentService.createPayment(newPaymentData);
        res.status(201).json(newPayment);
    } catch (error) {
        let msg = "error random"
        let code = 0
        if (error.name == "SequelizeUniqueConstraintError"){
            // console.log({gotanerror: error})

            console.log({ keys: error.fields})
            if (error.fields.hasOwnProperty("reference")) {
                console.log("referencia duplicada")
                msg = "Esta referencia ya existe."
            }
            
        }
        let errorResponse = { error: { msg, code: 1 } }
        console.log({errorResponse})
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
    const updatedPaymentData = {
        reference: req.body.reference,
        amount: req.body.amount,
        comment: req.body.comment,
        image: req.body.image,
        dni: req.body.dni,
        account: req.body.account,
        paymentDate: req.body.paymentDate,
        liquidationDate: req.body.liquidationDate,
        state: req.body.state
    };

    try {
        const updatedPayment = await paymentService.updatePayment(req.params.id, updatedPaymentData);
        res.json(updatedPayment);
    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error updating payment' });
        }
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedPayment = await paymentService.deletePayment(req.params.id);
        res.json(deletedPayment);
    } catch (error) {
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
        console.log({file})
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