import { Info, BookOpen } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const VaultCreationTutorial = () => {
  const sampleVault = {
    name: 'Premium NFT Collection Vault',
    type: 'Multi NFT',
    privacy: 'Public',
    ticker: 'PNFT',
    description: 'A curated collection of premium NFTs from top artists',
    contributionDuration: '7 days',
    tokensForAcquires: '60%',
    acquireReserve: '80%',
    liquidityPoolContribution: '20%',
    tokenSupply: '10,000,000',
    creationThreshold: '1%',
    voteThreshold: '10%',
    executionThreshold: '51%',
  };

  return (
    <div id="vault-creation-tutorial" className="mb-12 bg-steel-850 rounded-lg border border-steel-750 p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold font-russo uppercase">Vault Creation Guide</h2>
      </div>
      <p className="text-dark-100 mb-6 text-sm leading-relaxed">
        Learn how to create a successful vault by understanding each step, reviewing a sample vault configuration, and
        discovering best practices for token distribution ratios.
      </p>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="overview" className="border-b border-steel-750">
          <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-4">
            Overview: What is a Vault?
          </AccordionTrigger>
          <AccordionContent className="text-dark-100 pb-4 space-y-3">
            <p>
              A vault is a decentralized structure that allows multiple contributors to pool assets (NFTs, tokens, or
              other digital assets) together. Contributors receive vault tokens proportional to their contribution, and
              these tokens represent governance rights over the vault's assets.
            </p>
            <p>
              The vault creation process involves 5 key steps: <strong>Configure</strong>, <strong>Contribute</strong>,{' '}
              <strong>Acquire</strong>, <strong>Govern</strong>, and <strong>Confirm</strong>. Each step is crucial for
              setting up a successful vault.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step1" className="border-b border-steel-750">
          <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-4">
            Step 1: Configure Vault
          </AccordionTrigger>
          <AccordionContent className="text-dark-100 pb-4 space-y-3">
            <p>
              <strong>Purpose:</strong> Set up the basic identity and configuration of your vault.
            </p>
            <div className="space-y-2">
              <p>
                <strong>• Vault Name:</strong> Choose a clear, descriptive name that represents your vault's purpose.
              </p>
              <p>
                <strong>• Vault Type:</strong> Select the type of assets your vault will accept:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <strong>Single NFT:</strong> Only one specific NFT can be contributed
                </li>
                <li>
                  <strong>Multi NFT:</strong> Multiple NFTs from the same collection
                </li>
                <li>
                  <strong>Any CNT:</strong> Any Cardano Native Token
                </li>
              </ul>
              <p>
                <strong>• Privacy Setting:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <strong>Public:</strong> Anyone can contribute and acquire tokens (most common)
                </li>
                <li>
                  <strong>Private:</strong> Only whitelisted wallets can contribute and acquire
                </li>
                <li>
                  <strong>Semi-Private:</strong> Mix of public and whitelisted access
                </li>
              </ul>
              <p>
                <strong>• Vault Token Ticker:</strong> The symbol for your governance token (1-9 uppercase characters)
              </p>
              <p>
                <strong>• Description & Image:</strong> Provide clear information and a professional image to attract
                contributors
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step2" className="border-b border-steel-750">
          <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-4">
            Step 2: Asset Contribution
          </AccordionTrigger>
          <AccordionContent className="text-dark-100 pb-4 space-y-3">
            <p>
              <strong>Purpose:</strong> Define how assets can be contributed to your vault and when the contribution
              window opens.
            </p>
            <div className="space-y-2">
              <p>
                <strong>• Asset Whitelist:</strong> Specify which assets (by Policy ID) can be contributed. For public
                vaults, this ensures only approved assets enter the vault.
              </p>
              <p>
                <strong>• Value Method:</strong> How your vault's value is calculated:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <strong>Market/Floor Price:</strong> Uses current market prices (recommended for most vaults)
                </li>
                <li>
                  <strong>Fixed:</strong> Set a fixed value per asset
                </li>
              </ul>
              <p>
                <strong>• Contribution Duration:</strong> How long the contribution window stays open. Minimum is 10
                minutes, but consider longer periods (days/weeks) for better participation.
              </p>
              <p>
                <strong>• Contribution Window:</strong> When contributions can start - either immediately upon launch or
                at a custom date/time.
              </p>
              <p>
                <strong>• Contributor Whitelist:</strong> (Private/Semi-Private only) Specify which wallets can
                contribute assets.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step3" className="border-b border-steel-750">
          <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-4">
            Step 3: Acquire Window
          </AccordionTrigger>
          <AccordionContent className="text-dark-100 pb-4 space-y-3">
            <p>
              <strong>Purpose:</strong> Configure how vault tokens are distributed and what percentage goes to
              acquirers, reserves, and liquidity pools.
            </p>
            <div className="space-y-2">
              <p>
                <strong>• Acquire Window Duration:</strong> How long people have to acquire vault tokens after the
                contribution window closes.
              </p>
              <p>
                <strong>• Tokens for Acquirers (%):</strong> The percentage of net vault tokens that will be distributed
                to acquirers. This is the most critical setting for token distribution.
              </p>
              <p>
                <strong>• Reserve (%):</strong> The minimum percentage of vault value (in ADA) that must be raised from
                acquirers for the vault to lock successfully. If not met, all funds are refunded.
              </p>
              <p>
                <strong>• Liquidity Pool Contribution (%):</strong> Percentage of tokens and ADA allocated to the
                initial liquidity pool for trading.
              </p>
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-yellow-400 mb-2">Recommended Token Distribution Ratios:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        <strong>Tokens for Acquirers: 50-70%</strong> - Balances contributor rewards with acquirer
                        incentives
                      </li>
                      <li>
                        <strong>Reserve: 70-85%</strong> - Ensures sufficient funding while remaining achievable
                      </li>
                      <li>
                        <strong>Liquidity Pool: 15-25%</strong> - Provides adequate liquidity for trading without
                        diluting too much
                      </li>
                    </ul>
                    <p className="text-xs mt-3 text-dark-200">
                      <strong>Note:</strong> These percentages must sum appropriately. Higher acquirer percentages
                      incentivize participation, while higher LP contributions improve token tradability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step4" className="border-b border-steel-750">
          <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-4">
            Step 4: Governance
          </AccordionTrigger>
          <AccordionContent className="text-dark-100 pb-4 space-y-3">
            <p>
              <strong>Purpose:</strong> Set up the governance parameters that control how vault token holders can make
              decisions about the vault's assets.
            </p>
            <div className="space-y-2">
              <p>
                <strong>• Vault Token Supply:</strong> Total number of governance tokens to mint (minimum 1,000,000).
                Higher supply allows for more granular voting but may reduce per-token value.
              </p>
              <p>
                <strong>• Termination Type:</strong> How the vault can be terminated:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <strong>DAO:</strong> Token holders vote on all decisions (most flexible)
                </li>
                <li>
                  <strong>Programmed:</strong> Automatic termination after a set time or appreciation target
                </li>
              </ul>
              <p>
                <strong>• Creation Threshold (%):</strong> Minimum percentage of total token supply needed to create a
                proposal. Lower values (0.5-2%) allow more participation; higher values (2-5%) prevent spam.
              </p>
              <p>
                <strong>• Vote Threshold (%):</strong> Minimum percentage of total supply that must vote for a proposal
                to be valid. Recommended: 10-20% for active communities, 5-10% for smaller vaults.
              </p>
              <p>
                <strong>• Execution Threshold (%):</strong> Minimum percentage of votes needed for a proposal option to
                pass. Typically 51% (simple majority) or 66% (supermajority) for important decisions.
              </p>
              <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-400 mb-2">Governance Best Practices:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        <strong>Creation Threshold:</strong> Start with 1% to encourage participation, increase if spam
                        becomes an issue
                      </li>
                      <li>
                        <strong>Vote Threshold:</strong> 10% is a good balance - achievable but requires meaningful
                        engagement
                      </li>
                      <li>
                        <strong>Execution Threshold:</strong> The execution threshold can only be set once. Set 51% for
                        standard majority rule voting or higher if you want to ensure a larger majority consensus.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step5" className="border-b border-steel-750">
          <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-4">
            Step 5: Confirm & Launch
          </AccordionTrigger>
          <AccordionContent className="text-dark-100 pb-4 space-y-3">
            <p>
              <strong>Purpose:</strong> Review all your vault settings before launching.
            </p>
            <p>
              This final step shows a comprehensive summary of all your configurations. Review everything carefully,
              especially:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Token distribution percentages</li>
              <li>Reserve threshold (ensure it's achievable)</li>
              <li>Governance thresholds (balance participation with security)</li>
              <li>Window durations (give enough time for participation)</li>
            </ul>
            <p className="mt-3">
              Once you confirm and launch, your vault will be created and the contribution window will open according to
              your settings. You'll need at least 1,000 VLRM tokens to launch a vault.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sample" className="border-b border-steel-750">
          <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-4">
            Sample Vault Configuration
          </AccordionTrigger>
          <AccordionContent className="text-dark-100 pb-4">
            <p className="mb-4">Here's an example of a well-configured vault to help guide your setup:</p>
            <div className="bg-steel-900 rounded-lg p-6 space-y-4 border border-steel-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-dark-200 text-sm mb-1">Vault Name</p>
                  <p className="font-bold">{sampleVault.name}</p>
                </div>
                <div>
                  <p className="text-dark-200 text-sm mb-1">Type</p>
                  <p className="font-bold">{sampleVault.type}</p>
                </div>
                <div>
                  <p className="text-dark-200 text-sm mb-1">Privacy</p>
                  <p className="font-bold">{sampleVault.privacy}</p>
                </div>
                <div>
                  <p className="text-dark-200 text-sm mb-1">Token Ticker</p>
                  <p className="font-bold">{sampleVault.ticker}</p>
                </div>
                <div>
                  <p className="text-dark-200 text-sm mb-1">Contribution Duration</p>
                  <p className="font-bold">{sampleVault.contributionDuration}</p>
                </div>
                <div>
                  <p className="text-dark-200 text-sm mb-1">Token Supply</p>
                  <p className="font-bold">{sampleVault.tokenSupply}</p>
                </div>
              </div>
              <div className="border-t border-steel-700 pt-4 mt-4">
                <p className="text-yellow-400 font-bold mb-3">Token Distribution</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-dark-200 text-sm mb-1">Tokens for Acquirers</p>
                    <p className="font-bold text-lg">{sampleVault.tokensForAcquires}</p>
                  </div>
                  <div>
                    <p className="text-dark-200 text-sm mb-1">Reserve</p>
                    <p className="font-bold text-lg">{sampleVault.acquireReserve}</p>
                  </div>
                  <div>
                    <p className="text-dark-200 text-sm mb-1">Liquidity Pool</p>
                    <p className="font-bold text-lg">{sampleVault.liquidityPoolContribution}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-steel-700 pt-4 mt-4">
                <p className="text-blue-400 font-bold mb-3">Governance Parameters</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-dark-200 text-sm mb-1">Creation Threshold</p>
                    <p className="font-bold">{sampleVault.creationThreshold}</p>
                  </div>
                  <div>
                    <p className="text-dark-200 text-sm mb-1">Vote Threshold</p>
                    <p className="font-bold">{sampleVault.voteThreshold}</p>
                  </div>
                  <div>
                    <p className="text-dark-200 text-sm mb-1">Execution Threshold</p>
                    <p className="font-bold">{sampleVault.executionThreshold}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-steel-700">
                <p className="text-sm text-dark-200 italic">
                  This configuration balances contributor rewards, acquirer incentives, and governance participation.
                  The The 60% acquirer allocation encourages participation, 80% reserve ensures funding viability, and
                  20% provides good liquidity.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tips" className="border-b border-steel-750">
          <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-4">
            Pro Tips & Best Practices
          </AccordionTrigger>
          <AccordionContent className="text-dark-100 pb-4 space-y-3">
            <div className="space-y-3">
              <div>
                <p className="font-bold text-yellow-400 mb-2">Token Distribution Strategy</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                  <li>
                    <strong>Higher Acquirer % (60-70%):</strong> Best for attracting buyers and ensuring vault locks
                    successfully
                  </li>
                  <li>
                    <strong>Moderate LP % (15-25%):</strong> Ensures tokens are tradeable without excessive dilution
                  </li>
                  <li>
                    <strong>Reserve 70-85%:</strong> High enough to ensure viability, low enough to be achievable
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-blue-400 mb-2">Timing Considerations</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                  <li>Give at least 3-7 days for contribution windows to allow sufficient participation</li>
                  <li>Acquire windows should be similar length to contribution windows</li>
                  <li>Consider timezone differences when setting custom window times</li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-green-400 mb-2">Governance Balance</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                  <li>Lower thresholds encourage participation but may lead to spam</li>
                  <li>Higher thresholds protect against bad actors but may reduce engagement</li>
                  <li>Start conservative and adjust based on community feedback</li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-purple-400 mb-2">Marketing & Communication</p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                  <li>Use clear, descriptive vault names and descriptions</li>
                  <li>Add social links to build community trust</li>
                  <li>Select relevant tags to improve discoverability</li>
                  <li>Use high-quality images (640x640 for vault, 256x256 for token)</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
