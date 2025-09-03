"use server";

import { getCurrentUser, getSecureDb } from "~/lib/dal";
import {
  getAppointmentWithDetails,
  hasVisitSignatures,
  markAppointmentAsCompleted,
  getVisitSignatures,
  getCompletedVisitAppointments,
} from "~/server/queries/visits";
import { convertSignatureToFile } from "~/lib/s3-signatures";
import { uploadDocument } from "~/app/actions/upload";
import { hasPermission, PERMISSIONS } from "~/lib/permissions";
import type {
  VisitFormData,
  AppointmentWithDetails,
  VisitSignatureDocument,
} from "~/types/visits";
import { updateLeadStatusFromVisitOutcome } from "~/server/queries/lead-status-sync";

/**
 * Create a new visit by saving signatures and updating appointment status
 */
export async function createVisitAction(formData: VisitFormData) {
  try {
    // Just verify user is authenticated - if they can access calendar, they can record visits
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Authentication required");
    }
    await getSecureDb();

    // Verify appointment exists and belongs to current account
    const appointment = await getAppointmentWithDetails(formData.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found or you don't have access to it");
    }

    // Check if visit already exists for this appointment
    const hasExistingSignatures = await hasVisitSignatures(
      formData.appointmentId,
    );
    if (hasExistingSignatures) {
      throw new Error("A visit has already been recorded for this appointment");
    }

    // Validate required fields
    if (!formData.agentSignature || !formData.visitorSignature) {
      throw new Error("Both agent and visitor signatures are required");
    }

    if (!appointment.listingId) {
      throw new Error("Property listing is required for the visit");
    }

    // Convert signatures to files and upload as documents
    try {
      console.log(
        `🔄 Starting signature upload for appointment ${formData.appointmentId}`,
      );
      console.log(`📊 Signature data lengths:`, {
        agentLength: formData.agentSignature?.length,
        visitorLength: formData.visitorSignature?.length,
        agentPrefix: formData.agentSignature?.substring(0, 30),
        visitorPrefix: formData.visitorSignature?.substring(0, 30),
      });

      // Upload agent signature
      const agentSignatureFile = await convertSignatureToFile(
        formData.agentSignature,
        formData.appointmentId,
        "agent",
      );

      console.log(
        `📁 Agent signature file created: ${agentSignatureFile.name}`,
      );

      const agentDocument = await uploadDocument(
        agentSignatureFile,
        currentUser.id,
        `VISIT_${formData.appointmentId}`,
        1, // documentOrder
        "firma-visita", // documentTag to identify visit signatures
        appointment.contactId,
        appointment.listingId,
        undefined, // listingContactId
        undefined, // dealId
        formData.appointmentId,
        undefined, // propertyId - we have it through listing
        "visitas", // folderType
      );

      console.log(`✅ Agent signature stored:
        - Document ID: ${agentDocument.docId}
        - S3 URL: ${agentDocument.fileUrl}
        - S3 Key: ${agentDocument.s3key}
        - Document Key: ${agentDocument.documentKey}
        - Folder Type: visitas
        - Tag: firma-visita`);

      // Upload visitor signature
      const visitorSignatureFile = await convertSignatureToFile(
        formData.visitorSignature,
        formData.appointmentId,
        "visitor",
      );

      console.log(
        `📁 Visitor signature file created: ${visitorSignatureFile.name}`,
      );

      const visitorDocument = await uploadDocument(
        visitorSignatureFile,
        currentUser.id,
        `VISIT_${formData.appointmentId}`,
        2, // documentOrder
        "firma-visita", // documentTag to identify visit signatures
        appointment.contactId,
        appointment.listingId,
        undefined, // listingContactId
        undefined, // dealId
        formData.appointmentId,
        undefined, // propertyId - we have it through listing
        "visitas", // folderType
      );

      console.log(`✅ Visitor signature stored:
        - Document ID: ${visitorDocument.docId}
        - S3 URL: ${visitorDocument.fileUrl}
        - S3 Key: ${visitorDocument.s3key}
        - Document Key: ${visitorDocument.documentKey}
        - Folder Type: visitas
        - Tag: firma-visita`);

      // Mark appointment as completed and update notes
      const success = await markAppointmentAsCompleted(
        formData.appointmentId,
        formData.notes,
      );
      if (!success) {
        throw new Error("Failed to mark appointment as completed");
      }

      // NEW: Update lead status based on visit outcome
      if (appointment.listingContactId && formData.visitOutcome) {
        try {
          await updateLeadStatusFromVisitOutcome(
            BigInt(appointment.listingContactId),
            formData.visitOutcome,
          );
          console.log("📈 Updated lead status from visit outcome:", {
            appointmentId: formData.appointmentId.toString(),
            listingContactId: String(appointment.listingContactId),
            visitOutcome: formData.visitOutcome,
          });
        } catch (error) {
          console.error(
            "Failed to update lead status from visit outcome:",
            error,
          );
          // Don't fail the visit recording if lead status update fails
        }
      } else if (!appointment.listingContactId) {
        console.warn(
          "⚠️ No lead associated with appointment for status progression:",
          {
            appointmentId: formData.appointmentId.toString(),
          },
        );
      }

      return {
        success: true,
        appointment,
        signatures: [agentDocument, visitorDocument],
      };
    } catch (uploadError) {
      console.error("Error uploading signatures:", uploadError);
      throw new Error("Failed to upload signatures. Please try again.");
    }
  } catch (error) {
    console.error("Error creating visit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create visit",
    };
  }
}

