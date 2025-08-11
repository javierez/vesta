# Calendar Visit Flow - Complete Implementation PRP

**Generated**: 2025-08-11  
**Status**: Ready for Implementation  
**Priority**: High  
**Estimated Effort**: 16-20 hours  

## Executive Summary

This PRP implements a comprehensive calendar visit flow that allows agents to record property visits directly from calendar appointments. When users click "Visita" on a calendar event, they navigate to a dedicated page where they can capture visit details, collect signatures from both agent and visitor, and persist the complete visit record with signature images stored in S3.

## Technical Requirements

### 1. Database Schema Design

**New Table: `visits`**
```sql
CREATE TABLE visits (
  visit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  appointment_id BIGINT NOT NULL,
  listing_id BIGINT NOT NULL,
  contact_id BIGINT NOT NULL,
  agent_id VARCHAR(36) NOT NULL,
  account_id BIGINT NOT NULL,
  visited_at TIMESTAMP NOT NULL,
  signature_agent_url VARCHAR(2048),
  signature_visitor_url VARCHAR(2048),
  signature_agent_s3_key VARCHAR(512),
  signature_visitor_s3_key VARCHAR(512),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
  FOREIGN KEY (listing_id) REFERENCES listings(listing_id),
  FOREIGN KEY (contact_id) REFERENCES contacts(contact_id),
  FOREIGN KEY (agent_id) REFERENCES users(id),
  FOREIGN KEY (account_id) REFERENCES accounts(account_id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Drizzle Schema Addition** (`src/server/db/schema.ts`):
```typescript
export const visits = singlestoreTable("visits", {
  visitId: bigint("visit_id", { mode: "bigint" }).primaryKey().autoincrement(),
  appointmentId: bigint("appointment_id", { mode: "bigint" }).notNull(),
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(),
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(),
  agentId: varchar("agent_id", { length: 36 }).notNull(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(),
  visitedAt: timestamp("visited_at").notNull(),
  signatureAgentUrl: varchar("signature_agent_url", { length: 2048 }),
  signatureVisitorUrl: varchar("signature_visitor_url", { length: 2048 }),
  signatureAgentS3Key: varchar("signature_agent_s3_key", { length: 512 }),
  signatureVisitorS3Key: varchar("signature_visitor_s3_key", { length: 512 }),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).notNull().default("completed"),
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
});
```

### 2. Dependencies Installation

**Required Package Addition**:
```json
{
  "react-signature-canvas": "^1.0.8"
}
```

**Types Installation**:
```json
{
  "@types/react-signature-canvas": "^1.0.5"
}
```

### 3. File Structure Implementation

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── calendario/
│   │       └── visita/
│   │           └── [appointment_id]/
│   │               └── page.tsx          # Main visit page
│   └── api/
│       └── visits/
│           ├── route.ts                  # Visit CRUD API
│           └── [id]/
│               └── route.ts              # Individual visit API
├── components/
│   └── visits/
│       ├── visit-form.tsx                # Main visit form component
│       ├── signature-pad.tsx             # Signature capture component
│       └── visit-summary.tsx             # Visit confirmation component
├── lib/
│   └── s3-signatures.ts                  # S3 signature upload utilities
├── server/
│   ├── actions/
│   │   └── visits.ts                     # Visit server actions
│   └── queries/
│       └── visits.ts                     # Visit database queries
└── types/
    └── visits.ts                         # Visit type definitions
```

### 4. Core Implementation Components

#### 4.1 Type Definitions (`src/types/visits.ts`)
```typescript
export interface Visit {
  visitId: bigint;
  appointmentId: bigint;
  listingId: bigint;
  contactId: bigint;
  agentId: string;
  accountId: bigint;
  visitedAt: Date;
  signatureAgentUrl?: string;
  signatureVisitorUrl?: string;
  signatureAgentS3Key?: string;
  signatureVisitorS3Key?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface VisitFormData {
  appointmentId: bigint;
  listingId: bigint;
  contactId: bigint;
  agentId: string;
  visitedAt: Date;
  notes?: string;
  agentSignature?: string; // base64 data URL
  visitorSignature?: string; // base64 data URL
}

export interface AppointmentWithDetails {
  appointmentId: bigint;
  listingId?: bigint;
  contactId: bigint;
  userId: string;
  datetimeStart: Date;
  datetimeEnd: Date;
  type?: string;
  notes?: string;
  contactFirstName?: string;
  contactLastName?: string;
  propertyStreet?: string;
  agentName?: string;
  agentFirstName?: string;
  agentLastName?: string;
}
```

