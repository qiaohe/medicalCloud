"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insertDisease: function (diseaseDic) {
        return db.query(sqlMapping.dict.insertDisease, diseaseDic);
    },

    findDiseasesOfDepartment: function (id) {
        return db.query(sqlMapping.dict.findDiseasesOfDepartment, id);
    },

    deleteDisease: function (id) {
        return db.query(sqlMapping.dict.deleteDisease, id);
    },
    findDiseases: function (hospitalId, conditions, page) {
        var sql = sqlMapping.dict.findDiseases;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' order by d.createDate desc limit ?,?';
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },
    updateDisease: function (diseaseDic) {
        return db.query(sqlMapping.dict.updateDisease, [diseaseDic, diseaseDic.id]);
    },
    findDiseaseDicWords: function (id, type) {
        return db.query(sqlMapping.dict.findDiseaseDicWords, [id, type]);
    },
    insertDiseaseWord: function (word) {
        return db.query(sqlMapping.dict.insertDiseaseWord, word);
    },
    updateDiseaseWord: function (word) {
        return db.query(sqlMapping.dict.updateDiseaseWord, [word, word.id]);
    },
    deleteDiseaseWord: function (id) {
        return db.query(sqlMapping.dict.deleteDiseaseWord, id);
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
    findMedicalTemplates: function (hospitalId, conditions, page) {
        var sql = sqlMapping.dict.findMedicalTemplates;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' order by m.id desc limit ?,?';
        return db.queryWithCount(sql, [+hospitalId, page.from, page.size]);
    },
    getMedicalTemplateBy: function (hospitalId, departmentId) {
        return db.query(sqlMapping.dict.getMedicalTemplateBy, [+hospitalId, departmentId]);
    },
    findMedicalTemplateById: function (id) {
        return db.query(sqlMapping.dict.findMedicalTemplateById, id);
    },
    insertMedicalTemplate: function (template) {
        return db.query(sqlMapping.dict.insertMedicalTemplte, template);
    },
    deleteMedicalTemplate: function (id) {
        return db.query(sqlMapping.dict.deleteMedicalTemplate, id);
    },
    updateMedicalTemplate: function (template) {
        return db.query(sqlMapping.dict.updateMedicalTemplate, [template, template.id]);
    },
    insertChargeItem: function (item) {
        return db.query(sqlMapping.dict.insertChargeItem, item);
    },
    deleteChargeItem: function (id) {
        return db.query(sqlMapping.dict.deleteChargeItem, id);
    },
    findChargeItemById: function (id) {
        return db.query(sqlMapping.dict.findChargeItemById, id);
    },
    updateChargeItem: function (item) {
        return db.query(sqlMapping.dict.updateChargeItem, [item, item.id]);
    },
    findChargeItems: function (hospitalId, conditions, page) {
        var sql = sqlMapping.dict.findChargeItems;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' LIMIT ?, ?';
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },
    findDrugs: function (hospitalId, conditions, page) {
        var sql = conditions.length ? 'select SQL_CALC_FOUND_ROWS * from Drug where hospitalId=? and ' + conditions.join(' and ') + ' order by id desc LIMIT ?, ?' : sqlMapping.dict.findDrugs;
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },
    findDrugsNoPagination: function (hospitalId) {
        return db.query('SELECT code,name, pinyin, company, type, dosageForm, specification, unit, sellPrice, criticalInventory from Drug where hospitalId=?', hospitalId);
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
    },

    findDrugInventoriesByDrug: function (drugId, hospitalId, conditions, page) {
        var sql = conditions.length ? 'select SQL_CALC_FOUND_ROWS dg.sellPrice, h.*, d.batchNo, d.restAmount from DrugInventoryHistory h left JOIN DrugInventory d on h.inventoryId = d.id left join Drug dg on dg.id = h.drugId where h.drugId=? and h.hospitalId=?  and ' + conditions.join(' and ') + ' limit ?,?' : sqlMapping.dict.findDrugInventoriesByDrug;
        return db.queryWithCount(sql, [drugId, hospitalId, page.from, page.size]);
    },

    findDrugInventory: function (hospitalId, conditions, page) {
        var sql = conditions.length ? 'select SQL_CALC_FOUND_ROWS DISTINCT d.id,d.name,d.company, d.sellPrice, d.code, d.type, d.dosageForm, d.specification, d.unit, d.tinyUnit, d.factor, d.sellPrice, d.criticalInventory, d.inventory from Drug d JOIN DrugInventory di ON di.drugId=d.id where di.hospitalId = ? and ' + conditions.join(' and ') + ' limit ?,?' : sqlMapping.dict.findDrugInventory;
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },

    findDrugInventories: function (hospitalId, conditions, page) {
        var sql = conditions.length ? 'select SQL_CALC_FOUND_ROWS di.id,d.type,di.operatorName,di.createDate, di.drugId, di.restAmount, di.amount, batchNo, expireDate, purchasePrice, d.`code`, d.`name`, d.company, d.criticalInventory, d.dosageForm,d.factor, d.inventory, d.sellPrice, d.unit, d.tinyUnit, d.specification from DrugInventory di left join Drug d on di.drugId =d.id where d.hospitalId=?  and ' + conditions.join(' and ') + ' order by di.createDate desc limit ?,?' : sqlMapping.dict.findDrugInventories;
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },

    findDrugInventoriesNoPagination: function (hospitalId) {
        return db.query(sqlMapping.dict.findDrugInventoriesNoPagination, hospitalId);
    },
    insertDrugInventory: function (item) {
        return db.query(sqlMapping.dict.insertDrugInventory, item);
    },

    findDrugInventoryHistories: function (type, hospitalId, conditions, page) {
        var sql = conditions.length ? 'select SQL_CALC_FOUND_ROWS d.company, d.dosageForm,d.code, d.specification,d.`name`,d.tinyUnit, d.unit, d.type, h.id, h.amount, h.`comment`, h.drugId, h.operateDate, h.operator, h.operatorName, di.batchNo, di.expireDate, di.purchasePrice, di.restAmount,d.sellPrice from DrugInventoryHistory h left JOIN DrugInventory di on di.id =h.inventoryId left JOIN Drug d on d.id=h.drugId where h.type = ? and h.hospitalId=?  and ' + conditions.join(' and ') + ' order by h.operateDate desc limit ?,?' : sqlMapping.dict.findDrugInventoryHistories;
        return db.queryWithCount(sql, [type, hospitalId, page.from, page.size]);
    },

    insertDrugInventoryHistory: function (history) {
        return db.query(sqlMapping.dict.insertDrugInventoryHistory, history);
    },

    findDrugInventoryBy: function (hospitalId, drugId, batchNo) {
        return db.query(sqlMapping.dict.findDrugInventoryBy, [+hospitalId, +drugId, batchNo]);
    },
    updateDrugInventory: function (item) {
        return db.query(sqlMapping.dict.updateDrugInventory, [item, item.id]);
    },

    updateDrugInventoryBy: function (id, amount) {
        return db.query(sqlMapping.dict.updateDrugInventoryBy, [amount, id]);
    },

    updateDrugRestInventory: function (id, amount) {
        return db.query(sqlMapping.dict.updateDrugRestInventory, [+amount, id]);
    },
    deleteDrugInventory: function (id) {
        return db.query(sqlMapping.dict.deleteDrugInventory, id);
    },

    findDrugInventoryHistoryByType: function (hospitalId, type) {
        return db.query(sqlMapping.dict.findDrugInventoryHistoryByType, [hospitalId, type]);
    },

    findDrugsBy: function (hospitalId, condition) {
        var sql = sqlMapping.dict.findDrugsBy;
        if (condition.code) {
            sql = sql + ' code like \'%' + condition.code + '%\'';
        } else if (condition.name) {
            var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
            sql = sql + (reg.test(condition.name) ? 'name' : 'pinyin') + ' like \'%' + condition.name + '%\'';
        }
        return db.query(sql + ' limit 0 , 20', hospitalId);
    },
    findDrugsByCode: function (hospitalId, code) {
        return db.query('select * from Drug where hospitalId=? and code=?', [hospitalId, code]);
    },
    findMedicalTemplatesBy: function (hospitalId, name) {
        return db.query(sqlMapping.dict.findMedicalTemplatesBy, [hospitalId, name]);
    },
    findChargeItemsBy: function (hospitalId, condition) {
        var sql = sqlMapping.dict.findChargeItemsBy;
        if (condition.code) {
            if (condition.wholeWordsOnly) {
                sql = sql + ' code = \'' + condition.code + '\'';
            }
            else {
                sql = sql + ' code like \'%' + condition.code + '%\'';
            }
        }
        else if (condition.name) {
            if (condition.wholeWordsOnly) {
                sql = sql + ' name = \'' + condition.name + '\'';
            } else {
                sql = sql + ' name like \'%' + condition.name + '%\'';
            }
        }
        return db.query(sql, hospitalId);
    },
    insertDrugByBatch: function (drugs) {
        return db.query(sqlMapping.dict.insertDrugByBatch, [drugs]);
    },
    findDrugCategoryByPidAndName: function (hospitalId, pid, name, type) {
        return db.query(sqlMapping.dict.findDrugCategoryByPidAndName, [hospitalId, pid, name, type]);
    },
    insertDrugCategory: function (category) {
        return db.query(sqlMapping.dict.insertDrugCategory, category);
    },
    updateDrugCategory: function (category) {
        return db.query(sqlMapping.dict.updateDrugCategory, [category, category.id]);
    },
    deleteDrugCategory: function (id) {
        return db.query(sqlMapping.dict.deleteDrugCategory, id);
    },
    findDrugCategories: function (hospitalId, type) {
        return db.query(sqlMapping.dict.findDrugCategories, [hospitalId, type]);
    },
    findDrugCategoriesById: function (hospitalId, id, type) {
        return db.query(sqlMapping.dict.findDrugCategoriesById, [hospitalId, type, id]);
    },
    addOutpatientServiceType: function (type) {
        return db.query(sqlMapping.dict.addOutpatientServiceType, type);
    },
    deleteOutpatientServiceType: function (id) {
        return db.query(sqlMapping.dict.deleteOutpatientServiceType, id);
    },
    updateOutpatientServiceType: function (type) {
        return db.query(sqlMapping.dict.updateOutpatientServiceType, [type, type.id]);
    },
    findOutpatientServiceTypes: function (hospitalId) {
        return db.query(sqlMapping.dict.findOutpatientServiceTypes, hospitalId);
    },
    findOutPatientTypeById: function (id) {
        return db.query(sqlMapping.dict.findOutPatientTypeById, [id]);
    },
    findAuthorities: function (id) {
        return db.query(sqlMapping.dict.findAuthorities, id);
    },

    findAllAuthorities: function () {
        return db.query(sqlMapping.dict.findAllAuthorities);
    },
    addAuthority: function (authority) {
        return db.query(sqlMapping.dict.addAuthority, authority);
    },
    updateAuthority: function (authority) {
        return db.query(sqlMapping.dict.updateAuthority, [authority, authority.id]);
    },
    deleteAuthority: function (id) {
        return db.query(sqlMapping.dict.deleteAuthority, id);
    },
    findAuthoritiesOfJobTitle: function(jobTitleId, authorityValue){
        var sql =sqlMapping.dict.findAuthoritiesOfJobTitle;
        if (authorityValue) {
            sql = sql  + ' and authorityValue = ' + authorityValue;
        }
        return db.query(sql, [jobTitleId]);
    },
    findMyJobTitleAuthorities: function(employeeId) {
        return db.query(sqlMapping.dict.findMyJobTitleAuthorities, employeeId);

    }
}
