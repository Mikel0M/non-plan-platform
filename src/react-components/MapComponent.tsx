import React, { useEffect, useRef, useState } from 'react';

interface MapComponentProps {
    latitude?: number;
    longitude?: number;
    address?: string;
    onLocationSelect?: (lat: number, lng: number, address: string) => void;
    interactive?: boolean;
    showMarker?: boolean;
    height?: string;
    width?: string;
    zoom?: number;
    className?: string;
    style?: React.CSSProperties;
}

interface MapLibrary {
    map: any;
    marker: any;
    geocoder: any;
}

export const MapComponent: React.FC<MapComponentProps> = ({
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
    style = {}
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapLibrary, setMapLibrary] = useState<MapLibrary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize the map when component mounts
    useEffect(() => {
        const initMap = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Check if Google Maps is available
                if (!window.google) {
                    throw new Error('Google Maps API not loaded');
                }

                // Default location (Zurich, Switzerland)
                const defaultLat = latitude || 47.3769;
                const defaultLng = longitude || 8.5417;

                // Initialize the map
                const map = new window.google.maps.Map(mapRef.current, {
                    center: { lat: defaultLat, lng: defaultLng },
                    zoom: zoom,
                    disableDefaultUI: !interactive,
                    draggable: interactive,
                    scrollwheel: interactive,
                    disableDoubleClickZoom: !interactive,
                    keyboardShortcuts: interactive,
                });

                // Initialize geocoder
                const geocoder = new window.google.maps.Geocoder();

                // Initialize marker
                let marker = null;
                if (showMarker) {
                    marker = new window.google.maps.Marker({
                        position: { lat: defaultLat, lng: defaultLng },
                        map: map,
                        draggable: interactive,
                        title: address || 'Project Location'
                    });

                    // Add click listener to marker for dragging
                    if (interactive && onLocationSelect) {
                        marker.addListener('dragend', (event: any) => {
                            const lat = event.latLng.lat();
                            const lng = event.latLng.lng();
                            
                            // Reverse geocode to get address
                            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                                if (status === 'OK' && results[0]) {
                                    onLocationSelect(lat, lng, results[0].formatted_address);
                                } else {
                                    onLocationSelect(lat, lng, `${lat}, ${lng}`);
                                }
                            });
                        });
                    }
                }

                // Add click listener to map for setting location
                if (interactive && onLocationSelect) {
                    map.addListener('click', (event: any) => {
                        const lat = event.latLng.lat();
                        const lng = event.latLng.lng();
                        
                        // Update marker position
                        if (marker) {
                            marker.setPosition({ lat, lng });
                        }
                        
                        // Reverse geocode to get address
                        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                            if (status === 'OK' && results[0]) {
                                onLocationSelect(lat, lng, results[0].formatted_address);
                            } else {
                                onLocationSelect(lat, lng, `${lat}, ${lng}`);
                            }
                        });
                    });
                }

                setMapLibrary({ map, marker, geocoder });
                setIsLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize map');
                setIsLoading(false);
            }
        };

        if (mapRef.current) {
            initMap();
        }
    }, [latitude, longitude, interactive, showMarker, zoom, onLocationSelect]);

    // Update map when coordinates change
    useEffect(() => {
        if (mapLibrary && latitude && longitude) {
            const position = { lat: latitude, lng: longitude };
            
            // Center map on new position
            mapLibrary.map.setCenter(position);
            
            // Update marker position
            if (mapLibrary.marker) {
                mapLibrary.marker.setPosition(position);
            }
        }
    }, [latitude, longitude, mapLibrary]);

    // Geocode address when it changes
    useEffect(() => {
        if (mapLibrary && address && mapLibrary.geocoder) {
            mapLibrary.geocoder.geocode({ address: address }, (results: any, status: any) => {
                if (status === 'OK' && results[0]) {
                    const location = results[0].geometry.location;
                    const lat = location.lat();
                    const lng = location.lng();
                    const position = { lat, lng };
                    
                    // Center map on geocoded position
                    mapLibrary.map.setCenter(position);
                    
                    // Update marker position
                    if (mapLibrary.marker) {
                        mapLibrary.marker.setPosition(position);
                    }
                }
            });
        }
    }, [address, mapLibrary]);

    // Method to center map on specific location
    const centerMap = (lat: number, lng: number) => {
        if (mapLibrary) {
            const position = { lat, lng };
            mapLibrary.map.setCenter(position);
            if (mapLibrary.marker) {
                mapLibrary.marker.setPosition(position);
            }
        }
    };

    // Method to geocode an address
    const geocodeAddress = (address: string): Promise<{ lat: number; lng: number; formattedAddress: string }> => {
        return new Promise((resolve, reject) => {
            if (!mapLibrary || !mapLibrary.geocoder) {
                reject(new Error('Map not initialized'));
                return;
            }

            mapLibrary.geocoder.geocode({ address }, (results: any, status: any) => {
                if (status === 'OK' && results[0]) {
                    const location = results[0].geometry.location;
                    resolve({
                        lat: location.lat(),
                        lng: location.lng(),
                        formattedAddress: results[0].formatted_address
                    });
                } else {
                    reject(new Error(`Geocoding failed: ${status}`));
                }
            });
        });
    };

    // Note: Methods exposed via ref would need proper forwardRef setup
    // For now, these are internal methods that can be used by parent components
    // if needed through imperative ref patterns

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
        textAlign: 'center'
    };

    const errorStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#d73027',
        fontSize: '14px',
        textAlign: 'center',
        maxWidth: '80%'
    };

    return (
        <div className={className} style={containerStyle}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            
            {isLoading && (
                <div style={loadingStyle}>
                    <div>Loading map...</div>
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

export default MapComponent;
