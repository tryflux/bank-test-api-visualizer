const querystring = require('querystring');
const { log } = require('../util/logger');
const { post } = require('../dal/https-client');

const EXPIRY_THRESHOLD = 60;
const THRESHOLD_PERCENTAGE_TO_REVIEW_TOKEN_AT = 90;

class FluxTokenService {
  constructor(config, model) {
    this.config = config;
    this.model = model;
    this.timerId = null;
  }

  async setup() {
    this.timerId = null;
    this.getAccessToken();
  }

  async getAccessToken() {
    let shouldRetry = false;
    try {
      this.timerId = null;
      const headerProps = {
        'Content-Type': 'application/x-www-form-urlencoded'
      };
      let body = '';
      if (
        this.model.token.expiryDate &&
        new Date().getTime() > this.model.token.expiryDate.getTime()
      ) {
        body = querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: this.model.token.refresh
        });
      } else {
        body = querystring.stringify({
          grant_type: 'client_credentials',
          client_id: this.config.fluxClientId,
          client_secret: this.config.fluxClientSecret
        });
      }
      const result = await post(
        this.config.httpsRequestTimeout,
        `${this.config.fluxApiUrlBase}/auth/oauth/token`,
        headerProps,
        body
      );
      if (result.data) {
        this.model.token.access = result.data.access_token;
        this.model.token.refresh = result.data.refresh_token;
        this.model.token.expiryInSeconds = result.data.expires_in;
        this.model.token.expiryDate = new Date(
          new Date().setSeconds(result.data.expires_in)
        );
        this.model.token.expiryDTS = new Date(
          new Date().setSeconds(result.data.expires_in - EXPIRY_THRESHOLD)
        );
        const timeTillRefreshInMs =
          (this.model.token.expiryInSeconds / 100) *
          THRESHOLD_PERCENTAGE_TO_REVIEW_TOKEN_AT *
          1000;
        this.scheduleNextUpdate(
          timeTillRefreshInMs,
          this.getAccessToken.bind(this)
        );
      } else {
        shouldRetry = true;
        log(
          'error',
          `flux access token service - failed to flux access token: ${result.statusCode}`
        );
      }
    } catch (error) {
      shouldRetry = true;
      log(
        'error',
        `flux access token service - failed get flux access token: ${error}`,
        error
      );
    }
    if (shouldRetry) {
      this.scheduleNextUpdate(
        this.config.fluxAccessTokenRetryPeriod,
        this.getAccessToken.bind(this)
      );
    }
  }

  scheduleNextUpdate(nextUpdateInMilliseconds, callback) {
    log(
      'info',
      `scheduling get flux bearer key in ${nextUpdateInMilliseconds} milliseconds`
    );
    this.timerId = setTimeout(() => callback(), nextUpdateInMilliseconds);
  }

  stop() {
    clearTimeout(this.timerId);
  }
}

module.exports = {
  FluxTokenService
};
