// app/crm/page.js — temporary, just to try Link
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div>
      <p>Dashboard coming in Part 3.</p>
      <Link href="/crm/customers">Go to Customers</Link>
    </div>
  );
}
