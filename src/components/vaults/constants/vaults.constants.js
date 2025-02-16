import * as Yup from 'yup';

export const createSteps = [
  {
    number: 1,
    title: 'Configure Vault',
  },
  {
    number: 2,
    title: 'Configure Assets',
  },
  {
    number: 3,
    title: 'Governance',
  },
  {
    number: 4,
    title: 'Launch',
  },
];

export const createVaultSchema = Yup.object().shape({
  name: Yup.string().required('Vault name is required'),
  type: Yup.string().required('Vault type is required'),
  privacy: Yup.string().required('Vault privacy is required'),
  description: Yup.string(),
});
