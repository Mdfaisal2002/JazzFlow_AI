import React from "react";
import HomePage from "./pages/HomePage";
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Settings from './components/Setting.jsx'

const App = () => {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <HomePage />
    },
    {
      path: '/settings',
      element: <Settings />
    }
  ])

  return (
    <>
      <RouterProvider router={router}/>
    </>
  )

}

export default App;