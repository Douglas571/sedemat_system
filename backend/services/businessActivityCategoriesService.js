const { BusinessActivityCategory } = require('../database/models');

const businessActivityCategoryService = {
  async getAll() {
    return await BusinessActivityCategory.findAll();
  },

  async getById(id) {
    return await BusinessActivityCategory.findByPk(id);
  },

  async create(data) {
    return await BusinessActivityCategory.create(data);
  },

  async update(id, data) {
    const category = await BusinessActivityCategory.findByPk(id);
    if (!category) return null;
    return await category.update(data);
  },

  async delete(id) {
    const category = await BusinessActivityCategory.findByPk(id);
    if (!category) return null;
    await category.destroy();
    return true;
  }
};

module.exports = businessActivityCategoryService;