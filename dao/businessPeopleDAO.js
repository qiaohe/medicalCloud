"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    findPerformanceByMonth: function (businessPeopleId, yearMonth) {
        return db.query(sqlMapping.businessPeople.findPerformanceByMonth, [businessPeopleId, yearMonth]);
    },
    findPerformanceByYear: function (businessPeopleId, year) {
        return db.query(sqlMapping.businessPeople.findPerformanceByYear, [businessPeopleId, year]);
    },
    findContactsBy: function (businessPeopleId) {
        return db.query(sqlMapping.businessPeople.findContactsBy, businessPeopleId);
    },
    findContactsByPagable: function (businessPeopleId, page, conditions) {
        var sql = sqlMapping.businessPeople.findContactsByPagable;
        sql = !conditions.length ? sql : 'select SQL_CALC_FOUND_ROWS ic.id, ic.mobile, ic.name, ic.createDate, ic.inviteTimes, ic.source, ic.inviteResult,gc.`name` as groupName from InvitationContact ic left join GroupCompany gc on gc.id = ic.groupId where ic.businessPeopleId=? and ' + conditions.join(' and ') + ' limit ?, ?';
        return db.queryWithCount(sql, [businessPeopleId, page.from, page.size]);
    },

    insertContact: function (contact) {
        return db.query(sqlMapping.businessPeople.insertContact, contact);
    },

    findContactBusinessPeopleIdAndMobile: function (businessPeopleId, mobile) {
        return db.query(sqlMapping.businessPeople.findContactBusinessPeopleIdAndMobile, [businessPeopleId, mobile]);
    },
    findContactById: function (contactId) {
        return db.query(sqlMapping.businessPeople.findContactById, contactId);
    },
    updateContact: function (contactId) {
        return db.query(sqlMapping.businessPeople.updateContact, contactId);
    },
    insertInvitation: function (invitation) {
        return db.query(sqlMapping.businessPeople.insertInvitation, invitation);
    },
    insertRegistration: function (registration) {
        return db.query(sqlMapping.businessPeople.insertRegistration, registration);
    },
    updateShiftPlan: function (doctorId, registerDate, shiftPeriod) {
        return db.query(sqlMapping.businessPeople.updateShiftPlan, [doctorId, registerDate, shiftPeriod])
    },
    updateShiftPlanDec: function (doctorId, registerDate, shiftPeriod) {
        return db.query(sqlMapping.businessPeople.updateShiftPlanDec, [doctorId, registerDate, shiftPeriod])
    },
    findRegistrationById: function (rid) {
        return db.query(sqlMapping.businessPeople.findRegistrationById, rid);
    },
    findShiftPlanByDoctorAndShiftPeriod: function (doctorId, day, shiftPeriod) {
        return db.query(sqlMapping.businessPeople.findShiftPlanByDoctorAndShiftPeriod, [doctorId, day, shiftPeriod]);
    },
    findPatientBasicInfoBy: function (mobile) {
        return db.query(sqlMapping.businessPeople.findPatientBasicInfoBy, mobile);
    },
    findPatientBy: function (hospitalId, basicInfoId) {
        return db.query(sqlMapping.businessPeople.findPatientBy, [hospitalId, basicInfoId]);
    },
    insertPatientBasicInfo: function (patientBasicInfo) {
        return db.query(sqlMapping.businessPeople.insertPatientBasicInfo, patientBasicInfo)
    },
    findPatientByBasicInfoId: function (patientBasicInfoId) {
        return db.query(sqlMapping.businessPeople.findPatientByBasicInfoId, patientBasicInfoId)
    },
    insertPatient: function (patient) {
        return db.query(sqlMapping.businessPeople.insertPatient, patient)
    },
    findShiftPeriodById: function (hospitalId, periodId) {
        return db.query(sqlMapping.businessPeople.findShiftPeriodById, [hospitalId, periodId]);
    },
    findRegistrationByUid: function (uid, mobile, page) {
        if (mobile !== undefined) return db.query(sqlMapping.businessPeople.findRegistrationsByUidAndMobile, [uid, mobile, page.from, page.size]);
        return db.query(sqlMapping.businessPeople.findRegistrationsByUid, [uid, page.from, page.size]);
    },
    findBusinessPeople: function (hospitalId, name) {
        var sql = sqlMapping.employee.findByRole;
        if (name) {
            sql = sql + ' and name like \'%' + name + '%\'';
        }
        return db.query(sql, 4);
    },
    findNoPlanBusinessPeople: function (hospitalId, year) {
        return db.query(sqlMapping.employee.findNoPlanBusinessPeople, [hospitalId, year]);
    },
    findShiftPeriods: function (hospitalId) {
        return db.query(sqlMapping.businessPeople.findShiftPeriods, hospitalId);
    },
    findAvailableShiftPeriods: function (hospitalId, doctorId, day) {
        return db.query(sqlMapping.businessPeople.findAvailableShiftPeriods, [hospitalId, doctorId, day]);
    },
    addShiftPeriod: function (period) {
        return db.query(sqlMapping.businessPeople.addShiftPeriod, period);
    },
    deleteShiftPeriod: function (id) {
        return db.query(sqlMapping.businessPeople.deleteShiftPeriod, id);
    },
    updateShiftPeriod: function (name, periodId) {
        return db.query(sqlMapping.businessPeople.updateShiftPeriod, [name, periodId]);
    },
    transferContact: function (toBusinessPeopleId, contacts) {
        return db.query(sqlMapping.businessPeople.transferContact + '(' + contacts + ')', [toBusinessPeopleId, contacts]);
    },

    addTransferHistory: function (history) {
        return db.query(sqlMapping.businessPeople.addTransferHistory, history);
    },
    updatePatientBasicInfo: function (patientBasicInfo) {
        return db.query(sqlMapping.businessPeople.updatePatientBasicInfo, [patientBasicInfo, patientBasicInfo.id])
    }
}