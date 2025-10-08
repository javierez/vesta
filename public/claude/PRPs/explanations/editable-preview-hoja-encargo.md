# Editable Preview for Hoja de Encargo

## Summary

This document explains how to implement a comprehensive **editable preview modal** for the Hoja de Encargo (Nota de Encargo) feature. The preview allows users to review and modify **every single field** in the document before generating the final PDF.

### What This Implies

#### Benefits
- ✅ **Full control**: Users can edit any field (client data, property info, commission, etc.) before PDF generation
- ✅ **Error correction**: Fix typos, missing data, or incorrect information without regenerating from database
- ✅ **Custom observations**: Add specific notes or special conditions per document
- ✅ **Data verification**: Review all auto-filled data before creating legal documents
- ✅ **Flexibility**: Adjust prices, dates, or terms on a case-by-case basis

#### Important Considerations
- ⚠️ **PDF-only changes**: Edits affect only the generated PDF document, NOT the database
- ⚠️ **No audit trail**: Original DB data remains unchanged (edits are not logged)
- ⚠️ **Manual validation**: User is responsible for ensuring edited data is correct
- ⚠️ **Legal implications**: The generated PDF may differ from source records

---

## Current Process Flow

```
1. User clicks "Generar ahora" button
   ↓
2. Terms Modal opens (commission, duration, exclusivity, etc.)
   ↓
3. User fills terms → clicks "Continuar"
   ↓
4. Data fetched from DB (getNotaEncargoData)
   ↓
5. Data transformed to PDF format (transformToNotaEncargoPDF)
   ↓
6. PDF generated immediately via Puppeteer
   ↓
7. PDF uploaded to S3 + database
   ↓
8. User downloads PDF
```

---

## New Process Flow (With Editable Preview)

```
1. User clicks "Generar ahora" button
   ↓
2. Terms Modal opens (commission, duration, exclusivity, etc.)
   ↓
3. User fills terms → clicks "Continuar"
   ↓
4. Data fetched from DB (getNotaEncargoData)
   ↓
5. Data transformed to PDF format (transformToNotaEncargoPDF)
   ↓
6. ✨ NEW: Editable Preview Modal opens with ALL fields
   ↓
7. ✨ NEW: User reviews/edits ANY field
   ↓
8. ✨ NEW: User clicks "Generar PDF Final"
   ↓
9. PDF generated via Puppeteer (with edited data)
   ↓
10. PDF uploaded to S3 + database
   ↓
11. User downloads PDF
```

---

## Implementation Details

### 1. Where It Fits in the Process

**Step 6-8**: Between data transformation and PDF generation

**File**: `src/components/propiedades/detail/initial_docs/hoja-encargo-button.tsx`

**Before** (current flow):
```typescript
const handleCreateHojaEncargo = async (terms: TermsData) => {
  // Fetch data
  const rawData = await getNotaEncargoData(listingId);

  // Transform data
  const pdfData = transformToNotaEncargoPDF(rawData, terms);

  // ❌ Generate PDF immediately
  const response = await fetch("/api/nota-encargo/generate-pdf", {
    method: "POST",
    body: JSON.stringify({ data: pdfData }),
  });

  // Upload and download...
};
```

**After** (with editable preview):
```typescript
const handleCreateHojaEncargo = async (terms: TermsData) => {
  // Fetch data
  const rawData = await getNotaEncargoData(listingId);

  // Transform data
  const pdfData = transformToNotaEncargoPDF(rawData, terms);

  // ✅ Show preview modal instead of generating immediately
  setPreviewData(pdfData);
  setShowPreview(true);
};

const handleConfirmGeneration = async (editedData: NotaEncargoPDFData) => {
  // Generate PDF with EDITED data
  const response = await fetch("/api/nota-encargo/generate-pdf", {
    method: "POST",
    body: JSON.stringify({ data: editedData }), // ← User's edited data
  });

  // Upload and download...
};
```

---

### 2. Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│ HojaEncargoButton (Main Component)                      │
│  - Manages overall flow                                 │
│  - Fetches data from DB                                 │
│  - Transforms data                                      │
│  - Opens preview modal                                  │
│  - Handles PDF generation after confirmation            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─► TermsModal
                 │    (Collects commission, duration, etc.)
                 │
                 └─► ✨ NotaEncargoPreviewModal (NEW)
                      (Editable preview of all fields)
```

---

### 3. New Component: NotaEncargoPreviewModal

**File**: `src/components/propiedades/detail/initial_docs/nota-encargo-preview-modal.tsx`

#### Component Structure

```typescript
interface NotaEncargoPreviewModalProps {
  isOpen: boolean;                          // Modal visibility state
  onClose: () => void;                      // Close handler
  initialData: NotaEncargoPDFData;          // Pre-filled data from DB
  onConfirm: (editedData: NotaEncargoPDFData) => Promise<void>; // Generate PDF
}

