import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/css/Dashboard.css';
import RoutesManagement from './RoutesManagment';
import SchedulesManagement from './SchedulesManagment';
import UsersManagement from './UsersManagement';
import CreateStaff from './StaffManagement';
import BusesManagement from './BusesManagement';
import BusSchedulesManagement from './BusSchedulesManagement';
import UrgentCallsManagement from './UngentCallsManagment';
import DriverComplaintsManager from './ DriverComplaintsManager';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <main className="dashboard__content">
        <Routes>
          <Route path="routes" element={<RoutesManagement />} />
          <Route path="schedules" element={<SchedulesManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="users/create" element={<CreateStaff />} />
          <Route path="buses" element={<BusesManagement />} />
          <Route path="bus-schedules" element={<BusSchedulesManagement />} />
          <Route path="urgent-calls" element={<UrgentCallsManagement />} />
          <Route path="driver-complaints" element={<DriverComplaintsManager />} />
          <Route path="*" element={<Navigate to="routes" />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;