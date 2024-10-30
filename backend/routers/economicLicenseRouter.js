// Router (to be moved to a separate file)
const express = require('express');
const router = express.Router();
const passport = require('passport');

const economicLicenseController = require('../controllers/economicLicenseController');

router.use(passport.authenticate('jwt', { session: false }));

router.post('/', economicLicenseController.createEconomicLicense);
router.get('/', economicLicenseController.getEconomicLicenses);
router.get('/:id', economicLicenseController.getEconomicLicenseById);
router.put('/:id', economicLicenseController.updateEconomicLicense);
router.delete('/:id', economicLicenseController.deleteEconomicLicense);

router.post('/request/:businessId', economicLicenseController.requestNewEconomicLicense);

module.exports = router;