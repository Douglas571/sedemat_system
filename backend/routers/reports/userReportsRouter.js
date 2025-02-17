// routes/userReports.js
const express = require('express');
const passport = require('passport');
const userReportsController = require('../../controllers/reports/userReportsController');

const router = express.Router();

// Middleware to authenticate requests using JWT
const authenticateJWT = passport.authenticate('jwt', { session: false });

// GET /userReports - Get all reports
router.get('/', authenticateJWT, userReportsController.getAllReports);

// POST /userReports - Submit a new report
router.post('/', authenticateJWT, userReportsController.submitReport);

router.use(userReportsController.errorHandler)

module.exports = router;