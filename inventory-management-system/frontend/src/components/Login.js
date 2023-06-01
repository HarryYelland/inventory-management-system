//=============================================================================
//                            Login (Frontend)
//
//  This file is for registration/login of accounts to the system
//
//                              By Harry Yelland
//=============================================================================


import React, { useState } from "react";
import Axios from 'axios';

const BACKEND_ADDRESS = 'http://localhost:3001';

// Function for managing login and registration
export default function Login() {


  // State variables for registration and login
  const [usernameReg, setUsernameReg] = useState('');
  const [passwordReg, setPasswordReg] = useState('');
  const [usernameLog, setUsernameLog] = useState('');
  const [passwordLog, setPasswordLog] = useState('');

  // State variable for login status
  const [loginStatus, setLoginStatus] = useState('');


  // Function for registering a new user
  const register = ()=> {
    // POST request to backend to register new user
    Axios.post(BACKEND_ADDRESS + '/register', {
      // Sets username and password to the values entered by the user
      username: usernameReg,
      password: passwordReg
    }).then((response) =>{
      // If successful, then set the login status to the user id (for testing purposes)
      if(response){
        console.log(response.data);
        window.localStorage.setItem("session", response.data);
        window.alert("Registered Account");
        window.location.href("/stocklist");
      }
    })
  }

  // Function for logging in a user
  const login = ()=> {
    // POST request to backend to login user
    Axios.post(BACKEND_ADDRESS + '/login', {
      // Sets username and password to the values entered by the user
      username: usernameLog,
      password: passwordLog
    }).then((response) =>{
      // If successful, then set the login status to the user id (for testing purposes)
      // If unsuccessful, log the reason to the console
      if(response.data.message){
        setLoginStatus(response.data.message);
      } else {
        localStorage.setItem('user', usernameLog);
        window.localStorage.setItem("username", usernameLog);
        if(response.data !== "Error"){
          localStorage.setItem('session', response.data);
          alert("Logged In")
          window.location.href = "/stocklist"
        } else {
          alert("Error Logging In");
        }
        
      }
    })
  }

  return(
    <div className="Login">
      <div id="LoginAuto">
        If you are not automatically redirected, your user details are incorrect, please try again.
      </div>
      <div className="loginMessage">
        <div className="LoginStatus">
          {loginStatus}
        </div>
      </div>
      
      <div className="RegistrationSec">
        <h1>Registration</h1>
        <label>Username</label>
        <input type="text" placeholder="Username" onChange={(e)=> {setUsernameReg(e.target.value);}}/>
        <label>Password</label>
        <input type="password" placeholder="Password" onChange={(e)=> {setPasswordReg(e.target.value);}}/>
        <br/>
        <br/>
        <button onClick={register}>Register</button>
      </div>
      <div className="LoginSec">
        <h1>Login</h1>
        <label>Username</label>
        <input type="text" placeholder="Username" onChange={(e)=> {setUsernameLog(e.target.value);}}/>
        <label>Password</label>
        <input type="password" placeholder="Password" onChange={(e)=> {setPasswordLog(e.target.value);}}/>
        <br/>
        <br/>
        <button onClick={login}>Login</button>
      </div>
    </div>
  )
}