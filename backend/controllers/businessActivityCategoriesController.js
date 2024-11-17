const businessActivityCategoryService = require('../services/businessActivityCategoriesService');

module.exports.getAll = async (req, res) => {
  try {
    const categories = await businessActivityCategoryService.getAll();
    res.status(200).json(categories);
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error });
  }
};

module.exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await businessActivityCategoryService.getById(id);
    if (!category) {
      return res.status(404).json({ error: { message: 'Category not found' } });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error });
  }
};

module.exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await businessActivityCategoryService.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updatedCategory = await businessActivityCategoryService.update(id, { name, description });
    if (!updatedCategory) {
      return res.status(404).json({ error: { message: 'Category not found' } });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error });
  }
};

module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await businessActivityCategoryService.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: { message: 'Category not found' } });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error });
  }
};
