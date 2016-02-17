"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    findRegistrations: function (hospitalId, conditions, page) {
        var sql = sqlMapping.registration.findRegistrations;
        sql = !conditions.length ? sql : 'select SQL_CALC_FOUND_ROWS r.id, r.outpatientStatus, r.patientMobile,r.patientName,r.gender, p.balance, p.memberCardNo, r.memberType, r.doctorName, r.`comment`, r.registrationFee, r.registrationType, r.departmentName, concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , s.`name`) as registerDate, r.outPatientType,r.status, r.sequence, e.name as businessPeopleName, r.status as preRegistrationStatus from Registration r LEFT JOIN Employee e on e.id=r.businessPeopleId left JOIN ShiftPeriod s ON s.id= r.shiftPeriod left join Patient p on p.id=r.patientId left join Doctor d on d.id=r.doctorId where r.patientId =p.id and r.status<>4 and r.hospitalId = ? and ' + conditions.join(' and ') + ' order by r.registerDate, r.shiftPeriod limit ?, ?';
        return db.queryWithCount(sql, [+hospitalId, +page.from, +page.size]);
    },
    findRegistrationsBy: function (hospitalId, registrationDate, conditions, page) {
        var sql = sqlMapping.registration.findRegistrationsBy;
        sql = !conditions.length ? sql : 'select SQL_CALC_FOUND_ROWS r.id, r.outpatientStatus, r.patientMobile,r.patientName,r.gender, p.balance, p.memberCardNo, r.memberType, r.doctorName, r.`comment`, r.registrationFee, r.registrationType, r.departmentName, concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , s.`name`) as registerDate, r.outPatientType, r.status, r.sequence, e.name as businessPeopleName, r.status as preRegistrationStatus from Registration r LEFT JOIN Employee e on e.id=r.businessPeopleId left JOIN ShiftPeriod s ON s.id= r.shiftPeriod, Patient p where r.status<>4 and r.patientId =p.id and r.hospitalId = ? and r.registerDate=? and ' + conditions.join(' and ') + ' order by r.registerDate, r.shiftPeriod limit ?, ?';
        return db.queryWithCount(sql, [+hospitalId, registrationDate, +page.from, +page.size]);
    },
    updateRegistration: function (reg) {
        return db.query(sqlMapping.registration.updateRegistration, [reg, reg.id]);
    },
    findRegistrationsById: function (rid) {
        return db.query(sqlMapping.registration.findRegistrationsById, rid);
    },
    findRegistrationsByIdWithDetail: function (rid) {
        return db.query(sqlMapping.registration.findRegistrationsByIdWithDetail, rid);
    },
    findCurrentQueueByRegId: function (rid) {
        return db.query(sqlMapping.registration.findCurrentQueueByRegId, rid);
    },
    insertCancelHistory: function (cancelHistory) {
        return db.query(sqlMapping.registration.insertRegistrationCancelHistory, cancelHistory);
    }
}