/**
 * Get appointment data for visit form
 */
export async function getAppointmentForVisitAction(appointmentId: bigint) {
  try {
    // Just verify user is authenticated - no specific permission needed for calendar access
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Authentication required");
    }

    const appointment = await getAppointmentWithDetails(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found or you don't have access to it");
    }

    // Check if visit already exists
    const hasExistingSignatures = await hasVisitSignatures(appointmentId);

    return {
      success: true,
      appointment,
      hasExistingVisit: hasExistingSignatures,
    };
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch appointment",
    };
  }
}

/**
 * Get all completed visit appointments for current user
 */
export async function getUserCompletedVisitsAction(): Promise<{
  success: boolean;
  visits?: AppointmentWithDetails[];
  error?: string;
}> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Authentication required");
    }
    const visits = await getCompletedVisitAppointments(currentUser.id);

    return { success: true, visits };
  } catch (error) {
    console.error("Error fetching user visits:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch visits",
    };
  }
}

/**
 * Get all completed visit appointments (admin view)
 */
export async function getAllCompletedVisitsAction(): Promise<{
  success: boolean;
  visits?: AppointmentWithDetails[];
  error?: string;
}> {
  try {
    // This is admin function - keep permission check
    const canView = await hasPermission(PERMISSIONS.LISTING_VIEW);
    if (!canView) {
      throw new Error("Insufficient permissions to view all visits");
    }

    const visits = await getCompletedVisitAppointments(); // No userId = all users

    return { success: true, visits };
  } catch (error) {
    console.error("Error fetching all visits:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch visits",
    };
  }
}

/**
 * Get visit signatures for an appointment
 */
export async function getVisitSignaturesAction(appointmentId: bigint): Promise<{
  success: boolean;
  signatures?: VisitSignatureDocument[];
  error?: string;
}> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Authentication required");
    }

    const signatures = await getVisitSignatures(appointmentId);

    return { success: true, signatures };
  } catch (error) {
    console.error("Error fetching visit signatures:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch visit signatures",
    };
  }
}

/**
 * Check if appointment already has a visit recorded
 */
export async function checkExistingVisitAction(appointmentId: bigint): Promise<{
  success: boolean;
  hasVisit: boolean;
  signatures?: VisitSignatureDocument[];
  error?: string;
}> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Authentication required");
    }

    const hasSignatures = await hasVisitSignatures(appointmentId);
    let signatures: VisitSignatureDocument[] | undefined;

    if (hasSignatures) {
      signatures = await getVisitSignatures(appointmentId);
    }

    return {
      success: true,
      hasVisit: hasSignatures,
      signatures,
    };
  } catch (error) {
    console.error("Error checking existing visit:", error);
    return {
      success: false,
      hasVisit: false,
      error:
        error instanceof Error ? error.message : "Failed to check visit status",
    };
  }
}
