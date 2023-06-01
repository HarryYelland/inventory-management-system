import React from "react";
import "./PageNotFound.css";
import Axios from "axios";


const BACKEND_ADDRESS = 'http://localhost:3001';

// Function to create a new sales order
function createSalesOrder() {
  // Asks user to confirm they want to start a new sales order
  if (window.confirm("Create a new Sales order?") === true) {
    // Sends a POST request to the backend to create a new sales order
    Axios.post(BACKEND_ADDRESS + "/addSalesOrder", {
        session: window.localStorage.getItem("session")
        
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
      session: window.localStorage.getItem("session")

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

function LogOut(){
  if (window.confirm("Do you want to log out?") === true) {
    Axios.post(BACKEND_ADDRESS + "/logOut", {
      session : localStorage.getItem("session")
    }).then((response) => {
      localStorage.setItem("session", "");
      localStorage.setItem("username", "");
      window.location.href = "/";
    });
  }
}


// Function to display page when page/address is not found
function PageNotFound() {
  return (
    <div className="menu-box">
      <h1>Page Not Found</h1>
      <p className="page-not-found-items">Apologies but the page you are looking for is unavailable. Please try one of the below links to get started:</p><br/>
      <a href="/stocklist" className="page-not-found-items">View Stock List</a><br/><br/>
      <a className="page-not-found-items" onClick={createSalesOrder}>Create a New Sales Order</a><br/><br/>
      <a href="sales-history" className="page-not-found-items">View Sales History</a><br/><br/>
      <a className="page-not-found-items" onClick={createPurchaseOrder}>Create a New Purchase Order</a><br/><br/>
      <a href="purchase-history" className="page-not-found-items">View Purchase History</a><br/>
    </div>
  );
}

export default PageNotFound;
