import { Field, ErrorMessage } from 'formik';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { LavaRadioGroup } from '@/components/shared/LavaRadioGroup';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaSocialLinks } from '@/components/shared/LavaSocialLinks';

export const ConfigureVault = ({ formikProps }) => {
  const {
    values,
    errors,
    touched,
    setFieldValue,
  } = formikProps;

  return (
    <div className="grid grid-cols-2">
      <div className="px-[36px]">
        <div>
          <Label className="uppercase text-[20px] font-bold" htmlFor="name">
            * Vault name
          </Label>
          <Field
            as={Input}
            className={`
              rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4
              ${touched.name && errors.name ? 'border-red-500' : ''}
            `}
            id="name"
            name="name"
            placeholder="Enter the name of your Vault"
            style={{ fontSize: '20px' }}
          />
          <ErrorMessage className="text-red-500 mt-1" component="div" name="name" />
        </div>

        <div className="grid grid-cols-2 mt-[60px]">
          <Field
            component={LavaRadioGroup}
            label="*Vault type"
            name="type"
            options={[
              { id: 'single', label: 'Single NFT' },
              { id: 'multi', label: 'Multi NFT' },
              { id: 'cnt', label: 'Any CNT' },
            ]}
          />

          <Field
            component={LavaRadioGroup}
            label="*Vault privacy"
            name="privacy"
            options={[
              { id: 'private', label: 'Private Vault' },
              { id: 'public', label: 'Public Vault' },
              { id: 'semi-private', label: 'Semi-Private Vault' },
            ]}
          />
        </div>

        <div className="mt-[60px]">
          <Label className="uppercase text-[20px] font-bold" htmlFor="fractionToken">
            Fractional Token (FT) Ticker
          </Label>
          <Field
            as={Input}
            className="
              rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4
            "
            id="fractionToken"
            name="fractionToken"
            placeholder="0.00"
            style={{ fontSize: '20px' }}
          />
          <ErrorMessage className="text-red-500 mt-1" component="div" name="fractionToken" />
        </div>

        <div className="mt-[60px]">
          <Label className="uppercase text-[20px] font-bold" htmlFor="description">
            Vault brief
          </Label>
          <Field
            as={Textarea}
            className="
              resize-none rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 h-[60px] mt-4 min-h-32
            "
            id="description"
            name="description"
            placeholder="Add a description for your Vault"
            style={{ fontSize: '20px' }}
          />
          <ErrorMessage className="text-red-500 mt-1" component="div" name="description" />
        </div>
        <div className="mt-[60px]">
          <LavaSocialLinks
            errors={errors.socialLinks}
            setSocialLinks={(links) => setFieldValue('socialLinks', links)}
            socialLinks={values.socialLinks}
            touched={touched.socialLinks}
          />
        </div>
      </div>
      <div className="flex flex-col gap-[60px] px-[36px]">
        <UploadZone
          error={touched.vaultImage && errors.vaultImage}
          image={values.vaultImage}
          label="*Vault image"
          setImage={(image) => setFieldValue('vaultImage', image)}
        />
        <UploadZone
          error={touched.vaultBanner && errors.vaultBanner}
          image={values.vaultBanner}
          label="Vault banner"
          setImage={(image) => setFieldValue('vaultBanner', image)}
        />
      </div>
    </div>
  );
};
