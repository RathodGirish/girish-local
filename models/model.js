var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
Collection Name :user
*/
var user = new Schema({
    email: {
        type: String
    },
    password: {
        type: String
    },
    provider: {
        type: String
    },
    provider_details: {
        type: []
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, { collection: 'user' });
exports.user = mongoose.model('user', user);

/*
Collection Name :challenges
*/
var challenges = new Schema({
    items: {
        type: []
    },
    name: {
        type: String
    },
    frequency: {
        type: String
    },
    lastDate: {
        type: String
    },
    type: {
        type: String
    },
    image: {
        type: String
    },
    categories: {
        type: String
    },
    desc: {
        type: String
    },
    userId: {
        type: String
    },
    organizerName: {
        type: String
    },
    location: {
        type: String
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String
    }
}, { collection: 'challenges' });
exports.challenges = mongoose.model('challenges', challenges);