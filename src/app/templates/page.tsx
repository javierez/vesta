import { ClassicTemplate } from "~/components/admin/carteleria/templates/classic/classic-vertical-template";
import { getExtendedDefaultPropertyData } from "~/lib/carteleria/mock-data";
import type { TemplateConfiguration, ExtendedTemplatePropertyData } from "~/types/template-data";

interface TemplatesPageProps {
  searchParams: Promise<{
    config?: string;
    data?: string;
  }>;
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  // Try to parse config and data from query parameters
  let config: TemplateConfiguration;
  let data: ExtendedTemplatePropertyData;

  const params = await searchParams;

  try {
    if (params.config && params.data) {
      config = JSON.parse(params.config) as TemplateConfiguration;
      data = JSON.parse(params.data) as ExtendedTemplatePropertyData;
    } else {
      // Fallback to default config and data
      data = getExtendedDefaultPropertyData("piso");
      config = {
        templateStyle: "classic",
        orientation: "vertical",
        propertyType: "piso",
        imageCount: 4,
        showIcons: true,
        showQR: true,
        showWatermark: true,
        showPhone: true,
        showEmail: true,
        showWebsite: true,
        showReference: true,
        showShortDescription: false,
        listingType: "venta",
        additionalFields: ["energyConsumptionScale", "yearBuilt"],
        titleFont: "default",
        priceFont: "default",
        overlayColor: "default",
      };
    }
  } catch (error) {
    console.error('Error parsing template parameters:', error);
    // Fallback to default on parse error
    data = getExtendedDefaultPropertyData("piso");
    config = {
      templateStyle: "classic",
      orientation: "vertical",
      propertyType: "piso",
      imageCount: 4,
      showIcons: true,
      showQR: true,
      showWatermark: true,
      showPhone: true,
      showEmail: true,
      showWebsite: true,
      showReference: true,
      showShortDescription: false,
      listingType: "venta",
      additionalFields: ["energyConsumptionScale", "yearBuilt"],
      titleFont: "default",
      priceFont: "default",
      overlayColor: "default",
    };
  }

  return (
    <div style={{ margin: 0, padding: 0, backgroundColor: 'white' }}>
      <ClassicTemplate data={data} config={config} />
      <script dangerouslySetInnerHTML={{
        __html: `
          // Signal that template is ready for PDF generation
          window.templateReady = true;
          document.body.classList.add('template-ready');
          console.log('✅ Template page rendered and ready for PDF');
          
          // Wait for all images to load
          const images = document.querySelectorAll('img');
          let loadedImages = 0;
          const totalImages = images.length;
          
          function checkAllImagesLoaded() {
            loadedImages++;
            if (loadedImages === totalImages || totalImages === 0) {
              window.templateReady = true;
              console.log('✅ All images loaded, template fully ready');
            }
          }
          
          if (totalImages === 0) {
            window.templateReady = true;
          } else {
            images.forEach(img => {
              if (img.complete) {
                checkAllImagesLoaded();
              } else {
                img.addEventListener('load', checkAllImagesLoaded);
                img.addEventListener('error', checkAllImagesLoaded);
              }
            });
          }
          
          // Fallback - mark as ready after 5 seconds
          setTimeout(() => {
            window.templateReady = true;
            console.log('✅ Template ready (timeout fallback)');
          }, 5000);
        `
      }} />
    </div>
  );
}
