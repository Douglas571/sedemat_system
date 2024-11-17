const express = require('express');
const router = express.Router();
const passport = require('passport');
const businessActivityCategoryController = require('../controllers/businessActivityCategoriesController');

// Middleware for authentication
const authenticate = passport.authenticate('jwt', { session: false });

// Define routes
router.get('/', authenticate, businessActivityCategoryController.getAll);
router.get('/:id', authenticate, businessActivityCategoryController.getById);
router.post('/', authenticate, businessActivityCategoryController.create);
router.put('/:id', authenticate, businessActivityCategoryController.update);
router.delete('/:id', authenticate, businessActivityCategoryController.delete);

module.exports = router;