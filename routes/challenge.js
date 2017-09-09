var Model = require('../models/model');
var ObjectID = require('mongodb').ObjectID;
var CHALLENGE_COLLECTION = Model.challenges;
var COMMON = require('./common');
var CONSTANT = require('../config/constant');
var azure = require('azure-storage');


exports.getChallenges = _getChallenges;
exports.getChallengesByuserId = _getChallengesByuserId;
exports.getChallengeDetail = _getChallengeDetail;
exports.getChallengeById = _getChallengeById;
exports.addChallenge = _addChallenge;
exports.sendInvitation = _sendInvitation;
exports.editChallengeById = _editChallengeById;
exports.removeChallengeById = _removeChallengeById;


/****
 * TODO : Get All challenge with  location
 * METHOD : GET
 */
function _getChallenges(req, res, next) {
    var json = {};
    var query = {};
    var param = { _id: 1, location: 1, name: 1, organizerName: 1, image: 1, latitude: 1, longitude: 1 };
    CHALLENGE_COLLECTION.find(query, param, function (err, challenges) {
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

/****
 * TODO : Get All challenge with user id
 * METHOD : GET
 */
function _getChallengesByuserId(req, res, next) {
    var json = {};
    var param = { _id: 1, name: 1, image: 1, organizerName: 1 }
    var query = { "userId": req.query.userId };
    CHALLENGE_COLLECTION.find(query, param, function (err, challenges) {
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

/****
 * TODO : Get All challenge Detail
 * METHOD : GET
 */
function _getChallengeDetail(req, res, next) {
    var json = {};
    var param = {};
    var query = { "_id": new ObjectID(req.query.challengeId) };
    CHALLENGE_COLLECTION.findOne(query, param, function (err, challenge) {
        if (err) {
            json.status = '0';
            json.result = { 'Error': JSON.stringify(err) };
            res.send(json);
        } else {
            json.status = '1';
            json.challenge = challenge;
            res.send(json);
        }
    });
}

/****
 * TODO : Get All challenge with id
 * METHOD : GET
 */
function _getChallengeById(req, res, next) {
    var json = {};
    var query = { "_id": new ObjectID(req.query.challengeId) };
    CHALLENGE_COLLECTION.findOne(query, function (err, challenge) {
        console.log("challenge : " + challenge.length);
        if (err) {
            json.status = '0';
            json.result = { 'Error': JSON.stringify(err) };
            res.send(json);
        } else {
            json.status = '1';
            json.challenge = challenge;
            console.log("JSON : " + JSON.stringify(json));
            res.send(json);
        }
    });
}


/*****
 * TODO : ADD New Challenge
 * METHOD : POST
 */
function _addChallenge(req, res) {
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
    var organizerName = req.body.organizerName;
    var location = req.body.location;
    var lastDate = req.body.lastDate;
    var desc = req.body.desc;

    var imageName = new Date().getTime() + '.jpeg';
    console.log("lastDate : " + lastDate);
    var rawdata = image;
    var matches = rawdata.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    var buffer = new Buffer(matches[2], 'base64');

    var blobService = azure.createBlobService(CONSTANT.BLOB_CONNECTION_STRING);

    blobService.createBlockBlobFromText(CONSTANT.AZURE_BLOB_CONTAINER_NAME, imageName, buffer, {
        contentSettings: {
            contentType: 'image/jpeg',
            contentEncoding: 'base64'
        }
    },
        function (error, result, response) {
            if (error) {
                json.status = '0';
                json.result = { 'Error': error };
                res.send(json);
            } else {
                var newChallenge = new CHALLENGE_COLLECTION({
                    items: items,
                    name: name,
                    frequency: frequency,
                    categories: categories,
                    lastDate: lastDate,
                    type: type,
                    image: CONSTANT.AZURE_BLOB_IMAGE_PATH + result.name,
                    latitude: latitude,
                    longitude: longitude,
                    userId: userId,
                    organizerName: organizerName,
                    location: location,
                    desc: desc
                });

                newChallenge.save(function (err, data) {
                    if (err) {
                        json.status = '0';
                        json.result = { 'Error': err };
                        res.send(json);
                    } else {
                        console.log("data : " + JSON.stringify(data));
                        json.status = '1';
                        json.result = { 'Message': "Challenge added successfully !!" };
                        res.send(json);
                    }
                });
            }
        });
}

/*****
 * TODO : EDIT Challenge By Id
 * METHOD : POST
 */
function _editChallengeById(req, res) {
    var json = {};
    var challengeId = req.param('id');
    var items = req.body.items;
    var name = req.body.name;
    var frequency = req.body.frequency;
    var categories = req.body.categories;
    var lastDate = req.body.lastDate;
    var type = req.body.type;
    var image = req.body.image;
    var isImageUpdate = req.body.isImageUpdate;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var userId = req.body.userId;
    var organizerName = req.body.organizerName;
    var location = req.body.location;
    var desc = req.body.desc;
    console.log("lastdate : " + lastDate);
    if (isImageUpdate) {

        COMMON.deleteImage(req.body.imageName, function (err, data) {
            if (err) {
                json.status = '0';
                json.result = { 'Error': JSON.stringify(err) };
                res.send(json);
            } else {

                var imageName = new Date().getTime() + '.jpeg';
                var rawdata = image;
                var matches = rawdata.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                var buffer = new Buffer(matches[2], 'base64');
                var blobService = azure.createBlobService(CONSTANT.BLOB_CONNECTION_STRING);

                blobService.createBlockBlobFromText(CONSTANT.AZURE_BLOB_CONTAINER_NAME, imageName, buffer, {
                    contentSettings: {
                        contentType: 'image/jpeg',
                        contentEncoding: 'base64'
                    }
                },
                    function (error, result, response) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'Error': error };
                            res.send(json);
                        } else {
                            updateChallenge(res, CONSTANT.AZURE_BLOB_IMAGE_PATH + result.name);
                        }
                    });
            }
        });

    } else {
        updateChallenge(res, image);
    }

    function updateChallenge(res, url) {
        var updateChallengeObject = {
            items: items,
            name: name,
            frequency: frequency,
            categories: categories,
            lastDate: lastDate,
            type: type,
            image: url,
            latitude: latitude,
            longitude: longitude,
            userId: userId,
            organizerName: organizerName,
            location: location,
            desc: desc
        };

        // console.log(' challengeId ' + challengeId);
        // console.log(' updateChallengeObject ' + JSON.stringify(updateChallengeObject));

        CHALLENGE_COLLECTION.update({ _id: new ObjectID(challengeId) }, { $set: updateChallengeObject },
            function (err, result) {
                console.log(' result["n"] ' + JSON.stringify(result["n"]));
                if (err) {
                    json.status = '0';
                    json.result = { 'Error': err };
                    res.send(json);
                } if (result["n"] <= 0) {
                    json.status = '0';
                    json.result = { 'Error': "Challenge Not Found" };
                    res.send(json);
                } else {
                    json.status = '1';
                    json.result = { 'Message': "Challenge Updated successfully !!" };
                    res.send(json);
                }
            });
    }
}


/*****
 * TODO : Remove Challenge By Id
 * METHOD : POST
 */
function _removeChallengeById(req, res) {
    var json = {};
    var blobService = azure.createBlobService(CONSTANT.BLOB_CONNECTION_STRING);
    var challengeId = req.param('id');
    CHALLENGE_COLLECTION.remove({ _id: new ObjectID(challengeId) }, function (removeChallengeError, challenge) {
        if (removeChallengeError) {
            json.status = '0';
            json.result = { 'Error': removeChallengeError };
            res.send(json);
        } else {
            COMMON.deleteImage(req.body.imageName, function (err, data) {
                if (err) {
                    json.status = '0';
                    json.result = { 'Error': JSON.stringify(err) };
                    res.send(json);
                } else {
                    json.status = '1';
                    json.result = { 'Message': "Challenge Delete successfully" };
                    res.send(json);
                }
            });
        }
    });
}


/*****
 * TODO : send Invitation
 * METHOD : POST
 */
function _sendInvitation(req, res) {
    var emailIds = req.body.emailIds;
    var errorMailId = [];
    var json = {};
    var flage = false;
    
    if(!emailIds || emailIds.length <= 0){
        json.status = '0';
        json.result = { 'Message': "Email Id is missing." };
        res.send(json);
    } else {
        emailIds.forEach(function (element, index) {
            if(!COMMON.isValidEmail(element)){
                errorMailId.push(element);
                flage = true;
            } else {
                COMMON.sendEmail(element, function (err, data) {
                    console.log('err ' + JSON.stringify(err));
                    if (err) {
                        // errorMailId.push(element);
                        // flage = true;
                        json.status = '0';
                        json.result = { 'Message': "Fail to send email from server side." };
                        res.send(json);
                    }
                    
                    console.log("mail data : " + JSON.stringify(data) + " element : " + element);
                    if (index + 1 == req.body.emailIds.length) {
                        json.status = '1';
                        if (flage) {
                            json.result = { 'Message': "This EmailId not valid " + JSON.stringify(errorMailId) + " Remain All Mail Send Successfully." };
                        } else {
                            json.result = { 'Message': "Invitation Send successfully." };
                        }
                        res.send(json);
                    }
                });
            }
        }, this);
    }
}