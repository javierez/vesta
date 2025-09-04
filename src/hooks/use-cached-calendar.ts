"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { getAppointmentsByDateRangeAction } from "~/server/actions/appointments";

// Re-export types from use-appointments for compatibility
interface CalendarEvent {
  appointmentId: bigint;
  contactName: string;
  propertyAddress?: string;
  startTime: Date;
  endTime: Date;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled" | "NoShow";
  type: string;
  tripTimeMinutes?: number;
  notes?: string;
  contactId: bigint;
  listingId?: bigint | null;
  listingContactId?: bigint | null;
  dealId?: bigint | null;
  prospectId?: bigint | null;
  agentName?: string | null;
  isOptimistic?: boolean;
}

interface RawAppointment {
  appointmentId: bigint;
  userId: string;
  contactId: bigint;
  listingId: bigint | null;
  listingContactId: bigint | null;
  dealId: bigint | null;
  prospectId: bigint | null;
  datetimeStart: Date;
  datetimeEnd: Date;
  tripTimeMinutes: number | null;
  status: string;
  notes: string | null;
  type: string | null;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  contactFirstName: string | null;
  contactLastName: string | null;
  propertyStreet: string | null;
  agentName: string | null;
  agentFirstName: string | null;
  agentLastName: string | null;
}

interface UseCachedCalendarReturn {
  appointments: CalendarEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchByDateRange: (startDate: Date, endDate: Date) => Promise<void>;
  addOptimisticEvent: (event: Partial<CalendarEvent>) => bigint;
  removeOptimisticEvent: (tempId: bigint) => void;
  updateOptimisticEvent: (tempId: bigint, updates: Partial<CalendarEvent>) => void;
  clearCache: () => void;
  getCacheStats: () => CacheStats;
}

interface WeekCache {
  appointments: CalendarEvent[];
  optimisticEvents: CalendarEvent[];
  timestamp: number;
  lastRefresh: number;
  isStale: boolean;
}

interface CacheStats {
  totalWeeks: number;
  oldestWeek: string | null;
  newestWeek: string | null;
  totalEvents: number;
  optimisticEvents: number;
}

interface PrefetchRequest {
  weekKey: string;
  priority: number;
  startDate: Date;
  endDate: Date;
}

// Constants
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const BACKGROUND_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_CONCURRENT_REQUESTS = 2;
const LRU_MAX_WEEKS = 26; // 6 months worth of weeks
const AUTO_CLEANUP_TIMEOUT = 30 * 1000; // 30 seconds for optimistic events

// Utility functions
function getWeekKey(date: Date): string {
  const monday = getMonday(date);
  return `${monday.getFullYear()}-W${String(getWeekNumber(monday)).padStart(2, '0')}`;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}


function generateTempId(): bigint {
  return BigInt(-Date.now());
}

function transformToOptimisticEvent(eventData: Partial<CalendarEvent>, tempId: bigint): CalendarEvent {
  const now = new Date();
  return {
    appointmentId: tempId,
    contactName: eventData.contactName ?? "New Contact",
    propertyAddress: eventData.propertyAddress,
    startTime: eventData.startTime ?? now,
    endTime: eventData.endTime ?? new Date(now.getTime() + 60 * 60 * 1000),
    status: eventData.status ?? "Scheduled",
    type: eventData.type ?? "Visita",
    tripTimeMinutes: eventData.tripTimeMinutes,
    notes: eventData.notes,
    contactId: eventData.contactId ?? BigInt(0),
    listingId: eventData.listingId,
    listingContactId: eventData.listingContactId,
    dealId: eventData.dealId,
    prospectId: eventData.prospectId,
    agentName: eventData.agentName,
    isOptimistic: true,
  };
}

function transformToCalendarEvent(rawAppointment: RawAppointment): CalendarEvent {
  const contactName =
    rawAppointment.contactFirstName && rawAppointment.contactLastName
      ? `${rawAppointment.contactFirstName} ${rawAppointment.contactLastName}`
      : `Contact ${rawAppointment.contactId}`;

  return {
    appointmentId: rawAppointment.appointmentId,
    contactName,
    propertyAddress: rawAppointment.propertyStreet ?? undefined,
    startTime: rawAppointment.datetimeStart,
    endTime: rawAppointment.datetimeEnd,
    status: (rawAppointment.status as "Scheduled" | "Completed" | "Cancelled" | "Rescheduled" | "NoShow") ?? "Scheduled",
    type: rawAppointment.type ?? "Visita",
    tripTimeMinutes: rawAppointment.tripTimeMinutes ?? undefined,
    notes: rawAppointment.notes ?? undefined,
    contactId: rawAppointment.contactId,
    listingId: rawAppointment.listingId,
    listingContactId: rawAppointment.listingContactId,
    dealId: rawAppointment.dealId,
    prospectId: rawAppointment.prospectId,
    agentName: rawAppointment.agentName,
    isOptimistic: false,
  };
}

