// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');

const passport = require('passport');

const router = express.Router();


router.get('/', (req, res) => userController.getAllUsers(req, res));
router.get('/:id', (req, res) => userController.getUserById(req, res));


router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => userController.createUser(req, res));

router.put('/:id', passport.authenticate('jwt', { session: false }), (req, res) => userController.updateUser(req, res));

router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => userController.deleteUser(req, res));

module.exports = router;