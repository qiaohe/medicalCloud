"use strict";
var config = require('../config');
var redis = require('../common/redisClient');
var i18n = require('../i18n/localeMessage');
var registrationDAO = require('../dao/registrationDAO');
var medicalDAO = require('../dao/medicalDAO');
var dictionaryDAO = require('../dao/dictionaryDAO');
var orderDAO = require('../dao/orderDAO');
var Promise = require("bluebird");
var _ = require('lodash');
var moment = require('moment');
module.exports = {
    saveMedicalHistory: function (req, res, next) {
        var medicalHistory = req.body;
        medicalHistory.createDate = new Date();
        medicalHistory.hospitalId = req.user.hospitalId;
        if (!req.body.templateId) delete delete req.body.templateId;
        if (medicalHistory.id) {
            delete req.body.createDate;
            medicalDAO.updateMedicalHistory(req.body).then(function (result) {
                res.send({ret: 0, message: '更新成功'})
            })
        } else {
            registrationDAO.findRegistrationsById(medicalHistory.registrationId).then(function (registrations) {
                var r = registrations[0];
                medicalHistory = _.assign(medicalHistory, {
                    doctorId: r.doctorId,
                    doctorName: r.doctorName,
                    departmentId: r.departmentId,
                    departmentName: r.departmentName,
                    patientName: r.patientName,
                    patientMobile: r.patientMobile,
                    patientId: r.patientId
                });
                return medicalDAO.insertMedicalHistory(medicalHistory);
            }).then(function (result) {
                medicalHistory.id = result.id;
                return res.send({ret: 0, data: medicalHistory});
            });
        }
        return next();
    },

    saveRecipe: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var registrationId = req.body.registrationId;
        var drugItems = req.body.drugs;
        var items = [];
        redis.incrAsync('h:' + hospitalId + ':' + moment().format('YYYYMMDD') + ':1:incr').then(function (reply) {
                var orderNo = hospitalId + '-' + moment().format('YYYYMMDD') + '-1-' + reply;
                Promise.map(drugItems, function (item, index) {
                    return dictionaryDAO.findDrugById(+item.drugId).then(function (drugs) {
                        item = _.assign(item, {
                            name: drugs[0].name,
                            specification: drugs[0].specification,
                            price: drugs[0].sellPrice,
                            code: drugs[0].code,
                            totalPrice: +drugs[0].sellPrice * +item.quantity,
                            createDate: new Date(),
                            registrationId: registrationId,
                            unit: drugs[0].unit,
                            hospitalId: hospitalId,
                            orderNo: orderNo
                        });
                        items.push(item);
                        return medicalDAO.insertRecipe(item);
                    });
                }).then(function (result) {
                    var amount = _.sum(items, function (item) {
                        return item.totalPrice;
                    });
                    return orderDAO.insert({
                        orderNo: orderNo,
                        registrationId: registrationId,
                        hospitalId: hospitalId,
                        amount: amount,
                        paidAmount: 0.00,
                        paymentAmount: amount,
                        status: 0,
                        createDate: new Date(),
                        type: 1
                    });
                }).then(function (result) {
                    res.send({ret: 0, data: '保存成功'});
                });
            }
        );
        return next();
    },

    savePrescription: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var registrationId = req.body.registrationId;
        var chargeItems = req.body.chargeItems;
        redis.incrAsync('h:' + hospitalId + ':' + moment().format('YYYYMMDD') + ':2:incr').then(function (reply) {
                var orderNo = hospitalId + '-' + moment().format('YYYYMMDD') + '-2-' + reply;
                Promise.map(chargeItems, function (item, index) {
                    return dictionaryDAO.findChargeItemById(+item.chargeItemId).then(function (items) {
                        item = _.assign(item, {
                            name: items[0].name,
                            code: items[0].code,
                            price: items[0].price,
                            receivable: +items[0].price * +item.quantity * (item.discount ? +req.body.discountRate : 1.0),
                            totalPrice: +items[0].price * +item.quantity,
                            createDate: new Date(),
                            registrationId: registrationId,
                            unit: items[0].unit,
                            hospitalId: hospitalId,
                            orderNo: orderNo
                        });
                        return medicalDAO.insertPrescription(item);
                    });
                }).then(function (result) {
                    return orderDAO.insert({
                        orderNo: orderNo,
                        registrationId: registrationId,
                        hospitalId: hospitalId,
                        amount: _.sum(chargeItems, function (item) {
                            return items[0].price * +item.quantity;
                        }),
                        paidAmount: 0.00,
                        paymentAmount: _.sum(chargeItems, function (item) {
                            return +items[0].price * +item.quantity * (item.discount ? +req.body.discountRate : 1.0)
                        }),
                        status: 0,
                        referenceId: result.insertId,
                        createDate: new Date(),
                        type: 1
                    });
                }).then(function (result) {
                    res.send({ret: 0, data: '保存成功'});
                });
            }
        );
        return next();
    },
    getMedicalHistories: function (req, res, next) {
        var rid = req.params.id;
        medicalDAO.findMedicalHistoryBy(rid).then(function (result) {
            res.send({ret: 0, data: result[0]});
        });
        return next();
    },
    getRecipes: function (req, res, next) {
        var rid = req.params.id;
        medicalDAO.findRecipesBy(rid).then(function (result) {
            var data = _.groupBy(result, 'orderNo');
            var result = [];
            for (var p in data) {
                result.push({orerNo: p, drugs: data[p]});
            }
            res.send({ret: 0, data: result});
        });
        return next();
    },
    getPrescriptions: function (req, res, next) {
        var rid = req.params.id;
        medicalDAO.findPrescriptionsBy(rid).then(function (result) {
            var data = _.groupBy(result, 'orderNo');
            var result = [];
            for (var p in data) {
                result.push({orerNo: p, item: data[p]});
            }
            res.send({ret: 0, data: result});
        });
        return next();
    },
    getOrdersBy: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        orderDAO.findOrdersByType(req.params.id, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (orders) {
            if (!orders.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: 0, count: 0}});
            orders.pageIndex = pageSize;
            res.send({ret: 0, data: orders});
        });
    },

    getOrdersByAndStatus: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        orderDAO.findOrdersByTypeAndStatus(req.params.id, req.params.status, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (orders) {
            if (!orders.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: 0, count: 0}});
            orders.pageIndex = pageSize;
            res.send({ret: 0, data: orders});
        });
    },
    getOrdersByStatus: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        orderDAO.findOrdersByStatus(req.user.hospitalId, req.params.status, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (orders) {
            if (!orders.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: 0, count: 0}});
            orders.pageIndex = pageSize;
            res.send({ret: 0, data: orders});
        });
        return next();
    },
    getRecipesByOrderNo: function (req, res, next) {
        medicalDAO.findRecipesByOrderNo(req.params.id).then(function (result) {
            res.send({ret: 0, data: result});
        });
        return next();
    },
    changeOrderStatus: function (req, res, next) {
        var orderNo = req.params.id;
        var status = req.params.status;
        var order = {orderNo: orderNo, status: status};
        if (status == 3) {
            order.drugSender = req.user.id;
            order.drugSenderName = req.user.name;
            order.sendDrugDate = new Date();
        }
        orderDAO.update(order).then(function (result) {
            res.send({ret: 0, message: '更新订单状态成功'});
        });
        return next();
    },
    getDrugUsageRecords: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        orderDAO.findDrugUsageRecords(req.user.hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (records) {
            if (!records.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: 0, count: 0}});
            records.pageIndex = pageIndex;
            res.send({ret: 0, data: records});
        });
        return next();
    }
}
