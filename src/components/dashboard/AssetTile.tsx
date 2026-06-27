import { useEffect, useState } from 'react'
import { fetchAssetHistory } from '../../services/marketData'
import type { AssetData, LivePrice } from '../../types/crypto'
import { formatCompact, formatPercent } from '../../utils/format'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { Sparkline } from './Sparkline'

interface AssetTileProps {
  asset: AssetData
  livePrice?: LivePrice
  isFavorite: boolean
  isSelected: boolean
  onToggleFavorite: (id: string) => void
  onSelect: (id: string) => void
  index: number
}

export function AssetTile({
  asset,
  livePrice,
  isFavorite,
  isSelected,
  onToggleFavorite,
  onSelect,
  index,
}: AssetTileProps) {
  const [sparkline, setSparkline] = useState<{ priceUsd: number; time: number }[]>([])

  const price = livePrice?.price ?? asset.priceUsd
  const changePercent = livePrice?.changePercent ?? asset.changePercent24Hr
  const isPositive = changePercent >= 0

  useEffect(() => {
    fetchAssetHistory(asset.id, '24h')
      .then(setSparkline)
      .catch(() => setSparkline([]))
  }, [asset.id])

  return (
    <article
      className={`animate-fade-in cursor-pointer rounded-xl border bg-[var(--color-surface-elevated)] p-4 transition hover:shadow-lg ${
        isSelected
          ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/30'
          : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
      }`}
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
      onClick={() => onSelect(asset.id)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(asset.id)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${asset.name} price ${price}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-xs font-bold text-[var(--color-accent)]">
              {asset.symbol.slice(0, 2)}
            </span>
            <div className="text-left">
              <h3 className="font-semibold leading-tight">{asset.name}</h3>
              <p className="text-xs text-[var(--color-muted)]">{asset.symbol}</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(asset.id)
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="rounded-full p-1.5 transition hover:bg-amber-500/10"
        >
          <svg
            className={`h-5 w-5 ${isFavorite ? 'text-amber-500' : 'text-[var(--color-muted)]'}`}
            fill={isFavorite ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      </div>

      <div className="mt-3 text-left">
        <AnimatedNumber value={price} className="text-2xl font-bold" />
        <p
          className={`mt-1 text-sm font-medium ${isPositive ? 'text-[var(--color-up)]' : 'text-[var(--color-down)]'}`}
        >
          {formatPercent(changePercent)}
        </p>
      </div>

      <div className="mt-3">
        <Sparkline data={sparkline} positive={isPositive} />
      </div>

      <div className="mt-3 flex justify-between text-xs text-[var(--color-muted)]">
        <span>Mkt Cap {formatCompact(asset.marketCapUsd)}</span>
        <span>Vol {formatCompact(asset.volumeUsd24Hr)}</span>
      </div>

      <span className="mt-2 inline-block rounded-full bg-[var(--color-accent)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent)]">
        {asset.category}
      </span>
    </article>
  )
}
