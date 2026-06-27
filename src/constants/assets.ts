import type { AssetConfig } from '../types/crypto'

export const TRACKED_ASSETS: AssetConfig[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', krakenPair: 'BTC/USD', krakenRestPair: 'XBTUSD', category: 'Layer 1' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', krakenPair: 'ETH/USD', krakenRestPair: 'ETHUSD', category: 'Layer 1' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', krakenPair: 'SOL/USD', krakenRestPair: 'SOLUSD', category: 'Layer 1' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', krakenPair: 'ADA/USD', krakenRestPair: 'ADAUSD', category: 'Layer 1' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', krakenPair: 'DOT/USD', krakenRestPair: 'DOTUSD', category: 'Layer 1' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', krakenPair: 'AVAX/USD', krakenRestPair: 'AVAXUSD', category: 'Layer 1' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', krakenPair: 'LINK/USD', krakenRestPair: 'LINKUSD', category: 'DeFi' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap', krakenPair: 'UNI/USD', krakenRestPair: 'UNIUSD', category: 'DeFi' },
  { id: 'aave', symbol: 'AAVE', name: 'Aave', krakenPair: 'AAVE/USD', krakenRestPair: 'AAVEUSD', category: 'DeFi' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon', krakenPair: 'MATIC/USD', krakenRestPair: 'MATICUSD', category: 'Layer 2' },
]

export const KRAKEN_PAIRS = TRACKED_ASSETS.map((a) => a.krakenPair)

export const ASSET_BY_ID = Object.fromEntries(TRACKED_ASSETS.map((a) => [a.id, a]))
export const ASSET_BY_PAIR = Object.fromEntries(TRACKED_ASSETS.map((a) => [a.krakenPair, a]))
