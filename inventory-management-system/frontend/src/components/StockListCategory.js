//=============================================================================
//                            Stock List Category (Frontend)
//
//  This file is for adding a new category from the stock list
//
//                              By Harry Yelland
//=============================================================================

import "./StockList.css";
import Axios from "axios";

//Backend server address
const BACKEND_ADDRESS = 'http://localhost:3001';

// function for submitting a new category
const submit = () => {
  console.log(
    "submitting category",
    document.getElementById("category-name").value,
    document.getElementById("obsolete").value
  );
  Axios.post(BACKEND_ADDRESS + "/addCategory", {
    category_name: document.getElementById("category-name").value,
    obsolete: document.getElementById("obsolete").value,
    session: window.localStorage.getItem("session")
  }).then((response) => {
    console.log(response);
  });
};

// function for handling new category page
function StockListCategory() {
  return (
    <div className="stock-list">
      <h2 className="stock-list-title">Add New Category</h2>

      <form className="stock-list-add-category">
        <div className="form-labels">
          <label>Category</label>
          <label>Obsolete?</label>
        </div>

        <div className="form-inputs">
          <input id="category-name" placeholder="Category Name" /> <br />
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

export default StockListCategory;
