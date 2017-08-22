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
        if (err) {
            json.status = '0';
            json.result = { 'Error': JSON.stringify(err) };
            res.send(json);
        } else {
            json.status = '1';
            json.challenges = challenges;
            res.send(json);
        }
    });

} 