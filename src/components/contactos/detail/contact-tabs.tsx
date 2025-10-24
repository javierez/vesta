"use client";

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { useState, useEffect } from "react";
import { Building, Plus } from "lucide-react";
import {
  updateContactWithAuth,
  getOwnerListingsWithAuth,
  getBuyerListingsWithAuth,
  removeListingContactRelationshipWithAuth,
} from "~/server/queries/contact";
import { 
  updateContactTaskWithAuth,
  deleteContactTaskWithAuth,
} from "~/server/queries/task";
import { toast } from "sonner";
import { PropertyCard } from "~/components/property-card";
import { ContactSolicitudes } from "./contact-solicitudes";
import type { PropertyListing } from "~/types/property-listing";
import { AddPropertyDialog } from "./add-property-dialog";
import { RemovePropertyDialog } from "./remove-property-dialog";
import { ContactTareas } from "./contact-tareas";
import { ContactComments } from "./contact-comments";
import { getUserCommentsByContactIdWithAuth, getContactTasksWithAuth } from "~/server/queries/user-comments";
import type { UserCommentWithUser } from "~/types/user-comments";
import {
  createUserCommentAction,
  updateUserCommentAction,
  deleteUserCommentAction,
} from "~/server/actions/user-comments";
import { ContactBasicInfoCard } from "./cards/contact-basic-info-card";
import { ContactDetailsCard } from "./cards/contact-details-card";
import { ContactNotesCard } from "./cards/contact-notes-card";
import { useSession } from "~/lib/auth-client";
import { canEditContacts, canDeleteContacts } from "~/app/actions/permissions/check-permissions";

// Create a type alias for the PropertyCard's expected Listing type
type PropertyCardListing = {
  listingId: bigint;
  propertyId: bigint;
  price: string;
  status: string;
  listingType: string;
  isActive: boolean | null;
  isFeatured: boolean | null;
  isBankOwned: boolean | null;
  viewCount: number | null;
  inquiryCount: number | null;
  agentName: string | null;
  referenceNumber: string | null;
  title: string | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: string | null;
  squareMeter: number | null;
  street: string | null;
  addressDetails: string | null;
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;
  city: string | null;
  province: string | null;
  municipality: string | null;
  neighborhood: string | null;
  imageUrl: string | null;
  s3key: string | null;
  imageUrl2: string | null;
  s3key2: string | null;
};

// Task interface matching what ContactTareas expects
interface Task {
  taskId?: bigint;
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate?: Date;
  completed: boolean;
  listingId?: bigint;
  leadId?: bigint;
  dealId?: bigint;
  appointmentId?: bigint;
  prospectId?: bigint;
  contactId?: bigint;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
  userName?: string;
  userFirstName?: string;
  userLastName?: string;
}

type SaveState = "idle" | "modified" | "saving" | "saved" | "error";

interface ModuleState {
  saveState: SaveState;
  hasChanges: boolean;
  lastSaved?: Date;
}

type ModuleName = "basicInfo" | "contactDetails" | "notes";

interface ContactTabsProps {
  contact: {
    contactId: bigint;
    firstName: string;
    lastName: string;
    nif?: string;
    source?: string;
    email?: string;
    phone?: string;
    phoneNotes?: string;
    secondaryPhone?: string;
    secondaryPhoneNotes?: string;
    // contactType can be missing; we will derive from flags/counts if so
    contactType?:
      | "demandante"
      | "propietario"
      | "banco"
      | "agencia"
      | "interesado";
    isActive: boolean;
    // Flags and counts provided by the server helper; optional for safety
    isOwner?: boolean;
    isBuyer?: boolean;
    isInteresado?: boolean;
    ownerCount?: number;
    buyerCount?: number;
    prospectCount?: number;
    additionalInfo?: {
      demandType?: string;
      propertyTypes?: string[];
      minPrice?: number;
      maxPrice?: number;
      preferredArea?: string;
      minBedrooms?: number;
      minBathrooms?: number;
      urgencyLevel?: number;
      fundingReady?: boolean;
      moveInBy?: string;
      notes?: string;
      extras?: Record<string, boolean>;
    };
  };
}

