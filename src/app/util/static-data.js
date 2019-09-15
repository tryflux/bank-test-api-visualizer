const KFC_MERCHANT = {
  label: 'KFC',
  id: 'fdccf606-e155-4508-ad8f-ddd1c6e785cb',
  features: 'Collection Number, No VAT Receipt'
};
const JUST_EAT_MERCHANT = {
  label: 'Just Eat',
  id: '698deaac-318b-48cc-8de9-d07b64362885',
  features: 'Collection Number, No VAT Receipt, Delivery, Service Charge'
};
const SCHUH_MERCHANT = {
  label: 'Schuh',
  id: '324bc964-5b5b-4e89-881d-58b6500083a6',
  features: 'Returns, No VAT Receipt'
};
const ITSU_MERCHANT = {
  label: 'Itsu',
  id: 'cee65617-ebc7-4059-a5db-01d74903cd41',
  features: 'VAT Receipt'
};
const EAT_MERCHANT = {
  label: 'EAT',
  id: '3e5368b5-1bdb-4f3a-9f10-9bf0435dd3e1',
  features: 'VAT Receipt'
};
const PURE_MERCHANT = {
  label: 'Pure',
  id: '8650409f-699c-4206-aca1-d51cf83abd8c',
  features: 'VAT Receipt'
};
const CINEMA_MERCHANT = {
  label: 'Cinema',
  id: 'f4360e75-cdc0-4b80-8e2b-6c5bd6c4779b',
  features: 'Barcode, No VAT Receipt'
};

const AMOUNTS_MAGIC_NUMBERS = [
  { label: 'A simple receipt with 1 item', id: '01' },
  { label: '1 Item with a single sub level', id: '02' },
  { label: '1 Item with multiple sub levels', id: '03' },
  { label: '1 Item with tax', id: '04' },
  { label: '3 Items with no sub levels', id: '05' },
  { label: '3 Items with a mixture of sub levels', id: '06' },
  { label: '3 Items, one with tax', id: '07' },
  { label: '3 Items with tax', id: '08' },
  { label: '20 Items', id: '09' },
  { label: '1 Item with a partial discount', id: '30' },
  { label: '1 Item with a full discount', id: '31' },
  { label: '3 Items with a receipt wide partial discount', id: '32' },
  { label: '3 Items with a receipt wide full discount', id: '33' },
  { label: '3 Items - variable discounts', id: '34' },
  { label: 'A receipt from a different location', id: '42' },
  { label: 'Split payment - gift card', id: '50' },
  { label: '3 Items with delivery (if merchant supports it)', id: '60' },
  { label: '3 Items with service charge (if merchant supports it)', id: '61' },
  {
    label: '3 Items with delivery and service charge (if merchant supports it)',
    id: '62'
  }
];

const MERCHANT_DATA = [
  KFC_MERCHANT,
  JUST_EAT_MERCHANT,
  SCHUH_MERCHANT,
  ITSU_MERCHANT,
  EAT_MERCHANT,
  PURE_MERCHANT,
  CINEMA_MERCHANT
];

const populateStaticData = (model) => {
  model.merchants = MERCHANT_DATA;
  model.amounts = AMOUNTS_MAGIC_NUMBERS;
};

module.exports = {
  populateStaticData,
  AMOUNTS_MAGIC_NUMBERS,
  MERCHANT_DATA
};
