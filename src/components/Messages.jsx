import React from "react";

const Messages = ({ incidents, onSelectIncident, selectedIncident }) => {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
      <div className="divide-y divide-slate-700">
        {incidents.map((incident) => (
          <div
            key={incident._id}
            onClick={() => onSelectIncident(incident)}
            className={`p-4 hover:bg-slate-700/50 cursor-pointer transition-colors
              ${selectedIncident?._id === incident._id ? 'bg-slate-700' : ''}`}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${incident.disasterType === 'Fire' ? 'bg-red-500/20 text-red-400' :
                  incident.disasterType === 'Flood' ? 'bg-blue-500/20 text-blue-400' :
                  incident.disasterType === 'Earthquake' ? 'bg-yellow-500/20 text-yellow-400' :
                  incident.disasterType === 'Cyclone' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-green-500/20 text-green-400'}`}
              >
                {getDisasterIcon(incident.disasterType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-200 font-medium truncate">
                    {incident.disasterType}
                  </h3>
                  <span className="text-sm text-slate-400">
                    {formatTime(incident.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1 truncate">
                  {incident.description}
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  {/* <span className={`px-2 py-0.5 rounded text-xs
                    ${incident.status === 'new' ? 'bg-yellow-500/20 text-yellow-400' :
                      incident.status === 'analyzing' ? 'bg-blue-500/20 text-blue-400' :
                      incident.status === 'assigned' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-green-500/20 text-green-400'}`}
                  >
                    {incident.status.toUpperCase()}
                  </span> */}
                  <span className="text-xs text-slate-500">
                    {incident.analysis?.assignedWorkers?.length || 0} Workers
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getDisasterIcon = (type) => {
  switch (type) {
    case 'Fire':
      return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
      </svg>;
    // Add more icons for other disaster types
    default:
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>;
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default Messages;
