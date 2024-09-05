const { InvoiceItemType } = require('../database/models');

class InvoiceItemTypeService {
  static async create(data) {
    return await InvoiceItemType.create(data);
  }

  static async findAll() {
    return await InvoiceItemType.findAll();
  }

  static async findById(id) {
    return await InvoiceItemType.findByPk(id);
  }

  static async update(id, data) {
    const itemType = await InvoiceItemType.findByPk(id);
    if (itemType) {
      return await itemType.update(data);
    }
    return null;
  }

  static async delete(id) {
    const itemType = await InvoiceItemType.findByPk(id);
    if (itemType) {
      return await itemType.destroy();
    }
    return null;
  }
}

module.exports = InvoiceItemTypeService;
