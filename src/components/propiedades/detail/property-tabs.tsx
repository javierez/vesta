"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { ImageGallery } from "./image-gallery";
import { PortalSelection } from "./portal-selection";
import { DocumentsManager } from "./documents-manager";
import { CartelesManager } from "./carteles-manager";
import { Tareas } from "./tareas";
import { PropertyCharacteristicsForm } from "~/components/propiedades/form/property-characteristics-form";
import { CharacteristicsSkeleton } from "./skeletons";
import { useSession } from "~/lib/auth-client";
import type { PropertyImage } from "~/lib/data";
import type { PropertyListing } from "~/types/property-listing";
import { 
  getListingTasksWithAuth,
  updateListingTaskWithAuth,
  deleteListingTaskWithAuth
} from "~/server/queries/task";
import { getCommentsByListingIdWithAuth } from "~/server/queries/comments";
import { createCommentAction, updateCommentAction, deleteCommentAction } from "~/server/actions/comments";
import type { CommentWithUser } from "~/types/comments";
import { toast } from "sonner";

// Cartel type that matches what CartelesManager component expects
interface Cartel {
  docId: bigint;
  filename: string;
  fileUrl: string;
  documentKey: string;
  uploadedAt: Date;
}

// Task type that matches what Tareas component expects
interface TaskWithId {
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
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  userName?: string;
  userFirstName?: string;
  userLastName?: string;
}

interface PropertyTabsProps {
  listing: {
    listingId: bigint;
    propertyId: bigint;
    propertyType?: string | null;
    street?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    referenceNumber?: string | null;
    price: string;
    listingType: string;
    isBankOwned?: boolean | null;
    isFeatured?: boolean | null;
    neighborhood?: string | null;
    title?: string | null;
    fotocasa?: boolean | null;
    idealista?: boolean | null;
    habitaclia?: boolean | null;
    milanuncios?: boolean | null;
    energyCertification?: string | null;
    agentId?: string | null; // Changed from bigint to match users.id type
  };
  images: PropertyImage[];
  energyCertificate?: {
    docId: bigint;
    documentKey: string;
    fileUrl: string;
  } | null;
  convertedListing?: PropertyListing;
}

