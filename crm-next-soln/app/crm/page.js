import styles from './page.module.css';

export const metadata = {
  title: 'Dashboard · Simple CRM',
};

export default async function DashboardPage() {
  const res = await fetch(`${process.env.API_BASE_URL}/customers`);
  const customers = await res.json();

  const activeCount = customers.filter(c => c.status === 'active').length;
  const inactiveCount = customers.filter(c => c.status === 'inactive').length;

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Dashboard</h1>
      <p className={styles.subtitle}>Overview of your workspace</p>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Customers</div>
          <div className={styles.statValue}>{customers.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active</div>
          <div className={`${styles.statValue} ${styles.statSuccess}`}>{activeCount}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Inactive</div>
          <div className={`${styles.statValue} ${styles.statMuted}`}>{inactiveCount}</div>
        </div>
      </div>
    </main>
  );
}