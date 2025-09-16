import React from 'react'
import logo from "../assets/logo.png"
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <div>
        <header className="w-full border-b bg-white fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">Inventory</h1>
          {/* <img src={logo} alt="Inventory Logo" className="h-10 w-auto" /> */}
          <nav className="hidden md:flex gap-8 text-black font-md text-lg">
            <a href="#features" className="hover:text-purple-700">Features</a>
            <a href="#how" className="hover:text-purple-700">working</a>
            <a href="#contact" className="hover:text-purple-700">Contact</a>
          </nav>
          <div className="flex gap-3">
            <Link
                to="/login"
                className="px-4 py-2 rounded-md hover:bg-purple-200 border transition"
            >
                Login
            </Link>
            <Link
                to="/register"
                className="px-4 py-2 rounded-md bg-purple-700 hover:bg-purple-800 font-semibold text-white transition"
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