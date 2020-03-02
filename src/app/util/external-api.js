const { put, post, get, isValidResponseCode } = require('../dal/https-client');
const { log } = require('./logger');
const { AMOUNTS_MAGIC_NUMBERS, MERCHANT_DATA } = require('./static-data');

const handleGetAuth = (requestHandler, responseHandler, model) => {
  let payload = {
    isOK: false
  };
  if (model.token.access) {
    payload = { ...model.token, isOK: true };
    responseHandler.send(JSON.stringify(payload));
  } else {
    responseHandler.send(JSON.stringify(payload));
  }
};

const handleGetMerchants = (requestHandler, responseHandler, model) => {
  responseHandler.send(JSON.stringify(model.merchants));
};

const handleGetAmounts = (requestHandler, responseHandler, model) => {
  responseHandler.send(JSON.stringify(model.amounts));
};

const handleCreateAccount = async (
  requestHandler,
  responseHandler,
  model,
  config
) => {
  const headerProps = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${model.token.access}`
  };
  try {
    const result = await put(
      config.httpsRequestTimeout,
      `${config.fluxApiUrlBase}/auth/accounts/${requestHandler.body.accountId}`,
      headerProps,
      JSON.stringify({ email: requestHandler.body.email })
    );
    log('debug', 'result from creating account: ', result);
  } catch (error) {
    log('error', 'failed to create account', error);
  }
  responseHandler.sendStatus(204);
};

const handleCreateBankTransaction = async (
  requestHandler,
  responseHandler,
  model,
  config
) => {
  const {
    accountId,
    bankTransactionId,
    merchantLabel,
    amountLabel
  } = requestHandler.body;
  const merchantItem = MERCHANT_DATA.find((element) => {
    return element.label === merchantLabel;
  });
  const amountItem = AMOUNTS_MAGIC_NUMBERS.find((element) => {
    return element.label === amountLabel;
  });
  const headerProps = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${model.token.access}`
  };
  const body = [
    {
      bankTransactionId,
      accountId,
      transactionDate: new Date().toISOString(),
      amount: {
        amount: `10${amountItem.id}`,
        currency: 'GBP'
      },
      card: {
        authCode: '9e422c',
        lastFour: '1234',
        scheme: 'VISA'
      },
      merchant: {
        transactionNarrative: merchantItem.label
      }
    }
  ];
  try {
    const result = await post(
      config.httpsRequestTimeout,
      `${config.fluxApiWebhooksBase}/v2/bank`,
      headerProps,
      JSON.stringify(body)
    );
    log('debug', 'result from creating bank transaction: ', result);
  } catch (error) {
    log('error', 'failed to bank transaction', error);
  }
  responseHandler.sendStatus(204);
};

const handleGetReceipt = async (
  requestHandler,
  responseHandler,
  model,
  config
) => {
  const headerProps = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${model.token.access}`
  };
  try {
    const result = await get(
      config.httpsRequestTimeout,
      `${config.fluxApiUrlBase}/receipts/external/${
        requestHandler.body.bankTransactionId
      }`,
      headerProps,
      ''
    );
    log('debug', 'result from get receipt: ', result);
    if (isValidResponseCode(result.statusCode)) {
      responseHandler.send(JSON.stringify(result));
    } else {
      responseHandler.sendStatus(result.statusCode);
    }
  } catch (error) {
    log('error', 'failed to get receipt', error);
    responseHandler.sendStatus(400);
  }
};

module.exports = {
  handleGetAuth,
  handleGetMerchants,
  handleGetAmounts,
  handleCreateAccount,
  handleCreateBankTransaction,
  handleGetReceipt
};
