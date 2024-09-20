const { Payment: PaymentModel, Person, Business, Bank } = require('../database/models')

const grossIncomeInvoiceService = require('./grossIncomeInvoiceService')


const logger = require('../utils/logger')

exports.findAll = async ({filters}) => {
    logger.info('Looking into DB');

    try {
        const payments = await PaymentModel.findAll({
            include: [
                {
                    model: Person,
                    as: 'person',
                },
                {
                    model: Business,
                    as: 'business',
                },
                {
                    model: Bank,
                    as: 'bank'
                }
            ],
            where: filters
        });
        
        return payments;
    } catch (error) {
        console.log({error})
        logger.error('Error fetching payments:', error);
        throw error;
    }
};

exports.findById = async (id) => {
    logger.info(`Looking for payment with ID ${id}`);
    try {
        const payment = await PaymentModel.findByPk(id, {
            include: [
                {
                    model: Person,
                    as: 'person',
                },
                {
                    model: Business,
                    as: 'business',
                },
            ],
        });
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

    // if (paymentData.grossIncomeInvoiceId === null) {
    //     await grossIncomeInvoiceService.removePayment(paymentData.id);
    // } else if (!isNaN(paymentData.grossIncomeInvoiceId)) {
    //     await grossIncomeInvoiceService.addPayment(paymentData.grossIncomeInvoiceId, paymentData.id);
    // }
    // paymentData.grossIncomeInvoiceId = undefined;

    try {

        if (paymentData.businessId && paymentData.personId) {
            throw new Error('Payment must have either businessId or personId, but not both');
        }

        const payment = await PaymentModel.create(paymentData);
        return payment;
    } catch (error) {

        if (process.env.NODE_ENV === 'test') {
            console.log({error})
        }

        logger.error('Error creating payment:', error.name);
        throw error;
    }
};

exports.updatePayment = async (id, paymentData) => {
    logger.info(`Updating payment with ID ${id} with data:`, paymentData);

    try {
        const prevPayment = await PaymentModel.findByPk(id)
        console.log({paymentData, prevPayment: prevPayment.toJSON()})

        if (paymentData.grossIncomeInvoiceId === null) {
            await grossIncomeInvoiceService.removePayment(id);
        } else if (!isNaN(paymentData.grossIncomeInvoiceId)) {
            await grossIncomeInvoiceService.addPayment(paymentData.grossIncomeInvoiceId, id);
        }
        paymentData.grossIncomeInvoiceId = undefined;

        const newPaymentData = {
            ...paymentData,
            businessId: prevPayment.businessId,
            personId: prevPayment.personId
        }

        if (newPaymentData.businessId && newPaymentData.personId) {
            throw new Error('Payment must have either businessId or personId, but not both');
        }

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
    const payment = await PaymentModel.findByPk(id);

    if (payment.grossIncomeInvoiceId) {
        let err = new Error('Payment is already associated with an invoice');
        err.name = "AssociatedWithInvoiceError"
        throw err
    }

    if (!payment) {
        logger.error(`Payment with ID ${id} not found`);
        throw new Error(`Payment with ID ${id} not found`);
    }
    await payment.destroy();
    logger.info('Payment deleted:', payment);
    return payment;
};