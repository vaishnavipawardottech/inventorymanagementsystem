import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Layout/Navbar.jsx'
import Footer from './Layout/Footer.jsx'


function HomeLayout() {
  return (
    <div className='bg-gray-100 min-h-screen flex flex-col'>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default HomeLayout