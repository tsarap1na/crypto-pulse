import { useMemo, useState } from 'react'
import { AssetTile } from './components/dashboard/AssetTile'
import { PriceChart } from './components/dashboard/PriceChart'
import { Header } from './components/layout/Header'
import { Layout } from './components/layout/Layout'
import { FilterBar, SortControls } from './components/ui/FilterBar'
import { SearchBar } from './components/ui/SearchBar'
import { AssetTileSkeleton } from './components/ui/Skeleton'
import { ErrorState } from './components/ui/ErrorState'
import { useAssetHistory } from './hooks/useAssetHistory'
import { useFetchAssetData } from './hooks/useFetchAssetData'
import { useFavorites } from './hooks/useFavorites'
import { useWebSocketPrices } from './hooks/useWebSocketPrices'
import type { AssetData, MarketCategory, SortDirection, SortField, Timeframe } from './types/crypto'

function filterAndSortAssets(
  assets: AssetData[],
  search: string,
  category: MarketCategory,
  favoritesOnly: boolean,
  favorites: string[],
  sortField: SortField,
  sortDirection: SortDirection,
  livePrices: ReturnType<typeof useWebSocketPrices>['prices'],
): AssetData[] {
  let result = [...assets]

  if (search.trim()) {
    const q = search.toLowerCase()
    result = result.filter(
      (a) => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q),
    )
  }

  if (category !== 'All') {
    result = result.filter((a) => a.category === category)
  }

  if (favoritesOnly) {
    result = result.filter((a) => favorites.includes(a.id))
  }

  const getSortValue = (asset: AssetData): number | string => {
    const live = livePrices[asset.id]
    switch (sortField) {
      case 'name':
        return asset.name.toLowerCase()
      case 'price':
        return live?.price ?? asset.priceUsd
      case 'marketCap':
        return asset.marketCapUsd
      case 'volume':
        return asset.volumeUsd24Hr
      case 'changePercent':
        return live?.changePercent ?? asset.changePercent24Hr
    }
  }

  result.sort((a, b) => {
    const aVal = getSortValue(a)
    const bVal = getSortValue(b)
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    const diff = (aVal as number) - (bVal as number)
    return sortDirection === 'asc' ? diff : -diff
  })

  return result
}

export default function App() {
  const { assets, loading, error, refetch } = useFetchAssetData()
  const { prices, connected, error: wsError, reconnect } = useWebSocketPrices()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<MarketCategory>('All')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sortField, setSortField] = useState<SortField>('marketCap')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedId, setSelectedId] = useState<string | null>('bitcoin')
  const [chartTimeframe, setChartTimeframe] = useState<Timeframe>('24h')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredAssets = useMemo(
    () =>
      filterAndSortAssets(
        assets,
        search,
        category,
        favoritesOnly,
        favorites,
        sortField,
        sortDirection,
        prices,
      ),
    [assets, search, category, favoritesOnly, favorites, sortField, sortDirection, prices],
  )

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedId) ?? null,
    [assets, selectedId],
  )

  const {
    data: chartData,
    loading: chartLoading,
    error: chartError,
    refetch: refetchChart,
  } = useAssetHistory(selectedId, chartTimeframe)

  const sidebar = (
    <div className="space-y-5">
      <SearchBar value={search} onChange={setSearch} />
      <FilterBar
        category={category}
        onCategoryChange={setCategory}
        favoritesOnly={favoritesOnly}
        onFavoritesOnlyChange={setFavoritesOnly}
      />
      <SortControls
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={setSortField}
        onSortDirectionChange={setSortDirection}
      />
      {favorites.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            Your Favorites ({favorites.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {favorites.map((id) => {
              const asset = assets.find((a) => a.id === id)
              if (!asset) return null
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedId(id)}
                  className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400"
                >
                  {asset.symbol}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Layout
      header={
        <Header
          connected={connected}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />
      }
      sidebar={sidebar}
      sidebarOpen={sidebarOpen}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {(error || wsError) && (
        <div className="mb-4 space-y-2">
          {error && <ErrorState message={`Market data: ${error}`} onRetry={refetch} />}
          {wsError && (
            <ErrorState message={`Live feed: ${wsError}`} onRetry={reconnect} />
          )}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AssetTileSkeleton key={i} />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">No assets found</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredAssets.map((asset, index) => (
            <AssetTile
              key={asset.id}
              asset={asset}
              livePrice={prices[asset.id]}
              isFavorite={isFavorite(asset.id)}
              isSelected={selectedId === asset.id}
              onToggleFavorite={toggleFavorite}
              onSelect={setSelectedId}
              index={index}
            />
          ))}
        </div>
      )}

      {selectedAsset && (
        <div className="mt-6">
          <PriceChart
            assetName={selectedAsset.name}
            symbol={selectedAsset.symbol}
            data={chartData}
            loading={chartLoading}
            error={chartError}
            timeframe={chartTimeframe}
            onTimeframeChange={setChartTimeframe}
            onRetry={refetchChart}
          />
        </div>
      )}
    </Layout>
  )
}
