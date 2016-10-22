"use strict";
var config = require('../config');
var i18n = require('../i18n/localeMessage');
var registrationDAO = require('../dao/registrationDAO');
var dictionaryDAO = require('../dao/dictionaryDAO');
var businessPeopleDAO = require('../dao/businessPeopleDAO');
var hospitalDAO = require('../dao/hospitalDAO');
var patientDAO = require('../dao/patientDAO');
var deviceDAO = require('../dao/deviceDAO');
var pusher = require('../domain/NotificationPusher');
var orderDAO = require('../dao/orderDAO');
var _ = require('lodash');
var util = require('util');
var moment = require('moment');
var redis = require('../common/redisClient');
var md5 = require('md5');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
function getConditions(req) {
    var conditions = [];
    if (req.query.memberType) conditions.push('r.memberType=' + req.query.memberType);
    if (req.query.outPatientType) conditions.push('r.outPatientType=' + req.query.outPatientType);
    if (req.query.departmentId) conditions.push('r.departmentId=' + req.query.departmentId);
    if (req.query.medicalRecordNo) conditions.push('p.medicalRecordNo=' + req.query.medicalRecordNo);
    if (req.query.registerDateStart) conditions.push('r.registerDate>=\'' + req.query.registerDateStart + '\'');
    if (req.query.registerDateEnd) conditions.push('r.registerDate<=\'' + req.query.registerDateEnd + '\'');
    if (req.query.createDateStart) conditions.push('r.createDate>=\'' + req.query.createDate + '\'');
    if (req.query.createDateEnd) conditions.push('r.createDate<=\'' + req.query.createDate + '\'');
    if (req.query.employeeId) conditions.push('d.employeeId=' + req.query.employeeId);
    if (req.query.medicalRecordNo) conditions.push('p.medicalRecordNo like \'%' + req.query.medicalRecordNo + '%\'');
    if (req.query.doctorId) conditions.push('r.doctorId=' + req.query.doctorId);
    if (req.query.outpatientStatus) conditions.push('r.outpatientStatus=' + req.query.outpatientStatus);
    if (req.query.registrationType) conditions.push('r.registrationType=' + req.query.registrationType);
    if (req.query.patientName) conditions.push('r.patientName like \'%' + req.query.patientName + '%\'');
    if (req.query.patientMobile) conditions.push('r.patientMobile like \'%' + req.query.patientMobile + '%\'');
    if (req.query.status) conditions.push('r.status=' + req.query.status);
    if (req.query.outPatientType) conditions.push('r.outPatientType=' + req.query.outPatientType);
    if (req.query.outPatientServiceType) conditions.push('r.outPatientServiceType=' + req.query.outPatientServiceType);
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
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
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
            registrations && registrations.rows && registrations.rows.forEach(function (registration) {
                registration.registrationType = config.registrationType[registration.registrationType];
                registration.gender = config.gender[registration.gender];
                registration.memberType = config.memberType[registration.memberType];
                registration.outPatientType = config.outPatientType[registration.outPatientType];
                registration.status = config.registrationStatus[registration.status];
                registration.outpatientStatus = config.outpatientStatus[registration.outpatientStatus];
            });
            registrations.pageIndex = pageIndex;
            return res.send({ret: 0, data: registrations});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    addRegistration: function (req, res, next) {
        var r = _.assign(req.body, {
            createDate: new Date(), registerDate: moment().format("YYYY-MM-DD 00:00:00")
        });
        var hospitalName;
        hospitalDAO.findHospitalById(req.user.hospitalId).then(function (hospitals) {
            hospitalName = hospitals[0].name;
            return businessPeopleDAO.findPatientBasicInfoBy(r.patientMobile)
        }).then(function (basicInfos) {
            return basicInfos.length ? basicInfos[0].id : businessPeopleDAO.insertPatientBasicInfo({
                name: r.patientName,
                realName: r.patientName,
                gender: r.gender,
                mobile: r.patientMobile,
                createDate: new Date(),
                password: md5(r.patientMobile.substring(r.patientMobile.length - 6, r.patientMobile.length)),
                creator: req.user.id,
                headPic: config.app.defaultHeadPic,
                birthday: r.birthday,
                address: r.address,
                idCard: r.idCard
            }).then(function (result) {
                if (result.insertId) {
                    var content = config.sms.registerTemplate.replace(':code', r.patientMobile.substring(r.patientMobile.length - 4, r.patientMobile.length));
                    content = content.replace(':hospital', hospitalName);
                    var option = {mobile: r.patientMobile, text: content, apikey: config.sms.apikey};
                    return request.postAsync({
                        url: config.sms.providerUrl,
                        form: option
                    }).then(function (response, body) {
                        return result.insertId;
                    });
                } else {
                    return result.insertId;
                }
            });
        }).then(function (result) {
            r.patientBasicInfoId = result;
            return businessPeopleDAO.findPatientByBasicInfoId(result, req.user.hospitalId).then(function (patients) {
                if (patients.length) return patients[0].id;
                return redis.incrAsync('member.no.incr').then(function (memberNo) {
                    return redis.incrAsync('d:' + moment().format('YYMMDD') + ':mh').then(function (medicalRecordNo) {
                        return businessPeopleDAO.insertPatient({
                            patientBasicInfoId: r.patientBasicInfoId,
                            hospitalId: req.user.hospitalId,
                            memberType: (r.memberType ? r.memberType : 0),
                            source: r.source,
                            counselor: r.counselor,
                            balance: 0.00,
                            memberCardNo: req.user.hospitalId + '-1-' + _.padLeft(memberNo, 7, '0'),
                            medicalRecordNo: moment().format('YYMMDD') + _.padLeft(medicalRecordNo, 3, '0'),
                            createDate: new Date()
                        }).then(function (patient) {
                            return patient.insertId;
                        });
                    })
                });
            });
        }).then(function (result) {
            r.patientId = result;
            if (r.doctorId)
                return hospitalDAO.findDoctorById(r.doctorId);
            else return null;
        }).then(function (doctors) {
            var doctor = (doctors == null ? null : doctors[0]);
            return dictionaryDAO.findOutPatientTypeById(r.outPatientServiceType).then(function (opst) {
                r = _.assign(r, {
                    hospitalId: req.user.hospitalId,
                    hospitalName: (doctor == null ? hospitalName : doctor.hospitalName),
                    registrationFee: opst[0].fee,
                    doctorName: (doctor == null ? null : doctor.name),
                    doctorJobTitle: (doctor == null ? null : doctor.jobTitle),
                    doctorJobTitleId: (doctor == null ? null : doctor.jobTitleId),
                    doctorHeadPic: (doctor == null ? null : doctor.headPic),
                    status: 0, creator: req.user.id
                });
                r.outpatientStatus = 5;
                r.registrationType = (r.registrationType ? r.registrationType : 2);
                if (!r.businessPeopleId) delete r.businessPeopleId;
                r = _.omit(r, ['reason', 'counselor', 'medicalRecordNo', 'birthday', 'memberCardNo', 'source', 'address', 'idCard']);
                return businessPeopleDAO.insertRegistration(r);
            });
        }).then(function (result) {
            r.id = result.insertId;
            return redis.incrAsync('h:' + r.hospitalId + ':' + moment().format('YYYYMMDD') + ':0:incr').then(function (reply) {
                var orderNo = _.padLeft(r.hospitalId, 4, '0') + moment().format('YYYYMMDD') + '0' + _.padLeft(reply, 3, '0');
                var o = {
                    orderNo: orderNo,
                    registrationId: r.id,
                    hospitalId: r.hospitalId,
                    amount: r.registrationFee,
                    paidAmount: r.registrationFee,
                    paymentAmount: r.registrationFee,
                    paymentDate: new Date(),
                    status: (r.registrationFee > 0.00 ? 0 : 1),
                    paymentType: (r.registrationType != 3 ? r.paymentType : 5),
                    createDate: new Date(),
                    type: 0
                };
                return orderDAO.insert(o);
            });
        }).then(function (result) {
            registrationDAO.updateAppointment({
                id: r.appointmentId,
                status: 1,
                registrationId: r.id
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
                                uid: r.patientBasicInfoId,
                                type: 1,
                                hospitalId: req.user.hospitalId
                            }, function (err, result) {
                                if (err) throw err;
                            });
                        });
                    }
                });
            });
            res.send({ret: 0, data: r});
        }).catch(function (error) {
            res.send({ret: 1, message: error.message});
        });
        return next();
    },

    changeRegistration: function (req, res, next) {
        req.body.id = +req.params.rid;
        req.body.status = 3;
        var oldRegistration = {};
        businessPeopleDAO.updatePatientBasicInfo({
            id: req.body.patientBasicInfoId,
            address: req.body.address,
            idCard: req.body.idCard,
            birthday: req.body.birthday,
            gender: req.body.gender,
            name: req.body.name,
            realName: req.body.realName
        }).then(function (result) {
            return patientDAO.updatePatient({
                id: req.body.patientId, memberType: req.body.memberType,
                source: req.body.source,
                counselor: req.body.counselor,
                memberCardNo: req.body.memberCardNo,
                medicalRecordNo: req.body.medicalRecordNo
            });
        }).then(function (result) {
            return registrationDAO.updateRegistration({
                id: req.body.id,
                departmentId: req.body.departmentId,
                departmentName: req.body.departmentName,
                doctorId: req.body.doctorId,
                doctorName: req.body.doctorName,
                outPatientServiceType: req.body.outPatientServiceType,
                businessPeopleName: req.body.businessPeopleName,
                content: req.body.content
            })
        }).then(function (result) {
            return businessPeopleDAO.findRegistrationById(req.body.id)
        }).then(function (rs) {
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
                    req.body.registrationFee = doctor.registrationFee;
                    req.body.doctorJobTitle = doctor.jobTitle;
                    req.body.doctorJobTitleId = doctor.jobTitleId;
                    req.body.doctorHeadPic = doctor.headPic;
                    // return registrationDAO.updateRegistration(req.body);
                })
            } else {
                // return registrationDAO.updateRegistration(req.body);
            }
        }).then(function () {
            return res.send({ret: 0, message: i18n.get('registration.update.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
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
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
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
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getRegistration: function (req, res, next) {
        var rid = req.params.rid;
        registrationDAO.findRegistrationsByIdWithDetail(rid).then(function (result) {
            res.send({ret: 0, data: result[0]});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getRegistrationsOfDoctor: function (req, res, next) {
        var employeeId = req.user.id;
        req.query.employeeId = employeeId;
        req.query.registerDate = moment().format('YYYY-MM-DD');
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
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });

        return next();
    },
    getAppointments: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var conditions = [];
        if (req.query.name) conditions.push('(po.name like \'%' + req.query.name + '%\' or p.medicalRecordNo like \'%' + req.query.name + '%\' or po.mobile like \'%' + req.query.name + '%\')');
        if (req.query.department) conditions.push('a.department=' + req.query.department);
        if (req.query.doctor) conditions.push('a.doctor=' + req.query.doctor);
        if (req.query.employeeId) conditions.push('d.employeeId=' + req.query.employeeId);
        if (req.query.status) conditions.push('a.status=' + req.query.status);
        if (req.query.start) conditions.push('a.appointmentDate>=\'' + req.query.start + '\'');
        if (req.query.end) conditions.push('a.appointmentDate<=\'' + req.query.end + '\'');
        registrationDAO.findAppointments(req.user.hospitalId, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (appointments) {
            appointments.pageIndex = pageIndex;
            appointments && appointments.rows.length && appointments.rows.forEach(function (item) {
                item.status = config.appointmentStatus[+item.status];
                item.gender = config.gender[+item.gender];
                item.memberType = config.memberType[+item.memberType];
            });
            res.send({ret: 0, data: appointments})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    addAppointment: function (req, res, next) {
        var appointment = _.assign(req.body, {
            hospitalId: req.user.hospitalId,
            creator: req.user.id,
            creatorName: req.user.name,
            createDate: new Date(),
            status: 0
        });
        registrationDAO.addAppointment(appointment).then(function (result) {
            appointment.id = result.insertId;
            res.send({ret: 0, data: appointment, message: '复诊预约成功。'})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    updateAppointment: function (req, res, next) {
        var appointment = req.body;
        registrationDAO.updateAppointment(appointment).then(function (result) {
            res.send({ret: 0, message: '更新成功。'})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getPatientsOfDoctorPeriod: function (req, res, next) {
        registrationDAO.findPatientsOfDoctorPeriod(req.params.id, req.params.period, req.query.appointmentDate).then(function (ps) {
            res.send({ret: 0, data: ps})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }
}