"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
var moment = require('moment');
module.exports = {
    findDepartments: function (hospitalId) {
        return db.query(sqlMapping.hospital.findDepartments, hospitalId);
    },
    findJobTitles: function (hospitalId) {
        return db.query(sqlMapping.hospital.findJobTitles, hospitalId);
    },
    findHospitalByDomainName: function (domainName) {
        return db.query(sqlMapping.hospital.findHospitalByDomainName, domainName);
    },
    findByUsername: function (username) {
        return db.query(sqlMapping.employee.findByUserName, username);
    },
    findDepartmentsBy: function (hospitalId, page) {
        return db.queryWithCount(sqlMapping.department.findByHospital, [hospitalId, page.from, page.size]);
    },

    findDoctorsByDepartment: function (hospitalId, departmentId) {
        return db.query(sqlMapping.doctor.findByDepartment, [hospitalId, departmentId]);
    },

    findHospitalById: function (hospitalId) {
        return db.query(sqlMapping.hospital.findById, hospitalId);
    },

    findDoctorByIds: function (ids) {
        var sql = 'select id, name, departmentName,hospitalId, hospitalName, headPic,registrationFee, speciality,jobTitle ' +
            'from Doctor where id in(' + ids + ') order by field(id, ' + ids + ')';
        return db.query(sql);
    },

    findDoctorById: function (doctorId) {
        return db.query(sqlMapping.doctor.findById, doctorId);
    },
    findDoctors: function (hospitalId) {
        return db.query(sqlMapping.doctor.findDoctors, hospitalId)
    },
    findShiftPlans: function (doctorId, start) {
        var end = moment(start).add(1, 'w').format('YYYY-MM-DD');
        return db.query(sqlMapping.doctor.findShitPlans, [doctorId, start, end]);
    },
    addDepartment: function (department) {
        return db.query(sqlMapping.department.insert, department);
    },
    updateDepartment: function (department) {
        return db.query(sqlMapping.department.update, [department, department.id]);
    },
    removeDepartment: function (departmentId) {
        return db.query(sqlMapping.department.delete, +departmentId);
    },
    updateHospital: function (hospital) {
        return db.query(sqlMapping.hospital.update, [hospital, hospital.id]);
    },
    findProvinces: function () {
        return db.query(sqlMapping.city.findProvinces);
    },
    findCities: function (province) {
        return db.query(sqlMapping.city.findCities, [province]);
    },
    findRoles: function (hospitalId) {
        return db.query(sqlMapping.employee.findRoles, hospitalId);
    },
    findJobTitleByRole: function (hospitalId, roleId) {
        return db.query(sqlMapping.employee.findJobTitleByRole, [hospitalId, roleId]);
    },
    addShiftPlan: function (shiftPlan) {
        return db.query(sqlMapping.registration.addShiftPlan, shiftPlan);
    },
    updateShiftPlan: function (shiftPlan) {
        return db.query(sqlMapping.registration.updateShiftPlanBy, [shiftPlan.plannedQuantity, shiftPlan.doctorId, shiftPlan.day, shiftPlan.shiftPeriod]);
    },
    findShiftPlansBy: function (hospitalId, doctorId, month) {
        var startDate = month + '-01';
        var endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
        return db.query(sqlMapping.registration.findShiftPlans, [hospitalId, doctorId, startDate, endDate]);
    },
    findShiftPlansByDay: function (hospitalId, doctorId, day) {
        return db.query(sqlMapping.registration.findShiftPlansByDay, [+hospitalId, +doctorId, day]);
    },
    findShiftPlansByDayWithName: function (hospitalId, doctorId, day) {
        return db.query(sqlMapping.registration.findShiftPlansByDayWithName, [+hospitalId, +doctorId, day]);
    },

    findPerformances: function (hospitalId, conditions, businessPeopleIds) {
        var idList = businessPeopleIds && businessPeopleIds.join(',');
        return db.query(sqlMapping.businessPeople.findPerformances + (conditions.length ? ' and ' + conditions : '') + ' and p.businessPeopleId in (' + idList + ') order by name, yearMonth', hospitalId);
    },
    findBusinessPeopleWithPage: function (hospitalId, page, conditions) {
        return db.queryWithCount(sqlMapping.businessPeople.findBusinessPeopleWithPage + (conditions.length ? ' and ' + conditions : '') + '  order by e.name limit ?, ?', [hospitalId, page.from, page.size]);
    },
    findPerformancesBy: function (businessPeopleId) {
        return db.query(sqlMapping.businessPeople.findPerformancesBy, businessPeopleId);

    },
    addPerformance: function (performance) {
        return db.query(sqlMapping.businessPeople.insertPerformance, performance);
    },

    updatePerformance: function (performance) {
        return db.query(sqlMapping.businessPeople.updatePerformance, [+performance.plannedCount, +performance.businessPeopleId, performance.yearMonth]);
    },

    findWaitOutpatients: function (doctorId, registerDate, page, conditions) {
        var sql = sqlMapping.doctor.findWaitOutpatients;
        sql = !conditions.length ? sql : 'select SQL_CALC_FOUND_ROWS concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , sp.`name`) as registerDate,r.nurse, e.name as nurseName, d.clinic,r.id, r.patientName, r.patientMobile, r.gender, r.age, r.sequence, r.registrationType, r.`comment`,r.patientId, r.outPatientType, r.createDate,d.id as doctorId, d.name as doctorName, r.businessPeopleName as recommender, r.outpatientStatus, pi.balance, pi.memberType, pi.memberCardNo, r.patientId from Registration r LEFT JOIN  PatientBasicInfo p on p.id = r.patientBasicInfoId left JOIN ShiftPeriod sp on sp.id = r.shiftPeriod LEFT JOIN Patient pi on pi.id = r.patientId LEFT JOIN Doctor d ON d.id = r.doctorId left join Employee e on e.id = r.nurse where d.employeeId = ? and r.sequence is not null and r.registerDate=? and ' + conditions.join(' and ') + ' order by field(r.outpatientStatus, 5, 0, 1), r.shiftPeriod, r.createDate limit ?,?';
        return db.queryWithCount(sql, [doctorId, registerDate, page.from, page.size])
    },
    findFinishedCountByDate: function (doctorId, registerDate) {
        return db.query(sqlMapping.doctor.findFinishedCountByDate, [doctorId, registerDate])
    },

    findHistoryOutpatients: function (doctorId, page, conditions) {
        var sql = sqlMapping.doctor.findHistoryOutpatients;
        sql = !conditions.length ? (sql + ' limit ?, ?') : 'select SQL_CALC_FOUND_ROWS ot.name outPatientServiceTypeName, r.outPatientServiceType, r.registerDate, r.content,r.doctorName,r.transferDoctorName, r.id, r.patientName, r.patientMobile, r.gender, r.patientId,r.age, r.sequence, r.registrationType, r.`comment`, r.outPatientType, r.createDate, r.businessPeopleName as recommender, r.outpatientStatus from Registration r LEFT JOIN  PatientBasicInfo p on p.id = r.patientBasicInfoId LEFT JOIN Doctor d ON d.id = r.doctorId left join OutpatientServiceType ot on ot.id=r.outPatientServiceType where d.employeeId = ? and ' + conditions.join(' and ') + ' order by r.registerDate desc, r.sequence limit ?, ?';
        return db.queryWithCount(sql, [doctorId, page.from, page.size]);
    },
    insertRole: function (role) {
        return db.query(sqlMapping.employee.insertRole, role);
    },
    deleteRole: function (id) {
        return db.query(sqlMapping.employee.deleteRole, id);
    },
    insertJobTitle: function (jobTitle) {
        return db.query(sqlMapping.employee.insertJobTitle, jobTitle);
    },
    deleteJobTitle: function (roleId, jobTitleId) {
        return db.query(sqlMapping.employee.deleteJobTitle, [roleId, jobTitleId]);
    },
    updateJobTitle: function (jobTitle) {
        return db.query(sqlMapping.employee.updateJobTitle, [jobTitle, jobTitle.id]);
    },
    updateRole: function (role) {
        return db.query(sqlMapping.employee.updateRole, [role, role.id]);
    },
    deletePerformancesBy: function (businessPeopleId, year) {
        return db.query(sqlMapping.businessPeople.deletePerformancesBy, [businessPeopleId, year]);
    },
    findCustomerServiceId: function (hospitalId) {
        return db.query(sqlMapping.hospital.findCustomerServiceId, hospitalId);
    },
    findMyMenus: function (uid) {
        return db.query(sqlMapping.hospital.findMyMenus, uid);
    },

    findMenus: function () {
        return db.query(sqlMapping.hospital.findMenus);
    },

    findMenusByJobTitle: function (jobTitleId) {
        return db.query(sqlMapping.hospital.findMenusByJobTitle, jobTitleId);
    },

    deleteMenuByJobTitle: function (jobTitleId, menuItemId) {
        return db.query(sqlMapping.hospital.deleteMenuByJobTitle, [jobTitleId, menuItemId]);
    },

    deleteAuthorityByJobTitle: function (jobTitleId, authorityId) {
        return db.query(sqlMapping.hospital.deleteAuthorityByJobTitle, [jobTitleId, authorityId]);
    },

    insertMenuItem: function (item) {
        return db.query(sqlMapping.hospital.insertMenuItem, item);
    },
    insertJobTitleAuthority: function (authority) {
        return db.query(sqlMapping.hospital.insertJobTitleAuthority, authority);
    },
    
    findJobTitleMenuItem: function (jobTitleId, menuItemId) {
        return db.query(sqlMapping.hospital.findJobTitleMenuItem, [jobTitleId, menuItemId]);
    },
    findJobTitleAuthority: function (jobTitleId, authorityId) {
        return db.query(sqlMapping.hospital.findJobTitleAuthority, [jobTitleId, authorityId]);
    },

    findDiscountRateOfDoctor: function (hospitalId, doctorId) {
        return db.query(sqlMapping.doctor.findDiscountRateOfDoctor, [hospitalId, doctorId]);
    },
    findAngelGuidersTransactionFlows: function (hospitalId, page, conditions) {
        var sql = sqlMapping.angelGuiderTransactionFlow.findAll;
        if (conditions.length) sql = sql + ' and ' + conditions.join(' and ');
        sql = sql + ' order by af.createDate desc limit ?,?';
        return db.queryWithCount(sql, [hospitalId, page.from, page.size]);
    },

    findAll: function () {
        return db.query(sqlMapping.hospital.findAll);
    },
    findAllHospitals: function () {
        return db.query(sqlMapping.hospital.findAllHospitals);
    },
    findByIdWithGroupMessage: function (hospitalId) {
        return db.query(sqlMapping.hospital.findByIdWithGroupMessage, hospitalId);
    },
    countOfEmployeesForDepartment: function (departmentId) {
        return db.query(sqlMapping.hospital.countOfEmployeesForDepartment, departmentId);
    },
    countOfJobTitleForRole: function (roleId) {
        return db.query(sqlMapping.hospital.countOfJobTitleForRole, roleId);
    },
    countOfEmployeeForJobTitle: function (roleId, jobTitleId) {
        return db.query(sqlMapping.hospital.countOfEmployeeForJobTitle, [roleId, jobTitleId]);
    },
    updateOutPatientStatus: function (oldStatus, newStatus) {
        return db.query('UPDATE Registration set outpatientStatus =? WHERE outpatientStatus = ?', [newStatus, oldStatus]);
    },
    findAccountInfo: function (hospitalId) {
        return db.query(sqlMapping.angelGuiderTransactionFlow.findAccount, hospitalId);
    },
    sumUnPaidAmount: function (patientId) {
        return db.query(sqlMapping.patient.sumUnPaidAmount, patientId);

    }
}