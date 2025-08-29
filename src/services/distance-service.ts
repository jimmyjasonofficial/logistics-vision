t'use server';

/**
 * Distance service to compute travel distance and cost between two points using Google Maps Distance Matrix API.
 * Provide origin and destination as human-readable strings (e.g., "Windhoek, Namibia"), place IDs, or latitude/longitude coordinates.
 */

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Calculate the distance between two locations in kilometers using Google Maps Distance Matrix API
export async function getDistanceKm(origin: string, destination: string): Promise<number> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment.');
  }

  const params = new URLSearchParams({
    origins: origin,
    destinations: destination,
    key: GOOGLE_MAPS_API_KEY,
    units: 'metric'
  });

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch distance matrix: ${response.statusText}`);
  }
  const data = await response.json();
  if (data.status !== 'OK') {
    throw new Error(`Distance Matrix API error: ${data.status}`);
  }
  const element = data.rows[0]?.elements[0];
  if (!element || element.status !== 'OK') {
    throw new Error(`No route found between ${origin} and ${destination}`);
  }
  // Distance.value is in meters; convert to kilometers
  return element.distance.value / 1000;
}

// Calculate transportation cost based on distance and rate per kilometer
export function calculateTransportCost(distanceKm: number, ratePerKm: number): number {
  return distanceKm * ratePerKm;
  
}
