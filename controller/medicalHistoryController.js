"use strict";
var config = require('../config');
var redis = require('../common/redisClient');
var i18n = require('../i18n/localeMessage');
var registrationDAO = require('../dao/registrationDAO');
var medicalDAO = require('../dao/medicalDAO');
var dictionaryDAO = require('../dao/dictionaryDAO');
var deviceDAO = require('../dao/deviceDAO');
var orderDAO = require('../dao/orderDAO');
var Promise = require("bluebird");
var _ = require('lodash');
var moment = require('moment');
var util = require('util');
var queue = require('../common/queue');
var pusher = require('../domain/NotificationPusher');
module.exports = {
    saveMedicalHistory: function (req, res, next) {
        var medicalHistory = req.body;
        medicalHistory.createDate = new Date();
        medicalHistory.hospitalId = req.user.hospitalId;
        delete medicalHistory.name;
        delete medicalHistory.type;
        delete medicalHistory.diseaseId;
        var r = {};
        if (!req.body.templateId) delete req.body.templateId;
        if (medicalHistory.id) {
            delete req.body.createDate;
            medicalDAO.updateMedicalHistory(req.body).then(function (result) {
                res.send({ret: 0, data: req.body})
            }).catch(function (err) {
                res.send({ret: 1, message: err.message});
            });
        } else {
            registrationDAO.findRegistrationsById(medicalHistory.registrationId).then(function (registrations) {
                r = registrations[0];
                medicalHistory = _.assign(medicalHistory, {
                    doctorId: r.doctorId,
                    doctorName: r.doctorName,
                    departmentId: r.departmentId,
                    departmentName: r.departmentName,
                    patientName: medicalHistory.patientName ? medicalHistory.patientName : r.patientName,
                    patientMobile: r.patientMobile,
                    patientId: r.patientId,
                    gender: medicalHistory.gender ? medicalHistory.gender : r.gender,
                    patientBasicInfoId: r.patientBasicInfoId
                });
                return medicalDAO.insertMedicalHistory(medicalHistory);
            }).then(function (result) {
                medicalHistory.id = result.insertId;
                deviceDAO.findTokenByUid(medicalHistory.patientBasicInfoId).then(function (tokens) {
                    if (tokens.length && tokens[0]) {
                        var notificationBody = util.format(config.medicalHistoryTemplate, medicalHistory.patientName + (medicalHistory.gender == 0 ? '先生' : '女士'),
                            r.hospitalName + medicalHistory.departmentName + medicalHistory.doctorName);
                        pusher.push({
                            body: notificationBody,
                            uid: medicalHistory.patientBasicInfoId,
                            patientName: medicalHistory.patientName,
                            patientMobile: medicalHistory.patientMobile,
                            title: '病历提醒',
                            hospitalId: r.hospitalId,
                            type: 2,
                            audience: {registration_id: [tokens[0].token]}
                        }, function (err, result) {
                            if (err) throw err;
                        });
                    }
                });
                return res.send({ret: 0, data: medicalHistory});
            }).catch(function (err) {
                res.send({ret: 1, message: err.message});
            });
        }
        return next();
    },

    saveRecipe: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var registrationId = req.body.registrationId;
        var drugItems = req.body.drugs;
        var items = [];
        var orderNo = {};
        redis.incrAsync('h:' + hospitalId + ':' + moment().format('YYYYMMDD') + ':1:incr').then(function (reply) {
            orderNo = _.padLeft(hospitalId, 4, '0') + moment().format('YYYYMMDD') + '1' + _.padLeft(reply, 3, '0');
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
                        orderNo: orderNo,
                        type: drugs[0].type,
                        dosageForm: drugs[0].dosageForm,
                        factor: drugs[0].factor
                    });
                    items.push(item);
                    return medicalDAO.insertRecipe(item);
                });
            }).then(function (result) {
                var job = queue.create('orderPayDelayedQueue', {
                    title: '订单延迟支付',
                    orderNo: orderNo
                }).delay(config.app.orderDelayMinutes * 60 * 1000).save(function (err) {
                    if (!err) console.log(job.id);
                });

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
                    //paymentType: 1,
                    createDate: new Date(),
                    type: 1
                });
            }).then(function (result) {
                return registrationDAO.findRegistrationsById(registrationId);
            }).then(function (registrations) {
                var registration = registrations[0];
                //deviceDAO.findTokenByUid(registration.patientBasicInfoId).then(function (tokens) {
                //    if (tokens.length && tokens[0]) {
                //        var notificationBody = util.format(config.recipeOrderTemplate, registration.patientName + (registration.gender == 0 ? '先生' : '女士'),
                //            registration.hospitalName, orderNo);
                //        pusher.push({
                //            body: notificationBody,
                //            uid: registration.patientBasicInfoId,
                //            patientName: registration.patientName,
                //            patientMobile: registration.patientMobile,
                //            title: '药费订单',
                //            hospitalId: req.user.hospitalId,
                //            type: 2,
                //            audience: {registration_id: [tokens[0].token]}
                //        }, function (err, result) {
                //            if (err) throw err;
                //        });
                //    }
                //})
            }).then(function (result) {
                res.send({ret: 0, data: '保存成功'});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    savePrescription: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var registrationId = req.body.registrationId;
        var chargeItems = req.body.chargeItems;
        var newItems = [];
        var orderNo = {};
        redis.incrAsync('h:' + hospitalId + ':' + moment().format('YYYYMMDD') + ':2:incr').then(function (reply) {
            orderNo = _.padLeft(hospitalId, 4, '0') + moment().format('YYYYMMDD') + '2' + _.padLeft(reply, 3, '0');
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
                    newItems.push(item);
                    return medicalDAO.insertPrescription(item);
                });
            }).then(function (result) {
                var job = queue.create('orderPayDelayedQueue', {
                    title: '订单延迟支付',
                    orderNo: orderNo
                }).delay(config.app.orderDelayMinutes * 60 * 1000).save(function (err) {
                    if (!err) console.log(job.id);
                });
                var o = {
                    orderNo: orderNo,
                    registrationId: registrationId,
                    hospitalId: hospitalId,
                    amount: _.sum(newItems, 'totalPrice'),
                    paidAmount: 0.00,
                    paymentAmount: _.sum(newItems, 'receivable'),
                    status: 0,
                    //paymentType: 1,
                    createDate: new Date(),
                    type: 2
                };
                return orderDAO.insert(o);
            }).then(function (result) {
                return registrationDAO.findRegistrationsById(registrationId);
            }).then(function (registrations) {
                var registration = registrations[0];
                //deviceDAO.findTokenByUid(registration.patientBasicInfoId).then(function (tokens) {
                //    if (tokens.length && tokens[0]) {
                //        var notificationBody = util.format(config.prescriptionOrderTemplate,
                //            registration.patientName + (registration.gender == 0 ? '先生' : '女士'),
                //            registration.hospitalName, orderNo);
                //        pusher.push({
                //            body: notificationBody,
                //            uid: registration.patientBasicInfoId,
                //            patientName: registration.patientName,
                //            patientMobile: registration.patientMobile,
                //            title: '诊疗费订单',
                //            type: 2,
                //            hospitalId: req.user.hospitalId,
                //            audience: {registration_id: [tokens[0].token]}
                //        }, function (err, result) {
                //            if (err) throw err;
                //        });
                //    }
                //})
            }).then(function (result) {
                res.send({ret: 0, data: '保存成功'});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
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
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
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
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getOrdersBy: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var conditions = [];
        if (req.query.patientName) conditions.push('r.patientName like \'%' + req.query.patientName + '%\'');
        if (req.query.departmentId) conditions.push('r.departmentId=' + req.query.departmentId);
        if (req.query.doctorId) conditions.push('r.doctorId=' + req.query.doctorId);
        if (req.query.drugSender) conditions.push('m.drugSender=' + req.query.drugSender);
        if (req.query.orderNo) conditions.push('m.orderNo like \'%' + req.query.orderNo + '%\'');
        if (req.query.startDate) conditions.push('m.sendDrugDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('m.sendDrugDate<=\'' + req.query.endDate + ' 23:59:59\'');
        orderDAO.findOrdersByType(req.params.id, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (orders) {
            if (!orders.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: 0, count: 0}});
            orders.rows.forEach(function (order) {
                order.memberType = config.memberType[+order.memberType];
                order.paymentType = config.paymentType[+order.paymentType];
                order.status = config.orderStatus[+order.status];
                order.type = config.orderType[+order.type];
            });
            orders.pageIndex = pageIndex;
            res.send({ret: 0, data: orders});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
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
            orders.rows.forEach(function (order) {
                order.memberType = config.memberType[+order.memberType];
                order.paymentType = config.paymentType[+order.paymentType];
                order.status = config.orderStatus[+order.status];
                order.type = config.orderType[+order.type];
            });
            res.send({ret: 0, data: orders});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
    },
    getOrdersByStatus: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var conditions = [];
        if (req.query.patientName) conditions.push('r.patientName like \'%' + req.query.patientName + '%\'');
        if (req.query.memberType) conditions.push('r.memberType=' + req.query.memberType);
        if (req.query.paymentDate) conditions.push('m.paymentDate like \'%' + req.query.paymentDate + '%\'');
        if (req.query.patientMobile) conditions.push('r.patientMobile like \'%' + req.query.patientMobile + '%\'');
        if (req.query.orderNo) conditions.push('m.orderNo like \'%' + req.query.orderNo + '%\'');
        if (req.query.patientId) conditions.push('r.patientId=' + req.query.patientId);
        orderDAO.findOrdersByStatus(req.user.hospitalId, req.params.status, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (orders) {
            if (!orders.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: 0, count: 0}});
            orders.rows.forEach(function (order) {
                order.memberType = config.memberType[+order.memberType];
                order.paymentType = config.paymentType[+order.paymentType];
                order.status = config.orderStatus[+order.status];
                order.type = config.orderType[+order.type];
            });
            orders.pageIndex = pageIndex;
            res.send({ret: 0, data: orders});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getOrderByOrderNos: function (req, res, next) {
        var orderNoArray = [];
        if (_.isArray(req.query.orderNo)) {
            _.forEach(req.query.orderNo, function (item) {
                orderNoArray.push('\'' + item + '\'');
            });
        } else {
            orderNoArray.push('\'' + req.query.orderNo + '\'');
        }
        orderDAO.findByOrderNos(req.user.hospitalId, orderNoArray.join(',')).then(function (orders) {
            if (!orders.length) return res.send({ret: 0, data: []});
            Promise.map(orders, function (order) {
                if (order.type == 1) return medicalDAO.findRecipesBy(order.registrationId).then(function (items) {
                    order.items = items;
                    order.type = config.orderType[+order.type];
                });
                if (order.type == 2) return medicalDAO.findPrescriptionsBy(order.registrationId).then(function (items) {
                    order.items = items;
                    order.type = config.orderType[+order.type];
                });
                order.type = config.orderType[+order.type];
            }).then(function () {
                res.send({ret: 0, data: orders});
            })
        }).catch(function (err) {

            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    chargeOrders: function (req, res, next) {
        var orders = req.body.orders;
        Promise.map(orders, function (order) {
            var order = {
                orderNo: order,
                status: 1,
                chargedBy: req.user.id,
                chargedByName: req.user.name,
                chargeDate: new Date(),
                paymentDate: new Date(),
                paymentType: 5
            };
            return orderDAO.updateBy(order)
        }).then(function () {
            res.send({ret: 0, message: '收费成功'})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getRecipesByOrderNo: function (req, res, next) {
        medicalDAO.findRecipesByOrderNo(req.params.id).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    changeOrderStatus: function (req, res, next) {
        var orderNo = req.params.id;
        var status = req.params.status;
        var order = {orderNo: orderNo, status: status};
        if (status == 3) {
            medicalDAO.findRecipesByOrderNo(orderNo).then(function (recipes) {
                var expireDate = moment().format('YYYY-MM-DD');
                Promise.map(recipes, function (recipe) {
                    return medicalDAO.findDrugInventoryByDrugId(+recipe.drugId, expireDate, +recipe.quantity).then(function (drugInventories) {
                        if (drugInventories.length) {
                            var inventory = drugInventories[0];
                            inventory.restAmount = inventory.restAmount - recipe.quantity;
                            return dictionaryDAO.updateDrugInventory(inventory);
                        }
                    })
                }).then(function (result) {
                    order.drugSender = req.user.id;
                    order.drugSenderName = req.user.name;
                    order.sendDrugDate = new Date();
                    return orderDAO.update(order);
                });
            }).then(function () {
                orderDAO.findOrderByOrderNo(orderNo).then(function (orders) {
                    var o = order[0];
                    //deviceDAO.findTokenByUid(o.patientBasicInfoId).then(function (tokens) {
                    //    if (tokens.length && tokens[0]) {
                    //        var notificationBody = util.format(config.sendDrugTemplate, o.patientName + (o.gender == 0 ? '先生' : '女士'),
                    //            o.hospitalName + o.departmentName + o.doctorName, r.sequence);
                    //        pusher.push({
                    //            body: notificationBody,
                    //            uid: o.patientBasicInfoId,
                    //            patientName: o.patientName,
                    //            patientMobile: o.patientMobile,
                    //            title: '已领取药品通知',
                    //            hospitalId: o.hospitalId,
                    //            type: 1,
                    //            audience: {registration_id: [tokens[0].token]}
                    //        }, function (err, result) {
                    //            if (err) throw err;
                    //        });
                    //    }
                    //});
                });
                res.send({ret: 0, message: '更新订单状态成功'});
            }).catch(function (err) {
                res.send({ret: 1, message: err.message});
            });
        } else {
            orderDAO.update(order).then(function (result) {
                res.send({ret: 0, message: '更新订单状态成功'});
            }).catch(function (err) {
                res.send({ret: 1, message: err.message});
            });
        }
        return next();
    },
    getDrugUsageRecords: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var conditions = [];
        if (req.query.patientMobile) conditions.push('rg.patientMobile like \'%' + req.query.patientMobile + '%\'');
        if (req.query.patientName) conditions.push('rg.patientName like \'%' + req.query.patientName + '%\'');
        if (req.query.departmentId) conditions.push('rg.departmentId=' + req.query.departmentId);
        if (req.query.doctorId) conditions.push('rg.doctorId=' + req.query.doctorId);
        if (req.query.drugSender) conditions.push('m.drugSender=' + req.query.drugSender);
        if (req.query.orderNo) conditions.push('m.orderNo like \'%' + req.query.orderNo + '%\'');
        if (req.query.startDate) conditions.push('m.sendDrugDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('m.sendDrugDate<=\'' + req.query.endDate + ' 23:59:59\'');
        orderDAO.findDrugUsageRecords(req.user.hospitalId, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (records) {
            if (!records.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: 0, count: 0}});
            records.pageIndex = pageIndex;
            res.send({ret: 0, data: records});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getAccountingInfo: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var conditions = [];
        conditions.push('(m.status=1 or m.status=3)');
        //if (req.query.patientMobile) conditions.push('r.patientMobile like \'%' + req.query.patientMobile + '%\'');
        //if (req.query.patientName) conditions.push('r.patientName like \'%' + req.query.patientName + '%\'');
        if (req.query.departmentId) conditions.push('r.departmentId=' + req.query.departmentId);
        if (req.query.doctorId) conditions.push('r.doctorId=' + req.query.doctorId);
        if (req.query.memberType) conditions.push('r.memberType=' + req.query.memberType);
        //if (req.query.orderNo) conditions.push('m.orderNo like \'%' + req.query.orderNo + '%\'');
        if (req.query.startDate) conditions.push('m.paymentDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('m.paymentDate<=\'' + req.query.endDate + ' 23:59:59\'');
        orderDAO.findOrdersBy(hospitalId, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (orders) {
            orders.pageIndex = pageIndex;
            orders.fields = [];
            Promise.map(orders.rows, function (order) {
                if (order.type == 2) {
                    return orderDAO.findExtraFeeBy(order.orderNo).then(function (extras) {
                        order.extras = extras;
                        _.forEach(extras, function (item) {
                            orders.fields.push(item.fieldName);
                            //order[item.fieldName] = item.sum;
                        });
                    })
                }
            }).then(function () {
                orders.rows.length && orders.rows.forEach(function (order) {
                    order.memberType = config.memberType[+order.memberType];
                    order.paymentType = config.paymentType[+order.paymentType];
                    order.status = config.orderStatus[+order.status];
                    order.type = config.orderType[+order.type];
                });
                orders.pageIndex = pageIndex;
                res.send({ret: 0, data: orders});
            })
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }
}
