const bankAccountService = require('../services/bankAccountService');

class BankAccountController {
  // GET /bank-accounts
  async getAll(req, res) {
    try {
      const bankAccounts = await bankAccountService.getAllBankAccounts();
      res.status(200).json(bankAccounts);
    } catch (error) {
      console.log({error})
      res.status(500).json({ error: error });
    }
  }

  // GET /bank-accounts/:id
  async getById(req, res) {
    try {
      const bankAccount = await bankAccountService.getBankAccountById(req.params.id);
      if (!bankAccount) {
        return res.status(404).json({ message: 'Bank Account not found' });
      }
      res.status(200).json(bankAccount);
    } catch (error) {
      console.log({error})
      res.status(500).json({ error: error });
    }
  }

  // POST /bank-accounts
  async create(req, res) {
    try {
      const newBankAccount = await bankAccountService.createBankAccount(req.body, req.user);
      res.status(201).json(newBankAccount);
    } catch (error) {
      console.log({error})
      res.status(400).json({ error: error });
    }
  }

  // PUT /bank-accounts/:id
  async update(req, res) {
    try {
      const updatedBankAccount = await bankAccountService.updateBankAccount(req.params.id, req.body, req.user);
      res.status(200).json(updatedBankAccount);
    } catch (error) {
      console.log({error})
      res.status(400).json({ error: error });
    }
  }

  // DELETE /bank-accounts/:id
  async delete(req, res) {
    try {
      await bankAccountService.deleteBankAccount(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      console.log({error})
      res.status(400).json({ error: error });
    }
  }
}

module.exports = new BankAccountController();