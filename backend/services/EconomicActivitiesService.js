const { EconomicActivity, Alicuota } = require('../database/models');


function getCurrentAlicuota (economicActivity) {
    // TODO: Implement this with createdAt or updatedAt

    if (!economicActivity?.alicuotaHistory) {
        return null;
    }

    let currentAlicuota = economicActivity.alicuotaHistory.sort((a, b) => b.id - a.id)[0]

    // console.log({currentAlicuota})

    return currentAlicuota
}
function mapCurrentEconomicActivity(economicActivity) {
    
    let lastAlicuota = getCurrentAlicuota(economicActivity);
    //econAct.currentAlicuota = lastAlicuota;

    return {
        ...economicActivity.toJSON(),
        currentAlicuota: lastAlicuota?.toJSON()
    }
}

class EconomicActivityService {
    // Fetch all EconomicActivity records
    async getAllEconomicActivities() {
        let economicActivities = await EconomicActivity.findAll({
            include: [
                {
                    model: Alicuota,
                    as: 'alicuotaHistory'
                }
            ]
        });

        // for each econ. activity, get the last alicuota and set it into currentAlicuota
        economicActivities = economicActivities.map(mapCurrentEconomicActivity);

        return economicActivities;
    }

    // Fetch a single EconomicActivity by ID
    async getEconomicActivityById(id) {
        
        let economicActivity = await EconomicActivity.findByPk(id, {
            include: [
                {
                    model: Alicuota,
                    as: 'alicuotaHistory'
                }
            ]
        });

        economicActivity = {
            ...economicActivity.toJSON(),
            currentAlicuota: getCurrentAlicuota(economicActivity)
        }

        return economicActivity;
    }

    // Create a new EconomicActivity record
    async createEconomicActivity(data) {
        let newEconomicActivity = await EconomicActivity.create(data);
        
        let newAlicuota = await Alicuota.create({
            taxPercent: data.firstAlicuota,
            minTaxMMV: data.firstMinTaxMMV,
            economicActivityId: newEconomicActivity.id
        });

        return {
            ...newEconomicActivity.toJSON(),
            currentAlicuota: newAlicuota.toJSON()
        };
    }

    // Update an existing EconomicActivity record by ID
    async updateEconomicActivity(id, data) {
        const economicActivity = await EconomicActivity.findByPk(id);

        if (!economicActivity) {
            throw new Error('EconomicActivity not found');
        }

        return await economicActivity.update(data);
    }

    // Delete a EconomicActivity record by ID
    async deleteEconomicActivity(id) {
        const economicActivity = await EconomicActivity.findByPk(id);

        if (!economicActivity) {
            let error = new Error('Economic activity not found');
            error.code = "NotFound"
            throw error
        }

        let destroyed = await economicActivity.destroy()

        return destroyed;
    }
}

module.exports = new EconomicActivityService();
