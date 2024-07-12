const PaymentModel = require("../models/payment")

exports.findAll = async () => {
    console.log('Looking into DB');
    try {
        const payments = await PaymentModel.findAll();
        //console.log({ payments });
        return payments;
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }
};

exports.findById = async (id) => {
    console.log(`Looking for payment with ID ${id}`);
    try {
        const payment = await PaymentModel.findByPk(id);
        if (!payment) {
            console.error(`Payment with ID ${id} not found`);
            return null;
        }
        console.log('Found payment:', payment);
        return payment;
    } catch (error) {
        console.error('Error fetching payment by ID:', error);
        throw error;
    }
};

exports.createPayment = async (paymentData) => {
    console.log('Creating new payment with data:', paymentData);
    try {
        const payment = await PaymentModel.create(paymentData);
        console.log('Payment created:', payment);
        return payment;
    } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
    }
};

exports.updatePayment = async (id, paymentData) => {
    console.log(`Updating payment with ID ${id} with data:`, paymentData);
    try {
        const payment = await PaymentModel.findByPk(id);
        if (!payment) {
            console.error(`Payment with ID ${id} not found`);
            throw new Error(`Payment with ID ${id} not found`);
        }
        await payment.update(paymentData);
        console.log('Payment updated:', payment);
        return payment;
    } catch (error) {
        console.error('Error updating payment:', error);
        throw error;
    }
};

exports.deletePayment = async (id) => {
    console.log(`Deleting payment with ID ${id}`);
    try {
        const payment = await PaymentModel.findByPk(id);
        if (!payment) {
            console.error(`Payment with ID ${id} not found`);
            throw new Error(`Payment with ID ${id} not found`);
        }
        await payment.destroy();
        console.log('Payment deleted:', payment);
        return payment;
    } catch (error) {
        console.error('Error deleting payment:', error);
        throw error;
    }
};