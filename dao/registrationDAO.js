"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
var config = require('../config');
module.exports = {
    findRegistrations: function (hospitalId, conditions, page) {
        var sql = sqlMapping.registration.findRegistrations;
        sql = !conditions.length ? sql : 'select SQL_CALC_FOUND_ROWS r.outPatientServiceType,r.id,mo.orderNo,p.id as patientId, p.patientBasicInfoId,r.outpatientStatus,p.counselor, r.registerDate, s.`name` as shiftPeriod, p.medicalRecordNo,r.patientMobile,r.patientName,r.gender, p.balance,p.source, p.memberCardNo,r.memberType, r.doctorName, r.`comment`, r.registrationFee, r.registrationType,r.departmentName, po.address,r.`status`, e.`name` as creatorName,r.createDate, r.outPatientType, r.status, r.sequence, r.businessPeopleName from Registration r left JOIN ShiftPeriod s ON s.id= r.shiftPeriod left join Patient p on p.id=r.patientId left join Doctor d on d.id=r.doctorId left join MedicalOrder mo on mo.registrationId= r.id left join PatientBasicInfo po on po.id = p.patientBasicInfoId left JOIN Employee e on e.id = r.creator left join OutpatientServiceType ot on ot.id=r.outPatientServiceType where r.status <>4 and r.hospitalId = ? and ' + conditions.join(' and ') + ' order by r.id desc limit ?, ?';
        return db.queryWithCount(sql, [+hospitalId, +page.from, +page.size]);
    },
    findRegistrationsBy: function (hospitalId, registrationDate, conditions, page) {
        var sql = sqlMapping.registration.findRegistrationsBy;
        sql = !conditions.length ? sql : 'select SQL_CALC_FOUND_ROWS r.id, r.outpatientStatus, r.patientMobile,r.patientName,r.gender, p.balance, p.memberCardNo, r.memberType, r.doctorName, r.`comment`, r.registrationFee, r.registrationType, r.departmentName, concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , s.`name`) as registerDate, r.outPatientType, r.status, r.sequence, e.name as businessPeopleName, r.status as preRegistrationStatus from Registration r LEFT JOIN Employee e on e.id=r.businessPeopleId left JOIN ShiftPeriod s ON s.id= r.shiftPeriod, Patient p where r.patientId =p.id and r.hospitalId = ? and r.registerDate=? and ' + conditions.join(' and ') + ' order by r.id desc limit ?, ?';
        return db.queryWithCount(sql, [+hospitalId, registrationDate, +page.from, +page.size]);
    },
    updateRegistration: function (reg) {
        return db.query(sqlMapping.registration.updateRegistration, [reg, reg.id]);
    },
    findRegistrationsById: function (rid) {
        return db.query(sqlMapping.registration.findRegistrationsById, +rid);
    },
    findRegistrationsByIdWithDetail: function (rid) {
        return db.query(sqlMapping.registration.findRegistrationsByIdWithDetail, rid);
    },
    findCurrentQueueByRegId: function (rid) {
        return db.query(sqlMapping.registration.findCurrentQueueByRegId, rid);
    },
    insertCancelHistory: function (cancelHistory) {
        return db.query(sqlMapping.registration.insertRegistrationCancelHistory, cancelHistory);
    },
    updateRegistrationFee: function (registrationId, order) {
        // var fee = {};
        // fee[order.type == config.orderType[1] ? 'recipeFee' : 'preScriptionFee'] = order.paidAmount;
        var sql = 'update Registration set status = 1, totalFee = totalFee + ?,' + (order.type == config.orderType[1] ? 'recipeFee' : 'preScriptionFee') + '=' +
            (order.type == config.orderType[1] ? 'recipeFee' : 'preScriptionFee') + '+? where id =?';
        return db.query(sql, [order.paidAmount, order.paidAmount, registrationId]);
    },
    updateSalesManPerformanceByMonth: function (salesMan, yearMonth, paidAmount) {
        return db.query(sqlMapping.registration.updateSalesManPerformanceByMonth, [paidAmount, salesMan, yearMonth]);
    },
    findShareSetting: function (hospitalId) {
        return db.query(sqlMapping.hospital.findShareSetting, hospitalId);
    },
    findAppointments: function (hospitalId, conditions, page) {
        var sql = sqlMapping.registration.findAppointments;
        if (conditions.length)
            sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' order by a.createDate desc limit ?,?';
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },
    addAppointment: function (appointment) {
        return db.query(sqlMapping.registration.addAppointment, appointment);
    },
    updateAppointment: function (appointment) {
        return db.query(sqlMapping.registration.updateAppointment, [appointment, appointment.id]);
    },
    findPatientsOfDoctorPeriod: function (doctorId, period, appointmentDate) {
        return db.query(sqlMapping.registration.findPatientsOfDoctorPeriod, [doctorId, period, appointmentDate]);
    }
}
