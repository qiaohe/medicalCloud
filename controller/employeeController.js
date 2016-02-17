"use strict";
var config = require('../config');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var redis = require('../common/redisClient');
var _ = require('lodash');
var i18n = require('../i18n/localeMessage');
var employeeDAO = require('../dao/employeeDAO');
var hospitalDAO = require('../dao/hospitalDAO');
var md5 = require('md5');
function getConditions(req) {
    var conditions = [];
    if (req.query.name) conditions.push('e.name like \'%' + req.query.name + '%\'');
    if (req.query.mobile) conditions.push('e.mobile like \'%' + req.query.mobile + '%\'');
    if (req.query.status) conditions.push('e.status=' + req.query.status);
    if (req.query.department) conditions.push('d.id=' + req.query.department);
    if (req.query.role) conditions.push('e.role=' + req.query.role);
    return conditions;
}
module.exports = {
    addEmployee: function (req, res, next) {
        var employee = req.body;
        employee.password = md5(employee.password);
        employee.hospitalId = req.user.hospitalId;
        employee.status = 0;
        employee.createDate = new Date();
        employeeDAO.insert(employee).then(function (result) {
            employee.id = result.insertId;
            if (employee.role == 2) {
                var doctor = {
                    birthday: employee.birthday,
                    contract: employee.contract,
                    contactTel: employee.contactTel,
                    createDate: employee.createDate,
                    departmentId: employee.department,
                    employeeId: employee.id,
                    gender: employee.gender,
                    headPic: employee.headPic,
                    hospitalId: employee.hospitalId,
                    name: employee.name,
                    jobTitleId: employee.jobTitle,
                    status: employee.status
                };
                hospitalDAO.findHospitalById(employee.hospitalId).then(function (hospitals) {
                    doctor.hospitalName = hospitals[0].name;
                    return employeeDAO.findDepartmentById(employee.department);
                }).then(function (departments) {
                    doctor.departmentName = departments[0].name;
                    return employeeDAO.findJobTitleById(employee.jobTitle)
                }).then(function (jobTitles) {
                    doctor.jobTitle = jobTitles[0].name;
                    return employeeDAO.insertDoctor(doctor);
                }).then(function (result) {
                    return res.send({ret: 0, data: employee});
                })
            }
            res.send({ret: 0, data: employee});
        })
    },
    changePassword: function (req, res, next) {
        var employee = req.body;
        employee.password = md5(employee.password);
        employeeDAO.updateEmployee(employee).then(function (result) {
            res.send({ret: 0, message: i18n.get('employee.changePassword.success')});
        });
        return next();
    },

    deleteEmployee: function (req, res, next) {
        //employeeDAO.updateEmployee({id: req.params.id, status: 2}).then(function (result) {
        //    res.send({ret: 0, message: i18n.get('employee.remove.success')});
        //});
        employeeDAO.deleteEmployee(req.params.id).then(function () {
            return employeeDAO.deleteDoctorBy(req.params.id);
        }).then(function () {
            res.send({ret: 0, message: i18n.get('employee.remove.success')});
        });
        return next();
    },

    updateEmployee: function (req, res, next) {
        var employee = req.body;
        employee.hospitalId = req.user.hospitalId;
        employeeDAO.findById(employee.id, employee.hospitalId).then(function (employees) {
            var e = employees[0];
            if (e.role == 2 && employee.role != 2) {
                return employeeDAO.deleteDoctorBy(e.id);
            } else if (e.role != 2 && employee.role == 2) {
                var doctor = {
                    birthday: employee.birthday,
                    contract: employee.contract,
                    contactTel: employee.contactTel,
                    createDate: employee.createDate,
                    departmentId: employee.department,
                    employeeId: employee.id,
                    gender: employee.gender,
                    headPic: employee.headPic,
                    hospitalId: employee.hospitalId,
                    name: employee.name,
                    jobTitleId: employee.jobTitle,
                    status: employee.status
                };
                hospitalDAO.findHospitalById(employee.hospitalId).then(function (hospitals) {
                    doctor.hospitalName = hospitals[0].name;
                    return employeeDAO.findDepartmentById(employee.department);
                }).then(function (departments) {
                    doctor.departmentName = departments[0].name;
                    return employeeDAO.findJobTitleById(employee.jobTitle)
                }).then(function (jobTitles) {
                    doctor.jobTitle = jobTitles[0].name;
                    return employeeDAO.insertDoctor(doctor);
                })
            } else if (e.role == 2 && employee.role == 2) {
                var d = {
                    birthday: employee.birthday,
                    contract: employee.contract,
                    contactTel: employee.contactTel,
                    createDate: employee.createDate,
                    departmentId: employee.department,
                    employeeId: employee.id,
                    gender: employee.gender,
                    headPic: employee.headPic,
                    hospitalId: employee.hospitalId,
                    name: employee.name,
                    jobTitleId: employee.jobTitle,
                    status: employee.status
                };
                hospitalDAO.findHospitalById(employee.hospitalId).then(function (hospitals) {
                    d.hospitalName = hospitals[0].name;
                    return employeeDAO.findDepartmentById(employee.department);
                }).then(function (departments) {
                    d.departmentName = departments[0].name;
                    return employeeDAO.findJobTitleById(employee.jobTitle)
                }).then(function (jobTitles) {
                    d.jobTitle = jobTitles[0].name;
                    return employeeDAO.updateDoctorBy(d);
                });
            }
        }).then(function (result) {
            return employeeDAO.updateEmployee(employee)
        }).then(function (result) {
            res.send({ret: 0, message: i18n.get('employee.update.success')});
        });
        return next();
    },

    getEmployees: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        employeeDAO.findEmployees(req.user.hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }, getConditions(req)).then(function (empoyees) {
            if (!empoyees.rows.length) res.send({ret: 0, data: {rows: [], pageIndex:0, count:0}});
            empoyees.rows.forEach(function (employee) {
                employee.status = config.employeeStatus[employee.status];
                employee.gender = config.gender[employee.gender];
            });
            empoyees.pageIndex = pageIndex;
            res.send({ret: 0, data: empoyees});
        });
        return next();
    },
    getDoctors: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var hospitalId = req.user.hospitalId;
        var conditions = [];
        if (req.query.name) conditions.push('e.name like \'%' + req.query.name + '%\'');
        if (req.query.mobile) conditions.push('e.mobile like \'%' + req.query.mobile + '%\'');
        if (req.query.status) conditions.push('e.status=' + req.query.status);
        if (req.query.department) conditions.push('d.departmentId=' + req.query.department);
        if (req.query.role) conditions.push('e.role=' + req.query.role);
        employeeDAO.findDoctorsByHospital(hospitalId, {
            from: (pageIndex - 1) * pageSize,
            size: pageSize
        }, conditions).then(function (doctors) {
            if (!doctors.rows.length) res.send({ret: 0, data: {rows: [], pageIndex:0, count:0}});
            doctors.rows && doctors.rows.forEach(function (doctor) {
                doctor.gender = config.gender[doctor.gender];
                doctor.images = doctor.images && doctor.images.split(',');
                doctor.status = config.employeeStatus[doctor.status];
            });
            doctors.pageIndex = pageIndex;
            res.send({ret: 0, data: doctors});
        });
        return next();
    },

    getEmployeeById: function (req, res, next) {
        var id = req.params.id;
        var hospitalId = req.user.hospitalId;
        employeeDAO.findById(id, hospitalId).then(function (employees) {
            var employee = employees[0];
            res.send({ret: 0, data: employee});
        })
    },

    deleteDoctor: function (req, res, next) {
        employeeDAO.deleteDoctor(req.params.id).then(function (result) {
            res.send({ret: 0, message: i18n.get('doctor.delete.success')});
        });
        return next();
    },

    updateDoctor: function (req, res, next) {
        var doctor = req.body;
        doctor.hospitalId = req.user.hospitalId;
        doctor.updateDate = new Date();
        doctor.images = doctor.images && doctor.images.join(',');
        employeeDAO.updateDoctor(doctor).then(function (result) {
            res.send({ret: 0, message: i18n.get('doctor.update.success')});
        });
        return next();
    },
    getDoctorsGroupByDepartment: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        employeeDAO.findDoctorsGroupByDepartment(hospitalId).then(function (doctors) {
            if (!doctors.length) return res.send({ret: 0, data: doctors});
            var data = _.groupBy(doctors, 'departmentName');
            var result = [];
            for (var key in data) {
                result.push({department: key, doctors: data[key]})
            }
            res.send({ret: 0, data: result});
        });
    }
}