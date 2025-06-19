'use server'

// Types for Google Geocoding API response
interface GoogleGeocodingResponse {
  results: Array<{
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: string;
      viewport: {
        northeast: {
          lat: number;
          lng: number;
        };
        southwest: {
          lat: number;
          lng: number;
        };
      };
    };
    place_id: string;
    types: string[];
  }>;
  status: string;
}

// Formatted geocoding data
interface FormattedGeoData {
  latitude: string;
  longitude: string;
  neighborhood?: string;
  municipality?: string;
  province?: string;
  formattedAddress?: string;
}

// Retrieve geocoding data from Google Maps API
export async function retrieveGeocodingData(address: string): Promise<FormattedGeoData | null> {
  try {
    console.log('🗺️ Retrieving geocoding data for address:', address);
    
    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY; // Note: This should probably be GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      console.error('❌ Google Maps API key not found in environment variables');
      return null;
    }
    
    // Construct the Google Geocoding API URL
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    console.log('🌐 Google Geocoding API URL:', url);
    
    // Make the API call
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

    const data: GoogleGeocodingResponse = await response.json();
    console.log('📊 Raw Google Geocoding API response:', JSON.stringify(data, null, 2));

    // Check API status
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('❌ Google Geocoding API error:', data.status);
      return null;
    }

    const result = data.results[0];
    if (!result) {
      console.error('❌ No geocoding result found');
      return null;
    }
    
    const location = result.geometry.location;

    console.log('📍 Extracting location data:');
    console.log('  - Latitude:', location.lat);
    console.log('  - Longitude:', location.lng);
    console.log('  - Formatted Address:', result.formatted_address);

    // Extract address components
    let neighborhood: string | undefined;
    let municipality: string | undefined;
    let province: string | undefined;

    result.address_components.forEach(component => {
      console.log('  - Component:', component.long_name, 'Types:', component.types);
      
      // Extract neighborhood (can be in different types)
      if (component.types.includes('neighborhood') || 
          component.types.includes('sublocality_level_1') ||
          component.types.includes('sublocality')) {
        neighborhood = component.long_name;
      }
      
      // Extract municipality/city
      if (component.types.includes('locality') || 
          component.types.includes('administrative_area_level_2')) {
        municipality = component.long_name;
      }
      
      // Extract province/state
      if (component.types.includes('administrative_area_level_1')) {
        province = component.long_name;
      }
    });

    // Format the response
    const formattedData: FormattedGeoData = {
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      neighborhood,
      municipality,
      province,
      formattedAddress: result.formatted_address
    };

    console.log('✅ Formatted geocoding data:', formattedData);

    return formattedData;

  } catch (error) {
    console.error('❌ Error retrieving geocoding data:', error);
    return null;
  }
}
