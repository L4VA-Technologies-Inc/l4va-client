import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNetwork } from '@/hooks/useNetwork';
import { useCurrency } from '@/hooks/useCurrency';

const StepCard = ({ number, title, description }) => (
  <div className="w-full flex flex-col sm:flex-row items-center p-6 sm:py-[30px] sm:pl-[60px] sm:pr-[54px] gap-4 sm:gap-[60px] bg-steel-900/50 backdrop-blur-sm rounded-[10px]">
    <div className="min-w-[80px] text-center text-4xl sm:text-6xl lg:text-8xl xl:text-[128px] font-extrabold text-[var(--color-step-accent)] font-satoshi">
      {number}
    </div>
    <div className="text-center sm:text-left">
      <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-2">{title}</h3>
      <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-dark-100">{description}</p>
    </div>
  </div>
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

  const robinhoodSteps = [
    {
      number: 1,
      title: 'Create',
      description:
        'Create a new Vault by meeting the required protocol conditions, then define the strategy, eligible assets, contribution rules, and governance settings.',
    },
    {
      number: 2,
      title: 'Contribute',
      description:
        'Approved contributors add eligible tokenized assets to the Vault during its contribution window and receive a proportional share of the Vault Tokens.',
    },
    {
      number: 3,
      title: 'Acquire',
      description:
        'Participants use ETH or USDC to acquire a proportional share of the Vault Tokens, providing capital and liquidity to the strategy.',
    },
    {
      number: 4,
      title: 'Govern',
      description:
        'After launch, Vault Token holders collectively govern the Vault through transparent on-chain proposals and voting—guiding how the strategy and its assets evolve.',
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
    subtitle: 'Create, own, and govern programmable investment products on Robinhood Chain.',
    paragraphs: [
      'Create a Vault, define its strategy and governance settings, and invite contributors to add eligible tokenized assets. Participants can then acquire Vault Tokens using ETH or USDC, gaining proportional exposure to the Vault and a voice in its future.',
      'Vault creators, asset contributors, token acquirers, liquidity providers, and governance participants can earn L4VA rewards for activities that expand the protocol. Rewards are designed around active contribution—not passive ownership or total value locked.',
      'Once launched, every Vault becomes a community-governed on-chain market. Vault Token holders can propose and vote on how the strategy, assets, and rules evolve over time.',
      'Open, programmable infrastructure for transforming tokenized assets into investment products that communities can launch, own, and govern.',
    ],
  };

  const steps = isRobinHood ? robinhoodSteps : defaultSteps;
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
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-[70px]">
            <div className="space-y-4 text-dark-100 lg:pr-[135px]">
              <h3 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 lg:mb-8 text-primary-text font-russo">
                How it Works
              </h3>
              <h4 className="text-2xl sm:text-2xl lg:text-2xl xl:text-2xl font-bold mb-4 sm:mb-6 lg:mb-8 font-russo">
                {heroContent.subtitle}
              </h4>
              {heroContent.paragraphs.map(paragraph => (
                <p key={paragraph} className="text-base sm:text-lg lg:text-xl xl:text-2xl">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="space-y-4 sm:space-y-6">
              {steps.map(step => (
                <StepCard key={step.number} {...step} />
              ))}
            </div>
          </div>
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
