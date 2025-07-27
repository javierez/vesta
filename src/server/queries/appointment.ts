import { db } from "../db";
import { appointments } from "../db/schema";
import { eq, and, or, between } from "drizzle-orm";
import type { Appointment } from "../../lib/data";

// Create a new appointment
export async function createAppointment(
  data: Omit<Appointment, "appointmentId" | "createdAt" | "updatedAt">,
) {
  try {
    const [result] = await db
      .insert(appointments)
      .values({
        ...data,
        isActive: true,
      })
      .$returningId();
    if (!result) throw new Error("Failed to create appointment");
    const [newAppointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointmentId, BigInt(result.appointmentId)));
    return newAppointment;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}

// Get appointment by ID
export async function getAppointmentById(appointmentId: number) {
  try {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.appointmentId, BigInt(appointmentId)),
          eq(appointments.isActive, true),
        ),
      );
    return appointment;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw error;
  }
}

// Get appointments by user ID
export async function getUserAppointments(userId: number) {
  try {
    const userAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.userId, BigInt(userId)),
          eq(appointments.isActive, true),
        ),
      );
    return userAppointments;
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw error;
  }
}

// Get appointments by contact ID
export async function getContactAppointments(contactId: number) {
  try {
    const contactAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.contactId, BigInt(contactId)),
          eq(appointments.isActive, true),
        ),
      );
    return contactAppointments;
  } catch (error) {
    console.error("Error fetching contact appointments:", error);
    throw error;
  }
}

// Get appointments by listing ID
export async function getListingAppointments(listingId: number) {
  try {
    const listingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.listingId, BigInt(listingId)),
          eq(appointments.isActive, true),
        ),
      );
    return listingAppointments;
  } catch (error) {
    console.error("Error fetching listing appointments:", error);
    throw error;
  }
}

// Get appointments by date range
export async function getAppointmentsByDateRange(
  startDate: Date,
  endDate: Date,
) {
  try {
    const dateRangeAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          or(
            between(appointments.datetimeStart, startDate, endDate),
            between(appointments.datetimeEnd, startDate, endDate),
          ),
          eq(appointments.isActive, true),
        ),
      );
    return dateRangeAppointments;
  } catch (error) {
    console.error("Error fetching appointments by date range:", error);
    throw error;
  }
}

// Get appointments by status
export async function getAppointmentsByStatus(status: Appointment["status"]) {
  try {
    const statusAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(eq(appointments.status, status), eq(appointments.isActive, true)),
      );
    return statusAppointments;
  } catch (error) {
    console.error("Error fetching appointments by status:", error);
    throw error;
  }
}

// Update appointment
export async function updateAppointment(
  appointmentId: number,
  data: Omit<Partial<Appointment>, "appointmentId" | "createdAt" | "updatedAt">,
) {
  try {
    await db
      .update(appointments)
      .set(data)
      .where(
        and(
          eq(appointments.appointmentId, BigInt(appointmentId)),
          eq(appointments.isActive, true),
        ),
      );
    const [updatedAppointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.appointmentId, BigInt(appointmentId)));
    return updatedAppointment;
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
}

// Soft delete appointment (set isActive to false)
export async function softDeleteAppointment(appointmentId: number) {
  try {
    await db
      .update(appointments)
      .set({ isActive: false })
      .where(eq(appointments.appointmentId, BigInt(appointmentId)));
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting appointment:", error);
    throw error;
  }
}

// Hard delete appointment (remove from database)
export async function deleteAppointment(appointmentId: number) {
  try {
    await db
      .delete(appointments)
      .where(eq(appointments.appointmentId, BigInt(appointmentId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
}

// List all appointments (with pagination)
export async function listAppointments(
  page = 1,
  limit = 10,
  includeInactive = false,
) {
  try {
    const offset = (page - 1) * limit;
    const query = db.select().from(appointments).limit(limit).offset(offset);

    if (!includeInactive) {
      query.where(eq(appointments.isActive, true));
    }

    const allAppointments = await query;
    return allAppointments;
  } catch (error) {
    console.error("Error listing appointments:", error);
    throw error;
  }
}
