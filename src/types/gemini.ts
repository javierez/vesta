import type { PropertyImage } from "~/lib/data";

export interface GeminiRenovationRequest {
  imageUrl: string;
  propertyId: bigint;
  referenceNumber: string;
  imageOrder: number;
  renovationType?: RenovationType;
}

export interface GeminiRenovationResponse {
  success: boolean;
  renovatedImageBase64?: string;
  error?: string;
}

export interface GeminiTaskStatus {
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  renovatedImageBase64?: string;
  error?: string;
}

// Renovation types for different room prompts - 8 specific room types
export type RenovationType = 'living_room' | 'bedroom' | 'bathroom' | 'entrance_hall' | 'terrace' | 'balcony' | 'kitchen' | 'dining_room';

// Room detection interface
export interface RoomDetectionResponse {
  success: boolean;
  roomType?: RenovationType;
  confidence?: number; // 0-1 score
  error?: string;
}

// Room detection request
export interface RoomDetectionRequest {
  imageBase64: string;
}

// Renovation prompts for different room types
export const RENOVATION_PROMPTS: Record<RenovationType, string> = {
  kitchen: "PRECISION REQUIRED: Generate a high-fidelity kitchen renovation. PRESERVE STRUCTURAL POSITIONS: Wall locations, door/window openings, ceiling height, plumbing/electrical locations. MANDATORY WALL TRANSFORMATIONS: MUST completely change all wall colors, paint, and finishes from original - make walls dramatically different while keeping same positions. MUST update backsplash completely. MUST change cabinet colors/styles entirely. FULL RENOVATION REQUIRED: New kitchen cabinets (completely different style/color from original), new countertops (different material/color), modern appliances (same locations but different styles), dramatic backsplash change, complete paint transformation, new lighting fixtures, updated hardware. FURNITURE MANDATE: All furniture, stools, chairs must be completely different styles and colors from original. REMOVE ALL PERSONAL ITEMS: Remove personal belongings, photos, magnets, notes, cultural items. TRANSFORM APPEARANCE: Every surface and furniture piece must look completely renovated and different from original.",
  bathroom: "PRECISION REQUIRED: Generate a high-fidelity bathroom renovation. PRESERVE STRUCTURAL POSITIONS: Wall locations, door/window openings, plumbing locations. MANDATORY WALL TRANSFORMATIONS: MUST completely change all wall colors, tiles, and finishes from original - make walls dramatically different. MUST transform shower/tub walls with new tile work. FULL RENOVATION REQUIRED: Complete tile transformation (walls and floors), new vanity (completely different style/color from original), updated fixtures, dramatic wall color/finish changes, new lighting, contemporary accessories. FURNITURE MANDATE: All furniture, storage, seating must be completely different styles and colors from original. REMOVE ALL PERSONAL ITEMS: Remove toiletries, towels, personal items, cultural symbols. TRANSFORM APPEARANCE: Every surface and furniture piece must look completely renovated.",
  living_room: "PRECISION REQUIRED: Generate a high-fidelity living room renovation. PRESERVE STRUCTURAL POSITIONS: Wall locations, door/window openings, ceiling height, built-ins locations. MANDATORY WALL TRANSFORMATIONS: MUST completely change all wall colors, paint, and finishes from original - make walls dramatically different. MUST add/change accent walls with new colors or materials. FULL RENOVATION REQUIRED: Completely different furniture (different styles, colors, arrangements from original), dramatic wall color changes, new flooring, updated lighting fixtures, new window treatments, contemporary decor. FURNITURE MANDATE: Sofas, chairs, tables, storage - all must be completely different styles and colors from original. REMOVE ALL PERSONAL ITEMS: Remove photos, books, personal artwork, cultural symbols, memorabilia. TRANSFORM APPEARANCE: Every surface and furniture piece must look completely renovated.",
  bedroom: "PRECISION REQUIRED: Generate a high-fidelity bedroom renovation. PRESERVE STRUCTURAL POSITIONS: Wall locations, door/window openings, ceiling height, built-in locations. MANDATORY WALL TRANSFORMATIONS: MUST completely change all wall colors, paint, and finishes from original - make walls dramatically different. MUST add/change accent walls with new colors or materials. FULL RENOVATION REQUIRED: Completely different furniture (different bed style, nightstands, dressers - all different colors and styles from original), dramatic wall color changes, new flooring, updated lighting fixtures, new window treatments, contemporary bedding and decor. FURNITURE MANDATE: All bedroom furniture must be completely different styles and colors from original. REMOVE ALL PERSONAL ITEMS: Remove clothing, photos, personal artwork, cultural symbols. TRANSFORM APPEARANCE: Every surface and furniture piece must look completely renovated.",
  dining_room: "PRECISION REQUIRED: Generate a high-fidelity dining room renovation. PRESERVE STRUCTURAL POSITIONS: Wall locations, door/window openings, ceiling height, built-ins locations. MANDATORY WALL TRANSFORMATIONS: MUST completely change all wall colors, paint, and finishes from original - make walls dramatically different. MUST add/change accent walls with new colors or materials. FULL RENOVATION REQUIRED: Completely different dining furniture (different table style, chairs, buffets/sideboards - all different colors and styles from original), dramatic wall color changes, new flooring, updated lighting fixtures (chandelier/pendant over table), new window treatments, contemporary decor. FURNITURE MANDATE: Dining table, chairs, storage furniture - all must be completely different styles and colors from original. REMOVE ALL PERSONAL ITEMS: Remove photos, personal artwork, cultural symbols, memorabilia. TRANSFORM APPEARANCE: Every surface and furniture piece must look completely renovated.",
  entrance_hall: "PRECISION REQUIRED: Generate a high-fidelity entrance hall renovation. PRESERVE STRUCTURAL POSITIONS: Wall locations, door openings, ceiling height, staircase positions (if present). MANDATORY WALL TRANSFORMATIONS: MUST completely change all wall colors, paint, and finishes from original - make walls dramatically different. FULL RENOVATION REQUIRED: Completely different furniture (console tables, seating, storage - all different styles and colors from original), dramatic wall color/material changes, new flooring, updated lighting fixtures, contemporary decor, new mirrors/artwork. FURNITURE MANDATE: All entrance furniture must be completely different styles and colors from original. REMOVE ALL PERSONAL ITEMS: Remove coats, shoes, personal items, family photos, cultural symbols. TRANSFORM APPEARANCE: Every surface and furniture piece must look completely renovated.",
  terrace: "PRECISION REQUIRED: Generate a high-fidelity terrace renovation. PRESERVE STRUCTURAL POSITIONS: Railings, door/window openings, structural elements, roof lines. MANDATORY SURFACE TRANSFORMATIONS: MUST completely change flooring materials and finishes from original. FULL RENOVATION REQUIRED: Completely different outdoor furniture (different seating, tables, planters - all different styles and colors from original), new flooring (tiles, decking, or stone), updated lighting fixtures suitable for outdoors, new planters and greenery, contemporary outdoor decor, weather-appropriate textiles. FURNITURE MANDATE: All outdoor furniture must be completely different styles and colors from original. REMOVE ALL PERSONAL ITEMS: Remove personal belongings, old furniture, clutter. TRANSFORM APPEARANCE: Every surface and furniture piece must look completely renovated for outdoor living.",
  balcony: "PRECISION REQUIRED: Generate a high-fidelity balcony renovation. PRESERVE STRUCTURAL POSITIONS: Railings, door openings, structural supports, building facade elements. MANDATORY SURFACE TRANSFORMATIONS: MUST completely change flooring materials and finishes from original. FULL RENOVATION REQUIRED: Completely different compact outdoor furniture (different seating, small tables, planters - all different styles and colors from original), new flooring suitable for balconies, updated lighting fixtures, new planters with appropriate plants, contemporary space-efficient decor. FURNITURE MANDATE: All balcony furniture must be completely different styles and colors from original. REMOVE ALL PERSONAL ITEMS: Remove personal belongings, old furniture, clutter. TRANSFORM APPEARANCE: Every surface and furniture piece must look completely renovated for compact outdoor living."
} as const;

