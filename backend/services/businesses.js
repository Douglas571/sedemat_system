// const EconomicActivity = require('../models/economicActivity')
const {
    Person, 
    Business, 
    EconomicActivity, 
    CertificateOfIncorporation,
    User,
    Role,
    BusinessActivityCategory
} = require("../database/models");

const ROLES = require('../utils/auth/roles')

const logger = require('../utils/logger')

const branchOfficeServices = require('./branchOffices');

const _ = require('lodash')


function checkIfCanCreateOrUpdateBusiness(user) {
    // if user is not an admin, director, fiscal, or collector 
    if (!user || [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.FISCAL, ROLES.COLLECTOR, ROLES.LEGAL_ADVISOR].indexOf(user.roleId) === -1) {
        let error = new Error('User not authorized');
        error.name = 'UserNotAuthorized';
        error.statusCode = 401;
        throw error;
    }
}

// Get all businesses
exports.getAllBusinesses = async () => {
    return await Business.findAll({
        include: [
            {
                model: EconomicActivity,
                as: 'economicActivity'
            },
            {
                model: User,
                as: "fiscal",
                include: [
                    {
                        model: Person,
                        as: "person"
                    },
                    {
                        model: Role,
                        as: "role"
                    }
                ]
            },
            {
                model: BusinessActivityCategory,
                as: 'businessActivityCategory'
            }
        ]
    });
};



/**
 * Retrieves and organizes economic activities along with their associated businesses into a hierarchical tree structure.
 *
 * This function fetches all economic activities that have associated businesses, and then maps them
 * into a predefined structure of economic sectors. Each economic activity is inserted into the correct
 * sector based on its code.
 *
 * @returns {Array} A tree structure representing economic sectors with their respective economic activities and businesses.
 */

exports.economicActivityIndex = async () => {
    let economicActivitiesWithBusinesses = await EconomicActivity.findAll({
        include: [
            {
                model: Business,
                as: 'businesses'
            }
        ],
    });

    let originalEconomicSectors = require('../utils/economicActivitySectors')
    let economicSectors = _.cloneDeep(originalEconomicSectors)

    economicActivitiesWithBusinesses.forEach(economicActivity => {
        let code = economicActivity.code.charAt(0)
        let treeNode = economicSectors.find( sector => sector.code === code)
        mapInsertEconomicActivitiesInTree(economicActivity, treeNode)      
    })

    return economicSectors

}

/**
 * Inserts an economic activity into the appropriate position within a tree structure.
 * 
 * This function recursively navigates through a tree of economic activities and inserts
 * the given economic activity into the correct position based on its code. If the tree 
 * node does not have a matching sub-economic activity, it appends the economic activity 
 * to the current node's economic activities.
 * 
 * @param {Object} economicActivity - The economic activity to be inserted. 
 * @param {Object} treeNode - The current node in the economic activity tree being traversed.
 * @return {void}
 */

function mapInsertEconomicActivitiesInTree(economicActivity, treeNode) {
    if (!treeNode.economicActivities) {
        return treeNode.economicActivities = [economicActivity]
    }

    let code = economicActivity.code
    let subEconomicActivity = treeNode.economicActivities.find( activity => code.startsWith(activity.code))
    
    if (subEconomicActivity) {
        return mapInsertEconomicActivitiesInTree(economicActivity, subEconomicActivity)
    }

    treeNode.economicActivities = [...treeNode.economicActivities, economicActivity]
}

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
            },
            {
                model: User,
                as: "fiscal",
                include: [
                    {
                        model: Person,
                        as: "person"
                    },
                    {
                        model: Role,
                        as: "role"
                    }
                ]
            },
            {
                model: BusinessActivityCategory,
                as: 'businessActivityCategory'
            }
        ]
    });
    return business
};

