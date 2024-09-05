// routes/userRoutes.js
const express = require('express');
const { User } = require('../models');
const UserService = require('../services/userService');
const UserController = require('../controllers/userController');

const router = express.Router();

const userService = new UserService(User);
const userController = new UserController(userService);

router.post('/', (req, res) => userController.createUser(req, res));
router.get('/', (req, res) => userController.getAllUsers(req, res));
router.get('/:id', (req, res) => userController.getUserById(req, res));
router.put('/:id', (req, res) => userController.updateUser(req, res));
router.delete('/:id', (req, res) => userController.deleteUser(req, res));

module.exports = router;