// Room detection prompt for Gemini
export const ROOM_DETECTION_PROMPT = `
Analyze this image and identify the type of room. You must respond with EXACTLY one of these room types:
- living_room
- bedroom
- bathroom
- entrance_hall
- terrace
- balcony
- kitchen
- dining_room

Based on the furniture, fixtures, and architectural elements visible in the image, determine which room type this is.

Key indicators:
- KITCHEN: Cabinets, countertops, stove, refrigerator, sink
- BATHROOM: Toilet, shower/bathtub, sink/vanity, bathroom fixtures
- BEDROOM: Bed, nightstands, dressers, bedroom furniture
- LIVING_ROOM: Sofas, coffee tables, TV area, living/sitting furniture
- DINING_ROOM: Dining table, dining chairs, dedicated eating area
- ENTRANCE_HALL: Entry area, coat storage, console tables, foyer space
- TERRACE: Outdoor covered area, often with outdoor furniture
- BALCONY: Small outdoor area attached to building, usually with railings

Respond with only the room type (e.g., "kitchen" or "living_room"). If unclear, choose the most likely room type based on dominant features.
`;

// Style instruction sets for different aesthetics
export const RENOVATION_STYLES = {
  default: `
    STYLE AESTHETIC - SCANDINAVIAN NORDIC:
    
    WALLS:
    - Paint: pure white (Benjamin Moore Simply White), soft off-whites
    - Wood accent walls: light pine, birch, or whitewashed oak planks
    - Materials: smooth painted surfaces, natural wood paneling
    - Trim: white-painted wood in simple profiles
    
    FLOORS:
    - Hardwood: light oak, ash, or pine in natural matte finish
    - Tile: white or light gray ceramic/porcelain in simple patterns
    - Carpet: minimal use, natural wool in cream or light gray
    - Rugs: natural jute, wool in geometric patterns, or solid light colors
    
    FURNITURE:
    - Sofas: comfortable designs in light gray linen or white cotton
    - Tables: light wood (oak, birch) with simple, functional designs
    - Seating: Windsor chairs, wishbone chairs, or upholstered pieces in natural fabrics
    - Storage: light wood shelving, white painted cabinets with wood tops
    - Materials: light woods, white painted surfaces, natural textiles
    
    LIGHTING:
    - Pendant lights: simple shapes in white, wood, or brass
    - Table lamps: ceramic bases in white/cream with linen shades
    - Floor lamps: tripod wood legs with white shades
    - Candles and lanterns for hygge atmosphere
    
    KITCHEN SPECIFICS:
    - Cabinets: white painted Shaker-style or light wood flat-panel
    - Countertops: white quartz, light wood butcher block, or white marble
    - Backsplash: white subway tile, light wood, or white stone
    - Appliances: white or stainless steel with clean lines
    - Hardware: brushed brass, white, or light wood knobs and pulls
    
    CRITICAL: Transform ALL wall colors and finishes completely - no wall should remain the same color or finish as the original image. Paint every wall surface with the specified Scandinavian aesthetic.
  `,
  
  scandinavian: `
    STYLE AESTHETIC - SCANDINAVIAN NORDIC:
    
    WALLS:
    - Paint: pure white (Benjamin Moore Simply White), soft off-whites
    - Wood accent walls: light pine, birch, or whitewashed oak planks
    - Materials: smooth painted surfaces, natural wood paneling
    - Trim: white-painted wood in simple profiles
    
    FLOORS:
    - Hardwood: light oak, ash, or pine in natural matte finish
    - Tile: white or light gray ceramic/porcelain in simple patterns
    - Carpet: minimal use, natural wool in cream or light gray
    - Rugs: natural jute, wool in geometric patterns, or solid light colors
    
    FURNITURE:
    - Sofas: comfortable designs in light gray linen or white cotton
    - Tables: light wood (oak, birch) with simple, functional designs
    - Seating: Windsor chairs, wishbone chairs, or upholstered pieces in natural fabrics
    - Storage: light wood shelving, white painted cabinets with wood tops
    - Materials: light woods, white painted surfaces, natural textiles
    
    LIGHTING:
    - Pendant lights: simple shapes in white, wood, or brass
    - Table lamps: ceramic bases in white/cream with linen shades
    - Floor lamps: tripod wood legs with white shades
    - Candles and lanterns for hygge atmosphere
    
    KITCHEN SPECIFICS:
    - Cabinets: white painted Shaker-style or light wood flat-panel
    - Countertops: white quartz, light wood butcher block, or white marble
    - Backsplash: white subway tile, light wood, or white stone
    - Appliances: white or stainless steel with clean lines
    - Hardware: brushed brass, white, or light wood knobs and pulls
    
    CRITICAL: Transform ALL wall colors and finishes completely - no wall should remain the same color or finish as the original image. Paint every wall surface with the specified Scandinavian aesthetic.
  `,
  
  mediterranean: `
    STYLE AESTHETIC - MEDITERRANEAN COASTAL:
    
    WALLS:
    - Paint: warm whites, cream, soft terracotta, sage green
    - Textured finishes: lime plaster, stucco, or faux painting techniques
    - Stone accent walls: natural limestone, travertine, or stacked stone
    - Trim: arched openings, decorative moldings in warm wood tones
    
    FLOORS:
    - Tile: terracotta, ceramic in earth tones, natural stone (travertine, limestone)
    - Hardwood: distressed oak, chestnut, or reclaimed wood with character
    - Natural stone: tumbled marble, slate, or flagstone
    - Rugs: Persian, kilim, or natural fiber in warm earth tones
    
    FURNITURE:
    - Sofas: comfortable designs in warm fabrics (linen, cotton) in earth tones
    - Tables: dark wood (walnut, mahogany) with carved details or wrought iron bases
    - Seating: upholstered in rich fabrics, wrought iron chairs with cushions
    - Storage: dark wood armoires, wrought iron and wood combinations
    - Materials: dark woods, wrought iron, natural fabrics, ceramic accents
    
    LIGHTING:
    - Chandeliers: wrought iron with candle-style bulbs or ceramic details
    - Pendant lights: ceramic, terracotta, or metal in warm finishes
    - Table lamps: ceramic bases in earth tones with fabric shades
    - Lantern-style fixtures, warm ambient lighting
    
    KITCHEN SPECIFICS:
    - Cabinets: dark wood stain, distressed finishes, or warm painted colors
    - Countertops: granite in warm tones, butcher block, or natural stone
    - Backsplash: ceramic tile in earth tones, natural stone, or decorative patterns
    - Appliances: copper, bronze, or stainless with warm undertones
    - Hardware: wrought iron, aged bronze, or copper finishes
    
    CRITICAL: Transform ALL wall colors and finishes completely - no wall should remain the same color or finish as the original image. Paint every wall surface with the specified Mediterranean aesthetic.
  `,
  
  industrial: `
    STYLE AESTHETIC - MODERN INDUSTRIAL:
    
    WALLS:
    - Exposed brick: red brick, painted brick in charcoal or white
    - Paint: charcoal gray, deep black, or warm whites as contrast
    - Materials: concrete, metal panels, or reclaimed wood accent walls
    - Trim: minimal or metal channels, exposed structural elements
    
    FLOORS:
    - Concrete: polished, stained, or painted in gray tones
    - Hardwood: reclaimed or distressed wood in dark stains
    - Metal: steel plate or grating (accent areas)
    - Rugs: minimal use, leather or canvas materials, geometric patterns
    
    FURNITURE:
    - Sofas: leather upholstery in brown, black, or charcoal
    - Tables: reclaimed wood tops with steel pipe or beam bases
    - Seating: metal chairs, leather bar stools, vintage industrial pieces
    - Storage: metal lockers, pipe shelving, reclaimed wood and steel combinations
    - Materials: steel, iron, reclaimed wood, leather, canvas
    
    LIGHTING:
    - Pendant lights: Edison bulbs, metal shades, track lighting systems
    - Exposed fixtures: conduit wiring, industrial-style switches
    - Floor lamps: tripod designs with metal shades, photographer's lamps
    - Task lighting with adjustable metal arms and exposed bulbs
    
    KITCHEN SPECIFICS:
    - Cabinets: dark stained wood, metal fronts, or open shelving with pipes
    - Countertops: concrete, butcher block, or steel surfaces
    - Backsplash: subway tile, metal panels, or exposed brick
    - Appliances: stainless steel, black steel, or copper accents
    - Hardware: black iron, aged steel, or copper pipe-style handles
    
    CRITICAL: Transform ALL wall colors and finishes completely - no wall should remain the same color or finish as the original image. Paint every wall surface with the specified Industrial aesthetic.
  `,
  
  transitional: `
    STYLE AESTHETIC - TRANSITIONAL CONTEMPORARY:
    
    WALLS:
    - Paint: soft neutrals (greige, warm gray, cream, soft beige)
    - Accent walls: navy blue, sage green, or rich charcoal
    - Materials: smooth painted surfaces with classic crown molding
    - Trim: traditional profiles in white or matching wall colors
    
    FLOORS:
    - Hardwood: medium-toned oak, maple, or hickory in satin finish
    - Tile: neutral stone-look or wood-look porcelain in larger formats
    - Carpet: traditional patterns in updated colors, plush textures
    - Rugs: traditional patterns with contemporary color palettes
    
    FURNITURE:
    - Sofas: comfortable traditional silhouettes in updated fabrics
    - Tables: wood with classic shapes but cleaner lines, mixed materials
    - Seating: upholstered pieces mixing traditional forms with modern fabrics
    - Storage: built-ins with traditional details, painted or stained wood
    - Materials: quality woods, mixed metals, linen and cotton fabrics
    
    LIGHTING:
    - Chandeliers: updated traditional designs in mixed metals
    - Pendant lights: classic shapes with contemporary finishes
    - Table lamps: ceramic or metal bases with drum or empire shades
    - Layered lighting with dimmer controls for ambiance
    
    KITCHEN SPECIFICS:
    - Cabinets: Shaker or raised panel doors in painted or stained finishes
    - Countertops: quartz or granite in neutral tones with subtle veining
    - Backsplash: subway tile, natural stone, or ceramic in classic patterns
    - Appliances: stainless steel or panel-ready with traditional styling
    - Hardware: mixed metals (brass and chrome), classic knobs and pulls
    
    CRITICAL: Transform ALL wall colors and finishes completely - no wall should remain the same color or finish as the original image. Paint every wall surface with the specified Transitional aesthetic.
  `
} as const;

