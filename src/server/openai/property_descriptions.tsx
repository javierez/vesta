"use server";

// UNUSED FILE ALERT: This file is not currently used anywhere in the codebase
// Functions exist but are not imported or called by any other components

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the listing interface for type safety
interface PropertyListing {
  propertyType?: string;
  title?: string;
  price?: number | string;
  listingType?: string;
  squareMeter?: number;
  bedrooms?: number;
  bathrooms?: number;
  brandNew?: boolean;
  newConstruction?: boolean;
  needsRenovation?: boolean;
  lastRenovationYear?: number;
  terrace?: boolean;
  terraceSize?: number;
  balconyCount?: number;
  galleryCount?: number;
  wineCellar?: boolean;
  wineCellarSize?: number;
  exterior?: boolean;
  bright?: boolean;
  views?: boolean;
  mountainViews?: boolean;
  seaViews?: boolean;
  beachfront?: boolean;
  garden?: boolean;
  pool?: boolean;
  jacuzzi?: boolean;
  hydromassage?: boolean;
}

export async function generatePropertyDescription(listing: PropertyListing) {
  try {
    if (!listing) {
      throw new Error("Listing data is required");
    }

    // Create a prompt with all relevant property information
    const prompt = `Generate a professional property description in Spanish (200 words approximately) for a ${listing.propertyType} with these confirmed characteristics:

    Basic Information:
    Title: ${listing.title}
    Price: ${listing.price}€
    Listing Type: ${listing.listingType}
    Property Type: ${listing.propertyType}

    Property Specifications:
    Size: ${listing.squareMeter}m²
    Bedrooms: ${listing.bedrooms}
    Bathrooms: ${listing.bathrooms}

    Construction & Renovation:
    ${listing.brandNew ? "Brand New: Yes" : ""}
    ${listing.newConstruction ? "New Construction: Yes" : ""}
    ${listing.needsRenovation ? "Needs Renovation: Yes" : ""}
    ${listing.lastRenovationYear ? `Last Renovation Year: ${listing.lastRenovationYear}` : ""}

    Additional Spaces:
    ${listing.terrace ? `Terrace: Yes (${listing.terraceSize}m²)` : ""}
    ${listing.balconyCount ? `Balconies: ${listing.balconyCount}` : ""}
    ${listing.galleryCount ? `Galleries: ${listing.galleryCount}` : ""}
    ${listing.wineCellar ? `Wine Cellar: Yes (${listing.wineCellarSize}m²)` : ""}

    Views & Exterior:
    ${listing.exterior ? "Exterior: Yes" : ""}
    ${listing.bright ? "Bright: Yes" : ""}
    ${listing.views ? "Views: Yes" : ""}
    ${listing.mountainViews ? "Mountain Views: Yes" : ""}
    ${listing.seaViews ? "Sea Views: Yes" : ""}
    ${listing.beachfront ? "Beachfront: Yes" : ""}

    Premium Features:
    ${listing.garden ? "Garden: Yes" : ""}
    ${listing.pool ? "Pool: Yes" : ""}
    ${listing.jacuzzi ? "Jacuzzi: Yes" : ""}
    ${listing.hydromassage ? "Hydromassage: Yes" : ""}

    Write a flowing narrative that includes:
    - A compelling headline with property type and location
    - An introduction highlighting main selling points
    - Property condition and recent improvements (if any)
    - Layout and space distribution
    - Special features and amenities (if any)
    - Location benefits and connectivity (if any)
    - Neighborhood amenities and lifestyle

    Style Requirements:
    - Professional and engaging tone
    - Emotional connection with potential buyers
    - Descriptive language for visualization
    - Specific neighborhood details
    - Flowing narrative without numbers or bullet points
    - Keep descriptions concise and avoid overly elaborate language
    - Focus on key features without excessive embellishment

    IMPORTANT: Only mention explicitly confirmed features. Omit any unconfirmed information.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a professional real estate copywriter who specializes in creating engaging property descriptions in Spanish. Your style is similar to Engel & Völkers - sophisticated, detailed, and focused on both the property's features and its lifestyle benefits. You excel at creating emotional connections with potential buyers by highlighting the unique character of each property and its location. You are extremely careful to only mention features and characteristics that are explicitly confirmed in the data provided. Write in a flowing narrative style without using numbers, bullet points, or section breaks.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-4",
      temperature: 0.5,
      max_tokens: 500,
    });

    // Return the generated description
    return (
      completion.choices[0]?.message?.content ??
      "No se pudo generar la descripción"
    );
  } catch (error) {
    console.error("Error generating property description:", error);
    throw new Error("Failed to generate property description");
  }
}
