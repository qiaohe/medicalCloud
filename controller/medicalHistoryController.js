"use strict";
var config = require('../config');
var redis = require('../common/redisClient');
var i18n = require('../i18n/localeMessage');
var registrationDAO = require('../dao/registrationDAO');
var medicalDAO = require('../dao/medicalDAO');
var dictionaryDAO = require('../dao/dictionaryDAO');
var Promise = require("bluebird");
var _ = require('lodash');
var moment = require('moment');
module.exports = {
    saveMedicalHistory: function (req, res, next) {
        var medicalHistory = req.body;
        medicalHistory.createDate = new Date();
        medicalHistory.hospitalId = req.user.hospitalId;
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
        redis.incrAsync('h:' + hospitalId + ':' + moment().format('YYYYMMDD') + ':1:incr').then(function (reply) {
                var orderNo = hospitalId + '-' + moment().format('YYYYMMDD') + '-1-' + reply;
                Promise.map(drugItems, function (item, index) {
                    return dictionaryDAO.findDrugById(+item.drugId).then(function (drugs) {
                        item = _.assign(item, {
                            name: drugs[0].name,
                            specification: drugs[0].specification,
                            price: drugs[0].sellPrice,
                            totalPrice: +drugs[0].sellPrice * +item.quantity,
                            createDate: new Date(),
                            registrationId: registrationId,
                            unit: drugs[0].unit,
                            hospitalId: hospitalId,
                            orderNo: orderNo
                        });
                        return medicalDAO.insertRecipe(item);
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
                    res.send({ret: 0, data: '保存成功'});
                });
            }
        );
        return next();
    }
}
