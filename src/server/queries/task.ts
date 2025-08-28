"use server";

import { db } from "../db";
import {
  tasks,
  contacts,
  prospects,
  leads,
  listings,
  properties,
  users,
} from "../db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import type { Task } from "../../lib/data";
import { getCurrentUserAccountId } from "../../lib/dal";

// Wrapper functions that automatically get accountId from current session
export async function createTaskWithAuth(
  data: Omit<Task, "taskId" | "createdAt" | "updatedAt">,
) {
  const accountId = await getCurrentUserAccountId();
  return createTask(data, accountId);
}

export async function getTaskByIdWithAuth(taskId: number) {
  const accountId = await getCurrentUserAccountId();
  return getTaskById(taskId, accountId);
}

export async function getUserTasksWithAuth(userId: string) {
  const accountId = await getCurrentUserAccountId();
  return getUserTasks(userId, accountId);
}

export async function getListingTasksWithAuth(listingId: number) {
  const accountId = await getCurrentUserAccountId();
  return getListingTasks(listingId, accountId);
}

export async function getLeadTasksWithAuth(leadId: number) {
  const accountId = await getCurrentUserAccountId();
  return getLeadTasks(leadId, accountId);
}

export async function getDealTasksWithAuth(dealId: number) {
  const accountId = await getCurrentUserAccountId();
  return getDealTasks(dealId, accountId);
}

export async function getAppointmentTasksWithAuth(appointmentId: number) {
  const accountId = await getCurrentUserAccountId();
  return getAppointmentTasks(appointmentId, accountId);
}

export async function updateTaskWithAuth(
  taskId: number,
  data: Omit<Partial<Task>, "taskId" | "createdAt" | "updatedAt">,
) {
  const accountId = await getCurrentUserAccountId();
  return updateTask(taskId, data, accountId);
}

export async function completeTaskWithAuth(taskId: number) {
  const accountId = await getCurrentUserAccountId();
  return completeTask(taskId, accountId);
}

export async function softDeleteTaskWithAuth(taskId: number) {
  const accountId = await getCurrentUserAccountId();
  return softDeleteTask(taskId, accountId);
}

export async function deleteTaskWithAuth(taskId: number) {
  const accountId = await getCurrentUserAccountId();
  return deleteTask(taskId, accountId);
}

export async function listTasksWithAuth(
  page = 1,
  limit = 10,
  filters?: Parameters<typeof listTasks>[3],
) {
  const accountId = await getCurrentUserAccountId();
  return listTasks(page, limit, accountId, filters);
}

