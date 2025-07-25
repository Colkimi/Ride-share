import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const ROUTE_COORDINATES = [
  { lat: -1.2921, lng: 36.8219 }, // Nairobi CBD
  { lat: -1.2841, lng: 36.8233 }, // Kenyatta Avenue
  { lat: -1.2774, lng: 36.8301 }, // University Way
  { lat: -1.2714, lng: 36.8368 }, // Ngong Road
  { lat: -1.2631, lng: 36.8436 }, // Yaya Center
  { lat: -1.2568, lng: 36.8489 }, // Junction Mall
  { lat: -1.2486, lng: 36.8532 }, // Dagoretti Corner
  { lat: -1.2404, lng: 36.8575 }, // Karen
  { lat: -1.2322, lng: 36.8618 }, // Hardy
  { lat: -1.2240, lng: 36.8661 }, // Langata
];

const RETURN_ROUTE = [...ROUTE_COORDINATES].reverse();

const COMPLETE_ROUTE = [...ROUTE_COORDINATES, ...RETURN_ROUTE];

interface Coordinates {
  lat: number;
  lng: number;
}

export class DriverLocationSimulator {
  private driverId: number;
  private intervalMs: number;
  private currentIndex: number;
  private isRunning: boolean;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(driverId: number, intervalMs: number = 5000) {
    this.driverId = driverId;
    this.intervalMs = intervalMs;
    this.currentIndex = 0;
    this.isRunning = false;
  }

  async updateLocation(latitude: number, longitude: number): Promise<boolean> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${BASE_URL}/driver/${this.driverId}/location`,
        {
          latitude,
          longitude,
        },
        {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
        }
      );

      console.log(`✅ Updated location: ${latitude}, ${longitude}`);
      console.log(`   Response:`, response.data.message || 'Success');
      return true;
    } catch (error: any) {
      if (error.response) {
        console.error(`❌ Error updating location: ${error.response.data.message || error.response.statusText}`);
      } else {
        console.error(`❌ Network error: ${error.message}`);
      }
      return false;
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Simulator already running');
      return;
    }

    console.log(`🚗 Starting driver location simulation for driver ID: ${this.driverId}`);
    console.log(`📍 API Base URL: ${BASE_URL}`);
    console.log(`⏱️  Update interval: ${this.intervalMs}ms`);
    console.log(`🛣️  Route has ${COMPLETE_ROUTE.length} waypoints`);
    console.log('');

    this.isRunning = true;
    this.currentIndex = 0;

    const initialCoords = COMPLETE_ROUTE[this.currentIndex];
    await this.updateLocation(initialCoords.lat, initialCoords.lng);

    this.intervalId = setInterval(async () => {
      this.currentIndex = (this.currentIndex + 1) % COMPLETE_ROUTE.length;
      const coords = COMPLETE_ROUTE[this.currentIndex];
      await this.updateLocation(coords.lat, coords.lng);
    }, this.intervalMs);
  }

  stop(): void {
    if (!this.isRunning) {
      console.log('Simulator not running');
      return;
    }

    console.log('🛑 Stopping driver location simulation');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async runOnce(): Promise<void> {
    const coords = COMPLETE_ROUTE[this.currentIndex];
    await this.updateLocation(coords.lat, coords.lng);
    this.currentIndex = (this.currentIndex + 1) % COMPLETE_ROUTE.length;
  }

  getCurrentLocation(): Coordinates {
    return COMPLETE_ROUTE[this.currentIndex];
  }

  isSimulatorRunning(): boolean {
    return this.isRunning;
  }
}
