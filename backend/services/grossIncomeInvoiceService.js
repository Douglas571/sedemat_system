// services/grossIncomeInvoiceService.js
const {
    GrossIncomeInvoice,
    GrossIncome,
    CurrencyExchangeRates,
    Payment,
    Person,
    User,
    Settlement,
    Alicuota,
    BranchOffice,
    WasteCollectionTax,
    Penalty,
    PenaltyType,
    Bank,
    File
} = require('../database/models');

const currency = require('currency.js');

const ROLES = require('../utils/auth/roles');
const { UserNotAuthorizedError } = require('../utils/errors');

const canCreateUpdateDeleteGrossIncomeInvoice = (user) => {
    if (!user || [ROLES.FISCAL, ROLES.COLLECTOR].indexOf(user.roleId) === -1) {
        let error = new UserNotAuthorizedError('Only tax collectors and fiscal can modify gross incomes');
        throw error
    }
}

const currencyHandler = (value) => currency(value, 
    { 
        // symbol: 'Bs.', 
        pattern: '#', 
        precision: 4,
        separator: '.',
        decimal: ','
    }
)

function getMMVExchangeRate(currencyExchangeRate) {
	return Math.max(currencyExchangeRate.dolarBCVToBs, currencyExchangeRate.eurosBCVToBs)
}

// TODO: Create a global variable for the waste collection tax
function getWasteCollectionTaxInMMV(mts2) {
    // Return 20 if mts2 is greater than or equal to 300
    if (mts2 >= 300) {
        return 20;
    }

    // Return 10 if mts2 is greater than or equal to 50
    if (mts2 > 50) {
        return 10;
    }

    // Return 5 if mts2 is greater than or equal to 0
    if (mts2 >= 0) {
        return 5;
    }

    // Return 0 if none of the conditions are met
    return 0;
}

// TODO: update the variable names to be more descriptive
function getGrossIncomeTaxSubTotalInBs({
    grossIncomeInBs,
    alicuota,
    minTaxMMV,
    MMVToBs,
    chargeWasteCollection,
    branchOfficeDimensions
}) {
    let taxInBs = currencyHandler(grossIncomeInBs).multiply(alicuota).value
    let minTaxInBs = currencyHandler(minTaxMMV).multiply(MMVToBs).value
    let wasteCollectionTax = 0

    if (chargeWasteCollection) {
        let MMVTax = getWasteCollectionTaxInMMV(branchOfficeDimensions)
        wasteCollectionTax = currencyHandler(MMVToBs).multiply(MMVTax).value
    }

    return Math.max(taxInBs, minTaxInBs) + wasteCollectionTax
}

function canBeSettled({
    grossIncomes, 
    payments, 
    formPriceBs = 0,

    TCMMVBCV,
    penalties = [],
}) {

    if (!TCMMVBCV) {
        throw new Error('TCMMVBCV is required')
    }

    let total = 0
    let totalPayments = 0

    // get sub total for each grossIncome
    grossIncomes.forEach(grossIncome => {
        // console.log({grossIncome})
        
        let { TCMMVBCV, alicuotaTaxPercent, alicuotaMinTaxMMVBCV, branchOfficeDimensionsMts2 } = grossIncome
        
        let subTotal = grossIncome.totalTaxInBs

        total = currencyHandler(total).add(subTotal).value
    })

    // add penalties
    penalties.forEach(penalty => {
        let penaltyTotal = currencyHandler(penalty.amountMMVBCV).multiply(TCMMVBCV).value
        console.log({TCMMVBCV, penalty, penaltyTotal})
        total = currencyHandler(total).add(penaltyTotal).value
    })


    // add the form price 
    total = currencyHandler(total).add(formPriceBs).value

    // get total in payments 
    totalPayments = payments
        .reduce((total, payment) => currencyHandler(total).add(payment.amount).value, 0)

    // console.log({total, totalPayments})

    if (payments.some( p => !p.isVerified)) {
        return false
    }

    // if total in payments === total in grossIncomes return true
    if (total === totalPayments) {
        return true
    } 

    return false
}

const _ = require('lodash');

class GrossIncomeInvoiceService {
    
