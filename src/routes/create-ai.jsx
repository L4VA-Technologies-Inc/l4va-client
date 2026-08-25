import { useState } from 'react';
import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import { AiVaultChat } from '@/components/vaults/ai/AiVaultChat';
import { AiVaultPreview } from '@/components/vaults/ai/AiVaultPreview';
import { AI_VAULT_STORAGE_META_KEY } from '@/components/vaults/ai/aiVault.utils';
import { useAiVaultBuilder } from '@/components/vaults/ai/useAiVaultBuilder';
import { CREATE_VAULT_STEPS } from '@/components/vaults/constants/vaults.constants';
import { ResetVaultConfirmModal } from '@/components/modals/ResetVaultConfirmModal';
import { useLaunchVault } from '@/hooks/useLaunchVault';
import { useAuth } from '@/lib/auth/auth';

const CreateAiComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const builder = useAiVaultBuilder();
  const { launchVault } = useLaunchVault();
  const [isLaunching, setIsLaunching] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const openInForm = (startStep = CREATE_VAULT_STEPS.length) => {
    localStorage.setItem('storageVault', JSON.stringify(builder.vault));
    localStorage.setItem(AI_VAULT_STORAGE_META_KEY, JSON.stringify({ source: 'ai', startStep }));
    navigate({ to: '/create' });
  };

  // Lets the user drop into the manual form at any point to tweak settings or add
  // whitelists/collections — those are never invented by the assistant.
  const editManually = () => openInForm(1);

  const handleLaunch = async () => {
    if (isLaunching) return;

    setIsLaunching(true);
    try {
      await launchVault(builder.vault);
      toast.success('Vault launched successfully');
      builder.reset();
    } catch (error) {
      if (error?.name === 'ValidationError') {
        toast.error('Please complete all required vault fields before launching.');
      } else if (error?.code === 'INSUFFICIENT_VLRM') {
        toast.error(error.message);
      } else if (
        error?.name === 'UserRejectedRequestError' ||
        error?.message === 'user declined sign tx' ||
        error?.message?.includes('User rejected the request')
      ) {
        toast.error('Vault launch cancelled by user');
      } else {
        console.error(error);
        toast.error('Failed to launch vault. Please try again.');
      }
    } finally {
      setIsLaunching(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="pb-8">
      <div className="flex flex-col items-start gap-2 py-4 md:flex-row md:items-center md:justify-between">
        <button
          className="order-last flex items-center gap-2 text-dark-100 hover:text-white transition-colors md:order-none"
          type="button"
          onClick={() => navigate({ to: '/create' })}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="uppercase font-russo text-sm">Manual setup</span>
        </button>
        <span className="order-first font-russo text-2xl uppercase md:order-none md:text-3xl">
          Create vault with AI
        </span>
        <span className="hidden w-32 md:block" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <AiVaultChat isSending={builder.isSending} messages={builder.messages} onSend={builder.sendMessage} />
        <AiVaultPreview
          aiFields={builder.aiFields}
          isGeneratingImage={builder.isGeneratingImage}
          isUploadingImage={builder.isUploadingImage}
          missingFields={builder.missingFields}
          isLaunching={isLaunching}
          status={builder.status}
          vault={builder.vault}
          onEditManually={editManually}
          onGenerateImage={builder.generateImage}
          onLaunch={handleLaunch}
          onReset={() => setIsResetModalOpen(true)}
          onUpdateVault={builder.updateVaultField}
          onUploadImage={builder.uploadImage}
        />
      </div>
      <ResetVaultConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={builder.reset}
      />
    </div>
  );
};

export const Route = createFileRoute('/create-ai')({
  component: CreateAiComponent,
});
