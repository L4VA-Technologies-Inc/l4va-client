import { createFileRoute, Link, Navigate } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';

import { CreateVaultForm } from '@/components/vaults/CreateVaultForm';
import { AI_VAULT_STORAGE_META_KEY } from '@/components/vaults/ai/aiVault.utils';
import { useAuth } from '@/lib/auth/auth';
import { useNetwork } from '@/hooks/useNetwork';

const readJson = key => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const CreateComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isRobinHood } = useNetwork();

  const storageVault = readJson('storageVault');
  const aiMeta = readJson(AI_VAULT_STORAGE_META_KEY);
  const isAiPrefilled = aiMeta?.source === 'ai';

  const handleSaveVault = data => {
    localStorage.setItem('storageVault', JSON.stringify(data));
  };

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <span className="w-40" />
        <span className="font-russo text-4xl uppercase">Create Vault</span>
        <Link
          className="flex items-center gap-2 w-40 justify-end text-dark-100 hover:text-white transition-colors"
          to="/create-ai"
        >
          <Sparkles className="w-4 h-4" />
          <span className="uppercase font-russo text-sm">{isAiPrefilled ? 'Back to chat' : 'Create with AI'}</span>
        </Link>
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-16 z-[-1] w-full max-w-[1920px] min-h-[300px] bg-cover bg-bottom bg-no-repeat"
        style={{
          backgroundImage: isRobinHood ? 'none' : 'url(/assets/vaults/create-vault-bg.webp)',
        }}
      />
      <CreateVaultForm
        aiPrefilled={isAiPrefilled}
        initialStep={isAiPrefilled ? aiMeta.startStep : 1}
        setVault={handleSaveVault}
        vault={storageVault}
      />
    </>
  );
};

export const Route = createFileRoute('/create')({
  component: CreateComponent,
});
