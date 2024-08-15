// controllers/zonationController.js

// Import any necessary models, utilities, or libraries
const {Zonation} = require('../database/models'); // Example model, adjust according to your setup

// Controller function to create a new zonation
exports.createZonation = async (req, res) => {
    try {
        // Implement logic to create a new zonation
        // Extract data from req.body or req.files (for FormData)
        const { branchOfficeId } = req.body;
        const docImages = req.files; // Assuming you're handling file uploads

        // Save the zonation to the database (example)
        const newZonation = await Zonation.create({ branchOfficeId, docImages });

        // Send response
        res.status(201).json(newZonation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create zonation' });
    }
};

// Controller function to get a zonation by ID
exports.getZonationById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find zonation by ID
        const zonation = await Zonation.findByPk(id);

        if (!zonation) {
            return res.status(404).json({ error: 'Zonation not found' });
        }

        // Send response
        res.status(200).json(zonation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get zonation' });
    }
};

// Controller function to get all zonations
exports.getAllZonations = async (req, res) => {
    try {
        // Retrieve all zonations from the database
        const zonations = await Zonation.findAll();

        // Send response
        res.status(200).json(zonations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve zonations' });
    }
};

// Controller function to update a zonation by ID
exports.updateZonation = async (req, res) => {
    try {
        const { id } = req.params;
        const { branchOfficeId } = req.body;
        const docImages = req.files; // Assuming you're handling file uploads

        // Find the zonation by ID
        const zonation = await Zonation.findByPk(id);

        if (!zonation) {
            return res.status(404).json({ error: 'Zonation not found' });
        }

        // Update the zonation's fields
        zonation.branchOfficeId = branchOfficeId;
        zonation.docImages = docImages;

        // Save the updated zonation to the database
        await zonation.save();

        // Send response
        res.status(200).json(zonation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update zonation' });
    }
};

// Controller function to delete a zonation by ID
exports.deleteZonation = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the zonation by ID
        const zonation = await Zonation.findByPk(id);

        if (!zonation) {
            return res.status(404).json({ error: 'Zonation not found' });
        }

        // Delete the zonation from the database
        await zonation.destroy();

        // Send response
        res.status(200).json({ message: 'Zonation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete zonation' });
    }
};