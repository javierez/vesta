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
