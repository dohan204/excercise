import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import MainLayout from './layout/MainLayout'
import Homepage from './layout/Homepage'
import MasterProductPage from './pages/products/MasterProductPage'
import SaleoutPage from './pages/saleouts/SaleoutPage'
import { ProductProvider } from './context/ProductContext'

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Homepage /> },
      { path: 'products', element: <MasterProductPage /> },
      { path: 'saleout', element: <SaleoutPage /> }
    ]
  }
])
function App() {
  return (
    <ProductProvider>

      <RouterProvider router={router} />
    </ProductProvider>
  )
}

export default App
