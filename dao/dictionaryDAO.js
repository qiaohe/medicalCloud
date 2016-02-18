"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insertDisease: function (diseaseDic) {
        return db.query(sqlMapping.dict.insertDisease, diseaseDic);
    },
    deleteDisease: function (id) {
        return db.query(sqlMapping.dict.deleteDisease, id);
    },
    findDiseases: function (hospitalId, page) {
        return db.queryWithCount(sqlMapping.dict.findDiseases, [hospitalId, page.from, page.size]);
    },
    updateDisease: function (diseaseDic) {
        return db.query(sqlMapping.dict.updateDisease, [diseaseDic, diseaseDic.id]);
    },
    insertDictItem: function (item) {
        return db.query(sqlMapping.dict.insertDictItem, item);
    },
    updateDictItem: function (item) {
        return db.query(sqlMapping.dict.updateDictItem, [item, item.id]);
    },
    deleteDictItem: function (id) {
        return db.query(sqlMapping.dict.deleteDictItem, id);
    },
    findDictItems: function (hospitalId, type, page) {
        return db.queryWithCount(sqlMapping.dict.findDictItems, [+hospitalId, +type, page.from, page.size]);
    },
    findMedicalTemplates: function (hospitalId, page) {
        return db.queryWithCount(sqlMapping.dict.findMedicalTemplates, [+hospitalId, page.from, page.size]);
    },
    insertMedicalTemplate: function (template) {
        return db.query(sqlMapping.dict.insertMedicalTemplte, template);
    },
    deleteMedicalTemplate: function (id) {
        return db.query(sqlMapping.dict.deleteMedicalTemplate, id);
    },
    updateMedicalTemplate: function (template) {
        return db.query(sqlMapping.dict.deleteMedicalTemplate, [template, template.id]);
    },
    insertChargeItem: function (item) {
        return db.query(sqlMapping.dict.insertChargeItem, item);
    },
    deleteChargeItem: function (id) {
        return db.query(sqlMapping.dict.deleteChargeItem, id);
    },
    updateChargeItem: function (item) {
        return db.query(sqlMapping.dict.updateChargeItem, [item, item.id]);
    },
    findChargeItems: function (hospitalId, page) {
        return db.queryWithCount(sqlMapping.dict.findChargeItems, [hospitalId, page.from, page.size]);
    },
    findDrugs: function (hospitalId, page) {
        return db.queryWithCount(sqlMapping.dict.findDrugs, [hospitalId, page.from, page.size]);
    },
    deleteDrug: function (id) {
        return db.query(sqlMapping.dict.deleteDrug, id);
    },
    insertDrug: function (drug) {
        return db.query(sqlMapping.dict.insertDrug, drug);
    },
    updateDrug: function (drug) {
        return db.query(sqlMapping.dict.updateDrug, [drug, drug.id]);
    },
    findDrugById: function (id) {
        return db.query(sqlMapping.dict.findDrugById, id);
    }
}
