import "./PurchaseHistory.css";
import { useState, useEffect } from "react";
import Axios from "axios";

const BACKEND_ADDRESS = 'http://localhost:3001';

// Initialise a variable to hold the selected item from the table. Start at -1 to indicate no item selected. (Will use to error out if function called with val -1)
var selected = -1;

// Function to handle the radio button selection
const radioSelected = (event) => {
  // Set the selected variable to the value of the selected radio button
  selected = event.target.value;
  // Inform the user that they have selected an item from the table (to ensure they don't edit the wrong item)
  alert("You have selected PTID: ", event.target.value.toString());
  // Store the selected item value in local storage
  localStorage.setItem("PTID", event.target.value);
};

// Function to handle dynamic table creation
var Row = (props) => {
  // get each column of table
  var { PTID, Order_Date, Delivery_Date, Username, Value } = props;
  // create a radio button for each row
  var checkbox = (
    <input
      type="radio"
      name="stock-list-radio"
      // set the value of the radio button to the PTID of the row
      value={PTID}
      // when user clicks the button, set the selected variable to the value of the button
      onClick ={radioSelected}
    />
  );
  return (
    <tr>
      <td>{checkbox}</td>
      <td>{PTID}</td>
      <td>{Order_Date}</td>
      <td>{Delivery_Date}</td>
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
          <th>PTID</th>
          <th>Order Date</th>
          <th>Delivery Date</th>
          <th>Ordered By</th>
          <th>Value</th>
        </tr>
      </tbody>
      <tbody>
        {data.map((row, index) => (
          // Map each row to a Row component
          <Row
            key={`key-${index}`}
            checkbox={row.checkbox}
            PTID={row.PTID}
            Order_Date={row.Order_Date}
            Delivery_Date={row.Delivery_Date}
            Username={row.Username}
            Value={row.Value}
          />
        ))}
      </tbody>
    </table>
  );
};

// Main function for the Purchase History page
function PurchaseHistory() {
  // Create state variables for the list of purchases
  // Two variables created so that the list can load all purchases. When the full list is loaded (both vars are equivalent), the page no longer has to re-render.
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [prevPurchaseHistory, setPrevPurchaseHistory] = useState([-1]);

  // Re-renders page until the list of purchases has completely loaded
  useEffect(() => {
    // Post request to backend to load purchase history
    Axios.post(BACKEND_ADDRESS + "/getPurchaseHistory", {
      // No data required
    }).then((response) => {
      // If the list of purchases has changed, update the list
      if (purchaseHistory.toString() !== prevPurchaseHistory.toString()) {
        let getPurchaseList = [];
        // Loop through each purchase and add it to the list
        for (var i = 0; i < response.data.length; i++) {
          // Add each purchase to the list
          getPurchaseList.push({
            PTID: response.data[i].PTID,
            Order_Date: response.data[i].Order_Date,
            Delivery_Date: response.data[i].Delivery_Date,
            Username: response.data[i].Username,
            Value: response.data[i].Value,
          });
        }
        // Update the list of purchases
        setPrevPurchaseHistory(purchaseHistory);
        setPurchaseHistory(getPurchaseList);
      }
    });
    // Re-render page if purchaseHistory changes
  }, [purchaseHistory]);
 
  return (
    <div className="stock-list">
      <h2 className="stock-list-title">Purchase Transactions</h2>
      <Table data={prevPurchaseHistory} className="stock-list-table" />
      <div className="stock-list-control-buttons">
        <button className="stock-list-add-button">
          <a href="/stocklist-add">
            <img
              src={require("../icons/mathematics-sign-plus-outline-icon.png")}
              className="stock-list-add-button-image"
              alt="Add New Product"
            />
          </a>
        </button>
        <button className="stock-list-view-button">
          <a href="/stocklist-view">
            <img
              src={require("../icons/magnifier-glass-icon.png")}
              className="stock-list-view-button-image"
              alt="View Selected Product"
            />
          </a>
        </button>
        <button className="stock-list-edit-button">
          <a href="/stocklist-edit">
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

export default PurchaseHistory;
