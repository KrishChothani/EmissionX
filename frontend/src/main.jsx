import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router';
import Home from './components/Home/Home';
import Layout from './Layout';
import { RouterProvider } from 'react-router-dom';
import { StyledEngineProvider } from '@mui/material/styles';


const router = createBrowserRouter(createRoutesFromElements(
  <Route path='/' element={<Layout/>}>
    <Route path='home' element={ <Home/>} />
  </Route>
))

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <RouterProvider router={router} />
    </StyledEngineProvider>
  </StrictMode>
);