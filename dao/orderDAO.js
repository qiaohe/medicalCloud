"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insert: function (order) {
        return db.query(sqlMapping.order.insert, order);
    },
    removeOrder: function (orderNo) {
        return db.query(sqlMapping.order.removeOrder, orderNo);
    },

    findOrdersByType: function (hospitalId, type, conditions, page) {
        var sql = !conditions.length ? sqlMapping.order.findOrdersByType : sqlMapping.order.findOrdersByType + 'and ' + conditions.join(' and ');
        return db.queryWithCount(sql + ' order by sendDrugDate desc limit ?,?', [hospitalId, type, page.from, page.size]);
    },
    findOrdersByTypeAndStatus: function (hospitalId, type, status, page) {
        return db.queryWithCount(sqlMapping.order.findOrdersByTypeAndStatus, [hospitalId, type, status, page.from, page.size]);
    },
    findByOrderNos: function (hospitalId, orderNos) {
        return db.query(sqlMapping.order.findByOrderNos + '(' + orderNos + ')', [hospitalId, orderNos]);
    },

    findByOrderNo: function (hospitalId, orderNo) {
        return db.query(sqlMapping.order.findByOrderNo, [hospitalId, orderNo]);
    },

    findOrdersByStatus: function (hospitalId, status, conditions, page) {
        var sql = sqlMapping.order.findOrdersByStatus + (status != 1 ? ' and m.status = ?' : ' and (m.status in(?, 3))');
        if (conditions.length) {
            sql = sql + ' and ' + conditions.join(' and ');
        }
        sql = sql + ' order by ' + (status == 0 ? 'm.createDate ' : 'm.paymentDate') + ' desc limit ?, ?';
        return db.queryWithCount(sql, [hospitalId, status, page.from, page.size]);
    },

    findOrdersBy: function (hospitalId, conditions, page) {
        var sql = sqlMapping.order.findOrdersBy;
        if (conditions.length) {
            sql = sql + ' and ' + conditions.join(' and ');
        }
        sql = sql + ' order by m.createDate desc limit ?, ?';
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },
    findOrdersByWithPerformance: function (hospitalId, conditions, page) {
        var sql = sqlMapping.order.findOrdersByWithPerformance;
        if (conditions.length) {
            sql = sql + ' and ' + conditions.join(' and ');
        }
        sql = sql + ' order by m.createDate desc ' + (page ? ' limit ?,?' : '');
        return page ? db.queryWithCount(sql, [hospitalId, page.from, page.size]) : db.queryWithCount(sql, hospitalId);
    },

    findExtraFeeBy: function (orderNo) {
        return db.query(sqlMapping.order.findExtraFeeBy, orderNo);
    },
    update: function (order) {
        return db.query(sqlMapping.order.update, [order, order.orderNo]);
    },

    updateTotalPrice: function (orderNo, totalPrice) {
        return db.query(sqlMapping.order.updateTotalPrice, [totalPrice, orderNo]);
    },
    updateBy: function (order) {
        return db.query(sqlMapping.order.updateBy, [order, order.orderNo]);
    },
    findDrugUsageRecords: function (hospitalId, conditions, page) {
        var sql = sqlMapping.order.findDrugUsageRecords;
        if (conditions.length) {
            sql = sql + ' and ' + conditions.join(' and ');
        }
        sql = sql + ' order by rp.createDate limit ?,?';
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },
    findOrderByOrderNo: function (orderNo) {
        return db.query(sqlMapping.order.findOrderByOrderNo, [orderNo]);
    },
    findAccountInfo: function (hospitalId, conditions) {
        var sql = sqlMapping.order.findAccountInfo;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        return db.query(sql, hospitalId);
    },
    updatePaidAmount: function (orderNo, amount) {
        return db.query(sqlMapping.order.updatePaidAmount, [amount, amount, orderNo]);
    },
    findSubOrders: function (referenceOrderNo) {
        return db.query(sqlMapping.order.findSubOrders, referenceOrderNo);
    }

}
