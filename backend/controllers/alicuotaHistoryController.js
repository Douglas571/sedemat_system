const alicuotaHistoryService = require('../services/alicuotaHistoryService');

class AlicuotaHistoryController {
    async getAll(req, res) {
        try {
            const filters = req.query;
            
            const alicuotaHistories = await alicuotaHistoryService.findAll({filters});
            res.status(200).json(alicuotaHistories);
        } catch (error) {
            console.log({error})
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const alicuotaHistory = await alicuotaHistoryService.findById(req.params.id);
            if (!alicuotaHistory) {
                return res.status(404).json({ message: 'AlicuotaHistory not found' });
            }
            res.status(200).json(alicuotaHistory);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const newAlicuotaHistory = await alicuotaHistoryService.create(req.body);
            res.status(201).json(newAlicuotaHistory);
        } catch (error) {
            console.log({error})
            res.status(400).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const updatedAlicuotaHistory = await alicuotaHistoryService.update(req.params.id, req.body);
            res.status(200).json(updatedAlicuotaHistory);
        } catch (error) {
            console.log({error})
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            let result = await alicuotaHistoryService.delete(req.params.id);
            res.status(200).send({result});
        } catch (error) {
            if (error?.code === 'TheOnlyOne') {
                return res.status(400).json({ error: {
                    message: 'Cannot delete the only alicuota in use',
                    code: error.code
                } });
            }
            console.log({error})
            res.status(400).json({ error: {
                message: error.message
            } });
        }
    }
}

module.exports = new AlicuotaHistoryController();
