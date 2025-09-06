# PRP: Dynamic Text Editing for Cartel Templates

**Feature**: Implement fully customizable text editing in cartel templates with PDF generation support through template hydration architecture.

## Executive Summary

Transform the cartel template system from hardcoded text ("VENTA PISO") to fully editable custom text ("VENTA DE PISO", "ÁTICO REFORMADO", etc.) while maintaining PDF generation compatibility through a dual-template architecture with hydration process.

## Context & Background

### Current State
- Templates use hardcoded text based on `config.listingType` ("venta"/"alquiler") 
- Property type text is derived from database `propertyType` field
- No customization possible - all cartels look identical
- Users cannot add marketing language or property-specific descriptions

### Target State  
- Users can edit template text inline in the dynamic template preview
- Custom text is stored in database and persists across sessions
- PDF generation works seamlessly with custom text through hydration
- Graceful fallback to default text when custom fields are empty
- Visual indicators show editable vs database-driven content

### Architecture Overview

**Dual-Template System**:
1. **Dynamic Template**: Interactive React component for live editing
2. **Static Template**: Server-rendered component for PDF generation
3. **Hydration Process**: Converts dynamic template data to static template props

## Technical Research Foundation

### Codebase Pattern Analysis

Based on comprehensive codebase analysis, the implementation follows these established patterns:

#### Database Schema Extension Pattern
```typescript
// Pattern from /src/server/db/schema.ts
export const listings = singlestoreTable("listings", {
  // Existing columns maintained
  listingType: varchar("listing_type", { length: 20 }).notNull(),
  // New custom text columns (nullable for backward compatibility)
  customListingText: varchar("custom_listing_text", { length: 50 }),
  customPropertyText: varchar("custom_property_text", { length: 50 }),
});
```

#### Interactive Editing Pattern  
```typescript
// Pattern from /src/components/contactos/detail/contact-comments.tsx
const [editingElement, setEditingElement] = useState<string | null>(null);
const [editContent, setEditContent] = useState("");

const handleSaveText = async (elementType: string, newText: string) => {
  setEditingElement(null); // Immediate UI feedback
  // Background API call with optimistic updates
  startTransition(async () => {
    const result = await saveCustomText(elementType, newText);
    // Handle result...
  });
};
```

#### Server Action Pattern
```typescript
// Pattern from /src/server/actions/comments.ts
export async function updateCustomTextAction(
  listingId: number,
  textType: 'listingText' | 'propertyText',
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const accountId = await getCurrentUserAccountId();
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Validate content
    if (!content?.trim() || content.length > 50) {
      return { success: false, error: "Texto inválido" };
    }

    // Update database
    await db
      .update(listings)
      .set(textType === 'listingText' ? 
        { customListingText: content.trim() } : 
        { customPropertyText: content.trim() }
      )
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId))
        )
      );

    revalidatePath(`/propiedades/${listingId}/cartel-editor`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error interno del servidor" };
  }
}
```

### External Research Findings

#### React Inline Editing Best Practices (2024)
- **Always-Input Approach**: Use input elements styled to look like static text
- **Accessibility**: Proper ARIA labels and keyboard navigation (Enter/Escape/Tab)
- **User Experience**: Hover states, focus management, optimistic updates
- **Source**: https://www.dhiwise.com/post/a-beginners-guide-to-implementing-react-inline-edi

#### Drizzle ORM Schema Migrations (2024)  
- **Migration Generation**: `npx drizzle-kit generate` creates ALTER TABLE statements
- **Push Command**: `npx drizzle-kit push` for rapid development iteration
- **SingleStore Support**: Built-in handling for SingleStore DDL limitations
- **Source**: https://orm.drizzle.team/docs/migrations

#### Next.js + Puppeteer PDF Generation (2024)
- **Hydration Strategy**: Wait for `window.templateReady = true` signal
- **Network Idle**: Use `waitUntil: "networkidle0"` for complete content loading
- **Serverless Compatibility**: Use `@sparticuz/chromium-min` for Vercel deployment
- **Source**: https://medium.com/front-end-weekly/dynamic-html-to-pdf-generation-in-next-js-a-step-by-step-guide-with-puppeteer-dbcf276375d7

## Implementation Blueprint

