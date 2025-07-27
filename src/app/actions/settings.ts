"use server";

import { revalidatePath } from "next/cache";
import { uploadImageToS3 } from "~/lib/s3";
import {
  getAccountSettings,
  updateAccountSettings,
  updateAccountLogo,
  updateAccountPortalSettings,
  updateAccountPaymentSettings,
  getUserSettings,
  updateUserSettings,
  getAccountIdForUser,
} from "~/server/queries/settings";
import type {
  AccountInput,
  UserInput,
  AccountSettingsResponse,
  UserSettingsResponse,
  PortalInput,
  PaymentInput,
} from "~/types/settings";
import {
  accountSettingsSchema,
  userSettingsSchema,
  portalSettingsSchema,
  paymentSettingsSchema,
} from "~/types/settings";

// Account Logo Upload
export async function uploadAccountLogo(
  formData: FormData,
): Promise<AccountSettingsResponse> {
  try {
    const file = formData.get("logo") as File;
    const accountId = formData.get("accountId") as string;

    if (!file || !accountId) {
      return {
        success: false,
        error: "Archivo y ID de cuenta requeridos",
      };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "El archivo debe ser una imagen",
      };
    }

    // Upload to S3 in inmobiliariaacropolis folder as requested
    const { imageUrl } = await uploadImageToS3(
      file,
      "inmobiliariaacropolis", // Specific folder as requested in PRP
      1, // Order doesn't matter for logos
    );

    // Update account with new logo URL
    const updatedAccount = await updateAccountLogo(BigInt(accountId), imageUrl);

    // Revalidate the settings page
    revalidatePath("/ajustes");

    return {
      success: true,
      data: updatedAccount,
    };
  } catch (error) {
    console.error("Error uploading account logo:", error);
    return {
      success: false,
      error: "Error al subir el logo",
    };
  }
}

// Account Settings Update
export async function updateAccountSettingsAction(
  accountId: bigint,
  data: AccountInput,
): Promise<AccountSettingsResponse> {
  try {
    // Validate input data
    const validatedData = accountSettingsSchema.parse(data);

    // Update account settings
    const updatedAccount = await updateAccountSettings(
      accountId,
      validatedData,
    );

    // Revalidate the settings page
    revalidatePath("/ajustes");

    return {
      success: true,
      data: updatedAccount,
    };
  } catch (error) {
    console.error("Error updating account settings:", error);
    return {
      success: false,
      error: "Error al actualizar la configuración de la cuenta",
    };
  }
}

// Portal Settings Update
export async function updatePortalSettingsAction(
  accountId: bigint,
  data: PortalInput,
): Promise<AccountSettingsResponse> {
  try {
    // Validate input data
    const validatedData = portalSettingsSchema.parse(data);

    // Update portal settings
    const updatedAccount = await updateAccountPortalSettings(
      accountId,
      validatedData,
    );

    // Revalidate the settings page
    revalidatePath("/ajustes");

    return {
      success: true,
      data: updatedAccount,
    };
  } catch (error) {
    console.error("Error updating portal settings:", error);
    return {
      success: false,
      error: "Error al actualizar la configuración de portales",
    };
  }
}

// Payment Settings Update
export async function updatePaymentSettingsAction(
  accountId: bigint,
  data: PaymentInput,
): Promise<AccountSettingsResponse> {
  try {
    // Validate input data
    const validatedData = paymentSettingsSchema.parse(data);

    // Update payment settings
    const updatedAccount = await updateAccountPaymentSettings(
      accountId,
      validatedData,
    );

    // Revalidate the settings page
    revalidatePath("/ajustes");

    return {
      success: true,
      data: updatedAccount,
    };
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return {
      success: false,
      error: "Error al actualizar la configuración de pagos",
    };
  }
}

// User Settings Update
export async function updateUserSettingsAction(
  userId: bigint,
  data: UserInput,
): Promise<UserSettingsResponse> {
  try {
    // Validate input data
    const validatedData = userSettingsSchema.parse(data);

    // Update user settings
    const updatedUser = await updateUserSettings(userId, validatedData);

    // Revalidate the settings page
    revalidatePath("/ajustes");

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user settings:", error);
    return {
      success: false,
      error: "Error al actualizar la configuración del usuario",
    };
  }
}

// Fetch Account Settings
export async function getAccountSettingsAction(
  accountId: bigint,
): Promise<AccountSettingsResponse> {
  try {
    const accountSettings = await getAccountSettings(accountId);

    if (!accountSettings) {
      return {
        success: false,
        error: "Configuración de cuenta no encontrada",
      };
    }

    return {
      success: true,
      data: accountSettings,
    };
  } catch (error) {
    console.error("Error fetching account settings:", error);
    return {
      success: false,
      error: "Error al obtener la configuración de la cuenta",
    };
  }
}

// Fetch User Settings
export async function getUserSettingsAction(
  userId: bigint,
): Promise<UserSettingsResponse> {
  try {
    const userSettings = await getUserSettings(userId);

    if (!userSettings) {
      return {
        success: false,
        error: "Configuración de usuario no encontrada",
      };
    }

    return {
      success: true,
      data: userSettings,
    };
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return {
      success: false,
      error: "Error al obtener la configuración del usuario",
    };
  }
}

// Helper function to get account ID for current user
export async function getCurrentUserAccountId(
  userId: bigint,
): Promise<bigint | null> {
  try {
    return await getAccountIdForUser(userId);
  } catch (error) {
    console.error("Error getting account ID for user:", error);
    return null;
  }
}