function mergeAndSortEvents(serverEvents: CalendarEvent[], optimisticEvents: CalendarEvent[]): CalendarEvent[] {
  const allEvents = [...serverEvents, ...optimisticEvents];
  return allEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

// Main hook
export function useCachedCalendar(currentWeekStart: Date): UseCachedCalendarReturn {
  // Cache storage
  const cacheRef = useRef<Map<string, WeekCache>>(new Map());
  const accessOrderRef = useRef<string[]>([]);
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheVersion, setCacheVersion] = useState(0);
  
  // Prefetch management
  const prefetchQueueRef = useRef<PrefetchRequest[]>([]);
  const activeFetchesRef = useRef<Set<string>>(new Set());
  const prefetchTimeoutRef = useRef<number | undefined>(undefined);
  
  // Background refresh
  const refreshIntervalRef = useRef<number | undefined>(undefined);
  
  const currentWeekKey = useMemo(() => getWeekKey(currentWeekStart), [currentWeekStart]);

  // Cache management functions
  const updateAccessOrder = useCallback((weekKey: string) => {
    const index = accessOrderRef.current.indexOf(weekKey);
    if (index > -1) {
      accessOrderRef.current.splice(index, 1);
    }
    accessOrderRef.current.push(weekKey);
    
    // LRU eviction
    while (accessOrderRef.current.length > LRU_MAX_WEEKS) {
      const oldestKey = accessOrderRef.current.shift();
      if (oldestKey) {
        cacheRef.current.delete(oldestKey);
      }
    }
  }, []);

  const isCacheStale = useCallback((cache: WeekCache): boolean => {
    return Date.now() - cache.timestamp > CACHE_TTL;
  }, []);

  const shouldBackgroundRefresh = useCallback((cache: WeekCache): boolean => {
    return Date.now() - cache.lastRefresh > BACKGROUND_REFRESH_INTERVAL;
  }, []);

  // Fetch data for a specific week
  const fetchWeekData = useCallback(async (weekKey: string, startDate: Date, isBackground = false): Promise<void> => {
    if (activeFetchesRef.current.has(weekKey)) {
      return; // Already fetching
    }

    activeFetchesRef.current.add(weekKey);
    
    try {
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      endDate.setHours(23, 59, 59, 999);

      const result = await getAppointmentsByDateRangeAction(startDate, endDate);

      if (result.success) {
        const calendarEvents = result.appointments.map(transformToCalendarEvent);
        const now = Date.now();
        
        const existingCache = cacheRef.current.get(weekKey);
        const optimisticEvents = existingCache?.optimisticEvents ?? [];

        cacheRef.current.set(weekKey, {
          appointments: calendarEvents,
          optimisticEvents,
          timestamp: now,
          lastRefresh: now,
          isStale: false,
        });

        updateAccessOrder(weekKey);
        
        // Trigger re-render if this is for the current week
        if (weekKey === currentWeekKey) {
          setCacheVersion(prev => prev + 1);
        }
        
        if (!isBackground && weekKey === currentWeekKey) {
          setError(null);
        }
      } else {
        if (!isBackground) {
          setError(result.error ?? "Error desconocido");
        }
      }
    } catch (err) {
      console.error(`Error fetching week ${weekKey}:`, err);
      if (!isBackground) {
        setError("Error al cargar las citas");
      }
    } finally {
      activeFetchesRef.current.delete(weekKey);
    }
  }, [currentWeekKey, updateAccessOrder]);

  // Progressive prefetching
  const schedulePrefetch = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    prefetchTimeoutRef.current = setTimeout(() => {
      const phases = [
        { range: 1, priority: 1 }, // Adjacent weeks
        { range: 4, priority: 2 }, // ±4 weeks  
        { range: 8, priority: 3 }, // ±8 weeks
        { range: 12, priority: 4 }, // ±12 weeks
      ];

      const requests: PrefetchRequest[] = [];
      const currentStart = getMonday(currentWeekStart);

      for (const phase of phases) {
        for (let offset = -phase.range; offset <= phase.range; offset += 7) {
          if (offset === 0) continue; // Skip current week
          
          const weekStart = new Date(currentStart);
          weekStart.setDate(currentStart.getDate() + offset);
          const weekKey = getWeekKey(weekStart);
          
          const existingCache = cacheRef.current.get(weekKey);
          if (!existingCache || isCacheStale(existingCache)) {
            requests.push({
              weekKey,
              priority: phase.priority,
              startDate: weekStart,
              endDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
            });
          }
        }
      }

      // Sort by priority and add to queue
      requests.sort((a, b) => a.priority - b.priority);
      prefetchQueueRef.current = requests;
      
      // Start processing queue
      processPrefetchQueue();
    }, 100) as unknown as number; // Small delay to batch multiple navigation events
  }, [currentWeekStart, isCacheStale]);

  const processPrefetchQueue = useCallback(() => {
    const activeCount = activeFetchesRef.current.size;
    
    while (activeCount < MAX_CONCURRENT_REQUESTS && prefetchQueueRef.current.length > 0) {
      const request = prefetchQueueRef.current.shift();
      if (request && !activeFetchesRef.current.has(request.weekKey)) {
        void fetchWeekData(request.weekKey, request.startDate, true);
      }
    }
    
    // Schedule next processing if queue not empty
    if (prefetchQueueRef.current.length > 0) {
      setTimeout(() => processPrefetchQueue(), 1000);
    }
  }, [fetchWeekData]);

  // Background refresh of current week
  const scheduleBackgroundRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      const cache = cacheRef.current.get(currentWeekKey);
      if (cache && shouldBackgroundRefresh(cache)) {
        void fetchWeekData(currentWeekKey, currentWeekStart, true);
      }
    }, BACKGROUND_REFRESH_INTERVAL) as unknown as number;
  }, [currentWeekKey, currentWeekStart, fetchWeekData, shouldBackgroundRefresh]);

  // Get current week's appointments
  const appointments = useMemo(() => {
    const cache = cacheRef.current.get(currentWeekKey);
    if (!cache) return [];
    
    return mergeAndSortEvents(cache.appointments, cache.optimisticEvents);
  }, [currentWeekKey, cacheVersion]);

  // Check if current week is loading
  const isCurrentWeekLoading = useMemo(() => {
    const cache = cacheRef.current.get(currentWeekKey);
    return !cache && loading;
  }, [currentWeekKey, loading]);

  // Optimistic event management
  const removeOptimisticEvent = useCallback((tempId: bigint) => {
    for (const [weekKey, cache] of cacheRef.current.entries()) {
      const index = cache.optimisticEvents.findIndex(event => event.appointmentId === tempId);
      if (index > -1) {
        cache.optimisticEvents.splice(index, 1);
        
        // Trigger re-render if this affects the current week
        if (weekKey === currentWeekKey) {
          setCacheVersion(prev => prev + 1);
        }
        break;
      }
    }
  }, [currentWeekKey]);

  const addOptimisticEvent = useCallback((eventData: Partial<CalendarEvent>): bigint => {
    const tempId = generateTempId();
    const optimisticEvent = transformToOptimisticEvent(eventData, tempId);
    
    // Determine which week this event belongs to
    const eventWeekKey = getWeekKey(optimisticEvent.startTime);
    
    const cache = cacheRef.current.get(eventWeekKey);
    if (cache) {
      cache.optimisticEvents.push(optimisticEvent);
    } else {
      // Create cache entry for this week if it doesn't exist
      cacheRef.current.set(eventWeekKey, {
        appointments: [],
        optimisticEvents: [optimisticEvent],
        timestamp: Date.now(),
        lastRefresh: 0,
        isStale: true,
      });
    }
    
    // Trigger re-render if this affects the current week
    if (eventWeekKey === currentWeekKey) {
      setCacheVersion(prev => prev + 1);
    }
    
    // Auto-cleanup
    setTimeout(() => {
      removeOptimisticEvent(tempId);
    }, AUTO_CLEANUP_TIMEOUT) as unknown as number;
    
    return tempId;
  }, [currentWeekKey, removeOptimisticEvent]);

  const updateOptimisticEvent = useCallback((tempId: bigint, updates: Partial<CalendarEvent>) => {
    for (const [weekKey, cache] of cacheRef.current.entries()) {
      const event = cache.optimisticEvents.find(event => event.appointmentId === tempId);
      if (event) {
        Object.assign(event, updates);
        
        // Trigger re-render if this affects the current week
        if (weekKey === currentWeekKey) {
          setCacheVersion(prev => prev + 1);
        }
        break;
      }
    }
  }, [currentWeekKey]);

  // Public API methods
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      await fetchWeekData(currentWeekKey, currentWeekStart);
    } finally {
      setLoading(false);
    }
  }, [currentWeekKey, currentWeekStart, fetchWeekData]);

  const fetchByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAppointmentsByDateRangeAction(startDate, endDate);

      if (result.success) {
        const calendarEvents = result.appointments.map(transformToCalendarEvent);
        
        // Update cache for the requested range
        const weekKey = getWeekKey(startDate);
        const now = Date.now();
        
        cacheRef.current.set(weekKey, {
          appointments: calendarEvents,
          optimisticEvents: cacheRef.current.get(weekKey)?.optimisticEvents ?? [],
          timestamp: now,
          lastRefresh: now,
          isStale: false,
        });

        updateAccessOrder(weekKey);
        
        // Trigger re-render if this affects the current week
        if (weekKey === currentWeekKey) {
          setCacheVersion(prev => prev + 1);
        }
      } else {
        setError(result.error ?? "Error desconocido");
      }
    } catch (err) {
      setError("Error al cargar las citas por rango de fechas");
      console.error("Error fetching appointments by date range:", err);
    } finally {
      setLoading(false);
    }
  }, [updateAccessOrder]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    accessOrderRef.current.length = 0;
    prefetchQueueRef.current.length = 0;
    activeFetchesRef.current.clear();
    setCacheVersion(prev => prev + 1);
  }, []);

  const getCacheStats = useCallback((): CacheStats => {
    const weeks = Array.from(cacheRef.current.keys()).sort();
    let totalEvents = 0;
    let optimisticCount = 0;
    
    for (const cache of cacheRef.current.values()) {
      totalEvents += cache.appointments.length;
      optimisticCount += cache.optimisticEvents.length;
    }
    
    return {
      totalWeeks: weeks.length,
      oldestWeek: weeks[0] ?? null,
      newestWeek: weeks[weeks.length - 1] ?? null,
      totalEvents,
      optimisticEvents: optimisticCount,
    };
  }, []);

  // Initialize and manage current week
  useEffect(() => {
    const cache = cacheRef.current.get(currentWeekKey);
    
    if (!cache || isCacheStale(cache)) {
      setLoading(true);
      void fetchWeekData(currentWeekKey, currentWeekStart).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
      updateAccessOrder(currentWeekKey);
    }
    
    // Start background processes
    schedulePrefetch();
    scheduleBackgroundRefresh();
    
    // Cleanup
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [currentWeekKey, currentWeekStart, fetchWeekData, isCacheStale, schedulePrefetch, scheduleBackgroundRefresh, updateAccessOrder]);

  return {
    appointments,
    loading: isCurrentWeekLoading,
    error,
    refetch,
    fetchByDateRange,
    addOptimisticEvent,
    removeOptimisticEvent,
    updateOptimisticEvent,
    clearCache,
    getCacheStats,
  };
}