export type RenovationStyle = keyof typeof RENOVATION_STYLES;

// Function to combine base prompt with style instructions
export function getRenovationPromptWithStyle(
  renovationType: RenovationType, 
  style: RenovationStyle = 'default'
): string {
  const basePrompt = RENOVATION_PROMPTS[renovationType];
  const styleInstructions = RENOVATION_STYLES[style];
  
  return `${basePrompt}\n\n${styleInstructions}`;
}

// Settings for Gemini API calls
export const GEMINI_RENOVATION_SETTINGS = {
  model: "gemini-2.5-flash-image-preview",
  maxOutputTokens: 8192,
  temperature: 0.7,
} as const;

// Comparison slider state for renovation results
export interface RenovationComparisonState {
  isVisible: boolean;
  originalImage: string;
  renovatedImage: string;
  sliderPosition: number; // 0-100 percentage
}

// Renovation status type for UI components  
export type RenovationStatus = 'idle' | 'processing' | 'success' | 'error';

// Renovated image data structure
export interface RenovatedImageData {
  originalImageUrl: string;
  renovatedImageUrl: string;
  originalImageId: bigint;
  renovatedPropertyImage?: PropertyImage;
  renovationType?: RenovationType;
}

// Room Assembly Prompt Structure
export interface RoomAssemblyPrompt {
  prompt_name: string;
  base_style: string;
  aspect_ratio: string;
  room_description: string;
  camera_setup: string;
  assembled_elements: string[];
  negative_prompts: string[];
}

