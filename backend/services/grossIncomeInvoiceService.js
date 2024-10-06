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
} = require('../database/models');

const currency = require('currency.js');


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
    if (mts2 >= 50) {
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

function canBeSettled({grossIncomes, payments, formPriceBs = 0}) {
    let total = 0
    let totalPayments = 0

    // get sub total for each grossIncome
    grossIncomes.forEach(grossIncome => {
        // console.log({grossIncome})
        
        let { TCMMVBCV, alicuotaTaxPercent, alicuotaMinTaxMMVBCV, branchOfficeDimensionsMts2 } = grossIncome
        
        let subTotal = getGrossIncomeTaxSubTotalInBs({
            grossIncomeInBs: grossIncome.amountBs,
            alicuota: alicuotaTaxPercent,
            minTaxMMV: alicuotaMinTaxMMVBCV,
            MMVToBs: TCMMVBCV,
            chargeWasteCollection: grossIncome.chargeWasteCollection,
            branchOfficeDimensions: branchOfficeDimensionsMts2
        })

        total = currencyHandler(total).add(subTotal).value
    })

    // add the form price 
    total = currencyHandler(total).add(formPriceBs).value

    // get total in payments 
    totalPayments = payments
        .reduce((total, payment) => currencyHandler(total).add(payment.amount).value, 0)

    console.log({total, totalPayments})

    // if total in payments === total in grossIncomes return true
    if (total === totalPayments) {
        return true
    } 

    return false
}

class GrossIncomeInvoiceService {
    // Fetch all GrossIncomeInvoice records
    async getAllGrossIncomeInvoices() {
        return await GrossIncomeInvoice.findAll({
            include: [
                {
                    model: GrossIncome,
                    as: 'grossIncomes'
                },
                {
                    model: Settlement,
                    as: 'settlement',
                    
                }
            ]
        });
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
                formPriceBs: grossIncomeInvoice.formPriceBs
            })
        }


        return returnedGrossIncomeInvoices;
    }

    // Create a new GrossIncomeInvoice record
    async createGrossIncomeInvoice(data, user = {}) {
        // return await GrossIncomeInvoice.create(newGrossIncomeInvoice);
        console.log("Executing gross income invoice create")

        let newGrossIncomeInvoice = {
            ...data,
            createdByUserId: user.id,
        }

        if (newGrossIncomeInvoice?.grossIncomesIds?.length === 0) {
            throw new Error("Include at least one gross income id within grossIncomesIds")
        }

        const newRegisteredInvoice = await GrossIncomeInvoice.create(newGrossIncomeInvoice);
        await GrossIncome.update({ grossIncomeInvoiceId: newRegisteredInvoice.id }, { where: { id: newGrossIncomeInvoice.grossIncomesIds } });

        return {newGrossIncomeInvoice}
    }

    // Update an existing GrossIncomeInvoice record by ID
    async updateGrossIncomeInvoice(id, data, user = {}) {
        const grossIncomeInvoice = await this.getGrossIncomeInvoiceById(id);

        if (!grossIncomeInvoice) {
            throw new Error('GrossIncomeInvoice not found');
        }

        // if gross income is paid, don't allow any other property aside of paidAt

        // check if it has a settlement 
        if (grossIncomeInvoice.paidAt !== null && Object.keys(data).length > 1) {
            throw new Error('This invoice is already paid, only paidAt can be updated for a paid invoice');
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
        if (data.paidAt && grossIncomeInvoice.paidAt === null) {
            data.settledByUserId = user.id


            // // TODO: in this case, we have to create a new settlement, with:
            // let newSettlement = await Settlement.create({
            //     settledByUserId: user.id,
            //     grossIncomeInvoiceId: id,
            //     code: data.settlementCode
            // })

            // console.log({newSettlement})
                // the user data
                // the gross income invoice id
                // assign a code to the settlement
        }
        
        return await GrossIncomeInvoice.update(data, { where: { id } });
    }

    // Delete a GrossIncomeInvoice record by ID
    async deleteGrossIncomeInvoice(id) {

        const grossIncomeInvoice = await GrossIncomeInvoice.findByPk(id);

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

    async addPayment(grossIncomeInvoiceId, paymentId) {
        // lock for the payment and add the gross income id
        console.log({grossIncomeInvoiceId, paymentId})
        const payment = await Payment.findByPk(paymentId)

        if (payment.grossIncomeInvoiceId) {
            throw new Error('This payment is already associated with an invoice.');
        }

        payment.grossIncomeInvoiceId = grossIncomeInvoiceId
        await payment.save()

        return payment
    }

    async removePayment(paymentId) {
        console.log({paymentId})
        const payment = await Payment.findByPk(paymentId)
        payment.grossIncomeInvoiceId = null
        await payment.save()
        return payment
    }

    // TODO: for future use case
    // async markAsSettled(id, { settlement }) {
    //     if (!settlement) {
    //         let error = new Error('Settlement data is required')
    //         error.name = 'ValidationError'
    //         throw error
    //     }
    //     // create a new settlement
    //     let createdSettlement = await Settlement.create({
    //         grossIncomeInvoiceId: id,
    //         settledByUserId: settlement.settledByUserId,
    //         code: settlement.code
    //     })

    //     // return the settlement id
    //     return createdSettlement
    // }
}

module.exports = new GrossIncomeInvoiceService();