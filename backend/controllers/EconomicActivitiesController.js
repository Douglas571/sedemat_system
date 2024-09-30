const economicActivityService = require('../services/EconomicActivitiesService');

class EconomicActivityController {
    // GET /economic-activities
    async getAll(req, res) {
        console.log("FETCHING ECONOMIC ACTIVITIES CONTROLLER")
        try {
            const economicActivities = await economicActivityService.getAllEconomicActivities();
            res.status(200).json(economicActivities);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET /economic-activities/:id
    async getById(req, res) {
        try {
            const economicActivity = await economicActivityService.getEconomicActivityById(req.params.id);
            if (!economicActivity) {
                return res.status(404).json({ message: 'EconomicActivity not found' });
            }
            res.status(200).json(economicActivity);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // POST /economic-activities
    async create(req, res) {

        let user = req.user 
        let data = req.body
        try {
            const newEconomicActivity = await economicActivityService.createEconomicActivity(data, user);
            res.status(201).json(newEconomicActivity);
        } catch (error) {
            console.log({ error })
            res.status(400).json({ error: error.message });
        }
    }

    // PUT /economic-activities/:id
    async update(req, res) {
        try {
            let user = req.user

            const updatedEconomicActivity = await economicActivityService.updateEconomicActivity(req.params.id, req.body, user);
            


            res.status(200).json(updatedEconomicActivity);
        } catch (error) {
            console.log({ error })
            res.status(400).json({ error: error.message });
        }
    }

    // DELETE /economic-activities/:id
    async delete(req, res) {
        try {
            await economicActivityService.deleteEconomicActivity(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new EconomicActivityController();
