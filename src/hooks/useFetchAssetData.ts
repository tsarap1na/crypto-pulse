import { useCallback, useEffect, useState } from 'react'
import { buildFallbackAssets, fetchAssets } from '../services/marketData'
import type { AssetData } from '../types/crypto'

export interface UseFetchAssetDataResult {
  assets: AssetData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useFetchAssetData(refreshInterval = 60_000): UseFetchAssetDataResult {
  const [assets, setAssets] = useState<AssetData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchAssets()
      setAssets(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load assets'
      setError(message)
      setAssets((prev) => (prev.length ? prev : buildFallbackAssets()))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, refreshInterval)
    return () => clearInterval(interval)
  }, [load, refreshInterval])

  return { assets, loading, error, refetch: load }
}
