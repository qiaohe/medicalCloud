var authController = require('./controller/authController');
var thirdPartyController = require('./controller/thirdPartyController');
var employeeController = require('./controller/employeeController');
var businessPeopleController = require('./controller/businessPeopleController');
var hospitalController = require('./controller/hospitalController');
var registrationController = require('./controller/registrationController');
var dictController = require('./controller/dictController');
var patientController = require('./controller/patientController');

module.exports = [
    {
        method: "post",
        path: "/api/login",
        handler: authController.login
    },
    {
        method: "get",
        path: "/api/outPatients/histories",
        handler: hospitalController.getOutPatientHistories,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/logout",
        handler: authController.logout,
        secured: 'user'
    },
    {
        method: 'get',
        path: '/api/qiniu/token',
        handler: thirdPartyController.getQiniuToken
    },
    {
        method: "get",
        path: "/api/me",
        handler: authController.getMemberInfo,
        secured: 'user'
    },
    {
        method: 'post',
        path: '/api/employees',
        handler: employeeController.addEmployee,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/employees",
        handler: employeeController.getEmployees,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/employees/:id",
        handler: employeeController.getEmployeeById,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/employees",
        handler: employeeController.updateEmployee,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/employees/:id",
        handler: employeeController.deleteEmployee,
        secured: 'user'
    },
    {
        method: 'get',
        path: '/api/yearMonth/:yearMonth/performances',
        handler: businessPeopleController.getPerformanceByMonth,
        secured: 'user'
    },
    {
        method: 'get',
        path: '/api/years/:year/performances',
        handler: businessPeopleController.getPerformanceByYear,
        secured: 'user'
    },
    {
        method: 'get',
        path: '/api/contacts',
        handler: businessPeopleController.getContacts,
        secured: 'user'
    },
    {
        method: 'post',
        path: '/api/contacts',
        handler: businessPeopleController.addContact,
        secured: 'user'
    },
    {
        method: 'post',
        path: '/api/contacts/transfer',
        handler: businessPeopleController.transferContact,
        secured: 'user'
    },

    {
        method: "get",
        path: "/api/departments",
        handler: hospitalController.getDepartments,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/departments",
        handler: hospitalController.updateDepartment,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/departments/:id",
        handler: hospitalController.removeDepartment,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/departments",
        handler: hospitalController.addDepartment,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/departments/:departmentId/doctors",
        handler: hospitalController.getDoctorsByDepartment,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/doctors/:doctorId/shiftPlans",
        handler: hospitalController.getShitPlan,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/doctors/:doctorId",
        handler: hospitalController.getDoctorById,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/preRegistrationForOthers",
        handler: businessPeopleController.preRegistrationForContact,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/preRegistrationForOthers",
        handler: businessPeopleController.getPreRegistrationForContact,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/registrations/all",
        handler: registrationController.getRegistrations,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/registrations/today",
        handler: registrationController.getTodayRegistrations,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/registrations",
        handler: registrationController.addRegistration,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/registrations/:rid",
        handler: registrationController.getRegistration,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/registrations/:rid",
        handler: registrationController.changeRegistration,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/registrations",
        handler: hospitalController.changeOutPatientStatus,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/registrations/:rid",
        handler: registrationController.cancelRegistration,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/registrations/:rid/cancel",
        handler: registrationController.cancelRegistrationByBackend,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/dict/departments",
        handler: dictController.getDepartments,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/dict/doctors",
        handler: dictController.getDoctors,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/dict/businessPeoples",
        handler: dictController.getBusinessPeople,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/dict/years/:year/noPlan/businessPeoples",
        handler: dictController.getNoPlanBusinessPeople,
        secured: 'user'
    },

    {
        method: "get",
        path: "/api/businessPeoples/:id/contacts",
        handler: businessPeopleController.getContactsByBusinessPeopleId,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/dict/shiftPeriods",
        handler: dictController.getShiftPeriods,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/doctors/:doctorId/availableShiftPeriods",
        handler: dictController.getAvailablePeriods,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/dict/shiftPeriods",
        handler: dictController.addShiftPeriod,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/dict/shiftPeriods/:id",
        handler: dictController.removeShiftPeriod,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/dict/shiftPeriods",
        handler: dictController.editShiftPeriod,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/doctors/:doctorId/registrationFee",
        handler: dictController.getRegistrationFee,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/dict/jobTitles",
        handler: dictController.getJobTitles,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/employees/changePassword",
        handler: employeeController.changePassword,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/hospitals",
        handler: hospitalController.updateHospital,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/hospitals/me",
        handler: hospitalController.getHospital,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/doctors",
        handler: employeeController.getDoctors,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/groupCompanies",
        handler: patientController.getGroupCompanies,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/groupCompanies/:id",
        handler: patientController.getGroupCompany,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/groupCompanies",
        handler: patientController.insertGroupCompany,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/groupCompanies",
        handler: patientController.updateGroupCompany,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/groupCompanies/:id",
        handler: patientController.deleteGroupCompany,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/departments/doctors",
        handler: employeeController.getDoctorsGroupByDepartment,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/doctors",
        handler: employeeController.updateDoctor,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/doctors/:id",
        handler: employeeController.deleteDoctor,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/dict/provinces",
        handler: dictController.getProvinces,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/dict/provinces/:province/cities",
        handler: dictController.getCities,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/patients",
        handler: patientController.getPatients,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/patients",
        handler: patientController.addPatient,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/patients",
        handler: patientController.editPatient,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/prePaidHistories",
        handler: patientController.addPrePaidHistory,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/patients/basicInfo/:id",
        handler: patientController.getPatientBy,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/patients/:patientId",
        handler: patientController.getPatient,
        secured: 'user'
    },


    {
        method: "get",
        path: "/api/roles",
        handler: dictController.getRoles,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/roles",
        handler: dictController.addRole,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/roles",
        handler: dictController.editRole,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/roles/:id",
        handler: dictController.removeRole,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/roles/:roleId/jobTitles",
        handler: dictController.getJobTitlesByRole,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/roles/:roleId/jobTitles",
        handler: dictController.addJobTitlesByRole,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/roles/:roleId/jobTitles",
        handler: dictController.editJobTitlesByRole,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/roles/:roleId/jobTitles/:id",
        handler: dictController.removeJobTitlesByRole,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/doctors/:doctorId/shiftPlans",
        handler: hospitalController.addShitPlans,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/doctors/:doctorId/shiftPlans",
        handler: hospitalController.editShitPlans,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/pc/doctors/:doctorId/shiftPlans",
        handler: hospitalController.getShiftPlansOfDoctor,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/doctors/:doctorId/days/:day/shiftPlans",
        handler: hospitalController.getShiftPlansOfDay,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/performances",
        handler: hospitalController.getPerformances,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/businessPeoples/:id/performances",
        handler: hospitalController.getPerformancesBy,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/businessPeoples/:id/years/:year/performances",
        handler: hospitalController.removePerformancesBy,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/performances",
        handler: hospitalController.addPerformances,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/performances",
        handler: hospitalController.editPerformances,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/outPatients",
        handler: hospitalController.getOutpatients,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/outPatients/:id/queuing",
        handler: hospitalController.queueOutPatient,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/myRegistrations",
        handler: registrationController.getRegistrationsOfDoctor,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/notifications",
        handler: hospitalController.getNotifications,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/my/menus",
        handler: dictController.getMyMenus,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/menus",
        handler: dictController.getMenus,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/jobTitles/:id/menus",
        handler: dictController.getMenusOfJobTitle,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/jobTitles/:id/menus/:menuItemId",
        handler: dictController.postMenusOfJobTitle,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/dict/diseases",
        handler: dictController.getDiseaseDic,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/dict/diseases",
        handler: dictController.addDiseaseDic,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/dict/diseases/:id",
        handler: dictController.removeDiseaseDic,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/dict/diseases",
        handler: dictController.updateDiseaseDic,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/dict/type/:type",
        handler: dictController.getDictItems,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/dict",
        handler: dictController.addDicItem,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/dict/:id",
        handler: dictController.removeDictItem,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/dict",
        handler: dictController.updateDictItem,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/medicalTemplates",
        handler: dictController.getMedicalTemplate,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/medicalTemplates",
        handler: dictController.addMedicalTemplate,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/medicalTemplates",
        handler: dictController.updateMedicalTemplate,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/medicalTemplates/:id",
        handler: dictController.removeMedicalTemplate,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/chargeItems/:id",
        handler: dictController.removeChargeItem,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/chargeItems",
        handler: dictController.addChargeItem,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/chargeItems",
        handler: dictController.updateChargeItem,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/chargeItems",
        handler: dictController.getChargeItems,
        secured: 'user'
    }
];
