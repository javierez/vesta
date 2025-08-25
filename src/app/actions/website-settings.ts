"use server";

import { db } from "~/server/db";
import { websiteProperties, users, testimonials } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { 
  WebsiteConfigurationInput,
  HeroProps,
  FeaturedProps,
  AboutProps,
  PropertiesProps,
  TestimonialProps,
  ContactProps,
  FooterProps,
  HeadProps
} from "~/types/website-settings";

/**
 * Get current user's account ID from their user ID
 */
export async function getCurrentUserAccountId(userId: string): Promise<bigint | null> {
  try {
    const [user] = await db
      .select({ accountId: users.accountId })
      .from(users)
      .where(eq(users.id, userId));

    return user?.accountId ?? null;
  } catch (error) {
    console.error("Error getting user account ID:", error);
    return null;
  }
}

/**
 * Get website configuration for an account
 */
export async function getWebsiteConfigurationAction(accountId: bigint): Promise<{
  success: boolean;
  data?: WebsiteConfigurationInput;
  error?: string;
}> {
  try {
    const [config] = await db
      .select()
      .from(websiteProperties)
      .where(eq(websiteProperties.accountId, accountId));

    if (!config) {
      // Return default configuration if none exists
      return {
        success: true,
        data: {
          socialLinks: {
            facebook: "",
            instagram: "",
            twitter: "",
            linkedin: "",
            youtube: "",
          },
          seoProps: {
            title: "",
            description: "",
            keywords: "",
            ogImage: "",
          },
          logo: "",
          favicon: "",
          heroProps: {
            title: "",
            subtitle: "",
            backgroundImage: "",
            findPropertyButton: "Explorar Propiedades",
            contactButton: "Contáctanos",
          },
          featuredProps: {
            title: "Propiedades Destacadas",
            subtitle: "",
            maxItems: 6,
          },
          aboutProps: {
            title: "Sobre Nosotros",
            subtitle: "",
            content: "",
            content2: "",
            image: "",
            services: [],
            maxServicesDisplayed: 6,
            servicesSectionTitle: "Nuestros Servicios",
            aboutSectionTitle: "Nuestra Misión",
            buttonName: "Contacta a Nuestro Equipo",
            showKPI: true,
            kpi1Name: "",
            kpi1Data: "",
            kpi2Name: "",
            kpi2Data: "",
            kpi3Name: "",
            kpi3Data: "",
            kpi4Name: "",
            kpi4Data: "",
          },
          propertiesProps: {
            title: "Nuestras Propiedades",
            subtitle: "",
            itemsPerPage: 12,
            defaultSort: "price-desc",
            buttonText: "Ver Todas las Propiedades",
          },
          testimonialProps: {
            title: "Lo que dicen nuestros clientes",
            subtitle: "",
            itemsPerPage: 3,
            testimonials: [
              {
                testimonial_id: "1125899906842625",
                name: "Sara Jiménez",
                role: "Propietaria",
                content: "Trabajar con Acropolis Bienes Raíces fue un sueño. Entendieron exactamente lo que estábamos buscando y nos encontraron nuestra casa familiar perfecta dentro de nuestro presupuesto. Todo el proceso fue fluido y sin estrés.",
                avatar: "/properties/confident-leader.png",
                rating: 5,
                is_verified: true,
                sort_order: 1,
                is_active: true,
              },
              {
                testimonial_id: "1125899906842626",
                name: "Miguel Chen",
                role: "Inversionista Inmobiliario",
                content: "Como inversionista, aprecio el conocimiento del mercado y la atención al detalle de Acropolis. Me han ayudado a adquirir múltiples propiedades con excelente potencial de retorno de inversión. Su experiencia es realmente invaluable.",
                avatar: "/properties/confident-leader.png",
                rating: 5,
                is_verified: true,
                sort_order: 2,
                is_active: true,
              },
              {
                testimonial_id: "1125899906842627",
                name: "Emilia Rodríguez",
                role: "Compradora por Primera Vez",
                content: "Ser compradora de vivienda por primera vez fue intimidante, pero el equipo de Acropolis me guió en cada paso. Fueron pacientes, informativos y me encontraron un maravilloso condominio que se ajustaba a todas mis necesidades.",
                avatar: "/properties/serene-gaze.png",
                rating: 5,
                is_verified: true,
                sort_order: 3,
                is_active: true,
              },
            ],
          },
          contactProps: {
            title: "Contáctanos",
            subtitle: "",
            messageForm: true,
            address: true,
            phone: true,
            mail: true,
            schedule: true,
            map: true,
            offices: [],
          },
          footerProps: {
            companyName: "",
            description: "",
            socialLinks: {
              facebook: "",
              instagram: "",
              twitter: "",
              linkedin: "",
            },
            officeLocations: [],
            quickLinksVisibility: {
              inicio: true,
              propiedades: true,
              nosotros: true,
              reseñas: true,
              contacto: true,
              comprar: false,
              alquilar: false,
              vender: false,
            },
            propertyTypesVisibility: {
              pisos: true,
              casas: true,
              locales: true,
              solares: true,
              garajes: true,
            },
            copyright: "",
            links: [],
          },
          headProps: {
            customScripts: "",
            googleAnalytics: "",
            facebookPixel: "",
          },
          metadata: {
            id: "",
            account_id: "",
            created_at: "",
            updated_at: "",
            logotype: "",
            mainpage: "",
          },
        },
      };
    }

    console.log('🔍 ACTIONS: Raw config from database:', config);
    console.log('🔍 ACTIONS: config.metadata field (raw):', config.metadata);
    console.log('🔍 ACTIONS: config.logotype field:', config.logotype);
    
    // Parse metadata JSON if it exists
    let parsedMetadata = {};
    if (config.metadata) {
      try {
        parsedMetadata = JSON.parse(config.metadata);
        console.log('✅ ACTIONS: Parsed metadata JSON:', parsedMetadata);
      } catch (error) {
        console.error('❌ ACTIONS: Error parsing metadata JSON:', error);
      }
    }
    
    // Parse JSON fields and construct the configuration
    const websiteConfig: WebsiteConfigurationInput = {
      socialLinks: JSON.parse(config.socialLinks ?? "{}") as Record<string, string>,
      seoProps: JSON.parse(config.seoProps ?? "{}") as Record<string, string>,
      logo: config.logo ?? "",
      favicon: config.favicon ?? "",
      heroProps: JSON.parse(config.heroProps ?? "{}") as HeroProps,
      featuredProps: JSON.parse(config.featuredProps ?? "{}") as FeaturedProps,
      aboutProps: JSON.parse(config.aboutProps ?? "{}") as AboutProps,
      propertiesProps: JSON.parse(config.propertiesProps ?? "{}") as PropertiesProps,
      testimonialProps: JSON.parse(config.testimonialProps ?? "{}") as TestimonialProps,
      contactProps: JSON.parse(config.contactProps ?? "{}") as ContactProps,
      footerProps: JSON.parse(config.footerProps ?? "{}") as FooterProps,
      headProps: JSON.parse(config.headProps ?? "{}") as HeadProps,
      metadata: {
        id: config.id?.toString(),
        account_id: config.accountId?.toString(),
        created_at: config.createdAt?.toISOString(),
        updated_at: config.updatedAt?.toISOString(),
        logotype: config.logotype ?? "",
        mainpage: config.metadata ?? "",
      }
    };
    
    console.log('✅ ACTIONS: Constructed websiteConfig:', websiteConfig);
    console.log('✅ ACTIONS: websiteConfig.metadata:', websiteConfig.metadata);
    console.log('✅ ACTIONS: websiteConfig.metadata.mainpage:', websiteConfig.metadata.mainpage);

    return { success: true, data: websiteConfig };
  } catch (error) {
    console.error("Error getting website configuration:", error);
    return { success: false, error: "Error al obtener la configuración del sitio web" };
  }
}

