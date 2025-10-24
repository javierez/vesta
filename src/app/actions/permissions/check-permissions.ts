"use server";

import { getUserPermissionsForCurrentUser } from "~/lib/dal";
import type { PermissionsObject } from "~/lib/auth";

/**
 * Server action to get current user's permissions
 * Can be called from client components
 */
export async function getCurrentUserPermissionsAction(): Promise<PermissionsObject> {
  try {
    const permissions = await getUserPermissionsForCurrentUser();
    return permissions as PermissionsObject;
  } catch (error) {
    console.error("Error fetching permissions in server action:", error);
    return {};
  }
}

/**
 * Check if user can delete properties
 */
export async function canDeleteProperties(): Promise<boolean> {
  try {
    const permissions = (await getUserPermissionsForCurrentUser()) as PermissionsObject;
    return Boolean(permissions.properties?.delete);
  } catch (error) {
    console.error("❌ Error checking delete permission:", error);
    return false;
  }
}

/**
 * Check if user can edit properties
 */
export async function canEditProperties(): Promise<boolean> {
  try {
    const permissions = (await getUserPermissionsForCurrentUser()) as PermissionsObject;
    return Boolean(permissions.properties?.edit);
  } catch (error) {
    console.error("❌ Error checking edit permission:", error);
    return false;
  }
}

/**
 * Check if user can edit all tasks
 */
export async function canEditAllTasks(): Promise<boolean> {
  try {
    const permissions = (await getUserPermissionsForCurrentUser()) as PermissionsObject;
    return Boolean(permissions.tasks?.editAll);
  } catch (error) {
    console.error("❌ Error checking edit all tasks permission:", error);
    return false;
  }
}

/**
 * Check if user can delete all tasks
 */
export async function canDeleteAllTasks(): Promise<boolean> {
  try {
    const permissions = (await getUserPermissionsForCurrentUser()) as PermissionsObject;
    return Boolean(permissions.tasks?.deleteAll);
  } catch (error) {
    console.error("❌ Error checking delete all tasks permission:", error);
    return false;
  }
}

/**
 * Check if user can edit calendar
 */
export async function canEditCalendar(): Promise<boolean> {
  try {
    const permissions = (await getUserPermissionsForCurrentUser()) as PermissionsObject;
    const canEdit = Boolean(permissions.calendar?.edit);
    console.log("🔐 [Server] canEditCalendar check:", {
      calendarPermissions: permissions.calendar,
      canEdit,
    });
    return canEdit;
  } catch (error) {
    console.error("❌ [Server] Error checking edit calendar permission:", error);
    return false;
  }
}

/**
 * Check if user can delete calendar
 */
export async function canDeleteCalendar(): Promise<boolean> {
  try {
    const permissions = (await getUserPermissionsForCurrentUser()) as PermissionsObject;
    const canDelete = Boolean(permissions.calendar?.delete);
    console.log("🔐 [Server] canDeleteCalendar check:", {
      calendarPermissions: permissions.calendar,
      canDelete,
    });
    return canDelete;
  } catch (error) {
    console.error("❌ [Server] Error checking delete calendar permission:", error);
    return false;
  }
}

/**
 * Check if user can edit contacts
 */
export async function canEditContacts(): Promise<boolean> {
  try {
    const permissions = (await getUserPermissionsForCurrentUser()) as PermissionsObject;
    return Boolean(permissions.contacts?.edit);
  } catch (error) {
    console.error("❌ Error checking edit contacts permission:", error);
    return false;
  }
}

/**
 * Check if user can delete contacts
 */
export async function canDeleteContacts(): Promise<boolean> {
  try {
    const permissions = (await getUserPermissionsForCurrentUser()) as PermissionsObject;
    return Boolean(permissions.contacts?.delete);
  } catch (error) {
    console.error("❌ Error checking delete contacts permission:", error);
    return false;
  }
}
