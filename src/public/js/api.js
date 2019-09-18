// defining this as global. Bit naughty....
const model = {
  authStatus: {
    isOK: false
  },
  merchants: [],
  amounts: [],
  accounts: [],
  bankTransactions: [],
  receipts: []
};

const propFn = (value) => value;

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

const getNestedObject = (nestedObj, pathArr, fn) => {
  const res = pathArr.reduce(
    (obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined),
    nestedObj
  );
  if (res && fn) {
    return fn(res);
  } else {
    return res;
  }
};

const getAuthStatus = async () => {
  const response = await window.fetch(`${window.location.origin}/authStatus`);
  const payload = await response.json();
  model.authStatus = { ...payload };
  updateAuthDomElements();
};
const updateAuthDomElements = () => {
  document.querySelector('#tokenStatus').textContent = model.authStatus.isOK
    ? 'Everything is fine'
    : 'auth failed, see nodejs console';
  document.querySelector(
    '#tokenCode'
  ).textContent = model.authStatus = JSON.stringify(
    {
      access: model.authStatus.access,
      refresh: model.authStatus.refresh,
      expiryInSeconds: model.authStatus.expiryInSeconds,
      expiryDate: model.authStatus.expiryDate,
      expiryDTS: model.authStatus.expiryDTS
    },
    null,
    2
  );
};

const updateCreateAccountIdDomElements = () => {
  document.querySelector('#createACIdInput').value = uuidv4();
};

const updateCreateBankIdDomElements = () => {
  document.querySelector('#createBkIdInput').value = uuidv4();
};

const getMerchants = async () => {
  const response = await window.fetch(`${window.location.origin}/merchants`);
  const payload = await response.json();
  model.merchants = [...payload];
  buildCombo('#merchantIdSelect', 'merchants');
};

const getAmounts = async () => {
  const response = await window.fetch(`${window.location.origin}/amounts`);
  const payload = await response.json();
  model.amounts = [...payload];
  buildCombo('#amountSelect', 'amounts');
};

const buildCombo = (selector, provider) => {
  const selectElement = document.querySelector(selector);
  const fragment = document.createDocumentFragment();
  model[provider].forEach((item) => {
    const optionElement = fragment.appendChild(
      document.createElement('option')
    );
    optionElement.text = item.label;
  });
  selectElement.appendChild(fragment);
};

const onCreateAccount = async () => {
  const accountId = document.querySelector('#createACIdInput').value;
  const email = document.querySelector('#createACEmailInput').value;
  const response = await window.fetch(
    `${window.location.origin}/createAccount`,
    {
      method: 'POST',
      body: JSON.stringify({ accountId, email }),
      // eslint-disable-next-line no-undef
      headers: new Headers({ 'Content-Type': 'application/json' })
    }
  );
  if (response.status === 204) {
    document.querySelector('#authOutput').textContent = 'Created';
    model.accounts.push(accountId);
    // add element to accounts select
    const selectElement = document.querySelector('#accountSelect');
    const optionElement = selectElement.appendChild(
      document.createElement('option')
    );
    optionElement.text = accountId;
  } else {
    document.querySelector('#authOutput').textContent = 'failed';
  }
  // clean up
  document.querySelector('#createACIdInput').value = uuidv4();
  document.querySelector('#createACEmailInput').value = '';
};

const onCreateBankTransaction = async () => {
  const accountId = document.querySelector('#accountSelect').value;
  const bankTransactionId = document.querySelector('#createBkIdInput').value;
  const merchantLabel = document.querySelector('#merchantIdSelect').value;
  const amountLabel = document.querySelector('#amountSelect').value;
  const response = await window.fetch(
    `${window.location.origin}/createBankTransaction`,
    {
      method: 'POST',
      body: JSON.stringify({
        accountId,
        bankTransactionId,
        merchantLabel,
        amountLabel
      }),
      // eslint-disable-next-line no-undef
      headers: new Headers({ 'Content-Type': 'application/json' })
    }
  );
  if (response.status === 204) {
    document.querySelector('#bankOutput').textContent = 'Created';
    model.bankTransactions.push(bankTransactionId);
    // add element to bank transaction select
    const selectElement = document.querySelector('#bankIdSelect');
    const optionElement = selectElement.appendChild(
      document.createElement('option')
    );
    optionElement.text = bankTransactionId;
  } else {
    document.querySelector('#bankOutput').textContent = 'failed';
  }
  updateCreateBankIdDomElements();
};

