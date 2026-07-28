// Blockscout REST client for the Robinhood Chain explorer.
//
// EVM wallets (and wagmi) cannot enumerate the tokens an address holds — there
// is no on-chain "wallet → its tokens" index. Blockscout builds that index off
// Transfer logs and exposes it, so we use it as the enumeration source. The
// wallet address itself still comes from wagmi (`useAccount`).

const BLOCKSCOUT_URL = import.meta.env.VITE_ROBINHOOD_BLOCKSCOUT_URL;

// Safety cap so a paginating wallet with thousands of tokens can't loop forever.
const MAX_PAGES = 10;

interface BlockscoutTokenRaw {
  address?: string;
  address_hash?: string;
  name?: string | null;
  symbol?: string | null;
  type?: string; // 'ERC-20' | 'ERC-721' | 'ERC-1155'
  decimals?: string | null;
  // Blockscout's own scam/reputation signal ('ok' | 'scam' | ...); the closest
  // thing to third-party token verification available on Robinhood Chain.
  reputation?: string | null;
  holders_count?: string | null;
}

interface BlockscoutTokenBalanceRaw {
  token?: BlockscoutTokenRaw;
  /** Raw balance in base units (ERC-20) or aggregate count (ERC-721/1155). */
  value?: string | null;
  token_id?: string | null;
}

interface BlockscoutTokensResponse {
  items?: BlockscoutTokenBalanceRaw[];
  next_page_params?: Record<string, unknown> | null;
}

export interface BlockscoutWalletToken {
  address: string;
  name: string;
  symbol: string;
  type: string;
  decimals: number | null;
  /** Raw value as returned by Blockscout (base units for ERC-20). */
  value: string;
  /** True when Blockscout's reputation signal for this token is 'ok'. */
  isVerified: boolean;
  holders: number | null;
}

const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

const normalizeToken = (token: BlockscoutTokenRaw, fallbackAddress: string, value = '0'): BlockscoutWalletToken => ({
  address: token.address ?? token.address_hash ?? fallbackAddress,
  name: token.name ?? '',
  symbol: token.symbol ?? '',
  type: token.type ?? '',
  decimals: token.decimals != null && token.decimals !== '' ? Number(token.decimals) : null,
  value,
  isVerified: token.reputation === 'ok',
  holders: token.holders_count != null ? Number(token.holders_count) : null,
});

/**
 * Fetch every ERC-20 / ERC-721 / ERC-1155 token the given address holds,
 * following Blockscout's cursor pagination up to {@link MAX_PAGES}.
 */
export const fetchWalletTokens = async (address: string): Promise<BlockscoutWalletToken[]> => {
  if (!BLOCKSCOUT_URL) {
    console.error('VITE_ROBINHOOD_BLOCKSCOUT_URL is not set; cannot fetch EVM wallet tokens');
    return [];
  }

  const base = normalizeBaseUrl(BLOCKSCOUT_URL);
  const tokens: BlockscoutWalletToken[] = [];
  let nextPageParams: Record<string, unknown> | null = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const params = new URLSearchParams({ type: 'ERC-20,ERC-721,ERC-1155' });
    if (nextPageParams) {
      Object.entries(nextPageParams).forEach(([key, val]) => {
        if (val != null) params.set(key, String(val));
      });
    }

    const response = await fetch(`${base}/api/v2/addresses/${address}/tokens?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Blockscout responded ${response.status}`);
    }

    const data: BlockscoutTokensResponse = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];

    items.forEach(item => {
      const token = item.token ?? {};
      const contract = token.address ?? token.address_hash;
      if (!contract) return;
      tokens.push(normalizeToken(token, contract, item.value ?? '0'));
    });

    if (!data.next_page_params) break;
    nextPageParams = data.next_page_params;
  }

  return tokens;
};

/**
 * Resolve metadata for a single token contract regardless of whether the
 * connected wallet holds it. Used to show a ticker/name for manually pasted
 * contract addresses that don't show up in {@link fetchWalletTokens}.
 */
export const fetchTokenMetadata = async (address: string): Promise<BlockscoutWalletToken | null> => {
  if (!BLOCKSCOUT_URL) {
    console.error('VITE_ROBINHOOD_BLOCKSCOUT_URL is not set; cannot fetch EVM token metadata');
    return null;
  }

  const base = normalizeBaseUrl(BLOCKSCOUT_URL);

  try {
    const response = await fetch(`${base}/api/v2/tokens/${address}`);
    if (!response.ok) return null;

    const token: BlockscoutTokenRaw = await response.json();
    return normalizeToken(token, address);
  } catch {
    return null;
  }
};

/**
 * Search tokens indexed chain-wide by Blockscout (not scoped to any wallet),
 * so the vault-creation whitelist can surface assets the creator doesn't hold —
 * e.g. popular/verified tokens on Robinhood Chain. An empty query returns
 * Blockscout's default listing, which is sorted by holder count.
 */
export const searchTokens = async (query = ''): Promise<BlockscoutWalletToken[]> => {
  if (!BLOCKSCOUT_URL) {
    console.error('VITE_ROBINHOOD_BLOCKSCOUT_URL is not set; cannot search EVM tokens');
    return [];
  }

  const base = normalizeBaseUrl(BLOCKSCOUT_URL);
  const params = new URLSearchParams();
  if (query) params.set('q', query);

  const response = await fetch(`${base}/api/v2/tokens?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Blockscout responded ${response.status}`);
  }

  const data: BlockscoutTokensResponse = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];

  return items
    .map(item => {
      // The search endpoint returns bare token objects, not { token, value } rows.
      const token = (item.token ?? item) as BlockscoutTokenRaw;
      const contract = token.address ?? token.address_hash;
      return contract ? normalizeToken(token, contract) : null;
    })
    .filter((token): token is BlockscoutWalletToken => token !== null);
};
