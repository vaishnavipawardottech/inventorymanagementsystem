import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../../Layout/Button';
import { User, Mail, LockKeyholeOpen } from 'lucide-react';

function RegisterForm() {

    const [formData, setFormData] = useState({username:'', email:'', password:'', role:''});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev, [e.target.name]: e.target.value
        }))
    }
    const handleRegister = async(e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await axios.post('/api/v1/register', formData);
            console.log('Registration successful: ', res.data);
            setSuccess('User Registered successfully');
            navigate('/login');
            setFormData({username:'', email:'', password:'', role:''});

        } catch (error) {
            console.log('Registration failed: ', error);
            const errormsg = error.response?.data?.message || 'Registration failed';
            setError(errormsg);
        }
    }

    
  return (
    <div className='flex items-center justify-center'>
        <form className='bg-white min-w-[400px] w-full p-9 rounded-2xl shadow-xl' onSubmit={handleRegister}>
            <div className='flex flex-col items-center w-full'>
                <h2 className='text-3xl font-semibold text-center text-gray-700 mb-6'>Register</h2> 
                <div className='flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full'>
                    <User className="w-5 h-5 mr-2 text-gray-500" />
                    <input
                        className='bg-blue-100 text-gray-700 w-full outline-none'
                        type="text"
                        name="username" 
                        placeholder='Username' 
                        value={formData.username} 
                        onChange={handleChange} 
                        required
                    />
                </div>

                <div className='flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full'>
                    <Mail className="w-5 h-5 mr-2 text-gray-500" />
                    <input
                        className='bg-blue-100 text-gray-700 w-full outline-none'
                        type="email"
                        name="email"
                        placeholder='Email' 
                        value={formData.email} 
                        onChange={handleChange} 
                        required
                    />
                </div>

                <div className='flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full'>
                    <LockKeyholeOpen className="w-5 h-5 mr-2 text-gray-500" />
                    <input
                        className='bg-blue-100 text-gray-700 w-full outline-none' 
                        type="password" 
                        name="password" 
                        placeholder='Password' 
                        value={formData.password} 
                        onChange={handleChange} 
                        required
                    />
                </div>

                <div className='flex items-center bg-blue-100 text-gray-700 mb-4 p-3 rounded-lg w-full'>
                    <select name="role" id="role" value={formData.role} onChange={handleChange} required className='bg-blue-100 text-gray-700 w-full outline-none'>
                        <option value="" disabled>Select Role</option>
                        <option value="admin">admin</option>
                        <option value="user">staff</option>
                    </select>
                </div>
                
                <Button type='submit' className='w-full py-3 text-lg font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200'>Register</Button>
                <p className='text-gray-600 text-sm mt-6 text-center'>Already register? 
                    <a className='text-indigo-700 underline ml-2' href="/login">
                        Login
                    </a>
                </p>
            </div>
            
        </form>
    </div>
  )
}

export default RegisterForm