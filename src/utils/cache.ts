import type { HistoryPoint, Timeframe } from '../types/crypto'

const historyCache = new Map<string, HistoryPoint[]>()

export function getCachedHistory(assetId: string, timeframe: Timeframe): HistoryPoint[] | undefined {
  return historyCache.get(`${assetId}:${timeframe}`)
}

export function setCachedHistory(assetId: string, timeframe: Timeframe, data: HistoryPoint[]): void {
  historyCache.set(`${assetId}:${timeframe}`, data)
}

export function clearHistoryCache(): void {
  historyCache.clear()
}
