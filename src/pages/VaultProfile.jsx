import { VaultContribution } from '@/components/vault-profile/VaultContribution';
import { VaultCountdown } from '@/components/vault-profile/VaultCountdown';
import { VaultSwap } from '@/components/vault-profile/VaultSwap';
import { VaultContent } from '@/components/vault-profile/VaultContent';
import { PrimaryButton } from '@/components/shared/PrimaryButton';

export const VaultProfile = ({ vault }) => (
  <div className="min-h-screen bg-dark-700">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4 space-y-4">
          <div className="bg-dark-600 rounded-xl p-4">
            <img
              src={vault.vaultImage || '/assets/vaults/space-man.webp'}
              alt={vault.name}
              className="w-full aspect-square rounded-xl object-cover mb-6"
            />
            <VaultCountdown
              endTime={vault.endTime}
              contributionDuration={vault.contributionDuration}
              contributionOpenWindowType={vault.contributionOpenWindowType}
              contributionOpenWindowTime={vault.contributionOpenWindowTime}
            />
            <VaultContribution
              totalRaised={vault.totalRaised}
              target={vault.target}
              assetValue={vault.assetValue}
              valuationType={vault.valuationType}
              ftInvestmentReserve={vault.ftInvestmentReserve}
              liquidityPoolContribution={vault.liquidityPoolContribution}
            />
          </div>

          <VaultSwap
            ftTokenTicker={vault.ftTokenTicker}
            valuationCurrency={vault.valuationCurrency}
            ftTokenSupply={vault.ftTokenSupply}
            ftTokenDecimals={vault.ftTokenDecimals}
          />
        </div>

        <div className="col-span-8 space-y-4">
          <div className="bg-dark-600 rounded-xl p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{vault.name}</h1>
                <p className="text-dark-100 text-sm">VAULT ID: {vault.id}</p>
              </div>
              <div className="flex gap-2">
                {vault.type === 'NFT' && (
                  <span className="bg-dark-700 px-3 py-1 rounded-full text-sm">NFT</span>
                )}
                <span className="bg-dark-700 px-3 py-1 rounded-full text-sm capitalize">
                  {vault.privacy}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-sm font-medium mb-2">Description</h2>
              <p className="text-dark-100">{vault.description}</p>
            </div>

            {vault.socialLinks?.length > 0 && (
              <div className="flex gap-3 mb-6">
                {vault.socialLinks.map((link, index) => (
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

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-dark-100 text-sm mb-1">Access</p>
                <p className="font-medium">{vault.access || 'Public'}</p>
              </div>
              <div>
                <p className="text-dark-100 text-sm mb-1">Reserve</p>
                <p className="font-medium">${vault.reserve?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-dark-100 text-sm mb-1">Invested</p>
                <p className="font-medium">${vault.invested?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p className="text-dark-100 text-sm mb-1">Inv/Asset Val</p>
                <p className="font-medium">N/A</p>
              </div>
            </div>

            <PrimaryButton className="w-full">
              CONTRIBUTE
            </PrimaryButton>
          </div>
          <VaultContent vault={vault} />
        </div>
      </div>
    </div>
  </div>
);
