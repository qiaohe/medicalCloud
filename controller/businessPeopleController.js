"use strict";
var config = require('../config');
var _ = require('lodash');
var i18n = require('../i18n/localeMessage');
var businessPeopleDAO = require('../dao/businessPeopleDAO');
var md5 = require('md5');
var Promise = require('bluebird');
function getConditions(req) {
    var conditions = [];
    if (req.query.status) conditions.push('status=' + req.query.status);
    if (req.query.mobile) conditions.push('mobile like \'%' + req.query.mobile + '%\'');
    if (req.query.name) conditions.push('name like \'%' + req.query.name + '%\'');
    return conditions;
}
module.exports = {
    getSalesMan: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        businessPeopleDAO.findSalesMan(hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }, getConditions(req)).then(function (result) {
            result.pageIndex = pageIndex;
            result.rows && result.rows.length > 0 && result.rows.forEach(function (item) {
                item.status = config.salesManStatus[item.status];
            });
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    addSalesMan: function (req, res, next) {
        var salesMan = _.assign(req.body, {
            createDate: new Date(),
            hospitalId: req.user.hospitalId,
            password: md5('123456'),
            status: 0
        });
        businessPeopleDAO.findSalesManBy(req.user.hospitalId, salesMan.mobile).then(function (result) {
            if (result && result.length > 0) throw new Error('手机号码已经存在。');
            return businessPeopleDAO.insertSalesMan(salesMan);
        }).then(function (result) {
            salesMan.id = result.insertId;
            res.send({ret: 0, data: salesMan});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    removeSalesMan: function (req, res, next) {
        businessPeopleDAO.deleteSalesMan(req.params.id).then(function (result) {
            res.send({ret: 0, message: '删除业务员成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    updateSalesMan: function (req, res, next) {
        businessPeopleDAO.updateSalesMan(req.body).then(function (result) {
            res.send({ret: 0, message: '更新业务员成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getCheckIn: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var conditions = [];
        if (req.query.startDate) conditions.push('c.date>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('c.date<=\'' + req.query.endDate + ' 23:59:59\'');
        if (req.query.salesMan) conditions.push('c.salesMan=' + req.query.salesMan);
        businessPeopleDAO.findCheckIn(hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }, conditions).then(function (result) {
            result.pageIndex = pageIndex;
            result.rows && result.rows.length > 0 && result.rows.forEach(function (item) {
                item.pictures = item.pictures ? item.pictures.split(',') : [];
            });
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getSalesManPerformances: function (req, res, next) {
        var salesManId = req.params.id;
        var year = req.params.year;
        businessPeopleDAO.findSalesManPerformance(salesManId, year).then(function (result) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    addSalesManPerformances: function (req, res, next) {
        var p = req.body;
        Promise.map(p.performances, function (item) {
            return businessPeopleDAO.findSalesManPerformanceBy(p.salesMan, item.yearMonth).then(function (result) {
                if (result.length < 1) return businessPeopleDAO.insertSalesManPerformance(_.assign(item, {
                    salesMan: p.salesMan,
                    actual: 0.00
                }));
                var p1 = result[0];
                p1.plan = item.plan;
                return businessPeopleDAO.updateSalesManPerformance(p1);
            });
        }).then(function (result) {
            res.send({ret: 0, message: '业绩更新成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getSalesManInfo: function (req, res, next) {
        var salesman = req.params.id;
        businessPeopleDAO.findSalesManById(salesman).then(function (result) {
            if (result.length < 1) return res.send({ret: 0, message: '业务员不存在。'})
            res.send({ret: 0, data: result[0]});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getSalesManRegistrations: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var conditions = [];
        if (req.query.startDate) conditions.push('createDate>=\'' + req.query.startDate + ' 00:00:00\'');
        if (req.query.endDate) conditions.push('createDate<=\'' + req.query.endDate + ' 23:59:59\'');
        if (req.query.salesMan) conditions.push('businessPeopleId=' + req.query.salesMan);
        if (req.query.department) conditions.push('departmentId=' + req.query.department);
        if (req.query.doctor) conditions.push('doctorId=' + req.query.doctor);
        if (req.query.status) conditions.push('outPatientStatus=' + req.query.status);
        if (req.query.patientName) conditions.push('patientName like \'%' + req.query.patientName + '%\'');
        businessPeopleDAO.findSalesManRegistrationForOthers(hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }, conditions).then(function (registrations) {
            if (registrations.rows.length < 1) return res.send({ret: 0, data: []});
            registrations.pageIndex = pageIndex;
            registrations.rows.forEach(function (registration) {
                registration.outpatientStatus = config.outpatientStatus[+registration.outpatientStatus];
            });
            businessPeopleDAO.sumSalesManRegistrationForOthers(hospitalId, conditions).then(function (result) {
                registrations.sumTotalFee = result[0].sumTotalFee;
                res.send({ret: 0, data: registrations});
            });
        }).catch(function (err) {
            res.send({ret: 0, message: err.message});
        });
    },
    getSalesManSummary: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var conditions = [];
        if (req.query.startDate) conditions.push('p.yearMonth>=\'' + req.query.startDate + '\'');
        if (req.query.endDate) conditions.push('p.yearMonth<=\'' + req.query.endDate + '\'');
        if (req.query.salesMan) conditions.push('p.salesMan=' + req.query.salesMan);
        if (req.query.status) conditions.push('e.status=' + req.query.status);
        businessPeopleDAO.findPerformances(hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }, conditions).then(function (performances) {
            if (performances.rows.length < 1) return res.send({ret: 0, data: []});
            performances.pageIndex = pageIndex;
            performances.rows.forEach(function (p) {
                p.status = config.salesManStatus[p.status];
            });
            performances.pageIndex = pageIndex;
            businessPeopleDAO.sumActualPerformance(hospitalId, conditions).then(function (result) {
                performances.totalActual = result[0].totalActual;
                res.send({ret: 0, data: performances});
            })
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }
}