"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
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
    findPatientBasicInfoByPatientId: function (id) {
        return db.query(sqlMapping.businessPeople.findPatientBasicInfoByPatientId, id);
    },
    findPatientBy: function (hospitalId, basicInfoId) {
        return db.query(sqlMapping.businessPeople.findPatientBy, [hospitalId, basicInfoId]);
    },
    insertPatientBasicInfo: function (patientBasicInfo) {
        return db.query(sqlMapping.businessPeople.insertPatientBasicInfo, patientBasicInfo)
    },
    findPatientByBasicInfoId: function (patientBasicInfoId, hospitalId) {
        return db.query(sqlMapping.businessPeople.findPatientByBasicInfoId, [patientBasicInfoId, hospitalId])
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

    addTransferHistory: function (history) {
        return db.query(sqlMapping.businessPeople.addTransferHistory, history);
    },
    updatePatientBasicInfo: function (patientBasicInfo) {
        return db.query(sqlMapping.businessPeople.updatePatientBasicInfo, [patientBasicInfo, patientBasicInfo.id])
    },
    findSalesMan: function (hospitalId, page, conditions) {
        var sql = sqlMapping.businessPeople.findSalesMan;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' order by createDate limit ' + page.from + ',' + page.size;
        return db.queryWithCount(sql, hospitalId);
    },
    findCheckIn: function (hospitalId, page, conditions) {
        var sql = sqlMapping.businessPeople.findCheckIn;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' order by date desc limit ' + page.from + ',' + page.size;
        return db.queryWithCount(sql, hospitalId);
    },
    insertSalesMan: function (saleman) {
        return db.query(sqlMapping.businessPeople.insertSalesMan, saleman);
    },

    deleteSalesMan: function (salesManId) {
        return db.query(sqlMapping.businessPeople.deleteSalesMan, salesManId);
    },
    updateSalesMan: function (salesMan) {
        return db.query(sqlMapping.businessPeople.updateSalesMan, [salesMan, salesMan.id]);
    },
    findSalesManBy: function (hospitalId, mobile) {
        return db.query(sqlMapping.businessPeople.findSalesManBy, [hospitalId, mobile]);
    },
    findSalesManName: function (hospitalId) {
        return db.query(sqlMapping.businessPeople.findSalesManName, hospitalId);
    },
    findSalesManPerformance: function (salesManId, year) {
        return db.query(sqlMapping.businessPeople.findSalesManPerformance, [salesManId, year]);
    },
    findSalesManPerformanceBy: function (saleman, yearMonth) {
        return db.query(sqlMapping.businessPeople.findSalesManPerformanceBy, [saleman, yearMonth]);
    },
    insertSalesManPerformance: function (performance) {
        return db.query(sqlMapping.businessPeople.insertSalesManPerformanceBy, performance);
    },
    updateSalesManPerformance: function (performance) {
        return db.query(sqlMapping.businessPeople.updateSalesManPerformance, [performance, performance.id]);
    },
    findSalesManById: function (salesManId) {
        return db.query(sqlMapping.businessPeople.findSalesManById, salesManId);
    },
    findSalesManRegistrationForOthers: function (hospitalId, page, conditions) {
        var sql = sqlMapping.businessPeople.findSalesManRegistrationForOthers;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' order by createDate limit ' + page.from + ',' + page.size;
        return db.queryWithCount(sql, hospitalId);
    },

    sumSalesManRegistrationForOthers: function (hospitalId, conditions) {
        var sql = sqlMapping.businessPeople.sumSalesManRegistrationForOthers;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        return db.query(sql, hospitalId);
    },

    findPerformances: function (hospitalId, page, conditions) {
        var sql = sqlMapping.businessPeople.findPerformances;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' order by e.id limit ' + page.from + ',' + page.size;
        return db.queryWithCount(sql, hospitalId);
    },

    sumActualPerformance: function (hospitalId, conditions) {
        var sql = sqlMapping.businessPeople.sumActualPerformance;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        return db.query(sql, hospitalId);
    }
}