import { SearchIcon } from '@sanity/icons'
import { useState, useCallback } from 'react'

// Import the correct types from Sanity
import type { AssetSource, AssetSourceComponentProps } from 'sanity'

interface GiphyResponse {
  data: Array<{
    id: string
    title: string
    images: {
      original: {
        url: string
        width: string
        height: string
      }
    }
  }>
}

const GiphySearch = (props: AssetSourceComponentProps) => {
  const { onSelect } = props
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GiphyResponse['data']>([])
  const [isLoading, setIsLoading] = useState(false)

  const searchGiphy = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${process.env.SANITY_STUDIO_GIPHY_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=20`
      )
      const data: GiphyResponse = await response.json()
      setResults(data.data)
    } catch (error) {
      console.error('Error searching Giphy:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    searchGiphy(query)
  }, [query, searchGiphy])

  const handleSelect = useCallback(async (gif: GiphyResponse['data'][0]) => {
    try {
      // Just use the URL directly
      onSelect([{
        kind: 'url',
        value: gif.images.original.url,
      }])
    } catch (error) {
      console.error('Error selecting Giphy:', error)
    }
  }, [onSelect])

  return (
    <div className="p-4">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Giphy..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {results.map((gif) => (
            <button
              key={gif.id}
              onClick={() => handleSelect(gif)}
              className="relative aspect-square group"
            >
              <img
                src={gif.images.original.url}
                alt={gif.title}
                className="w-full h-full object-cover rounded"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  Select
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const giphyAssetSource: AssetSource = {
  name: 'giphy',
  title: 'Giphy',
  component: GiphySearch,
  icon: SearchIcon
}