/**
 * Update specific section of website configuration
 */
export async function updateWebsiteSectionAction(
  accountId: bigint,
  section: string,
  data: Partial<WebsiteConfigurationInput>,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🚀 updateWebsiteSectionAction started");
    console.log("📊 AccountId:", accountId);
    console.log("🎯 Section:", section);
    console.log("📋 Data received:", JSON.stringify(data, null, 2));
    
    const now = new Date();

    // Check if configuration exists
    const [existingConfig] = await db
      .select()
      .from(websiteProperties)
      .where(eq(websiteProperties.accountId, accountId));

    // Prepare update data based on section
    const updateData: Record<string, unknown> = { updatedAt: now };
    
    if (section === 'seo' && data.seoProps) {
      updateData.seoProps = JSON.stringify(data.seoProps);
    }
    if (section === 'brand' && (data.logo !== undefined || data.favicon !== undefined)) {
      if (data.logo !== undefined) updateData.logo = data.logo ?? "";
      if (data.favicon !== undefined) updateData.favicon = data.favicon ?? "";
    }
    if (section === 'hero' && data.heroProps) {
      updateData.heroProps = JSON.stringify(data.heroProps);
    }
    if (section === 'featured' && data.featuredProps) {
      updateData.featuredProps = JSON.stringify(data.featuredProps);
    }
    if (section === 'about' && data.aboutProps) {
      updateData.aboutProps = JSON.stringify(data.aboutProps);
    }
    if (section === 'properties' && data.propertiesProps) {
      updateData.propertiesProps = JSON.stringify(data.propertiesProps);
    }
    if (section === 'testimonials' && data.testimonialProps) {
      updateData.testimonialProps = JSON.stringify(data.testimonialProps);
    }
    if (section === 'contact' && data.contactProps) {
      updateData.contactProps = JSON.stringify(data.contactProps);
    }
    if (section === 'footer' && data.footerProps) {
      updateData.footerProps = JSON.stringify(data.footerProps);
    }
    if (section === 'head' && data.headProps) {
      updateData.headProps = JSON.stringify(data.headProps);
    }
    if (section === 'social' && data.socialLinks) {
      updateData.socialLinks = JSON.stringify(data.socialLinks);
    }
    if (section === 'meta' && data.metadata) {
      console.log('💾 ACTIONS: Handling metadata save:', data.metadata);
      updateData.metadata = data.metadata.mainpage;
      console.log('💾 ACTIONS: Setting metadata to:', updateData.metadata);
    }

    console.log("📝 Section update data prepared:", updateData);

    if (existingConfig) {
      console.log("🔄 Updating existing configuration...");
      const result = await db
        .update(websiteProperties)
        .set(updateData)
        .where(eq(websiteProperties.accountId, accountId));
      console.log("✅ Update completed, result:", result);
    } else {
      console.log("➕ Creating new configuration...");
      // For new configs, we need to provide defaults for required fields
      const insertData = {
        accountId: accountId,
        socialLinks: JSON.stringify(data.socialLinks ?? {}),
        seoProps: JSON.stringify(data.seoProps ?? {}),
        logo: data.logo ?? "",
        logotype: "",
        favicon: data.favicon ?? "",
        heroProps: JSON.stringify(data.heroProps ?? {}),
        featuredProps: JSON.stringify(data.featuredProps ?? {}),
        aboutProps: JSON.stringify(data.aboutProps ?? {}),
        propertiesProps: JSON.stringify(data.propertiesProps ?? {}),
        testimonialProps: JSON.stringify(data.testimonialProps ?? {}),
        contactProps: JSON.stringify(data.contactProps ?? {}),
        footerProps: JSON.stringify(data.footerProps ?? {}),
        headProps: JSON.stringify(data.headProps ?? {}),
        metadata: data.metadata?.mainpage,
      };
      
      const result = await db.insert(websiteProperties).values(insertData);
      console.log("✅ Insert completed, result:", result);
    }

    console.log("🎉 Section update completed successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating website section:", error);
    console.error("📋 Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      accountId,
      section,
      dataKeys: Object.keys(data)
    });
    return { success: false, error: "Error al guardar la configuración del sitio web" };
  }
}

