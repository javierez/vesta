## FEATURE:

- Connection Seeker — Rule‑Based Prospect ↔ Listing Matching
- Location: `src/components/prospects/conexiones-potenciales.tsx`
- Goal: connect buyer/renter prospects to property listings.
- Scope:
  - Primary: search within current account.
  - Secondary: show cross‑account matches with privacy‑preserving contact requests.
- Matching policy (strict with limited tolerance):
  - All fields must match exactly, except:
    - Price: allow ±5% tolerance around the prospect’s budget.
    - Square meters (area): allow ±5% tolerance around the prospect’s desired area.
- Required exact matches:
  - Operation type (buy/rent, etc.).
  - Property type (flat, house, local, etc.).
  - Location: one of the prospect’s allowed areas (municipality/district/neighborhood as defined in the app).
  - Bedrooms and bathrooms: listing must meet or exceed prospect minimums.
  - Must‑have features: listing must include all of them (elevator, parking, terrace, etc.).
  - Any other hard constraints (e.g., pets allowed, new build, accessibility) must be satisfied.
- Price and area tolerance:
  - If price range [min, max] is defined, expand both ends by ±5% for matching.
  - If only one bound exists, expand that bound logically (min × 0.95 or max × 1.05).
  - Apply the same logic to square meters (area).
- Result labeling:
  - Strict match: within original (non‑expanded) ranges.
  - Near‑strict match: uses the ±5% tolerance on price and/or area. Show which tolerance(s) applied (e.g., “Price +4%”).
- UI/UX:
  - Per prospect, show listing cards with: image(s), title, price, location, badges (rooms, baths, area, key features), and a label (Strict/Near‑strict) with short reasons.
  - Actions: Save, Dismiss, Contact (in‑account) or Request contact (cross‑account).
  - Filters: In‑account vs Cross‑account, show/hide Near‑strict, location, property type.
  - Empty: “No matches. Try enabling Near‑strict or broadening areas.”
- Cross‑account privacy:
  - Show: “A matching listing exists in another organization. Request contact?”
  - Do not reveal the other organization until acceptance.
  - On request: create a connection request; notify the owner; on acceptance, reveal a contact channel.
- Implementation notes (SingleStore):
  - Exact where‑clauses for operation/propertyType/location/features; bedrooms/bathrooms as ≥ filters.
  - Price/area conditions use ±5% expanded bounds.
  - Mark result as Strict vs Near‑strict by checking original bounds.
  - Suggested indexes: `(accountId)`, `(operation, propertyType)`, `(price)`, `(bedrooms)`, `(bathrooms)`, `(area)`, and location fields used for filtering.
- Out of scope (for now): AI/ML ranking or semantic matching; partial matching on any field other than price and area.

## EXAMPLES:

- Example A (Near‑strict price):
  - Prospect: Buy, flat, Chamberí; budget €300k–€350k; area 80–100 m²; min 3 bedrooms; must‑have elevator.
  - Listing: Price €360k; 82 m²; 3 bedrooms; elevator; Chamberí.
  - Match: Near‑strict (Price +2.9% over max; within area and all hard constraints).
- Example B (Strict):
  - Prospect: Rent, house, Salamanca; max €2,000; min 120 m²; min 3 bedrooms; parking required.
  - Listing: €1,950; 130 m²; 3 bedrooms; parking; Salamanca.
  - Match: Strict (all within original bounds).
- Example C (Reject due to hard constraint):
  - Prospect requires elevator; listing lacks elevator.
  - Result: Reject, even if price/area within tolerance.

## DOCUMENTATION:

- Component: `src/components/prospects/conexiones-potenciales.tsx` (client component, TSX, Tailwind, Lucide for icons).
- Suggested server entrypoint: `getMatchesForProspects({ accountId, prospectIds, paging, showNearStrict })`.
- Data: SingleStore listings and prospects tables; enforce filters in SQL where possible.
- References:
  - Next.js App Router docs: [Next.js App Router](https://nextjs.org/docs/app)
  - Tailwind CSS docs: [Tailwind CSS](https://tailwindcss.com/docs)
  - Lucide icons: [Lucide](https://lucide.dev/)
  - SingleStore SQL: [SingleStore Docs](https://docs.singlestore.com/)

## OTHER CONSIDERATIONS:

- Performance: apply indexes; paginate and limit results; prefer server‑side filtering.
- Privacy: never reveal other org identity until request accepted; audit log contact requests.
- Controls: toggle to include/exclude Near‑strict; persistent user preference.
- Feedback: allow Dismiss with reason to improve future constraints (optional).
- Accessibility: meaningful labels for Strict/Near‑strict; button roles and keyboard navigation.
- Internationalization: support currency and area units (m²), locale formatting.
- Tech rules: use TSX, 'use client' for the component, Tailwind for styling, Lucide for icons.