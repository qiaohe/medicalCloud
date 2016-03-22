"use strict";
var config = require('../config');
var _ = require('lodash');
var hospitalDAO = require('../dao/hospitalDAO');
var dictionaryDAO = require('../dao/dictionaryDAO');
var Promise = require('bluebird');
var businessPeopleDAO = require('../dao/businessPeopleDAO');
var redis = require('../common/redisClient');
var i18n = require('../i18n/localeMessage');
module.exports = {
    getDepartments: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        hospitalDAO.findDepartments(hospitalId).then(function (departments) {
            res.send({ret: 0, data: departments});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDoctors: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        hospitalDAO.findDoctors(hospitalId).then(function (doctors) {
            res.send({ret: 0, data: doctors});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getBusinessPeople: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var name = req.query.name;
        businessPeopleDAO.findBusinessPeople(hospitalId, name).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getNoPlanBusinessPeople: function (req, res, next) {
        var year = req.params.year;
        var hospitalId = req.user.hospitalId;
        businessPeopleDAO.findNoPlanBusinessPeople(hospitalId, year).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getShiftPeriods: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        businessPeopleDAO.findShiftPeriods(hospitalId).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getAvailablePeriods: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var doctorId = req.params.doctorId;
        var day = req.query.day;
        businessPeopleDAO.findAvailableShiftPeriods(hospitalId, doctorId, day).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    addShiftPeriod: function (req, res, next) {
        var period = req.body;
        period.hospitalId = req.user.hospitalId;
        period.enabled = true;
        businessPeopleDAO.addShiftPeriod(period).then(function (result) {
            return businessPeopleDAO.findShiftPeriods(period.hospitalId);
        }).then(function (shiftPeriods) {
            Promise.map(shiftPeriods, function (period, index) {
                redis.setAsync('h:' + req.user.hospitalId + ':p:' + period.id, String.fromCharCode(65 + index))
            }).then(function (result) {
                res.send({ret: 0, data: {id: result.insertId, name: period.name}});
            })
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    removeShiftPeriod: function (req, res, next) {
        businessPeopleDAO.deleteShiftPeriod(req.params.id).then(function (result) {
            return businessPeopleDAO.findShiftPeriods(req.user.hospitalId);
        }).then(function (shiftPeriods) {
            Promise.map(shiftPeriods, function (period, index) {
                redis.setAsync('h:' + req.user.hospitalId + ':p:' + period.id, String.fromCharCode(65 + index))
            }).then(function (result) {
                res.send({ret: 0, message: i18n.get('shiftPeriod.remove.success')});
            })
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    editShiftPeriod: function (req, res, next) {
        businessPeopleDAO.updateShiftPeriod(req.body.name, req.body.id).then(function (result) {
            res.send({ret: 0, message: i18n.get('shiftPeriod.update.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getRegistrationFee: function (req, res, next) {
        hospitalDAO.findDoctorById(req.params.doctorId).then(function (doctors) {
            return res.send({ret: 0, data: {id: doctors[0].id, registrationFee: doctors[0].registrationFee}});
        });
        return next();
    },

    getJobTitles: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        hospitalDAO.findJobTitles(hospitalId).then(function (jobs) {
            res.send({ret: 0, data: jobs});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getProvinces: function (req, res, next) {
        hospitalDAO.findProvinces().then(function (provinces) {
            res.send({ret: 0, data: provinces});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getCities: function (req, res, next) {
        hospitalDAO.findCities(req.params.province).then(function (cities) {
            res.send({ret: 0, data: cities});
        });
        return next();
    },
    getRoles: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        hospitalDAO.findRoles(hospitalId).then(function (roles) {
            res.send({ret: 0, data: roles});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    addRole: function (req, res, next) {
        req.body.hospitalId = req.user.hospitalId;
        hospitalDAO.insertRole(req.body).then(function (result) {
            req.body.id = result.insertId;
            res.send(req.body);
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    removeRole: function (req, res, next) {
        hospitalDAO.deleteRole(req.params.id).then(function () {
            res.send({ret: 0, message: i18n.get('role.remove.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getJobTitlesByRole: function (req, res, next) {
        hospitalDAO.findJobTitleByRole(req.user.hospitalId, req.params.roleId).then(function (jobTitles) {
            res.send({ret: 0, data: jobTitles});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    addJobTitlesByRole: function (req, res, next) {
        req.body.hospitalId = req.user.hospitalId;
        req.body.role = req.params.roleId;
        hospitalDAO.insertJobTitle(req.body).then(function (result) {
            req.body.id = result.insertId;
            res.send(req.body);
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    removeJobTitlesByRole: function (req, res, next) {
        hospitalDAO.deleteJobTitle(req.params.roleId, req.params.id).then(function () {
            res.send({ret: 0, message: i18n.get('jobTitle.remove.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    editJobTitlesByRole: function (req, res, next) {
        hospitalDAO.updateJobTitle(req.body).then(function () {
            res.send({ret: 0, message: i18n.get('update.jobTitle.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    editRole: function (req, res, next) {
        hospitalDAO.updateRole(req.body).then(function () {
            res.send({ret: 0, message: i18n.get('update.role.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getMyMenus: function (req, res, next) {
        hospitalDAO.findMyMenus(req.user.id).then(function (menus) {
            var result = [];
            menus.length && menus.forEach(function (menu) {
                var item = _.findWhere(result, {id: menu.pid});
                if (item) {
                    item.subItems.push({
                        id: menu.id,
                        name: menu.name,
                        routeUri: menu.routeUri,
                        icon: menu.icon,
                        subItems: []
                    });
                } else {
                    result.push({id: menu.id, name: menu.name, routeUri: menu.routeUri, icon: menu.icon, subItems: []});
                }
            });
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, data: err.message})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getMenus: function (req, res, next) {
        hospitalDAO.findMenus().then(function (menus) {
            res.send({ret: 0, data: menus});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getMenusOfJobTitle: function (req, res, next) {
        var jobTitleId = req.params.id;
        hospitalDAO.findMenusByJobTitle(jobTitleId).then(function (result) {
            res.send({ret: 0, data: result});
        });
        return next();
    },
    postMenusOfJobTitle: function (req, res, next) {
        var jobTitleId = req.params.id;
        hospitalDAO.findJobTitleMenuItem(jobTitleId, req.params.menuItemId).then(function (items) {
            return items.length ? hospitalDAO.deleteMenuByJobTitle(jobTitleId, req.params.menuItemId) : hospitalDAO.insertMenuItem({
                jobTitleId: jobTitleId,
                menuItem: req.params.menuItemId
            });
        }).then(function (result) {
            res.send({ret: 0, message: '设置权限成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDiseaseDic: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var hospitalId = req.user.hospitalId;
        var conditions = [];
        if (req.query.name) conditions.push('d.name like \'%' + req.query.name + '%\'');
        if (req.query.departmentId) conditions.push('departmentId=' + req.query.departmentId);
        dictionaryDAO.findDiseases(hospitalId, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (diseases) {
            diseases.pageIndex = pageIndex;
            res.send({ret: 0, data: diseases});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    addDiseaseDic: function (req, res, next) {
        var diseaseDic = req.body;
        diseaseDic.creator = req.user.id;
        diseaseDic.hospitalId = req.user.hospitalId;
        diseaseDic.createDate = new Date();
        dictionaryDAO.insertDisease(diseaseDic).then(function (result) {
            diseaseDic.id = result.insertId;
            res.send({ret: 0, data: diseaseDic});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    removeDiseaseDic: function (req, res, next) {
        dictionaryDAO.deleteDisease(req.params.id).then(function (result) {
            res.send({ret: 0, message: '删除成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    updateDiseaseDic: function (req, res, next) {
        req.body.hospitalId = req.user.hospitalId;
        delete req.body.createDate;
        dictionaryDAO.updateDisease(req.body).then(function (result) {
            res.send({ret: 0, message: '更新成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    addDicItem: function (req, res, next) {
        var item = req.body;
        item.hospitalId = req.user.hospitalId;
        dictionaryDAO.insertDictItem(item).then(function (result) {
            item.id = result.insertId;
            res.send({ret: 0, data: item});
        });
        return next();
    },
    removeDictItem: function (req, res, next) {
        dictionaryDAO.deleteDictItem(req.params.id).then(function (result) {
            res.send({ret: 0, message: '删除成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    updateDictItem: function (req, res, next) {
        req.body.hospitalId = req.user.hospitalId;
        dictionaryDAO.updateDictItem(req.body).then(function (result) {
            res.send({ret: 0, message: '更新成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDictItems: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var hospitalId = req.user.hospitalId;
        dictionaryDAO.findDictItems(hospitalId, req.params.type, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (items) {
            items.pageIndex = pageIndex;
            res.send({ret: 0, data: items});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getMedicalTemplate: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var hospitalId = req.user.hospitalId;
        var conditions = [];
        if (req.query.name) conditions.push('dic.`name` like \'%' + req.query.name + '%\'');
        if (req.query.departmentId) conditions.push('m.departmentId=' + req.query.departmentId);
        dictionaryDAO.findMedicalTemplates(hospitalId, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (templates) {
            templates.pageIndex = pageIndex;
            res.send({ret: 0, data: templates});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getMedicalTemplateBy: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        dictionaryDAO.getMedicalTemplateBy(hospitalId, req.params.id).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    addMedicalTemplate: function (req, res, next) {
        var template = req.body;
        template.hospitalId = req.user.hospitalId;
        template.createDate = new Date();
        template.doctorId = req.user.id;
        dictionaryDAO.insertMedicalTemplate(template).then(function (result) {
            template.id = result.insertId;
            res.send({ret: 0, data: template});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    removeMedicalTemplate: function (req, res, next) {
        dictionaryDAO.deleteMedicalTemplate(req.params.id).then(function (result) {
            res.send({ret: 0, message: '删除成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getMedicalTemplateById: function (req, res, next) {
        dictionaryDAO.findMedicalTemplateById(req.params.id).then(function (result) {
            res.send({ret: 0, data: result[0]});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    updateMedicalTemplate: function (req, res, next) {
        req.body.hospitalId = req.user.hospitalId;
        delete req.body.createDate;
        delete req.body.departmentName;
        dictionaryDAO.updateMedicalTemplate(req.body).then(function (result) {
            res.send({ret: 0, message: '更新成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    addChargeItem: function (req, res, next) {
        var item = req.body;
        item.hospitalId = req.user.hospitalId;
        dictionaryDAO.insertChargeItem(item).then(function (result) {
            item.id = result.insertId;
            res.send({ret: 0, data: item});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    removeChargeItem: function (req, res, next) {
        dictionaryDAO.deleteChargeItem(req.params.id).then(function (result) {
            res.send({ret: 0, message: '删除成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    updateChargeItem: function (req, res, next) {
        req.body.hospitalId = req.user.hospitalId;
        delete req.body.categoryName;
        dictionaryDAO.updateChargeItem(req.body).then(function (result) {
            res.send({ret: 0, message: '更新成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getChargeItems: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var hospitalId = req.user.hospitalId;
        var conditions = [];
        if (req.query.name) conditions.push('name like \'%' + req.query.name + '%\'');
        if (req.query.categoryId) conditions.push('categoryId=' + req.query.categoryId);
        dictionaryDAO.findChargeItems(hospitalId, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (items) {
            items.pageIndex = pageIndex;
            res.send({ret: 0, data: items});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDrugs: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var hospitalId = req.user.hospitalId;
        var conditions = [];
        if (req.query.code) conditions.push('code like \'%' + req.query.code + '%\'');
        if (req.query.type) conditions.push('type=\'' + req.query.type + '\'');
        if (req.query.name) conditions.push('name like \'%' + req.query.name + '%\'');
        dictionaryDAO.findDrugs(hospitalId, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (items) {
            items.pageIndex = pageIndex;
            res.send({ret: 0, data: items});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    addDrug: function (req, res, next) {
        var item = req.body;
        item.hospitalId = req.user.hospitalId;
        dictionaryDAO.insertDrug(item).then(function (result) {
            item.id = result.insertId;
            res.send({ret: 0, data: item});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    removeDrug: function (req, res, next) {
        dictionaryDAO.deleteDrug(req.params.id).then(function (result) {
            res.send({ret: 0, message: '删除成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    updateDrug: function (req, res, next) {
        req.body.hospitalId = req.user.hospitalId;
        dictionaryDAO.updateDrug(req.body).then(function (result) {
            res.send({ret: 0, message: '更新成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getDrugById: function (req, res, next) {
        dictionaryDAO.findDrugById(req.params.id).then(function (drugs) {
            res.send({ret: 0, data: drugs[0]});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDrugInventory: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var hospitalId = req.user.hospitalId;
        var conditions = [];
        if (req.query.code) conditions.push('code like \'%' + req.query.code + '%\'');
        if (req.query.type) conditions.push('type=\'' + req.query.type + '\'');
        if (req.query.name) conditions.push('name like \'%' + req.query.name + '%\'');
        if (req.query.startDate) conditions.push('putOutDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('putOutDate<=\'' + req.query.endDate + ' 23:59:59\'');
        dictionaryDAO.findDrugInventory(hospitalId, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (items) {
            res.send({ret: 0, data: items});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    addDrugInventory: function (req, res, next) {
        var item = req.body;
        item.hospitalId = req.user.hospitalId;
        item.putInDate = new Date();
        item.putIn = req.user.id;
        item.putInName = req.user.name;
        item.createDate = new Date();
        dictionaryDAO.findDrugInventoryBy(item.hospitalId, item.drugId, item.batchNo).then(function (result) {
            if (result.length) {
                result[0].amount = item.amount + result[0].amount;
                result[0].restAmount = item.restAmount + result[0].restAmount;
                dictionaryDAO.updateDrugInventory(item).then(function (rs) {
                    res.send({ret: 0, data: result[0]});
                });
            } else {
                item.restAmount = item.amount;
                dictionaryDAO.insertDrugInventory(item).then(function (result) {
                    item.id = result.insertId;
                    res.send({ret: 0, data: item});
                })
            }
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
    },

    updateDrugInventory: function (req, res, next) {
        var item = req.body;
        item.hospitalId = req.user.hospitalId;
        item.putOut = req.user.id;
        item.putOutDate = new Date();
        item.putOutName = req.user.name;
        dictionaryDAO.updateDrugInventory(item).then(function (result) {
            res.send({ret: 0, message: '出库更新成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
    },
    removeDrugInventory: function (req, res, next) {
        dictionaryDAO.deleteDrugInventory(req.params.id).then(function (result) {
            res.send({ret: 0, message: '删除成功'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDrugsBy: function (req, res, next) {
        var name = req.query.name;
        var code = req.query.code;
        dictionaryDAO.findDrugsBy(req.user.hospitalId, {name: name, code: code}).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getChargeItemsBy: function (req, res, next) {
        var name = req.query.name;
        var code = req.query.code;
        dictionaryDAO.findChargeItemsBy(req.user.hospitalId, {name: name, code: code}).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }
}