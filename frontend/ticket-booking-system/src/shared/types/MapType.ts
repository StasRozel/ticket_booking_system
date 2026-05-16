import { RouteType } from "./RouteType";
import { Stop } from "./StopType";

export type MapContextType = {
  routes: RouteType[];
  stops: Stop[];
  filteredStops: Stop[];
  loading: boolean;
  error: string | null;
  departure: string | null;
  arrival: string | null;
  matchedRoute: RouteType | null;
  availableCities: string[];
  routeStopsForSelected: string[];
  loadRoutes: () => Promise<void>;
  handleStopClick: (stopName: string) => void;
  resetSelection: () => void;
  updateArrayMarkers: (ymaps: any, map: any) => void;
};
