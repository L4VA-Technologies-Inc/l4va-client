import * as Yup from 'yup';
import { object } from 'yup';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const SUPPORTED_FORMATS = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const vaultSchema = object({
  name: Yup.string()
    .required('Vault name is required')
    .min(3, 'Vault name must be at least 3 characters')
    .max(50, 'Vault name must be less than 50 characters'),

  type: Yup.string(),

  privacy: Yup.string(),

  fractionToken: Yup.string()
    .matches(/^[A-Z0-9]{1,10}$/, 'Ticker must be 1-10 uppercase letters or numbers')
    .nullable(),

  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),

  vaultImage: Yup.mixed()
    .required('Vault image is required')
    .test(
      'fileSize',
      'File size is too large (max 5MB)',
      value => !value || value.size <= MAX_FILE_SIZE,
    )
    .test(
      'fileFormat',
      'Unsupported file format',
      value => !value || SUPPORTED_FORMATS.includes(value.type),
    ),

  backgroundBanner: Yup.mixed()
    .nullable()
    .test(
      'fileSize',
      'File size is too large (max 5MB)',
      value => !value || value.size <= MAX_FILE_SIZE,
    )
    .test(
      'fileFormat',
      'Unsupported file format',
      value => !value || SUPPORTED_FORMATS.includes(value.type),
    ),

  socialLinks: Yup.array().of(
    Yup.object().shape({
      platform: Yup.string()
        .required('Platform is required'),
      url: Yup.string()
        .required('URL is required'),
    }),
  ),
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
