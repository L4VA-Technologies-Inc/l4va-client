import { createFileRoute } from '@tanstack/react-router';

export const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 xl:px-0 text-primary-text">
      <h1 className="text-3xl md:text-4xl font-russo font-bold mb-8 text-center">Privacy Policy</h1>

      <div className="max-w-3xl mx-auto space-y-6 leading-relaxed text-dark-100">
        <p>
          This Privacy Policy explains how L4VA collects, uses, and protects your personal information when you use our
          website or services.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Information We Collect</h2>
        <p>
          We may collect personal information such as your name, email address, and wallet details when you register or
          interact with our platform.
        </p>

        <h2 className="text-xl font-semibold mt-6">2. How We Use Information</h2>
        <p>
          The information we collect is used to provide, maintain, and improve our services, communicate with users, and
          ensure compliance with our Terms of Service.
        </p>

        <h2 className="text-xl font-semibold mt-6">3. Data Protection</h2>
        <p>
          We take appropriate measures to protect your personal data from unauthorized access, disclosure, alteration,
          or destruction.
        </p>

        <h2 className="text-xl font-semibold mt-6">4. Cookies</h2>
        <p>
          Our website may use cookies to enhance your browsing experience and collect anonymous analytics data. You can
          disable cookies through your browser settings.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us via our official communication
          channels.
        </p>

        <p className="mt-8 text-sm text-center">Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicy,
});
