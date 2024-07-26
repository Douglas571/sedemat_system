const Business = require('../models/business');
const EconomicActivity = require('../models/economicActivity')
const Person = require("../models/person")


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
            }
        ]
    });

    console.log({business})
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
    if (!business) {
        throw new Error('Business not found');
    }
    return await business.update(businessData);
};

// Delete a business
exports.deleteBusiness = async (id) => {
    const business = await Business.findByPk(id);
    if (!business) {
        throw new Error('Business not found');
    }
    return await business.destroy();
};