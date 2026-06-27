import type { MarketCategory, SortDirection, SortField } from '../../types/crypto'

interface SortControlsProps {
  sortField: SortField
  sortDirection: SortDirection
  onSortFieldChange: (field: SortField) => void
  onSortDirectionChange: (direction: SortDirection) => void
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'marketCap', label: 'Market Cap' },
  { value: 'volume', label: 'Volume' },
  { value: 'changePercent', label: '24h Change' },
]

interface FilterBarProps {
  category: MarketCategory
  onCategoryChange: (category: MarketCategory) => void
  favoritesOnly: boolean
  onFavoritesOnlyChange: (value: boolean) => void
}

const CATEGORIES: MarketCategory[] = ['All', 'Layer 1', 'Layer 2', 'DeFi']

export function SortControls({
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
}: SortControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        Sort
      </label>
      <select
        value={sortField}
        onChange={(e) => onSortFieldChange(e.target.value as SortField)}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        aria-label="Sort field"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm transition hover:border-[var(--color-accent)]"
        aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
      >
        {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
      </button>
    </div>
  )
}

export function FilterBar({
  category,
  onCategoryChange,
  favoritesOnly,
  onFavoritesOnlyChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        Filter
      </label>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              category === cat
                ? 'bg-[var(--color-accent)] text-white'
                : 'border border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-accent)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
          favoritesOnly
            ? 'bg-amber-500 text-white'
            : 'border border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:border-amber-500'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill={favoritesOnly ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        Favorites
      </button>
    </div>
  )
}
