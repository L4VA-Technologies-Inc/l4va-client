import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const StepCard = ({ number, title, description }) => (
  <div className="w-full lg:w-[600px] flex flex-col sm:flex-row items-center sm:items-start p-6 sm:py-[30px] sm:pl-[60px] sm:pr-[54px] gap-4 sm:gap-[60px] bg-white/5 backdrop-blur-sm rounded-[10px]">
    <div className="min-w-[80px] text-center text-4xl sm:text-6xl lg:text-8xl xl:text-[128px] font-extrabold text-red-600 font-satoshi">
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
  const steps = [
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
      description:
        'Acquirers with vault access then have the opportunity to send ADA to the vault for a pro-rata share of the Vault Tokens.',
    },
    {
      number: 4,
      title: 'Govern',
      description:
        'Once successfully locked the Vault Tokens holders now control the fate of the vault and its assets.',
    },
  ];

  const faqItems = [
    {
      question: 'What is L4VA?',
      answer:
        'L4VA is an open-source protocol on Cardano that lets anyone fractionalize digital assets into community-governed vaults. Instead of assets sitting idle, L4VA transforms them into liquid, tradable tokens with built-in governance. No custodians. Permissionless. Designed for transparent and decentralized ownership.',
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
      answer:
        'Vaults can hold a wide range of Cardano-native digital assets, such as NFTs, on-chain RWAs, and fungible tokens. As the protocol expands, more asset types and integrations will be supported.',
    },
    {
      question: 'How do I acquire vault tokens?',
      answer:
        'During the acquire stage, ADA holders can send ADA into the vault in exchange for fractional governance tokens. These vault tokens represent ownership rights, governance power, and access to future rewards tied to the vault’s assets.',
    },
    {
      question: 'How do I contribute?',
      answer:
        'If you hold eligible assets, you can send them directly into a vault during its contribution stage. Contributors receive governance tokens proportional to the value of their assets, and receive ADA for the percentage of tokens offered to new acquirers, giving them both liquidity and voting rights over the vault’s future.',
    },
    {
      question: 'How do I earn $L4VA rewards?',
      answer:
        'Participants in L4VA can earn $L4VA incentives for engaging with the protocol. Creators, contributors, and acquirers all share in rewards, scaled by the vault’s total value locked (TVL) and token participation. The more valuable the vault at the initial successful lock, the greater the potential rewards distributed to its community of token holders.',
    },
  ];

  return (
    <div className="relative py-8 sm:py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 font-satoshi">
        <section className="mb-8 sm:mb-12 lg:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[70px]">
            <div className="space-y-4 text-dark-100 lg:pr-[135px]">
              <h3 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 lg:mb-8 text-primary-text font-russo">
                How it Works
              </h3>
              <h4 className="text-2xl sm:text-2xl lg:text-2xl xl:text-2xl font-bold mb-4 sm:mb-6 lg:mb-8 font-russo">
                Unlock liquidity, access, and governance for any asset on Cardano.
              </h4>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl">
                Create a vault, customize settings, and invite contributors to add assets, then acquirers send ADA in
                exchange for governance tokens -- fractional asset tokens with real decision making power.
              </p>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl">
                Creators, contributors, and acquirers receive $L4VA rewards based on total value locked (TVL) and vault
                tokens retained. Token holders have the power to manage the future of assets in the vault.
              </p>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl">
                Open-source, permissionless, and designed for anyone to fractionalize, acquire, and govern digital
                assets.
              </p>
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
