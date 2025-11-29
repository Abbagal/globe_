// CPEC (China-Pakistan Economic Corridor) constants
const TARGET_VIEW = { lat: 32, lng: 70, altitude: 1.2 };
const CPEC_PATH = [
  [25.1264, 62.3225], // Gwadar Port, Pakistan
  [28.9, 66.5],       // Quetta area, Pakistan
  [33.6844, 73.0479], // Islamabad, Pakistan
  [35.9208, 74.3089], // Gilgit, Pakistan
  [36.85, 75.1],      // Khunjerab Pass (Pakistan-China border)
  [39.4677, 75.9938]  // Kashgar, China
];

interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
  bbox?: [number, number, number, number]; // minLat, maxLat, minLon, maxLon
  isCPEC?: boolean; // Special flag for CPEC route
}

class GeocodingService {
  private cache: Map<string, GeocodeResult>;
  private nominatimBaseUrl: string;

  constructor() {
    this.cache = new Map();
    this.nominatimBaseUrl = 'https://nominatim.openstreetmap.org/search';
  }
  async search(query: string): Promise<GeocodeResult | null> {
    // Check cache first
    if (this.cache.has(query)) {
      return this.cache.get(query) || null;
    }

    // Handle CPEC special case
    if (query.toLowerCase() === 'cpec') {
      const cpecResult: GeocodeResult = {
        lat: TARGET_VIEW.lat,
        lon: TARGET_VIEW.lng,
        displayName: 'China-Pakistan Economic Corridor (CPEC)',
        // Create bounding box that encompasses all CPEC waypoints
        bbox: this.calculateCPECBoundingBox(),
        isCPEC: true
      };
      this.cache.set(query, cpecResult);
      return cpecResult;
    }

    try {
      // Try Nominatim (OpenStreetMap)
      const result = await this.searchNominatim(query);
      if (result) {
        this.cache.set(query, result);
        return result;
      }
      
      // Fallback logic could go here (e.g. Mapbox, Google)
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  private calculateCPECBoundingBox(): [number, number, number, number] {
    // Calculate bounding box for all CPEC waypoints
    const lats = CPEC_PATH.map(point => point[0]);
    const lngs = CPEC_PATH.map(point => point[1]);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    return [minLat, maxLat, minLng, maxLng];
  }

  private async searchNominatim(query: string): Promise<GeocodeResult | null> {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
    });

    const response = await fetch(`${this.nominatimBaseUrl}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      const item = data[0];
      const result: GeocodeResult = {
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        displayName: item.display_name,
        // Nominatim returns boundingbox as [minLat, maxLat, minLon, maxLon] strings
        bbox: item.boundingbox ? [
            parseFloat(item.boundingbox[0]),
            parseFloat(item.boundingbox[1]),
            parseFloat(item.boundingbox[2]),
            parseFloat(item.boundingbox[3])
        ] : undefined
      };
      return result;
    }

    return null;
  }
}

export const geocodingService = new GeocodingService();
export type { GeocodeResult };
