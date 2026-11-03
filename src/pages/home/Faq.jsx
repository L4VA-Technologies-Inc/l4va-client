import { useState } from 'react';
import { Boxes, ChevronRight, Coins, Layers, PieChart, Sparkles } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNetwork } from '@/hooks/useNetwork';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';

const accentMix = pct => `color-mix(in srgb, var(--color-step-accent) ${pct}%, transparent)`;

/** Horizontal stepper: four cards with an outlined ghost number, joined by chevrons; rises in on flow change. */
const StepTimeline = ({ steps, flowKey }) => (
  <ol
    className={cn(
      'grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-8',
      steps.length === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4'
    )}
  >
    {steps.map((step, i) => (
      <li
        key={`${flowKey}-${step.number}`}
        className="animate-step-rise relative"
        style={{ animationDelay: `${i * 90}ms` }}
      >
        <div className="group relative h-full overflow-hidden rounded-[10px] border border-white/5 bg-steel-900/50 backdrop-blur-sm p-5 sm:p-6 pt-14 sm:pt-16 transition-colors hover:border-white/15">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-25 bg-[var(--color-step-accent)] transition-transform duration-500 group-hover:scale-x-100"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -top-3 right-3 select-none font-russo text-[96px] leading-none text-transparent opacity-60 transition-opacity group-hover:opacity-100"
            style={{ WebkitTextStroke: `1.5px ${accentMix(70)}` }}
          >
            {String(step.number).padStart(2, '0')}
          </span>
          <h3 className="relative text-lg sm:text-xl lg:text-2xl font-bold mb-2">{step.title}</h3>
          <p className="relative text-sm sm:text-base text-dark-100">{step.description}</p>
        </div>
        {i < steps.length - 1 && (
          <ChevronRight
            aria-hidden
            size={22}
            className="hidden xl:block absolute top-1/2 -right-[27px] -translate-y-1/2 text-[var(--color-step-accent)]"
          />
        )}
      </li>
    ))}
  </ol>
);

const FaqItem = ({ question, answer, index }) => (
  <AccordionItem
    className="backdrop-blur-[20px] rounded-lg data-[state=open]:bg-[#FFFFFF1A] transition-colors border-b border-[#FFFFFF0D]"
    value={`item-${index}`}
  >
    <AccordionTrigger className="hover:no-underline text-base sm:text-lg lg:text-xl xl:text-2xl p-4 sm:p-6 lg:p-8 data-[state=open]:pb-2">
      {question}
    </AccordionTrigger>
    <AccordionContent className="text-dark-100 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">{answer}</AccordionContent>
  </AccordionItem>
);

