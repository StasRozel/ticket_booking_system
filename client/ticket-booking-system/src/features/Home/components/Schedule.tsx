// src/components/Schedule.tsx
import React, { useEffect, useState } from 'react';
import '../styles/css/Schedule.css';
import { socket } from '../../..';
import { useHome } from '../context/HomeContext';
import { formatTime, formatDate } from '../../../shared/services/formatDateTime';
import { BusScheduleType } from '../../../shared/types/BusScheduleType';
import Notification from '../../../shared/components/Notification'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from '@tanstack/react-table';
import { useNotification } from '../../../shared/context/NotificationContext';

const Schedule: React.FC = () => {
  const {
    busSchedules,
    loading,
    error,
    fetchBusSchedule,
    booking
  } = useHome();
  const { notification } = useNotification();
  const [trigger, setTrigger] = useState<number>(0);
  const [sorting, setSorting] = useState<SortingState>([]);


  socket.on('update', () => {
    setTrigger((next) => ++next);
  });

  useEffect(() => {
    fetchBusSchedule();
  }, [trigger]);

  // Функция для парсинга даты в формате дд.мм.гггг
  const parseDate = (dateStr: string): Date => {
    if (!dateStr || !/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
      return new Date(0); // Возвращаем минимальную дату в случае ошибки
    }
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  };

  // Определение колонок таблицы
  const columns: ColumnDef<any>[] = [
    {
      header: 'Маршрут',
      accessorKey: 'schedule.route.name',
      cell: (info) => info.row.original.schedule?.route?.name || '-',
    },
    {
      header: 'Время отправления',
      accessorKey: 'schedule.departure_time',
      cell: (info) => (info.row.original.schedule?.departure_time ? formatTime(info.row.original.schedule.departure_time) : '-'),
    },
    {
      header: 'Время прибытия',
      accessorKey: 'schedule.arrival_time',
      cell: (info) => (info.row.original.schedule?.arrival_time ? formatTime(info.row.original.schedule.arrival_time) : '-'),
    },
    {
      header: 'Дни работы',
      accessorKey: 'operating_days',
      cell: (info) => formatDate(info.getValue() as string) || '-',
      sortingFn: (rowA, rowB, columnId) => {
        const aDate = parseDate(formatDate(rowA.getValue(columnId)));
        const bDate = parseDate(formatDate(rowB.getValue(columnId)));
        return aDate.getTime() - bDate.getTime();
      },
    },
    {
      header: 'Кол-во мест',
      accessorKey: 'bus.capacity.length',
      cell: (info) => `${info.row.original.bus?.capacity.length}`,
    },
    {
      header: 'Стоимость',
      accessorKey: 'schedule.route.price',
      cell: (info) => `${info.row.original.schedule?.route?.price || '0'} руб.`,
    },
    {
      header: 'Купить',
      cell: (info) => (
        <button className="header__action" onClick={() => booking(info.row.original)}>
          Выбрать
        </button>
      ),
    },
  ];

  // Инициализация таблицы
  const table = useReactTable({
    columns,
    data: busSchedules,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  return (
    <>
    <div className="minibus-schedule">
      <div className="container">
        {loading && <p className="minibus-schedule__loading">Загрузка...</p>}
        {error && <p className="minibus-schedule__error">{error}</p>}
        {!loading && !error && busSchedules.length === 0 ? (
          <p className="minibus-schedule__empty">Расписание отсутствует.</p>
        ) : (
          !loading &&
          !error && (
            <>
              <table className="minibus-schedule__table">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' ↑',
                            desc: ' ↓',
                          }[header.column.getIsSorted() as string] ?? null}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        row.original.bus?.capacity.length > 0 ? <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td> : '' 
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )
        )}
      </div>
    </div>
    <Notification
          message={notification?.message}
          type={notification?.type}
          duration={5000}
          isClose={true}
        />
    </>
  );
};

export default Schedule;