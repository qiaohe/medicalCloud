module.exports = {
    employee: {
        findByUserName: 'select * from Employee where hospitalId=? and mobile=?',
        findByUsernameAndDomain: 'select e.* from Employee e left join Hospital h on e.hospitalId=h.id where e.mobile=? and h.domainName=? ',
        findByName: 'select * from Employee where hospitalId=? and name=?',
        insert: 'insert Employee set ?',
        insertRole: 'insert Role set ?',
        deleteRole: 'delete from Role where id =?',
        findRoleByName:'select id from Role where hospitalId=? and `name` like ?',
        updateRole: 'update Role set ? where id=?',
        updateJobTitle: 'update JobTitle set ? where id=?',
        insertJobTitle: 'insert JobTitle set ?',
        deleteJobTitle: 'delete from JobTitle where role=? and id= ?',
        findByRole: 'select id, name from Employee where role=? and hospitalId=?',
        findByRoleName: 'select e.`name`, e.id from Employee e left JOIN Role r on e.role = r.id where e.hospitalId=? and r.`name` like ?',
        findNoPlanBusinessPeople: 'select id, name from Employee where hospitalId = ? and role = 4 and id not in(select DISTINCT businessPeopleId from Performance where left(yearMonth, 4) =?)',
        updateEmployee: 'update Employee set password=? where mobile = ?',
        updateEmployeeByUid: 'update Employee set ? where id = ?',
        findEmployees: 'select SQL_CALC_FOUND_ROWS e.id, e.`name`, d.`name` as department, e.mobile, e.gender, e.birthday, job.`name` as jobTitle, role.`name` as role, e.`status`, e.maxDiscountRate  from Employee e LEFT JOIN Department d on d.id = e.department left JOIN Role role on role.id = e.role left JOIN JobTitle job on job.id = e.jobTitle where e.hospitalId =? order by e.id desc limit ?,?',
        findRoles: 'select id, name from Role where hospitalId = ?',
        findById: 'select * from Employee where id=? and hospitalId =?',
        findByIdWithHospital: 'select e.*, h.name as hospitalName from Employee e, Hospital h where e.hospitalId = h.id and e.hospitalId= ? and  e.id = ?',
        findJobTitleByRole: 'select id, name from JobTitle where hospitalId = ? and role =?',
        findJobTitleById: 'select * from JobTitle where id = ?',
        findDepartmentById: 'select * from Department where id=?',
        delete: 'delete from Employee where id =?',
        updateDoctorByDepartment: 'update Doctor set departmentName=? where departmentId=?'
    },
    businessPeople: {
        deletePerformancesBy: 'delete from Performance where businessPeopleId = ? and left(yearMonth,4) = ?',
        findRegistrationById: 'select * from Registration where id=?',
        updatePatientBasicInfo: 'update PatientBasicInfo set ? where id = ?',
        findRegistrationsByUid: 'select r.id, r.patientMobile, r.doctorId, doctorName, doctorHeadPic,registrationFee, departmentName,doctorJobTitle, hospitalName, patientName,concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , s.`name`) as shiftPeriod, orderNo, r.status  from Registration r, ShiftPeriod s where r.shiftPeriod = s.id and creator = ? and r.registrationType <>7 order by r.registerDate, r.shiftPeriod limit ?,?',
        findRegistrationsByUidAndMobile: 'select r.id, r.patientMobile, r.doctorId, doctorName, doctorHeadPic,registrationFee, departmentName,doctorJobTitle, hospitalName, patientName,concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , s.`name`) as shiftPeriod, orderNo, r.status  from Registration r, ShiftPeriod s where r.shiftPeriod = s.id and creator = ? and r.patientMobile=? and r.registrationType =7 order by r.id desc limit ?,?',
        findShiftPeriodById: 'select * from ShiftPeriod where hospitalId = ? and id =?',
        insertPatient: 'insert Patient set ?',
        findPatientByBasicInfoId: 'select * from Patient where patientBasicInfoId = ? and hospitalId=?',
        insertPatientBasicInfo: 'insert PatientBasicInfo set ?',
        findPatientBasicInfoBy: 'select * from PatientBasicInfo where mobile=?',
        findPatientBasicInfoByPatientId: 'select pb.* from PatientBasicInfo pb left JOIN Patient p on pb.id = p.patientBasicInfoId where p.id=?',
        findPatientBy: 'select * from Patient where hospitalId=? and patientBasicInfoId=?',
        updateShiftPlan: 'update ShiftPlan set actualQuantity = actualQuantity + 1 where doctorId = ? and day =? and shiftPeriod = ?',
        updateShiftPlanDec: 'update ShiftPlan set actualQuantity = actualQuantity - 1 where doctorId = ? and day =? and shiftPeriod = ?',
        findShiftPlanByDoctorAndShiftPeriod: 'select * from ShiftPlan where doctorId=? and day=? and shiftPeriod =?',
        insertRegistration: 'insert Registration set ?',
        findContactById: 'select * from InvitationContact where id = ?',
        insertInvitation: 'insert Invitation set ?',
        updateContact: 'update InvitationContact set inviteTimes = inviteTimes + 1 where id =?',
        findContactBusinessPeopleIdAndMobile: 'select * from InvitationContact where businessPeopleId=? and mobile=?',
        insertContact: 'insert InvitationContact set ?',
        findPerformanceByMonth: 'select actualCount, plannedCount, ROUND(actualCount / plannedCount, 2) as completePercentage from Performance where businessPeopleId = ? and yearMonth=?',
        findPerformanceByYear: 'select sum(actualCount)as actualCount, sum(plannedCount)  as plannedCount from Performance where businessPeopleId = ? and SUBSTRING(yearMonth, 1, 4) = ?',
        findContactsBy: 'select id, mobile, name, createDate, inviteTimes, source, inviteResult from InvitationContact where businessPeopleId=?',
        findContactsByPagable: 'select SQL_CALC_FOUND_ROWS ic.id, ic.mobile, ic.name, ic.createDate, ic.inviteTimes, ic.source, ic.inviteResult,gc.`name` as groupName from InvitationContact ic left join GroupCompany gc on gc.id = ic.groupId where ic.businessPeopleId=? limit ?, ?',
        findShiftPeriods: 'select id, name from ShiftPeriod where hospitalId = ?',
        findAvailableShiftPeriods: 'select shiftPeriod, p.`name` from ShiftPlan sp, ShiftPeriod p where p.id = sp.shiftPeriod and sp.hospitalId=? and doctorId=? and `day`=? and plannedQuantity > actualQuantity order by shiftPeriod',
        addShiftPeriod: 'insert ShiftPeriod set ?',
        deleteShiftPeriod: 'delete from ShiftPeriod where id = ?',
        updateShiftPeriod: 'update ShiftPeriod set name=? where id=?',
        transferContact: 'update InvitationContact set businessPeopleId=? where id in ',
        addTransferHistory: 'insert ContactTransferHistory set ?',
        insertPerformance: 'insert Performance set ?',
        updatePerformance: 'update Performance set plannedCount = ? where businessPeopleId= ? and yearMonth = ?',
        findPerformances: 'select e.id as businessPeopleId, e.`name`, p.yearMonth, actualCount, plannedCount,ROUND(actualCount / plannedCount, 2) as completePercentage from Performance p, Employee e where e.id = p.businessPeopleId and e.hospitalId=? ',
        findBusinessPeopleWithPage: 'select SQL_CALC_FOUND_ROWS distinct p.businessPeopleId, e.name from Performance p, Employee e where e.id = p.businessPeopleId and e.hospitalId=?',
        findPerformancesBy: 'select e.id as businessPeopleId, e.`name`, p.yearMonth, actualCount, plannedCount,ROUND(actualCount / plannedCount, 2) as completePercentage from Performance p, Employee e where e.id = p.businessPeopleId and p.businessPeopleId=? order by p.yearMonth'
    },
    hospital: {
        findDepartments: 'select id, name from Department where hospitalId = ?',
        findByNameLike: 'select id, name, tag from Hospital where name like ?',
        findById: 'select id, name, tag, images, address, icon, introduction, trafficRoute, telephone, districtId, provId, cityId from Hospital where id = ?',
        insertPatient: 'insert Patient set ?',
        findPatientByBasicInfoId: 'select * from Patient where patientBasicInfoId = ?',
        findJobTitles: 'select id, name from JobTitle where hospitalId =?',
        findHospitalByDomainName: 'select * from Hospital where domainName = ?',
        update: 'update Hospital set ? where id = ?',
        findCustomerServiceId: 'select customerServiceUid from Hospital where id =? ',
        deleteMenuByJobTitle: 'delete from JobTitleMenuItem where jobTitleId=? and menuItem=?',
        insertMenuItem: 'insert JobTitleMenuItem set ?',
        findJobTitleMenuItem: 'select * from JobTitleMenuItem where jobTitleId=? and menuItem=?',
        findMenusByJobTitle: 'select m.`name`, m.id from JobTitleMenuItem i left JOIN Menu m on m.id = i.menuItem where i.jobTitleId=?',
        findMenus: 'select id, name from Menu',
        findMyMenus: 'select u.name, u.id, u.pid, u.routeUri, u.icon from Employee e left JOIN JobTitleMenuItem m on m.jobTitleId = e.jobTitle left join Menu u on u.id = m.menuItem  where e.id = ? order by u.pid, u.sortIndex'
    },

    department: {
        findByHospital: 'select SQL_CALC_FOUND_ROWS * from Department where hospitalId = ? order by id desc limit ?, ?',
        insert: 'insert Department set ?',
        update: 'update Department set ? where id = ?',
        delete: 'delete from Department where id=?'
    },

    doctor: {
        insert: 'insert Doctor set ?',
        findDoctors: 'select id, name from Doctor where hospitalId=?',
        findDiscountRateOfDoctor: 'select maxDiscountRate from Employee where hospitalId=? and id=?',
        findDoctorsByHospital: 'select SQL_CALC_FOUND_ROWS d.*, e.birthday, d.clinic, e.mobile from Doctor d, Employee e where e.id = d.employeeId and d.status <> 2 and d.hospitalId = ? order by d.id desc limit ?, ?',
        findDoctorsGroupByDepartment: 'select id, name, departmentName from Doctor where status <> 2 and hospitalId = ?',
        findByDepartment: 'select id, name, departmentName, hospitalName, headPic,registrationFee, speciality,jobTitle from Doctor where hospitalId = ?  and departmentId = ?',
        findById: 'select id, name, departmentName,hospitalId, hospitalName, headPic,registrationFee, speciality,jobTitle, departmentId, jobTitleId from Doctor where id =?',
        findShitPlans: 'select p.`name` as period, `day`, actualQuantity, plannedQuantity, p.id as periodId from ShiftPlan sp, ShiftPeriod p where sp.shiftPeriod = p.id and sp.doctorId = ? and sp.day>? and sp.day<=? and sp.actualQuantity < sp.plannedQuantity and sp.plannedQuantity > 0 order by sp.day, sp.shiftPeriod',
        findBy: 'select id, name, departmentName,hospitalId, hospitalName, headPic,registrationFee, speciality,jobTitle from Doctor where departmentId=? and registrationFee=? and id<>?',
        update: 'update Doctor set ? where id = ?',
        updateBy: 'update Doctor set ? where employeeId = ?',
        delete: 'delete from Doctor where id=?',
        deleteDoctorBy: 'delete from Doctor where employeeId =?',
        findWaitOutpatients: 'select SQL_CALC_FOUND_ROWS concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , sp.`name`) as registerDate, r.id, r.patientName, r.patientMobile, r.gender, r.age, r.sequence, r.registrationType, r.`comment`, r.outPatientType, r.createDate, r.businessPeopleName as recommender, r.outpatientStatus, pi.balance, pi.memberType,pi.memberCardNo, r.patientId, d.clinic from Registration r LEFT JOIN  PatientBasicInfo p on p.id = r.patientBasicInfoId left JOIN ShiftPeriod sp on sp.id = r.shiftPeriod LEFT JOIN Patient pi on pi.id = r.patientId LEFT JOIN Doctor d ON d.id = r.doctorId where d.employeeId = ? and r.registerDate=? and r.status<>4 and r.sequence is not null order by field(r.outpatientStatus, 5, 0, 1), r.shiftPeriod, r.createDate limit ?, ?',
        findFinishedCountByDate: 'select count(*) as count from Registration r where r.doctorId = ? and r.registerDate=? and r.outPatientStatus=1',
        findHistoryOutpatients: 'select SQL_CALC_FOUND_ROWS concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , sp.`name`) as registerDate, r.id, r.patientName, r.patientMobile, r.gender, r.age, r.sequence, r.registrationType, r.`comment`, r.outPatientType, r.createDate, r.businessPeopleName as recommender, r.outpatientStatus from Registration r LEFT JOIN  PatientBasicInfo p on p.id = r.patientBasicInfoId left JOIN ShiftPeriod sp on sp.id = r.shiftPeriod LEFT JOIN Doctor d ON d.id = r.doctorId where d.employeeId = ? and r.outPatientStatus = 1 order by r.registerDate, r.sequence'
    },

    registration: {
        insertRegistrationCancelHistory: 'insert RegistrationCancelHistory set ?',
        addShiftPlan: 'insert ShiftPlan set ?',
        updateShiftPlanBy: 'update ShiftPlan set plannedQuantity=? where doctorId=? and day=? and shiftPeriod=?',
        findShiftPlans: 'select day, shiftPeriod, actualQuantity, plannedQuantity from ShiftPlan where hospitalId = ? and doctorId = ? order by day desc',
        findShiftPlansByDay: 'select shiftPeriod, actualQuantity, plannedQuantity from ShiftPlan where hospitalId = ? and doctorId = ? and day = ? order by shiftPeriod desc',
        findShiftPlansByDayWithName: 'select shiftPeriod,s2.`name` as shiftPeriodName,plannedQuantity - actualQuantity as restQuantity from ShiftPlan s1, ShiftPeriod s2 where s1.shiftPeriod = s2.id and s1.hospitalId = ? and s1.doctorId = ? and s1.day = ? order by s1.shiftPeriod desc',
        insert: 'insert Registration set ?',
        updateShiftPlan: 'update ShiftPlan set actualQuantity = actualQuantity + 1 where doctorId = ? and day =? and shiftPeriod = ?',
        updateShiftPlanDec: 'update ShiftPlan set actualQuantity = actualQuantity - 1 where doctorId = ? and day =? and shiftPeriod = ?',
        findShiftPeriodById: 'select * from ShiftPeriod where hospitalId = ? and id =?',
        findRegistrationsByUid: 'select r.id, r.doctorId, doctorName, doctorHeadPic,registrationFee, departmentName,doctorJobTitle, hospitalName, patientName,concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , s.`name`) as shiftPeriod, orderNo, r.status  from Registration r, ShiftPeriod s where r.shiftPeriod = s.id and paymentType =1 and patientBasicInfoId = ? and r.status <>4 order by r.registerDate, r.shiftPeriod limit ?,?',
        findById: 'select * from Registration where id =?',
        updateRegistration: "update Registration set ? where id = ?",
        findRegistrations: 'select SQL_CALC_FOUND_ROWS r.id,r.outpatientStatus, r.patientMobile,r.patientName,r.gender, p.balance, p.memberCardNo, r.memberType, r.doctorName, r.`comment`, r.registrationFee, r.registrationType, r.departmentName, concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , s.`name`) as registerDate, r.createDate, r.outPatientType, r.status, r.sequence, e.name as businessPeopleName, r.outpatientStatus from Registration r LEFT JOIN Employee e on e.id=r.businessPeopleId left JOIN ShiftPeriod s ON s.id= r.shiftPeriod left join Patient p on p.id=r.patientId left join Doctor d on d.id=r.doctorId where r.patientId =p.id and r.status <>4 and r.hospitalId = ? order by r.id desc limit ?, ?',
        findRegistrationsById: 'select * from Registration where id=?',
        findRegistrationsByIdWithDetail: 'select r.*, d.floor, doc.clinic from Registration r left JOIN Department d on d.id = r.departmentId left JOIN Doctor doc on doc.id = r.doctorId where r.id=?',
        findCurrentQueueByRegId: 'select r.id, doctorName, departmentName, patientName, registrationType, outPatientType, outpatientStatus, p.balance, p.memberType from Registration r LEFT JOIN Patient p on p.id =r.patientId where r.id =?',
        findRegistrationsBy: 'select SQL_CALC_FOUND_ROWS r.id,r.outpatientStatus, r.patientMobile,r.patientName,r.gender, p.balance, p.memberCardNo, r.memberType, r.doctorName, r.`comment`, r.registrationFee, r.registrationType, r.departmentName, concat(DATE_FORMAT(r.registerDate, \'%Y-%m-%d \') , s.`name`) as registerDate, r.outPatientType, r.status, r.sequence, e.name as businessPeopleName, r.outpatientStatus from Registration r LEFT JOIN Employee e on e.id=r.businessPeopleId left JOIN ShiftPeriod s ON s.id= r.shiftPeriod, Patient p where r.patientId =p.id and r.hospitalId = ? and r.registerDate=? order by r.id desc limit ?, ?'
    },
    patient: {
        updatePatient: 'update Patient set ? where id = ?',
        findByPatientByMobile: 'SELECT p.memberType, pc.gender, pc.birthday, pc.mobile, pc.realName from Patient p LEFT JOIN PatientBasicInfo pc on pc.id = p.patientBasicInfoId where hospitalId = ? and pc.mobile = ?',
        findGroupCompanies: 'select SQL_CALC_FOUND_ROWS gc.*, e.`name` as recommenderName from GroupCompany gc left JOIN Employee e on e.id = gc.recommender where gc.hospitalId=? order by gc.id desc limit ?, ?',
        updateGroupCompany: 'update GroupCompany set ? where id = ?',
        deleteGroupCompany: 'delete from GroupCompany where id = ?',
        insertGroupCompany: 'insert GroupCompany set ?',
        findPatients: 'select SQL_CALC_FOUND_ROWS p.id, pb.`name`, pb.gender, pb.headPic,pb.birthday, pb.mobile, p.memberCardNo,p.memberType,p.source,e.`name` as recommenderName,p.consumptionLevel, gc.`name` as groupName, p.groupId from Patient p left JOIN Employee e on e.id = p.recommender left JOIN GroupCompany gc on gc.id = p.groupId, PatientBasicInfo pb where p.patientBasicInfoId = pb.id and p.hospitalId =? order BY p.createDate desc limit ?, ?',
        insertPrePaidHistory: 'insert PrepaidHistory set ?',
        updatePatientBalance: 'update Patient set balance = balance + ? where id =?',
        insertTransactionFlow: 'insert TransactionFlow set ?',
        findByPatientId: 'select * from Patient where id=?',
        findPatientBasicInfoById: 'select * from PatientBasicInfo where id=?',
        findByPatientBasicInfo: 'select e.id as recommenderId, pb.address, pb.idCard, p.balance, p.cashbackType, p.`comment`, p.maxDiscountRate, p.source, p.id, pb.`name`, pb.gender, pb.headPic,pb.birthday, pb.mobile, p.memberCardNo,p.memberType,p.source,e.`name` as recommenderName,p.consumptionLevel, gc.`name` as groupName, p.groupId  from Patient p left JOIN Employee e on e.id = p.recommender LEFT JOIN GroupCompany gc on gc.id =p.groupId , PatientBasicInfo pb where p.patientBasicInfoId = pb.id and p.id = ? and p.hospitalId =?',
        findTransactionFlows: 'select SQL_CALC_FOUND_ROWS * from TransactionFlow where patientId=? and hospitalId = ? order by createDate desc limit ?, ?',
        findRegistrations: 'select SQL_CALC_FOUND_ROWS * from Registration where patientId = ? and hospitalId = ? order by createDate desc limit ?,?',
        findGroupCompanyById: 'select gc.*, e.`name` as recommenderName from GroupCompany gc left JOIN Employee e on e.id = gc.recommender where gc.id=?'
    },
    city: {
        findProvinces: 'select DISTINCT province from city',
        findCities: 'select cityId, city from city where province=?'
    },
    notification: {
        insert: 'insert Notification set ?',
        findAll: 'select SQL_CALC_FOUND_ROWS * from Notification where hospitalId=? ',
        findPatientQueue: 'select doctorId, doctorName, r.departmentName, d.clinic, patientName, sequence from Registration r LEFT JOIN Doctor d on d.id = r.doctorId left JOIN Department dep on dep.id = d.departmentId left JOIN Hospital h ON h.id = r.hospitalId where r.registerDate = ? and dep.floor = ? and h.domainName= ? and r.sequence is not null and (r.outpatientStatus =0 or r.outpatientStatus = 5) and r.status <>4 order by doctorId, sequence',
        findPatientQueueByDepartmentId: 'select doctorId, doctorName, r.departmentName, d.clinic, patientName, sequence, dep.floor from Registration r LEFT JOIN Doctor d on d.id = r.doctorId left JOIN Department dep on dep.id = d.departmentId where r.registerDate = ? and dep.id = ? and r.sequence is not null and (r.outpatientStatus =0 or r.outpatientStatus = 5) and r.status <>4 order by doctorId, sequence',
        findPatientQueueBy: 'select doctorId, doctorName, r.departmentName, d.clinic, patientName, sequence, dep.floor from Registration r LEFT JOIN Doctor d on d.id = r.doctorId left JOIN Department dep on dep.id = d.departmentId where r.id=?',
        findSequencesBy: 'select r.sequence from Registration r where r.doctorId =? and sequence>=? and (r.outpatientStatus =0 or r.outpatientStatus = 5) and r.registerDate= ? order by sequence limit 3'
    },
    device: {
        insert: 'insert Device set ?',
        findByToken: 'select * from Device where token = ?',
        findByUid: 'select * from Device where uid = ?',
        update: 'update Device set ? where token =?',
        findTokenByUid: 'select token from Device where uid=?'
    },
    dict: {
        insertDisease: 'insert DiseaseDic set ?',
        updateDisease: 'update DiseaseDic set ? where id=?',
        deleteDisease: 'delete from DiseaseDic where id = ?',
        findDiseases: 'select SQL_CALC_FOUND_ROWS d.*, dep.`name` as departmentName, e.`name` as creatorName from DiseaseDic d left JOIN Department dep on dep.id=d.departmentId left JOIN Employee e on e.id = d.creator where d.hospitalId = ? ',
        insertDictItem: 'insert Dictionary set ?',
        updateDictItem: 'update Dictionary set ? where id = ?',
        deleteDictItem: 'delete from Dictionary where id =?',
        findDictItems: 'select SQL_CALC_FOUND_ROWS * from Dictionary where hospitalId =? and type=? limit ?,?',
        findMedicalTemplates: 'select SQL_CALC_FOUND_ROWS d.`name` as departmentName, dic.`name` as diseaseType, m.* from MedicalTemplate m left JOIN DiseaseDic dic on dic.id=m.diseaseId left JOIN Department d on d.id=m.departmentId where m.hospitalId =? ',
        insertMedicalTemplte: 'insert MedicalTemplate set ?',
        getMedicalTemplateBy: 'select id, name from MedicalTemplate where hospitalId=? and departmentId=?',
        findMedicalTemplateById: 'select * from MedicalTemplate where id=?',
        deleteMedicalTemplate: 'delete from MedicalTemplate where id=?',
        updateMedicalTemplate: 'update MedicalTemplate set ? where id=?',
        insertChargeItem: 'insert ChargeItem set ?',
        updateChargeItem: 'update ChargeItem set ? where id=?',
        deleteChargeItem: 'delete from ChargeItem where id=?',
        findChargeItemById: 'select * from ChargeItem where id=?',
        findChargeItems: 'select SQL_CALC_FOUND_ROWS c.*, d.`value` as categoryName from ChargeItem c left join Dictionary d on d.id = c.categoryId where c.hospitalId=? ',
        findDrugs: 'select SQL_CALC_FOUND_ROWS * from Drug where hospitalId=? order by id desc LIMIT ?, ?',
        findDrugsBy: 'select * from Drug where hospitalId=? and ',
        findChargeItemsBy: 'select * from ChargeItem where hospitalId=? and ',
        insertDrug: 'insert Drug set ?',
        updateDrug: 'update Drug set ? where id = ?',
        deleteDrug: 'delete from Drug where id=?',
        findDrugById: 'select * from Drug where id = ?',
        findDrugInventory: 'select SQL_CALC_FOUND_ROWS di.*, d.name, d.company, d.code, d.type, d.dosageForm, d.specification,d.unit,d.tinyUnit,d.factor, d.sellPrice, d.criticalInventory from DrugInventory di left JOIN Drug d on d.id = di.drugId where di.hospitalId = ? order by di.id desc limit ?,?',
        insertDrugInventory: 'insert DrugInventory set ?',
        updateDrugInventory: 'update DrugInventory set ? where id=?',
        deleteDrugInventory: 'delete DrugInventory where id=?',
        findDrugInventoryBy: 'select * from DrugInventory where hospitalId=? and drugId=? and batchNo=?'
        /*
         select SUM(di.restAmount) as inventory, d.*  FROM Drug d left join DrugInventory di on d.id = di.drugId group BY d.id
         */
    },
    medical: {
        insertMedicalHistory: 'insert MedicalHistory set ?',
        updateMedicalHistory: 'update MedicalHistory set ? where id=?',
        findMedicalHistoryBy: 'select * from MedicalHistory where registrationId = ?',
        findMedicalHistoryByPatientId: 'select * from MedicalHistory where patientId = ? order by createDate desc',
        findRecipesByOrderNo: 'select * from Recipe where orderNo = ?',
        insertRecipe: 'insert Recipe set ?',
        insertPrescription: 'insert Prescription set ?',
        findPrescriptionsBy: 'select * from Prescription where registrationId = ?',
        findPrescriptionsByOrderNo: 'select * from Prescription where orderNo = ?',
        findRecipesBy: 'select * from Recipe where registrationId = ?',
        findDrugInventoryByDrugId: 'select id, drugId, restAmount, batchNo, expireDate from  DrugInventory where drugId=? and expireDate>=? and putOutDate is null and restAmount>? order by expireDate '
    },
    order: {
        insert: 'insert MedicalOrder set ?',
        update: 'update MedicalOrder set ? where orderNo =?',
        updateBy: 'update MedicalOrder set ?, paidAmount=paymentAmount where orderNo =?',
        findExtraFeeBy: 'SELECT d.`value` as fieldName, sum(receivable) as sum from Prescription p left join ChargeItem c ON p.chargeItemId = c.id left join Dictionary d on d.id=c.categoryId WHERE c.categoryId is not NULL and p.orderNo=? group by categoryId',
        findOrdersByStatus: 'select SQL_CALC_FOUND_ROWS m.*, r.patientName, r.departmentId, r.departmentName,r.patientMobile,r.memberType, r.hospitalId, r.hospitalName, r.doctorId, r.doctorName,r.patientId from MedicalOrder m left join Registration r on m.registrationId = r.id where m.hospitalId= ? and m.status=?',
        findOrdersBy: 'select SQL_CALC_FOUND_ROWS  m.*, r.patientName,r.patientMobile,r.memberType, r.departmentId, r.departmentName, r.hospitalId, r.hospitalName, r.doctorId, r.doctorName,r.patientId from MedicalOrder m left join Registration r on m.registrationId = r.id where m.hospitalId= ? ',
        findDrugUsageRecords: 'SELECT SQL_CALC_FOUND_ROWS rp.*, rg.patientName, rg.doctorName, rg.departmentName, rg.patientMobile, m.drugSenderName, m.sendDrugDate from Recipe rp left join Registration rg on rp.registrationId = rg.id left join MedicalOrder m on m.orderNo = rp.orderNo where rp.hospitalId=? ',
        findOrdersByType: 'select SQL_CALC_FOUND_ROWS m.*, r.patientName,r.patientMobile,r.memberType,r.departmentId,r.patientId, r.departmentName, r.hospitalId, r.hospitalName, r.doctorId, r.doctorName from MedicalOrder m left join Registration r on m.registrationId = r.id where m.hospitalId=? and m.type=? ',
        findOrdersByTypeAndStatus: 'select SQL_CALC_FOUND_ROWS m.*, r.patientName,r.patientMobile,r.memberType, r.patientId, r.departmentId, r.departmentName, r.hospitalId, r.hospitalName, r.doctorId, r.doctorName from MedicalOrder m left join Registration r on m.registrationId = r.id where m.hospitalId=? and m.type=? and m.status=? limit ?,?',
        findByOrderNos: 'select m.discountRate, m.registrationId, m.type,m.orderNo,m.createDate, m.amount, m.paymentAmount, r.patientName,r.patientMobile,  r.departmentName, r.doctorName,r.patientId from MedicalOrder m left join Registration r on m.registrationId = r.id where m.hospitalId= ? and m.status=0 and m.orderNo in ',
        findOrderByOrderNo: 'select r.patientBasicInfoId, r.patientMobile, h.patientName, r.hospitalName, r.departmentName, r.doctorName,r.sequence from MedicalOrder m left join Registration r on m.registrationId = r.id left JOIN MedicalHistory h on h.registrationId = m.registrationId where m.orderNo=?'
    }
};