// Room assembly prompts for each room type
export const ROOM_ASSEMBLY_PROMPTS: Record<RenovationType, RoomAssemblyPrompt> = {
  living_room: {
    prompt_name: "Living Room Assembly",
    base_style: "cinematic, photorealistic, 4K",
    aspect_ratio: "16:9",
    room_description: "A large sunlit Scandinavian living room with white walls and light wood floors.",
    camera_setup: "A close-up shot, marketing-like, wide-angle. The camera moves very subtly for the entire 8-second duration.",
    assembled_elements: [
      "white/beige sofa with white cushions",
      "light wood coffee table",
      "light wood side tables", 
      "white table lamps",
      "white/beige floor lamps",
      "light wood TV stand/entertainment unit",
      "light wood bookshelf with white backing",
      "beige/white armchairs",
      "white/cream area rug",
      "white/cream curtains",
      "white/beige throw pillows",
      "beige throw blankets",
      "minimalist white-framed art",
      "simple white/beige decorative objects",
      "potted green plants"
    ],
    negative_prompts: ["no people", "no text overlays", "no distracting music"]
  },

  bedroom: {
    prompt_name: "Bedroom Assembly",
    base_style: "cinematic, photorealistic, 4K",
    aspect_ratio: "16:9",
    room_description: "A large sunlit Scandinavian bedroom with white walls and light wood floors.",
    camera_setup: "A close-up shot, marketing-like, wide-angle. The camera moves very subtly for the entire 8-second duration.",
    assembled_elements: [
      "bed with white duvet",
      "beige throw blanket",
      "light wood bedside tables",
      "white bedside lamps",
      "light wood wardrobe",
      "light wood shelves",
      "white/light wood mirror",
      "minimalist white-framed art",
      "white/cream area rug",
      "white/cream curtains",
      "potted green plants"
    ],
    negative_prompts: ["no people", "no text overlays", "no distracting music"]
  },

  kitchen: {
    prompt_name: "Kitchen Assembly",
    base_style: "cinematic, photorealistic, 4K",
    aspect_ratio: "16:9",
    room_description: "A large sunlit Scandinavian kitchen with white walls and light wood floors.",
    camera_setup: "A close-up shot, marketing-like, wide-angle. The camera moves very subtly for the entire 8-second duration.",
    assembled_elements: [
      "white kitchen cabinets",
      "light wood countertops",
      "white subway tile backsplash",
      "light wood kitchen island",
      "white/beige bar stools",
      "white pendant lights",
      "white under-cabinet lighting",
      "white appliances (fridge, stove, oven)",
      "white sink with chrome faucet",
      "white/beige decorative bowls",
      "potted green herbs",
      "light wood cutting boards",
      "white/clear storage containers",
      "white/cream window treatments"
    ],
    negative_prompts: ["no people", "no text overlays", "no distracting music", "no clutter"]
  },

  bathroom: {
    prompt_name: "Bathroom Assembly",
    base_style: "cinematic, photorealistic, 4K",
    aspect_ratio: "16:9",
    room_description: "A large sunlit Scandinavian bathroom with white walls and light wood floors.",
    camera_setup: "A close-up shot, marketing-like, wide-angle. The camera moves very subtly for the entire 8-second duration.",
    assembled_elements: [
      "white vanity cabinet",
      "white/light wood bathroom mirror",
      "white vanity lighting",
      "white toilet",
      "white shower/bathtub",
      "white shower curtain/glass door",
      "white towel racks",
      "white/beige bath towels",
      "white/cream bath mat",
      "white/beige storage baskets",
      "white/clear decorative containers",
      "potted green plants",
      "white wall-mounted shelves",
      "minimalist white-framed artwork"
    ],
    negative_prompts: ["no people", "no text overlays", "no distracting music", "no personal items"]
  },

  dining_room: {
    prompt_name: "Dining Room Assembly",
    base_style: "cinematic, photorealistic, 4K",
    aspect_ratio: "16:9",
    room_description: "A large sunlit Scandinavian dining room with white walls and light wood floors.",
    camera_setup: "A close-up shot, marketing-like, wide-angle. The camera moves very subtly for the entire 8-second duration.",
    assembled_elements: [
      "light wood dining table",
      "white/beige dining chairs",
      "white/simple pendant light",
      "light wood sideboard/buffet",
      "white display cabinet",
      "white/cream area rug",
      "white/cream curtains",
      "minimalist white-framed wall art",
      "white/beige decorative centerpiece",
      "white/beige table runner",
      "white dinnerware display",
      "light wood wine storage",
      "potted green plants",
      "white/light wood mirrors"
    ],
    negative_prompts: ["no people", "no text overlays", "no distracting music"]
  },

  entrance_hall: {
    prompt_name: "Entrance Hall Assembly",
    base_style: "cinematic, photorealistic, 4K",
    aspect_ratio: "16:9",
    room_description: "A large sunlit Scandinavian entrance hall with white walls and light wood floors.",
    camera_setup: "A close-up shot, marketing-like, wide-angle. The camera moves very subtly for the entire 8-second duration.",
    assembled_elements: [
      "light wood console table",
      "white/light wood entry mirror",
      "white coat rack/hooks",
      "light wood shoe storage bench",
      "white umbrella stand",
      "white table lamp",
      "white/beige decorative bowl/tray",
      "minimalist white-framed wall art",
      "white/cream area rug/runner",
      "potted green plants",
      "white key holder",
      "white/beige storage baskets",
      "white ceiling light fixture"
    ],
    negative_prompts: ["no people", "no text overlays", "no distracting music", "no clutter"]
  },

  terrace: {
    prompt_name: "Terrace Assembly",
    base_style: "cinematic, photorealistic, 4K",
    aspect_ratio: "16:9",
    room_description: "A large sunlit Scandinavian outdoor terrace with natural lighting and clean, open space.",
    camera_setup: "A close-up shot, marketing-like, wide-angle. The camera moves very subtly for the entire 8-second duration.",
    assembled_elements: [
      "light wood outdoor dining table",
      "white/beige outdoor chairs",
      "white/beige outdoor sofa/seating",
      "white/beige outdoor cushions",
      "white/beige umbrella/shade",
      "white/cream outdoor rug",
      "white/beige planters with green plants",
      "white outdoor lighting",
      "light wood side tables",
      "white/beige outdoor storage",
      "white decorative lanterns",
      "white/beige outdoor textiles",
      "simple white/beige garden accessories"
    ],
    negative_prompts: ["no people", "no text overlays", "no distracting music", "no indoor furniture"]
  },

  balcony: {
    prompt_name: "Balcony Assembly",
    base_style: "cinematic, photorealistic, 4K",
    aspect_ratio: "16:9",
    room_description: "A cozy compact Scandinavian balcony with natural lighting and space-efficient design.",
    camera_setup: "A close-up shot, marketing-like, wide-angle. The camera moves very subtly for the entire 8-second duration.",
    assembled_elements: [
      "light wood compact outdoor table",
      "white/beige folding chairs",
      "white/beige small outdoor cushions",
      "white vertical planters",
      "hanging green plants",
      "white outdoor lighting string",
      "white compact storage",
      "white/cream outdoor rug",
      "simple white/beige decorative elements",
      "white/beige privacy screen",
      "white wall-mounted shelves"
    ],
    negative_prompts: ["no people", "no text overlays", "no distracting music", "no large furniture"]
  }
} as const;

