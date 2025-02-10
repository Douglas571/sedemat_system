// services/grossIncomeService.js
const path = require('path');
const fs = require('fs');

const { GrossIncome, GrossIncomeInvoice, BranchOffice, CurrencyExchangeRates, WasteCollectionTax, Alicuota, Settlement, Business, EconomicActivity, Payment, User, Person, File, SupportFilesToGrossIncomes } = require('../database/models');
const { Op, where } = require('sequelize');

const {calculateTaxFields} = require('../utils/grossIncome')

const dayjs = require('dayjs');
const currency = require('currency.js');

const grossIncomeInvoiceService = require('./grossIncomeInvoiceService');

const ROLES = require('../utils/auth/roles');
const { UserNotAuthorizedError } = require('../utils/errors');

const fse = require('fs-extra')
const _ = require('lodash')

const filesService = require('./filesService')

function canUpdateEditDeleteGrossIncomes(user) {
    if (!user || [ROLES.FISCAL, ROLES.COLLECTOR, ROLES.ADMIN].indexOf(user.roleId) === -1) {
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

function getWasteCollectionTaxInMMV(mts2) {
    // Return 20 if mts2 is greater than or equal to 300
    if (mts2 > 300) {
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

/**
 * Generates a new empty gross income object with default values and calculated tax fields.
 *
 * @param {Object} params - The parameters for generating the empty gross income.
 * @param {Object} params.business - The business associated with the gross income.
 * @param {number} params.business.id - The ID of the business.
 * @param {Object} [params.branchOffice] - The branch office associated with the gross income (optional).
 * @param {number} [params.branchOffice.id] - The ID of the branch office.
 * @param {boolean} [params.branchOffice.chargeWasteCollection] - Whether the branch office charges waste collection.
 * @param {number} [params.branchOffice.dimensions] - The dimensions of the branch office in square meters.
 * @param {string} [params.branchOffice.type] - The type of the branch office.
 * @param {Object} params.lastAlicuota - The last applicable alicuota (tax rate) for the gross income.
 * @param {number} params.lastAlicuota.id - The ID of the alicuota.
 * @param {number} params.lastAlicuota.taxPercent - The tax percentage of the alicuota.
 * @param {number} params.lastAlicuota.minTaxMMV - The minimum tax amount in MMV-BCV for the alicuota.
 * @param {number} params.TCMMVBCV - The TCMMV-BCV (tax conversion factor) value.
 * @param {Date|string} params.period - The period for the gross income (can be a Date object or a string).
 * @param {number} params.createdByUserId - The ID of the user creating the gross income.
 * @returns {Object} - A new gross income object with default values and calculated tax fields.
 *
 * @example
 * const emptyGrossIncome = getEmptyGrossIncome({
 *   business: { id: 1 },
 *   branchOffice: { id: 2, chargeWasteCollection: true, dimensions: 100, type: 'Retail' },
 *   lastAlicuota: { id: 3, taxPercent: 0.15, minTaxMMV: 100 },
 *   TCMMVBCV: 500,
 *   period: '2023-10-01',
 *   createdByUserId: 123
 * });
 * console.log(emptyGrossIncome);
 */
function getEmptyGrossIncome({
    business,
    branchOffice,
    lastAlicuota,
    TCMMVBCV,
    period,
    createdByUserId
}) {
    let newGrossIncome = {
        businessId: business.id,
        branchOfficeId: branchOffice?.id,
        period: period,
        amountBs: null,
        grossIncomeInvoiceId: null,
        alicuotaId: lastAlicuota.id,
        alicuotaTaxPercent: lastAlicuota.taxPercent,
        alicuotaMinTaxMMVBCV: lastAlicuota.minTaxMMV,
        TCMMVBCV: TCMMVBCV,

        chargeWasteCollection: branchOffice?.chargeWasteCollection ?? false,
        branchOfficeDimensionsMts2: branchOffice?.dimensions,
        branchOfficeType: branchOffice?.type,

        wasteCollectionTaxMMVBCV: 0,
        createdAt: new Date(),
        updatedAt: new Date(),

        createdByUserId
    }

    const calcs = calculateTaxFields({grossIncome: newGrossIncome})

    newGrossIncome.period = dayjs(newGrossIncome.period).set('date', 3).toDate()

    newGrossIncome = {
        ...newGrossIncome,
        ...calcs,
    }


    return newGrossIncome
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
                },
                {
                    model: File,
                    as: 'supportFiles'
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
            
            if (process.env.NODE_ENV === 'dev') {
                console.log({calcs})
            }

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

            let where = {
                period: data.period,
                branchOfficeId: data.branchOfficeId || grossIncome.branchOfficeId
            }

            if (!data.branchOffice) {
                where.businessId = data.businessId
            }

            const existingIncome = await GrossIncome.findOne({where})
            
            if (existingIncome && existingIncome.id !== Number(id)) {
                let err = new Error('Gross income already exists for the same period and branch office');
                err.name = 'GrossIncomePeriodDuplicated';
                throw err;
            }
        }
        


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

        await filesService.bulkDelete(supportFilesIds, user)

        // TODO: Analyze if this is needed or not
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
                },
                {
                    model: GrossIncomeInvoice,
                    as: 'grossIncomeInvoice'
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

    async addSupportFiles(grossIncomeId, supportFilesIds, user) {
        try {
            // Perform authorization check if needed
            canUpdateEditDeleteGrossIncomes(user)

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
            canUpdateEditDeleteGrossIncomes(user)

            await filesService.bulkDelete(supportFilesIds, user)

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async editNote(id, data, user) {
        // Check that user can edit gross income
        canUpdateEditDeleteGrossIncomes(user);

        // Get the gross income
        const grossIncome = await GrossIncome.findByPk(id);

        // Check that it exists
        if (!grossIncome) {
            throw new Error('Gross Income not found');
        }

        // Save the updated gross income
        await GrossIncome.update(data, {
            where: { id }
        })
        // Return edited gross income
        return grossIncome;
    }

    async fillEmptyRecords({ filters, user }) {
        
        console.log({filters, user})

        let createdByUserId = user.id
        
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

        let startDate = dayjs(filters.startDate)
        let endDate = dayjs(filters.endDate)

        let business = await Business.findByPk(filters.businessId, {
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
            ]
        })

        console.log({business})

        let branchOffice = await BranchOffice.findByPk(filters.branchOfficeId)

        let lastAlicuota = business.economicActivity.alicuotaHistory.sort((a, b) => b.id - a.id)[0]

        const lastCurrencyExchangeRate = await CurrencyExchangeRates.findOne({
            order: [
                ['createdAt', 'DESC']
            ],
            limit: 1
        })

        let TCMMVBCV = Math.max(lastCurrencyExchangeRate.dolarBCVToBs, lastCurrencyExchangeRate.eurosBCVToBs)

        // get existing gross income months for this branch office and business
        let existingGrossincomes = await GrossIncome.findAll({
            where: {
                period: {
                    [Op.between]: [
                        startDate.startOf('month').toDate(),
                        endDate.endOf('month').toDate()
                    ]
                },
                businessId: filters.businessId,
                branchOfficeId: filters.branchOfficeId
            }
        })
        // make an array of existing months 
        console.log({existingGrossincomes})
        let existingMonths = existingGrossincomes.map( g => {
            return dayjs(g.period)
        })

        let toInsert = []

        // create just one record 
        if (filters.startDate === filters.endDate) {

            let period = startDate.set('date', 3).toDate()

            let newGrossIncome = getEmptyGrossIncome({
                business,
                branchOffice,
                lastAlicuota,
                TCMMVBCV,
                period,
                createdByUserId
            })

            toInsert.push(newGrossIncome)
            
        } else { // create gross income records in the range
            while (startDate.isSameOrBefore(endDate, 'month')) {
                

                if (!existingMonths.some( m => m.isSame(startDate, 'month'))) {
                    console.log(startDate.format())

                    let period = startDate.set('date', 3).toDate()

                    let newGrossIncome = getEmptyGrossIncome({
                        business,
                        branchOffice,
                        lastAlicuota,
                        TCMMVBCV,
                        period,
                        createdByUserId
                    })

                    toInsert.push(newGrossIncome)
                }

                startDate = startDate.add(1, 'month')
            }
        }

        let response = await GrossIncome.bulkCreate(toInsert)

        return
    }

     /**
     * Creates a new GrossIncome record for each active business and its branch offices for the given period
     * @param {Object} data - an object with the period and year and month
     * @param {User} user - the user that is creating the gross income
     * @returns {Promise<Object>} - an object with the number of gross incomes created
     * @throws {Error} - if the user is not authorized
     */
    async fillEmptyManyRecords({ user, period }) {
        period = dayjs(period).set('date', 3)

        let createdByUserId = user.id
        
        let grossIncomesToBeCreated = []

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

        const lastCurrencyExchangeRate = await CurrencyExchangeRates.findOne({
            order: [
                ['createdAt', 'DESC']
            ],
            limit: 1
        })

        let TCMMVBCV = Math.max(lastCurrencyExchangeRate.dolarBCVToBs, lastCurrencyExchangeRate.eurosBCVToBs)

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
        
        businesses.forEach((business) => {
            // TODO: Reimplement this using a new column called "usedSinceDate"
            let lastAlicuota = business.economicActivity.alicuotaHistory.sort((a, b) => b.id - a.id)[0]


            // TODO: Replace this for inactivity periods or exonerated periods when implemented
            if (!business.isActive) {
                return 
            }
            
            if (business?.branchOffices?.length > 0 && business?.branchOffices.some( b => b.isActive )) {
                // otherwise, create gross incomes for each branch office

                business.branchOffices.forEach((branchOffice) => {

                    if (!branchOffice.isActive) {
                        return null
                    }
                    
                    const grossIncomeAlreadyExists = business.grossIncomes.find((grossIncome) => dayjs(grossIncome.period).isSame(period, 'month') && dayjs(grossIncome.period).isSame(period, 'year') && grossIncome.branchOfficeId === branchOffice.id)

                    if (!grossIncomeAlreadyExists) {
                        let grossIncomeToInsert = getEmptyGrossIncome({
                            business,
                            branchOffice,
                            lastAlicuota,
                            TCMMVBCV,
                            period,
                            createdByUserId
                        })

                        grossIncomesToBeCreated.push(grossIncomeToInsert)
                    }
                })

            } else {
                // handle if it don't have branch offices
                // create the gross incomes

                // check that the gross income didn't exists 
                const grossIncomeAlreadyExists = business.grossIncomes.find((grossIncome) => dayjs(grossIncome.period).isSame(period, 'month') && dayjs(grossIncome.period).isSame(period, 'year') && grossIncome.branchOfficeId === null)

                if (!grossIncomeAlreadyExists) {
                    const grossIncomeToInsert = getEmptyGrossIncome({
                        business,
                        lastAlicuota,
                        TCMMVBCV,
                        period,
                        createdByUserId
                    })

                    grossIncomesToBeCreated.push(grossIncomeToInsert)
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
}

module.exports = new GrossIncomeService();