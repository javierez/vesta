// Contact color palette and helpers for contact cards

// Color palette with 70% transparency (softer look)
export const CONTACT_PALETTE = {
  earth: 'rgba(149,113,79,0.7)',      // Earth - Owner
  moss: 'rgba(140,145,108,0.7)',     // Moss - Buyer
  sand: 'rgba(199,175,148,0.7)',     // Sand - Sin clasificar
  almond: 'rgba(234,222,208,0.7)',   // Almond - Inactive/Fallback
  sage: 'rgba(172,176,135,0.7)',     // Sage - Interested
}

// Returns a style object for the top line based on contact roles
export function getContactCardColor(contact: {
  isOwner?: boolean;
  isBuyer?: boolean;
  isInteresado?: boolean;
}): React.CSSProperties {
  const roles = []
  if (contact.isOwner) roles.push('owner')
  if (contact.isBuyer) roles.push('buyer')
  if (contact.isInteresado) roles.push('interested')

  // Multiple roles - create gradients with palette colors
  if (roles.length > 1) {
    const colorStops = []
    if (contact.isOwner) colorStops.push(CONTACT_PALETTE.earth)
    if (contact.isBuyer) colorStops.push(CONTACT_PALETTE.moss)
    if (contact.isInteresado) colorStops.push(CONTACT_PALETTE.sage)
    // Build gradient string
    if (colorStops.length === 2) {
      return {
        background: `linear-gradient(90deg, ${colorStops[0]}, ${colorStops[1]})`
      }
    } else if (colorStops.length === 3) {
      return {
        background: `linear-gradient(90deg, ${colorStops[0]}, ${colorStops[1]}, ${colorStops[2]})`
      }
    }
  }
  // Single role - solid color
  if (contact.isOwner) return { background: CONTACT_PALETTE.earth }
  if (contact.isBuyer) return { background: CONTACT_PALETTE.moss }
  if (contact.isInteresado) return { background: CONTACT_PALETTE.sage }
  // Fallback for unclassified
  return { background: CONTACT_PALETTE.sand }
}

// Returns a className for badge text color based on role and active state
export function getContactBadgeColor(
  role: 'owner' | 'buyer' | 'interested' | 'unclassified',
  isActive: boolean
): string {
  switch (role) {
    case 'owner':
    case 'buyer':
    case 'interested':
      return isActive ? 'text-white' : 'text-gray-500'
    case 'unclassified':
    default:
      return isActive ? 'text-gray-800' : 'text-gray-500'
  }
}
