//=============================================================================
//                            Sales Order (Frontend)
//
//  This file is the loading of sales order (consists of all products within
//  a sales transaction)
//
//                              By Harry Yelland
//=============================================================================


import "./SalesHistory.css";
import { useState, useEffect } from "react";
import Axios from "axios";

// Initiliase selected variable to hold 
var selected = -1;

// Function to handle radio button selection
const radioSelected = (event) => {
  // Set selected variable to the value of the selected radio button
  selected = event.target.value;
  // Display an alert box with the value of the selected radio button to the user
  alert("You have selected Product : ", event.target.value.toString());
  // Store the sku of the selected radio button in local storage
  localStorage.setItem("sku", event.target.value);
};

// Function to handle delete button click
const deleteSelected = (event) => {
  // Set delSelected variable to the value of the selected radio button
  var delSelected = event.target.value;

  // Log the value of the selected radio button to the console (TESTING PURPOSES)
  //console.log(delSelected);

  // Ask user to confirm that they would like to delete the sales record
  if (window.confirm("Are you sure you want to delete this record?") === true) {
    // Post the sales order id to backend for deletion
    Axios.post("http://localhost:3001/delSalesOrder", {
      // Pass the SOID
      SOID: delSelected,
      session: window.localStorage.getItem("session")
    }).then((response) => {
      // if successful, alert user that product has been deleted
      alert("You have deleted Product : ", event.target.value.toString());
    });
  } else {
    // if not, alert user that product has not been deleted
    alert("Record not deleted!");
  }
  // reload the page once deleted / not deleted (no longer needs to be selected)
  window.location.reload();
};

// Function to handle sku editing button click
const skuSelected = (event) => {
  // set tjhe skuSelected variable to the sku of the selected radio button
  var skuSelected = event.target.value;

  // Log the value of the selected radio button to the console (TESTING PURPOSES)
  //console.log(skuSelected);

  // Ask user to confirm that they would like to edit the sku
  if (window.confirm("Are you sure you want to edit this sku?") === true) {
    // Set the sku in localstorage ready to use on sku editing page
    localStorage.setItem("sku", skuSelected);
    // Redirect user to the sku editing page
    window.location.href = "/stocklist-edit"; 
  }
};

// Function to handle dynamic table creation
var Row = (props) => {
  // get each column of table
  var { SOID, SKU, Product_Name, Qty, Retail_Price, Discount, Value } = props;
  // create a radio button for each row
  var checkbox = (
    <input
      type="radio"
      name="stock-list-radio"
      // set the value of the radio button to the SKU of the row
      value={SKU}
      // when user clicks the button, set the selected variable to the value of the button
      onClick={radioSelected}
    />
  );
  // create a delete button for each row
  var deleteBtn = (
    <button
      className="stock-list-delete-button"
      // set the value of the sales order to the button
      value={SOID}
      // when user clicks the button, calls function to set the selected variable to the value of the button
      onClick={deleteSelected}
    >Delete
    </button>
  );

  // create a sku-editing button for each row
  var skuBtn = (
    <button
      className="stock-list-sku-button"
      // set the value of the sku to the button
      value={SKU}
      // when the user cloicks the button, calls function to edit the selected sku
      onClick={skuSelected}
    >{SKU}
    </button>
  );
  return (
    <tr>
      <td>{checkbox}</td>
      <td>{skuBtn}</td>
      <td>{Product_Name}</td>
      <td>{Qty}</td>
      <td>{Retail_Price}</td>
      <td>{Discount}</td>
      <td>{Value}</td>
      <td>{deleteBtn}</td>
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
          <th>SKU</th>
          <th>Product Name</th>
          <th>Quantity</th>
          <th>Retail Price</th>
          <th>Discount (%)</th>
          <th>Value</th>
          <th>Delete</th>
        </tr>
      </tbody>
      <tbody>
        {data.map((row, index) => (
          // Map each row to a Row component
          <Row
            key={`key-${index}`}
            checkbox={row.checkbox}
            SKU={row.SKU}
            Product_Name={row.Product_Name}
            Qty={row.Qty}
            Retail_Price={row.Retail_Price}
            Discount={row.Discount}
            Value={row.Value}
            Delete={row.deleteBtn}
            SOID={row.SOID}
          />
        ))}
      </tbody>
    </table>
  );
};

// Main function for the sales order page
function SalesOrder() {
  // Create state variables for the list of sales lines
  // Two variables created so that the list can load all sales within a transaction. When the full list is loaded (both vars are equivalent), the page no longer has to re-render.
  const [salesOrderLines, setSalesOrderLines] = useState([]);
  const [prevSalesOrderLines, setPrevSalesOrderLines] = useState([-1]);

  // Re-renders page until the list of sales has completely loaded
  useEffect(() => {
    // Post request to get the sales order lines from backend
    Axios.post("http://localhost:3001/getSalesOrder", {
      // Pass the Sales Transaction ID
      STID: localStorage.getItem("salesOrder"),
      session: window.localStorage.getItem("session")
    }).then((response) => {
      // if successful, log to console (TESTING PURPOSES)
      //console.log(response.data);
      
      // If the list of sales has changed, update the list
      if (salesOrderLines.toString() !== prevSalesOrderLines.toString()) {
        // Create an array to hold the sales lines
        let getSalesOrderLines = [];
        // For each sales line, add it to the array
        for (var i = 0; i < response.data.length; i++) {
          getSalesOrderLines.push({
            SKU: response.data[i].SKU,
            Product_Name: response.data[i].Product_Name,
            Qty: response.data[i].Qty,
            Retail_Price: response.data[i].Retail_Price,
            Discount: response.data[i].Discount,
            Value: response.data[i].Value,
            SOID: response.data[i].SOID,
          });
        }
        // Update the list of sales lines
        setPrevSalesOrderLines(salesOrderLines);
        setSalesOrderLines(getSalesOrderLines);
      }
    });
    // Re-render page if 
  }, [salesOrderLines]);

  return (
    <div className="stock-list">
      <h2 className="stock-list-title">
        Sales Order: {localStorage.getItem("salesOrder")}
      </h2>
      <Table data={prevSalesOrderLines} className="stock-list-table" />
      <div className="stock-list-control-buttons">
        <button className="stock-list-add-button">
          <a href="/sales-order-product-add">
            <img
              src={require("../icons/mathematics-sign-plus-outline-icon.png")}
              className="stock-list-add-button-image"
              alt="Add New Product"
            />
          </a>
        </button>
        <button className="stock-list-edit-button">
          <a href="/sales-order-product-edit">
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

export default SalesOrder;
