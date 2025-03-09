import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import { ConfigureVault } from './steps/ConfigureVault';
import { AssetContribution } from '@/components/vaults/steps/AssetContribution';
import { InvestmentWindow } from '@/components/vaults/steps/InvestmentWindow';
import { Governance } from '@/components/vaults/steps/Governance';
import { Launch } from '@/components/vaults/steps/Launch';

import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { SecondaryButton } from '@/components/shared/SecondaryButton';
import { LavaStepCircle } from '@/components/shared/LavaStepCircle';

import { transformZodErrorsIntoObject } from '@/utils/core.utils';

import {
  CREATE_VAULT_STEPS,
  initialVaultState,
  stepFields,
  VAULT_PRIVACY_TYPES,
  vaultSchema,
} from '@/components/vaults/constants/vaults.constants';

export const CreateVaultForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [steps, setSteps] = useState(CREATE_VAULT_STEPS);

  const [vaultData, setVaultData] = useState(initialVaultState);

  const handleNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === currentStep) {
          return { ...step, status: 'completed' };
        } if (step.id === nextStep) {
          return { ...step, status: 'in progress' };
        }
        return step;
      }),
    );
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setSteps(prevSteps =>
        prevSteps.map(step => {
          if (step.id === currentStep) {
            return { ...step, status: 'pending' };
          } if (step.id === prevStep) {
            return { ...step, status: 'in progress' };
          }
          return step;
        }),
      );
    }
  };

  const updateStepErrorIndicators = (currentErrors) => {
    const errorFields = Object.keys(currentErrors);

    setSteps(prevSteps =>
      prevSteps.map(step => ({
        ...step,
        hasErrors: errorFields.some(field => stepFields[step.id].includes(field)),
      })),
    );
  };

  const updateField = (fieldName, value) => setVaultData({
    ...vaultData,
    [fieldName]: value,
  });

  const onSubmit = () => {
    if (currentStep < steps.length) {
      handleNextStep();
    } else {
      try {
        const validatedData = vaultSchema.parse(vaultData);
        console.log('Form data is valid, submitting:', validatedData);
        setErrors({});
      } catch (e) {
        const formattedErrors = transformZodErrorsIntoObject(e);
        setErrors(formattedErrors);
        updateStepErrorIndicators(formattedErrors);
      }
    }
  };

  const handleStepClick = (stepId) => {
    setCurrentStep(stepId);
    setSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === currentStep) {
          return {
            ...step,
            status: step.status === 'in progress' ? 'pending' : step.status,
          };
        } if (step.id === stepId) {
          return {
            ...step,
            status: 'in progress',
          };
        }
        return step;
      }),
    );
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 1:
        return (
          <ConfigureVault
            data={vaultData}
            errors={errors}
            setData={setVaultData}
            updateField={updateField}
          />
        );
      case 2:
        return (
          <AssetContribution
            data={vaultData}
            errors={errors}
            setData={setVaultData}
            updateField={updateField}
          />
        );
      case 3:
        return (
          <InvestmentWindow
            data={vaultData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 4:
        return (
          <Governance
            data={vaultData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 5:
        return <Launch data={vaultData} setCurrentStep={setCurrentStep} />;
      default:
        return null;
    }
  };

  const renderButtons = () => {
    if(currentStep === 5) {
      return (
        <PrimaryButton className="uppercase" onClick={onSubmit}>
          Confirm & launch
        </PrimaryButton>
      );
    }
    return (
      <>
        {currentStep > 1 && (
          <SecondaryButton onClick={handlePreviousStep}>
            <ChevronLeft size={24}/>
          </SecondaryButton>
        )}
        <SecondaryButton className="uppercase px-16 py-4 bg-input-bg">
          Save for later
        </SecondaryButton>
        <PrimaryButton onClick={handleNextStep}>
          <ChevronRight size={24}/>
        </PrimaryButton>
      </>
    );
  };

  const updateValuationType = useCallback((value) => {
    setVaultData(prevData => ({ ...prevData, valuationType: value }));
  }, []);

  useEffect(() => {
    if(vaultData.privacy !== VAULT_PRIVACY_TYPES.PRIVATE) {
      updateValuationType('lbe');
    }
  }, [vaultData.privacy, updateValuationType]);

  return (
    <div className="pb-10">
      <div className="relative flex items-center">
        {steps.map((step, index) => (
          <div
            key={`step-${step.id}`}
            className="flex-1 flex flex-col items-center relative"
          >
            <button
              className="focus:outline-none flex flex-col items-center"
              type="button"
              onClick={() => handleStepClick(step.id)}
            >
              {step.hasErrors && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="w-6 h-6 bg-main-red rounded-full flex items-center justify-center">
                    <span className="text-white">!</span>
                  </div>
                </div>
              )}
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
        {renderStepContent(currentStep)}
      </div>
      <div className="my-[60px] flex gap-[30px] justify-center">
        {renderButtons()}
      </div>
    </div>
  );
};
