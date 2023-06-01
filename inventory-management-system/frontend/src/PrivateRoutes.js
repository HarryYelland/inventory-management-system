import {Outlet, useNavigate } from 'react-router-dom'
import Axios from "axios";

const PrivateRoutes = () => {
    const navigate = useNavigate();
    const verify = () => {
      Axios.post("http://localhost:3001/verify-session", {
        session: window.localStorage.getItem("session")
      }).then((response) => {
        var authorised = response.data
        if(authorised.toString() === "true"){
          Axios.post("http://localhost:3001/log-frontend", {
            frontend: authorised
          });
          return <Outlet/>;
        }else{
          navigate('/');
        }
      });
    };
    verify();   
}

export default PrivateRoutes;