const express = require('express');
const Move = require('../../models/Move');
const app = express();

// @route GET /api/moves
// @desc Get All Moves
// @access Public
app.get('/', (req,res) => {
    Move.find().then(moves => res.json(moves)).catch((err) => res.json(err));
});

// @route GET /api/moves/:moveId
// @desc Get One Move By ID
app.get('/:moveId', (req, res) => {
    Move.findOne({moveId: req.params.moveId}).then(move => res.json(move)).catch((err) => res.json(err));
});

module.exports = app;