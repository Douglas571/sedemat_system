const EconomicActivity = require('../models/economicActivity');

exports.createEconomicActivity = async (data) => {
    try {
        return await EconomicActivity.create(data);
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.getEconomicActivities = async () => {
    try {
        return await EconomicActivity.findAll();
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.getEconomicActivityById = async (id) => {
    try {
        return await EconomicActivity.findByPk(id);
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.updateEconomicActivity = async (id, data) => {
    try {
        await EconomicActivity.update(data, {
            where: { id }
        });
        return await EconomicActivity.findByPk(id);
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.deleteEconomicActivity = async (id) => {
    try {
        return await EconomicActivity.destroy({
            where: { id }
        });
    } catch (error) {
        throw new Error(error.message);
    }
};