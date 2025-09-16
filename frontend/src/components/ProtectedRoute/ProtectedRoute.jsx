import React, {useEffect, useState} from 'react'
import {Navigate, useLocation} from 'react-router-dom';

function ProtectedRoute({children}) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const token = document.cookie.includes('accessToken');
        setIsAuthenticated(token);
    }, [])

    if (isAuthenticated === null) {
        return <div>Loading...</div>; // or a spinner
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{from: location}} replace />;
    }

  return children;
}

export default ProtectedRoute