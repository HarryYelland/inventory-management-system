//https://stackoverflow.com/questions/50644976/react-button-onclick-redirect-page

import "./StockList.css";
import { useState, useEffect } from "react";
import Axios from "axios";

function StockListEdit() {
  const [sku, setSKU] = useState(localStorage.getItem("sku"));
  const [prevSku, setPrevSKU] = useState(-1);
  const [categoryItems, setCategoryItems] = useState([]);
  const [prevCategoryItems, setPrevCategoryItems] = useState([-1]);

  useEffect(() => {
    Axios.post("http://localhost:3002/getCategories", {
      //SELECT Product.SKU, Product.Product_Name, Product.Stock_Qty, Purchase_Orders.Qty, Purchase_Transactions.Delivery_Date FROM Product LEFT JOIN Purchase_Orders ON Purchase_Orders.SKU = Product.SKU LEFT JOIN Purchase_Transactions ON Purchase_Transactions.PTID = Purchase_Orders.PTID WHERE Purchase_Transactions.Delivery_Date > CURRENT_DATE
      dbQuery: "",
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
  //localStorage.setItem("sku", 1);

  //console.log("SKU: ", localStorage.getItem("sku"));

  //LOAD ALL PRODUCT DETAILS HERE
  useEffect(() => {
    //console.log("SKU: ", localStorage.getItem("sku"));
    Axios.post("http://localhost:3002/getProduct", {
      //SELECT Product.SKU, Product.Product_Name, Product.Stock_Qty, Purchase_Orders.Qty, Purchase_Transactions.Delivery_Date FROM Product LEFT JOIN Purchase_Orders ON Purchase_Orders.SKU = Product.SKU LEFT JOIN Purchase_Transactions ON Purchase_Transactions.PTID = Purchase_Orders.PTID WHERE Purchase_Transactions.Delivery_Date > CURRENT_DATE
      sku: sku,
    }).then((response) => {
      //console.log(response.data[0].Product_Name);
      localStorage.setItem("Product_Name", response.data[0].Product_Name);
      localStorage.setItem("Product_Category", response.data[0].Category_ID);
      localStorage.setItem("Product_ABCXYZ", response.data[0].ABCXYZ);
      localStorage.setItem("Product_Cost", response.data[0].Cost_Price);
      localStorage.setItem("Product_Retail", response.data[0].Retail_Price);
      localStorage.setItem("Product_MOQ", response.data[0].MOQ);
      localStorage.setItem("Product_Obsolete", response.data[0].isObsolete);
      if (sku !== prevSku) {
        setPrevSKU(sku);
        setSKU(localStorage.getItem("sku"));
      }
    });
    Axios.post("http://localhost:3002/getCategory", {
      //SELECT Product.SKU, Product.Product_Name, Product.Stock_Qty, Purchase_Orders.Qty, Purchase_Transactions.Delivery_Date FROM Product LEFT JOIN Purchase_Orders ON Purchase_Orders.SKU = Product.SKU LEFT JOIN Purchase_Transactions ON Purchase_Transactions.PTID = Purchase_Orders.PTID WHERE Purchase_Transactions.Delivery_Date > CURRENT_DATE
      category_id: localStorage.getItem("Product_Category"),
    }).then((response) => {
      console.log("Category_Name", response.data[0].Category_Name);
      localStorage.setItem("Category_Name", response.data[0].Category_Name);
    });
  }, [sku]);

  /* console.log(
    "Product Details",
    localStorage.getItem("Product_Name"),
    localStorage.getItem("Product_Category"),
    localStorage.getItem("Product_Cost"),
    localStorage.getItem("Product_Retail"),
    localStorage.getItem("Product_MOQ")
  ) */

  return (
    <div className="stock-list">
      <h2 className="stock-list-title">View Product</h2>

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
            readOnly
          />{" "}
          <br />
          <select
            readOnly
            id="category-selection"
            defaultValue={localStorage.getItem("Category_Name")}
          >
            {categoryItems.map((element, index) => (
              <option key={index}>{element}</option>
            ))}{" "}
          </select>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <input
            id="cost-price"
            type="number"
            min="0"
            step=".01"
            placeholder="Cost Price"
            defaultValue={localStorage.getItem("Product_Cost")}
            readOnly
          />
          <input
            id="retail-price"
            type="number"
            min="0"
            step=".01"
            placeholder="Retail Price"
            defaultValue={localStorage.getItem("Product_Retail")}
            readOnly
          />
          <input
            id="min-order-qty"
            type="number"
            min="0"
            step="1"
            placeholder="Mininimum Order Quantity"
            defaultValue={localStorage.getItem("Product_MOQ")}
            readOnly
          />{" "}
          <br />
          <br />
          <input
            id="obsolete"
            type="checkbox"
            placeholder="Obsolete?"
            readOnly
          />
        </div>
      </form>
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
  );
}

export default StockListEdit;
