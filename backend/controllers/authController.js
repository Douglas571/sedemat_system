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
            const token = await authService.login(req.body);
            res.json({ token });
        } catch (error) {
            console.log(error.message)
            if (error.message.toLowerCase() === "user not found") {
                return res.status(404).json({ error: error.message })
            }
            res.status(401).json({ error: error.message });
        }
    }

    async existsAdministrator(req, res) {
        const existsAdministrator = await authService.existsAdministrator()
        
        res.status(200).json({ existsAdministrator })
    }
}

module.exports = new AuthController();