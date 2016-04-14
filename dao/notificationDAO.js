"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insert: function (notification) {
        return db.query(sqlMapping.notification.insert, notification);
    },
    findAll: function (hospitalId, page, conditions) {
        var sql = sqlMapping.notification.findAll;
        if (conditions.length) {
            sql = sql + ' and ' + conditions.join(' and ');
        }
        sql = sql + ' order by id desc limit ?,?';
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },
    findPatientQueue: function (registerDate, roomid, domainName) {
        return db.query(sqlMapping.notification.findPatientQueue, [registerDate, +roomid, domainName]);
    },
    findPatientQueueBy: function (rid) {
        return db.query(sqlMapping.notification.findPatientQueueBy, rid);
    },
    findPatientQueueByDepartmentId: function (registerDate, departmentId) {
        return db.query(sqlMapping.notification.findPatientQueueByDepartmentId, [registerDate, departmentId]);
    },
    findSequencesBy: function (doctorId, sequence, registerDate) {
        return db.query(sqlMapping.notification.findSequencesBy, [doctorId, sequence, registerDate]);
    }
}
