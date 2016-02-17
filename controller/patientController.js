"use strict";
var config = require('../config');
var i18n = require('../i18n/localeMessage');
var patientDAO = require('../dao/patientDAO');
var redis = require('../common/redisClient');
var businessPeopleDAO = require('../dao/businessPeopleDAO');
var _ = require('lodash');
var md5 = require('md5');
var moment = require('moment');
function getConditions(req) {
    var conditions = [];
    if (req.query.memberType) conditions.push('p.memberType=' + req.query.memberType);
    if (req.query.source) conditions.push('p.source=' + req.query.source);
    if (req.query.groupId) conditions.push('p.groupId=' + req.query.groupId);
    if (req.query.consumptionLevel) conditions.push('p.consumptionLevel=' + req.query.consumptionLevel);
    if (req.query.recommender) conditions.push('p.recommender=' + req.query.recommender);
    if (req.query.name) conditions.push('pb.name like \'%' + req.query.name + '%\'');
    if (req.query.mobile) conditions.push('pb.mobile like \'%' + req.query.mobile + '%\'');
    return conditions;
}
module.exports = {
    getGroupCompanies: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var conditions = [];
        if (req.query.name) conditions.push('gc.name like \'%' + req.query.name + '%\'');
        if (req.query.contactMobile) conditions.push('gc.contactMobile like \'%' + req.query.contactMobile + '%\'');
        patientDAO.findGroupCompanies(hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }, conditions).then(function (companies) {
            if (!companies.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: 0, count: 0}});
            companies.rows.forEach(function (company) {
                company.source = config.sourceType[company.source];
                company.cashbackType = config.cashbackType[company.cashbackType];
            });
            companies.pageIndex = pageIndex;
            return res.send({ret: 0, data: companies});
        });
        return next();
    },
    getGroupCompany: function (req, res, next) {
        var groupId = req.params.id;
        patientDAO.findGroupCompanyById(groupId).then(function (companies) {
            if (!companies.length) res.send({ret: 0, data: []});
            var company = companies[0];
            company.sourceName = config.sourceType[company.source];
            company.cashbackTypeName = config.cashbackType[company.cashbackType];
            res.send({ret: 0, data: company});
        });
        return next();
    },

    insertGroupCompany: function (req, res, next) {
        var groupCompany = req.body;
        groupCompany.hospitalId = req.user.hospitalId;
        patientDAO.insertGroupCompany(groupCompany).then(function (result) {
            groupCompany.id = result.insertId;
            res.send({ret: 0, data: groupCompany});
        });
        return next();
    },
    updateGroupCompany: function (req, res, next) {
        var groupCompany = req.body;
        groupCompany.hospitalId = req.user.hospitalId;
        groupCompany = _.omit(groupCompany, ['recommenderName', 'sourceName', 'cashbackTypeName']);
        patientDAO.updateGroupCompany(groupCompany).then(function (result) {
            res.send({ret: 0, message: i18n.get('groupCompany.update.success')});
        });
        return next();
    },
    deleteGroupCompany: function (req, res, next) {
        var id = req.params.id;
        patientDAO.deleteGroupCompany(id).then(function (result) {
            res.send({ret: 0, message: i18n.get('groupCompany.delete.success')});
        });
        return next();
    },
    getPatients: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        patientDAO.findPatients(hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }, getConditions(req)).then(function (patients) {
            if (!patients.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: 0, count: 0}});
            patients.rows.forEach(function (p) {
                p.memberType = config.memberType[p.memberType];
                p.source = config.sourceType[p.source];
                p.gender = config.gender[p.gender];
                p.consumptionLevel = config.consumptionLevel[p.consumptionLevel];
            });
            patients.pageIndex = pageIndex;
            res.send({ret: 0, data: patients});
        });
        return next();
    },
    addPatient: function (req, res, next) {
        var uid = req.user.id;
        var patient = req.body;
        patient.hospitalId = req.user.hospitalId;
        businessPeopleDAO.findPatientBasicInfoBy(patient.mobile).then(function (basicInfos) {
            return basicInfos.length ? basicInfos[0].id : businessPeopleDAO.insertPatientBasicInfo({
                name: patient.name,
                mobile: patient.mobile,
                createDate: new Date(),
                birthday: patient.birthday,
                password: md5('password'),
                creator: req.user.id,
                gender: patient.gender,
                idCard: patient.idCard,
                headPic: patient.headPic,
                address: patient.address,
                status: 0
            }).then(function (result) {
                return result.insertId;
            });
        }).then(function (result) {
            patient.patientBasicInfoId = result;
            return businessPeopleDAO.findPatientByBasicInfoId(result).then(function (patients) {
                if (patients.length) return patients[0].id;
                return redis.incrAsync('member.no.incr').then(function (memberNo) {
                    return businessPeopleDAO.insertPatient({
                        patientBasicInfoId: patient.patientBasicInfoId,
                        hospitalId: req.user.hospitalId,
                        memberType: patient.memberType,
                        memberCardNo: req.user.hospitalId + '-1-' + _.padLeft(memberNo, 7, '0'),
                        createDate: new Date(),
                        groupId: patient.groupId,
                        groupName: patient.groupName,
                        recommender: patient.recommender,
                        consumptionLevel: patient.consumptionLevel,
                        cashbackType: patient.cashbackType,
                        maxDiscountRate: patient.maxDiscountRate,
                        source: patient.source,
                        balance: 0.00,
                        comment: patient.comment
                    }).then(function (result) {
                        patient.id = result.insertId;
                        res.send({ret: 0, data: patient});
                    });
                });
            });
        });
        return next();
    },

    editPatient: function (req, res, next) {
        var patient = req.body;
        businessPeopleDAO.findPatientBasicInfoBy(patient.mobile).then(function (basicInfos) {
            var basicInfoId = basicInfos[0].id;
            return businessPeopleDAO.updatePatientBasicInfo({
                id: basicInfoId,
                name: patient.name,
                mobile: patient.mobile,
                birthday: patient.birthday,
                gender: patient.gender,
                idCard: patient.idCard,
                headPic: patient.headPic,
                address: patient.address
            });
        }).then(function () {
            return patientDAO.updatePatient({
                id: patient.id,
                memberType: patient.memberType,
                groupId: patient.groupId,
                recommender: patient.recommenderId,
                consumptionLevel: patient.consumptionLevel,
                cashbackType: patient.cashbackType,
                maxDiscountRate: patient.maxDiscountRate,
                source: patient.source,
                comment: patient.comment
            })
        }).then(function () {
            res.send({ret: 0, message: i18n.get('patient.update.success')});
        })
    },
    addPrePaidHistory: function (req, res, next) {
        var prePaid = req.body;
        prePaid.createDate = new Date();
        prePaid.creator = req.user.id;
        prePaid.hospitalId = req.user.hospitalId;
        patientDAO.insertPrePaidHistory(prePaid).then(function (result) {
            prePaid.id = result.insertId;
            return patientDAO.updatePatientBalance(prePaid.patientId, prePaid.amount);
        }).then(function (result) {
            return patientDAO.findByPatientId(prePaid.patientId).then(function (patients) {
                return patientDAO.insertTransactionFlow({
                    amount: prePaid.amount,
                    createDate: new Date(),
                    hospitalId: prePaid.hospitalId,
                    patientId: prePaid.patientId,
                    patientBasicInfoId: patients[0].patientBasicInfoId,
                    paymentType: prePaid.paymentType,
                    type: 1,
                    invoice: prePaid.invoice,
                    comment: prePaid.comment,
                    transactionNo: moment().format('YYYYMMDDhhmmss') + '-' + prePaid.hospitalId + '-' + prePaid.patientId
                })
            })
        }).then(function (result) {
            res.send({ret: 0, data: i18n.get('prePaid.add.success')});
        });
        return next();
    },
    getPatient: function (req, res, next) {
        var patientId = req.params.patientId;
        var data = {};
        patientDAO.findByPatientBasicInfo(+patientId, +req.user.hospitalId).then(function (patients) {
            data.basicInfo = (patients.length ? patients[0] : {});
            if (data.basicInfo) {
                data.basicInfo.cashbackTypeName = data.basicInfo.cashbackType && config.cashbackType[data.basicInfo.cashbackType];
                data.basicInfo.genderName = config.gender[data.basicInfo.gender];
                data.basicInfo.memberTypeName = config.memberType[data.basicInfo.memberType];
                data.basicInfo.sourceName = config.sourceType[data.basicInfo.source];
                data.basicInfo.consumptionLevelName = config.consumptionLevel[data.basicInfo.consumptionLevel];
            }
            return patientDAO.findTransactionFlows(+patientId, +req.user.hospitalId);
        }).then(function (flows) {
            data.transactionFlows = flows;
            data.transactionFlows && data.transactionFlows.forEach(function (flow) {
                flow.paymentType = config.paymentType[flow.paymentType];
                flow.type = config.transactionType[flow.type];
            });
            return patientDAO.findRegistrations(+patientId, +req.user.hospitalId);
        }).then(function (registrations) {
            data.outPatients = registrations;
            registrations && registrations.forEach(function (registration) {
                registration.registrationType = config.registrationType[registration.registrationType];
                registration.status = registration.status == null ? null : config.registrationStatus[registration.status];
            });
            res.send({ret: 0, data: data});
        });
        return next();
    },
    getPatientBy: function (req, res, next) {
        var patientId = req.params.id;
        patientDAO.findPatientBasicInfoById(+patientId).then(function (patients) {
            if (!patients.length) res.send({ret: 0, data: {}});
            res.send({ret: 0, data: patients[0]});
        });
        return next();
    }
}