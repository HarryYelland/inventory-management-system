import "./Reports.css";
import { useState, useEffect } from "react";
import Axios from "axios";
import { CSVLink } from "react-csv";

const BACKEND_ADDRESS = 'http://localhost:3001';

// Function for the Reports page
function Reports() {
  Axios.post(BACKEND_ADDRESS + "/verify-session", {
    session: window.localStorage.getItem("session"),
  }).then((response) => {
    console.log(response);
    if(response.data === false){
      window.location.href = "/";
    }
});

// State variables to hold the stock report data
const [stockReport, setStockReport] = useState([]);
const [prevStockReport, setPrevStockReport] = useState([-1]);

// Use effect to get the stock report data from the database, re-render until all data loaded (stockreport = prevstockreport)
useEffect(() => {
    // Post request to get stock report data
    Axios.post(BACKEND_ADDRESS + "/getStockItems", {
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
    Axios.post(BACKEND_ADDRESS + "/getSalesHistory", {
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
    Axios.post(BACKEND_ADDRESS + "/getSalesOrders", {
      // No post data needed as backend handles this
    }).then((response) => {
        // Check if reached end of data, add data to report
        if(salesTransactionsReport.toString() !== prevSalesTransactionsReport.toString()){
            setPrevSalesTransactionsReport(salesTransactionsReport);
            setSalesTransactionsReport(response.data);
        }
    });
}, salesTransactionsReport);

// State variables to hold the sales transactions report data
const [purchaseTransactionReport, setPurchaseTransactionReport] = useState([]);
const [prevPurchaseTransactionReport, setPrevPurchaseTransactionReport] = useState([-1]);

// Use effect to get the sales transactions report data from the database, re-render until all data loaded (salestransactionsreport = prevsalestransactionsreport)
useEffect(() => {
  // Post request to get sales transactions report data
    Axios.post(BACKEND_ADDRESS + "/getPurchaseOrders", {
      // No post data needed as backend handles this
    }).then((response) => {
        // Check if reached end of data, add data to report
        if(purchaseTransactionReport.toString() !== prevPurchaseTransactionReport.toString()){
            setPrevPurchaseTransactionReport(purchaseTransactionReport);
            setPurchaseTransactionReport(response.data);
        }
    });
}, purchaseTransactionReport);
    

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

    
      <CSVLink
        data={purchaseTransactionReport}
        filename={"purchase-transactions-report.csv"}
        className="btn btn-primary"
        target="_blank"
      >
    <div className="csvButton">
    Purchase Transactions Report
    </div>
      </CSVLink>;
      </div>
    </div>
  );
}

export default Reports;
