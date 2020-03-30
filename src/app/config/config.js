const { ConfigValidationError } = require('./config-validation-error');

class Config {
  constructor(environmentVariables) {
    if (environmentVariables.FLUX_ENVIRONMENT) {
      console.log(`FLUX_ENVIRONMENT = ${environmentVariables.FLUX_ENVIRONMENT}`);
    }
    this.fluxClientId = environmentVariables.FLUX_CLIENT_ID;
    this.fluxClientSecret = environmentVariables.FLUX_CLIENT_SECRET;
    this.fluxAccessTokenRetryPeriod =
      parseInt(environmentVariables.FLUX_PUBLIC_KEY_POLL_INTERVAL, 10) ||
      86400000;
    this.fluxApiUrlBase =
      environmentVariables.FLUX_API_URL_BASE || 'https://api.test.tryflux.com';
    this.fluxApiWebhooksBase =
      environmentVariables.FLUX_API_WEBHOOKS_URL_BASE ||
      'https://webhooks.test.tryflux.com';
    this.httpsRequestTimeout =
      environmentVariables.HTTPS_REQUEST_TIMEOUT || 120000;
    this.webserverPort = environmentVariables.PORT || 80;
    this.apiRequestTimeout =
      parseInt(environmentVariables.PUBLIC_API_REQUEST_TIME_OUT, 10) || 120000;
  }

  isConfigValid() {
    const errors = [];
    if (!this.fluxClientId && !this.fluxClientSecret) {
      errors.push('FLUX_CLIENT_ID or FLUX_CLIENT_SECRET');
    }
    if (errors.length > 0) {
      throw new ConfigValidationError(
        `Missing the following environment variables: ${errors.join(', ')}`
      );
    }
    return true;
  }
}

module.exports = {
  Config
};
