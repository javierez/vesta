"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserAccountId, getCurrentUser } from "~/lib/dal";
import {
  createAppointment,
  updateAppointment,
  // getUserAppointments, // Unused - keeping for future use
  // getAppointmentsByDateRange, // Unused - keeping for future use
  getAgentsForFilter,
  getUserAppointmentsSecure,
  getAppointmentsByDateRangeSecure,
} from "~/server/queries/appointment";
import {
  findOrCreateLeadForAppointment,
} from "~/server/queries/lead-status-sync";
import { syncToGoogle } from "~/lib/google-calendar-sync";

// Form data structure from PRP
interface AppointmentFormData {
  contactId: bigint;
  listingId?: bigint;
  listingContactId?: bigint;
  dealId?: bigint;
  prospectId?: bigint;
  startDate: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endDate: string; // YYYY-MM-DD format
  endTime: string; // HH:mm format
  tripTimeMinutes?: number;
  notes?: string;
  appointmentType: "Visita" | "Reunión" | "Firma" | "Cierre" | "Viaje";
}

// Server action for appointment update
export async function updateAppointmentAction(
  appointmentId: bigint,
  formData: AppointmentFormData,
) {
  try {
    // PATTERN: Always get account ID for security
    await getCurrentUserAccountId();
    const currentUser = await getCurrentUser();

    // CRITICAL: Convert form data to database format
    const appointmentData = {
      userId: currentUser.id, // String for BetterAuth
      contactId: BigInt(formData.contactId),
      listingId: formData.listingId ? BigInt(formData.listingId) : undefined,
      listingContactId: formData.listingContactId ? BigInt(formData.listingContactId) : undefined,
      dealId: formData.dealId ? BigInt(formData.dealId) : undefined,
      prospectId: formData.prospectId ? BigInt(formData.prospectId) : undefined,
      datetimeStart: new Date(`${formData.startDate}T${formData.startTime}`),
      datetimeEnd: new Date(`${formData.endDate}T${formData.endTime}`),
      tripTimeMinutes: formData.tripTimeMinutes,
      status: "Scheduled" as const,
      notes: formData.notes,
      type: formData.appointmentType,
      isActive: true,
    };

    // Validate appointment times
    if (appointmentData.datetimeStart >= appointmentData.datetimeEnd) {
      return {
        success: false,
        error: "La hora de fin debe ser posterior a la hora de inicio",
      };
    }

    // PATTERN: Use existing query function
    console.log(
      "Updating appointment with ID:",
      appointmentId,
      "and data:",
      appointmentData,
    );
    const result = await updateAppointment(
      Number(appointmentId),
      appointmentData,
    );
    console.log("Update result:", result);

    if (!result) {
      return {
        success: false,
        error: "Error al actualizar la cita",
      };
    }

    // NEW: Sync to Google Calendar after successful appointment update
    try {
      await syncToGoogle(currentUser.id, appointmentId, "update");
    } catch (error) {
      console.error(
        "Failed to sync appointment update to Google Calendar:",
        error,
      );
      // Don't fail the appointment update if Google Calendar sync fails
    }

    // Refresh calendar data
    revalidatePath("/calendario");

    return {
      success: true,
      appointmentId: result.appointmentId,
    };
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al actualizar la cita",
    };
  }
}

