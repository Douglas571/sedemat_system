const express = require('express');
const router = express.Router();
const passport = require('passport');

const businessReportsController = require('../../controllers/reports/businessesReportsController');

router.get(
  '/gross-incomes',
  passport.authenticate('jwt', { session: false }),
  businessReportsController.getBusinessesGrossIncomeReport
);

router.get(
  '/gross-incomes/summary',
  passport.authenticate('jwt', { session: false }),
  businessReportsController.getGrossIncomesSummary
);

module.exports = router;

