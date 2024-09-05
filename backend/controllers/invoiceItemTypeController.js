const InvoiceItemTypeService = require('../services/invoiceItemTypeService');

class InvoiceItemTypeController {
  static async create(req, res) {
    try {
      const data = req.body;
      const invoiceItemType = await InvoiceItemTypeService.create(data);
      res.status(201).json(invoiceItemType);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const invoiceItemTypes = await InvoiceItemTypeService.findAll();
      res.status(200).json(invoiceItemTypes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const id = req.params.id;
      const invoiceItemType = await InvoiceItemTypeService.findById(id);
      if (invoiceItemType) {
        res.status(200).json(invoiceItemType);
      } else {
        res.status(404).json({ error: 'InvoiceItemType not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const id = req.params.id;
      const data = req.body;
      const updatedItemType = await InvoiceItemTypeService.update(id, data);
      if (updatedItemType) {
        res.status(200).json(updatedItemType);
      } else {
        res.status(404).json({ error: 'InvoiceItemType not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const id = req.params.id;
      const deleted = await InvoiceItemTypeService.delete(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'InvoiceItemType not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = InvoiceItemTypeController;
