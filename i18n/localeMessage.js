'use strict';

var config = require('../config');
var i18n = require('i18n');

i18n.configure({
  locales: ['en', 'zh_CN'],
  directory: __dirname + '/locales'
});

module.exports = {
  get: function (code) {
    i18n.setLocale(config.app.locale);
    return i18n.__(code);
  }
};
