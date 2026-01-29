import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getMarkerColor } from '../utils/riskColors';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to update map view
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

// Create custom colored markers
const createColoredIcon = (color) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });
};

const MapComponent = ({ latitude, longitude, villageName, riskScore }) => {
    const position = [latitude, longitude];
    const markerColor = getMarkerColor(riskScore);
    const icon = createColoredIcon(markerColor);

    return (
        <div className="relative">
            {/* Map Legend */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
                <h4 className="font-bold text-sm text-gray-900 mb-3">Map Key</h4>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                        <span>High Risk (76-100)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                        <span>Moderate Risk (51-75)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
                        <span>Moderate Risk (26-50)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        <span>Low Risk (0-25)</span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
                scrollWheelZoom={true}
            >
                <ChangeView center={position} zoom={13} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={icon}>
                    <Popup>
                        <div className="text-center">
                            <strong>{villageName}</strong><br />
                            Risk Score: {riskScore}/100
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapComponent;