export function ContactTabs({ contact }: ContactTabsProps) {
  const { data: session } = useSession();

  // Permission states
  const [canEditContact, setCanEditContact] = useState(true);
  const [canDeleteContact, setCanDeleteContact] = useState(false);

  // State for contact comments
  const [contactComments, setContactComments] = useState<UserCommentWithUser[]>([]);
  const [, setIsLoadingComments] = useState(false);

  // State for tasks
  const [contactTasks, setContactTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  // Derive role flags using actual data (flags/counts) and fall back to contactType if present
  const isOwner =
    contact.isOwner === true ||
    (contact.ownerCount ?? 0) > 0 ||
    contact.contactType === "propietario";
  const isBuyer =
    contact.isBuyer === true ||
    (contact.buyerCount ?? 0) > 0 ||
    contact.contactType === "demandante";
  const isInteresado =
    contact.isInteresado === true ||
    (contact.prospectCount ?? 0) > 0 ||
    contact.contactType === "interesado";

  // Determine which tabs to show based on derived flags
  const showSolicitudes = isBuyer || isInteresado || isOwner;
  const showPropiedades = isOwner || isBuyer;

  // Active tab state
  const [activeTab, setActiveTab] = useState("informacion");

  // Build tabs array based on contact type
  const tabs = [
    { value: "informacion", label: "Información" },
    { value: "tareas", label: "Tareas" },
    ...(showSolicitudes
      ? [{ value: "solicitudes", label: "Solicitudes" }]
      : []),
    ...(showPropiedades
      ? [{ value: "propiedades", label: "Propiedades" }]
      : []),
  ];

  // logs removed

  // Module states
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleState>>(
    {
      basicInfo: { saveState: "idle", hasChanges: false },
      contactDetails: { saveState: "idle", hasChanges: false },
      notes: { saveState: "idle", hasChanges: false },
    },
  );

  // Form states
  const [firstName, setFirstName] = useState(contact.firstName ?? "");
  const [lastName, setLastName] = useState(contact.lastName ?? "");
  const [nif, setNif] = useState(contact.nif ?? "");
  const [source, setSource] = useState(contact.source ?? "");
  const [email, setEmail] = useState(contact.email ?? "");
  const [phone, setPhone] = useState(contact.phone ?? "");
  const [phoneNotes, setPhoneNotes] = useState(contact.phoneNotes ?? "");
  const [secondaryPhone, setSecondaryPhone] = useState(contact.secondaryPhone ?? "");
  const [secondaryPhoneNotes, setSecondaryPhoneNotes] = useState(contact.secondaryPhoneNotes ?? "");
  const [additionalInfo] = useState(contact.additionalInfo ?? {});

  // Notes state
  const [notes, setNotes] = useState(additionalInfo.notes ?? "");

  // Property listings for propietario and demandante
  const [contactListings, setContactListings] = useState<PropertyListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);

  // Add property dialog state
  const [showAddPropertyDialog, setShowAddPropertyDialog] = useState(false);

  // Remove property dialog state
  const [showRemovePropertyDialog, setShowRemovePropertyDialog] =
    useState(false);
  const [propertyToRemove, setPropertyToRemove] = useState<{
    listingId: bigint;
    title: string | null;
    street: string | null;
    city: string | null;
    province: string | null;
    price: string;
    propertyType: string | null;
  } | null>(null);
  const [isRemovingProperty, setIsRemovingProperty] = useState(false);

  // Task update functions
  const handleToggleTaskCompleted = async (taskId: string) => {
    const task = contactTasks.find((t) => t.id === taskId);
    if (!task?.taskId) return;

    const newCompleted = !task.completed;

    // Optimistic update
    setContactTasks(
      contactTasks.map((t) =>
        t.id === taskId ? { ...t, completed: newCompleted } : t,
      ),
    );

    try {
      await updateContactTaskWithAuth(Number(task.taskId), {
        completed: newCompleted,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert optimistic update on error
      setContactTasks(
        contactTasks.map((t) =>
          t.id === taskId ? { ...t, completed: !newCompleted } : t,
        ),
      );
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const task = contactTasks.find((t) => t.id === taskId);
    if (!task?.taskId) return;

    // Optimistic update: remove from UI immediately
    const previousTasks = contactTasks;
    setContactTasks(contactTasks.filter((t) => t.id !== taskId));

    try {
      await deleteContactTaskWithAuth(Number(task.taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      // Revert optimistic update on error
      setContactTasks(previousTasks);
      toast.error("Error al eliminar la tarea");
    }
  };

  const handleAddTask = async (newTask: Task) => {
    // Add task optimistically
    setContactTasks([newTask, ...contactTasks]);
    return newTask;
  };

  const handleUpdateTaskAfterSave = (optimisticId: string, savedTask: Task) => {
    // Update with server response
    setContactTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === optimisticId ? savedTask : task
      )
    );
  };

  const handleRemoveOptimisticTask = (optimisticId: string) => {
    // Remove optimistic task on error
    setContactTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== optimisticId)
    );
  };

  // Comment update functions
  const handleAddComment = async (tempComment: UserCommentWithUser) => {
    // Add comment optimistically
    setContactComments((prev) => [tempComment, ...prev]);
    
    // Return result of server action
    try {
      const result = await createUserCommentAction({
        contactId: tempComment.contactId,
        content: tempComment.content,
        parentId: tempComment.parentId,
      });
      
      if (result.success) {
        // Refetch comments to get server data
        const freshComments = await getUserCommentsByContactIdWithAuth(contact.contactId);
        setContactComments(freshComments);
      }
      
      return result;
    } catch (error) {
      // Remove optimistic comment on error
      setContactComments((prev) => 
        prev.filter((c) => c.commentId !== tempComment.commentId)
      );
      throw error;
    }
  };

  const handleEditComment = async (commentId: bigint, content: string) => {
    // Find original comment
    const findCommentById = (comments: UserCommentWithUser[], id: bigint): UserCommentWithUser | null => {
      for (const comment of comments) {
        if (comment.commentId === id) return comment;
        const replyFound = findCommentById(comment.replies, id);
        if (replyFound) return replyFound;
      }
      return null;
    };
    
    const originalComment = findCommentById(contactComments, commentId);
    if (!originalComment) return { success: false, error: "Comment not found" };
    
    // Optimistic update
    const updateComment = (comments: UserCommentWithUser[]): UserCommentWithUser[] => {
      return comments.map((comment) => {
        if (comment.commentId === commentId) {
          return { ...comment, content };
        }
        return {
          ...comment,
          replies: updateComment(comment.replies),
        };
      });
    };
    
    setContactComments((prev) => updateComment(prev));
    
    try {
      const result = await updateUserCommentAction({
        commentId,
        content,
      });
      
      if (!result.success) {
        // Revert on failure
        setContactComments((prev) => updateComment(prev).map((comment) => {
          if (comment.commentId === commentId) {
            return { ...comment, content: originalComment.content };
          }
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.commentId === commentId
                ? { ...reply, content: originalComment.content }
                : reply
            ),
          };
        }));
      }
      
      return result;
    } catch (error) {
      // Revert on error
      setContactComments((prev) => updateComment(prev).map((comment) => {
        if (comment.commentId === commentId) {
          return { ...comment, content: originalComment.content };
        }
        return {
          ...comment,
          replies: comment.replies.map((reply) =>
            reply.commentId === commentId
              ? { ...reply, content: originalComment.content }
              : reply
          ),
        };
      }));
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: bigint) => {
    // Store original state for revert
    const previousComments = contactComments;
    
    // Optimistic delete
    const deleteComment = (comments: UserCommentWithUser[]): UserCommentWithUser[] => {
      return comments
        .filter((c) => c.commentId !== commentId)
        .map((comment) => ({
          ...comment,
          replies: comment.replies.filter((r) => r.commentId !== commentId),
        }));
    };
    
    setContactComments((prev) => deleteComment(prev));
    
    try {
      const result = await deleteUserCommentAction(commentId);
      
      if (result.success) {
        // Refetch to ensure consistency
        const freshComments = await getUserCommentsByContactIdWithAuth(contact.contactId);
        setContactComments(freshComments);
      } else {
        // Revert on failure
        setContactComments(previousComments);
      }
      
      return result;
    } catch (error) {
      // Revert on error
      setContactComments(previousComments);
      throw error;
    }
  };

  // Fetch user permissions on component mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const [editPerm, deletePerm] = await Promise.all([
          canEditContacts(),
          canDeleteContacts(),
        ]);
        setCanEditContact(editPerm);
        setCanDeleteContact(deletePerm);
      } catch (error) {
        console.error("❌ Error fetching contact permissions:", error);
        setCanEditContact(false);
        setCanDeleteContact(false);
      }
    };

    void fetchPermissions();
  }, []);

  // Load comments and tasks for the contact
  useEffect(() => {
    const loadCommentsAndTasks = async () => {
      setIsLoadingComments(true);
      setIsLoadingTasks(true);
      try {
        const [comments, tasks] = await Promise.all([
          getUserCommentsByContactIdWithAuth(contact.contactId),
          getContactTasksWithAuth(contact.contactId)
        ]);
        
        setContactComments(comments);
        
        // Transform tasks to expected format
        const formattedTasks = tasks.map((task) => ({
          id: task.taskId?.toString() ?? Date.now().toString(),
          taskId: task.taskId ? BigInt(task.taskId) : undefined,
          userId: task.userId,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          completed: task.completed ?? false,
          listingId: task.listingId ? BigInt(task.listingId) : undefined,
          leadId: task.listingContactId ? BigInt(task.listingContactId) : undefined,
          dealId: task.dealId ? BigInt(task.dealId) : undefined,
          appointmentId: task.appointmentId ? BigInt(task.appointmentId) : undefined,
          prospectId: task.prospectId ? BigInt(task.prospectId) : undefined,
          contactId: contact.contactId,
          isActive: task.isActive ?? true,
          createdAt: new Date(task.createdAt),
          updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
          createdBy: task.createdBy ?? undefined,
          userName: task.userName ?? undefined,
          userFirstName: task.userFirstName ?? undefined,
          userLastName: task.userLastName ?? undefined,
        }));
        
        setContactTasks(formattedTasks);
      } catch (error) {
        console.error("Error loading contact data:", error);
        toast.error("Error al cargar los datos del contacto");
      } finally {
        setIsLoadingComments(false);
        setIsLoadingTasks(false);
      }
    };
    void loadCommentsAndTasks();
  }, [contact.contactId]);

  // Load contact listings if owner or buyer
  useEffect(() => {
    if (isOwner || isBuyer) {
      const loadContactListings = async () => {
        setIsLoadingListings(true);
        try {
          let allListings: unknown[];
          if (isOwner) {
            allListings = await getOwnerListingsWithAuth(
              Number(contact.contactId),
            );
          } else if (isBuyer) {
            // For buyer (demandante), get listings where they are the buyer
            allListings = await getBuyerListingsWithAuth(
              Number(contact.contactId),
            );
          } else {
            allListings = [];
          }

          // Show all listings; server already filters by isActive
          setContactListings(allListings as unknown as PropertyListing[]);
        } catch (error) {
          console.error("Error loading contact listings:", error);
          toast.error("Error al cargar las propiedades del contacto");
        } finally {
          setIsLoadingListings(false);
        }
      };
      void loadContactListings();
    }
  }, [contact.contactId, isBuyer, isOwner]);

  // Function to reload contact listings after adding properties
  const reloadContactListings = async () => {
    if (isOwner || isBuyer) {
      setIsLoadingListings(true);
      try {
        let allListings: unknown[];
        if (isOwner) {
          allListings = await getOwnerListingsWithAuth(
            Number(contact.contactId),
          );
        } else if (isBuyer) {
          // For buyer (demandante), get listings where they are the buyer
          allListings = await getBuyerListingsWithAuth(
            Number(contact.contactId),
          );
        } else {
          allListings = [];
        }

        // Show all listings; server already filters by isActive
        setContactListings(allListings as unknown as PropertyListing[]);
      } catch (error) {
        console.error("Error loading contact listings:", error);
        toast.error("Error al cargar las propiedades del contacto");
      } finally {
        setIsLoadingListings(false);
      }
    }
  };

  // Function to handle property removal request
  const handleRemoveProperty = async (listingId: bigint) => {
    // Find the property to show in confirmation dialog
    const property = contactListings.find(
      (listing) => listing.listingId?.toString() === listingId.toString(),
    );

    if (property?.listingId) {
      setPropertyToRemove({
        listingId: BigInt(property.listingId),
        title: property.street ?? null, // Using street as title since PropertyListing doesn't have title
        street: property.street ?? null,
        city: property.city ?? null,
        province: property.province ?? null,
        price: property.price?.toString() ?? "0",
        propertyType: property.propertyType ?? null,
      });
      setShowRemovePropertyDialog(true);
    }
  };

  // Function to confirm property removal
  const handleConfirmRemoveProperty = async () => {
    if (!propertyToRemove) return;

    setIsRemovingProperty(true);
    try {
      const contactType = isOwner ? "owner" : "buyer";
      await removeListingContactRelationshipWithAuth(
        Number(contact.contactId),
        Number(propertyToRemove.listingId),
        contactType,
      );

      // Update the listings state optimistically
      setContactListings((prev) =>
        prev.filter(
          (listing) =>
            listing.listingId?.toString() !==
            propertyToRemove.listingId.toString(),
        ),
      );

      toast.success("Propiedad quitada del contacto correctamente");
      setShowRemovePropertyDialog(false);
      setPropertyToRemove(null);
    } catch (error) {
      console.error("Error removing property from contact:", error);
      toast.error("Error al quitar la propiedad del contacto");
    } finally {
      setIsRemovingProperty(false);
    }
  };

  // Function to update module state
  const updateModuleState = (moduleName: ModuleName, hasChanges: boolean) => {
    setModuleStates((prev) => ({
      ...prev,
      [moduleName]: {
        saveState: hasChanges ? "modified" : "idle",
        hasChanges,
        lastSaved: prev[moduleName]?.lastSaved,
      },
    }));
  };

  // Function to save module data
  const saveModule = async (moduleName: ModuleName) => {
    setModuleStates((prev) => ({
      ...prev,
      [moduleName]: {
        saveState: "saving",
        hasChanges: prev[moduleName]?.hasChanges ?? false,
        lastSaved: prev[moduleName]?.lastSaved,
      },
    }));

    try {
      const contactId = Number(contact.contactId);
      let contactData = {};

      switch (moduleName) {
        case "basicInfo":
          contactData = { firstName, lastName, nif, source };
          break;
        case "contactDetails":
          contactData = { email, phone, phoneNotes, secondaryPhone, secondaryPhoneNotes };
          break;
        case "notes":
          contactData = {
            additionalInfo: { ...additionalInfo, notes },
          };
          break;
      }

      await updateContactWithAuth(contactId, contactData);

      setModuleStates((prev) => ({
        ...prev,
        [moduleName]: {
          saveState: "saved",
          hasChanges: false,
          lastSaved: new Date(),
        },
      }));

      toast.success("Cambios guardados correctamente");

      setTimeout(() => {
        setModuleStates((prev) => ({
          ...prev,
          [moduleName]: {
            saveState: "idle",
            hasChanges: prev[moduleName]?.hasChanges ?? false,
            lastSaved: prev[moduleName]?.lastSaved,
          },
        }));
      }, 2000);
    } catch (error) {
      console.error(`Error saving ${moduleName}:`, error);

      setModuleStates((prev) => ({
        ...prev,
        [moduleName]: {
          saveState: "error",
          hasChanges: prev[moduleName]?.hasChanges ?? false,
          lastSaved: prev[moduleName]?.lastSaved,
        },
      }));

      toast.error("Error al guardar los cambios");

      setTimeout(() => {
        setModuleStates((prev) => {
          const currentModule = prev[moduleName];
          return {
            ...prev,
            [moduleName]: {
              saveState: currentModule?.hasChanges ? "modified" : "idle",
              hasChanges: currentModule?.hasChanges ?? false,
              lastSaved: currentModule?.lastSaved,
            },
          };
        });
      }, 3000);
    }
  };

  const getCardStyles = (moduleName: ModuleName) => {
    const state = moduleStates[moduleName]?.saveState;
    switch (state) {
      case "modified":
        return "ring-2 ring-yellow-500/20 shadow-lg shadow-yellow-500/10 border-yellow-500/20";
      case "saving":
        return "ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10 border-amber-500/20";
      case "saved":
        return "ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10 border-emerald-500/20";
      case "error":
        return "ring-2 ring-red-500/20 shadow-lg shadow-red-500/10 border-red-500/20";
      default:
        return "hover:shadow-lg transition-all duration-300";
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className={`grid w-full grid-cols-${tabs.length}`}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="informacion" className="mt-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Basic Information */}
            <ContactBasicInfoCard
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              nif={nif}
              setNif={setNif}
              source={source}
              setSource={setSource}
              saveState={moduleStates.basicInfo?.saveState ?? "idle"}
              onSave={() => saveModule("basicInfo")}
              onUpdateModule={(hasChanges) => updateModuleState("basicInfo", hasChanges)}
              getCardStyles={getCardStyles}
              canEdit={canEditContact}
            />

            {/* Contact Details */}
            <ContactDetailsCard
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              phoneNotes={phoneNotes}
              setPhoneNotes={setPhoneNotes}
              secondaryPhone={secondaryPhone}
              setSecondaryPhone={setSecondaryPhone}
              secondaryPhoneNotes={secondaryPhoneNotes}
              setSecondaryPhoneNotes={setSecondaryPhoneNotes}
              saveState={moduleStates.contactDetails?.saveState ?? "idle"}
              onSave={() => saveModule("contactDetails")}
              onUpdateModule={(hasChanges) => updateModuleState("contactDetails", hasChanges)}
              getCardStyles={getCardStyles}
              canEdit={canEditContact}
            />
          </div>

          {/* Notes Section */}
          <ContactNotesCard
            notes={notes}
            setNotes={setNotes}
            saveState={moduleStates.notes?.saveState ?? "idle"}
            onSave={() => saveModule("notes")}
            onUpdateModule={(hasChanges) => updateModuleState("notes", hasChanges)}
            getCardStyles={getCardStyles}
            canEdit={canEditContact}
          />
        </div>
      </TabsContent>

      <TabsContent value="tareas" className="mt-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side - Tasks */}
            <div className="flex-1 lg:w-1/2">
              <ContactTareas
                contactId={contact.contactId}
                tasks={contactTasks}
                loading={isLoadingTasks}
                onToggleCompleted={handleToggleTaskCompleted}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
                onUpdateTaskAfterSave={handleUpdateTaskAfterSave}
                onRemoveOptimisticTask={handleRemoveOptimisticTask}
              />
            </div>

            {/* Right side - Comments */}
            <div className="flex-1 lg:w-1/2">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Notas</h3>
              <ContactComments
                contactId={contact.contactId}
                initialComments={contactComments}
                currentUserId={session?.user?.id}
                currentUser={session?.user ? {
                  id: session.user.id,
                  name: session.user.name ?? undefined,
                  image: session.user.image ?? undefined,
                } : undefined}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
              />
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Solicitudes Tab - Show for demandante, interesado, and propietario */}
      {showSolicitudes && (
        <TabsContent value="solicitudes" className="mt-6">
          <div className="mx-auto max-w-4xl">
            <ContactSolicitudes contactId={contact.contactId} />
          </div>
        </TabsContent>
      )}

      {/* Propiedades Tab - Show for propietario and demandante */}
      {showPropiedades && (
        <TabsContent value="propiedades" className="mt-6">
          <div className="mx-auto max-w-4xl">
            <Card className="relative p-4 transition-all duration-500 ease-out">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wide">
                  {isOwner ? "PROPIEDADES ASOCIADAS" : "PROPIEDADES DE INTERÉS"}
                </h3>
                {isBuyer && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setShowAddPropertyDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Añadir Propiedad
                  </Button>
                )}
              </div>

              {isLoadingListings ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="mb-3 aspect-[4/3] rounded-lg bg-gray-200"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                        <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : contactListings.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {contactListings.map((listing) => (
                    <PropertyCard
                      key={listing.listingId?.toString() ?? "unknown"}
                      listing={listing as unknown as PropertyCardListing}
                      showDeleteButton={isBuyer} // Only show delete button for buyers
                      contactId={contact.contactId}
                      contactType={isOwner ? "owner" : "buyer"}
                      onRemove={(listingId) => handleRemoveProperty(listingId)}
                      isRemoving={
                        isRemovingProperty &&
                        propertyToRemove?.listingId.toString() ===
                          listing.listingId?.toString()
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <Building className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <p className="text-sm">
                    {contact.contactType === "propietario"
                      ? "No hay propiedades asociadas a este contacto"
                      : "No hay propiedades de interés asociadas a este contacto"}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      )}

      {/* Add Property Dialog */}
      <AddPropertyDialog
        open={showAddPropertyDialog}
        onOpenChange={setShowAddPropertyDialog}
        contactId={contact.contactId}
        onSuccess={reloadContactListings}
      />

      {/* Remove Property Dialog */}
      <RemovePropertyDialog
        open={showRemovePropertyDialog}
        onOpenChange={setShowRemovePropertyDialog}
        property={propertyToRemove}
        contactName={`${contact.firstName} ${contact.lastName}`}
        isRemoving={isRemovingProperty}
        onConfirm={handleConfirmRemoveProperty}
      />
    </Tabs>
  );
}
