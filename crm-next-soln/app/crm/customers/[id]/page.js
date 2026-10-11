import Link from "next/link";
import styles from "./page.module.css";

export default async function CustomerDetailPage({ params }) {
  const { id } = await params;

  // const res = await fetch(`${process.env.API_BASE_URL}/customers/${id}`);
  // const customer = await res.json();
  const [customerRes, interactionsRes] = await Promise.all([
    fetch(`${process.env.API_BASE_URL}/customers/${id}`),
    fetch(`${process.env.API_BASE_URL}/interactions?customerId=${id}`),
  ]);

  const customer = await customerRes.json();
  const interactions = await interactionsRes.json();

  return (
    <div className={styles.panel}>
      <Link href="/crm/customers" className={styles.backLink}>
        ← Back to customers
      </Link>
      <h1 className={styles.name}>
        {customer.firstName} {customer.lastName}
      </h1>
      {customer.company && <p className={styles.company}>{customer.company}</p>}

      <p className={styles.contactRow}>{customer.email}</p>
      {customer.phone && <p className={styles.contactRow}>{customer.phone}</p>}

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Status</p>
        <div className={styles.tags}>
          <span
            className={`${styles.badge} ${customer.status === "active" ? styles.badgeActive : styles.badgeInactive}`}
          >
            {customer.status}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Interactions</p>
        {interactions.length === 0 ? (
          <p>No interactions yet.</p>
        ) : (
          <ul className={styles.interactionList}>
            {interactions.map((i) => (
              <li key={i.id} className={styles.interactionCard}>
                <span>{i.type}</span>
                <span className={styles.interactionMeta}>
                  {" "}
                  · {new Date(i.date).toLocaleDateString()}
                </span>
                <p>{i.notes}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