### Phase 1: Database Schema Extension

#### 1.1 Add Custom Text Columns
```sql
-- Generated migration via drizzle-kit
ALTER TABLE `listings` ADD COLUMN `custom_listing_text` VARCHAR(50);
ALTER TABLE `listings` ADD COLUMN `custom_property_text` VARCHAR(50);
```

#### 1.2 Extend Database Query
```typescript
// Update /src/server/queries/listing.ts
export async function getListingCartelData(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  try {
    const [cartelData] = await db
      .select({
        listingType: listings.listingType,
        customListingText: listings.customListingText,
        customPropertyText: listings.customPropertyText,
      })
      .from(listings)
      .where(/* existing conditions */);
    
    return cartelData;
  } catch (error) {
    console.error("Error fetching listing cartel data:", error);
    throw error;
  }
}
```

### Phase 2: TypeScript Interface Extensions

#### 2.1 Extend Template Configuration
```typescript
// Update /src/types/template-data.ts
export interface TemplateConfiguration {
  // Existing fields...
  listingType: "venta" | "alquiler";
  
  // New custom text fields
  customListingText?: string;
  customPropertyText?: string;
}

export interface ExtendedTemplatePropertyData extends TemplatePropertyData {
  // Existing extensions...
  customListingText?: string;
  customPropertyText?: string;
}
```

### Phase 3: Interactive Text Editing Components

#### 3.1 Inline Text Editor Component
```typescript
// Create /src/components/propiedades/detail/cartel/inline-text-editor.tsx
interface InlineTextEditorProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  maxLength: number;
  placeholder: string;
  className?: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  value,
  onSave,
  maxLength,
  placeholder,
  className,
  isEditing,
  onStartEdit,
  onCancelEdit,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (localValue.trim() === value.trim()) {
      onCancelEdit();
      return;
    }

    setIsSaving(true);
    try {
      await onSave(localValue.trim());
    } catch (error) {
      setLocalValue(value); // Reset on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      onCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          className={cn(
            "bg-white/90 border-2 border-blue-500 rounded px-2 py-1",
            "focus:outline-none focus:ring-2 focus:ring-blue-300",
            className
          )}
          placeholder={placeholder}
          disabled={isSaving}
        />
        {isSaving && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <span
      onClick={onStartEdit}
      className={cn(
        "cursor-pointer hover:bg-white/20 rounded px-1 py-0.5 transition-all",
        "border-2 border-transparent hover:border-white/30",
        className
      )}
      title="Haz clic para editar"
    >
      {value || placeholder}
    </span>
  );
};
```

#### 3.2 Server Action for Text Updates
```typescript
// Create /src/server/actions/custom-text.ts
export async function updateCustomTextAction(
  listingId: number,
  textType: 'listingText' | 'propertyText',
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const accountId = await getCurrentUserAccountId();
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return { success: false, error: "Usuario no autenticado" };
    }

    // Validate content
    const trimmedContent = content.trim();
    if (trimmedContent.length > 50) {
      return { success: false, error: "Texto demasiado largo (máximo 50 caracteres)" };
    }

    // Update database
    const updateData = textType === 'listingText' 
      ? { customListingText: trimmedContent || null }
      : { customPropertyText: trimmedContent || null };

    await db
      .update(listings)
      .set(updateData)
      .where(
        and(
          eq(listings.listingId, BigInt(listingId)),
          eq(listings.accountId, BigInt(accountId))
        )
      );

    revalidatePath(`/propiedades/${listingId}/cartel-editor`);
    return { success: true };
  } catch (error) {
    console.error("Error updating custom text:", error);
    return { success: false, error: "Error interno del servidor" };
  }
}
```

### Phase 4: Dynamic Template Enhancement

