export type PropertyType = "piso" | "casa" | "local" | "solar" | "garaje" | "any"

export interface SearchParams {
  location?: string
  propertyType?: PropertyType
  bedrooms?: string
  bathrooms?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  status?: "for-sale" | "for-rent" | "any"
}

// Convert search params to URL slug
export function buildSearchSlug(params: SearchParams): string {
  const segments: string[] = []

  // Add property type and status
  let typeSegment = ""
  if (params.status === "for-rent") {
    typeSegment = "alquiler"
  } else {
    typeSegment = "venta"
  }

  if (params.propertyType && params.propertyType !== "any") {
    if (params.propertyType === "casa") typeSegment += "-casas"
    else if (params.propertyType === "piso") typeSegment += "-pisos"
    else if (params.propertyType === "local") typeSegment += "-locales"
    else if (params.propertyType === "solar") typeSegment += "-solares"
    else if (params.propertyType === "garaje") typeSegment += "-garajes"
  } else {
    typeSegment += "-propiedades"
  }

  segments.push(typeSegment)

  // Add location
  if (params.location) {
    segments.push(params.location.toLowerCase().replace(/\s+/g, "-"))
  } else {
    segments.push("todas-ubicaciones")
  }

  // Add filters
  const filters: string[] = []

  if (params.minPrice) {
    filters.push(`precio-desde_${params.minPrice}`)
  }

  if (params.maxPrice) {
    filters.push(`precio-hasta_${params.maxPrice}`)
  }

  if (params.minArea) {
    filters.push(`metros-cuadrados-mas-de_${params.minArea}`)
  }

  if (params.maxArea) {
    filters.push(`metros-cuadrados-menos-de_${params.maxArea}`)
  }

  if (params.bedrooms && params.bedrooms !== "any") {
    const bedroomsNum = Number.parseInt(params.bedrooms)
    if (bedroomsNum === 1) {
      filters.push("un-dormitorio")
    } else if (bedroomsNum === 2) {
      filters.push("dos-dormitorios")
    } else if (bedroomsNum === 3) {
      filters.push("tres-dormitorios")
    } else if (bedroomsNum >= 4) {
      filters.push("cuatro-o-mas-dormitorios")
    }
  }

  if (params.bathrooms && params.bathrooms !== "any") {
    const bathroomsNum = Number.parseInt(params.bathrooms)
    if (bathroomsNum === 1) {
      filters.push("un-bano")
    } else if (bathroomsNum === 2) {
      filters.push("dos-banos")
    } else if (bathroomsNum >= 3) {
      filters.push("tres-o-mas-banos")
    }
  }

  // Add filters to URL if any exist
  if (filters.length > 0) {
    segments.push(`con-${filters.join(",")}`)
  }

  return segments.join("/")
}

// Parse URL slug to search params
export function parseSearchSlug(slug: string): SearchParams {
  const params: SearchParams = {}

  // Split the slug into segments
  const segments = slug.split("/").filter(Boolean)

  // Parse property type and status
  if (segments.length > 0) {
    const typeSegment = segments[0] || ""

    if (typeSegment.startsWith("alquiler")) {
      params.status = "for-rent"
    } else {
      params.status = "for-sale"
    }

    if (typeSegment.includes("-casas")) {
      params.propertyType = "casa"
    } else if (typeSegment.includes("-pisos")) {
      params.propertyType = "piso"
    } else if (typeSegment.includes("-locales")) {
      params.propertyType = "local"
    } else if (typeSegment.includes("-solares")) {
      params.propertyType = "solar"
    } else if (typeSegment.includes("-garajes")) {
      params.propertyType = "garaje"
    }
  }

  // Parse location
  if (segments.length > 1 && segments[1] !== "todas-ubicaciones") {
    params.location = (segments[1] ?? "").replace(/-/g, " ")
  }

  // Parse filters
  if (segments.length > 2 && segments[2]?.startsWith("con-")) {
    const filtersString = (segments[2] ?? "").substring(4) // Remove 'con-'
    const filters = filtersString.split(",")

    filters.forEach((filter) => {
      if (filter.startsWith("precio-desde_")) {
        params.minPrice = Number.parseInt(filter.split("_")[1] ?? "0")
      } else if (filter.startsWith("precio-hasta_")) {
        params.maxPrice = Number.parseInt(filter.split("_")[1] ?? "0")
      } else if (filter.startsWith("metros-cuadrados-mas-de_")) {
        params.minArea = Number.parseInt(filter.split("_")[1] ?? "0")
      } else if (filter.startsWith("metros-cuadrados-menos-de_")) {
        params.maxArea = Number.parseInt(filter.split("_")[1] ?? "0")
      } else if (filter === "un-dormitorio") {
        params.bedrooms = "1"
      } else if (filter === "dos-dormitorios") {
        params.bedrooms = "2"
      } else if (filter === "tres-dormitorios") {
        params.bedrooms = "3"
      } else if (filter === "cuatro-o-mas-dormitorios") {
        params.bedrooms = "4"
      } else if (filter === "un-bano") {
        params.bathrooms = "1"
      } else if (filter === "dos-banos") {
        params.bathrooms = "2"
      } else if (filter === "tres-o-mas-banos") {
        params.bathrooms = "3"
      }
    })
  }

  return params
}
