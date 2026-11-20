import { createFileRoute, Link, Navigate } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { useCallback } from 'react';

import { CreateVaultForm } from '@/components/vaults/CreateVaultForm';
import { AI_VAULT_STORAGE_META_KEY } from '@/components/vaults/ai/aiVault.utils';
import { useAuth } from '@/lib/auth/auth';

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

  const storageVault = readJson('storageVault');
  const aiMeta = readJson(AI_VAULT_STORAGE_META_KEY);
  const isAiPrefilled = aiMeta?.source === 'ai';

  const handleSaveVault = useCallback(data => {
    if (!data) {
      localStorage.removeItem('storageVault');
      return;
    }
    localStorage.setItem('storageVault', JSON.stringify(data));
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 py-4">
        <span className="font-russo text-2xl uppercase tracking-tight whitespace-nowrap md:text-3xl">Create Vault</span>
        <Link
          className="flex items-center gap-2 shrink-0 justify-end text-dark-100 hover:text-white transition-colors"
          to="/create-ai"
        >
          <Sparkles className="w-4 h-4" />
          <span className="uppercase font-russo text-sm whitespace-nowrap">
            {isAiPrefilled ? 'Back to chat' : 'Create with AI'}
          </span>
        </Link>
      </div>
      <CreateVaultForm
        aiPrefilled={isAiPrefilled}
        initialStep={isAiPrefilled ? aiMeta.startStep : 1}
        setVault={handleSaveVault}
        showAiLink={false}
        vault={storageVault}
      />
    </>
  );
};

export const Route = createFileRoute('/create')({
  component: CreateComponent,
});
