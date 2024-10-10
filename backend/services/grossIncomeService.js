// services/grossIncomeService.js
const { GrossIncome, GrossIncomeInvoice, BranchOffice, CurrencyExchangeRates, WasteCollectionTax, Alicuota, Settlement } = require('../database/models');
const dayjs = require('dayjs');
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

function calculateTaxFields({grossIncome}) {
    let calcs = {
        taxInBs: 0,
        minTaxInBs: 0,
        wasteCollectionTaxInBs: 0,
        totalTaxInBs: 0
    }

    calcs.taxInBs = currencyHandler(grossIncome.amountBs).multiply(grossIncome.alicuotaTaxPercent).value

    calcs.minTaxInBs = currencyHandler(grossIncome.alicuotaMinTaxMMVBCV).multiply(grossIncome.TCMMVBCV).value

    calcs.wasteCollectionTaxInBs = currencyHandler(grossIncome.wasteCollectionTaxMMVBCV).multiply(grossIncome.TCMMVBCV).value

    calcs.totalTaxInBs = currencyHandler(Math.max(calcs.taxInBs, calcs.minTaxInBs)).add(calcs.wasteCollectionTaxInBs).value

    return calcs

}

class GrossIncomeService {
    // Fetch all GrossIncome records
    async getAllGrossIncomes() {
        return await GrossIncome.findAll({
            include: [
                {
                    model: Alicuota,
                    as: 'alicuota'
                },
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
            ]
        });
    }

    // Fetch a single GrossIncome by ID
    async getGrossIncomeById(id) {
        return await GrossIncome.findByPk(id, {
            include: [
                {
                    model: BranchOffice,
                    as: 'branchOffice'
                },
                {
                    model: CurrencyExchangeRates,
                    as: 'currencyExchangeRate'
                },
                {
                    model: WasteCollectionTax,
                    as: 'wasteCollectionTax'
                },
                {
                    model: Alicuota,
                    as: 'alicuota'
                }
            ]
        });
    }

    // Create a new GrossIncome record
    async createGrossIncome(newGrossIncome) {
        newGrossIncome.period = dayjs(newGrossIncome.period).set('date', 3).toDate()

        console.log({newGrossIncome})

        // check if there is already a gross income with the same period and branchOfficeId
        const existingGrossIncome = await GrossIncome.findOne({
            where: {
                period: newGrossIncome.period,
                branchOfficeId: newGrossIncome.branchOfficeId
            }
        });

        // Calculate taxes fields
        const calcs = calculateTaxFields({grossIncome: newGrossIncome})
        console.log({calcs})

        newGrossIncome = {
            ...newGrossIncome,
            ...calcs
        }
        
        if (existingGrossIncome) {  
            throw new Error('Gross income already exists for the same period and branch office');
        }

        let wasteCollectionTax

        if (newGrossIncome.chargeWasteCollection && newGrossIncome.branchOfficeId) {
            wasteCollectionTax = await WasteCollectionTax.create({
                period: newGrossIncome.period,
                branchOfficeId: newGrossIncome.branchOfficeId
            });
            newGrossIncome.wasteCollectionTaxId = wasteCollectionTax.id;
        }

        return await GrossIncome.create(newGrossIncome);
    }