#### 4.1 Update Dynamic Template with Editable Text
```typescript
// Update /src/components/propiedades/detail/cartel/templates/classic-template.tsx
export const ClassicTemplate: FC<ConfigurableTemplateProps> = ({
  data,
  config,
  className,
  onTextEdit, // New prop for text editing
  isInteractive = false,
}) => {
  const [editingElement, setEditingElement] = useState<string | null>(null);

  const handleTextSave = async (elementType: string, newText: string) => {
    if (onTextEdit) {
      await onTextEdit(elementType, newText);
    }
    setEditingElement(null);
  };

  // Get effective text with fallback
  const getEffectiveText = (customText?: string, defaultText?: string) => {
    return customText || defaultText || '';
  };

  return (
    <div className={cn("template-container no-break", className)}>
      {/* ... existing template structure ... */}
      
      {/* Editable Title Section */}
      <div style={{ /* title positioning */ }}>
        {isInteractive ? (
          <InlineTextEditor
            value={getEffectiveText(
              config.customListingText,
              config.listingType.toUpperCase()
            )}
            onSave={(text) => handleTextSave('listingText', text)}
            maxLength={50}
            placeholder={config.listingType.toUpperCase()}
            isEditing={editingElement === 'listingText'}
            onStartEdit={() => setEditingElement('listingText')}
            onCancelEdit={() => setEditingElement(null)}
            className={cn(
              "font-bold uppercase text-white",
              getFontClass(config.titleFont)
            )}
          />
        ) : (
          <h2 className={cn("font-bold uppercase", modernColors.text)}>
            {getEffectiveText(
              config.customListingText,
              config.listingType.toUpperCase()
            )}
          </h2>
        )}
        
        {isInteractive ? (
          <InlineTextEditor
            value={getEffectiveText(
              config.customPropertyText,
              safeData.propertyType.toUpperCase()
            )}
            onSave={(text) => handleTextSave('propertyText', text)}
            maxLength={50}
            placeholder={safeData.propertyType.toUpperCase()}
            isEditing={editingElement === 'propertyText'}
            onStartEdit={() => setEditingElement('propertyText')}
            onCancelEdit={() => setEditingElement(null)}
            className={cn(
              "font-bold uppercase text-white",
              getFontClass(config.titleFont)
            )}
          />
        ) : (
          <h3 className={cn("font-bold uppercase", modernColors.text)}>
            {getEffectiveText(
              config.customPropertyText,
              safeData.propertyType.toUpperCase()
            )}
          </h3>
        )}
      </div>
      
      {/* ... rest of template ... */}
    </div>
  );
};
```

### Phase 5: Static Template for PDF Generation

#### 5.1 Update Static Template Component  
```typescript
// Update /src/components/admin/carteleria/templates/classic/classic-vertical-template.tsx
export const ClassicTemplate: FC<ConfigurableTemplateProps> = ({
  data,
  config,
  className,
  // Remove interactive props - static template never interactive
}) => {
  // Get effective text with fallback (same logic as dynamic)
  const getEffectiveText = (customText?: string, defaultText?: string) => {
    return customText || defaultText || '';
  };

  return (
    <div className={cn("template-container no-break", className)}>
      {/* Static text rendering - no interactivity */}
      <div style={{ /* title positioning */ }}>
        <h2 className={cn("font-bold uppercase", modernColors.text)}>
          {getEffectiveText(
            config.customListingText,
            config.listingType.toUpperCase()
          )}
        </h2>
        <h3 className={cn("font-bold uppercase", modernColors.text)}>
          {getEffectiveText(
            config.customPropertyText,
            data.propertyType.toUpperCase()
          )}
        </h3>
      </div>
      
      {/* ... rest of static template ... */}
    </div>
  );
};
```

### Phase 6: Editor Integration

#### 6.1 Update CartelEditorClient  
```typescript
// Update /src/components/propiedades/detail/cartel/cartel-editor-client.tsx
export function CartelEditorClient({
  listingId,
  images,
  databaseListingType,
  customListingText, // New prop
  customPropertyText, // New prop
}: CartelEditorClientProps) {
  const [config, setConfig] = useState<TemplateConfiguration>(() => ({
    // ... existing config
    customListingText,
    customPropertyText,
  }));

  const handleTextEdit = async (elementType: string, newText: string) => {
    try {
      const result = await updateCustomTextAction(
        parseInt(listingId),
        elementType as 'listingText' | 'propertyText',
        newText
      );

      if (result.success) {
        // Update local config immediately
        setConfig(prev => ({
          ...prev,
          [elementType === 'listingText' ? 'customListingText' : 'customPropertyText']: newText
        }));
        
        toast.success("Texto actualizado correctamente");
      } else {
        toast.error(result.error || "Error al actualizar el texto");
      }
    } catch (error) {
      toast.error("Error al actualizar el texto");
      throw error; // Re-throw for InlineTextEditor error handling
    }
  };

  return (
    <div>
      {/* Template Preview with Text Editing */}
      <ClassicTemplate
        data={data}
        config={config}
        onTextEdit={handleTextEdit}
        isInteractive={true}
        className="preview-template"
      />
      
      {/* ... existing controls ... */}
    </div>
  );
}
```

