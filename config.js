'use strict';

module.exports = {
    server: {
        name: 'medical cloud platform',
        version: '0.0.1',
        host: 'api.hisforce.cn',
        port: 8084
    },
    db: {
        host: '10.161.161.229',
        port: '3306',
        user: 'root',
        password: 'heqiao75518?',
        debug: false,
        multipleStatements: true,
        database: 'medicalDB'
    },
    app: {
        locale: 'zh_CN',
        tokenExpire: 8640000,
        orderDelayMinutes: 240,
        prefixOfDrugSendRole: '药房',
        prefixOfDoctorRole: '医生',
        prefixOfChargeRole: '收费',
        defaultHeadPic: 'http://7xrtp2.com2.z0.glb.qiniucdn.com/headPic.png'
    },
    redis: {
        host: '10.161.161.229',
        port: 6379
    },
    rongcloud: {
        appKey: 'vnroth0kru1bo',
        appSecret: 'VpGhM1NiOBP3W'
    },
    qiniu: {
        ak: "0d02DpW7tBPiN3TuZYV7WcxmN1C9aCiNZeW9fp5W",
        sk: "7zD3aC6xpvp_DfDZ0LJhjMq6n6nB6UVDbl37C5FZ",
        prefix: "http://7xrtp2.com2.z0.glb.qiniucdn.com/"
    },
    jpush: {
        masterSecret: "746f077c505f3195a4abf5a3",
        appKey: "21bd61c93392c3e2d1e48d4c"
    },
    sms: {
        providerUrl: 'https://sms.yunpian.com/v1/sms/send.json',
        template: '【云诊宝】您的短信验证码是:code,在30分钟内输入有效。',
        registerTemplate: '您好，感谢您到:hospital挂号就诊，现在可以使用尾号为:code的手机号登录查看病历信息了；密码默认为手机号后六位。我们竭诚为您服务，祝您早日康复！',
        expireTime: 1800000,
        apikey: '410ac09436843c0270f513a0d84802cc'
    },
    clinicConfig: {
        "1": "一诊室",
        "2": "二诊室",
        "3": "三诊室",
        "4": "四诊室",
        "5": "五诊室",
        "6": "六诊室",
        "7": "七诊室",
        "8": "八诊室",
        "9": "九诊室",
        "10": "十诊室",
        "11": "十一诊室",
        "12": "十二诊室"
    },
    registrationType: ["线上预约", "线下预约", "现场挂号", "复诊预约", "转诊挂号", "现场加号", "线上加号", "销售代约", "销售加号"],
    registrationStatus: ["预约成功", "预约未支付", "预约失败", "预约变更", "预约取消"],
    transactionType: ["付款交易", '充值交易'],
    memberType: ['初级用户', '银卡用户', '金卡用户', '学校用户', '企业用户', '儿童用户'],
    sourceType: ['陌生拜访', '市场活动', '门诊转化', '内部转移', '特殊推荐', '广告推广'],
    gender: ['男', '女'],
    outPatientType: ["初诊", "复诊", "院内转诊", "跨院转诊", "远程会诊", "远程初诊", "远程复诊"],
    outpatientStatus: ['未到', '结诊', '已转诊', '已预约复诊', '转诊中', '待诊中', '已取消'],
    cashbackType: ['赠劵', '优惠券', '免单'],
    paymentType: ['支付宝', '微信支付', '会员卡', '银行卡', '储值卡', '现金', '代付'],
    consumptionLevel: ['<1000', '1000~3000', '3000~5000', '5000~10000', '>10000'],
    employeeStatus: ['在职', '试用', '离职'],
    registrationNotificationTemplate: '【%s】，您已预约【%s医生】门诊，就诊时间%s。请提前半小时到分诊台，进行取号确认。',
    changeRegistrationTemplate: '【%s】，您已改约【%s医生】门诊，就诊时间%s。请提前半小时到分诊台，进行取号确认。',
    cancelRegistrationTemplate: '【%s】，您已取消预约【%s医生】%s门诊，如有需要请再次预约，谢谢！',
    outPatientReminderTemplate: '【%s】，您预约的【%s医生】%s门诊，现在离就诊时间还剩1小时，请提前到分诊台，进行确认。',
    outPatientCallTemplate: '【%s】您在%s门诊已开始，请尽快前往就诊。接诊医生：【%s】。',
    notAvailableTemplate: '【%s】，很抱歉，您预约的【%s医生】门诊，就诊时间已过，请及时与前台联系，谢谢！',
    returnRegistrationTemplate: '【%s】，您已预约复诊【%s医生】%s门诊，请带好病历本及检查结果，提前到分诊台，进行确认。',
    recipeOrderTemplate: '【%s】您在%s的药费订单%s已生成，为了您的康复，请通过收银窗口支付，或在一小时内完成网上支付。',
    medicalHistoryTemplate: '【%s】您在%s医生门诊病历已生成，您可以点击病历在线查看。',
    sendDrugTemplate: '【%s】您已领取【%s】医生在门诊号%S中开具的药品；请谨遵医嘱，祝您早日康复！',
    prescriptionOrderTemplate: '【%s】您在%s的诊疗费订单已生成，为了顺利完成诊疗，请通过收银窗口支付，或在一小时内完成网上支付。',
    orderStatus: ['未支付', '已支付', '已取消', '完成'],
    orderType: ["挂号费", "药费", "诊疗费"],
    inventoryType: ['入库', '出库']
};
