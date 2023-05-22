import React from "react";
import Axios from "axios";
import "./Sidebar.css";

const BACKEND_ADDRESS = 'http://localhost:3001';

// Function to create a new sales order
function createSalesOrder() {
  // Asks user to confirm they want to start a new sales order
  if (window.confirm("Create a new Sales order?") === true) {
    // Sends a POST request to the backend to create a new sales order
    Axios.post(BACKEND_ADDRESS + "/addSalesOrder", {
        // Sets Staff ID to 1

        // -->> CHANGE TO USERS ID WHEN AUTH TOKENS WORKING <<--
        Staff_ID: 1,
        
        // If successful, the response is logged to the console and the user is alerted that the sales order has been created
        }).then((response) => {
          console.log(response);
          // The sales order ID is stored in local storage for loading in new sales order page
          localStorage.setItem("salesOrder", response.data.insertId);
          // Creates an alert to inform the userr that the sales order has been created
          alert("Created Sales Order with ID: " + response.data.insertId + ".");
          // Redirects the user to the new sales order page
          window.location.href = "/sales-order-add";
     });
  }
}

// Function to create a new purchase order
function createPurchaseOrder() {
  // Asks user to confirm they want to start a new purchase order
  if (window.confirm("Create a new Purchase order?") === true) {
    // Sends a POST request to the backend to create a new purchase order
    Axios.post(BACKEND_ADDRESS + "/addPurchaseOrder", {
      // Sets Staff ID to 1

      // -->> CHANGE TO USERS ID WHEN AUTH TOKENS WORKING <<--
      Staff_ID: 1,

      // If successful, the response is logged to the console and the user is alerted that the purchase order has been created
    }).then((response) => {
      console.log(response);
      // The purchase order ID is stored in local storage for loading in new purchase order page
      localStorage.setItem("purchaseOrder", response.data.insertId);
      // Creates an alert to inform the userr that the purchase order has been created
      alert("Created Purchase Order with ID: " + response.data.insertId + ".");
      // Redirects the user to the new purchase order page
      window.location.href = "/purchase-order-add";
    });
  }
}


// Sidebar component
function Sidebar() {
  return (
    <div className="sidebar-body">      
      <div className="menu-item-boundbox">
        <h2 className="username">Username</h2>
      </div>
      <div className="menu-item-boundbox">
        <a className="menu-item" href="/stocklist">
          Stock List
        </a>
      </div>
      <div className="menu-item-boundbox">
        <a className="menu-item" onClick={createSalesOrder}>
          New Sales Order
        </a>
      </div>
      <div className="menu-item-boundbox">
        <a className="menu-item" href="/sales-history">
          Sales History
        </a>
      </div>
      <div className="menu-item-boundbox">
        <a className="menu-item" onClick={createPurchaseOrder}>
          New Purchase Order
        </a>
      </div>
      <div className="menu-item-boundbox">
        <a className="menu-item" href="/purchase-history">
          Purchase History
        </a>
      </div>
      <div className="menu-item-boundbox">
        <a className="menu-item" href="/reports">
          Reports
        </a>
      </div>
      <div className="menu-item-boundbox">
        <a className="menu-item logout" href="/logout">
          Log Out
        </a>
      </div>
        <a href="/settings">
          <img className="settings-icon" src={require("../icons/settings-gear-icon.png")} alt="Settings" />
        </a>
    </div>
  );
}

export default Sidebar;
