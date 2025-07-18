import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type LocationData = {
  driverId: number;
  latitude: number;
  longitude: number;
};

export function useDriverLocation(driverId: number | null) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!driverId) return;

    const newSocket = io("http://localhost:3000", {
      query: { driverId: driverId.toString() },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to location WebSocket server");
    });

    newSocket.on("locationUpdated", (data: LocationData) => {
      if (data.driverId === driverId) {
        setLocation(data);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from location WebSocket server");
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [driverId]);

  return location;
}
