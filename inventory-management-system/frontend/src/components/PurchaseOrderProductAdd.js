//=============================================================================
//                            Purchase Order Add (Frontend)
//
//  This file is for adding items to the purchase order
//
//                              By Harry Yelland
//=============================================================================

import "./StockList.css";
import { useState, useEffect } from "react";
import Axios from "axios";

const BACKEND_ADDRESS = 'http://localhost:3001';

// Function to handle submitting item to purchase order
const submit = () => {
  // POST request to the backend to submit the item to the purchase order
  Axios.post(BACKEND_ADDRESS + "/addPurchaseOrderItem", {
    // Pass the transaction id to associate item to order
    PTID: localStorage.getItem("purchaseOrder"),
    // Pass the purchase name
    product_name: document.getElementById("product-selection").value,
    // Pass the quantity
    quantity: document.getElementById("quantity").value,
    session: window.localStorage.getItem("session")
  }).then((response) => {
    // log the response (testing purposes only)
    // console.log(response);

    // Alert the user that the purchase has been added.
    alert("Product Added to Purchase Order: ", localStorage.getItem("purchaseOrder"), ".");
    // Reload the page
    window.location.href = "/purchase-order-add";
  });
};

// Main function for adding a product to a purchase order page
function PurchaseOrderProductAdd() {
  // State variable to store the list of products
  const [productList, setProductList] = useState([]);
  const [prevProductList, setPrevProductList] = useState([-1]);
  
  // Whilst not all products loaded, keep re-rendering the page
  useEffect(() => {
    Axios.post(BACKEND_ADDRESS + "/getSalesSKUs", {
      // No post data required
    }).then((response) => {
      // if the product list has changed, update the list of products
      if (productList.toString() !== prevProductList.toString()) {
        // create a temporary arrat
        let getProductList = [];
        // push the items to the array
        for (let i = 0; i < response.data.length; i++) {
          getProductList.push(response.data[i].Product_Name);
        }
        // update the list of products
        setPrevProductList(productList);
        setProductList(getProductList);
      }
    });
    // re-render page until list of products has loaded
  }, [productList])

  // Log the list of products (testing purposes only)
  //console.log(categoryItems);
  
  return (
    <div className="stock-list">
      <h2 className="stock-list-title">Add New Product</h2>

      <form>
        <div className="form-labels">
          <label className="product-label">Product Name</label>
          <label>Quantity</label>
        </div>

        <div className="form-inputs">
          <select id="product-selection">
            {productList.map((element, index) => (
              <option key={index}>{element}</option>
            ))}{" "}
          </select>
          <input
            id="quantity"
            type="number"
            min="1"
            step="1"
            placeholder="Quantity"
          />
        </div>
      </form>

      <button className="stock-list-save-button" onClick={submit}>
        <img
          src={require("../icons/save.png")}
          className="stock-list-save-button-image"
          alt="Save New Product"
        />
      </button>
    </div>
  );
}

export default PurchaseOrderProductAdd;
