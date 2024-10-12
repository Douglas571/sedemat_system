const { User, Role } = require('../database/models')

const ROLES = require('../utils/auth/roles')

const bcrypt = require('bcryptjs');
const BCRYPT_SALT = process.env.BCRYPT_SALT

if (!BCRYPT_SALT) {
    throw new Error('Missing BCRYPT_SALT environment variable')
}

async function thereIsAnAdmin() {
    const users = await User.findAll({
        include: [
            {
                model: Role,
                as: 'role'
            }
        ]
    })

    console.log({users: users.map( u => u.toJSON())})

    let isThereAndAdmin = users.some( u => u.role.id === ROLES.ADMIN)

    return isThereAndAdmin
}

// services/userService.js
class UserService {
    constructor(User) {
        this.User = User;
    }

    async createUser(data, user) {
        

        if (!user && await thereIsAnAdmin()) {
            let error = new Error('User not authorized')
            error.name = 'UserNotAuthorized'
            throw error
        }

        if (user && user.roleId !== ROLES.ADMIN) {
            let error = new Error('User not authorized')
            error.name = 'UserNotAuthorized'
            throw error
        }

        let hashedPassword = bcrypt.hashSync(data.password, BCRYPT_SALT)
        data.password = hashedPassword

        let newUser = await User.create(data);
        let role = await newUser.getRole()

        return {
            ...newUser.toJSON(),
            role: role.toJSON()
        }
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

    async updateUser(id, data, user) {

        if ((!user && thereIsAnAdmin()) || user.roleId !== ROLES.ADMIN) {
            let error = new Error('User not authorized')
            error.name = 'UserNotAuthorized'
            throw error
        }

        const userToUpdate = await this.getUserById(id);
        if (!userToUpdate) throw new Error('User not found');

        if (data.password) {
            data.password = bcrypt.hashSync(data.password, BCRYPT_SALT);
        }

        let updatedUser = await userToUpdate.update(data);
        return updatedUser.toJSON()
    }

    async deleteUser(id, user) {

        if ((!user && thereIsAnAdmin()) || user.roleId !== ROLES.ADMIN) {
            let error = new Error('User not authorized')
            error.name = 'UserNotAuthorized'
            throw error
        }

        const userToDelete = await this.getUserById(id);
        if (!userToDelete) throw new Error('User not found');
        let deletedUser = await userToDelete.destroy();
        
        return deletedUser
    }
}

module.exports = new UserService(User);