import { createFileRoute } from '@tanstack/react-router';

export const HowItWorks = () => {
  return (
    <div className="container mx-auto px-4 py-12 xl:px-0 text-primary-text">
      <h1 className="text-3xl md:text-4xl font-russo font-bold mb-8 text-center">How it works</h1>

      <div className="max-w-3xl mx-auto space-y-10 leading-relaxed text-dark-100">
        <section>
          <h2 className="text-2xl font-semibold mb-4">What can I do with a vault?</h2>
          <p className="mb-3">A vault is a customizable container for assets. Once created, you can:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fractionalize the assets into governance tokens</li>
            <li>Distribute tokens to contributors or buyers</li>
            <li>Enable token holders to govern how assets are managed, sold, or evolved</li>
            <li>Unlock liquidity and new utility for assets that otherwise sit dormant</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How do I create a vault?</h2>
          <p>
            To create a vault, you’ll also need to acquire and lock the required amount of <strong>$VLRM</strong>{' '}
            community tokens — this amount is dynamic and changes over time. Once set up, you choose your vault settings
            — such as governance rules, contribution requirements, and acquisition stages. After deployment,
            contributors can add assets and the vault becomes ready for fractionalization.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">What can I put in a vault?</h2>
          <p>
            Vaults can hold a wide range of Cardano-native digital assets, such as NFTs, on-chain RWAs, and fungible
            tokens. As the protocol expands, more asset types and integrations will be supported.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How do I acquire vault tokens?</h2>
          <p>
            During the acquire stage, ADA holders can send ADA into the vault in exchange for fractional governance
            tokens. These vault tokens represent ownership rights, governance power, and access to future rewards tied
            to the vault’s assets.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How do I contribute?</h2>
          <p>
            If you hold eligible assets, you can send them directly into a vault during its contribution stage.
            Contributors receive governance tokens proportional to the value of their assets, and receive ADA for the
            percentage of tokens offered to new acquirers, giving them both liquidity and voting rights over the vault’s
            future.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How do I earn $L4VA rewards?</h2>
          <p>
            Participants in L4VA can earn <strong>$L4VA</strong> incentives for engaging with the protocol. Creators,
            contributors, and acquirers all share in rewards, scaled by the vault’s total value locked (TVL) and token
            participation. The more valuable the vault at the initial successful lock, the greater the potential rewards
            distributed to its community of token holders.
          </p>
        </section>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/how-it-works')({
  component: HowItWorks,
});
