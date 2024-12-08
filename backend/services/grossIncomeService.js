// services/grossIncomeService.js
const path = require('path');
const fs = require('fs');

const { GrossIncome, GrossIncomeInvoice, BranchOffice, CurrencyExchangeRates, WasteCollectionTax, Alicuota, Settlement, Business, EconomicActivity, Payment, User, Person, File, SupportFilesToGrossIncomes } = require('../database/models');
const { Op, where } = require('sequelize');

const dayjs = require('dayjs');
const currency = require('currency.js');

const grossIncomeInvoiceService = require('./grossIncomeInvoiceService');

const ROLES = require('../utils/auth/roles');
const { UserNotAuthorizedError } = require('../utils/errors');

const fse = require('fs-extra')
const _ = require('lodash')

const filesService = require('./filesService')

function canUpdateEditDeleteGrossIncomes(user) {
    if (!user || [ROLES.FISCAL, ROLES.COLLECTOR].indexOf(user.roleId) === -1) {
        let error = new UserNotAuthorizedError("Only fiscals and collectors can upload declarations.");
    
        throw error
    }
}

/**
 * Deletes the declaration image at the specified path
 * @param {string} imagePath path to the declaration image (relative to uploads folder)
 */
const deleteDeclarationImage = (relativeImagePath) => {
    if (relativeImagePath) {
        // go back one level to get outside of service folder 
        let imagePath = path.join(__dirname, '..', relativeImagePath)

        // join the url and remove the old one 
        console.log({imagePath})
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.log(err)
            }
        })
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

    if (grossIncome.chargeWasteCollection) {
        calcs.wasteCollectionTaxInBs = currencyHandler(grossIncome.wasteCollectionTaxMMVBCV).multiply(grossIncome.TCMMVBCV).value
    }

    calcs.totalTaxInBs = currencyHandler(Math.max(calcs.taxInBs, calcs.minTaxInBs)).add(calcs.wasteCollectionTaxInBs).value

    return calcs

}

class GrossIncomeService {
    // Fetch all GrossIncome records
    async getAllGrossIncomes(user, filters) {

        const where = {
            ..._.pick(filters, ['grossIncomeInvoiceId'])
        }

        if (filters.period) {
            where.period = {
                [Op.between]: [
                    dayjs(filters.period).startOf('month').toDate(),
                    dayjs(filters.period).endOf('month').toDate()
                ]
            }
        }

        if (filters.declaredAtStart) {
            where.declaredAt = {
                [Op.gte]: filters.declaredAtStart
            }
        }

        if (filters.declaredAtEnd) {
            where.declaredAt = {
                [Op.lte]: filters.declaredAtEnd
            }
        }

        if (where.grossIncomeInvoiceId === 'null') {
            where.grossIncomeInvoiceId = {
                [Op.eq]: null
            }
        }

        return await GrossIncome.findAll({
            where,
            include: [
                {
                    model: Alicuota,
                    as: 'alicuota'
                },
                {
                    model: Business,
                    as: 'business'
                },
                {
                    model: BranchOffice,
                    as: 'branchOffice'
                },
                {
                    model: GrossIncomeInvoice,
                    as: 'grossIncomeInvoice',
                    include: [
                        {
                            model: Settlement,
                            as: 'settlement'
                        },
                        {
                            model: Payment,
                            as: 'payments'
                        }
                    ]
                }
            ]
        });
    }

