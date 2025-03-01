import { Field } from 'formik';

import { LavaRadioGroup } from '@/components/shared/LavaRadioGroup';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';
import { LavaWhitelistAssets } from '@/components/shared/LavaWhitelistAssets';
import { LavaMinMaxInput } from '@/components/shared/LavaMinMaxInput';

export const AssetContribution = ({ formikProps }) => {
  const {
    values,
    errors,
    touched,
    setFieldValue,
  } = formikProps;

  return (
    <div className="grid grid-cols-2">
      <div className="px-[36px]">
        <Field
          component={LavaRadioGroup}
          label="*Valuation type"
          name="valuationType"
          options={[
            {
              id: 'lbe',
              label: 'LBE (Liquidity Bootstrapping Event)',
            },
          ]}
        />
        <div className="mt-[60px]">
          <Field
            component={LavaRadioGroup}
            label="*Contribution window open time"
            name="contributionWindowOpenTime"
            options={[
              {
                id: 'launch',
                label: 'Upon Vault Launch',
              },
              {
                id: 'custom',
                label: 'Custom',
              },
            ]}
          />
          {values.contributionWindowOpenTime === 'custom' && (
            <div className="mt-4">
              <LavaDatePicker/>
            </div>
          )}
        </div>
      </div>
      <div className="px-[36px]">
        <LavaWhitelistAssets
          errors={errors.whitelistAssets}
          setWhitelistedAssets={(assets) => setFieldValue('whitelistAssets', assets)}
          touched={touched.whitelistAssets}
          whitelistedAssets={values.whitelistAssets}
        />
        <div className="mt-[60px]">
          <div className="uppercase text-[20px] font-bold">
            *Asset window
          </div>
          <div className="mt-4">
            <LavaDatePicker/>
          </div>
        </div>
        <div className="mt-[60px]">
          <div className="uppercase text-[20px] font-bold">
            Asset Count Cap
          </div>
          <div className="mt-4">
            <LavaMinMaxInput/>
          </div>
        </div>
      </div>
    </div>
  );
};
