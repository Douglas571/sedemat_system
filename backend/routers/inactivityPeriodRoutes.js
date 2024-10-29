// routes/inactivityPeriodRoutes.js

const express = require('express');
const passport = require('passport');
const inactivityPeriodController = require('../controllers/inactivityPeriodController');

const router = express.Router();

// Middleware to parse JWT
router.use(passport.authenticate('jwt', { session: false }));

router.post('/', inactivityPeriodController.createInactivityPeriod);
router.get('/:businessId', inactivityPeriodController.getInactivityPeriods);
router.get('/details/:id', inactivityPeriodController.getInactivityPeriodById);
router.put('/:id', inactivityPeriodController.updateInactivityPeriod);
router.delete('/:id', inactivityPeriodController.deleteInactivityPeriod);

module.exports = router;
