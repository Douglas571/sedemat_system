// services/grossIncomeService.js
const { GrossIncome, BranchOffice, CurrencyExchangeRates, WasteCollectionTax } = require('../database/models');

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
                }
            ]
        });
        if (!grossIncome) {
            throw new Error('GrossIncome not found');
        }
        console.log('grossIncome', grossIncome.toJSON())

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
}

module.exports = new GrossIncomeService();