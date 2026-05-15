import React, { useEffect, useState, useRef } from 'react';
import Header from '../../../shared/components/Header';
import Footer from '../../../shared/components/Footer';
import api from '../../../shared/utils/api';
import { RouteType } from '../../../shared/types/RouteType';
import '../styles/css/MapPage.css';

interface Stop {
    name: string;
    lon: number;
    lat: number;
}

const MapPage: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [stops, setStops] = useState<Stop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadRoutes();
    }, []);

    useEffect(() => {
        if (stops.length > 0 && !mapInstanceRef.current) {
            waitForYmaps();
        }
    }, [stops]);

    const waitForYmaps = () => {
        const ymaps = (window as any).ymaps;
        if (ymaps) {
            ymaps.ready(() => initMap(ymaps));
        } else {
            setTimeout(waitForYmaps, 100);
        }
    };

    const loadRoutes = async () => {
        try {
            const response = await api.get('/routes');
            const routes: RouteType[] = response.data;

            const allStops = new Set<string>();

            for (const route of routes) {
                const stopsList = route.stops.split(',').map(s => s.trim());
                const startPoint = route.starting_point.trim();
                const endPoint = route.ending_point.trim();

                [startPoint, endPoint, ...stopsList].forEach(stop => {
                    if (stop) allStops.add(stop);
                });
            }

            setStops(Array.from(allStops).map(name => ({ name, lon: 0, lat: 0 })));
        } catch (err) {
            setError('Не удалось загрузить маршруты');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const initMap = (ymaps: any) => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = new ymaps.Map(mapRef.current, {
            center: [27.5, 53.9],
            zoom: 6,
            controls: ['zoomControl', 'fullscreenControl']
        });

        mapInstanceRef.current = map;

        geocodeAll(ymaps, map);
    };

    const geocodeAll = (ymaps: any, map: any) => {
        stops.forEach((stop, i) => {
            setTimeout(() => {
                ymaps.geocode(stop.name + ', Беларусь', { results: 1 }).then((res: any) => {
                    const obj = res.geoObjects.get(0);
                    if (obj) {
                        const coords = obj.geometry.getCoordinates();
                        const placemark = new ymaps.Placemark(
                            coords,
                            {
                                balloonContentHeader: stop.name,
                                balloonContentBody: 'Остановка'
                            },
                            {
                                preset: 'islands#blueDotIcon'
                            }
                        );
                        map.geoObjects.add(placemark);
                    }
                }).catch((err: any) => {
                    console.error(`Geocode failed for ${stop.name}:`, err);
                });
            }, i * 300);
        });
    };

    if (loading) {
        return (
            <>
                <Header />
                <section className="map-page">
                    <div className="container">
                        <div className="map-loading">Загрузка карты...</div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <section className="map-page">
                    <div className="container">
                        <div className="map-error">{error}</div>
                    </div>
                </section>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <section className="map-page">
                <div className="container">
                    <div className="map-page__header">
                        <h1>Карта остановок</h1>
                        <p>Все остановки и маршруты на одной карте</p>
                    </div>
                    <div className="map-page__map">
                        <div ref={mapRef} className="map-container" style={{ width: '100%', height: '500px' }}></div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default MapPage;