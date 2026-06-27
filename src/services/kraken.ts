import { TRACKED_ASSETS } from '../constants/assets'
import type { AssetData, HistoryPoint, Timeframe } from '../types/crypto'
import { getCachedHistory, setCachedHistory } from '../utils/cache'

const BASE_URL = 'https://api.kraken.com/0/public'

/** Approximate circulating supply for market-cap estimates when CoinCap is unavailable. */
const APPROX_SUPPLY: Record<string, number> = {
  bitcoin: 19_800_000,
  ethereum: 120_000_000,
  solana: 580_000_000,
  cardano: 36_000_000_000,
  polkadot: 1_400_000_000,
  'avalanche-2': 410_000_000,
  chainlink: 620_000_000,
  uniswap: 600_000_000,
  aave: 15_000_000,
  'matic-network': 9_900_000_000,
}

const KRAKEN_TICKER_KEYS: Record<string, string> = {
  bitcoin: 'XXBTZUSD',
  ethereum: 'XETHZUSD',
  solana: 'SOLUSD',
  cardano: 'ADAUSD',
  polkadot: 'DOTUSD',
  'avalanche-2': 'AVAXUSD',
  chainlink: 'LINKUSD',
  uniswap: 'UNIUSD',
  aave: 'AAVEUSD',
  'matic-network': 'MATICUSD',
}

const KRAKEN_REST_PAIRS = TRACKED_ASSETS.map((a) => a.krakenRestPair).join(',')

interface KrakenTickerEntry {
  c: [string, string]
  v: [string, string]
  o: string
}

interface KrakenTickerResponse {
  error: string[]
  result: Record<string, KrakenTickerEntry>
}

type OhlcCandle = [number, string, string, string, string, string, string, number]

interface KrakenOhlcResponse {
  error: string[]
  result: Record<string, OhlcCandle[]>
}

const OHLC_CONFIG: Record<Timeframe, { interval: number; sinceMs: number }> = {
  '24h': { interval: 60, sinceMs: 24 * 60 * 60 * 1000 },
  '7d': { interval: 240, sinceMs: 7 * 24 * 60 * 60 * 1000 },
  '30d': { interval: 1440, sinceMs: 30 * 24 * 60 * 60 * 1000 },
}

async function fetchKrakenJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Kraken API error: ${response.status}`)
  }
  const data = (await response.json()) as T & { error?: string[] }
  if (data.error?.length) {
    throw new Error(data.error.join(', '))
  }
  return data
}

export async function fetchAssetsFromKraken(): Promise<AssetData[]> {
  const data = await fetchKrakenJson<KrakenTickerResponse>(
    `${BASE_URL}/Ticker?pair=${KRAKEN_REST_PAIRS}`,
  )

  return TRACKED_ASSETS.map((asset, index) => {
    const key = KRAKEN_TICKER_KEYS[asset.id]
    const tick = data.result[key]

    if (!tick) {
      return {
        id: asset.id,
        rank: String(index + 1),
        symbol: asset.symbol,
        name: asset.name,
        priceUsd: 0,
        changePercent24Hr: 0,
        marketCapUsd: 0,
        volumeUsd24Hr: 0,
        category: asset.category,
        krakenPair: asset.krakenPair,
      }
    }

    const price = parseFloat(tick.c[0])
    const open = parseFloat(tick.o)
    const volumeBase = parseFloat(tick.v[1])
    const supply = APPROX_SUPPLY[asset.id] ?? 0

    return {
      id: asset.id,
      rank: String(index + 1),
      symbol: asset.symbol,
      name: asset.name,
      priceUsd: price,
      changePercent24Hr: open > 0 ? ((price - open) / open) * 100 : 0,
      marketCapUsd: supply > 0 ? price * supply : 0,
      volumeUsd24Hr: volumeBase * price,
      category: asset.category,
      krakenPair: asset.krakenPair,
    }
  })
}

export async function fetchHistoryFromKraken(
  assetId: string,
  timeframe: Timeframe,
): Promise<HistoryPoint[]> {
  const cached = getCachedHistory(assetId, timeframe)
  if (cached) return cached

  const asset = TRACKED_ASSETS.find((a) => a.id === assetId)
  if (!asset) throw new Error(`Unknown asset: ${assetId}`)

  const { interval, sinceMs } = OHLC_CONFIG[timeframe]
  const since = Math.floor((Date.now() - sinceMs) / 1000)

  const data = await fetchKrakenJson<KrakenOhlcResponse>(
    `${BASE_URL}/OHLC?pair=${asset.krakenRestPair}&interval=${interval}&since=${since}`,
  )

  const key = KRAKEN_TICKER_KEYS[assetId]
  const raw = data.result[key]
  const candles = Array.isArray(raw)
    ? raw
    : (Object.entries(data.result).find(([k, v]) => k !== 'last' && Array.isArray(v))?.[1] as
        | OhlcCandle[]
        | undefined)

  if (!candles?.length) {
    throw new Error('No OHLC data returned')
  }

  const points: HistoryPoint[] = candles.map((candle) => ({
    time: candle[0] * 1000,
    priceUsd: parseFloat(candle[4]),
  }))

  setCachedHistory(assetId, timeframe, points)
  return points
}