/**
 * Update website configuration for an account
 */
export async function updateWebsiteConfigurationAction(
  accountId: bigint,
  data: WebsiteConfigurationInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🚀 updateWebsiteConfigurationAction started");
    console.log("📊 AccountId:", accountId);
    console.log("📋 Data received:", JSON.stringify(data, null, 2));
    
    const now = new Date();
    console.log("⏰ Timestamp:", now);

    // Check if configuration exists
    console.log("🔍 Checking for existing configuration...");
    const [existingConfig] = await db
      .select()
      .from(websiteProperties)
      .where(eq(websiteProperties.accountId, accountId));

    console.log("📦 Existing config found:", !!existingConfig);

    if (existingConfig) {
      console.log("🔄 Updating existing configuration...");
      const updateData = {
        socialLinks: JSON.stringify(data.socialLinks),
        seoProps: JSON.stringify(data.seoProps),
        logo: data.logo ?? "",
        favicon: data.favicon ?? "",
        heroProps: JSON.stringify(data.heroProps),
        featuredProps: JSON.stringify(data.featuredProps),
        aboutProps: JSON.stringify(data.aboutProps),
        propertiesProps: JSON.stringify(data.propertiesProps),
        testimonialProps: JSON.stringify(data.testimonialProps),
        contactProps: JSON.stringify(data.contactProps),
        footerProps: JSON.stringify(data.footerProps),
        headProps: JSON.stringify(data.headProps),
        metadata: data.metadata?.mainpage,
        updatedAt: now,
      };
      
      console.log("📝 Update data prepared:", updateData);
      
      const result = await db
        .update(websiteProperties)
        .set(updateData)
        .where(eq(websiteProperties.accountId, accountId));
        
      console.log("✅ Update completed, result:", result);
    } else {
      console.log("➕ Creating new configuration...");
      const insertData = {
        accountId: accountId,
        socialLinks: JSON.stringify(data.socialLinks),
        seoProps: JSON.stringify(data.seoProps),
        logo: data.logo ?? "",
        logotype: "", // Add default for required field
        favicon: data.favicon ?? "",
        heroProps: JSON.stringify(data.heroProps),
        featuredProps: JSON.stringify(data.featuredProps),
        aboutProps: JSON.stringify(data.aboutProps),
        propertiesProps: JSON.stringify(data.propertiesProps),
        testimonialProps: JSON.stringify(data.testimonialProps),
        contactProps: JSON.stringify(data.contactProps || "{}"),
        footerProps: JSON.stringify(data.footerProps),
        headProps: JSON.stringify(data.headProps),
        metadata: data.metadata?.mainpage,
      };
      
      console.log("📝 Insert data prepared:", insertData);
      
      const result = await db.insert(websiteProperties).values(insertData);
      
      console.log("✅ Insert completed, result:", result);
    }

    console.log("🎉 Operation completed successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating website configuration:", error);
    console.error("📋 Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      accountId,
      dataKeys: Object.keys(data)
    });
    return { success: false, error: "Error al guardar la configuración del sitio web" };
  }
}

