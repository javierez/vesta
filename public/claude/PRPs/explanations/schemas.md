# Property & Listing Database Field Definitions
**Complete Reference for AI-Powered Data Extraction**

This document defines all database fields for the properties and listings tables with Spanish real estate business rules, constraints, and extraction guidelines.

---

## Properties Table Field Definitions

/**
 * Database field definitions for properties table (physical property attributes)
 * WITH SPANISH REAL ESTATE BUSINESS RULES & CONSTRAINTS
 */

### Basic Information

**title**
```
Property title or name in Spanish.
Auto-generated format: "{PropertyType} en {Street} ({Neighborhood})"
Examples: "Piso en Calle Mayor, 25 (Sol)", "Casa en Avenida Constitución"
Spanish terms: título, titulo, nombre
Max length: 255 characters
```

**description**
```
Detailed property description in Spanish.
Full narrative describing the property, location, features, and selling points.
Spanish terms: descripción, descripcion, detalles, observaciones
Type: text (unlimited)
```

**propertyType** ⚠️ CRITICAL CONSTRAINT
```
Type of property. MUST be one of: piso, casa, local, garaje, solar

Spanish variants to normalize:
  - apartamento, estudio, ático, dúplex, loft, tríplex, bajo → "piso"
  - chalet, casa adosada, casa pareada, bungalow, casa rústica → "casa"
  - local comercial, oficina → "local"
  - plaza de garaje, parking, moto, doble → "garaje"
  - terreno, parcela, suelo → "solar"

IMPORTANT: This field determines which propertySubtype values are valid.
Spanish terms: tipo, tipo de vivienda, tipo propiedad
Max length: 20 characters
```

**propertySubtype** ⚠️ CRITICAL CONSTRAINT
```
Property subtype. MUST match propertyType constraints:

IF propertyType="piso":
  ONLY: "Piso", "Apartment", "Ground floor", "Tríplex", "Dúplex", "Ático",
        "Estudio", "Loft", "Apartamento", "Bajo"

IF propertyType="casa":
  ONLY: "Casa", "Casa adosada", "Casa pareada", "Chalet", "Casa rústica", "Bungalow"

IF propertyType="local":
  ONLY: "Residencial", "Otros", "Mixto residencial", "Oficinas", "Hotel"

IF propertyType="garaje":
  ONLY: "Individual", "Moto", "Doble"

IF propertyType="solar":
  ONLY: "Suelo residencial", "Suelo industrial", "Suelo rústico"

If no valid subtype found, leave NULL.
Spanish terms: subtipo, especialidad
Max length: 50 characters
```

**referenceNumber**
```
Internal reference number for the property.
Format: "#00000001" (8 digits with leading zeros)
Auto-generated on creation if not provided.
Spanish terms: referencia, ref, número de referencia
Max length: 32 characters
```

---

### Measurements & Specifications

**bedrooms**
```
Number of bedrooms.
Range: 0-10 (smallint)
NULL if not mentioned or not applicable (garaje, solar)

Spanish terms: dormitorios, habitaciones, cuartos, dorm, hab, alcobas
Special case: For "local" properties, this represents "estancias" (rooms)

Examples: "3 dormitorios" → 3, "dos habitaciones" → 2
Type: smallint (integer)
```

**bathrooms**
```
Number of bathrooms (can be decimal for half-baths).
Range: 0-10 (decimal with 1 decimal place)
Examples: 1.5 (1 full + 1 half bath), 2.0, 3.5

Spanish terms: baños, aseos, servicios, wc
Format: decimal(3,1)
Examples: "2 baños" → 2.0, "un baño y medio" → 1.5
```

**squareMeter**
```
Total living/usable area in square meters.
Usually the advertised/useful surface area (excluding walls).
Range: 1-10,000 m²

Spanish terms: superficie, metros, m2, m², metros cuadrados, superficie útil
Type: integer
Examples: "120 m²" → 120, "80 metros" → 80

NOTE: For garaje, use builtSurfaceArea instead (squareMeter should be NULL)
```

**builtSurfaceArea**
```
Built surface area in m² (includes walls and common areas).
Usually ≥ squareMeter (typically 10-20% larger)
Range: 1-10,000 m²

Spanish terms: superficie construida, metros construidos, m² construidos
Type: decimal(10,2)
Examples: "135,50 m² construidos" → 135.50

NOTE: For garaje properties, this is the primary size field
```

**yearBuilt**
```
Year the property was built.
Range: 1800 to (current year + 5)
Current valid range: 1800-2030

Spanish terms: año, año construcción, construccion, año edificación
Type: smallint (integer)
Examples: "construido en 2015" → 2015, "año 1990" → 1990
```

**cadastralReference**
```
Spanish cadastral reference (Referencia Catastral).
Unique government identifier for property registration.
Format: 20 alphanumeric characters
Example: "9872023VH4897H0001PZ"

When provided, can auto-populate: street, squareMeter, builtSurfaceArea,
yearBuilt, propertyType, location data, coordinates

Spanish terms: referencia catastral, catastro, RC
Max length: 255 characters
```

---

### Conservation Status ⚠️ NUMERIC CODES ONLY

**conservationStatus**
```
Property condition as NUMERIC CODE (not text!).

Map Spanish terms to codes:
  1 = "Buen estado" (good condition)
  2 = "A reformar" (to be renovated)
  3 = "Casi nuevo" (almost new)
  4 = "Para reformar" (needs renovation)
  6 = "Reformado" (renovated/refurbished)

NOTE: There is NO code 5 in the system!

Spanish terms: estado conservación, estado, condicion, conservación
Type: smallint (integer)
IMPORTANT: Return the NUMBER (1-6), not the Spanish text
NULL if not mentioned
```

---

### Location Information

**street**
```
Street address with number.

Standardize Spanish addresses:
  c/ → Calle
  av. → Avenida
  av → Avenida
  pza. → Plaza
  pl. → Plaza
  pg. → Paseo
  ps. → Paseo

Format: "Calle Mayor, 25" (street type + name, number)
Add comma before number if not present

Spanish terms: dirección, direccion, calle, avenida, domicilio, vía
Max length: 255 characters
Examples: "c/ mayor 25" → "Calle Mayor, 25"
```

