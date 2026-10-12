"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/my-sermons", label: "My Sermons" },
  { href: "/dashboard/saved-notes", label: "Saved Notes" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has a valid access token
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("sermon_ai_access_token");
        setIsAuthenticated(!!token);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--ink-muted)" }}>Loading...</p>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push("/");
    return null;
  }

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

        {/* Logout link in sidebar */}
        <div style={{ marginTop: "auto", paddingTop: "1.5rem", borderTop: "1px solid var(--line)" }}>
          <button
            onClick={() => {
              localStorage.removeItem("sermon_ai_access_token");
              router.push("/");
            }}
            style={{
              width: "100%",
              padding: "0.65rem 1rem",
              borderRadius: "0.65rem",
              color: "#943e2c",
              background: "transparent",
              border: "1px solid #f5c6cb",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem", maxWidth: "900px" }}>{children}</main>
    </div>
  );
}
