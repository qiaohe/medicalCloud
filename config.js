'use strict';

module.exports = {
    server: {
        name: 'medical cloud platform',
        version: '0.0.1',
        host: 'localhost',
        port: 8083
    },
    db: {
        host: '121.42.171.213',
        port: '3306',
        user: 'root',
        password: 'heqiao75518',
        debug: false,
        multipleStatements: true,
        database: 'medicalDB'
    },
    app: {
        locale: 'zh_CN',
        tokenExpire: 8640000
    },
    redis: {
        host: '127.0.0.1',
        port: 6379
    },
    rongcloud: {
        appKey: 'm7ua80gbuxrim',
        appSecret: 'Z4Vyp9riQ9'
    },
    qiniu: {
        ak: "ZNrhKtanGiBCTOPg4XRD9SMOAbLzy8iREzQzUP5T",
        sk: "L6VfXirR55Gk6mQ67Jn4pg7bksMpc-F5mghT0GK4",
        prefix: "http://7xoadl.com2.z0.glb.qiniucdn.com/"
    },
    jpush: {
        masterSecret: "e359739da88500a8e7a93a3b",
        appKey: "ba7b7b62680de68a0d19fa5a"
    },
    sms: {
        providerUrl: 'http://115.29.44.189:8080/sms/smsInterface.do',
        template: '【云诊宝】您的邀请码是:code,赶快去注册使用吧.',
        expireTime: 600,
        option: {
            username: 'tuning',
            password: '111111'
        }
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
    transactionType: ['挂号消费', '充值交易'],
    memberType: ['初级用户', '银卡用户', '金卡用户', '学校用户', '企业用户', '儿童用户'],
    sourceType: ['陌生拜访', '市场活动', '门诊转化', '内部转移', '特殊推荐', '广告推广'],
    gender: ['男', '女'],
    outPatientType: ["初诊", "复诊", "院内转诊", "跨院转诊", "远程会诊", "远程初诊", "远程复诊"],
    outpatientStatus: ['未到', '结束', '已转诊', '已预约复诊', '转诊中', '待诊中', '已取消'],
    cashbackType: ['赠劵', '优惠券', '免单'],
    paymentType: ['银行卡', '储值卡', '现金', '代付', '微信钱包', '支付宝'],
    consumptionLevel: ['<1000', '1000~3000', '3000~5000', '5000~10000', '>10000'],
    employeeStatus: ['在职', '试用', '离职'],
    registrationNotificationTemplate: '【%s】，您已预约【%s医生】门诊，就诊时间%s。请提前半小时到分诊台，进行取号确认。',
    changeRegistrationTemplate: '【%s】，您已改约【%s医生】门诊，就诊时间%s。请提前半小时到分诊台，进行取号确认。',
    cancelRegistrationTemplate: '【%s】，您已取消预约【%s医生】%s门诊，如有需要请再次预约，谢谢！',
    outPatientReminderTemplate: '【%s】，您预约的【%s医生】%s门诊，现在离就诊时间还剩1小时，请提前到分诊台，进行确认。',
    outPatientCallTemplate: '【%s】，请您到%s诊室就诊，接诊医生：【%s】。',
    notAvailableTemplate: '【%s】，很抱歉，您预约的【%s医生】门诊，就诊时间%s已过，请及时与前台联系，谢谢！',
    returnRegistrationTemplte: '【%s】，很抱歉，您预约的【%s医生】门诊，就诊时间%s已过，请及时与前台联系，谢谢！',
    returnRegistrationTemplate: '【%s】，您已预约复诊【%s医生】%s门诊，请带好病历本及检查结果，提前到分诊台，进行确认。',
    orderStatus: ['未支付', '已支付', '已取消', '完成'],
    orderType: ["挂号费", "药费", "诊疗费"]
};
