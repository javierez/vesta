"use server";

import { retrieveGeocodingData } from "../googlemaps/retrieve_geo";

// Types for the cadastral API response
interface CadastralResponse {
  consulta_dnprcResult?: {
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
        idbi?: {
          rc?: {
            pc1: string;
            pc2: string;
          };
        };
      };
      lcons: Array<{
        lcd: string; // Construction type
      }>;
    };
  };
  consulta_dnplocResult?: {
    control: {
      cuerr: number;
    };
    lerr?: Array<{
      cod: string;
      des: string;
    }>;
    bico?: {
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
        idbi?: {
          rc?: {
            pc1: string;
            pc2: string;
          };
        };
      };
      lcons?: Array<{
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
    CL: "Calle",
    AV: "Avenida",
    PL: "Plaza",
    PS: "Paseo",
    CR: "Carrera",
    TR: "Travesía",
    CT: "Cuesta",
    GL: "Glorieta",
    RD: "Ronda",
    CM: "Camino",
    PG: "Paseo",
    PZ: "Plaza",
    VR: "Vereda",
  };

  return streetTypes[abbreviation] ?? abbreviation;
}

// Format street name with proper capitalization
function formatStreetName(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Types for location search response
interface CadastralSearchResult {
  cadastralReference: string;
  street: string;
  addressDetails: string;
  postalCode: string;
  city?: string;
  province?: string;
  municipality: string;
  builtSurfaceArea: number;
  yearBuilt: number;
}

// Types for data comparison
export interface CadastralDiscrepancy {
  field: string;
  fieldLabel: string;
  current: string;
  suggested: string;
}

export interface CadastralComparisonResult {
  hasDiscrepancies: boolean;
  differences: CadastralDiscrepancy[];
}

// Normalize string for comparison (lowercase, trim, remove accents)
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Compare cadastral data with current form data
export async function compareCadastralData(
  currentData: {
    street?: string;
    postalCode?: string;
    city?: string;
    province?: string;
  },
  cadastralData: FormattedCadastralData,
): Promise<CadastralComparisonResult> {
  console.log("🔍 [Catastro Comparison] ========================================");
  console.log("🔍 [Catastro Comparison] STARTING DATA COMPARISON");
  console.log("🔍 [Catastro Comparison] ========================================");
  console.log("📋 [Catastro Comparison] Current form data:", currentData);
  console.log("📋 [Catastro Comparison] Official cadastral data:", cadastralData);

  const differences: CadastralDiscrepancy[] = [];

  // Compare street
  if (currentData.street && cadastralData.street) {
    const currentStreet = normalizeString(currentData.street);
    const cadastralStreet = normalizeString(cadastralData.street);
    console.log("🏠 [Catastro Comparison] Street comparison:", {
      original: { current: currentData.street, cadastral: cadastralData.street },
      normalized: { current: currentStreet, cadastral: cadastralStreet },
      match: currentStreet === cadastralStreet,
    });
    if (currentStreet !== cadastralStreet) {
      differences.push({
        field: "street",
        fieldLabel: "Calle",
        current: currentData.street,
        suggested: cadastralData.street,
      });
      console.log("⚠️ [Catastro Comparison] Street mismatch detected");
    }
  }

  // Compare postal code
  if (currentData.postalCode && cadastralData.postalCode) {
    const currentPostal = normalizeString(currentData.postalCode);
    const cadastralPostal = normalizeString(cadastralData.postalCode);
    console.log("📮 [Catastro Comparison] Postal code comparison:", {
      original: { current: currentData.postalCode, cadastral: cadastralData.postalCode },
      normalized: { current: currentPostal, cadastral: cadastralPostal },
      match: currentPostal === cadastralPostal,
    });
    if (currentPostal !== cadastralPostal) {
      differences.push({
        field: "postalCode",
        fieldLabel: "Código Postal",
        current: currentData.postalCode,
        suggested: cadastralData.postalCode,
      });
      console.log("⚠️ [Catastro Comparison] Postal code mismatch detected");
    }
  }

  // Compare city
  if (currentData.city && cadastralData.city) {
    const currentCity = normalizeString(currentData.city);
    const cadastralCity = normalizeString(cadastralData.city);
    console.log("🏙️ [Catastro Comparison] City comparison:", {
      original: { current: currentData.city, cadastral: cadastralData.city },
      normalized: { current: currentCity, cadastral: cadastralCity },
      match: currentCity === cadastralCity,
    });
    if (currentCity !== cadastralCity) {
      differences.push({
        field: "city",
        fieldLabel: "Ciudad",
        current: currentData.city,
        suggested: cadastralData.city,
      });
      console.log("⚠️ [Catastro Comparison] City mismatch detected");
    }
  }

  // Compare province
  if (currentData.province && cadastralData.province) {
    const currentProvince = normalizeString(currentData.province);
    const cadastralProvince = normalizeString(cadastralData.province);
    console.log("🗺️ [Catastro Comparison] Province comparison:", {
      original: { current: currentData.province, cadastral: cadastralData.province },
      normalized: { current: currentProvince, cadastral: cadastralProvince },
      match: currentProvince === cadastralProvince,
    });
    if (currentProvince !== cadastralProvince) {
      differences.push({
        field: "province",
        fieldLabel: "Provincia",
        current: currentData.province,
        suggested: cadastralData.province,
      });
      console.log("⚠️ [Catastro Comparison] Province mismatch detected");
    }
  }

  const result = {
    hasDiscrepancies: differences.length > 0,
    differences,
  };

  console.log("✅ [Catastro Comparison] ========================================");
  console.log("✅ [Catastro Comparison] COMPARISON COMPLETED");
  console.log("✅ [Catastro Comparison] ========================================");
  console.log("📊 [Catastro Comparison] Final comparison result:", result);
  console.log(`📊 [Catastro Comparison] Found ${differences.length} discrepancies`);

  return result;
}

// Map common province names to Catastro API province names
function mapProvinceName(province: string): string {
  const provinceMapping: Record<string, string> = {
    "Comunidad de Madrid": "Madrid",
    "Madrid": "Madrid",
    "Comunidad Valenciana": "Valencia",
    "Valencia": "Valencia",
    "Cataluña": "Barcelona",
    "Barcelona": "Barcelona",
    "Andalucía": "Sevilla",
    "Sevilla": "Sevilla",
    "Castilla y León": "Valladolid",
    "Valladolid": "Valladolid",
    "Galicia": "A Coruña",
    "A Coruña": "A Coruña",
    "País Vasco": "Vizcaya",
    "Vizcaya": "Vizcaya",
    "Canarias": "Las Palmas",
    "Las Palmas": "Las Palmas",
    "Islas Baleares": "Baleares",
    "Baleares": "Baleares",
    "Aragón": "Zaragoza",
    "Zaragoza": "Zaragoza",
    "Castilla-La Mancha": "Toledo",
    "Toledo": "Toledo",
    "Extremadura": "Badajoz",
    "Badajoz": "Badajoz",
    "Asturias": "Asturias",
    "Principado de Asturias": "Asturias",
    "Cantabria": "Cantabria",
    "La Rioja": "La Rioja",
    "Navarra": "Navarra",
    "Murcia": "Murcia",
    "Región de Murcia": "Murcia",
  };

  return provinceMapping[province] || province;
}

// Clean street name by removing trailing commas and extra spaces
function cleanStreetName(streetName: string): string {
  return streetName.replace(/,\s*$/, "").trim();
}

// Normalize text for Catastro API - removes accents, commas, converts to uppercase
function normalizeCatastroText(str: string): string {
  return str
    .normalize("NFD")              // split accent marks
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/,/g, "")             // remove commas
    .trim()
    .toUpperCase();                // Catastro expects uppercase
}

