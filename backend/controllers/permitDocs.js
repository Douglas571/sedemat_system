const { PermitDoc, DocImage } = require('../database/models');

// Controller to create a PermitDoc
exports.createPermitDoc = async (req, res) => {
    try {
        const { branchOfficeId, expirationDate, type } = req.body;

        if (!(['FIRE', 'HEALTH'].includes(type))) {
            return res.status(400).json({ error: {
                message: "Invalid permit type"
            } });
        }
        
        const permitDoc = await PermitDoc.create({ branchOfficeId, expirationDate, type });

        const docImages = [];

        // Handle uploaded images
        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                const imageUrl = `/uploads/permit-docs/${file.filename}`;
                docImages.push({
                    permitDocId: permitDoc.id,
                    pageNumber: index + 1,
                    url: imageUrl,
                });
            });

            // Bulk insert images
            await DocImage.bulkCreate(docImages);
        }

        // Include the images in the response
        permitDoc.dataValues.docImages = docImages;


        res.status(201).json(permitDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create PermitDoc' });
    }
};

// Controller to get all PermitDocs
exports.getAllPermitDocs = async (req, res) => {
    try {
        const PermitDocs = await PermitDoc.findAll({
            include: {
                model: DocImage,
                as: 'docImages'
            }
        });

        res.status(200).json(PermitDocs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve PermitDocs' });
    }
};

// Controller to get a PermitDoc by ID
exports.getPermitDocById = async (req, res) => {
    try {
        const { id } = req.params;
        const PermitDoc = await PermitDoc.findByPk(id, {
            include: {
                model: DocImage,
                as: 'docImages'
            }
        });

        if (!PermitDoc) {
            return res.status(404).json({ error: 'PermitDoc not found' });
        }

        res.status(200).json(PermitDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve PermitDoc' });
    }
};

// Controller to update a PermitDoc
exports.updatePermitDoc = async (req, res) => {
    try {
        const { id } = req.params;
        const { expirationDate, type } = req.body;

        const PermitDoc = await PermitDoc.findByPk(id);

        if (!PermitDoc) {
            return res.status(404).json({ error: 'PermitDoc not found' });
        }

        await PermitDoc.update({ expirationDate, type });

        res.status(200).json(PermitDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update PermitDoc' });
    }
};

// Controller to delete a PermitDoc
exports.deletePermitDoc = async (req, res) => {
    try {
        const { id } = req.params;

        const PermitDoc = await PermitDoc.findByPk(id);

        if (!PermitDoc) {
            return res.status(404).json({ error: 'PermitDoc not found' });
        }

        await PermitDoc.destroy();

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete PermitDoc' });
    }
};