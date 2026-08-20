import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { AiVaultChat } from '@/components/vaults/ai/AiVaultChat';
import { AiVaultPreview } from '@/components/vaults/ai/AiVaultPreview';
import { AI_VAULT_STORAGE_META_KEY } from '@/components/vaults/ai/aiVault.utils';
import { useAiVaultBuilder } from '@/components/vaults/ai/useAiVaultBuilder';
import { CREATE_VAULT_STEPS } from '@/components/vaults/constants/vaults.constants';
import { useAuth } from '@/lib/auth/auth';

const CreateAiComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const builder = useAiVaultBuilder();

  const openInForm = (startStep = CREATE_VAULT_STEPS.length) => {
    localStorage.setItem('storageVault', JSON.stringify(builder.vault));
    localStorage.setItem(AI_VAULT_STORAGE_META_KEY, JSON.stringify({ source: 'ai', startStep }));
    navigate({ to: '/create' });
  };

  // Lets the user drop into the manual form at any point to tweak settings or add
  // whitelists/collections — those are never invented by the assistant.
  const editManually = () => openInForm(1);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between py-4">
        <button
          className="flex items-center gap-2 text-dark-100 hover:text-white transition-colors"
          type="button"
          onClick={() => navigate({ to: '/create' })}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="uppercase font-russo text-sm">Manual setup</span>
        </button>
        <span className="font-russo text-3xl uppercase">Create vault with AI</span>
        <span className="w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <AiVaultChat isSending={builder.isSending} messages={builder.messages} onSend={builder.sendMessage} />
        <AiVaultPreview
          aiFields={builder.aiFields}
          isGeneratingImage={builder.isGeneratingImage}
          isUploadingImage={builder.isUploadingImage}
          missingFields={builder.missingFields}
          status={builder.status}
          vault={builder.vault}
          onEditManually={editManually}
          onGenerateImage={builder.generateImage}
          onOpenInForm={() => openInForm()}
          onReset={builder.reset}
          onUploadImage={builder.uploadImage}
        />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/create-ai')({
  component: CreateAiComponent,
});
