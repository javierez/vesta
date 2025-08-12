"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { PaginationControls } from "~/components/ui/pagination-controls";
import { Skeleton } from "~/components/ui/skeleton";
import {
  RefreshCw,
  Search,
  AlertCircle,
  Users,
} from "lucide-react";
import { MatchCard } from "./match-card";
import { ExternalAccountCard } from "./external-account-card";
import {
  getMatchesForProspectsWithAuth,
  saveMatchWithAuth,
  dismissMatchWithAuth,
  contactMatchWithAuth,
} from "~/server/queries/connection-matches";
import type {
  MatchResults,
  MatchFilters as MatchFiltersType,
  ProspectMatch,
  MatchAction,
} from "~/types/connection-matches";

interface ConexionesPotencialesProps {
  // Props can be extended based on requirements
  className?: string;
}

const ITEMS_PER_PAGE = 12;

export function ConexionesPotenciales({
  className,
}: ConexionesPotencialesProps) {
  const searchParams = useSearchParams();
  
  // State management
  const [matches, setMatches] = useState<MatchResults | null>(null);
  const [externalMatches, setExternalMatches] = useState<MatchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExternalLoading, setIsExternalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<MatchFiltersType>({
    accountScope: "current",
    includeNearStrict: true,
    propertyTypes: [],
    locationIds: [],
    prospectTypes: [],
    listingTypes: [],
    statuses: [],
    urgencyLevels: [],
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<"internal" | "external" | null>("internal");

  // Statistics state
  const [stats, setStats] = useState({
    internalMatches: 0,
    externalMatches: 0,
  });

  // Initialize filters from URL parameters
  useEffect(() => {
    const prospectType = searchParams.get("prospectType");
    const listingType = searchParams.get("listingType");
    const status = searchParams.get("status");
    const urgencyLevel = searchParams.get("urgencyLevel");
    const page = searchParams.get("page");

    setFilters(prev => ({
      ...prev,
      prospectTypes: prospectType && prospectType !== "all" ? prospectType.split(",") : [],
      listingTypes: listingType && listingType !== "all" ? listingType.split(",") : [],
      statuses: status ? status.split(",") : [],
      urgencyLevels: urgencyLevel ? urgencyLevel.split(",") : [],
    }));

    if (page) {
      setCurrentPage(parseInt(page, 10) || 1);
    }
  }, [searchParams]);

  // Fetch internal matches data
  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getMatchesForProspectsWithAuth({
        filters: { ...filters, accountScope: "current" },
        pagination: {
          offset: (currentPage - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        },
      });

      console.log('🔍 Internal matches result:', result);
      console.log('📊 Internal matches count:', result.matches.length);
      console.log('🎯 Internal total count:', result.totalCount);

      setMatches(result);
    } catch (err) {
      console.error("Error fetching internal matches:", err);
      setError(
        "Error al cargar las conexiones internas. Inténtalo de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  // Fetch external matches data
  const fetchExternalMatches = useCallback(async () => {
    setIsExternalLoading(true);

    try {
      const result = await getMatchesForProspectsWithAuth({
        filters: { ...filters, accountScope: "cross-account" },
        pagination: {
          offset: (currentPage - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        },
      });

      console.log('🌐 External matches result:', result);
      console.log('📊 External matches count:', result.matches.length);
      console.log('🎯 External total count:', result.totalCount);

      setExternalMatches(result);
    } catch (err) {
      console.error("Error fetching external matches:", err);
      // Don't set error for external matches, just log it
    } finally {
      setIsExternalLoading(false);
    }
  }, [filters, currentPage]);

  // Effect to fetch data when filters or page change
  useEffect(() => {
    void fetchMatches();
    void fetchExternalMatches();
  }, [fetchMatches, fetchExternalMatches]);

  // Update stats when matches change
  useEffect(() => {
    const internalMatches = matches?.totalCount ?? 0;
    const externalMatchesCount = externalMatches?.totalCount ?? 0;

    setStats({
      internalMatches,
      externalMatches: externalMatchesCount,
    });
  }, [matches, externalMatches]);


  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle match actions
  const handleMatchAction = async (
    action: MatchAction,
    match: ProspectMatch,
  ) => {
    const actionKey = `${action}-${match.prospectId}-${match.listingId}`;
    setActionLoading(actionKey);

    try {
      let result;

      switch (action) {
        case "save":
          result = await saveMatchWithAuth(match.prospectId, match.listingId);
          break;
        case "dismiss":
          result = await dismissMatchWithAuth(
            match.prospectId,
            match.listingId,
          );
          break;
        case "contact":
        case "request-contact":
          result = await contactMatchWithAuth(
            match.prospectId,
            match.listingId,
          );
          break;
        default:
          throw new Error(`Acción no soportada: ${String(action)}`);
      }

      if (result.success) {
        // Show success message or update UI
        console.log(
          result.message || `Acción ${action} completada exitosamente`,
        );

        // Optionally refresh matches to reflect changes
        if (action === "dismiss") {
          void fetchMatches();
        }
      } else {
        throw new Error(
          result.message || `Error al ejecutar la acción ${action}`,
        );
      }
    } catch (err) {
      console.error(`Error executing action ${action}:`, err);
      setError(
        `Error al ${action === "save" ? "guardar" : action === "dismiss" ? "descartar" : "contactar"} la coincidencia`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Group external matches by account
  const groupMatchesByAccount = (matches: ProspectMatch[]) => {
    const grouped = matches.reduce((acc, match) => {
      const accountId = match.listingAccountId?.toString() || 'unknown';
      acc[accountId] ??= [];
      acc[accountId].push(match);
      return acc;
    }, {} as Record<string, ProspectMatch[]>);
    return grouped;
  };

  // Handle external account contact request
  const handleExternalContactRequest = async (accountId: string, matches: ProspectMatch[]) => {
    console.log(`📞 Contact request for account ${accountId} with ${matches.length} matches`);
    // TODO: Implement external contact request logic
    setError(`Funcionalidad de contacto externo próximamente disponible para la cuenta ${accountId}`);
  };

  // Handle refresh
  const handleRefresh = () => {
    void fetchMatches();
    void fetchExternalMatches();
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-4">
            <Skeleton className="mb-2 h-4 w-3/4" />
            <Skeleton className="mb-4 h-4 w-1/2" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render statistics
  const renderStats = () => (
    <div className="mb-4 grid grid-cols-2 gap-3">
      <Card 
        className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${
          selectedView === "internal" ? "ring-2 ring-gray-800 bg-gray-100" : ""
        }`}
        onClick={() => setSelectedView("internal")}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.internalMatches}
              </p>
              <p className="text-xs text-muted-foreground">Internas</p>
            </div>
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${
          selectedView === "external" ? "ring-2 ring-gray-800 bg-gray-100" : ""
        }`}
        onClick={() => setSelectedView("external")}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.externalMatches}
              </p>
              <p className="text-xs text-muted-foreground">Externas</p>
            </div>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <Card className="py-12 text-center">
      <CardContent>
        <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">
          No se encontraron coincidencias
        </h3>
        <p className="text-muted-foreground">
          No hay propiedades que coincidan con los criterios actuales.
        </p>
      </CardContent>
    </Card>
  );

  const totalPages = matches
    ? Math.ceil(matches.totalCount / ITEMS_PER_PAGE)
    : 0;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Buscador de Conexiones
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Conexiones automáticas entre prospectos y propiedades disponibles
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-16" />
              ))}
            </div>
            {renderLoadingSkeleton()}
          </>
        ) : (
          <>
            {/* Statistics */}
            {matches && matches.matches.length > 0 && renderStats()}

            {/* Matches Grid */}
            {selectedView === "internal" && matches && matches.matches.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {matches.matches
                    .filter((match) => !match.isCrossAccount)
                    .map((match) => (
                      <MatchCard
                        key={`${match.prospectId}-${match.listingId}`}
                        match={match}
                        onAction={handleMatchAction}
                        showActions={true}
                      />
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : selectedView === "external" ? (
              isExternalLoading ? (
                renderLoadingSkeleton()
              ) : externalMatches && externalMatches.matches.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {Object.entries(groupMatchesByAccount(externalMatches.matches)).map(([accountId, matches]) => (
                      <ExternalAccountCard
                        key={accountId}
                        accountId={accountId}
                        matches={matches}
                        onRequestContact={handleExternalContactRequest}
                      />
                    ))}
                  </div>

                  {/* Pagination for external matches */}
                  {Math.ceil((externalMatches.totalCount || 0) / ITEMS_PER_PAGE) > 1 && (
                    <div className="flex justify-center">
                      <PaginationControls
                        currentPage={currentPage}
                        totalPages={Math.ceil((externalMatches.totalCount || 0) / ITEMS_PER_PAGE)}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center">
                  <Users className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">
                    Sin coincidencias externas
                  </h3>
                  <p className="text-muted-foreground">
                    No se encontraron propiedades de otras cuentas que coincidan con los criterios
                  </p>
                </div>
              )
            ) : selectedView === "internal" && matches && matches.matches.filter((m) => !m.isCrossAccount).length === 0 ? (
              /* Empty State for internal matches */
              renderEmptyState()
            ) : null}
          </>
        )}

        {/* Action Loading Indicator */}
        {actionLoading && (
          <div className="fixed bottom-4 right-4 rounded-lg border bg-background p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Procesando acción...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