#### 6.2 Update CartelEditorPhase1 Server Component
```typescript
// Update /src/components/propiedades/detail/cartel/cartel-editor-phase1.tsx
export async function CartelEditorPhase1({ listingId, images }: CartelEditorPhase1Props) {
  let databaseListingType: "Sale" | "Rent" | undefined;
  let customListingText: string | undefined;
  let customPropertyText: string | undefined;
  
  try {
    const cartelData = await getListingCartelData(parseInt(listingId));
    
    if (cartelData.listingType === "Sale" || cartelData.listingType === "Rent") {
      databaseListingType = cartelData.listingType;
    }
    
    customListingText = cartelData.customListingText || undefined;
    customPropertyText = cartelData.customPropertyText || undefined;
    
  } catch (error) {
    console.error("Failed to load cartel data from database:", error);
  }

  return (
    <CartelEditorClient
      listingId={listingId}
      images={images}
      databaseListingType={databaseListingType}
      customListingText={customListingText}
      customPropertyText={customPropertyText}
    />
  );
}
```

### Phase 7: PDF Generation with Hydration

#### 7.1 Template Hydration Function
```typescript
// Create /src/lib/carteleria/template-hydration.ts
export interface HydratedTemplateData {
  config: TemplateConfiguration;
  data: ExtendedTemplatePropertyData;
}

export function hydrateTemplateForPDF(
  dynamicConfig: TemplateConfiguration,
  propertyData: ExtendedTemplatePropertyData
): HydratedTemplateData {
  return {
    config: {
      ...dynamicConfig,
      // Ensure custom text is passed through
      customListingText: dynamicConfig.customListingText,
      customPropertyText: dynamicConfig.customPropertyText,
    },
    data: {
      ...propertyData,
      // Include any additional custom fields
      customListingText: dynamicConfig.customListingText,
      customPropertyText: dynamicConfig.customPropertyText,
    }
  };
}
```

