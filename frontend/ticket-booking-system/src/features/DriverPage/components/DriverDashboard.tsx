import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../shared/components/Header';
import Footer from '../../../shared/components/Footer';
import '../styles/css/DriverDashboard.css';
import EmergencyButton from './EmergencyButton';
import { useDriver } from '../context/DriverContext'; // предположим, что у тебя есть такой контекст

const DriverDashboard: React.FC = () => {
    const { driver, loading, error, fetchDriverData, markArrivalAtStop, markPassengerPresent, notifyDelaySchedule, submitComplaint } = useDriver();
    const navigate = useNavigate();
    const [selectedStop, setSelectedStop] = useState<number | null>(null); // теперь id остановки

    useEffect(() => {
        fetchDriverData();
    }, []);

    const handleArrived = async (stopId: number) => {
        await markArrivalAtStop(stopId);
        setSelectedStop(stopId);
    };

    const handlePassengerPresent = async (passengerId: number) => {
        await markPassengerPresent(passengerId);
        alert(`Пассажир #${passengerId} отмечен как присутствующий`);
    };

    const handleComplain = async (passengerId: number) => {
        const complaintText = prompt('Введите текст жалобы:');
        if (!complaintText || complaintText.trim() === '') {
            alert('Текст жалобы не может быть пустым');
            return;
        }
        
        try {
            await submitComplaint(passengerId, complaintText.trim());
            alert(`Жалоба на пассажира #${passengerId} успешно отправлена`);
        } catch (err: any) {
            alert('Ошибка при отправке жалобы: ' + (err?.message || 'Неизвестная ошибка'));
        }
    };

    if (loading) return <div className="driver-dashboard__loading">Загрузка данных водителя...</div>;
    if (error) return <div className="driver-dashboard__error">{error}</div>;
    if (!driver) return null;

    const { fullName, currentRoute, passengers } = driver;

    return (
        <>
            <Header />
            <section className="driver-dashboard">
                <div className="container">

                    {/* Приветствие */}
                    <h1 className="driver-dashboard__welcome">
                        Добро пожаловать, <span>{fullName}</span>
                    </h1>
                    
                    <div className="driver-dashboard__radio-section">
                        <button
                            className="driver-dashboard__radio-btn"
                            onClick={() => navigate('/radio')}
                        >
                            Перейти к рации
                        </button>
                        <div style={{ marginLeft: 12 }}>
                          <EmergencyButton />
                        </div>
                    </div>

                    {/* Текущий маршрут */}
                    <div className="driver-dashboard__route-card">
                        <h2 className="driver-dashboard__route-title">Текущий маршрут</h2>
                        <p className="driver-dashboard__route-name">
                            {currentRoute?.from} → {currentRoute?.to}
                        </p>

                        <div className="driver-dashboard__stops">
                            {currentRoute?.stops.map((stop: any, idx: number) => {
                                const arrived = !!stop.arrivedAt;
                                const isFirst = idx === 0;
                                const isLast = idx === currentRoute.stops.length - 1;
                                return (
                                <div key={stop.id ?? idx} className={`driver-dashboard__stop-item ${arrived ? 'driver-dashboard__stop-item--arrived' : ''}`}>
                                    <span className="driver-dashboard__stop-name">{stop.name}</span>
                                    <button
                                        onClick={() => handleArrived(stop.id)}
                                        className={`driver-dashboard__arrived-btn ${arrived ? 'driver-dashboard__arrived-btn--active' : ''}`}
                                    >
                                        {arrived ? 'Прибыли ✓' : isFirst ? 'Начать рейс' : isLast ? 'Завершить рейс' : 'Прибыли на остановку'}
                                    </button>
                                </div>
                            )})}
                        </div>
                    </div>

                    {/* Список пассажиров */}
                    <div className="driver-dashboard__passengers-card">
                        <h2 className="driver-dashboard__passengers-title">
                            Пассажиры на рейсе ({passengers.length})
                        </h2>

                        {passengers.length === 0 ? (
                            <p className="driver-dashboard__empty">На данный рейс пока нет бронирований</p>
                        ) : (
                            <div className="driver-dashboard__passengers-list">
                                {passengers.map((p: any) => (
                                    <div key={p.id} className="driver-dashboard__passenger-item">
                                        <div className="driver-dashboard__passenger-info">
                                            <strong>{p.lastName} {p.firstName} {p.middleName || ''}</strong>
                                            <span>Место: {p.seatNumber}</span>
                                            <span>Телефон: {p.phone || '—'}</span>
                                        </div>
                                        <div className="driver-dashboard__passenger-actions">
                                            <button
                                                onClick={() => handlePassengerPresent(p.id)}
                                                className={`driver-dashboard__btn-present ${p.status === 'В дороге' ? 'driver-dashboard__btn-present--active' : ''}`}
                                                disabled={p.status === 'В дороге'}
                                            >
                                                {p.status === 'В дороге' ? 'В пути' : 'Отметить присутствие'}
                                            </button>
                                            <button
                                                onClick={() => handleComplain(p.id)}
                                                className="driver-dashboard__btn-complain"
                                            >
                                                Пожаловаться
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Кнопка предупреждения о задержке */}
                    <div className="driver-dashboard__delay-section">
                        <button
                            className="driver-dashboard__delay-btn"
                            onClick={async () => {
                                try {
                                    await notifyDelaySchedule(5, '');

                                } catch (err: any) {
                                    console.error('[driver] notify delay click error', err);
                                    alert('Ошибка при отправке уведомлений: ' + (err?.message || JSON.stringify(err)));
                                }
                            }}
                        >
                            Предупредить пассажиров о задержке
                        </button>
                    </div>

                    {/* Кнопка рации */}
                    

                </div>
            </section>
            <Footer />
        </>
    );
};

export default DriverDashboard;