"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import styles from "./CustomerSearch.module.css";

function initials(firstName, lastName) {
  return (firstName[0] + lastName[0]).toUpperCase();
}

export default function CustomerSearch({ customers }) {
  const [query, setQuery] = useState("");

  const filtered = customers.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    return fullName.includes(query.toLowerCase());
  });

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.input}
      />
      {filtered.length === 0 ? (
        <p className={styles.empty}>No customers match your search.</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/crm/customers/${c.id}`}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {initials(c.firstName, c.lastName)}
                </div>
                <span
                  className={`${styles.badge} ${c.status === "active" ? styles.badgeActive : styles.badgeInactive}`}
                >
                  {c.status}
                </span>
              </div>
              <p className={styles.name}>
                {c.firstName} {c.lastName}
              </p>
              <div className={styles.meta}>
                <div className={styles.metaRow}>
                  <Mail size={14} />
                  {c.email}
                </div>
                {c.phone && (
                  <div className={styles.metaRow}>
                    <Phone size={14} />
                    {c.phone}
                  </div>
                )}
              </div>
              {c.tags?.length > 0 && (
                <div className={styles.tags}>
                  {c.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
