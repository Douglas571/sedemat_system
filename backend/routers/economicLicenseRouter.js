// Router (to be moved to a separate file)
const express = require('express');
const router = express.Router();
const economicLicenseController = require('../controllers/economicLicenseController');

router.post('/', economicLicenseController.createEconomicLicense);
router.get('/', economicLicenseController.getEconomicLicenses);
router.get('/:id', economicLicenseController.getEconomicLicenseById);
router.put('/:id', economicLicenseController.updateEconomicLicense);
router.delete('/:id', economicLicenseController.deleteEconomicLicense);

module.exports = router;