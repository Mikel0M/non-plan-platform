import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AddressSuggestion {
    address: string;
    lat: number;
    lng: number;
    plotNumber?: string;
}

interface AddressAutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    onLocationSelect?: (lat: number, lng: number, address: string, plotNumber?: string) => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const AddressAutocompleteInput: React.FC<AddressAutocompleteInputProps> = ({
    value,
    onChange,
    onLocationSelect,
    placeholder = "Enter address...",
    className = "",
    style = {}
}) => {
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Search for address suggestions
    const searchAddresses = async (query: string): Promise<AddressSuggestion[]> => {
        if (!query || query.length < 3) return [];
        
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                return data.map((result: any) => ({
                    address: result.display_name,
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon),
                    plotNumber: extractPlotNumber(result)
                }));
            }
            return [];
        } catch (error) {
            console.error('Address search failed:', error);
            return [];
        }
    };

    // Extract plot number from Nominatim response
    const extractPlotNumber = (result: any): string | undefined => {
        if (!result.address) return undefined;
        
        const address = result.address;
        
        // Try to extract cadastral/parcel number from specific fields (prioritize cadastral data)
        const cadastralSources = [
            address.plot,
            address.parcel,
            address.cadastral_reference,
            address.cadastral,
            address.parcel_id,
            address.lot_number,
            address.ref
        ];
        
        // First try cadastral-specific fields
        for (const source of cadastralSources) {
            if (source && typeof source === 'string') {
                // Look for cadastral-like patterns (alphanumeric codes, often longer than house numbers)
                const cadastralMatch = source.match(/^[A-Z0-9\-\/\.]+$/i);
                if (cadastralMatch && source.length > 1) {
                    return source;
                }
            }
        }
        
        // If no cadastral data found, try to extract from display name
        const displayName = result.display_name;
        if (displayName) {
            // Look for cadastral patterns in display name
            const cadastralPatterns = [
                /Parcel\s+([A-Z0-9\-\/\.]+)/i,
                /Plot\s+([A-Z0-9\-\/\.]+)/i,
                /Lot\s+([A-Z0-9\-\/\.]+)/i,
                /Cadastral\s+([A-Z0-9\-\/\.]+)/i,
                /Block\s+([A-Z0-9\-\/\.]+)/i,
                /Section\s+([A-Z0-9\-\/\.]+)/i
            ];
            
            for (const pattern of cadastralPatterns) {
                const match = displayName.match(pattern);
                if (match && match[1].length > 1) {
                    return match[1];
                }
            }
        }
        
        // As a last resort, check if there's additional cadastral info in the raw data
        if (result.extratags) {
            const extraSources = [
                result.extratags.plot_number,
                result.extratags.parcel_number,
                result.extratags.cadastral_reference,
                result.extratags.ref
            ];
            
            for (const source of extraSources) {
                if (source && typeof source === 'string' && source.length > 1) {
                    return source;
                }
            }
        }
        
        // Don't return house number as it's not a cadastral reference
        return undefined;
    };

    // Format address for display - create a shorter, more user-friendly version
    const formatAddressForDisplay = (fullAddress: string): string => {
        const parts = fullAddress.split(',').map(part => part.trim());
        
        // Try to create a format like "Street Number, City" or "Street Number, Area, City"
        if (parts.length >= 2) {
            // Take the first part (street + number) and the city (usually one of the last parts)
            const streetPart = parts[0]; // e.g., "2, Malojaweg"
            
            // Find the city part (look for known city indicators or take a reasonable part)
            let cityPart = '';
            for (let i = 1; i < parts.length; i++) {
                const part = parts[i];
                // Skip parts that look like districts, zones, or postal codes
                if (!/^(Kreis|District|Zone|\d{4,}|CH-\d+)/.test(part) && 
                    !part.toLowerCase().includes('switzerland') &&
                    part.length > 1) {
                    cityPart = part;
                    break;
                }
            }
            
            // If we found a good city part, combine it with the street
            if (cityPart) {
                return `${streetPart}, ${cityPart}`;
            }
            
            // Fallback: take first two parts
            return `${parts[0]}, ${parts[1]}`;
        }
        
        // Fallback: return the full address if parsing fails
        return fullAddress;
    };

    // Debounced search
    const debouncedSearch = useCallback((query: string) => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(async () => {
            if (query.length >= 3) {
                setIsLoading(true);
                try {
                    const results = await searchAddresses(query);
                    setSuggestions(results);
                    setShowSuggestions(true);
                    setSelectedIndex(-1);
                } catch (error) {
                    console.error('Search failed:', error);
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);
    }, []);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        debouncedSearch(newValue);
    };

    // Handle suggestion selection
    const handleSuggestionClick = (suggestion: AddressSuggestion) => {
        // First update the location data
        if (onLocationSelect) {
            onLocationSelect(suggestion.lat, suggestion.lng, suggestion.address, suggestion.plotNumber);
        }
        
        // Then update the input field
        onChange(suggestion.address);
        
        // Finally hide suggestions after a small delay to ensure click is processed
        setTimeout(() => {
            setShowSuggestions(false);
            setSelectedIndex(-1);
        }, 10);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Scroll selected suggestion into view
    useEffect(() => {
        if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
            suggestionRefs.current[selectedIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [selectedIndex]);

    // Hide suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                // Check if click is on a suggestion element
                const target = event.target as HTMLElement;
                if (target.closest('.suggestion-item')) {
                    return; // Don't hide if clicking on suggestion
                }
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        ...style
    };

    const suggestionsStyle: React.CSSProperties = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'var(--background-200)',
        border: '2px solid var(--complementary200)',
        borderRadius: '4px',
        maxHeight: '200px',
        overflowY: 'auto',
        zIndex: 1000,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    };

    const suggestionStyle: React.CSSProperties = {
        padding: '8px 12px',
        cursor: 'pointer',
        borderBottom: '1px solid var(--complementary200)',
        fontSize: '14px',
        color: 'white',
        transition: 'background-color 0.2s ease'
    };

    const selectedSuggestionStyle: React.CSSProperties = {
        ...suggestionStyle,
        backgroundColor: 'var(--complementary100)',
        color: 'var(--background-100)'
    };

    const loadingStyle: React.CSSProperties = {
        ...suggestionStyle,
        fontStyle: 'italic',
        color: 'var(--complementary200)'
    };

    return (
        <div style={containerStyle}>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={className}
                style={{ width: '100%' }}
            />
            {showSuggestions && (
                <div style={suggestionsStyle}>
                    {isLoading && (
                        <div style={loadingStyle}>
                            🔍 Searching addresses...
                        </div>
                    )}
                    {!isLoading && suggestions.length === 0 && value.length >= 3 && (
                        <div style={loadingStyle}>
                            No addresses found
                        </div>
                    )}
                    {!isLoading && suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            ref={el => suggestionRefs.current[index] = el}
                            className="suggestion-item"
                            style={selectedIndex === index ? selectedSuggestionStyle : suggestionStyle}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur on input
                                // Always pass the full OSM address to the handler!
                                handleSuggestionClick(suggestion);
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div style={{ fontWeight: 'bold' }}>
                                {formatAddressForDisplay(suggestion.address)}
                                {suggestion.plotNumber && (
                                    <span style={{ 
                                        marginLeft: '8px', 
                                        padding: '2px 6px',
                                        backgroundColor: 'var(--complementary100)',
                                        color: 'var(--background-100)',
                                        borderRadius: '3px',
                                        fontSize: '12px'
                                    }}>
                                        Plot: {suggestion.plotNumber}
                                    </span>
                                )}
                            </div>
                            <div style={{ 
                                fontSize: '12px', 
                                color: 'var(--complementary200)', 
                                marginTop: '2px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {suggestion.address}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressAutocompleteInput;
