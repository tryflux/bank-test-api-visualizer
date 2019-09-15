const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const path = require('path');
const { log } = require('../util/logger');
const {
  handleGetAuth,
  handleGetMerchants,
  handleGetAmounts,
  handleCreateAccount,
  handleCreateBankTransaction,
  handleGetReceipt
} = require('../util/external-api');

class WebServerService {
  constructor(config, model) {
    this.config = config;
    this.model = model;
    this.expressInstance = null;
  }

  async setup() {
    this.expressInstance = express();
    this.expressInstance.use(bodyParser.urlencoded({ extended: false }));
    this.expressInstance.use(bodyParser.json());
    this.expressInstance.use(compression());
    this.expressInstance.use(
      express.static(path.join(__dirname, '../../public/'))
    );

    this.addListeners();

    this.server = this.expressInstance.listen(this.config.webserverPort, () => {
      log(
        'debug',
        `web server listening on ${this.server.address().address}:${
          this.server.address().port
        }`
      );
    });

    this.server.timeout = this.config.apiRequestTimeout * 1.1;
  }

  addListeners() {
    this.expressInstance.get(
      '/authStatus',
      (requestHandler, responseHandler) => {
        log('debug', 'handling GET /authStatus');
        handleGetAuth(requestHandler, responseHandler, this.model);
      }
    );
    this.expressInstance.get(
      '/merchants',
      (requestHandler, responseHandler) => {
        log('debug', 'handling GET /merchants');
        handleGetMerchants(requestHandler, responseHandler, this.model);
      }
    );
    this.expressInstance.get('/amounts', (requestHandler, responseHandler) => {
      log('debug', 'handling GET /amounts');
      handleGetAmounts(requestHandler, responseHandler, this.model);
    });
    this.expressInstance.post(
      '/createAccount',
      (requestHandler, responseHandler) => {
        log('debug', 'handling POST /createAccount');
        handleCreateAccount(
          requestHandler,
          responseHandler,
          this.model,
          this.config
        );
      }
    );
    this.expressInstance.post(
      '/createBankTransaction',
      (requestHandler, responseHandler) => {
        log('debug', 'handling POST /createBankTransaction');
        handleCreateBankTransaction(
          requestHandler,
          responseHandler,
          this.model,
          this.config
        );
      }
    );
    this.expressInstance.post(
      '/getReceipt',
      (requestHandler, responseHandler) => {
        log('debug', 'handling Get /getReceipt');
        handleGetReceipt(
          requestHandler,
          responseHandler,
          this.model,
          this.config
        );
      }
    );
  }

  stop() {
    this.server.close();
  }
}

module.exports = {
  WebServerService
};