/**
 * Seed testimonials for an account (creates sample data if none exist)
 */
export async function seedTestimonialsAction(accountId: bigint): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🌱 SEED: Starting testimonials seeding for accountId:", accountId);
    
    // Check if testimonials already exist
    console.log("🔍 SEED: Checking for existing testimonials...");
    const existing = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.accountId, accountId));

    console.log("📊 SEED: Found", existing.length, "existing testimonials");

    if (existing.length > 0) {
      console.log("✅ SEED: Testimonials already exist, skipping seed");
      return { success: true }; // Already have testimonials
    }

    console.log("🌱 SEED: Creating sample testimonials...");
    // Create sample testimonials
    const sampleTestimonials = [
      {
        accountId,
        name: "Sara Jiménez",
        role: "Propietaria",
        content: "Trabajar con Acropolis Bienes Raíces fue un sueño. Entendieron exactamente lo que estábamos buscando y nos encontraron nuestra casa familiar perfecta dentro de nuestro presupuesto. Todo el proceso fue fluido y sin estrés.",
        avatar: "/properties/confident-leader.png",
        rating: 5,
        isVerified: true,
        sortOrder: 1,
        isActive: true,
      },
      {
        accountId,
        name: "Miguel Chen",
        role: "Inversionista Inmobiliario",
        content: "Como inversionista, aprecio el conocimiento del mercado y la atención al detalle de Acropolis. Me han ayudado a adquirir múltiples propiedades con excelente potencial de retorno de inversión. Su experiencia es realmente invaluable.",
        avatar: "/properties/confident-leader.png",
        rating: 5,
        isVerified: true,
        sortOrder: 2,
        isActive: true,
      },
      {
        accountId,
        name: "Emilia Rodríguez",
        role: "Compradora por Primera Vez",
        content: "Ser compradora de vivienda por primera vez fue intimidante, pero el equipo de Acropolis me guió en cada paso. Fueron pacientes, informativos y me encontraron un maravilloso condominio que se ajustaba a todas mis necesidades.",
        avatar: "/properties/serene-gaze.png",
        rating: 5,
        isVerified: true,
        sortOrder: 3,
        isActive: true,
      },
    ];

    console.log("💾 SEED: Inserting", sampleTestimonials.length, "sample testimonials");
    const insertResult = await db.insert(testimonials).values(sampleTestimonials);
    console.log("✅ SEED: Insert result:", insertResult);
    
    return { success: true };
  } catch (error) {
    console.error("❌ SEED: Error seeding testimonials:", error);
    console.error("📋 SEED: Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      accountId
    });
    return { success: false, error: "Error al crear testimonios de ejemplo" };
  }
}

