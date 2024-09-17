// services/grossIncomeService.js
const { GrossIncome, GrossIncomeInvoice, BranchOffice, CurrencyExchangeRates, WasteCollectionTax } = require('../database/models');
const dayjs = require('dayjs');

class GrossIncomeService {
    // Fetch all GrossIncome records
    async getAllGrossIncomes() {
        return await GrossIncome.findAll();
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

        console.log({grossIncomeOriginal: grossIncome})

        const invoice = grossIncome?.grossIncomeInvoiceId && await GrossIncomeInvoice.findByPk(grossIncome.grossIncomeInvoiceId)

        if (invoice?.paidAt) {
            throw new Error('Gross Income has an paid invoice associated')
        }

        if (data.period) {
            data.period = dayjs(data.period).set('date', 3).toDate()

            const existingIncome = await GrossIncome.findOne({
                where: {
                    period: data.period,
                    branchOfficeId: data.branchOfficeId || grossIncome.branchOfficeId
                }
            })
            
            if (existingIncome && existingIncome.id !== Number(id)) {
                throw new Error('Gross income already exists for the same period and branch office');
            }
        }

        // if chargeWasteCollectionTax is null, then we need to disassociate the waste collection tax
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
                }
            ]
        });
    }
}

module.exports = new GrossIncomeService();