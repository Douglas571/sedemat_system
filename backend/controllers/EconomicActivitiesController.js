const economicActivityService = require('../services/EconomicActivitiesService');


function parseError(error) {
    if (error.original.code === 'ER_DUP_ENTRY') {
        if (Object.keys(error.fields).includes('code')) {
            return {
                message: 'Code already exists',
                code: "DuplicatedCode"
            }
        }
        
        if (Object.keys(error.fields).includes('title')) {
            return {
                message: 'Title already exists',
                code: "DuplicatedTitle"
            }
        }
    }
}
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

        // TODO: Remove alicuota and minminTaxMMV
        data.alicuota = req.body.firstAlicuota || 0
        data.minimumTax = req.body.firstMinTaxMMV || 0

        console.log({newEconomicActivity: data, ali: data.alicuota})
        try {
            const newEconomicActivity = await economicActivityService.createEconomicActivity(data, user);
            res.status(201).json(newEconomicActivity);
        } catch (error) {
            console.log({ error })

            let err = parseError(error)

            res.status(400).json({ error: err });
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

            let err = parseError(error)

            res.status(400).json({ error: err });
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
