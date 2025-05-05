import * as yup from 'yup';

export const VAULT_PRIVACY_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  SEMI_PRIVATE: 'semi-private',
};

export const VAULT_STATUSES = {
  DRAFT: 'draft',
};

export const CREATE_VAULT_STEPS = [
  {
    id: 1, title: 'Configure Vault', status: 'in progress', hasErrors: false,
  },
  {
    id: 2, title: 'Asset Contribution', status: 'pending', hasErrors: false,
  },
  {
    id: 3, title: 'Acquire', status: 'pending', hasErrors: false,
  },
  {
    id: 4, title: 'Governance', status: 'pending', hasErrors: false,
  },
  {
    id: 5, title: 'Launch', status: 'pending', hasErrors: false,
  },
];

export const VAULT_TYPE_OPTIONS = [
  { name: 'single', label: 'Single NFT' },
  { name: 'multi', label: 'Multi NFT' },
  { name: 'cnt', label: 'Any CNT' },
];

export const VAULT_PRIVACY_OPTIONS = [
  { name: 'public', label: 'Public Vault' },
  { name: 'private', label: 'Private Vault' },
  { name: 'semi-private', label: 'Semi-Private Vault' },
];

export const VAULT_VALUATION_TYPE_OPTIONS = [
  { name: 'lbe', label: 'LBE (Liquidity Bootstrapping Event)' },
  { name: 'fixed', label: 'Fixed' },
];

export const TERMINATION_TYPE_OPTIONS = [
  { name: 'dao', label: 'DAO' },
  { name: 'programmed', label: 'Programmed' },
];

const socialLinkSchema = yup.object({
  name: yup.string().required('Name is required'),
  url: yup.string().url('Invalid URL').required('URL is required'),
});

export const vaultSchema = yup.object({
  // Step 1: Configure Vault
  name: yup.string()
    .min(3, 'Vault name must be at least 3 characters')
    .max(50, 'Vault name must be less than 50 characters')
    .required('Vault name is required'),
  type: yup.string()
    .required('Type is required'),
  privacy: yup.string()
    .required('Privacy setting is required'),
  ftTokenTicker: yup.string()
    .matches(/^[A-Z0-9]{1,10}$/, 'Ticker must be 1-10 uppercase letters or numbers')
    .nullable(),
  description: yup.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  vaultImage: yup.string()
    .required('Vault image is required'),
  socialLinks: yup.array().of(socialLinkSchema).default([]),

  // Step 2: Asset Contribution
  valuationType: yup.string()
    .required('Valuation type is required'),
  contributionOpenWindowType: yup.string()
    .oneOf(['custom', 'upon-vault-launch'], 'Invalid contribution window type')
    .required('Contribution window type is required'),
  contributionOpenWindowTime: yup.number()
    .typeError('Time is required')
    .when('contributionOpenWindowType', {
      is: 'custom',
      then: (schema) => schema
        .required('Time is required for custom window type'),
      otherwise: (schema) => schema.nullable(),
    }),
  assetsWhitelist: yup.array().default([]),
  contributionDuration: yup.number()
    .typeError('Duration is required')
    .required('Duration is required'),

  // Step 3: Acquire Window
  acquireWindowDuration: yup.number()
    .typeError('Acquire window duration is required')
    .required('Acquire window duration is required'),
  acquireOpenWindowType: yup.string()
    .required('Acquire window type is required'),
  acquireOpenWindowTime: yup.mixed().nullable(),
  offAssetsOffered: yup.number()
    .typeError('Assets offered is required')
    .required('Assets offered is required'),
  ftAcquireReserve: yup.number()
    .typeError('Acquire reserve is required')
    .required('Acquire reserve is required'),
  liquidityPoolContribution: yup.number()
    .typeError('Liquidity pool contribution is required')
    .required('Liquidity pool contribution is required'),

  // Step 4: Governance
  ftTokenSupply: yup.number()
    .typeError('Token supply is required')
    .required('Token supply is required')
    .integer('Must be an integer')
    .min(1, 'Must be greater than 0')
    .max(100000000, 'Must be less than or equal to 100,000,000'),
  ftTokenDecimals: yup.number()
    .typeError('Token decimals is required')
    .required('Token decimals is required')
    .integer('Must be an integer')
    .min(1, 'Must be at least 1')
    .max(9, 'Must be at most 9'),
  ftTokenImg: yup.string()
    .required('Token image is required'),
  terminationType: yup.string()
    .required('Termination type is required'),
  // DAO specific fields
  creationThreshold: yup.number()
    .typeError('Creation threshold is required')
    .when('terminationType', {
      is: 'dao',
      then: (schema) => schema.required('Creation threshold is required for DAO termination'),
      otherwise: (schema) => schema.nullable(),
    }),
  startThreshold: yup.number()
    .typeError('Start threshold is required')
    .when('terminationType', {
      is: 'dao',
      then: (schema) => schema.required('Start threshold is required for DAO termination'),
      otherwise: (schema) => schema.nullable(),
    }),
  voteThreshold: yup.number()
    .typeError('Vote threshold is required')
    .when('terminationType', {
      is: 'dao',
      then: (schema) => schema.required('Vote threshold is required for DAO termination'),
      otherwise: (schema) => schema.nullable(),
    }),
  executionThreshold: yup.number()
    .typeError('Execution threshold is required')
    .when('terminationType', {
      is: 'dao',
      then: (schema) => schema.required('Execution threshold is required for DAO termination'),
      otherwise: (schema) => schema.nullable(),
    }),
  cosigningThreshold: yup.number()
    .typeError('Cosigning threshold is required')
    .when('terminationType', {
      is: 'dao',
      then: (schema) => schema.required('Cosigning threshold is required for DAO termination'),
      otherwise: (schema) => schema.nullable(),
    }),
  // Programmed specific fields
  timeElapsedIsEqualToTime: yup.number()
    .typeError('Time elapsed is required')
    .when('terminationType', {
      is: 'programmed',
      then: (schema) => schema.required('Time elapsed is required for programmed termination'),
      otherwise: (schema) => schema.nullable(),
    }),
  vaultAppreciation: yup.number()
    .typeError('Vault appreciation is required')
    .when('terminationType', {
      is: 'programmed',
      then: (schema) => schema.required('Vault appreciation is required for programmed termination'),
      otherwise: (schema) => schema.nullable(),
    }),
});

