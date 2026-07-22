import { Link } from "react-router";
import styles from "./WelcomePage.module.css";

function WelcomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Simple CRM</p>
        <h1 className={styles.heading}>
          Know every customer. Close every deal.
        </h1>
        <div className={styles.imageWrap}>
          <img
            src="/hero.jpg"
            alt="A small team reviewing customer data together on a laptop"
            className={styles.image}
          />
        </div>
        <p className={styles.lead}>
          Simple CRM helps small teams track customers, log interactions,
          and never lose a lead again. No spreadsheets, no sticky notes.
        </p>
        <ul className={styles.features}>
          <li>See every customer and their history in one place</li>
          <li>Log calls, emails, and meetings as they happen</li>
          <li>Built for teams who are done using spreadsheets</li>
        </ul>

        {/* Use <a> only for external links */}
        {/* <a> forces browser reload */}
        {/* <a href="https://www.google.com.sg" target="_blank">
          Login
        </a> */}
        {/* Link controlled by React Router/JavaScript */}
        <Link to="/login" className={styles.loginBtn}>
          Sign in to get started
        </Link>
      </div>
    </div>
  );
}

export default WelcomePage;
