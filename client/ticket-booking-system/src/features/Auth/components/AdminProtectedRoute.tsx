import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute: React.FC = () => {
     
    const { roleId, getRoleId, isBlocked, getIsBlocked } = useAuth();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            await getRoleId();
            await getIsBlocked();
            setChecked(true);
        };
        checkAccess();
    }, []);

    if (!checked) return null;
    
    if (roleId == 2) {
        return <Navigate to="/403" replace />;
    }
    
    if (isBlocked) {
        return <Navigate to="/blocked" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;