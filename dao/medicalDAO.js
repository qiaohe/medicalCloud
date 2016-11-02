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
        return db.queryWithCount(sqlMapping.medical.findMedicalHistoryByPatientId, [patientId, page.from, page.size]);
    },
    findPrescription: function (id) {
        return db.query(sqlMapping.medical.findPrescription, id);
    },

    findRecipesByOrderNo: function (orderNo) {
        return db.query(sqlMapping.medical.findRecipesByOrderNo, orderNo);
    },
    removeRecipe: function (rid, recipeId) {
        return db.query(sqlMapping.medical.removeRecipe, [rid, recipeId]);
    },
    findRecipe: function (recipeId) {
        return db.query(sqlMapping.medical.findRecipe, recipeId);
    },
    updateRecipe: function (recipe) {
        return db.query(sqlMapping.medical.updateRecipe, [recipe, recipe.id]);
    },
    updatePrescription: function (prescription) {
        return db.query(sqlMapping.medical.updatePrescription, [prescription, prescription.id]);
    },

    removePrescription: function (rid, prescriptionId) {
        return db.query(sqlMapping.medical.removePrescription, [prescriptionId, rid]);
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
    },
    addOutsideProcess: function (p) {
        return db.query(sqlMapping.medical.addOutsideProcess, p);
    },
    updateOutsideProcess: function (p) {
        return db.query(sqlMapping.medical.updateOutsideProcess, [p, p.id]);
    },
    deleteOutsideProcess: function (id) {
        return db.query(sqlMapping.medical.deleteOutsideProcess, id);
    },
    findOutsideProcesses: function (hospitalId, conditions, page) {
        var sql = sqlMapping.medical.findOutsideProcesses;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' order by o.createDate desc limit ?,?'
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    }
}