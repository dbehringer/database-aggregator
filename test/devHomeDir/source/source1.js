'use strict';

/** @type {import('../../../src/types').ISourceConfigFile} */
const source = {
  copyCronRule: '*/5 * * * *',
  removeCronRule: '*/10 * * * *',
  copyMissingIdsCronRule: '*/15 * * * *',
  driver: require('../driver/constantUpdates')
};

module.exports = source;
