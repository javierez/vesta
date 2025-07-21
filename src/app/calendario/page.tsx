"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  MoreHorizontal,
  Plus,
  Search,
  CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Users,
  Video,
  Check,
  Filter,
  X,
  TableIcon,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "~/components/ui/badge"
import { ScrollArea } from "~/components/ui/scroll-area"
import { cn } from "~/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import Image from "next/image" // Add Image import for optimized images

// Mock data - replace with actual data from your database
const appointments = [
  {
    id: 1,
    title: "Visita de Propiedad",
    client: "Juan Pérez",
    property: "Apartamento Moderno en el Centro",
    date: (() => {
      const d = new Date()
      d.setDate(d.getDate() - d.getDay() + 1)
      return d.toISOString().split("T")[0] ?? ""
    })(), // Monday
    time: "10:00",
    endTime: "11:00",
    duration: "1 hora",
    status: "Programado",
    type: "Visita",
    location: "Calle Principal 123",
    description: "Visita para mostrar el apartamento al cliente potencial",
    attendees: ["Juan Pérez", "Ana Agente"],
    color: "#D32F2F",
  },
  {
    id: 2,
    title: "Reunión de Negociación",
    client: "María García",
    property: "Villa de Lujo con Piscina",
    date: (() => {
      const d = new Date()
      d.setDate(d.getDate() - d.getDay() + 3)
      return d.toISOString().split("T")[0] ?? ""
    })(), // Wednesday
    time: "15:00",
    endTime: "17:00",
    duration: "2 horas",
    status: "Programado",
    type: "Reunión",
    location: "Oficina Central",
    description: "Negociación final del precio de venta",
    attendees: ["María García", "Carlos Vendedor", "Ana Agente"],
    color: "#7B1FA2",
  },
  {
    id: 3,
    title: "Firma de Contrato",
    client: "Carlos López",
    property: "Chalet en las Afueras",
    date: (() => {
      const d = new Date()
      d.setDate(d.getDate() - d.getDay() + 5)
      return d.toISOString().split("T")[0] ?? ""
    })(), // Friday
    time: "12:00",
    endTime: "13:00",
    duration: "1 hora",
    status: "Programado",
    type: "Firma",
    location: "Notaría Central",
    description: "Firma del contrato de compraventa",
    attendees: ["Carlos López", "Ana Agente", "Notario García"],
    color: "#388E3C",
  },
  {
    id: 4,
    title: "Cierre de Venta",
    client: "Ana Torres",
    property: "Ático con Terraza",
    date: (() => {
      const d = new Date()
      d.setDate(d.getDate() - d.getDay() + 6)
      return d.toISOString().split("T")[0] ?? ""
    })(), // Saturday
    time: "09:00",
    endTime: "10:00",
    duration: "1 hora",
    status: "Completado",
    type: "Cierre",
    location: "Oficina Central",
    description: "Entrega de llaves y documentación final",
    attendees: ["Ana Torres", "Carlos Vendedor"],
    color: "#F57C00",
  },
  {
    id: 5,
    title: "Train to Madrid-Cham",
    client: "León",
    property: "Estación de tren",
    date: (() => {
      const d = new Date()
      d.setDate(d.getDate() - d.getDay() + 1)
      return d.toISOString().split("T")[0] ?? ""
    })(), // Monday
    time: "17:51",
    endTime: "19:30",
    duration: "1 hora 39 min",
    status: "Programado",
    type: "Viaje",
    location: "Estación León",
    description: "Viaje en tren a Madrid",
    attendees: ["Ana Agente"],
    color: "#689F38",
  },
]

const appointmentTypes = {
  Visita: { color: "bg-blue-100 text-blue-800", icon: "🏠" },
  Reunión: { color: "bg-purple-100 text-purple-800", icon: "👥" },
  Firma: { color: "bg-green-100 text-green-800", icon: "✍️" },
  Cierre: { color: "bg-yellow-100 text-yellow-800", icon: "🤝" },
  Viaje: { color: "bg-emerald-100 text-emerald-800", icon: "🚆" },
}

// Helper to get date string in YYYY-MM-DD
const getDateString = (date: Date) => date.toISOString().split("T")[0]

// Helper to parse time string to hours and minutes
const parseTime = (timeStr: string): { hours: number; minutes: number } => {
  const [hours = 0, minutes = 0] = timeStr.split(":").map(Number)
  return { hours, minutes }
}

