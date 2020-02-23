const mongoose = require('mongoose');
const crypto = require('crypto');
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
    hash: {
        type: String,
        required: true
    },
    salt: {
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

/* // Method to set salt and hash the password for a user 
// setPassword method first creates a salt unique for every user 
// then it hashes the salt with user password and creates a hash 
// this hash is stored in the database as user password 
UserSchema.methods.setPassword = (password) => {
    // Creating a unique salt for a particular user
    this.salt = crypto.randomBytes(16).toString('hex');
    // Hashing user's salt and password with 1000 iterations, 64 length and sha512 digest 
    this.hash = crypto.pbkdf2Sync(password, this.salt,
    1000, 64, `sha512`).toString(`hex`);
};

// Method to check the entered password is correct or not 
// valid password method checks whether the user 
// password is correct or not 
// It takes the user password from the request  
// and salt from user database entry 
// It then hashes user password and salt 
// then checks if this generated hash is equal 
// to user's hash in the database or not 
// If the user's hash is equal to generated hash  
// then the password is correct otherwise not 
UserSchema.methods.validPassword = (password) => {
    var hash = crypto.pbkdf2Sync(password,
    this.salt, 1000, 64, `sha512`).toString(`hex`);
    return this.hash === hash;
}; */

module.exports = User = mongoose.model('user', UserSchema);