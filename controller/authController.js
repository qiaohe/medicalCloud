"use strict";
var md5 = require('md5');
var config = require('../config');
var redis = require('../common/redisClient');
var i18n = require('../i18n/localeMessage');
var _ = require('lodash');
var employeeDAO = require('../dao/employeeDAO');
var hospitalDAO = require('../dao/hospitalDAO');
var uuid = require('node-uuid');
var rongcloudSDK = require('rongcloud-sdk');
rongcloudSDK.init(config.rongcloud.appKey, config.rongcloud.appSecret);
module.exports = {
    login: function (req, res, next) {
        var userName = (req.body && req.body.username) || (req.query && req.query.username);
        var password = (req.body && req.body.password) || (req.query && req.query.password);
        var user = {};
        employeeDAO.findByUsername(userName).then(function (users) {
            if (!users || !users.length) return res.send({ret: 1, message: i18n.get('member.not.exists')});
            user = users[0];
            if (user.password != md5(password)) return res.send({
                ret: 1, message: i18n.get('member.password.error')
            });
            var token = uuid.v4();
            redis.set(token, JSON.stringify(user));
            redis.expire(token, config.app.tokenExpire);
            user.token = token;
            return redis.getAsync('uid:' + user.id + ':lastLogin');
        }).then(function (result) {
            redis.set('uid:' + user.id + ':lastLogin', new Date().getTime());
            user.lastLoginDate = result;
            hospitalDAO.findCustomerServiceId(user.hospitalId).then(function (cs) {
                if (cs && cs.length && cs[0].customerServiceUid && user.id == cs[0].customerServiceUid) {
                    rongcloudSDK.user.getToken(user.hospitalId + '-' + user.id, user.name, 'http://7xoadl.com2.z0.glb.qiniucdn.com/user58.png', function (err, resultText) {
                        if (err) throw err;
                        user.rongToken = JSON.parse(resultText).token;
                        res.send({ret: 0, data: user});
                    });
                } else {
                    res.send({ret: 0, data: user});
                }
            })
        });
        return next();
    },

    logout: function (req, res, next) {
        var token = req.body['x-auth-token'] || req.query['x-auth-token'] || req.headers['x-auth-token'];
        if (!token) return res.send(401, i18n.get('token.not.provided'));
        redis.delAsync(token).then(function () {
            res.send({ret: 0, message: i18n.get('logout.success')});
        });
        return next();
    },
    getMemberInfo: function (req, res, next) {
        employeeDAO.findByIdWithHospital(req.user.hospitalId, req.user.id).then(function (employees) {
            res.send({ret: 0, data: employees[0]});
        });
        return next();
    }
}