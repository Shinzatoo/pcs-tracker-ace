import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pcsApi, PcsFilters, PcsPagination, PcsSort } from '@/lib/api';

export interface UsePcsDataOptions {
  filters?: PcsFilters;
  pagination?: PcsPagination;
  sort?: PcsSort;
  enabled?: boolean;
  refetchInterval?: number;
}

/**
 * Hook for fetching PCS data with caching and error handling
 */
export function usePcsData(options: UsePcsDataOptions = {}) {
  const {
    filters,
    pagination,
    sort,
    enabled = true,
    refetchInterval = 0, // No auto-refresh by default
  } = options;

  return useQuery({
    queryKey: ['pcs-status', { filters, pagination, sort }],
    queryFn: () => pcsApi.getStatus({ filters, pagination, sort }),
    enabled,
    refetchInterval,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for manual refresh
 */
export function usePcsRefresh() {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['pcs-status'] });
  };

  const refreshAll = () => {
    queryClient.clear();
    queryClient.invalidateQueries();
  };

  return { refresh, refreshAll };
}

/**
 * Hook for getting vessel by ID
 */
export function useVesselById(vesselId: string) {
  return useQuery({
    queryKey: ['vessel', vesselId],
    queryFn: () => {
      const vessel = pcsApi.getVesselById(vesselId);
      if (!vessel) {
        throw new Error(`Vessel ${vesselId} not found`);
      }
      return vessel;
    },
    enabled: !!vesselId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook for getting alerts by vessel ID
 */
export function useVesselAlerts(vesselId: string) {
  return useQuery({
    queryKey: ['vessel-alerts', vesselId],
    queryFn: () => pcsApi.getVesselAlerts(vesselId),
    enabled: !!vesselId,
    staleTime: 30 * 1000,
  });
}