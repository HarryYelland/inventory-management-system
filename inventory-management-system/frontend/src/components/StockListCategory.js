import "./StockList.css";
import Axios from "axios";

const submit = () => {
  console.log(
    "submitting category",
    document.getElementById("category-name").value,
    document.getElementById("obsolete").value
  );
  Axios.post("http://localhost:3002/addCategory", {
    category_name: document.getElementById("category-name").value,
    obsolete: document.getElementById("obsolete").value,
  }).then((response) => {
    console.log(response);
  });
};

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