#### 4.2 S3 Signature Upload Utility (`src/lib/s3-signatures.ts`)
```typescript
import { uploadImageToS3 } from "~/lib/s3";
import { nanoid } from "nanoid";

export async function uploadSignatureToS3(
  signatureDataUrl: string,
  appointmentId: bigint,
  signatureType: 'agent' | 'visitor'
): Promise<{ imageUrl: string; s3Key: string }> {
  // Convert data URL to File object
  const response = await fetch(signatureDataUrl);
  const blob = await response.blob();
  const filename = `signature-${signatureType}-${appointmentId}-${nanoid(8)}.png`;
  const file = new File([blob], filename, { type: 'image/png' });
  
  // Use existing S3 upload with visit-specific folder
  const referenceNumber = `VISIT_${appointmentId}`;
  const { imageUrl, s3key } = await uploadImageToS3(
    file,
    referenceNumber,
    signatureType === 'agent' ? 1 : 2
  );
  
  return { imageUrl, s3Key: s3key };
}
```

#### 4.3 Database Queries (`src/server/queries/visits.ts`)
```typescript
import { eq, and } from "drizzle-orm";
import { getSecureDb, getCurrentUser } from "~/lib/dal";
import { visits, appointments, contacts, listings, properties, users } from "~/server/db/schema";
import type { Visit, AppointmentWithDetails } from "~/types/visits";

export async function getAppointmentWithDetails(appointmentId: bigint): Promise<AppointmentWithDetails | null> {
  const { db, accountId } = await getSecureDb();
  
  const [appointment] = await db
    .select({
      appointmentId: appointments.appointmentId,
      listingId: appointments.listingId,
      contactId: appointments.contactId,
      userId: appointments.userId,
      datetimeStart: appointments.datetimeStart,
      datetimeEnd: appointments.datetimeEnd,
      type: appointments.type,
      notes: appointments.notes,
      contactFirstName: contacts.firstName,
      contactLastName: contacts.lastName,
      propertyStreet: properties.street,
      agentName: users.name,
      agentFirstName: users.firstName,
      agentLastName: users.lastName,
    })
    .from(appointments)
    .leftJoin(contacts, eq(appointments.contactId, contacts.contactId))
    .leftJoin(listings, eq(appointments.listingId, listings.listingId))
    .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
    .leftJoin(users, eq(appointments.userId, users.id))
    .where(
      and(
        eq(appointments.appointmentId, appointmentId),
        eq(contacts.accountId, BigInt(accountId)),
        eq(appointments.isActive, true)
      )
    );
    
  return appointment || null;
}

export async function createVisit(visitData: Omit<Visit, 'visitId' | 'createdAt' | 'updatedAt'>): Promise<Visit> {
  const { db } = await getSecureDb();
  
  const [result] = await db
    .insert(visits)
    .values({
      appointmentId: visitData.appointmentId,
      listingId: visitData.listingId,
      contactId: visitData.contactId,
      agentId: visitData.agentId,
      accountId: visitData.accountId,
      visitedAt: visitData.visitedAt,
      signatureAgentUrl: visitData.signatureAgentUrl,
      signatureVisitorUrl: visitData.signatureVisitorUrl,
      signatureAgentS3Key: visitData.signatureAgentS3Key,
      signatureVisitorS3Key: visitData.signatureVisitorS3Key,
      notes: visitData.notes,
      status: visitData.status,
      createdBy: visitData.createdBy,
    })
    .returning();
    
  if (!result) {
    throw new Error("Failed to create visit");
  }
  
  return result as Visit;
}

export async function getVisitByAppointmentId(appointmentId: bigint): Promise<Visit | null> {
  const { db, accountId } = await getSecureDb();
  
  const [visit] = await db
    .select()
    .from(visits)
    .where(
      and(
        eq(visits.appointmentId, appointmentId),
        eq(visits.accountId, BigInt(accountId)),
        eq(visits.isActive, true)
      )
    );
    
  return visit as Visit || null;
}
```

