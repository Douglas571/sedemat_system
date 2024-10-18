const penaltyService = require('../services/penaltyService');

const createPenalty = async (req, res) => {
  try {
    const userId = req.user.id; // JWT authenticated user
    const penalty = await penaltyService.createPenalty({
      data: req.body, user: req.user
    });
    res.status(201).json(penalty);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const updatePenalty = async (req, res) => {
  try {
    const penalty = await penaltyService.updatePenalty({
      id: req.params.id,
      data: req.body,
      user: req.user
    });
    res.status(200).json(penalty);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const deletePenalty = async (req, res) => {
  try {
    await penaltyService.deletePenalty({
      id: req.params.id,
      user: req.user
    });
    res.status(204).json({ message: 'Penalty deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const getPenaltyById = async (req, res) => {
  try {
    const penalty = await penaltyService.getPenaltyById({
      id: req.params.id,
      user: req.user
    });
    res.status(200).json(penalty);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

const getAllPenalties = async (req, res) => {
  try {
    const penalties = await penaltyService.getAllPenalties({
      user: req.user
    });
    res.status(200).json(penalties);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

const getAllPenaltyTypes = async (req, res) => {
  try {
    const penaltyTypes = await penaltyService.getAllPenaltyTypes();
    res.status(200).json(penaltyTypes);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createPenalty,
  updatePenalty,
  deletePenalty,
  getPenaltyById,
  getAllPenalties,
  getAllPenaltyTypes,
};
