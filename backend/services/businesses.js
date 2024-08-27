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


exports.isEligibleForTheEconomicActivityLicense = async (businessId) => {
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
        ]
    });

    const branchOffices = await BranchOffice.findAll({
        where: {businessId},
        include: [
            {
                model: EconomicLicense,
                as: "economicLicenses"
            },
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
    })


    const result = {
        isValid: true,
        error: {
            message: '',
            fields: []

        }
    }
    // constitution date
    let companyExpirationDate = new Date(business?.companyExpirationDate)
    if (!(companyExpirationDate > new Date())) {
        result.isValid = false
        error.fields.push({
            field: "companyExpirationDate",
            message: "La el acta de constitución ha expiro, debe renovarla"
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
            message: "Debe subir una imagen de la cédula"
        })
    }
    // this owner has rif
    if (!owner?.rifPictureUrl) {
        result.isValid = false
        error.fields.push({
            field: "owner.rifPictureUrl",
            message: "Debe subir una imagen del rif"
        })
    }

    // for each branch office
    branchOffices.forEach((branchOffice) => {
    //     it has a valid address
        
    //     if it is rented
        if (branchOffice.isRented) {
            // it has a valid lease doc and expiration date for that document
            let lastLeaseDoc = branchOffice.leaseDocs[branchOffice.leaseDocs.length - 1]
            let expirationDate = new Date(lastLeaseDoc?.expirationDate)
            if (!(expirationDate > new Date())) {
                result.isValid = false
                error.fields.push({
                    branchOfficeId: branchOffice.id,
                    field: "leaseDoc.expirationDate",
                    message: "La contrato de alquiler está expirado ha expirado, debe renovarlo"
                })
            }
        } else {
            // if it is not rented
            // it has a valid building doc and building doc expiration date
            let lastBuildingDoc = branchOffice.buildingDocs[branchOffice.buildingDocs.length - 1]
            let expirationDate = new Date(lastBuildingDoc?.expirationDate)
            if (!(expirationDate > new Date())) {
                result.isValid = false
                error.fields.push({
                    branchOfficeId: branchOffice.id,
                    field: "buildingDoc.expirationDate",
                    message: "El contrato de propiedad ha expirado, debe renovarlo"
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
        let lastFireFighterDoc = branchOffice.fireFighterDocs[branchOffice.fireFighterDocs.length - 1]
        if (!lastFireFighterDoc) {
            result.isValid = false
            error.fields.push({
                branchOfficeId: branchOffice.id,
                field: "fireFighterDoc",
                message: "Debe registrar un documento de permiso de incendio"
            })
        }

        if (lastFireFighterDoc.expirationDate > new Date()) {
            result.isValid = false
            error.fields.push({
                branchOfficeId: branchOffice.id,
                field: "fireFighterDoc.expirationDate",
                message: "El permiso de incendio ha expirado, debe renovarlo"
            })
        }
    //     has a valid health permit doc
        let lastHealthDoc = branchOffice.healthDocs[branchOffice.healthDocs.length - 1]
        if (!lastHealthDoc) {
            result.isValid = false
            error.fields.push({
                branchOfficeId: branchOffice.id,
                field: "healthDoc",
                message: "Debe registrar un documento de permiso de sanidad"
            })
        }

        if (lastHealthDoc.expirationDate > new Date()) {
            result.isValid = false
            error.fields.push({
                branchOfficeId: branchOffice.id,
                field: "healthDoc.expirationDate",
                message: "El permiso de sanidad ha expirado, debe renovarlo"
            })
        }
    })


    // if isValid, then remove error
    if (result.isValid) {
        result.error = null
    } else {
        result.error = error
    }
    
    return results
}