// Function to generate assembly renovation prompt
export function getAssemblyRenovationPrompt(
  roomType: RenovationType,
  selectedElements?: string[], // Optional: only modify specific elements
  style: RenovationStyle = 'default'
): string {
  const assemblyPrompt = ROOM_ASSEMBLY_PROMPTS[roomType];
  const styleInstructions = RENOVATION_STYLES[style];
  
  // If specific elements are selected, focus on those
  const elementsToInclude = selectedElements && selectedElements.length > 0 
    ? selectedElements 
    : assemblyPrompt.assembled_elements;
  
  const elementsText = elementsToInclude.map(element => `- ${element}`).join('\n');
  const negativeText = assemblyPrompt.negative_prompts.map(neg => `- ${neg}`).join('\n');
  
  return `
ASSEMBLY RENOVATION - ${assemblyPrompt.prompt_name}

PRESERVE STRUCTURAL POSITIONS EXACTLY:
- Wall locations and dimensions (but CHANGE their appearance and materials completely)
- Door openings (but update door styles/materials/colors)
- Window openings (but update window frames/treatments)  
- Ceiling height (but change ceiling finishes/treatments)
- Floor plan layout (but completely change flooring materials)

ROOM VISION:
${assemblyPrompt.room_description}

CAMERA & STYLE:
${assemblyPrompt.camera_setup}
${assemblyPrompt.base_style}
Aspect ratio: ${assemblyPrompt.aspect_ratio}

ASSEMBLED ELEMENTS TO TRANSFORM:
${elementsText}

STYLE AESTHETIC:
${styleInstructions}

MANDATORY REQUIREMENTS:
- Transform ALL specified elements with completely different styles, colors, and arrangements
- Remove all personal belongings, family photos, cultural symbols, memorabilia
- Replace with neutral, contemporary decor appropriate for the space
- Maintain photorealistic accuracy that respects the original space's positioning constraints

NEGATIVE ELEMENTS:
${negativeText}

CRITICAL: Every specified element must look completely renovated and different from the original image while maintaining the structural integrity and spatial relationships of the room.
`;
}

// Re-export PropertyImage type for convenience
export type { PropertyImage } from "~/lib/data";