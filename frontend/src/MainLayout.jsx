import React from 'react'
import { Outlet } from 'react-router-dom'
import MainNavbar from './Layout/MainNavbar.jsx'
import Sidebar from './Layout/Sidebar.jsx'

function MainLayout() {
  return (
    <div className='bg-gray-100 min-h-screen flex flex-col'>
      <MainNavbar />
      <div className='flex flex-1'>
        <Sidebar />
        <div className='flex-1 p-4'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default MainLayout