export function NotaEncargoPreviewModal({
  isOpen,
  onClose,
  initialData,
  onConfirm
}: NotaEncargoPreviewModalProps) {
  // State to hold edited data
  const [editedData, setEditedData] = useState<NotaEncargoPDFData>(initialData);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate PDF with edited data
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onConfirm(editedData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh]">
        {/* All editable sections here */}
      </DialogContent>
    </Dialog>
  );
}
```

#### Editable Sections

The modal includes **8 main sections**, each color-coded for clarity:

1. **📄 Document Number** (slate)
   - Nota de Encargo number

2. **👤 Client Data** (blue)
   - Full name, NIF, address, city, postal code, phone

3. **🏢 Agency Data** (amber)
   - Agent/agency name, collegiate number, NIF, email, website
   - Office addresses (can have multiple)

4. **🏠 Property Description** (green)
   - Property description
   - Signage authorization
   - Energy certificate
   - Key delivery
   - Visit authorization

5. **💼 Operation** (purple)
   - Operation type (Venta/Alquiler)
   - Price

6. **💰 Commission** (orange)
   - Commission percentage
   - Minimum amount

7. **📅 Duration** (indigo)
   - Contract duration in months

8. **✍️ Signatures** (rose)
   - Signing location
   - Date

9. **⚖️ Jurisdiction** (cyan)
   - City for legal jurisdiction

10. **📋 Other Conditions** (slate)
    - Has other agency (yes/no)
    - GDPR consent (yes/no)

11. **📝 Observations** (yellow)
    - Custom notes/observations

---

### 4. State Management Pattern

Each section uses helper functions to update nested state immutably:

```typescript
// Helper to update client fields
const updateClient = (field: keyof NotaEncargoPDFData['client'], value: string) => {
  setEditedData(prev => ({
    ...prev,
    client: { ...prev.client, [field]: value }
  }));
};

// Helper to update agency fields
const updateAgency = (field: keyof NotaEncargoPDFData['agency'], value: string) => {
  setEditedData(prev => ({
    ...prev,
    agency: { ...prev.agency, [field]: value }
  }));
};

// Helper to update agency office (array item)
const updateAgencyOffice = (index: number, field: string, value: string) => {
  setEditedData(prev => ({
    ...prev,
    agency: {
      ...prev.agency,
      offices: prev.agency.offices.map((office, i) =>
        i === index ? { ...office, [field]: value } : office
      )
    }
  }));
};

// Usage in JSX
<Input
  value={editedData.client.fullName}
  onChange={(e) => updateClient('fullName', e.target.value)}
/>
```

---

### 5. Example: Client Data Section

```typescript
<div className="bg-blue-50 p-4 rounded-lg">
  <h3 className="font-semibold mb-3 text-blue-900">👤 Datos del Cliente (Propietario)</h3>
  <div className="grid grid-cols-2 gap-4">

    {/* Full Name */}
    <div>
      <Label>Nombre Completo *</Label>
      <Input
        value={editedData.client.fullName}
        onChange={(e) => updateClient('fullName', e.target.value)}
        placeholder="Apellidos y Nombre"
      />
    </div>

    {/* NIF/DNI */}
    <div>
      <Label>NIF/DNI *</Label>
      <Input
        value={editedData.client.nif}
        onChange={(e) => updateClient('nif', e.target.value)}
        placeholder="12345678A"
      />
    </div>

    {/* Address */}
    <div className="col-span-2">
      <Label>Domicilio</Label>
      <Input
        value={editedData.client.address}
        onChange={(e) => updateClient('address', e.target.value)}
        placeholder="Calle, número, piso, puerta"
      />
    </div>

    {/* City */}
    <div>
      <Label>Ciudad</Label>
      <Input
        value={editedData.client.city}
        onChange={(e) => updateClient('city', e.target.value)}
        placeholder="León"
      />
    </div>

    {/* Postal Code */}
    <div>
      <Label>Código Postal</Label>
      <Input
        value={editedData.client.postalCode}
        onChange={(e) => updateClient('postalCode', e.target.value)}
        placeholder="24001"
      />
    </div>

    {/* Phone */}
    <div>
      <Label>Teléfono *</Label>
      <Input
        value={editedData.client.phone}
        onChange={(e) => updateClient('phone', e.target.value)}
        placeholder="600 000 000"
      />
    </div>

  </div>
