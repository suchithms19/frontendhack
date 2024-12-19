import React, { useState, useEffect } from "react";

const Description = ({ incident }) => {
  const [address, setAddress] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (incident?.location) {
      fetchAddress(incident.location.latitude, incident.location.longitude);
    }
  }, [incident]);

  const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      setAddress(data.display_name);
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Address not available");
    }
  };

  const handleAssign = async () => {
    try {
      setIsAssigning(true);
      const response = await fetch(`http://localhost:3000/api/incidents/worker-status/${incident._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'assigned'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign workers');
      }
      
      // You might want to trigger a refresh of the incident data here
    } catch (error) {
      console.error('Error assigning workers:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  if (!incident) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>Select an incident to view details</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
      <div className="p-4 space-y-6">
        <div className="flex justify-end">
          <button
            onClick={handleAssign}
            disabled={isAssigning || incident.status === 'assigned' || incident.status === 'handled'}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              incident.status === 'assigned' || incident.status === 'handled'
                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {isAssigning ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Assigning...</span>
              </>
            ) : incident.status === 'assigned' || incident.status === 'handled' ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Assigned</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Assign Workers</span>
              </>
            )}
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 text-yellow-400">Location</h2>
          <div className="bg-yellow-500/10 p-3 rounded-lg">
            <p className="text-gray-400 text-sm leading-relaxed">
              {address || "Loading address..."}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2 text-blue-500">Description</h2>
          <div className="bg-blue-500/10 p-3 rounded-lg">
            <p className="text-gray-400 text-sm">{incident.description}</p>
          </div>
        </div>

        {incident.analysis && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-green-400">
              Operator Instructions
            </h2>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <ul className="list-decimal pl-5 text-gray-400 text-sm space-y-2">
                {incident.analysis.operatorInstructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {incident.analysis?.assignedWorkers && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-blue-400">
              Emergency Response Team
            </h2>
            <div className="space-y-2">
              {incident.analysis.assignedWorkers.map((worker, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-500/10 p-3 rounded-lg">
                  <span className="text-sm text-gray-300">{worker.type}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    worker.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                    worker.status === 'onsite' ? 'bg-blue-900/50 text-blue-400' :
                    worker.status === 'enroute' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {worker.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Description;
