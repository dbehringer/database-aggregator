'use strict';

const debug = require('debug')('config');

const defaultConfig = require('./default');
const homeConfig = require('./home').config;
const envConfig = require('./env');
const aggregationConfig = require('./aggregation');

exports.getConfig = function (customConfig) {
    console.log(Object.assign({}, defaultConfig, homeConfig, aggregationConfig, envConfig, customConfig))
    return Object.assign({}, defaultConfig, homeConfig, aggregationConfig, envConfig, customConfig);
};

exports.globalConfig = exports.getConfig();
