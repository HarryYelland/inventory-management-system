import "./SalesHistory.css";
import { useState, useEffect } from "react";
import Axios from "axios";

const BACKEND_ADDRESS = 'http://localhost:3001';

function editOrder(){
    // Set the selected sales order ID in local storage
    localStorage.setItem("salesOrder", selected);
    // If no sales order is selected, alert the user and return function early
    if (selected == -1) {
        alert("Please select a sales order to view.");
        return;
    }
    // Alert the user which order they will be viewing
    alert("View Sales Order with ID: " + selected + ".");
    // Redirect to the sales order view page
    window.location.href = "/sales-order-edit";
}

// Functon to create a new sales order
function createOrder() {
  // POST request to create a new sales order
  Axios.post(BACKEND_ADDRESS + "/addSalesOrder", {
    // Sets Staff ID to 1

    // -->> CHANGE TO USERS ID WHEN AUTH TOKENS WORKING <<--
    Staff_ID: 1,


  }).then((response) => {
    // If successful, set salesOrder to the new sales order ID ready for the next page
    console.log(response);
    localStorage.setItem("salesOrder", response.data.insertId);
    // Alert the user to the creation of new sales order
    alert("Created Sales Order with ID: " + response.data.insertId + ".");
    // Redirect to the new sales order page
    window.location.href = "/sales-order-add";
  });
}


// Function to view the selected sales order
function viewOrder() {
    // Set the selected sales order ID in local storage
    localStorage.setItem("salesOrder", selected);
    // If no sales order is selected, alert the user and return function early
    if (selected == -1) {
        alert("Please select a sales order to view.");
        return;
    }
    // Alert the user which order they will be viewing
    alert("View Sales Order with ID: " + selected + ".");
    // Redirect to the sales order view page
    window.location.href = "/sales-order-view";
}


var selected = -1;

// Function to set the selected sales order ID
const radioSelected = (event) => {
  // Update the selected sales order ID
  selected = event.target.value;
  // Alert the user which order they have selected
  alert("You have selected STID: ", event.target.value.toString());
  // Set the selected sales order ID in local storage
  localStorage.setItem("salesOrder", event.target.value);
};

// Function to handle dynamic table creation
var Row = (props) => {
  // get each column of table
  var { STID, Transaction_Date, Username, Value } = props;
  // create a radio button for each row
  var checkbox = (
    <input
      type="radio"
      name="stock-list-radio"
      // set the value of the radio button to the STID of the row
      value={STID}
       // when user clicks the button, set the selected variable to the value of the button
      onClick ={radioSelected}
    />
  );

  return (
    <tr>
      <td>{checkbox}</td>
      <td>{STID}</td>
      <td>{Transaction_Date}</td>
      <td>{Username}</td>
      <td>{Value}</td>
    </tr>
  );
};

// Function for holding dynamic values within the table
var Table = (props) => {
  var { data } = props;
  return (
    <table>
      <tbody>
        <tr>
          <th> </th>
          <th>STID</th>
          <th>Transaction Date</th>
          <th>Sold By</th>
          <th>Value</th>
        </tr>
      </tbody>
      <tbody>
        {data.map((row, index) => (
          // Map each row to a Row component
          <Row
            key={`key-${index}`}
            checkbox={row.checkbox}
            STID={row.STID}
            Transaction_Date={row.Transaction_Date}
            Username={row.Username}
            Value={row.Value}
          />
        ))}
      </tbody>
    </table>
  );
};

// Main function for the Sales History page
function SalesHistory() {
  // Create state variables for the list of sales transactions
  // Two variables created so that the list can load all sales. When the full list is loaded (both vars are equivalent), the page no longer has to re-render.
  const [salesHistory, setSalesHistory] = useState([]);
  const [prevSalesHistory, setPrevSalesHistory] = useState([-1]);
  
  // Re-renders page until the list of sales has completely loaded
  useEffect(() => {
    // Post request to backend to load sales history
    Axios.post(BACKEND_ADDRESS + "/getSalesHistory", {
      // No data required
    }).then((response) => {
      // If the list of sales has changed, update the list
      if (salesHistory.toString() !== prevSalesHistory.toString()) {
        let getSalesHistory = [];
         // Loop through each sale and add it to the list
        for (var i = 0; i < response.data.length; i++) {
          //console.log("Sku at pos " + i + " is " + response.data[i].SKU + "");
          if(response.data[i].Value === null){
            response.data[i].Value = 0;
          }
          // Add each sale to the list
          getSalesHistory.push({
            STID: response.data[i].STID,
            Transaction_Date: response.data[i].Transaction_Date.substring(0,10),
            Username: response.data[i].Username,
            Value: response.data[i].Value,
          });
        }
        // Update the list of sales
        setPrevSalesHistory(salesHistory);
        setSalesHistory(getSalesHistory);
      }
    });
    // Re-render page if salesHistory changes
  }, [salesHistory]);
  
  return (
    <div className="stock-list">
      <h2 className="stock-list-title">Sales Transactions</h2>
      <Table data={prevSalesHistory} className="stock-list-table" />
      <div className="stock-list-control-buttons">
        <button className="stock-list-add-button">
          <a onClick={createOrder}>
            <img
              src={require("../icons/mathematics-sign-plus-outline-icon.png")}
              className="stock-list-add-button-image"
              alt="Add New Order"
            />
          </a>
        </button>
        <button className="stock-list-view-button">
          <a onClick={viewOrder}>
            <img
              src={require("../icons/magnifier-glass-icon.png")}
              className="stock-list-view-button-image"
              alt="View Selected Product"
            />
          </a>
        </button>
        <button className="stock-list-edit-button">
          <a onClick={editOrder}>
            <img
              src={require("../icons/pencil-icon.png")}
              className="stock-list-edit-button-image"
              alt="Edit Selected Product"
            />
          </a>
        </button>
      </div>
    </div>
  );
}

export default SalesHistory;
