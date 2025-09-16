import React from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Box, ClipboardList, Users, ShoppingCart, CircleDollarSign, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'

function Sidebar() {
    const linkClasses = ({ isActive }) =>
    `flex items-center gap-4 px-6 py-3 ml-6 mr-8 mt-2 rounded-md transition 
     ${isActive ? 'bg-gray-100 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-100 hover:text-black'}`
  return (
    <div className='w-64 bg-white fixed top-16 left-0 h-full border-r border-gray-300'>
            <div className='flex flex-col mt-6'>
                <NavLink to="/dashboard" className={linkClasses}>
                    <LayoutDashboard className='h-5 w-5 text-gray-600' />
                    <span className="text-black font-normal">Dashboard</span>
                </NavLink>
                <NavLink to="/products" className={linkClasses}>
                    <Box className='h-5 w-5 text-gray-600'/>
                    <span className="text-black font-normal">Products</span>
                </NavLink>
                <NavLink to="/orders" className={linkClasses}>
                    <ClipboardList className='h-5 w-5 text-gray-600'/>
                    <span className="text-black font-normal">Orders</span>
                </NavLink>
                <NavLink to="/suppliers" className={linkClasses}>
                    <Users className='h-5 w-5 text-gray-600'/>
                    <span className="text-black font-normal">Suppliers</span>
                </NavLink>
                <NavLink to="/purchases" className={linkClasses}>
                    <ShoppingCart className='h-5 w-5 text-gray-600'/>
                    <span className="text-black font-normal">Purchases</span>
                </NavLink>
                <NavLink to="/sales" className={linkClasses}>
                    <CircleDollarSign className='h-5 w-5 text-gray-600'/>
                    <span className="text-black font-normal">Sales</span>
                </NavLink>
                <NavLink to="/logout" className={linkClasses}>
                    <LogOut className='h-5 w-5 text-gray-600'/>
                    <span className="text-black font-normal">Logout</span>
                </NavLink>
            </div>
    </div>

  )
}

export default Sidebar