**addressDetails**
```
Additional address details: floor, door, block, staircase.
Examples: "2º 4ª", "Piso 3 Puerta B", "Escalera A, 2º Izq"

Spanish terms: piso, puerta, escalera, portal, planta, letra, bloque
Max length: 255 characters
Examples: "3º B" → "3º B", "segundo piso puerta izquierda" → "2º Izq"
```

**postalCode**
```
Spanish postal code (código postal).
Format: 5 digits (XXXXX)
Validation: Must match /^\d{5}$/

Spanish terms: código postal, codigo postal, cp, c.p.
Max length: 20 characters
Examples: "28013", "08001", "46001"
```

**neighborhoodId**
```
Foreign key to locations table (neighborhood_id).
Links property to city/province/municipality/neighborhood hierarchy.

This is NOT extracted directly from text but obtained via:
  1. Geocoding service (Google Maps API) using street address
  2. Cadastral reference lookup
  3. Manual location table lookup based on extracted city/neighborhood names

Spanish terms: barrio, zona, distrito, neighborhood
Type: bigint (foreign key → locations.neighborhood_id)
NULL if location cannot be determined
```

**latitude**
```
Geographic latitude coordinate (decimal degrees).
Range: -90 to +90
Precision: 8 decimal places

Obtained via:
  1. Geocoding service (street address → coordinates)
  2. Cadastral reference lookup
  3. Manual GPS coordinates

Type: decimal(10,8)
Example: 40.41678234 (Madrid city center)
NULL if not available
```

**longitude**
```
Geographic longitude coordinate (decimal degrees).
Range: -180 to +180
Precision: 8 decimal places

Obtained via same methods as latitude.

Type: decimal(11,8)
Example: -3.70379486 (Madrid city center)
NULL if not available
```

---

### Energy Certification

**energyCertificateStatus** ⚠️ ENUM CONSTRAINT
```
Energy certificate availability status.

MUST be one of (exact strings):
  - "disponible" (available/ready)
  - "en_tramite" (in process)
  - "pendiente" (pending)
  - "no_indicado" (not indicated)
  - "exento" (exempt - not required)

Spanish variants to normalize:
  - disponible, available, con certificado → "disponible"
  - en trámite, en tramite, procesando → "en_tramite"
  - pendiente, por obtener, sin certificado → "pendiente"
  - no indicado, no especificado → "no_indicado"
  - exento, no obligatorio → "exento"

Spanish terms: certificado energético, certificado energia, CEE
Max length: 20 characters
NULL if not mentioned
```

**energyConsumptionScale** ⚠️ SINGLE LETTER A-G
```
Energy consumption rating letter (efficiency scale).

MUST be SINGLE LETTER: A, B, C, D, E, F, or G
  A = Most efficient (best)
  G = Least efficient (worst)

IMPORTANT:
  - Return ONLY the letter (uppercase)
  - No prefixes like "Letra" or "Escala"
  - No suffixes or extra text

Spanish terms: letra energética, escala energética, calificación energética,
               consumo energético, eficiencia energética
Type: varchar(2) - stores single letter
Examples: "Calificación energética B" → "B", "escala C" → "C"
NULL if not mentioned
```

**energyConsumptionValue**
```
Energy consumption numeric value in kWh/m²·año (kilowatt-hours per square meter per year).

Range: 0-999.99 kWh/m²·año (realistically <500 for most properties)
Precision: 2 decimal places

Spanish terms: consumo energético, kWh/m²·año, kwh, consumo anual
Type: decimal(6,2)
Examples: "125,50 kWh/m²·año" → 125.50, "80 kwh" → 80.00
NULL if not mentioned
```

**emissionsScale** ⚠️ SINGLE LETTER A-G
```
CO₂ emissions rating letter (same scale as energy consumption).

MUST be SINGLE LETTER: A, B, C, D, E, F, or G
  A = Lowest emissions (best)
  G = Highest emissions (worst)

Same format rules as energyConsumptionScale.

Spanish terms: emisiones, escala emisiones, co2, emisiones co2,
               calificación emisiones
Type: varchar(2) - stores single letter
Examples: "Emisiones A" → "A"
NULL if not mentioned
```

**emissionsValue**
```
CO₂ emissions numeric value in kg CO₂/m²·año (kilograms of CO₂ per square meter per year).

Range: 0-999.99 kg CO₂/m²·año
Precision: 2 decimal places

Spanish terms: valor emisiones, kg co2, emisiones anuales, co2/m²·año
Type: decimal(6,2)
Examples: "25,30 kg CO₂/m²·año" → 25.30
NULL if not mentioned
```

---

### Heating & Climate Control

**hasHeating** ⚠️ BOOLEAN LOGIC
```
Has heating system.

CRITICAL BOOLEAN RULES:
  - ONLY set TRUE if EXPLICITLY mentioned: "con calefacción", "tiene calefacción"
  - Set FALSE ONLY if text says: "sin calefacción", "no tiene calefacción"
  - Leave NULL if NOT mentioned at all

DO NOT assume false - absence of information ≠ false!

Spanish terms: calefacción, calefaccion, climatización, heating
Type: boolean
Examples:
  - "con calefacción central" → TRUE
  - "sin calefacción" → FALSE
  - [not mentioned] → NULL
```

**heatingType**
```
Type of heating system (if hasHeating = true).

Common values (not exhaustive):
  - "Gas natural" (natural gas)
  - "Calefacción central" (central heating)
  - "Eléctrica" (electric)
  - "Individual" (individual/unit-based)
  - "Radiadores" (radiators)
  - "Suelo radiante" (underfloor heating)
  - "Bomba de calor" (heat pump)
  - "Gasoil" (oil heating)
  - "Mixto" (mixed/hybrid)

Spanish terms: tipo calefacción, sistema calefacción
Max length: 50 characters
NULL if hasHeating is false or not mentioned
```

---

### Basic Amenities (Boolean Flags)

**hasElevator** ⚠️ BOOLEAN LOGIC
```
Has elevator/lift.

CRITICAL BOOLEAN RULES:
  - TRUE if explicitly stated: "con ascensor", "tiene ascensor", "building has elevator"
  - FALSE ONLY if: "sin ascensor", "no tiene ascensor", "no elevator"
  - NULL if not mentioned

Spanish terms: ascensor, elevador, lift
Type: boolean
Examples:
  - "edificio con ascensor" → TRUE
  - "sin ascensor" → FALSE
  - [not mentioned] → NULL
```

