'use strict';
var restify = require('restify');
var config = require('./config');
var router = require('./common/router');
var auth = require('./common/auth');
var logger = require('./common/logger');
var socketio = require('socket.io');
var moment = require('moment');
var server = restify.createServer(config.server);
var io = socketio.listen(server.server);
var _ = require('lodash');
var notificationDAO = require('./dao/notificationDAO');
restify.CORS.ALLOW_HEADERS.push('Access-Control-Allow-Origin');
server.use(restify.CORS());
server.opts(/.*/, function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
    res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    res.send(200);
    return next();
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.dateParser());
server.use(restify.queryParser({
    mapParams: false
}));
server.use(restify.gzipResponse());
server.use(restify.bodyParser());
server.use(logger());
server.use(auth());
router.route(server);
server.on("uncaughtException", function (req, res, route, err) {
    res.send(err);
});
server.listen(config.server.port, config.server.host, function () {
    console.log('%s listening at %s', server.name, server.url);
});
io.sockets.on('connect', function (socket) {
    console.log(socket.handshake.query);
    var roomId = socket.handshake.query.roomId;
    socket.join(roomId);
    var data = [];
    notificationDAO.findPatientQueue(moment().format('YYYY-MM-DD'), roomId).then(function (queueList) {
        var data = [];
        queueList.forEach(function (queue) {
            if (!queue.clinic) queue.clinic = '1';
            queue.clinic = config.clinicConfig[queue.clinic];
            var item = _.find(data, {
                doctorId: queue.doctorId,
                doctorName: queue.doctorName,
   //             departmentName: queue.departmentName,
                clinic: queue.clinic
            });
            if (item) {
                if (item.sequences.length < 4)
                    item.sequences.push(queue.sequence);
            } else {
                data.push({
                    doctorId: queue.doctorId,
                    doctorName: queue.doctorName,
                    patientName: queue.patientName,
                    departmentName: queue.departmentName,
                    clinic: queue.clinic,
                    sequences: [queue.sequence]
                });
            }
        });
        return io.sockets.in(roomId).emit('refresh', data);
    });
});
process.on('queueEvent', function (data) {
    return io.sockets.in(data.floor).emit('message', data);
});
