const BranchOffice = require('../models/branchOffice');
const logger = require('../utils/logger');

// Create a new Branch Office
exports.createBranchOffice = async (branchOfficeData) => {
    try {
        const newBranchOffice = await BranchOffice.create(branchOfficeData);
        return newBranchOffice;
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            throw new Error('A branch office with this address already exists.');
        }
        throw error;
    }
};

// Get all Branch Offices
exports.getAllBranchOffices = async () => {
    return await BranchOffice.findAll();
};

exports.getBranchOfficesByBusinessId = async (businessId) => {
    try {
        const branchOffices = await BranchOffice.findAll({
            where: {
                businessId: businessId
            }
        });
        return branchOffices;
    } catch (error) {
        logger.error(error)
        throw new Error('Error fetching branch offices');
    }
};

// Get a Branch Office by ID
exports.getBranchOfficeById = async (id) => {
    const branchOffice = await BranchOffice.findByPk(id);
    if (!branchOffice) {
        throw new Error('Branch office not found.');
    }
    return branchOffice;
};

// Update a Branch Office
exports.updateBranchOffice = async (id, updateData) => {
    const branchOffice = await BranchOffice.findByPk(id);
    if (!branchOffice) {
        throw new Error('Branch office not found.');
    }
    return await branchOffice.update(updateData);
};

// Delete a Branch Office
exports.deleteBranchOffice = async (id) => {
    const branchOffice = await BranchOffice.findByPk(id);
    if (!branchOffice) {
        throw new Error('Branch office not found.');
    }
    await branchOffice.destroy();
};