const userService = require('../services/userService');


function parseError(error) {
    if (error.name === "SequelizeUniqueConstraintError") {

        let fields = Object.keys(error.fields)

        if (fields.includes('username')) {
            return {
                message: "The contact is already taken by other user",
                name: "UsernameAlreadyTaken",
                statusCode: 400
            }
        }

        if (fields.includes('personId')) {
            return {
                message: "The contact is already taken by other user",
                name: "ContactAlreadyTaken",
                statusCode: 400
            }
        }

        if (fields.includes('email')) {
            return {
                message: "The email is already taken by other user",
                name: "EmailAlreadyTaken",
                statusCode: 400
            }
        }

    }

    if (error.name === 'SequelizeValidationError') {
        let details = []

        if (error.message.includes("notNull")) {
            if (error.message.includes("roleId")) {
                details.push({
                    field: 'roleId',
                    issue: "roleId can't be null"
                })
            }

            if (error.message.includes("password")) {
                details.push({
                    field: 'password',
                    issue: "password can't be null"
                })
            }
        }

        let errorResponse = {
            message: error.message,
            name: 'ValidationError',
            details,
            statusCode: 400
        }

        return errorResponse
    }

    return {
        message: error.message,
        name: error.name,
        statusCode: 500
    }
}

// controllers/userController.js
class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async createUser(req, res) {
        try {
            const user = await this.userService.createUser(req.body);
            return res.status(201).json(user);
        } catch (error) {
            let errorResponse = parseError(error)
            res.status(errorResponse.statusCode).json({ error: errorResponse })
        }
    }

    async getUserById(req, res) {
        try {
            const user = await this.userService.getUserById(req.params.id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            return res.status(200).json(user);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await this.userService.getAllUsers();
            return res.status(200).json(users);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const user = await this.userService.updateUser(req.params.id, req.body);
            return res.status(200).json(user);
        } catch (error) {
            let errorResponse = parseError(error)
            res.status(errorResponse.statusCode).json({ error: errorResponse })
        }
    }

    async deleteUser(req, res) {
        try {
            let deletedUser = await this.userService.deleteUser(req.params.id);

            console.log({deletedUser})
            return res.status(204).send(deletedUser.toJSON());
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new UserController(userService);