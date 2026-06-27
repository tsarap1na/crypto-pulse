import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '../../hooks/useTheme'
import type { HistoryPoint, Timeframe } from '../../types/crypto'
import { formatPrice, formatTime } from '../../utils/format'
import { ChartSkeleton } from '../ui/Skeleton'
import { ErrorState } from '../ui/ErrorState'

interface PriceChartProps {
  assetName: string
  symbol: string
  data: HistoryPoint[]
  loading: boolean
  error: string | null
  timeframe: Timeframe
  onTimeframeChange: (tf: Timeframe) => void
  onRetry: () => void
}

const TIMEFRAMES: Timeframe[] = ['24h', '7d', '30d']

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: HistoryPoint }>
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 shadow-lg">
      <p className="text-xs text-[var(--color-muted)]">{formatTime(point.time)}</p>
      <p className="font-mono text-sm font-semibold">{formatPrice(point.priceUsd)}</p>
    </div>
  )
}

export function PriceChart({
  assetName,
  symbol,
  data,
  loading,
  error,
  timeframe,
  onTimeframeChange,
  onRetry,
}: PriceChartProps) {
  const { isDark } = useTheme()

  const chartData = useMemo(
    () => data.map((d) => ({ ...d, label: formatTime(d.time) })),
    [data],
  )

  const isPositive = useMemo(() => {
    if (data.length < 2) return true
    return data[data.length - 1].priceUsd >= data[0].priceUsd
  }, [data])

  const strokeColor = isPositive ? '#10b981' : '#ef4444'
  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  if (loading) return <ChartSkeleton />
  if (error) return <ErrorState message={error} onRetry={onRetry} />

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {assetName}{' '}
            <span className="text-[var(--color-muted)]">({symbol})</span>
          </h2>
          <p className="text-xs text-[var(--color-muted)]">Price history</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-[var(--color-border)] p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => onTimeframeChange(tf)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                timeframe === tf
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'hover:bg-[var(--color-border)]/50'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {!chartData.length ? (
        <div className="flex h-64 items-center justify-center text-sm text-[var(--color-muted)]">
          No chart data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="time"
              tickFormatter={(t) =>
                new Date(t as number).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  ...(timeframe === '24h' ? { hour: '2-digit' } : {}),
                })
              }
              tick={{ fill: textColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
              tick={{ fill: textColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={70}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="priceUsd"
              stroke={strokeColor}
              strokeWidth={2}
              fill="url(#priceGradient)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