#### 7.2 Update PDF Generation Flow
```typescript
// Update PDF generation in CartelEditorClient
const generatePDF = async () => {
  try {
    setIsGeneratingPDF(true);
    
    // Hydrate template data
    const hydratedData = hydrateTemplateForPDF(config, templateData);
    
    const response = await fetch('/api/puppet/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateConfig: hydratedData.config,
        propertyData: hydratedData.data,
      }),
    });

    if (!response.ok) throw new Error('PDF generation failed');
    
    // Handle PDF download
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cartel-${listingId}-${Date.now()}.pdf`;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF generation error:', error);
    toast.error('Error al generar PDF');
  } finally {
    setIsGeneratingPDF(false);
  }
};
```

#### 7.3 Update Templates Page for PDF
```typescript
// Update /src/app/templates/page.tsx
export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  let config: TemplateConfiguration;
  let data: ExtendedTemplatePropertyData;

  const params = await searchParams;

  try {
    if (params.config && params.data) {
      config = JSON.parse(params.config) as TemplateConfiguration;
      data = JSON.parse(params.data) as ExtendedTemplatePropertyData;
      
      // Log custom text for debugging
      console.log('PDF Template rendering with custom text:', {
        customListingText: config.customListingText,
        customPropertyText: config.customPropertyText
      });
    } else {
      // Fallback configuration
      data = getExtendedDefaultPropertyData("piso");
      config = getDefaultTemplateConfiguration();
    }
  } catch (error) {
    console.error("Error parsing template parameters:", error);
    // Use fallback
    data = getExtendedDefaultPropertyData("piso");
    config = getDefaultTemplateConfiguration();
  }

  return (
    <div style={{ margin: 0, padding: 0, backgroundColor: "white" }}>
      {/* Static template for PDF - NO interactivity */}
      <ClassicTemplate data={data} config={config} />
      
      <script dangerouslySetInnerHTML={{
        __html: `
          // Enhanced ready signal for custom text
          window.templateReady = true;
          document.body.classList.add('template-ready');
          console.log('✅ Template page rendered with custom text');
          
          // Wait for all fonts and images
          Promise.all([
            document.fonts.ready,
            ...Array.from(document.querySelectorAll('img')).map(img => 
              img.complete ? Promise.resolve() : new Promise(resolve => {
                img.addEventListener('load', resolve);
                img.addEventListener('error', resolve);
              })
            )
          ]).then(() => {
            window.templateReady = true;
            console.log('✅ All assets loaded, template fully ready for PDF');
          });
          
          // Fallback timeout
          setTimeout(() => {
            window.templateReady = true;
          }, 5000);
        `
      }} />
    </div>
  );
}
```

## Implementation Tasks (Ordered)

### Phase 1: Database Foundation
1. **Generate Database Migration**
   ```bash
   # Add custom text columns to listings table
   npx drizzle-kit generate
   npx drizzle-kit push
   ```

2. **Update Schema Types**
   - Update `/src/server/db/schema.ts` with new columns
   - Extend TypeScript interfaces in `/src/types/template-data.ts`

3. **Extend Database Query**
   - Update `getListingCartelData()` to fetch custom text fields
   - Add proper error handling and fallbacks

### Phase 2: Interactive Components
1. **Create InlineTextEditor Component**
   - Implement with accessibility features (ARIA labels, keyboard nav)
   - Add optimistic updates and loading states
   - Include proper validation and character limits

2. **Create Server Action**
   - Implement `updateCustomTextAction` with authentication
   - Add proper validation and error handling
   - Include revalidation for immediate UI updates

### Phase 3: Template Updates
1. **Update Dynamic Template**
   - Add text editing capabilities to ClassicTemplate
   - Implement click-to-edit functionality
   - Add visual indicators for editable elements

2. **Update Static Template**
   - Ensure custom text renders in static template
   - Maintain visual consistency with dynamic template
   - Remove all interactive elements

### Phase 4: Editor Integration  
1. **Update CartelEditorClient**
   - Add text editing props and handlers
   - Integrate with existing configuration system
   - Add proper error handling and user feedback

2. **Update CartelEditorPhase1**
   - Fetch custom text from database
   - Pass to client component with fallbacks
   - Handle graceful degradation

### Phase 5: PDF Generation
1. **Create Hydration Utilities**
   - Implement template data hydration
   - Ensure all custom data flows to static template
   - Add debugging and validation

2. **Update PDF Generation Flow**
   - Integrate hydration process
   - Update templates page to handle custom text
   - Test with various custom text scenarios

### Phase 6: Testing & Validation
1. **Unit Tests**
   - Test InlineTextEditor component
   - Test server actions and validation
   - Test hydration utilities

2. **Integration Tests**
   - Test full editing workflow
   - Test PDF generation with custom text
   - Test fallback scenarios

## Validation Gates

```bash
# Type checking
pnpm typecheck

# Linting with auto-fix  
pnpm lint:fix

# Format code
pnpm format:write

# Build verification
pnpm build

# Database migration check
npx drizzle-kit generate --custom

# Manual testing checklist
echo "✓ Can edit listing text inline in template preview"
echo "✓ Text saves to database and persists on refresh" 
echo "✓ PDF generation includes custom text correctly"
echo "✓ Graceful fallback when custom text is empty"
echo "✓ Character limits enforced (50 chars max)"
echo "✓ Keyboard navigation works (Enter/Escape/Tab)"
echo "✓ Error states display properly for save failures"
echo "✓ Loading states appear during text save operations"
echo "✓ Visual consistency between dynamic and static templates"
echo "✓ No regression in existing template functionality"

# Performance testing
echo "✓ PDF generation time remains under 3 seconds with custom text"
echo "✓ Template rendering performance not degraded"
echo "✓ Database queries optimized (no N+1 queries)"

