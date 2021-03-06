const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MoveSchema = new Schema({
    moveId: String,
    name: String,
    type: String,
    power: Number,
    energy: Number,
    energyGain: Number,
    cooldown: Number,
    buffs: [Number],
    buffTarget: String,
    buffApplyChance: String
}, {collection: 'moves'});

module.exports = Move = mongoose.model("moves", MoveSchema);