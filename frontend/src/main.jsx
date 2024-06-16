import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Signin from './pages/Signin.jsx';
import EditProfile from './pages/EditProfile.jsx';
import MintNFT from './pages/MintNFT.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    children: [
      {
        path: "profile",
        children: [
          {
            path: "edit",
            element: <EditProfile/>
          }
        ]
      },
      {
        path: "mint-nft",
        element: <MintNFT/>
      }
    ]
  },
  {
    path: "/auth",
    children: [
      {
        path: "signin",
        element: <Signin/>,
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