const onGetReceipt = async () => {
  const bankTransactionId = document.querySelector('#bankIdSelect').value;
  if (model.receipts.includes(bankTransactionId)) {
    document.querySelector('#receiptOutput').textContent = 'success';
    renderReceipt(model.receipts[model.receipts.indexOf(bankTransactionId)]);
  } else {
    const response = await window.fetch(
      `${window.location.origin}/getReceipt`,
      {
        method: 'POST',
        body: JSON.stringify({
          bankTransactionId
        }),
        // eslint-disable-next-line no-undef
        headers: new Headers({ 'Content-Type': 'application/json' })
      }
    );
    if (response.status === 200) {
      const payload = await response.json();
      model.receipts.push({ bankTransactionId, receiptData: payload.data });
      document.querySelector('#receiptOutput').textContent = 'success';
      renderReceipt(payload.data);
    } else {
      document.querySelector('#receiptOutput').textContent = 'failed';
      renderReceipt('');
    }
  }
};

const buildItems = (
  parent,
  items,
  quantityProp,
  quantityFn,
  labelProp,
  labelFn,
  amountProp,
  amountFn,
  subItemsProp
) => {
  items.forEach((item) => {
    const itemLi = parent.appendChild(document.createElement('li'));
    const quantity = getNestedObject(item, quantityProp, quantityFn);
    if (quantity) {
      const quantityText = itemLi.appendChild(document.createElement('strong'));
      quantityText.textContent = quantity;
      quantityText.className = 'receipt-quantity';
    }
    const label = getNestedObject(item, labelProp, labelFn);
    itemLi.appendChild(document.createTextNode(label));
    const amount = getNestedObject(item, amountProp, amountFn);
    if (amount) {
      const amountText = itemLi.appendChild(document.createElement('span'));
      amountText.textContent = amount;
      amountText.className = 'receipt-item-amount';
    }
    const subItems = getNestedObject(item, subItemsProp);
    if (subItems && Array.isArray(subItems) && subItems.length > 0) {
      const subParent = itemLi.appendChild(document.createElement('ul'));
      subParent.className = 'receipt-list-style';
      buildItems(
        subParent,
        subItems,
        quantityProp,
        quantityFn,
        labelProp,
        labelFn,
        amountProp,
        amountFn,
        subItemsProp
      );
    }
  });
};