export function PropertyTabs({
  listing,
  convertedListing,
  images,
  energyCertificate,
}: PropertyTabsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [tabData, setTabData] = useState<{
    images: PropertyImage[] | null;
    convertedListing: PropertyListing | null | undefined;
    energyCertificate: {
      docId: bigint;
      documentKey: string;
      fileUrl: string;
    } | null;
    tasks: TaskWithId[] | null;
    agents: { id: string; name: string; firstName?: string; lastName?: string; }[] | null;
    comments: CommentWithUser[] | null;
    carteles: Cartel[] | null;
  }>({
    images: images ?? null,
    convertedListing: convertedListing ?? null,
    energyCertificate: energyCertificate ?? null,
    tasks: null,
    agents: null,
    comments: null,
    carteles: null,
  });
  const [loading, setLoading] = useState<{
    caracteristicas: boolean;
    tasks: boolean;
    agents: boolean;
    comments: boolean;
    carteles: boolean;
  }>({
    caracteristicas: false,
    tasks: false,
    agents: false,
    comments: false,
    carteles: false,
  });

  // These are no longer needed - data comes from props
  // Removing to prevent redundant API calls

  const fetchTasksData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, tasks: true }));
    try {
      const tasksData = await getListingTasksWithAuth(Number(listing.listingId));
      const tasksWithId = tasksData.map(task => ({
        ...task,
        id: task.taskId.toString(),
        taskId: BigInt(task.taskId),
        leadId: task.listingContactId ? BigInt(task.listingContactId) : undefined,
        listingId: task.listingId ? BigInt(task.listingId) : undefined,
        dealId: task.dealId ? BigInt(task.dealId) : undefined,
        appointmentId: task.appointmentId ? BigInt(task.appointmentId) : undefined,
        prospectId: task.prospectId ? BigInt(task.prospectId) : undefined,
        dueDate: task.dueDate ?? undefined,
        completed: task.completed ?? false,
        isActive: task.isActive ?? true,
        updatedAt: task.updatedAt ?? undefined,
        userLastName: task.userLastName ?? undefined,
      }));
      setTabData((prev) => ({ ...prev, tasks: tasksWithId }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTabData((prev) => ({ ...prev, tasks: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }));
    }
  }, [listing.listingId]); // Removed tabData.tasks dependency to prevent infinite loop

  // Task update functions
  const handleToggleTaskCompleted = async (taskId: string) => {
    const tasks = tabData.tasks ?? [];
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.taskId) return;

    const newCompleted = !task.completed;

    // Optimistic update
    setTabData((prev) => ({
      ...prev,
      tasks: prev.tasks?.map((t) =>
        t.id === taskId ? { ...t, completed: newCompleted } : t
      ) ?? null
    }));

    try {
      await updateListingTaskWithAuth(Number(task.taskId), {
        completed: newCompleted,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert optimistic update on error
      setTabData((prev) => ({
        ...prev,
        tasks: prev.tasks?.map((t) =>
          t.id === taskId ? { ...t, completed: !newCompleted } : t
        ) ?? null
      }));
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const tasks = tabData.tasks ?? [];
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.taskId) return;

    // Optimistic update: remove from UI immediately
    const previousTasks = tabData.tasks;
    setTabData((prev) => ({
      ...prev,
      tasks: prev.tasks?.filter((t) => t.id !== taskId) ?? null
    }));

    try {
      await deleteListingTaskWithAuth(Number(task.taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      // Revert optimistic update on error
      setTabData((prev) => ({
        ...prev,
        tasks: previousTasks
      }));
      toast.error("Error al eliminar la tarea");
    }
  };

  const handleAddTask = async (newTask: TaskWithId) => {
    // Add task optimistically
    setTabData((prev) => ({
      ...prev,
      tasks: prev.tasks ? [newTask, ...prev.tasks] : [newTask]
    }));
    return newTask;
  };

  const handleUpdateTaskAfterSave = (optimisticId: string, savedTask: TaskWithId) => {
    // Update with server response
    setTabData((prev) => ({
      ...prev,
      tasks: prev.tasks?.map((task) =>
        task.id === optimisticId ? savedTask : task
      ) ?? null
    }));
  };

  const handleRemoveOptimisticTask = (optimisticId: string) => {
    // Remove optimistic task on error
    setTabData((prev) => ({
      ...prev,
      tasks: prev.tasks?.filter((task) => task.id !== optimisticId) ?? null
    }));
  };

  // Comment update functions
  const handleAddComment = async (tempComment: CommentWithUser): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await createCommentAction({
        listingId: tempComment.listingId,
        propertyId: tempComment.propertyId,
        content: tempComment.content,
        parentId: tempComment.parentId,
      });

      if (result.success) {
        // Refresh comments data after successful creation
        await fetchCommentsData();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      return { success: false, error: "Error interno del servidor" };
    }
  };

  const handleEditComment = async (commentId: bigint, content: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await updateCommentAction({
        commentId,
        content,
      });

      if (result.success) {
        // Refresh comments data after successful update
        await fetchCommentsData();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      return { success: false, error: "Error interno del servidor" };
    }
  };

  const handleDeleteComment = async (commentId: bigint): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await deleteCommentAction(commentId);

      if (result.success) {
        // Refresh comments data after successful deletion
        await fetchCommentsData();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      return { success: false, error: "Error interno del servidor" };
    }
  };

  const fetchAgentsData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, agents: true }));
    try {
      // For now, just provide the current user until we implement proper API endpoint
      const agentsData = session?.user ? [{
        id: session.user.id,
        name: session.user.name || '',
        firstName: session.user.name?.split(' ')[0] ?? undefined,
        lastName: session.user.name?.split(' ')[1] ?? undefined,
      }] : [];
      setTabData((prev) => ({ ...prev, agents: agentsData }));
    } catch (error) {
      console.error('Error fetching agents:', error);
      setTabData((prev) => ({ ...prev, agents: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, agents: false }));
    }
  }, [session?.user]); // Removed tabData.agents dependency to prevent infinite loop

  const fetchCommentsData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, comments: true }));
    try {
      const commentsData = await getCommentsByListingIdWithAuth(listing.listingId);
      setTabData((prev) => ({ ...prev, comments: commentsData }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setTabData((prev) => ({ ...prev, comments: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, comments: false }));
    }
  }, [listing.listingId]); // Removed tabData.comments dependency to prevent infinite loop

  const fetchCartelesData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, carteles: true }));
    try {
      const response = await fetch(`/api/properties/${listing.listingId}/carteles`);
      if (!response.ok) {
        throw new Error("Failed to fetch carteles");
      }
      const data = await response.json() as { documents?: Cartel[] };
      setTabData((prev) => ({ ...prev, carteles: data.documents ?? [] }));
    } catch (error) {
      console.error('Error fetching carteles:', error);
      setTabData((prev) => ({ ...prev, carteles: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, carteles: false }));
    }
  }, [listing.listingId]); // Removed tabData.carteles dependency to prevent infinite loop

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Fetch only the data that's not provided as props, and only once on mount
  useEffect(() => {
    // Only fetch data that's not provided via props
    if (!tabData.tasks) {
      void fetchTasksData();
    }
    if (!tabData.agents) {
      void fetchAgentsData();
    }
    if (!tabData.comments) {
      void fetchCommentsData();
    }
    if (!tabData.carteles) {
      void fetchCartelesData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run once on mount only

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="tareas">Tareas</TabsTrigger>
        <TabsTrigger value="imagenes">Imágenes</TabsTrigger>
        <TabsTrigger value="carteles">Carteles</TabsTrigger>
        <TabsTrigger value="portales">Portales</TabsTrigger>
        <TabsTrigger value="documentos">Documentos</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <div className="mx-auto max-w-4xl">
          {loading.caracteristicas ? (
            <CharacteristicsSkeleton />
          ) : (tabData.convertedListing ?? convertedListing) ? (
            <PropertyCharacteristicsForm
              listing={tabData.convertedListing ?? convertedListing!}
            />
          ) : (
            <div className="py-8 text-center">
              <p>No se pudo cargar la información de la propiedad</p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="tareas" className="mt-6">
        <div className="mx-auto max-w-6xl">
          <Tareas
            propertyId={listing.propertyId}
            listingId={listing.listingId}
            referenceNumber={listing.referenceNumber ?? ""}
            tasks={tabData.tasks ?? []}
            loading={loading.tasks}
            comments={tabData.comments ?? []}
            onToggleCompleted={handleToggleTaskCompleted}
            onDeleteTask={handleDeleteTask}
            onAddTask={handleAddTask}
            onUpdateTaskAfterSave={handleUpdateTaskAfterSave}
            onRemoveOptimisticTask={handleRemoveOptimisticTask}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </TabsContent>

      <TabsContent value="imagenes" className="mt-6">
        <div className="mx-auto max-w-3xl">
          <ImageGallery
            images={tabData.images ?? images}
            title={listing.title ?? ""}
            propertyId={BigInt(listing.propertyId)}
            referenceNumber={listing.referenceNumber ?? ""}
          />
          <div className="flex justify-center pt-6">
            <button
              type="button"
              onClick={() => router.push(`/propiedades/${listing.listingId}/image-studio`)}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-400 to-rose-400 px-6 py-2.5 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-amber-500 hover:to-rose-500 hover:shadow-xl active:scale-95"
            >
              Vesta Image Studio
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="carteles" className="mt-6">
        <div className="mx-auto max-w-6xl">
          <CartelesManager
            propertyId={listing.propertyId}
            listingId={listing.listingId}
            referenceNumber={listing.referenceNumber ?? ""}
            carteles={tabData.carteles ?? []}
            loading={loading.carteles}
            onRefreshCarteles={fetchCartelesData}
          />
        </div>
      </TabsContent>

      <TabsContent value="portales" className="mt-6">
        <div className="mx-auto max-w-4xl">
          <PortalSelection
            listingId={listing.listingId.toString()}
            fotocasa={listing.fotocasa ?? undefined}
            idealista={listing.idealista ?? undefined}
            habitaclia={listing.habitaclia ?? undefined}
            milanuncios={listing.milanuncios ?? undefined}
          />
        </div>
      </TabsContent>


      <TabsContent value="documentos" className="mt-6">
        <div className="mx-auto max-w-6xl">
          <DocumentsManager
            propertyId={listing.propertyId}
            listingId={listing.listingId}
            referenceNumber={listing.referenceNumber ?? ""}
          />
        </div>
      </TabsContent>

    </Tabs>
  );
}
