import { useCallback, useEffect, useRef, useState } from 'react'
import { KRAKEN_PAIRS, ASSET_BY_PAIR } from '../constants/assets'
import type { LivePrice } from '../types/crypto'

const WS_URL = 'wss://ws.kraken.com/v2'
const RECONNECT_DELAY = 3000

interface KrakenTickerMessage {
  channel: string
  type: string
  data?: Array<{
    symbol: string
    last: number
    change: number
    change_pct: number
    volume: number
    high: number
    low: number
  }>
}

export interface UseWebSocketPricesResult {
  prices: Record<string, LivePrice>
  connected: boolean
  error: string | null
  reconnect: () => void
}

export function useWebSocketPrices(): UseWebSocketPricesResult {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({})
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        if (!mountedRef.current) return
        setConnected(true)
        setError(null)
        ws.send(
          JSON.stringify({
            method: 'subscribe',
            params: { channel: 'ticker', symbol: KRAKEN_PAIRS },
          }),
        )
      }

      ws.onmessage = (event) => {
        if (!mountedRef.current) return
        try {
          const msg = JSON.parse(event.data as string) as KrakenTickerMessage
          if (msg.channel !== 'ticker' || !msg.data) return

          setPrices((prev) => {
            const next = { ...prev }
            for (const tick of msg.data!) {
              const asset = ASSET_BY_PAIR[tick.symbol]
              if (!asset) continue
              next[asset.id] = {
                symbol: asset.symbol,
                price: tick.last,
                change: tick.change,
                changePercent: tick.change_pct * 100,
                volume: tick.volume,
                high: tick.high,
                low: tick.low,
                timestamp: Date.now(),
              }
            }
            return next
          })
        } catch {
          /* ignore malformed messages */
        }
      }

      ws.onerror = () => {
        if (!mountedRef.current) return
        setError('WebSocket connection error')
        setConnected(false)
      }

      ws.onclose = () => {
        if (!mountedRef.current) return
        setConnected(false)
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    }
  }, [])

  const reconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    connect()
  }, [connect])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { prices, connected, error, reconnect }
}
