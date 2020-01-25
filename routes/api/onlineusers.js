const express = require('express');
const Online = require('../../models/Online');
const app = express();

// @route /api/online/
// @desc Get all online users
// @access Public
app.get('/', (req, res) => {
    Online.find().then(users => res.json(users)).catch(err => res.json(err));
});

// @route /api/online/on/
// @desc Add a user to online
// @access Public
app.post('/on', (req, res) => {
    const onlineUser = new Online({
        _id: req.body._id,
        username: req.body.username,
        favorite: req.body.favorite
    });
    onlineUser.save().then(user => res.json(user)).catch(err => res.json(err));
});

// @route /api/online/off/:id
// @desc Remove user from online
// @access Public
app.delete('/off/:id', (req, res) => {
    Online.findByIdAndDelete(req.params.id).then(user => res.json(user)).catch(err => res.json(err));
});

module.exports = app;