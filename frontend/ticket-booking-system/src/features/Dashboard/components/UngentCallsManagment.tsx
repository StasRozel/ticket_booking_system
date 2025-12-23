import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import '../styles/UrgentCalls.scss';

const UrgentCallsManagement: React.FC = () => {
	const { trigger, urgentCalls, fetchUrgentCalls, replaceBusScheduleDriverAndBus } = useDashboard() as any;
	const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
	const [driverId, setDriverId] = useState<number | ''>('');

	useEffect(() => {
		fetchUrgentCalls();
	}, [trigger]);

	const handleReplace = async (call: any) => {
		const bsId = call.bus_schedule_id;
		const dId = Number(driverId) || call.driver_id;
		try {
			await replaceBusScheduleDriverAndBus(bsId, dId, call.id);
			fetchUrgentCalls();
			setDriverId('');
			setSelectedSchedule(null);
		} catch (err) {
			console.error('Replace error', err);
		}
	};

	return (
		<div className="urgent-calls">
			<h2>Экстренные вызовы</h2>
			<div className="urgent-calls__list">
				{urgentCalls && urgentCalls.length ? urgentCalls.map((call: any) => (
					<div key={call.id} className="urgent-calls__item">
						<div className="urgent-calls__info">
							<div className="urgent-calls__info-item">
								<label>ID вызова</label>
								<span>{call.id}</span>
							</div>
							<div className="urgent-calls__info-item">
								<label>ID расписания</label>
								<span>{call.bus_schedule_id}</span>
							</div>
							<div className="urgent-calls__info-item">
								<label>ID водителя</label>
								<span>{call.driver_id}</span>
							</div>
							<div className="urgent-calls__info-item">
								<label>Геолокация</label>
								<span>{call.latitude}, {call.longitude}</span>
							</div>
							<div className="urgent-calls__info-item">
								<label>Статус</label>
								<span className={`urgent-calls__status ${call.accepted ? 'urgent-calls__status--accepted' : 'urgent-calls__status--pending'}`}>
									{call.accepted ? 'Принят' : 'Ожидание'}
								</span>
							</div>
						</div>

						<div className="urgent-calls__actions">
							{!call.accepted && (
								<button onClick={() => setSelectedSchedule(call.bus_schedule_id)}>
									Изменить водителя
								</button>
							)}
							{selectedSchedule === call.bus_schedule_id && (
								<div className="urgent-calls__replace-form">
									<input 
										type="number"
										placeholder="ID водителя" 
										value={driverId as any} 
										onChange={e => setDriverId(e.target.value ? Number(e.target.value) : '')} 
									/>
									<button className="apply" onClick={() => handleReplace(call)}>Применить</button>
									<button className="cancel" onClick={() => setSelectedSchedule(null)}>Отмена</button>
								</div>
							)}
						</div>
					</div>
				)) : <div className="urgent-calls__empty">Нет экстренных вызовов</div>}
			</div>
		</div>
	);
};

export default UrgentCallsManagement;
