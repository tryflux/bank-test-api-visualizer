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

const propAccessorFn = (value) => value;

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
  const access = JSON.parse(atob(model.authStatus.access.split(".")[1]))
  const accessMeta = JSON.parse(access.metadata);
  document.querySelector('#tokenStatus').textContent = model.authStatus.isOK
    ? accessMeta.clientType === 'BANK' ? 'Everything is fine.'
    : `Everything is fine. But you probably meant to use a token with {clientType: BANK} instead of {clientType: ${accessMeta.clientType}}`
    : `Authentication failed. see the nodejs console for more info.`;
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
  document.querySelector('#createBkIdInput').value = uuidv4().replace(
    /\D/g,
    ''
  ); // only keep digits
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
    const selectElement = document.querySelector('#offerAccountSelect');
    const optionElement = selectElement.appendChild(
      document.createElement('option')
    );
    optionElement.text = accountId;
    const selectElement2 = document.querySelector('#accountSelect');
    const optionElement2 = selectElement2.appendChild(
      document.createElement('option')
    );
    optionElement2.text = accountId;
  } else {
    document.querySelector('#authOutput').textContent = 'failed';
  }
  // clean up
  document.querySelector('#createACIdInput').value = uuidv4();
  document.querySelector('#createACEmailInput').value = '';
};

const onActivateOffer = async () => {
  const accountId = document.querySelector('#offerAccountSelect').value;
  const offerId = document.querySelector('#activateOfferIdInput').value;
  const response = await window.fetch(
    `${window.location.origin}/activateOffer`,
    {
      method: 'POST',
      body: JSON.stringify({
        accountId,
        promotionId: offerId
      }),
      // eslint-disable-next-line no-undef
      headers: new Headers({ 'Content-Type': 'application/json' })
    }
  );
  if (response.status === 204) {
    document.querySelector('#activateOutput').textContent = 'Activated';
  } else {
    document.querySelector('#activateOutput').textContent = 'Failed';
  }
  updateCreateBankIdDomElements();
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

const setLoadingState = () => {
  document.querySelector('#receiptOutput').textContent =
    'Attempting to fetch receipt';
  document.querySelector('#receiptCode').textContent = '';
  const receiptContainer = document.querySelector('#receiptContainer');
  while (receiptContainer.firstChild) {
    receiptContainer.removeChild(receiptContainer.firstChild);
  }
};

const setFailedState = (code) => {
  document.querySelector('#receiptOutput').textContent = `${code} - failed`;
  document.querySelector('#receiptCode').textContent = '';
  const receiptContainer = document.querySelector('#receiptContainer');
  while (receiptContainer.firstChild) {
    receiptContainer.removeChild(receiptContainer.firstChild);
  }
};

const onGetReceipt = async (bankTransactionId) => {
  if (model.receipts.includes(bankTransactionId)) {
    document.querySelector('#receiptOutput').textContent = 'success';
    renderReceipt(model.receipts[model.receipts.indexOf(bankTransactionId)]);
  } else {
    setLoadingState();
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
      setFailedState(response.status);
    }
  }
};

const buildStyledElement = (label, styleObj) => {
  const simpleTruthyFn = (value) =>
    !!(value === true || value.toLower() === 'true');
  const isBold = getNestedObject(
    styleObj,
    ['description', 'style', 'bold'],
    simpleTruthyFn
  );
  const isCapitalise = getNestedObject(
    styleObj,
    ['description', 'style', 'capitalise'],
    simpleTruthyFn
  );
  const isItalic = getNestedObject(styleObj, ['italic'], simpleTruthyFn);
  const isStrikethrough = getNestedObject(
    styleObj,
    ['description', 'style', 'strikeThrough'],
    simpleTruthyFn
  );
  const p = document.createElement('p');
  let cssStyle = 'margin: 0; display: contents;';
  if (isBold) {
    cssStyle = `${cssStyle} font-weight: bold;`;
  }
  if (isCapitalise) {
    cssStyle = `${cssStyle} text-transform: capitalize;`;
  }
  if (isItalic) {
    cssStyle = `${cssStyle} font-style: italic;`;
  }
  if (isStrikethrough) {
    cssStyle = `${cssStyle} text-decoration: line-through;`;
  }
  p.textContent = label;
  p.setAttribute('style', cssStyle);
  return p;
};

