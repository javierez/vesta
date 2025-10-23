"use server";

import { db } from "../db";
import {
  tasks,
  contacts,
  prospects,
  listingContacts,
  listings,
  properties,
  users,
} from "../db/schema";
import { eq, and, or, sql, isNotNull, asc, lte } from "drizzle-orm";
import type { Task } from "../../lib/data";
import { getCurrentUserAccountId, getSecureSession } from "../../lib/dal";

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

export async function getLeadTasksWithAuth(listingContactId: number) {
  const accountId = await getCurrentUserAccountId();
  return getLeadTasks(listingContactId, accountId);
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
  const session = await getSecureSession();
  const userId = session?.user?.id;
  return updateTask(taskId, data, accountId, userId);
}

export async function updateContactTaskWithAuth(
  taskId: number,
  data: Omit<Partial<Task>, "taskId" | "createdAt" | "updatedAt">,
) {
  const accountId = await getCurrentUserAccountId();
  return updateContactTask(taskId, data, accountId);
}

export async function updateListingTaskWithAuth(
  taskId: number,
  data: Omit<Partial<Task>, "taskId" | "createdAt" | "updatedAt">,
) {
  const accountId = await getCurrentUserAccountId();
  const session = await getSecureSession();
  const userId = session?.user?.id;
  return updateListingTask(taskId, data, accountId, userId);
}

export async function completeTaskWithAuth(taskId: number) {
  const accountId = await getCurrentUserAccountId();
  const session = await getSecureSession();
  const userId = session?.user?.id;
  return completeTask(taskId, accountId, userId);
}

export async function softDeleteTaskWithAuth(taskId: number) {
  const accountId = await getCurrentUserAccountId();
  return softDeleteTask(taskId, accountId);
}

export async function deleteTaskWithAuth(taskId: number) {
  const accountId = await getCurrentUserAccountId();
  return deleteTask(taskId, accountId);
}

export async function deleteContactTaskWithAuth(taskId: number) {
  const accountId = await getCurrentUserAccountId();
  return deleteContactTask(taskId, accountId);
}

export async function deleteListingTaskWithAuth(taskId: number) {
  const accountId = await getCurrentUserAccountId();
  return deleteListingTask(taskId, accountId);
}

export async function listTasksWithAuth(
  page = 1,
  limit = 10,
  filters?: Parameters<typeof listTasks>[3],
) {
  const accountId = await getCurrentUserAccountId();
  return listTasks(page, limit, accountId, filters);
}

export async function getMostUrgentTasksWithAuth(limit = 10, daysAhead = 30) {
  const accountId = await getCurrentUserAccountId();
  return getMostUrgentTasks(accountId, limit, daysAhead);
}

