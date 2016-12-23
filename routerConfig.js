var authController = require('./controller/authController');
var thirdPartyController = require('./controller/thirdPartyController');
var employeeController = require('./controller/employeeController');
var businessPeopleController = require('./controller/businessPeopleController');
var hospitalController = require('./controller/hospitalController');
var registrationController = require('./controller/registrationController');
var dictController = require('./controller/dictController');
var patientController = require('./controller/patientController');
var medicalHistoryController = require('./controller/medicalHistoryController');
var deviceController = require('./controller/deviceController');

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
        path: "/api/employees/search",
        handler: employeeController.getEmployeeByMobile,
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
        path: '/api/doctors/performances',
        handler: medicalHistoryController.getDoctorPerformances,
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
        path: "/api/dict/salesMan",
        handler: dictController.getSalesMan,
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
        method: "get",
        path: "/api/dict/roleAndJobTitles",
        handler: dictController.getRoleAndJobTiles,
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
        path: "/api/patients/mobile/:mobile",
        handler: patientController.getPatientByMobile,
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
        path: "/api/patients/:patientId/transactionFlows",
        handler: patientController.getTransactionFlowOfPatient,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/patients/:patientId/prePaidHistories",
        handler: patientController.getPrePaidHistories,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/patients/:patientId/registrations",
        handler: patientController.getRegistrationsOfPatient,
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
        method: "post",
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
        method: "post",
        path: "/api/jobTitles/:id/authorities/:authorityId",
        handler: dictController.postAuthorityOfJobTitle,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/jobTitles/:id/authorities",
        handler: dictController.getAuthoritiesOfJobTitle,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/dict/diseases",
        handler: dictController.getDiseaseDic,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/departments/diseases",
        handler: dictController.getDiseasesOfDepartments,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/departments/:id/diseases",
        handler: dictController.getDiseasesOfDepartment,
        secured: 'user'
    },

    {
        method: "get",
        path: "/api/diseases/:id/types/:type/diseasesWords",
        handler: dictController.getDiseaseDicWords,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/dict/diseasesWords",
        handler: dictController.addDiseaseDicWord,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/dict/diseasesWords/:id",
        handler: dictController.removeDiseaseDicWord,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/dict/diseasesWords",
        handler: dictController.updateDiseaseDicWord,
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
        method: "get",
        path: "/api/departments/:id/medicalTemplates",
        handler: dictController.getMedicalTemplateBy,
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
        method: "get",
        path: "/api/medicalTemplates/search",
        handler: dictController.searchMedicalTemplates,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/medicalTemplates/:id",
        handler: dictController.removeMedicalTemplate,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/medicalTemplates/:id",
        handler: dictController.getMedicalTemplateById,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/chargeItems/summary",
        handler: dictController.summaryChargeItems,
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
    },
    {
        method: "get",
        path: "/api/drugs",
        handler: dictController.getDrugs,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/drugs/import",
        handler: dictController.importDrugs,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/export/drugs",
        handler: dictController.exportDrugs,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/export/hospitals",
        handler: dictController.exportHospitals
    },
    {
        method: "get",
        path: "/api/export/inventories",
        handler: dictController.exportInventories,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/drugs/search",
        handler: dictController.getDrugsBy,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/drugs/code/:code",
        handler: dictController.getDrugsByCode,
        secured: 'user'
    },

    {
        method: "get",
        path: "/api/chargeItems/search",
        handler: dictController.getChargeItemsBy,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/drugs/:id",
        handler: dictController.removeDrug,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/drugs",
        handler: dictController.removeDrugs,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/drugs",
        handler: dictController.addDrug,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/drugs",
        handler: dictController.updateDrug,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/drugs/:id",
        handler: dictController.getDrugById,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/drugInventory",
        handler: dictController.getDrugInventory,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/drugInventories",
        handler: dictController.getDrugInventories,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/drugs/:id/drugInventories",
        handler: dictController.getDrugInventoriesByDrug,
        secured: 'user'
    },

    {
        method: "get",
        path: "/api/drugInventoryHistories",
        handler: dictController.getDrugInventoryHistories,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/drugInventory",
        handler: dictController.addDrugInventory,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/drugInventory",
        handler: dictController.updateDrugInventory,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/drugInventory/:id",
        handler: dictController.removeDrugInventory,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/drugInventory/:id",
        handler: dictController.removeDrugInventory,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/medicalHistories",
        handler: medicalHistoryController.saveMedicalHistory,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/registrations/:id/medicalHistories",
        handler: medicalHistoryController.getMedicalHistories,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/patients/:id/medicalHistories",
        handler: medicalHistoryController.getMedicalHistoriesByPatientId,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/recipes",
        handler: medicalHistoryController.saveRecipe,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/recipes",
        handler: medicalHistoryController.updateRecipes,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/registrations/:id/recipes",
        handler: medicalHistoryController.getRecipes,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/registrations/:id/recipes",
        handler: medicalHistoryController.updateRecipe,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/registrations/:id/recipes/:recipeId",
        handler: medicalHistoryController.removeRecipe,
        secured: 'user'
    },

    {
        method: "put",
        path: "/api/registrations/:id/prescriptions",
        handler: medicalHistoryController.updatePrescription,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/registrations/:id/prescriptions/:prescriptionId",
        handler: medicalHistoryController.removePrescription,
        secured: 'user'
    },

    {
        method: "post",
        path: "/api/prescriptions",
        handler: medicalHistoryController.savePrescription,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/prescriptions",
        handler: medicalHistoryController.updatePrescriptions,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/orders/:orderNo/prescriptions",
        handler: medicalHistoryController.addPrescriptionsForOrder,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/orders",
        handler: medicalHistoryController.getOrderList,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/orders/:orderNo/refund",
        handler: medicalHistoryController.refundOrder,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/orders/:orderNo/discount",
        handler: medicalHistoryController.discountOrder,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/orders/:orderNo/appendPrescriptions",
        handler: medicalHistoryController.getAppendedPrescriptionsForOrder,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/registrations/:id/prescriptions",
        handler: medicalHistoryController.getPrescriptions,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/orders/type/:id",
        handler: medicalHistoryController.getOrdersBy,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/orders/type/:id/status/:status",
        handler: medicalHistoryController.getOrdersByAndStatus,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/orders/status/:status",
        handler: medicalHistoryController.getOrdersByStatus,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/orders/:id/recipes",
        handler: medicalHistoryController.getRecipesByOrderNo,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/orders/:id/status/:status",
        handler: medicalHistoryController.changeOrderStatus,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/orders/:orderNo",
        handler: medicalHistoryController.removeOrder,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/orders/usageRecords",
        handler: medicalHistoryController.getDrugUsageRecords,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/orders/charging",
        handler: medicalHistoryController.getOrderByOrderNos,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/orders/:orderNo/charging",
        handler: medicalHistoryController.chargeUnPaidOrder,
        secured: 'user'
    },

    {
        method: "post",
        path: "/api/orders/charging",
        handler: medicalHistoryController.chargeOrders,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/accountingInfo",
        handler: medicalHistoryController.getAccountingInfo,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/sys/dict/:type",
        handler: dictController.getSysDictByType,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/myHospital",
        handler: hospitalController.getMyHospital
    },
    {
        method: "get",
        path: "/api/drugSenders",
        handler: dictController.getDrugSenders,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/chargers",
        handler: dictController.getChargers,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/resetPwd",
        handler: authController.resetPwd
    },
    {
        method: "get",
        path: "/api/salesMan",
        handler: businessPeopleController.getSalesMan,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/salesMan",
        handler: businessPeopleController.getSalesMan,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/salesMan",
        handler: businessPeopleController.addSalesMan,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/salesMan",
        handler: businessPeopleController.updateSalesMan,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/salesMan/:id",
        handler: businessPeopleController.removeSalesMan,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/salesMan/:id/years/:year/performances",
        handler: businessPeopleController.getSalesManPerformances,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/salesMan/:id",
        handler: businessPeopleController.getSalesManInfo,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/salesMan/:id/performances",
        handler: businessPeopleController.addSalesManPerformances,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/checkIns",
        handler: businessPeopleController.getCheckIn,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/salesManRegistration",
        handler: businessPeopleController.getSalesManRegistrations,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/salesManSummary",
        handler: businessPeopleController.getSalesManSummary,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/groupMessages",
        handler: deviceController.getGroupMessages,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/groupMessages",
        handler: deviceController.addGroupMessage,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/groupMessages/patients",
        handler: deviceController.getPatientsOfGroupMessage,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/groupMessages/summary",
        handler: deviceController.getMessageSummary,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/transactionFlows",
        handler: hospitalController.getTransactionFlows,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/nurses",
        handler: employeeController.getNurses,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/drugCategories/types/:type",
        handler: dictController.getDrugCategories,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/drugCategories",
        handler: dictController.addDrugCategory,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/drugCategories",
        handler: dictController.updateDrugCategory,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/drugCategories/:id",
        handler: dictController.removeDrugCategory,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/outsideProcesses",
        handler: medicalHistoryController.addOutsideProcess,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/outsideProcesses",
        handler: medicalHistoryController.getOutsideProcesses,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/outsideProcesses/:id",
        handler: medicalHistoryController.removeOutsideProcess,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/outsideProcesses",
        handler: medicalHistoryController.updateOutsideProcess,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/appointments",
        handler: registrationController.getAppointments,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/appointments",
        handler: registrationController.addAppointment,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/appointments",
        handler: registrationController.updateAppointment,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/OutpatientServiceTypes",
        handler: dictController.getOutpatientServiceType,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/OutpatientServiceTypes",
        handler: dictController.updateOutpatientServiceType,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/OutpatientServiceTypes",
        handler: dictController.addOutpatientServiceType,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/OutpatientServiceTypes/:id",
        handler: dictController.removeOutpatientServiceType,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/doctors/:id/periods/:period/patients",
        handler: registrationController.getPatientsOfDoctorPeriod,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/patients/:id/unPaidOrders",
        handler: medicalHistoryController.getUnPaidOrders,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/dict/authorities",
        handler: dictController.addAuthority,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/dict/authorities",
        handler: dictController.updateAuthority,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/dict/authorities/:id",
        handler: dictController.deleteAuthority,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/dict/authorities",
        handler: dictController.getAuthorities,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/revisits",
        handler: registrationController.getRevisits,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/revisits",
        handler: registrationController.addRevisit,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/revisits/:id",
        handler: registrationController.delRevisit,
        secured: 'user'
    },
    {
        method: "put",
        path: "/api/revisits",
        handler: registrationController.updateRevisit,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/patients/:id/latestDoctor",
        handler: registrationController.getLatestDoctor,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/statistics/outpatient",
        handler: registrationController.statByOutPatient,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/statistics/doctor",
        handler: registrationController.statByDoctor,
        secured: 'user'
    },

    {
        method: "get",
        path: "/api/statistics/chargeByAndCategory",
        handler: registrationController.statByChargeByCategory,
        secured: 'user'
    }
];
