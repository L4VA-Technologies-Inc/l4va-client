export class TapToolsConfigProvider {
  static getWalletAssetAmount(assetId, address) {
    return `/api/v1/taptools/assets/${assetId}?address=${address}`;
  }

  static getWalletPolicyIds(address, excludeFts) {
    return `/api/v1/taptools/wallet-policies?address=${address}&excludeFts=${excludeFts}`;
  }

  static getWalletSummaryPaginated() {
    return `/api/v1/taptools/summary`;
  }
}
