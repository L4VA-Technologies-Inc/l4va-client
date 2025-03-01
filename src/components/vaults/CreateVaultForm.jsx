import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import { ConfigureVault } from './steps/ConfigureVault';
import { AssetContribution } from '@/components/vaults/steps/AssetContribution';

import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { SecondaryButton } from '@/components/shared/SecondaryButton';
import { LavaStepCircle } from '@/components/shared/LavaStepCircle';

import { transformYupErrorsIntoObject } from '@/utils/core.utils';

import { vaultSchema } from '@/components/vaults/constants/vaults.constants';

export const CreateVaultForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState([
    { id: 1, title: 'Configure Vault', status: 'in progress' },
    { id: 2, title: 'Asset Contribution', status: 'pending' },
    { id: 3, title: 'Investment', status: 'pending' },
    { id: 4, title: 'Governance', status: 'pending' },
    { id: 5, title: 'Launch', status: 'pending' },
  ]);

  const [vaultData, setVaultData] = useState({
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
    minAssetCountCap: 1,
    maxAssetCountCap: 5,
  });

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

  const onSubmit = async () => {
    if (currentStep < steps.length) {
      handleNextStep();
    } else {
      try {
        await vaultSchema.validate(vaultData, { abortEarly: false });
      } catch (e) {
        console.log(transformYupErrorsIntoObject(e));
      }
    }
  };

  const handleStepClick = (stepId) => {
    setCurrentStep(stepId);
    setSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === currentStep) {
          return { ...step, status: step.status === 'in progress' ? 'pending' : step.status };
        } if (step.id === stepId) {
          return { ...step, status: 'in progress' };
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
            setData={setVaultData}
          />
        );
      case 2:
        return (
          <AssetContribution
            data={vaultData}
            setData={setVaultData}
          />
        );
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