// Normalize street name specifically for Catastro API - removes street type prefixes
function normalizeCatastroStreetName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // remove accents
    .replace(/^(CALLE|CL|AVENIDA|AVDA|AVD|PASEO|PS|CARRERA|CR|TRAVESIA|TR|CALLE DE|AVENIDA DE|PASEO DE|CARRERA DE)\s+/i, "") // remove street type prefixes
    .replace(/,/g, "")             // remove commas
    .trim()
    .toUpperCase();
}

// Validate and clean street number for Catastro API - must be up to 4 digits
function validateCatastroStreetNumber(number: string): string {
  // Extract only digits from the input
  const digitsOnly = number.replace(/\D/g, "");
  
  // Validate: must be 1-4 digits (Catastro requirement)
  if (digitsOnly.length === 0) {
    throw new Error("Street number is required and must contain at least one digit");
  }
  
  if (digitsOnly.length > 4) {
    throw new Error(`Street number must be up to 4 digits, got ${digitsOnly.length} digits: ${digitsOnly}`);
  }
  
  return digitsOnly;
}

// Search for cadastral references by location
export async function searchCadastralByLocation(params: {
  province: string;
  municipality: string;
  streetType?: string;
  streetName: string;
  streetNumber: string;
}): Promise<CadastralSearchResult[]> {
  try {
    console.log("🔍 [Catastro Search] ========================================");
    console.log("🔍 [Catastro Search] STARTING SEARCH BY LOCATION");
    console.log("🔍 [Catastro Search] ========================================");
    console.log("📋 [Catastro Search] Input parameters:", {
      province: params.province,
      municipality: params.municipality,
      streetType: params.streetType || "CL",
      streetName: params.streetName,
      streetNumber: params.streetNumber,
    });

    // Map province name to correct Catastro API format
    const mappedProvince = mapProvinceName(params.province);
    const cleanedStreetName = cleanStreetName(params.streetName);
    
    // Validate and clean street number
    const validatedNumber = validateCatastroStreetNumber(params.streetNumber);
    
    // Normalize all text parameters for Catastro API strict matching
    const normalizedParams = {
      Provincia: normalizeCatastroText(mappedProvince),
      Municipio: normalizeCatastroText(params.municipality),
      TipoVia: params.streetType || "CL",
      NombreVia: normalizeCatastroStreetName(cleanedStreetName),
      Numero: validatedNumber,
    };
    
    console.log("🔧 [Catastro Search] Parameter transformation:", {
      original: {
        province: params.province,
        municipality: params.municipality,
        streetName: params.streetName,
        streetNumber: params.streetNumber,
      },
      mapped: {
        province: mappedProvince,
        streetName: cleanedStreetName,
      },
      normalized: normalizedParams,
      streetTransformation: {
        original: params.streetName,
        cleaned: cleanedStreetName,
        normalized: normalizedParams.NombreVia,
        prefixesRemoved: !cleanedStreetName.toUpperCase().includes(normalizedParams.NombreVia),
      },
      numberTransformation: {
        original: params.streetNumber,
        validated: validatedNumber,
        digitsOnly: validatedNumber,
        length: validatedNumber.length,
      },
    });

    // Build the API URL for location-based search
    const baseUrl = "https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPLOC";
    
    // URL encode parameters
    const queryParams = new URLSearchParams({
      Provincia: normalizedParams.Provincia,
      Municipio: normalizedParams.Municipio,
      TipoVia: normalizedParams.TipoVia,
      NombreVia: normalizedParams.NombreVia,
      Numero: normalizedParams.Numero,
    });

    const apiUrl = `${baseUrl}?${queryParams.toString()}`;

    console.log("🌐 [Catastro Search] API URL:", apiUrl);
    console.log("🌐 [Catastro Search] Query parameters:", Object.fromEntries(queryParams.entries()));

    console.log("📡 [Catastro Search] Making API request...");
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; RealEstateApp/1.0)",
      },
    });

    console.log("📡 [Catastro Search] Response status:", response.status);
    console.log("📡 [Catastro Search] Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error("❌ [Catastro Search] HTTP error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("❌ [Catastro Search] Error response body:", errorText);
      return [];
    }

    const responseText = await response.text();
    console.log("📄 [Catastro Search] Raw response body:", responseText);

    let data: CadastralResponse;
    try {
      data = JSON.parse(responseText) as CadastralResponse;
      console.log("📊 [Catastro Search] Parsed JSON response:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error("❌ [Catastro Search] JSON parse error:", parseError);
      console.error("❌ [Catastro Search] Response that failed to parse:", responseText);
      return [];
    }

    // The response can contain multiple properties at the same address
    const results: CadastralSearchResult[] = [];

    console.log("🔍 [Catastro Search] Processing response data...");
    console.log("🔍 [Catastro Search] Response structure:", {
      hasConsulta_dnprcResult: !!data.consulta_dnprcResult,
      hasConsulta_dnplocResult: !!data.consulta_dnplocResult,
      hasBico: !!data.consulta_dnprcResult?.bico,
      hasBi: !!data.consulta_dnprcResult?.bico?.bi,
    });

    // Check for API errors first
    const responseResult = data.consulta_dnplocResult || data.consulta_dnprcResult;
    if (responseResult && 'control' in responseResult && responseResult.control?.cuerr > 0) {
      const error = responseResult.lerr?.[0];
      const errorMessage = `[Catastro] ${error?.cod || 'Unknown'}: ${error?.des || 'Unknown error'}`;
      console.error("❌ [Catastro Search] API returned error:", errorMessage);
      throw new Error(errorMessage);
    }

    // Check if we have the expected data structure
    if (!responseResult?.bico) {
      console.error("❌ [Catastro Search] No cadastral data found in response");
      return [];
    }

    const bi = responseResult.bico.bi;
    console.log("🔍 [Catastro Search] BI data type:", Array.isArray(bi) ? "Array" : "Object");
    console.log("🔍 [Catastro Search] BI data:", bi);
    
    // Handle if bi is an array or single object
    const biArray = Array.isArray(bi) ? bi : [bi];
    console.log("🔍 [Catastro Search] Processing", biArray.length, "BI items");

    for (let i = 0; i < biArray.length; i++) {
      const biItem = biArray[i];
      console.log(`🔍 [Catastro Search] Processing BI item ${i + 1}:`, biItem);

      const dt = biItem.dt;
      const debi = biItem.debi;
      const dir = dt.locs.lous.lourb.dir;
      const loint = dt.locs.lous.lourb.loint;

      console.log(`🔍 [Catastro Search] BI item ${i + 1} components:`, {
        dt: dt,
        debi: debi,
        dir: dir,
        loint: loint,
      });

      const formattedStreetType = formatStreetType(dir.tv);
      const formattedStreetName = formatStreetName(dir.nv);
      const street = `${formattedStreetType} ${formattedStreetName}, ${dir.pnp}`;
      const addressDetails = `${loint.es}ª ${loint.pt}º ${loint.pu}`;
      
      const builtSurfaceArea = parseFloat(debi.sfc) || 0;
      const yearBuilt = parseInt(debi.ant) || 0;

      // Get cadastral reference from the response
      const cadastralReference = biItem.idbi?.rc?.pc1 && biItem.idbi?.rc?.pc2
        ? `${biItem.idbi.rc.pc1}${biItem.idbi.rc.pc2}`
        : "";

      const result = {
        cadastralReference,
        street,
        addressDetails,
        postalCode: dt.locs.lous.lourb.dp,
        city: dt.np,
        province: dt.np,
        municipality: dt.nm,
        builtSurfaceArea,
        yearBuilt,
      };

      console.log(`🔍 [Catastro Search] Formatted result ${i + 1}:`, result);
      results.push(result);
    }

    console.log("✅ [Catastro Search] ========================================");
    console.log("✅ [Catastro Search] SEARCH COMPLETED SUCCESSFULLY");
    console.log("✅ [Catastro Search] ========================================");
    console.log(`✅ [Catastro Search] Found ${results.length} potential references`);
    console.log("✅ [Catastro Search] Final results:", results);
    return results;
  } catch (error) {
    console.error("❌ [Catastro Search] ========================================");
    console.error("❌ [Catastro Search] SEARCH FAILED WITH ERROR");
    console.error("❌ [Catastro Search] ========================================");
    console.error("❌ [Catastro Search] Error:", error);
    console.error("❌ [Catastro Search] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return [];
  }
}

