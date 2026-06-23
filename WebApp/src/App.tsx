import { useState } from 'react'
import './App.css'
import MasterProductPage from './pages/products/MasterProductPage'

function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <MasterProductPage />
    </>
  )
}

export default App
