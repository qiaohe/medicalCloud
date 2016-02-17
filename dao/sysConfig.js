"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    findByKey: function(key) {
      return db.query(sqlMapping.sysConfig.findByKey, key);
    }
}