const renderReceipt = (receipt) => {
  // json
  document.querySelector('#receiptCode').textContent = JSON.stringify(
    receipt,
    null,
    2
  );
  // receipt ui
  const receiptContainer = document.querySelector('#receiptContainer');
  // remove all children
  while (receiptContainer.firstChild) {
    receiptContainer.removeChild(receiptContainer.firstChild);
  }
  // header
  const headerFragment = document.createDocumentFragment();
  const headerDiv = headerFragment.appendChild(document.createElement('div'));
  headerDiv.className = 'receipt-header';
  const merchantLogo = headerDiv.appendChild(document.createElement('img'));
  merchantLogo.className = 'receipt-merchant-logo';
  merchantLogo.alt = 'merchant logo';
  merchantLogo.src = receipt.merchant.logoUrl;

  const merchantDetails = headerDiv.appendChild(document.createElement('p'));
  merchantDetails.textContent = receipt.merchant.name;
  if (receipt.merchant.location) {
    merchantDetails.textContent = `${receipt.merchant.name} - ${
      receipt.merchant.location.name
    }`;
  }
  if (receipt.collectionNumber) {
    const collectionNumberParagraph = headerDiv.appendChild(
      document.createElement('p')
    );
    const collectionNumberSpan = collectionNumberParagraph.appendChild(
      document.createElement('span')
    );
    collectionNumberSpan.textContent = '🥡 ';
    collectionNumberParagraph.appendChild(
      document.createTextNode(`Collection Number: #${receipt.collectionNumber}`)
    );
  }
  receiptContainer.appendChild(headerFragment);
  // line items
  const itemsFragment = document.createDocumentFragment();
  const itemsContainer = itemsFragment.appendChild(
    document.createElement('div')
  );
  const quantityFormatter = (quantity) => `${quantity} x`;
  const amountFormatter = (amount) => `£${amount / 100}`;
  if (receipt.items && Array.isArray(receipt.items)) {
    const mainItemsList = itemsContainer.appendChild(
      document.createElement('ul')
    );
    mainItemsList.className = 'receipt-list-style';
    buildItems(
      mainItemsList,
      receipt.items,
      ['quantity'],
      quantityFormatter,
      ['description', 'label'],
      propFn,
      ['amount', 'amount'],
      amountFormatter,
      ['subItems']
    );
  }
  receiptContainer.appendChild(itemsFragment);
  // payments
  const paymentsFragment = document.createDocumentFragment();
  const paymentsContainer = paymentsFragment.appendChild(
    document.createElement('div')
  );
  paymentsContainer.className = 'receipt-section-splitter';
  if (receipt.total && receipt.total.amount) {
    const totalParagraph = paymentsContainer.appendChild(
      document.createElement('p')
    );

    const totalLabel = totalParagraph.appendChild(
      document.createElement('span')
    );
    totalLabel.textContent = 'TOTAL';
    totalLabel.className = 'receipt-total-value';

    const totalText = totalParagraph.appendChild(
      document.createElement('strong')
    );
    totalText.textContent = `£${
      receipt.total.amount > 0 ? receipt.total.amount / 100 : 0
    }`;
    totalText.className = 'receipt-total-amount';
  }
  // taxes
  if (
    receipt.taxes &&
    Array.isArray(receipt.taxes) &&
    receipt.taxes.length > 0
  ) {
    const mainTaxesList = paymentsContainer.appendChild(
      document.createElement('ul')
    );
    mainTaxesList.className = 'receipt-list-style';
    buildItems(
      mainTaxesList,
      receipt.taxes,
      [''],
      propFn,
      ['description', 'label'],
      propFn,
      ['value', 'amount'],
      amountFormatter,
      ['']
    );
  }
  // payments
  if (receipt.payments && Array.isArray(receipt.payments)) {
    const mainPaymentsList = paymentsContainer.appendChild(
      document.createElement('ul')
    );
    mainPaymentsList.className = 'receipt-list-style';
    buildItems(
      mainPaymentsList,
      receipt.payments,
      [''],
      propFn,
      ['type'],
      propFn,
      ['paid', 'amount'],
      amountFormatter,
      ['']
    );
  }
  receiptContainer.appendChild(paymentsFragment);
  // notes
  if (
    receipt.notes &&
    Array.isArray(receipt.notes) &&
    receipt.notes.length > 0
  ) {
    const notesFragment = document.createDocumentFragment();
    const notesContainer = notesFragment.appendChild(
      document.createElement('div')
    );
    notesContainer.className = 'receipt-section-splitter';
    const mainNotesList = notesContainer.appendChild(
      document.createElement('ul')
    );
    mainNotesList.className = 'receipt-list-style';
    buildItems(
      mainNotesList,
      receipt.notes,
      [''],
      propFn,
      ['description', 'label'],
      propFn,
      ['', ''],
      propFn,
      ['']
    );
    receiptContainer.appendChild(notesFragment);
  }
};

const addEventListenersToControls = () => {
  document
    .querySelector('#createNewAccountBt')
    .addEventListener('click', (event) => {
      onCreateAccount();
    });
  document
    .querySelector('#createBankTransactionBt')
    .addEventListener('click', (event) => {
      onCreateBankTransaction();
    });
  document.querySelector('#getReceiptBt').addEventListener('click', (event) => {
    onGetReceipt();
  });
};

const init = () => {
  addEventListenersToControls();
  getAuthStatus();
  updateCreateAccountIdDomElements();
  updateCreateBankIdDomElements();
  getMerchants();
  getAmounts();
};

document.addEventListener('DOMContentLoaded', (event) => {
  init();
});