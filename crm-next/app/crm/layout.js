// app/crm/layout.js
import styles from './layout.module.css';

export default function CrmLayout({ children }) {
  return (
    <div className={styles.shell}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