**hasGarage** ⚠️ BOOLEAN LOGIC
```
Has garage/parking space INCLUDED (not optional).

CRITICAL RULES:
  - TRUE if garage is INCLUDED in price: "con garaje", "parking incluido"
  - FALSE if explicitly "sin garaje"
  - NULL if not mentioned OR if garage is optional/extra cost

NOTE: If garage is "opcional" or has separate price, use listing.optionalGarage instead!

Spanish terms: garaje, aparcamiento, parking, plaza de garaje
Type: boolean
Examples:
  - "incluye plaza de garaje" → TRUE
  - "garaje opcional por 50€/mes" → NULL (use optionalGarage in listings)
  - [not mentioned] → NULL
```

**hasStorageRoom** ⚠️ BOOLEAN LOGIC
```
Has storage room (trastero) INCLUDED.

Same logic as hasGarage:
  - TRUE if INCLUDED: "con trastero", "trastero incluido"
  - FALSE if explicitly "sin trastero"
  - NULL if not mentioned OR if optional/extra cost

Spanish terms: trastero, almacén, almacen, cuarto trastero
Type: boolean
Examples:
  - "incluye trastero" → TRUE
  - "trastero opcional" → NULL (use optionalStorageRoom in listings)
  - [not mentioned] → NULL
```

---

### Garage Details (Extended)

**garageType**
```
Type/classification of garage.

Common values:
  - "Individual" (single car space)
  - "Doble" (double space)
  - "Moto" (motorcycle parking)
  - "Comunitario" (community/shared)
  - "Privado" (private)
  - "Cerrado" (closed/enclosed)
  - "Abierto" (open air)

Spanish terms: tipo garaje, clase garaje
Max length: 50 characters
NULL if no garage or not specified
```

**garageSpaces**
```
Number of parking spaces included.
Range: 1-10 (usually 1-2)

Spanish terms: plazas garaje, espacios garaje, coches, número plazas
Type: smallint (integer)
Examples: "2 plazas de garaje" → 2
NULL if no garage
```

**garageInBuilding**
```
Garage is located in the same building (vs. external/nearby).

TRUE if garage is in building
FALSE if garage is in separate location
NULL if not specified or no garage

Spanish terms: garaje en edificio, garaje en el mismo edificio, parking en edificio
Type: boolean
```

**elevatorToGarage**
```
Building has elevator access to the garage level.

TRUE if elevator reaches garage
FALSE if no elevator to garage (stairs only)
NULL if not specified or no garage/elevator

Spanish terms: ascensor al garaje, elevador a parking
Type: boolean
```

**garageNumber**
```
Specific garage/parking space number or identifier.
Examples: "Plaza 23", "G-15", "Parking nº 7"

Spanish terms: número garaje, plaza número, número parking
Max length: 20 characters
NULL if not assigned or not specified
```

---

### Community & Recreational Amenities (Boolean Flags)

**communityPool** ⚠️ BOOLEAN LOGIC
```
Community/shared swimming pool available.

TRUE if explicitly mentioned: "piscina comunitaria", "piscina común"
FALSE if explicitly "sin piscina comunitaria"
NULL if not mentioned

NOTE: Different from privatePool (exclusive to property)

Spanish terms: piscina comunitaria, piscina común, shared pool
Type: boolean
```

**privatePool** ⚠️ BOOLEAN LOGIC
```
Private swimming pool (exclusive to this property).

TRUE if explicitly mentioned: "piscina privada", "piscina propia"
NULL if not mentioned

Spanish terms: piscina privada, piscina propia, private pool
Type: boolean
```

**gym** ⚠️ BOOLEAN LOGIC
```
Gym/fitness facilities available (usually community).

TRUE if mentioned: "gimnasio", "gym", "sala fitness"
NULL if not mentioned

Spanish terms: gimnasio, gym, fitness, sala de fitness
Type: boolean
```

**sportsArea** ⚠️ BOOLEAN LOGIC
```
Sports area/facilities (tennis, basketball, multipurpose court).

TRUE if mentioned: "zona deportiva", "área deportiva", "pista deportiva"
NULL if not mentioned

Spanish terms: zona deportiva, área deportiva, polideportivo, pista deportiva
Type: boolean
```

**childrenArea** ⚠️ BOOLEAN LOGIC
```
Children's play area/playground.

TRUE if mentioned: "zona infantil", "parque infantil", "área niños"
NULL if not mentioned

Spanish terms: zona infantil, área niños, parque infantil, playground
Type: boolean
```

**suiteBathroom** ⚠️ BOOLEAN LOGIC
```
Master bedroom has en-suite bathroom (baño en suite).

TRUE if mentioned: "baño en suite", "baño principal", "master bathroom"
NULL if not mentioned

Spanish terms: baño suite, baño en suite, baño principal, master bathroom
Type: boolean
```

**nearbyPublicTransport** ⚠️ BOOLEAN LOGIC
```
Close to public transportation (metro, bus, train).

TRUE if mentioned: "cerca metro", "transporte público", "bien comunicado"
NULL if not mentioned

Spanish terms: transporte público, metro, autobús, bus, cercanías,
               bien comunicado, near metro
Type: boolean
```

**tennisCourt** ⚠️ BOOLEAN LOGIC
```
Tennis court available (usually community).

TRUE if mentioned: "pista tenis", "cancha tenis"
NULL if not mentioned

Spanish terms: pista tenis, cancha tenis, tennis court
Type: boolean
```

---

### Property Characteristics (Boolean Flags)

**disabledAccessible** ⚠️ BOOLEAN LOGIC
```
Property is wheelchair/disability accessible.

TRUE if mentioned: "accesible", "adaptado minusválidos", "wheelchair accessible"
NULL if not mentioned

Spanish terms: accesible, minusválidos, discapacitados, accesibilidad,
               wheelchair accessible, adaptado
Type: boolean
```

**vpo** ⚠️ BOOLEAN LOGIC
```
VPO - Vivienda de Protección Oficial (subsidized/social housing).

TRUE if mentioned: "vpo", "vivienda protección oficial", "vivienda protegida"
FALSE if explicitly "no vpo", "libre" (free market)
NULL if not mentioned

Spanish terms: vpo, vivienda protección oficial, protección oficial,
               vivienda protegida
Type: boolean
```