#### 4.4 Server Actions (`src/server/actions/visits.ts`)
```typescript
"use server";

import { getCurrentUser, getSecureDb } from "~/lib/dal";
import { createVisit, getAppointmentWithDetails, getVisitByAppointmentId } from "~/server/queries/visits";
import { uploadSignatureToS3 } from "~/lib/s3-signatures";
import { hasPermission, PERMISSIONS } from "~/lib/permissions";
import type { VisitFormData } from "~/types/visits";

export async function createVisitAction(formData: VisitFormData) {
  try {
    // Verify permissions
    const canCreateVisit = await hasPermission(PERMISSIONS.LISTING_VIEW);
    if (!canCreateVisit) {
      throw new Error("Insufficient permissions to create visit");
    }
    
    const currentUser = await getCurrentUser();
    const { accountId } = await getSecureDb();
    
    // Verify appointment exists and belongs to current account
    const appointment = await getAppointmentWithDetails(formData.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    
    // Check if visit already exists
    const existingVisit = await getVisitByAppointmentId(formData.appointmentId);
    if (existingVisit) {
      throw new Error("Visit already exists for this appointment");
    }
    
    // Upload signatures to S3
    let signatureAgentUrl: string | undefined;
    let signatureVisitorUrl: string | undefined;
    let signatureAgentS3Key: string | undefined;
    let signatureVisitorS3Key: string | undefined;
    
    if (formData.agentSignature) {
      const agentUpload = await uploadSignatureToS3(
        formData.agentSignature,
        formData.appointmentId,
        'agent'
      );
      signatureAgentUrl = agentUpload.imageUrl;
      signatureAgentS3Key = agentUpload.s3Key;
    }
    
    if (formData.visitorSignature) {
      const visitorUpload = await uploadSignatureToS3(
        formData.visitorSignature,
        formData.appointmentId,
        'visitor'
      );
      signatureVisitorUrl = visitorUpload.imageUrl;
      signatureVisitorS3Key = visitorUpload.s3Key;
    }
    
    // Create visit record
    const visit = await createVisit({
      appointmentId: formData.appointmentId,
      listingId: formData.listingId,
      contactId: formData.contactId,
      agentId: formData.agentId,
      accountId: BigInt(accountId),
      visitedAt: formData.visitedAt,
      signatureAgentUrl,
      signatureVisitorUrl,
      signatureAgentS3Key,
      signatureVisitorS3Key,
      notes: formData.notes,
      status: 'completed',
      createdBy: currentUser.id,
      isActive: true,
    });
    
    return { success: true, visit };
  } catch (error) {
    console.error("Error creating visit:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create visit" 
    };
  }
}

export async function getAppointmentForVisitAction(appointmentId: bigint) {
  try {
    const canView = await hasPermission(PERMISSIONS.LISTING_VIEW);
    if (!canView) {
      throw new Error("Insufficient permissions");
    }
    
    const appointment = await getAppointmentWithDetails(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    
    return { success: true, appointment };
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch appointment" 
    };
  }
}
```

#### 4.5 Signature Pad Component (`src/components/visits/signature-pad.tsx`)
```typescript
"use client";

import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "~/components/ui/button";
import { RotateCcw, Check } from "lucide-react";
import { cn } from "~/lib/utils";

interface SignaturePadProps {
  label: string;
  onSignatureChange: (signature: string | null) => void;
  required?: boolean;
  className?: string;
}

export function SignaturePad({ 
  label, 
  onSignatureChange, 
  required = false,
  className 
}: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
      onSignatureChange(null);
    }
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      const canvas = sigCanvas.current.getCanvas();
      const isEmpty = sigCanvas.current.isEmpty();
      setIsEmpty(isEmpty);
      
      if (!isEmpty) {
        const dataURL = canvas.toDataURL('image/png');
        onSignatureChange(dataURL);
      } else {
        onSignatureChange(null);
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="border-2 border-gray-300 rounded-lg bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: 400,
            height: 200,
            className: 'signature-canvas w-full h-48 touch-none',
          }}
          backgroundColor="rgba(255,255,255,1)"
          penColor="black"
          onEnd={handleEnd}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clear}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-4 w-4" />
          Limpiar
        </Button>
        
        {!isEmpty && (
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <Check className="h-4 w-4" />
            Firmado
          </div>
        )}
      </div>
      
      {required && isEmpty && (
        <p className="text-sm text-red-500">Este campo es obligatorio</p>
      )}
    </div>
  );
}
```

