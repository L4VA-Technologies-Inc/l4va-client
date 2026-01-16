import * as yup from 'yup';

export const transactionOptionSchema = yup.object({
  assetName: yup.string().required(),
  quantity: yup.string().required(),
  duration: yup.string().when('method', {
    is: 'GTC',
    then: schema => schema.notRequired().nullable(),
    otherwise: schema => schema.required(),
  }),
  price: yup.string().when('sellType', {
    is: 'Market',
    then: schema => schema.notRequired().nullable(),
    otherwise: schema => schema.required(),
  }),
  method: yup.string().required(),
  sellType: yup.string().required(),
  exec: yup.string().required(),
  id: yup.number().required(),
  isMax: yup.boolean().required(),
  market: yup.string().required(),
});
