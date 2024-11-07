const { LeaseDoc, DocImage } = require("../database/models");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const imagesUtils = require("../utils/images");

// Controller function to create a lease document with images
exports.createLeaseDoc = async (req, res) => {
    try {
        const { branchOfficeId, expirationDate } = req.body;

        // Create the lease document record
        const leaseDoc = await LeaseDoc.create({ branchOfficeId, expirationDate });

        const docImages = [];

        for (let idx in req.files) {
            let file = req.files[idx];

            let newFilename = await imagesUtils.compressHorizontal({
                filePath: file.path, 
                destination: path.resolve(__dirname, '../uploads/lease'),
                baseFileName: crypto.randomInt(100000, 999999),    
            })
            
            docImages.push({
                leaseDocId: leaseDoc.id,
                pageNumber: Number(idx) + 1,
                url: `/uploads/lease/${newFilename}`,
            });
        }

        // Save uploaded images and link them to the lease document
        // if (req.files && req.files.length > 0) {
        //     req.files.forEach((file, index) => {
        //         const imageUrl = `/uploads/lease/${file.filename}`;
        //         docImages.push({
        //             leaseDocId: leaseDoc.id,
        //             pageNumber: index + 1,
        //             url: imageUrl,
        //         });
        //     });
        // }

        console.log("here")
        console.log({docImages})

        // Bulk insert images
        if (docImages.length > 0) {
            console.log({docImagesForLeaseDoc: docImages})
            await DocImage.bulkCreate(docImages);
        }

        // Include the images in the response
        leaseDoc.dataValues.docImages = docImages;

        // console.log({ leaseDoc: leaseDoc.toJSON() })

        res.status(201).json(leaseDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create lease document" });
    }
};

// Controller function to get all lease documents
exports.getAllLeaseDocs = async (req, res) => {
    try {
        const leaseDocs = await LeaseDoc.findAll({
            include: {
                model: DocImage,
                as: "docImages",
            },
        });

        res.status(200).json(leaseDocs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve lease documents" });
    }
};

// Controller function to get a lease document by ID
exports.getLeaseDocById = async (req, res) => {
    try {
        const { id } = req.params;
        const leaseDoc = await LeaseDoc.findByPk(id, {
            include: {
                model: DocImage,
                as: "docImages",
            },
        });

        if (!leaseDoc) {
            return res.status(404).json({ error: "Lease document not found" });
        }

        res.status(200).json(leaseDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve lease document" });
    }
};

// Controller function to update a lease document
exports.updateLeaseDoc = async (req, res) => {
    try {
        const { id } = req.params;
        const { branchOfficeId, expirationDate } = req.body;

        const leaseDoc = await LeaseDoc.findByPk(id);
        if (!leaseDoc) {
            return res.status(404).json({ error: "Lease document not found" });
        }

        leaseDoc.branchOfficeId = branchOfficeId || leaseDoc.branchOfficeId;
        leaseDoc.expirationDate = expirationDate || leaseDoc.expirationDate;
        await leaseDoc.save();

        res.status(200).json(leaseDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update lease document" });
    }
};

// Controller function to delete a lease document
exports.deleteLeaseDoc = async (req, res) => {
    try {
        const { id } = req.params;

        const leaseDoc = await LeaseDoc.findByPk(id);
        if (!leaseDoc) {
            return res.status(404).json({ error: "Lease document not found" });
        }

        await leaseDoc.destroy();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete lease document" });
    }
};
