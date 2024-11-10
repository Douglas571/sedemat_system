const {BranchOffice, 
    EconomicActivity, 
    EconomicLicense, 
    Zonation, 
    DocImages,
    BuildingDoc,
    LeaseDoc,
    PermitDoc
} = require('../database/models')
const logger = require('../utils/logger')

const ROLES = require('../utils/auth/roles')

const { UserNotAuthorizedError } = require('../utils/errors');

function checkIfCanCreateUpdateDeleteBranchOffice(user) {
    if (!user || [ROLES.COLLECTOR, ROLES.DIRECTOR, ROLES.LEGAL_ADVISOR, ROLES.FISCAL].indexOf(user.roleId) === -1) {
        throw new UserNotAuthorizedError("Only collectors, directors, legal advisors, and fiscals can modify or delete branch offices.");
    }
}

// Create a new Branch Office
exports.createBranchOffice = async (branchOfficeData, user) => {
    
    checkIfCanCreateUpdateDeleteBranchOffice(user)

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
    const branchOffices = await BranchOffice.findAll({});

    return branchOffices
};

exports.getBranchOfficesByBusinessId = async (businessId) => {
    try {
        const branchOffices = await BranchOffice.findAll({
            where: {
                businessId: businessId
            },
            include: [
                // Since i moved the relationship of economic license 
                // to business, this include is not needed
                // {
                //     model: EconomicLicense,
                //     as: "economicLicenses"
                // },
                {
                    model: Zonation,
                    as: "zonations",
                    include: 'docImages'
                },
                {
                    model: BuildingDoc,
                    as: "buildingDocs",
                    include: 'docImages'
                },
                {
                    model: LeaseDoc,
                    as: "leaseDocs",
                    include: 'docImages'
                },
                {
                    model: PermitDoc,
                    as: "fireFighterDocs",
                    include: 'docImages',
                },
                {
                    model: PermitDoc,
                    as: "healthPermitDocs",
                    include: 'docImages',
                }
            ]
        });

        return branchOffices;
    } catch (error) {
        console.log('ERROR START HERE')
        console.log({error})
        
        // logger.error(error)
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
exports.updateBranchOffice = async (id, updateData, user) => {

    checkIfCanCreateUpdateDeleteBranchOffice(user)

    const branchOffice = await BranchOffice.findByPk(id);
    if (!branchOffice) {
        throw new Error('Branch office not found.');
    }
    return await branchOffice.update(updateData);
};

// Delete a Branch Office
exports.deleteBranchOffice = async (id, user) => {

    checkIfCanCreateUpdateDeleteBranchOffice(user)

    const branchOffice = await BranchOffice.findByPk(id);
    if (!branchOffice) {
        throw new Error('Branch office not found.');
    }
    await branchOffice.destroy();
};