// Retrieve cadastral data from the API
export async function retrieveCadastralData(
  cadastralReference: string,
): Promise<FormattedCadastralData | null> {
  try {
    console.log("🔍 [Catastro Validation] ========================================");
    console.log("🔍 [Catastro Validation] STARTING VALIDATION BY REFERENCE");
    console.log("🔍 [Catastro Validation] ========================================");
    console.log("📋 [Catastro Validation] Input cadastral reference:", cadastralReference);

    const apiUrl = `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPRC?RefCat=${cadastralReference}`;

    console.log("🌐 [Catastro Validation] API URL:", apiUrl);

    console.log("📡 [Catastro Validation] Making API request...");
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; RealEstateApp/1.0)",
      },
    });

    console.log("📡 [Catastro Validation] Response status:", response.status);
    console.log("📡 [Catastro Validation] Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error("❌ [Catastro Validation] HTTP error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("❌ [Catastro Validation] Error response body:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log("📄 [Catastro Validation] Raw response body:", responseText);

    let data: CadastralResponse;
    try {
      data = JSON.parse(responseText) as CadastralResponse;
      console.log("📊 [Catastro Validation] Parsed JSON response:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error("❌ [Catastro Validation] JSON parse error:", parseError);
      console.error("❌ [Catastro Validation] Response that failed to parse:", responseText);
      throw parseError;
    }

    console.log("🔍 [Catastro Validation] Processing response data...");
    console.log("🔍 [Catastro Validation] Response structure:", {
      hasConsulta_dnprcResult: !!data.consulta_dnprcResult,
      hasConsulta_dnplocResult: !!data.consulta_dnplocResult,
      hasBico: !!data.consulta_dnprcResult?.bico,
      hasBi: !!data.consulta_dnprcResult?.bico?.bi,
    });

    // Check for API errors first
    const responseResult = data.consulta_dnprcResult || data.consulta_dnplocResult;
    if (responseResult && 'control' in responseResult && responseResult.control?.cuerr > 0) {
      const error = responseResult.lerr?.[0];
      const errorMessage = `[Catastro] ${error?.cod || 'Unknown'}: ${error?.des || 'Unknown error'}`;
      console.error("❌ [Catastro Validation] API returned error:", errorMessage);
      throw new Error(errorMessage);
    }

    // Check if we have the expected data structure
    if (!responseResult?.bico) {
      console.error("❌ [Catastro Validation] No cadastral data found in response");
      throw new Error("No cadastral data found");
    }

    const bi = responseResult.bico.bi;
    const dt = bi.dt;
    const debi = bi.debi;
    const dir = dt.locs.lous.lourb.dir;
    const loint = dt.locs.lous.lourb.loint;

    console.log("🔍 [Catastro Validation] Extracted components:", {
      bi: bi,
      dt: dt,
      debi: debi,
      dir: dir,
      loint: loint,
    });

    const formattedStreetType = formatStreetType(dir.tv);
    const formattedStreetName = formatStreetName(dir.nv);

    const street = `${formattedStreetType} ${formattedStreetName}, ${dir.pnp}`;

    const fullAddress = `${street}, ${dt.nm}, ${dt.np}, España`;
    console.log("🌍 [Catastro Validation] Full address for geocoding:", fullAddress);

    const geoData = await retrieveGeocodingData(fullAddress);
    console.log("🌍 [Catastro Validation] Geocoding result:", geoData);

    const addressDetails = `${loint.es}ª ${loint.pt}º ${loint.pu}`;

    const squareMeter = parseFloat(debi.sfc) || 0;
    const builtSurfaceArea = parseFloat(debi.sfc) || 0;
    const yearBuilt = parseInt(debi.ant) || 0;

    console.log("📐 [Catastro Validation] Property dimensions:", {
      squareMeter,
      builtSurfaceArea,
      yearBuilt,
    });

    const getPropertyType = (
      usage: string,
      constructionType?: string,
    ): string => {
      const usageLower = usage.toLowerCase();
      const constructionLower = constructionType?.toLowerCase() ?? "";

      console.log("🏠 [Catastro Validation] Property type analysis:", {
        usage,
        constructionType,
        usageLower,
        constructionLower,
      });

      if (
        usageLower.includes("vivienda") ||
        usageLower.includes("residencial") ||
        constructionLower.includes("vivienda")
      ) {
        return "piso";
      } else if (
        usageLower.includes("comercial") ||
        usageLower.includes("local")
      ) {
        return "local";
      } else if (
        usageLower.includes("garaje") ||
        usageLower.includes("parking")
      ) {
        return "garaje";
      } else if (
        usageLower.includes("solar") ||
        usageLower.includes("terreno")
      ) {
        return "solar";
      }
      return "piso";
    };

    const constructionType = responseResult.bico.lcons?.[0]?.lcd;
    const propertyType = getPropertyType(debi.luso, constructionType);

    console.log("🏠 [Catastro Validation] Property type result:", {
      usage: debi.luso,
      constructionType,
      finalPropertyType: propertyType,
    });

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
      province,
    };

    console.log("✅ [Catastro Validation] ========================================");
    console.log("✅ [Catastro Validation] VALIDATION COMPLETED SUCCESSFULLY");
    console.log("✅ [Catastro Validation] ========================================");
    console.log("✅ [Catastro Validation] Final formatted data:", formattedData);

    return formattedData;
  } catch (error) {
    console.error("❌ [Catastro Validation] ========================================");
    console.error("❌ [Catastro Validation] VALIDATION FAILED WITH ERROR");
    console.error("❌ [Catastro Validation] ========================================");
    console.error("❌ [Catastro Validation] Error:", error);
    console.error("❌ [Catastro Validation] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return null;
  }
}