    /**
     * Fetch all GrossIncomeInvoice records. If the toSettle option is true, 
     * only return the ones that are not settled and are paid (all payments are verified)
     * @param {Object} user current user
     * @param {Object} filters filters to be applied to the query.
     * @param {boolean} filters.toFix if true, only return the ones that are pending to be fixed
     * @param {boolean} filters.toSettle if true, only return the ones that are not settled and are paid (all payments are verified)
     * @returns {Promise<Array<IGrossIncomeInvoice>>} an array of GrossIncomeInvoice objects
     */
    async getAllGrossIncomeInvoices(user, filters = {}) {
        let invoices = await GrossIncomeInvoice.findAll({
            where: {
                ..._.pick(filters, ['toFix'])
            },
            include: [
                {
                    model: GrossIncome,
                    as: 'grossIncomes'
                },
                {
                    model: Settlement,
                    as: 'settlement',
                },
                {
                    model: Payment,
                    as: 'payments',
                }
            ]
        });

        if (filters.toSettle) {
            invoices = invoices.filter(invoice => {
                if (invoice.settlement) {
                    return false
                }

                // if is paid and all payments are verified
                if (invoice.paidAt && invoice.payments.every(payment => payment.isVerified)) {
                    return true
                }
            });
        }

        return invoices.map(invoice => invoice.toJSON());
    }

