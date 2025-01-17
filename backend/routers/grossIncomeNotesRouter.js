const express = require('express');
const passport = require('passport');

const grossIncomeNotesController = require('../controllers/grossIncomeNotesController')

let errorHandler = (err, req, res, next) => {
  // If the error has a statusCode, use it, otherwise default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // Log the error (use a logger in production)
  console.error(err);

  // Send a standardized error response
  res.status(statusCode).json({
    error: {
      message: err.message || 'Something went wrong',
      details: err.details || null, // Optional field for additional error details
    },
  });
};

const router = express.Router();

// Example route with passport JWT authentication
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  grossIncomeNotesController.create
);

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  grossIncomeNotesController.findAll
);

router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  grossIncomeNotesController.update
);

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  grossIncomeNotesController.delete
);

// Apply the error handler middleware to catch errors in the routes
router.use(errorHandler);

module.exports = router;