const express = require('express');
const router = express.Router();
const vehiclesController = require('../../controllers/vehiclesController');

const passport = require('passport');

// Middleware to authenticate requests using JWT
const authenticateJWT = passport.authenticate('jwt', { session: false });

router.use(authenticateJWT);

// Vehicle Type Routes
router.get('/types', vehiclesController.getAllVehicleTypes);
router.post('/types', vehiclesController.createVehicleType);

// Vehicle Routes
router.get('/', vehiclesController.getAllVehicles);
router.post('/', vehiclesController.createVehicle);

router.use(vehiclesController.errorHandler)

module.exports = router;