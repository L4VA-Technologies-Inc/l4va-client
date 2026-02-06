import { createFileRoute } from '@tanstack/react-router';

export const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-12 xl:px-0 text-primary-text">
      <h1 className="text-3xl md:text-4xl font-russo font-bold mb-8 text-center">L4VA Terms of Use</h1>

      <div className="max-w-3xl mx-auto space-y-6 leading-relaxed text-dark-100">
        <p className="text-sm text-center">Last Updated: 02/06/2026</p>

        <p>
          These Terms of Use (&quot;Terms&quot;) govern your access to and use of the L4VA platform, including all
          websites, interfaces, smart contracts, APIs, integrations, documentation, and related services (collectively,
          the &quot;Platform&quot;), operated by L4VA Technologies, Inc., a Florida corporation (&quot;L4VA,&quot;
          &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
        </p>
        <p>
          By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, you must not
          use the Platform.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. WHAT L4VA IS (AND IS NOT)</h2>
        <p>
          L4VA provides non-custodial, open-source software infrastructure that enables users to create, participate in,
          and govern blockchain-based vaults using digital assets.
        </p>
        <p>L4VA is not:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>A custodian, escrow agent, or trustee</li>
          <li>An asset manager or investment adviser</li>
          <li>A broker-dealer, dealer, exchange, transfer agent, or clearing agency</li>
          <li>A fiduciary</li>
          <li>A marketplace operator</li>
          <li>A party to user-created vaults or transactions</li>
        </ul>
        <p>
          All actions on the Platform are user-directed and executed through third-party wallets, blockchain networks,
          and protocols.
        </p>

        <h2 className="text-xl font-semibold mt-6">2. NO BROKER-DEALER, ISSUER, OR SECURITIES ACTIVITY</h2>
        <p>
          L4VA Technologies, Inc. is not a broker-dealer, dealer, investment adviser, transfer agent, exchange, or
          clearing agency, and is not registered as such with the U.S. Securities and Exchange Commission or any other
          regulatory authority.
        </p>
        <p>
          L4VA does not issue, offer, sell, promote, or distribute securities, investment contracts, or financial
          instruments.
        </p>
        <p>
          Any tokens, vault interests, governance rights, or digital assets referenced or utilized on the Platform are:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Created and controlled by users or independent third parties</li>
          <li>Governed by protocol-defined rules</li>
          <li>Not issued by L4VA</li>
        </ul>
        <p>
          Nothing on the Platform constitutes an offer or solicitation to buy or sell securities in any jurisdiction.
        </p>

        <h2 className="text-xl font-semibold mt-6">3. ELIGIBILITY</h2>
        <p>You represent that you:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Are at least 18 years old</li>
          <li>Have the legal capacity to enter into these Terms</li>
          <li>Are not prohibited from using blockchain services under applicable law</li>
        </ul>
        <p>You are solely responsible for ensuring your use of the Platform complies with applicable laws.</p>

        <h2 className="text-xl font-semibold mt-6">4. NON-CUSTODIAL NATURE</h2>
        <p>L4VA does not custody, control, or possess user funds, digital assets, or private keys.</p>
        <p>You are solely responsible for:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Wallet security</li>
          <li>Private key management</li>
          <li>All transactions initiated through your wallet</li>
        </ul>
        <p>Blockchain transactions are irreversible.</p>

        <h2 className="text-xl font-semibold mt-6">5. VAULTS AND USER RESPONSIBILITY</h2>
        <p>Vaults created using the Platform are:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Created by users</li>
          <li>Governed by token holders</li>
          <li>Controlled by protocol-defined rules</li>
        </ul>
        <p>L4VA does not guarantee:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Vault performance or outcomes</li>
          <li>Asset values, liquidity, or pricing</li>
          <li>Governance fairness or effectiveness</li>
        </ul>
        <p>You acknowledge that governance decisions may result in partial or total loss of assets.</p>

        <h2 className="text-xl font-semibold mt-6">6. GOVERNANCE VOTING AND EXECUTION</h2>

        <h3 className="text-lg font-semibold mt-4">6.1 Off-Chain Governance Vote Calculation</h3>
        <p>
          Governance voting power is currently calculated off-chain using objective, deterministic snapshot data derived
          from on-chain wallet states, including token balances at a defined block height or timestamp.
        </p>
        <p>L4VA does not subjectively evaluate, weight, interpret, or alter votes.</p>

        <h3 className="text-lg font-semibold mt-4">6.2 Snapshot Methodology</h3>
        <p>
          Voting eligibility and weight are determined solely by snapshot data. Transfers or changes occurring after the
          snapshot are not reflected.
        </p>
        <p>Users accept all risks associated with snapshot-based governance.</p>

        <h3 className="text-lg font-semibold mt-4">6.3 Transparency and Auditability</h3>
        <p>
          L4VA surfaces governance voting logs, tallies, and execution records for transparency and auditability. These
          records are intended to enable independent verification based on disclosed rules and snapshot data.
        </p>

        <h3 className="text-lg font-semibold mt-4">6.4 Governance Execution Authority</h3>
        <p>
          Certain vaults may designate a smart contract, multisignature wallet, or execution key controlled or
          co-controlled by L4VA (or its designees) solely to execute governance outcomes that have been validly approved
          through protocol-defined mechanisms.
        </p>
        <p>L4VA acts only in a ministerial, non-discretionary, execution-only capacity and:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Does not initiate governance actions</li>
          <li>Does not influence voting outcomes</li>
          <li>Does not override or reinterpret results</li>
        </ul>
        <p>Execution reflects collective user decisions, not decisions by L4VA.</p>

        <h3 className="text-lg font-semibold mt-4">6.5 Future On-Chain Governance</h3>
        <p>
          L4VA intends to transition governance voting, and execution to fully on-chain mechanisms in the future. No
          guarantees are made regarding timing or implementation.
        </p>

        <h2 className="text-xl font-semibold mt-6">7. TEAM MEMBER PARTICIPATION; NO AGENCY OR ENDORSEMENT</h2>
        <p>
          Certain founders, employees, contractors, or contributors associated with L4VA Technologies, Inc. (&quot;Team
          Members&quot;) may interact with the Platform solely in their personal capacities.
        </p>
        <p>Any such participation:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Is undertaken as an individual user, not on behalf of L4VA</li>
          <li>Occurs through personal wallets</li>
          <li>Is subject to the same rules, fees, and risks as any other user</li>
        </ul>
        <p>
          Team Members do not act as agents, representatives, or fiduciaries of L4VA when configuring vaults,
          contributing assets, voting, or otherwise interacting with the Platform.
        </p>
        <p>
          No vault shall be deemed &quot;official,&quot; &quot;endorsed,&quot; &quot;managed,&quot; or
          &quot;sponsored&quot; by L4VA solely because one or more Team Members participated.
        </p>
        <p>
          L4VA Technologies, Inc. itself does not contribute assets to vaults, does not hold vault tokens, and does not
          participate in governance except in an execution-only capacity.
        </p>

        <h2 className="text-xl font-semibold mt-6">8. THIRD-PARTY INTEGRATIONS AND SERVICE PROVIDERS</h2>

        <h3 className="text-lg font-semibold mt-4">8.1 Integrations</h3>
        <p>The Platform may integrate with or display data from third-party services, including but not limited to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>NFT marketplaces</li>
          <li>Staking protocols</li>
          <li>Liquidity protocols</li>
          <li>Analytics and pricing APIs</li>
          <li>Wallet providers</li>
        </ul>
        <p>Integrations are provided for interoperability and informational purposes only.</p>

        <h3 className="text-lg font-semibold mt-4">8.2 No Control or Endorsement</h3>
        <p>
          L4VA does not control, operate, endorse, or guarantee any third-party service. Your interactions with
          third-party services are governed solely by their terms.
        </p>

        <h2 className="text-xl font-semibold mt-6">9. NO WARRANTIES</h2>
        <p className="uppercase font-semibold">
          THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot;
        </p>
        <p className="uppercase font-semibold">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, L4VA DISCLAIMS ALL WARRANTIES, INCLUDING WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p>Smart contracts, integrations, and third-party services may contain errors, vulnerabilities, or exploits.</p>

        <h2 className="text-xl font-semibold mt-6">10. LIMITATION OF LIABILITY</h2>
        <p className="uppercase font-semibold">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, L4VA SHALL NOT BE LIABLE FOR ANY:
        </p>
        <ul className="list-disc pl-6 space-y-1 uppercase font-semibold">
          <li>LOSS OF DIGITAL ASSETS</li>
          <li>LOSS OF PROFITS, REVENUE, OR DATA</li>
          <li>GOVERNANCE DECISIONS OR OUTCOMES</li>
          <li>OFF-CHAIN VOTE CALCULATION OR SNAPSHOT ERRORS</li>
          <li>SMART CONTRACT FAILURES OR BUGS</li>
          <li>BLOCKCHAIN NETWORK FAILURES</li>
          <li>SECURITY BREACHES OR EXPLOITS</li>
          <li>API ERRORS OR DATA INACCURACIES</li>
          <li>
            ACTS OR OMISSIONS OF INTEGRATION PARTNERS, MARKETPLACES, STAKING PROVIDERS, OR OTHER SERVICE PROVIDERS
          </li>
        </ul>
        <p className="uppercase font-semibold">
          IN NO EVENT SHALL L4VA&apos;S TOTAL AGGREGATE LIABILITY EXCEED $100 USD.
        </p>

        <h2 className="text-xl font-semibold mt-6">11. INDEMNIFICATION</h2>
        <p>
          You agree to DEFEND, INDEMNIFY, AND HOLD HARMLESS L4VA Technologies, Inc., its officers, directors, employees,
          contractors, contributors, affiliates, and agents from and against any and all claims, damages, losses,
          liabilities, costs, and expenses (including attorneys&apos; fees) arising from or related to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your use of the Platform</li>
          <li>Your participation in any vault or governance process</li>
          <li>Off-chain governance vote calculation or snapshot methodology</li>
          <li>Execution of governance outcomes by L4VA</li>
          <li>Participation by Team Members acting in individual capacities</li>
          <li>Any interaction with third-party services or integrations</li>
          <li>Any act or omission of integration partners or service providers</li>
          <li>Your violation of these Terms or applicable law</li>
        </ul>
        <p>This obligation survives termination.</p>

        <h2 className="text-xl font-semibold mt-6">12. FUTURE FOUNDATION OR GOVERNANCE ENTITIES</h2>
        <p>
          L4VA may establish or support an independent foundation, DAO, or ecosystem entity in the future. Until such
          time, all references to &quot;L4VA&quot; refer solely to L4VA Technologies, Inc., a Florida corporation. No
          partnership, agency, or fiduciary relationship is created.
        </p>

        <h2 className="text-xl font-semibold mt-6">13. TERMINATION</h2>
        <p>
          L4VA may restrict or terminate access to the Platform at any time if required by law or to protect the
          Platform.
        </p>

        <h2 className="text-xl font-semibold mt-6">14. GOVERNING LAW</h2>
        <p>
          These Terms are governed by the laws of the State of Florida, without regard to conflict-of-law principles.
        </p>

        <h2 className="text-xl font-semibold mt-6">15. CONTACT</h2>
        <p>
          L4VA Technologies, Inc.
          <br />
          7901 4th St N STE 300
          <br />
          St. Petersburg, FL 33702
        </p>
        <p>
          <a href="mailto:connect.l4va@gmail.com" className="text-orange-500 hover:underline">
            connect.l4va@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/terms-of-service')({
  component: TermsOfService,
});
