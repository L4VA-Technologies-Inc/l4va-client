import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWallet } from '@ada-anvil/weld/react';

import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { LavaSelect } from '@/components/shared/LavaSelect';
import { VaultsApiProvider } from '@/services/api/vaults';
import { ConfigureVault } from '@/components/vaults/steps/ConfigureVault';
import { AssetContribution } from '@/components/vaults/steps/AssetContribution';
import { AcquireWindow } from '@/components/vaults/steps/AcquireWindow';
import { Governance } from '@/components/vaults/steps/Governance';
import { Launch } from '@/components/vaults/steps/Launch';
import { LavaStepCircle } from '@/components/shared/LavaStepCircle';
import { formatVaultData } from '@/components/vaults/utils/vaults.utils';
import { transformYupErrors } from '@/utils/core.utils';
import {
  CREATE_VAULT_STEPS,
  initialVaultState,
  stepFields,
  VAULT_PRIVACY_TYPES,
  vaultSchema,
} from '@/components/vaults/constants/vaults.constants';

export const CreateVaultForm = ({ vault }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [steps, setSteps] = useState(CREATE_VAULT_STEPS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const [vaultData, setVaultData] = useState(initialVaultState);

  const wallet = useWallet('handler', 'isConnected');

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (vault) {
      setVaultData(vault);
    }
  }, [vault]);

  useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  const handleNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === currentStep) {
          return { ...step, status: 'completed' };
        }
        if (step.id === nextStep) {
          return { ...step, status: 'in progress' };
        }
        return step;
      })
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
          }
          if (step.id === prevStep) {
            return { ...step, status: 'in progress' };
          }
          return step;
        })
      );
    }
  };

  const updateStepErrorIndicators = currentErrors => {
    const errorFields = Object.keys(currentErrors);

    setSteps(prevSteps =>
      prevSteps.map(step => ({
        ...step,
        hasErrors: errorFields.some(field => stepFields[step.id].includes(field)),
      }))
    );
  };

  const updateField = (fieldName, value) =>
    setVaultData({
      ...vaultData,
      [fieldName]: value,
    });

  const onSubmit = async () => {
    if (currentStep < steps.length) {
      handleNextStep();
    } else {
      try {
        setIsSubmitting(true);
        await vaultSchema.validate(vaultData, { abortEarly: false });

        const formattedData = formatVaultData(vaultData);
        setErrors({});

        const { data } = await VaultsApiProvider.createVault(formattedData);

        const signature = await wallet.handler.signTx(data.presignedTx, true);

        await VaultsApiProvider.launchVault({
          vaultId: data.vaultId,
          transaction: data.presignedTx,
          signatures: [signature],
        });
        toast.success('Vault launched successfully');
      } catch (err) {
        console.log(err);
        const formattedErrors = transformYupErrors(err);
        setErrors(formattedErrors);
        updateStepErrorIndicators(formattedErrors);
        toast.error('Please fix the validation errors before submitting');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleStepClick = stepId => {
    if (stepId === currentStep) return;
    setCurrentStep(stepId);
    scrollToTop();
    setSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === currentStep) {
          return {
            ...step,
            status: step.status === 'in progress' ? 'pending' : step.status,
          };
        }
        if (step.id === stepId) {
          return {
            ...step,
            status: 'in progress',
          };
        }
        return step;
      })
    );
  };

  const saveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const formattedData = formatVaultData(vaultData);
      const { data } = await VaultsApiProvider.saveDraft(formattedData);
      updateField('id', data.id);
      toast.success('Vault saved as a draft');
    } catch (e) {
      console.log(e);
      toast.error('Failed saving draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const renderStepContent = step => {
    switch (step) {
      case 1:
        return <ConfigureVault data={vaultData} errors={errors} setData={setVaultData} updateField={updateField} />;
      case 2:
        return <AssetContribution data={vaultData} errors={errors} setData={setVaultData} updateField={updateField} />;
      case 3:
        return <AcquireWindow data={vaultData} errors={errors} updateField={updateField} />;
      case 4:
        return <Governance data={vaultData} errors={errors} updateField={updateField} />;
      case 5:
        return <Launch data={vaultData} setCurrentStep={setCurrentStep} />;
      default:
        return null;
    }
  };

  const renderButtons = () => {
    if (currentStep === 5) {
      return (
        <PrimaryButton className="uppercase" disabled={isSubmitting} onClick={onSubmit}>
          {isSubmitting ? 'Launching...' : 'Confirm & launch'}
        </PrimaryButton>
      );
    }
    return (
      <div className="flex justify-center gap-4 py-8">
        {currentStep > 1 && (
          <SecondaryButton size="lg" disabled={isSubmitting || isSavingDraft} onClick={handlePreviousStep}>
            <ChevronLeft size={24} />
          </SecondaryButton>
        )}
        <SecondaryButton size="lg" disabled={isSubmitting || isSavingDraft} onClick={saveDraft}>
          Save for later
        </SecondaryButton>
        <PrimaryButton size="lg" disabled={isSubmitting || isSavingDraft} onClick={handleNextStep}>
          <ChevronRight size={24} />
        </PrimaryButton>
      </div>
    );
  };

  const updateValuationType = useCallback(value => {
    setVaultData(prevData => ({ ...prevData, valuationType: value }));
  }, []);

  useEffect(() => {
    if (vaultData.privacy !== VAULT_PRIVACY_TYPES.PRIVATE) {
      updateValuationType('lbe');
    }
  }, [vaultData.privacy, updateValuationType]);

  const stepOptions = steps.map(step => ({
    value: step.id.toString(),
    label: `${step.id}. ${step.title}`,
  }));

  const handleStepSelect = stepId => {
    const numericStepId = parseInt(stepId);
    handleStepClick(numericStepId);
  };

  return (
    <div className="pb-8">
      <div className="md:hidden mb-8">
        <LavaSelect
          label="Current Step"
          options={stepOptions}
          value={currentStep.toString()}
          onChange={handleStepSelect}
          placeholder="Select a step"
        />
        <div className="mt-4 p-4 bg-steel-850 rounded-lg border border-steel-750">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-100 uppercase font-russo">
                {steps.find(step => step.id === currentStep)?.status || 'pending'}
              </p>
              <p className="text-lg font-bold text-white">{steps.find(step => step.id === currentStep)?.title || ''}</p>
            </div>
            {steps.find(step => step.id === currentStep)?.hasErrors && (
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">!</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="hidden md:flex relative items-center">
        {steps.map((step, index) => (
          <div key={`step-${step.id}`} className="flex-1 flex flex-col items-center relative">
            <button
              className="focus:outline-none flex flex-col items-center"
              type="button"
              onClick={() => handleStepClick(step.id)}
            >
              {step.hasErrors && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <span className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">!</span>
                </div>
              )}
              <div className="relative z-10">
                <LavaStepCircle isActive={currentStep === step.id} number={step.id} status={step.status} />
              </div>
              <p className="uppercase font-russo text-sm text-dark-100 mt-8">{step.status}</p>
              <p className="font-bold text-2xl whitespace-nowrap">{step.title}</p>
            </button>
            {index < steps.length - 1 && (
              <div
                className={`absolute top-[25%] left-[calc(50%+55px)] w-[124px] h-[3px] 
                  ${step.id < currentStep ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-white/10'}
                `}
                style={{ transform: 'translateX(0)' }}
              />
            )}
          </div>
        ))}
      </div>
      <div>{renderStepContent(currentStep)}</div>
      <div>{renderButtons()}</div>
    </div>
  );
};
