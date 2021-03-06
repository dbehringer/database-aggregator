'use strict';

const { connect } = require('../mongo/connection');
const config = require('../config/config').globalConfig;

const { aggregate } = require('./aggregate');

process.on('message', (aggregateDB) => {
  (async function() {
    try {
      await connect();
      await aggregate(config.aggregation[aggregateDB]);
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error(e);
      process.exit(1);
    }
    process.exit(0);
  })();
});
