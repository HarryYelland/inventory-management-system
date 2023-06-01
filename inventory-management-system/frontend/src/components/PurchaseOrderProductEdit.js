import "./StockList.css";
import { useState, useEffect } from "react";
import Axios from "axios";

const BACKEND_ADDRESS = 'http://localhost:3001';

// Function to handle submitting the product to the sales order
const submit = () => {
  // POST request to the backend to submit the item to the sales order
  Axios.post(BACKEND_ADDRESS + "/addPurchaseOrderItem", {
    // Pass the transaction id to associate item to order
    PTID: localStorage.getItem("purchaseOrder"),
    // Pass the product name
    product_name: document.getElementById("product-selection").value,
    // Pass the quantity
    quantity: document.getElementById("quantity").value,
    session: localStorage.getItem("session")
  }).then((response) => {
    // log the response (testing purposes only)
    // console.log(response);

    // Alert the user that the product has been added.
    alert("Product Added to Purchase Order: ", localStorage.getItem("purchaseOrder"), ".");
    // Reload the page
    window.location.href = "/purchase-order-add";
  });
};

// Main function for editing a product to a sales order page
function PurchaseOrderProductEdit() {
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

  // Load all product details from the database
  useEffect(() => {
    // POST request to the backend to get the product details
    Axios.post(BACKEND_ADDRESS + "/getProductsFromPOrder", {
      // Post SKU and Transaction ID so that product details can be loaded
      SKU: localStorage.getItem("sku"),
      PTID: localStorage.getItem("purchaseOrder"),
      session: localStorage.getItem("session")
    }).then((response) => {
      // Log the response (testing purposes only)
      //console.log(response.data[0].Product_Name);

      // Set Name, Qty, in localStorage ready for page to display
      localStorage.setItem("purchaseProductName", response.data[0].Product_Name);
      localStorage.setItem("purchaseProductQuantity", response.data[0].quantity);
    });
  }, []);

 

  return (
    <div className="stock-list">
      <h2 className="stock-list-title">Edit Product on Purchase Order {localStorage.getItem("purchaseOrder")}</h2>

      <form>
        <div className="form-labels">
          <label className="product-label">Product Name</label>
          <label>Quantity</label>
        </div>

        <div className="form-inputs">
          <select id="product-selection"
          defaultValue={localStorage.getItem("purchaseProductName")}>
            {productList.map((element, index) => (
              <option key={index}>{element}</option>
            ))}{" "}
          </select>
          <input
            id="quantity"
            defaultValue={localStorage.getItem("purchaseProductQuantity")}
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

export default PurchaseOrderProductEdit;
