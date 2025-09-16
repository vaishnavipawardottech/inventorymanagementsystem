import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../../Layout/Button';
import { LockKeyholeOpen, Mail } from 'lucide-react';

function LoginForm() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async(e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/v1/login', {email, password}, { withCredentials: true });
      const accessToken = response.data?.data?.accessToken;
      const username = response.data?.data?.user?.username;
      const owner = response.data?.data?.user?._id;
      const useremail = response.data?.data?.user?.email;
      const role = response.data?.data?.user?.role;

      if (accessToken) {
        // localStorage.setItem('accessToken', accessToken);
        // localStorage.setItem('username', username);
        // localStorage.setItem('owner', owner);
        // localStorage.setItem('useremail', useremail);
        // localStorage.setItem('role', role);
        // console.log("Login successful");
        navigate('/dashboard');
      }
    } catch (error) {
      console.log("Error logging in: ", error);
    }
  }

  return (
    <>
      <div className='flex items-center justify-center'>
            <form onSubmit={handleLogin} className='bg-white min-w-[400px] w-full p-9 rounded-2xl shadow-xl'>
                <div className='flex flex-col items-center'>
                    <h2 className='text-3xl font-semibold text-center text-gray-700 mb-6'>Login</h2>

                    <div className='flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full'>
                        <Mail className="w-5 h-5 mr-2 text-gray-500" />
                        <input
                            className='bg-blue-100 text-gray-700 w-full outline-none'
                            type="email"
                            id='email'
                                placeholder='Enter email'
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                    </div>

                    <div className='flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full'>
                        <LockKeyholeOpen className="w-5 h-5 mr-2 text-gray-500" />
                        <input 
                            className='bg-blue-100 text-gray-700 w-full outline-none'
                            type="password" 
                            placeholder='Enter password' 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                       

                        <Button type='submit'>Login</Button>
                    
                    <p className='text-gray-600 text-sm mt-6 text-center'>Don't have an account? 
                         <a className='text-indigo-700 underline ml-2' href="/register">
                            Register
                         </a>
                    </p>
                </div>
            </form>
        </div>
    </>
  )
}

export default LoginForm