import type { FC } from "react";
import { cn } from "~/lib/utils";
import { Bath, Bed, Square } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  TemplatePropertyData,
  TemplateConfiguration,
} from "~/types/template-data";

interface FeaturesGridProps {
  data: TemplatePropertyData;
  config: TemplateConfiguration;
  modernColors: {
    text: string;
    iconText: string;
  };
  getFieldIcon: (fieldValue: string) => LucideIcon;
  getFieldValue: (fieldValue: string) => string;
  getFieldLabel: (fieldValue: string) => string;
  shouldCompact?: boolean;
}

export const FeaturesGrid: FC<FeaturesGridProps> = ({
  data,
  config,
  modernColors,
  getFieldIcon,
  getFieldValue,
  getFieldLabel,
  shouldCompact = false,
}) => {
  // Use different margin for alquiler vs venta
  const leftMargin = config.listingType === "alquiler" ? "ml-5" : "ml-3";
  const bulletMargin = "ml-3"; // Same margin for both listing types
  return (
    <div>
      {config.showIcons ? (
        (() => {
          // Create all feature items array
          const features = [];

          // Add main specs
          if (data.specs.bathrooms) {
            features.push({
              icon: Bath,
              value: data.specs.bathrooms,
              key: "bathrooms",
            });
          }
          if (data.specs.bedrooms) {
            features.push({
              icon: Bed,
              value: data.specs.bedrooms,
              key: "bedrooms",
            });
          }
          features.push({
            icon: Square,
            value: `${data.specs.squareMeters} m²`,
            key: "squareMeters",
          });

          // Add additional fields (max 3)
          config.additionalFields.slice(0, 3).forEach((fieldValue) => {
            features.push({
              icon: getFieldIcon(fieldValue),
              value: getFieldValue(fieldValue),
              key: fieldValue,
            });
          });

          const totalFeatures = features.length;
          const isOdd = totalFeatures % 2 !== 0;

          return (
            <div className={`${shouldCompact ? "mt-3" : "mt-4"} ${leftMargin}`}>
              <div
                className={`grid grid-cols-2 gap-x-5 ${shouldCompact ? "gap-y-1.5" : "gap-y-1"} max-w-fit`}
              >
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  const isLastAndOdd = isOdd && index === totalFeatures - 1;

                  return (
                    <div
                      key={feature.key}
                      className={cn(
                        "text-center",
                        shouldCompact ? "py-0" : "py-0.5",
                        isLastAndOdd && "col-span-2",
                      )}
                    >
                      <IconComponent
                        className={cn(
                          "mx-auto",
                          shouldCompact ? "mb-0.5 h-4 w-4" : "mb-0.5 h-6 w-6",
                          modernColors.iconText,
                        )}
                      />
                      <div
                        className={cn(modernColors.text)}
                        style={{ fontSize: shouldCompact ? "11px" : "12px" }}
                      >
                        {feature.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()
      ) : (
        /* Non-icon layout - bullet point list */
        <div className={`${shouldCompact ? "mt-3" : "mt-4"} ${bulletMargin}`}>
          <ul
            className={shouldCompact ? "space-y-0.5" : "space-y-1"}
            style={{ fontSize: shouldCompact ? "11px" : "12px" }}
          >
            {data.specs.bathrooms && (
              <li className={cn("flex items-start", modernColors.text)}>
                <span className="mr-2 mt-0.5">•</span>
                <span>{data.specs.bathrooms} baños</span>
              </li>
            )}
            {data.specs.bedrooms && (
              <li className={cn("flex items-start", modernColors.text)}>
                <span className="mr-2 mt-0.5">•</span>
                <span>{data.specs.bedrooms} dormitorios</span>
              </li>
            )}
            <li className={cn("flex items-start", modernColors.text)}>
              <span className="mr-2 mt-0.5">•</span>
              <span>{data.specs.squareMeters} m²</span>
            </li>

            {/* Additional fields as bullet points */}
            {config.additionalFields.slice(0, 3).map((fieldValue) => (
              <li
                key={fieldValue}
                className={cn("flex items-start", modernColors.text)}
              >
                <span className="mr-2 mt-0.5">•</span>
                <span>
                  {getFieldLabel(fieldValue)}: {getFieldValue(fieldValue)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
