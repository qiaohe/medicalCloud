var config = require('../config');
var _ = require('lodash');
var hospitalDAO = require('../dao/hospitalDAO');
var dictionaryDAO = require('../dao/dictionaryDAO');
var Promise = require('bluebird');
var businessPeopleDAO = require('../dao/businessPeopleDAO');
var redis = require('../common/redisClient');
var i18n = require('../i18n/localeMessage');
var employeeDAO = require('../dao/employeeDAO');
var excel = require('../common/excel');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var pinyin = require('pinyin');
function createTree(node, categories) {
    var items = _.filter(categories, function (item) {
        return item.pid == (node == null ? -1 : node.id);
    });
    if (items.length < 1) return;
    items && items.length && items.forEach(function (e) {
        return createTree(e, categories);
    });
    if (node) node.subItems = items;
    return items;
}

function getChildren(id, categories) {
    var result = [];
    // result.push(id);
    var items = _.filter(categories, function (item) {
        return item.pid == id;
    });
    if (items.length < 1) return result;
    items && items.length && items.forEach(function (e) {
        result.push(e.id);
        var b = getChildren(e.id, categories);
        b && b.length && b.forEach(function (item1) {
            result.push(item1);
        })
    });
    return result;
}

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
        businessPeopleDAO.findSalesManName(hospitalId).then(function (result) {
            res.send({ret: 0, data: result});
        })
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
                return redis.setAsync('h:' + req.user.hospitalId + ':p:' + period.id, String.fromCharCode(65 + index))
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
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
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
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
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
        hospitalDAO.countOfJobTitleForRole(req.params.id).then(function (result) {
            if (result[0].count > 0) throw new Error('该角色已经设置了岗位，请先删除岗位后重试。');
            return hospitalDAO.deleteRole(req.params.id);
        }).then(function () {
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
        hospitalDAO.countOfEmployeeForJobTitle(req.params.roleId, req.params.id).then(function (result) {
            if (result[0].count > 0) throw new Error('改岗位已经分配给员工，请先删除员工后重试。');
            return hospitalDAO.deleteJobTitle(req.params.roleId, req.params.id);
        }).then(function () {
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
            employeeDAO.findByName(req.user.hospitalId, req.user.name).then(function (users) {
                res.send({ret: 0, data: result, expand: !users[0].admin});
            });
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
        dictionaryDAO.updateDisease(_.omit(req.body, ['createDate', 'departmentName', 'creatorName'])).then(function (result) {
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
        if (req.query.name) conditions.push('m.`name` like \'%' + req.query.name + '%\'');
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
        if (req.query.category) {
            dictionaryDAO.findDrugCategories(req.user.hospitalId, 1).then(function (categories) {
                var idList = getChildren(+req.query.category, categories);
                idList.push(+req.query.category);
                conditions.push('category in (' + idList.join(',') + ')');
                dictionaryDAO.findChargeItems(hospitalId, conditions, {
                    from: (pageIndex - 1) * pageSize,
                    size: pageSize
                }).then(function (items) {
                    items.pageIndex = pageIndex;
                    res.send({ret: 0, data: items});
                }).catch(function (err) {
                    res.send({ret: 1, message: err.message});
                });
            })
        } else {
            dictionaryDAO.findChargeItems(hospitalId, conditions, {
                from: (pageIndex - 1) * pageSize,
                size: pageSize
            }).then(function (items) {
                items.pageIndex = pageIndex;
                res.send({ret: 0, data: items});
            }).catch(function (err) {
                res.send({ret: 1, message: err.message});
            });
        }
        return next();
    },
    getDrugs: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var hospitalId = req.user.hospitalId;
        var conditions = [];
        if (req.query.code) conditions.push('code like \'%' + req.query.code + '%\'');
        if (req.query.type) conditions.push('type=\'' + req.query.type + '\'');
        var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        if (req.query.name) conditions.push((reg.test(req.query.name) ? 'name' : 'pinyin') + ' like \'%' + req.query.name + '%\'');
        if (req.query.prescription) conditions.push('inventory > 0');
        if (req.query.category) {
            dictionaryDAO.findDrugCategories(req.user.hospitalId, 0).then(function (categories) {
                var idList = getChildren(+req.query.category, categories);
                idList.push(+req.query.category);
                conditions.push('category in (' + idList.join(',') + ')');
                dictionaryDAO.findDrugs(hospitalId, conditions, {
                    from: (pageIndex - 1) * pageSize,
                    size: pageSize
                }).then(function (items) {
                    items.pageIndex = pageIndex;
                    res.send({ret: 0, data: items});
                }).catch(function (err) {
                    res.send({ret: 1, message: err.message});
                });
            });
        } else {
            dictionaryDAO.findDrugs(hospitalId, conditions, {
                from: (pageIndex - 1) * pageSize,
                size: pageSize
            }).then(function (items) {
                items.pageIndex = pageIndex;
                res.send({ret: 0, data: items});
            }).catch(function (err) {
                res.send({ret: 1, message: err.message});
            });
        }
        return next();
    },
    importDrugs: function (req, res, next) {
        var headers = ['编号', '名称', '生产企业', '类型', '剂型', '规格', '单位', '售价', '临界库存'];
        var rows = excel.parse(req.files['file'].path, {hospitalId: req.user.hospitalId}, headers);
        dictionaryDAO.insertDrugByBatch(rows).then(function (result) {
            res.send({ret: 0, message: '导入药品数据成功，共导入' + rows.length + '行。'});
        }).catch(function (err) {
            res.send({ret: 0, message: err.message});
        });
        return next();
    },

    exportDrugs: function (req, res, next) {
        var header = ['编号', '名称', '药品名称首字母拼音', '生产企业', '类型', '剂型药品剂型', '药品规格', '单位', '售价', '临界库存'];
        dictionaryDAO.findDrugsNoPagination(req.user.hospitalId).then(function (drugs) {
            var file = excel.export(drugs, header, {hospitalId: req.user.hospitalId}, 'drugs');
            var filename = path.basename(file);
            var mimetype = mime.lookup(file);
            res.setHeader('Content-disposition', 'attachment; filename=' + filename + '.xlsx');
            res.setHeader('Content-type', mimetype);
            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    exportHospitals: function (req, res, next) {
        var header = ['编号', '名称', '药品名称首字母拼音', '生产企业', '类型', '剂型药品剂型', '药品规格', '单位', '售价', '临界库存'];
        hospitalDAO.findAllHospitals().then(function (hospitals) {
            var file = excel.export(hospitals, header, {hospitalId: 1}, 'hospitals');
            var filename = path.basename(file);
            var mimetype = mime.lookup(file);
            res.setHeader('Content-disposition', 'attachment; filename=' + filename + '.xlsx');
            res.setHeader('Content-type', mimetype);
            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    exportInventories: function (req, res, next) {
        var header = ['编号', '名称', '类别', '规格', '	批次', '入库数量', '库存量', '进价（元）', '单位', '拆零单位', '有效期', '入库日期', '入库人'];
        dictionaryDAO.findDrugInventoriesNoPagination(req.user.hospitalId).then(function (inventories) {
            var file = excel.export(inventories, header, {hospitalId: req.user.hospitalId}, 'inventories');
            var filename = path.basename(file);
            var mimetype = mime.lookup(file);
            res.setHeader('Content-disposition', 'attachment; filename=' + filename + '.xlsx');
            res.setHeader('Content-type', mimetype);
            var filestream = fs.createReadStream(file);
            filestream.pipe(res);
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },


    addDrug: function (req, res, next) {
        var item = req.body;
        item.inventory = 0.0;
        item.hospitalId = req.user.hospitalId;
        var s = pinyin(item.name, {
            style: pinyin.STYLE_FIRST_LETTER,
            heteronym: false
        });
        item.pinyin = s.join('');
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
    removeDrugs: function (req, res, next) {
        var drugs = [];
        if (_.isArray(req.query.drugs)) {
            _.forEach(req.query.drugs, function (item) {
                drugs.push(item);
            });
        } else {
            drugs.push(+req.query.drugs);
        }
        Promise.map(drugs, function (drug) {
            return dictionaryDAO.deleteDrug(drug)
        }).then(function (result) {
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

    getDrugInventoriesByDrug: function (req, res, next) {
        var drugId = req.params.id;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var conditions = [];
        if (req.query.startDate) conditions.push('h.operateDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('h.operateDate<=\'' + req.query.endDate + ' 23:59:59\'');
        dictionaryDAO.findDrugInventoriesByDrug(drugId, req.user.hospitalId, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (histories) {
            histories.rows && histories.rows.length > 0 && histories.rows.forEach(function (history) {
                history.type = config.inventoryType[+history.type];
            });
            histories.pageIndex = pageIndex;
            res.send({ret: 0, data: histories});
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
        if (req.query.code) conditions.push('d.code like \'%' + req.query.code + '%\'');
        if (req.query.checked) conditions.push('criticalInventory > inventory');
        if (req.query.name) {
            var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
            conditions.push((reg.test(req.query.name) ? 'd.name' : 'd.pinyin') + ' like \'%' + req.query.name + '%\'');
        }
        dictionaryDAO.findDrugInventory(hospitalId, conditions, {
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

    getDrugInventories: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var hospitalId = req.user.hospitalId;
        var conditions = [];
        if (req.query.code) conditions.push('d.code like \'%' + req.query.code + '%\'');
        if (req.query.checked) conditions.push('di.restAmount > 0');
        if (req.query.name) {
            var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
            conditions.push((reg.test(req.query.name) ? 'd.name' : 'd.pinyin') + ' like \'%' + req.query.name + '%\'');
        }
        if (req.query.expireDate) conditions.push('di.expireDate<=\'' + req.query.expireDate + ' 23:59:59\'');
        if (req.query.start) conditions.push('di.createDate>=\'' + req.query.start + ' 00:00:00\'');
        if (req.query.end) conditions.push('di.createDate<=\'' + req.query.end + ' 23:59:59\'');
        if (req.query.greaterThanZero) conditions.push('di.restAmount>0');
        dictionaryDAO.findDrugInventories(hospitalId, conditions, {
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

    getDrugInventoryHistories: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var type = req.query.type;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var conditions = [];
        if (req.query.start) conditions.push('h.operateDate>=\'' + req.query.start + ' 00:00:00\'');
        if (req.query.end) conditions.push('h.operateDate<=\'' + req.query.end + ' 23:59:59\'');
        if (req.query.code) conditions.push('d.code like \'%' + req.query.code + '%\'');
        if (req.query.expireDate) conditions.push('di.expireDate<=\'' + req.query.expireDate + ' 23:59:59\'');
        if (req.query.greaterThanZero) conditions.push('di.restAmount>0');
        var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        if (req.query.name) conditions.push((reg.test(req.query.name) ? 'd.name' : 'd.pinyin') + ' like \'%' + req.query.name + '%\'');
        dictionaryDAO.findDrugInventoryHistories(type, req.user.hospitalId, conditions, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }).then(function (histories) {
            histories && histories.length > 0 && histories.forEach(function (history) {
                history.type = config.inventoryType[+history.type];
            });
            histories.pageIndex = pageIndex;
            res.send({ret: 0, data: histories});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();

    },
    addDrugInventory: function (req, res, next) {
        var item = req.body;
        item.hospitalId = req.user.hospitalId;
        item.createDate = new Date();
        item.operatorName = req.user.name;
        item.operator = req.user.id;
        var history = {
            drugId: item.drugId,
            code: item.code,
            batchNo: item.batchNo,
            operator: req.user.id,
            operatorName: req.user.name,
            type: 0,
            hospitalId: req.user.hospitalId,
            operateDate: new Date(),
            amount: item.amount
        };
        dictionaryDAO.findDrugInventoryBy(item.hospitalId, item.drugId, item.batchNo).then(function (result) {
            if (result.length) {
                item = result[0];
                item.amount = item.amount + req.body.amount;
                item.restAmount = item.restAmount + req.body.amount;
                item.operatorName = req.user.name;
                item.operator = req.user.id;
                return dictionaryDAO.updateDrugInventory(item).then(function (rs) {
                    history.inventoryId = result[0].id;
                    return dictionaryDAO.insertDrugInventoryHistory(history);
                });
            } else {
                item.restAmount = item.amount;
                return dictionaryDAO.insertDrugInventory(item).then(function (result) {
                    item.id = result.insertId;
                    history.inventoryId = item.id;
                    return dictionaryDAO.insertDrugInventoryHistory(history);
                });
            }
        }).then(function (result) {
            return dictionaryDAO.updateDrugRestInventory(item.drugId, req.body.amount);
        }).then(function (result) {
            res.send({ret: 0, data: item});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
    },

    updateDrugInventory: function (req, res, next) {
        var item = req.body;
        var history = {
            drugId: item.drugId,
            code: item.code,
            batchNo: item.batchNo,
            operator: req.user.id,
            operatorName: req.user.name,
            type: 1,
            hospitalId: req.user.hospitalId,
            operateDate: new Date(),
            amount: item.amount,
            inventoryId: item.id,
            comment: item.comment
        };
        dictionaryDAO.updateDrugInventoryBy(item.id, +item.amount).then(function (result) {
            return dictionaryDAO.updateDrugRestInventory(item.drugId, item.amount * (-1));
        }).then(function (result) {
            return dictionaryDAO.insertDrugInventoryHistory(history);
        }).then(function (result) {
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
        dictionaryDAO.findDrugsBy(req.user.hospitalId, {name: name, code: code}, {}).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDrugsByCode: function (req, res, next) {
        var code = req.params.code;
        dictionaryDAO.findDrugsByCode(req.user.hospitalId, code).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    searchMedicalTemplates: function (req, res, next) {
        var name = req.query.name;
        dictionaryDAO.findMedicalTemplatesBy(req.user.hospitalId, name).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getChargeItemsBy: function (req, res, next) {
        var name = req.query.name;
        var code = req.query.code;
        dictionaryDAO.findChargeItemsBy(req.user.hospitalId, {
            name: name,
            code: code,
            wholeWordsOnly: (req.query.wholeWordsOnly ? true : false)
        }).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getSysDictByType: function (req, res, next) {
        res.send({ret: 0, data: config[req.params.type]});
        return next();
    },
    getDrugInventoryHistoryByType: function (req, res, next) {
        dictionaryDAO.findDrugInventoryHistoryByType(req.user.hospitalId, req.params.type).then(function (histories) {
            res.send({ret: 0, data: histories});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getDrugSenders: function (req, res, next) {
        employeeDAO.findDrugSenders(req.user.hospitalId).then(function (senders) {
            res.send({ret: 0, data: senders});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getChargers: function (req, res, next) {
        employeeDAO.findChargers(req.user.hospitalId).then(function (chargers) {
            res.send({ret: 0, data: chargers});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getSalesMan: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        businessPeopleDAO.findSalesManName(hospitalId).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
    },
    addDiseaseDicWord: function (req, res, next) {
        var w = _.assign(req.body, {createDate: new Date(), creator: req.user.id, hospitalId: req.user.hospitalId});
        dictionaryDAO.insertDiseaseWord(w).then(function (result) {
            w.id = result.insertId;
            res.send({ret: 0, data: w, message: '添加成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    updateDiseaseDicWord: function (req, res, next) {
        var w = req.body;
        dictionaryDAO.updateDiseaseWord({id: w.id, word: w.word}).then(function (result) {
            res.send({ret: 0, data: w, message: '更新成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    removeDiseaseDicWord: function (req, res, next) {
        dictionaryDAO.deleteDiseaseWord(req.params.id).then(function (result) {
            res.send({ret: 0, message: '删除成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDiseasesOfDepartments: function (req, res, next) {
        dictionaryDAO.findDiseases(req.user.hospitalId, [], {from: 0, size: 100000}).then(function (diseases) {
            if (!diseases.rows.length) return res.send({ret: 0, data: []});
            var data = _.groupBy(diseases.rows, 'departmentName');
            var result = [];
            for (var key in data) {
                result.push({
                    department: key, diseases: _.map(data[key], function (item) {
                        return {id: item.id, name: item.name};
                    })
                })
            }
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDiseasesOfDepartment: function (req, res, next) {
        dictionaryDAO.findDiseasesOfDepartment(req.params.id).then(function (diseases) {
            res.send({ret: 0, data: diseases});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getDiseaseDicWords: function (req, res, next) {
        dictionaryDAO.findDiseaseDicWords(req.params.id, req.params.type).then(function (diseases) {
            var data = _.groupBy(diseases, function (item) {
                return item.subType;
            });
            var result = [];
            for (var key in data) {
                var subType = config.diseaseWordType[+req.params.type];
                var n = subType[Object.getOwnPropertyNames(subType)[0]][+key];
                result.push({
                    type: {id: key, name: n}, words: _.map(data[key], function (item) {
                        return {id: item.id, name: item.word};
                    })
                })
            }
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    addDrugCategory: function (req, res, next) {
        var category = {
            name: req.body.name,
            pid: (req.body.pid ? req.body.pid : -1),
            hospitalId: req.user.hospitalId,
            type: req.body.type
        };
        dictionaryDAO.findDrugCategoryByPidAndName(req.user.hospitalId, category.pid, category.name, category.type).then(function (cs) {
            if (cs.length && cs.length > 0) throw new Error('分类名重复。');
            return dictionaryDAO.insertDrugCategory(category);
        }).then(function (result) {
            category.id = result.insertId;
            res.send({ret: 0, data: category, message: '添加成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    updateDrugCategory: function (req, res, next) {
        dictionaryDAO.updateDrugCategory(req.body).then(function (result) {
            res.send({ret: 0, message: '更新成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    removeDrugCategory: function (req, res, next) {
        dictionaryDAO.deleteDrugCategory(req.params.id).then(function (result) {
            res.send({ret: 0, message: '更新成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getDrugCategories: function (req, res, next) {
        var id = req.query.id;
        dictionaryDAO.findDrugCategories(req.user.hospitalId, req.params.type).then(function (categories) {
            if (id) {
                return dictionaryDAO.findDrugCategoriesById(req.user.hospitalId, id, req.params.type).then(function (cs) {
                    res.send({ret: 0, data: createTree(cs[0], categories)});
                })
            } else {
                res.send({ret: 0, data: createTree(null, categories)});
            }
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getOutpatientServiceType: function (req, res, next) {
        dictionaryDAO.findOutpatientServiceTypes(req.user.hospitalId).then(function (ps) {
            res.send({ret: 0, data: ps});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    addOutpatientServiceType: function (req, res, next) {
        req.body.hospitalId = req.user.hospitalId;
        dictionaryDAO.addOutpatientServiceType(req.body).then(function (p) {
            req.body.id = p.insertId;
            res.send({ret: 0, data: req.body, message: '添加成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    updateOutpatientServiceType: function (req, res, next) {
        dictionaryDAO.updateOutpatientServiceType(req.body).then(function (p) {
            res.send({ret: 0, message: '修改成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    removeOutpatientServiceType: function (req, res, next) {
        dictionaryDAO.deleteOutpatientServiceType(req.params.id).then(function (p) {
            res.send({ret: 0, message: '删除成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }

}
