// const EconomicActivity = require('../models/economicActivity')
const {Person, Business, EconomicActivity, CertificateOfIncorporation} = require("../database/models");

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
            },
            {
                model: CertificateOfIncorporation,
                as: "certificateOfIncorporations",
                include: 'docImages'
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
    try {
        const business = await Business.findByPk(id);
        logger.info({message: "businessService.updateBusiness", businessId: id, businessData})

        if (!business) {
            throw new Error('Business not found');
        }

        let updatedBusiness = await business.update(businessData);
        return updatedBusiness
    } catch (error) {
        console.log({error})

        let msg = "Hubo un error";
        if (error.name == "SequelizeUniqueConstraintError"){
            // console.log({gotanerror: error})

            console.log({ keys: error.fields})
            if (error.fields.hasOwnProperty("businessName")) {
                console.log("Razón social ya registrada")
                msg = "Razón social ya registrada."
            }
            
        }

        throw new Error(msg)
    }
};

// Delete a business
exports.deleteBusiness = async (id) => {
    const business = await Business.findByPk(id);
    if (!business) {
        throw new Error('Business not found');
    }
    return await business.destroy();
};