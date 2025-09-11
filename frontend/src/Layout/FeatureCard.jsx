import React from 'react'

function FeatureCard({icon: Icon, title, desc}) {
  return (
    <div className='p-6 border rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center w-80 h-44'>
        <Icon className="w-10 h-10 text-indigo-600" />
        <h4 className="mt-4 font-semibold">{title}</h4>
        <p className="text-sm text-gray-600 mt-2">{desc}</p>
    </div>
  )
}

export default FeatureCard