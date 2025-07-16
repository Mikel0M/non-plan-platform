import React, { useEffect, useRef, useState } from 'react';

interface OpenStreetMapComponentProps {
    latitude?: number;
    longitude?: number;
    address?: string;
    onLocationSelect?: (lat: number, lng: number, address: string, plotNumber?: string) => void;
    interactive?: boolean;
    showMarker?: boolean;
    height?: string;
    width?: string;
    zoom?: number;
    className?: string;
    style?: React.CSSProperties;
    plotNumber?: string;
}

export const OpenStreetMapComponent: React.FC<OpenStreetMapComponentProps> = ({
    latitude,
    longitude,
    address,
    onLocationSelect,
    interactive = true,
    showMarker = true,
    height = "300px",
    width = "100%",
    zoom = 15,
    className = "",
    style = {},
    plotNumber
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [marker, setMarker] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize the map when component mounts
    useEffect(() => {
        let leafletMap: any = null;
        let leafletMarker: any = null;
        
        const initMap = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Clean up existing map if it exists
                if (map) {
                    map.remove();
                    setMap(null);
                    setMarker(null);
                }

                // Ensure the map container is clean
                if (mapRef.current) {
                    mapRef.current.innerHTML = '';
                    // Remove any existing leaflet classes or attributes
                    mapRef.current.classList.remove('leaflet-container', 'leaflet-touch', 'leaflet-fade-anim', 'leaflet-grab', 'leaflet-touch-drag', 'leaflet-touch-zoom');
                    mapRef.current.removeAttribute('tabindex');
                    mapRef.current.style.position = '';
                }

                // Load Leaflet CSS and JS if not already loaded
                if (!document.querySelector('link[href*="leaflet.css"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                    document.head.appendChild(link);
                }

                if (!window.L) {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    script.onload = () => initMapAfterLoad();
                    document.head.appendChild(script);
                } else {
                    initMapAfterLoad();
                }

                function initMapAfterLoad() {
                    if (!window.L || !mapRef.current) return;

                    try {
                        // Default location (Zurich, Switzerland)
                        const defaultLat = latitude || 47.3769;
                        const defaultLng = longitude || 8.5417;

                        // Initialize the map with a fresh container
                        leafletMap = window.L.map(mapRef.current, {
                            center: [defaultLat, defaultLng],
                            zoom: zoom,
                            zoomControl: true,
                            scrollWheelZoom: interactive,
                            dragging: interactive,
                            tap: interactive,
                            touchZoom: interactive,
                            doubleClickZoom: interactive,
                            boxZoom: interactive,
                            keyboard: interactive
                        });

                        // Add OpenStreetMap tiles
                        const osmLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '© OpenStreetMap contributors',
                            maxZoom: 19
                        });

                        osmLayer.addTo(leafletMap);

                        // Add marker if enabled
                        if (showMarker) {
                            leafletMarker = window.L.marker([defaultLat, defaultLng], {
                                draggable: interactive
                            }).addTo(leafletMap);

                            // Add click listener to marker for dragging
                            if (interactive && onLocationSelect) {
                                leafletMarker.on('dragend', (event: any) => {
                                    const lat = event.target.getLatLng().lat;
                                    const lng = event.target.getLatLng().lng;
                                    
                                    // Reverse geocode using Nominatim (OpenStreetMap geocoding)
                                    reverseGeocode(lat, lng).then(result => {
                                        onLocationSelect(lat, lng, result.address, result.plotNumber);
                                    });
                                });
                            }
                        }

                        // Add click listener to map for setting location
                        if (interactive && onLocationSelect) {
                            leafletMap.on('click', (event: any) => {
                                const lat = event.latlng.lat;
                                const lng = event.latlng.lng;
                                
                                // Update marker position
                                if (leafletMarker) {
                                    leafletMarker.setLatLng([lat, lng]);
                                }
                                
                                // Reverse geocode using Nominatim
                                reverseGeocode(lat, lng).then(result => {
                                    onLocationSelect(lat, lng, result.address, result.plotNumber);
                                });
                            });
                        }

                        setMap(leafletMap);
                        setMarker(leafletMarker);
                        setIsLoading(false);
                    } catch (err) {
                        console.error('Error initializing map:', err);
                        setError(err instanceof Error ? err.message : 'Failed to initialize map');
                        setIsLoading(false);
                    }
                }

            } catch (err) {
                console.error('Error in initMap:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize map');
                setIsLoading(false);
            }
        };

        if (mapRef.current) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                initMap();
            }, 100);
        }

        // Cleanup on unmount or when dependencies change
        return () => {
            if (leafletMap) {
                try {
                    leafletMap.remove();
                } catch (e) {
                    console.warn('Error removing map:', e);
                }
            }
            if (mapRef.current) {
                mapRef.current.innerHTML = '';
            }
        };
    }, [interactive, showMarker, zoom]); // Removed onLocationSelect to prevent excessive re-renders

    // Update map when coordinates change
    useEffect(() => {
        if (map && marker && latitude !== undefined && longitude !== undefined) {
            try {
                console.log('📍 Map update - received coordinates:', { latitude, longitude });
                const position = [latitude, longitude];
                
                // Check if map and marker are valid
                if (!map.getContainer()) {
                    console.warn('Map container not found, skipping update');
                    return;
                }
                
                // Center map on new position with animation
                map.setView(position, zoom, {
                    animate: true,
                    duration: 0.5
                });
                
                // Update marker position
                marker.setLatLng(position);
                
                console.log('✅ Map successfully updated to:', position);
            } catch (err) {
                console.error('❌ Error updating map position:', err);
            }
        } else {
            console.log('⚠️ Map update skipped - missing:', { 
                map: !!map, 
                marker: !!marker, 
                latitude: latitude !== undefined ? latitude : 'undefined', 
                longitude: longitude !== undefined ? longitude : 'undefined' 
            });
        }
    }, [latitude, longitude, map, marker, zoom]);

    // Geocode address when it changes (only if we don't already have coordinates)
    useEffect(() => {
        // Only geocode if we have an address but no coordinates
        if (map && marker && address && address.trim() && (!latitude || !longitude)) {
            geocodeAddress(address).then(result => {
                if (result) {
                    try {
                        const position = [result.lat, result.lng];
                        
                        // Center map on geocoded position
                        map.setView(position, zoom);
                        
                        // Update marker position
                        marker.setLatLng(position);
                    } catch (err) {
                        console.warn('Error geocoding address:', err);
                    }
                }
            }).catch(err => {
                console.warn('Geocoding failed:', err);
            });
        }
    }, [address, map, marker, zoom, latitude, longitude]);

    // Geocoding function using Nominatim (OpenStreetMap)
    const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number; formattedAddress: string; plotNumber?: string } | null> => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                const result = data[0];
                const plotNumber = extractPlotNumber(result);
                
                return {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon),
                    formattedAddress: result.display_name,
                    plotNumber: plotNumber
                };
            }
            return null;
        } catch (error) {
            console.error('Geocoding failed:', error);
            return null;
        }
    };

    // Search for address suggestions
    const searchAddresses = async (query: string): Promise<Array<{ address: string; lat: number; lng: number; plotNumber?: string }>> => {
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

    // Reverse geocoding function using Nominatim
    const reverseGeocode = async (lat: number, lng: number): Promise<{ address: string; plotNumber?: string }> => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
            const data = await response.json();
            
            if (data && data.display_name) {
                const plotNumber = extractPlotNumber(data);
                return {
                    address: data.display_name,
                    plotNumber: plotNumber
                };
            }
            return { address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` };
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return { address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` };
        }
    };

    const containerStyle: React.CSSProperties = {
        width,
        height,
        position: 'relative',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
        ...style
    };

    const loadingStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#666',
        fontSize: '14px',
        textAlign: 'center',
        zIndex: 1000
    };

    const errorStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#d73027',
        fontSize: '14px',
        textAlign: 'center',
        maxWidth: '80%',
        zIndex: 1000
    };

    const plotInfoStyle: React.CSSProperties = {
        position: 'absolute',
        top: '8px',
        right: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1000
    };

    return (
        <div className={className} style={containerStyle}>
            <div 
                ref={mapRef} 
                style={{ width: '100%', height: '100%' }} 
            />
            
            {plotNumber && (
                <div style={plotInfoStyle}>
                    🏠 Plot: {plotNumber}
                </div>
            )}
            
            {isLoading && (
                <div style={loadingStyle}>
                    <div>Loading OpenStreetMap...</div>
                </div>
            )}
            
            {error && (
                <div style={errorStyle}>
                    <div>Error: {error}</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                        Please check your internet connection and try again.
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpenStreetMapComponent;

// Type declaration for Leaflet
declare global {
    interface Window {
        L: any;
    }
}
