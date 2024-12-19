import React, { useState, useEffect } from "react";
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

const Worker = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [address, setAddress] = useState({});

  const defaultIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch address for each incident
  useEffect(() => {
    incidents.forEach(async (incident) => {
      if (!address[incident._id]) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${incident.location.latitude}&lon=${incident.location.longitude}`
          );
          const data = await response.json();
          setAddress(prev => ({
            ...prev,
            [incident._id]: data.display_name
          }));
        } catch (error) {
          console.error("Error fetching address:", error);
        }
      }
    });
  }, [incidents]);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/incidents/all');
      if (!response.ok) throw new Error('Failed to fetch incidents');
      
      const data = await response.json();
      // Filter only assigned or handling incidents
      const assignedIncidents = data.filter(incident => 
        incident.status === 'assigned' || 
        incident.status === 'handling' ||
        incident.status === 'analyzing'
      );
      setIncidents(assignedIncidents);
      
      // Select first incident if none selected
      if (!selectedIncident && assignedIncidents.length > 0) {
        setSelectedIncident(assignedIncidents[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError("Failed to load assignments");
      setLoading(false);
    }
  };

  const updateWorkerStatus = async (incidentId, workerType, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/incidents/worker-status/${incidentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerType,
          status: newStatus
        })
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      await fetchIncidents(); // Refresh the incidents list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-blue-500">Emergency Response Team</h1>
          </div>
          <div className="text-slate-400">
            {incidents.length} Active Assignments
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assignments List */}
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Active Assignments</h2>
            {incidents.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                No active assignments at the moment
              </div>
            ) : (
              incidents.map((incident) => (
                <div 
                  key={incident._id}
                  onClick={() => setSelectedIncident(incident)}
                  className={`bg-slate-800 rounded-lg border ${
                    selectedIncident?._id === incident._id 
                      ? 'border-blue-500' 
                      : 'border-slate-700'
                  } hover:border-blue-500/50 transition-colors overflow-hidden cursor-pointer`}
                >
                  {/* Header */}
                  <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-slate-200">
                          {incident.disasterType}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Reported: {new Date(incident.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs
                        ${incident.status === 'assigned' ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-green-500/20 text-green-400'}`}
                      >
                        {incident.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    {/* Location */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Location</h4>
                      <div className="bg-slate-700/30 p-3 rounded-lg">
                        <p className="text-sm text-slate-300">
                          Lat: {incident.location.latitude}, Long: {incident.location.longitude}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Situation</h4>
                      <div className="bg-slate-700/30 p-3 rounded-lg">
                        <p className="text-sm text-slate-300">{incident.description}</p>
                      </div>
                    </div>

                    {/* Operator Instructions */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Instructions</h4>
                      <div className="bg-slate-700/30 p-3 rounded-lg">
                        <ul className="list-disc pl-4 text-sm text-slate-300 space-y-2">
                          {incident.analysis.operatorInstructions.map((instruction, idx) => (
                            <li key={idx}>{instruction}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Emergency Response Team Status */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Team Status</h4>
                      <div className="space-y-2">
                        {incident.analysis.assignedWorkers.map((worker, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg">
                            <span className="text-slate-200">{worker.type}</span>
                            <div className="flex items-center space-x-3">
                              <select
                                value={worker.status}
                                onChange={(e) => updateWorkerStatus(incident._id, worker.type, e.target.value)}
                                className="bg-slate-600 text-slate-200 rounded px-3 py-1 text-sm border border-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="enroute">En Route</option>
                                <option value="onsite">On Site</option>
                                <option value="completed">Completed</option>
                              </select>
                              <span className={`px-2 py-1 rounded text-xs ${
                                worker.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                worker.status === 'onsite' ? 'bg-blue-500/20 text-blue-400' :
                                worker.status === 'enroute' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {worker.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Map Section */}
          <div className="bg-slate-800 rounded-lg overflow-hidden h-[calc(100vh-8rem)] sticky top-4">
            <MapContainer
              center={selectedIncident 
                ? [selectedIncident.location.latitude, selectedIncident.location.longitude]
                : [20.5937, 78.9629]}
              zoom={selectedIncident ? 13 : 5}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {incidents.map((incident) => (
                <Marker
                  key={incident._id}
                  position={[incident.location.latitude, incident.location.longitude]}
                  icon={defaultIcon}
                  eventHandlers={{
                    click: () => setSelectedIncident(incident)
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-slate-900">{incident.disasterType}</h3>
                      <p className="text-sm mt-1">{incident.description}</p>
                      <div className="mt-2 text-xs text-slate-500">
                        {incident.analysis.assignedWorkers.map((worker, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span>{worker.type}:</span>
                            <span className="font-semibold">{worker.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              <MapUpdater selectedIncident={selectedIncident} />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Worker;
