import { useState } from 'react';

interface LocationResult {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
}

interface LocationSearchProps {
  onSelectLocation: (lat: number, lng: number, name: string) => void;
  placeholder?: string;
}

export default function LocationSearch({ onSelectLocation, placeholder = "Search for a location…" }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setShowResults(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=8`
      );

      if (!response.ok) {
        throw new Error('Failed to search locations');
      }

      const data: LocationResult[] = await response.json();

      if (data.length === 0) {
        setError('No locations found. Try a different search.');
        setResults([]);
      } else {
        setResults(data);
        setError('');
      }

      setShowResults(true);
    } catch (err) {
      setError('Error searching locations. Please try again.');
      setResults([]);
      console.error('Location search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    handleSearch(value);
  };

  const handleSelectResult = (result: LocationResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const name = result.display_name;

    onSelectLocation(lat, lng, name);
    setQuery('');
    setResults([]);
    setShowResults(false);
    setError('');
  };

  return (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => showResults && setShowResults(true)}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '14px',
          boxSizing: 'border-box',
          backgroundColor: '#f8fafc',
        }}
      />

      {loading && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #e2e8f0',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '12px 16px',
          zIndex: 100,
          color: '#64748b',
          fontSize: '13px',
        }}>
          Searching...
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #e2e8f0',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '12px 16px',
          zIndex: 100,
          color: '#d93030',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {showResults && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #e2e8f0',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          maxHeight: '300px',
          overflowY: 'auto',
          zIndex: 100,
        }}>
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectResult(result)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderBottom: index < results.length - 1 ? '1px solid #e2e8f0' : 'none',
                background: 'white',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#334155',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              <strong>{result.name || result.display_name.split(',')[0]}</strong>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                {result.display_name}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
