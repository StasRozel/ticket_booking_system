import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleProtectedRoute: React.FC<{ expectedRoleId: number[] }> = ({ expectedRoleId }) => {

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

    expectedRoleId.forEach((role) => {
        if (roleId !== role) {
            return <Navigate to="/403" replace />;
        }
    })
    
    if (isBlocked) {
        return <Navigate to="/blocked" replace />;
    }

    return <Outlet />;
};

export default RoleProtectedRoute;