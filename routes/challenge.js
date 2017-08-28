var Model = require('../models/model');
var ObjectID = require('mongodb').ObjectID;
var CHALLENGE_COLLECTION = Model.challenges;
var common = require('./common');
var CONSTANT = require('../config/constant');
var azure = require('azure-storage');



exports.getChallenges = _getChallenges;
exports.getChallengesByuserId = _getChallengesByuserId;
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

/****
 * TODO : Get All challenge with user id
 * METHOD : GET
 */
function _getChallengesByuserId(req, res, next) {
    var json = {};
    var query = { "userId": req.query.userId };
    CHALLENGE_COLLECTION.find(query, function (err, challenges) {
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
                var newChallenge = new CHALLENGE_COLLECTION({
                    items: items,
                    name: name,
                    frequency: frequency,
                    categories: categories,
                    type: type,
                    image: CONSTANT.AZURE_BLOB_IMAGE_PATH + result.name,
                    latitude: latitude,
                    longitude: longitude,
                    userId: userId,
                    organizerName: organizerName,
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
    var type = req.body.type;
    var image = req.body.image;
    var isImageUpdate = req.body.isImageUpdate;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var userId = req.body.userId;
    var organizerName = req.body.organizerName;
    var location = req.body.location;

    if (isImageUpdate) {

        common.deleteImage(req.body.imageName, function (err, data) {
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
            type: type,
            image: url,
            latitude: latitude,
            longitude: longitude,
            userId: userId,
            organizerName: organizerName,
            location: location
        };

        console.log(' challengeId ' + challengeId);
        console.log(' updateChallengeObject ' + JSON.stringify(updateChallengeObject));

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
            common.deleteImage(req.body.imageName, function (err, data) {
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
    var errorMailId = [];
    var json = {};
    var flage = false;
    // var helper = require('sendgrid').mail;
    // var fromEmail = new helper.Email(CONSTANT.EMAIL_ID);
    // var toEmail = new helper.Email('dev-challenge@serenetechnologies.ca');
    // var subject = CONSTANT.MAIL_SUBJECT;
    // var content = new helper.Content('text/html', '<!DOCTYPE html > <html> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <title>PULSE</title> </head> <body style="background:#E6E6E6; margin:0px; padding:0px;"> <table border="0" cellspacing="0" cellpadding="0" align="center" style="width:100%;margin:0 auto; background:#fff;font-family:Open Sans,sans-serif; max-width:600px;"> <tbody> <tr><td style="height:60px;background:#E6E6E6;"> </td></tr> <tr> <td style="background: #222222; height: 50px; padding: 10px 17px"> <table width="100%"> <tr> <td> <a href="#"><img src="https://challenge.blob.core.windows.net/pulse/icon.png" alt="" title="" style="position: absolute;margin-top: -35px;"></a> </td> <td style="text-align:right; margin-right: 10px"> <a href="#" style="width:200px;color:#fff; text-decoration: none">VISIT PULSE APP</a> </td> </tr> </table> </td> </tr> <tr> <td style="font-size:0px;"> <img src="https://challenge.blob.core.windows.net/pulse/sale_2-banner.png" alt="" title="" style="margin-top:-1px" height="250px" width="600"> </td> </tr> <tr><td style="height:40px;"> </td></tr> <tr> <td style="text-align:left; padding:0 50px;"> <h1 style="margin:0px; padding:0px; font-size:30px; color:#4e4e4e; font-weight:600; text-align:center;">Hi </h1> </td> </tr> <tr><td style="height:10px;"> </td></tr> <tr> <td style="text-align:left; padding:0 50px;"> <h3 style="margin:0px; padding:0px; font-size:18px; color:#4e4e4e; font-weight:500; text-align:center; text-transform: uppercase;">Welcome to PULSE</h3> </td> </tr> <tr><td style="height:34px;"> </td></tr> <tr><td style="height:21px;"> </td></tr> <tr> <td> <p style="height:2px;background:#b6b1ab; margin:0px;">  </p> </td> </tr> <tr> <td style="background: #48A59A;padding:20px 30px; font-size: 12px; color: #fff"> <table style="width: 100%"> <tr> <td width="60%"><h2>Follow SeeWhatSeeCanDo</h2></td> <td width="40%; text-align:right"> <table style="width:100%"> <tr style="text-align: right;"> <td><img src="https://challenge.blob.core.windows.net/pulse/fb-black.png" alt="" title="" ></td> <td><img src="https://challenge.blob.core.windows.net/pulse/twiiiter-black.png" alt="" title="" ></td> <td><img src="https://challenge.blob.core.windows.net/pulse/fb-black.png" alt="" title="" ></td> <td><img src="https://challenge.blob.core.windows.net/pulse/twiiiter-black.png" alt="" title="" ></td> </tr> </table> </td> </tr> </table> </td> </tr> <tr> <td style="padding:0; text-align:center; background: #222222; height: 30px"> </td> </tr> <tr><td style="height:60px;background:#E6E6E6;"> </td></tr> </tbody> </table> </body> </html>');
    // var mail = new helper.Mail(fromEmail, subject, toEmail, content);

    // var sg = require("sendgrid")(CONSTANT.SEND_GRID_API_KEY);
    // var request = sg.emptyRequest({
    //     method: 'POST',
    //     path: '/v3/mail/send',
    //     body: mail.toJSON()
    // });

    // sg.API(request, function (error, response) {
    //     console.log("errr : " + JSON.stringify(error));
    //     if (error) {

    //     } else {
    //         console.log("res :" + JSON.stringify(response));
    //     }
    // });

    req.body.emailIds.forEach(function (element, index) {
        common.sendEmail(element, function (err, data) {
            if (err) {
                errorMailId.push(element);
                flage = true;
            }
            console.log(data.statusCode);
            console.log("mail data : " + JSON.stringify(data) + " element : " + element);
            if (index + 1 == req.body.emailIds.length) {
                json.status = '1';
                if (flage) {
                    json.result = { 'Message': "This EmailId not vails" + JSON.stringify(errorMailId) + " Remain All Mail Send Successfully." };
                } else {
                    json.result = { 'Message': "All Mail Send successfully." };
                }
                res.send(json);
            }
        });
    }, this);

}



