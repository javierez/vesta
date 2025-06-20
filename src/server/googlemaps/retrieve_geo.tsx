'use server'

import { findOrCreateLocation } from '../queries/locations';

// Types for OpenStreetMap Nominatim API response
interface NominatimResponse {
  lat: string;
  lon: string;
  address: {
    suburb?: string;
    city?: string;
    province?: string;
    state?: string;
  };
}

// Formatted geocoding data
interface FormattedGeoData {
  latitude: string;
  longitude: string;
  neighborhood?: string;
  neighborhoodId?: number;
  city?: string;
  municipality?: string;
  province?: string;
}

// Retrieve geocoding data from OpenStreetMap Nominatim API
export async function retrieveGeocodingData(address: string): Promise<FormattedGeoData | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1`;
    console.log(url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; RealEstateApp/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NominatimResponse[] = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    if (!result) {
      return null;
    }

    const addressData = result.address;
    const neighborhood = addressData.suburb;

    if (!neighborhood) {
      return null;
    }

    let neighborhoodId: number | undefined;
    try {
      const municipality = addressData.city || 'Unknown';
      const province = addressData.province || addressData.state || 'Unknown';
      
      neighborhoodId = await findOrCreateLocation({
        city: municipality,
        province: province,
        municipality: municipality,
        neighborhood: neighborhood
      });
    } catch (error) {
      // Continue without neighborhood ID if there's an error
    }

    const formattedData: FormattedGeoData = {
      latitude: result.lat,
      longitude: result.lon,
      neighborhood,
      neighborhoodId,
      city: addressData.city,
      municipality: addressData.city,
      province: addressData.province || addressData.state
    };

    return formattedData;

  } catch (error) {
    return null;
  }
}
