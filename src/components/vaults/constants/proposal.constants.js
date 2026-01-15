import * as yup from 'yup';

export const transactionOptionSchema = yup.object({
  assetName: yup.string().required(),
  quantity: yup.string().required(),
  duration: yup.string().required(),
  exec: yup.string().required(),
  id: yup.number().required(),
  isMax: yup.boolean().required(),
  market: yup.string().required(),
  method: yup.string().required(),
  price: yup.string().required(),
  sellType: yup.string().required(),
});
