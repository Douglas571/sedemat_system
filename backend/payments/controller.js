const express = require('express');
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
        state: req.body.state
    };

    try {
        const newPayment = await paymentService.createPayment(newPaymentData);
        res.status(201).json(newPayment);
    } catch (error) {
        let msg = "error random"
        let code = 0
        if (error.name == "SequelizeUniqueConstraintError"){
            msg = "Esta referencia ya existe."
        }
        res.status(500).json({ error: { msg, code: 1 } });
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

module.exports = router;