"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Plus, Trash2, Check, Mic, AlertCircle, CheckCircle2, Loader2, User, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Comments } from "./comments";
import { createTaskWithAuth, updateTaskWithAuth, deleteTaskWithAuth } from "~/server/queries/task";
import { getLeadsByListingIdWithAuth } from "~/server/queries/lead";
import { getDealsByListingIdWithAuth } from "~/server/queries/deal";
import { useSession } from "~/lib/auth-client";
import type { CommentWithUser } from "~/types/comments";

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
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
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
}

interface Lead {
  leadId: bigint;
  contactId: bigint;
  listingId: bigint;
  status: string;
  contact: {
    contactId: bigint;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

interface Deal {
  dealId: bigint;
  listingId: bigint;
  status: string;
  contact: {
    contactId: bigint;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

interface ContactOption {
  contactId: bigint;
  name: string;
  email?: string;
  source: 'lead' | 'deal';
  sourceId: bigint;
  sourceStatus: string;
}

interface Appointment {
  appointmentId: bigint;
  listingId?: bigint;
  datetimeStart: Date;
  datetimeEnd: Date;
  type?: string;
  status: string;
  contact: {
    contactId: bigint;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

interface TareasProps {
  propertyId: bigint;
  listingId: bigint;
  referenceNumber: string;
  tasks: Task[];
  loading?: boolean;
  comments?: CommentWithUser[];
}

export function Tareas({ propertyId, listingId, referenceNumber, tasks: initialTasks, loading: externalLoading, comments: initialComments = [] }: TareasProps) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    contactId: "",
    appointmentId: "",
    agentId: "",
  });
  const [taskStates, setTaskStates] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [appointments] = useState<Appointment[]>([]);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [agents] = useState<{ id: string; name: string; firstName?: string; lastName?: string; }[]>(
    session?.user ? [{
      id: session.user.id,
      name: session.user.name || '',
      firstName: session.user.name?.split(' ')[0] ?? undefined,
      lastName: session.user.name?.split(' ')[1] ?? undefined
    }] : []
  );
  const [loading, setLoading] = useState({
    leads: false,
    deals: false,
    appointments: false,
  });

  // Update tasks when props change
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);


  // Fetch leads and deals for dropdowns when user starts creating a task
  useEffect(() => {
    if (!isAdding) return;
    
    const fetchDropdownData = async () => {
      setLoading({ leads: true, deals: true, appointments: false });
      try {
        const [leadsData, dealsData] = await Promise.all([
          getLeadsByListingIdWithAuth(Number(listingId)),
          getDealsByListingIdWithAuth(Number(listingId))
        ]);
        
        const formattedLeads = leadsData.map((item: unknown) => {
          const typedItem = item as { listingContacts?: { listingContactId: bigint; contactId: bigint; listingId: bigint; status: string }; listing_contacts?: { listing_contact_id: bigint; contact_id: bigint; listing_id: bigint; status: string }; contacts?: { contactId: bigint; contact_id: bigint; firstName: string; first_name: string; lastName: string; last_name: string; email: string } };
          const leadId = typedItem.listingContacts?.listingContactId ?? typedItem.listing_contacts?.listing_contact_id;
          const contactId = typedItem.listingContacts?.contactId ?? typedItem.listing_contacts?.contact_id;
          const listingId = typedItem.listingContacts?.listingId ?? typedItem.listing_contacts?.listing_id;
          const status = typedItem.listingContacts?.status ?? typedItem.listing_contacts?.status;
          const contactDbId = typedItem.contacts?.contactId ?? typedItem.contacts?.contact_id;
          const firstName = typedItem.contacts?.firstName ?? typedItem.contacts?.first_name;
          const lastName = typedItem.contacts?.lastName ?? typedItem.contacts?.last_name;
          
          // Only return leads that have all required fields
          if (!leadId || !contactId || !listingId || !status || !contactDbId || !firstName || !lastName) {
            return null;
          }
          
          return {
            leadId,
            contactId,
            listingId,
            status,
            contact: {
              contactId: contactDbId,
              firstName,
              lastName,
              email: typedItem.contacts?.email,
            }
          };
        }).filter((lead): lead is NonNullable<typeof lead> => lead !== null);
        
        const formattedDeals = dealsData.map((item: unknown) => {
          const typedItem = item as { deals?: { dealId: bigint; deal_id: bigint; listingId: bigint; listing_id: bigint; status: string }; contacts?: { contactId: bigint; contact_id: bigint; firstName: string; first_name: string; lastName: string; last_name: string; email: string } };
          const dealId = typedItem.deals?.dealId ?? typedItem.deals?.deal_id;
          const listingId = typedItem.deals?.listingId ?? typedItem.deals?.listing_id;
          const status = typedItem.deals?.status;
          const contactId = typedItem.contacts?.contactId ?? typedItem.contacts?.contact_id;
          const firstName = typedItem.contacts?.firstName ?? typedItem.contacts?.first_name;
          const lastName = typedItem.contacts?.lastName ?? typedItem.contacts?.last_name;
          
          // Only return deals that have all required fields
          if (!dealId || !listingId || !status || !contactId || !firstName || !lastName) {
            return null;
          }
          
          return {
            dealId,
            listingId,
            status,
            contact: {
              contactId,
              firstName,
              lastName,
              email: typedItem.contacts?.email,
            }
          };
        }).filter((deal): deal is NonNullable<typeof deal> => deal !== null);
        
        setLeads(formattedLeads);
        setDeals(formattedDeals);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      } finally {
        setLoading({ leads: false, deals: false, appointments: false });
      }
    };

    void fetchDropdownData();
  }, [isAdding, listingId]);

  // Create unified contact list from leads and deals (prioritizing deals)
  useEffect(() => {
    const contactMap = new Map<string, ContactOption>();
    
    // Add contacts from leads first
    leads.forEach(lead => {
      const contactKey = lead.contact.contactId.toString();
      contactMap.set(contactKey, {
        contactId: lead.contact.contactId,
        name: `${lead.contact.firstName} ${lead.contact.lastName}`,
        email: lead.contact.email,
        source: 'lead',
        sourceId: lead.leadId,
        sourceStatus: lead.status
      });
    });
    
    // Add contacts from deals (this will overwrite leads if same contact exists)
    deals.forEach(deal => {
      const contactKey = deal.contact.contactId.toString();
      contactMap.set(contactKey, {
        contactId: deal.contact.contactId,
        name: `${deal.contact.firstName} ${deal.contact.lastName}`,
        email: deal.contact.email,
        source: 'deal',
        sourceId: deal.dealId,
        sourceStatus: deal.status
      });
    });
    
    const uniqueContacts = Array.from(contactMap.values());
    setContacts(uniqueContacts);
  }, [leads, deals]);

  // Initialize agent selection with current user when starting to add a task
  useEffect(() => {
    if (isAdding && !newTask.agentId && session?.user?.id) {
      setNewTask(prev => ({ ...prev, agentId: session.user.id }));
    }
  }, [isAdding, session?.user?.id, newTask.agentId]);


  // Auto-save draft functionality
  useEffect(() => {
    const draftKey = `task-draft-${listingId}`;
    
    // Save draft to localStorage when form data changes
    if (newTask.title || newTask.description) {
      localStorage.setItem(draftKey, JSON.stringify(newTask));
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [newTask, listingId]);

  // Load draft on component mount
  useEffect(() => {
    const draftKey = `task-draft-${listingId}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft) as typeof newTask;
        setNewTask(draft);
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem(draftKey);
      }
    }
  }, [listingId]);

  // Create unified contact list from leads and deals (prioritizing deals)
  useEffect(() => {
    const contactMap = new Map<string, ContactOption>();
    
    // Add contacts from leads first
    leads.forEach(lead => {
      const contactKey = lead.contact.contactId.toString();
      contactMap.set(contactKey, {
        contactId: lead.contact.contactId,
        name: `${lead.contact.firstName} ${lead.contact.lastName}`,
        email: lead.contact.email,
        source: 'lead',
        sourceId: lead.leadId,
        sourceStatus: lead.status
      });
    });
    
    // Add contacts from deals (this will overwrite leads if same contact exists)
    deals.forEach(deal => {
      const contactKey = deal.contact.contactId.toString();
      contactMap.set(contactKey, {
        contactId: deal.contact.contactId,
        name: `${deal.contact.firstName} ${deal.contact.lastName}`,
        email: deal.contact.email,
        source: 'deal',
        sourceId: deal.dealId,
        sourceStatus: deal.status
      });
    });
    
    const uniqueContacts = Array.from(contactMap.values());
    setContacts(uniqueContacts);
  }, [leads, deals]);

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) return;
    if (isSaving) return; // Prevent double submission

    setSaveError(null);
    setIsSaving(true);

    let relatedContact;
    let relatedAppointment;
    let leadId: bigint | undefined;
    let dealId: bigint | undefined;
    
    // Get related contact and determine lead/deal relationship
    if (newTask.contactId) {
      const selectedContact = contacts.find(c => c.contactId.toString() === newTask.contactId);
      if (selectedContact) {
        relatedContact = {
          contactId: selectedContact.contactId,
          name: selectedContact.name,
          email: selectedContact.email
        };
        
        // Set the appropriate lead or deal ID based on contact source
        if (selectedContact.source === 'lead') {
          leadId = selectedContact.sourceId;
        } else if (selectedContact.source === 'deal') {
          dealId = selectedContact.sourceId;
        }
      }
    }
    
    // Get appointment info if selected
    if (newTask.appointmentId) {
      const appointment = appointments.find(a => a.appointmentId.toString() === newTask.appointmentId);
      if (appointment) {
        relatedAppointment = {
          appointmentId: appointment.appointmentId,
          datetimeStart: appointment.datetimeStart,
          type: appointment.type
        };
      }
    }

    // Create optimistic task
    const optimisticId = Date.now().toString();
    const selectedUserId = newTask.agentId ?? (session?.user?.id ?? "current-user-id");
    const optimisticTask: Task = {
      id: optimisticId,
      userId: selectedUserId,
      title: newTask.title,
      description: newTask.description,
      completed: false,
      createdAt: new Date(),
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      listingId: listingId,
      leadId: leadId,
      dealId: dealId,
      appointmentId: newTask.appointmentId ? BigInt(newTask.appointmentId) : undefined,
      isActive: true,
      relatedContact,
      relatedAppointment
    };

    // OPTIMISTIC UPDATE: Add task to UI immediately
    setTasks([optimisticTask, ...tasks]);
    setTaskStates(prev => ({ ...prev, [optimisticId]: 'saving' }));
    
    // Clear form
    const formData = { ...newTask };
    setNewTask({ 
      title: "", 
      description: "", 
      dueDate: "", 
      dueTime: "",
      contactId: "", 
      appointmentId: "",
      agentId: ""
    });
    setIsAdding(false);

    // SERVER ACTION CALL in background
    try {
      const savedTask = await createTaskWithAuth({
        userId: selectedUserId,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        completed: false,
        listingId: BigInt(listingId),
        listingContactId: leadId ? BigInt(leadId) : undefined,
        dealId: dealId ? BigInt(dealId) : undefined,
        appointmentId: formData.appointmentId ? BigInt(formData.appointmentId) : undefined,
        isActive: true,
      });
      
      if (!savedTask) {
        throw new Error('Failed to save task');
      }
      
      // Server actions now return converted types, just add id and handle dates
      const savedTaskForComponent = {
        ...savedTask,
        id: savedTask.taskId?.toString() || optimisticId,
        taskId: savedTask.taskId ? BigInt(savedTask.taskId) : undefined,
        listingId: savedTask.listingId ? BigInt(savedTask.listingId) : undefined,
        leadId: savedTask.listingContactId ? BigInt(savedTask.listingContactId) : undefined,
        dealId: savedTask.dealId ? BigInt(savedTask.dealId) : undefined,
        appointmentId: savedTask.appointmentId ? BigInt(savedTask.appointmentId) : undefined,
        prospectId: savedTask.prospectId ? BigInt(savedTask.prospectId) : undefined,
        createdAt: new Date(savedTask.createdAt),
        updatedAt: savedTask.updatedAt ? new Date(savedTask.updatedAt) : undefined,
        dueDate: savedTask.dueDate ? new Date(savedTask.dueDate) : undefined,
        completed: savedTask.completed ?? false,
        isActive: savedTask.isActive ?? true,
      };
      
      // SUCCESS: Update with server response
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === optimisticId 
            ? { ...task, ...savedTaskForComponent } as Task
            : task
        )
      );
      setTaskStates(prev => ({ ...prev, [optimisticId]: 'saved' }));
      
      // Clear draft after successful save
      const draftKey = `task-draft-${listingId}`;
      localStorage.removeItem(draftKey);
      
      // Clear success state after 2 seconds
      setTimeout(() => {
        setTaskStates(prev => {
          const newStates = { ...prev };
          delete newStates[optimisticId];
          return newStates;
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error saving task:', error);
      
      // ERROR: Revert optimistic update
      setTasks(prevTasks => prevTasks.filter(task => task.id !== optimisticId));
      setTaskStates(prev => ({ ...prev, [optimisticId]: 'error' }));
      setSaveError(error instanceof Error ? error.message : 'Failed to save task');
      
      // Restore form data
      setNewTask(formData);
      setIsAdding(true);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setSaveError(null);
        setTaskStates(prev => {
          const newStates = { ...prev };
          delete newStates[optimisticId];
          return newStates;
        });
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCompleted = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task?.taskId) return;

    const newCompleted = !task.completed;

    // Optimistic update
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: newCompleted } : task
    ));

    try {
      await updateTaskWithAuth(Number(task.taskId), { completed: newCompleted });
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert optimistic update on error
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !newCompleted } : task
      ));
    }
  };

  const handleDeleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task?.taskId) return;

    // Optimistic update: remove from UI immediately
    setTasks(tasks.filter(task => task.id !== id));

    try {
      await deleteTaskWithAuth(Number(task.taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      // Revert optimistic update on error
      setTasks(prevTasks => [...prevTasks, task]);
    }
  };

  const toggleDescriptionExpansion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task toggle
    setExpandedDescriptions(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };



  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </Button>
          {(newTask.title || newTask.description) && !isAdding && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-md w-fit">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              Borrador guardado
            </div>
          )}
        </div>
      </div>

      {isAdding && (
        <Card className="w-full">
          <CardContent className="space-y-4 pt-4 md:pt-6 px-4 md:px-6" onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void handleAddTask();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setIsAdding(false);
              setSaveError(null);
            }
          }}>
            <Input
              placeholder="Título de la tarea"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <div className="relative">
              <Textarea
                placeholder="Descripción de la tarea"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="min-h-[80px] pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Próximamente: Grabación de voz"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-select">Asignar a</Label>
              <Select
                value={newTask.agentId}
                onValueChange={(value) => setNewTask({ ...newTask, agentId: value })}
                disabled={externalLoading}
              >
                <SelectTrigger className="h-8 text-gray-500">
                  <SelectValue placeholder={
                    externalLoading ? "Cargando agentes..." : 
                    agents.length === 0 ? "No hay agentes" : "Seleccionar agente"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name ?? (`${agent.firstName ?? ''} ${agent.lastName ?? ''}`.trim() || agent.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-select">Contacto</Label>
                <Select
                  value={newTask.contactId}
                  onValueChange={(value) => setNewTask({ ...newTask, contactId: value })}
                  disabled={externalLoading ?? loading.leads ?? loading.deals}
                >
                  <SelectTrigger className="h-8 text-gray-500">
                    <SelectValue placeholder={
                      (externalLoading || loading.leads || loading.deals) ? "Cargando contactos..." : 
                      contacts.length === 0 ? "No hay contactos" : "Seleccionar contacto"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.contactId.toString()} value={contact.contactId.toString()}>
                        {contact.name} ({contact.sourceStatus})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-select">Cita relacionada</Label>
                <Select
                  value={newTask.appointmentId}
                  onValueChange={(value) => setNewTask({ ...newTask, appointmentId: value })}
                  disabled={externalLoading}
                >
                  <SelectTrigger className="h-8 text-gray-500">
                    <SelectValue placeholder={
                      externalLoading ? "Cargando citas..." : 
                      appointments.length === 0 ? "No hay citas" : "Seleccionar cita"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {appointments.map((appointment) => (
                      <SelectItem key={appointment.appointmentId.toString()} value={appointment.appointmentId.toString()}>
                        {appointment.contact.firstName} {appointment.contact.lastName} - {appointment.type} ({appointment.datetimeStart.toLocaleDateString()})
                      </SelectItem>
                    ))}
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
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="h-8 text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-time">Hora límite</Label>
                <Input
                  id="due-time"
                  type="time"
                  value={newTask.dueTime}
                  onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                  className="h-8 text-gray-500"
                />
              </div>
            </div>
            {saveError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
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
              <div className="text-xs text-gray-500 hidden sm:block">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border rounded">Cmd+Enter</kbd> para guardar, <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border rounded">Esc</kbd> para cancelar
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  onClick={handleAddTask} 
                  disabled={isSaving || !newTask.title.trim() || !newTask.description.trim()}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAdding(false);
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
        {tasks.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <p className="text-sm sm:text-base">No hay tareas registradas para esta propiedad</p>
          </div>
        ) : (
          <div className="space-y-1">
{tasks.map((task) => {
              const getInitials = (firstName?: string, lastName?: string, name?: string) => {
                if (firstName && lastName) {
                  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
                }
                if (name) {
                  const parts = name.split(' ').filter(p => p.length > 0);
                  if (parts.length >= 2 && parts[0] && parts[1]) {
                    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
                  } else if (parts[0]) {
                    return parts[0].charAt(0).toUpperCase();
                  }
                }
                return 'U';
              };
              
              const getRemainingTime = (dueDate?: Date) => {
                if (!dueDate) return null;
                
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const taskDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                
                // Create full datetime - defaulting to end of day
                const fullDueDateTime = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate(), 23, 59);
                
                const diffMs = fullDueDateTime.getTime() - now.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                
                if (diffMs < 0) {
                  const overdueDays = Math.abs(diffDays);
                  const overdueHours = Math.abs(diffHours);
                  if (overdueDays > 0) {
                    return `${overdueDays} día${overdueDays !== 1 ? 's' : ''} vencido`;
                  } else if (overdueHours > 0) {
                    return `${overdueHours} hora${overdueHours !== 1 ? 's' : ''} vencido`;
                  } else {
                    return 'Vencido';
                  }
                }
                
                if (taskDate.getTime() === today.getTime()) {
                  // Same day
                  if (diffHours > 0) {
                    return `${diffHours} hora${diffHours !== 1 ? 's' : ''} restantes`;
                  } else if (diffMinutes > 0) {
                    return `${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''} restantes`;
                  } else {
                    return 'Vence ahora';
                  }
                } else {
                  // Different day
                  return `${diffDays} día${diffDays !== 1 ? 's' : ''} restantes`;
                }
              };
              
              return (
                <div 
                  key={task.id} 
                  className={`relative cursor-pointer p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 ${
                    task.completed ? 'bg-gray-50/50 opacity-75' : 'bg-white'
                  } ${taskStates[task.id] === 'saving' ? 'opacity-70' : ''}`}
                  onClick={() => handleToggleCompleted(task.id)}
                >
                  {/* User avatar - top right */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3" title={task.userName ?? `${task.userFirstName ?? ''} ${task.userLastName ?? ''}`.trim() || 'Usuario'}>
                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 ring-2 ring-gray-100">
                      <AvatarFallback className="text-xs font-medium">
                        {getInitials(task.userFirstName, task.userLastName, task.userName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Task content */}
                  <div className="pr-8 sm:pr-10">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      {/* Checkbox */}
                      <div 
                        className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                          task.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3" />}
                      </div>
                      
                      <h3 className={`font-semibold text-sm leading-tight ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      
                      {taskStates[task.id] === 'saving' && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                      )}
                      {taskStates[task.id] === 'saved' && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </div>
                    
                    <div className="ml-6 sm:ml-8 mb-3">
                      {(() => {
                        const isExpanded = expandedDescriptions[task.id];
                        const isLongDescription = task.description.length > 120;
                        const displayText = isExpanded || !isLongDescription 
                          ? task.description 
                          : task.description.substring(0, 120) + '...';
                        
                        return (
                          <div className="group">
                            <p className={`text-sm leading-relaxed ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                              {displayText}
                            </p>
                            {isLongDescription && (
                              <button
                                onClick={(e) => toggleDescriptionExpansion(task.id, e)}
                                className={`text-xs mt-1 flex items-center gap-1 transition-colors ${
                                  task.completed ? 'text-gray-400 hover:text-gray-500' : 'text-gray-500 hover:text-gray-700'
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
                    {(task.relatedContact ?? task.relatedAppointment ?? task.dueDate) && (
                      <div className="flex flex-wrap items-center gap-2 ml-6 sm:ml-8 mb-1">
                        {task.relatedContact && (
                          <span className="text-xs text-gray-500 flex items-center gap-1 font-normal break-words">
                            <User className="h-3 w-3 opacity-60 flex-shrink-0" />
                            <span className="truncate max-w-32 sm:max-w-none">{task.relatedContact.name}</span>
                          </span>
                        )}
                        {task.relatedAppointment && (
                          <Badge variant="outline" className="text-xs px-2 sm:px-2.5 py-1 flex items-center gap-1.5 font-medium">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{task.relatedAppointment.type}</span>
                          </Badge>
                        )}
                        {task.dueDate && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 sm:px-2.5 py-0.5 rounded-full font-normal border border-amber-200 whitespace-nowrap">
                            {getRemainingTime(task.dueDate)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Delete button - bottom right */}
                  <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDeleteTask(task.id);
                      }}
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 rounded-lg"
                    >
                      <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 sm:mt-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Comentarios</h3>
        <Comments 
          propertyId={propertyId}
          listingId={listingId}
          referenceNumber={referenceNumber}
          initialComments={initialComments}
          currentUserId={session?.user?.id}
          currentUser={session?.user ? {
            id: session.user.id,
            name: session.user.name ?? undefined,
            image: session.user.image ?? undefined
          } : undefined}
        />
      </div>
    </div>
  );
}