var config = require('../config');
var kue = require('kue');
var medicalDAO = require('../dao/medicalDAO');
var pusher = require('../domain/NotificationPusher');
var deviceDAO = require('../dao/deviceDAO');
var util = require('util');
var queue = kue.createQueue({
    redis: {
        port: config.redis.port,
        host: config.redis.host
    }
});
queue.processCallback = function (orderNo, callback) {
    medicalDAO.findOrdersBy(orderNo).then(function (orders) {
        var order = orders[0];
        if (order.status == 0) {
            //var template = order.type == 0 ? config.paymentDelayRegistrationTemplate : config.paymentDelayRecipeTemplate;
            //deviceDAO.findTokenByUid(order.patientBasicInfoId).then(function (tokens) {
            //    if (tokens.length && tokens[0]) {
            //        var notificationBody = {};
            //        notificationBody = util.format(template, order.patientName + (order.gender == 0 ? '先生' : '女士'),
            //            order.hospitalName + '的' + config.orderType[order.type], orderNo);
            //        pusher.push({
            //            body: notificationBody,
            //            title: config.orderType[order.type] + '订单失效',
            //            audience: {registration_id: [tokens[0].token]},
            //            patientName: order.patientName,
            //            patientMobile: order.patientMobile,
            //            uid: order.patientBasicInfoId,
            //            type: 1,
            //            hospitalId: order.hospitalId
            //        }, function (err, result) {
            //            callback(err, null);
            //        });
            //    }
            //});
            medicalDAO.updateOrder({orderNo: orderNo, status: 2}).then(function (result) {
                callback(null, null);
            });
        }
    }).catch(function (err) {
        callback(err, null);
    })
}
module.exports = queue;