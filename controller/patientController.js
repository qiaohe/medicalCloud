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
    if (req.query.realName) conditions.push('pb.realName like \'%' + req.query.realName + '%\'');
    if (req.query.mobile) conditions.push('pb.mobile like \'%' + req.query.mobile + '%\'');
    if (req.query.medicalRecordNo) conditions.push('p.medicalRecordNo like \'%' + req.query.medicalRecordNo + '%\'');
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
            if (!companies.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: pageIndex, count: 0}});
            companies.rows.forEach(function (company) {
                company.source = config.sourceType[company.source];
                company.cashbackType = config.cashbackType[company.cashbackType];
            });
            companies.pageIndex = pageIndex;
            return res.send({ret: 0, data: companies});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
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
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    insertGroupCompany: function (req, res, next) {
        var groupCompany = req.body;
        groupCompany.hospitalId = req.user.hospitalId;
        patientDAO.insertGroupCompany(groupCompany).then(function (result) {
            groupCompany.id = result.insertId;
            res.send({ret: 0, data: groupCompany});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    updateGroupCompany: function (req, res, next) {
        var groupCompany = req.body;
        groupCompany.hospitalId = req.user.hospitalId;
        groupCompany = _.omit(groupCompany, ['recommenderName', 'sourceName', 'cashbackTypeName']);
        patientDAO.updateGroupCompany(groupCompany).then(function (result) {
            res.send({ret: 0, message: i18n.get('groupCompany.update.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    deleteGroupCompany: function (req, res, next) {
        var id = req.params.id;
        patientDAO.deleteGroupCompany(id).then(function (result) {
            res.send({ret: 0, message: i18n.get('groupCompany.delete.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
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
            if (!patients.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: pageIndex, count: 0}});
            patients.rows.forEach(function (p) {
                p.memberType = config.memberType[p.memberType];
                // p.source = config.sourceType[p.source];
                p.gender = config.gender[p.gender];
                p.consumptionLevel = config.consumptionLevel[p.consumptionLevel];
            });
            patients.pageIndex = pageIndex;
            res.send({ret: 0, data: patients});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    addPatient: function (req, res, next) {
        var uid = req.user.id;
        var patient = req.body;
        patient.hospitalId = req.user.hospitalId;
        businessPeopleDAO.findPatientBasicInfoBy(patient.mobile).then(function (basicInfos) {
            if (basicInfos.length) {
                patient.patientBasicInfoId = basicInfos[0].id;
                return businessPeopleDAO.updatePatientBasicInfo({
                    id: basicInfos[0].id,
                    name: patient.name ? patient.name : basicInfos[0].name,
                    realName: patient.realName ? patient.realName : basicInfos[0].realName,
                    mobile: patient.mobile,
                    gender: patient.gender,
                    age: patient.age ? patient.age : basicInfos[0].age,
                    idCard: patient.idCard ? patient.idCard : basicInfos[0].idCard,
                    headPic: patient.headPic ? patient.headPic : basicInfos[0].headPic,
                    address: patient.address ? patient.address : basicInfos[0].address
                })
            } else {
                return businessPeopleDAO.insertPatientBasicInfo({
                    name: patient.name,
                    realName: patient.realName,
                    mobile: patient.mobile,
                    createDate: new Date(),
                    //birthday: patient.birthday,
                    password: md5(patient.mobile.substring(patient.mobile.length - 6, patient.mobile.length)),
                    creator: req.user.id,
                    gender: patient.gender,
                    age: patient.age,
                    idCard: patient.idCard,
                    headPic: (patient.headPic ? patient.headPic : config.app.defaultHeadPic),
                    address: patient.address,
                    status: 0
                });
            }
        }).then(function (result) {
            if (result.insertId) {
                patient.patientBasicInfoId = result.insertId;
            }
            return businessPeopleDAO.findPatientByBasicInfoId(patient.patientBasicInfoId, req.user.hospitalId).then(function (patients) {
                if (patients.length) {
                    redis.incrAsync('d:' + moment().format('YYMMDD') + ':mh').then(function (medicalRecordNo) {
                        patientDAO.updatePatient({
                            id: patients[0].id,
                            memberType: patient.memberType ? patient.memberType : patients[0].memberType,
                            groupId: patient.groupId ? patient.groupId : patients[0].groupId,
                            recommender: patient.recommender ? patient.recommender : patients[0].recommender,
                            consumptionLevel: patient.consumptionLevel ? patient.consumptionLevel : patients[0].consumptionLevel,
                            cashbackType: patient.cashbackType ? patient.cashbackType : patients[0].cashbackType,
                            maxDiscountRate: patient.maxDiscountRate ? patient.maxDiscountRate : patients[0].maxDiscountRate,
                            source: patient.source ? patient.source : patients[0].source,
                            comment: patient.comment ? patient.comment : patients[0].comment,
                            medicalRecordNo: (patients[0].medicalRecordNo ? patients[0].medicalRecordNo : moment().format('YYMMDD') + _.padLeft(medicalRecordNo, 3, '0'))
                        }).then(function () {
                            businessPeopleDAO.findPatientByBasicInfoId(patient.patientBasicInfoId, req.user.hospitalId).then(function (ps) {
                                res.send({ret: 0, data: ps[0]});
                            })
                        })
                    })

                } else {
                    return redis.incrAsync('member.no.incr').then(function (memberNo) {
                        return redis.incrAsync('d:' + moment().format('YYMMDD') + ':mh').then(function (medicalRecordNo) {
                            return businessPeopleDAO.insertPatient({
                                patientBasicInfoId: patient.patientBasicInfoId,
                                hospitalId: req.user.hospitalId,
                                memberType: patient.memberType,
                                medicalRecordNo: moment().format('YYMMDD') + _.padLeft(medicalRecordNo, 3, '0'),
                                memberCardNo: req.user.hospitalId + '-1-' + _.padLeft(memberNo, 7, '0'),
                                createDate: new Date(),
                                groupId: patient.groupId ? patient.groupId : null,
                                groupName: patient.groupName ? patient.groupName : null,
                                recommender: patient.recommender ? patient.recommender : null,
                                consumptionLevel: patient.consumptionLevel ? patient.consumptionLevel : null,
                                cashbackType: patient.cashbackType ? patient.cashbackType : null,
                                maxDiscountRate: patient.maxDiscountRate ? patient.maxDiscountRate : null,
                                source: patient.source ? patient.source : null,
                                balance: 0.00,
                                comment: patient.comment ? patient.comment : null
                            });

                        }).then(function (result) {
                            patient.id = result.insertId;
                            res.send({ret: 0, data: patient});
                        });
                    });
                }
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    editPatient: function (req, res, next) {
        var patient = req.body;
        businessPeopleDAO.findPatientBasicInfoByPatientId(patient.id).then(function (basicInfos) {
            var basicInfoId = basicInfos[0].id;
            return businessPeopleDAO.updatePatientBasicInfo({
                id: basicInfoId,
                name: patient.realName,
                realName: patient.realName,
                mobile: patient.mobile,
                //birthday: patient.birthday,
                gender: patient.gender,
                age: patient.age,
                idCard: patient.idCard,
                headPic: patient.headPic,
                address: patient.address
            });
        }).then(function () {
            return patientDAO.findPatientByMemberCard(patient.memberCardNo ? patient.memberCardNo : '  ');
        }).then(function (patients) {
            if (patients.length && patients[0].id != patient.id) throw new Error('会员卡号已经存在，请重新输入。');
            return redis.incrAsync('d:' + moment().format('YYMMDD') + ':mh').then(function (medicalRecordNo) {
                return patientDAO.updatePatient({
                    id: patient.id,
                    memberType: patient.memberType,
                    groupId: patient.groupId,
                    recommender: patient.recommenderId,
                    consumptionLevel: patient.consumptionLevel,
                    cashbackType: patient.cashbackType,
                    maxDiscountRate: patient.maxDiscountRate,
                    source: patient.source,
                    memberCardNo: patient.memberCardNo,
                    medicalRecordNo: (patient.medicalRecordNo ? patient.medicalRecordNo : moment().format('YYMMDD') + _.padLeft(medicalRecordNo, 3, '0')),
                    comment: patient.comment
                });
            });
        }).then(function () {
            res.send({ret: 0, message: i18n.get('patient.update.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
    },
    addPrePaidHistory: function (req, res, next) {
        var patient = {};
        var prePaid = _.assign(req.body, {
            createDate: new Date(),
            creator: req.user.id,
            hospitalId: req.user.hospitalId
        });
        patientDAO.findByPatientId(prePaid.patientId).then(function (patients) {
            patient = patients[0];
            prePaid.currentBalance = patient.balance + prePaid.amount;
            return patientDAO.insertPrePaidHistory(prePaid);
        }).then(function (result) {
            prePaid.id = result.insertId;
            return patientDAO.updatePatientBalance(prePaid.patientId, prePaid.amount);
        }).then(function (result) {
            return patientDAO.findByPatientId(prePaid.patientId).then(function (patients) {
                return patientDAO.insertTransactionFlow({
                    amount: prePaid.amount,
                    createDate: new Date(),
                    hospitalId: prePaid.hospitalId,
                    patientId: prePaid.patientId,
                    patientBasicInfoId: patient.patientBasicInfoId,
                    paymentType: prePaid.paymentType,
                    type: +req.body.type,
                    invoice: prePaid.invoice,
                    comment: prePaid.comment,
                    name: '会员卡' + config.memberCardTransactionType[+req.body.type],
                    transactionNo: moment().format('YYYYMMDDhhmmss') + '-' + prePaid.hospitalId + '-' + prePaid.patientId
                })
            })
        }).then(function (result) {
            if (req.body.type == 2 || req.body.type == 3) {
                prePaid = _.assign(prePaid, {
                    patientId: prePaid.transferredPatientId,
                    transferredPatientId: patient.id,
                    transferredPatientName: patient.name,
                    type: prePaid.type == 3 ? 2 : 3,
                    amount: prePaid.amount * (-1)
                });
                patientDAO.findByPatientId(prePaid.patientId).then(function (patients) {
                    patient = patients[0];
                    prePaid.currentBalance = patient.balance + prePaid.amount;
                    delete prePaid.id;
                    return patientDAO.insertPrePaidHistory(prePaid);
                }).then(function (result) {
                    prePaid.id = result.insertId;
                    return patientDAO.updatePatientBalance(prePaid.patientId, prePaid.amount);
                }).then(function (result) {
                    return patientDAO.findByPatientId(prePaid.patientId).then(function (patients) {
                        return patientDAO.insertTransactionFlow({
                            amount: prePaid.amount,
                            createDate: new Date(),
                            hospitalId: prePaid.hospitalId,
                            patientId: prePaid.patientId,
                            patientBasicInfoId: patient.patientBasicInfoId,
                            paymentType: prePaid.paymentType,
                            type: +req.body.type,
                            invoice: prePaid.invoice,
                            comment: prePaid.comment,
                            name: '会员卡' + config.memberCardTransactionType[+req.body.type],
                            transactionNo: moment().format('YYYYMMDDhhmmss') + '-' + prePaid.hospitalId + '-' + prePaid.patientId
                        }).then(function (result) {
                            res.send({ret: 0, data: i18n.get('prePaid.add.success')});
                        })
                    })
                });
            } else {
                res.send({ret: 0, data: i18n.get('prePaid.add.success')});
            }
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getPatient: function (req, res, next) {
        var patientId = req.params.patientId;
        var data = {};
        patientDAO.findByPatientBasicInfo(+patientId, +req.user.hospitalId).then(function (patients) {
            data.basicInfo = (patients.length ? patients[0] : {});
            if (data.basicInfo) {
                data.basicInfo.cashbackTypeName = config.cashbackType[data.basicInfo.cashbackType];
                data.basicInfo.genderName = config.gender[data.basicInfo.gender];
                data.basicInfo.memberTypeName = config.memberType[data.basicInfo.memberType];
                data.basicInfo.sourceName = config.sourceType[data.basicInfo.source];
                data.basicInfo.consumptionLevelName = config.consumptionLevel[data.basicInfo.consumptionLevel];
            }
            res.send({ret: 0, data: data.basicInfo});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getTransactionFlowOfPatient: function (req, res, next) {
        var patientId = req.params.patientId;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        patientDAO.findTransactionFlows(+patientId, +req.user.hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (flows) {
            if (!flows.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: pageIndex, count: 0}});
            flows.rows && flows.rows.forEach(function (flow) {
                flow.paymentType = config.paymentType[flow.paymentType];
                flow.type = config.transactionType[flow.type];
            });
            flows.pageIndex = pageIndex;
            res.send({ret: 0, data: flows});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    
    getPrePaidHistories: function (req, res, next) {
        var patientId = req.params.patientId;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        patientDAO.findPrePaidHistories(+patientId, +req.user.hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (histories) {
            if (!histories.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: pageIndex, count: 0}});
            histories.rows && histories.rows.forEach(function (history) {
                // history.paymentType = config.paymentType[history.paymentType];
                history.type = config.memberCardTransactionType[history.type];
            });
            histories.pageIndex = pageIndex;
            res.send({ret: 0, data: histories});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getRegistrationsOfPatient: function (req, res, next) {
        var patientId = req.params.patientId;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        patientDAO.findRegistrations(+patientId, +req.user.hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (registrations) {
            if (!registrations.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: pageIndex, count: 0}});
            registrations.rows && registrations.rows.forEach(function (registration) {
                registration.registrationType = config.registrationType[registration.registrationType];
                registration.status = registration.status == null ? null : config.registrationStatus[registration.status];
            });
            registrations.pageIndex = pageIndex;
            res.send({ret: 0, data: registrations});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getPatientBy: function (req, res, next) {
        var patientId = req.params.id;
        patientDAO.findPatientBasicInfoById(+patientId).then(function (patients) {
            if (!patients.length) res.send({ret: 0, data: {}});
            res.send({ret: 0, data: patients[0]});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getPatientByMobile: function (req, res, next) {
        var mobile = req.params.mobile;
        patientDAO.findByPatientByMobile(req.user.hospitalId, mobile).then(function (patients) {
            res.send({ret: 0, data: patients[0]});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }
}