#### 4.6 Main Visit Form Component (`src/components/visits/visit-form.tsx`)
```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { FloatingLabelInput } from "~/components/ui/floating-label-input";
import { Textarea } from "~/components/ui/textarea";
import { SignaturePad } from "./signature-pad";
import { toast } from "sonner";
import { createVisitAction } from "~/server/actions/visits";
import { ArrowLeft, Save, Loader } from "lucide-react";
import type { AppointmentWithDetails, VisitFormData } from "~/types/visits";

interface VisitFormProps {
  appointment: AppointmentWithDetails;
}

export function VisitForm({ appointment }: VisitFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<VisitFormData>({
    appointmentId: appointment.appointmentId,
    listingId: appointment.listingId || BigInt(0),
    contactId: appointment.contactId,
    agentId: appointment.userId,
    visitedAt: appointment.datetimeStart,
    notes: appointment.notes || "",
  });
  const [agentSignature, setAgentSignature] = useState<string | null>(null);
  const [visitorSignature, setVisitorSignature] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agentSignature || !visitorSignature) {
      toast.error("Ambas firmas son requeridas");
      return;
    }
    
    if (!formData.listingId) {
      toast.error("La propiedad es requerida");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await createVisitAction({
        ...formData,
        agentSignature,
        visitorSignature,
      });
      
      if (result.success) {
        toast.success("Visita registrada correctamente");
        router.push("/calendario");
      } else {
        toast.error(result.error || "Error al registrar la visita");
      }
    } catch (error) {
      console.error("Error submitting visit:", error);
      toast.error("Error al registrar la visita");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/calendario");
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Registro de Visita
            </h1>
            <p className="text-gray-600">
              {appointment.propertyStreet || "Propiedad"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Visit Details */}
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Detalles de la Visita
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Contacto
              </label>
              <p className="mt-1 text-gray-700 p-3 bg-gray-50 rounded-md">
                {appointment.contactFirstName} {appointment.contactLastName}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-900">
                Agente
              </label>
              <p className="mt-1 text-gray-700 p-3 bg-gray-50 rounded-md">
                {appointment.agentName || 
                 `${appointment.agentFirstName} ${appointment.agentLastName}`}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-900">
                Propiedad
              </label>
              <p className="mt-1 text-gray-700 p-3 bg-gray-50 rounded-md">
                {appointment.propertyStreet || "Propiedad no especificada"}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-900">
                Fecha y Hora
              </label>
              <p className="mt-1 text-gray-700 p-3 bg-gray-50 rounded-md">
                {formatDateTime(appointment.datetimeStart)}
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-900">
              Notas de la Visita
            </label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observaciones, comentarios del cliente, detalles relevantes..."
              className="mt-1"
              rows={4}
            />
          </div>
        </div>

        {/* Signatures */}
        <div className="bg-white rounded-lg border p-6 space-y-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Firmas
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <SignaturePad
              label="Firma del Agente"
              onSignatureChange={setAgentSignature}
              required
            />
            
            <SignaturePad
              label="Firma del Visitante"
              onSignatureChange={setVisitorSignature}
              required
            />
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            Ambas partes deben firmar en las áreas designadas para confirmar la visita.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !agentSignature || !visitorSignature}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Registrar Visita
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

#### 4.7 Main Visit Page (`src/app/(dashboard)/calendario/visita/[appointment_id]/page.tsx`)
```typescript
import { notFound } from "next/navigation";
import { getAppointmentForVisitAction } from "~/server/actions/visits";
import { VisitForm } from "~/components/visits/visit-form";

interface VisitPageProps {
  params: Promise<{
    appointment_id: string;
  }>;
}

export default async function VisitPage({ params }: VisitPageProps) {
  const { appointment_id } = await params;
  
  const result = await getAppointmentForVisitAction(BigInt(appointment_id));
  
  if (!result.success || !result.appointment) {
    notFound();
  }
  
  return <VisitForm appointment={result.appointment} />;
}
```

### 5. API Routes Implementation

#### 5.1 Visit CRUD API (`src/app/api/visits/route.ts`)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createVisitAction } from "~/server/actions/visits";
import { auth } from "~/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const formData = await request.json();
    const result = await createVisitAction(formData);
    
    if (result.success) {
      return NextResponse.json(result.visit);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating visit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 6. Integration Points

#### 6.1 Calendar Event Panel Update
Add "Visita" button to existing calendar event panel in `src/app/(dashboard)/calendario/page.tsx`:

```typescript
// Add this button next to the "Editar" button in the event detail panel
<Button
  onClick={() => router.push(`/calendario/visita/${selectedEvent.appointmentId}`)}
  className="bg-green-600 hover:bg-green-700"
>
  Visita
