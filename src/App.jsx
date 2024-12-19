import { useState, useEffect } from "react";
import Messages from "./components/Messages";
import './App.css';
import Description from './components/Description';
import Maps from './components/Maps';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [error, setError] = useState(null);

  // Function to fetch incidents
  const fetchIncidents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/incidents/all');
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }
      const data = await response.json();
      setIncidents(data);
      
      // If no incident is selected, select the first one
      if (!selectedIncident && data.length > 0) {
        setSelectedIncident(data[0]);
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError(err.message);
    }
  };

  // Set up polling interval
  useEffect(() => {
    // Initial fetch
    fetchIncidents();

    // Set up interval
    const intervalId = setInterval(fetchIncidents, 30000); // 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Handle incident selection
  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Enhanced Navbar */}
      <nav className="h-16 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between px-6 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 className="text-blue-400 text-2xl font-bold">PREPARED</h1>
          </div>
          <span className="text-slate-400 text-sm px-3 py-1 bg-slate-700/50 rounded-full">
            Admin Dashboard
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-full">
              {error}
            </div>
          )}
          <button 
            onClick={fetchIncidents}
            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Messages */}
        <div className="w-1/4 border-r border-slate-700 flex flex-col bg-slate-800/50">
          <div className="p-4 border-b border-slate-700 bg-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-200 text-lg font-semibold">Emergency Reports</h2>
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                {incidents.length} Active
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Messages 
              incidents={incidents}
              onSelectIncident={handleIncidentSelect}
              selectedIncident={selectedIncident}
            />
          </div>
        </div>

        {/* Middle Section - Description */}
        <div className="w-1/3 border-r border-slate-700 bg-slate-800/50 flex flex-col">
          <div className="p-4 border-b border-slate-700 bg-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-200 text-lg font-semibold">Incident Details</span>
              {selectedIncident && (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedIncident.status === 'new' ? 'bg-yellow-500/20 text-yellow-400' :
                  selectedIncident.status === 'analyzing' ? 'bg-blue-500/20 text-blue-400' :
                  selectedIncident.status === 'assigned' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {selectedIncident.status.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Description incident={selectedIncident} />
          </div>
        </div>

        {/* Right Section - Map */}
        <div className="flex-1 bg-slate-800">
          <div className="h-full">
            <Maps 
              incidents={incidents} 
              selectedIncident={selectedIncident}
              onSelectIncident={handleIncidentSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