</div>
```

---

### 6. Example: Agency Offices (Array Handling)

```typescript
<div className="mt-4 space-y-3">
  <Label className="text-sm font-semibold">Oficinas</Label>
  {editedData.agency.offices.map((office, index) => (
    <div key={index} className="bg-white p-3 rounded border border-amber-200">
      <p className="text-xs text-muted-foreground mb-2">Oficina {index + 1}</p>
      <div className="grid grid-cols-2 gap-3">

        {/* Office Address */}
        <div className="col-span-2">
          <Label className="text-xs">Dirección</Label>
          <Input
            value={office.address}
            onChange={(e) => updateAgencyOffice(index, 'address', e.target.value)}
            placeholder="Calle, número"
          />
        </div>

        {/* City */}
        <div>
          <Label className="text-xs">Ciudad</Label>
          <Input
            value={office.city}
            onChange={(e) => updateAgencyOffice(index, 'city', e.target.value)}
          />
        </div>

        {/* Postal Code */}
        <div>
          <Label className="text-xs">C.P.</Label>
          <Input
            value={office.postalCode}
            onChange={(e) => updateAgencyOffice(index, 'postalCode', e.target.value)}
          />
        </div>

        {/* Phone */}
        <div className="col-span-2">
          <Label className="text-xs">Teléfono</Label>
          <Input
            value={office.phone}
            onChange={(e) => updateAgencyOffice(index, 'phone', e.target.value)}
            placeholder="987 000 000"
          />
        </div>

      </div>
    </div>
  ))}
</div>
```

---

### 7. Example: Boolean Fields (Switches)

```typescript
<div className="bg-slate-50 p-4 rounded-lg">
  <h3 className="font-semibold mb-3 text-slate-700">📋 Otras Condiciones</h3>
  <div className="space-y-4">

    {/* Other Agency */}
    <div className="flex items-center justify-between">
      <div>
        <Label>¿Tiene encargo con otra agencia?</Label>
        <p className="text-xs text-muted-foreground">
          Cláusula 4º del contrato
        </p>
      </div>
      <Switch
        checked={editedData.hasOtherAgency}
        onCheckedChange={(checked) => setEditedData(prev => ({
          ...prev,
          hasOtherAgency: checked
        }))}
      />
    </div>

    {/* GDPR Consent */}
    <div className="flex items-center justify-between">
      <div>
        <Label>Consentimiento GDPR (comunicaciones)</Label>
        <p className="text-xs text-muted-foreground">
          Autorización para ofertas y fidelización
        </p>
      </div>
      <Switch
        checked={editedData.gdprConsent}
        onCheckedChange={(checked) => setEditedData(prev => ({
          ...prev,
          gdprConsent: checked
        }))}
      />
    </div>

  </div>
</div>
```

---

### 8. Modal Footer (Actions)

```typescript
<div className="flex justify-between items-center gap-3 pt-4 border-t mt-4">
  {/* Info text */}
  <p className="text-xs text-muted-foreground">
    * Campos requeridos por ley
  </p>

  {/* Action buttons */}
  <div className="flex gap-3">
    <Button variant="outline" onClick={onClose} disabled={isGenerating}>
      Cancelar
    </Button>
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600"
    >
      {isGenerating ? "Generando PDF..." : "✓ Generar PDF Final"}
    </Button>
  </div>
</div>
```

---

### 9. Integration: Updating HojaEncargoButton

**File**: `src/components/propiedades/detail/initial_docs/hoja-encargo-button.tsx`

#### Add State for Preview Modal

```typescript
import { NotaEncargoPreviewModal } from "./nota-encargo-preview-modal";

