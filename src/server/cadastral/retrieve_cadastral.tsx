'use server'

// Types for the cadastral API response (updated to match actual API)
interface CadastralResponse {
  consulta_dnprcResult: {
    control: {
      cudnp: number;
      cucons: number;
    };
    bico: {
      bi: {
        idbi: {
          cn: string;
          rc: {
            pc1: string;
            pc2: string;
            car: string;
            cc1: string;
            cc2: string;
          };
        };
        dt: {
          loine: {
            cp: string;
            cm: string;
          };
          cmc: string;
          np: string; // Province
          nm: string; // Municipality
          locs: {
            lous: {
              lourb: {
                dir: {
                  cv: string;
                  tv: string; // Street type (CL, AV, etc.)
                  nv: string; // Street name
                  pnp: string; // Number
                  snp: string; // Sub-number
                };
                loint: {
                  es: string; // Staircase
                  pt: string; // Floor
                  pu: string; // Door
                };
                dp: string; // Postal code
                dm: string; // District
              };
            };
          };
        };
        ldt: string; // Full address text
        debi: {
          luso: string; // Usage
          sfc: string; // Built surface area
          ant: string; // Year built
        };
      };
      lcons: Array<{
        lcd: string; // Construction type
        dt: {
          lourb: {
            loint: {
              es: string;
              pt: string;
              pu: string;
            };
          };
        };
        dfcons: {
          stl: string; // Surface area
        };
        dvcons: {
          dtip: string; // Property type description
        };
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
  
  return streetTypes[abbreviation] || abbreviation;
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
    console.log('🔍 Retrieving cadastral data for reference:', cadastralReference);
    
    // Use the correct API URL
    const apiUrl = `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPRC?RefCat=${cadastralReference}`;
    
    console.log('🌐 API URL:', apiUrl);
    
    // Make the API call
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

    const data: CadastralResponse = await response.json();
    console.log('📊 Raw cadastral API response:', JSON.stringify(data, null, 2));

    // Extract and format the data
    const bi = data.consulta_dnprcResult.bico.bi;
    const dt = bi.dt;
    const debi = bi.debi;
    const dir = dt.locs.lous.lourb.dir;
    const loint = dt.locs.lous.lourb.loint;

    console.log('🏠 Building address from cadastral data:');
    console.log('  - Street type:', dir.tv);
    console.log('  - Street name:', dir.nv);
    console.log('  - Number:', dir.pnp);
    console.log('  - Staircase:', loint.es);
    console.log('  - Floor:', loint.pt);
    console.log('  - Door:', loint.pu);
    console.log('  - Usage:', debi.luso);
    console.log('  - Surface area:', debi.sfc);
    console.log('  - Year built:', debi.ant);
    console.log('  - Municipality:', dt.nm);
    console.log('  - Province:', dt.np);
    console.log('  - Postal code:', dt.locs.lous.lourb.dp);

    // Format street type and name
    const formattedStreetType = formatStreetType(dir.tv);
    const formattedStreetName = formatStreetName(dir.nv);
    
    // Build the street address
    const street = `${formattedStreetType} ${formattedStreetName}, ${dir.pnp}`;
    
    // Build address details (floor, door, etc.)
    const addressDetails = `${loint.es}ª ${loint.pt}º ${loint.pu}`;

    // Convert surface area to number
    const squareMeter = parseFloat(debi.sfc) || 0;
    const builtSurfaceArea = parseFloat(debi.sfc) || 0;

    // Convert year built to number
    const yearBuilt = parseInt(debi.ant) || 0;

    // Determine property type based on usage and construction type
    const getPropertyType = (usage: string, constructionType?: string): string => {
      const usageLower = usage.toLowerCase();
      const constructionLower = constructionType?.toLowerCase() || '';
      
      if (usageLower.includes('vivienda') || usageLower.includes('residencial') || constructionLower.includes('vivienda')) {
        return 'piso';
      } else if (usageLower.includes('comercial') || usageLower.includes('local')) {
        return 'local';
      } else if (usageLower.includes('garaje') || usageLower.includes('parking')) {
        return 'garaje';
      } else if (usageLower.includes('solar') || usageLower.includes('terreno')) {
        return 'solar';
      }
      return 'piso'; // Default to apartment
    };

    // Get construction type from lcons if available
    const constructionType = data.consulta_dnprcResult.bico.lcons[0]?.lcd;
    const propertyType = getPropertyType(debi.luso, constructionType);

    // Format the response
    const formattedData: FormattedCadastralData = {
      street,
      addressDetails,
      squareMeter,
      builtSurfaceArea,
      yearBuilt,
      propertyType,
      municipality: dt.nm,
      neighborhood: dt.nm, // Using municipality as neighborhood since API doesn't provide specific neighborhood
      postalCode: dt.locs.lous.lourb.dp
    };

    console.log('✅ Formatted cadastral data:', formattedData);

    return formattedData;

  } catch (error) {
    console.error('❌ Error retrieving cadastral data:', error);
    return null;
  }
}
