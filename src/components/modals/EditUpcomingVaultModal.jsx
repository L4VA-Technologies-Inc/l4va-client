import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

import { ModalWrapper } from '@/components/shared/ModalWrapper';
import { LavaSteelTextarea } from '@/components/shared/LavaTextarea';
import { LavaSteelInput } from '@/components/shared/LavaInput';
import { UploadZone } from '@/components/shared/LavaUploadZone';
import { LavaSocialLinks } from '@/components/shared/LavaSocialLinks';
import { LavaMultiSelect } from '@/components/shared/LavaSelect';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SecondaryButton from '@/components/shared/SecondaryButton';
import { VaultsApiProvider } from '@/services/api/vaults';
import {
  VAULT_TAGS_OPTIONS,
  RESERVE_HINT,
  LIQUIDITY_POOL_CONTRIBUTION_HINT,
  editUpcomingVaultSchema,
} from '@/components/vaults/constants/vaults.constants';
import { transformYupErrors } from '@/utils/core.utils';

const formatWithDecimal = value => {
  if (value === '' || value === null || value === undefined) return '';
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  return num.toFixed(1);
};

export const EditUpcomingVaultModal = ({ isOpen = true, onClose, vault }) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    vaultTokenTicker: vault?.vaultTokenTicker ?? '',
    vaultImage: vault?.vaultImage ?? null,
    ftTokenImg: vault?.ftTokenImg ?? null,
    description: vault?.description ?? '',
    tokenDescription: vault?.tokenDescription ?? '',
    tokensForAcquires: vault?.tokensForAcquires ?? null,
    acquireReserve: vault?.acquireReserve ?? null,
    liquidityPoolContribution: vault?.liquidityPoolContribution ?? null,
    creationThreshold: vault?.creationThreshold != null ? String(vault.creationThreshold) : '',
    cosigningThreshold: vault?.cosigningThreshold != null ? String(vault.cosigningThreshold) : '',
    executionThreshold: vault?.executionThreshold != null ? String(vault.executionThreshold) : '',
    socialLinks: vault?.socialLinks ? vault.socialLinks.map((l, i) => ({ ...l, id: l.id ?? Date.now() + i })) : [],
    tags: vault?.tags ?? [],
  });

  const clearFieldError = fieldName => {
    setErrors(prev => {
      const hasError = prev[fieldName] !== undefined || Object.keys(prev).some(k => k.startsWith(`${fieldName}[`));
      if (!hasError) return prev;
      const next = { ...prev };
      delete next[fieldName];
      Object.keys(next).forEach(k => {
        if (k.startsWith(`${fieldName}[`)) delete next[k];
      });
      return next;
    });
  };

  const handleAcquireChange = (name, value) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    const sanitizedValue = parts.length > 2 ? `${parts[0]}.${parts[1]}` : numericValue;
    if (parts.length === 2 && parts[1].length > 2) return;
    if (sanitizedValue !== '') {
      setFormData(prev => ({ ...prev, [name]: Math.min(Number(sanitizedValue), 100) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: null }));
    }
    clearFieldError(name);
  };

  const handleGovNumChange = (name, value) => {
    let numericValue = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    if (numericValue.startsWith('100') && numericValue.length > 3) return;
    if (Number(numericValue) > 100) return;
    if (parts[1] && parts[1].length > 1) return;
    if (numericValue === '') {
      setFormData(prev => ({ ...prev, [name]: '' }));
      return;
    }
    if (parseFloat(numericValue) > 100) {
      setFormData(prev => ({ ...prev, [name]: '100.0' }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: numericValue }));
    clearFieldError(name);
  };

  const handleGovNumBlur = e => {
    const { name, value } = e.target;
    if (value !== '') {
      setFormData(prev => ({ ...prev, [name]: formatWithDecimal(value) }));
    }
  };

  const handleMinOnePercentChange = (name, value) => {
    let numericValue = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    if (numericValue.startsWith('100') && numericValue.length > 3) return;
    if (Number(numericValue) > 100) return;
    if (parts[1] && parts[1].length > 1) return;
    if (numericValue === '') {
      setFormData(prev => ({ ...prev, [name]: '' }));
      return;
    }
    const numValue = parseFloat(numericValue);
    if (numValue > 0 && numValue < 1) return;
    if (numValue > 100) {
      setFormData(prev => ({ ...prev, [name]: '100.0' }));
      return;
    }
    if (numValue >= 1 && numValue <= 100) {
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    }
    clearFieldError(name);
  };

  const handleMinOnePercentBlur = e => {
    const { name, value } = e.target;
    if (value !== '') {
      const formatted = formatWithDecimal(value);
      if (parseFloat(formatted) >= 1) {
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
    }
  };

  const buildPayload = () => ({
    vaultTokenTicker: formData.vaultTokenTicker ? String(formData.vaultTokenTicker) : null,
    vaultImage: formData.vaultImage || null,
    ftTokenImg: formData.ftTokenImg || null,
    description: formData.description || null,
    tokenDescription: formData.tokenDescription || null,
    tokensForAcquires: formData.tokensForAcquires,
    acquireReserve: formData.acquireReserve,
    liquidityPoolContribution: formData.liquidityPoolContribution,
    creationThreshold: formData.creationThreshold !== '' ? parseFloat(formData.creationThreshold) : null,
    cosigningThreshold: formData.cosigningThreshold !== '' ? parseFloat(formData.cosigningThreshold) : null,
    executionThreshold: formData.executionThreshold !== '' ? parseFloat(formData.executionThreshold) : null,
    socialLinks: formData.socialLinks.map(({ name, url }) => ({ name, url })),
    tags: formData.tags,
  });

  const handleSave = async () => {
    const payload = buildPayload();

    try {
      await editUpcomingVaultSchema.validate(payload, { abortEarly: false });
    } catch (err) {
      const formattedErrors = transformYupErrors(err);
      setErrors(formattedErrors);
      toast.error('Please fix the validation errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      await VaultsApiProvider.editUpcomingVaultSettings(vault.id, payload);
      await queryClient.invalidateQueries({ queryKey: ['vault', vault.id] });
      toast.success('Vault settings updated');
      onClose();
    } catch (err) {
      const responseData = err?.response?.data;
      const message = responseData?.message;
      if (message && message.toLowerCase().includes('ticker')) {
        setErrors(prev => ({ ...prev, vaultTokenTicker: message }));
        toast.error(message);
      } else {
        toast.error(message || 'Failed to update vault settings');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const tokensForAcquiresNum = Number(formData.tokensForAcquires);
  const acquireReserveNum = Number(formData.acquireReserve);
  const liquidityPoolContributionNum = Number(formData.liquidityPoolContribution);

  const footer = (
    <div className="flex flex-col md:flex-row gap-3 justify-end">
      <SecondaryButton className="w-full md:w-auto justify-center" disabled={isSaving} onClick={onClose}>
        Cancel
      </SecondaryButton>
      <PrimaryButton
        className="w-full md:w-auto justify-center"
        disabled={isSaving || isImageUploading}
        onClick={handleSave}
      >
        {isImageUploading ? 'Uploading images…' : isSaving ? 'Saving…' : 'Save changes'}
      </PrimaryButton>
    </div>
  );

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Edit vault settings"
      size="2xl"
      maxHeight="90vh"
      footer={footer}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <LavaSteelInput
            error={Boolean(errors.vaultTokenTicker)}
            helperText={errors.vaultTokenTicker}
            label="Vault Token Ticker"
            maxLength={9}
            name="vaultTokenTicker"
            placeholder="Add ticker"
            value={formData.vaultTokenTicker}
            onChange={value => {
              const normalized = String(value || '').replace(/[^A-Za-z0-9]/g, '');
              setFormData(prev => ({ ...prev, vaultTokenTicker: normalized }));
              clearFieldError('vaultTokenTicker');
            }}
            hint="This is the ticker that the Governance Token will have when minted."
          />
        </div>

        <div>
          <LavaSteelTextarea
            label="Vault description"
            name="description"
            placeholder="Add a description for your Vault"
            value={formData.description}
            error={Boolean(errors.description)}
            helperText={errors.description}
            hint="This is the Vault description."
            onChange={value => {
              setFormData(prev => ({ ...prev, description: value }));
              clearFieldError('description');
            }}
          />
        </div>

        <div>
          <LavaSteelTextarea
            label="Vault token description"
            name="tokenDescription"
            placeholder="Add a description for your Vault token"
            value={formData.tokenDescription}
            error={Boolean(errors.tokenDescription)}
            helperText={errors.tokenDescription}
            hint="This is the Vault Token description used when registering Vault metadata."
            onChange={value => {
              setFormData(prev => ({ ...prev, tokenDescription: value }));
              clearFieldError('tokenDescription');
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadZone
            image={formData.vaultImage}
            label="Vault image"
            setImage={image => {
              setFormData(prev => ({ ...prev, vaultImage: image }));
              clearFieldError('vaultImage');
            }}
            hint="This is the image that will live on the Vault Profile page. For best results, upload a photo of 640x640 pixels."
            imageType="background"
            onUploadingChange={setIsImageUploading}
            error={errors.vaultImage}
          />
          <UploadZone
            image={formData.ftTokenImg}
            label="Vault Token Image"
            setImage={image => {
              setFormData(prev => ({ ...prev, ftTokenImg: image }));
              clearFieldError('ftTokenImg');
            }}
            hint="This is the image that will live on Vault Token. For best results, upload a photo of 256x256 pixels."
            imageType="ticker"
            onUploadingChange={setIsImageUploading}
            error={errors.ftTokenImg}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <LavaSteelInput
              required
              error={Boolean(errors.tokensForAcquires)}
              label="TOKENS FOR ACQUIRERS (%)"
              name="tokensForAcquires"
              placeholder="XX"
              type="text"
              value={
                formData.tokensForAcquires === 0
                  ? '0'
                  : formData.tokensForAcquires
                    ? String(formData.tokensForAcquires)
                    : ''
              }
              onChange={value => handleAcquireChange('tokensForAcquires', value)}
              hint="The percentage (%) of net vault tokens minted which will be received by Acquirers when vault locks."
              helperText={errors.tokensForAcquires}
            />
            {formData.tokensForAcquires === 0 && (
              <p className="text-orange-500 mt-1 text-sm">
                Warning: 0% Tokens for Acquirers means this vault will NOT be offered to acquirers to send ADA and
                Reserve % will not apply.
              </p>
            )}
          </div>

          <div>
            <LavaSteelInput
              required
              error={Boolean(errors.acquireReserve)}
              label="RESERVE (%)"
              name="acquireReserve"
              placeholder="XX"
              type="text"
              value={
                formData.acquireReserve === 0 ? '0' : formData.acquireReserve ? String(formData.acquireReserve) : ''
              }
              onChange={value => handleAcquireChange('acquireReserve', value)}
              hint={RESERVE_HINT}
              disabled={formData.tokensForAcquires === 0}
              helperText={errors.acquireReserve}
            />
            {acquireReserveNum < 100 && tokensForAcquiresNum > 0 && (
              <p className="text-orange-500 mt-1 text-sm">
                Warning: Reserve % of &lt; 100% means that assets contributed will be valued at less than 100% of market
                price (floor price for NFTs / spot price for CNTs at end of Contribution window).
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <LavaSteelInput
              required
              error={Boolean(errors.liquidityPoolContribution)}
              label="LIQUIDITY POOL (LP) CONTRIBUTION (%)"
              name="liquidityPoolContribution"
              placeholder="XX"
              type="text"
              value={
                formData.liquidityPoolContribution === 0
                  ? '0'
                  : formData.liquidityPoolContribution
                    ? String(formData.liquidityPoolContribution)
                    : ''
              }
              onChange={value => handleAcquireChange('liquidityPoolContribution', value)}
              hint={LIQUIDITY_POOL_CONTRIBUTION_HINT}
              helperText={errors.liquidityPoolContribution}
            />
            {liquidityPoolContributionNum === 0 && (
              <p className="text-orange-500 mt-1 text-sm">
                Warning: 0% LP Contribution means there will NOT be a liquidity pool launched for this Vault.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <LavaSteelInput
              required
              error={Boolean(errors.creationThreshold)}
              label="CREATION THRESHOLD (%)"
              name="creationThreshold"
              placeholder="XX.X"
              type="text"
              value={formData.creationThreshold}
              onChange={value => handleGovNumChange('creationThreshold', value)}
              onBlur={handleGovNumBlur}
              hint="Minimum Vault tokens held by user (as % of total supply) required to create a proposal. Minimum 0.5%."
              helperText={errors.creationThreshold}
            />
          </div>

          <div>
            <LavaSteelInput
              required
              error={Boolean(errors.cosigningThreshold)}
              label="VOTE QUORUM THRESHOLD (%)"
              name="cosigningThreshold"
              placeholder="XX.X"
              type="text"
              value={formData.cosigningThreshold}
              onChange={value => handleMinOnePercentChange('cosigningThreshold', value)}
              onBlur={handleMinOnePercentBlur}
              hint="Minimum Vault tokens used to vote in proposals (as % of total supply) required for vote to be valid. If less, the proposal automatically fails. Minimum 33%."
              helperText={errors.cosigningThreshold}
            />
          </div>

          <div className="md:col-span-2">
            <LavaSteelInput
              required
              error={Boolean(errors.executionThreshold)}
              label="APPROVAL THRESHOLD (%)"
              name="executionThreshold"
              placeholder="XX.X"
              type="text"
              value={formData.executionThreshold}
              onChange={value => handleMinOnePercentChange('executionThreshold', value)}
              onBlur={handleMinOnePercentBlur}
              hint="Minimum Vault tokens votes for a given proposal option (as % of total votes) for a proposal to be approved. Minimum 50.1%."
              helperText={errors.executionThreshold}
            />
          </div>
        </div>

        <div>
          <LavaSocialLinks
            errors={errors}
            socialLinks={formData.socialLinks}
            setSocialLinks={links => {
              setFormData(prev => ({ ...prev, socialLinks: links }));
              clearFieldError('socialLinks');
            }}
          />
        </div>

        <div>
          <label className="font-semibold mb-2 block">Vault tags</label>
          <LavaMultiSelect
            options={VAULT_TAGS_OPTIONS}
            value={formData.tags}
            onChange={tags => {
              setFormData(prev => ({ ...prev, tags }));
              clearFieldError('tags');
            }}
            placeholder="Select tags for your vault"
            showSearch
            direction="up"
          />
          {errors.tags && <p className="text-red-600 mt-1 text-sm">{errors.tags}</p>}
        </div>
      </div>
    </ModalWrapper>
  );
};
