import StockList from "./components/StockList";
import StockListAdd from "./components/StockListAdd";
import StockListCategory from "./components/StockListCategory";
import Sidebar from "./components/Sidebar";
import StockListEdit from "./components/StockListEdit";
import StockListView from "./components/StockListView";
import SalesHistory from "./components/SalesHistory";
import PurchaseHistory from "./components/PurchaseHistory";
import PurchaseOrder from "./components/PurchaseOrder";
import PurchaseOrderProductAdd from "./components/PurchaseOrderProductAdd";
import PurchaseOrderProductEdit from "./components/PurchaseOrderProductEdit";
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
import PrivateRoutes from "./PrivateRoutes";


export default function App() {

  return (
    <div className="view">
      <Sidebar id="sidebar" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<PageNotFound/>} />
          <Route path="/stocklist" element={<StockList />} />
            <Route path="/stocklist-add" element={<StockListAdd />} />
            <Route path="/stocklist-category" element={<StockListCategory />} />
            <Route path="/stocklist-edit" element={<StockListEdit />} />
            <Route path="/stocklist-view" element={<StockListView />} />
            <Route path="/sales-history" element={<SalesHistory />} />
            <Route path="/purchase-history" element={<PurchaseHistory/>}/>
            <Route path="/purchase-order-add" element={<PurchaseOrder/>}/>
            <Route path="/purchase-order-product-add" element={<PurchaseOrderProductAdd/>}/>
            <Route path="/purchase-order-product-edit" element={<PurchaseOrderProductEdit/>}/>
            <Route path="/sales-order-add" element={<SalesOrder/>}/>
            <Route path="/sales-order-view" element={<SalesOrderView/>}/>
            <Route path="/sales-order-product-add" element={<SalesOrderProductAdd/>}/>
            <Route path="/sales-order-product-edit" element={<SalesOrderProductEdit/>}/>
            <Route path="/reports" element={<Reports/>} />
            <Route path="/settings" element={<Settings/>} />  
          <Route element={<PrivateRoutes/>}>
          </Route>          
        </Routes>
      </BrowserRouter>

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
