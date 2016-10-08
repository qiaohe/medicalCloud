"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insert: function (employee) {
        return db.query(sqlMapping.employee.insert, employee);
    },
    findByUsername: function (hospitalId, username) {
        return db.query(sqlMapping.employee.findByUserName, [hospitalId, username]);
    },
    findByUsernameWithHospital: function (hospitalId, username) {
        return db.query(sqlMapping.employee.findByUsernameWithHospital, [hospitalId, username]);
    },
    findByUsernameAndDomain: function (domainName, userName) {
        return db.query(sqlMapping.employee.findByUsernameAndDomain, [userName, domainName]);
    },

    findByName: function (hospitalId, username) {
        return db.query(sqlMapping.employee.findByName, [hospitalId, username]);
    },
    updateEmployee: function (employee) {
        return db.query(sqlMapping.employee.updateEmployeeByUid, [employee, employee.id])
    },

    updateEmployeePassword: function (password, mobile) {
        return db.query(sqlMapping.employee.updateEmployee, [password, mobile])
    },

    findEmployees: function (hospitalId, page, conditions) {
        var sql = sqlMapping.employee.findEmployees;
        if (conditions.length) {
            sql = 'select SQL_CALC_FOUND_ROWS e.id, e.`name`, d.`name` as department, e.mobile, e.gender, e.birthday, job.`name` as jobTitle, role.`name` as role, e.`status`, e.maxDiscountRate, e.admin as isAdmin  from Employee e LEFT JOIN Department d on d.id = e.department left JOIN Role role on role.id = e.role left JOIN JobTitle job on job.id = e.jobTitle where e.hospitalId =? and ' + conditions.join(' and ') + ' order by e.id desc limit ?,?';
        }
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },

    findDoctorsByHospital: function (hospital, page, conditions) {
        var sql = sqlMapping.doctor.findDoctorsByHospital;
        if (conditions.length) sql = 'select SQL_CALC_FOUND_ROWS d.*, e.birthday, d.clinic, e.mobile from Doctor d, Employee e where e.id = d.employeeId and d.status <> 2 and d.hospitalId = ? and ' + conditions.join(' and ') + ' order by d.id desc limit ?, ?';
        return db.queryWithCount(sql, [hospital, page.from, page.size])
    },

    findById: function (id, hospitalId) {
        return db.query(sqlMapping.employee.findById, [id, hospitalId]);
    },

    findByIdWithHospital: function (hospitalId, id) {
        return db.query(sqlMapping.employee.findByIdWithHospital, [+hospitalId, +id]);
    },
    findDoctorsGroupByDepartment: function (hospitalId) {
        return db.query(sqlMapping.doctor.findDoctorsGroupByDepartment, hospitalId);
    },

    updateDoctor: function (doctor) {
        return db.query(sqlMapping.doctor.update, [doctor, doctor.id]);
    },
    updateDoctorBy: function (doctor) {
        return db.query(sqlMapping.doctor.updateBy, [doctor, doctor.employeeId]);
    },

    deleteDoctor: function (id) {
        return db.query(sqlMapping.doctor.delete, id);
    },
    findJobTitleById: function (jobTitleId) {
        return db.query(sqlMapping.employee.findJobTitleById, jobTitleId);
    },
    findDepartmentById: function (departmentId) {
        return db.query(sqlMapping.employee.findDepartmentById, departmentId);
    },
    insertDoctor: function (doctor) {
        return db.query(sqlMapping.doctor.insert, doctor);
    },
    deleteDoctorBy: function (empoyeeId) {
        return db.query(sqlMapping.doctor.deleteDoctorBy, empoyeeId);
    },
    deleteEmployee: function (id) {
        return db.query(sqlMapping.employee.delete, id);
    },
    updateDoctorByDepartment: function (id, name) {
        return db.query(sqlMapping.employee.updateDoctorByDepartment, [name, id]);
    },
    findByRoleName: function (hospitalId, roleName) {
        var sql = sqlMapping.employee.findByRoleName + '\'%' + roleName + '%\'';
        return db.query(sql, hospitalId);
    },
    findRoleByName: function (hospitalId, roleName) {
        var sql = 'select id from Role where hospitalId=? and `name` like \'%' + roleName + '%\'';
        return db.query(sql, hospitalId);
    },
    findChargers: function (hospitalId) {
        var sql = 'select DISTINCT chargedBy, chargedByName from MedicalOrder where hospitalId=? and  chargedBy is not NULL';
        return db.query(sql, hospitalId);
    },
    findDrugSenders: function (hospitalId) {
        var sql = 'select DISTINCT drugSenderName as name, drugSender as id from MedicalOrder where hospitalId = ? and drugSenderName is not null';
        return db.query(sql, hospitalId);
    }
}