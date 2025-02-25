const vehiclesService = require('../../services/vehiclesService');

const vehiclesController = {
  // Vehicle Type Methods
  async getAllVehicleTypes(req, res) {
    try {
      const vehicleTypes = await vehiclesService.getAllVehicleTypes();
      res.json(vehicleTypes);
    } catch (error) {
      throw error
    }
  },

  async createVehicleType(req, res) {
    try {
      const newVehicleType = await vehiclesService.createVehicleType(req.body);
      res.status(201).json(newVehicleType);
    } catch (error) {
      throw error
    }
  },

  // Vehicle Methods
  async getAllVehicles(req, res) {
    try {
      const vehicles = await vehiclesService.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      throw error
    }
  },

  async createVehicle(req, res) {
    try {
      const newVehicle = await vehiclesService.createVehicle(req.body);
      res.status(201).json(newVehicle);
    } catch (error) {
      throw error
    }
  },

  async errorHandler(error, req, res, next) {
    // TODO: Improve the error handler, parse each type of error, and return an apropiate response
    console.log({error})
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

module.exports = vehiclesController;