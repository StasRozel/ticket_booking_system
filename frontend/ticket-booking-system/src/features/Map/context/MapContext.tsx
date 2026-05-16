import { MapContextType } from "../../../shared/types/MapType";
import { RouteType } from "../../../shared/types/RouteType";
import { Stop } from "../../../shared/types/StopType";
import api from "../../../shared/utils/api";
import { createContext, useContext, useState, useCallback, useRef, useMemo } from "react";

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departure, setDeparture] = useState<string | null>(null);
  const [arrival, setArrival] = useState<string | null>(null);
  const [matchedRoute, setMatchedRoute] = useState<RouteType | null>(null);

  const markersRef = useRef<any[]>([]);
  const coordsCacheRef = useRef<Record<string, [number, number]>>({});
  const geocodingDoneRef = useRef(false);

  const getCityFromRoute = (route: RouteType): string[] => {
    const stopsList = route.stops.split(',').map(s => s.trim());
    const startPoint = route.starting_point.trim();
    const endPoint = route.ending_point.trim();

    return [startPoint, endPoint, ...stopsList].filter(Boolean);
  }

  const getFilteredStopNames = (routes: RouteType[], city: string | null): string[] => {
    if (!city) return [];

    const matchingRoutes = routes.filter(r => getCityFromRoute(r).includes(city));
    const result = new Set<string>();

    for (const route of matchingRoutes) {
      for (const name of getCityFromRoute(route)) {
        result.add(name);
      }
    }
    return Array.from(result);
  }

  const filteredStops = useMemo(() => {
    const activeCity = arrival || departure;
    
    if (!activeCity) return stops;
   
    const filteredNames = new Set(getFilteredStopNames(routes, activeCity));
    
    return stops.filter(s => filteredNames.has(s.name));
  }, [stops, departure, arrival, routes]);

  const loadRoutes = useCallback(async () => {
    try {
      const response = await api.get('/routes');
      const routes: RouteType[] = response.data;

      setRoutes(routes);

      const allStops = Array.from(new Set(routes.flatMap(getCityFromRoute)));
      setStops(allStops.map(name => ({ name, lon: 0, lat: 0 })));
    } catch (err) {
      setError('Не удалось загрузить маршруты');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStopClick = useCallback((stopName: string) => {
    if (!departure) {
      setDeparture(stopName);
      setArrival(null);
      setMatchedRoute(null);
      return;
    }

    if (!arrival && stopName !== departure) {
      setArrival(stopName); 

      const found = routes.find(r => {
        const allRouteStops = [
          r.starting_point.trim(),
          ...r.stops.split(',').map(s => s.trim()),
          r.ending_point.trim()
        ].filter(Boolean);
        
        return allRouteStops.includes(departure) && allRouteStops.includes(stopName);
      });
      setMatchedRoute(found || null);
      return;
    }

    setDeparture(stopName);
    setArrival(null);
    setMatchedRoute(null);
  }, [departure, arrival, routes]);

  const resetSelection = useCallback(() => {
    setDeparture(null);
    setArrival(null);
    setMatchedRoute(null);
  }, []);

  const updateArrayMarkers = useCallback((ymaps: any, map: any) => {
    markersRef.current.forEach(m => map.geoObjects.remove(m));
    markersRef.current = [];

    const addMarker = (stop: Stop, coords: [number, number]) => {
      const isDeparture = stop.name === departure;
      const isArrival = stop.name === arrival;

      let preset = 'islands#blueDotIcon';
      if (isDeparture) preset = 'islands#greenDotIcon';
      if (isArrival) preset = 'islands#redDotIcon';

      const placemark = new ymaps.Placemark(
        coords,
        {
          balloonContentHeader: stop.name,
          balloonContentBody: isDeparture ? 'Отправление' : isArrival ? 'Прибытие' : 'Остановка'
        },
        { preset }
      );

      placemark.events.add('click', () => {
        handleStopClick(stop.name);
      });

      map.geoObjects.add(placemark);
      markersRef.current.push(placemark);
    };

    if (geocodingDoneRef.current) {
      filteredStops.forEach(stop => {
        const cached = coordsCacheRef.current[stop.name];
        if (cached) addMarker(stop, cached);
      });
      return;
    }

    let completed = 0;
    filteredStops.forEach((stop) => {

      ymaps.geocode(stop.name + ', Беларусь', { results: 1 }).then((res: any) => {
        const obj = res.geoObjects.get(0);
        if (obj) {
          const coords = obj.geometry.getCoordinates() as [number, number];
          coordsCacheRef.current[stop.name] = coords;
          addMarker(stop, coords);
        }
        completed++;
        if (completed === filteredStops.length) {
          geocodingDoneRef.current = true;
        }
      }).catch((err: any) => {
        console.error(`Geocode failed for ${stop.name}:`, err);
        completed++;
        if (completed === filteredStops.length) {
          geocodingDoneRef.current = true;
        }
      });
    });

  }, [filteredStops, departure, arrival, handleStopClick]);

  const routeStopsForSelected = departure
    ? getFilteredStopNames(routes, departure)
    : [];

  const availableCities = Array.from(new Set(routes.flatMap(getCityFromRoute))).sort();

  return (
    <MapContext.Provider
      value={{
        routes,               // все маршруты
        stops,                // все остановки (с нулевыми координатами)
        filteredStops,        // остановки, отфильтрованные по активному городу
        loading,              // флаг загрузки
        error,                // сообщение об ошибке
        departure,            // выбранное отправление (или null)
        arrival,              // выбранное прибытие (или null)
        matchedRoute,         // маршрут, проходящий через оба города (или null)
        availableCities,      // все уникальные города (отсортированы)
        routeStopsForSelected,// остановки, достижимые из departure
        loadRoutes,           // функция загрузки маршрутов
        handleStopClick,      // обработчик клика по остановке
        resetSelection,       // сброс выбора
        updateArrayMarkers    // обновление маркеров на карте
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};
