import { Line, LineChart, ResponsiveContainer } from 'recharts'
import type { HistoryPoint } from '../../types/crypto'

interface SparklineProps {
  data: HistoryPoint[]
  positive: boolean
}

export function Sparkline({ data, positive }: SparklineProps) {
  if (!data.length) {
    return <div className="h-12 w-full rounded bg-[var(--color-border)]/30" />
  }

  const color = positive ? '#10b981' : '#ef4444'

  return (
    <ResponsiveContainer width="100%" height={48}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="priceUsd"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