const Faq = () => {
  const { isRobinHood } = useNetwork();
  const [flowId, setFlowId] = useState('index');
  const { currencyLabel } = useCurrency();
  const chainName = isRobinHood ? 'Robinhood' : 'Cardano';
  const nativeAssetDescription = isRobinHood ? 'Robinhood-supported' : 'Cardano-native';

  const defaultSteps = [
    {
      number: 1,
      title: 'Create',
      description:
        'Create a new vault by locking the required $VLRM, then configure the vault settings and governance options.',
    },
    {
      number: 2,
      title: 'Contribute',
      description:
        'Contributors with vault access then send eligible assets to the vault during the contribution window, for their pro-rata share of Vault Tokens.',
    },
    {
      number: 3,
      title: 'Acquire',
      description: `Acquirers with vault access then have the opportunity to send ${currencyLabel} to the vault for a pro-rata share of the Vault Tokens.`,
    },
    {
      number: 4,
      title: 'Govern',
      description:
        'Once successfully locked the Vault Tokens holders now control the fate of the vault and its assets.',
    },
  ];

  // Robinhood explains each vault type as its own short flow instead of one generic sequence.
  const robinhoodFlows = [
    {
      id: 'index',
      label: 'Index Vault',
      tagline: 'A basket in one token',
      icon: PieChart,
      summary: 'One token for a basket of assets, bought for you with ETH.',
      steps: [
        {
          number: 1,
          title: 'Create',
          description: 'Pick the assets for the basket and their target weights, e.g. 60% A, 30% B, 10% ETH reserve.',
        },
        {
          number: 2,
          title: 'Acquire',
          description:
            'During the acquire window anyone can send ETH to the Vault. Your share of the ETH is your share of the Vault.',
        },
        {
          number: 3,
          title: 'Lock & Buy',
          description:
            'When the window closes the Vault buys the basket on Uniswap and Vault Tokens land in your wallet automatically.',
        },
        {
          number: 4,
          title: 'Govern',
          description: 'Holders vote to change weights, add assets, or rebalance. One token, one diversified position.',
        },
      ],
    },
    {
      id: 'acquire',
      label: 'Acquire-only',
      comingSoon: true,
      tagline: 'Raise ETH together',
      icon: Coins,
      summary: 'Raise ETH from the community around a thesis, then govern how it is used.',
      steps: [
        {
          number: 1,
          title: 'Create',
          description:
            'Set the token, the acquire window, an optional minimum raise, and how much goes to a liquidity pool.',
        },
        {
          number: 2,
          title: 'Acquire',
          description: 'Participants send ETH and receive Vault Tokens in proportion to what they sent.',
        },
        {
          number: 3,
          title: 'Lock',
          description:
            'If the minimum is met the Vault locks and tokens are distributed. If not, everyone is refunded automatically.',
        },
        {
          number: 4,
          title: 'Govern',
          description: 'Holders propose and vote on what the Vault does next with its assets.',
        },
      ],
    },
    {
      id: 'contribute-only',
      label: 'Contribution-only',
      comingSoon: true,
      tagline: 'Pool assets, share ownership',
      icon: Boxes,
      summary: 'Holders pool their tokenized assets into one Vault and own it together. No ETH raise.',
      steps: [
        {
          number: 1,
          title: 'Create',
          description:
            'Choose which assets are eligible. All Vault Tokens go to contributors, so there is no acquire window.',
        },
        {
          number: 2,
          title: 'Contribute',
          description: 'Holders deposit eligible assets during the contribution window.',
        },
        {
          number: 3,
          title: 'Lock',
          description: 'The Vault locks and Vault Tokens are split by the value each contributor brought in.',
        },
        {
          number: 4,
          title: 'Govern',
          description: 'Contributors govern the pooled assets together: keep, sell, expand, or rebalance.',
        },
      ],
    },
    {
      id: 'contribute',
      label: 'Contribute + Acquire',
      comingSoon: true,
      tagline: 'Bring assets, get ETH',
      icon: Layers,
      summary: 'Turn tokenized assets you hold into a shared, tradable Vault and get ETH for part of it.',
      steps: [
        {
          number: 1,
          title: 'Create',
          description: 'Choose which assets are eligible and what share of Vault Tokens is offered to acquirers.',
        },
        {
          number: 2,
          title: 'Contribute',
          description:
            'Asset holders deposit eligible assets during the contribution window and receive Vault Tokens for their value.',
        },
        {
          number: 3,
          title: 'Acquire',
          description: 'Others send ETH during the acquire window for the share of Vault Tokens on offer.',
        },
        {
          number: 4,
          title: 'Lock',
          description:
            'If the raise meets its minimum the Vault locks: contributors get Vault Tokens plus the ETH, acquirers get their tokens. If not, everything is returned.',
        },
        {
          number: 5,
          title: 'Govern',
          description: 'All holders, contributors and acquirers alike, govern the Vault and its assets together.',
        },
      ],
    },
  ];

  const defaultHeroContent = {
    subtitle: `Unlock liquidity, access, and governance for any asset on ${chainName}.`,
    paragraphs: [
      `Create a vault, customize settings, and invite contributors to add assets, then acquirers send ${currencyLabel} in exchange for governance tokens -- fractional asset tokens with real decision making power.`,
      'Creators, contributors, and acquirers receive $L4VA rewards based on total value locked (TVL) and vault tokens retained. Token holders have the power to manage the future of assets in the vault.',
      'Open-source, permissionless, and designed for anyone to fractionalize, acquire, and govern digital assets.',
    ],
  };

  const robinhoodHeroContent = {
    subtitle: 'Create, own, and govern investment products on Robinhood Chain.',
    paragraphs: [
      'A Vault is a shared on-chain fund. It holds assets, issues Vault Tokens to the people who fund it, and is run by those token holders. Pick a Vault type to see how it works.',
    ],
    note: 'Creators, contributors, acquirers, liquidity providers, and voters earn $L4VA rewards for active participation, not passive holding.',
  };

  const activeFlow = robinhoodFlows.find(flow => flow.id === flowId) ?? robinhoodFlows[0];
  const steps = isRobinHood ? activeFlow.steps : defaultSteps;
  const heroContent = isRobinHood ? robinhoodHeroContent : defaultHeroContent;

  const defaultFaqItems = [
    {
      question: 'What is L4VA?',
      answer: `L4VA is an open-source protocol on ${chainName} that lets anyone fractionalize digital assets into community-governed vaults. Instead of assets sitting idle, L4VA transforms them into liquid, tradable tokens with built-in governance. No custodians. Permissionless. Designed for transparent and decentralized ownership.`,
    },
    {
      question: 'What can I do with a vault?',
      answer: `A vault is a customizable container for assets. Once created, you can:
  - Fractionalize the assets into governance tokens
  - Distribute tokens to contributors or buyers
  - Enable token holders to govern how assets are managed, sold, or evolved
  - Unlock liquidity and new utility for assets that otherwise sit dormant`,
    },
    {
      question: 'How do I create a vault?',
      answer:
        'To create a vault, you’ll also need to acquire and lock the required amount of $VLRM community tokens — this amount is dynamic and changes over time. Once set up, you choose your vault settings — such as governance rules, contribution requirements, and acquisition stages. After deployment, contributors can add assets and the vault becomes ready for fractionalization.',
    },
    {
      question: 'What can I put in a vault?',
      answer: `Vaults can hold a wide range of ${nativeAssetDescription} digital assets, such as NFTs, on-chain RWAs, and fungible tokens. As the protocol expands, more asset types and integrations will be supported.`,
    },
    {
      question: 'How do I acquire vault tokens?',
      answer: `During the acquire stage, ${currencyLabel} holders can send ${currencyLabel} into the vault in exchange for fractional governance tokens. These vault tokens represent ownership rights, governance power, and access to future rewards tied to the vault’s assets.`,
    },
    {
      question: 'How do I contribute?',
      answer: `If you hold eligible assets, you can send them directly into a vault during its contribution stage. Contributors receive governance tokens proportional to the value of their assets, and receive ${currencyLabel} for the percentage of tokens offered to new acquirers, giving them both liquidity and voting rights over the vault’s future.`,
    },
    {
      question: 'How do I earn $L4VA rewards?',
      answer:
        'Participants in L4VA can earn $L4VA incentives for engaging with the protocol. Creators, contributors, and acquirers all share in rewards, scaled by the vault’s total value locked (TVL) and token participation. The more valuable the vault at the initial successful lock, the greater the potential rewards distributed to its community of token holders.',
    },
  ];

  const robinhoodFaqItems = [
    {
      question: 'What is L4VA?',
      answer: (
        <div className="space-y-4">
          <p>
            L4VA is an open-source protocol for creating, owning, and governing programmable investment products
            on-chain. It provides the capital market rails that transform tokenized assets into community-governed
            Vaults with built-in issuance, liquidity, incentives, and governance.
          </p>
          <p>
            Each Vault represents a programmable investment strategy. Creators define the initial thesis and rules,
            contributors add eligible assets, participants acquire Vault Tokens, and token holders collectively govern
            how the strategy evolves.
          </p>
        </div>
      ),
    },
    {
      question: 'What can I do with a Vault?',
      answer: (
        <div className="space-y-4">
          <p>A Vault is a customizable on-chain structure for launching a programmable investment product.</p>
          <p>Once created, a Vault can:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Combine eligible tokenized assets into a defined strategy</li>
            <li>Issue fungible Vault Tokens representing proportional participation in the Vault</li>
            <li>Distribute Vault Tokens to asset contributors and acquirers</li>
            <li>Establish transparent governance rules</li>
            <li>Enable token holders to propose and vote on future changes</li>
            <li>Support secondary-market trading and liquidity</li>
            <li>Expand over time by accepting additional assets</li>
          </ul>
          <p>Vaults turn individual tokenized assets into programmable markets that communities can own and govern.</p>
        </div>
      ),
    },
    {
      question: 'How do I create a Vault?',
      answer: (
        <div className="space-y-4">
          <p>
            To create a Vault, you must meet the applicable protocol requirements, including acquiring and locking the
            required amount of $VLRM. The required amount may change over time based on protocol governance and
            configuration.
          </p>
          <p>You then define the Vault’s settings, including:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Investment strategy or market thesis</li>
            <li>Eligible assets</li>
            <li>Contribution requirements</li>
            <li>Vault Token distribution</li>
            <li>Acquisition terms</li>
            <li>Governance rules</li>
            <li>Expansion settings</li>
          </ul>
          <p>
            Once deployed, approved contributors can add eligible assets and the Vault can proceed through its
            contribution, acquisition, and launch stages.
          </p>
        </div>
      ),
    },
    {
      question: 'What can I put in a Vault?',
      answer: (
        <div className="space-y-4">
          <p>
            Vaults are designed to support tokenized assets available on Robinhood Chain and compatible EVM networks.
          </p>
          <p>Depending on the Vault’s configuration and available integrations, eligible assets may include:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Tokenized stocks</li>
            <li>Tokenized real-world assets</li>
            <li>Stablecoins</li>
            <li>Fungible digital assets</li>
            <li>Tokenized commodities</li>
            <li>Tokenized real estate or private-market assets</li>
            <li>Other compliant and technically supported on-chain assets</li>
          </ul>
          <p>
            Each Vault defines which assets are eligible. Additional asset types and cross-chain integrations may be
            supported as the protocol expands.
          </p>
        </div>
      ),
    },
    {
      question: 'How do I acquire Vault Tokens?',
      answer: (
        <div className="space-y-4">
          <p>
            During the acquisition stage, eligible participants can contribute ETH or USDC in exchange for a
            proportional allocation of Vault Tokens.
          </p>
          <p>Vault Tokens represent participation in the Vault and may provide:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Proportional exposure to the Vault’s assets and strategy</li>
            <li>On-chain governance rights</li>
            <li>Access to protocol incentives where applicable</li>
            <li>The ability to trade or provide liquidity for the Vault Token</li>
          </ul>
          <p>
            The specific rights, pricing, and acquisition terms are determined by each Vault’s configuration and
            governing smart contracts.
          </p>
        </div>
      ),
    },
    {
      question: 'How do I contribute assets?',
      answer: (
        <div className="space-y-4">
          <p>
            During the contribution stage, approved contributors can deposit eligible tokenized assets into a Vault.
          </p>
          <p>
            In return, contributors receive a proportional allocation of Vault Tokens based on the applicable
            contribution and valuation rules. Where part of the Vault Token supply is allocated to new acquirers,
            contributors may also receive a proportional share of the ETH or USDC raised during the acquisition stage.
          </p>
          <p>
            This allows contributors to gain liquidity while retaining participation and governance rights in the
            broader Vault strategy.
          </p>
        </div>
      ),
    },
    {
      question: 'How do I earn $L4VA rewards?',
      answer: (
        <div className="space-y-4">
          <p>
            Participants can earn $L4VA rewards by performing activities that expand the protocol and strengthen its
            markets.
          </p>
          <p>Eligible activities may include:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Creating Vaults</li>
            <li>Contributing assets</li>
            <li>Acquiring Vault Tokens</li>
            <li>Participating in Vault expansion stages</li>
            <li>Providing eligible liquidity</li>
            <li>Trading through the L4VA interface</li>
            <li>Submitting governance proposals</li>
            <li>Voting in governance</li>
          </ul>
          <p>
            Rewards are based on qualifying protocol activity rather than passive ownership or total value locked.
            Weekly rewards are distributed across eligible participants, with a designated share allocated to Vault
            creators and the remainder allocated to users performing qualifying activities.
          </p>
          <p>
            Certain participants may also qualify for additional reward multipliers by meeting applicable $L4VA, $VLRM,
            and ecosystem alignment requirements. Reward eligibility, weighting, vesting, and supported liquidity pairs
            are determined by the protocol’s current reward rules.
          </p>
        </div>
      ),
    },
  ];

  const faqItems = isRobinHood ? robinhoodFaqItems : defaultFaqItems;

  return (
    <div className="relative py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 font-satoshi">
        <section className="mb-8 sm:mb-12 lg:mb-16 space-y-6 sm:space-y-8">
          <header className="max-w-3xl space-y-4">
            <h3 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-primary-text font-russo">
              How it Works
            </h3>
            <h4 className="text-xl sm:text-2xl font-bold font-russo text-dark-100">{heroContent.subtitle}</h4>
            {heroContent.paragraphs.map(paragraph => (
              <p key={paragraph} className="text-base sm:text-lg lg:text-xl text-dark-100">
                {paragraph}
              </p>
            ))}
          </header>
          {isRobinHood && (
            <div
              role="tablist"
              aria-label="Vault type"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
            >
              {robinhoodFlows.map(({ id, label, tagline, icon: Icon, comingSoon }) => {
                const active = id === flowId;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFlowId(id)}
                    className={cn(
                      'group relative flex items-center gap-3 text-left p-4 rounded-[10px] border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-step-accent)]',
                      active
                        ? 'border-[var(--color-step-accent)] bg-[color-mix(in_srgb,var(--color-step-accent)_12%,transparent)]'
                        : 'border-white/5 bg-steel-900/50 hover:border-white/20'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                        active
                          ? 'bg-[var(--color-step-accent)] text-steel-950'
                          : 'bg-steel-750 text-dark-100 group-hover:text-white'
                      )}
                    >
                      <Icon size={20} />
                    </span>
                    <span>
                      <span
                        className={cn('block font-bold text-base lg:text-lg', active ? 'text-white' : 'text-dark-100')}
                      >
                        {label}
                      </span>
                      <span className="block text-sm text-dark-100">{tagline}</span>
                    </span>
                    {comingSoon && (
                      <span className="absolute -top-2 right-3 rounded-full border border-white/10 bg-steel-900 px-2 py-px text-[9px] font-semibold uppercase leading-4 tracking-wider text-dark-100">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {isRobinHood && (
            <p key={activeFlow.id} className="animate-step-rise text-base sm:text-lg text-white">
              {activeFlow.summary}
              {activeFlow.comingSoon && (
                <span className="ml-2 text-sm text-dark-100">Coming soon on Robinhood Chain.</span>
              )}
            </p>
          )}
          <StepTimeline steps={steps} flowKey={isRobinHood ? activeFlow.id : 'default'} />
          {heroContent.note && (
            <p className="flex items-center gap-2 text-sm sm:text-base text-dark-100">
              <Sparkles size={16} className="shrink-0 text-[var(--color-step-accent)]" />
              {heroContent.note}
            </p>
          )}
        </section>
        <section>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 lg:mb-8 font-russo">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <Accordion collapsible className="bg-[#FFFFFF08] rounded-[10px]" type="single">
            {faqItems.map((item, index) => (
              <FaqItem key={index} {...item} index={index} />
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
};

export default Faq;