// Convenience hooks for backwards compatibility
export function useWeeklyAppointments(weekStart: Date): UseCachedCalendarReturn {
  return useCachedCalendar(weekStart);
}

// Additional hooks for full compatibility with use-appointments.ts
export function useAppointments(): UseCachedCalendarReturn {
  // Use current date as baseline for full appointments view
  const today = new Date();
  const monday = getMonday(today);
  return useCachedCalendar(monday);
}

export function useTodayAppointments(): UseCachedCalendarReturn {
  const today = new Date();
  const monday = getMonday(today);
  return useCachedCalendar(monday);
}

// Utility functions that were in the original hook
export function filterAppointmentsByDate(
  appointments: CalendarEvent[],
  date: Date,
): CalendarEvent[] {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(targetDate);
  nextDay.setDate(targetDate.getDate() + 1);

  return appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.startTime);
    return appointmentDate >= targetDate && appointmentDate < nextDay;
  });
}

export function groupAppointmentsByDate(
  appointments: CalendarEvent[],
): Record<string, CalendarEvent[]> {
  return appointments.reduce(
    (groups, appointment) => {
      const dateKey = new Date(appointment.startTime)
        .toISOString()
        .split("T")[0];
      if (!dateKey) return groups;

      groups[dateKey] ??= [];
      groups[dateKey]?.push(appointment);
      return groups;
    },
    {} as Record<string, CalendarEvent[]>,
  );
}

export function formatAppointmentTime(appointment: CalendarEvent): string {
  const startTime = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(appointment.startTime);

  const endTime = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(appointment.endTime);

  return `${startTime} - ${endTime}`;
}

export function isAppointmentToday(appointment: CalendarEvent): boolean {
  const today = new Date();
  const appointmentDate = new Date(appointment.startTime);

  return (
    today.getDate() === appointmentDate.getDate() &&
    today.getMonth() === appointmentDate.getMonth() &&
    today.getFullYear() === appointmentDate.getFullYear()
  );
}