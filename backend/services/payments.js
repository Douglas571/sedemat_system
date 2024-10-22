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
                {
                    model: Bank,
                    as: 'bank'
                }
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

exports.updatePayment = async (id, paymentData, user) => {
    logger.info(`Updating payment with ID ${id} with data:`, paymentData);
    console.log({paymentData, user})

    try {
        const prevPayment = await PaymentModel.findByPk(id)

        if (!prevPayment) {
            console.error(`Payment with ID ${id} not found`);
            throw new Error(`Payment with ID ${id} not found`);
        }

        // the only way to add payments to invoice is through the dedicated method
        paymentData.grossIncomeInvoiceId = undefined;
        
        if (prevPayment.grossIncomeInvoiceId) {
            let grossIncomeInvoice = await grossIncomeInvoiceService.getGrossIncomeInvoiceById(prevPayment.grossIncomeInvoiceId)

            if (grossIncomeInvoice.settlement) {
                let err = new Error('Payment is already associated with a settled invoice');
                err.name = "InvoiceAlreadySettledError"
                throw err
            }
        }

        // if paymentData only contains verifiedAt and verifiedByUserId, you can edit

        // we count the number of properties to warrant that it is only updating the check at date. Usually, it's less than 4, it also include the id, but i will remove it later
        if (Object.keys(paymentData).length < 4 && (paymentData.checkedAt !== prevPayment.checkedAt || paymentData.receivedAt !== prevPayment.receivedAt)) {

            // unmarking the payment as verified
            if (paymentData.checkedAt === null) {
                return await PaymentModel.update({
                    receivedAt: null,
                    checkedAt: null,
                    // we preserve the checkedByUserId to know that i was unmarked by that user
                    checkedByUserId: user.id
                }, {
                    where: { id }
                })
            }

            // the user is updating the payment verification data
            return await PaymentModel.update({
                receivedAt: paymentData.receivedAt,
                checkedAt: paymentData.checkedAt,
                checkedByUserId: user.id
            }, {
                where: { id }
            })
        }

        // user is updating something else than the payment verification data
        paymentData.verifiedAt = undefined
        paymentData.verifiedByUserId = undefined
        paymentData.receivedAt = undefined
        paymentData.checkedByUserId = undefined        

        const newPaymentData = {
            ...paymentData,
            // this is to warrant
            // TODO: for what?
            businessId: prevPayment.businessId,
            personId: prevPayment.personId
        }

        if (newPaymentData.businessId && newPaymentData.personId) {
            throw new Error('Payment must have either businessId or personId, but not both');
        }        

        await prevPayment.update(paymentData);
        logger.info('Payment updated:', prevPayment);

        if (prevPayment.grossIncomeInvoiceId) {
            await grossIncomeInvoiceService.updatePaidAtProperty(prevPayment.grossIncomeInvoiceId)
        }

        return prevPayment;
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