const express = require('express');
const Mon = require('../../models/Mon');
const app = express();

// @route GET /api/pokemon
// @desc Get All Pokemon
// @access Public
app.get('/', (req,res) => {
    Mon.find().then(mons => res.json(mons)).catch((err) => res.json(err));
});

app.get('/names', (req, res) => {
    var names = [];
    Mon.find().then(mons => {
        for(var i=0;i<mons.length;i++){
            names.push(mons[i].speciesName);
        }
        res.json(names);
    }).catch(err => res.json(err));
})

// @route GET /api/pokemon/:name
// @desc Get One Pokemon By Name
app.get('/:name', (req, res) => {
    var name = JSON.stringify(req.params.name);
    name = JSON.parse(name.toUpperCase());
    Mon.findOne({speciesName: name}).then(mon => res.json(mon)).catch((err) => res.json(err));
});

module.exports = app;