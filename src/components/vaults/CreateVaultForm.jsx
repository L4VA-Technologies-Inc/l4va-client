import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { ChevronRight, ChevronLeft, ChevronDown, BookOpen, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWallet } from '@ada-anvil/weld/react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';

import { Spinner } from '@/components/Spinner';
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
  updateStepsCompletionStatus,
  updateStepErrorIndicators as updateStepErrors,
} from '@/components/vaults/utils/stepCompletion';
import { isStepFullyComplete } from '@/utils/stepValidation';
import {
  CREATE_VAULT_STEPS,
  initialVaultState,
  MIN_VLRM_REQUIRED,
  stepFields,
  VAULT_PRIVACY_TYPES,
  vaultSchema,
} from '@/components/vaults/constants/vaults.constants';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useVlrmBalance } from '@/hooks/useVlrmBalance.ts';
import { VaultCreationTutorial } from '@/components/vaults/VaultCreationTutorial';
import { usePresets, useDeletePreset } from '@/services/api/queries';
import { useModalControls } from '@/lib/modals/modal.context';
import { ResetVaultConfirmModal } from '@/components/modals/ResetVaultConfirmModal';

const LazySwapComponent = lazy(() =>
  import('@/components/swap/Swap').then(module => ({
    default: module.SwapComponent,
  }))
);

