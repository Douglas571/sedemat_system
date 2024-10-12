const { Bank } = require('../database/models');
const ROLES = require('../utils/auth/roles');

const BankAccount = Bank

class BankAccountService {
    // Fetch all BankAccounts
    async getAllBankAccounts() {
        return await BankAccount.findAll();
    }

    // Fetch a single BankAccount by ID
    async getBankAccountById(id) {
        return await BankAccount.findByPk(id);
    }

    // Create a new BankAccount
    async createBankAccount(newBankAccount, user) {

        if (!user || user.roleId !== ROLES.DIRECTOR) {
            let error = new Error('User not authorized');
            error.name = 'UserNotAuthorized';
            throw error;
        }

        return await BankAccount.create(newBankAccount);
    }

    // Update an existing BankAccount by ID
    async updateBankAccount(id, data, user) {

        if (!user || user.roleId !== ROLES.DIRECTOR) {
            let error = new Error('User not authorized');
            error.name = 'UserNotAuthorized';
            throw error;
        }

        const bankAccount = await BankAccount.findByPk(id);
        if (!bankAccount) {
            throw new Error('Bank Account not found');
        }
        return await bankAccount.update(data);
    }

    // Delete a BankAccount by ID
    async deleteBankAccount(id, user) {

        if (!user || user.roleId !== ROLES.DIRECTOR) {
            let error = new Error('User not authorized');
            error.name = 'UserNotAuthorized';
            throw error;
        }

        const bankAccount = await BankAccount.findByPk(id);
        if (!bankAccount) {
            throw new Error('Bank Account not found');
        }
        return await bankAccount.destroy();
    }
}

module.exports = new BankAccountService();
