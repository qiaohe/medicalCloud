"use strict";
var config = require('../config');
var JPush = require("jpush-sdk");
var _ = require('lodash');
var deviceDAO = require('../dao/deviceDAO');
var hospitalDAO = require('../dao/hospitalDAO');
var i18n = require('../i18n/localeMessage');
var notificationDAO = require('../dao/notificationDAO');
var pusher = require('../domain/NotificationPusher');
var redis = require('../common/redisClient');
var Promise = require('bluebird');
var moment = require('moment');
module.exports = {
    addDevice: function (req, res, next) {
        var device = req.body;
        device.createDate = new Date();
        deviceDAO.findByUid(device.uid).then(function (oldDevice) {
            return oldDevice.length ? deviceDAO.update(device) : deviceDAO.insert(device);
        }).then(function (result) {
            return res.send({ret: 0, message: i18n.get('device.add.success')})
        }).catch(function (err) {
            return res.send({ret: 1, message: err.message})
        });
        return next();
    },
    pushNotification: function (req, res, next) {
        var client = JPush.buildClient(config.jpush.appKey, config.jpush.masterSecret);
        client.push().setPlatform(JPush.ALL)
            .setAudience(JPush.ALL)
            .setNotification(req.body.body, JPush.android(req.body.body, req.body.title, 1, req.body.extra))
            .send(function (err, response) {
                if (err) throw err;
                notificationDAO.insert({
                    body: req.body.body, title: req.body.title, extra: JSON.stringify(req.body.extra),
                    createDate: new Date(), sendno: response.sendno, msg_id: response.msg_id,
                    hospitalId: req.user.hospitalId
                }).then(function (result) {
                    res.send({ret: 0, message: i18n.get('notification.send.success')});
                }).catch(function (err) {
                    res.send({ret: 1, message: err.message});
                });
            });
        return next();
    },
    addGroupMessage: function (req, res, next) {
        var gm = req.body;
        notificationDAO.insertGroupMessage(_.assign(gm, {
            createDate: new Date(),
            sender: req.user.id,
            senderName: req.user.name,
            status: 0,
            gender: (gm.gender ? gm.gender : null),
            hospitalId: req.user.hospitalId
        })).then(function (result) {
            gm.id = result.insertId;
            var favoriteQueue = 'h:' + req.user.hospitalId + ':favorite:' + 'patients';
            return redis.zrangeAsync([favoriteQueue, 0, -1]);
        }).then(function (patientIdList) {
            return notificationDAO.findPatients(req.user.hospitalId, gm.gender, patientIdList);
        }).then(function (patients) {
            patients && patients.length && patients.forEach(function (patient) {
                pusher.push({
                    body: gm.content,
                    uid: patient.uid,
                    patientName: patient.patientName,
                    patientMobile: patient.patientMobile,
                    hospitalId: req.user.hospitalId,
                    title: gm.title,
                    type: 1,
                    audience: {registration_id: [patient.token]}
                }, function (err, result) {
                    if (err) throw err;
                });
            });
            redis.incr('h:' + req.user.hospitalId + ':m:' + moment().format('YYYYMM'));
            res.send({ret: 0, data: gm});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getGroupMessages: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        notificationDAO.findGroupMessages(hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (groupMessages) {
            if (groupMessages.rows.length < 1) return res.send({ret: 0, data: []});
            groupMessages.rows.forEach(function (gm) {
                gm.target = (!!gm.gender ? config.gender[gm.gender] : '所有人');
                delete gm.gender;
            });
            groupMessages.pageIndex = pageIndex;
            res.send({ret: 0, data: groupMessages});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getPatientsOfGroupMessage: function (req, res, next) {
        var favoriteQueue = 'h:' + req.user.hospitalId + ':favorite:' + 'patients';
        var gender = req.query.gender;
        redis.zrangeAsync([favoriteQueue, 0, -1]).then(function (patientIdList) {
            return notificationDAO.findPatients(req.user.hospitalId, gender ? gender : null, patientIdList);
        }).then(function (patients) {
            if (patients && patients.length < 1) return res.send({ret: 0, data: []});
            Promise.map(patients, function (patient) {
                patient.gender = (patient.gender ? config.gender[patient.gender] : config.gender[0]);
                return redis.zrankAsync(favoriteQueue, patient.uid).then(function (index) {
                    patient.favorited = (index != null);
                    patient.outPatiented = (!patient.favorited)
                });
            }).then(function (result) {
                res.send({ret: 0, data: patients});
            }).catch(function (err) {
                res.send({ret: 1, message: err.message});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getMessageSummary: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var data = {};
        hospitalDAO.findByIdWithGroupMessage(hospitalId).then(function (hospitals) {
            data.messageCountPerMonth = hospitals[0].messageCountPerMonth;
            return redis.getAsync('h:' + req.user.hospitalId + ':m:' + moment().format('YYYYMM'));
        }).then(function (reply) {
            data.sentMessageCountCurrentMonth = (reply != null ? +reply : 0);
            return res.send({ret: 0, data: data});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }
}
