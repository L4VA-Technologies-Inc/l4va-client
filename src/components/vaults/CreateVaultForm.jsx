import { useState } from 'react';
import { Formik, Form } from 'formik';
import { ChevronRight } from 'lucide-react';

import { ConfigureVault } from './steps/ConfigureVault';
import { AssetContribution } from './steps/AssetContribution';

import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { SecondaryButton } from '@/components/shared/SecondaryButton';
import { LavaStepCircle } from '@/components/shared/LavaStepCircle';
import { validationSchema } from '@/components/vaults/constants/vaults.constants';

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
    whitelistAssets: [],
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

  const renderStepContent = (step, formikProps) => {
    switch (step) {
      case 1:
        return <ConfigureVault formikProps={formikProps} />;
      case 2:
        return <AssetContribution formikProps={formikProps} />;
      case 3:
        return <div />;
      case 4:
        return <div />;
      case 5:
        return <div />;
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
            {renderStepContent(currentStep, formikProps)}
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
