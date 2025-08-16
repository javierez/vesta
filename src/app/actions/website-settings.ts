"use server";

import { db } from "~/server/db";
import { websiteProperties, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
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
          },
          aboutProps: {
            title: "Sobre Nosotros",
            description: "",
            image: "",
            features: [],
          },
          propertiesProps: {
            title: "Nuestras Propiedades",
            subtitle: "",
            itemsPerPage: 12,
          },
          testimonialProps: {
            title: "Lo que dicen nuestros clientes",
            testimonials: [],
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
            copyright: "",
            links: [],
          },
          headProps: {
            customScripts: "",
            googleAnalytics: "",
            facebookPixel: "",
          },
        },
      };
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
    };

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
        headProps: JSON.stringify(data.headProps ?? {},)
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