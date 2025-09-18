import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx';
import LoginForm from './components/Auth/LoginForm.jsx';
import RegisterForm from './components/Auth/RegisterForm.jsx'
import HomeLayout from './HomeLayout.jsx';
import Home from './components/Home/Home.jsx';
import MainLayout from './MainLayout.jsx'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import Products from './components/Products/Products.jsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='' element={<Layout />}>
        <Route path='login' element={<LoginForm />} />
        <Route path='register' element={<RegisterForm />} />
      </Route>
      <Route path='/' element={<HomeLayout />}>
        <Route index element={<Home />}/>
      </Route>
      <Route path='' element={<MainLayout />}>
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='products' element={<Products />} />
      </Route>
    </>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
