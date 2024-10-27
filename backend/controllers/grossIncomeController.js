// controllers/grossIncomeController.js
const path = require('path');
const multer = require('multer');
const fse = require('fs-extra');
const crypto = require('crypto');

const grossIncomeService = require('../services/grossIncomeService');

// Set up the path for seneat_declarations
const DECLARATIONS_PATH = path.resolve(__dirname, '../uploads/seneat-declarations');
fse.ensureDirSync(DECLARATIONS_PATH);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DECLARATIONS_PATH);
    },
    filename: (req, file, cb) => {
        const randomCode = crypto.randomInt(100000, 999999);
        const ext = path.extname(file.originalname);
        const name = `${randomCode}${ext}`;
        cb(null, name);
    }
});

const upload = multer({ storage });

class GrossIncomeController {
  // GET /gross-incomes
  async getAll(req, res) {
    try {
      const grossIncomes = await grossIncomeService.getAllGrossIncomes();
      res.status(200).json(grossIncomes);
    } catch (error) {
      console.log({ error });
      res.status(500).json({ error: error.message });
    }
  }

  // GET /gross-incomes/:id
  async getById(req, res) {
    try {
      const grossIncome = await grossIncomeService.getGrossIncomeById(req.params.id);
      if (!grossIncome) {
        return res.status(404).json({ message: 'GrossIncome not found' });
      }
      res.status(200).json(grossIncome);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /gross-incomes
  async create(req, res) {
    try {
      const newGrossIncome = await grossIncomeService.createGrossIncome(req.body);
      res.status(201).json(newGrossIncome);
    } catch (error) {
      console.log({error})
      res.status(400).json({ error });
    }
  }

  // PUT /gross-incomes/:id
  async update(req, res) {
    try {
      const updatedGrossIncome = await grossIncomeService.updateGrossIncome(req.params.id, req.body);
      res.status(200).json(updatedGrossIncome);
    } catch (error) {
      console.log({error})
      res.status(400).json({ error: error.message });
    }
  }

  // DELETE /gross-incomes/:id
  async delete(req, res) {
    try {
      await grossIncomeService.deleteGrossIncome(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // POST /gross-incomes/declaration-image
  async uploadDeclarationImage(req, res) {
    upload.single('image')(req, res, (err) => {
      if (err) {
          console.log({err});
          return res.status(500).json({ message: 'Error in uploading file', error: err.message });
      }

      if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileUrl = `/uploads/seneat-declarations/${req.file.filename}`;
      res.status(200).json({ url: fileUrl });
    });
  }

  // GET /gross-incomes/business/:businessId
  async getAllGrossIncomesByBusinessId(req, res) {
    try {
      const grossIncomes = await grossIncomeService.getAllGrossIncomesByBusinessId(req.params.businessId);
      res.status(200).json(grossIncomes);
    } catch (error) {
      console.log({error});
      res.status(500).json({ error: error.message });
    }
  }

  // GET /gross-incomes/invoice/:invoiceId
  async getAllGrossIncomesByInvoiceId(req, res) {
    try {
      const grossIncomes = await grossIncomeService.getAllGrossIncomesByInvoiceId(req.params.invoiceId);
      res.status(200).json(grossIncomes);
    } catch (error) {
      console.log({error});
      res.status(500).json({ error: error.message });
    }
  }

  async createUndeclaredGrossIncome(req, res) {
    try {
      console.log("here")
      const newGrossIncome = await grossIncomeService.createUndeclaredGrossIncome({user: req.user, data: req.body});

      res.status(201).json(newGrossIncome);
    } catch (error) {
      console.log({error});
      res.status(error?.statusCode ?? 500).json({ error });
    }

  }
}

module.exports = new GrossIncomeController();