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

// Renovation types for different room prompts
export type RenovationType = 'kitchen' | 'bathroom' | 'living_room' | 'bedroom' | 'generic';

// Renovation prompts for different room types
export const RENOVATION_PROMPTS: Record<RenovationType, string> = {
  kitchen: "PRECISION REQUIRED: Generate a high-fidelity kitchen renovation. PRESERVE STRUCTURAL POSITIONS: Wall locations, door/window openings, ceiling height, plumbing/electrical locations. MANDATORY WALL TRANSFORMATIONS: MUST completely change all wall colors, paint, and finishes from original - make walls dramatically different while keeping same positions. MUST update backsplash completely. MUST change cabinet colors/styles entirely. FULL RENOVATION REQUIRED: New kitchen cabinets (completely different style/color from original), new countertops (different material/color), modern appliances (same locations but different styles), dramatic backsplash change, complete paint transformation, new lighting fixtures, updated hardware. FURNITURE MANDATE: All furniture, stools, chairs must be completely different styles and colors from original. REMOVE ALL PERSONAL ITEMS: Remove personal belongings, photos, magnets, notes, cultural items. TRANSFORM APPEARANCE: Every surface and furniture piece must look completely renovated and different from original.",
  bathroom: "PRECISION REQUIRED: Generate a high-fidelity bathroom renovation. PRESERVE STRUCTURAL POSITIONS: Wall locations, door/window openings, plumbing locations. MANDATORY WALL TRANSFORMATIONS: MUST completely change all wall colors, tiles, and finishes from original - make walls dramatically different. MUST transform shower/tub walls with new tile work. FULL RENOVATION REQUIRED: Complete tile transformation (walls and floors), new vanity (completely different style/color from original), updated fixtures, dramatic wall color/finish changes, new lighting, contemporary accessories. FURNITURE MANDATE: All furniture, storage, seating must be completely different styles and colors from original. REMOVE ALL PERSONAL ITEMS: Remove toiletries, towels, personal items, cultural symbols. TRANSFORM APPEARANCE: Every surface and furniture piece must look completely renovated.",
  living_room: "PRECISION REQUIRED: Generate a high-fidelity living room renovation. PRESERVE STRUCTURAL POSITIONS: Wall locations, door/window openings, ceiling height, built-ins locations. MANDATORY WALL TRANSFORMATIONS: MUST completely change all wall colors, paint, and finishes from original - make walls dramatically different. MUST add/change accent walls with new colors or materials. FULL RENOVATION REQUIRED: Completely different furniture (different styles, colors, arrangements from original), dramatic wall color changes, new flooring, updated lighting fixtures, new window treatments, contemporary decor. FURNITURE MANDATE: Sofas, chairs, tables, storage - all must be completely different styles and colors from original. REMOVE ALL PERSONAL ITEMS: Remove photos, books, personal artwork, cultural symbols, memorabilia. TRANSFORM APPEARANCE: Every surface and furniture piece must look completely renovated.",
  bedroom: "PRECISION REQUIRED: Generate a high-fidelity bedroom renovation. PRESERVE STRUCTURAL POSITIONS: Wall locations, door/window openings, ceiling height, built-in locations. MANDATORY WALL TRANSFORMATIONS: MUST completely change all wall colors, paint, and finishes from original - make walls dramatically different. MUST add/change accent walls with new colors or materials. FULL RENOVATION REQUIRED: Completely different furniture (different bed style, nightstands, dressers - all different colors and styles from original), dramatic wall color changes, new flooring, updated lighting fixtures, new window treatments, contemporary bedding and decor. FURNITURE MANDATE: All bedroom furniture must be completely different styles and colors from original. REMOVE ALL PERSONAL ITEMS: Remove clothing, photos, personal artwork, cultural symbols. TRANSFORM APPEARANCE: Every surface and furniture piece must look completely renovated.",
  generic: `
    PRECISION REQUIRED: Generate a high-fidelity renovation maintaining exact structural positioning.

    PRESERVE STRUCTURAL POSITIONS EXACTLY:
    - Wall locations and dimensions (but CHANGE their appearance completely)
    - Door openings (but update door styles/materials/colors)
    - Window openings (but update window frames/treatments)
    - Ceiling height (but change ceiling finishes/treatments)
    - Floor plan layout (but completely change flooring materials)
    - Built-in structural elements (but update their finishes)

    MANDATORY WALL TRANSFORMATIONS:
    - MUST change wall colors/paint completely from original
    - MUST update wall textures and finishes dramatically
    - MUST add/change accent walls with new materials or colors
    - MUST update all trim and moldings to match new style
    - Transform every wall surface while keeping structural positions
    - Make walls look completely different from the original image

    MANDATORY COMPLETE TRANSFORMATIONS:
    - FURNITURE: Replace ALL furniture with completely different styles, colors, and arrangements - no piece should look similar to original
    - WALLS: Change ALL wall colors, paint, textures, and finishes dramatically
    - DECOR: Replace all accessories, artwork, and decorative items entirely
    - LIGHTING: Update all fixtures to match new style aesthetic
    - TEXTILES: New window treatments, rugs, and soft goods in style-appropriate colors
    - SURFACES: Transform all visible surfaces (walls, floors, ceilings)

    REMOVE PERSONAL ITEMS:
    Remove all personal belongings, family photos, flags, religious items, personal decorations, personal artwork, cultural symbols, memorabilia, and any items that reflect current occupant preferences. Replace with neutral, contemporary decor appropriate for the space.
    
    FURNITURE TRANSFORMATION REQUIREMENT:
    Every piece of furniture must be completely different from the original - different style, color, shape, and arrangement. Do not keep any furniture that looks similar to the original image.

    NO HALLUCINATIONS:
    Do not add/remove/move rooms, windows, doors, or structural openings. Maintain photorealistic accuracy that respects the original space's positioning constraints.
  `
} as const;

