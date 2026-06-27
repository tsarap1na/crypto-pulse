import { useCallback, useEffect, useState } from 'react'
import { fetchAssetHistory } from '../services/marketData'
import type { HistoryPoint, Timeframe } from '../types/crypto'

export interface UseAssetHistoryResult {
  data: HistoryPoint[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAssetHistory(assetId: string | null, timeframe: Timeframe): UseAssetHistoryResult {
  const [data, setData] = useState<HistoryPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!assetId) {
      setData([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const history = await fetchAssetHistory(assetId, timeframe)
      setData(history)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [assetId, timeframe])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, refetch: load }
}
