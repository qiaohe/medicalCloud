"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insertMedicalHistory: function (medicalHistory) {
        return db.query(sqlMapping.medical.insertMedicalHistory, medicalHistory);
    },

    updateMedicalHistory: function (medicalHistory) {
        return db.query(sqlMapping.medical.updateMedicalHistory, [medicalHistory, medicalHistory.id]);
    },

    findMedicalHistoryBy: function (rid) {
        return db.query(sqlMapping.medical.findMedicalHistoryBy, rid);
    },

    findMedicalHistoryByPatientId: function (patientId, page) {
        return db.query(sqlMapping.medical.findMedicalHistoryByPatientId, [patientId, page.from, page.size]);
    },

    findRecipesByOrderNo: function (orderNo) {
        return db.query(sqlMapping.medical.findRecipesByOrderNo, orderNo);
    },
    findPrescriptionsByOrderNo: function (orderNo) {
        return db.query(sqlMapping.medical.findPrescriptionsByOrderNo, orderNo);
    },
    insertRecipe: function (recipe) {
        return db.query(sqlMapping.medical.insertRecipe, recipe);
    },
    insertPrescription: function (prescription) {
        return db.query(sqlMapping.medical.insertPrescription, prescription);
    },
    findPrescriptionsBy: function (rid) {
        return db.query(sqlMapping.medical.findPrescriptionsBy, rid);
    },
    findRecipesBy: function (rid) {
        return db.query(sqlMapping.medical.findRecipesBy, rid);
    },
    findDrugInventoryByDrugId: function (drugId, expireDate, quantity) {
        return db.query(sqlMapping.medical.findDrugInventoryByDrugId, [drugId, expireDate, quantity]);
    }
}