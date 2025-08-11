"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { PaginationControls } from "~/components/ui/pagination-controls";
import { Skeleton } from "~/components/ui/skeleton";
import {
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  Users,
  TrendingUp,
  Filter,
} from "lucide-react";
import { MatchCard } from "./match-card";
import { MatchFilters } from "./match-filters";
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
  // State management
  const [matches, setMatches] = useState<MatchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<MatchFiltersType>({
    accountScope: "current",
    includeNearStrict: true,
    propertyTypes: [],
    locationIds: [],
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Statistics state
  const [stats, setStats] = useState({
    totalMatches: 0,
    strictMatches: 0,
    nearStrictMatches: 0,
    crossAccountMatches: 0,
  });

  // Fetch matches data
  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getMatchesForProspectsWithAuth({
        filters,
        pagination: {
          offset: (currentPage - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        },
      });

      console.log('🔍 Connection matches result:', result);
      console.log('📊 Matches count:', result.matches.length);
      console.log('🎯 Total count:', result.totalCount);
      console.log('🔧 Applied filters:', result.filters);

      setMatches(result);

      // Calculate statistics
      const totalMatches = result.totalCount;
      const strictMatches = result.matches.filter(
        (m) => m.matchType === "strict",
      ).length;
      const nearStrictMatches = result.matches.filter(
        (m) => m.matchType === "near-strict",
      ).length;
      const crossAccountMatches = result.matches.filter(
        (m) => m.isCrossAccount,
      ).length;

      setStats({
        totalMatches,
        strictMatches,
        nearStrictMatches,
        crossAccountMatches,
      });
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(
        "Error al cargar las conexiones potenciales. Inténtalo de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  // Effect to fetch data when filters or page change
  useEffect(() => {
    void fetchMatches();
  }, [fetchMatches]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: MatchFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

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

  // Handle refresh
  const handleRefresh = () => {
    void fetchMatches();
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
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="mb-2 flex items-center justify-center">
            <Search className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {stats.totalMatches}
          </p>
          <p className="text-xs text-muted-foreground">Total</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="mb-2 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats.strictMatches}
          </p>
          <p className="text-xs text-muted-foreground">Exactas</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="mb-2 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {stats.nearStrictMatches}
          </p>
          <p className="text-xs text-muted-foreground">Aproximadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="mb-2 flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {stats.crossAccountMatches}
          </p>
          <p className="text-xs text-muted-foreground">Externas</p>
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
        <p className="mb-4 text-muted-foreground">
          Intenta{" "}
          {filters.includeNearStrict
            ? "ampliar los criterios de búsqueda"
            : "habilitar las coincidencias aproximadas"}{" "}
          para ver más resultados.
        </p>
        <div className="flex justify-center space-x-2">
          {!filters.includeNearStrict && (
            <Button
              variant="outline"
              onClick={() =>
                handleFiltersChange({ ...filters, includeNearStrict: true })
              }
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Incluir aproximadas
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowFilters(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Ajustar filtros
          </Button>
        </div>
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
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-muted" : ""}
          >
            <Filter className="mr-1 h-4 w-4" />
            Filtros
          </Button>

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
        {/* Filters */}
        {showFilters && (
          <div className="rounded-lg border bg-muted/20 p-4">
            <MatchFilters
              onFiltersChange={handleFiltersChange}
              className="mb-0"
            />
          </div>
        )}

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
            {!showFilters && (
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20" />
                ))}
              </div>
            )}
            {renderLoadingSkeleton()}
          </>
        ) : (
          <>
            {/* Statistics */}
            {matches && matches.matches.length > 0 && renderStats()}

            {/* Matches Grid */}
            {matches && matches.matches.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {matches.matches.map((match) => (
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
            ) : (
              /* Empty State */
              renderEmptyState()
            )}
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
