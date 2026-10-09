"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/my-sermons", label: "My Sermons" },
  { href: "/dashboard/saved-notes", label: "Saved Notes" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 4rem)", background: "var(--background)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          background: "var(--paper)",
          borderRight: "1px solid var(--line)",
          padding: "2rem 1.5rem",
          flexShrink: 0,
        }}
      >
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "2rem" }}>
          Dashboard
        </h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.65rem",
                  color: isActive ? "var(--accent-dark)" : "var(--ink-muted)",
                  background: isActive ? "var(--accent-soft)" : "transparent",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  transition: "all 160ms ease",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem", maxWidth: "900px" }}>{children}</main>
    </div>
  );
}