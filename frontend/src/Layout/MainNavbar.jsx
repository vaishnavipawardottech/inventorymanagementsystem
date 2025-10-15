import React, {useState, useRef, useEffect} from 'react'
import { CircleUserRound, LogOut } from 'lucide-react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MainNavbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const getUser = async () => {
    try {
      const res = await axios.get("/api/v1/profile", {
        withCredentials: true,
      });
      setUser(res.data.data);
    } catch (error) {
      console.log("Error while fetching the user: ", error);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, []);

  if(!user) {
    console.log("user not found");
    
  }

  const handleLogout = async () => {
    try {
      await axios.post("/api/v1/logout", {}, {withCredentials: true})
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.log("Error logging out: ", error);
      
    }
  }

  return (
    

    <header className="w-full bg-white fixed top-0 left-0 z-50 border-b border-gray-300">
      <div className="max-w-8xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left Section */}
        <h1 className="text-2xl font-bold text-black ml-6">Inventory</h1>

        {/* Right Section */}
        <div className="relative mr-7" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <CircleUserRound className="h-6 w-6 text-black" />
          </button>

          {/* Dropdown Menu */}
          {open && user && (
            <div className="absolute right-0 mt-5 w-64 bg-white shadow-lg rounded-lg border border-gray-200 animate-slideDown">
              {/* User Info */}
              <div className="p-4">
                <p className="font-semibold text-gray-800 text-lg">{user.username} <span className="font-medium text-gray-700 text-sm">({user.role})</span></p>
                <p className="text-sm mt-1 text-gray-700">{user.email}</p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Logout Button */}
              <div className='flex justify-center items-center py-2'>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true)
                    }}
                    className="px-21 py-1 border border-gray-200 text-purple-800 font-semibold hover:bg-gray-50 transition rounded-md"
                  >
                    Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
      {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Delete Supplier</h2>
            <p className="mb-6 text-gray-700">Are you sure, you want to Logout?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleLogout();
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        )}
    </header>
  )
}

export default MainNavbar