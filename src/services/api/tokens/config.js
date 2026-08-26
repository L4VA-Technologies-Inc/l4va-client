export class TokensConfigProvider {
  static getMemecoins() {
    return '/api/v1/tokens/memecoins';
  }

  static getMemecoin(id) {
    return `/api/v1/tokens/memecoins/${id}`;
  }

  static getMemecoinOhlc(id) {
    return `/api/v1/tokens/memecoins/${id}/ohlc`;
  }

  static getCardanoMemecoins() {
    return '/api/v1/tokens/cardano/memecoins';
  }

  static getCardanoMemecoin(id) {
    return `/api/v1/tokens/cardano/${id}`;
  }

  static getCardanoMemecoinOhlc(id) {
    return `/api/v1/tokens/cardano/${id}/ohlc`;
  }

  static getRobinhoodMemecoins() {
    return '/api/v1/tokens/robinhood/memecoins';
  }

  static getRobinhoodRwas() {
    return '/api/v1/tokens/robinhood/rwas';
  }

  static getRobinhoodNfts() {
    return '/api/v1/tokens/robinhood/nfts';
  }

  static getRobinhoodToken(address) {
    return `/api/v1/tokens/robinhood/${address}`;
  }

  static getRobinhoodTokenOhlc(address) {
    return `/api/v1/tokens/robinhood/${address}/ohlc`;
  }

  static getRobinhoodTokenTrades(address) {
    return `/api/v1/tokens/robinhood/${address}/trades`;
  }
}