export const CreateVaultForm = ({ vault, setVault }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [steps, setSteps] = useState(CREATE_VAULT_STEPS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isVisibleSwipe, setIsVisibleSwipe] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState(new Set([1]));
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [vaultData, setVaultData] = useState(initialVaultState);
  const [selectedPresetId, setSelectedPresetId] = useState('advanced');
  const [isPresetAutoApplied, setPresetAutoApplied] = useState(false);
  const [deletingPresetId, setDeletingPresetId] = useState(null);
  const initialPresetIdRef = useRef(null);
  const isPresetManuallyChanged = useRef(false);

  const { vlrmBalance, lastUpdated, fetchVlrmBalance } = useVlrmBalance();

  const navigate = useNavigate();
  const wallet = useWallet('handler', 'isConnected');
  const queryClient = useQueryClient();
  const { openModal } = useModalControls();

  const { data: presetsData, isLoading: isPresetsLoading } = usePresets();
  const { mutateAsync: deletePreset } = useDeletePreset();
  const presets = useMemo(() => presetsData?.data?.items || presetsData?.data || [], [presetsData]);

  const presetOptions = useMemo(() => {
    const fetchedOptions = Array.isArray(presets)
      ? presets
          .filter(preset => preset?.id !== undefined && preset?.id !== null)
          .map(preset => ({
            name: preset.id.toString(),
            label: preset?.name || preset?.type || 'Preset',
            type: preset?.type || '',
            isCustom: preset?.type === 'custom',
          }))
      : [];

    const hasAdvancedPreset =
      Array.isArray(presets) &&
      presets.some(
        preset =>
          preset?.type?.toLowerCase?.() === 'advanced' ||
          preset?.name?.toLowerCase?.() === 'advanced' ||
          preset?.slug === 'advanced'
      );

    return hasAdvancedPreset ? fetchedOptions : [...fetchedOptions, { name: 'advanced', label: 'Advanced' }];
  }, [presets]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToTutorial = () => {
    const tutorialElement = document.getElementById('vault-creation-tutorial');
    if (tutorialElement) {
      const headerHeight = 72;
      const offset = headerHeight + 24;
      const elementPosition = tutorialElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (vault) {
      setVaultData(vault);
      const presetId = vault?.preset_id ? vault.preset_id.toString() : 'advanced';
      setSelectedPresetId(presetId);
      initialPresetIdRef.current = presetId;
      isPresetManuallyChanged.current = false;
      setPresetAutoApplied(true);
    } else {
      setSelectedPresetId('advanced');
      initialPresetIdRef.current = 'advanced';
      isPresetManuallyChanged.current = false;
    }
  }, [vault]);

  useEffect(() => {
    if (!vault || !vaultData.preset_id || vaultData.preset || isPresetsLoading) return;

    const foundPreset = presets.find(preset => preset?.id?.toString() === vaultData.preset_id?.toString());
    if (foundPreset) {
      setVaultData(prev => ({
        ...prev,
        preset: foundPreset.type || 'advanced',
      }));
    } else if (!vaultData.preset_id) {
      setVaultData(prev => ({
        ...prev,
        preset: 'advanced',
      }));
    }
  }, [vault, vaultData.preset_id, presets, isPresetsLoading, vaultData.preset]);

  useEffect(() => {
    if (isPresetAutoApplied || isPresetsLoading || vault) return;

    const simplePreset =
      Array.isArray(presets) &&
      presets.find(
        preset =>
          preset?.type?.toLowerCase?.() === 'simple' ||
          preset?.name?.toLowerCase?.() === 'simple' ||
          preset?.slug === 'simple'
      );

    const advancedPreset =
      Array.isArray(presets) &&
      presets.find(
        preset =>
          preset?.type?.toLowerCase?.() === 'advanced' ||
          preset?.name?.toLowerCase?.() === 'advanced' ||
          preset?.slug === 'advanced'
      );

    let defaultPresetId = 'advanced';
    if (simplePreset?.id) {
      defaultPresetId = simplePreset.id.toString();
    } else if (advancedPreset?.id) {
      defaultPresetId = advancedPreset.id.toString();
    }

    setSelectedPresetId(defaultPresetId);
    setPresetAutoApplied(true);
  }, [isPresetAutoApplied, isPresetsLoading, presets, vault]);

  useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  useEffect(() => {
    setSteps(prevSteps => updateStepsCompletionStatus(prevSteps, vaultData, currentStep));
  }, [vaultData, currentStep]);

  useEffect(() => {
    if (setVault) {
      setVault(vaultData);
    }
  }, [vaultData, setVault]);

  const handleNextStep = async () => {
    if (currentStep < steps.length) {
      let nextStep;
      if (vaultData.preset !== 'advanced') {
        nextStep = steps.length;
      } else {
        nextStep = currentStep + 1;
      }

      await changeStep(nextStep);
    }
  };

  const handlePreviousStep = async () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      await changeStep(prevStep, true);
    }
  };

  const updateStepErrorIndicators = currentErrors => {
    setSteps(prevSteps => updateStepErrors(prevSteps, currentErrors, stepFields));
  };

  const validateStepNavigation = async (targetStep, currentVisitedSteps) => {
    const previousSteps = [...currentVisitedSteps].filter(stepId => stepId < targetStep);

    const belongsToPreviousStep = errorKey => {
      return previousSteps.some(stepId => {
        const stepFieldNames = stepFields[stepId] || [];
        return stepFieldNames.some(stepField => {
          return errorKey === stepField || errorKey.startsWith(`${stepField}.`) || errorKey.startsWith(`${stepField}[`);
        });
      });
    };

    try {
      await vaultSchema.validate(vaultData, { abortEarly: false });
      setErrors(prevErrors => {
        if (!prevErrors || Object.keys(prevErrors).length === 0) {
          updateStepErrorIndicators(prevErrors || {});
          return prevErrors || {};
        }

        const remainingErrors = {};
        Object.keys(prevErrors).forEach(errorKey => {
          if (!belongsToPreviousStep(errorKey)) {
            remainingErrors[errorKey] = prevErrors[errorKey];
          }
        });
        updateStepErrorIndicators(remainingErrors);
        return remainingErrors;
      });
      return true;
    } catch (err) {
      const formattedErrors = transformYupErrors(err);

      const filteredErrors = {};

      Object.keys(formattedErrors).forEach(errorKey => {
        if (belongsToPreviousStep(errorKey)) {
          filteredErrors[errorKey] = formattedErrors[errorKey];
        }
      });

      setErrors(prevErrors => {
        const mergedErrors = { ...filteredErrors };
        if (prevErrors) {
          Object.keys(prevErrors).forEach(errorKey => {
            if (!belongsToPreviousStep(errorKey)) {
              mergedErrors[errorKey] = prevErrors[errorKey];
            }
          });
        }
        updateStepErrorIndicators(mergedErrors);
        return mergedErrors;
      });
      return false;
    }
  };

  const syncArrayErrors = (currentErrors, fieldName, deletedIndex) => {
    const nextErrors = {};
    const regex = new RegExp(`^${fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\[(\\d+)\\]`);

    Object.keys(currentErrors).forEach(key => {
      if (!key.startsWith(`${fieldName}[`)) {
        nextErrors[key] = currentErrors[key];
        return;
      }

      const match = key.match(regex);
      if (match) {
        const index = parseInt(match[1], 10);

        if (index === deletedIndex) {
          return;
        }

        if (index > deletedIndex) {
          const newKey = key.replace(`[${index}]`, `[${index - 1}]`);
          nextErrors[newKey] = currentErrors[key];
        } else {
          nextErrors[key] = currentErrors[key];
        }
      } else {
        nextErrors[key] = currentErrors[key];
      }
    });

    return nextErrors;
  };

  const handleRemoveWhitelistItem = (fieldName, index) => {
    setErrors(prev => {
      const updated = syncArrayErrors(prev, fieldName, index);
      updateStepErrorIndicators(updated);
      return updated;
    });
  };

  const changeStep = async (newStep, skipValidation = false) => {
    const updatedVisitedSteps = new Set([...visitedSteps, newStep]);
    setVisitedSteps(updatedVisitedSteps);

    if (skipValidation) {
      setCurrentStep(newStep);
      setSteps(prevSteps => updateStepsCompletionStatus(prevSteps, vaultData, newStep));
      return;
    }

    await validateStepNavigation(newStep, updatedVisitedSteps);

    setCurrentStep(newStep);
    setSteps(prevSteps => updateStepsCompletionStatus(prevSteps, vaultData, newStep));
  };

  const clearFieldError = fieldName => {
    setErrors(prevErrors => {
      const nextErrors = { ...prevErrors };
      let hasChanges = false;
      if (nextErrors[fieldName]) {
        delete nextErrors[fieldName];
        hasChanges = true;
      }

      Object.keys(nextErrors).forEach(errorKey => {
        if (errorKey.startsWith(`${fieldName}[`)) {
          delete nextErrors[errorKey];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        updateStepErrorIndicators(nextErrors);
        return nextErrors;
      }

      return prevErrors;
    });
  };

  const validateField = async (fieldName, value) => {
    try {
      const tempData = { ...vaultData, [fieldName]: value };
      await vaultSchema.validateAt(fieldName, tempData, { abortEarly: false });
      return true;
    } catch {
      return false;
    }
  };

  const handleServerFieldErrors = error => {
    const message = error?.response?.data?.message;
    if (!message) return false;

    if (message.toLowerCase().includes('ticker')) {
      const tickerError = { vaultTokenTicker: message };
      setErrors(prev => ({ ...prev, ...tickerError }));
      updateStepErrorIndicators(tickerError);
      toast.error(message);
      return true;
    }

    return false;
  };

  const updateField = async (fieldName, value) => {
    setVaultData(prev => ({ ...prev, [fieldName]: value }));

    const isValid = await validateField(fieldName, value);

    if (isValid) {
      clearFieldError(fieldName);
    }
  };

  const handlePresetChange = value => {
    const newPresetId = value || 'advanced';

    if (vault && !isPresetManuallyChanged.current) {
      openModal('ChangePresetWarningModal', {
        onConfirm: () => {
          setSelectedPresetId(newPresetId);
          isPresetManuallyChanged.current = true;
          clearFieldError('preset');
        },
      });
      return;
    }

    setSelectedPresetId(newPresetId);
    if (vault) {
      isPresetManuallyChanged.current = true;
    }
    clearFieldError('preset');
  };

  const onSubmit = async () => {
    if (currentStep < steps.length) {
      await handleNextStep();
    } else {
      const BALANCE_STALENESS_MS = 5 * 60 * 1000;
      const isBalanceOutdated = !lastUpdated || Date.now() - lastUpdated.getTime() > BALANCE_STALENESS_MS;

      let currentBalance = vlrmBalance;

      if (isBalanceOutdated) {
        try {
          const refreshedBalance = await fetchVlrmBalance(false);
          if (refreshedBalance !== undefined) {
            currentBalance = refreshedBalance;
          }
        } catch (err) {
          console.error('Error refreshing VLRM balance:', err);
        }
      }

      if (currentBalance < MIN_VLRM_REQUIRED) {
        toast.error(`You need at least ${MIN_VLRM_REQUIRED} VLRM to launch a vault.`);
        return;
      }

      setIsSubmitting(true);

      try {
        await vaultSchema.validate(vaultData, { abortEarly: false });

        const formattedData = formatVaultData(vaultData);
        setErrors({});

        const { data } = await VaultsApiProvider.createVault(formattedData);

        const signature = await wallet.handler.signTx(data.presignedTx, true);

        await VaultsApiProvider.launchVault({
          vaultId: data.vaultId,
          transaction: data.presignedTx,
          txId: data.txId,
          signatures: [signature],
        }).then(res => {
          if (res.data.id) {
            localStorage.removeItem('storageVault');
            navigate({ to: `/vaults/${data.vaultId}` });
          }
        });
        toast.success('Vault launched successfully');

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['vault', data.vaultId] }),
          queryClient.invalidateQueries({ queryKey: ['vaults'] }),
        ]);
        await changeStep(1, true);
        setSteps(CREATE_VAULT_STEPS);
        setErrors({});
      } catch (err) {
        if (err?.name === 'ValidationError') {
          const formattedErrors = transformYupErrors(err);
          setErrors(formattedErrors);
          updateStepErrorIndicators(formattedErrors);
          toast.error('Please fix the validation errors before submitting');
        } else if (!handleServerFieldErrors(err)) {
          toast.error('Failed to launch vault, it will be saved as draft');
          await saveDraft();
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleStepClick = async stepId => {
    if (stepId === currentStep) return;

    const skipValidation = stepId < currentStep;
    await changeStep(stepId, skipValidation);
    scrollToTop();
  };

  const saveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const formattedData = formatVaultData(vaultData);
      if (vaultData.id) {
        formattedData.id = vaultData.id;
      }

      const { data } = await VaultsApiProvider.saveDraft(formattedData);
      await updateField('id', data.id);
      await queryClient.invalidateQueries({ queryKey: ['vault', data.id] });
      await queryClient.invalidateQueries({ queryKey: ['vaults'] });

      toast.success('Vault saved as a draft');
      await navigate({
        to: '/vaults/my',
        search: { tab: 'Draft' },
      });
    } catch (e) {
      console.log(e);
      toast.error('Failed saving draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleOpenSavePresetModal = () => {
    openModal('SavePresetModal', {
      vaultData,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets'] }),
    });
  };

  const findSimplePresetId = () => {
    const simplePreset =
      Array.isArray(presets) &&
      presets.find(
        preset =>
          preset?.type?.toLowerCase?.() === 'simple' ||
          preset?.name?.toLowerCase?.() === 'simple' ||
          preset?.slug === 'simple'
      );
    return simplePreset?.id ? simplePreset.id.toString() : null;
  };

  const handleDeletePreset = async option => {
    if (!option?.name) return;
    const presetId = option.name;
    const presetToDelete = presets.find(preset => preset?.id?.toString() === presetId);
    const presetName = presetToDelete?.name || presetToDelete?.type || option?.label || 'this preset';

    const performDelete = async () => {
      try {
        setDeletingPresetId(presetId);
        await deletePreset(presetId);
        await queryClient.invalidateQueries({ queryKey: ['presets'] });

        if (selectedPresetId === presetId) {
          const simplePresetId = findSimplePresetId();
          setSelectedPresetId(simplePresetId || 'advanced');
        }

        toast.success('Preset deleted');
      } catch (e) {
        console.error(e);
        toast.error('Failed to delete preset');
      } finally {
        setDeletingPresetId(null);
      }
    };

    openModal('DeletePresetConfirmModal', {
      presetName,
      onConfirm: performDelete,
    });
  };

  const handleDeleteDraft = () => {
    if (!vault?.id) {
      toast.error('No draft to delete');
      return;
    }

    const performDelete = async () => {
      try {
        setIsSavingDraft(true);
        await VaultsApiProvider.deleteDraft(vault.id);
        await queryClient.invalidateQueries({ queryKey: ['vault', vault.id] });
        await queryClient.invalidateQueries({ queryKey: ['vaults'] });

        toast.success('Draft deleted successfully');
        navigate({
          to: '/vaults/my',
          search: { tab: 'Draft' },
        });
      } catch (e) {
        console.error(e);
        toast.error('Failed to delete draft');
      } finally {
        setIsSavingDraft(false);
      }
    };

    openModal('DeleteDraftConfirmModal', {
      vaultName: vaultData.name || vault.name,
      onConfirm: performDelete,
    });
  };

  const handleResetVault = () => {
    setIsResetModalOpen(true);
  };

  const resetVault = async () => {
    localStorage.removeItem('storageVault');

    const simplePresetId = findSimplePresetId();
    const simplePreset = presets.find(preset => preset?.id?.toString() === simplePresetId);
    const presetId = simplePresetId || 'advanced';

    const resetData = { ...initialVaultState };

    if (simplePreset && simplePreset.config) {
      const config = simplePreset.config;
      resetData.preset = simplePreset.type || 'simple';
      resetData.preset_id = simplePreset.id ?? null;
      resetData.tokensForAcquires = config.tokensForAcquires ?? null;
      resetData.acquireReserve = config.acquireReserve ?? null;
      resetData.liquidityPoolContribution = config.liquidityPoolContribution ?? null;
      resetData.creationThreshold = config.creationThreshold ?? null;
      resetData.voteThreshold = config.voteThreshold ?? null;
      resetData.executionThreshold = config.executionThreshold ?? null;
    }

    setVaultData(resetData);
    await changeStep(1, true);
    setSteps(CREATE_VAULT_STEPS);
    setErrors({});
    setVisitedSteps(new Set([1]));
    setSelectedPresetId(presetId);
    setPresetAutoApplied(false);
    initialPresetIdRef.current = presetId;
    isPresetManuallyChanged.current = false;

    if (setVault) {
      setVault(resetData);
    }

    toast.success('Vault creation form has been reset');
  };

  const renderStepContent = step => {
    switch (step) {
      case 1:
        return (
          <ConfigureVault
            data={vaultData}
            errors={errors}
            updateField={updateField}
            presetOptions={presetOptions}
            presetValue={selectedPresetId}
            onPresetChange={handlePresetChange}
            isPresetsLoading={isPresetsLoading}
            onDeletePreset={handleDeletePreset}
            deletingPresetId={deletingPresetId}
            onImageUploadingChange={setIsImageUploading}
            onRemoveWhitelistItem={handleRemoveWhitelistItem}
          />
        );
      case 2:
        return <AssetContribution data={vaultData} errors={errors} updateField={updateField} />;
      case 3:
        return <AcquireWindow data={vaultData} errors={errors} updateField={updateField} />;
      case 4:
        return <Governance data={vaultData} errors={errors} updateField={updateField} />;
      case 5:
        return (
          <Launch
            data={vaultData}
            setCurrentStep={async stepId => {
              await changeStep(stepId, stepId < currentStep);
            }}
            errors={errors}
            updateField={updateField}
          />
        );
      default:
        return null;
    }
  };

  const renderButtons = () => {
    if (currentStep === 5) {
      return (
        <div className="flex justify-center gap-4 py-8">
          <SecondaryButton
            className="uppercase font-semibold"
            disabled={isSubmitting || isSavingDraft || presets.filter(preset => preset.type === 'custom').length >= 3}
            onClick={handleOpenSavePresetModal}
          >
            Save preset
          </SecondaryButton>
          <PrimaryButton className="uppercase" disabled={isSubmitting || !wallet.isConnected} onClick={onSubmit}>
            {isSubmitting ? 'Launching...' : !wallet.isConnected ? 'Connect wallet to launch' : 'Confirm & launch'}
          </PrimaryButton>
        </div>
      );
    }
    return (
      <div className="flex justify-center gap-4 py-8">
        {currentStep > 1 && (
          <SecondaryButton size="lg" disabled={isSubmitting || isSavingDraft} onClick={handlePreviousStep}>
            <ChevronLeft size={24} />
          </SecondaryButton>
        )}
        {vault && vault.vaultStatus === 'draft' && (
          <SecondaryButton size="lg" disabled={isSubmitting || isSavingDraft} onClick={handleDeleteDraft}>
            Delete draft
          </SecondaryButton>
        )}
        <SecondaryButton size="lg" disabled={isSubmitting || isSavingDraft} onClick={saveDraft}>
          Save for later
        </SecondaryButton>
        <PrimaryButton size="lg" disabled={isSubmitting || isSavingDraft || isImageUploading} onClick={handleNextStep}>
          {isImageUploading ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
            </div>
          ) : (
            <ChevronRight size={24} />
          )}
        </PrimaryButton>
      </div>
    );
  };

  const updateValueMethod = useCallback(value => {
    setVaultData(prevData => ({ ...prevData, valueMethod: value }));
  }, []);

  useEffect(() => {
    if (vaultData.privacy !== VAULT_PRIVACY_TYPES.PRIVATE) {
      updateValueMethod('lbe');
    }
  }, [vaultData.privacy, updateValueMethod]);

  useEffect(() => {
    if (vault) {
      if (!isPresetManuallyChanged.current) return;
    }

    if (!selectedPresetId) return;

    if (selectedPresetId === 'advanced') {
      setVaultData(prev => ({
        ...prev,
        preset: 'advanced',
        preset_id: null,
        tokensForAcquires: null,
        acquireReserve: null,
        liquidityPoolContribution: null,
        creationThreshold: null,
        voteThreshold: null,
        executionThreshold: null,
      }));
      return;
    }

    const selectedPreset = presets.find(preset => preset?.id?.toString() === selectedPresetId);
    if (!selectedPreset) {
      if (!isPresetsLoading) {
        setSelectedPresetId('advanced');
      }
      return;
    }

    const config = selectedPreset.config || {};

    setVaultData(prev => ({
      ...prev,
      preset: selectedPreset.type || prev.preset || 'advanced',
      preset_id: selectedPreset.id ?? null,
      tokensForAcquires: config.tokensForAcquires ?? null,
      acquireReserve: config.acquireReserve ?? null,
      liquidityPoolContribution: config.liquidityPoolContribution ?? null,
      creationThreshold: config.creationThreshold ?? null,
      voteThreshold: config.voteThreshold ?? null,
      executionThreshold: config.executionThreshold ?? null,
    }));
  }, [isPresetsLoading, presets, selectedPresetId, vault]);

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
      <button
        onClick={handleResetVault}
        disabled={isSubmitting || isSavingDraft}
        className="fixed top-25 right-8 z-50 w-12 h-12 bg-steel-800 hover:bg-steel-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center border border-steel-700 hover:border-steel-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label="Reset vault creation"
        title="Reset vault creation"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
      <PrimaryButton
        onClick={scrollToTutorial}
        className="fixed bottom-8 right-8 z-50 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
        aria-label="Scroll to tutorial"
      >
        <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
        <span className="hidden sm:inline font-russo uppercase text-sm">Tutorial</span>
        <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform duration-300" />
      </PrimaryButton>
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
                {isStepFullyComplete(currentStep, vaultData) ? 'completed' : 'in progress'}
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
      <div className="hidden md:flex relative items-center mb-8">
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
                className={`absolute top-[25%] -right-[15%] lg:-right-[25%] w-[30%] lg:w-[45%] h-[3px] 
                  ${step.id < currentStep ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-white/10'}
                `}
                style={{ transform: 'translateX(0)' }}
              />
            )}
          </div>
        ))}
      </div>
      <>{renderStepContent(currentStep)}</>
      <>{renderButtons()}</>
      <Dialog open={isVisibleSwipe} onOpenChange={() => setIsVisibleSwipe(false)}>
        <DialogContent className="sm:max-w-4xl items-center justify-center pt-8 bg-steel-950 border-none max-h-[90vh] flex w-fit">
          {isVisibleSwipe ? (
            <Suspense fallback={<div className="px-12 py-10 text-dark-100">Loading swap widget…</div>}>
              <LazySwapComponent
                config={{
                  defaultToken: import.meta.env.VITE_SWAP_VLRM_TOKEN_ID,
                  supportedTokens: [import.meta.env.VITE_SWAP_VLRM_TOKEN_ID],
                }}
              />
            </Suspense>
          ) : null}
        </DialogContent>
      </Dialog>
      <ResetVaultConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetVault}
      />
      <VaultCreationTutorial />
    </div>
  );
};
