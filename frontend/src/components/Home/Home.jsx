import React from 'react'
import { Package, BarChart, Users, ShoppingCart, Cloud, MapPin, Mail, Phone } from "lucide-react";
import ims from "../../assets/ims.jpg"
import FeatureCard from '../../Layout/FeatureCard';
import StepCard from '../../Layout/StepCard';
import { Link } from 'react-router-dom';

function Home() {
  const features = [
    { icon: Package, title: "Product Management", desc: "Add, update, and track products with real-time stock." },
    { icon: ShoppingCart, title: "Sales & Purchases", desc: "Record and monitor transactions with suppliers & customers." },
    { icon: BarChart, title: "Reports & Analytics", desc: "Generate sales reports, stock alerts, and analytics." },
    { icon: Users, title: "Multi-user Access", desc: "Collaborate securely with team members." },
    { icon: Cloud, title: "Cloud Based", desc: "Access your inventory anywhere, anytime." }
  ];

  const steps = [
    { step: 1, title: "Add Products", desc: "Quickly add and categorize items." },
    { step: 2, title: "Record Sales", desc: "Manage purchases and sales easily." },
    { step: 3, title: "View Reports", desc: "Get instant insights and alerts." }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 mt-20">
        {/* Hero */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Manage Your Inventory <span className="text-indigo-600">Effortlessly</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Track products, manage stock, and grow your business with ease.  
                Stay on top of your sales and purchases.
              </p>
              <div className="mt-6 flex gap-4">
                <Link
                  to="/register"
                className="px-5 py-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition">
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                  Login
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={ims}
                alt="Inventory Dashboard"
                className="rounded-2xl shadow-lg w-96 h-60 object-cover"
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold text-gray-900">Features</h3>
            <p className="mt-2 text-gray-600">Everything you need to manage your inventory</p>
            <div className="mt-12 flex flex-wrap ml-30 gap-8">
              {
                features.map((f, i) => (
                  <FeatureCard key={i} {...f}/>
                ))
              }
            </div>
          </div>
        </section>

        {/* Working */}
        <section id="how" className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold text-gray-900">How It Works</h3>
            <div className="mt-12 flex flex-wrap justify-center gap-8">
              {steps.map((s, i) => (
                <StepCard key={i} {...s} />
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-row items-center justify-center gap-18">
            
            {/* Contact Info with Lucide Icons */}
            <div className=" flex flex-col space-y-8 gap-2">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-indigo-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">Office Address</h4>
                  <p className="text-sm text-gray-600">123 Business Street, Pune, India</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-indigo-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">Email Us</h4>
                  <p className="text-sm text-gray-600">pawarvaishnavi.3010@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-indigo-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">Call Us</h4>
                  <p className="text-sm text-gray-600">+91 9511613033</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white text-gray-900 rounded-xl shadow-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold mb-6 text-indigo-600">Get in Touch</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    rows="4"
                    placeholder="Write your message..."
                    className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home