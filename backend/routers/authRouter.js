const express = require('express');
const passport = require('passport');
const AuthController = require('../controllers/authController'); // Adjust the path as necessary


const router = express.Router();

// Registration route
router.post('/singup', AuthController.register.bind(AuthController));

router.post('/singup/admin', AuthController.registerAdmin.bind(AuthController));

// Login route
router.post('/login', AuthController.login.bind(AuthController));

// Protected route example
router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ message: 'You have accessed a protected route!', user: req.user });
});

router.get('/exists-admin', AuthController.existsAdministrator.bind(AuthController));

router.get('/roles', AuthController.getRoles.bind(AuthController))



module.exports = router;