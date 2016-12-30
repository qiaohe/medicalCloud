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
    if (req.query.employeeId) {
        conditions.push('dd.employeeId=' + req.query.employeeId);
        conditions.push('r.sequence is not null');
    }
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
                    status: (opst[0].fee > 0 ? 0 : 1), creator: req.user.id
                });
                r.outpatientStatus = 5;
                if (r.outPatientType == 0) r.registrationType = 2;
                if (r.outPatientType == 1) r.registrationType = 3;
                if (!r.businessPeopleId) delete r.businessPeopleId;
                r = _.omit(r, ['reason', 'counselor', 'medicalRecordNo', 'birthday', 'memberCardNo', 'source', 'address', 'idCard']);
                if (r.status != 0) {
                    return redis.incrAsync('doctor:' + r.doctorId + ':d:' + moment(r.registerDate).format('YYYYMMDD') + ':incr').then(function (seq) {
                        r.sequence = seq;
                        return businessPeopleDAO.insertRegistration(r);
                    });
                } else {
                    return businessPeopleDAO.insertRegistration(r);
                }
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
            name: req.body.patientName,
            realName: req.body.patientName,
            age: req.body.age
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
                content: req.body.content,
                patientName: req.body.patientName,
                age: req.body.age
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
    },
    addRevisit: function (req, res, next) {
        var v = _.assign(req.body, {
            createDate: new Date(),
            operator: req.user.id,
            operatorName: req.user.name,
            planVisitDate: req.body.planVisitDate ? req.body.planVisitDate : new Date(),
            hospitalId: req.user.hospitalId
        });
        redis.incrAsync('h:' + req.user.hospitalId + ':incr').then(function (serialNo) {
            v.serialNo = _.padLeft(serialNo, 10, '0');
            return registrationDAO.insertRevisit(v)
        }).then(function (result) {
            res.send({ret: 0, data: v, message: '添加成功。'})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getRevisits: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var conditions = [];
        if (req.query.patientName) conditions.push('pi.realName like \'%' + req.query.patientName + '%\'');
        if (req.query.medicalRecordNo) conditions.push('p.medicalRecordNo like \'%' + req.query.medicalRecordNo + '%\'');
        if (req.query.patientId) conditions.push('r.patientId=' + req.query.patientId);
        if (req.query.doctor) conditions.push('r.doctorId=' + req.query.doctor);
        if (req.query.status) conditions.push('r.status=' + req.query.status);
        if (req.query.start) conditions.push('r.planVisitDate>=\'' + req.query.start + '\'');
        if (req.query.end) conditions.push('r.planVisitDate<=\'' + req.query.end + '\'');
        registrationDAO.findRevisits(hospitalId, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (revisits) {
            revisits.pageIndex = pageIndex;
            res.send({ret: 0, data: revisits});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    delRevisit: function (req, res, next) {
        registrationDAO.deleteRevisit(+req.params.id).then(function (result) {
            res.send({ret: 0, message: 'delete success.'})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    updateRevisit: function (req, res, next) {
        registrationDAO.updateRevisit(req.body).then(function (result) {
            res.send({ret: 0, message: 'update success.'})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getLatestDoctor: function (req, res, next) {
        registrationDAO.findLatestDoctor(req.params.id).then(function (result) {
            if (result.length < 1) return res.send({ret: 0, data: {}});
            res.send({ret: 0, data: result[0]});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    statByOutPatient: function (req, res, next) {
        var conditions = [];
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        if (req.query.startDate) conditions.push('registerDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('registerDate<=\'' + req.query.endDate + ' 23:59:59\'');
        if (req.query.doctorId) conditions.push('doctorId=' + req.query.doctorId);
        var data = {};
        registrationDAO.findDoctorIdListOfOutPatient(req.user.hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }, conditions).then(function (doctors) {
            data = doctors;
            data.pageIndex = pageIndex;
            var ds = [];
            doctors && doctors.rows.forEach(function (d) {
                ds.push(d.doctorId);
            });
            registrationDAO.statByOutPatient(ds, conditions).then(function (result) {
                if (result.length < 1) return res.send({ret: 0, data: []});
                var rows = [];
                result && result.forEach(function (item) {
                    var r = _.filter(rows, {'doctorId': item.doctorId});
                    if (r.length < 1) {
                        if (item.registrationType == 2) {
                            rows.push({
                                doctorId: item.doctorId,
                                doctorName: item.doctorName,
                                firstOutPatient: item.count
                            });
                        }
                        else {
                            rows.push({
                                doctorId: item.doctorId,
                                doctorName: item.doctorName,
                                subSequentOutPatient: item.count
                            });
                        }
                    } else {
                        if (item.registrationType == 3) {
                            r[0].subSequentOutPatient = item.count;
                        }
                        else {

                            r[0].firstOutPatient = item.count;
                        }
                    }
                });
                data.rows = rows;
                registrationDAO.summaryOfOutPatient(req.user.hospitalId, conditions).then(function (summaries) {
                    data.summary = {
                        firstOutPatient: summaries && summaries.length > 0 ? summaries[0].count : 0,
                        subSequentOutPatient: summaries && summaries.length > 1 ? summaries[1].count : 0
                    };
                    res.send({ret: 0, data: data});
                });
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    statByDoctor: function (req, res, next) {
        var conditions = [];
        var doctors = [];
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        if (req.query.startDate) conditions.push('m.createDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('m.createDate<=\'' + req.query.endDate + ' 23:59:59\'');
        if (req.query.doctorId) conditions.push('r.doctorId=' + req.query.doctorId);
        var data = {};
        registrationDAO.statByDoctor(req.user.hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }, conditions).then(function (statResult) {
            data = statResult;
            data.pageIndex = pageIndex;
            if (!req.query.doctorId) {
                data && data.rows && data.rows.forEach(function (row) {
                    doctors.push(row.doctorId);
                })
            }
            return registrationDAO.statRefund(req.user.hospitalId, doctors, conditions);
        }).then(function (result) {
            if (result && result.length > 0) {
                data && data.rows && data.rows.forEach(function (row) {
                    var refundItems = _.filter(result, {doctorId: row.doctorId, refundType: 0});
                    var couponItems = _.filter(result, {doctorId: row.doctorId, refundType: 1});
                    row.refundAmount = refundItems && refundItems.length > 0 ? refundItems[0].amount : 0;
                    row.couponAmount = couponItems && couponItems.length > 0 ? couponItems[0].amount : 0;
                })
            }
            return registrationDAO.summaryByDoctor(req.user.hospitalId, conditions);
        }).then(function (result) {
            data.summary = result && result.length > 0 ? result[0] : {};
            return registrationDAO.summaryRefund(req.user.hospitalId, conditions);
        }).then(function (result) {
            data.summary.refundAmount = result && result.length > 0 ? result[0].amount : 0;
            data.summary.couponAmount = result && result.length > 1 ? result[1].amount : 0;
            res.send({ret: 0, data: data});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    statByChargeByCategory: function (req, res, next) {
        var data = [];
        var conditions = [];
        if (req.query.startDate) conditions.push('createDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('createDate<=\'' + req.query.endDate + ' 23:59:59\'');
        registrationDAO.findOrdersWithChargeBy(req.user.hospitalId, conditions).then(function (items) {
            items && items.forEach(function (item) {
                var fields = ['paymentType', 'paymentType1', 'paymentType2', 'paymentType3'];
                for (var f = 0; f < fields.length; f++) {
                    var amountField = f > 0 ? 'paidAmount' + f : 'paidAmount';
                    if (item[fields[f]]) {
                        var fs = _.filter(data, {chargedBy: item.chargedBy, paymentType: item[fields[f]]});
                        if (fs && fs.length > 0) {
                            fs[0].amount = fs[0].amount + item[amountField];
                        } else {
                            data.push({
                                chargedBy: item.chargedBy,
                                chargedByName: item.chargedByName,
                                paymentType: item[fields[f]],
                                amount: item[amountField]
                            });
                        }
                    }
                }
            });
            return dictionaryDAO.findDictItems(req.user.hospitalId, 3, {from: 0, size: 1000});
        }).then(function (dictItems) {
            var paymentTypes = [];
            for (var i = 0; i < config.paymentType.length; i++) {
                paymentTypes.push({id: i, name: config.paymentType[i]});
            }
            dictItems.rows.forEach(function (row) {
                paymentTypes.push({id: row.id, name: row.value});
            });
            data && data.forEach(function (item) {
                item.paymentType = _.filter(paymentTypes, {id: item.paymentType})[0];
            });
            return registrationDAO.sumPrePaidHistories(req.user.hospitalId);
        }).then(function (prepaidHistories) {
            res.send({ret: 0, data: {data: data, prePaidHistoryTotalAmount: prepaidHistories[0].amount}});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    statByChargeItem: function (req, res, next) {
        var conditions = [];
        if (req.query.startDate) conditions.push('p.createDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('p.createDate<=\'' + req.query.endDate + ' 23:59:59\'');
        registrationDAO.statByChargeItem(req.user.hospitalId, conditions).then(function (items) {
            var grpItems = _.groupBy(items, 'name');
            var data = []
            for (var d in grpItems) {
                data.push({
                    name: d, data: _.map(grpItems[d], function (item) {
                        return {
                            doctorId: item.doctorId,
                            doctorName: item.doctorName,
                            quantity: item.quantity,
                            amount: item.amount
                        }
                    }),
                    sumQuantity: _.sum(grpItems[d], function (item) {
                        return item.quantity;
                    }),
                    sumAmount: _.sum(grpItems[d], function (item) {
                        return item.amount;
                    })
                })
            }
            var groupByDoctorData = _.groupBy(items, 'doctorName');
            var summaries = [];
            for (var doctor in groupByDoctorData) {
                summaries.push({
                    doctorId: groupByDoctorData[doctor][0].doctorId,
                    doctorName: doctor, sumQuantity: _.sum(groupByDoctorData[doctor], function (item) {
                        return item.quantity;
                    }),
                    sumAmount: _.sum(groupByDoctorData[doctor], function (item) {
                        return item.amount;
                    })
                })
            }
            res.send({
                ret: 0, data: {
                    rows: data, summaries: {
                        data: summaries, totalQuantity: _.sum(summaries, function (item) {
                            return item.sumQuantity;
                        }), totalAmount: _.sum(summaries, function (item) {
                            return item.sumAmount;
                        })
                    }
                }
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    statByChargeItemByNurse: function (req, res, next) {
        var conditions = [];
        if (req.query.startDate) conditions.push('m.createDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('m.createDate<=\'' + req.query.endDate + ' 23:59:59\'');
        registrationDAO.statByChargeItemByNurse(req.user.hospitalId, conditions).then(function (items) {
            var grpItems = _.groupBy(items, 'name');
            var data = []
            for (var d in grpItems) {
                data.push({
                    name: d, data: _.map(grpItems[d], function (item) {
                        return {
                            nurse: item.nurse,
                            nurseName: item.nurseName,
                            quantity: item.quantity,
                            amount: item.amount
                        }
                    }),
                    sumQuantity: _.sum(grpItems[d], function (item) {
                        return item.quantity;
                    }),
                    sumAmount: _.sum(grpItems[d], function (item) {
                        return item.amount;
                    })
                })
            }
            var groupByDoctorData = _.groupBy(items, 'nurseName');
            var summaries = [];
            for (var doctor in groupByDoctorData) {
                summaries.push({
                    nurse: groupByDoctorData[doctor][0].nurse,
                    nurseName: doctor, sumQuantity: _.sum(groupByDoctorData[doctor], function (item) {
                        return item.quantity;
                    }),
                    sumAmount: _.sum(groupByDoctorData[doctor], function (item) {
                        return item.amount;
                    })
                })
            }
            res.send({
                ret: 0, data: {
                    rows: data, summaries: {
                        data: summaries, totalQuantity: _.sum(summaries, function (item) {
                            return item.sumQuantity;
                        }), totalAmount: _.sum(summaries, function (item) {
                            return item.sumAmount;
                        })
                    }
                }
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    statByDoctorAchievement: function (req, res, next) {
        var data = [];
        var conditions = [];
        var fields = ['paymentType', 'paymentType1', 'paymentType2', 'paymentType3'];
        if (req.query.startDate) conditions.push('m.createDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('m.createDate<=\'' + req.query.endDate + ' 23:59:59\'');
        registrationDAO.statByDoctorAchievement(req.user.hospitalId, conditions).then(function (archievements) {
            var grpArch = _.groupBy(archievements, 'doctorName');
            for (var item in grpArch) {
                var paymentTypes = [];
                grpArch[item] && grpArch[item].forEach(function (rec) {
                    for (var i = 0; i < fields.length; i++) {
                        if (rec[fields[i]]) {
                            var amountField = i > 0 ? 'paidAmount' + i : 'paidAmount';
                            var p = _.filter(paymentTypes, {paymentType: rec[fields[i]]});
                            if (p && p.length > 0) {
                                p[0].count = p[0].count + rec.count;
                                p[0].amount = p[0].amount + rec[amountField];
                            } else {
                                paymentTypes.push({
                                    paymentType: rec[fields[i]],
                                    amount: rec[amountField],
                                    count: rec.count
                                })
                            }
                        }
                    }
                });
                if (paymentTypes && paymentTypes.length > 0)
                    data.push({
                        doctorName: item, doctorId: grpArch[item][0].doctorId, data: paymentTypes
                    });
            }
            return dictionaryDAO.findDictItems(req.user.hospitalId, 3, {from: 0, size: 1000});
        }).then(function (dictItems) {
            var ps = [];
            for (var i = 0; i < config.paymentType.length; i++) {
                ps.push({id: i, name: config.paymentType[i]});
            }
            dictItems.rows.forEach(function (row) {
                ps.push({id: row.id, name: row.value});
            });
            data && data.forEach(function (item) {
                item.data && item.data.forEach(function (d) {
                    d.paymentType = _.filter(ps, {id: d.paymentType})[0];
                });
            });
            var summaries = [];
            data && data.forEach(function (item) {
                item.sumCount = _.sum(item.data, function (d) {
                    return d.count;
                });
                item.sumAmount = _.sum(item.data, function (d) {
                    return d.amount;
                });
                item.data && item.data.length > 0 && item.data.forEach(function (e) {
                    summaries.push(e);
                })
            });
            var grpSummary = _.groupBy(summaries, function (item) {
                return JSON.stringify(item.paymentType);
            });
            var summaryData = [];
            for (var s in grpSummary) {
                summaryData.push({
                    paymentType: JSON.parse(s), sumAmount: _.sum(grpSummary[s], function (y) {
                        return y.amount;
                    }), sumCount: _.sum(grpSummary[s], function (y) {
                        return y.count;
                    })
                })
            }
            res.send({
                ret: 0, data: {
                    data: data, summary: {
                        data: summaryData, totalCount: _.sum(summaryData, function (item) {
                            return item.sumCount;
                        }), totalAmount: _.sum(summaryData, function (item) {
                            return item.sumAmount;
                        })
                    }
                }
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    statByNurseAchievement: function (req, res, next) {
        var conditions = [];
        if (req.query.startDate) conditions.push('m.createDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('m.createDate<=\'' + req.query.endDate + ' 23:59:59\'');
        registrationDAO.statByNurseAchievement(req.user.hospitalId, conditions).then(function (archievements) {
            var grpArch = _.groupBy(archievements, 'nurseName');
            var data = [];
            for (var arch in grpArch) {
                data.push({
                    nurse: grpArch[arch][0].nurse, nurseName: arch, data: _.map(grpArch[arch], function (item) {
                        return {doctorId: item.doctorId, doctorName: item.doctorName, paidAmount: item.paidAmount}
                    }),
                    sumPaidAmount: _.sum(grpArch[arch], 'paidAmount')
                });
            }
            var grpArchByDoctorId = _.groupBy(archievements, 'doctorName');
            var summaries = [];
            for (var d in grpArchByDoctorId) {
                summaries.push({
                    doctorId: grpArchByDoctorId[d][0].doctorId, doctorName: d,
                    sumPaidAmount: _.sum(grpArchByDoctorId[d], 'paidAmount')
                });
            }
            res.send({
                ret: 0, data: {
                    data: data, summaries: {
                        data: summaries, totalPaidAmount: _.sum(summaries, function (item) {
                            return item.sumPaidAmount;
                        })
                    }
                }
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    statByChargeItemSummary: function (req, res, next) {
        var conditions = [];
        if (req.query.startDate) conditions.push('p.createDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('p.createDate<=\'' + req.query.endDate + ' 23:59:59\'');
        registrationDAO.statByChargeItemSummary(req.user.hospitalId, conditions).then(function (feeItems) {
            var grpArch = _.groupBy(feeItems, 'doctorName');
            var data = [];
            for (var arch in grpArch) {
                data.push({
                    nurse: grpArch[arch][0].doctorId, doctorName: arch, data: _.map(grpArch[arch], function (item) {
                        return {id: item.id, name: item.name, paidAmount: item.amount}
                    }),
                    sumAmount: _.sum(grpArch[arch], 'amount')
                });
            }
            var grpArchByDoctorId = _.groupBy(feeItems, 'name');
            var summaries = [];
            for (var d in grpArchByDoctorId) {
                summaries.push({
                    id: grpArchByDoctorId[d][0].id, name: d,
                    sumAmount: _.sum(grpArchByDoctorId[d], 'amount')
                });
            }
            res.send({
                ret: 0, data: {
                    data: data, summaries: {
                        data: summaries, totalAmount: _.sum(summaries, function (item) {
                            return item.amount;
                        })
                    }
                }
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

}