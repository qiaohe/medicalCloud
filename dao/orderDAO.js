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
    findByOrderNos: function (hospitalId, orderNos) {
        return db.query(sqlMapping.order.findByOrderNos + '(' + orderNos + ')', [hospitalId, orderNos]);
    },
    findOrdersByStatus: function (hospitalId, status, page) {
        return db.queryWithCount(sqlMapping.order.findOrdersByStatus, [hospitalId, status, page.from, page.size]);
    },
    findOrdersBy: function (hospitalId, condition, page) {
        var sql = sqlMapping.order.findOrdersBy;
        if (condition)
            sql = sql + ' and ' + condition + ' limit ' + page.from + ',' + page.size;
        return db.queryWithCount(sql, hospitalId);
    },
    findExtraFeeBy: function (orderNo) {
        return db.query(sqlMapping.order.findExtraFeeBy, orderNo);
    },
    update: function (order) {
        return db.query(sqlMapping.order.update, [order, order.orderNo]);
    },
    findDrugUsageRecords: function (hospitalId, page) {
        return db.queryWithCount(sqlMapping.order.findDrugUsageRecords, [hospitalId, page.from, page.size]);
    }
}