    // Fetch a single GrossIncome by ID
    async getGrossIncomeById(id) {
        let grossIncome = await GrossIncome.findByPk(id, {
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
                    as: 'updatedByUser',
                    include: [
                        {
                            model: Person,
                            as: 'person'
                        }
                    ]
                },
                {
                    model: File,
                    as: 'supportFiles'
                }
            ]
        });

        grossIncome = grossIncome.toJSON()

        grossIncome.supportFiles = grossIncome.supportFiles.map(file => {
            return _.pick(file, ['id', 'url', 'type'])
        })

        console.log({grossIncome})

        return grossIncome
    }

    // Create a new GrossIncome record
    async createGrossIncome(newGrossIncome, user) {

        try {

        
            canUpdateEditDeleteGrossIncomes(user)

            // only update gross income invoice id in the invoice service 
            newGrossIncome.grossIncomeInvoiceId = undefined

            newGrossIncome.period = dayjs(newGrossIncome.period).set('date', 3).toDate()

            // check if there is already a gross income with the same period and branchOfficeId
            let existingGrossIncome

            if (newGrossIncome.branchOfficeId) {
                existingGrossIncome = await GrossIncome.findOne({
                    where: {
                        period: newGrossIncome.period,
                        branchOfficeId: newGrossIncome.branchOfficeId
                    }
                });
            } else {
                existingGrossIncome = await GrossIncome.findOne({
                    where: {
                        period: newGrossIncome.period,
                        businessId: newGrossIncome.businessId
                    }
                })
            }

            // Calculate taxes fields
            const calcs = calculateTaxFields({grossIncome: newGrossIncome})
            console.log({calcs})

            newGrossIncome = {
                ...newGrossIncome,
                ...calcs
            }
            
            if (existingGrossIncome) {  
                let error = new Error('Gross income already exists for the same period and branch office');
                error.name = 'PeriodAlreadyExistsError';
                throw error;
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

        } catch (error) {
            // delete image
            if (newGrossIncome.declarationImage) {
                let { name, ext } = path.parse(newGrossIncome.declarationImage)
                console.log("deleting: ", name + ext)

                // ! go back one level to get out of service and enter uploads
                fse.unlink(path.join(__dirname, '..', 'uploads', 'seneat-declarations', name + ext))
            }

            throw error
        }
    }

    // Update an existing GrossIncome record by ID
    async updateGrossIncome(id, data, user) {

        canUpdateEditDeleteGrossIncomes(user)
        
        // only update gross income invoice id in the invoice service 
        data.grossIncomeInvoiceId = undefined

        const grossIncome = await GrossIncome.findByPk(id, {
            include: [
                {
                    model: BranchOffice,
                    as: 'branchOffice'
                }, 
                {
                    model: GrossIncomeInvoice,
                    as: 'grossIncomeInvoice'
                },
                {
                    model: File,
                    as: 'supportFiles'
                }
            ]
        });

        console.log({grossIncomeVerify: grossIncome})
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

        // if (invoice?.paidAt) {
        //     let err = new Error('Gross Income is already paid')
        //     err.name = "InvoiceAlreadyPaid"
        //     throw err
        // }

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
        // TODO: DELETE EVERYTHING ABOVE WHEN YOU HAVE TESTS

        // delete old image 
        // if new data declaration image is different from the old one
        if (data.declarationImage && data.declarationImage !== grossIncome.declarationImage) {
            deleteDeclarationImage(grossIncome.declarationImage)
        }
            

        // Recalculate tax fields
        const calcs = calculateTaxFields({grossIncome: data})
        console.log({calcs})

        data = {
            ...data,
            ...calcs,
            // remove support files from data to avoid updating thems
            supportFiles: undefined
        }
        
        let updatedGrossIncome = await grossIncome.update(data);
        let updatedGrossIncomeInvoice

        // update the invoice paidAt property if it exists 
        if (grossIncome.grossIncomeInvoiceId) {
            updatedGrossIncomeInvoice = await grossIncomeInvoiceService.updatePaidAtProperty(grossIncome.grossIncomeInvoiceId)
        }

        return {
            ...updatedGrossIncome.toJSON(),
            grossIncomeInvoice: updatedGrossIncomeInvoice?.toJSON()
        }
    }

    // Delete a GrossIncome record by ID
    async deleteGrossIncome(id, user) {

        canUpdateEditDeleteGrossIncomes(user)

        const grossIncome = await GrossIncome.findByPk(id, {
            include: [
                { model: File, as: 'supportFiles' }
            ]
        });

        if (grossIncome.grossIncomeInvoiceId) {
            throw new Error('GrossIncome is already associated with an invoice');
        }

        if (!grossIncome) {
            throw new Error('GrossIncome not found');
        }

        // get each support file
        let supportFilesIds = grossIncome.supportFiles.map(file => file.id);

        await filesService.bulkDelete(supportFilesIds)

        deleteDeclarationImage(grossIncome.declarationImage)



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
                },
                {
                    model: File, 
                    as: 'supportFiles'
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

    
    /**
     * Creates a new GrossIncome record for each active business and its branch offices for the given period
     * @param {Object} data - an object with the period and year and month
     * @param {User} user - the user that is creating the gross income
     * @returns {Promise<Object>} - an object with the number of gross incomes created
     * @throws {Error} - if the user is not authorized
     */
    async createUndeclaredGrossIncome({ user, data }) {

        // verify that the user is admin, collector or fiscal 
        function canCreateUndeclaredGrossIncome(user) {
            
            // if user is not an admin, director, fiscal, or collector 
            if (!user || [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.FISCAL, ROLES.COLLECTOR, ROLES.LEGAL_ADVISOR].indexOf(user.roleId) === -1) {
                let error = new Error('User not authorized');
                error.name = 'UserNotAuthorized';
                error.statusCode = 401;
                throw error;
            }
        }

        canCreateUndeclaredGrossIncome(user)

        // first get the period for the gross income record 
        let period;

        if (data.year && data.month) {
            period = dayjs(`${data.year}-${data.month}-01`).set('date', 3).toDate();
        } else {
            period = dayjs().subtract(1, 'month').set('date', 3).toDate();
        }

        const lastCurrencyExchangeRate = await CurrencyExchangeRates.findOne({
            order: [
                ['createdAt', 'DESC']
            ],
            limit: 1
        })

        console.log({period, lastCurrencyExchangeRate})

        // get a list of all business with
        const businesses = await Business.findAll({
            include: [
                {
                    model: EconomicActivity,
                    as: 'economicActivity',
                    include: [
                        {
                            model: Alicuota,
                            as: 'alicuotaHistory',
                        }
                    ]
                },
                
                {
                    model: BranchOffice,
                    as: 'branchOffices'
                },
                {
                    model: GrossIncome,
                    as: 'grossIncomes',
                }
            ]
        })

        let grossIncomesToBeCreated = []
        
        businesses.forEach((business) => {
            // TODO: Reimplement this using a new column called "usedSinceDate"
            let lastAlicuota = business.economicActivity.alicuotaHistory.sort((a, b) => b.id - a.id)[0]

            if (!business.isActive) {
                return 
            }
            
            if (business?.branchOffices?.length > 0) {
                // otherwise, create gross incomes for each branch office

                business.branchOffices.forEach((branchOffice) => {

                    if (!branchOffice.isActive) {
                        return null
                    }

                    // console.log(branchOffice.toJSON())
                    const grossIncomeToInsert = {
                        businessId: business.id,
                        branchOfficeId: branchOffice.id,
                        period: period,
                        amountBs: 0,
                        grossIncomeInvoiceId: null,
                        alicuotaId: lastAlicuota.id,
                        alicuotaTaxPercent: lastAlicuota.taxPercent,
                        alicuotaMinTaxMMVBCV: lastAlicuota.minTaxMMV,
                        TCMMVBCV: Math.max(lastCurrencyExchangeRate.dolarBCVToBs, lastCurrencyExchangeRate.eurosBCVToBs),

                        chargeWasteCollection: branchOffice.chargeWasteCollection,
                        branchOfficeDimensionsMts2: branchOffice.dimensions,
                        branchOfficeType: branchOffice.type,

                        wasteCollectionTaxMMVBCV: 0,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }

                    const grossIncomeAlreadyExists = business.grossIncomes.find((grossIncome) => dayjs(grossIncome.period).isSame(period, 'month') && dayjs(grossIncome.period).isSame(period, 'year') && grossIncome.branchOfficeId === branchOffice.id)

                    if (!grossIncomeAlreadyExists) {
                        // calculateTaxes
                        let calcs = calculateTaxFields({grossIncome: grossIncomeToInsert})

                        grossIncomesToBeCreated.push({
                            ...grossIncomeToInsert,
                            ...calcs
                        })
                    }
                })

            } else {
                // handle if it don't have branch offices
                // create the gross incomes
                const grossIncomeToInsert = {
                    businessId: business.id,
                    period: period,
                    amountBs: 0,
                    grossIncomeInvoiceId: null,
                    alicuotaId: lastAlicuota.id,
                    alicuotaTaxPercent: lastAlicuota.taxPercent,
                    alicuotaMinTaxMMVBCV: lastAlicuota.minTaxMMV,
                    TCMMVBCV: Math.max(lastCurrencyExchangeRate.dolarBCVToBs, lastCurrencyExchangeRate.eurosBCVToBs),
                    chargeWasteCollection: false,
                    wasteCollectionTaxMMVBCV: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }

                // check that the gross income didn't exists 
                const grossIncomeAlreadyExists = business.grossIncomes.find((grossIncome) => dayjs(grossIncome.period).isSame(period, 'month') && dayjs(grossIncome.period).isSame(period, 'year'))

                if (!grossIncomeAlreadyExists) {
                    // calculateTaxes
                    let calcs = calculateTaxFields({grossIncome: grossIncomeToInsert})                    

                    grossIncomesToBeCreated.push({
                        ...grossIncomeToInsert,
                        ...calcs
                    })
                }
            }

            // console.log({n: grossIncomesToBeCreated.length})    

            // console.log({grossIncomesToBeCreated})
        })

        if (grossIncomesToBeCreated.length > 0) {
            
            await GrossIncome.bulkCreate(grossIncomesToBeCreated)
        }

        return {
            grossIncomesCreated: grossIncomesToBeCreated?.length ?? 0
        }
    }

    async addSupportFiles(grossIncomeId, supportFilesIds, user) {
        try {
            // Perform authorization check if needed
            // Example: canUpdateEditDeleteGrossIncomes(user)

            // TODO: complete these services 
            // TODO: add the supportFilesToGrossIncome table

            console.log({grossIncomeId, supportFilesIds, user})

            // get the gross income with all the support files 
            let grossIncome = await GrossIncome.findOne({
                where: {
                    id: grossIncomeId
                },
                include: {
                    model: File,
                    as: 'supportFiles'
                }
            })

            console.log({grossIncome: JSON.stringify(grossIncome.toJSON(), null, 2)})

            // for each support files ids, create a SupportFilesToGrossIncomes record
            let pendingPromises = supportFilesIds.map( async (id) => {
                let createdFileAssociation = await SupportFilesToGrossIncomes.create({
                    grossIncomeId,
                    fileId: id
                })

                return createdFileAssociation.id
            })

            let createdSupportFilesIds = await Promise.all(pendingPromises)

            console.log({createdSupportFilesIds})
            
            return {
                grossIncomeId, supportFilesIds, user, createdSupportFilesIds
            }

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async removeSupportFiles(grossIncomeId, supportFilesIds, user) {
        try {
            // Perform authorization check if needed
            // Example: canUpdateEditDeleteGrossIncomes(user)

            await filesService.bulkDelete(supportFilesIds)

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}

module.exports = new GrossIncomeService();