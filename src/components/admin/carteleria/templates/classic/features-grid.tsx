import type { FC } from "react";
import { cn } from "~/lib/utils";
import { Bath, Bed, Square } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  TemplatePropertyData,
  TemplateConfiguration,
} from "~/types/template-data";
import { PRINT_DIMENSIONS } from "~/lib/carteleria/print-constants";

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
      ? PRINT_DIMENSIONS.SPACING.xl // 20px
      : PRINT_DIMENSIONS.SPACING.md; // 12px
  const bulletMargin = PRINT_DIMENSIONS.SPACING.md; // 12px
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
            <div
              style={{
                marginTop: shouldCompact
                  ? `${PRINT_DIMENSIONS.SPACING.md}px`
                  : `${PRINT_DIMENSIONS.SPACING.lg}px`,
                marginLeft: `${leftMargin}px`,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  columnGap: `${PRINT_DIMENSIONS.SPACING.xl}px`, // 20px fixed
                  rowGap: shouldCompact
                    ? `${PRINT_DIMENSIONS.SPACING.xs + 2}px` // 6px
                    : `${PRINT_DIMENSIONS.SPACING.xs}px`, // 4px
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
                          : `${PRINT_DIMENSIONS.SPACING.xs / 2}px`,
                        paddingBottom: shouldCompact
                          ? 0
                          : `${PRINT_DIMENSIONS.SPACING.xs / 2}px`,
                        gridColumn: isLastAndOdd ? "span 2" : "auto",
                      }}
                    >
                      <IconComponent
                        className={cn("mx-auto", modernColors.iconText)}
                        style={{
                          display: "block",
                          margin: "0 auto",
                          marginBottom: `${PRINT_DIMENSIONS.SPACING.xs / 2}px`, // 2px
                          width: shouldCompact
                            ? `${PRINT_DIMENSIONS.ICONS.small.width}px`
                            : `${PRINT_DIMENSIONS.ICONS.large.width}px`,
                          height: shouldCompact
                            ? `${PRINT_DIMENSIONS.ICONS.small.height}px`
                            : `${PRINT_DIMENSIONS.ICONS.large.height}px`,
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
              ? `${PRINT_DIMENSIONS.SPACING.md}px`
              : `${PRINT_DIMENSIONS.SPACING.lg}px`,
            marginLeft: `${bulletMargin}px`,
          }}
        >
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: shouldCompact
                ? `${PRINT_DIMENSIONS.SPACING.xs / 2}px` // 2px
                : `${PRINT_DIMENSIONS.SPACING.xs}px`, // 4px
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
                    marginRight: `${PRINT_DIMENSIONS.SPACING.sm}px`,
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
                    marginRight: `${PRINT_DIMENSIONS.SPACING.sm}px`,
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
                  marginRight: `${PRINT_DIMENSIONS.SPACING.sm}px`,
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
                    marginRight: `${PRINT_DIMENSIONS.SPACING.sm}px`,
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
