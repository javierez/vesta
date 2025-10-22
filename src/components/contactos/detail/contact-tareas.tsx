

import { useState, useEffect, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import {
  Plus,
  Trash2,
  Check,
  Mic,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit,
  Filter,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { ContactComments } from "./contact-comments";
import {
  createTaskWithAuth,
  updateTaskWithAuth,
} from "~/server/queries/task";
import { getContactListingsForTasksWithAuth } from "~/server/queries/user-comments";
import { useSession } from "~/lib/auth-client";
import type { UserCommentWithUser } from "~/types/user-comments";
import { canEditAllTasks, canDeleteAllTasks } from "~/app/actions/permissions/check-permissions";


interface ContactListing {
  listingContactId: number;
  listingId: number;
  contactType: string;
  street: string | null;
  city: string | null;
  province: string | null;
  propertyType: string | null;
  listingType: string | null;
  price: string | null;
  status: string | null;
}


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
  // User info for "Asignado a"
  userName?: string;
  userFirstName?: string;
  userLastName?: string;
  // Related entity info for display
  relatedContact?: {
    contactId: bigint;
    name: string;
    email?: string;
  };
  relatedAppointment?: {
    appointmentId: bigint;
    datetimeStart: Date;
    type?: string;
  };
  relatedProperty?: {
    street: string | null;
    city: string | null;
    province: string | null;
  };
  relatedDeal?: {
    dealId: bigint;
    status: string | null;
    role: string | null;
  };
}

interface ContactTareasProps {
  contactId: bigint;
  tasks?: Task[];
  loading?: boolean;
  comments?: UserCommentWithUser[];
  onToggleCompleted: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onAddTask: (task: Task) => Promise<Task>;
  onUpdateTaskAfterSave: (optimisticId: string, savedTask: Task) => void;
  onRemoveOptimisticTask: (optimisticId: string) => void;
  onAddComment: (comment: UserCommentWithUser) => Promise<{ success: boolean; error?: string }>;
  onEditComment: (commentId: bigint, content: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteComment: (commentId: bigint) => Promise<{ success: boolean; error?: string }>;
}

export function ContactTareas({
  contactId,
  tasks = [],
  loading: externalLoading,
  comments: initialComments = [],
  onToggleCompleted,
  onDeleteTask,
  onAddTask,
  onUpdateTaskAfterSave,
  onRemoveOptimisticTask,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: ContactTareasProps) {
  const { data: session } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    agentId: "",
  });
  const [taskStates, setTaskStates] = useState<
    Record<string, "saving" | "saved" | "error">
  >({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<string, boolean>
  >({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'contact' | 'property'>('all');

  // Permission states
  const [hasEditAllPermission, setHasEditAllPermission] = useState<boolean>(false);
  const [hasDeleteAllPermission, setHasDeleteAllPermission] = useState<boolean>(false);

  // Contact listings for task association
  const [contactListings, setContactListings] = useState<ContactListing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>('');

  // Agents list - simplified to just current user
  const [agents] = useState<
    { id: string; name: string; firstName?: string; lastName?: string }[]
  >(
    session?.user
      ? [
          {
            id: session.user.id,
            name: session.user.name || "",
            firstName: session.user.name?.split(" ")[0] ?? undefined,
            lastName: session.user.name?.split(" ")[1] ?? undefined,
          },
        ]
      : [],
  );

  // Load contact listings for task association
  useEffect(() => {
    const loadContactListings = async () => {
      try {
        const listings = await getContactListingsForTasksWithAuth(contactId);
        setContactListings(listings);
      } catch (error) {
        console.error("Error loading contact listings:", error);
      }
    };

    void loadContactListings();
  }, [contactId]);


  // Initialize agent selection with current user when starting to add a task
  useEffect(() => {
    if (isAdding && !newTask.agentId && session?.user?.id) {
      setNewTask((prev) => ({ ...prev, agentId: session.user.id }));
    }
  }, [isAdding, session?.user?.id, newTask.agentId]);

  // Fetch user permissions on component mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const [editAllPerm, deleteAllPerm] = await Promise.all([
          canEditAllTasks(),
          canDeleteAllTasks(),
        ]);
        setHasEditAllPermission(editAllPerm);
        setHasDeleteAllPermission(deleteAllPerm);
      } catch (error) {
        console.error('Error fetching task permissions:', error);
        setHasEditAllPermission(false);
        setHasDeleteAllPermission(false);
      }
    };

    void fetchPermissions();
  }, []); // Run once on mount

  // Auto-save draft functionality
  useEffect(() => {
    const draftKey = `contact-task-draft-${contactId}`;

    // Save draft to localStorage when form data changes
    if (newTask.title || newTask.description) {
      localStorage.setItem(draftKey, JSON.stringify({ 
        ...newTask, 
        selectedListingId 
      }));
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [newTask, contactId, selectedListingId]);

  // Load draft on component mount
  useEffect(() => {
    const draftKey = `contact-task-draft-${contactId}`;
    const savedDraft = localStorage.getItem(draftKey);

    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft) as typeof newTask & { selectedListingId?: string };
        setNewTask({
          title: draft.title || '',
          description: draft.description || '',
          dueDate: draft.dueDate || '',
          dueTime: draft.dueTime || '',
          agentId: draft.agentId || ''
        });
        if (draft.selectedListingId) setSelectedListingId(draft.selectedListingId);
      } catch (error) {
        console.error("Error loading draft:", error);
        localStorage.removeItem(draftKey);
      }
    }
  }, [contactId]);

  // Permission helper functions
  const canUserEditTask = (task: Task): boolean => {
    // User can edit if they created the task OR have editAll permission
    return task.createdBy === session?.user?.id || hasEditAllPermission;
  };

  const canUserDeleteTask = (task: Task): boolean => {
    // User can delete if they created the task OR have deleteAll permission
    return task.createdBy === session?.user?.id || hasDeleteAllPermission;
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) return;
    if (isSaving) return; // Prevent double submission

    setSaveError(null);
    setIsSaving(true);

    // Create optimistic task
    const optimisticId = Date.now().toString();
    const selectedUserId =
      newTask.agentId ?? session?.user?.id ?? "current-user-id";
    const optimisticTask: Task = {
      id: optimisticId,
      userId: selectedUserId,
      title: newTask.title,
      description: newTask.description,
      completed: false,
      createdAt: new Date(),
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      isActive: true,
    };

    // OPTIMISTIC UPDATE: Add task to UI immediately via parent
    await onAddTask(optimisticTask);
    setTaskStates((prev) => ({ ...prev, [optimisticId]: "saving" }));

    // Clear form
    const formData = { ...newTask };
    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      dueTime: "",
      agentId: "",
    });
    setSelectedListingId('');
    setIsAdding(false);

    // SERVER ACTION CALL in background
    try {
      // Prepare task data based on listing selection
      const taskData = {
        userId: selectedUserId,
        title: formData.title,
        description: formData.description,
        completed: false,
        isActive: true,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        dueTime: formData.dueDate ? (formData.dueTime || "00:00") : undefined,
        createdBy: session?.user?.id,
        // Entity associations
        contactId,
        listingId: selectedListingId ? BigInt(selectedListingId) : undefined,
        listingContactId: selectedListingId ?
          BigInt(contactListings.find(l => l.listingId.toString() === selectedListingId)?.listingContactId ?? 0) : undefined,
        dealId: undefined,
        appointmentId: undefined,
        prospectId: undefined,
      };
      
      const savedTask = await createTaskWithAuth(taskData);

      if (!savedTask) {
        throw new Error('Failed to save task');
      }

      // SUCCESS: Update with server response via parent
      const updatedTask: Task = {
        ...optimisticTask,
        taskId: savedTask.taskId ? BigInt(savedTask.taskId) : undefined,
        createdAt: new Date(savedTask.createdAt),
        updatedAt: savedTask.updatedAt
          ? new Date(savedTask.updatedAt)
          : undefined,
      };
      
      onUpdateTaskAfterSave(optimisticId, updatedTask);
      setTaskStates((prev) => ({ ...prev, [optimisticId]: "saved" }));

      // Clear draft after successful save
      const draftKey = `contact-task-draft-${contactId}`;
      localStorage.removeItem(draftKey);

      // Clear success state after 2 seconds
      setTimeout(() => {
        setTaskStates((prev) => {
          const newStates = { ...prev };
          delete newStates[optimisticId];
          return newStates;
        });
      }, 2000);
    } catch (error) {
      console.error("Error saving task:", error);

      // ERROR: Revert optimistic update via parent
      onRemoveOptimisticTask(optimisticId);
      setTaskStates((prev) => ({ ...prev, [optimisticId]: "error" }));
      setSaveError(
        error instanceof Error ? error.message : "Failed to save task",
      );

      // Restore form data
      setNewTask(formData);
      setIsAdding(true);

      // Clear error after 5 seconds
      setTimeout(() => {
        setSaveError(null);
        setTaskStates((prev) => {
          const newStates = { ...prev };
          delete newStates[optimisticId];
          return newStates;
        });
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsAdding(true);
    
    // Pre-fill form with task data
    const dueDateString: string = task.dueDate?.toISOString().split('T')[0] ?? "";
    const dueTimeString: string = task.dueDate?.toTimeString().slice(0, 5) ?? "";
    
    setNewTask({
      title: task.title,
      description: task.description,
      dueDate: dueDateString,
      dueTime: dueTimeString,
      agentId: task.userId,
    });
    
    // Set the selected listing if the task has one
    if (task.listingId) {
      setSelectedListingId(task.listingId.toString());
    } else {
      setSelectedListingId('');
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !newTask.title.trim() || !newTask.description.trim()) return;
    if (isSaving) return;

    setSaveError(null);
    setIsSaving(true);

    // Create updated task object
    const updatedTask: Task = {
      ...editingTask,
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      userId: newTask.agentId,
      listingId: selectedListingId ? BigInt(selectedListingId) : undefined,
      updatedAt: new Date(),
    };

    // Set saving state
    setTaskStates(prev => ({ ...prev, [editingTask.id]: 'saving' }));

    try {
      const savedTask = await updateTaskWithAuth(
        Number(editingTask.taskId ?? editingTask.id),
        {
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
          dueTime: newTask.dueDate ? (newTask.dueTime || "00:00") : undefined,
          userId: newTask.agentId,
          contactId,
          listingId: selectedListingId ? BigInt(selectedListingId) : undefined,
          listingContactId: selectedListingId ? 
            BigInt(contactListings.find(l => l.listingId.toString() === selectedListingId)?.listingContactId ?? 0) : undefined,
        }
      );
      
      if (!savedTask) {
        throw new Error('Failed to update task');
      }
      
      // Update the task in the parent component
      onUpdateTaskAfterSave(editingTask.id, updatedTask);
      setTaskStates(prev => ({ ...prev, [editingTask.id]: 'saved' }));
      
      // Clear form and editing state
      setNewTask({ 
        title: "", 
        description: "", 
        dueDate: "", 
        dueTime: "",
        agentId: ""
      });
      setSelectedListingId('');
      setEditingTask(null);
      setIsAdding(false);
      
      // Clear success state after 2 seconds
      setTimeout(() => {
        setTaskStates(prev => {
          const newStates = { ...prev };
          delete newStates[editingTask.id];
          return newStates;
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error updating task:', error);
      setTaskStates(prev => ({ ...prev, [editingTask.id]: 'error' }));
      setSaveError(error instanceof Error ? error.message : 'Failed to update task');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setSaveError(null);
        setTaskStates(prev => {
          const newStates = { ...prev };
          delete newStates[editingTask.id];
          return newStates;
        });
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCompleted = async (id: string) => {
    await onToggleCompleted(id);
  };

  const handleDeleteTask = async (id: string) => {
    await onDeleteTask(id);
  };

  const toggleDescriptionExpansion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task toggle
    setExpandedDescriptions((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Filter and sort tasks by category
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filter by category
    if (categoryFilter === 'contact') {
      filtered = filtered.filter(task => task.relatedContact ?? task.contactId);
    } else if (categoryFilter === 'property') {
      filtered = filtered.filter(task => !task.relatedContact && !task.contactId);
    }

    // Sort: incomplete first, then by due date
    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return 0;
    });
  }, [tasks, categoryFilter]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg sm:text-xl font-semibold">Tareas</h3>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative h-8 w-8 p-0 shadow text-gray-600">
                <Filter className="h-3.5 w-3.5" />
                {categoryFilter !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px] font-normal"
                  >
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1">
                <div
                  className={`flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors ${
                    categoryFilter === 'all' ? 'bg-accent' : ''
                  }`}
                  onClick={() => setCategoryFilter('all')}
                >
                  <div
                    className={`flex h-3 w-3 items-center justify-center rounded border ${
                      categoryFilter === 'all' ? 'border-primary bg-primary' : 'border-input'
                    }`}
                  >
                    {categoryFilter === 'all' && <Check className="h-2 w-2 text-primary-foreground" />}
                  </div>
                  <span className={categoryFilter === 'all' ? 'font-medium' : ''}>Todas</span>
                </div>
                <div
                  className={`flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors ${
                    categoryFilter === 'contact' ? 'bg-accent' : ''
                  }`}
                  onClick={() => setCategoryFilter('contact')}
                >
                  <div
                    className={`flex h-3 w-3 items-center justify-center rounded border ${
                      categoryFilter === 'contact' ? 'border-primary bg-primary' : 'border-input'
                    }`}
                  >
                    {categoryFilter === 'contact' && <Check className="h-2 w-2 text-primary-foreground" />}
                  </div>
                  <span className={categoryFilter === 'contact' ? 'font-medium' : ''}>Con contacto</span>
                </div>
                <div
                  className={`flex cursor-pointer items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent transition-colors ${
                    categoryFilter === 'property' ? 'bg-accent' : ''
                  }`}
                  onClick={() => setCategoryFilter('property')}
                >
                  <div
                    className={`flex h-3 w-3 items-center justify-center rounded border ${
                      categoryFilter === 'property' ? 'border-primary bg-primary' : 'border-input'
                    }`}
                  >
                    {categoryFilter === 'property' && <Check className="h-2 w-2 text-primary-foreground" />}
                  </div>
                  <span className={categoryFilter === 'property' ? 'font-medium' : ''}>De propiedad</span>
                </div>
              </div>
              {categoryFilter !== 'all' && (
                <>
                  <Separator className="my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCategoryFilter('all')}
                    className="h-7 w-full text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Borrar filtro
                  </Button>
                </>
              )}
            </PopoverContent>
          </Popover>
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsAdding(true);
            }}
            variant="outline"
            className="flex items-center gap-2 h-8 text-sm shadow text-gray-600"
          >
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Button>
          {(newTask.title || newTask.description) && !isAdding && (
            <div
              className="w-3 h-3 bg-amber-400 rounded-full animate-pulse cursor-help"
              title="Borrador guardado"
            />
          )}
        </div>
      </div>

      {isAdding && (
        <Card className="w-full">
          <CardContent
            className="space-y-4 px-4 pt-4 md:px-6 md:pt-6"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (editingTask) {
                  void handleUpdateTask();
                } else {
                  void handleAddTask();
                }
              } else if (e.key === "Escape") {
                e.preventDefault();
                setIsAdding(false);
                setEditingTask(null);
                setSaveError(null);
              }
            }}
          >
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {editingTask ? 'Editando tarea' : 'Nueva tarea'}
              </Label>
              <Input
                placeholder="Título de la tarea"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />
            </div>
            <div className="relative">
              <Textarea
                placeholder="Descripción de la tarea"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="min-h-[80px] pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-2 p-1 text-gray-400 transition-colors hover:text-gray-600"
                title="Próximamente: Grabación de voz"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
            
            {/* Listing selector in same row as Agent */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="agent-select">Asignar a</Label>
                <Select
                  value={newTask.agentId}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, agentId: value })
                  }
                  disabled={externalLoading}
                >
                  <SelectTrigger className="h-8 text-gray-500">
                    <SelectValue
                      placeholder={
                        externalLoading
                          ? "Cargando agentes..."
                          : agents.length === 0
                            ? "No hay agentes"
                            : "Seleccionar agente"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name ??
                          (`${agent.firstName ?? ""} ${agent.lastName ?? ""}`.trim() ||
                            agent.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="listing-select">Propiedad (opcional)</Label>
                <Select
                  value={selectedListingId}
                  onValueChange={setSelectedListingId}
                >
                  <SelectTrigger className="h-8 text-gray-500">
                    <SelectValue placeholder="Sin propiedad específica" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactListings.length === 0 ? (
                      <SelectItem value="no-properties" disabled className="pl-2">
                        No hay propiedades asociadas
                      </SelectItem>
                    ) : (
                      contactListings.map((listing) => (
                        <SelectItem 
                          key={listing.listingContactId} 
                          value={listing.listingId.toString()}
                          className="text-left pl-2"
                        >
                          {listing.street ?? 'Sin dirección'} - {listing.city}, {listing.province} ({listing.contactType})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due-date">Fecha límite</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="h-8 text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-time">Hora límite</Label>
                <Input
                  id="due-time"
                  type="time"
                  value={newTask.dueTime}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueTime: e.target.value })
                  }
                  className="h-8 text-gray-500"
                />
              </div>
            </div>
            {saveError && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{saveError}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSaveError(null)}
                  className="ml-auto h-6"
                >
                  Dismiss
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="hidden text-xs text-gray-500 sm:block">
                <kbd className="rounded border bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                  Cmd+Enter
                </kbd>{" "}
                para guardar,{" "}
                <kbd className="rounded border bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                  Esc
                </kbd>{" "}
                para cancelar
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  onClick={editingTask ? handleUpdateTask : handleAddTask}
                  disabled={
                    isSaving ||
                    !newTask.title.trim() ||
                    !newTask.description.trim()
                  }
                  className="flex w-full items-center gap-2 sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingTask ? 'Actualizando...' : 'Guardando...'}
                    </>
                  ) : (
                    editingTask ? 'Actualizar' : 'Guardar'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingTask(null);
                    setSaveError(null);
                  }}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="py-6 text-center text-gray-500 sm:py-8">
            <p className="text-sm sm:text-base">
              {categoryFilter !== 'all'
                ? `No hay tareas ${categoryFilter === 'contact' ? 'con contacto' : 'de propiedad'}`
                : 'No hay tareas registradas para este contacto'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTasks.map((task) => {
              const getInitials = (
                firstName?: string,
                lastName?: string,
                name?: string,
              ) => {
                if (firstName && lastName) {
                  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
                }
                if (name) {
                  const parts = name.split(" ").filter((p) => p.length > 0);
                  if (parts.length >= 2 && parts[0] && parts[1]) {
                    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
                  } else if (parts[0]) {
                    return parts[0].charAt(0).toUpperCase();
                  }
                }
                return "U";
              };

              const getRemainingTime = (dueDate?: Date) => {
                if (!dueDate) return null;

                const now = new Date();
                const today = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                );
                const taskDate = new Date(
                  dueDate.getFullYear(),
                  dueDate.getMonth(),
                  dueDate.getDate(),
                );

                // Create full datetime - defaulting to end of day
                const fullDueDateTime = new Date(
                  dueDate.getFullYear(),
                  dueDate.getMonth(),
                  dueDate.getDate(),
                  23,
                  59,
                );

                const diffMs = fullDueDateTime.getTime() - now.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor(diffMs / (1000 * 60));

                if (diffMs < 0) {
                  const overdueDays = Math.abs(diffDays);
                  const overdueHours = Math.abs(diffHours);
                  if (overdueDays > 0) {
                    return `${overdueDays} día${overdueDays !== 1 ? "s" : ""} vencido`;
                  } else if (overdueHours > 0) {
                    return `${overdueHours} hora${overdueHours !== 1 ? "s" : ""} vencido`;
                  } else {
                    return "Vencido";
                  }
                }

                if (taskDate.getTime() === today.getTime()) {
                  // Same day
                  if (diffHours > 0) {
                    return `${diffHours} hora${diffHours !== 1 ? "s" : ""} restantes`;
                  } else if (diffMinutes > 0) {
                    return `${diffMinutes} minuto${diffMinutes !== 1 ? "s" : ""} restantes`;
                  } else {
                    return "Vence ahora";
                  }
                } else {
                  // Different day
                  return `${diffDays} día${diffDays !== 1 ? "s" : ""} restantes`;
                }
              };

              return (
                <div
                  key={task.id}
                  className={`group relative cursor-pointer rounded-xl shadow-md hover:shadow-lg p-3 transition-all duration-200 sm:p-4 ${
                    task.completed ? "bg-gray-50/50 opacity-75" : "bg-white"
                  } ${taskStates[task.id] === "saving" ? "opacity-70" : ""}`}
                  onClick={() => handleToggleCompleted(task.id)}
                >
                  {/* User avatar - top right */}
                  <div className="absolute right-2 top-2 sm:right-3 sm:top-3 flex flex-col items-center gap-1">
                    <div title={task.userName ?? (`${task.userFirstName ?? ""} ${task.userLastName ?? ""}`.trim() || "Usuario")}>
                      <Avatar className="h-6 w-6 ring-2 ring-gray-100 sm:h-7 sm:w-7">
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(
                            task.userFirstName,
                            task.userLastName,
                            task.userName,
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {/* System task indicator - under avatar */}
                    {task.createdBy === "0" && (
                      <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center" title="Tarea del sistema">
                        <img
                          src="/favicon.ico"
                          alt="Sistema"
                          className="h-4 w-4 sm:h-5 sm:w-5 object-contain opacity-60"
                        />
                      </div>
                    )}
                  </div>

                  {/* Task content */}
                  <div className="pr-8 sm:pr-10">
                    <div className="mb-2 flex items-center gap-2 sm:gap-3">
                      {/* Checkbox */}
                      <div
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                          task.completed
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {task.completed && <Check className="h-3 w-3" />}
                      </div>

                      <h3
                        className={`text-sm font-semibold leading-tight ${task.completed ? "text-gray-500 line-through" : "text-gray-900"}`}
                      >
                        {task.title}
                      </h3>

                      {taskStates[task.id] === "saving" && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                      )}
                      {taskStates[task.id] === "saved" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </div>

                    <div className="mb-3 ml-6 sm:ml-8">
                      {(() => {
                        const isExpanded = expandedDescriptions[task.id];
                        const isLongDescription = task.description.length > 120;
                        const displayText =
                          isExpanded || !isLongDescription
                            ? task.description
                            : task.description.substring(0, 120) + "...";

                        return (
                          <div className="group">
                            <p
                              className={`text-sm leading-relaxed ${task.completed ? "text-gray-400 line-through" : "text-gray-600"}`}
                            >
                              {displayText}
                            </p>
                            {isLongDescription && (
                              <button
                                onClick={(e) =>
                                  toggleDescriptionExpansion(task.id, e)
                                }
                                className={`mt-1 flex items-center gap-1 text-xs transition-colors ${
                                  task.completed
                                    ? "text-gray-400 hover:text-gray-500"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Ver menos</span>
                                    <ChevronUp className="h-3 w-3" />
                                  </>
                                ) : (
                                  <>
                                    <span>Ver más</span>
                                    <ChevronDown className="h-3 w-3" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Related items with time */}
                    {(task.relatedContact ??
                      task.relatedAppointment ??
                      task.dueDate) && (
                      <div className="mb-1 ml-6 flex flex-wrap items-center gap-2 sm:ml-8">
                        {task.relatedContact && (
                          <span className="flex items-center gap-1 break-words text-xs font-normal text-gray-500">
                            <User className="h-3 w-3 flex-shrink-0 opacity-60" />
                            <span className="max-w-32 truncate sm:max-w-none">
                              {task.relatedContact.name}
                            </span>
                          </span>
                        )}
                        {task.relatedAppointment && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium sm:px-2.5"
                          >
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {task.relatedAppointment.type}
                            </span>
                          </Badge>
                        )}
                        {task.dueDate && (
                          <span className="whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-normal text-amber-600 sm:px-2.5">
                            {getRemainingTime(task.dueDate)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons - bottom right */}
                  <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 sm:bottom-2 sm:right-2">
                    {canUserEditTask(task) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                        className="h-6 w-6 rounded-lg p-0 text-gray-400 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-500 sm:h-7 sm:w-7"
                        title="Editar tarea"
                      >
                        <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    )}
                    {canUserDeleteTask(task) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeleteTask(task.id);
                        }}
                        className="h-6 w-6 rounded-lg p-0 text-gray-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-500 sm:h-7 sm:w-7"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 sm:mt-8">
        <h3 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
          Comentarios
        </h3>
        <ContactComments
          contactId={contactId}
          initialComments={initialComments}
          currentUserId={session?.user?.id}
          currentUser={
            session?.user
              ? {
                  id: session.user.id,
                  name: session.user.name ?? undefined,
                  image: session.user.image ?? undefined,
                }
              : undefined
          }
          onAddComment={onAddComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
        />
      </div>
    </div>
  );
}
