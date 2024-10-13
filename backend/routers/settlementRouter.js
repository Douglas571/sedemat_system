// routes/settlements.js
const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');

const passport = require('passport');


router.get('/', settlementController.getAll);
router.get('/:id', settlementController.getById);

router.post('/', passport.authenticate('jwt', { session: false }), settlementController.create);
router.put('/:id', passport.authenticate('jwt', { session: false }), settlementController.update);
router.delete('/:id', passport.authenticate('jwt', { session: false }), settlementController.delete);

module.exports = router;
