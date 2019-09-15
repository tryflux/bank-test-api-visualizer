const bunyan = require('bunyan');
const { name, version } = require('../../../package.json');

const logger = bunyan.createLogger({
  name,
  level: process.env.LOG_LEVEL || 'debug'
});

const log = (level, message, detailsObj = {}) => {
  const defaultLoggingInfo = {
    name,
    version,
    logLevel: level,
    nodeVersion: process.version
  };
  const prefixedObject = Object.create(null, {});
  Object.keys(detailsObj).forEach((key) => {
    prefixedObject[`log-data-${key}`] = detailsObj[key];
  });
  // logger[level]({ message, ...defaultLoggingInfo, ...prefixedObject });
  console.log(message, { ...defaultLoggingInfo, ...prefixedObject });
};

module.exports = {
  log,
  logger
};
