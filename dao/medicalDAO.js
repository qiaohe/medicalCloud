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
    insertRecipe: function(recipe){
        return db.query(sqlMapping.medical.insertRecipe, recipe);
    },
    insertPrescription: function(prescription){
        return db.query(sqlMapping.medical.insertPrescription, prescription);
    },
}