export async function createAppointmentTaskWithAuth(
  contactId: bigint,
  contactName: string,
  notes?: string,
  selectedListingsCount = 0
) {
  try {
    // Get current user for task assignment
    const accountId = await getCurrentUserAccountId();
    
    // We need to get the current user's ID, but we need to fetch it from the database
    // Let's use the session to get the user ID directly
    const session = await getSecureSession();
    if (!session?.user?.id) {
      throw new Error("No authenticated user found");
    }
    
    // Calculate due date (3 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    
    // Prepare task description
    let description = `Configurar cita para mostrar propiedades a ${contactName}`;
    
    if (selectedListingsCount > 0) {
      description += `\n\nPropiedades de interés: ${selectedListingsCount} propiedades seleccionadas`;
    }
    
    if (notes?.trim()) {
      description += `\n\nNotas del contacto: ${notes.trim()}`;
    }
    
    // Create the task using the existing createTask function
    const taskData = {
      userId: session.user.id,
      title: "Configurar cita para ver propiedades",
      description,
      dueDate,
      completed: false,
      contactId,
      isActive: true,
    };
    
    const newTask = await createTask(taskData, accountId);
    return newTask;
  } catch (error) {
    console.error("Error creating appointment task:", error);
    throw error;
  }
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

    if (data.listingContactId) {
      const [lead] = await db
        .select({ listingContactId: listingContacts.listingContactId })
        .from(listingContacts)
        .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
        .where(
          and(
            eq(listingContacts.listingContactId, data.listingContactId),
            eq(contacts.accountId, BigInt(accountId)),
          ),
        );
      if (!lead) throw new Error("Listing contact not found or access denied");
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

    if (data.contactId) {
      const [contact] = await db
        .select({ contactId: contacts.contactId })
        .from(contacts)
        .where(
          and(
            eq(contacts.contactId, data.contactId),
            eq(contacts.accountId, BigInt(accountId)),
          ),
        );
      if (!contact) throw new Error("Contact not found or access denied");
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
        dueTime: tasks.dueTime,
        completed: tasks.completed,
        createdBy: tasks.createdBy,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        listingContactId: sql<number>`CAST(${tasks.listingContactId} AS UNSIGNED)`,
        dealId: sql<number>`CAST(${tasks.dealId} AS UNSIGNED)`,
        appointmentId: sql<number>`CAST(${tasks.appointmentId} AS UNSIGNED)`,
        prospectId: sql<number>`CAST(${tasks.prospectId} AS UNSIGNED)`,
        contactId: sql<number>`CAST(${tasks.contactId} AS UNSIGNED)`,
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
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
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
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
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
        dueTime: tasks.dueTime,
        completed: tasks.completed,
        createdBy: tasks.createdBy,
        completedBy: tasks.completedBy,
        editedBy: tasks.editedBy,
        category: tasks.category,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        listingContactId: sql<number>`CAST(${tasks.listingContactId} AS UNSIGNED)`,
        dealId: sql<number>`CAST(${tasks.dealId} AS UNSIGNED)`,
        appointmentId: sql<number>`CAST(${tasks.appointmentId} AS UNSIGNED)`,
        prospectId: sql<number>`CAST(${tasks.prospectId} AS UNSIGNED)`,
        contactId: sql<number>`CAST(${tasks.contactId} AS UNSIGNED)`,
        isActive: tasks.isActive,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        // User fields for "Asignado a"
        userName: users.name,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        // Contact fields for related contact display
        contactFirstName: contacts.firstName,
        contactLastName: contacts.lastName,
        contactEmail: contacts.email,
      })
      .from(tasks)
      .innerJoin(listings, eq(tasks.listingId, listings.listingId))
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .innerJoin(users, eq(tasks.userId, users.id))
      .leftJoin(contacts, eq(tasks.contactId, contacts.contactId))
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
export async function getLeadTasks(listingContactId: number, accountId: number) {
  try {
    const leadTasks = await db
      .select()
      .from(tasks)
      .innerJoin(listingContacts, and(
        eq(tasks.listingContactId, listingContacts.listingContactId),
        eq(listingContacts.contactType, "buyer")
      ))
      .innerJoin(contacts, eq(listingContacts.contactId, contacts.contactId))
      .where(
        and(
          eq(tasks.listingContactId, BigInt(listingContactId)),
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
  accountId: number,
) {
  try {
    const appointmentTasks = await db
      .select()
      .from(tasks)
      .leftJoin(users, eq(tasks.userId, users.id))
      .where(
        and(
          eq(tasks.appointmentId, BigInt(appointmentId)),
          eq(tasks.isActive, true),
          eq(users.accountId, BigInt(accountId)),
        ),
      );

    // Transform to match expected Task interface
    return appointmentTasks.map(row => ({
      ...row.tasks,
      userName: row.users?.name,
      userFirstName: row.users?.firstName,
      userLastName: row.users?.lastName,
    }));
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
  editedBy?: string,
) {
  try {
    // First verify the task belongs to this account using JOINs instead of subqueries
    const [existingTask] = await db
      .select({
        taskId: tasks.taskId,
        title: tasks.title,
        completed: tasks.completed
      })
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
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

    // Prepare update data with editedBy
    const updateData = {
      ...data,
      editedBy: editedBy ?? null
    };

    await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.taskId, BigInt(taskId)), eq(tasks.isActive, true)));

    // Log the edit action
    const updatedFields = Object.keys(data).join(', ');
    console.log(`[TASK EDITED] Task ID: ${taskId}, Title: "${existingTask.title}", Edited by: ${editedBy ?? 'unknown'}, Account ID: ${accountId}, Updated fields: [${updatedFields}], Timestamp: ${new Date().toISOString()}`);

    const [updatedTask] = await db
      .select({
        taskId: sql<number>`CAST(${tasks.taskId} AS UNSIGNED)`,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        dueTime: tasks.dueTime,
        completed: tasks.completed,
        completedBy: tasks.completedBy,
        editedBy: tasks.editedBy,
        category: tasks.category,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        listingContactId: sql<number>`CAST(${tasks.listingContactId} AS UNSIGNED)`,
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

// Update contact-specific task
export async function updateContactTask(
  taskId: number,
  data: Omit<Partial<Task>, "taskId" | "createdAt" | "updatedAt">,
  accountId: number,
) {
  try {
    // Verify task exists and belongs to account through contact relationship
    const [existingTask] = await db
      .select({ taskId: tasks.taskId })
      .from(tasks)
      .innerJoin(contacts, eq(tasks.contactId, contacts.contactId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          eq(tasks.isActive, true),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );

    if (!existingTask) {
      throw new Error("Contact task not found or access denied");
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
        dueTime: tasks.dueTime,
        completed: tasks.completed,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        listingContactId: sql<number>`CAST(${tasks.listingContactId} AS UNSIGNED)`,
        dealId: sql<number>`CAST(${tasks.dealId} AS UNSIGNED)`,
        appointmentId: sql<number>`CAST(${tasks.appointmentId} AS UNSIGNED)`,
        prospectId: sql<number>`CAST(${tasks.prospectId} AS UNSIGNED)`,
        contactId: sql<number>`CAST(${tasks.contactId} AS UNSIGNED)`,
        isActive: tasks.isActive,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .where(eq(tasks.taskId, BigInt(taskId)));
    return updatedTask;
  } catch (error) {
    console.error("Error updating contact task:", error);
    throw error;
  }
}

// Update listing-specific task
export async function updateListingTask(
  taskId: number,
  data: Omit<Partial<Task>, "taskId" | "createdAt" | "updatedAt">,
  accountId: number,
  editedBy?: string,
) {
  try {
    // Verify task exists and belongs to account through listing->property relationship
    const [existingTask] = await db
      .select({
        taskId: tasks.taskId,
        title: tasks.title,
        listingId: tasks.listingId
      })
      .from(tasks)
      .innerJoin(listings, eq(tasks.listingId, listings.listingId))
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          eq(tasks.isActive, true),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );

    if (!existingTask) {
      throw new Error("Listing task not found or access denied");
    }

    // Prepare update data with editedBy
    const updateData = {
      ...data,
      editedBy: editedBy ?? null
    };

    await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.taskId, BigInt(taskId)), eq(tasks.isActive, true)));

    // Log the edit action
    const updatedFields = Object.keys(data).join(', ');
    console.log(`[LISTING TASK EDITED] Task ID: ${taskId}, Title: "${existingTask.title}", Listing ID: ${existingTask.listingId}, Edited by: ${editedBy ?? 'unknown'}, Account ID: ${accountId}, Updated fields: [${updatedFields}], Timestamp: ${new Date().toISOString()}`);

    const [updatedTask] = await db
      .select({
        taskId: sql<number>`CAST(${tasks.taskId} AS UNSIGNED)`,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        dueTime: tasks.dueTime,
        completed: tasks.completed,
        completedBy: tasks.completedBy,
        editedBy: tasks.editedBy,
        category: tasks.category,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        listingContactId: sql<number>`CAST(${tasks.listingContactId} AS UNSIGNED)`,
        dealId: sql<number>`CAST(${tasks.dealId} AS UNSIGNED)`,
        appointmentId: sql<number>`CAST(${tasks.appointmentId} AS UNSIGNED)`,
        prospectId: sql<number>`CAST(${tasks.prospectId} AS UNSIGNED)`,
        contactId: sql<number>`CAST(${tasks.contactId} AS UNSIGNED)`,
        isActive: tasks.isActive,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
      })
      .from(tasks)
      .where(eq(tasks.taskId, BigInt(taskId)));
    return updatedTask;
  } catch (error) {
    console.error("Error updating listing task:", error);
    throw error;
  }
}

// Mark task as completed
export async function completeTask(taskId: number, accountId: number, completedBy?: string) {
  try {
    // First verify the task belongs to this account
    const [existingTask] = await db
      .select({
        taskId: tasks.taskId,
        title: tasks.title,
        completed: tasks.completed
      })
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
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

    const wasCompleted = existingTask.completed;

    await db
      .update(tasks)
      .set({
        completed: true,
        completedBy: completedBy ?? null
      })
      .where(and(eq(tasks.taskId, BigInt(taskId)), eq(tasks.isActive, true)));

    // Log the completion action
    console.log(`[TASK COMPLETED] Task ID: ${taskId}, Title: "${existingTask.title}", Completed by: ${completedBy ?? 'unknown'}, Account ID: ${accountId}, Previous status: ${wasCompleted ? 'completed' : 'incomplete'}, Timestamp: ${new Date().toISOString()}`);

    const [updatedTask] = await db
      .select({
        taskId: sql<number>`CAST(${tasks.taskId} AS UNSIGNED)`,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        dueTime: tasks.dueTime,
        completed: tasks.completed,
        completedBy: tasks.completedBy,
        editedBy: tasks.editedBy,
        category: tasks.category,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        listingContactId: sql<number>`CAST(${tasks.listingContactId} AS UNSIGNED)`,
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
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
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
    // First verify the task belongs to this account using JOINs instead of subqueries
    const [existingTask] = await db
      .select({ taskId: tasks.taskId })
      .from(tasks)
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
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

// Delete contact-specific task
export async function deleteContactTask(taskId: number, accountId: number) {
  try {
    // Verify task exists and belongs to account through contact relationship
    const [existingTask] = await db
      .select({ taskId: tasks.taskId })
      .from(tasks)
      .innerJoin(contacts, eq(tasks.contactId, contacts.contactId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          eq(contacts.accountId, BigInt(accountId)),
        ),
      );

    if (!existingTask) {
      throw new Error("Contact task not found or access denied");
    }

    await db.delete(tasks).where(eq(tasks.taskId, BigInt(taskId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact task:", error);
    throw error;
  }
}

// Delete listing-specific task
export async function deleteListingTask(taskId: number, accountId: number) {
  try {
    // Verify task exists and belongs to account through listing->property relationship
    const [existingTask] = await db
      .select({ taskId: tasks.taskId })
      .from(tasks)
      .innerJoin(listings, eq(tasks.listingId, listings.listingId))
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          eq(properties.accountId, BigInt(accountId)),
        ),
      );

    if (!existingTask) {
      throw new Error("Listing task not found or access denied");
    }

    await db.delete(tasks).where(eq(tasks.taskId, BigInt(taskId)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting listing task:", error);
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
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
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

// Get most urgent tasks sorted by due date
export async function getMostUrgentTasks(accountId: number, limit = 10, daysAhead = 30) {
  try {
    // Calculate the end date based on daysAhead parameter
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysAhead);
    
    const urgentTasks = await db
      .select({
        taskId: sql<number>`CAST(${tasks.taskId} AS UNSIGNED)`,
        userId: tasks.userId,
        title: tasks.title,
        description: tasks.description,
        dueDate: tasks.dueDate,
        dueTime: tasks.dueTime,
        completed: tasks.completed,
        listingId: sql<number>`CAST(${tasks.listingId} AS UNSIGNED)`,
        listingContactId: sql<number>`CAST(${tasks.listingContactId} AS UNSIGNED)`,
        dealId: sql<number>`CAST(${tasks.dealId} AS UNSIGNED)`,
        appointmentId: sql<number>`CAST(${tasks.appointmentId} AS UNSIGNED)`,
        prospectId: sql<number>`CAST(${tasks.prospectId} AS UNSIGNED)`,
        contactId: sql<number>`CAST(${tasks.contactId} AS UNSIGNED)`,
        isActive: tasks.isActive,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        userName: users.name,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        // Contact information
        contactFirstName: contacts.firstName,
        contactLastName: contacts.lastName,
        // Property information
        propertyTitle: properties.title,
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.userId, users.id))
      .leftJoin(prospects, eq(tasks.prospectId, prospects.id))
      .leftJoin(contacts, or(
        eq(prospects.contactId, contacts.contactId),
        eq(tasks.contactId, contacts.contactId)
      ))
      .leftJoin(listingContacts, eq(tasks.listingContactId, listingContacts.listingContactId))
      .leftJoin(listings, eq(tasks.listingId, listings.listingId))
      .leftJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(tasks.isActive, true),
          eq(tasks.completed, false),
          isNotNull(tasks.dueDate),
          lte(tasks.dueDate, endDate),
          or(
            eq(contacts.accountId, BigInt(accountId)),
            eq(properties.accountId, BigInt(accountId)),
          ),
        ),
      )
      .orderBy(asc(tasks.dueDate))
      .limit(limit);
    
    return urgentTasks;
  } catch (error) {
    console.error("Error fetching most urgent tasks:", error);
    throw error;
  }
}
