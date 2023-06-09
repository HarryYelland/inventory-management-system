//=============================================================================
//                            Settings (Frontend)
//
//  This file is for changing the settings (privileges, activation) of users
//
//                              By Harry Yelland
//=============================================================================

import "./Settings.css";
import { useState, useEffect } from "react";
import Axios from "axios";

//Variable for managing the selected user
var selected = -1;

//Backend server address
const BACKEND_ADDRESS = 'http://localhost:3001';

//Function for activating a user account
function activateUser() {
  if (selected === -1){
    return null;
  }
  // Informs user of activation
  if (window.confirm("Activate User (Staff ID: " + selected + ")?") === true) {
    Axios.post(BACKEND_ADDRESS + "/setStaffActive", {
      Staff_ID: selected,
      session: window.localStorage.getItem("session"),
  }).then((response) => {
    console.log(response);
    alert("Activated User (Staff ID: " + selected + ")!");
    window.location.href = "/settings";
  });
  }
}

// Function for handling deactivating a user account
function deactivateUser() {
  if (selected === -1){
    return null;
  }
  //demotes user before deactivating
  giveSales();
  //Confirms user deactivating a user account
  if (window.confirm("deactivate User (Staff ID: " + selected + ")?") === true) {
    Axios.post(BACKEND_ADDRESS + "/setStaffDeactive", {
      session: window.localStorage.getItem("session"),
      Staff_ID: selected,
  }).then((response) => {
    console.log(response);
    alert("De-activated User (Staff ID: " + selected + ")!");
    window.location.href = "/settings";
  });
  }
}

// function for giving selected user admin privileges
function giveAdmin() {
  if (selected === -1){
    return null;
  }

  if (window.confirm("Give User (Staff ID: " + selected + ") System Admin Privileges? \nPlease note that this will give the user all permissions to purchase and edit other user's privileges.") === true) {
    Axios.post(BACKEND_ADDRESS + "/setStaffAdmin", {
      session: window.localStorage.getItem("session"),
      Staff_ID: selected,
  }).then((response) => {
    console.log(response);
    alert("Gave System Admin Privileges to User (Staff ID: " + selected + ")!");
    window.location.href = "/settings";
  });
  }
}

// function for giving selected user purchasing privileges
function givePurchasing() {
  if (selected === -1){
    return null;
  }

  if (window.confirm("Give User (Staff ID: " + selected + ") Purchasing Privileges?") === true) {
    Axios.post(BACKEND_ADDRESS + "/setStaffPurchasing", {
      session: window.localStorage.getItem("session"),
      Staff_ID: selected,
  }).then((response) => {
    console.log(response);
    alert("Gave Purchasing Privileges to User (Staff ID: " + selected + ")!");
    window.location.href = "/settings";
  });
  }
}

// function for giving selected user sales privileges
function giveSales() {
  if (selected === -1){
    return null;
  };

  if (window.confirm("Remove User (Staff ID: " + selected + ") Purchasing Privileges?") === true) {
    Axios.post(BACKEND_ADDRESS + "/setStaffSales", {
      session: window.localStorage.getItem("session"),
      Staff_ID: selected,
  }).then((response) => {
    console.log(response);
    alert("Set Sales Privileges For User (Staff ID: " + selected + ")!");
    window.location.href = "/settings";
  });
  }
}

// function for selecting a user
const radioSelected = (event) => {
  selected = event.target.value;
  localStorage.setItem("staffID", event.target.value);
  console.log(selected);
};

// function for dynamically generating table rows
var Row = (props) => {
  var { Staff_ID, Username, User_Privileges, Is_Active } = props;
  var checkbox = (
    <input
      type="radio"
      name="stock-list-radio"
      value={Staff_ID}
      onClick ={radioSelected}
    />
  );
  var privilege_level = "Sales";
  if (User_Privileges === 1) {
    privilege_level = "Purchasing";
  } else if (User_Privileges === 2) {
    privilege_level = "System Admin";
  }

  var activity = "De-Active";
  if (Is_Active === 0) {
    activity = "Active";
  }

  return (
    <tr>
      <td>{checkbox}</td>
      <td>{Staff_ID}</td>
      <td>{Username}</td>
      <td>{privilege_level}</td>
      <td>{activity}</td>
    </tr>
  );
};

// function for dynamically generating table rows
var Table = (props) => {
  var { data } = props;
  return (
    <table>
      <tbody>
        <tr>
          <th> </th>
          <th>Staff ID</th>
          <th>Username</th>
          <th>User Privilege Level</th>
          <th>Active Account?</th>
        </tr>
      </tbody>
      <tbody>
        {data.map((row, index) => (
          <Row
            key={`key-${index}`}
            checkbox={row.checkbox}
            Staff_ID={row.Staff_ID}
            Username={row.Username}
            User_Privileges={row.User_Privileges}
            Is_Active={row.Is_Active}
          />
        ))}
      </tbody>
    </table>
  );
};

// function for handling settings page
function Settings() {
  // reloads page until all staff loaded
  const [staffList, setStaffList] = useState([]);
  const [prevStaffList, setPrevStaffList] = useState([-1]);
  useEffect(() => {
    Axios.post(BACKEND_ADDRESS + "/getStaffList", {
      session: window.localStorage.getItem("session")
    }).then((response) => {
      if (staffList.toString() !== prevStaffList.toString()) {
        let getStaffList = [];
        for (var i = 0; i < response.data.length; i++) {
          getStaffList.push({
            Staff_ID: response.data[i].Staff_ID,
            Username: response.data[i].Username,
            User_Privileges: response.data[i].User_Privileges,
            Is_Active: response.data[i].Is_Active,
          });
        }
        setPrevStaffList(staffList);
        setStaffList(getStaffList);
      }
    });
  }, [staffList]);

  return (
    <div className="stock-list">
      <h2 className="stock-list-title">Settings</h2>
      <Table data={prevStaffList} className="stock-list-table" />
      <div className="stock-list-control-buttons">
        <button className="stock-list-button" onClick={giveSales}> Set Sales Privelege</button>
        <button className="stock-list-button" onClick={givePurchasing}> Set Purchasing Privilege </button>
        <button className="stock-list-button" onClick={giveAdmin}> Set System Admin Privilege </button>
      </div>
      <div className="stock-list-control-buttons">
        <button className="stock-list-button" onClick={deactivateUser}> Activate User </button>
        <button className="stock-list-button" onClick={activateUser}> De-activate User </button>
      </div>
    </div>
  );
}

export default Settings;
