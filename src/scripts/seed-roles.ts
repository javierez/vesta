import { db } from "~/server/db";
import { roles } from "~/server/db/schema";

async function seedRoles() {
  try {
    console.log("Seeding roles...");
    
    const roleData = [
      {
        roleId: BigInt(1),
        name: "admin",
        description: "Administrator with full system access",
        permissions: JSON.stringify({
          canManageUsers: true,
          canManageProperties: true,
          canManageAccounts: true,
          canViewReports: true,
          canExportData: true,
        }),
        isActive: true,
      },
      {
        roleId: BigInt(2),
        name: "agent",
        description: "Real estate agent with property management access",
        permissions: JSON.stringify({
          canManageProperties: true,
          canViewReports: true,
          canExportData: true,
        }),
        isActive: true,
      },
      {
        roleId: BigInt(3),
        name: "viewer",
        description: "Read-only access to properties and reports",
        permissions: JSON.stringify({
          canViewProperties: true,
          canViewReports: true,
        }),
        isActive: true,
      },
    ];

    // Insert roles
    for (const role of roleData) {
      await db.insert(roles).values(role).onDuplicateKeyUpdate({
        set: {
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          isActive: role.isActive,
          updatedAt: new Date(),
        }
      });
      console.log(`✅ Created/Updated role: ${role.name}`);
    }

    console.log("✅ Roles seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding roles:", error);
  } finally {
    process.exit();
  }
}

void seedRoles();