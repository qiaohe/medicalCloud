"use strict";
var config = require('../config');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var redis = require('../common/redisClient');
var _ = require('lodash');
var i18n = require('../i18n/localeMessage');
var qiniu = require('qiniu');
module.exports = {
    getQiniuToken: function (req, res, next) {
        qiniu.conf.ACCESS_KEY = '0d02DpW7tBPiN3TuZYV7WcxmN1C9aCiNZeW9fp5W';
        qiniu.conf.SECRET_KEY = '7zD3aC6xpvp_DfDZ0LJhjMq6n6nB6UVDbl37C5FZ';
        var bucket = 'hisforce';
        var putPolicy = new qiniu.rs.PutPolicy(bucket);
        putPolicy.expires = 3600;
        res.send({
            ret: 0, data: {
                token: putPolicy.token()
            }
        });
        return next();
    }
}