import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Custom marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
})

function useMapUpdate({ map, position, currentLocation }) {
  useEffect(() => {
    if (map && (position || currentLocation)) {
      const location = position || currentLocation;
      map.flyTo(location, 16);
    }
  }, [map, position, currentLocation]);

  return null;
}

function Consumer() {
  const [position, setPosition] = useState(null)
  const [disasterType, setDisasterType] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)
  const [displayCoords, setDisplayCoords] = useState(null)
  const [instructions, setInstructions] = useState(null)
  const [showInstructionsPage, setShowInstructionsPage] = useState(false);

  const getCurrentLocation = () => {
    setGettingLocation(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setCurrentLocation([lat, lng])
          setPosition([lat, lng])
          setDisplayCoords({ lat, lng })
          
          const mapInstance = document.querySelector('.leaflet-container')?._leaflet_map;
          if (mapInstance) {
            mapInstance.flyTo([lat, lng], 16, {
              duration: 2,
              easeLinearity: 0.25
            });
          }
          
          // Reverse geocoding to get location name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            )
            const data = await response.json()
            setLocationName(data.display_name)
          } catch (error) {
            console.error("Error getting location name:", error)
          }
          setGettingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Unable to get your current location")
          setGettingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setInstructions(null)
    
    if (!position) {
      setError('Please select a location on the map')
      setLoading(false)
      return
    }
    
    const data = {
      latitude: position[0],
      longitude: position[1],
      disasterType: disasterType,
      description,
      locationName
    }

    try {
      const response = await fetch('http://localhost:3000/api/incidents/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      
      const responseData = await response.json()
      
      if (response.ok) {
        setSuccess(true)
        if (responseData.immediateInstructions) {
          setInstructions(responseData.immediateInstructions)
        }
        setShowInstructionsPage(true)
      } else {
        setError(responseData.error || 'Failed to submit report')
      }
    } catch (error) {
      console.error('Network error:', error)
      setError('Network error. Please check your connection')
    } finally {
      setLoading(false)
    }
  }

  // If showing instructions page
  if (showInstructionsPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-lg">
          <div className="container mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-center">
              Emergency Instructions
            </h1>
          </div>
        </nav>

        <div className="container mx-auto p-4 space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-green-800 mb-2">Report Submitted Successfully</h2>
            <p className="text-green-700">Help is on the way. Please follow the instructions below carefully.</p>
          </div>

          {/* Safety Instructions */}
          {instructions && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">Important Safety Instructions</h2>
              <ul className="list-decimal pl-5 space-y-3">
                {instructions.map((instruction, index) => (
                  <li key={index} className="text-yellow-700">{instruction}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Emergency Contacts */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Emergency Contact Numbers</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-blue-900 mb-2">National Emergency</h3>
                <a href="tel:112" className="text-blue-600 text-lg font-bold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  112
                </a>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-blue-900 mb-2">Police</h3>
                <a href="tel:100" className="text-blue-600 text-lg font-bold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  100
                </a>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-blue-900 mb-2">Fire</h3>
                <a href="tel:101" className="text-blue-600 text-lg font-bold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  101
                </a>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-blue-900 mb-2">Ambulance</h3>
                <a href="tel:108" className="text-blue-600 text-lg font-bold flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  108
                </a>
              </div>
            </div>
          </div>

          {/* Report Another Incident Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => {
                setShowInstructionsPage(false)
                setPosition(null)
                setDisasterType('')
                setDescription('')
                setLocationName('')
                setSuccess(false)
                setInstructions(null)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Report Another Incident
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Original form view remains same
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Responsive Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            Emergency Helpline
          </h1>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map Section */}
          <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Location Selection</h2>
              {displayCoords && (
                <p className="text-sm text-gray-600 mt-1">
                  Coordinates: {displayCoords.lat.toFixed(6)}, {displayCoords.lng.toFixed(6)}
                </p>
              )}
              {locationName && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {locationName}
                </p>
              )}
            </div>
            
            <div className="p-4">
              <MapContainer
                center={currentLocation || [20.5937, 78.9629]}
                zoom={currentLocation ? 16 : 5}
                className="h-[400px] rounded-lg shadow-inner"
                scrollWheelZoom={true}
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {position && <Marker position={position} />}
                <LocationMarker setPosition={setPosition} />
                {position && <MapUpdater position={position} />}
              </MapContainer>
              
              <button
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 shadow-md"
              >
                {gettingLocation ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Get Current Location
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Section with Instructions */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* Instructions Alert */}
            {instructions && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                  Important Safety Instructions
                </h3>
                <ul className="list-decimal pl-5 space-y-2">
                  {instructions.map((instruction, index) => (
                    <li key={index} className="text-yellow-700">
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Report Details</h2>
              </div>
              
              <div className="p-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded">
                    <p className="text-green-700">Report submitted successfully! Please follow the safety instructions above.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Disaster Type
                    </label>
                    <select
                      value={disasterType}
                      onChange={(e) => setDisasterType(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select type...</option>
                      <option value="Flood">Flood</option>
                      <option value="Earthquake">Earthquake</option>
                      <option value="Fire">Fire</option>
                      <option value="Cyclone">Cyclone</option>
                      <option value="Landslide">Landslide</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      rows="4"
                      required
                      placeholder="Describe the situation in detail..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200
                      ${loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                      }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Map click handler component
function LocationMarker({ setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, 16);
    },
  });

  return null;
}

function MapUpdater({ position }) {
  const map = useMapEvents({});
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, {
        duration: 2,
        easeLinearity: 0.25
      });
    }
  }, [map, position]);

  return null;
}

export default Consumer
