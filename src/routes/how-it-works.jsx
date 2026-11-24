import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import clsx from 'clsx';
import {
  ArrowRight,
  Coins,
  Droplets,
  Gift,
  Layers,
  Package,
  Repeat,
  Rocket,
  ShoppingCart,
  Sparkles,
  Vote,
} from 'lucide-react';

import { useNetwork } from '@/hooks/useNetwork';
import { useAuth } from '@/lib/auth/auth';
import { useModalControls } from '@/lib/modals/modal.context';
import { useVaultFlows } from '@/hooks/useVaultFlows';

export const HowItWorks = () => {
  const { isRobinHood } = useNetwork();
  const { isAuthenticated } = useAuth();
  const { openModal } = useModalControls();

  const vaultFlows = useVaultFlows();
  const [flowId, setFlowId] = useState(null);
  // Default to the first vault type that is live on this chain.
  const activeFlow = vaultFlows.find(f => f.id === flowId) ?? vaultFlows.find(f => !f.comingSoon) ?? vaultFlows[0];

  // Same rewards rules on every chain; only the LP pair differs (see RewardsInfoModal).
  const poolPair = isRobinHood ? 'VT/ETH or VT/USDC' : 'VT/ADA or VT/USDCx';
  const rewardActivities = [
    { icon: Rocket, label: 'Create vaults' },
    { icon: Package, label: 'Contribute assets' },
    { icon: ShoppingCart, label: 'Acquire vault tokens' },
    { icon: Droplets, label: `Provide ${poolPair} liquidity` },
    { icon: Repeat, label: 'Swap vault tokens in the widget' },
    { icon: Vote, label: 'Vote in governance' },
  ];

  const rewardFacts = [
    {
      icon: Coins,
      title: 'Half now, half vested',
      text: '50% is yours right away. The other 50% unlocks over 4 weeks while you keep holding your vault tokens, in your wallet or in an eligible LP position.',
    },
    {
      icon: Gift,
      title: 'Claim anytime',
      text: 'Unlocked $L4VA waits in the protocol until you claim it from the Claims section.',
    },
    {
      icon: Layers,
      title: 'Staking rewards',
      text: 'Staking L4VA or VLRM earns separate base rewards from the treasury, on top of protocol rewards.',
    },
  ];

  const alignmentBonuses = [
    { action: 'Stake 100,000+ L4VA', bonus: '+5%' },
    { action: 'Stake 20,000+ VLRM', bonus: '+5%' },
    { action: 'Hold ORACLE', bonus: '+0.5% to +5%' },
    { action: 'All three (full alignment)', bonus: '+5%' },
  ];

  return (
    <div className="container mx-auto px-4 py-10 sm:py-14 xl:px-0 text-primary-text space-y-14 sm:space-y-20">
      {/* Intro */}
      <header className="max-w-3xl">
        <h1 className="font-russo text-4xl sm:text-5xl">How it works</h1>
        <p className="mt-4 text-lg sm:text-xl text-dark-100">
          A vault is a shared fund on {isRobinHood ? 'Robinhood Chain' : 'Cardano'}. It holds assets, and its token
          gives you a share of them and a vote on how they are run.
        </p>
      </header>

      {/* Vault types */}
      <section>
        <h2 className="font-russo text-2xl sm:text-3xl">Vault types</h2>
        <p className="mt-2 mb-6 text-dark-100">
          Different vaults work in different ways. Available types depend on the chain.
        </p>
        <div role="tablist" aria-label="Vault type" className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {vaultFlows.map(flow => {
            const Icon = flow.icon;
            const active = flow.id === activeFlow.id;
            return (
              <button
                key={flow.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFlowId(flow.id)}
                className={clsx(
                  'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                  active
                    ? 'border-orange-500/60 bg-orange-500/10'
                    : 'border-steel-850 bg-steel-950 hover:border-steel-750'
                )}
              >
                <Icon className={clsx('mt-0.5 h-5 w-5 shrink-0', active ? 'text-orange-500' : 'text-dark-100')} />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-x-2 font-semibold">
                    {flow.label}
                    <span
                      className={clsx(
                        'rounded-full px-2 py-0.5 text-[10px] uppercase',
                        flow.comingSoon ? 'bg-steel-750 text-dark-100' : 'bg-orange-500/20 text-orange-500'
                      )}
                    >
                      {flow.comingSoon ? 'Soon' : 'Live'}
                    </span>
                  </span>
                  <span className="block text-xs text-dark-100">{flow.tagline}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-steel-850 bg-steel-950 p-5 sm:p-6">
          <p className="font-medium">{activeFlow.summary}</p>
          <ol className="mt-5 space-y-4">
            {activeFlow.steps.map(step => (
              <li key={step.number} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 font-russo text-xs text-black">
                  {step.number}
                </span>
                <span>
                  <span className="font-semibold">{step.title}.</span>{' '}
                  <span className="text-dark-100">{step.description}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Rewards */}
      <section className="rounded-2xl border border-steel-850 bg-steel-950 p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <Gift className="h-7 w-7 text-orange-500" />
          <h2 className="font-russo text-2xl sm:text-3xl">Earn $L4VA rewards</h2>
        </div>
        <p className="mt-3 max-w-2xl text-dark-100">You earn $L4VA by creating vaults and taking part in them.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {rewardActivities.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-steel-750 bg-steel-850 px-4 py-2 text-sm"
            >
              <Icon className="h-4 w-4 text-orange-500" /> {label}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {rewardFacts.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl bg-steel-850 p-4">
              <p className="flex items-center gap-2 font-semibold">
                <Icon className="h-4 w-4 text-orange-500" /> {title}
              </p>
              <p className="mt-1 text-sm text-dark-100">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-steel-850 p-4 sm:p-5">
          <p className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-orange-500" /> Alignment bonus: up to +20%
          </p>
          <p className="mt-1 text-sm text-dark-100">
            Back the ecosystem and earn more on your protocol rewards. ORACLE is the token of the Oracle Vault, the
            first vault on L4VA, backed by &quot;Relics of Magma&quot; NFTs. VLRM is the L4VA community token.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {alignmentBonuses.map(({ action, bonus }) => (
              <li
                key={action}
                className="flex items-center justify-between gap-3 rounded-lg border border-steel-850 px-3 py-2 text-sm"
              >
                <span>{action}</span>
                <span className="font-semibold text-orange-500">{bonus}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-dark-100">Total bonus is capped at 20%.</p>
        </div>

        <Link
          to="/rewards"
          onClick={e => {
            // Same as the header: rewards need a connected wallet, so ask to connect instead.
            if (!isAuthenticated) {
              e.preventDefault();
              openModal('LoginModal');
            }
          }}
          className="mt-6 inline-flex items-center gap-1.5 font-semibold text-orange-500"
        >
          See your rewards <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
};

export const Route = createFileRoute('/how-it-works')({
  component: HowItWorks,
});
