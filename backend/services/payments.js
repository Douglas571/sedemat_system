const { Payment: PaymentModel, Person, Business, Bank, GrossIncomeInvoice, Settlement } = require('../database/models')

const ROLES = require('../utils/auth/roles');

const grossIncomeInvoiceService = require('./grossIncomeInvoiceService')


const logger = require('../utils/logger')

function checkThatIsSettlementOfficer(user) {
    // if user is not an admin, director, fiscal, or collector 
    if (!user || [ROLES.LIQUIDATOR].indexOf(user.roleId) === -1) {
        let error = new Error('User not authorized');
        error.name = 'UserNotAuthorized';
        error.statusCode = 401;
        throw error;
    }
}

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

        // updating verified status is not allowed here
        paymentData.verifiedAt = undefined
        paymentData.verifiedByUserId = undefined
        paymentData.receivedAt = undefined
        paymentData.checkedAt = undefined
        paymentData.checkedByUserId = undefined     
        
        if (prevPayment.grossIncomeInvoiceId) {
            let grossIncomeInvoice = await grossIncomeInvoiceService.getGrossIncomeInvoiceById(prevPayment.grossIncomeInvoiceId)

            if (grossIncomeInvoice.settlement) {
                let err = new Error('Payment is already associated with a settled invoice');
                err.name = "InvoiceAlreadySettledError"
                err.statusCode = 400
                throw err
            }
        }

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

exports.updateVerifiedStatus = async (id, data, user) => {
    // verify that the user is a settlement officer (ROLE.LIQUIDATOR)
    checkThatIsSettlementOfficer(user)

    // get the payment by primary key 
    const paymentData = await PaymentModel.findByPk(id, {
        include: [
            {
                model: GrossIncomeInvoice,
                as: 'grossIncomeInvoice',
                include: [
                    {
                        model: Settlement,
                        as: 'settlement'
                    }
                ]
            }
        ],
    });

    if (!paymentData) {
        console.error(`Payment with ID ${id} not found`);
        let err = new Error(`Payment with ID ${id} not found`);
        err.name = "PaymentNotFoundError"
        throw err
    }

    if (paymentData?.grossIncomeInvoice?.settlement) {
        let err = new Error('Payment is associated with a settled invoice');
        err.name = "InvoiceAlreadySettledError"
        err.statusCode = 400
        throw err
    }

    const {
        checkedAt,
        receivedAt
    } = data;

    // return the updated payment

    if (checkedAt === null) {
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
        receivedAt: receivedAt,
        checkedAt: checkedAt,
        checkedByUserId: user.id
    }, {
        where: { id }
    })
}

exports.deletePayment = async (id) => {
    logger.info(`Deleting payment with ID ${id}`);
    const payment = await PaymentModel.findByPk(id);

    if (payment.grossIncomeInvoiceId) {
        let err = new Error('Payment is already associated with an invoice');
        err.name = "InvoiceAlreadySettledError"
        err.statusCode = 400
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