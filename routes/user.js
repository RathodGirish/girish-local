var userModel = require('../models/model');
var USER_COLLECTION = userModel.user;
var bcrypt = require('bcryptjs');
var common = require('./common');

exports.signup = _signup;
exports.signin = _signin;

/*****
 * TODO : Singup New User
 * METHOD : POST
 */
function _signup(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var json = {};

    if (!common.isUndefined(email) && !common.isUndefined(password)) {

        var query = { email: email };
        USER_COLLECTION.find(query, {}, function (err, user) {

            if (err || Object.keys(user).length) {
                json.status = '0';
                json.result = { 'Error': "Email is already taken." };
                res.send(json);
            } else {
                var newUser = new USER_COLLECTION({
                    email: email,
                    password: password,
                    provider: "",
                    provider_details: []
                });

                common.saltAndHash(req, res, password, function (endryptedPassword) {
                    newUser.password = endryptedPassword;
                });

                newUser.save(function (err, result) {
                    if (err) {
                        json.status = '0';
                        json.result = { 'Error': err };
                        res.send(json);
                    } else {

                        json.status = '1';
                        json.userID = result._id
                        json.result = { 'Message': "You are registered successfully!" };
                        res.send(json);
                        console.log("json : " + JSON.stringify(json));
                    }
                });
            }
        });

    } else {
        json.status = '0';
        json.result = { 'Message': "Sign up details are not correct." };
        res.send(json);
    }
}


/*****
 * TODO : Singin User
 * METHOD : POST
 */
function _signin(req, res, next) {
    console.log("sigin called : " + req.body.email + " password : " + req.body.password + " is_social_login : " + req.body.is_social_login);
    var json = {};
    var email = req.body.email;
    var password = req.body.password;
    var is_social_login = req.body.is_social_login;
    var provider = req.body.provider;
    var provider_details = req.body.provider_details;
    if (is_social_login) {

        var query = {
            "provider": provider
        }

        query.provider_details = (provider == "twitter") ? { $elemMatch: { userId: provider_details.userId.toString() } } : { $elemMatch: { userId: provider_details.userID } };
        var Provider_Details = [];
        if (provider == "facebook") {
            Provider_Details[0] = {};
            Provider_Details[0].userId = provider_details.userID;
            Provider_Details[0].token = provider_details.accessToken;
            Provider_Details[0].expiresIn = provider_details.expiresIn;
            Provider_Details[0].session_key = provider_details.session_key;
        } else {
            Provider_Details[0] = provider_details;
            Provider_Details[0].userId = Provider_Details[0].userId.toString();
        }

        console.log("Provider_Details : " + JSON.stringify(Provider_Details))
        console.log("query : " + JSON.stringify(query))
        USER_COLLECTION.findOne(query, function (err, user) {
            console.log("user : " + JSON.stringify(user));
            if (err || common.isUndefined(user) || Object.keys(user).length <= 0) {

                var newUser = new USER_COLLECTION({
                    provider: provider,
                    provider_details: Provider_Details,
                    email: "",
                    password: ""
                });
                console.log("newUser : " + JSON.stringify(newUser));
                newUser.save(function (err, result) {
                    if (err) {
                        json.status = '0';
                        json.result = { 'Error': err };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.userID = result._id
                        json.result = { 'Message': "You are login successfully!" };
                        res.send(json);
                    }
                });
            } else {
                var updateUser = {
                    provider_details: Provider_Details,
                };

                USER_COLLECTION.update({ _id: user._id }, { $set: updateUser }, function (err, result) {
                    if (err) {
                        json.status = '0';
                        json.result = { 'Error': err };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.userID = user._id
                        json.result = { 'Message': "You are login successfully!" };
                        res.send(json);
                    }
                });
            }
        });
    } else {
        USER_COLLECTION.findOne({ "email": email }, function (err, user) {
            console.log("err : " + JSON.stringify(err));
            console.log("user : " + JSON.stringify(user));

            if (err || common.isUndefined(user) || Object.keys(user).length <= 0) {
                console.log("if called :");
                json.status = '0';
                json.result = { 'Error': "User not found." };
                res.send(json);
            } else {
                common.validatePassword(req, res, req.body.password, user.password, function (err, result) {
                    console.log("else called result : " + JSON.stringify(result));
                    console.log("else called err : " + JSON.stringify(err));
                    if (result) {
                        json.status = '1';
                        json.userID = user._id
                        json.result = { 'Message': "You are logged in successfully." };
                        res.send(json);
                    } else {
                        json.status = '0';
                        json.result = { 'Error': "Incorrect Password." };
                        res.send(json);
                    }
                });
            }
        });
    }
}