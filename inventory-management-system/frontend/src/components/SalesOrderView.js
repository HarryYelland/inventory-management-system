// Add Comments/Refactoring from this file and below

import "./SalesHistory.css";
import { useState, useEffect } from "react";
import Axios from "axios";


var Row = (props) => {
  var { SKU, Product_Name, Qty, Retail_Price, Discount, Value } = props;
  return (
    <tr>
      <td>{SKU}</td>
      <td>{Product_Name}</td>
      <td>{Qty}</td>
      <td>{Retail_Price}</td>
      <td>{Discount}</td>
      <td>{Value}</td>
    </tr>
  );
};

var Table = (props) => {
  var { data } = props;
  return (
    <table>
      <tbody>
        <tr>
          <th>SKU</th>
          <th>Product Name</th>
          <th>Quantity</th>
          <th>Retail Price</th>
          <th>Discount (%)</th>
          <th>Value</th>
        </tr>
      </tbody>
      <tbody>
        {data.map((row, index) => (
          <Row
            key={`key-${index}`}
            SKU={row.SKU}
            Product_Name={row.Product_Name}
            Qty={row.Qty}
            Retail_Price={row.Retail_Price}
            Discount={row.Discount}
            Value={row.Value}
          />
        ))}
      </tbody>
    </table>
  );
};

function SalesOrderView() {
  const [stockItems, setStockItems] = useState([]);
  const [prevStockItems, setPrevStockItems] = useState([-1]);
  useEffect(() => {
    Axios.post("http://localhost:3002/getSalesOrder", {
      //SELECT Product.SKU, Product.Product_Name, Product.Stock_Qty, Purchase_Orders.Qty, Purchase_Transactions.Delivery_Date FROM Product LEFT JOIN Purchase_Orders ON Purchase_Orders.SKU = Product.SKU LEFT JOIN Purchase_Transactions ON Purchase_Transactions.PTID = Purchase_Orders.PTID WHERE Purchase_Transactions.Delivery_Date > CURRENT_DATE
      STID: localStorage.getItem("salesOrder"),
    }).then((response) => {
      if (stockItems.toString() !== prevStockItems.toString()) {
        let getStockItems = [];
        for (var i = 0; i < response.data.length; i++) {
          //console.log("Sku at pos " + i + " is " + response.data[i].SKU + "");
          getStockItems.push({
            SKU: response.data[i].SKU,
            Product_Name: response.data[i].Product_Name,
            Qty: response.data[i].Qty,
            Retail_Price: response.data[i].Retail_Price,
            Discount: response.data[i].Discount,
            Value: response.data[i].Value,
          });
        }
        setPrevStockItems(stockItems);
        setStockItems(getStockItems);
      }
    });
  }, [stockItems]);
  //console.log(stockItems);
  //console.log(prevStockItems);

  //var stockItems = [
  //  { SKU: 1, Description: "Product 1", Quantity: 5, OnOrder: 15 },
  //  { SKU: 2, Description: "Product 2", Quantity: 10, OnOrder: 5 },
  //  { SKU: 3, Description: "Product 3", Quantity: 15, OnOrder: 10 },
  //];

  return (
    <div className="stock-list">
      <h2 className="stock-list-title">Sales Order: {localStorage.getItem("salesOrder")}</h2>
      <Table data={prevStockItems} className="stock-list-table" />
    </div>
  );
}

export default SalesOrderView;
