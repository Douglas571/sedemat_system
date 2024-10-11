const authService = require('../services/authService');

const parseError = require('../utils/userErrorParser')

class AuthController {
    async register(req, res) {
        try {
            console.log(req.body)
            const user = await authService.register(req.body);
            res.status(201).json(user);
        } catch (error) {
            console.log({error})

            let errorResponse = parseError(error)
            res.status(400).json({ error: errorResponse});
        }
    }

    async registerAdmin(req, res) {
        try {
            console.log(req.body)
            const user = await authService.registerAdmin(req.body);
            res.status(201).json(user);
        } catch (error) {
            console.log({error})

            let errorResponse = parseError(error)
            res.status(400).json({ error: errorResponse});
        }
    }

    async login(req, res) {
        
        try {
            const data = await authService.login(req.body);
            res.json(data);
        } catch (error) {
            console.log(error.message)
            if (error.name === "UserNotRegistered") {
                return res.status(404).json({ error: {
                    message: error.message,
                    name: error.name
                } })
            }

            if (error.name === "IncorrectPassword") {
                return res.status(400).json({
                    error: {
                        message: error.message,
                        name: error.name
                    }
                })
            }
            res.status(401).json({ error: { message: error.message } });
        }
    }

    async existsAdministrator(req, res) {
        const existsAdmin = await authService.existsAdministrator()
        
        res.status(200).json({ existsAdmin })
    }

    async getRoles(req, res) {
        let roles = await authService.getRoles()
        res.status(200).json(roles)
    }
}

module.exports = new AuthController();