    // Update an existing GrossIncome record by ID
    async updateGrossIncome(id, data) {

        const grossIncome = await this.getGrossIncomeById(id, {
            include: [
                {
                    model: BranchOffice,
                    as: 'branchOffice'
                }, 
                {
                    model: GrossIncomeInvoice,
                    as: 'grossIncomeInvoice'
                }
            ]
        });

        if (!grossIncome) {
            throw new Error('Gross Income not found');
        }

        let invoice = grossIncome?.grossIncomeInvoiceId && await GrossIncomeInvoice.findByPk(grossIncome.grossIncomeInvoiceId, {
            include: [
                {
                    model: Settlement,
                    as: 'settlement'
                }
        ]})

        if (invoice?.paidAt) {
            let err = new Error('Gross Income has a settled invoice associated')
            err.name = "InvoiceAlreadyPaid"
            throw err
        }

        if (invoice?.settlement) {
            let err = new Error('Gross Income has a settled invoice associated')
            err.name = "InvoiceAlreadySettled"
            throw err
        }

        // console.log({grossIncomeOriginal: grossIncome})

        if (data.period) {
            data.period = dayjs(data.period).set('date', 3).toDate()

            const existingIncome = await GrossIncome.findOne({
                where: {
                    period: data.period,
                    branchOfficeId: data.branchOfficeId || grossIncome.branchOfficeId
                }
            })
            
            if (existingIncome && existingIncome.id !== Number(id)) {
                let err = new Error('Gross income already exists for the same period and branch office');
                erro.name = 'GrossIncomePeriodDuplicated';
                throw err;
            }
        }
        

        // if chargeWasteCollectionTax is null, then we need to disassociate the waste collection tax
        // TODO: DELETE THIS AT SOME POINT WHEN YOU HAVE TESTS
        let wasteCollectionTax

        if (grossIncome.wasteCollectionTaxId) {
            wasteCollectionTax = await WasteCollectionTax.findByPk(grossIncome.wasteCollectionTaxId)
        }

        if (data.chargeWasteCollection && !grossIncome.wasteCollectionTaxId) {
            wasteCollectionTax = await WasteCollectionTax.create({
                period: data.period,
                branchOfficeId: data.branchOfficeId || grossIncome.branchOfficeId
            });
            console.log({newWasteCollectionTax: wasteCollectionTax.toJSON()})
            data.wasteCollectionTaxId = wasteCollectionTax.id;
        } 
        
        
        if (!data.chargeWasteCollection) {
            data.wasteCollectionTaxId = null

            if (data.wasteCollectionTaxId) {
                wasteCollectionTax.destroy()
            }
        }

        if (wasteCollectionTax && (data.period !== wasteCollectionTax.period)){
            wasteCollectionTax.update({period: data.period})
        }
        // DELETE EVERYTHING ABOVE WHEN YOU HAVE TESTS

        // Recalculate tax fields
        const calcs = calculateTaxFields({grossIncome: data})
        console.log({calcs})

        data = {
            ...data,
            ...calcs
        }
        
        return await grossIncome.update(data);
    }

    // Delete a GrossIncome record by ID
    async deleteGrossIncome(id) {
        const grossIncome = await this.getGrossIncomeById(id);

        if (grossIncome.grossIncomeInvoiceId) {
            throw new Error('GrossIncome is already associated with an invoice');
        }

        if (!grossIncome) {
            throw new Error('GrossIncome not found');
        }
        return await grossIncome.destroy();
    }

    async getAllGrossIncomesByBusinessId(businessId) {
        return await GrossIncome.findAll({
            where: {
                businessId: businessId
            },
            include: [
                {
                    model: BranchOffice,
                    as: 'branchOffice'
                },
                {
                    model: CurrencyExchangeRates,
                    as: 'currencyExchangeRate'
                },
                {
                    model: WasteCollectionTax,
                    as: 'wasteCollectionTax'
                },
                {
                    model: Alicuota,
                    as: 'alicuota'
                }
            ]
        });
    }

    async getAllGrossIncomesByInvoiceId(invoiceId) {
        return await GrossIncome.findAll({
            where: {
                grossIncomeInvoiceId: invoiceId
            },
            include: [
                {
                    model: BranchOffice,
                    as: 'branchOffice'
                },
                {
                    model: CurrencyExchangeRates,
                    as: 'currencyExchangeRate'
                },
                {
                    model: WasteCollectionTax,
                    as: 'wasteCollectionTax'
                },
                {
                    model: Alicuota,
                    as: 'alicuota'
                }
            ]
        });
    }
}

module.exports = new GrossIncomeService();