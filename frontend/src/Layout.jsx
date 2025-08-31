import React from 'react';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className='flex items-center justify-center h-screen w-screen bg-gray-100'>
        <Outlet />
    </div>
  )
}

export default Layout