const authService = require('../services/authService');

class AuthController {
    async register(req, res) {
        try {
            const user = await authService.register(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
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
        const existsAdministrator = await authService.existsAdministrator()
        
        res.status(200).json({ existsAdministrator })
    }
}

module.exports = new AuthController();