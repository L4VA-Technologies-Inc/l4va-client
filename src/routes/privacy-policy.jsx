import { createFileRoute } from '@tanstack/react-router';

export const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 xl:px-0 text-primary-text">
      <h1 className="text-3xl md:text-4xl font-russo font-bold mb-8 text-center">L4VA Privacy Policy</h1>

      <div className="max-w-3xl mx-auto space-y-6 leading-relaxed text-dark-100">
        <p className="text-sm text-center">Last Updated: 02/06/2026</p>

        <h2 className="text-xl font-semibold mt-6">1. INFORMATION WE COLLECT</h2>
        <p>We may collect:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Contact information voluntarily provided</li>
          <li>Limited technical and usage data</li>
          <li>Public blockchain transaction data</li>
        </ul>
        <p>L4VA does not collect private keys or have access to user wallets.</p>

        <h2 className="text-xl font-semibold mt-6">2. USE OF INFORMATION</h2>
        <p>Information is used to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Operate and improve the Platform</li>
          <li>Provide support and communications</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>We do not sell personal data.</p>

        <h2 className="text-xl font-semibold mt-6">3. PLATFORM USAGE DATA; DATA RIGHTS AND MONETIZATION</h2>

        <h3 className="text-lg font-semibold mt-4">3.1 Platform Usage Data</h3>
        <p>
          The Platform generates certain data relating to how users interact with the Platform, including but not
          limited to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Feature usage</li>
          <li>Transaction metadata (excluding private keys)</li>
          <li>Vault activity metrics</li>
          <li>Governance participation metrics</li>
          <li>Performance and diagnostic data</li>
        </ul>
        <p>Such data may be collected, aggregated, anonymized, or de-identified (&quot;Platform Usage Data&quot;).</p>

        <h3 className="text-lg font-semibold mt-4">3.2 Ownership and Rights</h3>
        <p>To the maximum extent permitted by law:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Users retain ownership of their personal data</li>
          <li>L4VA co-owns Platform Usage Data</li>
          <li>
            L4VA retains an exclusive, perpetual, transferable, sublicensable, worldwide right to use, analyze,
            aggregate, derive insights from, and commercialize Platform Usage Data, provided such data is not reasonably
            identifiable to an individual user
          </li>
        </ul>
        <p>
          Platform Usage Data does not include private keys, wallet credentials, or confidential personal information.
        </p>

        <h3 className="text-lg font-semibold mt-4">3.3 Permitted Uses</h3>
        <p>L4VA may use Platform Usage Data for:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Analytics and research</li>
          <li>Product development and optimization</li>
          <li>Benchmarking and reporting</li>
          <li>Commercial partnerships</li>
          <li>Monetization and licensing</li>
        </ul>
        <p>Including transfer or assignment to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Affiliates</li>
          <li>Successors</li>
          <li>Acquirers</li>
          <li>Foundations or ecosystem entities</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">4. THIRD-PARTY SERVICES</h2>
        <p>
          Third-party providers may process limited data subject to their own privacy policies. L4VA is not responsible
          for third-party data practices.
        </p>

        <h2 className="text-xl font-semibold mt-6">5. DATA SECURITY</h2>
        <p>
          We implement reasonable administrative and technical safeguards but cannot guarantee absolute security,
          particularly with respect to blockchain networks.
        </p>

        <h2 className="text-xl font-semibold mt-6">6. DATA RETENTION</h2>
        <p>Data is retained only as long as reasonably necessary for legitimate business or legal purposes.</p>

        <h2 className="text-xl font-semibold mt-6">7. USER RIGHTS</h2>
        <p>
          Users may request access, correction, or deletion of personal data where required by law by contacting us.
        </p>

        <h2 className="text-xl font-semibold mt-6">8. CHANGES</h2>
        <p>
          We may update this Privacy Policy from time to time. Continued use of the Platform constitutes acceptance.
        </p>

        <h2 className="text-xl font-semibold mt-6">9. CONTACT</h2>
        <p>L4VA Technologies, Inc.</p>
        <p>
          <a href="mailto:connect.l4va@gmail.com" className="text-orange-500 hover:underline">
            connect.l4va@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicy,
});
