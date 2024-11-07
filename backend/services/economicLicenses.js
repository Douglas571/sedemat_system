// services/economicLicenseService.js
const {User, EconomicLicense, EconomicActivity, Invoice, InvoiceItem, InvoiceItemType, CurrencyExchangeRates} = require('../database/models');


const InvoiceItemTypesForEconomicLicense = {
    inscription: '306010103',
    solvency: '301034900',
    advertising: '306010102',
    form: '301090101',
};

const defaultTaxCollectorUserId = 4;
const defaultCoordinatorUserId = 5;

exports.requestNewEconomicLicense = async(licenseData) => {
    // get the last currency exchange rate
    const lastCurrencyExchangeRate = await CurrencyExchangeRates.findOne({
        order: [['id', 'DESC']]
    });

    if(!lastCurrencyExchangeRate) {
        throw new Error('No currency exchange rate found');
    }

    // create a new invoice
    const newInvoice = await Invoice.create({
        businessId: licenseData.businessId,
        finalExchangeRatesId: lastCurrencyExchangeRate.id
    });

    // add invoice item with the required invoice item types for an economic license
    for (const [key, code] of Object.entries(InvoiceItemTypesForEconomicLicense)) {

        // find invoice item type where the code is equal to code
        const invoiceItemType = await InvoiceItemType.findOne({
            where: {
                code: code
            }
        });

        if (!invoiceItemType) {
            throw new Error(`Invoice item type not found for code: ${code}`);
        }

        await InvoiceItem.create({
            invoiceId: newInvoice.id,
            invoiceItemTypeId: invoiceItemType.id,
            amountMMV: invoiceItemType.defaultAmountMMV
        });
    }

    // create a new economic license
    const newLicense = await EconomicLicense.create({
        businessId: licenseData.businessId,
        checkedByUserId: licenseData.checkByUserId || defaultCoordinatorUserId, // Assuming 1 is the default checkedByUserId
        createdByUserId: licenseData.createdByUserId || defaultTaxCollectorUserId, // Use provided or default to 1
        invoiceId: newInvoice.id,
        isPaid: false,
        isSuspended: false,
        // Add other fields from licenseData as needed
    });
        
    // return the new license
    return newLicense;
};


exports.createEconomicLicense = async (licenseData) => {
    try {
        const newLicense = await EconomicLicense.create(licenseData);
        return newLicense;
    } catch (error) {
        throw new Error(`Unable to create license: ${error.message}`);
    }
};

exports.getEconomicLicenses = async ({filters}) => {
    try {
        const licenses = await EconomicLicense.findAll({
            include: [
                {
                    model: Invoice,
                    as: 'invoice'
                }
            ],
            where: {
                ...filters
            }
        });
        return licenses;
    } catch (error) {
        throw new Error(`Unable to retrieve licenses: ${error.message}`);
    }
};

exports.getEconomicLicenseById = async (id) => {
    try {
        const license = await EconomicLicense.findByPk(id, {
            include: [
                {
                    model: Invoice,
                    as: 'invoice',
                    include: [
                        {
                            model: InvoiceItem,
                            as: 'invoiceItems',
                            include: [
                                {
                                    model: InvoiceItemType,
                                    as: 'invoiceItemType'
                                }
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: 'createdBy'
                },
                {
                    model: User,
                    as: 'checkedBy'
                }
            ]
        });
        if (!license) {
            throw new Error('License not found');
        }
        return license;
    } catch (error) {
        throw new Error(`Unable to retrieve license: ${error.message}`);
    }
};

exports.updateEconomicLicense = async (id, updateData) => {
    try {
        const updatedLicense = await EconomicLicense.update(updateData, {
            where: { id }
        });

        if (!updatedLicense) {
            throw new Error('License not found or not updated');
        }
        
         // TODO: this is returning an array with the number of rows affected, improve it later
        return updatedLicense
    } catch (error) {
        throw new Error(`Unable to update license: ${error.message}`);
    }
};

exports.deleteEconomicLicense = async (id) => {
    try {
        const deleted = await EconomicLicense.destroy({
            where: { id }
        });
        if (!deleted) {
            throw new Error('License not found or not deleted');
        }
        return deleted;
    } catch (error) {
        throw new Error(`Unable to delete license: ${error.message}`);
    }
};