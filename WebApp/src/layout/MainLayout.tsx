import React from 'react'
import { NavLink, Outlet } from 'react-router-dom';

const navigate = [
  { name: "Trang chủ", path: "/" },
  { name: "Sản phẩm", path: '/products' },
  { name: "Hóa đơn", path: '/saleout' }
]
const MainLayout = () => {
  return (
    <div className='flex flex-col   '>
        <nav className="bg-pink-300">
          <ul className="flex justify-center items-center gap-2 px-6 py-3">
            {navigate.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `rounded-md transition-all ${isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-200 hover:bg-slate-700"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className='flex-1 p-20'>
            <Outlet />
        </main>
    </div>
  )
}

export default MainLayout