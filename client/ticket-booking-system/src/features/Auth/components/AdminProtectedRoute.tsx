import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute: React.FC= () => {
     
    const { roleId, getRoleId } = useAuth();

    useEffect(()=> {
        getRoleId() 
    }, [])

    if (roleId == 2) {
        return <Navigate to="/403" replace />;
    }
    return <Outlet />;
};

export default AdminProtectedRoute;