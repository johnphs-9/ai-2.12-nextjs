import Link from "next/link";
import CustomerSearch from "./CustomerSearch";
import styles from "./page.module.css";

export const metadata = {
  title: "Customers · Simple CRM",
};

export default async function CustomersPage() {
  // fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const res = await fetch(`${process.env.API_BASE_URL}/customers`);
  const customers = await res.json();

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Customers</h1>
      </div>
      <CustomerSearch customers={customers} />
    </div>
  );
}
