import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { VAULT_PRIVACY_TYPES } from '@/components/vaults/constants/vaults.constants';

export const VaultHeader = ({
  name,
  vaultId,
  description,
  type,
  privacy = VAULT_PRIVACY_TYPES.PUBLIC,
  socialLinks = [],
}) => {
  return (
    <div className="bg-dark-600 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">{name}</h1>
          <p className="text-dark-100 text-sm">VAULT ID: {vaultId}</p>
        </div>
        <div className="flex gap-2">
          {type === 'NFT' && (
            <span className="bg-dark-700 px-3 py-1 rounded-full text-sm">NFT</span>
          )}
          <span className="bg-dark-700 px-3 py-1 rounded-full text-sm capitalize">
            {privacy}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-medium mb-2">Description</h2>
        <p className="text-dark-100">{description}</p>
      </div>

      {socialLinks.length > 0 && (
        <div className="flex gap-3 mb-6">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-100 hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
      )}

      <PrimaryButton className="w-full">
        CONTRIBUTE
      </PrimaryButton>
    </div>
  );
}; 