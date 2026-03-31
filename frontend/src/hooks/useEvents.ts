import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { SurveillanceEvent } from "../types";

interface EventFilters {
  type?: string;
  severity?: string;
  cameraId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const useEvents = (filters: EventFilters) => {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      const { data } = await api.get("/events", { params: filters });
      return data as { events: SurveillanceEvent[], total: number };
    },
    placeholderData: (previousData) => previousData, // keep previous data while fetching new
    staleTime: 10000, // 10 seconds
  });
};
