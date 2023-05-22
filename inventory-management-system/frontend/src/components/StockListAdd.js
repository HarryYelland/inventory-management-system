//https://stackoverflow.com/questions/50644976/react-button-onclick-redirect-page
import "./StockList.css";
import { useState, useEffect } from "react";
import Axios from "axios";


const BACKEND_ADDRESS = 'http://localhost:3001';

const submit = () => {
  Axios.post("http://localhost:3002/addProducts", {
    product_name: document.getElementById("product-name").value,
    category: document.getElementById("category-selection").value,
    cost_price: document.getElementById("cost-price").value,
    retail_price: document.getElementById("retail-price").value,
    moq: document.getElementById("min-order-qty").value,
    obsolete: document.getElementById("obsolete").value,
  }).then((response) => {
    console.log(response);
  });
};

function StockListAdd() {
  const [categoryItems, setCategoryItems] = useState([]);
  const [prevCategoryItems, setPrevCategoryItems] = useState([-1]);
  useEffect(() => {
    Axios.post(BACKEND_ADDRESS + "/getCategories", {
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

  console.log(categoryItems);
  return (
    <div className="stock-list">
      <h2 className="stock-list-title">Add New Product</h2>

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
          <input id="product-name" placeholder="Product Name" /> <br />
          <select id="category-selection">
            {categoryItems.map((element, index) => (
              <option key={index}>{element}</option>
            ))}{" "}
          </select>
          <br/>
          <p className="category-creator">or</p>
          <button className="new-category">Create a New Category</button>
          <br/><br/><br/><br/>
          <input
            id="cost-price"
            type="number"
            min="0"
            step=".01"
            placeholder="Cost Price"
          />
          <input
            id="retail-price"
            type="number"
            min="0"
            step=".01"
            placeholder="Retail Price"
          />
          <input
            id="min-order-qty"
            type="number"
            min="0"
            step="1"
            placeholder="Mininimum Order Quantity"
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

export default StockListAdd;