    // Fetch a single GrossIncomeInvoice by ID
    // this function will return a full version of gross income invoice
    async getGrossIncomeInvoiceById(id) {
        let grossIncomeInvoice = await GrossIncomeInvoice.findByPk(id, {
            include: [
                {
                    model: GrossIncome,
                    as: 'grossIncomes',
                    include: [
                        {
                            model: CurrencyExchangeRates,
                            as: 'currencyExchangeRate'
                        },
                        {
                            model: Alicuota,
                            as: 'alicuota'
                        },
                        {
                            model: WasteCollectionTax,
                            as: 'wasteCollectionTax'
                        },
                        {
                            model: BranchOffice,
                            as: 'branchOffice',
                        },
                        {
                            model: File,
                            as: 'supportFiles'
                        }
                    ]
                },
                {
                    model: Settlement,
                    as: 'settlement',
                    include: [
                        {
                            model: User,
                            as: 'settledByUser',
                            include: [
                                {
                                    model: Person,
                                    as: 'person'
                                }
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: 'createdByUser',
                    include: [
                        {
                            model: Person,
                            as: 'person'
                        }
                    ]
                }, 
                {
                    model: User,
                    as: 'settledByUser',
                    include: [
                        {
                            model: Person,
                            as: 'person'
                        }
                    ]
                },
                {
                    model: Payment,
                    as: 'payments'
                },
                {
                    model: Penalty,
                    as: 'penalties',
                    include: [
                        {
                            model: PenaltyType,
                            as: 'penaltyType'
                        },
                        {
                            model: User,
                            as: 'createdByUser',
                            include: [
                                {
                                    model: Person,
                                    as: 'person'
                                }
                            ]
                        },
                        {
                            model: User,
                            as: 'revokedByUser',
                            include: [
                                {
                                    model: Person,
                                    as: 'person'
                                }
                            ]
                        }
                    ]
                },
                
                {
                    model: Bank,
                    as: 'firstBankAccount'
                },
                {
                    model: Bank,
                    as: 'secondBankAccount'
                }
                
            ]
        });

        if (!grossIncomeInvoice) {
            throw new Error('GrossIncomeInvoice not found'); 
        }

        let returnedGrossIncomeInvoices = {
            ...grossIncomeInvoice?.toJSON(),
            canBeSettled: canBeSettled({
                grossIncomes: grossIncomeInvoice.grossIncomes,
                payments: grossIncomeInvoice.payments,
                formPriceBs: grossIncomeInvoice.formPriceBs,
                ...grossIncomeInvoice.toJSON() // to pass all properties like TCMMVBCV
            })
        }


        return returnedGrossIncomeInvoices;
    }

    // Create a new GrossIncomeInvoice record
    async createGrossIncomeInvoice(data, user = {}) {
        // return await GrossIncomeInvoice.create(newGrossIncomeInvoice);
        canCreateUpdateDeleteGrossIncomeInvoice(user)

        let newGrossIncomeInvoice = {
            ...data,
            createdByUserId: user.id,
        }

        if (newGrossIncomeInvoice?.grossIncomesIds?.length === 0) {
            throw new Error("Include at least one gross income id within grossIncomesIds")
        }

        const newRegisteredInvoice = await GrossIncomeInvoice.create(newGrossIncomeInvoice);

        // validate that this gross income is not already asigned to another invoice 
        await GrossIncome.update({ grossIncomeInvoiceId: newRegisteredInvoice.id }, { where: { id: newGrossIncomeInvoice.grossIncomesIds } });

        return {newGrossIncomeInvoice}
    }

    // Update an existing GrossIncomeInvoice record by ID
    async updateGrossIncomeInvoice(id, data, user = {}) {

        canCreateUpdateDeleteGrossIncomeInvoice(user)

        const grossIncomeInvoice = await this.getGrossIncomeInvoiceById(id, {
            include: [
                {
                    model: Settlement,
                    as: 'settlement'
                }
            ]
        });

        if (!grossIncomeInvoice) {
            throw new Error('GrossIncomeInvoice not found');
        }

        // if gross income is paid, don't allow any other property aside of paidAt

        // check if it has a settlement 
        // if (grossIncomeInvoice.paidAt || grossIncomeInvoice.settlement) {
            if (grossIncomeInvoice.settlement) {
            let err = new Error('This invoice is already paid');
            err.name = 'InvoiceAlreadyPaid';
            throw err
        }

        // check if should add new gross incomes 
        if (data?.grossIncomesIds?.length > 0) {
            await GrossIncome.update({ grossIncomeInvoiceId: id }, { where: { id: data.grossIncomesIds } });
        }

        // check if should remove gross incomes
        if (data?.removeGrossIncomesIds?.length > 0) {
            await GrossIncome.update({ grossIncomeInvoiceId: null }, { where: { id: data.removeGrossIncomesIds } });
        }

        // check if it is being paid for the first time
        // if (data.paidAt && grossIncomeInvoice.paidAt === null) {
        //     data.settledByUserId = user.id


        //     // // TODO: in this case, we have to create a new settlement, with:
        //     // let newSettlement = await Settlement.create({
        //     //     settledByUserId: user.id,
        //     //     grossIncomeInvoiceId: id,
        //     //     code: data.settlementCode
        //     // })

        //     // console.log({newSettlement})
        //         // the user data
        //         // the gross income invoice id
        //         // assign a code to the settlement
        // }

        // ensure that updateAt is handled by the orm 
        data.updateAt = undefined;
        
        await GrossIncomeInvoice.update(data, { where: { id } });

        let updateInvoice = await this.updatePaidAtProperty(id)

        return updateInvoice

    }

    // Delete a GrossIncomeInvoice record by ID
    async deleteGrossIncomeInvoice(id, user) {

        canCreateUpdateDeleteGrossIncomeInvoice(user)

        const grossIncomeInvoice = await GrossIncomeInvoice.findByPk(id);

        // TODO: Delete this, as it is unnecessary
        // being associated with a settlement avoid it to be deleted by default
        if (grossIncomeInvoice.paidAt !== null) {
            throw new Error('This invoice is already paid')
        }

        await GrossIncome.update({ grossIncomeInvoiceId: null }, { where: { grossIncomeInvoiceId: id } });
        await Payment.update({ grossIncomeInvoiceId: null }, { where: { grossIncomeInvoiceId: id } });

        
        if (!grossIncomeInvoice) {
            throw new Error('GrossIncomeInvoice not found');
        }
        return await grossIncomeInvoice.destroy();
    }

    // Get all GrossIncomeInvoices with associated GrossIncomes
    async getAllGrossIncomeInvoicesWithGrossIncomes() {
        return await GrossIncomeInvoice.findAll({
            include: [
                {
                    model: GrossIncome,
                    as: 'grossIncomes'
                }
            ]
        });
    }

    async addPayment(grossIncomeInvoiceId, paymentId, user) {

        canCreateUpdateDeleteGrossIncomeInvoice(user)

        // lock for the payment and add the gross income id
        console.log({grossIncomeInvoiceId, paymentId})
        const payment = await Payment.findByPk(paymentId)

        console.log({payment})

        if (payment.grossIncomeInvoiceId) {
            throw new Error('This payment is already associated with an invoice.');
        }

        payment.grossIncomeInvoiceId = grossIncomeInvoiceId

        await payment.save()

        await this.updatePaidAtProperty(grossIncomeInvoiceId)

        return payment
    }

    async removePayment(grossIncomeInvoiceId, paymentId, user) {

        canCreateUpdateDeleteGrossIncomeInvoice(user)
        
        console.log({paymentId})


        const payment = await Payment.findByPk(paymentId)

        const previousGrossIncomeInvoiceId = payment.grossIncomeInvoiceId

        if (!previousGrossIncomeInvoiceId) {
            throw new Error('This payment is not associated with an invoice.');
        }
        payment.grossIncomeInvoiceId = null

        await payment.save()
        
        await this.updatePaidAtProperty(grossIncomeInvoiceId)

        return payment
    }

    
    /**
     * Internal function to update the paidAt property of a GrossIncomeInvoice.
     * This function should not be invoked directly by users.
     * @param {number} grossIncomeInvoiceId
     * @returns {Promise<void>}
     * @public
     */
    async updatePaidAtProperty(grossIncomeInvoiceId) {
        console.log({grossIncomeInvoiceId})
        console.log("updating paid at property")

        const grossIncomeInvoice = await GrossIncomeInvoice.findByPk(grossIncomeInvoiceId, {
            include: [
                {
                    model: GrossIncome,
                    as: 'grossIncomes'
                },
                {
                    model: Payment,
                    as: 'payments'
                },
                {
                    model: Penalty,
                    as: 'penalties'
                }
            ]
        })

        // add gross incomes subtotal
        let total = grossIncomeInvoice.grossIncomes.reduce((total, grossIncome) => currencyHandler(total).add(grossIncome.totalTaxInBs).value, 0)

        
        // add penalties
        grossIncomeInvoice.penalties.forEach(penalty => {
            let penaltyTotal = currencyHandler(penalty.amountMMVBCV).multiply(grossIncomeInvoice.TCMMVBCV).value
            total = currencyHandler(total).add(penaltyTotal).value
        })

        total = currencyHandler(total).add(grossIncomeInvoice.formPriceBs).value

        const totalPayments = grossIncomeInvoice.payments.reduce((total, payment) => currencyHandler(total).add(payment.amount).value, 0)

        // get the last payment by paymentDate property in payment 
        const lastPayment = grossIncomeInvoice.payments.sort((a, b) => {
            if (a.paymentDate < b.paymentDate) {
                return 1
            }
            if (a.paymentDate > b.paymentDate) {
                return -1
            }
            return 0
        })[0]

        if (lastPayment) {
            // console.log({lastInvoicePaidAt: lastPayment.paymentDate, totalGrossIncomes, totalPayments})
        }

        let invoice 
        if (total === totalPayments) {
            invoice = await grossIncomeInvoice.update({ paidAt: lastPayment.paymentDate })
        } else {
            invoice = await grossIncomeInvoice.update({ paidAt: null })
        }        

        console.log({invoice})

        return invoice
    }

    async markAsPaid(grossIncomeInvoiceId) {
        // check if the total of gross incomes is equal to the total of payments
        await this.updatePaidAtProperty(grossIncomeInvoiceId)
    }

    async unmarkAsPaid(grossIncomeInvoiceId) {
        let invoice = await GrossIncomeInvoice.findByPk(grossIncomeInvoiceId, {
            include: [{
                model: Settlement,
                as: 'settlement'
            }]
        })

        if (invoice?.settlement) {
            let err = new Error('Gross Income has a settled invoice associated')
            err.name = 'ValidationError'
            throw err
        }

        invoice.paidAt = null

        await invoice.save()
    }

    async updateFixStatus(grossIncomeInvoiceId, user, data) { 
        console.log({grossIncomeInvoiceId, user, data})

        // check if the user is fiscal or collector 

        // get gross income
        const grossIncomeInvoice = await GrossIncomeInvoice.findByPk(grossIncomeInvoiceId, {
            include: [{
                model: Settlement,
                as: 'settlement'
            }]
        })
        
        // check that gross income is not already settled 
        if (grossIncomeInvoice.settlement) {
            let error =new Error('Gross Income has a settled invoice associated')
            error.statusCode = 404
            error.name = 'ValidationError'
            throw error
        }


        if (!grossIncomeInvoice) {
            let error = new Error('GrossIncomeInvoice not found')
            error.statusCode = 404
            error.name = 'NotFoundError'
            throw error
        }

        let newData = {
            toFix: data.toFix,
            toFixReason: data.toFixReason
        }        

        let invoice = await grossIncomeInvoice.update(newData, {
            where: {
                id: grossIncomeInvoiceId
            }
        })

        return invoice?.toJSON()
        
    }
}

module.exports = new GrossIncomeInvoiceService();