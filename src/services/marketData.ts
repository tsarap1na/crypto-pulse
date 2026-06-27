import { TRACKED_ASSETS } from '../constants/assets'
import type { AssetData, CoinCapAsset, CoinCapHistoryEntry, HistoryPoint, Timeframe } from '../types/crypto'
import { getCachedHistory, setCachedHistory } from '../utils/cache'
import { fetchAssetsFromKraken, fetchHistoryFromKraken } from './kraken'

const COINCAP_URL = '/api/coincap/v2'
const COINCAP_TIMEOUT_MS = 2500
const COINCAP_PROBE_TIMEOUT_MS = 1500

const TIMEFRAME_PARAMS: Record<Timeframe, { interval: string }> = {
  '24h': { interval: 'm15' },
  '7d': { interval: 'h1' },
  '30d': { interval: 'h6' },
}

type CoinCapStatus = 'unknown' | 'available' | 'unavailable'

let coinCapStatus: CoinCapStatus =
  import.meta.env.VITE_USE_COINCAP === 'false' ? 'unavailable' : 'unknown'

let coinCapProbe: Promise<boolean> | null = null

function getTimeRange(timeframe: Timeframe): { start: number; end: number } {
  const end = Date.now()
  const ranges: Record<Timeframe, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  }
  return { start: end - ranges[timeframe], end }
}

async function fetchCoinCapJson<T>(url: string, timeoutMs = COINCAP_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`CoinCap API error: ${response.status}`)
    }
    return (await response.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

async function probeCoinCap(): Promise<boolean> {
  try {
    await fetchCoinCapJson<{ data: unknown[] }>(
      `${COINCAP_URL}/assets?ids=bitcoin`,
      COINCAP_PROBE_TIMEOUT_MS,
    )
    coinCapStatus = 'available'
    return true
  } catch {
    coinCapStatus = 'unavailable'
    return false
  }
}

/** Single shared probe — all requests wait on this before hitting CoinCap. */
async function isCoinCapAvailable(): Promise<boolean> {
  if (coinCapStatus === 'available') return true
  if (coinCapStatus === 'unavailable') return false

  coinCapProbe ??= probeCoinCap()
  return coinCapProbe
}

async function fetchAssetsFromCoinCap(): Promise<AssetData[]> {
  const ids = TRACKED_ASSETS.map((a) => a.id).join(',')
  const data = await fetchCoinCapJson<{ data: CoinCapAsset[] }>(`${COINCAP_URL}/assets?ids=${ids}`)
  const configById = Object.fromEntries(TRACKED_ASSETS.map((a) => [a.id, a]))

  return data.data.map((asset) => {
    const config = configById[asset.id]
    return {
      id: asset.id,
      rank: asset.rank,
      symbol: asset.symbol,
      name: asset.name,
      priceUsd: parseFloat(asset.priceUsd),
      changePercent24Hr: parseFloat(asset.changePercent24Hr),
      marketCapUsd: parseFloat(asset.marketCapUsd),
      volumeUsd24Hr: parseFloat(asset.volumeUsd24Hr),
      category: config?.category ?? 'Layer 1',
      krakenPair: config?.krakenPair ?? `${asset.symbol}/USD`,
    }
  })
}

async function fetchHistoryFromCoinCap(assetId: string, timeframe: Timeframe): Promise<HistoryPoint[]> {
  const cached = getCachedHistory(assetId, timeframe)
  if (cached) return cached

  const { interval } = TIMEFRAME_PARAMS[timeframe]
  const { start, end } = getTimeRange(timeframe)
  const url = `${COINCAP_URL}/assets/${assetId}/history?interval=${interval}&start=${start}&end=${end}`
  const data = await fetchCoinCapJson<{ data: CoinCapHistoryEntry[] }>(url)

  const points: HistoryPoint[] = data.data.map((entry) => ({
    priceUsd: parseFloat(entry.priceUsd),
    time: entry.time,
  }))

  setCachedHistory(assetId, timeframe, points)
  return points
}

export async function fetchAssets(): Promise<AssetData[]> {
  if (await isCoinCapAvailable()) {
    try {
      return await fetchAssetsFromCoinCap()
    } catch {
      coinCapStatus = 'unavailable'
    }
  }

  try {
    return await fetchAssetsFromKraken()
  } catch {
    return buildFallbackAssets()
  }
}

export async function fetchAssetHistory(assetId: string, timeframe: Timeframe): Promise<HistoryPoint[]> {
  if (await isCoinCapAvailable()) {
    try {
      return await fetchHistoryFromCoinCap(assetId, timeframe)
    } catch {
      coinCapStatus = 'unavailable'
    }
  }

  return fetchHistoryFromKraken(assetId, timeframe)
}

export function buildFallbackAssets(): AssetData[] {
  return TRACKED_ASSETS.map((asset, index) => ({
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
  }))
}

export { fetchAssetsFromKraken, fetchHistoryFromKraken } from './kraken'