export function HojaEncargoButton({ propertyId, onDocumentGenerated, className }: HojaEncargoButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✨ NEW: Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<NotaEncargoPDFData | null>(null);

  // ... existing code ...
}
```

#### Modify handleCreateHojaEncargo

```typescript
const handleCreateHojaEncargo = async (terms: TermsData) => {
  try {
    console.log("🚀 Starting Nota de Encargo generation...");

    // Extract listing ID
    const pathname = window.location.pathname;
    const listingId = extractListingIdFromPathname(pathname);

    if (!listingId) {
      throw new Error("No se pudo obtener el ID de la propiedad desde la URL");
    }

    // Fetch nota encargo data
    const rawData = await getNotaEncargoData(listingId);

    if (!rawData) {
      throw new Error("No se pudieron obtener los datos de la propiedad");
    }

    // Transform data for PDF generation
    const pdfData = transformToNotaEncargoPDF(rawData, terms);

    // ✨ CHANGED: Show preview modal instead of generating PDF immediately
    setPreviewData(pdfData);
    setShowPreview(true);

  } catch (error) {
    console.error("❌ Error preparing Nota de Encargo:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    alert(`Error al preparar la hoja de encargo: ${errorMessage}`);
    throw error;
  }
};
```

#### Add New Function: handleConfirmGeneration

```typescript
const handleConfirmGeneration = async (editedData: NotaEncargoPDFData) => {
  try {
    console.log("📄 Generating PDF with edited data...");

    // Extract listing ID
    const pathname = window.location.pathname;
    const listingId = extractListingIdFromPathname(pathname);

    if (!listingId) {
      throw new Error("No se pudo obtener el ID de la propiedad");
    }

    // Generate PDF using edited data
    const response = await fetch("/api/nota-encargo/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: editedData, // ← User's edited data
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { error?: string };
      throw new Error(errorData.error ?? "Error al generar el PDF");
    }

    // Get the PDF blob
    const pdfBlob = await response.blob();

    // Create a File object from the blob for upload
    const filename = `${editedData.documentNumber}.pdf`;
    const pdfFile = new File([pdfBlob], filename, { type: "application/pdf" });

    console.log("📤 Uploading PDF to document management system...");

    // Upload to document management system (S3 + Database)
    const uploadResponse = await fetch(`/api/properties/${listingId}/documents`, {
      method: "POST",
      body: (() => {
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("folderType", "initial-docs");
        return formData;
      })(),
    });

    if (!uploadResponse.ok) {
      throw new Error("Error al guardar el documento en el sistema");
    }

    const uploadedDocument = await uploadResponse.json() as {
      docId: string | number;
      filename: string;
      fileType: string;
      fileUrl: string;
      uploadedAt: string;
      documentKey: string;
    };
    console.log("✅ Document uploaded successfully:", uploadedDocument);

    // Convert to DocumentRecord format
    const documentRecord: DocumentRecord = {
      docId: BigInt(uploadedDocument.docId),
      filename: uploadedDocument.filename,
      fileType: uploadedDocument.fileType,
      fileUrl: uploadedDocument.fileUrl,
      uploadedAt: new Date(uploadedDocument.uploadedAt),
      documentKey: uploadedDocument.documentKey,
    };

    // Trigger documents list refresh
    onDocumentGenerated?.([documentRecord]);

    // Also provide download option
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("✅ Nota de Encargo PDF generated, uploaded, and downloaded successfully");

    // Show success message
    alert(`Hoja de encargo generada y guardada exitosamente para ${editedData.client.fullName}`);

  } catch (error) {
    console.error("❌ Error generating Nota de Encargo:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    alert(`Error al generar la hoja de encargo: ${errorMessage}`);
    throw error;
  }
};
```

#### Update JSX Return

```typescript
return (
  <div className={cn("w-full", className)}>
    {/* Existing button UI */}
    <div className="bg-gray-50/50 rounded-lg border border-gray-200 p-4 text-center hover:bg-gray-100/50 transition-colors h-[200px] flex flex-col justify-center">
      {/* ... existing button content ... */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className={cn(
          "w-full px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-md text-sm",
          "hover:from-amber-500 hover:to-rose-500 transition-all duration-200 hover:scale-105 shadow-sm"
        )}
      >
        Generar ahora
      </button>
    </div>

    {/* Existing Terms Modal */}
    <TermsModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onContinue={handleCreateHojaEncargo}
    />

    {/* ✨ NEW: Preview Modal */}
    {previewData && (
      <NotaEncargoPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        initialData={previewData}
        onConfirm={handleConfirmGeneration}
      />
    )}
  </div>
);
```

---

### 10. How Data Flows Through the System

#### Step-by-Step Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION: Click "Generar ahora"                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. TERMS MODAL: User fills commission, duration, etc.            │
│    Returns: TermsData object                                     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. DATABASE QUERY: getNotaEncargoData(listingId)                 │
│    File: src/server/queries/nota-encargo.ts                      │
│    Returns: NotaEncargoRawData (from DB joins)                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. TRANSFORMATION: transformToNotaEncargoPDF(rawData, terms)     │
│    File: src/lib/nota-encargo-helpers.ts                         │
│    Returns: NotaEncargoPDFData (formatted for PDF)               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. ✨ PREVIEW MODAL: NotaEncargoPreviewModal                     │
│    - Receives: NotaEncargoPDFData as initialData                 │
│    - User edits fields                                           │
│    - User clicks "Generar PDF Final"                             │
│    - Returns: editedData (NotaEncargoPDFData with user changes)  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. API CALL: POST /api/nota-encargo/generate-pdf                 │
│    Body: { data: editedData }                                    │
│    File: src/app/api/nota-encargo/generate-pdf/route.ts          │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 7. PUPPETEER RENDERING:                                          │
│    - Launches headless browser                                   │
│    - Navigates to /templates/nota-encargo?data={editedData}      │
│    - Waits for NotaEncargoDocument component to render           │
│    - Captures page as PDF                                        │
│    Returns: PDF buffer                                           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 8. TEMPLATE RENDERING: NotaEncargoDocument                       │
│    File: src/components/documents/nota-encargo-document.tsx      │
│    - Receives editedData via URL params                          │
│    - Renders HTML with editedData.client.fullName, etc.          │
│    - Uses editedData.* for ALL fields                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 9. FILE UPLOAD: POST /api/properties/{id}/documents              │
│    - Converts PDF blob to File                                   │
│    - Uploads to S3                                               │
│    - Saves metadata to database                                  │
│    Returns: DocumentRecord                                       │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 10. USER FEEDBACK:                                               │
│     - Downloads PDF to user's computer                           │
│     - Refreshes document list on page                            │
│     - Shows success alert                                        │
└──────────────────────────────────────────────────────────────────┘
```

#### Data Type Evolution

```typescript
// Step 3: Database Query Result
interface NotaEncargoRawData {
  listingId: bigint;
  listingType: string;
  price: number;
  contactFirstName: string | null;
  contactLastName: string | null;
  // ... raw DB fields
}

// Step 4: After Transformation
interface NotaEncargoPDFData {
  documentNumber: string;           // Generated: "Hoja-Encargo-123-012025"
  client: {
    fullName: string;                // Formatted: "Juan García Pérez"
    nif: string;
    address: string;
    // ...
  };
  operation: {
    type: string;                    // Translated: "Venta" (not "Sale")
    price: string;                   // Formatted: "150.000 €"
  };
  // ... formatted fields
}

// Step 5: After User Edits (Same Type, Different Values)
// User changes fullName: "Juan García Pérez" → "María López Rodríguez"
// User changes price: "150.000 €" → "155.000 €"
// editedData: NotaEncargoPDFData (with user modifications)

// Step 7-8: PDF Rendering
// Template uses editedData.client.fullName → Shows "María López Rodríguez"
// Template uses editedData.operation.price → Shows "155.000 €"
```

---

### 11. Connection to Final PDF

The editable preview is **100% connected** to the final PDF. Here's how:

#### Template Rendering (src/components/documents/nota-encargo-document.tsx)

Every field in the PDF template directly uses the `data` prop:

```typescript
// Line 206: Document Number
<div className="text-[12pt] font-medium">
  Nº Nota: {data.documentNumber}  {/* ← Your edited value */}
</div>

// Line 221: Client Full Name
<div className="flex">
  <span className="font-bold min-w-[140px]">Nombre Completo:</span>
  <span className="flex-1 border-b border-black pb-0.5 ml-2">
    {data.client.fullName}  {/* ← Your edited value */}
  </span>
</div>

// Line 226: Client City
<div className="flex">
  <span className="font-bold min-w-[140px]">Vecino/a de:</span>
  <span className="flex-1 border-b border-black pb-0.5 ml-2">
    {data.client.city}  {/* ← Your edited value */}
  </span>
</div>

// Line 263: Operation Type
<div className="flex">
  <span className="font-bold min-w-[140px]">Operación:</span>
  <span className="flex-1 border-b border-black pb-0.5 ml-2">
    {data.operation.type}  {/* ← Your edited value */}
  </span>
</div>

// Line 273: Price
<div className="flex">
  <span className="font-bold min-w-[140px]">Condiciones / Precio:</span>
  <span className="flex-1 border-b border-black pb-0.5 ml-2">
    {data.operation.price}  {/* ← Your edited value */}
  </span>
</div>

// Line 321: Commission
<div className="text-justify mb-3 leading-relaxed">
  <strong>A)</strong> De las cantidades recibidas, sobre el precio de la operación,
  "EL CLIENTE", abonará el <strong>{data.commission.percentage}% + I.V.A.</strong>
  {/* ↑ Your edited value */}
  con un mínimo de <strong>{data.commission.minimum} €</strong>
  {/* ↑ Your edited value */}
  , como honorarios...
</div>

// Line 344: Other Agency
<div className="text-justify mb-3 leading-relaxed">
  "EL CLIENTE", <span className="font-bold">
    {data.hasOtherAgency ? '[SÍ]' : '[NO]'}  {/* ← Your edited value */}
  </span>, tiene encomendada, la venta del mencionado inmueble a otra Agencia...
</div>
```

#### What This Means

| You Edit in Preview Modal | Template Variable | Appears in PDF |
|---------------------------|-------------------|----------------|
| Client name: "María López" | `{data.client.fullName}` | "María López" |
| NIF: "12345678A" | `{data.client.nif}` | "12345678A" |
| City: "Barcelona" | `{data.client.city}` | "Barcelona" |
| Operation: "Alquiler" | `{data.operation.type}` | "Alquiler" |
| Price: "800 €/mes" | `{data.operation.price}` | "800 €/mes" |
| Commission: 5% | `{data.commission.percentage}` | "5%" |
| Other agency: Yes | `{data.hasOtherAgency}` | "[SÍ]" |
| Observations: "Special terms" | `{data.observations}` | "Special terms" |

**Every single field you edit in the modal appears exactly as you typed it in the final PDF.**

---

### 12. Complete Code Sample: Full Modal Component

**File**: `src/components/propiedades/detail/initial_docs/nota-encargo-preview-modal.tsx`

```typescript
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import type { NotaEncargoPDFData } from "~/lib/nota-encargo-helpers";

interface NotaEncargoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: NotaEncargoPDFData;
  onConfirm: (editedData: NotaEncargoPDFData) => Promise<void>;
}

export function NotaEncargoPreviewModal({
  isOpen,
  onClose,
  initialData,
  onConfirm
}: NotaEncargoPreviewModalProps) {
  const [editedData, setEditedData] = useState<NotaEncargoPDFData>(initialData);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onConfirm(editedData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper functions for state updates
  const updateClient = (field: keyof NotaEncargoPDFData['client'], value: string) => {
    setEditedData(prev => ({
      ...prev,
      client: { ...prev.client, [field]: value }
    }));
  };

  const updateAgency = (field: keyof NotaEncargoPDFData['agency'], value: string) => {
    setEditedData(prev => ({
      ...prev,
      agency: { ...prev.agency, [field]: value }
    }));
  };

  const updateAgencyOffice = (index: number, field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      agency: {
        ...prev.agency,
        offices: prev.agency.offices.map((office, i) =>
          i === index ? { ...office, [field]: value } : office
        )
      }
    }));
  };

  const updateProperty = (field: keyof NotaEncargoPDFData['property'], value: string) => {
    setEditedData(prev => ({
      ...prev,
      property: { ...prev.property, [field]: value }
    }));
  };

  const updateOperation = (field: keyof NotaEncargoPDFData['operation'], value: string) => {
    setEditedData(prev => ({
      ...prev,
      operation: { ...prev.operation, [field]: value }
    }));
  };

  const updateCommission = (field: keyof NotaEncargoPDFData['commission'], value: string | number) => {
    setEditedData(prev => ({
      ...prev,
      commission: { ...prev.commission, [field]: value }
    }));
  };

  const updateSignatures = (field: keyof NotaEncargoPDFData['signatures'], value: string) => {
    setEditedData(prev => ({
      ...prev,
      signatures: { ...prev.signatures, [field]: value }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Revisar y Editar Hoja de Encargo
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Nº Documento: <span className="font-mono font-semibold">{editedData.documentNumber}</span>
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">

            {/* === DOCUMENT NUMBER === */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-3 text-slate-700">📄 Número de Documento</h3>
              <div>
                <Label>Nº Nota de Encargo</Label>
                <Input
                  value={editedData.documentNumber}
                  onChange={(e) => setEditedData(prev => ({ ...prev, documentNumber: e.target.value }))}
                  className="font-mono"
                />
              </div>
            </div>

            <Separator />

            {/* === CLIENT DATA === */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-blue-900">👤 Datos del Cliente (Propietario)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre Completo *</Label>
                  <Input
                    value={editedData.client.fullName}
                    onChange={(e) => updateClient('fullName', e.target.value)}
                    placeholder="Apellidos y Nombre"
                  />
                </div>
                <div>
                  <Label>NIF/DNI *</Label>
                  <Input
                    value={editedData.client.nif}
                    onChange={(e) => updateClient('nif', e.target.value)}
                    placeholder="12345678A"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Domicilio</Label>
                  <Input
                    value={editedData.client.address}
                    onChange={(e) => updateClient('address', e.target.value)}
                    placeholder="Calle, número, piso, puerta"
                  />
                </div>
                <div>
                  <Label>Ciudad</Label>
                  <Input
                    value={editedData.client.city}
                    onChange={(e) => updateClient('city', e.target.value)}
                    placeholder="León"
                  />
                </div>
                <div>
                  <Label>Código Postal</Label>
                  <Input
                    value={editedData.client.postalCode}
                    onChange={(e) => updateClient('postalCode', e.target.value)}
                    placeholder="24001"
                  />
                </div>
                <div>
                  <Label>Teléfono *</Label>
                  <Input
                    value={editedData.client.phone}
                    onChange={(e) => updateClient('phone', e.target.value)}
                    placeholder="600 000 000"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* === AGENCY DATA === */}
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-amber-900">🏢 Datos de la Agencia (API)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del Agente/Agencia *</Label>
                  <Input
                    value={editedData.agency.agentName}
                    onChange={(e) => updateAgency('agentName', e.target.value)}
                    placeholder="Dª María García / Inmobiliaria XYZ"
                  />
                </div>
                <div>
                  <Label>Número Colegiado API</Label>
                  <Input
                    value={editedData.agency.collegiateNumber}
                    onChange={(e) => updateAgency('collegiateNumber', e.target.value)}
                    placeholder="API-1234"
                  />
                </div>
                <div>
                  <Label>NIF/CIF Agente</Label>
                  <Input
                    value={editedData.agency.agentNIF}
                    onChange={(e) => updateAgency('agentNIF', e.target.value)}
                    placeholder="B12345678"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editedData.agency.email}
                    onChange={(e) => updateAgency('email', e.target.value)}
                    placeholder="contacto@agencia.com"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Sitio Web</Label>
                  <Input
                    value={editedData.agency.website}
                    onChange={(e) => updateAgency('website', e.target.value)}
                    placeholder="https://www.agencia.com"
                  />
                </div>
              </div>

              {/* Agency Offices */}
              <div className="mt-4 space-y-3">
                <Label className="text-sm font-semibold">Oficinas</Label>
                {editedData.agency.offices.map((office, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-amber-200">
                    <p className="text-xs text-muted-foreground mb-2">Oficina {index + 1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Label className="text-xs">Dirección</Label>
                        <Input
                          value={office.address}
                          onChange={(e) => updateAgencyOffice(index, 'address', e.target.value)}
                          placeholder="Calle, número"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Ciudad</Label>
                        <Input
                          value={office.city}
                          onChange={(e) => updateAgencyOffice(index, 'city', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">C.P.</Label>
                        <Input
                          value={office.postalCode}
                          onChange={(e) => updateAgencyOffice(index, 'postalCode', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Teléfono</Label>
                        <Input
                          value={office.phone}
                          onChange={(e) => updateAgencyOffice(index, 'phone', e.target.value)}
                          placeholder="987 000 000"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* === PROPERTY DATA === */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-green-900">🏠 Descripción del Inmueble</h3>
              <div className="space-y-4">
                <div>
                  <Label>Descripción de la Propiedad *</Label>
                  <Textarea
                    value={editedData.property.description}
                    onChange={(e) => updateProperty('description', e.target.value)}
                    rows={4}
                    placeholder="Piso de 3 habitaciones, 2 baños, cocina amueblada..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Autorización Colocación de Cartel</Label>
                    <Input
                      value={editedData.property.allowSignage}
                      onChange={(e) => updateProperty('allowSignage', e.target.value)}
                      placeholder="Sí / No"
                    />
                  </div>
                  <div>
                    <Label>Certificación Eficiencia Energética</Label>
                    <Input
                      value={editedData.property.energyCertificate}
                      onChange={(e) => updateProperty('energyCertificate', e.target.value)}
                      placeholder="Disponible - Certificación E"
                    />
                  </div>
                  <div>
                    <Label>Entrega de Llaves</Label>
                    <Input
                      value={editedData.property.keyDelivery}
                      onChange={(e) => updateProperty('keyDelivery', e.target.value)}
                      placeholder="Sí / No"
                    />
                  </div>
                  <div>
                    <Label>Autorización para Realizar Visitas</Label>
                    <Input
                      value={editedData.property.allowVisits}
                      onChange={(e) => updateProperty('allowVisits', e.target.value)}
                      placeholder="Sí / No"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* === OPERATION DATA === */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-purple-900">💼 Operación</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Operación *</Label>
                  <Input
                    value={editedData.operation.type}
                    onChange={(e) => updateOperation('type', e.target.value)}
                    placeholder="Venta / Alquiler"
                  />
                </div>
                <div>
                  <Label>Precio *</Label>
                  <Input
                    value={editedData.operation.price}
                    onChange={(e) => updateOperation('price', e.target.value)}
                    placeholder="150.000 € / 800 €/mes"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* === COMMISSION DATA === */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-orange-900">💰 Honorarios y Comisión</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Porcentaje de Comisión (%) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editedData.commission.percentage}
                    onChange={(e) => updateCommission('percentage', parseFloat(e.target.value))}
                    placeholder="3"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    + IVA (ej: 3% sobre precio de venta)
                  </p>
                </div>
                <div>
                  <Label>Comisión Mínima (€) *</Label>
                  <Input
                    value={editedData.commission.minimum}
                    onChange={(e) => updateCommission('minimum', e.target.value)}
                    placeholder="1500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Importe mínimo a cobrar
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* === DURATION === */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-indigo-900">📅 Duración del Encargo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duración (meses)</Label>
                  <Input
                    type="number"
                    value={editedData.duration.months}
                    onChange={(e) => setEditedData(prev => ({
                      ...prev,
                      duration: { months: parseInt(e.target.value) }
                    }))}
                    placeholder="12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Prorrogable por el mismo periodo
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* === SIGNATURES === */}
            <div className="bg-rose-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-rose-900">✍️ Firmas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lugar de Firma</Label>
                  <Input
                    value={editedData.signatures.location}
                    onChange={(e) => updateSignatures('location', e.target.value)}
                    placeholder="León"
                  />
                </div>
                <div>
                  <Label>Fecha</Label>
                  <Input
                    type="text"
                    value={editedData.signatures.date}
                    onChange={(e) => updateSignatures('date', e.target.value)}
                    placeholder="01/01/2025"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* === JURISDICTION === */}
            <div className="bg-cyan-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-cyan-900">⚖️ Jurisdicción</h3>
              <div>
                <Label>Ciudad para Fuero y Jurisdicción</Label>
                <Input
                  value={editedData.jurisdiction.city}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    jurisdiction: { city: e.target.value }
                  }))}
                  placeholder="León"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tribunales competentes para dirimir controversias
                </p>
              </div>
            </div>

            <Separator />

            {/* === OTHER CONDITIONS === */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-slate-700">📋 Otras Condiciones</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>¿Tiene encargo con otra agencia?</Label>
                    <p className="text-xs text-muted-foreground">
                      Cláusula 4º del contrato
                    </p>
                  </div>
                  <Switch
                    checked={editedData.hasOtherAgency}
                    onCheckedChange={(checked) => setEditedData(prev => ({
                      ...prev,
                      hasOtherAgency: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Consentimiento GDPR (comunicaciones)</Label>
                    <p className="text-xs text-muted-foreground">
                      Autorización para ofertas y fidelización
                    </p>
                  </div>
                  <Switch
                    checked={editedData.gdprConsent}
                    onCheckedChange={(checked) => setEditedData(prev => ({
                      ...prev,
                      gdprConsent: checked
                    }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* === OBSERVATIONS === */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-yellow-900">📝 Observaciones</h3>
              <div>
                <Label>Observaciones Adicionales</Label>
                <Textarea
                  value={editedData.observations}
                  onChange={(e) => setEditedData(prev => ({ ...prev, observations: e.target.value }))}
                  rows={4}
                  placeholder="Añadir cualquier observación, condición especial o nota adicional..."
                />
              </div>
            </div>

          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-3 pt-4 border-t mt-4">
          <p className="text-xs text-muted-foreground">
            * Campos requeridos por ley
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600"
            >
              {isGenerating ? "Generando PDF..." : "✓ Generar PDF Final"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Summary

### What Gets Implemented

1. **New Component**: `NotaEncargoPreviewModal` with 11 editable sections
2. **Updated Component**: `HojaEncargoButton` with preview modal integration
3. **New State Management**: React state for edited data with helper functions
4. **New Flow**: Preview → Edit → Confirm → Generate PDF

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/propiedades/detail/initial_docs/nota-encargo-preview-modal.tsx` | **CREATE** | New modal component with all editable fields |
| `src/components/propiedades/detail/initial_docs/hoja-encargo-button.tsx` | **MODIFY** | Add preview modal state and integration |

### Key Features

- ✅ Edit **every single field** in the document
- ✅ Color-coded sections for easy navigation
- ✅ Scrollable modal for long forms
- ✅ Real-time state updates
- ✅ Loading states during PDF generation
- ✅ Cancel and confirm actions
- ✅ Helper text and placeholders
- ✅ Validation indicators (* for required fields)
- ✅ Array handling for multiple offices
- ✅ Boolean switches for yes/no fields
- ✅ Full TypeScript type safety

### User Experience

1. User fills basic terms (commission, duration)
2. System fetches and pre-fills all data from database
3. User reviews **complete preview** with all fields editable
4. User makes any necessary corrections
5. User clicks "Generar PDF Final"
6. PDF generated with **exact user edits**
7. PDF uploaded to S3 and downloaded

### Technical Benefits

- No database updates needed (changes are PDF-only)
- Full TypeScript type safety throughout
- Immutable state updates (React best practices)
- Reusable helper functions for state management
- Clean separation of concerns
- Easy to extend with new fields

---

## Next Steps

1. Create `nota-encargo-preview-modal.tsx` component
2. Update `hoja-encargo-button.tsx` with preview integration
3. Test the complete flow end-to-end
4. Verify PDF output contains edited data
5. (Optional) Add client-side validation before PDF generation
6. (Optional) Add ability to reset fields to original values
7. (Optional) Add ability to add/remove agency offices dynamically
