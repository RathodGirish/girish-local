var Model = require('../models/model');
var CHALLENGE_COLLECTION = Model.challenges;
var common = require('./common');
var CONSTANT = require('../config/constant');
var azure = require('azure-storage');

exports.getChallenges = _getChallenges;
exports.addChallenges = _addChallenges;


/****
 * TODO : Get All challenges with out location
 * METHOD : GET
 */

function _getChallenges(req, res, next) {
    var json = {};
    var query = {};
    CHALLENGE_COLLECTION.find(function (err, challenges) {
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


/*****
 * TODO : ADD New Challenges
 * METHOD : POST
 */

function _addChallenges(req, res) {
    var json = {};
    var items = req.body.items;
    var name = req.body.name;
    var frequency = req.body.frequency;
    var categories = req.body.categories;
    var type = req.body.type;
    var image = req.body.image;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var userId = req.body.userId;
    var userName = req.body.userName;
    var location = req.body.location;

    var imageName = new Date().getTime() + '.jpeg';

    var rawdata = image;
    var matches = rawdata.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    var buffer = new Buffer(matches[2], 'base64');

    var blobService = azure.createBlobService(CONSTANT.blobConnectionString);

    blobService.createBlockBlobFromText(CONSTANT.containerName, imageName, buffer, {
        contentSettings: {
            contentType: 'image/jpeg',
            contentEncoding: 'base64'
        }

    },
        function (error, result, response) {
            if (error) {
                res.send(error);
            }
            var newChallenge = new CHALLENGE_COLLECTION({
                items: items,
                name: name,
                frequency: frequency,
                categories: categories,
                type: type,
                image: CONSTANT.imagePath + result.name,
                latitude: latitude,
                longitude: longitude,
                userId: userId,
                userName: userName,
                location: location
            });

            newChallenge.save(function (err, data) {
                if (err) {
                    json.status = '0';
                    json.result = { 'Error': err };
                    res.send(json);
                } else {
                    json.status = '1';
                    json.result = { 'Message': "Challenge added successfully !!" };
                    res.send(json);
                }
            });
        });



    // var newChallenge = new CHALLENGE_COLLECTION({
    //     items: items,
    //     name: name,
    //     frequency: frequency,
    //     categories: categories,
    //     type: type,
    //     image: image,
    //     latitude: latitude,
    //     longitude: longitude,
    //     userId: userId,
    //     userName: userName,
    //     location: location
    // });

    // newChallenge.save(function (err, data) {
    //     if (err) {
    //         json.status = '0';
    //         json.result = { 'Error': err };
    //         res.send(json);
    //     } else {

    //         // var gm = require('gm');

    //         // gm('background-Image02.jpg')
    //         //     .resize(50, 50)
    //         //     .autoOrient()
    //         //     .write('xxxxxxxxxx.jpg', function (err, data) {
    //         //         if (err) {
    //         //             console.log(' err : ' + err)
    //         //         }
    //         //         else {
    //         //             console.log(' data : ' + JSON.stringify(data))
    //         //         }

    //         //     });

    //         // json.status = '1';
    //         // json.result = { 'Message': "Challenge added successfully !!" };
    //         // res.send(json);
    //     }
    // });

}