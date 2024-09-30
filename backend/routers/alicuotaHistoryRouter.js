const express = require('express');
const router = express.Router();
const alicuotaHistoryController = require('../controllers/alicuotaHistoryController');
const passport = require('passport');

// GET all alicuota history
router.get('/', alicuotaHistoryController.getAll.bind(alicuotaHistoryController));

// GET an alicuota history by ID
router.get('/:id', alicuotaHistoryController.getById.bind(alicuotaHistoryController));

// POST a new alicuota history
router.post('/', passport.authenticate('jwt', { session: false }), alicuotaHistoryController.create.bind(alicuotaHistoryController));

// PUT (update) an existing alicuota history by ID
router.put('/:id', passport.authenticate('jwt', { session: false }), alicuotaHistoryController.update.bind(alicuotaHistoryController));

// DELETE an alicuota history by ID
router.delete('/:id', passport.authenticate('jwt', { session: false }), alicuotaHistoryController.delete.bind(alicuotaHistoryController));
module.exports = router;
