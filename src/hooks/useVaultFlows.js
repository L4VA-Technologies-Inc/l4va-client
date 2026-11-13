import { Boxes, Coins, Layers, PieChart } from 'lucide-react';

import { useNetwork } from '@/hooks/useNetwork';

/**
 * Vault types and their step-by-step flows, shared by the home page and /how-it-works.
 */
export const useVaultFlows = () => {
  const { isRobinHood } = useNetwork();
  // Each vault type is explained as its own short flow. Availability is per chain: Robinhood runs
  // Index Vaults only, Cardano runs everything except Index Vaults.
  const payAsset = isRobinHood ? 'ETH' : 'ADA';
  return [
    {
      id: 'index',
      label: 'Index Vault',
      comingSoon: !isRobinHood,
      tagline: 'A basket in one token',
      icon: PieChart,
      summary: `One token for a basket of assets, bought for you with ${payAsset}.`,
      steps: [
        {
          number: 1,
          title: 'Create',
          description: `Pick the assets for the basket and their target weights, e.g. 60% A, 30% B, 10% ${payAsset} reserve.`,
        },
        {
          number: 2,
          title: 'Acquire',
          description: `During the acquire window anyone can send ${payAsset} to the Vault. Your share of the ${payAsset} is your share of the Vault.`,
        },
        {
          number: 3,
          title: 'Lock & Buy',
          description: `When the window closes the Vault buys the basket on ${isRobinHood ? 'Uniswap' : 'a DEX'} and Vault Tokens land in your wallet automatically.`,
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
      label: 'Acquisition Fund',
      comingSoon: isRobinHood,
      tagline: `Raise ${payAsset} together`,
      icon: Coins,
      summary: `Raise ${payAsset} from the community around a thesis, then govern how it is used.`,
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
          description: `Participants send ${payAsset} and receive Vault Tokens in proportion to what they sent.`,
        },
        {
          number: 3,
          title: 'Lock',
          description:
            'If the minimum is met the Vault locks and tokens are distributed. If not, everyone is refunded automatically.',
        },
        {
          number: 4,
          title: 'Govern & Buy',
          description: `Holders propose and vote on which assets the Vault buys with the raised ${payAsset}.`,
        },
      ],
    },
    {
      id: 'contribute-only',
      label: 'Pooled Assets',
      comingSoon: isRobinHood,
      tagline: 'Pool assets, share ownership',
      icon: Boxes,
      summary: `Holders pool their tokenized assets into one Vault and own it together. No ${payAsset} raise.`,
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
      comingSoon: isRobinHood,
      tagline: `Bring assets, get ${payAsset}`,
      icon: Layers,
      summary: `Turn tokenized assets you hold into a shared, tradable Vault and get ${payAsset} for part of it.`,
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
          description: `Others send ${payAsset} during the acquire window for the share of Vault Tokens on offer.`,
        },
        {
          number: 4,
          title: 'Lock',
          description: `If the raise meets its minimum the Vault locks: contributors get Vault Tokens plus the ${payAsset}, acquirers get their tokens. If not, everything is returned.`,
        },
        {
          number: 5,
          title: 'Govern',
          description: 'All holders, contributors and acquirers alike, govern the Vault and its assets together.',
        },
      ],
    },
  ];
};