**videoIntercom** ⚠️ BOOLEAN LOGIC
```
Video intercom/doorbell system.

TRUE if mentioned: "videoportero", "video intercom"
NULL if not mentioned

Spanish terms: videoportero, portero automático con video, video intercom
Type: boolean
```

**conciergeService** ⚠️ BOOLEAN LOGIC
```
Building has concierge/doorman service.

TRUE if mentioned: "conserje", "portero", "conserjería"
NULL if not mentioned

Spanish terms: conserje, portero, conserjería, portería, doorman, concierge
Type: boolean
```

**securityGuard** ⚠️ BOOLEAN LOGIC
```
Security guard/vigilance service.

TRUE if mentioned: "vigilancia", "seguridad", "vigilante"
NULL if not mentioned

Spanish terms: vigilancia, seguridad, vigilante, guarda, security
Type: boolean
```

**satelliteDish** ⚠️ BOOLEAN LOGIC
```
Satellite dish/antenna available.

TRUE if mentioned: "antena parabólica", "parabólica", "satellite"
NULL if not mentioned

Spanish terms: antena parabólica, parabólica, satellite dish
Type: boolean
```

**doubleGlazing** ⚠️ BOOLEAN LOGIC
```
Double glazing windows (insulated windows).

TRUE if mentioned: "doble acristalamiento", "climalit", "double glazing"
NULL if not mentioned

Spanish terms: doble acristalamiento, climalit, doble cristal,
               ventanas climalit, double glazing
Type: boolean
```

**alarm** ⚠️ BOOLEAN LOGIC
```
Security alarm system.

TRUE if mentioned: "alarma", "sistema alarma", "alarm system"
NULL if not mentioned

Spanish terms: alarma, sistema alarma, sistema de seguridad, alarm
Type: boolean
```

**securityDoor** ⚠️ BOOLEAN LOGIC
```
Reinforced/security door (puerta blindada/acorazada).

TRUE if mentioned: "puerta blindada", "puerta acorazada", "security door"
NULL if not mentioned

Spanish terms: puerta blindada, puerta acorazada, puerta seguridad,
               security door, reinforced door
Type: boolean
```

---

### Property Condition (Boolean Flags & Year)

**brandNew** ⚠️ BOOLEAN LOGIC
```
Brand new property (never lived in, "a estrenar").

TRUE if mentioned: "a estrenar", "sin estrenar", "brand new", "nunca habitado"
FALSE if explicitly not new
NULL if not mentioned

Spanish terms: a estrenar, sin estrenar, brand new, nunca habitado
Type: boolean
```

**newConstruction** ⚠️ BOOLEAN LOGIC
```
New construction (recently built, typically <5 years old).

TRUE if mentioned: "obra nueva", "construcción nueva", "new construction"
NULL if not mentioned

Spanish terms: obra nueva, construcción nueva, edificio nuevo, new construction
Type: boolean
```

**underConstruction** ⚠️ BOOLEAN LOGIC
```
Currently under construction (not yet completed).

TRUE if mentioned: "en construcción", "en obra", "under construction"
NULL if not mentioned

Spanish terms: en construcción, en obra, construcción en curso,
               under construction, building in progress
Type: boolean
```

**needsRenovation** ⚠️ BOOLEAN LOGIC
```
Property needs renovation/reform.

TRUE if mentioned: "para reformar", "necesita reforma", "needs renovation"
NULL if not mentioned

NOTE: Related to conservationStatus = 2 or 4

Spanish terms: para reformar, necesita reforma, a reformar, needs renovation
Type: boolean
```

**lastRenovationYear**
```
Year of last renovation/reform.
Range: 1900 to current year

Spanish terms: año reforma, última reforma, año rehabilitación,
               reformado en, renovation year
Type: smallint (integer)
Examples: "reformado en 2020" → 2020
NULL if never renovated or not mentioned
```

---

### Kitchen Features

**kitchenType**
```
Type/style of kitchen.

Common values:
  - "Americana" (open/American-style kitchen)
  - "Independiente" (separate/closed kitchen)
  - "Office" (kitchen with dining area)
  - "Tipo office" (office-style)
  - "Integrada" (integrated)
  - "Equipada" (equipped with appliances)

Spanish terms: tipo cocina, cocina, estilo cocina
Max length: 50 characters
NULL if not specified
```

**hotWaterType**
```
Hot water system type.

Common values:
  - "Gas natural" (natural gas)
  - "Eléctrico" (electric)
  - "Calentador" (water heater)
  - "Termo eléctrico" (electric boiler)
  - "Caldera" (boiler)
  - "Solar" (solar water heater)

Spanish terms: agua caliente, tipo agua caliente, sistema agua caliente
Max length: 50 characters
NULL if not specified
```

**openKitchen** ⚠️ BOOLEAN LOGIC
```
Open kitchen / American-style kitchen (kitchen open to living room).

TRUE if mentioned: "cocina americana", "cocina abierta", "open kitchen"
NULL if not mentioned

Spanish terms: cocina americana, cocina abierta, open kitchen, cocina integrada
Type: boolean
```

**frenchKitchen** ⚠️ BOOLEAN LOGIC
```
French kitchen / office kitchen (kitchen with dining area/space).

TRUE if mentioned: "cocina francesa", "cocina office", "French kitchen"
NULL if not mentioned

Spanish terms: cocina francesa, cocina office, cocina tipo office, French kitchen
Type: boolean
```

**furnishedKitchen** ⚠️ BOOLEAN LOGIC
```
Kitchen comes furnished/equipped with cabinets and built-in furniture.

TRUE if mentioned: "cocina amueblada", "cocina equipada"
NULL if not mentioned

NOTE: Different from appliances (use listing.appliancesIncluded for that)

Spanish terms: cocina amueblada, cocina equipada, muebles cocina,
               furnished kitchen
Type: boolean
```

**pantry** ⚠️ BOOLEAN LOGIC
```
Pantry/storage room in/near kitchen.

TRUE if mentioned: "despensa", "office", "pantry"
NULL if not mentioned

Spanish terms: despensa, office, pantry, storage room
Type: boolean
```

---

### Storage & Additional Spaces

