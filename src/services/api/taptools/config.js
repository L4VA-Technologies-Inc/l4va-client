export class TapToolsConfigProvider {
  static getWalletSummary(address) {
    return `/api/v1/taptools/summary?address=${address}`;
  }
}