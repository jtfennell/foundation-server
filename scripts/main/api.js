/*
 *
 * API (Updated)
 *
 */

const utils = require('./utils');
const Algorithms = require('foundation-stratum').algorithms;

////////////////////////////////////////////////////////////////////////////////

// Main API Function
const PoolApi = function (client, poolConfigs, portalConfig) {

  const _this = this;
  this.client = client;
  this.poolConfigs = poolConfigs;
  this.portalConfig = portalConfig;
  this.headers = {
    'Access-Control-Allow-Headers' : 'Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Allow-Methods',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json'
  };

  // Main Endpoints
  //////////////////////////////////////////////////////////////////////////////

  // API Endpoint for /blocks/confirmed
  this.handleBlocksConfirmed = function(pool, callback) {
    const commands = [
      ['smembers', `${ pool }:blocks:primary:confirmed`],
      ['smembers', `${ pool }:blocks:auxiliary:confirmed`]];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: utils.processBlocks(results[0]),
        auxiliary: utils.processBlocks(results[1]),
      });
    }, callback);
  };

  // API Endpoint for /blocks/kicked
  this.handleBlocksKicked = function(pool, callback) {
    const commands = [
      ['smembers', `${ pool }:blocks:primary:kicked`],
      ['smembers', `${ pool }:blocks:auxiliary:kicked`]];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: utils.processBlocks(results[0]),
        auxiliary: utils.processBlocks(results[1])
      });
    }, callback);
  };

  // API Endpoint for /blocks/pending
  this.handleBlocksPending = function(pool, callback) {
    const commands = [
      ['smembers', `${ pool }:blocks:primary:pending`],
      ['smembers', `${ pool }:blocks:auxiliary:pending`]];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: utils.processBlocks(results[0]),
        auxiliary: utils.processBlocks(results[1])
      });
    }, callback);
  };

  // API Endpoint for /blocks
  this.handleBlocks = function(pool, callback) {
    const commands = [
      ['smembers', `${ pool }:blocks:primary:confirmed`],
      ['smembers', `${ pool }:blocks:primary:kicked`],
      ['smembers', `${ pool }:blocks:primary:pending`],
      ['smembers', `${ pool }:blocks:auxiliary:confirmed`],
      ['smembers', `${ pool }:blocks:auxiliary:kicked`],
      ['smembers', `${ pool }:blocks:auxiliary:pending`]];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: {
          confirmed: utils.processBlocks(results[0]),
          kicked: utils.processBlocks(results[1]),
          pending: utils.processBlocks(results[2]),
        },
        auxiliary: {
          confirmed: utils.processBlocks(results[3]),
          kicked: utils.processBlocks(results[4]),
          pending: utils.processBlocks(results[5])
        }
      });
    }, callback);
  };

  // API Endpoint for /miners/active
  this.handleMinersActive = function(pool, callback) {
    const algorithm = _this.poolConfigs[pool].primary.coin.algorithms.mining;
    const hashrateWindow = _this.poolConfigs[pool].settings.hashrateWindow;
    const multiplier = Math.pow(2, 32) / Algorithms[algorithm].multiplier;
    const windowTime = (((Date.now() / 1000) - hashrateWindow) | 0).toString();
    const commands = [
      ['hgetall', `${ pool }:rounds:primary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:primary:current:shared:times`],
      ['zrangebyscore', `${ pool }:rounds:primary:current:shared:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:primary:current:solo:shares`],
      ['zrangebyscore', `${ pool }:rounds:primary:current:solo:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:times`],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:shared:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:auxiliary:current:solo:shares`],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:solo:hashrate`, windowTime, '+inf']];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: {
          shared: utils.processMiners(results[0], results[2], results[1], multiplier, hashrateWindow, true),
          solo: utils.processMiners(results[3], results[4], null, multiplier, hashrateWindow, true),
        },
        auxiliary: {
          shared: utils.processMiners(results[5], results[7], results[6], multiplier, hashrateWindow, true),
          solo: utils.processMiners(results[8], results[9], null, multiplier, hashrateWindow, true),
        }
      });
    }, callback);
  };

  // API Endpoint for /miners/[miner]
  this.handleMinersSpecific = function(pool, miner, callback) {
    const algorithm = _this.poolConfigs[pool].primary.coin.algorithms.mining;
    const hashrateWindow = _this.poolConfigs[pool].settings.hashrateWindow;
    const multiplier = Math.pow(2, 32) / Algorithms[algorithm].multiplier;
    const windowTime = (((Date.now() / 1000) - hashrateWindow) | 0).toString();
    const commands = [
      ['hgetall', `${ pool }:payments:primary:balances`],
      ['hgetall', `${ pool }:payments:primary:generate`],
      ['hgetall', `${ pool }:payments:primary:immature`],
      ['hgetall', `${ pool }:payments:primary:paid`],
      ['hgetall', `${ pool }:rounds:primary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:primary:current:shared:times`],
      ['zrangebyscore', `${ pool }:rounds:primary:current:shared:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:primary:current:solo:shares`],
      ['zrangebyscore', `${ pool }:rounds:primary:current:solo:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:payments:auxiliary:balances`],
      ['hgetall', `${ pool }:payments:auxiliary:generate`],
      ['hgetall', `${ pool }:payments:auxiliary:immature`],
      ['hgetall', `${ pool }:payments:auxiliary:paid`],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:times`],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:shared:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:auxiliary:current:solo:shares`],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:solo:hashrate`, windowTime, '+inf']];
    _this.executeCommands(commands, (results) => {

      // Structure Round Data
      const primarySharedShareData = utils.processShares(results[4], miner);
      const primarySoloShareData = utils.processShares(results[7], miner);
      const primarySharedTimesData = utils.processTimes(results[5], miner);
      const auxiliarySharedShareData = utils.processShares(results[13], miner);
      const auxiliarySoloShareData = utils.processShares(results[16], miner);
      const auxiliarySharedTimesData = utils.processTimes(results[14], miner);

      // Structure Payments Data
      const primaryBalanceData = utils.processPayments(results[0], miner)[miner];
      const primaryGenerateData = utils.processPayments(results[1], miner)[miner];
      const primaryImmatureData = utils.processPayments(results[2], miner)[miner];
      const primaryPaidData = utils.processPayments(results[3], miner)[miner];
      const auxiliaryBalanceData = utils.processPayments(results[9], miner)[miner];
      const auxiliaryGenerateData = utils.processPayments(results[10], miner)[miner];
      const auxiliaryImmatureData = utils.processPayments(results[11], miner)[miner];
      const auxiliaryPaidData = utils.processPayments(results[12], miner)[miner];

      // Structure Miscellaneous Data
      const primarySharedDifficultyData = utils.processDifficulty(results[6], miner);
      const primarySoloDifficultyData = utils.processDifficulty(results[8], miner);
      const primarySharedWorkerData = utils.listWorkers(results[6], miner);
      const primarySoloWorkerData = utils.listWorkers(results[8], miner);
      const auxiliarySharedDifficultyData = utils.processDifficulty(results[15], miner);
      const auxiliarySoloDifficultyData = utils.processDifficulty(results[17], miner);
      const auxiliarySharedWorkerData = utils.listWorkers(results[15], miner);
      const auxiliarySoloWorkerData = utils.listWorkers(results[17], miner);

      // Build Miner Statistics
      callback(200, {
        primary: {
          current: {
            shared: primarySharedShareData[miner] || 0,
            solo: primarySoloShareData[miner] || 0,
            times: primarySharedTimesData[miner] || 0,
          },
          hashrate: {
            shared: (multiplier * primarySharedDifficultyData) / hashrateWindow,
            solo: (multiplier * primarySoloDifficultyData) / hashrateWindow,
          },
          payments: {
            balances: primaryBalanceData || 0,
            generate: primaryGenerateData || 0,
            immature: primaryImmatureData || 0,
            paid: primaryPaidData || 0,
          },
          workers: {
            shared: primarySharedWorkerData,
            solo: primarySoloWorkerData,
          },
        },
        auxiliary: {
          current: {
            shared: auxiliarySharedShareData[miner] || 0,
            solo: auxiliarySoloShareData[miner] || 0,
            times: auxiliarySharedTimesData[miner] || 0,
          },
          hashrate: {
            shared: (multiplier * auxiliarySharedDifficultyData) / hashrateWindow,
            solo: (multiplier * auxiliarySoloDifficultyData) / hashrateWindow,
          },
          payments: {
            balances: auxiliaryBalanceData || 0,
            generate: auxiliaryGenerateData || 0,
            immature: auxiliaryImmatureData || 0,
            paid: auxiliaryPaidData || 0,
          },
          workers: {
            shared: auxiliarySharedWorkerData,
            solo: auxiliarySoloWorkerData,
          },
        }
      });
    }, callback);
  };

  // API Endpoint for /miners
  this.handleMiners = function(pool, callback) {
    const algorithm = _this.poolConfigs[pool].primary.coin.algorithms.mining;
    const hashrateWindow = _this.poolConfigs[pool].settings.hashrateWindow;
    const multiplier = Math.pow(2, 32) / Algorithms[algorithm].multiplier;
    const windowTime = (((Date.now() / 1000) - hashrateWindow) | 0).toString();
    const commands = [
      ['hgetall', `${ pool }:rounds:primary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:primary:current:shared:times`],
      ['zrangebyscore', `${ pool }:rounds:primary:current:shared:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:primary:current:solo:shares`],
      ['zrangebyscore', `${ pool }:rounds:primary:current:solo:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:times`],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:shared:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:auxiliary:current:solo:shares`],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:solo:hashrate`, windowTime, '+inf']];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: {
          shared: utils.processMiners(results[0], results[2], results[1], multiplier, hashrateWindow, false),
          solo: utils.processMiners(results[3], results[4], null, multiplier, hashrateWindow, false),
        },
        auxiliary: {
          shared: utils.processMiners(results[5], results[7], results[6], multiplier, hashrateWindow, false),
          solo: utils.processMiners(results[8], results[9], null, multiplier, hashrateWindow, false),
        }
      });
    }, callback);
  };

  // API Endpoint for /payments/balances
  this.handlePaymentsBalances = function(pool, callback) {
    const commands = [
      ['hgetall', `${ pool }:payments:primary:balances`],
      ['hgetall', `${ pool }:payments:auxiliary:balances`]];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: utils.processPayments(results[0]),
        auxiliary: utils.processPayments(results[1]),
      });
    }, callback);
  };

  // API Endpoint for /payments/generate
  this.handlePaymentsGenerate = function(pool, callback) {
    const commands = [
      ['hgetall', `${ pool }:payments:primary:generate`],
      ['hgetall', `${ pool }:payments:auxiliary:generate`]];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: utils.processPayments(results[0]),
        auxiliary: utils.processPayments(results[1]),
      });
    }, callback);
  };

  // API Endpoint for /payments/immature
  this.handlePaymentsImmature = function(pool, callback) {
    const commands = [
      ['hgetall', `${ pool }:payments:primary:immature`],
      ['hgetall', `${ pool }:payments:auxiliary:immature`]];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: utils.processPayments(results[0]),
        auxiliary: utils.processPayments(results[1]),
      });
    }, callback);
  };

  // API Endpoint for /payments/paid
  this.handlePaymentsPaid = function(pool, callback) {
    const commands = [
      ['hgetall', `${ pool }:payments:primary:paid`],
      ['hgetall', `${ pool }:payments:auxiliary:paid`]];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: utils.processPayments(results[0]),
        auxiliary: utils.processPayments(results[1]),
      });
    }, callback);
  };

  // API Endpoint for /payments/paid
  this.handlePaymentsRecords = function(pool, callback) {
    const commands = [
      ['zrange', `${ pool }:payments:primary:records`, 0, -1],
      ['zrange', `${ pool }:payments:auxiliary:records`, 0, -1]];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: utils.processRecords(results[0]),
        auxiliary: utils.processRecords(results[1]),
      });
    }, callback);
  };

  // API Endpoint for /payments
  this.handlePayments = function(pool, callback) {
    const commands = [
      ['hgetall', `${ pool }:payments:primary:balances`],
      ['hgetall', `${ pool }:payments:primary:generate`],
      ['hgetall', `${ pool }:payments:primary:immature`],
      ['hgetall', `${ pool }:payments:primary:paid`],
      ['hgetall', `${ pool }:payments:auxiliary:balances`],
      ['hgetall', `${ pool }:payments:auxiliary:generate`],
      ['hgetall', `${ pool }:payments:auxiliary:immature`],
      ['hgetall', `${ pool }:payments:auxiliary:paid`]];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: {
          balances: utils.processPayments(results[0]),
          generate: utils.processPayments(results[1]),
          immature: utils.processPayments(results[2]),
          paid: utils.processPayments(results[3]),
        },
        auxiliary: {
          balances: utils.processPayments(results[4]),
          generate: utils.processPayments(results[5]),
          immature: utils.processPayments(results[6]),
          paid: utils.processPayments(results[7]),
        }
      });
    }, callback);
  };

  // API Endpoint for /rounds/current
  this.handleRoundsCurrent = function(pool, callback) {
    const commands = [
      ['hgetall', `${ pool }:rounds:primary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:primary:current:solo:shares`],
      ['hgetall', `${ pool }:rounds:primary:current:shared:times`],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:auxiliary:current:solo:shares`],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:times`]];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: {
          shared: utils.processShares(results[0]),
          solo: utils.processShares(results[1]),
          times: utils.processTimes(results[2]),
        },
        auxiliary: {
          shared: utils.processShares(results[3]),
          solo: utils.processShares(results[4]),
          times: utils.processTimes(results[5]),
        }
      });
    }, callback);
  };

  // API Endpoint for /rounds/[height]
  this.handleRoundsHeight = function(pool, height, callback) {
    const commands = [
      ['hgetall', `${ pool }:rounds:primary:round-${ height }:shares`],
      ['hgetall', `${ pool }:rounds:primary:round-${ height }:times`],
      ['hgetall', `${ pool }:rounds:auxiliary:round-${ height }:shares`],
      ['hgetall', `${ pool }:rounds:auxiliary:round-${ height }:times`]];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: {
          shares: utils.processShares(results[0]),
          times: utils.processTimes(results[1]),
        },
        auxiliary: {
          shares: utils.processShares(results[2]),
          times: utils.processTimes(results[3]),
        }
      });
    }, callback);
  };

  // Helper Function for /rounds
  this.processRounds = function(pool, rounds, blockType, callback, handler) {
    const combined = {};
    if (rounds.length >= 1) {
      const processor = new Promise((resolve,) => {
        rounds.forEach((height, idx) => {
          const commands = [
            ['hgetall', `${ pool }:rounds:${ blockType }:round-${ height }:shares`],
            ['hgetall', `${ pool }:rounds:${ blockType }:round-${ height }:times`]];
          _this.executeCommands(commands, (results) => {
            combined[height] = {
              shares: utils.processShares(results[0]),
              times: utils.processTimes(results[1])
            };
            if (idx === rounds.length - 1) {
              resolve(combined);
            }
          }, handler);
        });
      });
      processor.then((combined) => {
        callback(combined);
      });
    } else {
      callback(combined);
    }
  };

  // API Endpoint for /rounds
  this.handleRounds = function(pool, callback) {
    const keys = [
      ['keys', `${ pool }:rounds:primary:round-*:shares`],
      ['keys', `${ pool }:rounds:auxiliary:round-*:shares`]];
    _this.executeCommands(keys, (results) => {
      const rounds = {};
      const primaryRounds = results[0].map((key) => key.split(':')[3].split('-')[1]);
      const auxiliaryRounds = results[1].map((key) => key.split(':')[3].split('-')[1]);
      _this.processRounds(pool, primaryRounds, 'primary', (combined) => {
        rounds.primary = combined;
        _this.processRounds(pool, auxiliaryRounds, 'auxiliary', (combined) => {
          rounds.auxiliary = combined;
          callback(200, rounds);
        }, callback);
      }, callback);
    }, callback);
  };

  // API Endpoint for /statistics
  /* istanbul ignore next */
  this.handleStatistics = function(pool, callback) {
    const config = _this.poolConfigs[pool] || {};
    const algorithm = config.primary.coin.algorithms.mining;
    const hashrateWindow = config.settings.hashrateWindow;
    const multiplier = Math.pow(2, 32) / Algorithms[algorithm].multiplier;
    const windowTime = (((Date.now() / 1000) - hashrateWindow) | 0).toString();
    const commands = [
      ['hgetall', `${ pool }:blocks:primary:counts`],
      ['smembers', `${ pool }:blocks:primary:pending`],
      ['smembers', `${ pool }:blocks:primary:confirmed`],
      ['hgetall', `${ pool }:payments:primary:counts`],
      ['hgetall', `${ pool }:rounds:primary:current:shared:counts`],
      ['zrangebyscore', `${ pool }:rounds:primary:current:shared:hashrate`, windowTime, '+inf'],
      ['zrangebyscore', `${ pool }:rounds:primary:current:solo:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:statistics:primary:network`],
      ['hgetall', `${ pool }:blocks:auxiliary:counts`],
      ['smembers', `${ pool }:blocks:auxiliary:pending`],
      ['smembers', `${ pool }:blocks:auxiliary:confirmed`],
      ['hgetall', `${ pool }:payments:auxiliary:counts`],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:counts`],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:shared:hashrate`, windowTime, '+inf'],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:solo:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:statistics:auxiliary:network`],
    ];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: {
          config: {
            coin: config.enabled ? config.primary.coin.name : '',
            symbol: config.enabled ? config.primary.coin.symbol : '',
            algorithm: config.enabled ? config.primary.coin.algorithms.mining : '',
            paymentInterval: config.enabled ? config.primary.payments.paymentInterval : 0,
            minPayment: config.enabled ? config.primary.payments.minPayment : 0,
            recipientFee: config.enabled ? config.primary.recipients.reduce((p_sum, a) => p_sum + a.percentage, 0) : 0,
          },
          blocks: {
            valid: parseFloat(results[0] ? results[0].valid || 0 : 0),
            invalid: parseFloat(results[0] ? results[0].invalid || 0 : 0),
          },
          shares: {
            valid: parseFloat(results[4] ? results[4].valid || 0 : 0),
            invalid: parseFloat(results[4] ? results[4].invalid || 0 : 0),
          },
          hashrate: {
            shared: (multiplier * utils.processDifficulty(results[5])) / hashrateWindow,
            solo: (multiplier * utils.processDifficulty(results[6])) / hashrateWindow,
          },
          network: {
            difficulty: parseFloat(results[7] ? results[7].difficulty || 0 : 0),
            hashrate: parseFloat(results[7] ? results[7].hashrate || 0 : 0),
            height: parseFloat(results[7] ? results[7].height || 0 : 0),
          },
          payments: {
            last: parseFloat(results[3] ? results[3].last || 0 : 0),
            next: parseFloat(results[3] ? results[3].next || 0 : 0),
            total: parseFloat(results[3] ? results[3].total || 0 : 0),
          },
          status: {
            effort: parseFloat(results[4] ? results[4].effort || 0 : 0),
            luck: utils.processLuck(results[1], results[2]),
            miners: utils.combineMiners(results[5], results[6]),
            workers: utils.combineWorkers(results[5], results[6]),
          },
        },
        auxiliary: {
          config: {
            coin: (config.auxiliary && config.auxiliary.enabled) ? config.auxiliary.coin.name : '',
            symbol: (config.auxiliary && config.auxiliary.enabled) ? config.auxiliary.coin.symbol : '',
            algorithm: (config.auxiliary && config.auxiliary.enabled) ? config.primary.coin.algorithms.mining : '',
            paymentInterval: (config.auxiliary && config.auxiliary.enabled) ? config.auxiliary.payments.paymentInterval : 0,
            minPayment: (config.auxiliary && config.auxiliary.enabled) ? config.auxiliary.payments.minPayment : 0,
            recipientFee: (config.auxiliary && config.auxiliary.enabled) ? config.auxiliary.recipients.reduce((p_sum, a) => p_sum + a.percentage, 0) : 0,
          },
          blocks: {
            valid: parseFloat(results[8] ? results[8].valid || 0 : 0),
            invalid: parseFloat(results[8] ? results[8].invalid || 0 : 0),
          },
          shares: {
            valid: parseFloat(results[12] ? results[12].valid || 0 : 0),
            invalid: parseFloat(results[12] ? results[12].invalid || 0 : 0),
          },
          hashrate: {
            shared: (multiplier * utils.processDifficulty(results[13])) / hashrateWindow,
            solo: (multiplier * utils.processDifficulty(results[14])) / hashrateWindow,
          },
          network: {
            difficulty: parseFloat(results[15] ? results[15].difficulty || 0 : 0),
            hashrate: parseFloat(results[15] ? results[15].hashrate || 0 : 0),
            height: parseFloat(results[15] ? results[15].height || 0 : 0),
          },
          payments: {
            last: parseFloat(results[11] ? results[11].last || 0 : 0),
            next: parseFloat(results[11] ? results[11].next || 0 : 0),
            total: parseFloat(results[11] ? results[11].total || 0 : 0),
          },
          status: {
            effort: parseFloat(results[12] ? results[12].effort || 0 : 0),
            luck: utils.processLuck(results[9], results[10]),
            miners: utils.combineMiners(results[13], results[14]),
            workers: utils.combineWorkers(results[13], results[14]),
          },
        }
      });
    }, callback);
  };

  // API Endpoint for /workers/active
  this.handleWorkersActive = function(pool, callback) {
    const algorithm = _this.poolConfigs[pool].primary.coin.algorithms.mining;
    const hashrateWindow = _this.poolConfigs[pool].settings.hashrateWindow;
    const multiplier = Math.pow(2, 32) / Algorithms[algorithm].multiplier;
    const windowTime = (((Date.now() / 1000) - hashrateWindow) | 0).toString();
    const commands = [
      ['hgetall', `${ pool }:rounds:primary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:primary:current:shared:times`],
      ['zrangebyscore', `${ pool }:rounds:primary:current:shared:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:primary:current:solo:shares`],
      ['zrangebyscore', `${ pool }:rounds:primary:current:solo:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:times`],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:shared:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:auxiliary:current:solo:shares`],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:solo:hashrate`, windowTime, '+inf']];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: {
          shared: utils.processWorkers(results[0], results[2], results[1], multiplier, hashrateWindow, true),
          solo: utils.processWorkers(results[3], results[4], null, multiplier, hashrateWindow, true),
        },
        auxiliary: {
          shared: utils.processWorkers(results[5], results[7], results[6], multiplier, hashrateWindow, true),
          solo: utils.processWorkers(results[8], results[9], null, multiplier, hashrateWindow, true),
        }
      });
    }, callback);
  };

  // API Endpoint for /workers/[worker]
  this.handleWorkersSpecific = function(pool, worker, callback) {
    const algorithm = _this.poolConfigs[pool].primary.coin.algorithms.mining;
    const hashrateWindow = _this.poolConfigs[pool].settings.hashrateWindow;
    const multiplier = Math.pow(2, 32) / Algorithms[algorithm].multiplier;
    const windowTime = (((Date.now() / 1000) - hashrateWindow) | 0).toString();
    const commands = [
      ['hgetall', `${ pool }:rounds:primary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:primary:current:solo:shares`],
      ['hgetall', `${ pool }:rounds:primary:current:shared:times`],
      ['zrangebyscore', `${ pool }:rounds:primary:current:shared:hashrate`, windowTime, '+inf'],
      ['zrangebyscore', `${ pool }:rounds:primary:current:solo:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:auxiliary:current:solo:shares`],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:times`],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:shared:hashrate`, windowTime, '+inf'],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:solo:hashrate`, windowTime, '+inf']];
    _this.executeCommands(commands, (results) => {

      // Structure Round Data
      const primarySharedShareData = utils.processShares(results[0], worker);
      const primarySoloShareData = utils.processShares(results[1], worker);
      const primarySharedTimesData = utils.processTimes(results[2], worker);
      const auxiliarySharedShareData = utils.processShares(results[5], worker);
      const auxiliarySoloShareData = utils.processShares(results[6], worker);
      const auxiliarySharedTimesData = utils.processTimes(results[7], worker);

      // Structure Miscellaneous Data
      const primarySharedDifficultyData = utils.processDifficulty(results[3], worker);
      const primarySoloDifficultyData = utils.processDifficulty(results[4], worker);
      const auxiliarySharedDifficultyData = utils.processDifficulty(results[8], worker);
      const auxiliarySoloDifficultyData = utils.processDifficulty(results[9], worker);

      // Build Worker Statistics
      callback(200, {
        primary: {
          current: {
            shared: primarySharedShareData[worker] || 0,
            solo: primarySoloShareData[worker] || 0,
            times: primarySharedTimesData[worker] || 0,
          },
          hashrate: {
            shared: (multiplier * primarySharedDifficultyData) / hashrateWindow,
            solo: (multiplier * primarySoloDifficultyData) / hashrateWindow,
          },
        },
        auxiliary: {
          current: {
            shared: auxiliarySharedShareData[worker] || 0,
            solo: auxiliarySoloShareData[worker] || 0,
            times: auxiliarySharedTimesData[worker] || 0,
          },
          hashrate: {
            shared: (multiplier * auxiliarySharedDifficultyData) / hashrateWindow,
            solo: (multiplier * auxiliarySoloDifficultyData) / hashrateWindow,
          },
        }
      });
    }, callback);
  };

  // API Endpoint for /workers
  this.handleWorkers = function(pool, callback) {
    const algorithm = _this.poolConfigs[pool].primary.coin.algorithms.mining;
    const hashrateWindow = _this.poolConfigs[pool].settings.hashrateWindow;
    const multiplier = Math.pow(2, 32) / Algorithms[algorithm].multiplier;
    const windowTime = (((Date.now() / 1000) - hashrateWindow) | 0).toString();
    const commands = [
      ['hgetall', `${ pool }:rounds:primary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:primary:current:shared:times`],
      ['zrangebyscore', `${ pool }:rounds:primary:current:shared:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:primary:current:solo:shares`],
      ['zrangebyscore', `${ pool }:rounds:primary:current:solo:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:shares`],
      ['hgetall', `${ pool }:rounds:auxiliary:current:shared:times`],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:shared:hashrate`, windowTime, '+inf'],
      ['hgetall', `${ pool }:rounds:auxiliary:current:solo:shares`],
      ['zrangebyscore', `${ pool }:rounds:auxiliary:current:solo:hashrate`, windowTime, '+inf']];
    _this.executeCommands(commands, (results) => {
      callback(200, {
        primary: {
          shared: utils.processWorkers(results[0], results[2], results[1], multiplier, hashrateWindow, false),
          solo: utils.processWorkers(results[3], results[4], null, multiplier, hashrateWindow, false),
        },
        auxiliary: {
          shared: utils.processWorkers(results[5], results[7], results[6], multiplier, hashrateWindow, false),
          solo: utils.processWorkers(results[8], results[9], null, multiplier, hashrateWindow, false),
        }
      });
    }, callback);
  };

  //////////////////////////////////////////////////////////////////////////////

  // Execute Redis Commands
  /* istanbul ignore next */
  this.executeCommands = function(commands, callback, handler) {
    _this.client.multi(commands).exec((error, results) => {
      if (error) {
        handler(500, 'The server was unable to handle your request. Verify your input or try again later');
      } else {
        callback(results);
      }
    });
  };

  // Build API Payload for each Endpoint
  this.buildResponse = function(code, message, response) {
    const payload = {
      version: '0.0.2',
      statusCode: code,
      headers: _this.headers,
      body: message,
    };
    response.writeHead(code, _this.headers);
    response.end(JSON.stringify(payload));
  };

  // Determine API Endpoint Called
  this.handleApiV1 = function(req, callback) {

    let pool, endpoint, method;
    const miscellaneous = ['pools'];

    // If Path Params Exist
    if (req.params) {
      pool = utils.validateInput(req.params.pool || '');
      endpoint = utils.validateInput(req.params.endpoint || '');
    }

    // If Query Params Exist
    if (req.query) {
      method = utils.validateInput(req.query.method || '');
    }

    // Check if Requested Pool Exists
    if (!(pool in _this.poolConfigs) && !(miscellaneous.includes(pool))) {
      callback(400, 'The requested pool was not found. Verify your input and try again');
      return;
    }

    // Select Endpoint from Parameters
    switch (true) {

    // Blocks Endpoints
    case (endpoint === 'blocks' && method === 'confirmed'):
      _this.handleBlocksConfirmed(pool, (code, message) => callback(code, message));
      break;
    case (endpoint === 'blocks' && method === 'kicked'):
      _this.handleBlocksKicked(pool, (code, message) => callback(code, message));
      break;
    case (endpoint === 'blocks' && method === 'pending'):
      _this.handleBlocksPending(pool, (code, message) => callback(code, message));
      break;
    case (endpoint === 'blocks' && method === ''):
      _this.handleBlocks(pool, (code, message) => callback(code, message));
      break;

    // Miners Endpoints
    case (endpoint === 'miners' && method === 'active'):
      _this.handleMinersActive(pool, (code, message) => callback(code, message));
      break;
    case (endpoint === 'miners' && method.length >= 1):
      _this.handleMinersSpecific(pool, method, (code, message) => callback(code, message));
      break;
    case (endpoint === 'miners' && method === ''):
      _this.handleMiners(pool, (code, message) => callback(code, message));
      break;

    // Payments Endpoints
    case (endpoint === 'payments' && method === 'balances'):
      _this.handlePaymentsBalances(pool, (code, message) => callback(code, message));
      break;
    case (endpoint === 'payments' && method === 'generate'):
      _this.handlePaymentsGenerate(pool, (code, message) => callback(code, message));
      break;
    case (endpoint === 'payments' && method === 'immature'):
      _this.handlePaymentsImmature(pool, (code, message) => callback(code, message));
      break;
    case (endpoint === 'payments' && method === 'paid'):
      _this.handlePaymentsPaid(pool, (code, message) => callback(code, message));
      break;
    case (endpoint === 'payments' && method === 'records'):
      _this.handlePaymentsRecords(pool, (code, message) => callback(code, message));
      break;
    case (endpoint === 'payments' && method === ''):
      _this.handlePayments(pool, (code, message) => callback(code, message));
      break;

    // Ports Endpoints
    case (endpoint === 'ports' && method === ''):
      callback(200, { ports: _this.poolConfigs[pool].ports });
      break;

    // Rounds Endpoints
    case (endpoint === 'rounds' && method === 'current'):
      _this.handleRoundsCurrent(pool, (code, message) => callback(code, message));
      break;
    case (endpoint === 'rounds' && utils.checkNumber(method)):
      _this.handleRoundsHeight(pool, method, (code, message) => callback(code, message));
      break;
    case (endpoint === 'rounds' && method === ''):
      _this.handleRounds(pool, (code, message) => callback(code, message));
      break;

    // Statistics Endpoints
    case (endpoint === 'statistics' && method === ''):
      _this.handleStatistics(pool, (code, message) => callback(code, message));
      break;

    // Workers Endpoints
    case (endpoint === 'workers' && method === 'active'):
      _this.handleWorkersActive(pool, (code, message) => callback(code, message));
      break;
    case (endpoint === 'workers' && method.length >= 1):
      _this.handleWorkersSpecific(pool, method, (code, message) => callback(code, message));
      break;
    case (endpoint === 'workers' && method === ''):
      _this.handleWorkers(pool, (code, message) => callback(code, message));
      break;

    // Miscellaneous Endpoints
    case (endpoint === '' && method === '' && pool === 'pools'):
      callback(200, Object.keys(_this.poolConfigs));
      break;
    case (endpoint === '' && method === '' && !(miscellaneous.includes(pool))):
      _this.handleStatistics(pool, (code, message) => callback(code, message));
      break;

    // Unknown Endpoints
    default:
      callback(400, 'The requested method is not currently supported. Verify your input and try again');
      break;
    }
  };
};

module.exports = PoolApi;