**storageRoomSize**
```
Storage room (trastero) size in square meters.

Range: 1-100 m² (usually 3-15 m²)

Spanish terms: tamaño trastero, metros trastero, m² trastero
Type: integer
Examples: "trastero de 8 m²" → 8
NULL if no storage room or size not specified
```

**storageRoomNumber**
```
Specific storage room number/identifier.
Examples: "Trastero 15", "T-23", "Número 7"

Spanish terms: número trastero, trastero número
Max length: 20 characters
NULL if not assigned or not specified
```

**terrace** ⚠️ BOOLEAN LOGIC
```
Has terrace/balcony.

TRUE if mentioned: "terraza", "balcón", "terrace"
NULL if not mentioned

NOTE: Different from balconyCount (this is a boolean for any terrace/balcony)

Spanish terms: terraza, balcón, balcon, terrace, balcony
Type: boolean
```

**terraceSize**
```
Terrace size in square meters.

Range: 1-500 m² (usually 5-50 m²)

Spanish terms: tamaño terraza, metros terraza, m² terraza
Type: integer
Examples: "terraza de 20 m²" → 20
NULL if no terrace or size not specified
```

**wineCellar** ⚠️ BOOLEAN LOGIC
```
Wine cellar (bodega).

TRUE if mentioned: "bodega", "vinoteca", "wine cellar"
NULL if not mentioned

Spanish terms: bodega, vinoteca, wine cellar, cava
Type: boolean
```

**wineCellarSize**
```
Wine cellar size in square meters.

Range: 1-100 m²

Spanish terms: tamaño bodega, metros bodega
Type: integer
NULL if no wine cellar or size not specified
```

**livingRoomSize**
```
Living room size in square meters.

Range: 1-200 m² (usually 15-50 m²)

Spanish terms: tamaño salón, metros salón, m² salón, superficie salón
Type: integer
Examples: "salón de 30 m²" → 30
NULL if not specified
```

**balconyCount**
```
Number of balconies.

Range: 0-10 (usually 1-3)

Spanish terms: número balcones, balcones, cuántos balcones
Type: smallint (integer)
Examples: "2 balcones" → 2
NULL if no balconies or not specified
```

**galleryCount**
```
Number of galleries (galería - enclosed balcony/sunroom).

Range: 0-5

Spanish terms: galerías, numero galerias, galleries
Type: smallint (integer)
NULL if no galleries or not specified
```

**buildingFloors**
```
Total number of floors in the building.

Range: 1-50 (usually 3-10 for residential)

Spanish terms: plantas edificio, pisos edificio, alturas, floors in building
Type: smallint (integer)
Examples: "edificio de 5 plantas" → 5
NULL if not specified
```

---

### Interior Features & Materials

**builtInWardrobes** ⚠️ BOOLEAN LOGIC
```
Built-in wardrobes (armarios empotrados).

TRUE if mentioned: "armarios empotrados", "built-in wardrobes"
NULL if not mentioned

Spanish terms: armarios empotrados, armarios, empotrados, built-in wardrobes,
               fitted wardrobes
Type: boolean
```

**mainFloorType**
```
Main floor/flooring material type.

Common values:
  - "Parquet" (wood flooring)
  - "Tarima" (laminate/wood flooring)
  - "Gres" (ceramic/porcelain tiles)
  - "Mármol" (marble)
  - "Cerámica" (ceramic)
  - "Terrazo" (terrazzo)
  - "Sintético" (synthetic/vinyl)

Spanish terms: tipo suelo, suelo, pavimento, floor type
Max length: 50 characters
NULL if not specified
```

**shutterType**
```
Window shutter/blind type.

Common values:
  - "Aluminio" (aluminum)
  - "PVC"
  - "Madera" (wood)
  - "Eléctrico" (electric)
  - "Manual" (manual)

Spanish terms: tipo persiana, persianas, shutter type
Max length: 50 characters
NULL if not specified
```

**carpentryType**
```
Carpentry/window frame material.

Common values:
  - "Aluminio" (aluminum)
  - "PVC"
  - "Madera" (wood)
  - "Climalit" (double glazing)

Spanish terms: tipo carpintería, carpinteria, carpentry, marco ventanas
Max length: 50 characters
NULL if not specified
```

**orientation** ⚠️ ENUM CONSTRAINT
```
Property/facade orientation (cardinal direction).

MUST be one of (exact strings):
  "norte", "sur", "este", "oeste",
  "noreste", "noroeste", "sureste", "suroeste"

Spanish variants to normalize:
  - N, Norte → "norte"
  - S, Sur → "sur"
  - E, Este → "este"
  - O, Oeste, W, West → "oeste"
  - NE, Noreste → "noreste"
  - NO, Noroeste, NW → "noroeste"
  - SE, Sureste → "sureste"
  - SO, Suroeste, SW → "suroeste"

Spanish terms: orientación, orientacion, orientado, orientation
Max length: 50 characters
NULL if not specified
```

**airConditioningType**
```
Air conditioning system type.

Common values:
  - "Split" (split system)
  - "Central" (central AC)
  - "Conductos" (ducted)
  - "Frío/Calor" (heating and cooling)
  - "Bomba de calor" (heat pump)

Spanish terms: aire acondicionado, climatización, aa, ac, air conditioning
Max length: 50 characters
NULL if not specified
```

**windowType**
```
Window type/style.

Common values:
  - "Climalit" (double glazing brand)
  - "Doble cristal" (double glazing)
  - "Aluminio" (aluminum frames)
  - "PVC"
  - "Oscilobatientes" (tilt and turn)

Spanish terms: tipo ventanas, ventanas, window type
Max length: 50 characters
NULL if not specified
```

---

### Views & Location Features (Boolean Flags)

**exterior** ⚠️ BOOLEAN LOGIC
```
Exterior property (has windows facing outside, not interior courtyard).

TRUE if mentioned: "exterior", "fachada exterior", "outside facing"
FALSE if explicitly "interior"
NULL if not mentioned

Spanish terms: exterior, fachada exterior, da al exterior, outside facing
Type: boolean
```

**bright** ⚠️ BOOLEAN LOGIC
```
Bright/lots of natural light (luminoso).

TRUE if mentioned: "luminoso", "luminosa", "mucha luz", "bright"
NULL if not mentioned

Spanish terms: luminoso, luminosa, mucha luz, muy luminoso, bright, lots of light
Type: boolean
```

