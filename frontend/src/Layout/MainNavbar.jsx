import React from 'react'
import { CircleUserRound } from 'lucide-react'

function MainNavbar() {
  return (
    <div>
        <header className="w-full bg-white fixed top-0 left-0 z-50 border-b border-gray-300">
        <div className="max-w-8xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black ml-6">Inventory</h1>
          {/* <nav className="hidden md:flex gap-8 text-black font-semibold text-lg">
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#how" className="hover:text-indigo-600">working</a>
            <a href="#contact" className="hover:text-indigo-600">Contact</a>
          </nav> */}
            <CircleUserRound className="h-6 w-6 text-black mr-7" />
        </div>
      </header>
    </div>
  )
}

export default MainNavbar