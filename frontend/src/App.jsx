import './App.css'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'

import Home from './components/Home/Home'

function RootLayout() {
  return (
    <>
      <Outlet />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path:"home", element: <Home /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
