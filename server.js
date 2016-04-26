'use strict';
var restify = require('restify');
var config = require('./config');
var router = require('./common/router');
var auth = require('./common/auth');
var logger = require('./common/logger');
var socketio = require('socket.io');
var moment = require('moment');
var redis = require('./common/redisClient');
var server = restify.createServer(config.server);
var io = socketio.listen(server.server);
var _ = require('lodash');
var notificationDAO = require('./dao/notificationDAO');
var hospitalDAO = require('./dao/hospitalDAO');
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
    if (socket.handshake.query.roomId) {
        var roomId = socket.handshake.query.roomId;
        console.log(socket.handshake.query.roomId);
        socket.join(roomId);
        var data = {};
        console.log(socket.handshake.headers);
        if (socket.handshake.headers.origin) {
            var domainName = socket.handshake.headers.origin.substring(7, socket.handshake.headers.origin.length);
            console.log(socket.handshake.headers.origin);
            hospitalDAO.findHospitalByDomainName(domainName).then(function (hospitals) {
                data.hospitalName = hospitals[0].name;
                notificationDAO.findPatientQueue(moment().format('YYYY-MM-DD'), roomId, domainName).then(function (queueList) {
                    var patients = [];
                    queueList.forEach(function (queue) {
                        if (!queue.clinic) queue.clinic = '1';
                        queue.clinic = config.clinicConfig[queue.clinic];
                        var item = _.find(patients, {
                            doctorId: queue.doctorId,
                            doctorName: queue.doctorName,
                            //             departmentName: queue.departmentName,
                            clinic: queue.clinic
                        });
                        if (item) {
                            if (item.sequences.length < 4)
                                item.sequences.push(queue.sequence);
                        } else {
                            patients.push({
                                doctorId: queue.doctorId,
                                doctorName: queue.doctorName,
                                patientName: queue.patientName,
                                departmentName: queue.departmentName,
                                clinic: queue.clinic,
                                sequences: [queue.sequence]
                            });
                        }
                    });
                    data.patients = patients;
                    return io.sockets.in(roomId).emit('refresh', data);
                });
            });
        }
    } else if (socket.handshake.query.doctorId) {
        var doctorId = socket.handshake.query.doctorId;
        socket.join('d:' + doctorId);
    }
});
process.on('queueEvent', function (data) {
    return io.sockets.in(data.floor).emit('message', data);
});
process.on('refreshEvent', function (data) {
    return io.sockets.in(data.floor).emit('refresh', data.patients);
});
process.on('outPatientChangeEvent', function (data) {
    return io.sockets.in('d:' + data.doctorId).emit('outPatientChange', data.id);
});
hospitalDAO.findAll().then(function (result) {
    result.forEach(function (hospital) {
        redis.set(hospital.domainName, hospital.id);
    })
})
var kue = require('kue');
kue.createQueue('orderPayDelayedQueue');
kue.app.listen(8098);
