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
