const express = require('express');
const router = express.Router();
const passport = require('passport');

const settlementsReportsController = require('../../controllers/reports/settlementsReportsController');

router.get(
  '/', 
  passport.authenticate('jwt', { session: false }), 
  settlementsReportsController.getSettlementsReport);

module.exports = router;