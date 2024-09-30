const { Alicuota } = require('../database/models');

class AlicuotaHistoryService {
    async findAll() {
        return await Alicuota.findAll();
    }

    async findById(id) {
        return await Alicuota.findByPk(id);
    }

    async create(data) {
        return await Alicuota.create(data);
    }

    async update(id, data) {
        const alicuotaHistory = await Alicuota.findByPk(id);

        if (!alicuotaHistory) {
            throw new Error('AlicuotaHistory not found');
        }
        
        return await alicuotaHistory.update(data);
    }

    async delete(id) {
        const alicuotaHistory = await Alicuota.findByPk(id);

        if (!alicuotaHistory) {
            throw new Error('Alicuota not found');
            
        }
        return await alicuotaHistory.destroy();
    }
}

module.exports = new AlicuotaHistoryService();
