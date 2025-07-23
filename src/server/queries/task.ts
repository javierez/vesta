import { db } from "../db";
import { tasks } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { Task } from "../../lib/data";

// Create a new task
export async function createTask(data: Omit<Task, "taskId" | "createdAt" | "updatedAt">) {
  try {
    const [result] = await db.insert(tasks).values({
      ...data,
      isActive: true,
    }).$returningId();
    if (!result) throw new Error("Failed to create task");
    const [newTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.taskId, BigInt(result.taskId)));
    return newTask;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

// Get task by ID
export async function getTaskById(taskId: number) {
  try {
    const [task] = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          eq(tasks.isActive, true)
        )
      );
    return task;
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
}

// Get tasks by user ID
export async function getUserTasks(userId: number) {
  try {
    const userTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, BigInt(userId)),
          eq(tasks.isActive, true)
        )
      );
    return userTasks;
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    throw error;
  }
}

// Get tasks by listing ID
export async function getListingTasks(listingId: number) {
  try {
    const listingTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.listingId, BigInt(listingId)),
          eq(tasks.isActive, true)
        )
      );
    return listingTasks;
  } catch (error) {
    console.error("Error fetching listing tasks:", error);
    throw error;
  }
}

// Get tasks by lead ID
export async function getLeadTasks(leadId: number) {
  try {
    const leadTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.leadId, BigInt(leadId)),
          eq(tasks.isActive, true)
        )
      );
    return leadTasks;
  } catch (error) {
    console.error("Error fetching lead tasks:", error);
    throw error;
  }
}

// Get tasks by deal ID
export async function getDealTasks(dealId: number) {
  try {
    const dealTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.dealId, BigInt(dealId)),
          eq(tasks.isActive, true)
        )
      );
    return dealTasks;
  } catch (error) {
    console.error("Error fetching deal tasks:", error);
    throw error;
  }
}

// Get tasks by appointment ID
export async function getAppointmentTasks(appointmentId: number) {
  try {
    const appointmentTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.appointmentId, BigInt(appointmentId)),
          eq(tasks.isActive, true)
        )
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
  data: Omit<Partial<Task>, "taskId" | "createdAt" | "updatedAt">
) {
  try {
    await db
      .update(tasks)
      .set(data)
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          eq(tasks.isActive, true)
        )
      );
    const [updatedTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.taskId, BigInt(taskId)));
    return updatedTask;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

// Mark task as completed
export async function completeTask(taskId: number) {
  try {
    await db
      .update(tasks)
      .set({ completed: true })
      .where(
        and(
          eq(tasks.taskId, BigInt(taskId)),
          eq(tasks.isActive, true)
        )
      );
    const [updatedTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.taskId, BigInt(taskId)));
    return updatedTask;
  } catch (error) {
    console.error("Error completing task:", error);
    throw error;
  }
}

// Soft delete task (set isActive to false)
export async function softDeleteTask(taskId: number) {
  try {
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
export async function deleteTask(taskId: number) {
  try {
    await db
      .delete(tasks)
      .where(eq(tasks.taskId, BigInt(taskId)));
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
  filters?: {
    userId?: number;
    completed?: boolean;
    isActive?: boolean;
  }
) {
  try {
    const offset = (page - 1) * limit;
    
    // Build the where conditions array
    const whereConditions = [];
    if (filters) {
      if (filters.userId) {
        whereConditions.push(eq(tasks.userId, BigInt(filters.userId)));
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

    // Create the base query
    const query = db.select().from(tasks);

    // Apply all where conditions at once
    const filteredQuery = whereConditions.length > 0 
      ? query.where(and(...whereConditions))
      : query;

    // Apply pagination
    const allTasks = await filteredQuery
      .limit(limit)
      .offset(offset);
    
    return allTasks;
  } catch (error) {
    console.error("Error listing tasks:", error);
    throw error;
  }
} 