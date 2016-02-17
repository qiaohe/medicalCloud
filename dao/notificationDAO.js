"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insert: function (notification) {
        return db.query(sqlMapping.notification.insert, notification);
    },
    findAll: function (page) {
        return db.queryWithCount(sqlMapping.notification.findAll, [page.from, page.size]);
    },
    findPatientQueue: function (registerDate, roomid) {
        return db.query(sqlMapping.notification.findPatientQueue, [registerDate, roomid]);
    },
    findPatientQueueBy: function (rid) {
        return db.query(sqlMapping.notification.findPatientQueueBy, rid);
    },
    findSequencesBy: function (doctorId, sequence) {
        return db.query(sqlMapping.notification.findSequencesBy, [doctorId, sequence]);
    }
}
