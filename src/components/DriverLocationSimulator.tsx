import React, { useState, useEffect, useRef } from 'react';
import { DriverLocationSimulator } from '../simulation/DriverLocationSimulator';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface DriverLocationSimulatorProps {
  driverId?: number;
}

const DriverLocationSimulatorComponent: React.FC<DriverLocationSimulatorProps> = ({ 
  driverId = 1 
}) => {
  const [simulator, setSimulator] = useState<DriverLocationSimulator | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newSimulator = new DriverLocationSimulator(driverId, 3000);
    setSimulator(newSimulator);
    
    // Override console methods to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      setLogs(prev => [...prev.slice(-19), args.join(' ')]);
      originalLog(...args);
    };
    
    console.error = (...args) => {
      setLogs(prev => [...prev.slice(-19), `ERROR: ${args.join(' ')}`]);
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      if (simulator?.isSimulatorRunning()) {
        simulator.stop();
      }
    };
  }, [driverId]);

  const startSimulation = async () => {
    if (simulator && !isRunning) {
      try {
        await simulator.start();
        setIsRunning(true);
        
        // Update location display
        intervalRef.current = setInterval(() => {
          const location = simulator.getCurrentLocation();
          setCurrentLocation(location);
        }, 1000);
      } catch (error) {
        console.error('Failed to start simulation:', error);
      }
    }
  };

  const stopSimulation = () => {
    if (simulator && isRunning) {
      simulator.stop();
      setIsRunning(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const runOnce = async () => {
    if (simulator && !isRunning) {
      await simulator.runOnce();
      const location = simulator.getCurrentLocation();
      setCurrentLocation(location);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <h2 className="text-2xl font-bold mb-4">Driver Location Simulator</h2>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={startSimulation}
            disabled={isRunning}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300 hover:bg-green-600"
          >
            Start Simulation
          </button>
          
          <button
            onClick={stopSimulation}
            disabled={!isRunning}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300 hover:bg-red-600"
          >
            Stop Simulation
          </button>
          
          <button
            onClick={runOnce}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600"
          >
            Run Once
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Location</h3>
            {currentLocation ? (
              <div className="bg-gray-100 p-3 rounded">
                <p><strong>Latitude:</strong> {currentLocation.lat.toFixed(6)}</p>
                <p><strong>Longitude:</strong> {currentLocation.lng.toFixed(6)}</p>
              </div>
            ) : (
              <p className="text-gray-500">No location data</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Simulation Logs</h3>
            <div className="bg-gray-100 p-3 rounded h-32 overflow-y-auto font-mono text-sm">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="text-xs">{log}</div>
                ))
              ) : (
                <div className="text-gray-500">No logs yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {currentLocation && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Live Map View</h3>
          <MapContainer
            center={[currentLocation.lat, currentLocation.lng]}
            zoom={13}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[currentLocation.lat, currentLocation.lng]}>
              <Popup>
                Driver {driverId} Location<br />
                Lat: {currentLocation.lat.toFixed(6)}<br />
                Lng: {currentLocation.lng.toFixed(6)}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default DriverLocationSimulatorComponent;