/**
 * Get testimonials for an account
 */
export async function getTestimonialsAction(accountId: bigint): Promise<{
  success: boolean;
  data?: Array<{
    testimonial_id: string;
    account_id: string;
    name: string;
    role: string;
    content: string;
    avatar: string | null;
    rating: number;
    is_verified: boolean;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  error?: string;
}> {
  try {
    console.log("📖 GET: Loading testimonials for accountId:", accountId);
    
    const testimonialsData = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.accountId, accountId))
      .orderBy(testimonials.sortOrder);

    console.log("📊 GET: Found", testimonialsData.length, "testimonials in database");
    console.log("🔍 GET: Raw testimonials data:", JSON.stringify(testimonialsData, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value as unknown, 2));

    const formattedTestimonials = testimonialsData.map(t => ({
      testimonial_id: t.testimonialId.toString(),
      account_id: t.accountId.toString(),
      name: t.name,
      role: t.role,
      content: t.content,
      avatar: t.avatar,
      rating: t.rating,
      is_verified: t.isVerified ?? true,
      sort_order: t.sortOrder ?? 1,
      is_active: t.isActive ?? true,
      created_at: t.createdAt.toISOString(),
      updated_at: t.updatedAt.toISOString(),
    }));

    console.log("✅ GET: Formatted testimonials:", JSON.stringify(formattedTestimonials, null, 2));
    return { success: true, data: formattedTestimonials };
  } catch (error) {
    console.error("❌ GET: Error getting testimonials:", error);
    console.error("📋 GET: Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      accountId
    });
    return { success: false, error: "Error al obtener los testimonios" };
  }
}

