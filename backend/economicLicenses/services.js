// services/economicLicenseService.js
const EconomicLicense = require('../models/economicLicense');
const EconomicActivity = require('../models/economicActivity')

exports.createEconomicLicense = async (licenseData) => {
    try {
        const newLicense = await EconomicLicense.create(licenseData);
        return newLicense;
    } catch (error) {
        throw new Error(`Unable to create license: ${error.message}`);
    }
};

exports.getEconomicLicenses = async () => {
    try {
        const licenses = await EconomicLicense.findAll({
            include: EconomicActivity
        });
        return licenses;
    } catch (error) {
        throw new Error(`Unable to retrieve licenses: ${error.message}`);
    }
};

exports.getEconomicLicenseById = async (id) => {
    try {
        const license = await EconomicLicense.findByPk(id);
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
        const [updated] = await EconomicLicense.update(updateData, {
            where: { id }
        });
        if (!updated) {
            throw new Error('License not found or not updated');
        }
        return await EconomicLicense.findByPk(id);
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