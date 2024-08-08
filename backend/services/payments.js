const db = require("../database/models")
const PaymentModel = db.Payment

const logger = require('../utils/logger')

exports.findAll = async () => {
    logger.info('Looking into DB');
    try {
        const payments = await PaymentModel.findAll();
        //console.log({ payments });
        return payments;
    } catch (error) {
        logger.error('Error fetching payments:', error);
        throw error;
    }
};

exports.findById = async (id) => {
    logger.info(`Looking for payment with ID ${id}`);
    try {
        const payment = await PaymentModel.findByPk(id);
        if (!payment) {
            logger.error(`Payment with ID ${id} not found`);
            return null;
        }
        logger.info('Found payment:', payment);
        return payment;
    } catch (error) {
        logger.error('Error fetching payment by ID:', error);
        throw error;
    }
};

exports.createPayment = async (paymentData) => {
    logger.info('Creating new payment with data:', paymentData);
    try {
        const payment = await PaymentModel.create(paymentData);
        logger.info('Payment created:', payment);
        return payment;
    } catch (error) {
        logger.error('Error creating payment:', error.name);
        throw error;
    }
};

exports.updatePayment = async (id, paymentData) => {
    logger.info(`Updating payment with ID ${id} with data:`, paymentData);
    try {
        const payment = await PaymentModel.findByPk(id);
        if (!payment) {
            console.error(`Payment with ID ${id} not found`);
            throw new Error(`Payment with ID ${id} not found`);
        }
        await payment.update(paymentData);
        logger.info('Payment updated:', payment);
        return payment;
    } catch (error) {
        console.error('Error updating payment:', error);
        throw error;
    }
};

exports.deletePayment = async (id) => {
    logger.info(`Deleting payment with ID ${id}`);
    try {
        const payment = await PaymentModel.findByPk(id);
        if (!payment) {
            logger.error(`Payment with ID ${id} not found`);
            throw new Error(`Payment with ID ${id} not found`);
        }
        await payment.destroy();
        logger.info('Payment deleted:', payment);
        return payment;
    } catch (error) {
        console.error('Error deleting payment:', error);
        throw error;
    }
};