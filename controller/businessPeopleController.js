"use strict";
var config = require('../config');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var redis = require('../common/redisClient');
var _ = require('lodash');
var i18n = require('../i18n/localeMessage');
var businessPeopleDAO = require('../dao/businessPeopleDAO');
var hospitalDAO = require('../dao/hospitalDAO');
var md5 = require('md5');
function getConditions(req) {
    var conditions = [];
    if (req.query.groupId) conditions.push('ic.groupId=' + req.query.groupId);
    if (req.query.name) conditions.push('ic.name like \'%' + req.query.name + '%\'');
    if (req.query.mobile) conditions.push('ic.mobile like \'%' + req.query.mobile + '%\'');
    return conditions;
}
module.exports = {
    getPerformanceByMonth: function (req, res, next) {
        var yearMonth = req.params.yearMonth;
        businessPeopleDAO.findPerformanceByMonth(req.user.id, yearMonth).then(function (performances) {
            if (!performances.length) return res.send({ret: 0, data: []});
            res.send({ret: 0, data: performances[0]});
        });
        return next();
    },
    getPerformanceByYear: function (req, res, next) {
        var year = req.params.year;
        businessPeopleDAO.findPerformanceByYear(req.user.id, year).then(function (performances) {
            if (!performances.length) return res.send({ret: 0, data: []});
            performances[0].completePercentage = (performances[0].actualCount / performances[0].plannedCount).toFixed(2);
            res.send({ret: 0, data: performances[0]});
        });
        return next();
    },
    getContacts: function (req, res, next) {
        var uid = req.user.id;
        businessPeopleDAO.findContactsBy(uid, {from: req.query.from, size: req.query.size}).then(function (contacts) {
            if (!contacts.length) return res.send({ret: 0, data: []});
            contacts.forEach(function (contact) {
                contact.source = config.sourceType[contact.source];
            });
            res.send({ret: 0, data: contacts});
        });
        return next();
    },
    getContactsByBusinessPeopleId: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        businessPeopleDAO.findContactsByPagable(req.params.id, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }, getConditions(req)).then(function (contacts) {
            if (!contacts.rows.length) return res.send({ret: 0, data: {rows: [], pageIndex: 0, count: 0}});
            contacts.rows.forEach(function (contact) {
                contact.source = config.sourceType[contact.source];
            });
            contacts.pageIndex = pageIndex;
            res.send({ret: 0, data: contacts});
        });
        return next();
    },

    transferContact: function (req, res, next) {
        var transfer = req.body;
        businessPeopleDAO.transferContact(transfer.toBusinessPeopleId, transfer.contacts.join(',')).then(function (rsult) {
            transfer.createDate = new Date();
            transfer.creator = req.user.id;
            transfer.hospitalId = req.user.hospitalId;
            delete transfer.contacts;
            return businessPeopleDAO.addTransferHistory(transfer);
        }).then(function (result) {
            res.send({ret: 0, message: '转移成功'});
        });
        return next();
    },
    addContact: function (req, res, next) {
        var contact = req.body;
        contact.businessPeopleId = req.user.id;
        var invitationCode = _.random(1000, 9999);
        var inviteResult;
        businessPeopleDAO.findPatientBasicInfoBy(contact.mobile).then(function (patientBasicInfos) {
            inviteResult = patientBasicInfos.length ? '已注册' : '未注册';
            if (!patientBasicInfos.length) return businessPeopleDAO.findContactBusinessPeopleIdAndMobile(req.user.id, contact.mobile);
            return businessPeopleDAO.findPatientBy(req.user.hospitalId, patientBasicInfos[0].id).then(function (patients) {
                if (patients.length) {
                    res.send({ret: 1, message: '该联系人已经被绑定。'});
                    Promise.rejected();
                } else {
                    return businessPeopleDAO.findContactBusinessPeopleIdAndMobile(req.user.id, contact.mobile);
                }
            })
        }).then(function (contacts) {
            if (contacts.length) {
                contact = contacts[0];
                return businessPeopleDAO.updateContact(contact.id);
            }
            return businessPeopleDAO.insertContact(_.assign(contact, {
                createDate: new Date(),
                inviteTimes: 1,
                inviteResult: inviteResult
            }))
        }).then(function (result) {
            if (result.insertId)
                contact.id = result.insertId;
            return businessPeopleDAO.insertInvitation({
                createDate: new Date(),
                contactId: contact.id,
                businessPeopleId: req.user.id,
                status: 0,
                invitationCode: invitationCode
            })
        }).then(function (result) {
            var smsConfig = config.sms;
            var option = _.assign(smsConfig.option, {
                mobile: contact.mobile,
                content: config.sms.template.replace(':code', invitationCode)
            });
            request.postAsync({url: smsConfig.providerUrl, form: option});
            res.send({ret: 0, message: i18n.get('contacts.add.success')});
        });
        return next();
    },
    preRegistrationForContact: function (req, res, next) {
        var registration = req.body;
        businessPeopleDAO.findShiftPlanByDoctorAndShiftPeriod(registration.doctorId, registration.registerDate,
            registration.shiftPeriod).then(function (plans) {
                if (!plans.length || (plans[0].plannedQuantity <= +plans[0].actualQuantity)) {
                    return res.send({ret: 1, message: i18n.get('doctor.shift.plan.invalid')});
                } else {
                    businessPeopleDAO.findContactById(req.body.contactId).then(function (contacts) {
                        delete registration.contactId;
                        var contact = contacts[0];
                        registration = _.assign(registration, {
                            patientName: contact.name, patientMobile: contact.mobile,
                            gender: contact.gender,
                            createDate: new Date()
                        });
                        return hospitalDAO.findDoctorById(registration.doctorId);
                    }).then(function (doctors) {
                        var doctor = doctors[0];
                        registration = _.assign(registration, {
                            departmentId: doctor.departmentId,
                            departmentName: doctor.departmentName,
                            hospitalId: doctor.hospitalId,
                            hospitalName: doctor.hospitalName,
                            registrationFee: doctor.registrationFee,
                            doctorName: doctor.name,
                            doctorJobTitle: doctor.jobTitle,
                            doctorJobTitleId: doctor.jobTitleId,
                            doctorHeadPic: doctor.headPic,
                            paymentType: 1,
                            status: 0,
                            registrationType: 7,
                            memberType: 1,
                            businessPeopleId: req.user.id,
                            creator: req.user.id
                        });
                        return businessPeopleDAO.findPatientBasicInfoBy(registration.patientMobile);
                    }).then(function (patientBasicInfoList) {
                        if (patientBasicInfoList.length) {
                            registration.patientBasicInfoId = patientBasicInfoList[0].id;
                            return redis.incrAsync('doctor:' + registration.doctorId + ':d:' + registration.registerDate + ':period:' + registration.shiftPeriod + ':incr').then(function (seq) {
                                return redis.getAsync('h:' + req.user.hospitalId + ':p:' + registration.shiftPeriod).then(function (sp) {
                                    registration.sequence = sp + seq;
                                    registration.outPatientType = 0;
                                    registration.outpatientStatus = 5;
                                    return businessPeopleDAO.findPatientByBasicInfoId(registration.patientBasicInfoId);
                                });
                            });
                        }
                        businessPeopleDAO.insertPatientBasicInfo({
                            name: registration.patientName, mobile: registration.patientMobile,
                            createDate: new Date(), password: md5('password'), creator: req.user.id
                        }).then(function (result) {
                            registration.patientBasicInfoId = result.insertId;
                            return redis.incrAsync('doctor:' + registration.doctorId + ':d:' + registration.registerDate + ':period:' + registration.shiftPeriod + ':incr').then(function (seq) {
                                return redis.getAsync('h:' + req.user.hospitalId + ':p:' + registration.shiftPeriod).then(function (sp) {
                                    registration.sequence = sp + seq;
                                    registration.outPatientType = 0;
                                    registration.outpatientStatus = 5;
                                    return businessPeopleDAO.findPatientByBasicInfoId(registration.patientBasicInfoId);
                                });
                            });
                        });
                    }).then(function (result) {
                        if (!result.length) {
                            return redis.incrAsync('member.no.incr').then(function (memberNo) {
                                return businessPeopleDAO.insertPatient({
                                    patientBasicInfoId: registration.patientBasicInfoId,
                                    hospitalId: req.user.hospitalId,
                                    memberType: 1,
                                    balance: 0.00,
                                    memberCardNo: registration.hospitalId + '-1-' + _.padLeft(memberNo, 7, '0'),
                                    createDate: new Date()
                                }).then(function (patient) {
                                    registration.patientId = patient.insertId;
                                });
                            });
                        } else {
                            registration.patientId = result[0].id;
                        }
                        return businessPeopleDAO.insertRegistration(registration);
                    }).then(function () {
                        return businessPeopleDAO.updateShiftPlan(registration.doctorId, registration.registerDate, registration.shiftPeriod);
                    }).then(function () {
                        return businessPeopleDAO.findShiftPeriodById(req.user.hospitalId, registration.shiftPeriod);
                    }).then(function (result) {
                        return res.send({
                            ret: 0,
                            data: {
                                id: registration.id,
                                registerDate: registration.registerDate,
                                hospitalName: registration.hospitalName,
                                departmentName: registration.departmentName,
                                doctorName: registration.doctorName, jobTtile: registration.doctorJobTtile,
                                shiftPeriod: result[0].name
                            }
                        });
                    });
                }
            });
        return next();
    },
    getPreRegistrationForContact: function (req, res, next) {
        var uid = req.user.id;
        var mobile = req.query.mobile;
        businessPeopleDAO.findRegistrationByUid(uid, mobile, {
            from: +req.query.from,
            size: +req.query.size
        }).then(function (registrations) {
            registrations && registrations.forEach(function (registration) {
                registration.status = registration.status == null ? null : config.registrationStatus[registration.status];
            });
            res.send({ret: 0, data: registrations});
        });
        return next();
    }
}