/**
 * Create a new testimonial
 */
export async function createTestimonialAction(
  accountId: bigint,
  testimonialData: {
    name: string;
    role: string;
    content: string;
    avatar?: string;
    rating: number;
    is_verified: boolean;
    sort_order: number;
    is_active: boolean;
  }
): Promise<{ success: boolean; error?: string; data?: { testimonial_id: string } }> {
  try {
    console.log("➕ CREATE: Creating testimonial for accountId:", accountId);
    console.log("📝 CREATE: Testimonial data:", JSON.stringify(testimonialData, null, 2));
    
    const insertValues = {
      accountId,
      name: testimonialData.name,
      role: testimonialData.role,
      content: testimonialData.content,
      avatar: testimonialData.avatar ?? null,
      rating: testimonialData.rating,
      isVerified: testimonialData.is_verified,
      sortOrder: testimonialData.sort_order,
      isActive: testimonialData.is_active,
    };
    
    console.log("💾 CREATE: Insert values:", JSON.stringify(insertValues, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value as unknown, 2));
    
    const [result] = await db
      .insert(testimonials)
      .values(insertValues);

    console.log("✅ CREATE: Insert result:", result);
    
    return { 
      success: true, 
      data: { testimonial_id: result.insertId.toString() }
    };
  } catch (error) {
    console.error("❌ CREATE: Error creating testimonial:", error);
    console.error("📋 CREATE: Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      accountId,
      testimonialData
    });
    return { success: false, error: "Error al crear el testimonio" };
  }
}

/**
 * Update a testimonial
 */
export async function updateTestimonialAction(
  accountId: bigint,
  testimonialId: string,
  testimonialData: {
    name: string;
    role: string;
    content: string;
    avatar?: string;
    rating: number;
    is_verified: boolean;
    sort_order: number;
    is_active: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("✏️ UPDATE: Updating testimonial", testimonialId, "for accountId:", accountId);
    console.log("📝 UPDATE: Testimonial data:", JSON.stringify(testimonialData, null, 2));
    
    const updateValues = {
      name: testimonialData.name,
      role: testimonialData.role,
      content: testimonialData.content,
      avatar: testimonialData.avatar ?? null,
      rating: testimonialData.rating,
      isVerified: testimonialData.is_verified,
      sortOrder: testimonialData.sort_order,
      isActive: testimonialData.is_active,
      updatedAt: new Date(),
    };
    
    console.log("💾 UPDATE: Update values:", JSON.stringify(updateValues, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value as unknown, 2));
    
    const result = await db
      .update(testimonials)
      .set(updateValues)
      .where(
        and(
          eq(testimonials.testimonialId, BigInt(testimonialId)),
          eq(testimonials.accountId, accountId)
        )
      );

    console.log("✅ UPDATE: Update result:", result);
    return { success: true };
  } catch (error) {
    console.error("❌ UPDATE: Error updating testimonial:", error);
    console.error("📋 UPDATE: Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      accountId,
      testimonialId,
      testimonialData
    });
    return { success: false, error: "Error al actualizar el testimonio" };
  }
}

/**
 * Delete a testimonial
 */
export async function deleteTestimonialAction(
  accountId: bigint,
  testimonialId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🗑️ DELETE: Deleting testimonial", testimonialId, "for accountId:", accountId);
    
    const result = await db
      .delete(testimonials)
      .where(
        and(
          eq(testimonials.testimonialId, BigInt(testimonialId)),
          eq(testimonials.accountId, accountId)
        )
      );

    console.log("✅ DELETE: Delete result:", result);
    return { success: true };
  } catch (error) {
    console.error("❌ DELETE: Error deleting testimonial:", error);
    console.error("📋 DELETE: Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      accountId,
      testimonialId
    });
    return { success: false, error: "Error al eliminar el testimonio" };
  }
}