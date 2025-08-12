"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserAccountId } from "~/lib/dal";
import {
  StatusUpdateSchema,
  BulkActionSchema,
  isValidStatusTransition,
  type StatusUpdateResult,
  type BulkActionResult,
} from "~/types/operations";
import { type LeadStatus } from "~/lib/constants/lead-statuses";
import {
  updateProspectWithAuth,
  getProspectWithAuth,
} from "~/server/queries/prospect";
import { updateLeadWithAuth, getLeadByIdWithAuth } from "~/server/queries/lead";
import { updateDealWithAuth, getDealByIdWithAuth } from "~/server/queries/deal";

// Update operation status (for drag-and-drop)
export async function updateOperationStatus(
  rawData: unknown,
): Promise<StatusUpdateResult> {
  try {
    // Get current user context
    const accountId = await getCurrentUserAccountId();

    // Parse and validate input data
    const data = StatusUpdateSchema.parse({
      ...(rawData as Record<string, unknown>),
      accountId: accountId.toString(),
    });

    // Validate status transition
    if (
      !isValidStatusTransition(
        data.operationType,
        data.fromStatus,
        data.toStatus,
      )
    ) {
      return {
        success: false,
        error: `Invalid status transition from ${data.fromStatus} to ${data.toStatus}`,
      };
    }

    // Update based on operation type
    switch (data.operationType) {
      case "prospects":
        // Verify prospect exists and belongs to user's account
        const prospect = await getProspectWithAuth(data.operationId);
        if (!prospect) {
          return {
            success: false,
            error: "Prospect not found or access denied",
          };
        }

        await updateProspectWithAuth(data.operationId, {
          status: data.toStatus,
        });
        break;

      case "leads":
        // Verify lead exists and belongs to user's account
        const lead = await getLeadByIdWithAuth(Number(data.operationId));
        if (!lead) {
          return { success: false, error: "Lead not found or access denied" };
        }

        await updateLeadWithAuth(Number(data.operationId), {
          status: data.toStatus as LeadStatus,
        });
        break;

      case "deals":
        // Verify deal exists and belongs to user's account
        const deal = await getDealByIdWithAuth(Number(data.operationId));
        if (!deal) {
          return { success: false, error: "Deal not found or access denied" };
        }

        await updateDealWithAuth(Number(data.operationId), {
          status: data.toStatus as
            | "Offer"
            | "UnderContract"
            | "Closed"
            | "Lost",
        });
        break;

      default:
        return { success: false, error: "Invalid operation type" };
    }

    // Revalidate the operations page
    revalidatePath(`/operaciones/${data.operationType}`);

    return {
      success: true,
      data: {
        operationId: data.operationId,
        newStatus: data.toStatus,
        updatedAt: new Date(),
      },
      message: `${data.operationType.slice(0, -1)} status updated to ${data.toStatus}`,
    };
  } catch (error) {
    console.error("Error updating operation status:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "Failed to update operation status",
    };
  }
}

// Bulk operations (assign, status update, create tasks, etc.)
export async function bulkUpdateOperations(
  rawData: unknown,
): Promise<BulkActionResult> {
  try {
    // Get current user context
    const accountId = await getCurrentUserAccountId();

    // Parse and validate input data
    const data = BulkActionSchema.parse({
      ...(rawData as Record<string, unknown>),
      accountId: accountId.toString(),
    });

    const results: Array<{
      operationId: bigint;
      success: boolean;
      error?: string;
    }> = [];

    // Process each operation based on action type
    switch (data.action) {
      case "updateStatus":
        if (!data.targetValue) {
          return {
            success: false,
            error: "Target status required for bulk status update",
          };
        }

        for (const operationId of data.operationIds) {
          try {
            const updateResult = await updateOperationStatus({
              operationId: operationId.toString(),
              operationType: data.operationType,
              fromStatus: "unknown", // Will be determined in the update function
              toStatus: data.targetValue,
            });

            results.push({
              operationId,
              success: updateResult.success,
              error: updateResult.error,
            });
          } catch (error) {
            results.push({
              operationId,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
        break;

      case "assign":
        // TODO: Implement user assignment
        return { success: false, error: "User assignment not yet implemented" };

      case "createTasks":
        // TODO: Implement bulk task creation
        return {
          success: false,
          error: "Bulk task creation not yet implemented",
        };

      case "export":
        // TODO: Implement data export
        return { success: false, error: "Data export not yet implemented" };

      default:
        return { success: false, error: "Invalid bulk action" };
    }

    // Calculate success metrics
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    // Revalidate the operations page
    revalidatePath(`/operaciones/${data.operationType}`);

    return {
      success: failureCount === 0,
      data: {
        affectedCount: successCount,
        results,
      },
      message: `Bulk operation completed: ${successCount} succeeded, ${failureCount} failed`,
    };
  } catch (error) {
    console.error("Error in bulk operation:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "Failed to perform bulk operation",
    };
  }
}