**views** ⚠️ BOOLEAN LOGIC
```
Property has views (unspecified type).

TRUE if mentioned: "vistas", "con vistas", "buenas vistas"
NULL if not mentioned

NOTE: This is generic views - use specific fields for mountain/sea views

Spanish terms: vistas, con vistas, buenas vistas, views
Type: boolean
```

**mountainViews** ⚠️ BOOLEAN LOGIC
```
Mountain/sierra views.

TRUE if mentioned: "vistas montaña", "vistas sierra", "mountain views"
NULL if not mentioned

Spanish terms: vistas montaña, vistas sierra, vistas monte, mountain views
Type: boolean
```

**seaViews** ⚠️ BOOLEAN LOGIC
```
Sea/ocean views.

TRUE if mentioned: "vistas mar", "vistas océano", "sea views"
NULL if not mentioned

Spanish terms: vistas mar, vistas océano, vistas al mar, sea views, ocean views
Type: boolean
```

**beachfront** ⚠️ BOOLEAN LOGIC
```
Beachfront property / first line beach (primera línea de playa).

TRUE if mentioned: "primera línea", "frente mar", "beachfront", "junto al mar"
NULL if not mentioned

Spanish terms: primera línea, primera linea, frente mar, beachfront,
               junto al mar, on the beach
Type: boolean
```

---

### Luxury & Premium Amenities (Boolean Flags)

**jacuzzi** ⚠️ BOOLEAN LOGIC
```
Jacuzzi / hot tub.

TRUE if mentioned: "jacuzzi", "bañera hidromasaje", "hot tub"
NULL if not mentioned

Spanish terms: jacuzzi, bañera hidromasaje, jacuzi, hot tub
Type: boolean
```

**hydromassage** ⚠️ BOOLEAN LOGIC
```
Hydromassage shower/system (different from jacuzzi).

TRUE if mentioned: "hidromasaje", "ducha hidromasaje", "hydromassage"
NULL if not mentioned

Spanish terms: hidromasaje, hidro, ducha hidromasaje, hydromassage
Type: boolean
```

**garden** ⚠️ BOOLEAN LOGIC
```
Garden/yard (private or community).

TRUE if mentioned: "jardín", "jardin", "zona verde", "garden"
NULL if not mentioned

Spanish terms: jardín, jardin, zona verde, patio, garden, yard
Type: boolean
```

**pool** ⚠️ BOOLEAN LOGIC
```
Swimming pool (generic - use communityPool or privatePool for specifics).

TRUE if mentioned: "piscina", "alberca", "pool"
NULL if not mentioned

NOTE: Use communityPool or privatePool for more specific data

Spanish terms: piscina, alberca, pool, swimming pool
Type: boolean
```

**homeAutomation** ⚠️ BOOLEAN LOGIC
```
Home automation / smart home / domotics.

TRUE if mentioned: "domótica", "domotica", "casa inteligente", "smart home"
NULL if not mentioned

Spanish terms: domótica, domotica, casa inteligente, smart home,
               home automation, automatización
Type: boolean
```

**musicSystem** ⚠️ BOOLEAN LOGIC
```
Built-in music system / sound system (hilo musical).

TRUE if mentioned: "hilo musical", "sistema audio", "music system"
NULL if not mentioned

Spanish terms: hilo musical, sistema audio, sonido integrado, music system
Type: boolean
```

**laundryRoom** ⚠️ BOOLEAN LOGIC
```
Dedicated laundry room.

TRUE if mentioned: "lavadero", "cuarto lavado", "laundry room"
NULL if not mentioned

Spanish terms: lavadero, cuarto lavado, zona lavado, laundry room, utility room
Type: boolean
```

**coveredClothesline** ⚠️ BOOLEAN LOGIC
```
Covered clothesline/drying area (tendedero cubierto).

TRUE if mentioned: "tendedero cubierto", "covered clothesline"
NULL if not mentioned

Spanish terms: tendedero cubierto, zona tender cubierta, covered clothesline
Type: boolean
```

**fireplace** ⚠️ BOOLEAN LOGIC
```
Fireplace / chimney.

TRUE if mentioned: "chimenea", "hogar", "fireplace"
NULL if not mentioned

Spanish terms: chimenea, hogar, fireplace
Type: boolean
```

---

## Listings Table Field Definitions

/**
 * Database field definitions for listings table (marketing offers)
 * WITH SPANISH REAL ESTATE BUSINESS RULES
 */

### Transaction Details

**listingType** ⚠️ CRITICAL CONSTRAINT
```
Type of listing/transaction.

MUST be one of (exact strings):
  "Sale", "Rent", "Transfer", "RentWithOption", "RoomSharing"

Spanish terms to normalize:
  - Venta, Vender, Compra, Comprar → "Sale"
  - Alquiler, Alquilar, Renta, Rentar, Arrendar → "Rent"
  - Traspaso → "Transfer"
  - Alquiler con opción a compra, Rent to buy → "RentWithOption"
  - Compartir piso, Habitación, Room rental → "RoomSharing"

IMPORTANT: This determines the default status field value
Spanish terms: tipo operación, operacion, tipo listado
Max length: 20 characters
Default: "Sale"
```

**status** ⚠️ MUST MATCH LISTING TYPE
```
Listing status.

MUST be one of:
  "En Venta", "En Alquiler", "Vendido", "Alquilado", "Descartado", "Draft"

IMPORTANT: Must match listingType:
  - If listingType="Sale" → status should be "En Venta" or "Vendido"
  - If listingType="Rent" → status should be "En Alquiler" or "Alquilado"
  - "Descartado" (discarded) can be used for any type
  - "Draft" (draft/not published) can be used for any type

Auto-assignment logic:
  - If listingType="Sale" and status not provided → "En Venta"
  - If listingType="Rent" and status not provided → "En Alquiler"

Spanish terms: estado, status, situación
Max length: 20 characters
```

**price** ⚠️ REQUIRED FIELD
```
Listing price in euros.

For Sale: Total purchase price
For Rent: Monthly rent price

Range: 1-99,999,999.99 euros
Precision: 2 decimal places

Parse Spanish formats:
  - "150.000€" → 150000.00
  - "€1.250,50" → 1250.50
  - "250000 euros" → 250000.00

Remove: €, $, currency words
Convert: thousand separators (.) and decimal commas (,) to standard decimal

Spanish terms: precio, valor, importe, coste, price
Type: decimal(12,2)
REQUIRED: Cannot be NULL
Examples: "Precio: 150.000€" → 150000.00
```

