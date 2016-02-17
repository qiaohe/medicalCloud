"use strict";
var config = require('../config');
var JPush = require("jpush-sdk");
var _ = require('lodash');
var deviceDAO = require('../dao/deviceDAO');
var i18n = require('../i18n/localeMessage');
var notificationDAO = require('../dao/notificationDAO');

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
                    createDate: new Date(), sendno: response.sendno, msg_id: response.msg_id
                }).then(function (result) {
                    res.send({ret: 0, message: i18n.get('notification.send.success')});
                })
            });
        return next();
    }
}