// Style instruction sets for different aesthetics
export const RENOVATION_STYLES = {
  modern: `
    STYLE AESTHETIC - MODERN CONTEMPORARY:
    
    WALLS:
    - Paint: crisp whites, soft grays (Benjamin Moore Cloud White, Agreeable Gray)
    - Accent walls: charcoal gray, deep navy, or textured concrete finish
    - Materials: smooth drywall, glass panels, or polished concrete
    - Trim: minimal profile baseboards and casings in matching wall color
    
    FLOORS:
    - Hardwood: wide-plank white oak with matte finish, or dark walnut
    - Tile: large format porcelain in concrete-look gray or white marble veining
    - Carpet: low-pile in neutral gray or cream tones (minimal use)
    - Rugs: geometric patterns in black/white or solid neutrals
    
    FURNITURE:
    - Sofas: clean lines, low profiles, in charcoal, white, or tan leather/fabric
    - Tables: glass tops with metal bases, or live-edge wood with steel legs
    - Seating: Barcelona chairs, Eames designs, or geometric armchairs
    - Storage: floating shelves, built-ins with hidden hardware
    - Materials: steel, glass, polished wood, leather upholstery
    
    LIGHTING:
    - Recessed LED ceiling lights with warm white temperature
    - Pendant lights: geometric shapes in brushed steel or matte black
    - Floor lamps: arc designs or slim profiles with metal finishes
    - Under-cabinet LED strips, integrated lighting systems
    
    KITCHEN SPECIFICS:
    - Cabinets: flat-panel doors in white, gray, or natural wood
    - Countertops: quartz in white/gray veining or concrete-look surfaces
    - Backsplash: subway tile, large format stone, or metal panels
    - Appliances: stainless steel or panel-ready integrated units
    - Hardware: brushed nickel, matte black, or chrome bar pulls
    
    CRITICAL: Transform ALL wall colors and finishes completely - no wall should remain the same color or finish as the original image. Paint every wall surface with the specified Modern aesthetic.
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
  style: RenovationStyle = 'modern'
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

// Re-export PropertyImage type for convenience
export type { PropertyImage } from "~/lib/data";