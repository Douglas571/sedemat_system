const economicLicenseService = require('../services/economicLicenses');
const logger = require('../utils/logger');

class EconomicLicenseController {
    async createEconomicLicense(req, res) {
        try {
            const newLicense = await economicLicenseService.createEconomicLicense(req.body);
            res.status(201).json(newLicense);
        } catch (error) {
            console.log({error});
            logger.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async getEconomicLicenses(req, res) {
        try {
            const licenses = await economicLicenseService.getEconomicLicenses();
            res.status(200).json(licenses);
        } catch (error) {
            logger.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async getEconomicLicenseById(req, res) {
        try {
            const license = await economicLicenseService.getEconomicLicenseById(req.params.id);
            res.status(200).json(license);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateEconomicLicense(req, res) {
        try {
            const updatedLicense = await economicLicenseService.updateEconomicLicense(req.params.id, req.body);
            res.status(200).json(updatedLicense);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteEconomicLicense(req, res) {
        try {
            await economicLicenseService.deleteEconomicLicense(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new EconomicLicenseController();