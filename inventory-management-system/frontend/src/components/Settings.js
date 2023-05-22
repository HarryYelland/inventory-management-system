import "./Settings.css";
import { useState, useEffect } from "react";
import Axios from "axios";

var selected = -1;
//console.log(selected);

const BACKEND_ADDRESS = 'http://localhost:3001';

//stockItems is a placeholder array of objects that will be replaced by a call to the database to select from products
// SELECT SKU, Product_Name, Stock_Quantity FROM Product LEFT JOIN Qty ON Purchase_Orders.SKU = Product.SKU LEFT JOIN Delivery_Date ON Purchase_Transactions.PTID = Purchase_Orders.PTID WHERE Delivery_Date > CURRENT_DATE

function activateUser() {
  if (selected === -1){
    return null;
  }

  if (window.confirm("Activate User (Staff ID: " + selected + ")?") === true) {
    Axios.post(BACKEND_ADDRESS + "/setStaffActive", {
    Staff_ID: selected,
  }).then((response) => {
    console.log(response);
    alert("Activated User (Staff ID: " + selected + ")!");
    window.location.href = "/settings";
  });
  }
}

function deactivateUser() {
  if (selected === -1){
    return null;
  }
  giveSales();

  if (window.confirm("De-activate User (Staff ID: " + selected + ")?") === true) {
    Axios.post(BACKEND_ADDRESS + "/setStaffDeactive", {
    Staff_ID: selected,
  }).then((response) => {
    console.log(response);
    alert("De-activated User (Staff ID: " + selected + ")!");
    window.location.href = "/settings";
  });
  }
}

function giveAdmin() {
  if (selected === -1){
    return null;
  }

  if (window.confirm("Give User (Staff ID: " + selected + ") System Admin Privileges? \nPlease note that this will give the user all permissions to purchase and edit other user's privileges.") === true) {
    Axios.post(BACKEND_ADDRESS + "/setStaffAdmin", {
    Staff_ID: selected,
  }).then((response) => {
    console.log(response);
    alert("Gave System Admin Privileges to User (Staff ID: " + selected + ")!");
    window.location.href = "/settings";
  });
  }
}

function givePurchasing() {
  if (selected === -1){
    return null;
  }

  if (window.confirm("Give User (Staff ID: " + selected + ") Purchasing Privileges?") === true) {
    Axios.post(BACKEND_ADDRESS + "/setStaffPurchasing", {
    Staff_ID: selected,
  }).then((response) => {
    console.log(response);
    alert("Gave Purchasing Privileges to User (Staff ID: " + selected + ")!");
    window.location.href = "/settings";
  });
  }
}

function giveSales() {
  if (selected === -1){
    return null;
  };

  if (window.confirm("Remove User (Staff ID: " + selected + ") Purchasing Privileges?") === true) {
    Axios.post(BACKEND_ADDRESS + "/setStaffSales", {
    Staff_ID: selected,
  }).then((response) => {
    console.log(response);
    alert("Set Sales Privileges For User (Staff ID: " + selected + ")!");
    window.location.href = "/settings";
  });
  }
}


const radioSelected = (event) => {
  selected = event.target.value;
  localStorage.setItem("staffID", event.target.value);
  console.log(selected);
};

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

  var activity = "Active";
  if (Is_Active === 0) {
    activity = "De-activated";
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

function Settings() {
  const [staffList, setStaffList] = useState([]);
  const [prevStaffList, setPrevStaffList] = useState([-1]);
  useEffect(() => {
    Axios.post(BACKEND_ADDRESS + "/getStaffList", {
            dbQuery: "",
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
        <button className="stock-list-button" onClick={activateUser}> Activate User </button>
        <button className="stock-list-button" onClick={deactivateUser}> De-activate User </button>
      </div>
    </div>
  );
}

export default Settings;