const buildLiElements = ({
  parentElement,
  items,
  quantityProp,
  quantityValueFn,
  labelProp,
  labelValueFn,
  amountProp,
  amountValueFn,
  subItemsProp
}) => {
  items.forEach((item) => {
    const itemLi = parentElement.appendChild(document.createElement('li'));
    const quantity = getNestedObject(item, quantityProp, quantityValueFn);
    if (quantity) {
      const quantityText = itemLi.appendChild(document.createElement('strong'));
      quantityText.textContent = quantity;
      quantityText.className = 'receipt-quantity';
    }
    const label = getNestedObject(item, labelProp, labelValueFn);
    itemLi.appendChild(buildStyledElement(label, item));
    const amount = getNestedObject(item, amountProp, amountValueFn);
    if (amount) {
      const amountText = itemLi.appendChild(document.createElement('span'));
      amountText.textContent = amount;
      amountText.className = 'receipt-item-amount';
    }
    const subItems = getNestedObject(item, subItemsProp);
    if (subItems && Array.isArray(subItems) && subItems.length > 0) {
      const subParent = itemLi.appendChild(document.createElement('ul'));
      subParent.className = 'receipt-list-style';
      buildLiElements({
        parentElement: subParent,
        items: subItems,
        quantityProp,
        quantityValueFn,
        labelProp,
        labelValueFn,
        amountProp,
        amountValueFn,
        subItemsProp
      });
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
    collectionNumberSpan.textContent = '';
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
    buildLiElements({
      parentElement: mainItemsList,
      items: receipt.items,
      quantityProp: ['quantity'],
      quantityValueFn: quantityFormatter,
      labelProp: ['description', 'label'],
      labelValueFn: propAccessorFn,
      amountProp: ['amount', 'amount'],
      amountValueFn: amountFormatter,
      subItemsProp: ['subItems']
    });
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
    buildLiElements({
      parentElement: mainTaxesList,
      items: receipt.taxes,
      quantityProp: [''],
      quantityValueFn: propAccessorFn,
      labelProp: ['description', 'label'],
      labelValueFn: propAccessorFn,
      amountProp: ['value', 'amount'],
      amountValueFn: amountFormatter,
      subItemsProp: ['']
    });
  }
  // payments
  if (receipt.payments && Array.isArray(receipt.payments)) {
    const mainPaymentsList = paymentsContainer.appendChild(
      document.createElement('ul')
    );
    mainPaymentsList.className = 'receipt-list-style';
    buildLiElements({
      parentElement: mainPaymentsList,
      items: receipt.payments,
      quantityProp: [''],
      quantityValueFn: propAccessorFn,
      labelProp: ['type'],
      labelValueFn: propAccessorFn,
      amountProp: ['paid', 'amount'],
      amountValueFn: amountFormatter,
      subItemsProp: ['']
    });
    // add card details
    receipt.payments.forEach((payment) => {
      if (payment.type === 'card') {
        buildLiElements({
          parentElement: mainPaymentsList,
          items: [
            { label: 'last four', value: payment.lastFour },
            { label: 'auth code', value: payment.authCode }
          ],
          quantityProp: [''],
          quantityValueFn: propAccessorFn,
          labelProp: ['label'],
          labelValueFn: propAccessorFn,
          amountProp: ['value'],
          amountValueFn: propAccessorFn,
          subItemsProp: ['']
        });
      }
    });
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
    buildLiElements({
      parentElement: mainNotesList,
      items: receipt.notes,
      quantityProp: [''],
      quantityValueFn: propAccessorFn,
      labelProp: ['description', 'label'],
      labelValueFn: propAccessorFn,
      amountProp: ['', ''],
      amountValueFn: propAccessorFn,
      subItemsProp: ['']
    });
    receiptContainer.appendChild(notesFragment);
  }
  // barcode
  let isRenderBarcodeAfterMount = false;
  if (receipt.barcode) {
    const barcodeFragment = document.createDocumentFragment();
    const barcodeContainer = barcodeFragment.appendChild(
      document.createElement('div')
    );
    if (receipt.barcode.title) {
      const barcodeTitleParagraph = barcodeContainer.appendChild(
        document.createElement('p')
      );
      barcodeTitleParagraph.textContent = `${receipt.barcode.title}`;
    }
    if (receipt.barcode.message) {
      const barcodeMessageParagraph = barcodeContainer.appendChild(
        document.createElement('p')
      );
      barcodeMessageParagraph.textContent = `${receipt.barcode.message}`;
    }
    // currently support code_128 at the moment. Need to add another lib for qr codes
    if (receipt.barcode.type && receipt.barcode.type === 'CODE_128') {
      const barcodeSvg = barcodeContainer.appendChild(
        document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      );
      barcodeSvg.id = 'barcode';
      barcodeSvg.setAttribute('width', '100%');
      isRenderBarcodeAfterMount = true;
    } else {
      const unsupportedBarcodeParagraph = barcodeContainer.appendChild(
        document.createElement('p')
      );
      unsupportedBarcodeParagraph.textContent = 'Unsupported barcode type';
    }

    receiptContainer.appendChild(barcodeFragment);
  }
  if (isRenderBarcodeAfterMount) {
    window.JsBarcode('#barcode', receipt.barcode.code, {
      format: 'CODE128',
      displayValue: true
    });
    // force the size, as the lib will override what we set in the svg
    document.querySelector('#barcode').setAttribute('width', '100%');
  }
};

const addEventListenersToControls = () => {
  document
    .querySelector('#activateOfferBt')
    .addEventListener('click', (event) => {
      onActivateOffer();
    });
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
    const bankTransactionFromList = document.querySelector('#bankIdSelect')
      .value;
    if (bankTransactionFromList) {
      onGetReceipt(bankTransactionFromList);
    }
  });
  document
    .querySelector('#manualBankIdSelect')
    .addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        const bankTransactionFromInput = document.querySelector(
          '#manualBankIdSelect'
        ).value;
        if (bankTransactionFromInput) {
          onGetReceipt(bankTransactionFromInput);
        }
      }
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
