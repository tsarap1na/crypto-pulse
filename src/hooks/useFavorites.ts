import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'cryptopulse-favorites'

function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(readFavorites)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = useCallback((assetId: string) => {
    setFavorites((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId],
    )
  }, [])

  const isFavorite = useCallback((assetId: string) => favorites.includes(assetId), [favorites])

  const showFavoritesOnly = favorites.length > 0

  return { favorites, toggleFavorite, isFavorite, showFavoritesOnly }
}

export type FavoritesFilter = 'all' | 'favorites'

export function useFavoritesFilter() {
  const [filter, setFilter] = useState<FavoritesFilter>('all')
  return { favoritesFilter: filter, setFavoritesFilter: setFilter }
}
