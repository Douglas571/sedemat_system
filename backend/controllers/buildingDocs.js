const { BuildingDoc, DocImage } = require('../database/models');
const path = require('path');
const fs = require('fs');

// Controller function to create a building document with images
exports.createBuildingDoc = async (req, res) => {
    try {
        const { branchOfficeId, expirationDate } = req.body;

        // Create the building document record
        const buildingDoc = await BuildingDoc.create({ branchOfficeId, expirationDate });

        const docImages = [];

        // Save uploaded images and link them to the building document
        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                const imageUrl = `/uploads/building/${file.filename}`;
                docImages.push({
                    buildingDocId: buildingDoc.id,
                    pageNumber: index + 1,
                    url: imageUrl,
                });
            });
        }

        // Bulk insert images
        if (docImages.length > 0) {
            await DocImage.bulkCreate(docImages);
        }

        // Include the images in the response
        buildingDoc.dataValues.docImages = docImages;

        res.status(201).json(buildingDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create building document' });
    }
};

// Controller function to get all building documents
exports.getAllBuildingDocs = async (req, res) => {
    try {
        const buildingDocs = await BuildingDoc.findAll({
            include: { model: DocImage, as: 'docImages' }
        });

        res.status(200).json(buildingDocs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve building documents' });
    }
};

// Controller function to get a building document by ID
exports.getBuildingDocById = async (req, res) => {
    try {
        const { id } = req.params;
        const buildingDoc = await BuildingDoc.findByPk(id, {
            include: { model: DocImage, as: 'docImages' }
        });

        if (!buildingDoc) {
            return res.status(404).json({ error: 'Building document not found' });
        }

        res.status(200).json(buildingDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve building document' });
    }
};

// Controller function to update a building document by ID
exports.updateBuildingDoc = async (req, res) => {
    try {
        const { id } = req.params;
        const { branchOfficeId, expirationDate } = req.body;

        // Update the building document record
        const [updated] = await BuildingDoc.update(
            { branchOfficeId, expirationDate },
            { where: { id } }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Building document not found' });
        }

        const updatedBuildingDoc = await BuildingDoc.findByPk(id, {
            include: { model: DocImage, as: 'docImages' }
        });

        res.status(200).json(updatedBuildingDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update building document' });
    }
};

// Controller function to delete a building document by ID
exports.deleteBuildingDoc = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the building document
        const buildingDoc = await BuildingDoc.findByPk(id);

        if (!buildingDoc) {
            return res.status(404).json({ error: 'Building document not found' });
        }

        // Delete associated images
        const docImages = await DocImage.findAll({ where: { buildingDocId: id } });
        docImages.forEach(async (image) => {
            const imagePath = path.join(__dirname, '../public', image.url);
            fs.unlink(imagePath, (err) => {
                if (err) console.error(`Failed to delete image file: ${imagePath}`);
            });
            await image.destroy();
        });

        // Delete the building document
        await buildingDoc.destroy();

        res.status(200).json({ message: 'Building document deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete building document' });
    }
};