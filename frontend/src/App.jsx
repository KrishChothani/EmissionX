import './App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from './components/Home/Home'
import Layout from "./Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [{ index: true, element: <Home /> }],
  },
]);

function App() {
  return <RouterProvider router={router} />
}

export default App
