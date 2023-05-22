import StockList from "./components/StockList";
import StockListAdd from "./components/StockListAdd";
import StockListCategory from "./components/StockListCategory";
import Sidebar from "./components/Sidebar";
import StockListEdit from "./components/StockListEdit";
import StockListView from "./components/StockListView";
import SalesHistory from "./components/SalesHistory";
import PurchaseHistory from "./components/PurchaseHistory";
import SalesOrder from "./components/SalesOrder";
import SalesOrderView from "./components/SalesOrderView";
import SalesOrderProductAdd from "./components/SalesOrderProductAdd";
import SalesOrderProductEdit from "./components/SalesOrderProductEdit";
import Reports from "./components/Reports";
import Login from "./components/Login";
import Settings from "./components/Settings";
import PageNotFound from "./components/PageNotFound";
import "./App.css";

import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";


export default function App() {

  return (
    <div className="view">
      <Sidebar id="sidebar" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/stocklist" element={<PrivateRoute><StockList /></PrivateRoute>} />
          <Route path="/stocklist-add" element={<PrivateRoute><StockListAdd /></PrivateRoute>} />
          <Route path="/stocklist-category" element={<PrivateRoute><StockListCategory /></PrivateRoute>} />
          <Route path="/stocklist-edit" element={<PrivateRoute><StockListEdit /></PrivateRoute>} />
          <Route path="/stocklist-view" element={<PrivateRoute><StockListView /></PrivateRoute>} />
          <Route path="/sales-history" element={<PrivateRoute><SalesHistory /></PrivateRoute>} />
          <Route path="/purchase-history" element={<PrivateRoute><PurchaseHistory/></PrivateRoute>}/>
          <Route path="/sales-order-add" element={<PrivateRoute><SalesOrder/></PrivateRoute>}/>
          <Route path="/sales-order-view" element={<PrivateRoute><SalesOrderView/></PrivateRoute>}/>
          <Route path="/sales-order-product-add" element={<PrivateRoute><SalesOrderProductAdd/></PrivateRoute>}/>
          <Route path="/sales-order-product-edit" element={<PrivateRoute><SalesOrderProductEdit/></PrivateRoute>}/>
          <Route path="/reports" element={<PrivateRoute><Reports/></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings/></PrivateRoute>} />  
          <Route path="*" element={<PrivateRoute><PageNotFound/></PrivateRoute>} />
        </Routes>
      </BrowserRouter>

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
