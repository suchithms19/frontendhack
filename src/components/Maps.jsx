import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";

// Map updater component for handling zoom and center changes
function MapUpdater({ selectedIncident }) {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident) {
      map.flyTo(
        [selectedIncident.location.latitude, selectedIncident.location.longitude],
        16,
        {
          duration: 1.5,
          easeLinearity: 0.25
        }
      );
    }
  }, [map, selectedIncident]);

  return null;
}

const Maps = ({ incidents, selectedIncident }) => {
  const defaultIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const selectedIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconSize: [35, 57],
    iconAnchor: [17, 57],
  });

  // Calculate center based on selected incident or first incident
  const getMapCenter = () => {
    if (selectedIncident) {
      return [selectedIncident.location.latitude, selectedIncident.location.longitude];
    }
    if (incidents.length > 0) {
      return [incidents[0].location.latitude, incidents[0].location.longitude];
    }
    return [20.5937, 78.9629]; // Default center (India)
  };

  return (
    <MapContainer
      center={getMapCenter()}
      zoom={selectedIncident ? 16 : 5}
      className="h-[calc(100vh-4rem)]"
      style={{ width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {incidents.map((incident) => (
        <Marker
          key={incident._id}
          position={[incident.location.latitude, incident.location.longitude]}
          icon={incident._id === selectedIncident?._id ? selectedIcon : defaultIcon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-blue-600">{incident.disasterType}</h3>
              <p className="text-sm mt-1">{incident.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(incident.timestamp).toLocaleString()}
              </p>
              <div className="mt-2">
                {/* <span className={`text-xs px-2 py-1 rounded ${
                  incident.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                  incident.status === 'analyzing' ? 'bg-blue-100 text-blue-800' :
                  incident.status === 'assigned' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {incident.status.toUpperCase()}
                </span> */}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      <MapUpdater selectedIncident={selectedIncident} />
    </MapContainer>
  );
};

export default Maps;