// Create a new task
export async function createTask(
  data: Omit<Task, "taskId" | "createdAt" | "updatedAt">,
  accountId: number,
) {
  try {
    // Verify access based on the task's entity relationships
    if (data.prospectId) {
      const [prospect] = await db
        .select({ id: prospects.id })
        .from(prospects)
        .innerJoin(contacts, eq(prospects.contactId, contacts.contactId))
        .where(
          and(
            eq(prospects.id, data.prospectId),
            eq(contacts.accountId, BigInt(accountId)),
          ),
        );
      if (!prospect) throw new Error("Prospect not found or access denied");
    }

    if (data.leadId) {
      const [lead] = await db
        .select({ leadId: leads.leadId })
        .from(leads)
        .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
        .where(
          and(
            eq(leads.leadId, data.leadId),
            eq(contacts.accountId, BigInt(accountId)),
          ),
        );
      if (!lead) throw new Error("Lead not found or access denied");
    }

    if (data.listingId) {
      const [listing] = await db
        .select({ listingId: listings.listingId })
        .from(listings)
        .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
        .where(
          and(
            eq(listings.listingId, data.listingId),
            eq(properties.accountId, BigInt(accountId)),
          ),
        );
      if (!listing) throw new Error("Listing not found or access denied");
    }

    const [result] = await db
      .insert(tasks)
      .values({
        ...data,
        isActive: true,
      })
      .$returningId();
    if (!result) throw new Error("Failed to create task");
    const [newTask] = await db
      .select({
        taskId: sql<number>`CAST(${tasks.taskId} AS UNSIGNED)`,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        completed: tasks.completed,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        leadId: sql<number>`CAST(${tasks.leadId} AS UNSIGNED)`,
        dealId: sql<number>`CAST(${tasks.dealId} AS UNSIGNED)`,
        appointmentId: sql<number>`CAST(${tasks.appointmentId} AS UNSIGNED)`,
        prospectId: sql<number>`CAST(${tasks.prospectId} AS UNSIGNED)`,
        isActive: tasks.isActive,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .where(eq(tasks.taskId, BigInt(result.taskId)));
    return newTask;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

// Get task by ID
export async function getTaskById(taskId: number, accountId: number) {
  try {
    // Complex query to verify account access through various relationships
    const [task] = await db
      .select()
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, eq(prospects.contactId, contacts.contactId))
      .leftJoin(leads, eq(tasks.leadId, leads.leadId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          eq(tasks.isActive, true),
          or(
            // Task belongs to account through prospect->contact
            eq(contacts.accountId, BigInt(accountId)),
            // Task belongs to account through listing->property
            eq(properties.accountId, BigInt(accountId)),
          ),
        ),
      );
    return task;
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
}

// Get tasks by user ID
export async function getUserTasks(userId: string, accountId: number) {
  try {
    const userTasks = await db
      .select()
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, eq(prospects.contactId, contacts.contactId))
      .leftJoin(leads, eq(tasks.leadId, leads.leadId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.isActive, true),
          or(
            // Task belongs to account through prospect->contact
            eq(contacts.accountId, BigInt(accountId)),
            // Task belongs to account through listing->property
            eq(properties.accountId, BigInt(accountId)),
          ),
        ),
      );
    return userTasks;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    throw error;
  }
}

// Get tasks by listing ID
export async function getListingTasks(listingId: number, accountId: number) {
  try {
    const listingTasks = await db
      .select({
        // Task fields - convert BigInt to number for JSON serialization
        taskId: sql<number>`CAST(${tasks.taskId} AS UNSIGNED)`,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        completed: tasks.completed,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        leadId: sql<number>`CAST(${tasks.leadId} AS UNSIGNED)`,
        dealId: sql<number>`CAST(${tasks.dealId} AS UNSIGNED)`,
        appointmentId: sql<number>`CAST(${tasks.appointmentId} AS UNSIGNED)`,
        prospectId: sql<number>`CAST(${tasks.prospectId} AS UNSIGNED)`,
        isActive: tasks.isActive,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        // User fields for "Asignado a"
        userName: users.name,
        userFirstName: users.firstName,
        userLastName: users.lastName,
      })
      .from(tasks)
      .innerJoin(listings, eq(tasks.listingId, listings.listingId))
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .innerJoin(users, eq(tasks.userId, users.id))
      .where(
        and(
          eq(tasks.listingId, BigInt(listingId)),
          eq(tasks.isActive, true),
          eq(properties.accountId, BigInt(accountId)),
        ),
      )
      .orderBy(tasks.createdAt);
    return listingTasks;
  } catch (error) {
    console.error("Error fetching listing tasks:", error);
    throw error;
  }
}

// Get tasks by lead ID
export async function getLeadTasks(leadId: number, accountId: number) {
  try {
    const leadTasks = await db
      .select()
      .from(tasks)
      .innerJoin(leads, eq(tasks.leadId, leads.leadId))
      .innerJoin(contacts, eq(leads.contactId, contacts.contactId))
      .where(
        and(
          eq(tasks.leadId, BigInt(leadId)),
          eq(tasks.isActive, true),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );
    return leadTasks;
  } catch (error) {
    console.error("Error fetching lead tasks:", error);
    throw error;
  }
}

// Get tasks by deal ID
export async function getDealTasks(dealId: number, _accountId: number) {
  try {
    // Note: deals don't have direct account relationship, need to go through listing->property
    const dealTasks = await db
      .select()
      .from(tasks)
      // This would need the deals table to be imported and joined properly
      // For now, returning empty array to prevent unauthorized access
      .where(
        and(
          eq(tasks.dealId, BigInt(dealId)),
          eq(tasks.isActive, true),
          eq(tasks.taskId, BigInt(-1)),
        ),
      );
    return dealTasks;
  } catch (error) {
    console.error("Error fetching deal tasks:", error);
    throw error;
  }
}

// Get tasks by appointment ID
export async function getAppointmentTasks(
  appointmentId: number,
  _accountId: number,
) {
  try {
    // Note: appointments don't have direct account relationship, need proper schema
    // For now, returning empty array to prevent unauthorized access
    const appointmentTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.appointmentId, BigInt(appointmentId)),
          eq(tasks.isActive, true),
          eq(tasks.taskId, BigInt(-1)), // This will never match, preventing access
        ),
      );
    return appointmentTasks;
  } catch (error) {
    console.error("Error fetching appointment tasks:", error);
    throw error;
  }
}

