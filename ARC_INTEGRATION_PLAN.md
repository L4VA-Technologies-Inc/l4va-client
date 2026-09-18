# Arc — план для l4va-client

Загальний контекст і факти про Arc: [../ARC_INTEGRATION.md](../ARC_INTEGRATION.md)

Позначки: `[ ]` не почато · `[~]` в роботі · `[x]` готово.

---

## F0. База (вибір мережі, логін, тема) — зроблено 2026-09-16

- [x] `ChainType.ARC`, `NetworkType` = `cardano | robinhood | arc`, у `useNetwork` з'явилися `isArc` / `isEvm`, `isEvmNetwork()`
- [x] `wagmi.config.ts`: `arcChain` (`VITE_ARC_NETWORK`, за замовчуванням testnet `5042002`), `evmChainByNetwork`
- [x] `useNetworkSwitcher`: спільний список мереж і валют для Header / MenuDrawer (на Arc тільки USD)
- [x] `LoginModal`, `useWalletChangeListener`: EVM-логін для будь-якої EVM-мережі
- [x] `ProfileModal`: нативний баланс активної мережі (USDC на Arc)
- [x] Тема `data-chain='arc'`, `icons/arc.svg`, `icons/l4va-arc.svg`, `favicon-arc.svg`, `?chain=arc`
- [x] `ChainBadge`, `explorer.utils.js`: Arc
- [x] Arc не показує Cardano-дані (2026-09-16):
  - токени: «No tokens on Arc yet»
  - створення vault'а (`/create`, `/create-ai`): `ArcVaultCreationGate` («coming soon»)
  - rewards: сторінки є, але порожні (`rewardsWalletAddress = null` на Arc), claim як EVM
  - FAQ / About / How it works: EVM-тексти з назвою Arc і USDC; фільтр vault'ів має Arc
- [ ] Перевірки на мережу конкретного vault'а (vault-profile, контриб'юшн, governance) і форма створення лишаються `robinhood`-only: Arc-vault'ів ще немає, робимо разом із контрактами
- [ ] Ручна перевірка логіну MetaMask на Arc testnet (додавання мережі в гаманець)

## F1. Рефакторинг під кілька EVM-мереж (без Arc)

### F1.1 Реєстр мереж
- [ ] `src/lib/evm/chains.ts`: реєстр EVM-мереж (viem `Chain` + метадані: `key`, `label`, `icon`, `brandColor`, `explorer`, `factoryAddress`, `nativeSymbol`, `swap`, `isTestnet`). Поки тільки Robinhood
- [ ] `src/lib/evm/wagmi.config.ts`: `chains` і `transports` будуються з реєстру
- [ ] env: `VITE_EVM_CHAINS=robinhood` + префіксовані змінні. `VITE_ROBINHOOD_*` і `VITE_EVM_VAULT_FACTORY_ADDRESS` лишаються як Robinhood-конфіг
- [ ] Хелпери `isEvmChain(chainType)`, `getChainConfig(chainType | chainId)`

### F1.2 Типи та мережа
- [x] `src/utils/types.ts`: `ChainType` + `ChainTypeLabels`
- [ ] `src/hooks/useNetwork.ts`: `NetworkType` виводиться з реєстру, `isEvm` замість / поруч із `isRobinHood`, фавікони з реєстру
- [ ] `src/utils/explorer.utils.js`: URL-и з реєстру (`/tx/`, `/address/`, `/token/`)
- [~] `src/components/shared/ChainBadge.tsx`: конфіг із реєстру (Arc додано)
- [ ] `src/lib/evm/blockscout.ts`: базовий URL з реєстру (explorer Arc, ймовірно, теж Blockscout — перевірити API)