export const initialVaultState = {
  // Step 1: Configure Vault
  name: '',
  type: 'single',
  privacy: 'public',
  ftTokenTicker: '',
  description: '',
  vaultImage: '',
  bannerImage: '',
  socialLinks: [],

  // Step 2: Asset Contribution
  valuationType: 'lbe',
  contributionOpenWindowType: 'upon-vault-launch',
  contributionOpenWindowTime: null,
  contributionDuration: null,
  assetsWhitelist: [],
  valuationCurrency: 'ADA',

  // Step 3: Acquire Window
  acquireWindowDuration: null,
  acquireOpenWindowType: 'upon-asset-window-closing',
  acquireOpenWindowTime: null,
  offAssetsOffered: null,
  ftAcquireReserve: null,
  liquidityPoolContribution: null,

  // Step 4: Governance
  ftTokenSupply: 100000000,
  ftTokenDecimals: 5,
  ftTokenImg: '',
  terminationType: 'dao',
  // DAO specific fields
  creationThreshold: null,
  startThreshold: null,
  voteThreshold: null,
  executionThreshold: null,
  cosigningThreshold: null,
  // Programmed specific fields
  timeElapsedIsEqualToTime: null,
  vaultAppreciation: null,
};

export const stepFields = {
  1: ['name', 'type', 'privacy', 'ftTokenTicker', 'description', 'vaultImage', 'bannerImage', 'socialLinks'],
  2: ['valuationType', 'contributionDuration', 'contributionOpenWindowType', 'contributionOpenWindowTime'],
  3: ['acquireWindowDuration', 'acquireOpenWindowType', 'acquireOpenWindowTime', 'offAssetsOffered', 'ftAcquireReserve', 'liquidityPoolContribution'],
  4: ['ftTokenSupply', 'ftTokenDecimals', 'ftTokenImg', 'terminationType', 'creationThreshold', 'startThreshold', 'voteThreshold', 'executionThreshold', 'cosigningThreshold', 'timeElapsedIsEqualToTime', 'vaultAppreciation'],
  5: [],
};
