import React from 'react'
import { Mail, Phone } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-row justify-center gap-24">
          <div>
            <h4 className="font-semibold text-white text-2xl">InventoPro</h4>
            <p className="mt-2 text-sm">Smart Inventory for Smart Businesses</p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-lg">Quick Links</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li><a href="#features" className="hover:underline">Features</a></li>
              <li><a href="#how" className="hover:underline">How It Works</a></li>
              <li><a href="#contact" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white text-lg">Contact</h4>
            <div className='flex flex-row items-center gap-2 mt-2'>
                <Mail className="w-4 h-4 text-white inline-block mr-2" />
                <p className='text-sm'>pawarvaishnavi.3010@gmail.com</p>
            </div>
            <div className='flex flex-row items-center gap-2 mt-2'>
                <Phone className="w-4 h-4 text-white inline-block mr-2" />
                <p className='text-sm'>+91 9511613033</p>
            </div>
          </div>
        </div>
        {/* <div className="mt-10 text-center text-sm text-gray-500">
          © 2025 Inventory. All rights reserved.
        </div> */}
      </footer>
  )
}

export default Footer