### F1.3 Розгалуження `isRobinHood` / `ChainType.ROBINHOOD` → `isEvm`
Файли за кількістю входжень:
- [ ] `components/modals/LoginModal.jsx` (19)
- [ ] `components/shared/LavaWhitelistWithCaps.jsx` (15)
- [ ] `hooks/useCreateEvmVault.js`, `components/vaults/CreateVaultForm.jsx` (по 10)
- [ ] `pages/home/Faq.jsx` (9, тексти)
- [ ] `hooks/useWalletChangeListener.js`, `components/vaults/constants/vaults.constants.js`, `components/vault-profile/VaultTerminationRedeem.jsx` (по 8)
- [ ] `hooks/useEvmContributeTransaction.js`, `components/modals/ProfileModal.jsx` (по 7)
- [ ] `services/api/tokens/config.js`, `services/api/queries.ts`, `components/vaults/ai/useAiVaultBuilder.js` (по 6)
- [ ] `components/Header.jsx`, `MenuDrawer.jsx`, `hooks/useRewardsWalletConnection.js`, `hooks/useEvmRedeemTransaction.js`, `hooks/useEvmAcquireTransaction.js`, `components/vaults/steps/AcquireWindow.jsx` (по 5)
- [ ] решта: `AiVaultPreview`, `RewardsOverview`, `VaultSettings`, `VaultProfileView`, `AcquireModal`, `AssetsList/*`, `CreateProposalModal/*`, `VaultContributedAssets*`, `VaultGovernance`, `LaunchConfigureVault`, `AssetContribution/*`, `AlignmentBonusDisplay`, `ClaimButton`, `useLaunchVault`, `ProposalInfo*`, `RewardsInfoModal`, `FTItem`, `NFTItem`, `UniswapSwapPanel`, `VaultFiltersModal`, `LavaUploadZone`, `ContributeModal`, `TokenImage`, `useEvmGovernanceFee`, `VaultCreationTutorial`, `vaults.utils.js`, `aiVault.utils.js`, `AppCore.jsx`, `Footer.jsx`
- [ ] EVM-хуки (`useEvm*`, `useCreateEvmVault`) беруть `chainId` з vault і роблять `switchChain` перед транзакцією
- [ ] Правило: `ROBINHOOD` лишається лише для RH-специфіки (Uniswap-панель, RH-токени)

### F1.4 Перевірка
- [ ] Регрес Robinhood: логін, створення vault, внесок, acquire, governance, redeem, rewards claim

## F2. Arc testnet

### F2.1 Мережа та гаманець
- [x] `ChainType.ARC = 'arc'`, label `Arc`
- [~] (є `arcChain` у wagmi.config, реєстру ще немає) Arc у реєстрі: `arcTestnet` / `arc` з `viem/chains` (якщо є у нашій версії viem, інакше `defineChain`: `5042002`, `{ name: 'USDC', symbol: 'USDC', decimals: 18 }`)
- [~] `wallet_addEthereumChain` / `switchChain` для Arc: після логіну гаманець перемикається на вибрану мережу (LoginModal). Перед транзакціями — ще ні
- [x] `LoginModal`: вибір Arc, підключення EVM-гаманця

### F2.2 Відображення USDC
- [ ] **Один баланс USDC.** Нативний (18 dec) і ERC-20 `0x3600…` (6 dec) — один актив, не показувати двічі
- [ ] Нативна сума → USDC: ділити на 10¹² при переведенні в 6-знаковий формат. Ніде не хардкодити `18`/`ETH`, брати з реєстру
- [ ] Тексти «ETH» → `nativeSymbol` (контриб'юшн, газ, фі, acquire)
- [ ] Газ: показувати в USDC

### F2.3 UI і бренд
- [x] Іконка `src/icons/arc.svg`, фавікон `/favicon/favicon-arc.svg` (SVG, PNG-версій поки немає)
- [x] Тема `:root[data-chain='arc']` у `src/css/index.css` (за зразком `robinhood`, рядки ~73, 99, 161)
- [x] Перемикач мереж (Header / MenuDrawer): Cardano / Robinhood / Arc
- [x] `VaultFiltersModal`: фільтр Arc
- [~] FAQ / About / How it works: згадка Arc (tutorial створення — разом із контрактами)

### F2.4 Функціональні обмеження
- [ ] Governance: ховати `EvmSwapAction` / `UniswapSwapPanel`, якщо `chain.swap === 'none'`
- [ ] Whitelist-ассети в `LavaWhitelistWithCaps` / `AssetContribution`: список для Arc (рішення D2/D5)
- [x] Rewards на Arc: сторінки лишаються порожніми, claim заблоковано в API (D4)

### F2.5 Перевірка
- [ ] Повний сценарій на Arc testnet (див. API A3.6) через UI
- [ ] Мобільна верстка перемикача з трьома мережами

## F3. Mainnet
- [ ] Arc mainnet (`5042`) у реєстрі, env на проді
- [ ] Смоук на проді

## Журнал

| Дата | Що зроблено / знайдено |
|---|---|
| 2026-09-16 | План створено |
| 2026-09-16 | F0: база Arc (мережа, логін, тема). Збірка ок, скріншоти тем Arc/Robinhood перевірені |
| 2026-09-16 | Arc без Cardano-даних: токени, створення, rewards, тексти, фільтри |
