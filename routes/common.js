var crypto = require('crypto');
var CONSTANT = require('../config/constant');
var azure = require('azure-storage');

exports.generateSalt = _generateSalt;
exports.saltAndHash = _saltAndHash;
exports.md5 = _md5;
exports.validatePassword = _validatePassword;
exports.generateToken = _generateToken;
exports.isUserValid = _isUserValid;
exports.isUndefined = _isUndefined;
exports.deleteImage = _deleteImage;

function _generateSalt() {
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    var salt = '';
    for (var i = 0; i < 10; i++) {
        var p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
};

function _md5(str) {
    var return_str = crypto.createHash('md5').update(str).digest('hex');
    return return_str;
};

function _saltAndHash(req, res, pass, callback) {
    var salt = exports.generateSalt();
    callback(salt + exports.md5(pass + salt));
};

function _validatePassword(req, res, plainPass, hashedPass, callback) {
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + exports.md5(plainPass + salt);
    callback(null, hashedPass === validHash);
};

function _generateToken(email) {
    var token = exports.md5(email + 'product');
    return token;
}

function _isUserValid(req, res, callback) {
    var email = req.headers['email'];
    var token = req.headers['token'];
    var json = {};

    if (!email || !token) {
        // callback("Email and Token are required.", null);
        json.error = "Email and Token are required";
        res.send(json);
    } else {
        var newToken = exports.generateToken(email);
        if (newToken == token) {
            callback();
        } else {
            json.error = "Invalid Token";
            res.send(json);
        }
    }
}

function _isUndefined(str) {
    if (typeof str == 'undefined' || str == null || str == '') {
        return true;
    } else {
        return false;
    }

}

function _deleteImage(imageName, callback) {
    var blobService = azure.createBlobService(CONSTANT.BLOB_CONNECTION_STRING);
    blobService.deleteBlob(CONSTANT.AZURE_BLOB_CONTAINER_NAME, imageName.split(CONSTANT.AZURE_BLOB_IMAGE_PATH)[1], function (error, response) {
        if (error) {
            callback(error, null)
        } else {
            callback(null, "Image remove successfully")
        }
    });
}