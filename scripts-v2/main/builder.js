/*
 *
 * Builder (Updated)
 *
 */

const cluster = require('cluster');
const utils = require('./utils');

////////////////////////////////////////////////////////////////////////////////

// Main Builder Function
const PoolBuilder = function(logger, portalConfig) {

  const _this = this;
  this.portalConfig = portalConfig;

  // Handle Pool Payments Creation
  /* istanbul ignore next */
  this.setupPoolPayments = function() {

    // Check if Any Pool Enabled Payments
    let enabled = false;
    Object.keys(_this.poolConfigs).forEach(coin => {
      const poolConfig = _this.poolConfigs[coin];
      if (poolConfig.enabled && poolConfig.payments && poolConfig.payments.enabled) {
        enabled = true;
      }
    });

    // Establish Pool Payments
    if (!enabled) return;
    const worker = cluster.fork({
      workerType: 'payments',
      poolConfigs: JSON.stringify(_this.poolConfigs),
      portalConfig: JSON.stringify(_this.portalConfig)
    });

    // Establish Worker Exit
    worker.on('exit', () => {
      logger.error('Master', 'Payments', 'Payment process died, starting replacement...');
      setTimeout(() => {
        _this.setupPoolPayments();
      }, 2000);
    });
  };

  // Handle Pool Server Creation
  /* istanbul ignore next */
  this.setupPoolServer = function() {

    // Establish Pool Server
    const worker = cluster.fork({
      workerType: 'server',
      partnerConfigs: JSON.stringify(_this.partnerConfigs),
      poolConfigs: JSON.stringify(_this.poolConfigs),
      portalConfig: JSON.stringify(_this.portalConfig)
    });

    // Establish Worker Exit
    worker.on('exit', () => {
      logger.error('Master', 'Server', 'Server process died, starting replacement...');
      setTimeout(() => {
        _this.setupPoolServer();
      }, 2000);
    });
  };

  // Handle Pool Worker Creation
  /* istanbul ignore next */
  this.createPoolWorker = function(poolWorkers, forkId) {

    // Build Worker from Data
    const worker = cluster.fork({
      workerType: 'worker',
      poolConfigs: JSON.stringify(_this.poolConfigs),
      portalConfig: JSON.stringify(_this.portalConfig),
      forkId: forkId,
    });

    worker.forkId = forkId;
    worker.type = 'worker';
    poolWorkers[forkId] = worker;

    // Handle Worker Events
    worker.on('message', (msg) => {
      switch (msg.type) {
      case 'banIP':
        Object.keys(cluster.workers).forEach(id => {
          if (cluster.workers[id].type === 'worker') {
            cluster.workers[id].send({ type: 'banIP', ip: msg.ip });
          }
        });
        break;
      }
    });

    // Establish Worker Exit
    worker.on('exit', () => {
      logger.error('Builder', 'Workers', `Fork ${ forkId } died, starting replacement worker...`);
      setTimeout(() => {
        _this.createPoolWorker(forkId);
      }, 2000);
    });
  };

  // Functionality for Pool Workers
  /* istanbul ignore next */
  this.setupPoolWorkers = function() {

    const poolWorkers = {};
    let numWorkers = 0;

    // Check if No Configs Exist
    if (Object.keys(_this.poolConfigs).length === 0) {
      logger.warning('Builder', 'Workers', 'No pool configs exists or are enabled in configs folder. No pools started.');
      return;
    }

    // Check if Daemons Configured
    Object.keys(_this.poolConfigs).forEach(config => {
      const pool = _this.poolConfigs[config];
      if (!Array.isArray(pool.daemons) || pool.daemons.length < 1) {
        logger.error('Builder', config, 'No daemons configured so a pool cannot be started for this coin.');
        delete _this.poolConfigs[config];
      }
    });

    // Create Pool Workers
    const numForks = utils.countProcessForks(_this.portalConfig);
    const startInterval = setInterval(() => {
      _this.createPoolWorker(poolWorkers, numWorkers);
      numWorkers += 1;
      if (numWorkers === numForks) {
        clearInterval(startInterval);
        logger.debug('Builder', 'Workers', `Started ${ Object.keys(_this.poolConfigs).length } pool(s) on ${ numForks } thread(s)`);
      }
    }, 250);
  };
};

module.exports = PoolBuilder;
