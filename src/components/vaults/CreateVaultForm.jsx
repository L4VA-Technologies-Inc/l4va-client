import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  BookOpen,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  RefreshCcw,
} from 'lucide-react';
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
  stepFields,
  VAULT_PRIVACY_TYPES,
  vaultSchema,
} from '@/components/vaults/constants/vaults.constants';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useVlrmBalance } from '@/hooks/useVlrmBalance.ts';
import { VaultCreationTutorial } from '@/components/vaults/VaultCreationTutorial';
import { usePresets, useDeletePreset, useVlrmFeeSettings } from '@/services/api/queries';
import { useModalControls } from '@/lib/modals/modal.context';
import { useAuth } from '@/lib/auth/auth';
import { ResetVaultConfirmModal } from '@/components/modals/ResetVaultConfirmModal';
import { canCreateVault, IS_MAINNET } from '@/utils/networkValidation';

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
  const [canCreateVaults, setCanCreateVaults] = useState(true);

  const [vaultData, setVaultData] = useState(initialVaultState);
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [deletingPresetId, setDeletingPresetId] = useState(null);

  // Tracks whether the preset has been manually changed by the user (for edit-vault warning modal)
  const isPresetManuallyChanged = useRef(false);
  // Tracks which vault key we have already resolved presets for, to avoid re-running on query refetches
  const resolvedForVaultRef = useRef(null);

  const { vlrmBalance, lastUpdated, fetchVlrmBalance } = useVlrmBalance();

  const navigate = useNavigate();
  const wallet = useWallet('handler', 'isConnected');
  const queryClient = useQueryClient();
  const { openModal } = useModalControls();
  const { user } = useAuth();

  const {
    data: presetsData,
    isLoading: isPresetsLoading,
    isError: isPresetsError,
    refetch: refetchPresets,
  } = usePresets();
  const { mutateAsync: deletePreset } = useDeletePreset();
  const { data: vlrmFeeData } = useVlrmFeeSettings();
  const presets = useMemo(() => presetsData?.data?.items || presetsData?.data || [], [presetsData]);

  // --- Derived preset state ---

  const isAdvancedPresetAvailable = useMemo(
    () =>
      Array.isArray(presets) &&
      presets.some(p => p?.type?.toLowerCase() === 'advanced' || p?.name?.toLowerCase() === 'advanced'),
    [presets]
  );

  // Config-controlled inputs are locked unless an advanced preset exists AND is currently active
  const isPresetConfigLocked = !isAdvancedPresetAvailable || vaultData.preset !== 'advanced';

  const presetOptions = useMemo(
    () =>
      Array.isArray(presets)
        ? presets
            .filter(preset => preset?.id !== undefined && preset?.id !== null)
            .map(preset => ({
              name: preset.id.toString(),
              label: preset?.name || preset?.type || 'Preset',
              type: preset?.type || '',
              isCustom: preset?.type === 'custom',
            }))
        : [],
    [presets]
  );

  // Whether the form should be fully blocked (loading or fetch error)
  const isFormBlocked = isPresetsLoading || isPresetsError;

  // --- Authorization check ---

  useEffect(() => {
    if (IS_MAINNET && user?.address) {
      const authorized = canCreateVault(user.address);
      setCanCreateVaults(authorized);
      if (!authorized) {
        toast.error('Your wallet address is not authorized to create vaults', {
          duration: 6000,
          id: 'vault-creation-unauthorized',
        });
      }
    }
  }, [user?.address]);

  // --- Vault data initialization (editing a draft / restoring local state) ---

  useEffect(() => {
    if (vault) {
      setVaultData(vault);
      isPresetManuallyChanged.current = false;
      // Allow the preset resolution effect to re-run for the new vault
      resolvedForVaultRef.current = null;
    }
  }, [vault]);

  // --- Single preset resolution effect ---
  // Runs once per vault identity after presets successfully load.
  // Handles: new vault default, draft with valid preset, draft with deleted/missing preset.

  useEffect(() => {
    if (isPresetsLoading || isPresetsError || !Array.isArray(presets) || presets.length === 0) return;

    const vaultKey = vault?.id?.toString() ?? '__new__';
    if (resolvedForVaultRef.current === vaultKey) return;
    resolvedForVaultRef.current = vaultKey;

    const firstPreset = presets[0];

    const applyPresetData = preset => {
      if (!preset) return;
      const config = preset.config || {};
      setVaultData(prev => ({
        ...prev,
        preset: preset.type || 'advanced',
        preset_id: preset.id ?? null,
        tokensForAcquires: config.tokensForAcquires ?? prev.tokensForAcquires,
        acquireReserve: config.acquireReserve ?? prev.acquireReserve,
        liquidityPoolContribution: config.liquidityPoolContribution ?? prev.liquidityPoolContribution,
        creationThreshold: config.creationThreshold ?? prev.creationThreshold,
        voteThreshold: 0,
        cosigningThreshold: config.cosigningThreshold ?? prev.cosigningThreshold,
        executionThreshold: config.executionThreshold ?? prev.executionThreshold,
      }));
      setSelectedPresetId(preset.id.toString());
    };

    if (vault) {
      const savedPresetId = vault?.preset_id?.toString();
      if (savedPresetId) {
        const foundPreset = presets.find(p => p?.id?.toString() === savedPresetId);
        if (foundPreset) {
          // Preset still exists — just sync the type label, keep existing config values
          setSelectedPresetId(savedPresetId);
          setVaultData(prev => ({
            ...prev,
            preset: foundPreset.type || 'advanced',
            preset_id: foundPreset.id ?? null,
          }));
        } else {
          // The preset was deleted — fall back to the first available preset
          toast.error(
            `The previously selected preset is no longer available. Defaulting to "${firstPreset?.name || firstPreset?.type || 'first'}" preset.`,
            { id: 'preset-fallback' }
          );
          applyPresetData(firstPreset);
        }
      } else {
        // Draft has no preset_id — apply first preset
        applyPresetData(firstPreset);
      }
    } else {
      // New vault creation — default to first preset from backend
      applyPresetData(firstPreset);
    }

    isPresetManuallyChanged.current = false;
  }, [isPresetsLoading, isPresetsError, presets, vault]);

  // --- Step state sync ---

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

  // --- Privacy side-effect ---

  const updateValueMethod = useCallback(value => {
    setVaultData(prevData => ({ ...prevData, valueMethod: value }));
  }, []);

  useEffect(() => {
    if (vaultData.privacy !== VAULT_PRIVACY_TYPES.PRIVATE) {
      updateValueMethod('lbe');
    }
  }, [vaultData.privacy, updateValueMethod]);

  // --- Helpers ---

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTutorial = () => {
    const tutorialElement = document.getElementById('vault-creation-tutorial');
    if (tutorialElement) {
      const headerHeight = 72;
      const offset = headerHeight + 24;
      const elementPosition = tutorialElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // --- Step navigation ---

  const handleNextStep = async () => {
    if (currentStep < steps.length) {
      const isAdvancedMode = isAdvancedPresetAvailable && vaultData.preset === 'advanced';
      const nextStep = isAdvancedMode ? currentStep + 1 : steps.length;
      await changeStep(nextStep);
    }
  };

  const handlePreviousStep = async () => {
    if (currentStep > 1) {
      await changeStep(currentStep - 1, true);
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
        if (index === deletedIndex) return;
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
    const responseData = error?.response?.data;
    const message = responseData?.message;
    if (!message) return false;

    const errorCode = responseData?.code;
    const errorTitle = responseData?.error;

    if (errorCode === 'UTXO_MINIMUM_NOT_MET' || errorTitle?.toLowerCase().includes('utxo balance insufficient')) {
      toast.error(message);
      return true;
    }

    if (message.toLowerCase().includes('ticker')) {
      const tickerError = { vaultTokenTicker: message };
      setErrors(prev => ({ ...prev, ...tickerError }));
      updateStepErrorIndicators(tickerError);
      toast.error(message);
      return true;
    }
    if (
      error?.response?.status === 400 ||
      error?.response?.status === 422 ||
      error?.status === 400 ||
      error?.status === 422
    ) {
      toast.error(message);
      return true;
    }

    return false;
  };

  const updateField = async (fieldName, value) => {
    setVaultData(prev => ({ ...prev, [fieldName]: value }));

    // When editing a field on a non-config step, auto-switch to the advanced preset if available.
    // Also sync vaultData.preset / preset_id so isPresetConfigLocked and handleNextStep
    // immediately reflect the advanced mode (unlocks inputs, restores step-by-step navigation).
    if (currentStep !== 1 && isAdvancedPresetAvailable) {
      const advancedPreset = presets.find(
        preset => preset?.type?.toLowerCase() === 'advanced' || preset?.name?.toLowerCase() === 'advanced'
      );
      if (advancedPreset && selectedPresetId !== advancedPreset.id.toString()) {
        setSelectedPresetId(advancedPreset.id.toString());
        setVaultData(prev => ({
          ...prev,
          preset: advancedPreset.type || 'advanced',
          preset_id: advancedPreset.id ?? null,
        }));
        isPresetManuallyChanged.current = true;
      }
    }

    const isValid = await validateField(fieldName, value);
    if (isValid) {
      clearFieldError(fieldName);
    }
  };

  // Applies a preset's config values to vaultData based on a preset ID string
  const applySelectedPreset = presetId => {
    const selectedPreset = presets.find(p => p?.id?.toString() === presetId);
    if (!selectedPreset) return;

    const isAdvanced =
      selectedPreset?.type?.toLowerCase() === 'advanced' || selectedPreset?.name?.toLowerCase() === 'advanced';

    if (isAdvanced) {
      setVaultData(prev => ({
        ...prev,
        preset: selectedPreset.type || 'advanced',
        preset_id: selectedPreset.id ?? null,
      }));
      return;
    }

    const config = selectedPreset.config || {};
    setVaultData(prev => ({
      ...prev,
      preset: selectedPreset.type || prev.preset,
      preset_id: selectedPreset.id ?? null,
      tokensForAcquires: config.tokensForAcquires ?? null,
      acquireReserve: config.acquireReserve ?? null,
      liquidityPoolContribution: config.liquidityPoolContribution ?? null,
      creationThreshold: config.creationThreshold ?? null,
      voteThreshold: 0,
      cosigningThreshold: config.cosigningThreshold ?? null,
      executionThreshold: config.executionThreshold ?? null,
    }));
  };

  const handlePresetChange = value => {
    if (!value) return;

    if (vault && !isPresetManuallyChanged.current) {
      openModal('ChangePresetWarningModal', {
        onConfirm: () => {
          setSelectedPresetId(value);
          isPresetManuallyChanged.current = true;
          clearFieldError('preset');
          applySelectedPreset(value);
        },
      });
      return;
    }

    setSelectedPresetId(value);
    if (vault) isPresetManuallyChanged.current = true;
    clearFieldError('preset');
    applySelectedPreset(value);
  };

  // --- Submission ---

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

      const vlrmFeeSettings = vlrmFeeData?.data || {
        vlrm_creator_fee: 100,
        vlrm_creator_fee_enabled: true,
      };

      if (currentBalance < vlrmFeeSettings.vlrm_creator_fee && vlrmFeeSettings.vlrm_creator_fee_enabled) {
        const feeMessage = `You need at least ${vlrmFeeSettings.vlrm_creator_fee} VLRM to launch a vault.`;
        toast.error(feeMessage);
        setIsVisibleSwipe(true);
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
          return;
        }

        if (err?.message === 'user declined sign tx') {
          toast.error('Vault launch cancelled by user');
          return;
        }

        if (!handleServerFieldErrors(err)) {
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
      const existingDraftId = vaultData?.id ?? vault?.id;
      if (existingDraftId) {
        formattedData.id = existingDraftId;
      }

      const { data } = await VaultsApiProvider.saveDraft(formattedData);
      await queryClient.invalidateQueries({ queryKey: ['vault', data.id] });
      await queryClient.invalidateQueries({ queryKey: ['vaults'] });

      localStorage.removeItem('storageVault');

      await navigate({
        to: '/profile',
        search: { tab: 'draft' },
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
          // Fall back to the first preset that is not the one being deleted
          const fallbackPreset = presets.find(p => p?.id?.toString() !== presetId);
          const fallbackId = fallbackPreset?.id?.toString() ?? null;
          setSelectedPresetId(fallbackId);
          if (fallbackPreset) {
            applySelectedPreset(fallbackId);
          }
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
          to: '/profile',
          search: { tab: 'draft' },
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

    const firstPreset = presets[0] ?? null;
    const resetData = { ...initialVaultState };

    if (firstPreset?.config) {
      const config = firstPreset.config;
      resetData.preset = firstPreset.type || 'simple';
      resetData.preset_id = firstPreset.id ?? null;
      resetData.tokensForAcquires = config.tokensForAcquires ?? null;
      resetData.acquireReserve = config.acquireReserve ?? null;
      resetData.liquidityPoolContribution = config.liquidityPoolContribution ?? null;
      resetData.creationThreshold = config.creationThreshold ?? null;
      resetData.voteThreshold = 0;
      resetData.cosigningThreshold = config.cosigningThreshold ?? null;
      resetData.executionThreshold = config.executionThreshold ?? null;
    }

    setVaultData(resetData);
    await changeStep(1, true);
    setSteps(CREATE_VAULT_STEPS);
    setErrors({});
    setVisitedSteps(new Set([1]));
    setSelectedPresetId(firstPreset?.id?.toString() ?? null);
    isPresetManuallyChanged.current = false;

    if (setVault) {
      setVault(resetData);
    }

    toast.success('Vault creation form has been reset');
  };

  // --- Render helpers ---

  const renderStepContent = step => {
    switch (step) {
      case 1:
        return (
          <ConfigureVault
            data={vaultData}
            errors={errors}
            updateField={updateField}
            presetOptions={presetOptions}
            presetValue={selectedPresetId || ''}
            onPresetChange={handlePresetChange}
            onDeletePreset={handleDeletePreset}
            deletingPresetId={deletingPresetId}
            onImageUploadingChange={setIsImageUploading}
            onRemoveWhitelistItem={handleRemoveWhitelistItem}
          />
        );
      case 2:
        return <AssetContribution data={vaultData} errors={errors} updateField={updateField} />;
      case 3:
        return (
          <AcquireWindow
            data={vaultData}
            errors={errors}
            updateField={updateField}
            isPresetConfigLocked={isPresetConfigLocked}
            isAdvancedPresetAvailable={isAdvancedPresetAvailable}
          />
        );
      case 4:
        return (
          <Governance
            data={vaultData}
            errors={errors}
            updateField={updateField}
            isPresetConfigLocked={isPresetConfigLocked}
            isAdvancedPresetAvailable={isAdvancedPresetAvailable}
          />
        );
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

  const renderPresetsLoadingState = () => (
    <div className="my-16 flex flex-col items-center justify-center gap-6 py-20">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-steel-700" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="text-white font-russo uppercase text-sm tracking-widest">Loading presets</p>
        <div className="flex gap-1.5">
          {[0, 150, 300].map(delay => (
            <span
              key={delay}
              className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderPresetsErrorState = () => (
    <div className="my-16 flex flex-col items-center justify-center py-16">
      <div className="p-6 bg-red-900/20 border border-red-600/30 rounded-lg max-w-lg w-full">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-400 font-bold text-lg mb-1">Failed to Load Presets</h3>
            <p className="text-red-300 text-sm mb-4">
              Vault presets could not be fetched from the server. Vault creation requires presets to be loaded
              successfully.
            </p>
            <button
              onClick={() => refetchPresets()}
              className="flex items-center gap-2 text-sm font-semibold text-red-300 hover:text-white transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderButtons = () => {
    if (currentStep === 5) {
      return (
        <div className="flex justify-center gap-4 py-8">
          {isAdvancedPresetAvailable && (
            <SecondaryButton
              className="uppercase font-semibold"
              disabled={
                isSubmitting ||
                isSavingDraft ||
                isFormBlocked ||
                presets.filter(preset => preset.type === 'custom').length >= 3
              }
              onClick={handleOpenSavePresetModal}
            >
              Save preset
            </SecondaryButton>
          )}
          <PrimaryButton
            className="uppercase"
            disabled={isSubmitting || isFormBlocked || !wallet.isConnected || (IS_MAINNET && !canCreateVaults)}
            onClick={onSubmit}
            title={IS_MAINNET && !canCreateVaults ? 'Your wallet is not authorized to create vaults' : ''}
          >
            {isSubmitting ? 'Launching...' : !wallet.isConnected ? 'Connect wallet to launch' : 'Confirm & launch'}
          </PrimaryButton>
        </div>
      );
    }
    return (
      <div className="flex justify-center gap-4 py-8">
        {currentStep > 1 && (
          <SecondaryButton
            size="lg"
            disabled={isSubmitting || isSavingDraft || isFormBlocked}
            onClick={handlePreviousStep}
          >
            <ChevronLeft size={24} />
          </SecondaryButton>
        )}
        {vault && vault.vaultStatus === 'draft' && (
          <SecondaryButton
            size="lg"
            disabled={isSubmitting || isSavingDraft || isFormBlocked}
            onClick={handleDeleteDraft}
          >
            Delete draft
          </SecondaryButton>
        )}
        <SecondaryButton size="lg" disabled={isSubmitting || isSavingDraft || isFormBlocked} onClick={saveDraft}>
          Save for later
        </SecondaryButton>
        <PrimaryButton
          size="lg"
          disabled={
            isSubmitting || isSavingDraft || isImageUploading || isFormBlocked || (IS_MAINNET && !canCreateVaults)
          }
          onClick={handleNextStep}
          title={IS_MAINNET && !canCreateVaults ? 'Your wallet is not authorized to create vaults' : ''}
        >
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

  const stepOptions = steps.map(step => ({
    value: step.id.toString(),
    label: `${step.id}. ${step.title}`,
  }));

  const handleStepSelect = stepId => {
    handleStepClick(parseInt(stepId));
  };

  return (
    <div className="pb-8">
      {IS_MAINNET && !canCreateVaults && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-500 font-bold text-lg mb-1">Vault Creation Not Authorized</h3>
              <p className="text-red-300 text-sm">
                Your wallet address is not currently authorized to create vaults. Vault creation is restricted.
              </p>
            </div>
          </div>
        </div>
      )}
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
      <>
        {isPresetsLoading
          ? renderPresetsLoadingState()
          : isPresetsError
            ? renderPresetsErrorState()
            : renderStepContent(currentStep)}
      </>
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
