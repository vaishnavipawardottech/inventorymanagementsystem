import React from 'react'
import logo from "../assets/logo.png"
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <div>
        <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">Inventory</h1>
          {/* <img src={logo} alt="Inventory Logo" className="h-10 w-auto" /> */}
          <nav className="hidden md:flex gap-8 text-black font-semibold text-lg">
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#how" className="hover:text-indigo-600">working</a>
            <a href="#contact" className="hover:text-indigo-600">Contact</a>
          </nav>
          <div className="flex gap-3">
            <Link
                to="/login"
                className="px-4 py-2 rounded-md hover:bg-gray-100 transition"
            >
                Login
            </Link>
            <Link
                to="/register"
                className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition"
            >
                Sign Up
            </Link>
          </div>
        </div>
      </header>
    </div>
  )
}

export default Navbar