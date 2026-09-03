import { useEffect, useRef, useState } from 'react';
import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import { AiVaultChat } from '@/components/vaults/ai/AiVaultChat';
import { AiVaultPreview } from '@/components/vaults/ai/AiVaultPreview';
import { AI_VAULT_STORAGE_META_KEY } from '@/components/vaults/ai/aiVault.utils';
import { useAiVaultBuilder } from '@/components/vaults/ai/useAiVaultBuilder';
import { CREATE_VAULT_STEPS } from '@/components/vaults/constants/vaults.constants';
import { LaunchVaultConfirmModal } from '@/components/modals/LaunchVaultConfirmModal';
import { ResetVaultConfirmModal } from '@/components/modals/ResetVaultConfirmModal';
import { useLaunchVault } from '@/hooks/useLaunchVault';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';

const CreateAiComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const builder = useAiVaultBuilder();
  const { launchVault } = useLaunchVault();
  const { openModal } = useModalControls();
  const [isLaunching, setIsLaunching] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(() => (builder.aiFields?.length ?? 0) > 0);
  const userCollapsedPreview = useRef(false);

  // Slide the draft open as soon as the conversation starts populating it, so fields appear live.
  useEffect(() => {
    if (userCollapsedPreview.current) return;
    if (builder.isSending || builder.aiFields.length > 0) {
      setShowPreview(true);
    }
  }, [builder.isSending, builder.aiFields.length]);

  const togglePreview = () => {
    setShowPreview(prev => {
      const next = !prev;
      userCollapsedPreview.current = !next;
      return next;
    });
  };

  const openInForm = (startStep = CREATE_VAULT_STEPS.length) => {
    localStorage.setItem('storageVault', JSON.stringify(builder.vault));
    localStorage.setItem(AI_VAULT_STORAGE_META_KEY, JSON.stringify({ source: 'ai', startStep }));
    navigate({ to: '/create' });
  };

  // The chat owns the image flow; the asset picker is the one reserved action that needs a modal.
  const handleOptionSelect = option => {
    if (option.value === 'choose_assets') {
      openModal('AiAssetWhitelistModal', {
        whitelist: builder.vault.assetsWhitelist || [],
        setWhitelist: assets => builder.updateVaultField('assetsWhitelist', assets),
        isExpandable: builder.vault.isExpandableAssetWhitelist,
        onExpandableChange: checked => builder.updateVaultField('isExpandableAssetWhitelist', checked),
      });
      return;
    }
    builder.sendMessage(option.value);
  };

  // The assistant requests a launch through a backend-validated action; the user still confirms it.
  const launchRequest = builder.pendingAction?.name === 'launch_vault' ? builder.pendingAction : null;

  const handleLaunch = async () => {
    if (isLaunching) return;

    setIsLaunching(true);
    try {
      await launchVault(builder.vault);
      toast.success('Vault launched successfully');
      builder.clearAction();
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
    <MotionConfig reducedMotion="user">
      <div className="pb-8">
        <div className="flex flex-col items-start gap-2 py-4 md:flex-row md:items-center md:justify-between">
          <button
            className="group order-last flex items-center gap-2 text-dark-100 transition-colors duration-150 hover:text-white active:opacity-70 md:order-none"
            type="button"
            onClick={() => openInForm(1)}
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-150 ease-out group-hover:-translate-x-0.5" />
            <span className="uppercase font-russo text-sm">Manual setup</span>
          </button>
          <span className="order-first font-russo text-2xl uppercase tracking-tight md:order-none md:text-3xl">
            Create vault with AI
          </span>
          <span className="hidden w-32 md:block" />
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <AiVaultChat
              isGeneratingImage={builder.isGeneratingImage}
              isPreviewOpen={showPreview}
              isSending={builder.isSending}
              isUploadingImage={builder.isUploadingImage}
              messages={builder.messages}
              onGenerateImage={builder.generateImage}
              onOptionSelect={handleOptionSelect}
              onSend={builder.sendMessage}
              onStartImageGeneration={builder.startImageGeneration}
              onTogglePreview={togglePreview}
              onUploadImage={builder.uploadImage}
            />
          </div>
          <AnimatePresence initial={false}>
            {showPreview && (
              <motion.div
                key="preview"
                animate={{ opacity: 1, x: 0 }}
                className="w-full shrink-0 lg:w-[380px]"
                exit={{ opacity: 0, x: 16 }}
                initial={{ opacity: 0, x: 16 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              >
                <AiVaultPreview
                  aiFields={builder.aiFields}
                  isLaunching={isLaunching}
                  missingFields={builder.missingFields}
                  status={builder.status}
                  vault={builder.vault}
                  onGenerateImageRequest={builder.startImageGeneration}
                  onLaunch={handleLaunch}
                  onReset={() => setIsResetModalOpen(true)}
                  onSendMessage={builder.sendMessage}
                  onUpdateVault={builder.updateVaultField}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {launchRequest && (
          <LaunchVaultConfirmModal
            description={launchRequest.description}
            isLaunching={isLaunching}
            isOpen
            vaultName={builder.vault?.name}
            onClose={builder.clearAction}
            onConfirm={handleLaunch}
          />
        )}
        <ResetVaultConfirmModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={() => {
            userCollapsedPreview.current = false;
            setShowPreview(false);
            builder.reset();
          }}
        />
      </div>
    </MotionConfig>
  );
};

export const Route = createFileRoute('/create-ai')({
  component: CreateAiComponent,
});
