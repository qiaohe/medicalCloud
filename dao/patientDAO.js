"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    findGroupCompanies: function (hospitalId, page, conditions) {
        var sql = sqlMapping.patient.findGroupCompanies;
        sql = !conditions.length ? sql : 'select SQL_CALC_FOUND_ROWS gc.*, e.`name` as recommenderName from GroupCompany gc left JOIN Employee e on e.id = gc.recommender where gc.hospitalId=? and ' + conditions.join(' and ') + ' order by gc.id desc limit ?, ?';
        return db.queryWithCount(sql, [+hospitalId, +page.from, +page.size]);
    },
    insertGroupCompany: function (groupCompany) {
        return db.query(sqlMapping.patient.insertGroupCompany, groupCompany);
    },
    deleteGroupCompany: function (id) {
        return db.query(sqlMapping.patient.deleteGroupCompany, id);
    },
    updateGroupCompany: function (groupCompany) {
        return db.query(sqlMapping.patient.updateGroupCompany, [groupCompany, groupCompany.id]);
    },
    findPatients: function (hospitalId, page, conditions) {
        var sql = sqlMapping.patient.findPatients;
        sql = !conditions.length ? sql : 'select SQL_CALC_FOUND_ROWS p.id, pb.`name`, pb.gender, pb.headPic,pb.birthday, pb.mobile, p.memberCardNo,p.memberType,p.source,e.`name` as recommenderName,p.consumptionLevel, gc.`name` as groupName, p.groupId from Patient p left JOIN Employee e on e.id = p.recommender left JOIN GroupCompany gc on gc.id = p.groupId, PatientBasicInfo pb where p.patientBasicInfoId = pb.id and p.hospitalId =? and ' + conditions.join(' and ') + ' order BY p.createDate desc limit ?, ?';
        return db.queryWithCount(sql, [+hospitalId, +page.from, +page.size]);
    },
    insertPrePaidHistory: function (history) {
        return db.query(sqlMapping.patient.insertPrePaidHistory, history);
    },
    updatePatientBalance: function (patientId, amount) {
        return db.query(sqlMapping.patient.updatePatientBalance, [+amount, +patientId]);
    },
    insertTransactionFlow: function (flow) {
        return db.query(sqlMapping.patient.insertTransactionFlow, flow);
    },
    findByPatientId: function (id) {
        return db.query(sqlMapping.patient.findByPatientId, id);
    },

    findPatientBasicInfoById: function (id) {
        return db.query(sqlMapping.patient.findPatientBasicInfoById, id);
    },

    findByPatientBasicInfo: function (patientId, hospitalId) {
        return db.query(sqlMapping.patient.findByPatientBasicInfo, [patientId, hospitalId]);
    },
    findTransactionFlows: function (patientId, hospitalId) {
        return db.query(sqlMapping.patient.findTransactionFlows, [patientId, hospitalId]);
    },

    findRegistrations: function (patientId, hospitalId) {
        return db.query(sqlMapping.patient.findRegistrations, [patientId, hospitalId]);
    },
    findGroupCompanyById: function (id) {
        return db.query(sqlMapping.patient.findGroupCompanyById, id);
    },
    updatePatient: function (patient) {
        return db.query(sqlMapping.patient.updatePatient, [patient, patient.id]);
    }
}