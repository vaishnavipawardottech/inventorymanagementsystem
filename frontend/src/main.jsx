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
import Sales from './components/Sales/Sales.jsx'
import Suppliers from './components/Suppliers/Suppliers.jsx'
import SeeOrders from './components/Purchases/SeeOrders.jsx';
import CreateDraft from './components/Purchases/CreateDraft.jsx';
import Company from './components/Company/Company.jsx';
import RegisterCompany from './components/Company/RegisterCompany.jsx'
import VerifyCompany from './components/Company/verifyCompany.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='' element={<Layout />}>
        <Route path='login' element={<LoginForm />} />
        <Route path='register' element={<RegisterForm />} />
        <Route path='register-company' element={<RegisterCompany />} />
        <Route path='verify-company' element={<VerifyCompany />} />
      </Route>
      <Route path='/' element={<HomeLayout />}>
        <Route index element={<Home />}/>
      </Route>
      <Route path='' element={<MainLayout />}>
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='products' element={<Products />} />
        <Route path='sales' element={<Sales />} />
        <Route path='suppliers' element={<Suppliers />} />
        <Route path='orders' element={<SeeOrders />} />
        <Route path='drafts' element={<CreateDraft />} />
        <Route path='company' element={<Company />} />
      </Route>
    </>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