// Server action for appointment creation
export async function createAppointmentAction(formData: AppointmentFormData) {
  try {
    // PATTERN: Always get account ID for security
    await getCurrentUserAccountId();
    const currentUser = await getCurrentUser();

    // CRITICAL: Convert form data to database format
    const appointmentData = {
      userId: currentUser.id, // String for BetterAuth
      contactId: BigInt(formData.contactId),
      listingId: formData.listingId ? BigInt(formData.listingId) : undefined,
      listingContactId: formData.listingContactId ? BigInt(formData.listingContactId) : undefined,
      dealId: formData.dealId ? BigInt(formData.dealId) : undefined,
      prospectId: formData.prospectId ? BigInt(formData.prospectId) : undefined,
      datetimeStart: new Date(`${formData.startDate}T${formData.startTime}`),
      datetimeEnd: new Date(`${formData.endDate}T${formData.endTime}`),
      tripTimeMinutes: formData.tripTimeMinutes,
      status: "Scheduled" as const,
      notes: formData.notes,
      type: formData.appointmentType,
      isActive: true,
    };

    // Validate appointment times
    if (appointmentData.datetimeStart >= appointmentData.datetimeEnd) {
      return {
        success: false,
        error: "La hora de fin debe ser posterior a la hora de inicio",
      };
    }

    // NEW: Auto-create lead if missing and we have required data
    if (!appointmentData.listingContactId && appointmentData.contactId) {
      try {
        const { listingContactId: autoCreatedListingContactId, created } =
          await findOrCreateLeadForAppointment(
            appointmentData.contactId,
            appointmentData.listingId,
            appointmentData.prospectId,
          );
        appointmentData.listingContactId = autoCreatedListingContactId;

        console.log("🎯 Lead auto-creation result:", {
          listingContactId: autoCreatedListingContactId.toString(),
          created,
          contactId: appointmentData.contactId.toString(),
          listingId: appointmentData.listingId?.toString(),
        });
      } catch (error) {
        console.error("Failed to auto-create lead for appointment:", error);
        // Don't fail the appointment creation if lead creation fails
        // This ensures appointment creation is resilient
      }
    }

    // PATTERN: Use existing query function
    console.log("📝 Creating appointment with data:", {
      ...appointmentData,
      listingId: appointmentData.listingId?.toString(),
      contactId: appointmentData.contactId?.toString(),
      formDataListingId: formData.listingId?.toString(),
    });

    const result = await createAppointment(appointmentData);

    console.log("📋 Created appointment result:", {
      success: !!result,
      appointmentId: result?.appointmentId?.toString(),
      listingId: result?.listingId?.toString(),
    });

    if (!result) {
      return {
        success: false,
        error: "Error al crear la cita",
      };
    }

    // Lead status is already set to "Cita Pendiente" during creation
    // No need to update it again

    // NEW: Sync to Google Calendar after successful appointment creation
    try {
      await syncToGoogle(currentUser.id, result.appointmentId, "create");
    } catch (error) {
      console.error("Failed to sync appointment to Google Calendar:", error);
      // Don't fail the appointment creation if Google Calendar sync fails
    }

    // Refresh calendar data
    revalidatePath("/calendario");

    return {
      success: true,
      appointmentId: result.appointmentId,
    };
  } catch (error) {
    console.error("Failed to create appointment:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al crear la cita",
    };
  }
}

// Server action to get user appointments for calendar
export async function getUserAppointmentsAction() {
  try {
    // PATTERN: Always get account ID for security
    await getCurrentUserAccountId();
    const currentUser = await getCurrentUser();

    const appointments = await getUserAppointmentsSecure(currentUser.id);

    return {
      success: true,
      appointments,
    };
  } catch (error) {
    console.error("Failed to fetch user appointments:", error);
    return {
      success: false,
      error: "Error al obtener las citas",
      appointments: [],
    };
  }
}

// Server action to get appointments by date range
export async function getAppointmentsByDateRangeAction(
  startDate: Date,
  endDate: Date,
) {
  try {
    // PATTERN: Always get account ID for security
    await getCurrentUserAccountId();

    const appointments = await getAppointmentsByDateRangeSecure(
      startDate,
      endDate,
    );

    return {
      success: true,
      appointments,
    };
  } catch (error) {
    console.error("Failed to fetch appointments by date range:", error);
    return {
      success: false,
      error: "Error al obtener las citas por rango de fechas",
      appointments: [],
    };
  }
}

// Validate appointment form data
export async function validateAppointmentForm(
  formData: Partial<AppointmentFormData>,
): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  if (!formData.contactId) {
    errors.push("Debe seleccionar un contacto");
  }

  if (!formData.startDate) {
    errors.push("Debe seleccionar una fecha de inicio");
  }

  if (!formData.startTime) {
    errors.push("Debe seleccionar una hora de inicio");
  }

  if (!formData.endTime) {
    errors.push("Debe seleccionar una hora de fin");
  }

  if (!formData.appointmentType) {
    errors.push("Debe seleccionar un tipo de cita");
  }

  // Validate time logic
  if (
    formData.startDate &&
    formData.endDate &&
    formData.startTime &&
    formData.endTime
  ) {
    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime}`,
    );
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (startDateTime >= endDateTime) {
      errors.push("La hora de fin debe ser posterior a la hora de inicio");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Server action to get agents for filtering
export async function getAgentsForFilterAction() {
  try {
    // PATTERN: Always get account ID for security
    await getCurrentUserAccountId();

    const agents = await getAgentsForFilter();

    return {
      success: true,
      agents,
    };
  } catch (error) {
    console.error("Failed to fetch agents for filter:", error);
    return {
      success: false,
      error: "Error al obtener los agentes",
      agents: [],
    };
  }
}