// Helper to calculate event position and height
const calculateEventStyle = (startTime: string, endTime: string) => {
  const start = parseTime(startTime)
  const end = parseTime(endTime || startTime)

  // Calculate position from top (each hour is 60px height)
  const startMinutes = start.hours * 60 + start.minutes
  const endMinutes = end.hours * 60 + end.minutes

  // Start time relative to 7:00 (first hour in our grid)
  const topPosition = ((startMinutes - 7 * 60) / 60) * 60

  // Height based on duration
  const durationMinutes = endMinutes - startMinutes
  const height = (durationMinutes / 60) * 60

  return {
    top: `${topPosition}px`,
    height: `${height}px`,
  }
}

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [view, setView] = useState<"list" | "calendar" | "weekly">("weekly")
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(now.setDate(diff))
  })
  const [filteredAppointments, setFilteredAppointments] = useState(appointments)
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)

  const getWeekDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(day.getDate() + i)
      days.push(day)
    }
    return days
  }

  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
    }).format(date)
  }

  const formatWeekday = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "short",
    })
      .format(date)
      .toUpperCase()
  }

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
    }).format(date)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart = new Date(weekStart)
    newWeekStart.setDate(newWeekStart.getDate() + (direction === "next" ? 7 : -7))
    setWeekStart(newWeekStart)
  }

  const handleFilterChange = (filters: {
    searchQuery: string
    status: string[]
    type: string[]
    client: string[]
  }) => {
    const filtered = appointments.filter((appointment) => {
      const matchesSearch =
        appointment.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        appointment.client.toLowerCase().includes(filters.searchQuery.toLowerCase())
      const matchesType = filters.type.length === 0 || filters.type.includes(appointment.type)
      const matchesStatus = filters.status.length === 0 || filters.status.includes(appointment.status)
      const matchesClient = filters.client.length === 0 || filters.client.includes(appointment.client)
      return matchesSearch && matchesType && matchesStatus && matchesClient
    })
    setFilteredAppointments(filtered)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Citas</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/appointments/new">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Cita
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar citas..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              handleFilterChange({
                searchQuery: e.target.value,
                status: statusFilter === "all" ? [] : [statusFilter],
                type: typeFilter === "all" ? [] : [typeFilter],
                client: [],
              })
            }}
          />
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView(view === "list" ? "calendar" : view === "calendar" ? "weekly" : "list")}
            title={view === "list" ? "Ver como calendario" : view === "calendar" ? "Ver como semanal" : "Ver como lista"}
          >
            {view === "list" ? (
              <CalendarIcon className="h-4 w-4" />
            ) : view === "calendar" ? (
              <Clock className="h-4 w-4" />
            ) : (
              <TableIcon className="h-4 w-4" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title="Integraciones">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="https://calendar.google.com" target="_blank" className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image src="/logos/google-calendar.png" alt="Google Calendar" width={16} height={16} className="w-4 h-4 mr-2" />
                    <span>Google Calendar</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span className="text-xs">Integrado</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image src="/logos/outlook.png" alt="Outlook" width={16} height={16} className="w-4 h-4 mr-2" />
                  <span>Outlook Calendar</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span className="text-xs">No integrado</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {(typeFilter !== "all" || statusFilter !== "all") && (
                  <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                    {[typeFilter, statusFilter].filter(f => f !== "all").length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex flex-col">
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-6">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">Tipo</h5>
                      <div className="space-y-1">
                        {Object.keys(appointmentTypes).map((type) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer"
                            onClick={() => {
                              setTypeFilter(typeFilter === type ? "all" : type)
                              handleFilterChange({
                                searchQuery,
                                status: statusFilter === "all" ? [] : [statusFilter],
                                type: typeFilter === type ? [] : [type],
                                client: [],
                              })
                            }}
                          >
                            <div className={`h-4 w-4 rounded border flex items-center justify-center ${typeFilter === type ? 'bg-primary border-primary' : 'border-input'}`}>
                              {typeFilter === type && <Check className="h-3 w-3 text-primary-foreground" />}
                            </div>
                            <span className="text-sm">{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">Estado</h5>
                      <div className="space-y-1">
                        {["Programado", "Completado", "Cancelado"].map((status) => (
                          <div
                            key={status}
                            className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent rounded-sm cursor-pointer"
                            onClick={() => {
                              setStatusFilter(statusFilter === status ? "all" : status)
                              handleFilterChange({
                                searchQuery,
                                status: statusFilter === status ? [] : [status],
                                type: typeFilter === "all" ? [] : [typeFilter],
                                client: [],
                              })
                            }}
                          >
                            <div className={`h-4 w-4 rounded border flex items-center justify-center ${statusFilter === status ? 'bg-primary border-primary' : 'border-input'}`}>
                              {statusFilter === status && <Check className="h-3 w-3 text-primary-foreground" />}
                            </div>
                            <span className="text-sm">{status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                {(typeFilter !== "all" || statusFilter !== "all") && (
                  <div className="p-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setTypeFilter("all")
                        setStatusFilter("all")
                        handleFilterChange({
                          searchQuery,
                          status: [],
                          type: [],
                          client: [],
                        })
                      }}
                      className="w-full h-7 text-xs"
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Borrar filtros
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {view === "list" && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Propiedad</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.title}</TableCell>
                  <TableCell>{appointment.client}</TableCell>
                  <TableCell>{appointment.property}</TableCell>
                  <TableCell>{appointment.date}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={appointmentTypes[appointment.type as keyof typeof appointmentTypes]?.color}
                    >
                      {appointmentTypes[appointment.type as keyof typeof appointmentTypes]?.icon} {appointment.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        appointment.status === "Programado"
                          ? "bg-blue-100 text-blue-800"
                          : appointment.status === "Completado"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/appointments/${appointment.id}`}>Ver Detalles</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/appointments/${appointment.id}/edit`}>Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Cancelar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {view === "calendar" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <CardTitle>{appointment.title}</CardTitle>
                <CardDescription>{appointment.client}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {appointment.date}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {appointment.time} ({appointment.duration})
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {appointment.location}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Badge
                      variant="secondary"
                      className={appointmentTypes[appointment.type as keyof typeof appointmentTypes]?.color}
                    >
                      {appointmentTypes[appointment.type as keyof typeof appointmentTypes]?.icon} {appointment.type}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/appointments/${appointment.id}`}>Ver Detalles</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/appointments/${appointment.id}/edit`}>Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Cancelar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {view === "weekly" && (
        <Card className="border-none shadow-none">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center justify-between mb-4 px-4 sm:px-6 mt-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold">{formatMonthYear(weekStart)}</h3>
              </div>
              <Button variant="outline" onClick={() => setWeekStart(new Date())} className="ml-4">
                Hoy
              </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-8 border-b overflow-x-auto">
              {/* Time column header */}
              <div className="border-r h-14 flex items-center justify-center text-muted-foreground min-w-[60px]">GMT+02</div>

              {/* Day columns headers */}
              {getWeekDays().map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={cn(
                    "flex flex-col items-center justify-center h-14 relative min-w-[100px]",
                    isToday(day) && "bg-blue-50",
                  )}
                >
                  <div className="text-xs text-muted-foreground">{formatWeekday(day)}</div>
                  <div
                    className={cn(
                      "text-xl font-medium w-10 h-10 flex items-center justify-center rounded-full",
                      isToday(day) && "bg-blue-600 text-white",
                    )}
                  >
                    {formatShortDate(day)}
                  </div>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-8">
                {/* Hours column */}
                <div className="flex flex-col border-r">
                  {Array.from({ length: 14 }, (_, i) => 7 + i).map((hour) => (
                    <div
                      key={hour}
                      className="h-[60px] flex items-start justify-end pr-2 pt-1 text-xs text-muted-foreground border-b"
                    >
                      {hour}:00
                    </div>
                  ))}
                </div>

                {/* Days columns */}
                {getWeekDays().map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={cn("flex flex-col border-r relative", isToday(day) && "bg-blue-50/30")}
                  >
                    {/* Hour slots */}
                    {Array.from({ length: 14 }, (_, i) => 7 + i).map((hour) => (
                      <div key={hour} className="h-[60px] border-b relative">
                        {/* Half-hour divider */}
                        <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-200"></div>
                      </div>
                    ))}

                    {/* Appointments for this day */}
                    {filteredAppointments
                      .filter((app) => app.date === getDateString(day))
                      .map((app) => {
                        const eventStyle = calculateEventStyle(app.time, app.endTime)
                        return (
                          <div
                            key={app.id}
                            className={cn(
                              "absolute left-0.5 right-0.5 rounded-md px-2 py-1 overflow-hidden cursor-pointer hover:ring-2 hover:ring-black hover:ring-offset-2",
                              selectedEvent === app.id ? "ring-2 ring-black ring-offset-2" : "",
                            )}
                            style={{
                              top: eventStyle.top,
                              height: eventStyle.height,
                              backgroundColor: app.color || "#1976D2",
                              color: "white",
                            }}
                            onClick={() => setSelectedEvent(app.id)}
                          >
                            <div className="text-xs font-medium truncate">{app.title}</div>
                            <div className="text-xs opacity-90 truncate flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {app.time} - {app.endTime}
                            </div>
                            {eventStyle.height.replace("px", "") > "50" && (
                              <>
                                <div className="text-xs opacity-90 truncate flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3" />
                                  {app.location}
                                </div>
                                {app.attendees &&
                                  app.attendees.length > 0 &&
                                  eventStyle.height.replace("px", "") > "80" && (
                                    <div className="text-xs opacity-90 truncate flex items-center gap-1 mt-0.5">
                                      <Users className="h-3 w-3" />
                                      {app.attendees.length}{" "}
                                      {app.attendees.length === 1 ? "asistente" : "asistentes"}
                                    </div>
                                  )}
                              </>
                            )}
                          </div>
                        )
                      })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Event Detail Panel (shows when an event is selected) */}
      {selectedEvent !== null && (
        <div className="fixed right-4 top-20 w-80 bg-white rounded-lg shadow-lg border p-4 z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Detalles del Evento</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
              ×
            </Button>
          </div>

          {(() => {
            const event = appointments.find((a) => a.id === selectedEvent)
            if (!event) return null

            return (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">{event.client}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {event.time} - {event.endTime} ({event.duration})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  {event.description && (
                    <div className="pt-2 text-sm">
                      <p>{event.description}</p>
                    </div>
                  )}
                </div>

                {event.attendees && event.attendees.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-1">Asistentes</h5>
                    <div className="space-y-1">
                      {event.attendees.map((attendee, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            {attendee.charAt(0)}
                          </div>
                          <span>{attendee}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild className="flex-1">
                    <Link href={`/appointments/${event.id}/edit`}>Editar</Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Video className="h-4 w-4 mr-1" />
                    Reunión
                  </Button>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
} 