import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { LavaSteelInput } from '@/components/shared/LavaInput.jsx';
import SecondaryButton from '@/components/shared/SecondaryButton';
import PrimaryButton from '@/components/shared/PrimaryButton';
import { useCreatePreset } from '@/services/api/queries';
import { useModalControls } from '@/lib/modals/modal.context';

export const SavePresetModal = ({ isOpen = true, onClose, vaultData, onSuccess }) => {
  const [presetName, setPresetName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { closeModal } = useModalControls();
  const queryClient = useQueryClient();
  const { mutateAsync: createPreset } = useCreatePreset();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  const handleSave = async () => {
    const name = presetName.trim();
    if (!name) {
      toast.error('Please enter a preset name');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        type: vaultData?.preset || 'simple',
        config: {
          tokensForAcquires: vaultData?.tokensForAcquires ?? null,
          acquireReserve: vaultData?.acquireReserve ?? null,
          liquidityPoolContribution: vaultData?.liquidityPoolContribution ?? null,
          creationThreshold: vaultData?.creationThreshold ?? null,
          voteThreshold: vaultData?.voteThreshold ?? null,
          executionThreshold: vaultData?.executionThreshold ?? null,
        },
      };

      await createPreset(payload);
      await queryClient.invalidateQueries({ queryKey: ['presets'] });
      toast.success('Preset saved');
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save preset');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} title="Save preset" size="md">
      <div className="flex flex-col gap-4">
        <LavaSteelInput
          required
          label="Preset name"
          placeholder="My custom preset"
          maxLength={120}
          value={presetName}
          onChange={setPresetName}
        />
        <p className="text-sm text-dark-100">
          Save the current configuration as a reusable preset. You can find it later in the preset selector.
        </p>
        <div className="flex flex-col md:flex-row gap-3 justify-end">
          <SecondaryButton className="w-full md:w-auto justify-center" disabled={isSaving} onClick={handleClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            className="w-full md:w-auto justify-center"
            disabled={!presetName.trim() || isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving…' : 'Save preset'}
          </PrimaryButton>
        </div>
      </div>
    </ModalWrapper>
  );
};
