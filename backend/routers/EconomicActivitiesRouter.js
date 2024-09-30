// routes/economicActivityRouter.js
const express = require('express');
const router = express.Router();
const economicActivitiesController = require('../controllers/EconomicActivitiesController');

const passport = require('passport');

// GET all economic activities
router.get('/', economicActivitiesController.getAll);

// GET an economic activity by ID
router.get('/:id', economicActivitiesController.getById);

// POST a new economic activity
router.post('/', passport.authenticate('jwt', { session: false }), economicActivitiesController.create);

// PUT (update) an existing economic activity by ID
router.put('/:id', passport.authenticate('jwt', { session: false }), economicActivitiesController.update);

// DELETE an economic activity by ID
router.delete('/:id', economicActivitiesController.delete);

module.exports = router;
