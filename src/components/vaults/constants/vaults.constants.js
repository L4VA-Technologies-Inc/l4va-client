import * as yup from 'yup';

export const MIN_SUPPLY = 100000000000000;
export const MAX_SUPPLY = 10000000000000000;
export const MIN_CONTRIBUTION_DURATION_MS = 600000; // 10 min in ms
export const MIN_ACQUIRE_WINDOW_DURATION_MS = 600000; // 10 min in ms
export const MIN_VLRM_REQUIRED = 1000; // Minimum VLRM required for vault creation

export const VAULT_PRIVACY_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  SEMI_PRIVATE: 'semi-private',
};

export const VAULT_STATUSES = {
  DRAFT: 'draft',
  CREATED: 'created',
  PUBLISHED: 'published',
  CONTRIBUTION: 'contribution',
  ACQUIRE: 'acquire',
  LOCKED: 'locked',
  FAILED: 'failed',
};

export const CREATE_VAULT_STEPS = [
  {
    id: 1,
    title: 'Configure',
    status: 'in progress',
    hasErrors: false,
  },
  {
    id: 2,
    title: 'Contribute',
    status: 'pending',
    hasErrors: false,
  },
  {
    id: 3,
    title: 'Acquire',
    status: 'pending',
    hasErrors: false,
  },
  {
    id: 4,
    title: 'Govern',
    status: 'pending',
    hasErrors: false,
  },
  {
    id: 5,
    title: 'Confirm',
    status: 'pending',
    hasErrors: false,
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

export const VAULT_TAGS_OPTIONS = [
  { value: 'nft', label: 'NFT' },
  { value: 'ft', label: 'FT' },
  { value: 'rwa', label: 'RWA' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'commodity', label: 'Commodity' },
  { value: 'synthetic', label: 'Synthetic' },
  { value: 'exotic', label: 'Exotic' },
  { value: 'precious-metal', label: 'Precious Metal' },
  { value: 'gem', label: 'Gem' },
  { value: 'defi', label: 'DeFi' },
  { value: 'pfp', label: 'PFP' },
  { value: 'staking', label: 'Staking' },
  { value: 'depin', label: 'DePin' },
  { value: 'stablecoin', label: 'Stablecoin' },
  { value: 'governance', label: 'Governance' },
  { value: 'dex', label: 'DEX' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Music' },
  { value: 'art', label: 'Art' },
  { value: 'metaverse', label: 'Metaverse' },
  { value: 'utility', label: 'Utility' },
  { value: 'collectible', label: 'Collectible' },
  { value: 'protocol', label: 'Protocol' },
  { value: 'lp-token', label: 'LP Token' },
  { value: 'wrapped', label: 'Wrapped' },
];

export const VAULT_VALUE_METHOD_OPTIONS = [
  { name: 'lbe', label: 'Market / Floor Price' },
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

const assetWhitelistItemSchema = yup.object({
  policyId: yup.string().required('Policy ID is required'),
  countCapMin: yup.number().typeError('Min asset cap is required'),
  countCapMax: yup.number().typeError('Max asset cap is required'),
});

const acquirerWhitelistItemSchema = yup.object({
  walletAddress: yup.string().required('Wallet address is required'),
});

export const vaultSchema = yup.object({
  // Step 1: Configure Vault
  name: yup
    .string()
    .min(3, 'Vault name must be at least 3 characters')
    .max(50, 'Vault name must be less than 50 characters')
    .required('Vault name is required'),
  type: yup.string().required('Type is required'),
  privacy: yup.string().required('Privacy setting is required'),
  vaultTokenTicker: yup
    .string()
    .matches(/^[A-Z0-9]{1,10}$/, 'Ticker must be 1-10 uppercase letters or numbers')
    .nullable(),
  description: yup.string().max(500, 'Description must be less than 500 characters').optional(),
  vaultImage: yup.string().required('Vault image is required'),
  socialLinks: yup.array().of(socialLinkSchema).default([]),
  tags: yup.array().of(yup.string()).default([]),

  // Step 2: Asset Contribution
  valueMethod: yup.string().required('Vault value method is required'),
  contributionOpenWindowType: yup
    .string()
    .oneOf(['custom', 'upon-vault-launch'], 'Invalid contribution window type')
    .required('Contribution window type is required'),
  contributionOpenWindowTime: yup
    .number()
    .typeError('Time is required')
    .when('contributionOpenWindowType', {
      is: 'custom',
      then: schema => schema.required('Time is required for custom window type'),
      otherwise: schema => schema.nullable(),
    }),
  assetsWhitelist: yup
    .array()
    .of(assetWhitelistItemSchema)
    .required('Assets whitelist is required')
    .min(1, 'Assets whitelist must have at least 1 item')
    .max(10, 'Assets whitelist can have a maximum of 10 items')
    .default([]),
  contributionDuration: yup
    .number()
    .typeError('Duration is required')
    .required('Duration is required')
    .min(MIN_CONTRIBUTION_DURATION_MS, 'Duration must be at least 24 hours'),

  // Step 3: Acquire Window
  acquireWindowDuration: yup
    .number()
    .typeError('Acquire window duration is required')
    .required('Acquire window duration is required')
    .min(MIN_ACQUIRE_WINDOW_DURATION_MS, 'Must be at least 24 hours'),
  acquireOpenWindowType: yup.string().required('Acquire window type is required'),
  acquireOpenWindowTime: yup.mixed().nullable(),
  acquirerWhitelist: yup
    .array()
    .of(acquirerWhitelistItemSchema)
    .default([])
    .when('privacy', {
      is: 'semi-private',
      then: schema =>
        schema
          .min(1, 'Acquirer whitelist must have at least 1 item')
          .max(100, 'Acquirer whitelist can have a maximum of 100 items')
          .required('Acquirer whitelist is required'),
      otherwise: schema =>
        schema.when('privacy', {
          is: 'private',
          then: schema =>
            schema
              .min(1, 'Acquirer whitelist must have at least 1 item')
              .max(100, 'Acquirer whitelist can have a maximum of 100 items')
              .required('Acquirer whitelist is required'),
          otherwise: schema => schema.notRequired(),
        }),
    }),
  tokensForAcquires: yup.number().typeError('Assets offered is required').required('Assets offered is required'),
  acquireReserve: yup.number().typeError('Acquire reserve is required').required('Acquire reserve is required'),
  liquidityPoolContribution: yup
    .number()
    .typeError('Liquidity pool contribution is required')
    .required('Liquidity pool contribution is required'),

  // Step 4: Governance
  ftTokenSupply: yup
    .number()
    .typeError('Token supply is required')
    .required('Token supply is required')
    .integer('Must be an integer')
    .min(MIN_SUPPLY, 'Must be greater than 100,000,000,000,000')
    .max(MAX_SUPPLY, 'Must be less than or equal to 10,000,000,000,000,000'),
  ftTokenImg: yup.string().required('Token image is required'),
  terminationType: yup.string().required('Termination type is required'),
  creationThreshold: yup
    .number()
    .typeError('Creation threshold is required')
    .required('Creation threshold is required'),
  startThreshold: yup.number().typeError('Start threshold is required').required('Start threshold is required'),
  voteThreshold: yup.number().typeError('Vote threshold is required').required('Vote threshold is required'),
  executionThreshold: yup
    .number()
    .typeError('Execution threshold is required')
    .required('Execution threshold is required'),
  cosigningThreshold: yup
    .number()
    .typeError('Cosigning threshold is required')
    .required('Cosigning threshold is required'),

  // Programmed specific fields
  timeElapsedIsEqualToTime: yup
    .number()
    .typeError('Time elapsed is required')
    .when('terminationType', {
      is: 'programmed',
      then: schema => schema.required('Time elapsed is required for programmed termination'),
      otherwise: schema => schema.nullable(),
    }),
  vaultAppreciation: yup
    .number()
    .typeError('Vault appreciation is required')
    .when('terminationType', {
      is: 'programmed',
      then: schema => schema.required('Vault appreciation is required for programmed termination'),
      otherwise: schema => schema.nullable(),
    }),
});

export const initialVaultState = {
  // Step 1: Configure Vault
  name: '',
  type: 'single',
  privacy: 'public',
  vaultTokenTicker: '',
  description: '',
  vaultImage: '',
  socialLinks: [],
  tags: [],

  // Step 2: Asset Contribution
  valueMethod: 'lbe',
  contributionOpenWindowType: 'upon-vault-launch',
  contributionOpenWindowTime: null,
  contributionDuration: MIN_CONTRIBUTION_DURATION_MS,
  assetsWhitelist: [],
  valuationCurrency: 'ADA',

  // Step 3: Acquire Window
  acquireWindowDuration: MIN_ACQUIRE_WINDOW_DURATION_MS,
  acquireOpenWindowType: 'upon-asset-window-closing',
  acquireOpenWindowTime: null,
  acquirerWhitelist: [],
  tokensForAcquires: null,
  acquireReserve: null,
  liquidityPoolContribution: null,

  // Step 4: Governance
  ftTokenSupply: 100000000,
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
  1: ['name', 'type', 'privacy', 'vaultTokenTicker', 'description', 'vaultImage', 'socialLinks', 'tags'],
  2: [
    'valueMethod',
    'contributionDuration',
    'contributionOpenWindowType',
    'contributionOpenWindowTime',
    'assetsWhitelist',
  ],
  3: [
    'acquireWindowDuration',
    'acquireOpenWindowType',
    'acquireOpenWindowTime',
    'acquirerWhitelist',
    'tokensForAcquires',
    'acquireReserve',
    'liquidityPoolContribution',
  ],
  4: [
    'ftTokenSupply',
    'ftTokenImg',
    'terminationType',
    'creationThreshold',
    'startThreshold',
    'voteThreshold',
    'executionThreshold',
    'cosigningThreshold',
    'timeElapsedIsEqualToTime',
    'vaultAppreciation',
  ],
  5: [],
};

export const PRIVACY_HINT = `Public Vault HH: Public vaults allow anyone to contribute assets and acquire Vault Tokens.\n
Private Vault HH: Private vaults allow contribution only by the creator and/or whitelisted wallets, and Vault Tokens can only be acquired by whitelisted wallets.\n
Semi-private Vault HH: Semi-private vaults can be configured to allow public or private whitelisted access for users to contribute assets and/or acquire Vault Tokens.
`;

export const VALUE_METHOD_HINT = `Market / Floor Price: Vault value for reserve % purposes set equal to aggregated price of all assets in the vault at end of the Contribution Window.\n
Fixed: Vault value for reserve % purposes set as fixed amount.
`;

export const RESERVE_HINT = `The percentage (%) threshold that must be surpassed for the vault to lock, equal to the total amount of ADA sent by Acquirers divided by the Vault Value. (Example: if the Reserve (%) is set at 80%, the Vault Market Value is = 10,000 ADA, and ADA sent by Acquirers is = 7,999 ADA at the end of the Acquire Window, then the vault will NOT lock and all users will be refunded.)`;

export const LIQUIDITY_POOL_CONTRIBUTION_HINT = `HH: This setting determines the amount of ADA and Vault Tokens sent to the initial Liquidity Pool on VyFi. The % entered will be multiplied by the vault value at the end of the Acquire Window to calculate the ADA and Vault Tokens sent. \n
Note: LP Contribution % cannot be larger than the % of Tokens for Acquirers. \n

Warning: If the LP Contribution % is equal to the % of Tokens for Acquirers, then 100% of ADA received from Acquirers will go to the initial Liquidity Pool and Asset Contributors will receive 0% of ADA sent to the vault.`;
