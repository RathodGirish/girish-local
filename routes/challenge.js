var Model = require('../models/model');
var CHALLENGE_COLLECTION = Model.challenges;
var common = require('./common');

exports.getChallenges = _getChallenges;

function _getChallenges(req, res, next) {
    var json = {};
    var query = {};
    CHALLENGE_COLLECTION.find(function (err, challenges) {
        console.log("err : " + err);
        console.log("challenge : " + challenges.length);
        if (err || challenges.length <= 0) {
            json.status = '0';
            json.result = { 'Error': "No Challenge Found." };
            res.send(json);
        } else {
            json.status = '1';
            json.challenges = challenges;
            res.send(json);
        }
    });

} 