---

### Furnishing & Quality

**isFurnished** ⚠️ BOOLEAN LOGIC
```
Is the property furnished (comes with furniture).

TRUE if mentioned: "amueblado", "amueblada", "con muebles", "furnished"
FALSE if mentioned: "sin amueblar", "sin muebles", "unfurnished"
NULL if not mentioned

Spanish terms: amueblado, amueblada, muebles, furnished
Type: boolean
Examples:
  - "piso amueblado" → TRUE
  - "sin amueblar" → FALSE
  - [not mentioned] → NULL
```

**furnitureQuality** ⚠️ ENUM CONSTRAINT (if isFurnished = TRUE)
```
Quality/standard of furniture (only relevant if isFurnished = TRUE).

MUST be one of:
  "basic", "standard", "high", "luxury"

Spanish terms to normalize:
  - Básico, Basic, Sencillo → "basic"
  - Estándar, Standard, Normal, Medio → "standard"
  - Alta, High, Premium, Alto nivel → "high"
  - Lujo, Luxury, De lujo, Exclusivo → "luxury"

Spanish terms: calidad muebles, tipo mobiliario, nivel muebles
Max length: 50 characters
NULL if isFurnished is false or not mentioned
```

---

### Optional Features & Pricing

**optionalGarage** ⚠️ BOOLEAN LOGIC
```
Garage/parking available for ADDITIONAL cost (not included in main price).

TRUE if garage is optional/extra cost: "garaje opcional", "parking por 50€/mes adicionales"
FALSE if garage is definitely not available
NULL if not mentioned or included in main price

NOTE: If garage is included, use properties.hasGarage instead!

Spanish terms: garaje opcional, parking opcional, garaje adicional,
               optional garage, extra parking
Type: boolean
```

**optionalGaragePrice**
```
Price for optional garage (if optionalGarage = TRUE).

For Rent listings: Monthly additional rent (e.g., €50/month)
For Sale listings: Total additional price (e.g., €15,000)

Range: 0-999,999.99 euros
Precision: 2 decimal places

Spanish terms: precio garaje, coste garaje, garaje por, parking por
Type: decimal(12,2)
NULL if optionalGarage is false or price not specified
Examples: "garaje opcional por 75€/mes" → 75.00
```

**optionalStorageRoom** ⚠️ BOOLEAN LOGIC
```
Storage room (trastero) available for ADDITIONAL cost.

Same logic as optionalGarage.

TRUE if storage room is optional/extra cost
FALSE if definitely not available
NULL if not mentioned or included

Spanish terms: trastero opcional, trastero adicional, optional storage
Type: boolean
Default: false
```

**optionalStorageRoomPrice**
```
Price for optional storage room (if optionalStorageRoom = TRUE).

Same pricing logic as optionalGaragePrice.

Spanish terms: precio trastero, coste trastero, trastero por
Type: decimal(12,2)
NULL if optionalStorageRoom is false or price not specified
```

---

### Availability & Conditions

**hasKeys** ⚠️ BOOLEAN LOGIC
```
Agency has keys for property viewings.

TRUE if mentioned: "llaves en agencia", "con llaves", "disponible para visitar"
FALSE ONLY if explicitly: "sin llaves", "propietario debe estar presente"
NULL if not mentioned

IMPORTANT: This affects ability to schedule showings

Spanish terms: llaves, con llaves, llaves en agencia, keys available
Type: boolean
Default: false
```

**studentFriendly** ⚠️ BOOLEAN LOGIC (mostly for Rent)
```
Property is suitable/marketed for students.

TRUE if mentioned: "ideal estudiantes", "para estudiantes", "student friendly"
NULL if not mentioned

NOTE: More relevant for Rent listings, especially RoomSharing

Spanish terms: estudiantes, ideal estudiantes, para estudiantes, student friendly
Type: boolean
```

**petsAllowed** ⚠️ BOOLEAN LOGIC (mostly for Rent)
```
Pets are allowed.

TRUE if mentioned: "se admiten mascotas", "mascotas permitidas", "pets allowed"
FALSE if mentioned: "no mascotas", "sin mascotas", "no pets"
NULL if not mentioned

IMPORTANT for rental properties.

Spanish terms: mascotas, animales, perros, gatos, pets allowed, se admiten mascotas
Type: boolean
Examples:
  - "se admiten mascotas" → TRUE
  - "no se permiten animales" → FALSE
  - [not mentioned] → NULL
```

**appliancesIncluded** ⚠️ BOOLEAN LOGIC
```
Kitchen appliances are included.

TRUE if mentioned: "electrodomésticos incluidos", "con electrodomésticos"
NULL if not mentioned

NOTE: For specific appliances, use individual fields (oven, fridge, etc.)

Spanish terms: electrodomésticos, incluye electrodomésticos, appliances included
Type: boolean
```

---

### Appliances (Specific Items - Boolean Flags)

**internet** ⚠️ BOOLEAN LOGIC
```
Internet connection available/included.

TRUE if mentioned: "internet", "wifi", "fibra", "internet incluido"
NULL if not mentioned

Spanish terms: internet, wifi, fibra, conexión internet, broadband
Type: boolean
```

**oven** ⚠️ BOOLEAN LOGIC
```
Oven/stove included.

TRUE if mentioned: "horno", "cocina", "vitrocerámica"
NULL if not mentioned

Spanish terms: horno, cocina, vitrocerámica, oven, stove
Type: boolean
```

**microwave** ⚠️ BOOLEAN LOGIC
```
Microwave oven included.

TRUE if mentioned: "microondas", "microwave"
NULL if not mentioned

Spanish terms: microondas, micro, microwave
Type: boolean
```

**washingMachine** ⚠️ BOOLEAN LOGIC
```
Washing machine included.

TRUE if mentioned: "lavadora", "washing machine"
NULL if not mentioned

Spanish terms: lavadora, washing machine, washer
Type: boolean
```

**fridge** ⚠️ BOOLEAN LOGIC
```
Refrigerator/fridge included.

TRUE if mentioned: "frigorífico", "nevera", "refrigerador", "fridge"
NULL if not mentioned

Spanish terms: frigorífico, nevera, refrigerador, frigo, fridge, refrigerator
Type: boolean
```

