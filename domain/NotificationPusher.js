"use strict";
var config = require('../config');
var notificationDAO = require('../dao/notificationDAO');
var JPush = require("jpush-sdk");
module.exports = {
    push: function (notification, callback) {
        var client = JPush.buildClient(config.jpush.appKey, config.jpush.masterSecret);
        client.push().setPlatform(JPush.ALL)
            .setAudience(notification.audience ? notification.audience : JPush.ALL).
            setNotification(notification.body, JPush.ios(notification.title), JPush.android(notification.body, notification.title, 1, notification.extra))
            .setOptions(null, null, null, true, null)
            .send(function (err, response) {
                if (err) throw err;
                notificationDAO.insert({
                    body: notification.body, title: notification.title, extra: JSON.stringify(notification.extra),
                    createDate: new Date(), sendno: response.sendno, msg_id: response.msg_id,
                    uid: notification.uid,
                    patientName: notification.patientName,
                    patientMobile: notification.patientMobile
                }).then(function (result) {
                    return callback(err, result);
                })
            });
    }
}
