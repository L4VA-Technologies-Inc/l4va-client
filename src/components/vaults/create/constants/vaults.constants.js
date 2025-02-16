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
  vaultName: Yup.string().required('Vault name is required'),
  vaultType: Yup.string().required('Vault type is required'),
  vaultPrivacy: Yup.string().required('Vault privacy is required'),
  vaultBrief: Yup.string(),
});
