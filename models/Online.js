const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OnlineSchema = new Schema({
    _id: Schema.Types.ObjectId,
    username: {
        type: String,
        required: true
    },
    favorite: {
        type: String,
        required: true
    }
}, {collection: 'online'});

module.exports = Online = mongoose.model('online', OnlineSchema);