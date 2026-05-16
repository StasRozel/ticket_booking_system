import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../shared/components/Header';
import Footer from '../../../shared/components/Footer';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import '../styles/css/MapPage.css';
import { useMap } from '../context/MapContext';
import StatusComponent from './StatusComponent';

const MapPage: React.FC = () => {
    const navigate = useNavigate();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const lastStopsKeyRef = useRef('');
    const [modalOpen, setModalOpen] = useState(false);
    const { filteredStops, loading, error, loadRoutes, departure, arrival, matchedRoute, resetSelection, updateArrayMarkers } = useMap();

    useEffect(() => {
        loadRoutes();
    }, [loadRoutes]);

    useEffect(() => {
        if (matchedRoute) {
            setModalOpen(true);
        }
    }, [matchedRoute]);

    const initMap = useCallback((ymaps: any) => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = new ymaps.Map(mapRef.current, {
            center: [53.9, 27.5],
            zoom: 7,
            controls: ['zoomControl', 'fullscreenControl']
        });

        mapInstanceRef.current = map;

        map.events.add('click', () => {
            resetSelection();
        });

        updateArrayMarkers(ymaps, map);
    }, [resetSelection, updateArrayMarkers]);

    const waitForYmaps = useCallback(() => {
        const ymaps = (window as any).ymaps;
        if (ymaps) {
            ymaps.ready(() => initMap(ymaps));
        } else {
            setTimeout(waitForYmaps, 100);
        }
    }, [initMap]);

    useEffect(() => {
        if (filteredStops.length > 0 && !mapInstanceRef.current) {
            waitForYmaps();
        }
    }, [filteredStops, waitForYmaps]);

    useEffect(() => {
        const key = filteredStops.map(s => s.name).sort().join(',');
        if (key === lastStopsKeyRef.current) return;
        lastStopsKeyRef.current = key;

        const ymaps = (window as any).ymaps;
        const map = mapInstanceRef.current;
        if (ymaps && map) {
            updateArrayMarkers(ymaps, map);
        }
    }, [filteredStops, departure, arrival, updateArrayMarkers]);

    const handleModalClose = (confirmed: boolean) => {
        setModalOpen(false);
        if (confirmed && matchedRoute) {
            navigate('/', {
                state: {
                    fromMap: true,
                    departure,
                    arrival,
                    routeId: matchedRoute.id
                }
            });
        }
    };

    if (loading) {
        return (
          <StatusComponent status='loading'/>
        );
    }

    if (error) {
        return (
          <StatusComponent status='error' error={error}/>
        );
    }

    const showNoRoute = departure && arrival && !matchedRoute;

    return (
        
        <>
            <Header />
            <section className="map-page">
                <div className="container">
                    <div className="map-page__header">
                        <h1>Карта остановок</h1>
                        {!departure && <p>Выберите точку отправления</p>}
                        {departure && !arrival && <p>Выберите точку прибытия</p>}
                        {showNoRoute && <p>Маршрут не найден. Попробуйте другие точки</p>}
                    </div>
                    <div className="map-page__map">
                        <div ref={mapRef} className="map-container" style={{ width: '100%', height: '500px' }}></div>
                    </div>
                    {departure && (
                        <div className="map-page__info">
                            Отправление: <strong className="departure-label">{departure}</strong>
                            {arrival && <> → Прибытие: <strong className="arrival-label">{arrival}</strong></>}
                        </div>
                    )}
                </div>
            </section>
            <Footer />
            <ConfirmModal
                isOpen={modalOpen}
                onClose={handleModalClose}
                message={
                    matchedRoute
                        ? `Выбранные точки лежат на маршруте «${matchedRoute.name}». Перейти к бронированию?`
                        : ''
                }
            />
        </>
    );
};

export default MapPage;
