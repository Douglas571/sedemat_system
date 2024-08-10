// const EconomicActivity = require('../models/economicActivity')
const {Person, Business, EconomicActivity} = require("../database/models")

const logger = require('../utils/logger')


// Get all businesses
exports.getAllBusinesses = async () => {
    return await Business.findAll();
};

// Get business by ID
exports.getBusinessById = async (id) => {
    let business = await Business.findByPk(id, {
        include: [
            {
                model: EconomicActivity,
                as: 'economicActivity'
            },
            {
                model: Person,
                as: "owner"
            },
            {
                model: Person,
                as: "accountant"
            },
            {
                model: Person,
                as: "administrator"
            }
        ]
    });
    return business
};

// Register a new business
exports.createBusiness = async (businessData) => {
    const newBusiness = await Business.create(businessData);
    return newBusiness;
};
// Update a business
exports.updateBusiness = async (id, businessData) => {
    const business = await Business.findByPk(id);
    logger.info({message: "businessService.updateBusiness", businessId: id, businessData})

    if (!business) {
        throw new Error('Business not found');
    }

    let updatedBusiness = await business.update(businessData);
    return updatedBusiness
};

// Delete a business
exports.deleteBusiness = async (id) => {
    const business = await Business.findByPk(id);
    if (!business) {
        throw new Error('Business not found');
    }
    return await business.destroy();
};