var crypto = require('crypto');
var CONSTANT = require('../config/constant');
var azure = require('azure-storage');
var helper = require('sendgrid').mail;

var SEND_GRID_API_KEY = process.env.SEND_GRID_API_KEY;
exports.generateSalt = _generateSalt;
exports.saltAndHash = _saltAndHash;
exports.md5 = _md5;
exports.validatePassword = _validatePassword;
exports.generateToken = _generateToken;
exports.isUserValid = _isUserValid;
exports.isValidEmail = _isValidEmail;
exports.isUndefined = _isUndefined;
exports.deleteImage = _deleteImage;
exports.sendEmail = _sendEmail;

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

function _isValidEmail(emailField){
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    return reg.test(emailField.value);
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




function _sendEmail(emailId, callback) {
    if (_isUndefined(SEND_GRID_API_KEY)) {
        callback('API key not set for email sending', null);
    } else {
        var fromEmail = new helper.Email(CONSTANT.EMAIL_ID);
        var toEmail = new helper.Email(emailId);
        var subject = CONSTANT.MAIL_SUBJECT;
        var content = new helper.Content('text/html', 
        '<!DOCTYPE html >'+
            '<html>'+
            '<head>'+
                '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>'+
                '<meta name="viewport" content="width=device-width, initial-scale=1.0"/>'+
                '<title>PULSE</title>'+
            '</head>'+
            '<body style="background:#E6E6E6; margin:0px; padding:0px;">'+
                '<table border="0" cellspacing="0" cellpadding="0" align="center" style="width:100%;margin:0 auto; background:#fff;font-family:Open Sans,sans-serif; max-width:600px;">'+
                    '<tbody>'+
                        '<tr>'+
                        '<td style="height:60px;background:#E6E6E6;"> </td>'+
                        '</tr>'+
                        '<tr>'+
                        '<td style="background: #222222; height: 50px; padding: 10px 17px">'+
                            '<table width="100%">'+
                                '<tr>'+
                                    '<td style="text-align:right; margin-right: 10px"> <a href="#" style="width:200px;color:#fff; text-decoration: none">VISIT PULSE APP</a> </td>'+
                                '</tr>'+
                            '</table>'+
                        '</td>'+
                        '</tr>'+
                        '<tr>'+
                        '<td style="font-size:0px;"> <img src="https://challenge.blob.core.windows.net/pulse/icon.png" alt="" title="" style="margin-top:-1px" height="250px" width="600"> </td>'+
                        '</tr>'+
                        '<tr>'+
                        '<td style="height:40px;"> </td>'+
                        '</tr>'+
                        '<tr>'+
                        '<td style="text-align:left; padding:0 50px;">'+
                            '<h1 style="margin:0px; padding:0px; font-size:30px; color:#4e4e4e; font-weight:600; text-align:center;">Hi </h1>'+
                        '</td>'+
                        '</tr>'+
                        '<tr>'+
                        '<td style="height:10px;"> </td>'+
                        '</tr>'+
                        '<tr>'+
                        '<td style="text-align:left; padding:0 50px;">'+
                            '<h3 style="margin:0px; padding:0px; font-size:18px; color:#4e4e4e; font-weight:500; text-align:center; text-transform: uppercase;">Welcome to PULSE</h3>'+
                        '</td>'+
                        '</tr>'+
                        '<tr>'+
                        '<td style="height:34px;"> </td>'+
                        '</tr>'+
                        '<tr>'+
                        '<td style="height:21px;"> </td>'+
                        '</tr>'+
                        
                        '<tr>'+
                        '<td style="padding:0; text-align:center; background: #222222; height: 30px"> </td>'+
                        '</tr>'+
                        '<tr>'+
                        '<td style="height:60px;background:#E6E6E6;"> </td>'+
                        '</tr>'+
                    '</tbody>'+
                '</table>'+
            '</body>'+
            '</html>');
        var mail = new helper.Mail(fromEmail, subject, toEmail, content);

        var sg = require("sendgrid")(SEND_GRID_API_KEY);
        var request = sg.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
        });

        sg.API(request, function (error, response) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, response);
            }
        });
    }
}