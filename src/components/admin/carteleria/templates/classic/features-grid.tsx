import type { FC } from "react";
import { cn } from "~/lib/utils";
import { Bath, Bed, Square } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  TemplatePropertyData,
  TemplateConfiguration,
} from "~/types/template-data";
import { PRINT_DIMENSIONS } from "~/lib/carteleria/classic-vertical-constants";

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
  // Print-optimized margins using fixed pixel values
  const leftMargin =
    config.listingType === "alquiler"
      ? PRINT_DIMENSIONS.SPACING.iconsLeftMarginRental
      : PRINT_DIMENSIONS.SPACING.iconsLeftMargin;
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

          // Determine spacing based on feature count
          const getTopMargin = () => {
            if (shouldCompact)
              return PRINT_DIMENSIONS.SPACING.featuresTopMarginCompact;
            if (totalFeatures === 1)
              return PRINT_DIMENSIONS.SPACING.featuresTopMarginSingle;
            if (totalFeatures >= 3 && totalFeatures <= 4)
              return PRINT_DIMENSIONS.SPACING.featuresTopMarginMedium;
            return PRINT_DIMENSIONS.SPACING.featuresTopMargin;
          };

          // Determine icon size based on feature count
          const getIconSize = () => {
            if (totalFeatures === 1) return PRINT_DIMENSIONS.ICONS.extraLarge;
            if (shouldCompact) return PRINT_DIMENSIONS.ICONS.small;
            return PRINT_DIMENSIONS.ICONS.large;
          };

          const iconSize = getIconSize();

          return (
            <div
              style={{
                marginTop: `${getTopMargin()}px`,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  columnGap: `${PRINT_DIMENSIONS.SPACING.iconColumns}px`,
                  rowGap: `${PRINT_DIMENSIONS.SPACING.iconRowGap}px`,
                  maxWidth: "fit-content",
                }}
              >
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  const isLastAndOdd = isOdd && index === totalFeatures - 1;

                  return (
                    <div
                      key={feature.key}
                      className={cn("text-center")}
                      style={{
                        textAlign: "center",
                        paddingTop: shouldCompact
                          ? 0
                          : `${PRINT_DIMENSIONS.SPACING.iconRowGap / 2}px`,
                        paddingBottom: shouldCompact
                          ? 0
                          : `${PRINT_DIMENSIONS.SPACING.iconRowGap / 2}px`,
                        gridColumn: isLastAndOdd ? "span 2" : "auto",
                      }}
                    >
                      <IconComponent
                        className={cn("mx-auto", modernColors.iconText)}
                        style={{
                          display: "block",
                          margin: "0 auto",
                          marginBottom: `${PRINT_DIMENSIONS.SPACING.iconToText}px`,
                          width: `${iconSize.width}px`,
                          height: `${iconSize.height}px`,
                        }}
                      />
                      <div
                        className={cn(modernColors.text)}
                        style={{
                          fontSize: shouldCompact
                            ? `${PRINT_DIMENSIONS.TYPOGRAPHY.body.small}px`
                            : `${PRINT_DIMENSIONS.TYPOGRAPHY.body.standard}px`,
                          lineHeight: "1.2",
                        }}
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
        <div
          style={{
            marginTop: shouldCompact
              ? `${PRINT_DIMENSIONS.SPACING.featuresTopMarginCompact}px`
              : `${PRINT_DIMENSIONS.SPACING.featuresTopMargin}px`,
            marginLeft: `${leftMargin}px`,
          }}
        >
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: `${PRINT_DIMENSIONS.SPACING.iconRowGap}px`,
              fontSize: shouldCompact
                ? `${PRINT_DIMENSIONS.TYPOGRAPHY.body.small}px`
                : `${PRINT_DIMENSIONS.TYPOGRAPHY.body.standard}px`,
              lineHeight: "1.3",
            }}
          >
            {data.specs.bathrooms && (
              <li
                className={cn(modernColors.text)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    marginRight: `${PRINT_DIMENSIONS.SPACING.locationBadgePadding}px`,
                    marginTop: "2px",
                  }}
                >
                  •
                </span>
                <span>{data.specs.bathrooms} baños</span>
              </li>
            )}
            {data.specs.bedrooms && (
              <li
                className={cn(modernColors.text)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    marginRight: `${PRINT_DIMENSIONS.SPACING.locationBadgePadding}px`,
                    marginTop: "2px",
                  }}
                >
                  •
                </span>
                <span>{data.specs.bedrooms} dormitorios</span>
              </li>
            )}
            <li
              className={cn(modernColors.text)}
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  marginRight: `${PRINT_DIMENSIONS.SPACING.locationBadgePadding}px`,
                  marginTop: "2px",
                }}
              >
                •
              </span>
              <span>{data.specs.squareMeters} m²</span>
            </li>

            {/* Additional fields as bullet points */}
            {config.additionalFields.slice(0, 3).map((fieldValue) => (
              <li
                key={fieldValue}
                className={cn(modernColors.text)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    marginRight: `${PRINT_DIMENSIONS.SPACING.locationBadgePadding}px`,
                    marginTop: "2px",
                  }}
                >
                  •
                </span>
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
