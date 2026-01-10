import React from 'react'
import { Outlet} from "react-router-dom";
import ButtonAppBar from './components/appbar/appbar';
import SignUpForm from './components/forms/signup';

function Layout() {
  return (
    <>
      <ButtonAppBar/>
      <Outlet />
      <SignUpForm/>
        <h2>footer</h2>
    </>
  )
}

export default Layout