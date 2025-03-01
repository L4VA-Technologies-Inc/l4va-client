import { useState } from 'react';
import {
  Formik, Form, Field, ErrorMessage,
} from 'formik';
import { ChevronRight } from 'lucide-react';

import { validationSchema } from '@/components/vaults/constants/vaults.constants';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { LavaStepCircle } from '@/components/shared/LavaStepCircle';
import { LavaRadioGroup } from '@/components/shared/LavaRadioGroup';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaSocialLinks } from '@/components/shared/LavaSocialLinks';
import { SecondaryButton } from '@/components/shared/SecondaryButton';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { LavaDatePicker } from '@/components/shared/LavaDatePicker';

export const CreateVaultForm = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Configure Vault', status: 'in progress' },
    { id: 2, title: 'Asset Contribution', status: 'pending' },
    { id: 3, title: 'Investment', status: 'pending' },
    { id: 4, title: 'Governance', status: 'pending' },
    { id: 5, title: 'Launch', status: 'pending' },
  ];

  const initialValues = {
    name: '',
    type: 'single',
    privacy: 'public',
    fractionToken: '',
    description: '',
    vaultImage: null,
    vaultBanner: null,
    socialLinks: [],
    valuationType: 'lbe',
    contributionWindowOpenTime: 'launch',
  };

  const handleNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    // Update step status
    steps.forEach(step => {
      if (step.id === currentStep) {
        step.status = 'completed';
      } else if (step.id === nextStep) {
        step.status = 'in progress';
      }
    });
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (values, { setSubmitting }) => {
    console.log('Form values:', values);
    if (currentStep < steps.length) {
      handleNextStep();
    } else {
      // Final form submission
      alert('Form submitted successfully!');
    }
    setSubmitting(false);
  };

  const getStepContent = (step, formikProps) => {
    const {
      values, errors, touched, setFieldValue,
    } = formikProps;

    switch (step) {
      case 1:
        return (
          <div className="grid grid-cols-2">
            <div>
              <div>
                <Label className="uppercase text-[20px] font-bold" htmlFor="name">
                  * Vault name
                </Label>
                <Field
                  as={Input}
                  className={`
                    rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 w-[500px] h-[60px] mt-4
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
                    rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 w-[500px] h-[60px] mt-4
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
                    resize-none rounded-[10px] py-4 pl-5 text-[20px] bg-input-bg border-dark-600 w-[500px] h-[60px] mt-4 min-h-32
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
      case 2:
        return (
          <div className="grid grid-cols-2">
            <div>
              <Field
                component={LavaRadioGroup}
                label="*Valuation type"
                name="valuationType"
                options={[
                  { id: 'lbe', label: 'LBE (Liquidity Bootstrapping Event)' },
                ]}
              />
              <div className="mt-[60px]">
                <Field
                  component={LavaRadioGroup}
                  label="*Contribution window open time"
                  name="contributionWindowOpenTime"
                  options={[
                    { id: 'launch', label: 'Upon Vault Launch' },
                    { id: 'custom', label: 'Custom' },
                  ]}
                />
                {values.contributionWindowOpenTime === 'custom' && (
                  <div className="mt-4">
                    <LavaDatePicker />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold">Investment</h2>
            {/* Investment step content */}
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold">Governance</h2>
            {/* Governance step content */}
          </div>
        );
      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold">Launch</h2>
            {/* Launch step content */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Formik
      validateOnBlur
      initialValues={initialValues}
      validateOnChange={false}
      validationSchema={validationSchema[currentStep]}
      onSubmit={handleSubmit}
    >
      {(formikProps) => (
        <Form className="block pb-10">
          <div className="relative flex items-center">
            {steps.map((step, index) => (
              <div
                key={`step-${step.id}`}
                className="flex-1 flex flex-col items-center relative"
              >
                <button
                  className="focus:outline-none flex flex-col items-center"
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className="relative z-10">
                    <LavaStepCircle
                      isActive={currentStep === step.id}
                      number={step.id}
                      status={step.status}
                    />
                  </div>
                  <p className="uppercase font-russo text-sm text-dark-100 mt-8">
                    {step.status}
                  </p>
                  <p className="font-bold text-2xl whitespace-nowrap">
                    {step.title}
                  </p>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className="absolute top-[25%] left-[calc(50%+55px)] w-[124px] h-[3px] bg-white/10"
                    style={{ transform: 'translateX(0)' }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-[100px]">
            {getStepContent(currentStep, formikProps)}
          </div>

          <div className="my-[60px] flex gap-[30px] justify-center">
            <SecondaryButton className="uppercase px-16 py-4 bg-input-bg">
              Save for later
            </SecondaryButton>
            <PrimaryButton onClick={handleNextStep}>
              <ChevronRight className="text-dark-700" size={24} />
            </PrimaryButton>
          </div>
        </Form>
      )}
    </Formik>
  );
};
