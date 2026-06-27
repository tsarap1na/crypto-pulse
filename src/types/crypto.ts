export type MarketCategory = 'Layer 1' | 'Layer 2' | 'DeFi' | 'All'

export type SortField = 'name' | 'price' | 'marketCap' | 'volume' | 'changePercent'
export type SortDirection = 'asc' | 'desc'

export type Timeframe = '24h' | '7d' | '30d'

export interface AssetConfig {
  id: string
  symbol: string
  name: string
  krakenPair: string
  krakenRestPair: string
  category: Exclude<MarketCategory, 'All'>
}

export interface AssetData {
  id: string
  rank: string
  symbol: string
  name: string
  priceUsd: number
  changePercent24Hr: number
  marketCapUsd: number
  volumeUsd24Hr: number
  category: Exclude<MarketCategory, 'All'>
  krakenPair: string
}

export interface LivePrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  timestamp: number
}

export interface HistoryPoint {
  priceUsd: number
  time: number
}

export interface CoinCapAsset {
  id: string
  rank: string
  symbol: string
  name: string
  priceUsd: string
  changePercent24Hr: string
  marketCapUsd: string
  volumeUsd24Hr: string
}

export interface CoinCapHistoryEntry {
  priceUsd: string
  time: number
}
