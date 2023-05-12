import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const loginToken = 1;
    if(!loginToken){
        return <Navigate to="/" />;
    }
    return children;
}

export default PrivateRoute;