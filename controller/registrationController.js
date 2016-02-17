"use strict";
var config = require('../config');
var i18n = require('../i18n/localeMessage');
var registrationDAO = require('../dao/registrationDAO');
var businessPeopleDAO = require('../dao/businessPeopleDAO');
var hospitalDAO = require('../dao/hospitalDAO');
var deviceDAO = require('../dao/deviceDAO');
var pusher = require('../domain/NotificationPusher');
var Promise = require('bluebird');
var _ = require('lodash');
var util = require('util');
var moment = require('moment');
var redis = require('../common/redisClient');
var md5 = require('md5');
function getConditions(req) {
    var conditions = [];
    if (req.query.memberType) conditions.push('p.memberType=' + req.query.memberType);
    if (req.query.outPatientType) conditions.push('r.outPatientType=' + req.query.outPatientType);
    if (req.query.departmentId) conditions.push('r.departmentId=' + req.query.departmentId);
    if (req.query.employeeId) conditions.push('d.employeeId=' + req.query.employeeId);
    if (req.query.outpatientStatus) conditions.push('r.outpatientStatus=' + req.query.outpatientStatus);
    if (req.query.registrationType) conditions.push('r.registrationType=' + req.query.registrationType);
    if (req.query.patientName) conditions.push('r.patientName like \'%' + req.query.patientName + '%\'');
    if (req.query.patientMobile) conditions.push('r.patientMobile like \'%' + req.query.patientMobile + '%\'');
    if (req.query.status) conditions.push('r.status=' + req.query.status);
    if (req.query.recommender) conditions.push('r.businessPeopleId=' + req.query.recommender);
    return conditions;
}
module.exports = {
    getRegistrations: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var pageIndex = req.query.pageIndex;
        var pageSize = req.query.pageSize;
        registrationDAO.findRegistrations(hospitalId, getConditions(req), {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (registrations) {
            registrations.rows && registrations.rows.forEach(function (registration) {
                registration.registrationType = config.registrationType[registration.registrationType];
                registration.gender = config.gender[registration.gender];
                registration.memberType = config.memberType[registration.memberType];
                registration.outPatientType = config.outPatientType[registration.outPatientType];
                registration.status = config.registrationStatus[registration.status];
                registration.outpatientStatus = config.outpatientStatus[registration.outpatientStatus];
            });
            registrations.pageIndex = pageIndex;
            return res.send({ret: 0, data: registrations});
        });
        return next();
    },

    getTodayRegistrations: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var pageIndex = req.query.pageIndex;
        var pageSize = req.query.pageSize;
        registrationDAO.findRegistrationsBy(hospitalId, moment().format('YYYY-MM-DD'), getConditions(req), {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (registrations) {
            registrations.rows && registrations.rows.forEach(function (registration) {
                registration.registrationType = config.registrationType[registration.registrationType];
                registration.gender = config.gender[registration.gender];
                registration.memberType = config.memberType[registration.memberType];
                registration.outPatientType = config.outPatientType[registration.outPatientType];
                registration.status = config.registrationStatus[registration.status];
                registration.outpatientStatus = config.outpatientStatus[registration.outpatientStatus];
            });
            registrations.pageIndex = pageIndex;
            return res.send({ret: 0, data: registrations});
        });
        return next();
    },
    addRegistration: function (req, res, next) {
        var r = req.body;
        r.createDate = new Date();
        businessPeopleDAO.findShiftPlanByDoctorAndShiftPeriod(r.doctorId, r.registerDate, r.shiftPeriod).then(function (plans) {
            if (!plans.length || (plans[0].plannedQuantity <= +plans[0].actualQuantity)) {
                return res.send({ret: 1, message: i18n.get('doctor.shift.plan.invalid')});
            }
            return businessPeopleDAO.findPatientBasicInfoBy(r.patientMobile).then(function (basicInfos) {
                return basicInfos.length ? basicInfos[0].id : businessPeopleDAO.insertPatientBasicInfo({
                    name: r.patientName,
                    mobile: r.patientMobile,
                    createDate: new Date(),
                    password: md5('password'),
                    creator: req.user.id
                }).then(function (result) {
                    return result.insertId;
                });
            }).then(function (result) {
                r.patientBasicInfoId = result;
                return businessPeopleDAO.findPatientByBasicInfoId(result).then(function (patients) {
                    if (patients.length) return patients[0].id;
                    return redis.incrAsync('member.no.incr').then(function (memberNo) {
                        return businessPeopleDAO.insertPatient({
                            patientBasicInfoId: r.patientBasicInfoId,
                            hospitalId: req.user.hospitalId,
                            memberType: (r.memberType ? r.memberType : 0),
                            balance: 0.00,
                            memberCardNo: req.user.hospitalId + '-1-' + _.padLeft(memberNo, 7, '0'),
                            createDate: new Date()
                        }).then(function (patient) {
                            return patient.insertId;
                        });
                    });
                });
            }).then(function (result) {
                r.patientId = result;
                return hospitalDAO.findDoctorById(r.doctorId);
            }).then(function (doctors) {
                var doctor = doctors[0];
                r = _.assign(r, {
                    departmentId: doctor.departmentId,
                    departmentName: doctor.departmentName,
                    hospitalId: doctor.hospitalId,
                    hospitalName: doctor.hospitalName,
                    registrationFee: doctor.registrationFee,
                    doctorName: doctor.name,
                    doctorJobTitle: doctor.jobTitle,
                    doctorJobTitleId: doctor.jobTitleId,
                    doctorHeadPic: doctor.headPic,
                    status: 0, creator: req.user.id
                });
                return redis.incrAsync('doctor:' + r.doctorId + ':d:' + r.registerDate + ':period:' + r.shiftPeriod + ':incr').then(function (seq) {
                    return redis.getAsync('h:' + req.user.hospitalId + ':p:' + r.shiftPeriod).then(function (sp) {
                        r.sequence = sp + seq;
                        r.outPatientType = 0;
                        r.outpatientStatus = 5;
                        r.registrationType = (r.registrationType ? r.registrationType : 2);
                        if (!r.businessPeopleId) delete r.businessPeopleId;
                        delete r.reason;
                        return businessPeopleDAO.insertRegistration(r)
                    });
                });
            }).then(function (result) {
                r.id = result.insertId;
                return businessPeopleDAO.updateShiftPlan(r.doctorId, r.registerDate, r.shiftPeriod);
            }).then(function (result) {
                deviceDAO.findTokenByUid(r.patientBasicInfoId).then(function (tokens) {
                    if (r.registrationType == 3 && tokens.length && tokens[0]) {
                        businessPeopleDAO.findShiftPeriodById(r.hospitalId, r.shiftPeriod).then(function (result) {
                            var notificationBody = util.format(config.returnRegistrationTemplate, r.patientName + (r.gender == 0 ? '先生' : '女士'),
                                r.hospitalName + r.departmentName + r.doctorName, r.registerDate + ' ' + result[0].name);
                            pusher.push({
                                body: notificationBody,
                                title: '复诊预约提醒',
                                audience: {registration_id: [tokens[0].token]},
                                patientName: r.patientName,
                                patientMobile: r.patientMobile,
                                uid: r.patientBasicInfoId
                            }, function (err, result) {
                                if (err) throw err;
                            });
                        });
                    }
                });
                res.send({ret: 0, dta: r})
            });
        });
        return next();
    },

    changeRegistration: function (req, res, next) {
        req.body.id = +req.params.rid;
        req.body.status = 3;
        var oldRegistration = {};
        businessPeopleDAO.findRegistrationById(req.body.id).then(function (rs) {
            oldRegistration = rs[0];
            if (oldRegistration.doctorId != req.body.doctorId || oldRegistration.registerDate != req.body.registerDate || oldRegistration.shiftPeriod != req.body.shiftPeriod) {
                return businessPeopleDAO.updateShiftPlanDec(oldRegistration.doctorId, moment(oldRegistration.registerDate).format('YYYY-MM-DD'), oldRegistration.shiftPeriod).then(function () {
                    return businessPeopleDAO.updateShiftPlan(req.body.doctorId, moment(req.body.registerDate).format('YYYY-MM-DD'), req.body.shiftPeriod);
                })
            }
        }).then(function () {
            return redis.incrAsync('doctor:' + req.body.doctorId + ':d:' + req.body.registerDate + ':period:' + req.body.shiftPeriod + ':incr').then(function (seq) {
                return redis.getAsync('h:' + req.user.hospitalId + ':p:' + req.body.shiftPeriod).then(function (sp) {
                    req.body.sequence = sp + seq;
                });
            });
        }).then(function () {
            if (oldRegistration.doctorId != req.body.doctorId) {
                return hospitalDAO.findDoctorById(req.body.doctorId).then(function (docotors) {
                    var doctor = docotors[0];
                    req.body.doctorName = doctor.name;
                    req.body.departmentId = doctor.departmentId;
                    req.body.departmentName = doctor.departmentName;
                    req.body.registrationFee = doctor.registrationFee;
                    req.body.doctorJobTitle = doctor.jobTitle;
                    req.body.doctorJobTitleId = doctor.jobTitleId;
                    req.body.doctorHeadPic = doctor.headPic;
                    return registrationDAO.updateRegistration(req.body);
                })
            } else {
                return registrationDAO.updateRegistration(req.body);
            }
        }).then(function () {
            return res.send({ret: 0, message: i18n.get('registration.update.success')});
        });
        return next();
    },

    cancelRegistration: function (req, res, next) {
        var registration = {};
        var rid = req.params.rid;
        businessPeopleDAO.findRegistrationById(rid).then(function (rs) {
            registration = rs[0];
            return businessPeopleDAO.updateShiftPlanDec(registration.doctorId, moment(registration.registerDate).format('YYYY-MM-DD'), registration.shiftPeriod)
        }).then(function () {
            return registrationDAO.updateRegistration({
                id: req.params.rid,
                status: 4,
                updateDate: new Date(),
                outPatientStatus: 6
            })
        }).then(function () {
            res.send({ret: 0, message: i18n.get('preRegistration.cancel.success')});
        });
        return next();
    }

    ,

    cancelRegistrationByBackend: function (req, res, next) {
        var registration = {};
        var rid = req.params.rid;
        businessPeopleDAO.findRegistrationById(rid).then(function (rs) {
            registration = rs[0];
            return businessPeopleDAO.updateShiftPlanDec(registration.doctorId, moment(registration.registerDate).format('YYYY-MM-DD'), registration.shiftPeriod)
        }).then(function () {
            return registrationDAO.updateRegistration({
                id: req.params.rid,
                status: 4,
                updateDate: new Date(),
                outPatientStatus: 6
            })
        }).then(function () {
            return registrationDAO.insertCancelHistory({
                creator: req.user.id,
                createDate: new Date(),
                reason: req.body.reason,
                registrationId: rid
            })
        }).then(function () {
            res.send({ret: 0, message: i18n.get('preRegistration.cancel.success')});
        });
        return next();
    },
    getRegistration: function (req, res, next) {
        var rid = req.params.rid;
        registrationDAO.findRegistrationsByIdWithDetail(rid).then(function (result) {
            res.send({ret: 0, data: result[0]});
        });
        return next();
    },

    getRegistrationsOfDoctor: function (req, res, next) {
        var employeeId = req.user.id;
        req.query.employeeId = employeeId;
        var pageIndex = req.query.pageIndex;
        var pageSize = req.query.pageSize;
        registrationDAO.findRegistrations(req.user.hospitalId, getConditions(req), {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (registrations) {
            registrations.rows && registrations.rows.forEach(function (registration) {
                registration.registrationType = config.registrationType[registration.registrationType];
                registration.gender = config.gender[registration.gender];
                registration.memberType = config.memberType[registration.memberType];
                registration.outPatientType = config.outPatientType[registration.outPatientType];
                registration.status = config.registrationStatus[registration.status];
            });
            registrations.pageIndex = pageIndex;
            return res.send({ret: 0, data: registrations});
        });

        return next();
    }
}