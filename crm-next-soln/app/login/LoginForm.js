'use client';

import { useActionState } from 'react';
import { login } from './actions';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const [state, formAction] = useActionState(login, null);

  return (
    <form action={formAction}>
      {state?.error && <div className={styles.error}>{state.error}</div>}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className={styles.input} required />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className={styles.input} required />
      </div>
      <button type="submit" className={styles.submit}>Sign in</button>
    </form>
  );
}