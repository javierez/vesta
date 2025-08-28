"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Plus, Trash2, Check, Mic, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Comments } from "./comments";
import { createTaskWithAuth, updateTaskWithAuth, softDeleteTaskWithAuth } from "~/server/queries/task";
import { getLeadsByListingIdWithAuth } from "~/server/queries/lead";
import { getDealsByListingIdWithAuth } from "~/server/queries/deal";
import { useSession } from "~/lib/auth-client";

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
}

export function Tareas({ propertyId, listingId, referenceNumber, tasks: initialTasks, loading: externalLoading }: TareasProps) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    contactId: "",
    appointmentId: "",
  });
  const [taskStates, setTaskStates] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [appointments] = useState<Appointment[]>([]);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
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
        
        const formattedLeads = leadsData.map((item: any) => ({
          leadId: item.leads.leadId,
          contactId: item.leads.contactId,
          listingId: item.leads.listingId,
          status: item.leads.status,
          contact: {
            contactId: item.contacts.contactId,
            firstName: item.contacts.firstName,
            lastName: item.contacts.lastName,
            email: item.contacts.email,
          }
        }));
        
        const formattedDeals = dealsData.map((item: any) => ({
          dealId: item.deals.dealId,
          listingId: item.deals.listingId,
          status: item.deals.status,
          contact: {
            contactId: item.contacts?.contactId || BigInt(0),
            firstName: item.contacts?.firstName || '',
            lastName: item.contacts?.lastName || '',
            email: item.contacts?.email,
          }
        }));
        
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
        const draft = JSON.parse(savedDraft);
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
    const optimisticTask: Task = {
      id: optimisticId,
      userId: session?.user?.id ?? "current-user-id",
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
      contactId: "", 
      appointmentId: "" 
    });
    setIsAdding(false);

    // SERVER ACTION CALL in background
    try {
      const savedTask = await createTaskWithAuth({
        userId: session?.user?.id ?? "current-user-id",
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        completed: false,
        listingId: BigInt(listingId),
        leadId: leadId ? BigInt(leadId) : undefined,
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
        leadId: savedTask.leadId ? BigInt(savedTask.leadId) : undefined,
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
      await softDeleteTaskWithAuth(Number(task.taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      // Revert optimistic update on error
      setTasks(prevTasks => [...prevTasks, task]);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Tarea
          {(newTask.title || newTask.description) && !isAdding && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
              Borrador guardado
            </span>
          )}
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardContent className="space-y-4 pt-6" onKeyDown={(e) => {
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-select">Contacto</Label>
                <Select
                  value={newTask.contactId}
                  onValueChange={(value) => setNewTask({ ...newTask, contactId: value })}
                  disabled={externalLoading || loading.leads || loading.deals}
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
                        {contact.name} - {contact.source === 'lead' ? 'Lead' : 'Deal'} ({contact.sourceStatus})
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
                  disabled={externalLoading || loading.appointments}
                >
                  <SelectTrigger className="h-8 text-gray-500">
                    <SelectValue placeholder={
                      (externalLoading || loading.appointments) ? "Cargando citas..." : 
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
              <div className="text-xs text-gray-500">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border rounded">Cmd+Enter</kbd> para guardar, <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border rounded">Esc</kbd> para cancelar
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddTask} 
                  disabled={isSaving || !newTask.title.trim() || !newTask.description.trim()}
                  className="flex items-center gap-2"
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
          <div className="text-center py-8 text-gray-500">
            <p>No hay tareas registradas para esta propiedad</p>
          </div>
        ) : (
          <div className="space-y-1">
{tasks.map((task) => {
              const getInitials = (firstName?: string, lastName?: string, name?: string) => {
                if (firstName && lastName) {
                  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
                }
                if (name) {
                  const parts = name.split(' ');
                  return parts.length > 1 
                    ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
                    : name.charAt(0).toUpperCase();
                }
                return 'U';
              };
              
              return (
                <div 
                  key={task.id} 
                  className={`relative cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors ${
                    task.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                  } ${taskStates[task.id] === 'saving' ? 'opacity-70' : ''}`}
                  onClick={() => handleToggleCompleted(task.id)}
                >
                  {/* User avatar - top right */}
                  <div className="absolute top-2 right-2" title={task.userName || `${task.userFirstName || ''} ${task.userLastName || ''}`.trim() || 'Usuario'}>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(task.userFirstName, task.userLastName, task.userName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Task content */}
                  <div className="pr-8 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Checkbox */}
                      <div 
                        className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                          task.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300'
                        }`}
                      >
                        {task.completed && <Check className="w-2.5 h-2.5" />}
                      </div>
                      
                      <h3 className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      
                      {taskStates[task.id] === 'saving' && (
                        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                      )}
                      {taskStates[task.id] === 'saved' && (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                    
                    <p className={`text-xs mb-2 ml-6 ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                    
                    {task.dueDate && (
                      <div className="text-xs text-gray-500 ml-6">
                        Plazo: {task.dueDate.toLocaleDateString()}
                      </div>
                    )}
                    
                    {/* Related items */}
                    {(task.relatedContact || task.relatedAppointment) && (
                      <div className="flex gap-2 mt-2 ml-6">
                        {task.relatedContact && (
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            👤 {task.relatedContact.name}
                          </Badge>
                        )}
                        {task.relatedAppointment && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            📅 {task.relatedAppointment.type}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Delete button - bottom right */}
                  <div className="absolute bottom-2 right-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Comentarios</h3>
        <Comments 
          propertyId={propertyId}
          listingId={listingId}
          referenceNumber={referenceNumber}
        />
      </div>
    </div>
  );
}