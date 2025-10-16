import { createFileRoute } from '@tanstack/react-router';

export const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 py-12 xl:px-0 text-primary-text">
      <h1 className="text-3xl md:text-4xl font-russo font-bold mb-8 text-center">What is L4VA</h1>

      <div className="max-w-3xl mx-auto space-y-6 leading-relaxed text-dark-100">
        <p>
          L4VA is an open-source protocol on Cardano that lets anyone fractionalize digital assets into
          community-governed vaults. Instead of assets sitting idle, L4VA transforms them into liquid, tradable tokens
          with built-in governance. No custodians. Permissionless. Designed for transparent and decentralized ownership.
        </p>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/about-us')({
  component: AboutUs,
});
