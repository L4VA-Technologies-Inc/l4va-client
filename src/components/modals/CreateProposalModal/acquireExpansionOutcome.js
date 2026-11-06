const formatCount = n =>
  n >= 1
    ? n.toLocaleString('en', { maximumFractionDigits: 2 })
    : new Intl.NumberFormat('en', { maximumSignificantDigits: 4 }).format(n);

const formatDuration = ms => {
  if (!ms) return null;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return [d ? `${d} day${d === 1 ? '' : 's'}` : null, h ? `${h} h` : null].filter(Boolean).join(' ') || 'under an hour';
};

/** Robinhood acquire expansion, step by step, from the values entered so far (also used on the proposal page). */
export function buildEvmOutcome({ duration, maxEth, noMax, price, supply, ticker }) {
  const durationText = formatDuration(duration);
  const vt = ticker || 'VT';
  const newVtAtMax = !noMax && maxEth > 0 && price > 0 ? maxEth * price : null;
  const dilutionPct = newVtAtMax && supply > 0 ? (newVtAtMax / (supply + newVtAtMax)) * 100 : null;

  const steps = [
    {
      title: durationText ? `The vault opens for ${durationText}.` : 'The vault opens for the set duration.',
      detail: 'The window starts when the vote passes. It ends at that time, or earlier if the ETH maximum is reached.',
    },
    {
      title: price > 0 ? `Buyers get ${formatCount(price)} ${vt} per 1 ETH.` : 'Buyers get VT at the limit price.',
      detail: 'Anyone can send ETH while the window is open. The price is fixed by this proposal.',
    },
    {
      title: !noMax && maxEth > 0 ? `At most ${formatCount(maxEth)} ETH is accepted.` : 'No ETH maximum.',
      detail:
        !noMax && maxEth > 0
          ? 'Contributions that would go over it are refused. Once it is reached, the window closes ' +
            'within minutes (at most ~15 minutes, while started contributions finish) and the new VT is minted to buyers.'
          : 'The window takes any amount of ETH until it ends.',
    },
    {
      title: 'Current holders are diluted.',
      detail:
        newVtAtMax != null
          ? `If the maximum is reached, ${formatCount(newVtAtMax)} new ${vt} are minted` +
            (dilutionPct != null ? `, about ${formatCount(dilutionPct)}% of the supply after the raise.` : '.') +
            ' The ETH raised stays in the vault.'
          : `New ${vt} is minted for every ETH raised. The ETH raised stays in the vault.`,
    },
  ];
  const summary =
    price > 0 && !noMax && maxEth > 0
      ? `Sells up to ${formatCount(newVtAtMax)} new ${vt} at ${formatCount(price)} ${vt}/ETH for up to ${formatCount(maxEth)} ETH${durationText ? ` over ${durationText}` : ''}.`
      : `Opens the vault to buyers at a fixed ${vt}/ETH price${durationText ? ` for ${durationText}` : ''}.`;
  return { steps, summary };
}
