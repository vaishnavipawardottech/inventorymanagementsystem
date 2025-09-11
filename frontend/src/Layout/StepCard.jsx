import React from 'react'

function StepCard({step, title, desc}) {
  return (
    <div className='p-6 bg-white rounded-xl shadow flex flex-col items-center text-center w-72 h-28'>
        <h4 className='font-semibold text-lg'>{step}. {title}</h4>
        <p className="text-sm text-gray-600 mt-2">{desc}</p>
    </div>
  )
}

export default StepCard