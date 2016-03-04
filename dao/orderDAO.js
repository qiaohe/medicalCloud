"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insert: function (order) {
        return db.query(sqlMapping.order.insert, order);
    },
    findOrdersByType: function (type, conditions, page) {
        var sql = !conditions.length ? sqlMapping.order.findOrdersByType : sqlMapping.order.findOrdersByType + 'and ' + conditions.join(' and ');
        return db.queryWithCount(sql + ' limit ?,?', [type, page.from, page.size]);
    },
    findOrdersByTypeAndStatus: function (type, status, page) {
        return db.queryWithCount(sqlMapping.order.findOrdersByTypeAndStatus, [type, status, page.from, page.size]);
    },
    findByOrderNos: function (hospitalId, orderNos) {
        return db.query(sqlMapping.order.findByOrderNos + '(' + orderNos + ')', [hospitalId, orderNos]);
    },
    findOrdersByStatus: function (hospitalId, status, conditions, page) {
        var sql = sqlMapping.order.findOrdersByStatus;
        if (conditions.length) {
            sql = sql + ' and ' + conditions.join(' and ');
        }
        sql = sql + ' limit ?, ?';
        return db.queryWithCount(sql, [hospitalId, status, page.from, page.size]);
    },

    findOrdersBy: function (hospitalId, conditions, page) {
        var sql = sqlMapping.order.findOrdersBy;
        if (conditions.length) {
            sql = sql + ' and ' + conditions.join(' and ');
        }
        sql = sql + ' limit ?, ?';
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },
    findExtraFeeBy: function (orderNo) {
        return db.query(sqlMapping.order.findExtraFeeBy, orderNo);
    },
    update: function (order) {
        return db.query(sqlMapping.order.update, [order, order.orderNo]);
    },
    findDrugUsageRecords: function (hospitalId, conditions, page) {
        var sql = sqlMapping.order.findDrugUsageRecords;
        if (conditions.length) {
            sql = sql + ' and ' + conditions.join(' and ');
        }
        sql = sql + ' order by rp.createDate limit ?,?';
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    }
}