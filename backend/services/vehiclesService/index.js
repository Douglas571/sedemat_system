const { VehicleType, Vehicle } = require('../../database/models');

const vehiclesService = {
  // Vehicle Type Methods
  async getAllVehicleTypes() {
    return await VehicleType.findAll();
  },

  async createVehicleType(data) {
    return await VehicleType.create(data);
  },

  async updateVehicleType(id, data) {
    const vehicleType = await VehicleType.findByPk(id);
    if (!vehicleType) throw new Error('VehicleType not found');
    return await vehicleType.update(data);
  },

  async deleteVehicleType(id) {
    const vehicleType = await VehicleType.findByPk(id);
    if (!vehicleType) throw new Error('VehicleType not found');
    return await vehicleType.destroy();
  },

  // Vehicle Methods
  async getAllVehicles() {
    return await Vehicle.findAll({
      include: [
        { model: VehicleType, as: 'vehicleType' },
        // { model: Brand, as: 'brand' },
        // { model: Model, as: 'model' },
      ],
    });
  },

  async createVehicle(data) {
    return await Vehicle.create(data);
  },

  async updateVehicle(id, data) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) throw new Error('Vehicle not found');
    return await vehicle.update(data);
  },

  async deleteVehicle(id) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) throw new Error('Vehicle not found');
    return await vehicle.destroy();
  },

};

module.exports = vehiclesService;