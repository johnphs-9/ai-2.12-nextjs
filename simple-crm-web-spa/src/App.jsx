import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";

import WelcomePage from "./pages/WelcomePage";
import RootLayout from "./layouts/RootLayout";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import NewCustomerPage from "./pages/NewCustomerPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import EditCustomerPage from "./pages/EditCustomerPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import Spinner from "./components/Spinner";
// import ProductsPage from "./pages/ProductsPage";

// Lazy loading
const ProductsPage = lazy(() => import("./pages/ProductsPage"));

export const API_BASE = "http://localhost:3001";

function App() {
  return (
    <BrowserRouter>
      {/* Routes Definition */}
      <Routes>
        {/* user accesses "/" - root path */}
        <Route index element={<WelcomePage />} />
        {/* /login */}
        <Route path="login" element={<LoginPage />} />

        {/* Parent Route */}
        <Route element={<ProtectedRoute />}>
          <Route path="app" element={<RootLayout />}>
            {/* Child Routes/Nested Routes */}
            <Route index element={<DashboardPage />} />
            <Route
              path="products"
              // element={<ProductsPage />}
              element={
                <Suspense fallback={<Spinner />}>
                  <ProductsPage />
                </Suspense>
              }
            />
            ;
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/new" element={<NewCustomerPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="customers/:id/edit" element={<EditCustomerPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
