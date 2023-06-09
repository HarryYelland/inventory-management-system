//=============================================================================
//                            Stock List Edit (Frontend)
//
//  This file is for editing item details from the stock list
//
//                              By Harry Yelland
//=============================================================================
//                                References				
//
//https://stackoverflow.com/questions/50644976/react-button-onclick-redirect-page
//				
//=============================================================================
import "./StockList.css";
import { useState, useEffect } from "react";
import Axios from "axios";

//Backend server address
const BACKEND_ADDRESS = 'http://localhost:3001';

// Function for handling editing a product within the stock list
const submit = () => {
  console.log(localStorage.getItem("sku"));
  Axios.post(BACKEND_ADDRESS + "/editProduct", {
    sku: localStorage.getItem("sku"),
    product_name: document.getElementById("product-name").value,
    category: document.getElementById("category-selection").value,
    cost_price: document.getElementById("cost-price").value,
    retail_price: document.getElementById("retail-price").value,
    moq: document.getElementById("min-order-qty").value,
    obsolete: document.getElementById("obsolete").value,
    session: window.localStorage.getItem("session")
  }).then((response) => {
    alert("Updated product");
    window.location.href = "/stocklist"
  });
};

//Function for loading in the stock editing page
function StockListEdit() {
  // Reloads until all categories have been loaded
  const [categoryItems, setCategoryItems] = useState([]);
  const [prevCategoryItems, setPrevCategoryItems] = useState([-1]);
  useEffect(() => {
    Axios.post(BACKEND_ADDRESS + "/getCategories", {
      session: window.localStorage.getItem("session")
    }).then((response) => {
      if (categoryItems.toString() !== prevCategoryItems.toString()) {
        let getCategoryItems = [];
        for (let i = 0; i < response.data.length; i++) {
          getCategoryItems.push(response.data[i].Category_Name);
        }
        setPrevCategoryItems(categoryItems);
        setCategoryItems(getCategoryItems);
      }
    });
  }, [categoryItems]);

  console.log("SKU: ", localStorage.getItem("sku"));

  //LOADS ALL PRODUCT DETAILS HERE
  useEffect(() => {
    Axios.post(BACKEND_ADDRESS + "/getProduct", {
      sku: localStorage.getItem("sku"),
      session: window.localStorage.getItem("session")
    }).then((response) => {
      //console.log(response.data[0].Product_Name);
      localStorage.setItem("Product_Name", response.data[0].Product_Name);
      localStorage.setItem("Product_Category", response.data[0].Category_ID);
      localStorage.setItem("Product_ABCXYZ", response.data[0].ABCXYZ);
      localStorage.setItem("Product_Cost", response.data[0].Cost_Price);
      localStorage.setItem("Product_Retail", response.data[0].Retail_Price);
      localStorage.setItem("Product_MOQ", response.data[0].MOQ);
      localStorage.setItem("Product_Obsolete", response.data[0].isObsolete);
    });
    Axios.post("http://localhost:3001/getCategory", {
      category_id: localStorage.getItem("Product_Category"),
    }).then((response) => {
      console.log("Category_Name", response.data[0].Category_Name);
      localStorage.setItem("Category_Name", response.data[0].Category_Name);
    });
  }, []);

  return (
    <div className="stock-list">
      <h2 className="stock-list-title">Edit Product</h2>

      <form>
        <div className="form-labels">
          <label>Product Name</label>
          <label className="category-label">Category</label>
          <label>Cost Price</label>
          <label>Retail Price</label>
          <label>Mininimum Order Quantity</label>
          <label>Obsolete?</label>
        </div>

        <div className="form-inputs">
          <input
            id="product-name"
            placeholder="Product Name"
            defaultValue={localStorage.getItem("Product_Name")}
          />{" "}
          <br />
          <select
            id="category-selection"
            defaultValue={localStorage.getItem("Category_Name")}
          >
            {categoryItems.map((element, index) => (
              <option key={index}>{element}</option>
            ))}{" "}
          </select>
          <br />
          <p className="category-creator">or</p>
          <button className="new-category">Create a New Category</button>
          <br/><br/><br/><br/>
          <input
            id="cost-price"
            type="number"
            min="0"
            step=".01"
            placeholder="Cost Price"
            defaultValue={localStorage.getItem("Product_Cost")}
          />
          <input
            id="retail-price"
            type="number"
            min="0"
            step=".01"
            placeholder="Retail Price"
            defaultValue={localStorage.getItem("Product_Retail")}
          />
          <input
            id="min-order-qty"
            type="number"
            min="0"
            step="1"
            placeholder="Mininimum Order Quantity"
            defaultValue={localStorage.getItem("Product_MOQ")}
          />{" "}
          <br />
          <br />
          <input id="obsolete" type="checkbox" placeholder="Obsolete?" />
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

export default StockListEdit;
