import "./Reports.css";
import { useState, useEffect } from "react";
import Axios from "axios";
import { CSVLink } from "react-csv";


// Function for the Reports page
function Reports() {

// State variables to hold the stock report data
const [stockReport, setStockReport] = useState([]);
const [prevStockReport, setPrevStockReport] = useState([-1]);

// Use effect to get the stock report data from the database, re-render until all data loaded (stockreport = prevstockreport)
useEffect(() => {
    // Post request to get stock report data
    Axios.post("http://localhost:3002/getStockItems", {
      // No post data needed as backend handles this
    }).then((response) => {
      // Check if reached end of data, add data to report
        if(stockReport.toString() !== prevStockReport.toString()){
            setPrevStockReport(stockReport);
            setStockReport(response.data);
        }
    });
    }, stockReport);

// State variables to hold the sales report data
const [salesReport, setSalesReport] = useState([]);
const [prevSalesReport, setPrevSalesReport] = useState([-1]);
// Use effect to get the sales report data from the database, re-render until all data loaded (salesreport = prevsalesreport)
useEffect(() => {
  // Post request to get sales report data
    Axios.post("http://localhost:3002/getSalesHistory", {
      // No post data needed as backend handles this
    }).then((response) => {
      // Check if reached end of data, add data to report
        if(salesReport.toString() !== prevSalesReport.toString()){
            setPrevSalesReport(salesReport);
            setSalesReport(response.data);
        }
    });
}, salesReport);


// State variables to hold the sales transactions report data
const [salesTransactionsReport, setSalesTransactionsReport] = useState([]);
const [prevSalesTransactionsReport, setPrevSalesTransactionsReport] = useState([-1]);

// Use effect to get the sales transactions report data from the database, re-render until all data loaded (salestransactionsreport = prevsalestransactionsreport)
useEffect(() => {
  // Post request to get sales transactions report data
    Axios.post("http://localhost:3002/getSalesOrders", {
      // No post data needed as backend handles this
    }).then((response) => {
        // Check if reached end of data, add data to report
        if(salesTransactionsReport.toString() !== prevSalesTransactionsReport.toString()){
            setPrevSalesTransactionsReport(salesTransactionsReport);
            setSalesTransactionsReport(response.data);
        }
    });
}, salesTransactionsReport);

    

  return (
    <div className="stock-list">
      <h2 className="stock-list-title">Reports</h2>
      <div className="stock-list-control-buttons">

      <CSVLink
        data={stockReport}
        filename={"stock-report.csv"}
        className="btn btn-primary"
        target="_blank"
      >
      <div className="csvButton">
            Stock Report
      </div>
      </CSVLink>;

      <CSVLink
        data={salesReport}
        filename={"sales-report.csv"}
        className="btn btn-primary"
        target="_blank"
      >
    <div className="csvButton">
    Sales Report
    </div>
      </CSVLink>;

      <CSVLink
        data={salesTransactionsReport}
        filename={"sales-transactions-report.csv"}
        className="btn btn-primary"
        target="_blank"
      >
    <div className="csvButton">
    Sales Transactions Report
    </div>
      </CSVLink>;

    
        <button className="stock-list-control-button">Purchase Report</button>
      </div>
    </div>
  );
}

export default Reports;
