const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const MonSchema = new Schema({
    dex: Number,
    speciesName: String,
    speciesId: String,
    baseStats: {
        atk: Number,
        def: Number,
        hp: Number
    },
    types: [String],
    fastMoves: [String],
    chargedMoves: [String],
    legacyMoves: [String],
    defaultIVs:{
        cp1500:[Number],
        cp2500:[Number]
    }
    /* sprite: {
        type: Buffer,
        required: true
    } */
}, {collection: 'pokemon'});

module.exports = Mon = mongoose.model("pokemon", MonSchema);