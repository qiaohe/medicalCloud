"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insert: function (order) {
        return db.query(sqlMapping.order.insert, order);
    },
    findOrdersByType: function (type, page) {
        return db.queryWithCount(sqlMapping.order.findOrdersByType, [type, page.from, page.size]);
    },
    findOrdersByTypeAndStatus: function (type, status, page) {
        return db.queryWithCount(sqlMapping.order.findOrdersByTypeAndStatus, [type, status, page.from, page.size]);
    },

    findOrdersByStatus: function (hospitalId, status, page) {
        return db.queryWithCount(sqlMapping.order.findOrdersByStatus, [hospitalId, status, page.from, page.size]);
    },
    update: function (order) {
        return db.query(sqlMapping.order.update, [order, order.orderNo]);
    },
    findDrugUsageRecords: function (hospitalId, page) {
        return db.queryWithCount(sqlMapping.order.findDrugUsageRecords, [hospitalId, page.from, page.size]);
    }
}
