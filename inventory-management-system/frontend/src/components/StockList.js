//=============================================================================
//                            StockList (Frontend)
//
//  This file is for loading all stock items and displaying them in a stocklist
//
//                              By Harry Yelland
//=============================================================================

import "./StockList.css";
import { useState, useEffect } from "react";
import Axios from "axios";

//Backend server address
const BACKEND_ADDRESS = 'http://localhost:3001';

// selected stock item variable
var selected = -1;

// function to handle selecting a stock item
const radioSelected = (event) => {
  selected = event.target.value;
  alert("You have selected SKU: " + event.target.value);
  localStorage.setItem("sku", event.target.value);
  //sessionStorage.getItem("selectedSKU");
};

// function for dynamically creating a row
var Row = (props) => {
  var { SKU, Description, Quantity, OnOrder } = props;
  var checkbox = (
    <input
      type="radio"
      name="stock-list-radio"
      value={SKU}
      onClick ={radioSelected}
    />
  );
  return (
    <tr>
      <td>{checkbox}</td>
      <td>{SKU}</td>
      <td>{Description}</td>
      <td>{Quantity}</td>
      <td>{OnOrder}</td>
    </tr>
  );
};

// function for dynamically creating table
var Table = (props) => {
  var { data } = props;
  return (
    <table>
      <tbody>
        <tr>
          <th> </th>
          <th>SKU</th>
          <th>Description</th>
          <th>In Stock</th>
          <th>On Order</th>
        </tr>
      </tbody>
      <tbody>
        {data.map((row, index) => (
          <Row
            key={`key-${index}`}
            checkbox={row.checkbox}
            SKU={row.SKU}
            Description={row.Description}
            Quantity={row.Quantity}
            OnOrder={row.OnOrder}
          />
        ))}
      </tbody>
    </table>
  );
};

// function to handle loading the stock list
function StockList() {

  // reloads until every stock item loaded
  const [stockItems, setStockItems] = useState([]);
  const [prevStockItems, setPrevStockItems] = useState([-1]);
  useEffect(() => {
    Axios.post(BACKEND_ADDRESS + "/getStockItems", {
      //SELECT Product.SKU, Product.Product_Name, Product.Stock_Qty, Purchase_Orders.Qty, Purchase_Transactions.Delivery_Date FROM Product LEFT JOIN Purchase_Orders ON Purchase_Orders.SKU = Product.SKU LEFT JOIN Purchase_Transactions ON Purchase_Transactions.PTID = Purchase_Orders.PTID WHERE Purchase_Transactions.Delivery_Date > CURRENT_DATE
      session: window.localStorage.getItem("session")
    }).then((response) => {
      if (stockItems.toString() !== prevStockItems.toString()) {
        let getStockItems = [];
        for (var i = 0; i < response.data.length; i++) {
          //console.log("Sku at pos " + i + " is " + response.data[i].SKU + "");
          if (response.data[i].Qty == null) {
            response.data[i].Qty = 0;
          }
          getStockItems.push({
            SKU: response.data[i].SKU,
            Description: response.data[i].Product_Name,
            Quantity: response.data[i].Stock_Qty,
            OnOrder: response.data[i].Qty,
          });
        }
        setPrevStockItems(stockItems);
        setStockItems(getStockItems);
      }
    });
  }, [stockItems]);


  return (
    <div className="stock-list">
      <h2 className="stock-list-title">All Products</h2>
      <Table data={prevStockItems} className="stock-list-table" />
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

export default StockList;
