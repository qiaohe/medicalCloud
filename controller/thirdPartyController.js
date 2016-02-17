"use strict";
var config = require('../config');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var redis = require('../common/redisClient');
var _ = require('lodash');
var i18n = require('../i18n/localeMessage');
var qiniu = require('qiniu');
module.exports = {
    getQiniuToken: function(req, res, next) {
        qiniu.conf.ACCESS_KEY = 'ZNrhKtanGiBCTOPg4XRD9SMOAbLzy8iREzQzUP5T';
        qiniu.conf.SECRET_KEY = 'L6VfXirR55Gk6mQ67Jn4pg7bksMpc-F5mghT0GK4';
        var bucket = 'hisforce';
        var putPolicy = new qiniu.rs.PutPolicy(bucket);
        putPolicy.expires = 3600;
        res.send({
            token: putPolicy.token()
        });
        return next();
    }
}