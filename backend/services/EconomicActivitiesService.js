const { EconomicActivity } = require('../database/models');

class EconomicActivityService {
    // Fetch all EconomicActivity records
    async getAllEconomicActivities() {
        return await EconomicActivity.findAll();
    }

    // Fetch a single EconomicActivity by ID
    async getEconomicActivityById(id) {
        return await EconomicActivity.findByPk(id);
    }

    // Create a new EconomicActivity record
    async createEconomicActivity(data) {
        return await EconomicActivity.create(data);
    }

    // Update an existing EconomicActivity record by ID
    async updateEconomicActivity(id, data) {
        const economicActivity = await this.getEconomicActivityById(id);

        if (!economicActivity) {
            throw new Error('EconomicActivity not found');
        }

        return await economicActivity.update(data);
    }

    // Delete a EconomicActivity record by ID
    async deleteEconomicActivity(id) {
        const economicActivity = await this.getEconomicActivityById(id);

        if (!economicActivity) {
            throw new Error('EconomicActivity not found');
        }
        return await economicActivity.destroy();
    }
}

module.exports = new EconomicActivityService();