# Accessibility testing  
echo "✓ Screen reader compatibility maintained"
echo "✓ ARIA labels present for all editable elements"
echo "✓ Keyboard-only navigation possible"
echo "✓ Focus management works correctly"
```

## External References & Documentation

### React Inline Editing Best Practices
- **Primary Reference**: https://www.dhiwise.com/post/a-beginners-guide-to-implementing-react-inline-edi
- **Accessibility Guidelines**: https://atlassian.design/components/inline-edit/
- **Advanced Patterns**: https://blog.logrocket.com/build-inline-editable-ui-react/

### Drizzle ORM Schema Migrations  
- **Migration Documentation**: https://orm.drizzle.team/docs/migrations
- **SingleStore Integration**: https://orm.drizzle.team/docs/get-started/singlestore-existing
- **Best Practices**: https://www.singlestore.com/blog/singlestore-drizzle-integration/

### Next.js + Puppeteer PDF Generation
- **Dynamic HTML to PDF**: https://medium.com/front-end-weekly/dynamic-html-to-pdf-generation-in-next-js-a-step-by-step-guide-with-puppeteer-dbcf276375d7
- **Serverless Compatibility**: https://dev.to/harshvats2000/creating-a-nextjs-api-to-convert-html-to-pdf-with-puppeteer-vercel-compatible-16fc
- **Template Hydration**: https://dev.to/jordykoppen/turning-react-apps-into-pdfs-with-nextjs-nodejs-and-puppeteer-mfi

### Codebase Reference Files
- **Interactive Editing Pattern**: `/src/components/contactos/detail/contact-comments.tsx`
- **Server Actions Pattern**: `/src/server/actions/comments.ts`
- **Template Rendering**: `/src/components/propiedades/detail/cartel/templates/classic-template.tsx`
- **PDF Generation**: `/src/app/api/puppet/generate-pdf/route.ts`
- **Database Schema**: `/src/server/db/schema.ts`

## Risk Assessment & Mitigation

### Low Risk Areas
- ✅ Database schema extension follows existing patterns
- ✅ TypeScript interfaces provide compile-time safety
- ✅ Server actions follow established security patterns
- ✅ PDF generation flow already exists and tested

### Medium Risk Areas
- **Text Validation**: Custom text could break layout if too long
  - *Mitigation*: Strict character limits (50 chars) and validation
- **PDF Generation**: Custom text might not render correctly in static template
  - *Mitigation*: Comprehensive hydration testing and visual diff checks
- **Performance**: Additional database columns could impact queries
  - *Mitigation*: Nullable columns with indexes, query optimization

### Mitigation Strategies
1. **Comprehensive Fallback Logic**: Always provide default text when custom text fails
2. **Visual Consistency Validation**: Automated screenshot comparison between dynamic/static
3. **Character Limits**: Strict enforcement prevents layout breaking
4. **Optimistic Updates**: Immediate UI feedback prevents user confusion
5. **Error Boundaries**: Graceful degradation when editing features fail

## Success Criteria

### Functional Requirements
- [ ] Users can click on template text to edit inline
- [ ] Custom text persists in database across sessions
- [ ] PDF generation works with custom text
- [ ] Graceful fallback to default text when custom fields empty
- [ ] Character limits enforced to prevent layout issues
- [ ] Visual consistency between dynamic and static templates

### Performance Requirements
- [ ] Text editing response time < 200ms
- [ ] PDF generation time < 3 seconds with custom text
- [ ] No performance regression in template rendering
- [ ] Database queries remain optimized

### User Experience Requirements  
- [ ] Clear visual indicators for editable elements
- [ ] Intuitive keyboard navigation (Enter/Escape/Tab)
- [ ] Proper loading states during save operations
- [ ] Meaningful error messages for validation failures
- [ ] Smooth transitions between edit and view states

## Confidence Score: 9/10

**High Confidence Factors**:
- ✅ Comprehensive codebase pattern analysis with existing examples
- ✅ External research validates best practices and approaches
- ✅ Database migration strategy proven with Drizzle ORM
- ✅ PDF generation flow already exists and working
- ✅ TypeScript provides compile-time safety throughout
- ✅ Clear separation of concerns with dual-template architecture
- ✅ Extensive validation gates and testing strategy

**Potential Challenges**:
- Character limit enforcement across different languages/fonts
- Edge cases in PDF generation with special characters
- Performance optimization for large-scale usage

**Recommendation**: Proceed with implementation. The comprehensive research, established patterns, and clear mitigation strategies provide high confidence for successful one-pass implementation.