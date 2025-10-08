import { createFileRoute } from '@tanstack/react-router';

export const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-12 xl:px-0 text-primary-text">
      <h1 className="text-3xl md:text-4xl font-russo font-bold mb-8 text-center">Terms of Service</h1>

      <div className="max-w-3xl mx-auto space-y-6 leading-relaxed text-dark-100">
        <p>
          Welcome to L4VA. By accessing or using our website, platform, and services, you agree to comply with and be
          bound by these Terms of Service. If you do not agree, please do not use our platform.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Use of Service</h2>
        <p>
          You agree to use our services only for lawful purposes and in accordance with applicable laws and regulations.
          You must not misuse or attempt to interfere with the normal operation of our platform.
        </p>

        <h2 className="text-xl font-semibold mt-6">2. Accounts</h2>
        <p>
          To access certain features, you may need to create an account. You are responsible for maintaining the
          confidentiality of your credentials and all activities under your account.
        </p>

        <h2 className="text-xl font-semibold mt-6">3. Intellectual Property</h2>
        <p>
          All content, branding, and materials on this website are the property of L4VA and are protected by copyright
          and trademark laws.
        </p>

        <h2 className="text-xl font-semibold mt-6">4. Limitation of Liability</h2>
        <p>
          L4VA shall not be liable for any indirect, incidental, or consequential damages arising from the use or
          inability to use our services.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of our services after any changes constitutes
          acceptance of the new Terms.
        </p>

        <p className="mt-8 text-sm text-center">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/terms-of-service')({
  component: TermsOfService,
});
