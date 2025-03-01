import * as Yup from 'yup';

// File size validation (5MB max)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed image file types
const SUPPORTED_FORMATS = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Validation schemas for each step of the form
export const validationSchema = {
  // Step 1: Configure Vault
  1: Yup.object().shape({
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

    vaultBanner: Yup.mixed()
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
  }),

  // Step 2: Asset Contribution
  2: Yup.object().shape({
    // Add validation for asset contribution step
    assets: Yup.array().of(
      Yup.object().shape({
        // Asset validation schema
        assetName: Yup.string().required('Asset name is required'),
        assetType: Yup.string(),
        assetValue: Yup.number().positive('Value must be positive'),
      }),
    ),
  }),

  // Step 3: Investment
  3: Yup.object().shape({
    investmentTarget: Yup.number()
      .positive('Investment target must be positive')
      .required('Investment target is required'),
    minimumInvestment: Yup.number()
      .positive('Minimum investment must be positive'),
  }),

  // Step 4: Governance
  4: Yup.object().shape({
    governanceModel: Yup.string(),
    votingThreshold: Yup.number()
      .min(0, 'Threshold must be at least 0%')
      .max(100, 'Threshold cannot exceed 100%'),
  }),

  // Step 5: Launch
  5: Yup.object().shape({
    launchDate: Yup.date()
      .min(new Date(), 'Launch date must be in the future'),
  }),
};
