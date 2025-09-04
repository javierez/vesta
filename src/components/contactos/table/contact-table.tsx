"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
import { Nombre } from "../table-components/list-elements/nombre";
import { Contacto } from "../table-components/list-elements/contacto";
import { Propiedades } from "../table-components/list-elements/propiedades";
import { Recordatorios } from "../table-components/list-elements/recordatorios";

// Default column widths (in pixels)
const DEFAULT_COLUMN_WIDTHS = {
  nombre: 160,
  contacto: 160,
  propiedades: 160,
  recordatorios: 160,
} as const;

// Minimum column widths
const MIN_COLUMN_WIDTHS = {
  nombre: 80,
  contacto: 80,
  propiedades: 100,
  recordatorios: 100,
} as const;

// Extended Contact type
interface ExtendedContact {
  contactId: bigint;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  ownerCount?: number;
  buyerCount?: number;
  prospectCount?: number;
  isOwner?: boolean;
  isBuyer?: boolean;
  isInteresado?: boolean;
  additionalInfo?: {
    demandType?: string;
    propertiesCount?: number;
    propertyTypes?: string[];
    budget?: number;
    location?: string;
    notes?: string;
  };
  lastContact?: Date;
  createdAt: Date;
  updatedAt: Date;
  prospectTitles?: string[];
  allListings?: Array<{
    listingId: bigint;
    contactType: string;
    street?: string;
    city?: string;
    propertyType?: string;
    listingType?: string;
    status?: string;
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate?: Date;
  }>;
}

interface ContactSpreadsheetTableProps {
  contacts: ExtendedContact[];
  currentFilter?: string[];
}

export function ContactSpreadsheetTable({
  contacts,
  currentFilter = [],
}: ContactSpreadsheetTableProps) {
  const router = useRouter();
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);

  // Sort contacts alphabetically
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
      const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
      return aName.localeCompare(bName);
    });
  }, [contacts]);

  const handleResizeStart = useCallback(
    (column: string, e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(column);
      resizeStartRef.current = {
        x: e.clientX,
        width: columnWidths[column as keyof typeof columnWidths],
      };
    },
    [columnWidths],
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeStartRef.current) return;

      const deltaX = e.clientX - resizeStartRef.current.x;
      const newWidth = Math.max(
        MIN_COLUMN_WIDTHS[isResizing as keyof typeof MIN_COLUMN_WIDTHS],
        resizeStartRef.current.width + deltaX,
      );

      setColumnWidths((prev) => ({
        ...prev,
        [isResizing]: newWidth,
      }));
    },
    [isResizing],
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(null);
    resizeStartRef.current = null;
  }, []);

  // Global mouse events for resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const getColumnStyle = (column: keyof typeof columnWidths) => ({
    width: `${columnWidths[column]}px`,
    minWidth: `${columnWidths[column]}px`,
    maxWidth: `${columnWidths[column]}px`,
  });

  const ResizeHandle = ({ column }: { column: string }) => (
    <div
      className={cn(
        "absolute right-0 top-0 h-full w-1 cursor-col-resize opacity-0 transition-colors hover:bg-primary/50 hover:opacity-100",
        isResizing === column && "bg-primary opacity-100",
      )}
      onMouseDown={(e) => handleResizeStart(column, e)}
    />
  );

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table ref={tableRef}>
          <TableHeader>
            <TableRow>
              <TableHead className="relative" style={getColumnStyle("nombre")}>
                <div className="truncate">Nombre</div>
                <ResizeHandle column="nombre" />
              </TableHead>
              <TableHead
                className="relative"
                style={getColumnStyle("contacto")}
              >
                <div className="truncate">Contacto</div>
                <ResizeHandle column="contacto" />
              </TableHead>
              <TableHead
                className="relative"
                style={getColumnStyle("propiedades")}
              >
                <div className="truncate">
                  {currentFilter.includes("buyer") ||
                  currentFilter.includes("interested")
                    ? "Demandas"
                    : "Propiedades"}
                </div>
                <ResizeHandle column="propiedades" />
              </TableHead>
              <TableHead
                className="relative"
                style={getColumnStyle("recordatorios")}
              >
                <div className="truncate">Recordatorios</div>
                <ResizeHandle column="recordatorios" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContacts.map((contact) => (
              <TableRow
                key={contact.contactId.toString()}
                className={cn(
                  "cursor-pointer transition-colors",
                  contact.isActive
                    ? "hover:bg-muted/50"
                    : "opacity-60 hover:bg-gray-100/50",
                )}
                onClick={() => router.push(`/contactos/${contact.contactId}`)}
              >
                <TableCell
                  className="overflow-hidden"
                  style={getColumnStyle("nombre")}
                >
                  <div className="truncate">
                    <Nombre
                      firstName={contact.firstName}
                      lastName={contact.lastName}
                      isActive={contact.isActive}
                      lastContact={contact.lastContact}
                      updatedAt={contact.updatedAt}
                      isOwner={contact.isOwner}
                      isBuyer={contact.isBuyer}
                      isInteresado={contact.isInteresado}
                      notes={contact.additionalInfo?.notes}
                    />
                  </div>
                </TableCell>

                <TableCell
                  className="overflow-hidden"
                  style={getColumnStyle("contacto")}
                >
                  <div className="truncate">
                    <Contacto
                      email={contact.email}
                      phone={contact.phone}
                      isActive={contact.isActive}
                      contactId={contact.contactId}
                    />
                  </div>
                </TableCell>

                <TableCell
                  className="overflow-hidden"
                  style={getColumnStyle("propiedades")}
                >
                  <div className="truncate">
                    <Propiedades
                      isActive={contact.isActive}
                      allListings={contact.allListings}
                      currentFilter={currentFilter}
                      prospectTitles={contact.prospectTitles}
                    />
                  </div>
                </TableCell>

                <TableCell
                  className="overflow-hidden"
                  style={getColumnStyle("recordatorios")}
                >
                  <div className="truncate">
                    <Recordatorios isActive={contact.isActive} tasks={contact.tasks} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
