import { ClassicTemplate } from "~/components/admin/carteleria/templates/classic/classic-template-realsize";
import { getExtendedDefaultPropertyData } from "~/lib/carteleria/mock-data";
import type { TemplateConfiguration } from "~/types/template-data";

export default function TemplatesPage() {
  const data = getExtendedDefaultPropertyData("piso");

  const config: TemplateConfiguration = {
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

  return <ClassicTemplate data={data} config={config} />;
}
