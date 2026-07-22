import { useState, useMemo, useCallback } from "react";
import { mockProducts } from "../../data/products.js";
import ProductSearchBar from "../components/ProductSearchBar";
import ProductList from "../components/ProductList";
import styles from "./ProductsPage.module.css";
import ExpensiveDisplayComponent from "../components/ExpensiveDisplayComponent.jsx";

function applyDiscount(product) {
  const discount = (product.id % 7) / 20; // deterministic fake discount, 0-30%
  return {
    ...product,
    discountedPrice: Number((product.price * (1 - discount)).toFixed(2)),
  };
}

function ProductsPage() {

  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  // const handleSearchChange = (value) => {
  //   setSearch(value);
  // };

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
  }, []);

  // This computation runs on every render, even when cartCount changes
  // const filteredProducts = mockProducts
  //   .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  //   .map(applyDiscount);

  const filteredProducts = useMemo(() => {
    return mockProducts
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .map(applyDiscount);
  }, [search]);


  // const search = {};
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Products</h1>
        <div className={styles.cart}>
          <p>
            Cart: <strong>{cartCount}</strong>
          </p>
          <button onClick={() => setCartCount((c) => c + 1)}>
            Add Random Item
          </button>
          <span className={styles.hint}>
            (this should not affect the product list below)
          </span>
        </div>
      </div>

      <ProductSearchBar value={search} onChange={handleSearchChange} />
      <p className={styles.count}>
        Showing <strong>{filteredProducts.length}</strong> products
      </p>
      {/* memoized component, does not re-render when parent re-renders */}
      <ExpensiveDisplayComponent />
      <ProductList products={filteredProducts} />
    </div>
  );
}

export default ProductsPage;
