'use server'

import { retrieveGeocodingData } from "../googlemaps/retrieve_geo"

// Types for the cadastral API response
interface CadastralResponse {
  consulta_dnprcResult: {
    bico: {
      bi: {
        dt: {
          np: string; // Province
          nm: string; // Municipality
          locs: {
            lous: {
              lourb: {
                dir: {
                  tv: string; // Street type (CL, AV, etc.)
                  nv: string; // Street name
                  pnp: string; // Number
                };
                loint: {
                  es: string; // Staircase
                  pt: string; // Floor
                  pu: string; // Door
                };
                dp: string; // Postal code
              };
            };
          };
        };
        debi: {
          luso: string; // Usage
          sfc: string; // Built surface area
          ant: string; // Year built
        };
      };
      lcons: Array<{
        lcd: string; // Construction type
      }>;
    };
  };
}

// Formatted cadastral data for database
interface FormattedCadastralData {
  street: string;
  addressDetails: string;
  squareMeter: number;
  builtSurfaceArea: number;
  yearBuilt: number;
  propertyType: string;
  municipality: string;
  neighborhood: string;
  postalCode: string;
  latitude?: string;
  longitude?: string;
  neighborhoodId?: number;
  city?: string;
  province?: string;
}

// Format street type abbreviations to full names
function formatStreetType(abbreviation: string): string {
  const streetTypes: Record<string, string> = {
    'CL': 'Calle',
    'AV': 'Avenida',
    'PL': 'Plaza',
    'PS': 'Paseo',
    'CR': 'Carrera',
    'TR': 'Travesía',
    'CT': 'Cuesta',
    'GL': 'Glorieta',
    'RD': 'Ronda',
    'CM': 'Camino',
    'PG': 'Paseo',
    'PZ': 'Plaza',
    'VR': 'Vereda'
  };
  
  return streetTypes[abbreviation] ?? abbreviation;
}

// Format street name with proper capitalization
function formatStreetName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Retrieve cadastral data from the API
export async function retrieveCadastralData(cadastralReference: string): Promise<FormattedCadastralData | null> {
  try {
    const apiUrl = `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPRC?RefCat=${cadastralReference}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; RealEstateApp/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as CadastralResponse;

    const bi = data.consulta_dnprcResult.bico.bi;
    const dt = bi.dt;
    const debi = bi.debi;
    const dir = dt.locs.lous.lourb.dir;
    const loint = dt.locs.lous.lourb.loint;

    const formattedStreetType = formatStreetType(dir.tv);
    const formattedStreetName = formatStreetName(dir.nv);
    
    const street = `${formattedStreetType} ${formattedStreetName}, ${dir.pnp}`;
    
    const fullAddress = `${street}, ${dt.nm}, ${dt.np}, España`;
    const geoData = await retrieveGeocodingData(fullAddress);
    
    const addressDetails = `${loint.es}ª ${loint.pt}º ${loint.pu}`;

    const squareMeter = parseFloat(debi.sfc) || 0;
    const builtSurfaceArea = parseFloat(debi.sfc) || 0;
    const yearBuilt = parseInt(debi.ant) || 0;

    const getPropertyType = (usage: string, constructionType?: string): string => {
      const usageLower = usage.toLowerCase();
      const constructionLower = constructionType?.toLowerCase() ?? '';
      
      if (usageLower.includes('vivienda') || usageLower.includes('residencial') || constructionLower.includes('vivienda')) {
        return 'piso';
      } else if (usageLower.includes('comercial') || usageLower.includes('local')) {
        return 'local';
      } else if (usageLower.includes('garaje') || usageLower.includes('parking')) {
        return 'garaje';
      } else if (usageLower.includes('solar') || usageLower.includes('terreno')) {
        return 'solar';
      }
      return 'piso';
    };

    const constructionType = data.consulta_dnprcResult.bico.lcons[0]?.lcd;
    const propertyType = getPropertyType(debi.luso, constructionType);

    const neighborhood = geoData?.neighborhood ?? dt.nm;
    const municipality = geoData?.municipality ?? dt.nm;
    const city = geoData?.city ?? dt.np;
    const province = geoData?.province ?? dt.np;

    const formattedData: FormattedCadastralData = {
      street,
      addressDetails,
      squareMeter,
      builtSurfaceArea,
      yearBuilt,
      propertyType,
      municipality,
      neighborhood,
      postalCode: dt.locs.lous.lourb.dp,
      latitude: geoData?.latitude,
      longitude: geoData?.longitude,
      neighborhoodId: geoData?.neighborhoodId,
      city,
      province
    };

    return formattedData;

  } catch {
    return null;
  }
}
