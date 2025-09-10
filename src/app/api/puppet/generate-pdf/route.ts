import { type NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import type { TemplateConfiguration } from "~/types/template-data";

export async function POST(request: NextRequest) {
  try {
    const { templateConfig, propertyData } = (await request.json()) as {
      templateConfig: TemplateConfiguration;
      propertyData: unknown;
    };

    // Validate input data
    if (!templateConfig || !propertyData) {
      return NextResponse.json(
        { error: "Missing templateConfig or propertyData" },
        { status: 400 },
      );
    }

    console.log("🚀 Starting PDF generation with Puppeteer...");

    // Launch browser with optimized settings for PDF generation
    // Use headless: true for better compatibility
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920,1080",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    const page = await browser.newPage();

    // Set viewport to match print dimensions
    const orientation = templateConfig.orientation ?? "vertical";
    const dimensions =
      orientation === "vertical"
        ? { width: 794, height: 1123 } // A4 vertical
        : { width: 1123, height: 794 }; // A4 horizontal

    await page.setViewport({
      width: dimensions.width,
      height: dimensions.height,
      deviceScaleFactor: 1,
    });

    // Build the template URL with query parameters
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const templateUrl = new URL("/templates", baseUrl);

    // Pass configuration as URL parameters
    templateUrl.searchParams.set("config", JSON.stringify(templateConfig));
    templateUrl.searchParams.set("data", JSON.stringify(propertyData));

    console.log("📄 Navigating to template URL:", templateUrl.toString());

    // Navigate to the template page
    const response = await page.goto(templateUrl.toString(), {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    if (!response?.ok()) {
      throw new Error(
        `Failed to load template: ${response?.status()} ${response?.statusText()}`,
      );
    }

    // Wait for template to be fully rendered - dynamically determine container selector
    const getTemplateSelector = (templateStyle: string) => {
      switch (templateStyle) {
        case "basic":
          return ".basic-template-container";
        case "classic":
        default:
          return ".template-container";
      }
    };

    const templateSelector = getTemplateSelector(templateConfig.templateStyle ?? "classic");
    console.log(`🎯 Waiting for template container: ${templateSelector} (style: ${templateConfig.templateStyle ?? "classic"})`);

    try {
      await page.waitForSelector(templateSelector, { timeout: 10000 });
      console.log(`✅ Template container found: ${templateSelector}`);
    } catch {
      // Fallback: try waiting for either container type
      console.warn(`⚠️ Primary template container (${templateSelector}) not found, trying fallback...`);
      try {
        await page.waitForSelector(".template-container, .basic-template-container", { timeout: 5000 });
        console.log("✅ Template container found via fallback selector");
      } catch {
        console.error(
          "Template container not found. Page content:",
          await page.content(),
        );
        throw new Error(`Template container not found after 15 seconds. Expected: ${templateSelector} (template style: ${templateConfig.templateStyle ?? "classic"})`);
      }
    }

    // Wait for the template ready signal
    try {
      await page.waitForFunction(
        () => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          return (window as any).templateReady === true;
        },
        {
          timeout: 15000,
        },
      );
    } catch {
      console.warn("Template ready signal timeout, proceeding anyway...");
    }

    console.log("🎨 Template loaded, generating PDF...");

    // Generate PDF with optimized settings
    const pdfBuffer = await page.pdf({
      format: "A4",
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      printBackground: true,
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      preferCSSPageSize: false,
    });

    await browser.close();

    console.log("✅ PDF generated successfully");

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="property-template-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("❌ PDF generation failed:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
