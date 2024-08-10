const {EconomicActivity} = require('../database/models');
const logger = require("../utils/logger")

exports.createEconomicActivity = async (data) => {
    try {
        return await EconomicActivity.create(data);
    } catch (error) {
        logger.error("Error in economic activity create service")
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