import { useEffect, useState } from 'react'
import { getAutocompleteSuggestions } from '../api/Location'

type AutocompleteLocation = {
  label: string
  coordinates: {
    latitude: number
    longitude: number
  }
}

type LocationSearchProps = {
  label: string
  placeholder?: string
  onSelect: (loc: AutocompleteLocation) => void
  currentLocation?: AutocompleteLocation | null
}

export function LocationSearch({
  label,
  placeholder,
  onSelect,
}: LocationSearchProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<AutocompleteLocation[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedInputValue, setDebouncedInputValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInputValue(inputValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedInputValue.trim().length === 0) {
        setSuggestions([])
        setShowDropdown(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const data: AutocompleteLocation[] = await getAutocompleteSuggestions(debouncedInputValue)
        setSuggestions(data)
        setShowDropdown(true)
      } catch (err) {
        console.error('Failed to fetch location suggestions:', err)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedInputValue])

  const handleSelect = (loc: AutocompleteLocation) => {
    setInputValue(loc.label)
    setShowDropdown(false)
    onSelect(loc)
  }

  return (
    <div className="relative mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
        onFocus={() => setShowDropdown(true)}
      />
      {isLoading && <div className="text-sm text-gray-500 mt-1">Loading suggestions...</div>}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-[1000] w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto mt-1">
          {suggestions.map((loc, idx) => (
            <li
              key={idx}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => handleSelect(loc)}
            >
              {loc.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}