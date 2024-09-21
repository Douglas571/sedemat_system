const { User } = require('../database/models')

// services/userService.js
class UserService {
    constructor(User) {
        this.User = User;
    }

    async createUser(data) {
        return this.User.create(data);
    }

    async getUserById(id) {
        return this.User.findByPk(id, {
            include: ['role', 'person']
        });
    }

    async getAllUsers() {
        return this.User.findAll({
            include: ['role', 'person']
        });
    }

    async updateUser(id, data) {
        const user = await this.getUserById(id);
        if (!user) throw new Error('User not found');
        return user.update(data);
    }

    async deleteUser(id) {
        const user = await this.getUserById(id);
        if (!user) throw new Error('User not found');
        return user.destroy();
    }
}

module.exports = new UserService(User);