**tv** ⚠️ BOOLEAN LOGIC
```
Television included.

TRUE if mentioned: "televisión", "television", "tv", "tele"
NULL if not mentioned

Spanish terms: televisión, television, tv, tele, televisor
Type: boolean
```

**stoneware** ⚠️ BOOLEAN LOGIC
```
Kitchenware/dishes included (vajilla, menaje).

TRUE if mentioned: "vajilla", "menaje", "kitchenware", "utensilios cocina"
NULL if not mentioned

Spanish terms: vajilla, menaje, menaje cocina, kitchenware, dishes
Type: boolean
```

---

### Marketing & Visibility

**isFeatured** ⚠️ BOOLEAN LOGIC
```
Featured/premium listing (destacado).

TRUE if this listing should be highlighted/featured on website and portals
FALSE otherwise

Spanish terms: destacado, premium, featured, listing destacado
Type: boolean
Default: false
```

**isBankOwned** ⚠️ BOOLEAN LOGIC
```
Bank-owned property (banco, entidad financiera).

TRUE if mentioned: "propiedad bancaria", "banco", "bank owned", "entidad financiera"
FALSE otherwise
NULL if not mentioned

IMPORTANT: Bank-owned properties may have different rules/processes

Spanish terms: propiedad bancaria, banco, bank owned, entidad financiera,
               procedente de banco
Type: boolean
Default: false
```

**visibilityMode** ⚠️ NUMERIC CODE
```
Address visibility level (for privacy/security).

MUST be numeric code:
  1 = Exact location (show full address with street number)
  2 = Street level (show street name but hide number)
  3 = Zone/neighborhood level (show only neighborhood/zone, hide street)

Use case: Some owners want privacy and don't want exact address published

Type: smallint (integer)
Default: 1 (show full address)
Valid values: 1, 2, 3
```

**publishToWebsite** ⚠️ BOOLEAN
```
Publish this listing to the agency's website.

TRUE if listing should appear on company website
FALSE if listing should be private/internal only

Type: boolean
Default: false
IMPORTANT: User must explicitly enable this
```

---

### Portal Publication (Spanish Real Estate Portals)

**fotocasa** ⚠️ BOOLEAN
```
Publish to Fotocasa.es portal.

TRUE if listing should be exported/synced to Fotocasa
FALSE otherwise

Type: boolean
Default: false
```

**idealista** ⚠️ BOOLEAN
```
Publish to Idealista.com portal.

TRUE if listing should be exported/synced to Idealista
FALSE otherwise

Type: boolean
Default: false
```

**habitaclia** ⚠️ BOOLEAN
```
Publish to Habitaclia.com portal.

TRUE if listing should be exported/synced to Habitaclia
FALSE otherwise

Type: boolean
Default: false
```

**pisoscom** ⚠️ BOOLEAN
```
Publish to Pisos.com portal.

TRUE if listing should be exported/synced to Pisos.com
FALSE otherwise

Type: boolean
Default: false
```

**yaencontre** ⚠️ BOOLEAN
```
Publish to Yaencontre.com portal.

TRUE if listing should be exported/synced to Yaencontre
FALSE otherwise

Type: boolean
Default: false
```

**milanuncios** ⚠️ BOOLEAN
```
Publish to Milanuncios.com portal.

TRUE if listing should be exported/synced to Milanuncios
FALSE otherwise

Type: boolean
Default: false
```

---

## Critical Extraction Rules Summary

### 1. Property Type & Subtype Constraints
- propertyType MUST be: piso, casa, local, garaje, or solar
- propertySubtype MUST match propertyType allowed values
- Invalid combinations will cause database errors

### 2. Conservation Status is NUMERIC
- Use codes 1, 2, 3, 4, or 6 (NO code 5!)
- Return the NUMBER, not Spanish text
- Map Spanish descriptions to correct code

### 3. Boolean Field Rules (CRITICAL!)
- ONLY set TRUE if EXPLICITLY mentioned
- Set FALSE only if text explicitly says "no" or "sin"
- Leave NULL if NOT mentioned
- DO NOT assume false for missing data

### 4. Enum Fields Must Match Exactly
- energyCertificateStatus: disponible, en_tramite, pendiente, no_indicado, exento
- energyConsumptionScale / emissionsScale: A, B, C, D, E, F, G (single letter!)
- orientation: norte, sur, este, oeste, noreste, noroeste, sureste, suroeste
- listingType: Sale, Rent, Transfer, RentWithOption, RoomSharing
- furnitureQuality: basic, standard, high, luxury

### 5. Price is Required for Listings
- Cannot be NULL in listings table
- Parse Spanish formats correctly (dots=thousands, commas=decimals)
- Remove currency symbols

### 6. Status Must Match Listing Type
- Sale → "En Venta" or "Vendido"
- Rent → "En Alquiler" or "Alquilado"

### 7. Location Fields
- neighborhoodId comes from external services (geocoding/cadastral)
- Not directly extracted from text
- Requires location table lookup or creation

### 8. Optional vs Included Features
- hasGarage/hasStorageRoom = INCLUDED in price
- optionalGarage/optionalStorageRoom = ADDITIONAL cost
- Do not confuse these!

---

## Data Type Reference

### Properties Table Types
- **bigint**: propertyId, accountId, neighborhoodId
- **varchar**: title(255), description(text), propertyType(20), propertySubtype(50), street(255), postalCode(20), etc.
- **smallint**: bedrooms, yearBuilt, conservationStatus, buildingFloors
- **decimal**: bathrooms(3,1), builtSurfaceArea(10,2), latitude(10,8), longitude(11,8), energyConsumptionValue(6,2)
- **integer**: squareMeter, storageRoomSize, terraceSize
- **boolean**: hasElevator, hasGarage, hasStorageRoom, and ~50 other amenity flags

### Listings Table Types
- **bigint**: listingId, accountId, propertyId
- **varchar**: listingType(20), status(20), furnitureQuality(50)
- **decimal**: price(12,2), optionalGaragePrice(12,2), optionalStorageRoomPrice(12,2)
- **boolean**: isFurnished, hasKeys, petsAllowed, and all portal/appliance flags

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Maintained by:** Vesta Development Team