</Button>
```

### 7. Validation Gates

#### 7.1 Pre-Implementation Checklist
- [ ] Database migration executed successfully
- [ ] react-signature-canvas package installed
- [ ] S3 bucket permissions configured for signature uploads
- [ ] Permission system allows visit creation for appropriate roles

#### 7.2 Component Integration Tests
- [ ] Signature canvas renders and captures touches/mouse input
- [ ] Form validation prevents submission without required signatures
- [ ] S3 upload handles signature images correctly
- [ ] Database records persist with correct foreign key relationships

#### 7.3 User Experience Validation
- [ ] Mobile signature capture works smoothly on touch devices
- [ ] Form loads appointment data correctly
- [ ] Success/error states provide clear feedback
- [ ] Navigation between calendar and visit page works seamlessly

### 8. Testing Procedures

#### 8.1 Unit Tests
```typescript
// src/components/visits/__tests__/signature-pad.test.tsx
import { render, screen } from '@testing-library/react';
import { SignaturePad } from '../signature-pad';

describe('SignaturePad', () => {
  it('renders signature canvas', () => {
    render(<SignaturePad label="Test Signature" onSignatureChange={jest.fn()} />);
    expect(screen.getByText('Test Signature')).toBeInTheDocument();
  });
  
  it('shows required indicator when required prop is true', () => {
    render(<SignaturePad label="Test" onSignatureChange={jest.fn()} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
```

#### 8.2 Integration Tests
```typescript
// src/app/(dashboard)/calendario/visita/__tests__/visit-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { VisitForm } from '~/components/visits/visit-form';
import { mockAppointment } from '~/lib/test-utils';

describe('Visit Flow', () => {
  it('loads appointment data correctly', () => {
    const appointment = mockAppointment();
    render(<VisitForm appointment={appointment} />);
    
    expect(screen.getByText(appointment.contactFirstName!)).toBeInTheDocument();
    expect(screen.getByText(appointment.propertyStreet!)).toBeInTheDocument();
  });
  
  it('prevents submission without signatures', async () => {
    const appointment = mockAppointment();
    render(<VisitForm appointment={appointment} />);
    
    const submitButton = screen.getByRole('button', { name: /registrar visita/i });
    expect(submitButton).toBeDisabled();
  });
});
```

#### 8.3 E2E Test Scenarios
1. **Happy Path**: Click "Visita" → Load form → Fill signatures → Save → Redirect
2. **Missing Data**: Handle appointments without listing/contact gracefully
3. **Network Failure**: Retry signature upload on failure
4. **Permission Denial**: Show appropriate error for unauthorized users

### 9. Performance Considerations

#### 9.1 Signature Optimization
- Compress signature images to optimize S3 storage costs
- Implement progressive upload with retry logic
- Cache signature canvas state during form interactions

#### 9.2 Database Performance  
- Index on `appointment_id` for fast visit lookups
- Index on `account_id` for multi-tenant query optimization
- Soft delete pattern maintains data integrity

#### 9.3 Mobile Performance
- Optimize signature canvas for touch devices
- Implement proper viewport scaling
- Minimize bundle size for mobile users

### 10. Security Implementation

#### 10.1 Authentication & Authorization
- Verify user session before visit creation
- Validate appointment ownership within current account
- Enforce RBAC permissions for visit operations

#### 10.2 Data Validation
- Sanitize signature data URLs before S3 upload
- Validate appointment exists and is active
- Prevent duplicate visit creation

#### 10.3 S3 Security
- Generate signed URLs with limited expiration
- Store signatures in account-specific S3 folders
- Implement proper CORS headers for signature uploads

### 11. Rollback Strategy

#### 11.1 Database Rollback
```sql
-- Emergency rollback script
DROP TABLE IF EXISTS visits;
```

#### 11.2 Code Rollback
- Remove signature-canvas dependency
- Revert calendar event panel button addition
- Remove visit route and components

#### 11.3 Operational Rollback
- Monitor S3 signature upload costs
- Track database query performance on visits table
- Measure mobile signature capture success rates

### 12. Success Metrics

#### 12.1 Functional Success
- 95%+ signature capture success rate on mobile devices
- <2 second load time for visit form
- Zero data loss during signature upload process

#### 12.2 User Adoption
- 80%+ of calendar appointments with type "Visita" result in visit creation
- <10% form abandonment rate after signature capture begins
- Positive user feedback on mobile signature experience

#### 12.3 Technical Performance
- Visit creation completes within 5 seconds end-to-end
- S3 signature storage remains under budget projections
- Database queries maintain <100ms response times

---

**Implementation Priority Order:**
1. Database schema and migrations
2. Signature pad component and S3 integration
3. Visit form and server actions
4. Main visit page and routing
5. Calendar integration point
6. API routes and error handling
7. Testing and validation
8. Performance optimization

**Estimated Timeline:** 3-4 sprints (16-20 hours total effort)