// Register a new business
exports.createBusiness = async (businessData, user) => {

    checkIfCanCreateOrUpdateBusiness(user)

    const newBusiness = await Business.create(businessData);
    return newBusiness;
};
// Update a business
exports.updateBusiness = async (id, businessData, user) => {

    checkIfCanCreateOrUpdateBusiness(user)

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
exports.deleteBusiness = async (id, user) => {
    const business = await Business.findByPk(id);

    checkIfCanCreateOrUpdateBusiness(user)

    if (!business) {
        throw new Error('Business not found');
    }
    return await business.destroy();
};


exports.isEligibleForTheEconomicActivityLicense = async (businessId) => {
    // console.log({businessId})
    const business = await Business.findByPk(businessId, {
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
                model: CertificateOfIncorporation,
                as: 'certificateOfIncorporations',
                include: 'docImages'
            }
        ]
    });

    if (business == null) {
        throw new Error("busines not found")    
    }

    const branchOffices = await branchOfficeServices.getBranchOfficesByBusinessId(business.id)


    const result = {
        isValid: true,
    }

    const error = {
        message: '',
        fields: []

    }
    // constitution date
    let companyExpirationDate = new Date(business?.companyExpirationDate)
    if (!(companyExpirationDate > new Date())) {
        result.isValid = false
        error.fields.push({
            field: "companyExpirationDate",
            message: "El acta de constitución ha expiro, debe renovarla"
        })
    }
    // directors board expirationDate
    let {directorsBoardExpirationDate} = business
    if (!(directorsBoardExpirationDate > new Date())) {
        result.isValid = false
        error.fields.push({
            field: "directorsBoardExpirationDate",
            message: "La junta directiva ha vencido, debe renovarla"
        })
    }

    // economic activity 
    let {economicActivity} = business

    if (!economicActivity?.code) { 
        result.isValid = false
        error.fields.push({
            field: "economicActivity",
            message: "Debe asignar una actividad económica válida"
        })
    }

    // look if there is certificateOfIncorporations registered
    if (business.certificateOfIncorporations.length == 0) {
        result.isValid = false
        error.fields.push({
            field: "certificateOfIncorporations",
            message: "Debe suministrar un registro de comercio"
        })
    } else {
        let lastCertificateOfIncorporation = business.certificateOfIncorporations[business.certificateOfIncorporations.length - 1]
        let expiradoDate = new Date(lastCertificateOfIncorporation.expirationDate)
        if (!(expiradoDate > new Date())) {
            result.isValid = false
            error.fields.push({
                field: "certificateOfIncorporations.expirationDate",
                message: "El registro de comercio ha expirado, debe renovarlo"
            })
        }

        if(!lastCertificateOfIncorporation.docImages.length) {
            result.isValid = false
            error.fields.push({
                field: "certificateOfIncorporations.docImages",
                message: "Debe registrar al menos una (1) imagen del registro de comercio"
            })
        }
    }
    
    // get the last document 
        // if the document doesn't have any images, it's invalid
        // if the document is expired, is invalid


    
    
    // as an owner 
    let {owner} = business
    if (!owner?.dni) {
        result.isValid = false
        error.fields.push({
            field: "owner",
            message: "Debe asignar una persona como propietario"
        })
    }
    // this owner has a picture
    // console.log({p: owner?.profilePictureUrl})
    if (!owner?.profilePictureUrl) {
        result.isValid = false
        error.fields.push({
            field: "owner.profilePictureUrl",
            message: "Debe subir una imagen del propietario"
        })
    }
    
    // this owner has cédula
    if (!owner?.dniPictureUrl) {
        result.isValid = false
        error.fields.push({
            field: "owner.dniPictureUrl",
            message: "Debe subir una imagen de la cédula del propietario"
        })
    }
    // this owner has rif
    if (!owner?.rifPictureUrl) {
        result.isValid = false
        error.fields.push({
            field: "owner.rifPictureUrl",
            message: "Debe subir una imagen del rif del propietario"
        })
    }

    if (branchOffices.length == 0) {
        result.isValid = false
        error.fields.push({
            field: "branchOffices",
            message: "Debe registrar al menos una (1) sucursal"
        })
    }

    // for each branch office
    branchOffices.forEach((branchOffice) => {
    //     it has a valid address
        
    //     if it is rented
        if (branchOffice.isRented) {

            if (branchOffice.leaseDocs.length == 0) {
                result.isValid = false
                error.fields.push({
                    branchOfficeId: branchOffice.id,
                    field: "leaseDoc",
                    message: "Debe registrar un contrato de alquiler"
                })
            } else {
                // it has a valid lease doc and expiration date for that document
                let lastLeaseDoc = branchOffice.leaseDocs[branchOffice.leaseDocs.length - 1]
                let expirationDate = new Date(lastLeaseDoc?.expirationDate)
                if (!(expirationDate > new Date())) {
                    result.isValid = false
                    error.fields.push({
                        branchOfficeId: branchOffice.id,
                        field: "leaseDoc.expirationDate",
                        message: "El contrato de alquiler ha expirado, debe renovarlo"
                    })
                }
            }
            
        } else {
            // if it is not rented

            if (branchOffice.buildingDocs.length == 0) {
                result.isValid = false
                error.fields.push({
                    branchOfficeId: branchOffice.id,
                    field: "buildingDoc",
                    message: "Debe registrar un documento de inmueble"
                })
            }
            // it has a valid building doc and building doc expiration date
            let lastBuildingDoc = branchOffice.buildingDocs[branchOffice.buildingDocs.length - 1]
            let expirationDate = new Date(lastBuildingDoc?.expirationDate)
            if (!(expirationDate > new Date())) {
                result.isValid = false
                error.fields.push({
                    branchOfficeId: branchOffice.id,
                    field: "buildingDoc.expirationDate",
                    message: "El documento de inmueble ha expirado, debe renovarlo"
                })
            }
        }

    //     has a valid zonation 
        let lastZonation = branchOffice.zonations[branchOffice.zonations.length - 1]
        if (!lastZonation) {
            result.isValid = false
            error.fields.push({
                branchOfficeId: branchOffice.id,
                field: "zonation",
                message: "Debe registrar un documento de zonificación"
            })
        }

    //     has a valid firefighter permit doc 
        // console.log({a: branchOffice.fireFighterDocs})
        if (!branchOffice.fireFighterDocs?.length) {
            result.isValid = false
            error.fields.push({
                branchOfficeId: branchOffice.id,
                field: "fireFighterDocs",
                message: "Debe registrar un permiso de bomberos"
            })
        } else {
            let lastFireFighterDoc = branchOffice.fireFighterDocs[branchOffice?.fireFighterDocs?.length - 1]
            if (!lastFireFighterDoc) {
                result.isValid = false
                error.fields.push({
                    branchOfficeId: branchOffice.id,
                    field: "fireFighterDoc",
                    message: "Debe registrar un permiso de bomberos"
                })
            }

            if (!(new Date(lastFireFighterDoc?.expirationDate) > new Date())) {
                result.isValid = false
                error.fields.push({
                    branchOfficeId: branchOffice.id,
                    field: "fireFighterDoc.expirationDate",
                    message: "El permiso de bomberos ha expirado, debe renovarlo"
                })
            }
        }

        
        if (!branchOffice.healthPermitDocs?.length) {
            result.isValid = false
            error.fields.push({
                branchOfficeId: branchOffice.id,
                field: "healthPermitDocs",
                message: "Debe registrar un permiso de sanidad"
            })
        } else {
                //     has a valid health permit doc
            let lastHealthDoc = branchOffice.healthPermitDocs[branchOffice.healthPermitDocs.length - 1]
            if (!lastHealthDoc) {
                result.isValid = false
                error.fields.push({
                    branchOfficeId: branchOffice.id,
                    field: "healthDoc",
                    message: "Debe registrar un permiso de sanidad"
                })
            }

            if (!(new Date(lastHealthDoc?.expirationDate) > new Date())) {
                result.isValid = false
                error.fields.push({
                    branchOfficeId: branchOffice.id,
                    field: "healthDoc.expirationDate",
                    message: "El permiso de sanidad ha expirado, debe renovarlo"
                })
            }
        }
    })


    // if isValid, then remove error
    if (result.isValid) {
        result.error = null
    } else {
        result.error = error
    }
    
    return result
}