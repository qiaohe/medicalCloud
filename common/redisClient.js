'use strict';
var Promise = require('bluebird');
var redis = Promise.promisifyAll(require('redis'));
var config = require('../config');
var client = redis.createClient(config.redis.port, config.redis.host);
//client.auth(config.redis.password);
client.on('error', function (err) {
    console.log('Error ' + err);
});
module.exports = client;