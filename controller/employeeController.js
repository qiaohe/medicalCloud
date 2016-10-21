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
        employee.createDate = new Date();
        employeeDAO.findByUsername(req.user.hospitalId, employee.mobile).then(function (employees) {
            if (employees.length) return res.send({ret: 1, message: '员工已经存在。'});
            employeeDAO.insert(employee).then(function (result) {
                employee.id = result.insertId;
                employeeDAO.findRoleByName(req.user.hospitalId, config.app.prefixOfDoctorRole).then(function (roles) {
                    if (!roles.length) throw new Error('没有在系统配置里设置医生岗位。');
                    var roleId = roles[0].id;
                    if (employee.role == roleId) {
                        var doctor = {
                            birthday: employee.birthday,
                            contract: employee.contract,
                            contactTel: employee.contactTel,
                            createDate: employee.createDate,
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
                            return employeeDAO.findJobTitleById(employee.jobTitle)
                        }).then(function (jobTitles) {
                            doctor.jobTitle = jobTitles[0].name;
                            doctor.clinic = 1;
                            return employeeDAO.insertDoctor(doctor);
                        }).then(function (result) {
                            return res.send({ret: 0, data: employee});
                        })
                    }
                    res.send({ret: 0, data: employee});
                });
            }).catch(function (err) {
                res.send({ret: 1, message: err.message});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
    },
    changePassword: function (req, res, next) {
        var employee = req.body;
        employee.password = md5(employee.password);
        employeeDAO.updateEmployee(employee).then(function (result) {
            res.send({ret: 0, message: i18n.get('employee.changePassword.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    deleteEmployee: function (req, res, next) {
        employeeDAO.deleteEmployee(req.params.id).then(function () {
            return employeeDAO.deleteDoctorDepartmentBy(req.params.id);
        }).then(function (result) {
            return redis.getAsync('uid:' + req.params.id + ':token');
        }).then(function (token) {
            return redis.delAsync(token);
        }).then(function () {
            return employeeDAO.deleteDoctorBy(req.params.id);
        }).then(function (result) {
            res.send({ret: 0, message: i18n.get('employee.remove.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    updateEmployee: function (req, res, next) {
        var employee = req.body;
        employee.hospitalId = req.user.hospitalId;
        employeeDAO.findById(employee.id, employee.hospitalId).then(function (employees) {
            var e = employees[0];
            employeeDAO.findRoleByName(req.user.hospitalId, config.app.prefixOfDoctorRole).then(function (roles) {
                if (!roles.length) throw new Error('没有在系统配置里设置医生岗位。');
                var roleId = roles[0].id;
                if (e.role == roleId && employee.role != roleId) {
                    return employeeDAO.deleteDoctorBy(e.id);
                } else if (e.role != roleId && employee.role == roleId) {
                    var doctor = {
                        birthday: employee.birthday,
                        contract: employee.contract,
                        contactTel: employee.contactTel,
                        createDate: employee.createDate,
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
                        return employeeDAO.findJobTitleById(employee.jobTitle)
                    }).then(function (jobTitles) {
                        doctor.jobTitle = jobTitles[0].name;
                        doctor.clinic = 1;
                        return employeeDAO.insertDoctor(doctor);
                    })
                } else if (e.role == roleId && employee.role == roleId) {
                    var d = {
                        birthday: employee.birthday,
                        contract: employee.contract,
                        contactTel: employee.contactTel,
                        createDate: employee.createDate,
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
            }).catch(function (err) {
                res.send({ret: 1, message: err.message});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getEmployees: function (req, res, next) {
        var pageIndex = +req.query.pageIndex;
        var pageSize = +req.query.pageSize;
        var customerServiceUid = {};
        hospitalDAO.findCustomerServiceId(req.user.hospitalId).then(function (users) {
            if (users && users.length > 0) customerServiceUid = users[0].customerServiceUid;
            return employeeDAO.findEmployees(req.user.hospitalId, {
                from: (pageIndex - 1) * pageSize,
                size: pageSize
            }, getConditions(req))
        }).then(function (empoyees) {
            if (!empoyees.rows.length) res.send({ret: 0, data: {rows: [], pageIndex: pageIndex, count: 0}});
            empoyees.rows.forEach(function (employee) {
                employee.status = config.employeeStatus[employee.status];
                employee.isCustomerService = (employee.id == customerServiceUid);
                employee.gender = config.gender[employee.gender];
            });
            empoyees.pageIndex = pageIndex;
            res.send({ret: 0, data: empoyees});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
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
            if (!doctors.rows.length) res.send({ret: 0, data: {rows: [], pageIndex: pageIndex, count: 0}});
            doctors.rows && doctors.rows.forEach(function (doctor) {
                doctor.gender = config.gender[doctor.gender];
                doctor.images = doctor.images && doctor.images.split(',');
                doctor.status = config.employeeStatus[doctor.status];
            });
            return Promise.map(doctors.rows, function (doctor) {
                return employeeDAO.findDepartmentsOfDoctor(doctor.id).then(function (departments) {
                    doctor.departments = departments;
                })
            }).then(function (result) {
                doctors.pageIndex = pageIndex;
                res.send({ret: 0, data: doctors});
            })
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getEmployeeById: function (req, res, next) {
        var id = req.params.id;
        var hospitalId = req.user.hospitalId;
        employeeDAO.findById(id, hospitalId).then(function (employees) {
            var employee = employees[0];
            res.send({ret: 0, data: employee});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
    },

    deleteDoctor: function (req, res, next) {
        employeeDAO.deleteDoctor(req.params.id).then(function (result) {
            return employeeDAO.deleteDoctorDepartment(req.params.id);
        }).then(function (result) {
            res.send({ret: 0, message: i18n.get('doctor.delete.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    updateDoctor: function (req, res, next) {
        var doctor = req.body;
        doctor.hospitalId = req.user.hospitalId;
        doctor.updateDate = new Date();
        var departments = doctor.departments;
        doctor.images = doctor.images && doctor.images.join(',');
        delete doctor.departments;
        employeeDAO.updateDoctor(doctor).then(function (result) {
            if (departments && departments.length) {
                return Promise.map(departments, function (department) {
                    return employeeDAO.deleteDoctorDepartment(doctor.id).then(function (result) {
                        return employeeDAO.insertDoctorDepartment({doctorId: doctor.id, departmentId: department});
                    })
                }).then(function (result) {
                    res.send({ret: 0, message: i18n.get('doctor.update.success')});
                })
            } else {
                res.send({ret: 0, message: i18n.get('doctor.update.success')});
            }
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
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
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
    },

    getEmployeeByMobile: function (req, res, next) {
        var mobile = req.query.mobile;
        employeeDAO.findByUsername(req.user.hospitalId, mobile).then(function (employees) {
            res.send({ret: 0, data: employees});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getNurses: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        employeeDAO.findByRoleName(hospitalId, '护士').then(function (result) {
            if (result && result.length < 1) return res.send({ret: 0, data: []})
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        })
        return next();
    }
}