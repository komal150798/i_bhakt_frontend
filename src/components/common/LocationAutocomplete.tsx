import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LocationResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

interface LocationData {
  placeName: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  style?: React.CSSProperties;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Get timezone from coordinates using a simple approximation for India
// For more accuracy, you could use a timezone API
function getTimezoneFromCoordinates(lat: number, lon: number): string {
  // India timezone detection (most users will be in India)
  if (lat >= 8 && lat <= 37 && lon >= 68 && lon <= 97) {
    return 'Asia/Kolkata';
  }
  // Basic timezone estimation based on longitude
  const tzOffset = Math.round(lon / 15);
  if (tzOffset >= 0) {
    return `Etc/GMT-${tzOffset}`;
  }
  return `Etc/GMT+${Math.abs(tzOffset)}`;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = 'Search city, state...',
  className = '',
  inputClassName = '',
  dropdownClassName = '',
  disabled = false,
  required = false,
  id,
  name,
  style,
}) => {
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedValue = useDebounce(value, 300);

  // Fetch suggestions from OpenStreetMap Nominatim
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // OpenStreetMap Nominatim API - free, no API key required
      // Rate limit: 1 request/second (we handle this with debounce)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=8&` +
        `countrycodes=in,us,gb,ca,au,ae,sg,my,np,bd,lk,pk`, // Prioritize common countries
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'iBhakt-App/1.0', // Required by Nominatim
          },
        }
      );

      if (response.ok) {
        const data: LocationResult[] = await response.json();
        setSuggestions(data);
        setShowDropdown(data.length > 0);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when debounced value changes
  useEffect(() => {
    if (debouncedValue) {
      fetchSuggestions(debouncedValue);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [debouncedValue, fetchSuggestions]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle suggestion selection
  const handleSelect = (location: LocationResult) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    // Extract city/town name
    const cityName = location.address?.city ||
                     location.address?.town ||
                     location.address?.village ||
                     '';

    // Format display name (City, State, Country)
    const parts: string[] = [];
    if (cityName) parts.push(cityName);
    if (location.address?.state) parts.push(location.address.state);
    if (location.address?.country) parts.push(location.address.country);

    const formattedName = parts.length > 0 ? parts.join(', ') : location.display_name;

    const locationData: LocationData = {
      placeName: formattedName,
      latitude: lat,
      longitude: lon,
      city: cityName,
      state: location.address?.state,
      country: location.address?.country,
      timezone: getTimezoneFromCoordinates(lat, lon),
    };

    onChange(formattedName);
    onLocationSelect(locationData);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setSuggestions([]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Format suggestion display text
  const formatSuggestion = (location: LocationResult): string => {
    const parts: string[] = [];

    const cityName = location.address?.city ||
                     location.address?.town ||
                     location.address?.village;

    if (cityName) parts.push(cityName);
    if (location.address?.state) parts.push(location.address.state);
    if (location.address?.country) parts.push(location.address.country);

    return parts.length > 0 ? parts.join(', ') : location.display_name;
  };

  return (
    <div
      ref={wrapperRef}
      className={`location-autocomplete-wrapper ${className}`}
      style={{ position: 'relative', ...style }}
    >
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowDropdown(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`location-autocomplete-input ${inputClassName}`}
        disabled={disabled}
        required={required}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
      />

      {isLoading && (
        <div
          className="location-loading-indicator"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '12px',
            color: '#6b7280',
          }}
        >
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        </div>
      )}

      {showDropdown && suggestions.length > 0 && (
        <ul
          className={`location-autocomplete-dropdown ${dropdownClassName}`}
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: '250px',
            overflowY: 'auto',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            marginTop: '4px',
          }}
        >
          {suggestions.map((location, index) => (
            <li
              key={location.place_id}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelect(location)}
              onMouseEnter={() => setSelectedIndex(index)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                backgroundColor: index === selectedIndex ? '#f3f4f6' : 'transparent',
                transition: 'background-color 0.15s ease',
                fontSize: '14px',
                color: '#374151',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{formatSuggestion(location)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
