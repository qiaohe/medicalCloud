"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
var config = require('../config');
module.exports = {
    findRegistrations: function (hospitalId, conditions, page) {
        var sql = sqlMapping.registration.findRegistrations;
        sql = !conditions.length ? sql : 'select SQL_CALC_FOUND_ROWS ot.name as outPatientServiceTypeName,r.content,r.transferDoctor,r.transferDoctorName,r.outPatientServiceType,r.id,mo.orderNo,p.id as patientId, p.patientBasicInfoId,r.outpatientStatus,p.counselor, r.registerDate, s.`name` as shiftPeriod, p.medicalRecordNo,r.patientMobile,r.patientName,r.gender, p.balance,dic.value as source, p.memberCardNo,r.memberType, r.doctorName, r.`comment`, r.registrationFee, r.registrationType,r.departmentName, po.address,r.`status`, e.`name` as creatorName,r.createDate, r.outPatientType, r.status, r.sequence, r.businessPeopleName from Registration r left JOIN ShiftPeriod s ON s.id= r.shiftPeriod left join Patient p on p.id=r.patientId left join Doctor d on d.id=r.doctorId left join MedicalOrder mo on mo.registrationId= r.id left join PatientBasicInfo po on po.id = p.patientBasicInfoId left JOIN Employee e on e.id = r.creator left join OutpatientServiceType ot on ot.id=r.outPatientServiceType LEFT JOIN Doctor dd on dd.id = r.doctorId left join Dictionary dic on dic.id = p.source and dic.type=9 where r.status <>4 and r.hospitalId = ? and ' + conditions.join(' and ') + ' order by r.id desc limit ?, ?';
        return db.queryWithCount(sql, [+hospitalId, +page.from, +page.size]);
    },
    findRegistrationsBy: function (hospitalId, registrationDate, conditions, page) {
        var sql = sqlMapping.registration.findRegistrationsBy;
        sql = !conditions.length ? sql : 'select SQL_CALC_FOUND_ROWS ot.name as outPatientServiceTypeName,r.createDate, r.patientId,r.content,p.medicalRecordNo, r.outPatientType, r.id, r.transferDoctor,r.transferDoctorName,r.outpatientStatus,r.outPatientServiceType,r.patientMobile,r.patientName,r.gender, p.balance, p.memberCardNo, r.memberType, r.doctorName, r.`comment`, r.registrationFee, r.registrationType, r.departmentName, r.registerDate , s.`name` as shiftPeriod, r.outPatientType, r.status, r.sequence, e.name as businessPeopleName, r.status as preRegistrationStatus from Registration r LEFT JOIN Employee e on e.id=r.businessPeopleId left JOIN ShiftPeriod s ON s.id= r.shiftPeriod left join Patient p on r.patientId =p.id  left join OutpatientServiceType ot on ot.id=r.outPatientServiceType LEFT JOIN Doctor dd on dd.id = r.doctorId where r.hospitalId = ? and r.registerDate=? and ' + conditions.join(' and ') + ' order by r.id desc limit ?, ?';
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
    },
    insertRevisit: function (v) {
        return db.query(sqlMapping.revisit.insert, v);
    },
    deleteRevisit: function (id) {
        return db.query(sqlMapping.revisit.delete, id);
    },
    updateRevisit: function (v) {
        return db.query(sqlMapping.revisit.update, [v, v.id]);
    },
    findRevisits: function (hospitalId, conditions, page) {
        var sql = sqlMapping.revisit.findAll;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' order by r.createDate desc limit ?,?';
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },
    findLatestDoctor: function (patientId) {
        return db.query(sqlMapping.registration.findLatestDoctor, [patientId])
    },
    statByOutPatient: function (ds, conditions) {
        var sql = sqlMapping.registration.statByOutPatient;
        if (conditions.length > 0)
            sql = sql + ' and ' + conditions.join(' and ');
        if (ds.length > 0)
            sql = sql + ' and doctorId in (' + ds.join(',') + ') ';
        sql = sql + ' group by doctorId, doctorName, registrationType order by doctorId';
        return db.query(sql)
    },

    findDoctorIdListOfOutPatient: function (hospitalId, page, conditions) {
        var sql = sqlMapping.registration.findDoctorIdListOfOutPatient;
        if (conditions.length > 0) {
            sql = sql + ' and ' + conditions.join(' and ');
        }
        sql = sql + ' limit ?,?';
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },

    summaryOfOutPatient: function (hospitalId, conditions) {
        var sql = sqlMapping.registration.summaryOfOutPatient;
        if (conditions.length > 0) {
            sql = sql + ' and ' + conditions.join(' and ');
        }
        sql = sql + ' group by registrationType order by registrationType';
        return db.query(sql, hospitalId);
    },
    statByDoctor: function (hospitalId, page, conditions) {
        var sql = sqlMapping.registration.statByDoctor;
        if (conditions.length > 0)
            sql = sql + ' and ' + conditions.join(' and ');
        if (page)
            sql = sql + ' group by doctorId, doctorName limit ?, ?';
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },
    statRefund: function (hospitalId, doctors, conditions) {
        var sql = sqlMapping.registration.statRefund;
        if (conditions.length > 0)
            sql = sql + ' and ' + conditions.join(' and ');
        if (doctors.length > 0)
            sql = sql + ' and doctorId in(' + doctors.join(',') + ')';
        sql = sql + ' group by r.doctorId, m.refundType';
        return db.query(sql, hospitalId);
    },
    summaryByDoctor: function (hospitalId, conditions) {
        var sql = sqlMapping.registration.summaryByDoctor;
        if (conditions.length > 0)
            sql = sql + ' and ' + conditions.join(' and ');
        return db.query(sql, hospitalId);
    },
    summaryRefund: function (hospitalId, conditions) {
        var sql = sqlMapping.registration.summaryRefund;
        if (conditions.length > 0)
            sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' group by refundType';
        return db.query(sql, hospitalId);
    },
    findOrdersWithChargeBy: function (hospitalId, conditions) {
        var sql = sqlMapping.registration.findOrdersWithChargeBy;
        if (conditions.length > 0)
            sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' order by chargedBy';
        return db.query(sql, hospitalId);
    },
    sumPrePaidHistories(hospitalId){
        return db.query(sqlMapping.registration.sumPrepaidHistories, hospitalId);
    },
    statByChargeItem: function (hospitalId, conditions) {
        var sql = sqlMapping.registration.statByChargeItem;
        if (conditions.length > 0)
            sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' group by d.id, d.`name`, r.doctorId, r.doctorName';
        return db.query(sql, hospitalId);
    },

    statByChargeItemByNurse: function (hospitalId, conditions) {
        var sql = sqlMapping.registration.statByChargeItemByNurse;
        if (conditions.length > 0)
            sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' group by d.id, d.`name`, m.nurse, m.nurseName';
        return db.query(sql, hospitalId);
    },
    statByDoctorAchievement: function (hospitalId, conditions) {
        var sql = sqlMapping.registration.statByDoctorAchievement;
        if (conditions.length > 0)
            sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' GROUP BY r.doctorId, r.doctorName,  m.paymentType, paymentType1, paymentType2, paymentType3';
        return db.query(sql, hospitalId);
    },
    statByNurseAchievement: function (hospitalId, conditions) {
        var sql = sqlMapping.registration.statByNurseAchievement;
        if (conditions.length > 0)
            sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' group by m.nurse, m.nurseName, r.doctorId, r.doctorName';
        return db.query(sql, hospitalId);
    },
    statByChargeItemSummary: function (hospitalId, conditions) {
        var sql = sqlMapping.registration.statByChargeItemSummary;
        if (conditions.length > 0)
            sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' group by r.doctorId, r.doctorName, d.id, d.`name`';
        return db.query(sql, hospitalId);
    },

}
