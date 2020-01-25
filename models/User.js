const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MoveSchema = new Schema({
    moveId: String,
    name: String,
    type: String,
    power: Number,
    energy: Number,
    energyGain: Number,
    cooldown: Number
});

const MemberSchema = new Schema({
    _id: false,
    speciesName: String,
    speciesId: String, //might take this out
    stats: {
        atk: Number,
        def: Number,
        maxhp: Number
    },
    types: [String],
    cp: Number,
    fastMove: MoveSchema,
    chargedMove1: MoveSchema,
    chargedMove2: MoveSchema,
    IVs: [Number]
});

//Create Team Schema
const TeamSchema = new Schema({
    _id: false,
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    league: String,
    cup: String,
    members:{
        type: [MemberSchema],
        required: true
    }
});

//Create Friend Schema
const FriendSchema = new Schema({
    _id: Schema.Types.ObjectId,
    username: {
        type: String,
        required: true
    }
});

const ChallengeSchema = new Schema({
    _id: false,
    friend: FriendSchema,
    league: String,
    socketId: String,
    requestTimer: {
        type: Date,
        default: Date.now
    }
});

//Create user schema
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    usernameNCS: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pokebox: [MemberSchema],
    teams: [TeamSchema],
    friends: [FriendSchema],
    requests: [FriendSchema],
    challenges:[ChallengeSchema],
    favorite: String
}, {collection: 'users'});

module.exports = User = mongoose.model('user', UserSchema);