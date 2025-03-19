import { z } from 'zod';

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
    id: 3, title: 'Investment', status: 'pending', hasErrors: false,
  },
  {
    id: 4, title: 'Governance', status: 'pending', hasErrors: false,
  },
  {
    id: 5, title: 'Launch', status: 'pending', hasErrors: false,
  },
];

const socialLinkSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

// Main vault schema
export const vaultSchema = z.object({
  // Step 1: Configure Vault
  name: z.string()
    .min(3, { message: 'Vault name must be at least 3 characters' })
    .max(50, { message: 'Vault name must be less than 50 characters' }),
  type: z.string(),
  privacy: z.string(),
  ftTokenTicker: z.string()
    .regex(/^[A-Z0-9]{1,10}$/, { message: 'Ticker must be 1-10 uppercase letters or numbers' })
    .nullable(),
  description: z.string()
    .max(500, { message: 'Description must be less than 500 characters' })
    .optional(),
  vaultImage: z.string({ message: 'Vault image is required' }),
  socialLinks: z.array(socialLinkSchema),

  // Step 2: Asset Contribution
  valuationType: z.string(),
  contributionOpenWindowType: z.string(),
  contributionOpenWindowTime: z.any().optional(),
  assetsWhitelist: z.array(z.any()),
  contributionDuration: z.number().optional(),

  // Step 3: Investment Window
  investmentWindowDuration: z.any().nullable(),
  investmentOpenWindowType: z.string(),
  investmentOpenWindowTime: z.any().nullable(),
  offAssetsOffered: z.string(),
  ftInvestmentReserve: z.string(),
  liquidityPoolContribution: z.string(),

  // Step 4: Governance
  ftTokenSupply: z.string(),
  ftTokenDecimals: z.string(),
  ftTokenImg: z.string(),
  terminationType: z.string(),
  // DAO specific fields
  creationThreshold: z.string().optional(),
  startThreshold: z.string().optional(),
  voteThreshold: z.string().optional(),
  executionThreshold: z.string().optional(),
  cosigningThreshold: z.string().optional(),
  // Programmed specific fields
  timeElapsedIsEqualToTime: z.any().nullable(),
  vaultAppreciation: z.string().optional(),
});

export const initialVaultState = {
  // Step 1: Configure Vault
  name: '',
  type: 'single',
  privacy: 'public',
  ftTokenTicker: '',
  description: '',
  vaultImage: null,
  bannerImage: null,
  socialLinks: [],

  // Step 2: Asset Contribution
  valuationType: 'lbe',
  contributionOpenWindowType: 'upon-vault-lunch',
  contributionOpenWindowTime: null,
  contributionDuration: 0,
  assetsWhitelist: [],
  valuationCurrency: 'ADA',

  // Step 3: Investment Window
  investmentWindowDuration: null,
  investmentOpenWindowType: 'upon-asset-window-closing',
  investmentOpenWindowTime: null,
  offAssetsOffered: 0,
  ftInvestmentReserve: 0,
  liquidityPoolContribution: 0,

  // Step 4: Governance
  ftTokenSupply: 1000000000,
  ftTokenDecimals: 2,
  ftTokenImg: null,
  terminationType: 'dao',
  // DAO specific fields
  creationThreshold: 0,
  startThreshold: 0,
  voteThreshold: 0,
  executionThreshold: 0,
  cosigningThreshold: 0,
  // Programmed specific fields
  timeElapsedIsEqualToTime: null,
  vaultAppreciation: 0,
};

// export const stepFields = {
//   1: ['name', 'type', 'privacy', 'ftTokenTicker', 'description', 'vaultImage', 'bannerImage', 'socialLinks'],
//   2: ['valuationType', 'contributionOpenWindowType', 'contributionOpenWindowTime', 'assetsWhitelist', 'assetWindowDate', 'minAssetCountCap', 'maxAssetCountCap'],
//   3: ['investmentWindowDuration', 'investmentOpenWindowType', 'investmentOpenWindowTime', 'offAssetsOffered', 'ftInvestmentReserve', 'liquidityPoolContribution'],
//   4: ['ftTokenSupply', 'ftTokenDecimals', 'ftTokenImg', 'terminationType', 'creationThreshold', 'startThreshold', 'voteThreshold', 'executionThreshold', 'cosigningThreshold', 'timeElapsedIsEqualToTime', 'vaultAppreciation'],
//   5: [],
// };

export const stepFields = {
  1: ['name', 'type', 'privacy', 'ftTokenTicker', 'description', 'vaultImage', 'bannerImage', 'socialLinks'],
  2: [],
  3: [],
  4: [],
  5: [],
};
