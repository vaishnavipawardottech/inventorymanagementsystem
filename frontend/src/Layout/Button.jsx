import React from 'react'

function Button({type='button', onClick, children, className=''}) {
  return (
    <button
        type={type}
        onClick={onClick}
        className={`bg-indigo-900 hover:bg-indigo-800 text-white font-white font-medium py-3 px-4 rounded-lg mt-2 w-full transition duration-200 ${className}`}
    >
        {children}
    </button>
  )
}

export default Button