// Update task
export async function updateTask(
  taskId: number,
  data: Omit<Partial<Task>, "taskId" | "createdAt" | "updatedAt">,
  accountId: number,
) {
  try {
    // First verify the task belongs to this account
    const [existingTask] = await db
      .select({ taskId: tasks.taskId })
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, eq(prospects.contactId, contacts.contactId))
      .leftJoin(leads, eq(tasks.leadId, leads.leadId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          eq(tasks.isActive, true),
          or(
            eq(contacts.accountId, BigInt(accountId)),
            eq(properties.accountId, BigInt(accountId)),
          ),
        ),
      );

    if (!existingTask) {
      throw new Error("Task not found or access denied");
    }

    await db
      .update(tasks)
      .set(data)
      .where(and(eq(tasks.taskId, BigInt(taskId)), eq(tasks.isActive, true)));
    const [updatedTask] = await db
      .select({
        taskId: sql<number>`CAST(${tasks.taskId} AS UNSIGNED)`,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        completed: tasks.completed,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        leadId: sql<number>`CAST(${tasks.leadId} AS UNSIGNED)`,
        dealId: sql<number>`CAST(${tasks.dealId} AS UNSIGNED)`,
        appointmentId: sql<number>`CAST(${tasks.appointmentId} AS UNSIGNED)`,
        prospectId: sql<number>`CAST(${tasks.prospectId} AS UNSIGNED)`,
        isActive: tasks.isActive,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .where(eq(tasks.taskId, BigInt(taskId)));
    return updatedTask;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

// Mark task as completed
export async function completeTask(taskId: number, accountId: number) {
  try {
    // First verify the task belongs to this account
    const [existingTask] = await db
      .select({ taskId: tasks.taskId })
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, eq(prospects.contactId, contacts.contactId))
      .leftJoin(leads, eq(tasks.leadId, leads.leadId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          eq(tasks.isActive, true),
          or(
            eq(contacts.accountId, BigInt(accountId)),
            eq(properties.accountId, BigInt(accountId)),
          ),
        ),
      );

    if (!existingTask) {
      throw new Error("Task not found or access denied");
    }

    await db
      .update(tasks)
      .set({ completed: true })
      .where(and(eq(tasks.taskId, BigInt(taskId)), eq(tasks.isActive, true)));
    const [updatedTask] = await db
      .select({
        taskId: sql<number>`CAST(${tasks.taskId} AS UNSIGNED)`,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        completed: tasks.completed,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        leadId: sql<number>`CAST(${tasks.leadId} AS UNSIGNED)`,
        dealId: sql<number>`CAST(${tasks.dealId} AS UNSIGNED)`,
        appointmentId: sql<number>`CAST(${tasks.appointmentId} AS UNSIGNED)`,
        prospectId: sql<number>`CAST(${tasks.prospectId} AS UNSIGNED)`,
        isActive: tasks.isActive,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .where(eq(tasks.taskId, BigInt(taskId)));
    return updatedTask;
  } catch (error) {
    console.error("Error completing task:", error);
    throw error;
  }
}

// Soft delete task (set isActive to false)
export async function softDeleteTask(taskId: number, accountId: number) {
  try {
    // First verify the task belongs to this account
    const [existingTask] = await db
      .select({ taskId: tasks.taskId })
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, eq(prospects.contactId, contacts.contactId))
      .leftJoin(leads, eq(tasks.leadId, leads.leadId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          or(
            eq(contacts.accountId, BigInt(accountId)),
            eq(properties.accountId, BigInt(accountId)),
          ),
        ),
      );

    if (!existingTask) {
      throw new Error("Task not found or access denied");
    }

    await db
      .update(tasks)
      .set({ isActive: false })
      .where(eq(tasks.taskId, BigInt(taskId)));
    return { success: true };
  } catch (error) {
    console.error("Error soft deleting task:", error);
    throw error;
  }
}

// Hard delete task (remove from database)
export async function deleteTask(taskId: number, accountId: number) {
  try {
    // First verify the task belongs to this account
    const [existingTask] = await db
      .select({ taskId: tasks.taskId })
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, eq(prospects.contactId, contacts.contactId))
      .leftJoin(leads, eq(tasks.leadId, leads.leadId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          or(
            eq(contacts.accountId, BigInt(accountId)),
            eq(properties.accountId, BigInt(accountId)),
          ),
        ),
      );

    if (!existingTask) {
      throw new Error("Task not found or access denied");
    }

    await db.delete(tasks).where(eq(tasks.taskId, BigInt(taskId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

// List all tasks (with pagination and optional filters)
export async function listTasks(
  page = 1,
  limit = 10,
  accountId: number,
  filters?: {
    userId?: string; // Changed to string for BetterAuth compatibility
    completed?: boolean;
    isActive?: boolean;
  },
) {
  try {
    const offset = (page - 1) * limit;

    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.userId) {
        whereConditions.push(eq(tasks.userId, filters.userId)); // userId is now string
      }
      if (filters.completed !== undefined) {
        whereConditions.push(eq(tasks.completed, filters.completed));
      }
      if (filters.isActive !== undefined) {
        whereConditions.push(eq(tasks.isActive, filters.isActive));
      }
    } else {
      // By default, only show active tasks
      whereConditions.push(eq(tasks.isActive, true));
    }

    // Always filter by account through relationships
    whereConditions.push(
      or(
        eq(contacts.accountId, BigInt(accountId)),
        eq(properties.accountId, BigInt(accountId)),
      ),
    );

    // Create the query with proper joins for account filtering
    const allTasks = await db
      .select()
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, eq(prospects.contactId, contacts.contactId))
      .leftJoin(leads, eq(tasks.leadId, leads.leadId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(limit)
      .offset(offset);

    return allTasks;
  } catch (error) {
    console.error("Error listing tasks:", error);
    throw error;
  }
}
