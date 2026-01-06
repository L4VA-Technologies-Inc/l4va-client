export class TapToolsConfigProvider {
  static getWalletAssetAmount(assetId, address) {
    return `/api/v1/taptools/assets/${assetId}?address=${address}`;
  }

  static getWalletSummaryPaginated() {
    return `/api/v1/taptools/summary`;
  }
}
