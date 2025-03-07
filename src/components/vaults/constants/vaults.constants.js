import { z } from 'zod';

export const VAULT_PRIVACY_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  SEMI_PRIVATE: 'semi-private',
};

// Social link schema
const socialLinkSchema = z.object({
  platform: z.string({ required_error: 'Platform is required' }),
  url: z.string({ required_error: 'URL is required' }),
});

// Main vault schema
export const vaultSchema = z.object({
  // Step 1: Configure Vault
  name: z.string()
    .min(3, { message: 'Vault name must be at least 3 characters' })
    .max(50, { message: 'Vault name must be less than 50 characters' }),
  type: z.string(),
  privacy: z.string(),
  fractionToken: z.string()
    .regex(/^[A-Z0-9]{1,10}$/, { message: 'Ticker must be 1-10 uppercase letters or numbers' })
    .nullable(),
  description: z.string()
    .max(500, { message: 'Description must be less than 500 characters' })
    .optional(),
  vaultImage: z.string(),
  backgroundBanner: z.string(),
  socialLinks: z.array(socialLinkSchema),

  // Step 2: Asset Contribution
  valuationType: z.string(),
  contributionWindowOpenTime: z.string(),
  contributionWindowOpenDate: z.any().optional(),
  whitelistAssets: z.array(z.any()),
  assetWindowDate: z.any().optional(),
  minAssetCountCap: z.number().int().min(1),
  maxAssetCountCap: z.number().int().min(1),

  // Step 3: Investment Window
  investmentWindowDuration: z.any().nullable(),
  investmentWindowOpenTime: z.string(),
  investmentWindowOpenDate: z.any().nullable(),
  percentAssetsOffered: z.string(),
  ftInvestmentWindow: z.any().nullable(),
  ftInvestmentReserve: z.string(),
  percentLiquidityPoolContribution: z.string(),

  // Step 4: Governance
  ftTokenSupply: z.string(),
  ftTokenDecimals: z.string(),
  ftTokenImage: z.string(),
  terminationType: z.string(),
  // DAO specific fields
  creationThreshold: z.string().optional(),
  startThreshold: z.string().optional(),
  voteThreshold: z.string().optional(),
  executionThreshold: z.string().optional(),
  cosigningThreshold: z.string().optional(),
  // Programmed specific fields
  timeElapsedIsEqualToTime: z.any().nullable(),
  assetAppreciation: z.string().optional(),
  ftTokenDescription: z.string().optional(),
});

export const initialVaultState = {
  // Step 1: Configure Vault
  name: '',
  type: 'single',
  privacy: 'public',
  fractionToken: '',
  description: '',
  vaultImage: null,
  backgroundBanner: null,
  socialLinks: [],

  // Step 2: Asset Contribution
  valuationType: 'lbe',
  contributionWindowOpenTime: 'launch',
  whitelistAssets: [],
  minAssetCountCap: 1,
  maxAssetCountCap: 5,
  valuationCurrency: 'ADA',

  // Step 3: Investment Window
  investmentWindowDuration: null,
  investmentWindowOpenTime: 'assetClose',
  investmentWindowOpenDate: null,
  percentAssetsOffered: '',
  ftInvestmentWindow: null,
  ftInvestmentReserve: '10%',
  percentLiquidityPoolContribution: '',

  // Step 4: Governance
  ftTokenSupply: '',
  ftTokenDecimals: '',
  ftTokenImage: null,
  terminationType: 'dao',
  // DAO specific fields
  creationThreshold: '',
  startThreshold: '',
  voteThreshold: '',
  executionThreshold: '',
  cosigningThreshold: '',
  // Programmed specific fields
  timeElapsedIsEqualToTime: null,
  assetAppreciation: '',
  ftTokenDescription: '',
};

export const stepFields = {
  1: ['name', 'type', 'privacy', 'fractionToken', 'description', 'vaultImage', 'backgroundBanner', 'socialLinks'],
  2: ['valuationType', 'contributionWindowOpenTime', 'contributionWindowOpenDate', 'whitelistAssets', 'assetWindowDate', 'minAssetCountCap', 'maxAssetCountCap'],
  3: ['investmentWindowDuration', 'investmentWindowOpenTime', 'investmentWindowOpenDate', 'percentAssetsOffered', 'ftInvestmentWindow', 'ftInvestmentReserve', 'percentLiquidityPoolContribution'],
  4: ['ftTokenSupply', 'ftTokenDecimals', 'ftTokenImage', 'terminationType', 'creationThreshold', 'startThreshold', 'voteThreshold', 'executionThreshold', 'cosigningThreshold', 'timeElapsedIsEqualToTime', 'assetAppreciation', 'ftTokenDescription'],
  5: [],
};
