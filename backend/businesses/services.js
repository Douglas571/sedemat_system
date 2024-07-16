const Business = require('../models/business');

// Get all businesses
exports.getAllBusinesses = async () => {
    return await Business.findAll();
};

// Get business by ID
exports.getBusinessById = async (id) => {
    return await Business.findByPk(id);
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