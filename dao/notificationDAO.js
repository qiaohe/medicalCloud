"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insert: function (notification) {
        return db.query(sqlMapping.notification.insert, notification);
    },
    findAll: function (hospitalId, page) {
        return db.queryWithCount(sqlMapping.notification.findAll, [hospitalId, page.from, page.size]);
    },
    findPatientQueue: function (registerDate, roomid) {
        return db.query(sqlMapping.notification.findPatientQueue, [registerDate, +roomid]);
    },
    findPatientQueueBy: function (rid) {
        return db.query(sqlMapping.notification.findPatientQueueBy, rid);
    },
    findPatientQueueByDepartmentId: function (registerDate, departmentId) {
        return db.query(sqlMapping.notification.findPatientQueueByDepartmentId, [registerDate, departmentId]);
    },
    findSequencesBy: function (doctorId, sequence) {
        return db.query(sqlMapping.notification.findSequencesBy, [doctorId, sequence]);
    }
}
