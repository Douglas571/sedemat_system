const express = require('express');
const passport = require('passport');
const penaltyController = require('../controllers/penaltyController');

const router = express.Router();

// Create a new penalty (requires authentication)
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  penaltyController.createPenalty
);

// Update a penalty by ID (requires authentication)
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  penaltyController.updatePenalty
);

// Delete a penalty by ID (requires authentication)
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  penaltyController.deletePenalty
);

// Get all penalty types
router.get('/types', penaltyController.getAllPenaltyTypes);

// Get a penalty by ID
router.get('/:id', penaltyController.getPenaltyById);

// Get all penalties
router.get('/', penaltyController.getAllPenalties);

module.exports = router;
